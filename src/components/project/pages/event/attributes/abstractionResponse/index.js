import moment from "moment";

export const abstractionResponse = [
  {
    type: "text",
    name: "fullName",
    label: "Name",
    view: true,
    add: false,
    update: false,
    tag: true,
    sort: true,
  },
  {
    type: "text",
    name: "emailId",
    label: "Email",
    view: true,
    add: false,
    update: false,
    tag: true,
  },
  {
    type: "text",
    name: "authenticationId",
    label: "Mobile",
    view: true,
    add: false,
    update: false,
    tag: true,
  },
  {
    type: "text",
    name: "formattedTicketNumber",
    label: "Ticket No.",
    view: true,
    add: false,
    update: false,
    // tag: true,
  },
  {
    type: "datetime",
    name: "createdAt",
    label: "Registered On",
    view: true,
    add: false,
    update: false,
    render: (value) => (value ? moment(value).format("MMM DD, YYYY • hh:mm A") : "--"),
    sort: true,
  },
  {
    type: "multiSelect",
    name: "reviewers",
    label: "Assigned Reviewers",
    view: true,
    add: false,
    update: false,
    render: (value) => {
      if (!value || !Array.isArray(value) || value.length === 0) {
        return "No reviewers assigned";
      }
      return value.map((reviewer) => reviewer.name || reviewer.value || reviewer).join(", ");
    },
  },
  {
    type: "text",
    name: "reviewers",
    label: "Assigned Reviewers",
    view: true,
    add: false,
    update: false,
    tag: true,
    render: (value, data) => {
      const reviewersArray = data?.reviewers;
      if (!reviewersArray || !Array.isArray(reviewersArray) || reviewersArray.length === 0) {
        return "--";
      }
      return reviewersArray.map((reviewer) => reviewer.name || reviewer.value || reviewer).join(", ");
    },
  },
];
