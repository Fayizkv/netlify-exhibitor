import React from "react";
import { COMPARE_TYPES } from "../../../../../core/functions/conditions";
import { GetIcon } from "../../../../../../icons";

export const instanceAttributes = [
  {
    type: "text",
    placeholder: "Instance Name",
    name: "title",
    validation: "",
    default: "",
    label: "Instance Name",
    tag: true,
    required: false,
    view: true,
    add: true,
    update: true,
    icon: "text",
    render: (value, rowData, attribute, props) => {
      return React.createElement(
        "div",
        null,
        // Main container with icon and title
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: "12px" } },
          // Image avatar component
          React.createElement(
            "div",
            {
              style: {
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#deebff", // Light blue background
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                position: "relative",
                overflow: "hidden",
              },
            },
            // Instance icon inside the circle
            React.createElement(
              "div",
              {
                style: {
                  color: "#4876b6", // Blue icon color
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                },
              },
              React.createElement(GetIcon, { icon: "instance" })
            )
          ),
          // Instance title
          React.createElement("div", { className: "font-medium text-gray-900", style: { fontWeight: "600" } }, value)
        )
      );
    },
  },
  {
    type: "select",
    placeholder: "Applicable Tickets",
    name: "ticketType",
    validation: "",
    tag: false,
    editable: true,
    default: "All Tickets",
    label: "Who Can Attend?",
    sublabel: "",
    showItem: "",
    required: false,
    customClass: "full",
    filter: false,
    view: true,
    add: true,
    update: true,
    apiType: "JSON",
    selectType: "card",
    selectApi: [
      { value: "All Tickets", id: 0, description: "Everyone with any ticket type can join" },
      { value: "Selected Tickets & Participant types", id: 1, description: "Limit access to specific ticket types only" },
    ],
    icon: "user-group",
    onChange: (fieldName, formValues, formType) => {
      // Update hasTicketsSelected based on ticketType selection
      const isSelectedTickets = formValues.ticketType === 1;
      const hasTickets = isSelectedTickets && formValues.ticket && formValues.ticket.length > 0;
      return {
        ...formValues,
        hasTicketsSelected: hasTickets,
      };
    },
  },
  {
    type: "info",
    content: "The all users can enroll this instance",
    add: true,
    update: true,
    condition: {
      item: "ticketType",
      if: 0,
      then: "enabled",
      else: "disabled",
    },
  },
  {
    type: "multiSelect",
    apiType: "API",
    selectApi: "ticket/event-ticket",
    placeholder: "Choose Ticket",
    name: "ticket",
    label: "Selected Ticket",
    updateOn: "event",
    showItem: "title",
    validation: "",
    condition: {
      item: "ticketType",
      if: 1,
      then: "enabled",
      else: "disabled",
    },
    onChange: (fieldName, formValues, formType) => {
      // Update hasTicketsSelected based on ticket selection
      const hasTickets = formValues.ticket && formValues.ticket.length > 0;
      return {
        ...formValues,
        hasTicketsSelected: hasTickets,
      };
    },
    tag: false,
    required: false,
    view: false,
    add: true,
    update: true,
    filter: false,
    export: false,
    footnote: "",
    icon: "ticket",
  },
  {
    type: "multiSelect",
    apiType: "API",
    selectApi: "ticket/event-ticket",
    placeholder: "Choose Ticket",
    name: "ticket",
    label: "Applicable Tickets",
    updateOn: "event",
    showItem: "title",
    validation: "",
    tag: true,
    required: false,
    view: true,
    add: false,
    update: false,
    filter: false,
    export: false,
    footnote: "",
    icon: "ticket",
    render: (value, rowData) => {
      // Required list format: "All Tickets" OR comma-separated ticket titles
      if (rowData?.ticketType === "All Tickets" || rowData?.ticketType === 0 || rowData?.ticketType === "0") {
        return "All Tickets";
      }
      if (typeof rowData?.displayTickets === "string" && rowData.displayTickets.trim().length > 0) {
        return rowData.displayTickets;
      }
      if (Array.isArray(rowData?.ticket) && rowData.ticket.length > 0) {
        const titles = rowData.ticket.map((t) => (typeof t === "object" ? t.title : t)).filter(Boolean);
        return titles.join(", ");
      }
      return "--";
    },
  },
  {
    type: "select",
    apiType: "API",
    selectApi: "ticket/event-ticket",
    placeholder: "Ticket",
    name: "ticket",
    label: "Ticket",
    updateOn: "event",
    showItem: "title",
    validation: "",
    tag: false,
    required: false,
    view: false,
    add: false,
    update: false,
    filter: true,
    export: false,
    footnote: "",
    icon: "ticket",
  },
  {
    type: "hidden",
    name: "hasTicketsSelected",
    default: false,
    add: true,
    update: true,
  },
  {
    type: "multiSelect",
    apiType: "API",
    selectApi: "instance/registered-users/select",
    placeholder: "Select Users",
    name: "users",
    label: "Selected Users",
    updateOn: "ticket",
    showItem: "value",
    validation: "",
    params: [{ name: "event", value: "", dynamic: true }],
    condition: { item: "hasTicketsSelected", if: true, then: "enabled", else: "disabled" },
    tag: false,
    required: false,
    view: false,
    add: true,
    update: true,
    filter: false,
    export: false,
    footnote: "Select specific users who can attend this instance",
    icon: "user",
  },
  {
    type: "text",
    placeholder: "Select Users",
    name: "users",
    label: "Select Users",
    validation: "",
    tag: false,
    view: true,
    add: false,
    update: false,
    filter: false,
    export: false,
    footnote: "",
    icon: "user",
    render: (value, rowData) => {
      // Required list format: names and "All Users"
      if (rowData?.ticketType === "All Tickets" || rowData?.ticketType === 0 || rowData?.ticketType === "0") {
        return "All Users";
      }
      const items = Array.isArray(rowData?.users) ? rowData.users : [];
      if (items.length === 0) return "--";
      const parts = [];
      const seen = new Set();
      for (const u of items) {
        const label = u?.users === "All Users" ? "All Users" : u?.fullName || u?.firstName || u?.emailId || "User";
        if (!seen.has(label)) {
          seen.add(label);
          parts.push(label);
        }
      }
      return parts.join(", ");
    },
  },
];

