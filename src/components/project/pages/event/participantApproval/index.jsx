import React, { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../../../../core/layout";
import ListTable from "../../../../core/list/list";
import { getData, postData } from "../../../../../backend/api";
import ListTableSkeleton from "../../../../core/loader/shimmer";
import Loader from "../../../../core/loader";
import { useToast } from "../../../../core/toast/ToastContext.jsx";

const Approval = (props) => {
  const { id } = props;
  const toast = useToast();
  const [shimmerLoader, setShimmerLoader] = useState(false);
  const [loader, setLoader] = useState(false);
  const [approvalCountData, setApprovalCountData] = useState(null);
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);

  const [actions] = useState([
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
  ]);

  const eventId = props?.openData?.data?._id;
  console.log("props", props);
  const { title } = props;
  const ticketType = "ParticipantType";
  const [selectedTab, setSelectedTab] = useState("all");
  const [ticket, setTicket] = useState(null);
  const [attributes, setSubAttributes] = useState(null);
  const [eventAttributes, setEventAttributes] = useState([]);

  const lastFileds = useMemo(
    () => [
      {
        type: "datetime",
        placeholder: "Registration Time",
        name: "createdAt",
        validation: "",
        default: "",
        label: "Registration Time",
        minimum: 0,
        maximum: 16,
        required: true,
        view: true,
        tag: true,
        export: false,
        sort: true,
      },
      {
        type: "select",
        name: "approve",
        label: "Status",
        filter: true,
        apiType: "JSON",
        filterType: "tabs",
        filterPosition: "right",
        selectApi: [
          { value: "All", id: "" },
          { value: "Pending", id: false },
          { value: "Approved", id: true },
          { value: "Rejected", id: "rejected" },
        ],
      },
    ],
    []
  );

  const formatArray = useCallback(
    (eventForm, ticket) => {
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

        if (["firstName", "authenticationId", "emailId"].includes(formattedAttribute.name)) {
          formattedAttribute.collection = "";
          if (formattedAttribute.name === "authenticationId" && ticket?.event?.countries) {
            formattedAttribute.countries = ticket.event.countries;
          }
        } else {
          formattedAttribute.collection = "formData";
        }

        formattedAttribute.showItem = formattedAttribute.name;
        formattedAttribute.update = true;
        if (!formattedAttribute.type === "title" && !formattedAttribute.type === "info") {
          formattedAttribute.tag = true;
          formattedAttribute.view = true;
        }
        formattedAttribute.export = true;

        return formattedAttribute;
      });

      return [...formFields, ...lastFileds];
    },
    [lastFileds]
  );

  useEffect(() => {
    document.title = `${title} - EventHex Portal`;
    getData({ event: props?.openData?.data?._id }, "event-form-fields").then((response) => {
      const fields = formatArray(response?.data?.response);
      const base = [
        {
          type: "select",
          footnote: "",
          placeholder: "Choose Ticket",
          clearable: false,
          name: "ticket",
          validation: "",
          label: "Select Ticket",
          showItem: "value",
          filterPosition: "left",
          default: "all",
          value: "all",
          preFill: [{ id: "all", value: "All" }],
          required: false,
          filterType: "main",
          view: false,
          filter: true,
          add: false,
          update: true,
          apiType: "API",
          selectApi: "ticket/select-with-participant-type/" + eventId + "/" + ticketType,
          parentFilter: true,
          export: false,
        },
        {
          type: "text",
          placeholder: "Ticket",
          name: "showticket",
          validation: "",
          collection: "ticket",
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
      ];
      setEventAttributes([...base, ...fields]);
    });
  }, [props?.openData?.data?._id, formatArray, title, eventId, selectedTab, ticketType]);

  // Fetch approval counts when event changes
  useEffect(() => {
    const fetchApprovalCounts = async () => {
      if (!eventId) {
        return;
      }

      setIsLoadingCounts(true);
      try {
        // Fetch counts for different approval statuses - only for tickets that need approval and have participantType
        const [allResponse, pendingResponse, approvedResponse, rejectedResponse] = await Promise.all([
          getData({ event: eventId, type: ticketType }, "ticket-registration/participant-approval"),
          getData({ event: eventId, approve: false, type: ticketType }, "ticket-registration/participant-approval"),
          getData({ event: eventId, approve: true, type: ticketType }, "ticket-registration/participant-approval"),
          getData({ event: eventId, approve: "rejected", type: ticketType }, "ticket-registration/participant-approval"),
        ]);

        const counts = {
          all: allResponse?.data?.response?.length || 0,
          pending: pendingResponse?.data?.response?.length || 0,
          approved: approvedResponse?.data?.response?.length || 0,
          rejected: rejectedResponse?.data?.response?.length || 0,
        };

        setApprovalCountData(counts);
      } catch (error) {
        console.error("[Approval Page] Error fetching approval counts:", error);
        toast.error("Error loading approval statistics");
      } finally {
        setIsLoadingCounts(false);
      }
    };

    fetchApprovalCounts();
  }, [eventId, toast]);

  const UpdateFields = async (ticketId) => {
    setShimmerLoader(true);
    try {
      const response = await getData({ ticket: ticketId, eventId }, "ticket-form-data");
      const { ticketData: ticket, eventForm } = response.data;
      const country = ticket.event.countries[0] ?? [];
      setTicket(ticket);
      if (response.status === 200) {
        // Get the same form fields that are used for "All" selection
        const formFieldsResponse = await getData({ event: eventId }, "event-form-fields");
        const fields = formatArray(formFieldsResponse?.data?.response);

        const baseFields = [
          {
            type: "select",
            footnote: "",
            placeholder: "Choose Ticket",
            clearable: false,
            name: "ticket",
            validation: "",
            default: ticketId,
            value: ticketId,
            label: "Select Ticket",
            filterPosition: "left",
            showItem: "value",
            required: false,
            preFill: [{ id: "all", value: "All" }],
            view: true,
            tag: false,
            filter: true,
            filterType: "main",
            add: false,
            update: false,
            apiType: "API",
            selectApi: "ticket/select-with-participant-type/" + eventId + "/" + ticketType,
            parentFilter: true,
            export: false,
          },
          {
            type: "text",
            placeholder: "Ticket",
            name: "showticket",
            validation: "",
            collection: "ticket",
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
            type: "hidden",
            placeholder: "PhoneNumberLength",
            name: "PhoneNumberLength",
            validation: "",
            showItem: "PhoneNumberLength",
            collection: "formData",
            default: country.PhoneNumberLength,
            label: "PhoneNumberLength",
            minimum: 1,
            maximum: 40,
            required: false,
            add: true,
            update: true,
            export: false,
            view: false,
          },
          {
            type: "hidden",
            placeholder: "phoneCode",
            name: "phoneCode",
            default: country.phoneCode,
            validation: "",
            label: "phoneCode",
            minimum: 1,
            maximum: 40,
            required: false,
            add: true,
            update: true,
            export: false,
            view: false,
          },
          {
            type: "hidden",
            placeholder: "event",
            name: "event",
            default: ticket.event._id,
            validation: "",
            label: "event",
            minimum: 1,
            maximum: 40,
            required: false,
            add: true,
            export: false,
            view: false,
          },
          {
            type: "text",
            placeholder: "Token",
            name: "token",
            validation: "",
            default: "",
            label: "Token",
            collection: "",
            showItem: "",
            required: true,
            view: true,
            tag: true,
            export: true,
          },
        ];

        // Use the same fields as "All" selection but with the specific ticket selected
        const additionalFields = formatArray([...(ticket.type === "Form" ? [] : eventForm), ...response.data.response], response.data.ticketData);

        setSubAttributes((prevAttributes) => {
          const newAttributes = [...baseFields, ...fields, ...additionalFields];
          // Only update if new attributes are different
          return JSON.stringify(prevAttributes) !== JSON.stringify(newAttributes) ? newAttributes : prevAttributes;
        });
      }
    } catch (error) {
      console.error("Error fetching ticket data:", error);
    } finally {
      setShimmerLoader(false);
    }
  };

  const getApproved = (id, refreshView, slNo, api) => {
    setLoader(true);
    postData({ id }, `authentication/${api}`)
      .then((response) => {
        setLoader(false);
        if (response.status === 200) {
          if (response.data) {
            props.setMessage({
              type: 1,
              content: response.data.message,
              icon: "success",
            });
            if (api === "approve") {
              refreshView(false, slNo, { approve: true });
            } else if (api === "reject") {
              refreshView(false, slNo, { approve: "rejected" });
            }

            // Refresh approval counts after status change
            setTimeout(() => {
              const fetchApprovalCounts = async () => {
                if (!eventId) return;

                try {
                  const [allResponse, pendingResponse, approvedResponse, rejectedResponse] = await Promise.all([
                    getData({ event: eventId, type: ticketType }, "ticket-registration/participant-approval"),
                    getData({ event: eventId, approve: false, type: ticketType }, "ticket-registration/participant-approval"),
                    getData({ event: eventId, approve: true, type: ticketType }, "ticket-registration/participant-approval"),
                    getData({ event: eventId, approve: "rejected", type: ticketType }, "ticket-registration/participant-approval"),
                  ]);

                  const counts = {
                    all: allResponse?.data?.response?.length || 0,
                    pending: pendingResponse?.data?.response?.length || 0,
                    approved: approvedResponse?.data?.response?.length || 0,
                    rejected: rejectedResponse?.data?.response?.length || 0,
                  };

                  setApprovalCountData(counts);
                } catch (error) {
                  console.error("Error refreshing approval counts:", error);
                }
              };

              fetchApprovalCounts();
            }, 1000); // Small delay to ensure the database is updated
          } else {
            // Handle the case where response.data is undefined
            console.error("Response data is undefined.");
          }
        } else {
          props.setMessage({
            type: 1,
            content: response.data.customMessage,
            icon: "error",
          });
        }
      })
      .catch((error) => {
        setLoader(false);
        // Handle any errors that occur during the API request
        console.error("API request error:", error);
      });
  };

  return shimmerLoader ? (
    <ListTableSkeleton viewMode={"table"} displayColumn={5} tableColumnCount={5} />
  ) : (
    ((selectedTab !== "all" && attributes?.length) || (eventAttributes.length > 0 && selectedTab === "all")) && (
      <div className="w-full position-relative">
        <ListTable
          api={selectedTab === "all" ? "ticket-registration/participant-approval" : `ticket-registration/participant-approval`}
          key={`${selectedTab}`}
          itemTitle={{
            name: "fullName",
            type: "text",
            collection: "authentication",
          }}
          // showFilter={true}
          shortName={selectedTab === "all" ? title : `${ticket.title}`}
          onFilter={async (data) => {
            if (data.ticket !== selectedTab) {
              await UpdateFields(data.ticket);
              setSelectedTab(data.ticket);
            }
          }}
          formMode={`single`}
          preFilter={selectedTab === "all" ? { event: eventId, type: ticketType } : { ticket: selectedTab, event: eventId, type: ticketType }}
          parents={selectedTab === "all" ? { event: eventId, type: ticketType } : { type: ticketType, ticket: selectedTab, event: eventId }}
          bulkUplaod={false}
          delPrivilege={false}
          addPrivilege={false}
          updatePrivilege={false}
          exportPrivilege={true}
          viewMode={"table"}
          dotMode={true}
          name={selectedTab + id}
          actions={actions}
          labels={[
            {
              key: "Total Registrations",
              title: "ALL REGISTRATIONS",
              icon: "all",
              backgroundColor: "rgba(0, 122, 255, 0.15)",
              color: "#004999",
            },
            {
              key: "Pending",
              title: "PENDING",
              icon: "pending",
              backgroundColor: "rgba(153, 153, 6, 0.15)",
              color: "#856404",
            },
            {
              key: "Approved",
              title: "APPROVED",
              icon: "checked",
              backgroundColor: "rgba(0, 200, 81, 0.15)",
              color: "#006B27",
            },
            {
              key: "Rejected",
              title: "REJECTED",
              icon: "close",
              backgroundColor: "rgba(255, 69, 58, 0.15)",
              color: "#99231B",
            },
          ]}
          {...props}
          attributes={selectedTab === "all" ? eventAttributes : attributes}
          openPage={false}
          itemOpenMode={null}
        />
        {loader && <Loader position="absolute" />}
      </div>
    )
  );
};

export default Layout(Approval);
