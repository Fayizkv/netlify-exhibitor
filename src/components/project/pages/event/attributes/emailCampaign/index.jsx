import React from "react";
import { CheckCircle, XCircle, Clock, Users } from "lucide-react";
import { COMPARE_TYPES } from "../../../../../core/functions/conditions";
import moment from "moment";

// console.log("Loading emailCampaign attributes module...");

const schedule = [
  {
    type: "toggle",
    placeholder: "Do you want to send attachment?",
    name: "enableAttachment",
    validation: "",
    default: false,
    label: "Do you want to send attachment?",
    required: false,
    view: true,
    add: true,
    update: true,
  },
  {
    type: "file",
    allowedFileTypes: [
      "audio/mp3",
      "audio/mpeg",
      "audio/mpga",
      "audio/m4a",
      "audio/wav",
      "audio/webm",
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    placeholder: "Select a file to send",
    name: "attachment",
    validation: "",
    default: "",
    label: "Select a file to send",
    required: false,
    view: true,
    add: true,
    update: true,
    condition: {
      item: "enableAttachment",
      if: true,
      then: "enabled",
      else: "disabled",
    },
  },
  {
    type: "select",
    placeholder: "When do you want to send the campaign?",
    name: "scheduleType",
    validation: "",
    default: "",
    tag: false,
    selectType: "card",
    apiType: "JSON",
    selectApi: [
      { value: "Send it Now", id: "sendNow" },
      { value: "Schedule Later", id: "scheduleLater" },
    ],
    label: "When do you want to send the campaign?",
    required: false,
    view: true,
    add: true,
    update: true,
  },
  {
    type: "datetime",
    placeholder: "Schedule Time",
    label: "Schedule Time",
    name: "scheduleTime",
    validation: "",
    default: "",
    split: true,
    tag: true,
    required: true,
    view: true,
    add: true,
    update: true,
    condition: {
      item: "scheduleType",
      if: "scheduleLater",
      then: "enabled",
      else: "disabled",
    },
    render: (value, rowData, attribute, props) => {
      if (!value || !moment(value).isValid()) {
        return "--";
      }
      // Format date as "MMM DD" (e.g., "Aug 30")
      return moment(value).format("MMM DD");
    },
  },
  {
    type: "select",
    apiType: "JSON",
    selectApi: [
      { value: "Scheduled", id: "scheduled" },
      { value: "Sending", id: "sending" },
      { value: "Completed", id: "completed" },
      { value: "Cancelled", id: "cancelled" },
      { value: "Partially Completed", id: "partially_completed" },
    ],
    placeholder: "Status",
    name: "status",
    label: "Status",
    default: "draft",
    tag: true,
    required: false,
    view: true,
    render: (value, rowData) => {
      return (
        <div className="flex gap-2 items-center">
          <div className="flex gap-2">
            {rowData.successCount > 0 && (
              <span className="bg-green-500 text-white px-2 py-1 rounded-md flex items-center gap-1" title="Delivered Messages">
                <CheckCircle className="w-4 h-4" />
                {rowData.successCount}
              </span>
            )}
            {rowData.failedCount > 0 && (
              <span className="bg-red-500 text-white px-2 py-1 rounded-md flex items-center gap-1" title="Failed Messages">
                <XCircle className="w-4 h-4" />
                {rowData.failedCount}
              </span>
            )}
            {rowData.pendingCount > 0 && (
              <span className="bg-yellow-500 text-white px-2 py-1 rounded-md flex items-center gap-1" title="Pending Messages">
                <Clock className="w-4 h-4" />
                {rowData.pendingCount}
              </span>
            )}
            {rowData.audienceCount > 0 && (
              <span className="bg-blue-500 text-white px-2 py-1 rounded-md flex items-center gap-1" title="Total Audience">
                <Users className="w-4 h-4" />
                {rowData.audienceCount}
              </span>
            )}
          </div>
          {/* {value && (
              <span 
                className="bg-gray-500 text-white px-2 py-1 rounded-md flex items-center gap-1" 
                title="Campaign Status"
              >
                <Info className="w-4 h-4" />
                {value}
              </span>
            )} */}
        </div>
      );
    },
    filter: true,
    add: false,
    update: false,
  },
];
export const emailCampaignAttributes = [
  {
    type: "hidden",
    name: "type",
    validation: "",
    default: "email",
    tag: true,
    label: "Type",
    required: true,
    view: true,
    add: true,
    update: true,
  },
  {
    type: "text",
    placeholder: "Campaign Name",
    name: "name",
    validation: "",
    default: "",
    tag: false,
    label: "Campaign Name",
    required: true,
    view: true,
    add: true,
    update: true,
    statusLabel: {
      nextLine: true,
      size: "small",
      conditions: [
        {
          when: "status",
          condition: COMPARE_TYPES.EQUALS,
          compare: "scheduled",
          type: "string",
          label: "Scheduled",
          icon: "ticket",
          color: "mint",
        },
        {
          when: "status",
          condition: COMPARE_TYPES.EQUALS,
          compare: "sending",
          type: "string",
          label: "Sending",
          icon: "ticket",
          color: "red",
        },
        {
          when: "status",
          condition: COMPARE_TYPES.EQUALS,
          compare: "completed",
          type: "string",
          label: "Completed",
          icon: "ticket",
          color: "green",
        },
        {
          when: "status",
          condition: COMPARE_TYPES.EQUALS,
          compare: "cancelled",
          type: "string",
          label: "Cancelled",
          icon: "ticket",
          color: "red",
        },
      ],
    },
  },
  {
    type: "select",
    apiType: "API",
    selectApi: "audience/select",
    placeholder: "Audience",
    name: "audience",
    validation: "",
    showItem: "name",
    default: "",
    tag: true,
    label: "Audience",
    required: true,
    view: true,
    add: true,
    update: true,
    filter: false,
  },
  {
    type: "title",
    title: "Email Template",
    add: true,
    update: true,
  },
  {
    type: "text",
    placeholder: "Email Subject",
    name: "emailSubject",
    validation: "",
    default: "",
    tag: false,
    label: "Email Subject",
    required: true,
    view: true,
    add: true,
    update: true,
  },
  {
    type: "htmleditor",
    placeholder: "Email Template",
    name: "emailTemplate",
    supportedVariables: ["user", "event"],
    validation: "",
    default: "",
    tag: false,
    label: "Email Template",
    required: true,
    view: true,
    add: true,
    update: true,
  },
  ...schedule,
];

export const whatsappCampaignAttributes = [
  {
    type: "hidden",
    name: "type",
    validation: "",
    default: "whatsapp",
    tag: true,
    label: "Type",
    required: true,
    view: true,
    add: true,
    update: true,
  },
  {
    type: "text",
    placeholder: "Campaign Name",
    name: "name",
    validation: "",
    default: "",
    tag: false,
    label: "Campaign Name",
    required: true,
    view: true,
    add: true,
    update: true,
    statusLabel: {
      nextLine: true,
      size: "small",
      conditions: [
        {
          when: "status",
          condition: COMPARE_TYPES.EQUALS,
          compare: "scheduled",
          type: "string",
          label: "Scheduled",
          icon: "ticket",
          color: "mint",
        },
        {
          when: "status",
          condition: COMPARE_TYPES.EQUALS,
          compare: "sending",
          type: "string",
          label: "Sending",
          icon: "ticket",
          color: "red",
        },
        {
          when: "status",
          condition: COMPARE_TYPES.EQUALS,
          compare: "completed",
          type: "string",
          label: "Completed",
          icon: "ticket",
          color: "green",
        },
        {
          when: "status",
          condition: COMPARE_TYPES.EQUALS,
          compare: "cancelled",
          type: "string",
          label: "Cancelled",
          icon: "ticket",
          color: "red",
        },
      ],
    },
  },
  {
    type: "select",
    apiType: "API",
    selectApi: "audience/select",
    placeholder: "Audience",
    name: "audience",
    validation: "",
    showItem: "name",
    default: "",
    tag: true,
    label: "Audience",
    required: true,
    view: true,
    add: true,
    update: true,
    filter: false,
  },
  {
    type: "title",
    title: "Whatsapp Template",
    add: true,
    update: true,
  },
  {
    type: "textarea",
    placeholder: "Message",
    name: "whatsappMessage",
    supportedVariables: ["user", "event"],
    validation: "",
    default: "",
    tag: false,
    label: "Message",
    required: true,
    view: true,
    add: true,
    update: true,
  },
  ...schedule,
];

export const advocacyPosterFieldsAttributes = [
  {
    type: "text",
    placeholder: "Title",
    name: "title",
    validation: "",
    default: "",
    label: "Title",
    tag: true,
    required: false,
    view: true,
    add: true,
    update: true,
    icon: "text",
    image: { field: "backgroundImage", collection: "" },
    description: { type: "text", field: "slug", collection: "" },
  },
  {
    type: "text",
    placeholder: "Use Count",
    name: "downloadCount",
    validation: "",
    default: "",
    label: "Use Count",
    tag: true,
    required: false,
    view: true,
    add: false,
    update: false,
    icon: "count",
  },
  {
    type: "text",
    placeholder: "Slug",
    name: "slug",
    validation: "",
    default: "",
    label: "Slug",
    tag: true,
    required: false,
    view: true,
    add: true,
    update: true,
    icon: "url",
  },
  {
    type: "image",
    placeholder: "Background Image",
    name: "backgroundImage",
    validation: "",
    default: "",
    label: "Upload Background Image",
    tag: false,
    view: true,
    add: true,
    update: true,
    icon: "image",
  },
  {
    type: "hidden",
    editable: false,
    placeholder: "Type",
    name: "type",
    validation: "",
    // apiType: "CSV",
    // selectApi: "iamattending",
    default: "iamattending",
    label: "Type",
    tag: false,
    required: true,
    view: false,
    add: true,
    update: false,
  },
];
