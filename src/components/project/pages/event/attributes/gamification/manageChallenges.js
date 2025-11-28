// Note: Attributes define the form fields and table columns for manage challenges
export const manageChallengesAttributes = [
  {
    type: "text",
    placeholder: "Challenge Name",
    name: "title",
    validation: "",
    default: "",
    label: "Challenge Name",
    tag: true,
    required: true,
    view: true,
    update: true,
  },
  // Note: Select field to choose exhibitor - filtered by event
  {
    type: "select",
    apiType: "API",
    selectApi: "ticket-registration/exhibitor/select",
    placeholder: "Exhibitor",
    name: "exhibitor",
    showItem: "value",
    label: "Exhibitor",
    required: false,
    view: true,
    add: true,
    update: true,
    // Note: Pass event as dynamic parameter to filter exhibitors by event
    params: [
      {
        name: "event",
        dynamic: true,
      }
    ],
    condition: {
      item: "action",
      if: ["Sponsored"],
      then: "enabled",
      else: "disabled",
    },
  },
 {
    type: "text",
    placeholder: "Points",
    name: "points",
    validation: "",
    default: "",
    label: "Points",
    tag: true,
    required: true,
    view: true,
    add: true,
    update: true,
    filter: true,
  },

  // Note: Description field for challenge details
  {
    type: "textarea",
    placeholder: "Enter challenge description",
    name: "description",
    validation: "",
    default: "",
    label: "Description",
    tag: false,
    required: true,
    view: true,
    add: true,
    update: true,
    rows: 3,
  },
  {
    type: "hidden",
    placeholder: "Is Editable Frequency",
    name: "recurring",
    default: true,
    label: "Is Editable Frequency",
    view: true,
    add: true,
    update: true,
    
  },

  {
    type: "select",
    placeholder: "Frequency",
    name: "type",
    default: "Single",
    label: "Frequency",
    apiType: "CSV",
    selectApi: "Single,Recurring",
    tag: true,
    required: true,
    view: true,
    add: true,
    update: true,
    filter: true,
    condition: {
      item: "recurring",
      if: true,
      then: "enabled",
      else: "disabled",
    },
  },
  // Note: Status field is only for add/edit forms, not displayed in table
  {
    type: "toggle",
    placeholder: "Status",
    name: "status",
    default: true,
    label: "",
    showLabel: false,
    validation: "",
    tag: true, // Note: Set to false so it doesn't show as a column
    required: true,
    view: true, // Note: Set to false so it doesn't show in view mode
    inlineAction: true,
  },
    {
      type: "select",
      name: "action",
      label: "Action",
      apiType: "JSON",
      filter: true,
      filterPosition: "right",
      filterType: "tabs",
      selectApi: [
        { value: "All", id: "" },
        { value: "App Action", id: "App Action" },
        { value: "Contest Based", id: "Contest Based" },
        { value: "Sponsored", id: "Sponsored" },
      ],
    },

];
