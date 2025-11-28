
// Note: Privacy Policy attributes for Mobile App Settings
// Only shows Privacy Policy field for the corresponding event
export const policiesAttributes = [
  {
    type: "label",
    label: "Privacy Policy",
    name: "sm",
    group: "Policies",
    add: true,
    update: true,
  },
  {
    type: "line",
    group: "Policies",
    add: true,
    update: true,
  },
  {
    type: "htmleditor",
    placeholder: "Enter Privacy Policy for this event",
    name: "privacyPolicy",
    validation: "",
    default: "",
    tag: true,
    group: "Policies",
    label: "Privacy Policy",
    required: false,
    view: true,
    add: true,
    update: true,
    footnote: "This privacy policy will be used for this specific event in the mobile app",
  },
];