export const instanceDataAttributes = [
  {
    type: "select",
    apiType: "API",
    selectApi: "ticket/select",
    placeholder: "Ticket",
    name: "ticket",
    showItem: "title",
    tag: false,
    label: "Ticket",
    required: true,
    view: false,
    add: false,
    update: false,
    filter: true,
    export: false,
    icon: "ticket",
  },
  {
    type: "select",
    name: "type",
    label: "Type",
    apiType: "JSON",
    filterType: "tabs",
    filter: true,
    export: false,
    filterPosition: "right",
    value: "all",
    filterDefault: "all",
    selectApi: [
      {
        id: "all",
        value: "All",
      },
      {
        id: "check-in",
        value: "Check-in",
      },
      {
        id: "pending-list",
        value: "Pending",
      },
    ],
  },
  {
    type: "text",
    placeholder: "Name",
    name: "firstName",
    collection: "user",
    validation: "",
    default: "",
    tag: true,
    label: "Name",
    required: true,
    view: true,
    add: false,
    update: false,
    image: { field: "keyImage", collection: "", generateTextIcon: true },
  },
  {
    type: "mobilenumber",
    placeholder: "Phone Number",
    name: "authenticationId",
    collection: "user",
    validation: "",
    default: "",
    tag: true,
    label: "Phone Number",
    required: true,
    view: true,
    add: false,
    update: false,
  },
  {
    type: "email",
    placeholder: "Email ID",
    name: "emailId",
    validation: "",
    collection: "user",
    default: "",
    tag: true,
    label: "Email ID",
    required: true,
    view: true,
    add: false,
    update: false,
  },
  {
    type: "number",
    placeholder: "Token",
    name: "token",
    validation: "",
    default: "",
    tag: true,
    label: "Token",
    required: true,
    view: true,
    add: false,
    update: false,
    collection: "attendance",
    showItem: "token",
    // sort: true,
  },
  {
    type: "datetime",
    placeholder: "Checkin Time",
    name: "createdAt",
    validation: "",
    collection: "attendance",
    showItem: "createdAt",
    default: "",
    tag: false,
    label: "Checkin Time",
    required: true,
    view: true,
    add: false,
    update: false,
  },
  {
    type: "hidden",
    placeholder: "Status",
    name: "status",
    validation: "",
    default: "",
    tag: true,
    label: "Status",
    required: true,
    view: true,
    add: false,
    update: false,
    hide: true,
    statusLabel: {
      nextLine: false,
      size: "small",
      conditions: [
        {
          when: "hasAttended",
          condition: COMPARE_TYPES.IS_TRUE,
          compare: true,
          type: "boolean",
          label: "Checked In",
          icon: "checked",
          color: "mint",
        },
        {
          when: "hasAttended",
          condition: COMPARE_TYPES.IS_FALSE,
          compare: false,
          type: "boolean",
          label: "Pending",
          icon: "pending",
          color: "beige",
        },
      ],
    },
  },
];

// export const instanceActionsAttributes = [
//   {
//     element: "button",
//     type: "callback",
//     callback: (item, data, refreshView, slNo) => {
//       // getApproved(data._id, refreshView, slNo, "approve");
//     },
//     itemTitle: {
//       name: "user",
//       type: "text",
//       collection: "",
//     },
//     condition: {
//       item: "instance",
//       if: false,
//       then: true,
//       else: false,
//     },
//     icon: "checked",
//     color: "green",
//     title: "Check In",
//     params: {
//       api: ``,
//       parentReference: "",
//       itemTitle: {
//         name: "user",
//         type: "text",
//         collection: "",
//       },
//       shortName: "Check In",
//       addPrivilege: true,
//       delPrivilege: true,
//       updatePrivilege: true,
//       customClass: "medium",
//     },
//   },
// ];
