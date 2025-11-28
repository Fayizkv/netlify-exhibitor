import { getCountries } from "../countries";
import FetchAIData from "../../../../../core/list/ai/fetch";

export const sponsorsAttributes = (eventCountries = []) => {
  return [
    {
      type: "element",
      name: "sponsor",
      label: "Sponsor",
      required: false,
      add: true,
      update: true,
      element: (data, onChange) => (
        <FetchAIData
          {...data}
          onChange={onChange}
          formInput={sponsorsAttributes}
          apiUrl="ticket-registration/sponsor/get-sponsor-profile"
          title="Sponsor Profile"
          type="linkedin"
          placeholder="e.g., https://linkedin.com/company/microsoft"
          buttonText="Generate Profile"
          loadingText="Generating..."
          defaultUrl=""
          clearOnSuccess={true}
          dataMapping={(profileData) => {
            // Map AI response data to sponsor form structure
            return {
              title: profileData.title || "",
              website: profileData.website || "",
              description: profileData.description || "",
              emailId: profileData.emailId || "",
              linkedin: profileData.social?.linkedin || "",
              twitter: profileData.social?.twitter || "",
              facebook: profileData.social?.facebook || "",
              instagram: profileData.social?.instagram || "",
              authenticationId: profileData.authenticationId || "",
            };
          }}
          onSuccess={(profileData, mappedData) => {
            console.log("Sponsor profile generated successfully:", mappedData);
          }}
          onError={(error) => {
            console.error("Failed to generate sponsor profile:", error);
          }}
        />
      ),
    },
    {
      type: "select",
      placeholder: "Sponsor / Partner",
      name: "userType",
      validation: "",
      default: "",
      label: "Type",
      showItem: "type",
      tag: false,
      required: true,
      view: true,
      filter: false,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "sponsor,partner",
    },
    {
      type: "text",
      placeholder: "Brand Name",
      name: "title",
      validation: "",
      default: "",
      tag: true,
      label: "Name",
      required: true,
      view: true,
      add: true,
      update: true,
      icon: "brand",
      image: { field: "logo", collection: "" },
      description: { type: "text", field: "emailId", collection: "" },
    },
    {
      type: "mobilenumber",
      placeholder: "Contact Number",
      name: "authenticationId",
      validation: "",
      default: "",
      tag: false,
      label: "Contact Number",
      required: false,
      view: true,
      add: true,
      update: true,
      countries: getCountries(eventCountries),
      icon: "number",
    },
    {
      type: "text",
      placeholder: "Email",
      name: "emailId",
      validation: "",
      default: "",
      tag: false,
      label: "Email",
      required: false,
      view: true,
      add: true,
      update: true,
      icon: "email",
    },
    {
      type: "text",
      placeholder: "Enter brand Website",
      name: "website",
      validation: "",
      default: "",
      label: "Website URL",
      tag: true,
      required: false,
      view: true,
      add: true,
      update: true,
      icon: "link",
    },
    {
      type: "textarea",
      placeholder: "A brief description about the sponsor ...",
      name: "description",
      validation: "",
      default: "",
      label: "Description",
      sublabel: "Optional",
      tag: false,
      required: false,
      view: true,
      add: true,
      update: true,
      icon: "description",
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "sponsor-category/select",
      placeholder: "Basic",
      name: "sponsorCategory",
      validation: "",
      showItem: "sponsorCategory",
      icon: "sponsors",
      addNew: {
        attributes: [
          {
            type: "text",
            placeholder: "Basic",
            name: "sponsorCategory",
            validation: "",
            default: "",
            tag: true,
            label: "Sponsor Category",
            required: true,
            view: true,
            add: true,
            update: true,
            icon: "sponsors",
          },
          {
            type: "line",
            add: true,
            update: true,
          },
          {
            type: "textarea",
            placeholder: "A brief description about the category ...",
            name: "description",
            validation: "",
            default: "",
            label: "Description",
            sublabel: "Optional",
            tag: false,
            required: false,
            view: true,
            add: true,
            update: true,
          },
          {
            type: "number",
            placeholder: "Order Id",
            name: "orderId",
            validation: "",
            default: "",
            label: "Order Id",
            required: true,
            view: true,
            add: true,
            update: true,
            icon: "orders",
          },
          {
            type: "line",
            add: true,
            update: true,
          },
        ],
        api: "sponsor-category",
        submitButtonText: "Create",
      },
      default: "",
      tag: true,
      label: "Sponsor Category",
      required: true,
      view: true,
      add: true,
      update: true,
      filter: true,
    },
    {
      type: "image",
      placeholder: "Logo",
      name: "logo",
      validation: "",
      default: "false",
      tag: false,
      label: "Logo",
      required: true,
      view: true,
      add: true,
      update: true,
    },
  ];
};

export const sponsorCategoryAttributes = [
  {
    type: "text",
    placeholder: "Basic",
    name: "sponsorCategory",
    validation: "",
    default: "",
    tag: true,
    label: "Sponsor Category",
    required: true,
    view: true,
    add: true,
    update: true,
    description: { type: "text", field: "description", collection: "" },
    icon: "sponsor-category",
  },
  {
    type: "textarea",
    placeholder: "A brief description about the category ...",
    name: "description",
    validation: "",
    default: "",
    label: "Description",
    sublabel: "Optional",
    tag: false,
    required: false,
    view: true,
    add: true,
    update: true,
  },
  {
    type: "number",
    placeholder: "Order Id",
    name: "orderId",
    validation: "",
    default: "",
    label: "Order Id",
    required: true,
    view: true,
    add: true,
    update: true,
    icon: "orders",
  },
];
