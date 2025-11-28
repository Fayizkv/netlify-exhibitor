import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const Notification = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Notifications - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "title",
      title: "Basic Information",
      name: "basicInfo",
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Enter notification title",
      name: "title",
      label: "Title",
      required: true,
      tag: true,
      view: true,
      add: true,
      update: true,
      icon: "notification",
      validation: "required|min:3|max:100",
      customClass: "full",
    },
    {
      type: "textarea",
      placeholder: "Enter notification message...",
      name: "body",
      label: "Message",
      required: true,
      view: true,
      tag: true,
      add: true,
      update: true,
      rows: 4,
      validation: "required|min:10|max:500",
      customClass: "full",
    },
    {
      type: "select",
      apiType: "CSV",
      selectApi: "general,event_reminder,event_update,event_cancelled,ticket_confirmation,payment_success,payment_failed,announcement,promotional,system",
      placeholder: "Select notification type",
      name: "type",
      showItem: "value",
      label: "Type",
      required: true,
      tag: true,
      view: true,
      add: true,
      update: true,
      filter: true,
      icon: "tag",
      customClass: "half",
    },
    {
      type: "select",
      apiType: "CSV",
      selectApi: "low,normal,high,urgent",
      placeholder: "Select priority",
      name: "priority",
      showItem: "value",
      label: "Priority",
      required: true,
      tag: true,
      view: true,
      add: true,
      update: true,
      filter: true,
      icon: "priority",
      customClass: "half",
    },
    {
      type: "line",
      add: true,
      update: true,
    },
    {
      type: "title",
      title: "Target Audience",
      name: "audienceInfo",
      add: true,
      update: true,
    },
    {
      type: "select",
      apiType: "CSV",
      selectApi: "all,event_attendees,specific_users,user_segment",
      placeholder: "Select target audience",
      name: "targetAudience",
      showItem: "value",
      label: "Target Audience",
      required: true,
      view: true,
      add: true,
      update: true,
      tag: true,
      filter: true,
      icon: "users",
      customClass: "half",
    },
    {
      type: "line",
      add: true,
      update: true,
    },
    {
      type: "title",
      title: "Scheduling & Settings",
      name: "scheduleInfo",
      add: true,
      update: true,
    },
    {
      type: "datetime",
      split: true,
      placeholder: "Select send date and time",
      name: "scheduledAt",
      label: "Send Date & Time",
      required: true,
      view: true,
      add: true,
      update: true,
      icon: "date",
      customClass: "full",
    },
    {
      type: "select",
      apiType: "CSV",
      selectApi: "draft,scheduled",
      placeholder: "Select status",
      name: "status",
      showItem: "value",
      label: "Status",
      required: true,
      tag: true,
      view: true,
      add: true,
      update: true,
      filter: true,
      icon: "status",
      customClass: "half",
    },
    {
      type: "text",
      placeholder: "Enter image URL (optional)",
      name: "imageUrl",
      label: "Image URL",
      required: false,
      // tag: true,
      view: true,
      add: true,
      update: true,
      icon: "image",
      customClass: "half",
      footnote: "URL to an image for rich notifications",
    },
    {
      type: "line",
      add: true,
      update: true,
    },
    {
      type: "title",
      title: "Notification Settings",
      name: "settingsInfo",
      add: true,
      update: true,
    },
    {
      type: "toggle",
      name: "settings.sendPush",
      label: "Send Push Notification",
      required: false,
      // tag: true,
      view: true,
      add: true,
      update: true,
      default: true,
      customClass: "half",
    },
    {
      type: "toggle",
      name: "settings.sendEmail",
      label: "Send Email",
      required: false,
      // tag: true,
      view: true,
      add: true,
      update: true,
      default: false,
      customClass: "half",
    },
    {
      type: "toggle",
      name: "settings.sendSMS",
      label: "Send SMS",
      required: false,
      // tag: true,
      view: true,
      add: true,
      update: true,
      default: false,
      customClass: "half",
    },
    {
      type: "select",
      apiType: "CSV",
      selectApi: "default,notification,alert",
      placeholder: "Select notification sound",
      name: "settings.sound",
      showItem: "value",
      label: "Sound",
      required: false,
      // tag: true,
      view: true,
      add: true,
      update: true,
      icon: "sound",
      customClass: "half",
    },
  ]);

  return (
    <Container className="noshadow">
      <ListTable
        // actions={actions}
        api={`notification`}
        itemTitle={{ name: "title", type: "text", collection: "" }}
        shortName={`Notification`}
        formMode={`single`}
        addPrivilege={true}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(Notification);
