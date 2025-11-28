import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../../../core/layout";
import ListTable from "../../../../core/list/list";
import ListTableSkeleton from "../../../../core/loader/shimmer";
import Loader from "../../../../core/loader";
import { exhibitorAttributes } from "../attributes/exhibitor";
import {
  useEventFormFields,
  useTicketFormData,
  useApprovalCounts,
  useResendConfirmation,
  useGenerateBadge,
  useApprovalAction,
  useBulkResendConfirmation,
  useCheckinUser,
} from "./hooks/useRegistrationsData";

const Attendee = (props) => {
  // const { id } = props;
  const { inlineTab } = useParams(); // Get ticket ID from URL params
  const [shimmerLoader, setShimmerLoader] = useState(false);
  const [loader, setLoader] = useState(false);
  const eventId = props?.openData?.data?._id;
  const { title, ticketType, pageMode = "registration" } = props;
  const id = props.params?.dynamicId;
  // Get needsApproval from dynamicData (ticket) or participantType
  const needsApprovalFromProps = props?.params?.dynamicData?.needsApproval || props?.params?.dynamicData?.participantType?.needsApproval;

  // Helper function to check if current mode is check-in or instance
  const isCheckInMode = pageMode === "check-in" || pageMode === "instance";

  // Use URL param as selectedTab, default to "all" if not present
  const selectedTab = id || "all";
  const [ticket, setTicket] = useState(null);
  const [attributes, setSubAttributes] = useState(null);
  const [eventAttributes, setEventAttributes] = useState([]);

  // Check if component is ready (all necessary props are available)
  const isComponentReady = useMemo(() => {
    // For "all" tab, we only need eventId and basic props
    if (selectedTab === "all") {
      return !!(eventId && props?.params !== undefined);
    }
    // For specific ticket tabs, we need eventId and basic props
    // needsApproval can be undefined for some ticket types, so we don't require it
    return !!(eventId && props?.params !== undefined);
  }, [eventId, props?.params, selectedTab]);

  // Compute needsApproval from props or ticket data (moved up to be available for hooks)
  const needsApproval = useMemo(() => {
    const finalValue = needsApprovalFromProps || ticket?.needsApproval || ticket?.participantType?.needsApproval;
    return finalValue;
  }, [needsApprovalFromProps, ticket?.needsApproval, ticket?.participantType?.needsApproval]);

  // React Query hooks for data fetching - only when component is ready
  const { data: eventFormFields, isLoading: eventFormFieldsLoading } = useEventFormFields(eventId, isComponentReady);
  const { data: ticketFormData, isLoading: ticketFormDataLoading } = useTicketFormData(selectedTab, eventId, isComponentReady);
  const { data: approvalCounts } = useApprovalCounts(eventId, needsApproval, isComponentReady);

  // React Query mutations for actions
  const resendConfirmationMutation = useResendConfirmation(props.setMessage);
  const generateBadgeMutation = useGenerateBadge(props.setMessage);
  const approvalActionMutation = useApprovalAction(props.setMessage, eventId);
  const bulkResendMutation = useBulkResendConfirmation(props.setLoaderBox, props.setMessage);
  const checkinUserMutation = useCheckinUser(props.setMessage, eventId);

  // Update ticket data when ticketFormData changes
  useEffect(() => {
    if (ticketFormData?.ticketData) {
      setTicket(ticketFormData.ticketData);
    }
  }, [ticketFormData]);

  // Check if the selected tab is an exhibitor
  // NOTE: This checks the PARTICIPANT TYPE name, not the ticket/form title
  const isExhibitorTab = useMemo(() => {
    if (selectedTab === "all") return false;

    const isExhibitor = ticket?.participantTypeName === "Exhibitor" || ticket?.participantType?.name === "Exhibitor";

    console.log("🔎 [isExhibitorTab] Check:", {
      ticketTitle: ticket?.title,
      participantTypeName: ticket?.participantTypeName,
      participantType: ticket?.participantType,
      isExhibitor,
    });

    return isExhibitor;
  }, [selectedTab, ticket]);

  // Update shimmer loader based on ticket form data loading state
  useEffect(() => {
    setShimmerLoader(ticketFormDataLoading);
  }, [ticketFormDataLoading]);

  // Optimized resend confirmation using React Query mutation
  const resendConfirmation = (id, refreshView, slNo) => {
    setLoader(true);
    resendConfirmationMutation.mutate(
      { id },
      {
        onSettled: () => setLoader(false),
      }
    );
  };

  // Optimized badge generation using React Query mutation
  const generateBadge = (id, refreshView, slNo) => {
    setLoader(true);
    generateBadgeMutation.mutate(
      { id },
      {
        onSettled: () => setLoader(false),
      }
    );
  };

  // Optimized approval actions using React Query mutation
  const getApproved = (id, refreshView, slNo, api) => {
    setLoader(true);
    approvalActionMutation.mutate(
      { id, action: api, refreshView, slNo },
      {
        onSettled: () => setLoader(false),
      }
    );
  };

  const lastFileds = useMemo(
    () => [
      {
        type: "datetime",
        placeholder: isCheckInMode ? "Check-in Time" : "Registration Time",
        name: isCheckInMode ? "attendanceDate" : "createdAt",
        validation: "",
        default: "",
        label: isCheckInMode ? "Check-in Time" : "Registration Time",
        minimum: 0,
        maximum: 16,
        required: true,
        view: true,
        tag: false,
        export: false,
        sort: true,
      },
      // Add check-in filter when pageMode is "check-in" or "instance"
      ...(isCheckInMode
        ? [
            {
              type: "select",
              name: "registrationStatus",
              label: "Summary",
              filter: true,
              apiType: "JSON",
              filterType: "tabs",
              filterPosition: "right",
              filterDefault: "checked-in",
              selectApi: [
                { value: "Checked-in", id: "checked-in" },
                { value: "Pending to Check", id: "pending-to-check" },
              ],
            },
          ]
        : []),
    ],
    [isCheckInMode]
  );

  const formatArray = useCallback(
    (eventForm, ticket, countries, includeRegistrationId = true) => {
      if (!Array.isArray(eventForm)) return [];

      const formFields = eventForm.map((attribute) => {
        const formattedAttribute = { ...attribute };

        if (formattedAttribute.conditionEnabled) {
          formattedAttribute.condition = {
            item: formattedAttribute.conditionWhenField,
            if: formattedAttribute.conditionCheckMatch.includes(",") ? formattedAttribute.conditionCheckMatch.split(",") : [formattedAttribute.conditionCheckMatch],
            then: formattedAttribute.conditionIfMatch === "enabled" ? "enabled" : "disabled",
            else: formattedAttribute.conditionIfMatch === "enabled" ? "disabled" : "enabled",
          };
        }

        if (formattedAttribute.type === "select") {
          formattedAttribute.search = true;
          formattedAttribute.filter = true;
        } else {
          formattedAttribute.filter = false;
        }
        if (!["file", "image"].includes(formattedAttribute.name)) {
          formattedAttribute.sort = true;
        }

        if (formattedAttribute.type === "multiSelect") {
          if (formattedAttribute.apiType === "CSV") {
            formattedAttribute.selectApi = formattedAttribute.selectApi
              .toString()
              .split(",")
              .map((item) => ({
                id: item,
                value: item,
              }));
            formattedAttribute.apiType = "JSON";
          }
          formattedAttribute.default = "";
        }
        if (formattedAttribute.type === "email") {
          formattedAttribute.validation = "email";
        }
        if (["_id", "firstName", "authenticationId", "emailId"].includes(formattedAttribute.name)) {
          formattedAttribute.collection = "";
          if (formattedAttribute.name === "authenticationId" && countries) {
            formattedAttribute.countries = countries;
          }
          // Add image configuration for firstName field
          if (formattedAttribute.name === "firstName") {
            formattedAttribute.image = { field: "keyImage", collection: "", generateTextIcon: true };
          }
        } else {
          formattedAttribute.collection = "formData";
        }
        if (formattedAttribute.type === "mobilenumber" && countries) {
          let finalCountries = countries;
          const { countryLoadingType, country: selectedCountryIds } = formattedAttribute;

          if (countryLoadingType === "exclude" && selectedCountryIds?.length) {
            const excludedIds = new Set(selectedCountryIds.map(String));
            finalCountries = countries.filter((c) => !excludedIds.has(String(c._id)));
          } else if (countryLoadingType === "include") {
            if (selectedCountryIds?.length) {
              const includedIds = new Set(selectedCountryIds.map(String));
              finalCountries = countries.filter((c) => includedIds.has(String(c._id)));
            } else {
              finalCountries = [];
            }
          }

          formattedAttribute.countries = finalCountries.map((country) => ({
            phoneCode: country.phoneCode,
            title: country.title,
            flag: country.flag,
            PhoneNumberLength: country.PhoneNumberLength,
          }));
        }
        if (!formattedAttribute.tag) {
          formattedAttribute.tag = true;
        }

        formattedAttribute.showItem = formattedAttribute.name;
        formattedAttribute.update = true;
        formattedAttribute.placeholder = formattedAttribute.placeholder ?? formattedAttribute.label;
        if (!formattedAttribute.type === "title" && !formattedAttribute.type === "info") {
          formattedAttribute.tag = true;
          formattedAttribute.view = true;
        }
        formattedAttribute.export = true;
        return formattedAttribute;
      });

      const filteredFormFields = formFields.filter((field) => field.name !== "_id");

      return [...filteredFormFields, ...lastFileds];
    },
    [lastFileds]
  );

  // Ensure specific columns exist with correct labels and are rendered as tags
  const ensureStandardColumns = useCallback((fields) => {
    if (!Array.isArray(fields)) return [];

    const updated = fields.map((field) => {
      if (field?.name === "authenticationId") {
        return { ...field, label: "Phone Number", tag: true, view: true, export: true };
      }
      if (field?.name === "emailId") {
        return { ...field, label: "Work e-mail Address", tag: false, view: true, export: true };
      }
      if (field?.name === "firstName") {
        return { ...field, label: "First Name", description: { field: "emailId", type: "text", collection: "" }, tag: true, view: true, export: true };
      }
      if (field?.name === "lastName" || field?.name === "formData.name0101") {
        return { ...field, label: "Last Name", tag: true, view: true, export: true };
      }
      return field;
    });

    const has = (name) => updated.some((f) => f?.name === name);
    const addIfMissing = (name, label) => {
      if (!has(name)) {
        updated.splice(0, 0, {
          type: "text",
          placeholder: label,
          name,
          validation: "",
          label,
          collection: "",
          required: false,
          view: true,
          tag: true,
          export: true,
        });
      }
    };

    addIfMissing("firstName", "First Name");
    addIfMissing("lastName", "Last Name");
    addIfMissing("authenticationId", "Phone Number");
    addIfMissing("emailId", "Work e-mail Address");

    return updated;
  }, []);

  // Remove unwanted columns from the list table
  const filterOutColumns = useCallback((fields) => {
    if (!Array.isArray(fields)) return [];
    const EXCLUDED_LABELS = new Set([
      // "Last Name",
      "Breakout Session RSVP",
      "You're invited to attend the Private Session for C4IR Azerbaijan on AI and Energy. Please check if you'd like to RSVP.",
      "You're Invited to attend the private roundtable for Financing Nuclear Energy in ASEAN. Please check if you'd like to RSVP.",
      "Info",
    ]);
    return fields.filter((f) => f?.name !== "lastName" && f?.type !== "info" && !EXCLUDED_LABELS.has(String(f?.label || "").trim()));
  }, []);

  // Update event attributes when event form fields data changes
  useEffect(() => {
    // Set document title based on selected ticket
    const pageTitle = title;
    document.title = `${pageTitle} - EventHex Portal`;
    if (eventFormFields) {
      const fields = formatArray(eventFormFields, ticket, props?.openData?.data?.countries, true);

      const base = [
        {
          type: "text",
          placeholder: "Ticket",
          name: "showticket",
          validation: "",
          collection: "ticket",
          description: { field: "formattedTicketNumber", type: "text", collection: "" },
          showItem: "title",
          default: "",
          label: "Ticket",
          minimum: 0,
          maximum: 16,
          required: true,
          add: true,
          view: true,
          bulkUpload: true,
          tag: true,
        },
        {
          type: "datetime",
          placeholder: isCheckInMode ? "Check-in Time" : "Registration Time",
          name: isCheckInMode ? "attendanceDate" : "createdAt",
          validation: "",
          default: "",
          label: isCheckInMode ? "Check-in Time" : "Registration Time",
          collection: "",
          showItem: "",
          required: true,
          view: true,
          tag: true,
          export: true,
        },
      ];
      // Insert base fields at index 1 of the fields array
      const fieldsWithBase = filterOutColumns([...ensureStandardColumns(fields)]);
      fieldsWithBase.splice(3, 0, ...base);
      setEventAttributes(fieldsWithBase);
    }
  }, [eventFormFields, formatArray, title, eventId, selectedTab, ticketType, ticket, ensureStandardColumns, filterOutColumns, props?.openData?.data?.countries]);

  // Update attributes when ticket form data changes
  useEffect(() => {
    if (ticketFormData && selectedTab !== "all" && eventFormFields) {
      const { ticketData: ticket, eventForm, countries, response } = ticketFormData;
      const country = countries?.[0] ?? [];

      const baseFields = [
        {
          type: "hidden",
          placeholder: "PhoneNumberLength",
          name: "PhoneNumberLength",
          validation: "",
          showItem: "PhoneNumberLength",
          collection: "formData",
          default: country?.PhoneNumberLength,
          label: "PhoneNumberLength",
          minimum: 1,
          maximum: 40,
          required: false,
          bulkUpload: false,
          add: true,
          update: true,
          export: false,
          view: false,
        },
        {
          type: "hidden",
          placeholder: "phoneCode",
          name: "phoneCode",
          default: country?.phoneCode,
          validation: "",
          label: "phoneCode",
          minimum: 1,
          maximum: 40,
          required: false,
          add: true,
          bulkUpload: false,
          update: true,
          export: false,
          view: false,
        },
        {
          type: "hidden",
          placeholder: "event",
          name: "event",
          default: ticket?.event?._id,
          validation: "",
          label: "event",
          minimum: 1,
          maximum: 40,
          required: false,
          bulkUpload: false,
          add: true,
          export: false,
          view: false,
        },
        {
          type: "text",
          placeholder: "Ticket Number",
          name: "formattedTicketNumber",
          validation: "",
          default: "",
          label: "Ticket Number",
          collection: "",
          showItem: "",
          required: true,
          view: true,
          tag: true,
          export: true,
        },
        {
          type: "datetime",
          placeholder: isCheckInMode ? "Check-in Time" : "Registration Time",
          name: isCheckInMode ? "attendanceDate" : "createdAt",
          validation: "",
          default: "",
          label: isCheckInMode ? "Check-in Time" : "Registration Time",
          collection: "",
          showItem: "",
          required: true,
          view: true,
          tag: true,
          export: true,
        },
        {
          type: "hidden",
          placeholder: "ticketId",
          name: "ticket",
          default: selectedTab,
          validation: "",
          label: "ticketId",
          minimum: 1,
          maximum: 40,
          required: false,
          bulkUpload: false,
          add: true,
          export: false,
          view: false,
        },
        {
          type: "toggle",
          placeholder: "Send Registration Confirmation to User",
          footnote: "The user will receive a registration confirmation details via all the enabled communication channels!",
          name: "notifyUser",
          default: false,
          validation: "",
          label: "Send Registration Confirmation to User",
          required: false,
          view: true,
          add: true,
          update: true,
        },
        ...(needsApproval && pageMode === "registration"
          ? [
              {
                type: "select",
                name: "registrationStatus",
                label: "Status",
                filter: true,
                apiType: "JSON",
                filterType: "tabs",
                filterPosition: "right",
                filterDefault: "pending",
                selectApi: [
                  { value: "All", id: "all" },
                  { value: "Pending", id: "pending" },
                  { value: "Approved", id: "approved" },
                  { value: "Rejected", id: "rejected" },
                ],
              },
            ]
          : []),
        // Add check-in filter when pageMode is "check-in"
      ];

      // Use eventFormFields (event-level form fields) combined with ticket-specific response fields
      const additionalFields = filterOutColumns(ensureStandardColumns(formatArray([...(eventFormFields || []), ...(response || [])], ticket, countries, true)));

      setSubAttributes((prevAttributes) => {
        const newAttributes = [...additionalFields, ...baseFields];
        return JSON.stringify(prevAttributes) !== JSON.stringify(newAttributes) ? newAttributes : prevAttributes;
      });
    }
  }, [ticketFormData, selectedTab, needsApproval, filterOutColumns, ensureStandardColumns, formatArray, eventFormFields, pageMode]);

  // Updated actions array with the fixed resend confirmation functionality that matches Approval page
  // Only show Resend Confirmation and Badge buttons when selectedTab is "all"
  const actions = useMemo(() => {
    // Return check-in actions for check-in or instance mode
    if (isCheckInMode) {
      return [
        {
          element: "button",
          type: "callback",
          callback: (item, data, refreshView, slNo) => {
            // Mark participant as checked-in
            checkinUserMutation.mutate({ id: data._id, refreshView, slNo });
          },
          itemTitle: {
            name: "user",
            type: "text",
            collection: "",
          },
          icon: "checked",
          title: "Check-in",
          condition: {
            item: "attendance",
            if: "false",
            then: true,
            else: false,
          },
          params: {
            api: ``,
            parentReference: "",
            itemTitle: {
              name: "user",
              type: "text",
              collection: "",
            },
            shortName: "Mark Check-in",
            addPrivilege: true,
            delPrivilege: true,
            updatePrivilege: true,
            customClass: "medium",
          },
          actionType: "button",
        },
      ];
    }

    if (selectedTab !== "all") {
      return [
        {
          element: "button",
          type: "callback",
          callback: (item, data, refreshView, slNo) => {
            // Use the updated resendConfirmation function that matches Approval page pattern
            resendConfirmation(data._id, refreshView, slNo);
          },
          itemTitle: {
            name: "user",
            type: "text",
            collection: "",
          },
          icon: "send",
          title: "Resend Confirmation",
          params: {
            api: ``,
            parentReference: "",
            itemTitle: {
              name: "user",
              type: "text",
              collection: "",
            },
            shortName: "Resend Confirmation",
            addPrivilege: true,
            delPrivilege: true,
            updatePrivilege: true,
            customClass: "medium",
          },
        },
        {
          element: "button",
          type: "callback",
          callback: (item, data, refreshView, slNo) => {
            // Use the generateBadge function to download badge image
            generateBadge(data._id, refreshView, slNo);
          },
          itemTitle: {
            name: "user",
            type: "text",
            collection: "",
          },
          icon: "eye",
          title: "View Badge",
          params: {
            api: ``,
            parentReference: "",
            itemTitle: {
              name: "user",
              type: "text",
              collection: "",
            },
            shortName: "View Badge",
            addPrivilege: true,
            delPrivilege: true,
            updatePrivilege: true,
            customClass: "medium",
          },
        },
        ...(needsApproval
          ? [
              {
                element: "button",
                type: "callback",
                actionType: "button",
                callback: (item, data, refreshView, slNo) => {
                  getApproved(data._id, refreshView, slNo, "approve");
                },
                condition: {
                  item: "approve",
                  if: "true",
                  then: false,
                  else: true,
                },
                icon: "checked",
                title: "Approve",
                params: {
                  api: ``,
                  parentReference: "",
                  itemTitle: { name: "user", type: "text", collection: "" },
                  shortName: "Approve",
                  addPrivilege: true,
                  delPrivilege: true,
                  updatePrivilege: true,
                  customClass: "medium",
                },
              },
              {
                element: "button",
                type: "callback",
                actionType: "button",
                callback: (item, data, refreshView, slNo) => {
                  getApproved(data._id, refreshView, slNo, "reject");
                },
                condition: {
                  item: "reject",
                  if: "true",
                  then: false,
                  else: true,
                },
                icon: "close",
                title: "Reject",
                params: {
                  api: ``,
                  parentReference: "",
                  itemTitle: { name: "user", type: "text", collection: "" },
                  shortName: "Reject",
                  addPrivilege: true,
                  delPrivilege: true,
                  updatePrivilege: true,
                  customClass: "medium",
                },
              },
              {
                element: "button",
                type: "callback",
                callback: (item, data, refreshView, slNo) => {
                  getApproved(data._id, refreshView, slNo, "resend");
                },
                icon: "message",
                title: "Resend",
                params: {
                  api: ``,
                  parentReference: "",
                  itemTitle: { name: "user", type: "text", collection: "" },
                  shortName: "Resend Confirmation",
                  addPrivilege: true,
                  delPrivilege: true,
                  updatePrivilege: true,
                  customClass: "medium",
                },
              },
            ]
          : []),
      ];
    }
    return []; // Return empty array when not in "all" tab
  }, [selectedTab, pageMode, needsApproval, checkinUserMutation]);

  // Optimized bulk resend confirmation using React Query mutation
  const resendAllConfirmation = async (ticketId) => {
    return new Promise((resolve) => {
      bulkResendMutation.mutate(
        { ticketId },
        {
          onSuccess: () => resolve(false),
          onError: () => resolve(false),
        }
      );
    });
  };

  // Don't render until component is ready
  if (!isComponentReady || shimmerLoader || eventFormFieldsLoading) {
    return <ListTableSkeleton viewMode={"table"} displayColumn={5} tableColumnCount={5} />;
  }

  // For non-"all" tabs, we don't need to check needsApproval as it can be undefined
  // The component should render regardless of needsApproval status
  // return (
  //   <pre>
  //     <p>{isExhibitorTab ? "exhibitorAttributes" : selectedTab === "all" ? "eventAttributes" : "attributes"}</p>
  //     <ul>
  //       {(isExhibitorTab ? exhibitorAttributes : selectedTab === "all" ? eventAttributes : attributes)?.map((f) => (
  //         <li>{f.label}</li>
  //       ))}
  //     </ul>
  //   </pre>
  // );
  return (
    <>
      {((selectedTab !== "all" && (attributes?.length || isExhibitorTab)) || (selectedTab === "all" && eventAttributes.length > 0)) && (
        <div className="w-full position-relative">
          <ListTable
            actions={actions}
            api={isExhibitorTab ? "ticket-registration/exhibitor" : `ticket-registration/${selectedTab}`}
            key={`${selectedTab}-${ticket?._id || "loading"}-${needsApproval || "no-approval"}`}
            itemTitle={{ name: isExhibitorTab ? "companyName" : "fullName", type: "text", collection: isExhibitorTab ? "" : "authentication" }}
            shortName={selectedTab === "all" ? title : isExhibitorTab ? "Exhibitors" : `${title || "Ticket"}`}
            addLabel={{ label: "Add New", icon: "add" }}
            bulkUploadLabel={{ label: "Bulk Upload", icon: "upload" }}
            dotMenu={true}
            formMode={`single`}
            preFilter={
              isExhibitorTab
                ? { event: eventId }
                : selectedTab === "all"
                  ? {
                      event: eventId,
                      pageMode: pageMode,
                      ...(needsApproval && { needsApproval: "true" }),
                    }
                  : {
                      ticket: selectedTab,
                      event: eventId,
                      pageMode: pageMode,
                      ...(needsApproval && { needsApproval: "true" }),
                    }
            }
            parents={isExhibitorTab ? { event: eventId } : selectedTab === "all" ? { event: eventId, type: ticketType } : { type: ticketType, event: eventId }}
            bulkUplaod={isCheckInMode ? false : isExhibitorTab ? false : selectedTab === "all" ? false : true}
            delPrivilege={isCheckInMode ? false : isExhibitorTab ? true : selectedTab === "all" ? false : true}
            addPrivilege={isCheckInMode ? false : isExhibitorTab ? true : selectedTab === "all" ? false : true}
            updatePrivilege={isCheckInMode ? false : isExhibitorTab ? true : selectedTab === "all" ? false : true}
            additionalButtons={
              isCheckInMode || selectedTab === "all"
                ? []
                : [
                    {
                      element: "button",
                      icon: "send",
                      type: "callback",
                      label: "Resend All Confirmation",
                      onClick: (referenceId, parents, filterView) => {
                        props.setMessage({
                          type: 2,
                          content: `Do you want to resend all confirmation messages for this ticket?`,
                          proceed: "Resend All",
                          onProceed: async (data) => {
                            console.log("Resend All Confirmation", data);
                            return await resendAllConfirmation(data.ticketId, data.referenceId);
                          },
                          data: { ticketId: filterView.ticket, referenceId: referenceId },
                          title: "Resend All Confirmation",
                        });
                      },
                    },
                  ]
            }
            exportPrivilege={true}
            viewMode={"table"}
            rowLimit={25}
            name={selectedTab + id}
            labels={
              isExhibitorTab
                ? [
                    { key: "Total Exhibitors", title: "TOTAL EXHIBITORS", icon: "exhibitor", backgroundColor: "rgba(0, 200, 81, 0.15)", color: "#006B27" },
                    { key: "Active Exhibitors", title: "ACTIVE EXHIBITORS", icon: "check", backgroundColor: "rgba(0, 122, 255, 0.15)", color: "#004999" },
                    { key: "Total Booths", title: "TOTAL BOOTHS", icon: "location", backgroundColor: "rgba(255, 69, 58, 0.15)", color: "#99231B" },
                    { key: "Categories", title: "CATEGORIES", icon: "category", backgroundColor: "rgba(88, 86, 214, 0.15)", color: "#2B2A69" },
                  ]
                : isCheckInMode
                  ? [
                      { key: "checkIn", title: "NO OF CHECK-IN", icon: "check-in", backgroundColor: "rgba(0, 200, 81, 0.15)", color: "#006B27" },
                      { key: "pending", title: "PENDING", icon: "pending", backgroundColor: "rgba(255, 69, 58, 0.15)", color: "#99231B" },
                      { key: "checkInRate", title: "CHECK-IN RATE", icon: "check-in-rate", backgroundColor: "rgba(0, 122, 255, 0.15)", color: "#004999" },
                      { key: "noShow", title: "NO-SHOW RATE", icon: "no-show", backgroundColor: "rgba(153, 153, 6, 0.15)", color: "#856404" },
                    ]
                  : [
                      { key: "Total Registrations", title: "TOTAL REGISTRATIONS", icon: "registration", backgroundColor: "rgba(0, 200, 81, 0.15)", color: "#006B27" },
                      ...(needsApproval
                        ? [
                            { key: "Pending", title: "PENDING APPROVAL", icon: "pending", backgroundColor: "rgba(153, 153, 6, 0.15)", color: "#856404" },
                            { key: "Rejected", title: "REJECTED", icon: "close", backgroundColor: "rgba(255, 69, 58, 0.15)", color: "#99231B" },
                            { key: "Approved", title: "APPROVED", icon: "checked", backgroundColor: "rgba(0, 200, 81, 0.15)", color: "#006B27" },
                          ]
                        : [
                            { key: "Today's Registrations", title: "TODAY'S REGISTRATIONS", icon: "date", backgroundColor: "rgba(0, 122, 255, 0.15)", color: "#004999" },
                            { key: "Total Ticket Amount", title: "TOTAL TICKET AMOUNT", icon: "currency", backgroundColor: "rgba(255, 69, 58, 0.15)", color: "#99231B" },
                          ]),
                    ]
            }
            {...props}
            attributes={isExhibitorTab ? exhibitorAttributes : selectedTab === "all" ? eventAttributes : attributes}
            openPage={false}
            itemOpenMode={null}
          />
          {loader && <Loader position="absolute" />}
        </div>
      )}
    </>
  );
};

export default Layout(Attendee);
