import React, { useEffect, useState } from "react";
import frame from "../../../../../images/public/Frame 70 (1).png";
import deleteFrame from "../../../../../images/public/Frame 71 (1).png";
import FormInput from "../../../../core/input";
import AutoForm from "../../../../core/autoform/AutoForm";
import { ElementContainer, Title } from "../../../../core/elements";
import { deleteData, getData, postData, putData } from "../../../../../backend/api";
import withLayout from "../../../../core/layout";
import { SubPageHeader } from "../../../../core/input/heading";

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Footer } from "../../../../core/list/create/styles";
import { ContentContainer, customFields, DeleteButton, FieldContainer, FormContainer, Icon, InputWrapper, quickFields } from "./styles";

const FormBuilderPrimary = (props) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEventSidebarOpen, setIsEventSidebarOpen] = useState(false);
  const [activeInput, setActiveInput] = useState({});
  const [eventTicketFormValues, setEventTicketFormValues] = useState(null);
  const [id, setId] = useState("");
  const [activeInputType, setActiveInputType] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [selectedEventField, setSelectedEventField] = useState(null);
  const [eventFormFields, setEventFormFields] = useState(props.eventFormFields);
  const [countries, setCountries] = useState([]);

  const handleInputClick = (input, inputType) => {
    setActiveInput(input);
    setActiveInputType(inputType);
  };

  const openEventSidebar = () => {
    setIsEventSidebarOpen(!isEventSidebarOpen);
  };

  const closeModal = () => {
    setIsSidebarOpen(false);
    setIsEventSidebarOpen(false);
    setActiveInput(null);
    setEventTicketFormValues({});
    setId("");
  };

  const addEventFieldToForm = () => {
    if (selectedEventField) {
      postData(
        {
          ticket: props?.data?._id,
          ...selectedEventField,
          view: true,
          add: true,
          update: true,
          event: props?.data?.event?._id,
        },
        "event-form-fields"
      ).then((response) => {
        if (response?.data?.success === true) {
          props?.setMessage({
            type: 1,
            content: `Form Data Inserted Successfully`,
            okay: "Okay",
            icon: "success",
          });
        }
        setTriggerEffect((prevState) => !prevState);
      });
      setSelectedEventField(null);
      closeModal();
    }
  };

  const handleEventDeleteField = (field) => {
    const id = field?._id;
    props?.setMessage({
      type: 2,
      content: `Are you sure to delete '${field?.label}'?`,
      proceed: "Delete",
      okay: "Cancel",
      onClose: async () => {},
      onProceed: async () => {
        deleteData({ id }, `event-form-fields`).then((response) => {
          if (response?.data?.success === true) {
            props?.setMessage({
              type: 1,
              content: `Field '${field?.label}' deleted successfully!`,
              okay: "Okay",
              icon: "deleted",
            });
          } else {
            props?.setMessage({
              type: 1,
              content: response.customMessage,
              okay: "Okay",
              icon: "error",
            });
          }
        });
        setTriggerEffect((prevState) => !prevState);
      },
    });
  };

  const handleFieldSelection = (field) => {
    setSelectedField(field);
    setSelectedEventField(field);
  };

  const renderEventInputField = (field) => {
    switch (field?.type) {
      case "text":
      case "password":
      case "email":
      case "buttonInput":
      case "number":
      case "mobilenumber":
      case "time":
      case "date":
      case "datetime":
      case "image":
      case "file":
      case "textarea":
      case "htmleditor":
      case "submit":
      case "button":
      case "linkbutton":
      case "widges":
      case "close":
      case "checkbox":
      case "select":
      case "multiSelect":
      case "info":
      case "html":
      case "line":
      case "title":
      case "hidden":
        return (
          <div
            onClick={() => {
              setEventTicketFormValues(field);
              setId(field?._id);
              handleInputClick(field, field?.type);
              openEventSidebar();
            }}
          >
            <FormInput {...field} countries={countries} />
          </div>
        );
      default:
        return null;
    }
  };

  const onChange = (name, updateValue) => {
    const { label } = updateValue;
    updateValue["placeHolder"] = label;
    return updateValue;
  };

  const [ticketFormData, setTicketFormData] = useState(null);
  // const [tempTicketFormData] = useState([
  //   // Type selector - no condition needed
  //   {
  //     type: "select",
  //     placeholder: "Type",
  //     name: "type",
  //     validation: "",
  //     default: activeInputType,
  //     tag: true,
  //     label: "Type",
  //     showItem: "Type",
  //     required: false,
  //     view: true,
  //     filter: false,
  //     add: true,
  //     update: true,
  //     apiType: "JSON",
  //     selectApi: [
  //       { id: "text", value: "Text", icon: "text" },
  //       { id: "password", value: "Password", icon: "password" },
  //       { id: "email", value: "Email", icon: "email" },
  //       { id: "number", value: "Number", icon: "number" },
  //       { id: "mobilenumber", value: "Mobile Number", icon: "mobilenumber" },
  //       { id: "time", value: "Time", icon: "time" },
  //       { id: "date", value: "Date", icon: "date" },
  //       { id: "datetime", value: "Date Time", icon: "datetime" },
  //       { id: "image", value: "Image", icon: "image" },
  //       { id: "file", value: "File", icon: "file" },
  //       { id: "textarea", value: "Text Area", icon: "textarea" },
  //       { id: "htmleditor", value: "Html Editor", icon: "paragraph" },
  //       { id: "checkbox", value: "Check Box", icon: "checkBox" },
  //       { id: "select", value: "Select", icon: "dropDown" },
  //       { id: "multiSelect", value: "Multi Select", icon: "multipleChoice" },
  //       { id: "info", value: "Info", icon: "info" },
  //       { id: "html", value: "Html", icon: "html" },
  //       { id: "line", value: "Line", icon: "line" },
  //       { id: "title", value: "Title", icon: "title" },
  //     ],
  //   },
  //   // Title field - only for title type
  //   {
  //     type: "text",
  //     placeholder: "Title",
  //     name: "title",
  //     condition: {
  //       item: "type",
  //       if: ["title"],
  //       then: "enabled",
  //       else: "disabled",
  //     },
  //     showItem: "",
  //     validation: "",
  //     default: "",
  //     tag: false,
  //     label: "Title",
  //     required: true,
  //     view: true,
  //     add: true,
  //     update: true,
  //     apiType: "",
  //     selectApi: "",
  //   },
  //   // Content field - only for info type
  //   {
  //     type: "htmleditor",
  //     placeholder: "Content",
  //     name: "content",
  //     condition: {
  //       item: "type",
  //       if: ["info", "html"],
  //       then: "enabled",
  //       else: "disabled",
  //     },
  //     showItem: "",
  //     validation: "",
  //     default: "",
  //     tag: false,
  //     label: "Content",
  //     required: true,
  //     view: true,
  //     add: true,
  //     update: true,
  //     apiType: "",
  //     selectApi: "",
  //   },
  //   // Label field - disabled for line
  //   {
  //     type: "text",
  //     placeholder: "Label",
  //     name: "label",
  //     condition: {
  //       item: "type",
  //       if: ["line"],
  //       then: "disabled",
  //       else: "enabled",
  //     },
  //     validation: "",
  //     default: activeInput ? activeInput?.label : "",
  //     label: "Label",
  //     tag: false,
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //     onChange: onChange,
  //   },
  //   // Sub Label - disabled for line, title, info
  //   {
  //     type: "text",
  //     placeholder: "Sub Label",
  //     name: "sublabel",
  //     condition: {
  //       item: "type",
  //       if: ["line", "title", "info", "html"],
  //       then: "disabled",
  //       else: "enabled",
  //     },
  //     validation: "",
  //     default: "",
  //     label: "Sub Label",
  //     tag: false,
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //   },
  //   // Placeholder - enabled for input types
  //   {
  //     type: "text",
  //     placeholder: "Place Holder",
  //     name: "placeholder",
  //     condition: {
  //       item: "type",
  //       if: ["text", "password", "email", "number", "mobilenumber", "textarea", "select", "multiSelect"],
  //       then: "enabled",
  //       else: "disabled",
  //     },
  //     validation: "",
  //     default: "",
  //     label: "Place Holder",
  //     tag: false,
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //   },
  //   // API Type - only for select types
  //   {
  //     type: "hidden",
  //     placeholder: "Api Type",
  //     name: "apiType",
  //     condition: {
  //       item: "type",
  //       if: ["select", "multiSelect"],
  //       then: "enabled",
  //       else: "disabled",
  //     },
  //     showItem: "",
  //     validation: "",
  //     default: "CSV",
  //     tag: false,
  //     label: "Api Type",
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //     apiType: "CSV",
  //     selectApi: "CSV",
  //   },
  //   // Select API for single select
  //   {
  //     type: "options",
  //     placeholder: "Add options",
  //     name: "selectApi",
  //     condition: {
  //       item: "type",
  //       if: ["select"],
  //       then: "enabled",
  //       else: "disabled",
  //     },
  //     showItem: "",
  //     validation: "",
  //     default: "",
  //     tag: false,
  //     label: "Add options",
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //   },
  //   // Select API for multi select
  //   {
  //     type: "textarea",
  //     placeholder: "Select Api",
  //     name: "selectApi",
  //     condition: {
  //       item: "type",
  //       if: ["multiSelect"],
  //       then: "enabled",
  //       else: "disabled",
  //     },
  //     showItem: "",
  //     validation: "",
  //     default: "",
  //     tag: false,
  //     label: "Select Api",
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //   },
  //   // Foot Note - disabled for title and info
  //   {
  //     type: "textarea",
  //     placeholder: "Foot Note",
  //     name: "footnote",
  //     condition: {
  //       item: "type",
  //       if: ["title", "info", "html", "line"],
  //       then: "disabled",
  //       else: "enabled",
  //     },
  //     showItem: "",
  //     validation: "",
  //     default: "",
  //     tag: false,
  //     label: "Foot Note",
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //   },
  //   {
  //     type: "multiSelect",
  //     placeholder: "Allowed File Types",
  //     name: "allowedFileTypes",
  //     condition: {
  //       item: "type",
  //       if: ["file"],
  //       then: "enabled",
  //       else: "disabled",
  //     },
  //     showItem: "",
  //     validation: "",
  //     default: "",
  //     tag: false,
  //     label: "Allowed File Types",
  //     required: true,
  //     view: true,
  //     add: true,
  //     update: true,
  //     apiType: "JSON",
  //     selectApi: [
  //       // Images
  //       { id: "image/jpeg", value: "JPG/JPEG Image" },
  //       { id: "image/png", value: "PNG Image" },
  //       { id: "image/gif", value: "GIF Image" },

  //       // Documents
  //       { id: "application/pdf", value: "PDF Document" },
  //       { id: "application/msword", value: "Word Document (DOC)" },
  //       { id: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", value: "Word Document (DOCX)" },
  //       { id: "text/plain", value: "Text File" },

  //       // Spreadsheets
  //       { id: "text/csv", value: "CSV File" },
  //       { id: "application/vnd.ms-excel", value: "Excel Spreadsheet (XLS)" },
  //       { id: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", value: "Excel Spreadsheet (XLSX)" },

  //       // Optional additional formats you might want to include
  //       { id: "image/webp", value: "WebP Image" },
  //       { id: "image/svg+xml", value: "SVG Image" },
  //       { id: "application/vnd.oasis.opendocument.text", value: "OpenDocument Text (ODT)" },
  //       { id: "application/vnd.oasis.opendocument.spreadsheet", value: "OpenDocument Spreadsheet (ODS)" },
  //       { id: "application/zip", value: "ZIP Archive" },
  //       { id: "application/x-rar-compressed", value: "RAR Archive" },
  //     ],
  //   },
  //   // Collection - no condition needed
  //   {
  //     type: "hidden",
  //     placeholder: "Collection",
  //     name: "dbcollection",
  //     validation: "",
  //     default: "formData",
  //     label: "Collection",
  //     tag: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //   },
  //   // Show Item - no condition needed
  //   {
  //     type: "hidden",
  //     placeholder: "Show Item",
  //     name: "showItem",
  //     validation: "",
  //     default: "",
  //     label: "Show Item",
  //     tag: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //   },
  //   // Default value
  //   {
  //     type: "text",
  //     placeholder: "Default",
  //     name: "default",
  //     condition: {
  //       item: "type",
  //       if: ["line", "title", "info", "html"],
  //       then: "disabled",
  //       else: "enabled",
  //     },
  //     validation: "",
  //     default: "",
  //     label: "Default",
  //     tag: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //   },
  //   // Character Length Title
  //   {
  //     type: "title",
  //     title: "Character Length",
  //     name: "sm",
  //     condition: {
  //       item: "type",
  //       if: ["text", "password", "email", "number", "mobilenumber", "textarea"],
  //       then: "enabled",
  //       else: "disabled",
  //     },
  //     add: true,
  //     update: true,
  //   },
  //   // Minimum length
  //   {
  //     type: "text",
  //     placeholder: "Minimum",
  //     name: "minimum",
  //     condition: {
  //       item: "type",
  //       if: ["text", "password", "email", "number", "mobilenumber", "textarea"],
  //       then: "enabled",
  //       else: "disabled",
  //     },
  //     showItem: "",
  //     validation: "",
  //     default: "",
  //     tag: false,
  //     label: "Minimum",
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //   },
  //   // Maximum length
  //   {
  //     type: "text",
  //     placeholder: "Maximum",
  //     name: "maximum",
  //     condition: {
  //       item: "type",
  //       if: ["text", "password", "email", "number", "mobilenumber", "textarea"],
  //       then: "enabled",
  //       else: "disabled",
  //     },
  //     showItem: "",
  //     validation: "",
  //     default: "",
  //     tag: false,
  //     label: "Maximum",
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //   },
  //   // Minimum length
  //   {
  //     type: "date",
  //     placeholder: "Minimum",
  //     name: "minDate",
  //     condition: {
  //       item: "type",
  //       if: ["date", "datetime"],
  //       then: "enabled",
  //       else: "disabled",
  //     },
  //     showItem: "",
  //     validation: "",
  //     default: "empty",
  //     tag: false,
  //     label: "Minimum",
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //   },
  //   // Maximum length
  //   {
  //     type: "date",
  //     placeholder: "Maximum",
  //     name: "maxDate",
  //     condition: {
  //       item: "type",
  //       if: ["date", "datetime"],
  //       then: "enabled",
  //       else: "disabled",
  //     },
  //     showItem: "",
  //     validation: "",
  //     default: "empty",
  //     tag: false,
  //     label: "Maximum",
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //   },
  //   // Permission Settings Title
  //   {
  //     type: "title",
  //     title: "Permission Settings",
  //     name: "sm",
  //     add: true,
  //     update: true,
  //   },
  //   // Tag
  //   {
  //     type: "hidden",
  //     placeholder: "Tag",
  //     name: "tag",
  //     validation: "",
  //     default: "true",
  //     value: true,
  //     tag: false,
  //     label: "Tag",
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //   },
  //   // Required checkbox
  //   {
  //     type: "checkbox",
  //     placeholder: "Required",
  //     name: "required",
  //     condition: {
  //       item: "type",
  //       if: ["line", "title", "info", "html"],
  //       then: "disabled",
  //       else: "enabled",
  //     },
  //     validation: "",
  //     default: "true",
  //     tag: true,
  //     label: "Required",
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //   },
  //   // View permission
  //   {
  //     type: "hidden",
  //     value: true,
  //     placeholder: "View",
  //     name: "view",
  //     validation: "",
  //     tag: false,
  //     label: "View",
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //     default: "true",
  //   },
  //   // Add permission
  //   {
  //     type: "hidden",
  //     placeholder: "Add",
  //     value: true,
  //     name: "add",
  //     validation: "",
  //     tag: false,
  //     label: "Add",
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //     default: "true",
  //   },
  //   // Update permission
  //   {
  //     type: "hidden",
  //     value: true,
  //     placeholder: "Update",
  //     name: "update",
  //     validation: "",
  //     tag: false,
  //     label: "Update",
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //     default: "true",
  //   },
  //   // Filter permission
  //   {
  //     type: "hidden",
  //     placeholder: "Filter",
  //     value: true,
  //     name: "filter",
  //     validation: "",
  //     tag: false,
  //     label: "Filter",
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //     default: "true",
  //   },
  //   // Condition Settings Title
  //   {
  //     type: "title",
  //     title: "Condition Settings",
  //     name: "sm",
  //     add: true,
  //     update: true,
  //   },
  //   // Enable Condition
  //   {
  //     type: "checkbox",
  //     placeholder: "Enable Condition",
  //     name: "conditionEnabled",
  //     validation: "",
  //     default: "false",
  //     tag: true,
  //     label: "Enable Condition",
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //   },
  //   // Condition Field
  //   {
  //     type: "text",
  //     placeholder: "Condition Checking Field",
  //     name: "conditionWhenField",
  //     condition: {
  //       item: "conditionEnabled",
  //       if: true,
  //       then: "enabled",
  //       else: "disabled",
  //     },
  //     validation: "",
  //     default: "",
  //     label: "Condition Checking Field",
  //     tag: true,
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //   },
  //   // Match Values
  //   {
  //     type: "text",
  //     placeholder: "Match Values",
  //     name: "conditionCheckMatch",
  //     condition: {
  //       item: "conditionEnabled",
  //       if: true,
  //       then: "enabled",
  //       else: "disabled",
  //     },
  //     validation: "",
  //     default: "",
  //     label: "Match Values",
  //     tag: true,
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //   },
  //   // If Match Action
  //   {
  //     type: "select",
  //     placeholder: "If Match",
  //     name: "conditionIfMatch",
  //     condition: {
  //       item: "conditionEnabled",
  //       if: true,
  //       then: "enabled",
  //       else: "disabled",
  //     },
  //     validation: "",
  //     default: "",
  //     apiType: "JSON",
  //     selectApi: [
  //       { id: "enabled", value: "Show This Filed" },
  //       { id: "disabled", value: "Hide This Filed" },
  //     ],
  //     label: "Check Match Values",
  //     tag: true,
  //     required: false,
  //     view: true,
  //     add: true,
  //     update: true,
  //   },
  // ]);

  const [tempTicketFormData] = useState([
    // Type selector - no condition needed
    {
      type: "select",
      placeholder: "Type",
      name: "type",
      validation: "",
      default: activeInputType,
      tag: true,
      label: "Type",
      showItem: "Type",
      required: false,
      view: true,
      filter: false,
      add: true,
      update: true,
      apiType: "JSON",
      selectApi: [
        { id: "text", value: "Text", icon: "text" },
        { id: "password", value: "Password", icon: "password" },
        { id: "email", value: "Email", icon: "email" },
        { id: "number", value: "Number", icon: "number" },
        { id: "mobilenumber", value: "Mobile Number", icon: "mobilenumber" },
        { id: "time", value: "Time", icon: "time" },
        { id: "date", value: "Date", icon: "date" },
        { id: "datetime", value: "Date Time", icon: "datetime" },
        { id: "image", value: "Image", icon: "image" },
        { id: "file", value: "File", icon: "file" },
        { id: "textarea", value: "Text Area", icon: "textarea" },
        { id: "htmleditor", value: "Html Editor", icon: "paragraph" },
        { id: "checkbox", value: "Check Box", icon: "checkBox" },
        { id: "toggle", value: "Toggle", icon: "toggle" },
        { id: "select", value: "Select", icon: "dropDown" },
        { id: "multiSelect", value: "Multi Select", icon: "multipleChoice" },
        { id: "info", value: "Info", icon: "info" },
        { id: "html", value: "Html", icon: "html" },
        { id: "line", value: "Line", icon: "line" },
        { id: "title", value: "Title", icon: "title" },
      ],
    },
    // Title field - only for title type
    {
      type: "text",
      placeholder: "Title",
      name: "title",
      condition: {
        item: "type",
        if: ["title"],
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Title",
      required: false,
      view: true,
      add: true,
      update: true,
      apiType: "",
      selectApi: "",
    },
    // Content field - only for info type
    {
      type: "htmleditor",
      placeholder: "Content",
      name: "content",
      condition: {
        item: "type",
        if: ["info", "html"],
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Content",
      required: false,
      view: true,
      add: true,
      update: true,
      apiType: "",
      selectApi: "",
    },
    // Label field - disabled for line
    {
      type: "text",
      placeholder: "Label",
      name: "label",
      condition: {
        item: "type",
        if: ["line"],
        then: "disabled",
        else: "enabled",
      },
      validation: "",
      default: activeInput ? activeInput?.label : "",
      label: "Label",
      tag: false,
      required: false,
      view: true,
      add: true,
      update: true,
      onChange: onChange,
    },

    // Placeholder - enabled for input types
    {
      type: "text",
      placeholder: "Place Holder",
      name: "placeholder",
      condition: {
        item: "type",
        if: ["text", "password", "email", "number", "mobilenumber", "textarea", "select", "multiSelect"],
        then: "enabled",
        else: "disabled",
      },
      validation: "",
      default: "",
      label: "Place Holder",
      tag: false,
      required: false,
      view: true,
      add: true,
      update: true,
    },
    // API Type - only for select types
    {
      type: "hidden",
      placeholder: "Api Type",
      name: "apiType",
      condition: {
        item: "type",
        if: ["select", "multiSelect"],
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "CSV",
      tag: false,
      label: "Api Type",
      required: false,
      view: true,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "CSV",
    },
    // Select API for single select
    {
      type: "options",
      placeholder: "Add options",
      name: "selectApi",
      condition: {
        item: "type",
        if: ["select", "multiSelect"],
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Add options",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    // Select API for multi select
    {
      type: "textarea",
      placeholder: "Select Api",
      name: "selectApi",
      condition: {
        item: "type",
        if: ["multiSelect"],
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Select Api",
      required: false,
      view: true,
      add: true,
      update: true,
    },

    {
      type: "multiSelect",
      placeholder: "Allowed File Types",
      name: "allowedFileTypes",
      condition: {
        item: "type",
        if: ["file"],
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Allowed File Types",
      required: true,
      view: true,
      add: true,
      update: true,
      apiType: "JSON",
      selectApi: [
        // Images
        { id: "image/jpeg", value: "JPG/JPEG Image" },
        { id: "image/png", value: "PNG Image" },
        { id: "image/gif", value: "GIF Image" },

        // Documents
        { id: "application/pdf", value: "PDF Document" },
        { id: "application/msword", value: "Word Document (DOC)" },
        { id: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", value: "Word Document (DOCX)" },
        { id: "text/plain", value: "Text File" },

        // Spreadsheets
        { id: "text/csv", value: "CSV File" },
        { id: "application/vnd.ms-excel", value: "Excel Spreadsheet (XLS)" },
        { id: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", value: "Excel Spreadsheet (XLSX)" },

        // Optional additional formats you might want to include
        { id: "image/webp", value: "WebP Image" },
        { id: "image/svg+xml", value: "SVG Image" },
        { id: "application/vnd.oasis.opendocument.text", value: "OpenDocument Text (ODT)" },
        { id: "application/vnd.oasis.opendocument.spreadsheet", value: "OpenDocument Spreadsheet (ODS)" },
        { id: "application/zip", value: "ZIP Archive" },
        { id: "application/x-rar-compressed", value: "RAR Archive" },
      ],
    },
    // Collection - no condition needed
    {
      type: "hidden",
      placeholder: "Collection",
      name: "dbcollection",
      validation: "",
      default: "formData",
      label: "Collection",
      tag: false,
      view: true,
      add: true,
      update: true,
    },
    // Show Item - no condition needed
    {
      type: "hidden",
      placeholder: "Show Item",
      name: "showItem",
      validation: "",
      default: "",
      label: "Show Item",
      tag: false,
      view: true,
      add: true,
      update: true,
    },

    // Permission Settings Title
    {
      type: "title",
      title: "Permission Settings",
      name: "sm",
      add: true,
      update: true,
    },
    // Tag
    {
      type: "hidden",
      placeholder: "Tag",
      name: "tag",
      validation: "",
      default: "true",
      value: true,
      tag: false,
      label: "Tag",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    // Required checkbox
    {
      type: "checkbox",
      placeholder: "Required",
      name: "required",
      condition: {
        item: "type",
        if: ["line", "title", "info", "html"],
        then: "disabled",
        else: "enabled",
      },
      validation: "",
      default: "true",
      tag: true,
      label: "Required",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    // View permission
    {
      type: "hidden",
      value: true,
      placeholder: "View",
      name: "view",
      validation: "",
      tag: false,
      label: "View",
      required: false,
      view: true,
      add: true,
      update: true,
      default: "true",
    },
    // Add permission
    {
      type: "hidden",
      placeholder: "Add",
      value: true,
      name: "add",
      validation: "",
      tag: false,
      label: "Add",
      required: false,
      view: true,
      add: true,
      update: true,
      default: "true",
    },
    // Update permission
    {
      type: "hidden",
      value: true,
      placeholder: "Update",
      name: "update",
      validation: "",
      tag: false,
      label: "Update",
      required: false,
      view: true,
      add: true,
      update: true,
      default: "true",
    },
    // Filter permission
    {
      type: "hidden",
      placeholder: "Filter",
      value: true,
      name: "filter",
      validation: "",
      tag: false,
      label: "Filter",
      required: false,
      view: true,
      add: true,
      update: true,
      default: "true",
    },
    // Country
    {
      type: "title",
      title: "Phone Code Settings",
      name: "sm",
      add: true,
      update: true,
      condition: {
        item: "type",
        if: ["mobilenumber"],
        then: "enabled",
        else: "disabled",
      },
    },
    {
      type: "select",
      label: "How to load countries?",
      showLabel: true,
      name: "countryLoadingType",
      default: "all",
      condition: {
        item: "type",
        if: ["mobilenumber"],
        then: "enabled",
        else: "disabled",
      },
      selectApi: [
        { id: "all", value: "All Countries" },
        { id: "exclude", value: "Exclude Some Countries" },
        { id: "include", value: "Limit to Specific Countries" },
      ],
      apiType: "JSON",
      selectType: "radio",
      add: true,
      update: true,
    },
    {
      type: "multiSelect",
      placeholder: "Specific Countries",
      name: "country",
      condition: {
        item: "countryLoadingType",
        if: ["include"],
        then: "enabled",
        else: "disabled",
      },
      validation: "",
      default: "",
      label: "Select your specific countries",
      tag: true,
      selectApi: "country/select",
      apiType: "API",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "multiSelect",
      placeholder: "Excluded Countries",
      name: "country",
      condition: {
        item: "countryLoadingType",
        if: ["exclude"],
        then: "enabled",
        else: "disabled",
      },
      validation: "",
      default: "",
      label: "Select countries to exclude",
      tag: true,
      selectApi: "country/select",
      apiType: "API",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    // Condition Settings Title
    {
      type: "title",
      title: "Condition Settings",
      name: "sm",
      add: true,
      update: true,
    },
    // Enable Condition
    {
      type: "checkbox",
      placeholder: "Enable Condition",
      name: "conditionEnabled",
      validation: "",
      default: "false",
      tag: true,
      label: "Enable Condition",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    // Condition Field
    {
      type: "select",
      placeholder: "Condition Checking Field",
      name: "conditionWhenField",
      condition: {
        item: "conditionEnabled",
        if: true,
        then: "enabled",
        else: "disabled",
      },
      validation: "",
      default: "",
      label: "Condition Checking Field",
      tag: true,
      required: false,
      view: true,
      add: true,
      apiType: "JSON",
      selectApi: [],
      update: true,
    },
    // Match Values
    {
      type: "text",
      placeholder: "Match Values",
      name: "conditionCheckMatch",
      condition: {
        item: "conditionEnabled",
        if: true,
        then: "enabled",
        else: "disabled",
      },
      validation: "",
      default: "",
      label: "Match Values",
      tag: true,
      required: false,
      view: true,
      add: true,
      update: true,
    },
    // If Match Action
    {
      type: "select",
      placeholder: "If Match",
      name: "conditionIfMatch",
      condition: {
        item: "conditionEnabled",
        if: true,
        then: "enabled",
        else: "disabled",
      },
      validation: "",
      default: "",
      apiType: "JSON",
      selectApi: [
        { id: "enabled", value: "Show This Filed" },
        { id: "disabled", value: "Hide This Filed" },
      ],
      label: "Check Match Values",
      tag: true,
      required: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "select",
      name: "customClass",
      label: "Grid Column",
      apiType: "JSON",
      selectApi: [
        { id: "quarter", value: "Quarter" },
        { id: "half", value: "Half" },
        { id: "full", value: "Full" },
      ],
      default: "full",
      view: true,
      add: true,
      update: true,
    },
    // Additional Settings Title
    {
      type: "title",
      title: "Additional Settings",
      name: "sm",
      add: true,
      update: true,
    },
    // Enable Additional
    {
      type: "checkbox",
      placeholder: "Enable Additional",
      name: "additionalEnabled",
      validation: "",
      default: "false",
      tag: true,
      label: "Enable Additional",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    // Additional Field
    // Sub Label - disabled for line, title, info
    {
      type: "text",
      placeholder: "Sub Label",
      name: "sublabel",
      condition: {
        item: "additionalEnabled",
        // if: ["line", "title", "info", "html"],
        if: true,
        then: "enabled",
        else: "disabled",
      },
      validation: "",
      default: "",
      label: "Sub Label",
      tag: false,
      required: false,
      view: true,
      add: true,
      update: true,
    },
    // Foot Note - disabled for title and info
    {
      type: "textarea",
      placeholder: "Foot Note",
      name: "footnote",
      condition: {
        item: "additionalEnabled",
        // if: ["title", "info", "html", "line"],
        if: true,
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Foot Note",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    // Default value
    {
      type: "text",
      placeholder: "Default",
      name: "default",
      condition: {
        item: "additionalEnabled",
        // if: ["title", "info", "html", "line"],
        if: true,
        then: "enabled",
        else: "disabled",
      },
      validation: "",
      default: "",
      label: "Default",
      tag: false,
      view: true,
      add: true,
      update: true,
    },

    // Character Length Title
    {
      type: "title",
      title: "Character Length",
      name: "sm",
      condition: {
        item: "type",
        if: ["text", "password", "email", "number", "mobilenumber", "textarea"],
        then: "enabled",
        else: "disabled",
      },
      add: true,
      update: true,
    },
    // Minimum length
    {
      type: "text",
      placeholder: "Minimum",
      name: "minimum",
      condition: {
        item: "type",
        if: ["text", "password", "email", "number", "mobilenumber", "textarea"],
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Minimum",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    // Maximum length
    {
      type: "text",
      placeholder: "Maximum",
      name: "maximum",
      condition: {
        item: "type",
        if: ["text", "password", "email", "number", "mobilenumber", "textarea"],
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "",
      tag: false,
      label: "Maximum",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    // Minimum length
    {
      type: "date",
      placeholder: "Minimum",
      name: "minDate",
      condition: {
        item: "type",
        if: ["date", "datetime"],
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "empty",
      tag: false,
      label: "Minimum",
      required: false,
      view: true,
      add: true,
      update: true,
    },
    // Maximum length
    {
      type: "date",
      placeholder: "Maximum",
      name: "maxDate",
      condition: {
        item: "type",
        if: ["date", "datetime"],
        then: "enabled",
        else: "disabled",
      },
      showItem: "",
      validation: "",
      default: "empty",
      tag: false,
      label: "Maximum",
      required: false,
      view: true,
      add: true,
      update: true,
    },
  ]);

  useEffect(() => {
    const temp = [...tempTicketFormData];
    temp[0].default = activeInputType;

    // Remove any pre-existing Grade Type field if present
    const gradeTypeIndex = temp.findIndex((item) => item?.name === "gradeType");
    if (gradeTypeIndex !== -1) {
      temp.splice(gradeTypeIndex, 1);
    }

    setTicketFormData(temp);
  }, [activeInputType, tempTicketFormData, props?.data?.type]);

  const submitEventChange = async (post) => {
    putData({ id, ...post }, "event-form-fields").then((response) => {
      if (response?.data?.success === true) {
        props?.setMessage({
          type: 1,
          content: `Form Input Updated Successfully`,
          okay: "Okay",
          icon: "success",
        });
        closeModal();
      }
    });
    // write your code here
  };
  const [triggerEffect, setTriggerEffect] = useState(false); // State variable to trigger useEffect

  useEffect(() => {
    getData({ event: props?.data?.event._id }, "event-form-fields").then((response) => {
      setEventFormFields(response?.data?.response);
    });
  }, [props, triggerEffect]);

  useEffect(() => {
    getData({}, "country").then((response) => {
      setCountries(response?.data?.response);
    });
  }, []);

  // Initialize sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Start dragging after moving 5 pixels
      },
    })
  );

  // Handle drag end
  const handleEventDragEnd = async (event) => {
    const { active, over } = event;

    if (over && active?.id !== over?.id) {
      const oldIndex = eventFormFields?.findIndex((item) => item?._id === active?.id);
      const newIndex = eventFormFields?.findIndex((item) => item?._id === over?.id);

      const newFormFields = arrayMove(eventFormFields, oldIndex, newIndex);

      // Update orderId based on new index
      const updatedFields = newFormFields.map((field, index) => ({
        ...field,
        orderId: index + 1, // Ensure orderId is updated according to new order
      }));

      try {
        props?.setLoaderBox(true);
        // Trigger the updates and wait for all of them to complete
        const updatePromises = updatedFields.map((item) => {
          return putData(
            { id: item?._id, orderId: item?.orderId }, // Update only relevant fields
            "event-form-fields"
          );
        });

        // Wait for all the promises to resolve
        await Promise.all(updatePromises);

        setTriggerEffect((prevState) => !prevState);
        props?.setLoaderBox(false);
      } catch (error) {
        console.error("Error updating form fields:", error);
      }
    }
  };

  // SortableItem Component
  const SortableEventItem = ({ field }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field?._id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      // Optionally add styles for dragging
    };

    return (
      <InputWrapper ref={setNodeRef} style={style} {...attributes} className={field.type + " " + (field?.customClass ?? "half")}>
        {renderEventInputField(field)}
        <Icon src={frame} isActive={true} {...listeners} />
        <DeleteButton src={deleteFrame} isActive={true} onClick={() => handleEventDeleteField(field)} />
      </InputWrapper>
    );
  };

  return (
    <ElementContainer className="form">
      <ElementContainer className="form-builder-1">
        <FieldContainer>
          <Title line={false} title="Preset Fields"></Title>
          {quickFields?.map(({ label, icon, value, type }) => (
            <FormInput key={value} type="widges" value={label} icon={icon} onChange={() => handleFieldSelection({ label, icon, value, type })} isSelected={selectedField?.value === value} />
          ))}
          <Title line={false} title="Custom Fields"></Title>
          {customFields?.map(({ label, icon, value, type }) => (
            <FormInput key={value} type="widges" value={label} icon={icon} onChange={() => handleFieldSelection({ label, icon: "", value, type })} isSelected={selectedField?.value === value} />
          ))}
        </FieldContainer>
        {(selectedField || selectedEventField) && (
          <Footer className={`bottom`}>
            <FormInput
              type="close"
              value={"Cancel"}
              onChange={() => {
                setSelectedField(null);
                setSelectedEventField(null);
              }}
            />
            <FormInput
              css={""}
              type="submit"
              name="submit"
              value={"Insert Field"}
              onChange={() => {
                if (selectedEventField) addEventFieldToForm();
              }}
            />
          </Footer>
        )}
      </ElementContainer>
      <ElementContainer className="form-builder-4" isSidebarOpen={isSidebarOpen} isEventSidebarOpen={isEventSidebarOpen}>
        <ContentContainer>
          {eventFormFields.length > 0 && (
            <>
              <SubPageHeader title="Primary Fields" line={false} />
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleEventDragEnd}>
                <SortableContext items={eventFormFields.map((field) => field._id)} strategy={verticalListSortingStrategy}>
                  <FormContainer>
                    {eventFormFields.map((field) => (
                      <SortableEventItem key={field._id} field={field} />
                    ))}
                  </FormContainer>
                </SortableContext>
              </DndContext>
            </>
          )}
        </ContentContainer>
      </ElementContainer>
      {isEventSidebarOpen && ticketFormData && (
        <div className="no-tab-icons">
          <AutoForm
            useCaptcha={false}
            key={"elements" + activeInputType}
            formType={"post"}
            header={"Properties"}
            description={""}
            formInput={ticketFormData}
            formValues={eventTicketFormValues}
            submitHandler={submitEventChange}
            button={"Save"}
            isOpenHandler={closeModal}
            isOpen={true}
            plainForm={true}
            formMode={"single"}
          ></AutoForm>
          <style>{`.no-tab-icons .accordion-icon-container{display:none}`}</style>
        </div>
      )}
    </ElementContainer>
  );
};

export default withLayout(FormBuilderPrimary);
