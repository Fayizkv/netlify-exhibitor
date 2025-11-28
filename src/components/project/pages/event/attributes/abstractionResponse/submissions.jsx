import React, { useMemo, useState, useEffect } from "react";
import { RowContainer } from "../../../../../styles/containers/styles";
import { ButtonPanel, Filter } from "../../../../../core/list/styles";
import Search from "../../../../../core/search";
import ListTable from "../../../../../core/list/list";
import { GetIcon } from "../../../../../../icons";
import { Button as FormButton } from "../../../../../core/elements";
import AutoForm from "../../../../../core/autoform/AutoForm";
import Message from "../../../../../core/message";
// Local light dropdown for filters to avoid overlay issues
import { useToast } from "../../../../../core/toast";
import moment from "moment";
import { putData, getData } from "../../../../../../backend/api";
import { Button } from "../../../../../core/elements";
import { PageHeader } from "../../../../../core/input/heading";
import MultiSelect from "../../../../../core/multiSelect";
import { Select, TextArea, Checkbox } from "../../../../../core/elements";

// Submissions & Reviewer Management - Submissions Tab
// This page renders a submissions table with filters and actions, following the EventHex design system.
const SubmissionsPage = (props) => {

  // Get event ID from props - ListTable passes it via openData or referenceId
  const eventId = props?.referenceId || props?.params?.event || props?.openData?.data?._id || props?.parents?.event || props?.parentData?._id;
  // Search state for title/author filter box
  const [search, setSearch] = useState("");
  // Selected top-level filters (status/category) - stored as objects with id and value
  const [activeTab, setActiveTab] = useState("submissions");

  // Modal state for forms
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isReviewerModalOpen, setIsReviewerModalOpen] = useState(false);
  const [isAssignReviewersModalOpen, setIsAssignReviewersModalOpen] = useState(false);
  const [isViewSubmissionModalOpen, setIsViewSubmissionModalOpen] = useState(false);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedSubmissionForAssignment, setSelectedSubmissionForAssignment] = useState(null);
  const [selectedSubmissionForView, setSelectedSubmissionForView] = useState(null);
  const [selectedSubmissionForDecision, setSelectedSubmissionForDecision] = useState(null);
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // State to trigger ListTable refresh
  const [refreshKey, setRefreshKey] = useState(0);

  // State for decision modal form fields
  const [decision, setDecision] = useState("");
  const [comments, setComments] = useState("");
  const [sendNotification, setSendNotification] = useState(false);
  const [averageScore, setAverageScore] = useState({ score: 0, completedReviews: 0 });
  // Decision actor (Reviewer)
  const [decisionReviewerId, setDecisionReviewerId] = useState("");
  const [decisionReviewerOptions, setDecisionReviewerOptions] = useState([]);

  // State for assign reviewers modal
  const [assignedReviewers, setAssignedReviewers] = useState([]);
  const [selectedReviewersForMultiSelect, setSelectedReviewersForMultiSelect] = useState([]);

  // Message component state
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState({});

  // State for event reviewers count (total reviewers available for the event)
  const [eventReviewersCount, setEventReviewersCount] = useState(3); // Default to 3

  const toast = useToast();

  // Form attributes for submission add/edit
  const submissionFormAttributes = [
    {
      type: "title",
      title: "Submission Information",
      name: "submissionInfo",
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Enter submission title",
      name: "title",
      label: "Title",
      required: true,
      view: true,
      add: true,
      update: true,
      icon: "document",
      validation: "required|min:10",
      customClass: "full",
    },
    {
      type: "textarea",
      placeholder: "Enter authors (comma-separated)",
      name: "authors",
      label: "Authors",
      required: true,
      view: true,
      add: true,
      update: true,
      rows: 3,
      footnote: "Separate multiple authors with commas",
      customClass: "full",
    },
    {
      type: "select",
      apiType: "CSV",
      selectApi: "Research Paper,Poster,Workshop",
      placeholder: "Select category",
      name: "category",
      label: "Category",
      required: true,
      view: true,
      add: true,
      update: true,
      icon: "folder",
      customClass: "half",
    },
    {
      type: "select",
      apiType: "CSV",
      selectApi: "Pending Review,Under Review,Reviewed,Accepted,Rejected,Score Conflict",
      placeholder: "Select status",
      name: "status",
      label: "Status",
      required: true,
      view: true,
      add: true,
      update: true,
      icon: "status",
      customClass: "half",
    },
    {
      type: "textarea",
      placeholder: "Enter tags (comma-separated)",
      name: "tags",
      label: "Tags",
      required: false,
      view: true,
      add: true,
      update: true,
      rows: 2,
      footnote: "Separate tags with commas",
      customClass: "full",
    },
    {
      type: "number",
      placeholder: "Enter number of reviewers",
      name: "totalReviewers",
      label: "Total Reviewers Required",
      required: true,
      view: true,
      add: true,
      update: true,
      min: 1,
      max: 10,
      default: 3,
      customClass: "half",
    },
  ];

  // Form attributes for reviewer add/edit
  const reviewerFormAttributes = [
    {
      type: "title",
      title: "Reviewer Information",
      name: "reviewerInfo",
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Enter reviewer name",
      name: "name",
      label: "Name",
      required: true,
      view: true,
      add: true,
      update: true,
      icon: "user",
      validation: "required|min:3",
      customClass: "full",
    },
    {
      type: "text",
      placeholder: "Enter email address",
      name: "email",
      label: "Email",
      required: true,
      view: true,
      add: true,
      update: true,
      icon: "mail",
      validation: "required|email",
      customClass: "full",
    },
    {
      type: "textarea",
      placeholder: "Enter expertise tags (comma-separated)",
      name: "tags",
      label: "Expertise Areas",
      required: false,
      view: true,
      add: true,
      update: true,
      rows: 3,
      footnote: "Separate expertise areas with commas (e.g., AI, Machine Learning, Data Science)",
      customClass: "full",
    },
    {
      type: "toggle",
      name: "isActive",
      label: "Active Status",
      required: false,
      view: true,
      add: true,
      update: true,
      default: true,
      footnote: "Toggle to activate or deactivate reviewer",
      customClass: "full",
    },
  ];

  // Note: ListTable handles data fetching, filtering, and pagination automatically via API
  // Custom render functions in attributes handle the UI display

  // Export click handler
  const handleExport = () => {
    toast.success("Export started. You'll receive a download shortly.");
  };

  // Handle submission form submission
  const handleSubmissionSubmit = async (data) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await postData(data, 'submissions');
      // or const response = await putData({ id: selectedSubmission.id, ...data }, 'submissions');
      toast.success(selectedSubmission ? "Submission updated successfully" : "Submission created successfully");
      setIsSubmissionModalOpen(false);
      setSelectedSubmission(null);
      // Refresh submissions list
      setRefreshKey((prev) => prev + 1);
      return true;
    } catch (error) {
      toast.error("Failed to save submission");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reviewer form submission
  const handleReviewerSubmit = async (data) => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await postData(data, 'reviewers');
      // or const response = await putData({ id: selectedReviewer.id, ...data }, 'reviewers');
      toast.success(selectedReviewer ? "Reviewer updated successfully" : "Reviewer created successfully");
      setIsReviewerModalOpen(false);
      setSelectedReviewer(null);
      // Refresh reviewers list
      setRefreshKey((prev) => prev + 1);
      return true;
    } catch (error) {
      toast.error("Failed to save reviewer");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle add submission
  const handleAddSubmission = () => {
    setSelectedSubmission(null);
    setIsSubmissionModalOpen(true);
  };

  // Handle view submission
  const handleViewSubmission = (item) => {
    setSelectedSubmissionForView(item);
    setIsViewSubmissionModalOpen(true);
  };

  // Handle assign reviewers
  const handleAssignReviewers = async (item) => {
    try {
      if (!item) {
        toast.error("Invalid submission data");
        return;
      }

      setSelectedSubmissionForAssignment(item);
      // Initialize state first
      setAssignedReviewers([]);
      setSelectedReviewersForMultiSelect([]);

      // Open modal first (so it appears immediately)
      setIsAssignReviewersModalOpen(true);

      // Resolve assigned reviewers - they might be IDs that need to be fetched
      let currentReviewers = [];
      if (Array.isArray(item.reviewers) && item.reviewers.length > 0) {
        // Check if reviewers are IDs (strings) or objects
        const firstReviewer = item.reviewers[0];
        if (typeof firstReviewer === "string" || (typeof firstReviewer === "object" && !firstReviewer.name)) {
          // Need to fetch full reviewer data
          try {
            const reviewerIds = item.reviewers.map((r) => (typeof r === "string" ? r : r._id || r.id)).filter(Boolean);
            if (reviewerIds.length > 0 && eventId) {
              const fullReviewersResponse = await getData({ event: eventId }, "reviewer");
              if (fullReviewersResponse && fullReviewersResponse.status === 200 && fullReviewersResponse.data?.success) {
                const allReviewers = Array.isArray(fullReviewersResponse.data.response) ? fullReviewersResponse.data.response : [];
                const reviewerIdSet = new Set(reviewerIds.map((id) => id.toString()));
                currentReviewers = allReviewers.filter((r) => {
                  const rId = r._id || r.id;
                  return rId && reviewerIdSet.has(rId.toString());
                });
              }
            }
          } catch (err) {
            console.error("Error resolving assigned reviewers:", err);
            // Fallback to using IDs directly
            currentReviewers = item.reviewers;
          }
        } else {
          // Already objects with data
          currentReviewers = item.reviewers.filter(Boolean);
        }
      }
      setAssignedReviewers(currentReviewers);
      // Set multiSelect values
      setSelectedReviewersForMultiSelect(
        currentReviewers.map((r) => ({
          id: r._id || r.id || r,
          value: r.name || r.value || r,
        }))
      );
    } catch (error) {
      console.error("Error opening assign reviewers modal:", error);
      toast.error("Failed to open assign reviewers modal");
      // Close modal on error
      setIsAssignReviewersModalOpen(false);
      setSelectedSubmissionForAssignment(null);
    }
  };

  // Handle multiSelect change for reviewers
  const handleReviewersMultiSelectChange = (selectedValues, fieldName, fieldType) => {
    const values = selectedValues || [];
    setSelectedReviewersForMultiSelect(values);
    // Convert multiSelect values to reviewer objects for display in Currently Assigned
    if (Array.isArray(values) && values.length > 0) {
      // Fetch full reviewer data for selected IDs
      const reviewerIds = values.map((v) => (typeof v === "object" && v !== null ? v.id || v._id || v.value : v)).filter(Boolean);
      if (reviewerIds.length > 0 && eventId) {
        // Fetch full reviewer data
        getData({ event: eventId }, "reviewer")
          .then((response) => {
            if (response && response.status === 200 && response.data?.success) {
              const allReviewers = Array.isArray(response.data.response) ? response.data.response : [];
              const selectedReviewerObjects = allReviewers.filter((r) => {
                const rId = r._id || r.id;
                return rId && reviewerIds.some((id) => id.toString() === rId.toString());
              });
              setAssignedReviewers(selectedReviewerObjects);
            }
          })
          .catch((err) => {
            console.error("Error fetching reviewer details:", err);
            // Fallback to basic objects
            setAssignedReviewers(
              values.map((v) => ({
                _id: typeof v === "object" ? v.id || v._id : v,
                id: typeof v === "object" ? v.id || v._id : v,
                name: typeof v === "object" ? v.value || v.name : v,
                value: typeof v === "object" ? v.value || v.name : v,
              }))
            );
          });
      } else {
        // Fallback to basic objects
        setAssignedReviewers(
          values.map((v) => ({
            _id: typeof v === "object" ? v.id || v._id : v,
            id: typeof v === "object" ? v.id || v._id : v,
            name: typeof v === "object" ? v.value || v.name : v,
            value: typeof v === "object" ? v.value || v.name : v,
          }))
        );
      }
    } else {
      setAssignedReviewers([]);
    }
  };

  // Handle remove reviewer
  const handleRemoveReviewer = (reviewerId) => {
    const updatedReviewers = assignedReviewers.filter((r) => (r._id || r.id) !== reviewerId);
    setAssignedReviewers(updatedReviewers);
    // Update multiSelect state
    setSelectedReviewersForMultiSelect(
      updatedReviewers.map((r) => ({
        id: r._id || r.id,
        value: r.name || r.value || "Unknown",
      }))
    );
  };

  // Get reviewer initials
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 3);
  };

  // Handle approve submission - opens decision modal
  const handleApproveSubmission = async (item) => {
    try {
      setSelectedSubmissionForDecision(item);
      // Reset form fields
      setDecision("");
      setComments("");
      setSendNotification(false);
      setAverageScore({ score: 0, completedReviews: 0 });
      setDecisionReviewerId("");
      setDecisionReviewerOptions([]);

      // Open modal first
      setIsDecisionModalOpen(true);

      // Prefill from existing decision if available
      try {
        // Decision data is stored in formData.decision
        const existingDecision = item?.formData?.decision || item?.decision;
        if (existingDecision) {
          const d = existingDecision;
          if (d.status) setDecision(d.status);
          if (typeof d.comments === "string") setComments(d.comments);
          if (typeof d.notified === "boolean") setSendNotification(!!d.notified);
          if (d.by) setDecisionReviewerId(d.by);
        }
      } catch (e) {
        console.error("Error pre-filling decision:", e);
      }

      // Prepare reviewer options (assigned reviewers only)
      try {
        let currentReviewers = [];
        if (Array.isArray(item.reviewers) && item.reviewers.length > 0) {
          const firstReviewer = item.reviewers[0];
          if (typeof firstReviewer === "string" || (typeof firstReviewer === "object" && !firstReviewer.name)) {
            const reviewerIds = item.reviewers.map((r) => (typeof r === "string" ? r : r._id || r.id)).filter(Boolean);
            if (reviewerIds.length > 0 && eventId) {
              const fullReviewersResponse = await getData({ event: eventId }, "reviewer");
              if (fullReviewersResponse && fullReviewersResponse.status === 200 && fullReviewersResponse.data?.success) {
                const allReviewers = Array.isArray(fullReviewersResponse.data.response) ? fullReviewersResponse.data.response : [];
                const reviewerIdSet = new Set(reviewerIds.map((id) => id.toString()));
                currentReviewers = allReviewers.filter((r) => {
                  const rId = r._id || r.id;
                  return rId && reviewerIdSet.has(rId.toString());
                });
              }
            }
          } else {
            currentReviewers = item.reviewers.filter(Boolean);
          }
        }
        const opts = (currentReviewers || []).map((r) => ({ id: r._id || r.id, value: r.name || r.value }));
        setDecisionReviewerOptions(opts);
        if (!decisionReviewerId && opts.length === 1) setDecisionReviewerId(opts[0].id);
      } catch (e) {
        console.error("Error preparing decision reviewers:", e);
      }

      // Fetch average score and completed reviews count
      try {
        const submissionId = item._id || item.id;
        const response = await getData({}, `ticket-registration/average-score/${submissionId}`);
        if (response && response.status === 200 && response.data?.success) {
          setAverageScore({
            score: response.data.response.averageScore || 0,
            completedReviews: response.data.response.completedReviews || 0
          });
        } else {
          // Set default values if API call doesn't return expected data
          setAverageScore({ score: 0, completedReviews: 0 });
        }
      } catch (error) {
        console.error("Error fetching average score:", error);
        // Set default values on error
        setAverageScore({ score: 0, completedReviews: 0 });
      }
    } catch (error) {
      console.error("Error opening decision modal:", error);
      toast.error("Failed to open decision modal");
      setIsDecisionModalOpen(false);
      setSelectedSubmissionForDecision(null);
    }
  };

  // Handle submit decision
  const handleSubmitDecision = async () => {
    if (!decision) {
      toast.error("Please select a decision");
      return;
    }
    // Reviewer selection is optional and hidden in UI

    try {
      setIsLoading(true);
      const response = await putData(
        {
          id: selectedSubmissionForDecision._id || selectedSubmissionForDecision.id,
          decision: decision,
          comments: comments,
          sendNotification: sendNotification,
          reviewerId: decisionReviewerId || undefined,
        },
        "ticket-registration/decision"
      );

      if (response && response.status === 200) {
        toast.success("Decision submitted successfully!");
        setIsDecisionModalOpen(false);
        setSelectedSubmissionForDecision(null);
        setDecision("");
        setComments("");
        setSendNotification(false);
        setDecisionReviewerId("");
        setDecisionReviewerOptions([]);
        // Refresh the submissions list by changing the key
        setRefreshKey((prev) => prev + 1);
      } else {
        throw new Error(response?.message || "Failed to submit decision");
      }
    } catch (error) {
      console.error("Error submitting decision:", error);
      toast.error(error?.message || "Failed to submit decision. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reject submission
  const handleRejectSubmission = (item) => {
    const itemName = item.title || "submission";
    setMessage({
      type: 2,
      content: `Do you want to reject '${itemName}'? This action cannot be undone.`,
      proceed: "Reject",
      okay: "Cancel",
      onProceed: async () => {
        try {
          // TODO: Replace with actual API call
          // await postData({ id: item.id, status: "Rejected" }, 'submissions/reject');
          toast.success("Submission rejected");
          // Refresh the submissions list
          setRefreshKey((prev) => prev + 1);
          return true;
        } catch (error) {
          toast.error("Failed to reject submission");
          return false;
        }
      },
      data: item,
    });
    setShowMessage(true);
  };

  // Handle add reviewer
  const handleAddReviewer = () => {
    setSelectedReviewer(null);
    setIsReviewerModalOpen(true);
  };

  // Handle delete reviewer
  const handleDeleteReviewer = (reviewerData) => {
    const reviewerName = reviewerData.name || "reviewer";
    setMessage({
      type: 2,
      content: `Do you want to remove '${reviewerName}'? This action cannot be undone.`,
      proceed: "Remove",
      okay: "Cancel",
      onProceed: async () => {
        try {
          // TODO: Replace with actual API call
          // await postData({ id: reviewerData.id }, 'reviewers/delete');
          toast.success("Reviewer removed successfully");
          // Refresh reviewers list
          setRefreshKey((prev) => prev + 1);
          return true;
        } catch (error) {
          toast.error("Failed to remove reviewer");
          return false;
        }
      },
      data: reviewerData,
    });
    setShowMessage(true);
  };

  // Close message handler
  const closeMessage = () => {
    setShowMessage(false);
    setMessage({});
  };

  // Fetch event reviewers count when eventId is available
  useEffect(() => {
    const fetchEventReviewersCount = async () => {
      if (!eventId) return;

      try {
        const response = await getData({ event: eventId }, "reviewer");
        if (response && response.status === 200 && response.data?.success) {
          const reviewersData = Array.isArray(response.data.response) ? response.data.response : [];
          setEventReviewersCount(reviewersData.length || 3);
        }
      } catch (error) {
        console.error("Error fetching event reviewers count:", error);
        // Keep default value of 3 on error
      }
    };

    fetchEventReviewersCount();
  }, [eventId, refreshKey]);

  // ListTable attributes for reviewers tab - card format
  const reviewersListAttributes = useMemo(
    () => [
      {
        type: "element",
        name: "reviewerCard",
        label: "",
        view: true,
        tag: true,
        add: false,
        update: false,
        customClass: "full",
        render: (value, data) => {
          const reviewerId = data._id || data.id;
          const reviewerName = data.name || data.value || "Unknown";
          const reviewerEmail = data.email || "";
          const isActive = data.isActive !== false;
          const initials = getInitials(reviewerName);
          
          // Parse tags - can be comma-separated string or array
          let tagsArray = [];
          if (Array.isArray(data.tags)) {
            tagsArray = data.tags;
          } else if (typeof data.tags === "string" && data.tags.trim()) {
            tagsArray = data.tags.split(",").map((t) => t.trim()).filter(Boolean);
          }

          // Metrics from API response
          const assigned = data.assigned || 0;
          const completed = data.completed || 0;
          const pending = data.pending || 0;
          const avgResponse = data.avgResponse || data.averageResponseTime || "N/A";
          const completionRate = assigned > 0 ? (completed / assigned) * 100 : 0;

          return (
            <div className="bg-bg-white border border-stroke-soft rounded-lg p-4 w-full">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-bg-weak flex items-center justify-center text-[12px] font-semibold text-text-main">{initials}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-text-main">{reviewerName}</div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${isActive ? "bg-bg-weak text-text-main" : "bg-state-error text-white"}`}>
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="text-[12px] text-text-sub">{reviewerEmail || "No email"}</div>
                  {tagsArray.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {tagsArray.map((tag, idx) => (
                        <span key={idx} className="text-[11px] px-2 py-1 rounded-full border border-stroke-soft text-text-sub">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Metrics row */}
                  <div className="grid grid-cols-5 gap-4 mt-4 items-center">
                    <div className="text-[12px]">
                      <div className="text-text-sub">Assigned</div>
                      <div className="text-text-main mt-1">{assigned}</div>
                    </div>
                    <div className="text-[12px]">
                      <div className="text-text-sub">Completed</div>
                      <div className="text-state-success mt-1">{completed}</div>
                    </div>
                    <div className="text-[12px]">
                      <div className="text-text-sub">Pending</div>
                      <div className="text-state-warning mt-1">{pending}</div>
                    </div>
                    <div className="text-[12px]">
                      <div className="text-text-sub">Avg Response</div>
                      <div className="text-text-main mt-1">{avgResponse}</div>
                    </div>
                    <div className="text-[12px]">
                      <div className="text-text-sub mb-1">Completion Rate</div>
                      <div className="h-1.5 bg-bg-weak rounded-full w-full">
                        <div className="h-1.5 bg-primary-base rounded-full" style={{ width: `${completionRate}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <button 
                      className="text-[12px] w-full text-center bg-bg-weak hover:bg-bg-soft rounded-md py-2"
                      onClick={() => {
                        // TODO: Navigate to assigned submissions view
                        toast.info("View assigned submissions feature coming soon");
                      }}
                    >
                      View Assigned Submissions
                    </button>
                    <div className="ml-3">
                      <FormButton 
                        value="Send Reminder" 
                        type="primary" 
                        ClickEvent={() => {
                          // TODO: Implement send reminder API call
                          toast.success(`Reminder sent to ${reviewerName}`);
                        }} 
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Filter
                    className="plain"
                    title="Email"
                    onClick={() => {
                      if (reviewerEmail) {
                        window.location.href = `mailto:${reviewerEmail}`;
                      } else {
                        toast.error("No email address available");
                      }
                    }}
                  >
                    <GetIcon icon="mail" />
                  </Filter>
                  <Filter
                    className="plain error"
                    title="Remove"
                    onClick={() => {
                      handleDeleteReviewer({
                        id: reviewerId,
                        name: reviewerName,
                        email: reviewerEmail,
                        tags: tagsArray,
                        status: isActive ? "Active" : "Inactive",
                      });
                    }}
                  >
                    <GetIcon icon="delete" />
                  </Filter>
                </div>
              </div>
            </div>
          );
        },
      },
    ],
    []
  );

  // ListTable attributes with custom render functions - styled like 3rd image format
  const submissionsListAttributes = useMemo(
    () => [
      {
        type: "text",
        name: "fullName",
        label: "NAME & CONTACT",
        view: true,
        tag: true,
        add: false,
        update: false,
        customClass: "full",
        sort: true,
        render: (value, data) => {
          return (
            <div className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" aria-label="select submission" />
              <div className="flex-1">
                <div className="text-[14px] font-semibold text-text-main">{data.fullName || value || "—"}</div>
                <div className="text-[12px] text-text-sub">{data.emailId || "—"}</div>
                {data.authenticationId && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[11px] px-2 py-1 rounded-full border border-stroke-soft text-text-sub">{data.authenticationId}</span>
                    {data.formattedTicketNumber && <span className="text-[11px] px-2 py-1 rounded-full border border-stroke-soft text-text-sub">Ticket: {data.formattedTicketNumber}</span>}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        type: "datetime",
        name: "createdAt",
        label: "REGISTERED ON",
        view: true,
        add: false,
        update: false,
        tag: true,
        customClass: "half",
        render: (value, data) => {
          const dateValue = data.createdAt || value;
          const formatted = dateValue ? moment(dateValue).format("MMM DD, YYYY") : "—";
          const timeFormatted = dateValue ? moment(dateValue).format("hh:mm A") : "";
          return (
            <div className="flex flex-col text-[12px] text-text-sub">
              <span className="text-[11px]">{formatted}</span>
              {timeFormatted && <span className="text-[11px]">{timeFormatted}</span>}
            </div>
          );
        },
        sort: true,
      },
      {
        type: "text",
        name: "reviewers",
        label: "REVIEWERS",
        view: true,
        add: false,
        update: false,
        tag: true,
        customClass: "half",
        render: (value, data) => {
          const reviewersArray = data?.reviewers;
          const assigned = Array.isArray(reviewersArray) ? reviewersArray.length : reviewersArray ? 1 : 0;
          // Use event reviewers count as total (dynamic)
          const total = eventReviewersCount;
          const percentage = total > 0 ? (assigned / total) * 100 : 0;

          // When no reviewers assigned, show "Not assigned" format
          if (assigned === 0) {
            return (
              <div className="flex items-center gap-2">
                <GetIcon icon="users" />
                <div className="flex flex-col text-[12px] text-text-sub">
                  <span>Not</span>
                  <span>assigned</span>
                </div>
              </div>
            );
          }

          // When reviewers are assigned, show the normal format with progress bar (left-aligned)
          return (
            <div className="flex flex-col justify-center">
              {/* Title - REVIEWERS */}
              <div className="text-[12px] font-medium text-text-sub mb-2">REVIEWERS</div>
              {/* Icon and Count */}
              <div className="flex items-center gap-2 text-[12px] text-text-sub mb-2">
                <GetIcon icon="users" />
                <span>
                  {assigned}/{total}
                </span>
              </div>
              {/* Progress Bar */}
              <div className="h-1.5 bg-bg-weak rounded-full w-24">
                <div className="h-1.5 bg-primary-base rounded-full transition-all" style={{ width: `${percentage}%` }} />
              </div>
            </div>
          );
        },
      },
      {
        type: "text",
        name: "actions",
        label: "ACTIONS",
        view: true,
        tag: true,
        add: false,
        update: false,
        customClass: "quarter",
        render: (value, data) => {
          return (
            <div className="flex items-center gap-2">
              <Filter className="plain" title="View" onClick={() => handleViewSubmission(data)}>
                <GetIcon icon="eye" />
              </Filter>
              <Filter className="plain" title="Assign" onClick={() => handleAssignReviewers(data)}>
                <GetIcon icon="registrations" />
              </Filter>
              <Filter className="plain" title="Approve" onClick={() => handleApproveSubmission(data)}>
                <GetIcon icon="tick" />
              </Filter>
              <Filter className="plain error" title="Reject" onClick={() => handleRejectSubmission(data)}>
                <GetIcon icon="delete" />
              </Filter>
            </div>
          );
        },
      },
    ],
    [eventReviewersCount]
  );

  return (
    <RowContainer className="data-layout">
      {/* Header title and export */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-[16px] font-semibold font-inter text-text-main">Submissions & Reviewer Management</h4>
          <p className="text-text-sub text-[14px] font-inter">Research Papers 2025</p>
        </div>
        <FormButton value="Export Report" icon={<GetIcon icon="download" />} type="primary" ClickEvent={handleExport} />
      </div>

      {/* Tabs: Submissions / Reviewers */}
      <div className="flex items-center gap-6 border-b border-stroke-soft">
        <button
          onClick={() => setActiveTab("submissions")}
          className={`py-3 text-sm ${activeTab === "submissions" ? "font-medium text-primary-base border-b-2 border-primary-base" : "text-text-sub"}`}
        >
          Submissions
        </button>
        <button onClick={() => setActiveTab("reviewers")} className={`py-3 text-sm ${activeTab === "reviewers" ? "font-medium text-primary-base border-b-2 border-primary-base" : "text-text-sub"}`}>
          Reviewers
        </button>
      </div>

      {activeTab === "submissions" && !eventId && (
        <div className="bg-bg-white rounded-xl border border-stroke-soft p-8 text-center">
          <p className="text-text-sub">Loading event data...</p>
        </div>
      )}

      {activeTab === "submissions" && eventId && (
        <ListTable
          key={`submissions-list-${refreshKey}`}
          api="ticket-registration"
          shortName="Submission"
          attributes={submissionsListAttributes}
          itemTitle={{ name: "fullName", type: "text", collection: "" }}
          formMode="single"
          addPrivilege={false}
          updatePrivilege={false}
          delPrivilege={true}
          showDeleteInDotMenu={false}
          showTitle={false}
          openPage={false}
          viewMode="table"
          preFilter={{ event: eventId, type: "Abstraction" }}
          parents={{ event: eventId }}
          parentReference="event"
          referenceId={eventId}
          setMessage={
            props?.setMessage ||
            ((msg) => {
              setMessage(msg);
              setShowMessage(true);
            })
          }
          setLoaderBox={props?.setLoaderBox || setIsLoading}
          {...props}
          isCreatingHandler={handleAddSubmission}
        />
      )}

      {activeTab === "reviewers" && !eventId && (
        <div className="bg-bg-white rounded-xl border border-stroke-soft p-8 text-center">
          <p className="text-text-sub">Loading event data...</p>
        </div>
      )}

      {activeTab === "reviewers" && eventId && (
        <ListTable
          key={`reviewers-list-${refreshKey}`}
          api="reviewer"
          shortName="Reviewer"
          attributes={reviewersListAttributes}
          itemTitle={{ name: "name", type: "text", collection: "" }}
          formMode="single"
          addPrivilege={true}
          updatePrivilege={true}
          delPrivilege={true}
          showDeleteInDotMenu={true}
          showTitle={false}
          openPage={false}
          viewMode="table"
          preFilter={{ event: eventId }}
          parents={{ event: eventId }}
          parentReference="event"
          referenceId={eventId}
          setMessage={
            props?.setMessage ||
            ((msg) => {
              setMessage(msg);
              setShowMessage(true);
            })
          }
          setLoaderBox={props?.setLoaderBox || setIsLoading}
          {...props}
          isCreatingHandler={handleAddReviewer}
        />
      )}

      {/* Submission Form Modal */}
      {isSubmissionModalOpen && (
        <AutoForm
          header={selectedSubmission ? "Edit Submission" : "Add Submission"}
          api="submissions"
          formType={selectedSubmission ? "put" : "post"}
          formInput={submissionFormAttributes}
          formValues={selectedSubmission || {}}
          isOpenHandler={() => {
            setIsSubmissionModalOpen(false);
            setSelectedSubmission(null);
          }}
          addPrivilege={true}
          updatePrivilege={true}
          deletePrivilege={true}
          isCreating={isSubmissionModalOpen}
          setLoaderBox={setIsLoading}
          setMessage={(msg) => {
            setMessage(msg);
            setShowMessage(true);
          }}
          submitHandler={handleSubmissionSubmit}
        />
      )}

      {/* Reviewer Form Modal */}
      {isReviewerModalOpen && (
        <AutoForm
          header={selectedReviewer ? "Edit Reviewer" : "Add New Reviewer"}
          api="reviewers"
          formType={selectedReviewer ? "put" : "post"}
          formInput={reviewerFormAttributes}
          formValues={selectedReviewer || {}}
          isOpenHandler={() => {
            setIsReviewerModalOpen(false);
            setSelectedReviewer(null);
          }}
          addPrivilege={true}
          updatePrivilege={true}
          deletePrivilege={true}
          isCreating={isReviewerModalOpen}
          setLoaderBox={setIsLoading}
          setMessage={(msg) => {
            setMessage(msg);
            setShowMessage(true);
          }}
          submitHandler={handleReviewerSubmit}
        />
      )}

      {/* Assign Reviewers Modal - Custom Format */}
      {isAssignReviewersModalOpen && selectedSubmissionForAssignment ? (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1001, display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.2)" }}>
          <div
            style={{
              width: "600px",
              maxWidth: "90%",
              maxHeight: "90vh",
              backgroundColor: "white",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-stroke-soft">
              <div className="flex flex-col">
                <PageHeader title="Assign Reviewers" line={false} />
              </div>
              <Filter
                className="plain"
                title="Close"
                onClick={() => {
                  setIsAssignReviewersModalOpen(false);
                  setSelectedSubmissionForAssignment(null);
                  setAssignedReviewers([]);
                  setSelectedReviewersForMultiSelect([]);
                }}
              >
                <GetIcon icon="back" />
              </Filter>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col gap-6 p-6">
                {/* Currently Assigned Section */}
                <div>
                  <h3 className="text-[14px] font-semibold text-text-main mb-4">Currently Assigned ({assignedReviewers.length})</h3>
                  {assignedReviewers.length === 0 ? (
                    <p className="text-[12px] text-text-sub">No reviewers assigned yet</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {assignedReviewers
                        .filter((reviewer) => reviewer != null)
                        .map((reviewer, index) => {
                          const reviewerId = reviewer._id || reviewer.id || reviewer;
                          // Handle case where reviewer might just be an ID string
                          const reviewerName = reviewer.name || reviewer.value || (typeof reviewer === "string" ? reviewer : "Unknown");
                          const reviewerDesignation = reviewer.designation || "";
                          const initials = getInitials(reviewerName);
                          const score = reviewer.score || reviewer.rating || null;
                          return (
                            <div key={reviewerId || index} className="flex items-center justify-between p-3 bg-bg-weak rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-[12px] font-semibold text-primary-base">{initials}</div>
                                <div>
                                  <div className="text-[14px] font-semibold text-text-main">{reviewerName}</div>
                                  {reviewerDesignation && <div className="text-[12px] text-text-sub mt-1">{reviewerDesignation}</div>}
                                  {score && typeof score === "number" && <div className="text-[12px] text-text-sub mt-1">Score: {score.toFixed(1)}/5.0</div>}
                                </div>
                              </div>
                              <Filter className="plain error" title="Remove" onClick={() => handleRemoveReviewer(reviewerId)}>
                                <GetIcon icon="delete" />
                              </Filter>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Available Reviewers Section */}
                <div>
                  <MultiSelect
                    name="reviewers"
                    label="Assign Reviewers"
                    placeholder="Select reviewers"
                    value={selectedReviewersForMultiSelect}
                    onSelect={handleReviewersMultiSelectChange}
                    apiType="API"
                    selectApi="reviewer/reviewer-event"
                    showItem="value"
                    icon="users"
                    required={true}
                    hideSelectAll={false}
                    params={[
                      {
                        name: "event",
                        value: eventId,
                      },
                    ]}
                    setMessage={(msg) => {
                      setMessage(msg);
                      setShowMessage(true);
                    }}
                    setLoaderBox={setIsLoading}
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-stroke-soft">
              <Button
                value="Cancel"
                ClickEvent={() => {
                  setIsAssignReviewersModalOpen(false);
                  setSelectedSubmissionForAssignment(null);
                  setAssignedReviewers([]);
                  setSelectedReviewersForMultiSelect([]);
                }}
                type="secondary"
              />
              <Button
                value="Save Changes"
                ClickEvent={async () => {
                  try {
                    setIsLoading(true);
                    const reviewerIds = assignedReviewers
                      .filter((r) => r != null)
                      .map((r) => {
                        // Handle both object and string ID formats
                        if (typeof r === "string") return r;
                        return r._id || r.id || r;
                      })
                      .filter(Boolean);
                    const response = await putData(
                      {
                        id: selectedSubmissionForAssignment._id,
                        reviewers: reviewerIds,
                      },
                      "ticket-registration"
                    );

                    if (response && response.status === 200) {
                      toast.success("Reviewers assigned successfully!");
                      setIsAssignReviewersModalOpen(false);
                      setSelectedSubmissionForAssignment(null);
                      setAssignedReviewers([]);
                      setSelectedReviewersForMultiSelect([]);
                      // Refresh the submissions list by changing the key
                      setRefreshKey((prev) => prev + 1);
                    } else {
                      throw new Error(response?.message || "Failed to assign reviewers");
                    }
                  } catch (error) {
                    console.error("Error assigning reviewers:", error);
                    toast.error(error?.message || "Failed to assign reviewers. Please try again.");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                type="primary"
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* View Submission Details Modal - Centered */}
      {isViewSubmissionModalOpen && selectedSubmissionForView ? (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1001, display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.2)" }}>
          <div
            style={{
              width: "750px",
              maxWidth: "90%",
              maxHeight: "85vh",
              backgroundColor: "white",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-stroke-soft">
              <div className="flex flex-col">
                <PageHeader title="Submission Details" line={false} />
                <p className="text-[14px] text-text-sub">{selectedSubmissionForView?.fullName || selectedSubmissionForView?.emailId || "Submission"}</p>
              </div>
              <div className="flex items-center gap-3">
                <Filter
                  className="plain"
                  title="Close"
                  onClick={() => {
                    setIsViewSubmissionModalOpen(false);
                    setSelectedSubmissionForView(null);
                  }}
                >
                  <GetIcon icon="back" />
                </Filter>
              </div>
            </div>

            {/* Content - Two Column Layout with Cards */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column - Primary Information Card */}
                <div className="bg-bg-white rounded-xl border border-stroke-soft shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[14px] font-semibold text-text-main">Information</h3>
                    {/* Status Chip */}
                    {(() => {
                      const status = selectedSubmissionForView?.status?.label || selectedSubmissionForView?.status || "Pending Review";
                      const statusLower = status.toLowerCase();
                      let statusColorClass = "bg-state-warning text-white";
                      if (statusLower.includes("approved") || statusLower.includes("accepted")) {
                        statusColorClass = "bg-state-success text-white";
                      } else if (statusLower.includes("rejected")) {
                        statusColorClass = "bg-state-error text-white";
                      } else if (statusLower.includes("review")) {
                        statusColorClass = "bg-state-warning text-white";
                      }
                      return <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-medium ${statusColorClass}`}>{status}</span>;
                    })()}
                  </div>
                  <div className="flex flex-col gap-4">
                    {/* {selectedSubmissionForView?.formattedTicketNumber && (
                      <div>
                        <div className="text-[12px] text-text-sub mb-1">ID</div>
                        <div className="text-[18px] font-bold text-text-main">{selectedSubmissionForView.formattedTicketNumber}</div>
                      </div>
                    )} */}
                    {selectedSubmissionForView?.fullName && (
                      <div>
                        <span className="text-[12px] text-text-sub">Name: </span>
                        <span className="text-[14px] font-medium text-text-main">{selectedSubmissionForView.fullName}</span>
                      </div>
                    )}
                    {selectedSubmissionForView?.emailId && (
                      <div>
                        <span className="text-[12px] text-text-sub">Email: </span>
                        <a href={`mailto:${selectedSubmissionForView.emailId}`} className="text-[14px] font-medium text-primary-base hover:underline">
                          {selectedSubmissionForView.emailId}
                        </a>
                      </div>
                    )}
                    {selectedSubmissionForView?.authenticationId && (
                      <div>
                        <span className="text-[12px] text-text-sub">Phone: </span>
                        <a href={`tel:${selectedSubmissionForView.authenticationId}`} className="text-[14px] font-medium text-primary-base hover:underline">
                          {selectedSubmissionForView.authenticationId}
                        </a>
                      </div>
                    )}
                    {selectedSubmissionForView?.createdAt && (
                      <div>
                        <div className="text-[12px] text-text-sub mb-1">Submitted:</div>
                        <div className="text-[14px] font-medium text-text-main">
                          {moment(selectedSubmissionForView.createdAt).format("MMM DD, YYYY")} at {moment(selectedSubmissionForView.createdAt).format("hh:mm A")}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Contact Information & Review Team Cards */}
                <div className="flex flex-col gap-6">
                  {/* Contact Information Card */}
                  {/* <div className="bg-bg-white rounded-xl border border-stroke-soft shadow-sm p-5">
                    <h3 className="text-[14px] font-semibold text-text-main mb-4">Contact Information</h3>
                    <div className="flex flex-col gap-3">
                      {selectedSubmissionForView?.fullName && (
                        <div>
                          <span className="text-[12px] text-text-sub">Name: </span>
                          <span className="text-[14px] font-medium text-text-main">{selectedSubmissionForView.fullName}</span>
                        </div>
                      )}
                      {selectedSubmissionForView?.emailId && (
                        <div>
                          <span className="text-[12px] text-text-sub">Email: </span>
                          <a href={`mailto:${selectedSubmissionForView.emailId}`} className="text-[14px] font-medium text-primary-base hover:underline">
                            {selectedSubmissionForView.emailId}
                          </a>
                        </div>
                      )}
                      {selectedSubmissionForView?.authenticationId && (
                        <div>
                          <span className="text-[12px] text-text-sub">Phone: </span>
                          <a href={`tel:${selectedSubmissionForView.authenticationId}`} className="text-[14px] font-medium text-primary-base hover:underline">
                            {selectedSubmissionForView.authenticationId}
                          </a>
                        </div>
                      )}
                    </div>
                  </div> */}

                  {/* Review Team Card */}
                  <div className="bg-bg-white rounded-xl border border-stroke-soft shadow-sm p-5">
                    <h3 className="text-[14px] font-semibold text-text-main mb-4">Review Team</h3>
                    {selectedSubmissionForView?.reviewers && Array.isArray(selectedSubmissionForView.reviewers) && selectedSubmissionForView.reviewers.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {selectedSubmissionForView.reviewers
                          .filter((reviewer) => reviewer != null)
                          .map((reviewer, index) => {
                            const reviewerId = reviewer._id || reviewer.id || reviewer;
                            const reviewerName = reviewer.name || reviewer.value || (typeof reviewer === "string" ? reviewer : "Unknown");
                            const reviewerDesignation = reviewer.designation || "";
                            const initials = getInitials(reviewerName);
                            return (
                              <div key={reviewerId || index} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-base flex items-center justify-center text-[12px] font-semibold text-white">{initials}</div>
                                <div className="flex-1">
                                  <div className="text-[14px] font-semibold text-text-main">{reviewerName}</div>
                                  {reviewerDesignation && <div className="text-[12px] text-text-sub mt-1">{reviewerDesignation}</div>}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="text-[12px] text-text-sub">No reviewers assigned yet</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Make Decision Modal */}
      {isDecisionModalOpen && selectedSubmissionForDecision ? (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1001, display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.2)" }}>
          <div
            style={{
              width: "600px",
              maxWidth: "90%",
              maxHeight: "90vh",
              backgroundColor: "white",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-stroke-soft">
              <div className="flex flex-col">
                <PageHeader title="Make Decision" line={false} />
                <p className="text-[14px] text-text-sub mt-1">{selectedSubmissionForDecision?.fullName || selectedSubmissionForDecision?.title || "Submission"}</p>
              </div>
              <Filter
                className="plain"
                title="Close"
                onClick={() => {
                  setIsDecisionModalOpen(false);
                  setSelectedSubmissionForDecision(null);
                  setDecision("");
                  setComments("");
                  setSendNotification(false);
                }}
              >
                <GetIcon icon="back" />
              </Filter>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col gap-6 p-6">
                {/* Average Score Section */}
                <div className="bg-primary-light rounded-lg p-4 border border-primary-base">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="text-[14px] font-medium text-text-main">Average Score</div>
                      <div className="text-[12px] text-text-sub mt-1">
                        Based on {averageScore.completedReviews} completed {averageScore.completedReviews === 1 ? "review" : "reviews"}
                      </div>
                    </div>
                    <div className="text-[32px] font-bold text-primary-base">{averageScore.score.toFixed(2)}/5.0</div>
                  </div>
                </div>

                {/* Decision Field */}
                <div>
                  <Select
                    label="Decision"
                    value={decision}
                    onSelect={(item) => setDecision(item.id || item.value || item)}
                    selectApi={[
                      { id: "Accept", value: "Accept" },
                      { id: "Reject", value: "Reject" },
                      { id: "Conditional Accept", value: "Conditional Accept" },
                      { id: "Waitlist", value: "Waitlist" },
                    ]}
                    apiType="JSON"
                    align="form"
                    showLabel={true}
                  />
                </div>

                {/* Comments Field */}
                <div>
                  <TextArea label="Comments (Optional)" value={comments} onChange={(value) => setComments(value)} placeholder="Add any additional notes or feedback for the author..." align="form" />
                </div>

                {/* Notification Checkbox */}
                <div>
                  <Checkbox label="Send email notification" value={sendNotification} onChange={(checked) => setSendNotification(checked)} align="form" />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-stroke-soft">
              <Button
                value="Cancel"
                ClickEvent={() => {
                  setIsDecisionModalOpen(false);
                  setSelectedSubmissionForDecision(null);
                  setDecision("");
                  setComments("");
                  setSendNotification(false);
                }}
                type="secondary"
              />
              <Button value="Submit Decision" ClickEvent={handleSubmitDecision} type="primary" isDisabled={isLoading || !decision} />
            </div>
          </div>
        </div>
      ) : null}

      {/* Message Component for Confirmations */}
      <Message showMessage={showMessage} message={message || {}} closeMessage={closeMessage} />
    </RowContainer>
  );
};

export default SubmissionsPage;

// Attribute wrapper to embed this page inside the ListTable-based routing system
// This follows the standard pattern where a custom element is provided via attributes
export const submissionsAttributes = [
  {
    type: "element",
    name: "submissions",
    label: "",
    view: true,
    add: false,
    update: true,
    customClass: "full",
    element: (props) => {
      return <SubmissionsPage {...props} />;
    },
  },
];
