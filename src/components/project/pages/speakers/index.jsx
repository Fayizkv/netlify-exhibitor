import React, { useState, useEffect, useRef } from "react";
import { getData, postData, putData, deleteData } from "../../../../backend/api";
// import { Button } from "../../../../components/core/button";
import { Button } from "../../../../components/core/elements";
import { ListTableSkeleton } from "../../../../components/core/loader/shimmer";
import { AddIcon, GetIcon } from "../../../../icons";
import { PageHeader, SubPageHeader } from "../../../core/input/heading";
import { AddButton, ButtonPanel, Filter } from "../../../core/list/styles";
import Search from "../../../core/search";
import NoDataFound from "../../../core/list/nodata";
import { RowContainer } from "../../../styles/containers/styles";

const imageCDN = import.meta.env.VITE_CDN;

const Speakers = (props) => {
  const [speakersData, setSpeakersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [eventId, setEventId] = useState(props.openData.data._id);
  const [speakerRoles, setSpeakerRoles] = useState(["Speaker", "Keynote", "Panelist", "Moderator"]);
  const [speakerTypes, setSpeakerTypes] = useState([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState(null);
  const [speakerToDelete, setSpeakerToDelete] = useState(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sortableInstance, setSortableInstance] = useState(null);
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [enableFullScreen] = useState(false);

  // Filter and search state variables
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ roles: [], companies: [] });
  const [filteredSpeakers, setFilteredSpeakers] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    designation: "",
    company: "",
    email: "",
    description: "",
    photo: null,
    social: {
      linkedin: "",
      twitter: "",
      website: "",
    },
  });

  const speakersGridRef = useRef(null);
  const sortableRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load Sortable.js dynamically
  useEffect(() => {
    const loadSortable = () => {
      if (window.Sortable) {
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    loadSortable().catch(console.error);
  }, []);

  // Transform API response to match UI expectations
  const transformSpeakerData = (apiSpeakers) => {
    return apiSpeakers
      .map((speaker, index) => ({
        id: speaker._id,
        name: speaker.name,
        role: speaker.role || "Speaker",
        designation: speaker.designation || "",
        company: speaker.company || "",
        email: speaker.email || "",
        description: speaker.description || "",
        order: speaker.order || index,
        img:
          speaker.photo && speaker.photo !== "false"
            ? `${imageCDN}${speaker.photo}`
            : `https://avatar.vercel.sh/${speaker.name}.svg?text=${speaker.name
                .split(" ")
                .map((n) => n[0])
                .join("")}`,
        social: {
          linkedin: speaker.linkedin || "",
          twitter: speaker.twitter || "",
          website: speaker.website || "",
        },
        rawData: speaker,
      }))
      .sort((a, b) => a.order - b.order); // Sort by order
  };

  // Fetch speakers from API
  const fetchSpeakers = async () => {
    if (!eventId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getData({ event: eventId }, "speakers");
      console.log("Speakers API response:", response);

      if (response.data.success) {
        const transformedSpeakers = transformSpeakerData(response.data.response);
        setSpeakersData(transformedSpeakers);
        setOrderChanged(false); // Reset orderChanged when speakers are fetched
      } else {
        setError("Failed to fetch speakers");
      }
    } catch (error) {
      console.error("Error fetching speakers:", error);
      setError("Error fetching speakers");
    } finally {
      setLoading(false);
    }
  };

  // Filter and search functions
  const toggleFilterPanel = (open) => {
    console.log("Toggling filter panel:", open);
    setIsFilterPanelOpen(open);
  };

  const handleApplyFilters = () => {
    console.log("Applying filters");
    const roleCheckboxes = document.querySelectorAll("#role-filters input:checked");
    const companyCheckboxes = document.querySelectorAll("#company-filters input:checked");

    const roles = Array.from(roleCheckboxes).map((el) => el.value);
    const companies = Array.from(companyCheckboxes).map((el) => el.value);

    setActiveFilters({ roles, companies });
    toggleFilterPanel(false);
  };

  const applyActiveFiltersAndSearch = () => {
    console.log("Applying filters and search:", { activeFilters, searchTerm });
    const filtered = speakersData.filter((speaker) => {
      const roleMatch = activeFilters.roles.length === 0 || activeFilters.roles.includes(speaker.role);
      const companyMatch = activeFilters.companies.length === 0 || activeFilters.companies.includes(speaker.company);
      const searchMatch =
        searchTerm === "" ||
        speaker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        speaker.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        speaker.designation.toLowerCase().includes(searchTerm.toLowerCase());

      return roleMatch && companyMatch && searchMatch;
    });

    setFilteredSpeakers(filtered);
  };

  // Apply filters and search when dependencies change
  useEffect(() => {
    applyActiveFiltersAndSearch();
  }, [activeFilters, searchTerm, speakersData]);

  // Get unique values for filters
  const allRoles = [...new Set(speakersData.map((s) => s.role).filter(Boolean))];
  const allCompanies = [...new Set(speakersData.map((s) => s.company).filter(Boolean))];

  // Fetch speaker types from API
  useEffect(() => {
    const fetchSpeakerTypes = async () => {
      try {
        const anchorResponse = await getData({ event: eventId }, "anchor/select");
        console.log("Anchor response:", anchorResponse);
        if (anchorResponse && anchorResponse.data) {
          setSpeakerTypes(anchorResponse.data);
        }
      } catch (error) {
        console.error("Error fetching speaker types:", error);
      }
    };
    if (eventId) {
      fetchSpeakerTypes();
    }
  }, [eventId]);

  // Initialize component
  useEffect(() => {
    setEventId(props.openData.data._id);
  }, [props.openData.data._id]);

  useEffect(() => {
    fetchSpeakers();
  }, [eventId]);

  // Initialize Sortable
  useEffect(() => {
    if (speakersGridRef.current && speakersData.length > 0 && window.Sortable) {
      // Destroy existing sortable instance
      if (sortableRef.current) {
        try {
          if (sortableRef.current.el && sortableRef.current.el.parentNode) {
            sortableRef.current.destroy();
          }
        } catch (error) {
          console.warn("Error destroying previous sortable instance:", error);
        }
        sortableRef.current = null;
      }

      console.log("Initializing Sortable for speakers grid");
      const newSortableInstance = new window.Sortable(speakersGridRef.current, {
        animation: 150,
        ghostClass: "sortable-ghost",
        chosenClass: "sortable-chosen",
        dragClass: "sortable-drag",
        handle: ".speaker-card",
        onStart: (evt) => {
          console.log("Drag started");
          evt.item.style.opacity = "0.5";
        },
        onEnd: (evt) => {
          console.log("Drag ended:", evt);
          evt.item.style.opacity = "1";

          // Update the order in state
          const oldIndex = evt.oldIndex;
          const newIndex = evt.newIndex;

          if (oldIndex !== newIndex) {
            const newSpeakersData = [...speakersData];
            const [movedSpeaker] = newSpeakersData.splice(oldIndex, 1);
            newSpeakersData.splice(newIndex, 0, movedSpeaker);

            // Update order values for all speakers
            const updatedSpeakersData = newSpeakersData.map((speaker, index) => ({
              ...speaker,
              order: index,
            }));

            setSpeakersData(updatedSpeakersData);
            setOrderChanged(true);
            console.log(
              "Speakers reordered:",
              updatedSpeakersData.map((s) => `${s.name} (order: ${s.order})`)
            );
          }
        },
      });

      sortableRef.current = newSortableInstance;
      setSortableInstance(newSortableInstance);
    }
  }, [speakersData]);

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      if (sortableRef.current) {
        try {
          // Safe destroy on component unmount
          if (sortableRef.current.el && sortableRef.current.el.parentNode) {
            sortableRef.current.destroy();
          }
        } catch (error) {
          console.warn("Error destroying sortable instance on unmount:", error);
        }
        sortableRef.current = null;
        setSortableInstance(null);
      }

      // Clean up any blob URLs on component unmount
      if (formData.photo instanceof File) {
        URL.revokeObjectURL(URL.createObjectURL(formData.photo));
      }
    };
  }, []);

  const generateSocialIcons = (social) => {
    const icons = [];

    if (social?.linkedin) {
      icons.push(
        <a key="linkedin" href={social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        </a>
      );
    }

    if (social?.twitter) {
      icons.push(
        <a key="twitter" href={social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-.424.727-.666 1.561-.666 2.477 0 1.61.82 3.027 2.053 3.847-.764-.024-1.482-.232-2.11-.583v.062c0 2.256 1.605 4.14 3.737 4.568-.39.106-.803.163-1.227.163-.3 0-.593-.028-.877-.082.593 1.85 2.303 3.203 4.334 3.239-1.59 1.247-3.604 1.991-5.79 1.991-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.092 7.14 2.092 8.57 0 13.255-7.098 13.255-13.254 0-.202-.005-.403-.014-.602.91-.658 1.7-1.476 2.323-2.41z" />
          </svg>
        </a>
      );
    }

    if (social?.website) {
      icons.push(
        <a key="website" href={social.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      );
    }

    return <div className="flex items-center space-x-3">{icons}</div>;
  };

  const handleOpenPanel = (speaker = null) => {
    console.log("Opening panel for speaker:", speaker);
    setEditingSpeaker(speaker);
    if (speaker) {
      // Find the matching role ID from speakerTypes
      const matchingRole = speakerTypes.find((roleType) => roleType.value === speaker.role || roleType.id === speaker.role);

      setFormData({
        name: speaker.name,
        role: matchingRole ? matchingRole.id : speaker.role,
        designation: speaker.designation,
        company: speaker.company,
        email: speaker.email,
        description: speaker.description,
        photo: speaker.photo,
        social: speaker.social || { linkedin: "", twitter: "", website: "" },
      });
    } else {
      setFormData({
        name: "",
        role: "",
        designation: "",
        company: "",
        email: "",
        description: "",
        photo: null,
        social: { linkedin: "", twitter: "", website: "" },
      });
    }
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    console.log("Closing panel");

    // Clean up any blob URLs to prevent memory leaks
    if (formData.photo instanceof File) {
      URL.revokeObjectURL(URL.createObjectURL(formData.photo));
    }

    setIsPanelOpen(false);
    setEditingSpeaker(null);
    setFormData({
      name: "",
      role: "",
      designation: "",
      company: "",
      email: "",
      description: "",
      photo: null,
      social: { linkedin: "", twitter: "", website: "" },
    });

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFormChange = (field, value) => {
    console.log("Form field changed:", field, value);
    if (field.startsWith("social.")) {
      const socialField = field.replace("social.", "");
      setFormData((prev) => ({
        ...prev,
        social: {
          ...prev.social,
          [socialField]: value,
        },
      }));
    } else if (field === "photo") {
      setFormData((prev) => ({
        ...prev,
        photo: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting speaker form:", formData);

    if (!formData.name.trim()) {
      alert("Speaker name is required");
      return;
    }

    setSubmitting(true);

    try {
      const submitData = {
        event: eventId,
        name: formData.name,
        anchor: formData.role,
        designation: formData.designation,
        company: formData.company,
        email: formData.email,
        description: formData.description,
        linkedin: formData.social.linkedin,
        twitter: formData.social.twitter,
        website: formData.social.website,
        photo: formData.photo,
      };

      // Add order for new speakers - calculate next available order number
      if (!editingSpeaker) {
        const maxOrder = speakersData.length > 0 ? Math.max(...speakersData.map((s) => s.order || 0)) : -1;
        submitData.order = maxOrder + 1;
      }

      let response;
      if (editingSpeaker) {
        // Update existing speaker
        console.log("Update data:", submitData);
        response = await putData({ id: editingSpeaker.id, ...submitData }, "speakers");
        console.log("Speaker updated:", response);
      } else {
        // Create new speaker
        console.log("Submit data:", submitData);
        response = await postData(submitData, "speakers");
        console.log("New speaker created:", response);
      }

      if (response.data.success) {
        // Refresh speakers list
        await fetchSpeakers();
        handleClosePanel();
      } else {
        console.error("API response indicates failure:", response.data);
        alert("Failed to save speaker");
      }
    } catch (error) {
      console.error("Error submitting speaker:", error);
      alert("Error submitting speaker");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAIFill = async () => {
    if (!linkedinUrl) {
      alert("Please enter a LinkedIn URL.");
      return;
    }

    console.log("AI filling form with LinkedIn URL:", linkedinUrl);
    setIsAILoading(true);

    try {
      // Call the API to get speaker profile data
      const response = await getData({ linkedinProfile: linkedinUrl }, "speakers/get-speaker-profile");

      console.log("AI API response:", response);

      if (response.data.success && response.data.data) {
        const profileData = response.data.data;

        // Find the matching role ID from speakerTypes
        const matchingRole = speakerTypes.find((roleType) => roleType.value === profileData.Designation || roleType.id === profileData.Designation);

        setFormData({
          name: profileData.Name || "",
          role: matchingRole ? matchingRole.id : speakerTypes.length > 0 ? speakerTypes[0].id : "Speaker",
          designation: profileData.Designation || "",
          company: profileData.Company || "",
          email: "", // Email not provided by AI
          description: profileData["Speaker Bio"] || "",
          photo: null,
          social: {
            linkedin: linkedinUrl,
            twitter: "",
            website: "",
          },
        });

        console.log("AI form filling completed with data:", profileData);
      } else {
        console.error("AI API response indicates failure:", response.data);
        alert("Failed to generate speaker profile. Please try again.");
      }
    } catch (error) {
      console.error("Error calling AI API:", error);
      alert("Error generating speaker profile. Please check your LinkedIn URL and try again.");
    } finally {
      setIsAILoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        alert("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert("File size must be less than 5MB");
        return;
      }

      console.log("Image selected:", file.name, file.type, `${(file.size / 1024 / 1024).toFixed(2)}MB`);
      handleFormChange("photo", file);
    }
  };

  const handleRemoveImage = () => {
    handleFormChange("photo", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getImagePreview = () => {
    if (formData.photo instanceof File) {
      return URL.createObjectURL(formData.photo);
    }
    if (editingSpeaker && editingSpeaker.img) {
      return editingSpeaker.img;
    }
    return null;
  };

  const handleDeleteSpeaker = async (speakerId) => {
    try {
      const response = await deleteData({ id: speakerId }, "speakers");
      console.log("Speaker deleted:", response);

      if (response.data.success) {
        // Refresh speakers list
        await fetchSpeakers();
        setIsDeleteModalOpen(false);
        setSpeakerToDelete(null);
      } else {
        console.error("Delete response indicates failure:", response.data);
        alert("Failed to delete speaker");
      }
    } catch (error) {
      console.error("Error deleting speaker:", error);
      alert("Error deleting speaker");
    }
  };

  const handleAddNewRole = () => {
    console.log("Opening add role modal");
    setIsRoleModalOpen(true);
  };

  const handleSaveNewRole = () => {
    const newRole = document.getElementById("new-role-name")?.value?.trim();
    if (newRole && !speakerRoles.includes(newRole)) {
      console.log("Adding new role:", newRole);
      setSpeakerRoles((prev) => [...prev, newRole]);
      handleFormChange("role", newRole);
    }
    setIsRoleModalOpen(false);
  };

  const showDeleteConfirmation = (speaker) => {
    setSpeakerToDelete(speaker);
    setIsDeleteModalOpen(true);
  };

  const saveOrder = async () => {
    setSavingOrder(true);
    try {
      const orderData = speakersData.map((speaker) => ({
        id: speaker.id,
        order: speaker.order,
      }));

      console.log("Saving speaker order:", orderData);

      const response = await putData(
        {
          event: eventId,
          speakers: JSON.stringify(orderData), // Stringify the array for FormData
        },
        "speakers/update-order"
      );

      if (response.data.success) {
        setOrderChanged(false);
        if (props.setMessage) {
          props.setMessage({
            type: 1,
            content: "Speaker order saved successfully",
            proceed: "Okay",
            icon: "success",
          });
        }
        console.log("Order saved successfully");
      } else {
        console.error("API response indicates failure:", response.data);
        alert("Failed to save speaker order");
      }
    } catch (error) {
      console.error("Error saving speaker order:", error);
      alert("Error saving speaker order");
    } finally {
      setSavingOrder(false);
    }
  };

  const isFormValid = formData.name.trim() && formData.role.trim();

  // Loading state
  if (loading) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="space-y-4">
            <ListTableSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center min-h-64">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button onClick={fetchSpeakers} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
          
          :root {
              --primary-blue: #4F46E5;
              --primary-blue-hover: #4338CA;
              --danger-red: #EF4444;
              --danger-red-hover: #DC2626;
              --gray-50: #F9FAFB;
              --gray-100: #F3F4F6;
              --gray-200: #E5E7EB;
              --gray-400: #9CA3AF;
              --gray-500: #6B7280;
              --gray-600: #4B5563;
              --gray-900: #111827;
              --white: #FFFFFF;
              --shadow-sm: 0px 2px 4px 0px rgba(27, 28, 29, 0.04);
              --shadow-md: 0px 16px 32px -12px rgba(88, 92, 95, 0.10);
              --radius-md: 6px;
              --radius-full: 9999px;
          }
          
          body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              background-color: var(--white);
              color: var(--gray-900);
          }
          
          /* Drag-and-Drop Styles */
          .speaker-card { 
            cursor: grab; 
            transition: all 0.2s ease;
            position: relative;
          }
          .speaker-card:active { 
            cursor: grabbing; 
          }
          .speaker-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.1);
          }
          
          .sortable-ghost { 
            opacity: 0.4 !important; 
            background: var(--primary-blue) !important; 
            border: 2px dashed var(--primary-blue-hover) !important;
            transform: rotate(5deg) !important;
          }
          
          .sortable-chosen { 
            box-shadow: var(--shadow-md) !important; 
            transform: scale(1.05) !important; 
            z-index: 1000 !important;
          }
          
          .sortable-drag {
            opacity: 0.8 !important;
            transform: rotate(5deg) !important;
          }
          
          .primary-button { background-color: var(--primary-blue); color: var(--white); padding: 10px 20px; border-radius: var(--radius-md); font-weight: 500; font-size: 14px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid transparent; transition: background-color 0.2s; }
          .primary-button:hover { background-color: var(--primary-blue-hover); }
          .primary-button:disabled { background-color: var(--gray-200); color: var(--gray-400); cursor: not-allowed; }

          .secondary-button { background-color: var(--white); color: var(--gray-600); padding: 10px 20px; border-radius: var(--radius-md); font-weight: 500; font-size: 14px; border: 1px solid var(--gray-200); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: background-color 0.2s, border-color 0.2s; }
          .secondary-button:hover { background-color: var(--gray-50); }

          .danger-button { background-color: var(--danger-red); color: var(--white); padding: 8px 16px; border-radius: var(--radius-md); font-weight: 500; font-size: 12px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid transparent; transition: background-color 0.2s; }
          .danger-button:hover { background-color: var(--danger-red-hover); }
          
          .form-input-container { position: relative; }
          .form-input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--gray-400); }
          .form-input { display: block; width: 100%; border: 1px solid var(--gray-200); border-radius: var(--radius-md); padding: 10px 12px 10px 40px; font-size: 14px; transition: border-color 0.2s, box-shadow 0.2s; }
          .form-input:focus { outline: none; border-color: var(--primary-blue); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
          
          .panel-container { transition: opacity 0.3s ease-in-out; }
          .side-panel { transition: transform 0.3s ease-in-out; box-shadow: var(--shadow-md); }
          
          .spinner { animation: spin 1s linear infinite; }
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          
          .card-actions { opacity: 0; transform: translateY(4px); transition: all 0.2s; }
          .speaker-card:hover .card-actions { opacity: 1; transform: translateY(0); }
          
          /* Drag indicator */
          .speaker-card::before {
            content: "⋮⋮";
            position: absolute;
            top: 10px;
            right: 10px;
            color: var(--gray-400);
            font-size: 12px;
            opacity: 0;
            transition: opacity 0.2s;
          }
          
          .speaker-card:hover::before {
            opacity: 1;
          }
          
          /* Responsive text utilities */
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          /* Filter Panel Styles */
          .filter-overlay {
            transition: opacity 0.3s ease-in-out;
          }

          /* Focus styles for accessibility */
          .primary-button:focus,
          .secondary-button:focus {
            outline: 2px solid var(--primary-blue);
            outline-offset: 2px;
          }

          input:focus {
            outline: 2px solid var(--primary-blue);
            outline-offset: 2px;
          }
          
          /* Mobile responsive adjustments */
          @media (max-width: 640px) {
            .speaker-card {
              transform: none !important;
            }
            
            .speaker-card:hover {
              transform: none !important;
            }
            
            .sortable-ghost,
            .sortable-chosen { 
              transform: none !important;
            }
            
            .card-actions {
              opacity: 1 !important;
              transform: none !important;
            }
          }
        `}
      </style>

      <div className="">
        <RowContainer className={"data-layout " + (fullScreen ? " !fixed top-0 left-0 right-0 bottom-0 z-50 bg-white transition-all duration-300" : "transition-all duration-300")}>
          {/* Header */}
          <PageHeader line={false} dynamicClass="sub inner" title="Event Speakers" description="Manage speakers for your event. Drag and drop cards to reorder them." />
          <ButtonPanel className="custom">
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <Filter
                className={"filter-button" + (isFilterPanelOpen ? "active" : "")}
                onClick={() => {
                  toggleFilterPanel(true);
                }}
              >
                <div className="flex items-center gap-2  justify-end">
                  <GetIcon icon={"filter"} />
                  <span className="text-sm">Filter</span>
                </div>
              </Filter>
              {enableFullScreen && (
                <Filter
                  onClick={() => {
                    setFullScreen((prev) => !prev);
                  }}
                >
                  <GetIcon icon={fullScreen ? "close" : "enlarge"} />
                </Filter>
              )}
              <Search title={"Search"} placeholder="Search speakers" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex items-center space-x-2 self-start md:self-center mr-0 ml-auto">
              {orderChanged && (
                <Button
                  value={savingOrder ? "Saving..." : "Save Order"}
                  icon={savingOrder ? "loading" : "check"}
                  ClickEvent={saveOrder}
                  isDisabled={savingOrder}
                  type="primary"
                  align="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                />
              )}
              <AddButton onClick={() => handleOpenPanel()}>
                <AddIcon></AddIcon>
                <span>Add Speaker</span>
              </AddButton>
            </div>
          </ButtonPanel>

          {(filteredSpeakers.length > 0 || activeFilters.roles.length > 0 || activeFilters.companies.length > 0 || searchTerm ? filteredSpeakers : speakersData).length === 0 ? (
            <NoDataFound
              shortName={"Speakers"}
              icon={"speaker"}
              addPrivilege={true}
              addLabel={"Add Speaker"}
              isCreatingHandler={() => handleOpenPanel()}
              className="white-list"
              description={"Get started by creating your first speaker."}
            ></NoDataFound>
          ) : (
            <div ref={speakersGridRef} className=" grid-cols-1 grid sm:grid-cols-2 md:grid-cols-3  gap-4 md:gap-2">
              {(filteredSpeakers.length > 0 || activeFilters.roles.length > 0 || activeFilters.companies.length > 0 || searchTerm ? filteredSpeakers : speakersData).map((speaker) => (
                <div
                  key={speaker.id}
                  className="speaker-card bg-red "
                  data-id={speaker.id}
                  style={{
                    backgroundColor: "var(--white)",
                    border: "1px solid var(--gray-200)",
                    borderRadius: "var(--radius-md)",
                    boxShadow: "var(--shadow-sm)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div className="p-4 md:p-6 flex-grow">
                    <div className="flex items-start">
                      <img className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mr-3 md:mr-4 object-cover rounded-full flex-shrink-0" src={speaker.img} alt={speaker.name} />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate">{speaker.name}</h3>
                        <p className="text-xs md:text-sm font-medium text-blue-600 truncate">{speaker.designation}</p>
                        <p className="text-xs md:text-sm text-gray-600 truncate">{speaker.company}</p>
                      </div>
                    </div>
                    {speaker.description && <p className="text-xs md:text-sm text-gray-600 mt-3 md:mt-4 border-t border-gray-100 pt-3 md:pt-4 line-clamp-3">{speaker.description}</p>}
                  </div>
                  <div
                    className="p-3 md:p-4 bg-gray-50 flex items-center justify-between"
                    style={{
                      borderTop: "1px solid var(--gray-200)",
                      borderBottomLeftRadius: "var(--radius-md)",
                      borderBottomRightRadius: "var(--radius-md)",
                    }}
                  >
                    <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">{generateSocialIcons(speaker.social)}</div>
                    <div className="card-actions flex items-center space-x-1 md:space-x-2 flex-shrink-0">
                      <button onClick={() => handleOpenPanel(speaker)} className="secondary-button text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5">
                        Edit
                      </button>
                      <button onClick={() => showDeleteConfirmation(speaker)} className="danger-button px-1.5 md:px-2 py-1 md:py-1.5">
                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </RowContainer>

        {/* Add/Edit Speaker Side Panel */}
        <div
          className={`panel-container fixed inset-0 z-40 flex justify-end bg-black bg-opacity-50 transition-opacity duration-300 ${isPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={handleClosePanel}
        >
          <div
            className={`side-panel bg-white w-full sm:max-w-md h-full shadow-lg transform transition-transform duration-300 ${isPanelOpen ? "translate-x-0" : "translate-x-full"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="flex items-center justify-between py-3 md:py-4 px-4 md:px-6 border-b border-gray-200">
                <h1 className="text-sm md:text-[16px] font-[500] text-gray-900">{editingSpeaker ? "Edit Speaker" : "Add a Speaker"}</h1>
                <button type="button" onClick={handleClosePanel} className="p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100">
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="p-4 md:p-6 overflow-y-auto flex-grow">
                {/* AI Section */}
                <div className="bg-indigo-50 border-l-4 border-indigo-400 p-3 md:p-4 rounded-r-md mb-4 md:mb-6">
                  <h3 className="text-sm md:text-base font-semibold text-gray-900">✨ Save time with AI</h3>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">Paste a LinkedIn profile URL to auto-fill.</p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center mt-3 gap-2">
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="e.g., https://linkedin.com/in/satyanadella"
                      className="flex-grow border border-gray-200 rounded-md px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
                    />
                    <button type="button" onClick={handleAIFill} disabled={isAILoading} className="primary-button flex-shrink-0 text-xs md:text-sm px-3 py-2">
                      <span>{isAILoading ? "" : "Generate"}</span>
                      {isAILoading && (
                        <svg className="w-4 h-4 md:w-5 md:h-5 ml-2 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4 md:space-y-5">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-600 mb-1">
                      Speaker Name <span className="text-red-500">*</span>
                    </label>
                    <div className="form-input-container">
                      <svg className="form-input-icon w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleFormChange("name", e.target.value)}
                        className="form-input text-xs md:text-sm"
                        placeholder="Enter Speaker Name"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-600">
                        Speaker Role <span className="text-red-500">*</span>
                      </label>
                      <button type="button" onClick={handleAddNewRole} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                        + Add New
                      </button>
                    </div>
                    <div className="form-input-container">
                      <svg className="form-input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7.5 7.5 0 01-7.5 7.5h-1a7.5 7.5 0 01-7.5-7.5V7.5a7.5 7.5 0 0115 0v3.5z"></path>
                      </svg>
                      <select required value={formData.role} onChange={(e) => handleFormChange("role", e.target.value)} className="form-input" style={{ paddingRight: "12px" }}>
                        <option value="">Select Role Type</option>
                        {speakerTypes.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.value}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Designation</label>
                    <div className="form-input-container">
                      <svg className="form-input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6"
                        ></path>
                      </svg>
                      <input type="text" value={formData.designation} onChange={(e) => handleFormChange("designation", e.target.value)} placeholder="Job Title or Role" className="form-input" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Company</label>
                    <div className="form-input-container">
                      <svg className="form-input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        ></path>
                      </svg>
                      <input type="text" value={formData.company} onChange={(e) => handleFormChange("company", e.target.value)} placeholder="Organization or Affiliation" className="form-input" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                    <div className="form-input-container">
                      <svg className="form-input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        ></path>
                      </svg>
                      <input type="email" value={formData.email} onChange={(e) => handleFormChange("email", e.target.value)} className="form-input" placeholder="Enter Email" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Speaker Bio</label>
                    <textarea
                      rows="3"
                      value={formData.description}
                      onChange={(e) => handleFormChange("description", e.target.value)}
                      className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter speaker bio and relevant experience..."
                    />
                  </div>

                  {/* Profile Picture Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Profile Picture</label>
                    <p className="text-xs text-gray-500 mb-3">Upload a professional photo of the speaker (JPEG, PNG, GIF, WebP - Max 5MB)</p>

                    {getImagePreview() ? (
                      <div className="space-y-3">
                        <div className="relative inline-block">
                          <img src={getImagePreview()} alt="Speaker preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="secondary-button text-sm">
                          Change Image
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                      >
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="mt-4">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        </div>
                      </div>
                    )}

                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </div>

                  {/* Social Media Fields */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">Social Media Links</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">LinkedIn URL</label>
                        <input
                          type="url"
                          value={formData.social.linkedin}
                          onChange={(e) => handleFormChange("social.linkedin", e.target.value)}
                          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://linkedin.com/in/..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Twitter URL</label>
                        <input
                          type="url"
                          value={formData.social.twitter}
                          onChange={(e) => handleFormChange("social.twitter", e.target.value)}
                          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://twitter.com/..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Website URL</label>
                        <input
                          type="url"
                          value={formData.social.website}
                          onChange={(e) => handleFormChange("social.website", e.target.value)}
                          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end p-3 md:p-4 border-t bg-gray-50 gap-2 sm:gap-0">
                {editingSpeaker && (
                  <button type="button" onClick={() => showDeleteConfirmation(editingSpeaker)} className="danger-button mr-auto order-3 sm:order-1 text-xs md:text-sm">
                    <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                    Delete
                  </button>
                )}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 order-1 sm:order-2">
                  <button type="button" onClick={handleClosePanel} className="secondary-button sm:mr-2 text-xs md:text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={!isFormValid || submitting} className="primary-button text-xs md:text-sm">
                    {submitting ? "Saving..." : editingSpeaker ? "Save Changes" : "Create"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Add New Role Modal */}
        <div
          className={`panel-container fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 p-4 ${isRoleModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={() => setIsRoleModalOpen(false)}
        >
          <div
            className={`bg-white rounded-lg shadow-xl w-full max-w-sm p-4 md:p-6 transform transition-transform duration-200 ${isRoleModalOpen ? "scale-100" : "scale-95"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Add a New Role</h3>
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-600 mb-1">Role Name</label>
              <input
                type="text"
                id="new-role-name"
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Workshop Host"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end mt-4 md:mt-6 gap-2 sm:gap-0">
              <button type="button" onClick={() => setIsRoleModalOpen(false)} className="secondary-button sm:mr-2 text-xs md:text-sm">
                Cancel
              </button>
              <button type="button" onClick={handleSaveNewRole} className="primary-button text-xs md:text-sm">
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <div
          className={`panel-container fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 p-4 ${isDeleteModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            className={`bg-white rounded-lg shadow-xl w-full max-w-md p-4 md:p-6 transform transition-transform duration-200 ${isDeleteModalOpen ? "scale-100" : "scale-95"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-3 md:mb-4">
              <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  ></path>
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Delete Speaker</h3>
              <p className="text-xs md:text-sm text-gray-600 mb-4 md:mb-6">
                Are you sure you want to delete <span className="font-medium">{speakerToDelete?.name}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="secondary-button text-xs md:text-sm">
                Cancel
              </button>
              <button type="button" onClick={() => handleDeleteSpeaker(speakerToDelete?.id)} className="danger-button text-xs md:text-sm">
                Delete Speaker
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        <div className={`fixed inset-0 z-40 overflow-hidden ${isFilterPanelOpen ? "" : "pointer-events-none"}`}>
          <div
            className={`absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${isFilterPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            onClick={() => toggleFilterPanel(false)}
          ></div>
          <div className={`absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl transition-transform duration-300 ${isFilterPanelOpen ? "translate-x-0" : "translate-x-full"}`}>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-[16px] font-[500]">Filter Speakers</h2>
                <button className="p-2 -mr-2 text-gray-500 hover:text-gray-800" onClick={() => toggleFilterPanel(false)}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              {/* Filters */}
              <div className="p-6 flex-grow overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-500 mb-2">SPEAKER ROLES</h3>
                <div id="role-filters" className="space-y-2">
                  {allRoles.map((role) => (
                    <label key={role} className="flex items-center space-x-3 cursor-pointer">
                      <input type="checkbox" value={role} className="h-4 w-4 rounded border-gray-300 text-primary-blue focus:ring-primary-blue" defaultChecked={activeFilters.roles.includes(role)} />
                      <span className="text-gray-700">{role}</span>
                    </label>
                  ))}
                </div>

                <h3 className="text-sm font-medium text-gray-500 mt-6 mb-2">COMPANIES</h3>
                <div id="company-filters" className="space-y-2">
                  {allCompanies.map((company) => (
                    <label key={company} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        value={company}
                        className="h-4 w-4 rounded border-gray-300 text-primary-blue focus:ring-primary-blue"
                        defaultChecked={activeFilters.companies.includes(company)}
                      />
                      <span className="text-gray-700">{company}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Footer */}
              <div className="p-4 border-t bg-gray-50">
                <button className="w-full primary-button justify-center" onClick={handleApplyFilters}>
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Speakers;
