import React, { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../../../../core/layout/index.jsx";
import ListTable from "../../../../core/list/list.jsx";
import { getData, postData } from "../../../../../backend/api/index.js";
import ListTableSkeleton from "../../../../core/loader/shimmer.jsx";
import Loader from "../../../../core/loader/index.jsx";
import { Calendar, DollarSign, UserPlus, Ticket } from "lucide-react";
import { useToast } from "../../../../core/toast/ToastContext.jsx";
import { exhibitorAttributes } from "../attributes/exhibitor/index.js";

const Attendee = (props) => {
  const { id } = props;
  const [shimmerLoader, setShimmerLoader] = useState(false);
  const [loader, setLoader] = useState(false);
  const eventId = props?.openData?.data?._id;
  const { title, ticketType } = props;
  const [selectedTab, setSelectedTab] = useState("all");
  const [ticket, setTicket] = useState(null);
  const [attributes, setSubAttributes] = useState(null);
  const [eventAttributes, setEventAttributes] = useState([]);
  const toast = useToast();
  const [dashboardCountData, setDashboardCountData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if the selected tab is an exhibitor
  const isExhibitorTab = useMemo(() => {
    if (selectedTab === "all") return false;

    const isExhibitor =
      ticket?.participantTypeName === "Exhibitor" || ticket?.participantType?.name === "Exhibitor" || ticket?.title?.toLowerCase().includes("exhibitor") || ticket?.title === "Exhibitor";

    return isExhibitor;
  }, [selectedTab, ticket]);

  // Debug effect to log when isExhibitorTab changes
  useEffect(() => {}, [isExhibitorTab, ticket]);

  // Approval function
  const getApproved = async (itemId, refreshView, slNo, action) => {
    try {
      // Add your approval API call here
      const response = await getData(
        {
          id: itemId,
          action: action,
          event: eventId,
        },
        "approve-registration" // Replace with your actual API endpoint
      );

      if (response.status === 200) {
        toast.success(`Registration ${action}d successfully`);
        refreshView(); // Refresh the table data
      } else {
        toast.error(`Failed to ${action} registration`);
      }
    } catch (error) {
      console.error(`Error during ${action}:`, error);
      toast.error(`Error during ${action}`);
    }
  };

  // Updated resend confirmation function to match Approval page pattern
  const resendConfirmation = (id, refreshView, slNo) => {
    setLoader(true);
    postData({ id }, `authentication/resend-confirmation`)
      .then((response) => {
        setLoader(false);
        if (response.status === 200) {
          if (response.data) {
            props.setMessage({
              type: 1,
              content: response.data.message || "Confirmation sent successfully via WhatsApp and Email!",
              icon: "success",
            });
            // Optional: refresh the view if needed
            // refreshView();
          } else {
            console.error("Response data is undefined.");
          }
        } else {
          props.setMessage({
            type: 1,
            content: response.data?.customMessage || "Failed to send confirmation",
            icon: "error",
          });
        }
      })
      .catch((error) => {
        setLoader(false);
        console.error("API request error:", error);
        props.setMessage({
          type: 1,
          content: "Error sending confirmation",
          icon: "error",
        });
      });
  };

  // Fetch dashboard counts when event changes
  useEffect(() => {
    const fetchDashboardCounts = async () => {
      if (!eventId) {
        console.log("[Registrations Page] No event ID found, skipping dashboard counts fetch");
        return;
      }

      setIsLoading(true);
      try {
        console.log("[Registrations Page] Fetching dashboard counts for event:", eventId);
        const response = await getData({ event: eventId }, "dashboard");

        if (response.status === 200) {
          console.log("[Registrations Page] Dashboard counts fetched successfully:", response.data);
          setDashboardCountData(response.data || []);
        } else {
          console.error("[Registrations Page] Failed to fetch dashboard counts:", response);
          toast.error("Failed to load dashboard statistics");
        }
      } catch (error) {
        console.error("[Registrations Page] Error fetching dashboard counts:", error);
        toast.error("Error loading dashboard statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardCounts();
  }, [eventId, toast]);

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
    ],
    []
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

  useEffect(() => {
    document.title = `${title} - EventHex Portal`;
    getData({ event: props?.openData?.data?._id }, "event-form-fields").then((response) => {
      const fields = formatArray(response?.data?.response, ticket, props?.openData?.data?.countries, true);
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
          preFill: [
            {
              id: "all",
              value: "All",
            },
          ],
          required: false,
          view: false,
          filter: true,
          add: false,
          update: true,
          apiType: "API",
          selectApi: "ticket/select/" + eventId + "/" + ticketType,
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

  const UpdateFields = async (ticketId) => {
    setShimmerLoader(true);
    try {
      console.log("[Registrations Page] UpdateFields called with ticketId:", ticketId);
      const response = await getData({ ticket: ticketId, eventId }, "ticket-form-data");
      const { ticketData: ticket, eventForm, countries } = response.data;
      console.log("[Registrations Page] Ticket data received:", ticket);
      const country = countries[0] ?? [];
      setTicket(ticket);
      if (response.status === 200) {
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
            preFill: [
              {
                id: "all",
                value: "All",
              },
            ],
            view: false,
            tag: false,
            filter: true,
            filterType: "main",
            add: false,
            update: false,
            apiType: "API",
            selectApi: "ticket/select/" + eventId + "/" + ticketType,
            parentFilter: true,
            export: false,
          },
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
          {
            type: "hidden",
            placeholder: "ticketId",
            name: "ticket",
            default: ticketId,
            validation: "",
            label: "ticketId",
            minimum: 1,
            maximum: 40,
            required: false,
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
        ];

        const additionalFields = formatArray([...(ticket.type === "Form" ? [] : eventForm), ...response.data.response], ticket, countries, true);

        setSubAttributes((prevAttributes) => {
          const newAttributes = [...additionalFields, ...baseFields];
          return JSON.stringify(prevAttributes) !== JSON.stringify(newAttributes) ? newAttributes : prevAttributes;
        });
      }
    } catch (error) {
      console.error("Error fetching ticket data:", error);
    } finally {
      setShimmerLoader(false);
    }
  };

  // Updated actions array with the fixed resend confirmation functionality that matches Approval page
  // Only show Resend Confirmation button when selectedTab is "all"
  const actions = useMemo(() => {
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
      ];
    }
    return []; // Return empty array when not in "all" tab
  }, [selectedTab]);

  const resendAllConfirmation = async (ticketId) => {
    props.setLoaderBox(true);
    try {
      const response = await postData({ ticketId }, `authentication/bulk-resend`);

      console.log("Resend All Confirmation Response", response);

      if (response.status === 200) {
        props.setMessage({
          type: 1,
          content: response.data?.message || "Confirmation sent successfully!",
          icon: "success",
        });
        return false;
      } else {
        props.setMessage({
          type: 1,
          content: response.data?.message || response.customMessage || "Error sending confirmation",
          icon: "error",
        });
        return false;
      }
    } catch (error) {
      console.error("Resend All Confirmation Error", error);
      props.setMessage({
        type: 1,
        content: error.message || "Error sending confirmation",
        icon: "error",
      });
      return false;
    } finally {
      props.setLoaderBox(false);
    }
  };

  return shimmerLoader ? (
    <ListTableSkeleton viewMode={"table"} displayColumn={5} tableColumnCount={5} />
  ) : (
    <>
      {((selectedTab !== "all" && attributes?.length) || (eventAttributes.length > 0 && selectedTab === "all")) && (
        <div className="w-full position-relative">
          <ListTable
            actions={actions}
            api={isExhibitorTab ? "ticket-registration/exhibitor" : `ticket-registration/${selectedTab}`}
            key={`${selectedTab}`}
            itemTitle={{ name: isExhibitorTab ? "companyName" : "fullName", type: "text", collection: isExhibitorTab ? "" : "authentication" }}
            shortName={selectedTab === "all" ? title : isExhibitorTab ? "Exhibitors" : `${ticket?.title || "Ticket"}`}
            addLabel={{ label: "Add New", icon: "add" }}
            bulkUploadLabel={{ label: "Bulk Upload", icon: "upload" }}
            onFilter={async (data) => {
              if (data.ticket !== selectedTab) {
                await UpdateFields(data.ticket);
                setSelectedTab(data.ticket);
              }
            }}
            dotMenu={true}
            formMode={`single`}
            preFilter={isExhibitorTab ? { event: eventId } : selectedTab === "all" ? { event: eventId } : { ticket: selectedTab, event: eventId }}
            parents={isExhibitorTab ? { event: eventId } : selectedTab === "all" ? { event: eventId, type: ticketType } : { type: ticketType, event: eventId }}
            bulkUplaod={isExhibitorTab ? false : selectedTab === "all" ? false : true}
            delPrivilege={isExhibitorTab ? true : selectedTab === "all" ? false : true}
            addPrivilege={isExhibitorTab ? true : selectedTab === "all" ? false : true}
            updatePrivilege={isExhibitorTab ? true : selectedTab === "all" ? false : true}
            additionalButtons={
              selectedTab === "all"
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
                : [
                    { key: "Total Registrations", title: "TOTAL REGISTRATIONS", icon: "registration", backgroundColor: "rgba(0, 200, 81, 0.15)", color: "#006B27" },
                    { key: "Today's Registrations", title: "TODAY'S REGISTRATIONS", icon: "date", backgroundColor: "rgba(0, 122, 255, 0.15)", color: "#004999" },
                    { key: "Total Ticket Amount", title: "TOTAL TICKET AMOUNT", icon: "currency", backgroundColor: "rgba(255, 69, 58, 0.15)", color: "#99231B" },
                    // {
                    //   key: "Average Ticket Amount",
                    //   title: "AVG TICKET AMOUNT",
                    //   icon: "ticket",
                    //   backgroundColor: "rgba(88, 86, 214, 0.15)",
                    //   color: "#2B2A69",
                    // },
                  ]
            }
            {...props}
            attributes={
              isExhibitorTab
                ? [
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
                      default: selectedTab,
                      value: selectedTab,
                      preFill: [{ id: "all", value: "All" }],
                      required: false,
                      view: false,
                      filter: true,
                      add: false,
                      update: true,
                      apiType: "API",
                      selectApi: "ticket/select/" + eventId + "/" + ticketType,
                      parentFilter: true,
                      export: false,
                    },
                    ...exhibitorAttributes,
                  ]
                : selectedTab === "all"
                  ? eventAttributes
                  : attributes
            }
          />
          {loader && <Loader position="absolute" />}
        </div>
      )}
    </>
  );
};

export default Layout(Attendee);
