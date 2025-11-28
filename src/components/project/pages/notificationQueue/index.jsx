import React, { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
import { getData } from "../../../../backend/api";
import MetricTile from "../../../core/metricTile";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const NotificationQueue = (props) => {
  console.log("props", props.openData?.data?._id)
  //to update the page title
  useEffect(() => {
    document.title = `Notification Queue - EventHex Portal`;
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
      type: "select",
      apiType: "API",
      selectApi: "ticket-registration/select",
      placeholder: "Select ticket registration",
      name: "ticketRegistrationId",
      showItem: "name",
      label: "Ticket Registration",
      required: true,
      tag: false,
      view: true,
      add: false,
      update: false,
      filter: false,
      icon: "ticket",
      customClass: "full",
    },
    {
      type: "text",
      placeholder: "First Name",
      name: "firstName",
      label: "First Name",
      required: false,
      tag: true,
      view: true,
      add: false,
      update: false,
      filter: true,
      icon: "user",
      customClass: "half",
      // Use collection and showItem to extract firstName from nested structure
      collection: "ticketRegistrationId",
      showItem: "firstName",
      // showSubItem: "firstName",
    },
    {
      type: "select",
      apiType: "CSV",
      selectApi: "send,resend,approval,bulk_resend",
      placeholder: "Select notification type",
      name: "notificationType",
      showItem: "notificationType",
      label: "Notification Type",
      required: true,
      tag: true,
      view: true,
      add: false,
      update: false,
      filter: true,
      icon: "notification",
      customClass: "half",
    },
    {
      type: "select",
      apiType: "CSV",
      selectApi: "pending,processing,completed,failed",
      placeholder: "Select status",
      name: "status",
      showItem: "status",
      label: "Status",
      required: true,
      tag: true,
      view: true,
      add: false,
      update: false,
      filter: true,
      icon: "status",
      customClass: "half",
    },
    {
      type: "line",
      add: true,
      update: true,
    },
    {
      type: "title",
      title: "Channel Settings",
      name: "channelInfo",
      add: true,
      update: true,
    },
    {
      type: "toggle",
      name: "channels.email.enabled",
      label: "Enable Email Notification",
      required: false,
      view: true,
      add: true,
      update: true,
      default: false,
      customClass: "half",
    },
    {
      type: "select",
      apiType: "CSV",
      selectApi: "pending,processing,sent,failed,skipped",
      placeholder: "Select email status",
      name: "channels.email.status",
      showItem: "status",
      label: "Email Status",
      required: false,
      view: true,
      add: false,
      update: true,
      icon: "email",
      customClass: "half",
    },
    {
      type: "toggle",
      name: "channels.whatsapp.enabled",
      label: "Enable WhatsApp Notification",
      required: false,
      view: true,
      add: true,
      update: true,
      default: false,
      customClass: "half",
    },
    {
      type: "select",
      apiType: "CSV",
      selectApi: "pending,processing,sent,failed,skipped",
      placeholder: "Select WhatsApp status",
      name: "channels.whatsapp.status",
      showItem: "status",
      label: "WhatsApp Status",
      required: false,
      view: true,
      add: false,
      update: true,
      icon: "whatsapp",
      customClass: "half",
    },
    {
      type: "text",
      name: "channel",
      label: "Channel",
      required: false,
      tag: true,
      view: true,
      add: false,
      update: false,
      filter: false,
      icon: "notification",
      customClass: "half",
      render: (value, data) => {
        return data?.channels?.email?.enabled && data?.channels?.whatsapp?.enabled ? "email ,whatsapp" : data?.channels?.email?.enabled ? "email" : data?.channels?.whatsapp?.enabled ? "whatsapp" : "--";
      },

    },
    {
      type: "line",
      add: true,
      update: true,
    },
    {
      type: "title",
      title: "Badge Settings",
      name: "badgeInfo",
      add: true,
      update: true,
    },
    {
      type: "toggle",
      name: "badgeCreated",
      label: "Badge Created",
      required: false,
      view: true,
      add: false,
      update: true,
      default: false,
      customClass: "half",
    },
    {
      type: "text",
      placeholder: "Enter badge path",
      name: "badgePath",
      label: "Badge Path",
      required: false,
      view: true,
      add: false,
      update: true,
      icon: "image",
      customClass: "half",
    },
    {
      type: "line",
      add: true,
      update: true,
    },
    {
      type: "title",
      title: "Processing Information",
      name: "processingInfo",
      add: true,
      update: true,
    },
    {
      type: "datetime",
      split: true,
      placeholder: "Select processing start time",
      name: "processingStartedAt",
      label: "Processing Started At",
      required: false,
      view: true,
      add: false,
      update: true,
      icon: "time",
      customClass: "half",
    },
    {
      type: "datetime",
      split: true,
      placeholder: "Select processing completion time",
      name: "processingCompletedAt",
      label: "Date",
      required: false,
      tag: true,
      view: true,
      add: false,
      update: true,
      icon: "time",
      customClass: "half",
    },
    {
      type: "number",
      placeholder: "Enter processing duration (ms)",
      name: "processingDuration",
      label: "Processing Duration (ms)",
      required: false,
      view: true,
      add: false,
      update: true,
      icon: "clock",
      customClass: "half",
    },
    {
      type: "line",
      add: true,
      update: true,
    },
    {
      type: "title",
      title: "Retry Settings",
      name: "retryInfo",
      add: true,
      update: true,
    },
    {
      type: "number",
      placeholder: "Enter retry count",
      name: "retryCount",
      label: "Retry Count",
      required: false,
      view: true,
      add: false,
      update: true,
      icon: "refresh",
      customClass: "half",
    },
    {
      type: "number",
      placeholder: "Enter max retries",
      name: "maxRetries",
      label: "Max Retries",
      required: false,
      view: true,
      add: true,
      update: true,
      icon: "settings",
      customClass: "half",
    },
    {
      type: "datetime",
      split: true,
      placeholder: "Select last retry time",
      name: "lastRetryAt",
      label: "Last Retry At",
      required: false,
      view: true,
      add: false,
      update: true,
      icon: "time",
      customClass: "half",
    },
    {
      type: "line",
      add: true,
      update: true,
    },
    {
      type: "title",
      title: "Context Information",
      name: "contextInfo",
      add: true,
      update: true,
    },
    {
      type: "select",
      apiType: "CSV",
      selectApi: "system,admin,webhook,bulk_operation",
      placeholder: "Select triggered by",
      name: "triggeredBy",
      showItem: "triggeredBy",
      label: "Triggered By",
      required: false,
      view: true,
      add: true,
      update: true,
      filter: true,
      icon: "user",
      customClass: "half",
    },
    {
      type: "text",
      placeholder: "Enter bulk operation ID",
      name: "bulkOperationId",
      label: "Bulk Operation ID",
      required: false,
      view: true,
      add: true,
      update: true,
      icon: "list",
      customClass: "half",
    },
    {
      type: "textarea",
      placeholder: "Enter additional metadata (JSON format)",
      name: "metadata",
      label: "Metadata",
      required: false,
      view: true,
      add: true,
      update: true,
      rows: 3,
      footnote: "Additional metadata in JSON format",
      customClass: "full",
    },
  ]);

  // Labels for the metric tiles shown above the table
  const labels = useMemo(
    () => [
      {
        key: "Total",
        title: "TOTAL",
        icon: "all",
      },
      {
        key: "Completed",
        title: "COMPLETED",
        icon: "checked",
      },
      {
        key: "Pending",
        title: "PENDING",
        icon: "pending",
      },
      {
        key: "Processing",
        title: "PROCESSING",
        icon: "processing",
      },
    ],
    []
  );

  // Fetch and cache counts at page level to avoid flicker on re-renders
  const [metricCounts, setMetricCounts] = useState({});

  const fetchCounts = useCallback(async () => {
    const eventId = props.openData?.data?._id;
    if (!eventId) return;

    try {
      const [allRes, completedRes, pendingRes, processingRes] = await Promise.all([
        getData({ eventId }, "notification-queue"),
        getData({ eventId, status: "completed" }, "notification-queue"),
        getData({ eventId, status: "pending" }, "notification-queue"),
        getData({ eventId, status: "processing" }, "notification-queue"),
      ]);

      // Keep previous counts during fetch; only update when ready
      setMetricCounts((prev) => ({
        ...prev,
        Total: { count: allRes?.data?.filterCount ?? allRes?.data?.count ?? 0 },
        Completed: { count: completedRes?.data?.filterCount ?? completedRes?.data?.count ?? 0 },
        Pending: { count: pendingRes?.data?.filterCount ?? pendingRes?.data?.count ?? 0 },
        Processing: { count: processingRes?.data?.filterCount ?? processingRes?.data?.count ?? 0 },
      }));
    } catch (err) {
      // ignore; leave previous values to avoid flicker
    }
  }, [props.openData?.data?._id]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Lightweight renderer that only displays already-fetched counts
  const MetricTileRender = ({ labels: tileLabels }) => {
    return <MetricTile labels={tileLabels} data={metricCounts} />;
  };

  return (
    <Container className="noshadow">
      <ListTable
        // actions={actions}
        api={`notification-queue?eventId=${props.openData?.data?._id}`}
        labels={labels}
        MetricTileRender={MetricTileRender}
        itemTitle={{ name: "ticketRegistrationId", type: "text", collection: "" }}
        shortName={`Notification Queue`}
        add={false}
        formMode={`single`}
        parentReference={props.openData?.data?._id}
        addPrivilege={false}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(NotificationQueue);
