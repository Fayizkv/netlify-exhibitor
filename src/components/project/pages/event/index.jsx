import React, { useEffect, useState, useMemo, useRef } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
import moment from "moment";
import { checkprivilege, privileges } from "../../brand/previliage";
import EventForm from "./eventForm";
import FormBuilderNew from "../formBuilderNew";
import { useSelector } from "react-redux";
import PopupView from "../../../core/popupview";
import customDomain from "./customDomain";
import PosterBuilder from "../posterbuilder";
import ColorPicker from "../appSetting";
import { getData, postData, putData } from "../../../../backend/api";
import UploadAudio from "./uploadAudio";
import EventAudioUpload from "../eventAudioUpload/eventAudioUpload.jsx";
import PosterBuilderHeader from "../posterbuilder/header";
import { useToast } from "../../../core/toast";
import IAmAttending from "../iAmAttending";
import { ticketAttributes, ticketCoupenAttributes, ticketAdminAttributes, ticketCategoryAttributes } from "./attributes/ticket/index.jsx";
import { configureAppAttributes } from "../configureApp";
import QRCode from "react-qr-code";
import {
  exhibitorAttributes,
  exhibitorCategoryAttributes,
  boothMemberAttributes,
  downloadAttributes,
  floorPlanAttributes,
  faqAttributes,
  exhibitorFormAttributes,
  passesAttributes,
} from "./attributes/exhibitor/index.jsx";
import { sessionsAttributes, sessionSpeakerAttributes } from "./attributes/sessions";
import { sponsorsAttributes, sponsorCategoryAttributes } from "./attributes/sponsors/index.jsx";
import { formAttributes } from "./attributes/form";
import { badgeAttributes } from "./attributes/badge";
import { attendanceDataAttributes, attendanceActionsAttributes } from "./attributes/attendance";
import { settingsAttributes, instaRecapSettingAttributes, mobileModulesAttributes, notificationModulesAttributes, translationSettingsAttributes } from "./attributes/settings/index.js";
import { paymentHistoryAttributes, createPaymentHistoryActions } from "./attributes/paymentHistory/index";
import { partnersSpotlightsAttributes } from "./attributes/partnersSpotlights";
import { photoPermissionAttributes } from "./attributes/photoPermission";
import { instanceAttributes, instanceDataAttributes } from "./attributes/instance";
import { participantTypeAttributes } from "./attributes/participantType";
import { emailCampaignAttributes, whatsappCampaignAttributes, advocacyPosterFieldsAttributes } from "./attributes/emailCampaign/index.jsx";
import { audienceAttributes } from "./attributes/audience/index.jsx";
import { Globe, MapPin, User } from "lucide-react";
import { GetIcon } from "../../../../icons/index.jsx";
import { Title } from "../../../core/list/styles.js";
import CompanyProfile from "../companyProfile/companyProfile";
import TeamManagement from "../teamManagement/index";
import ProductCatalog from "../productCatalog/index";
import { policyAttributes, cookiesAttributes } from "./attributes/policy";
import { policiesAttributes } from "../privacyPolicy/index.jsx";
import FormBuilderHeader from "../formBuilderNew/header";
import EventFormHeader from "./eventForm/header.jsx";
import TicketResponseViewer from "./TicketResponseViewer";
import ParticipantResponseViewer from "./ParticipantResponseViewer";
import FormResponseViewer from "./FormResponseViewer";
import { useParams } from "react-router-dom";
import { speakersAttributes } from "./attributes/speakers/index.jsx";
import { notificationQueueAttributes } from "../notificationQueue/attributes/index.js";
import { requestAppAttributes } from "./attributes/requestApp/index.js";
import { abstractionAttributes } from "../abtraction/index.jsx";
import { abstractionResponse } from "./attributes/abstractionResponse/index.js";
import { accessCodeAttributes } from "./attributes/accessCode/index.js";
import AutoForm from "../../../core/autoform/AutoForm";
import { rubricAttributes } from "../rubric";
import RubricPage from "../rubric/rubricPage";
import { manageChallengesAttributes } from "./attributes/gamification/manageChallenges.js";
import { leaderboardAttributes } from "./attributes/gamification/leaderboard.js";
import { positionRewardsAttributes, milestoneRewardsAttributes } from "./attributes/gamification/rewards.js";
import { sessionRecordingsAttributes } from "./attributes/sessionRecordings/index.js";
import { updatesAttributes } from "./attributes/updates/index.js";
import PDFPreview from "../../../core/pdfpreview";
import OrderView from "./attributes/paymentHistory/OrderView";
import { avCodeAttributes } from "./attributes/avTeam/index.jsx";
import { ContestBasedModal } from "../contestBased/index.jsx";
import { instanceNewAttributes } from "./attributes/instance/instance.jsx";
import { appVersionAttributes } from "./attributes/appVersion";
import { appModulesAttributes } from "./attributes/mobileModules/index.jsx";
// import { submissionsAttributes } from "./attributes/abstractionResponse/submissions.jsx";
import { checkoutSettingsAttributes } from "./attributes/checkoutSettings/index.jsx";

//if you want to write custom style wirte in above file
const Event = (props) => {
  const { slug } = useParams();
  const prevSlugRef = useRef(slug);
  const [ticket] = useState(ticketAttributes);
  const toast = useToast();
  //to update the page title
  useEffect(() => {
    document.title = `Event - EventHex Portal`;
  }, []);

  // Cache the default eventhex domain for this event in localStorage
  useEffect(() => {
    const fetchDomain = async () => {
      try {
        const response = await getData({ event: slug }, "whitelisted-domains");
        if (response?.status === 200) {
          const domains = response?.data?.response || [];
          const defaultDomain = domains.find((d) => (d?.appType === "eventhex" || d?.route === "eventhex") && d?.isDefault === true);
          if (defaultDomain?.domain) {
            // Store by event id and slug for reuse in multiple places
            const eventId = defaultDomain?.event?._id || slug;
            try {
              localStorage.setItem(`eventhex:domain:${eventId}`, defaultDomain.domain);
              if (slug && slug !== eventId) {
                localStorage.setItem(`eventhex:domain:${slug}`, defaultDomain.domain);
              }
              // Purge other event domains and keep only current identifiers
              const keep = new Set([eventId, slug].filter(Boolean));
              purgeOtherEventDomains(keep);
            } catch (e) { }
          }
        }
      } catch (e) { }
    };
    if (slug) fetchDomain();
  }, [slug]);

  // Clear previous slug-based cached domain when slug changes
  useEffect(() => {
    if (prevSlugRef.current && prevSlugRef.current !== slug) {
      try {
        localStorage.removeItem(`eventhex:domain:${prevSlugRef.current}`);
      } catch (e) { }
    }
    prevSlugRef.current = slug;
  }, [slug]);

  const userType = props.user.user.userType._id;
  const userRole = props.user.user.userType.role;
  const themeColors = useSelector((state) => state.themeColors);
  // State to control the display of the SetupMenu popup
  const [openMenuSetup, setOpenMenuSetup] = useState(false);
  const [openMenuSetupAudio, setOpenMenuSetupAudio] = useState(false);
  // State for recording modals
  const [openNewRecording, setOpenNewRecording] = useState(false);
  const [openMapSession, setOpenMapSession] = useState(false);
  const [openRemapSession, setOpenRemapSession] = useState(false);
  const [openViewTranscript, setOpenViewTranscript] = useState(false);
  const [openBadgeSetup, setOpenBadgeSetup] = useState(false);
  const [openPosterMaker, setOpenPosterMaker] = useState(false);
  // State to store the data for the item that was clicked on in the ListTable
  const [openItemData, setOpenItemData] = useState(null);
  const [openPosterUsage, setOpenPosterUsage] = useState(false);
  const [openCompanyProfile, setOpenCompanyProfile] = useState(false);

  const [openTeamManagement, setOpenTeamManagement] = useState(false);
  const [openProductCatalog, setOpenProductCatalog] = useState(false);
  const [openTicketForm, setOpenTicketForm] = useState(false);
  const [openSettingsTrigger, setOpenSettingsTrigger] = useState(0);
  const [openEventFormSettingsTrigger, setOpenEventFormSettingsTrigger] = useState(0);
  const [openTicketResponse, setOpenTicketResponse] = useState(false);
  const [openParticipantResponse, setOpenParticipantResponse] = useState(false);
  const [openFormResponse, setOpenFormResponse] = useState(false);
  const [openReviewerAssignment, setOpenReviewerAssignment] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [openAddContest, setOpenAddContest] = useState(false);

  // Clone progress modal state
  const [showCloneProgress, setShowCloneProgress] = useState(false);
  const [cloneProgress, setCloneProgress] = useState(0);
  const [cloneCurrentStep, setCloneCurrentStep] = useState(0);
  const [cloneEventTitle, setCloneEventTitle] = useState("");

  // QR Code modal state
  const [qrCodeData, setQrCodeData] = useState({
    show: false,
    url: "",
    title: "",
  });

  // Note: Exhibitor QR Code modal state for challenges
  const [exhibitorQrCodeData, setExhibitorQrCodeData] = useState({
    show: false,
    exhibitorId: "",
    exhibitorName: "",
    qrCodeUrl: "",
  });

  // PDF Preview modal state for invoices
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [pdfData, setPdfData] = useState({
    url: "",
    title: "Invoice Preview",
  });

  // Helpers to cache and retrieve the default eventhex domain locally
  const cacheEventDomain = (eventId, domain) => {
    try {
      if (eventId && domain) {
        localStorage.setItem(`eventhex:domain:${eventId}`, domain);
      }
    } catch (e) { }
  };

  const getCachedEventDomain = (eventId) => {
    try {
      return localStorage.getItem(`eventhex:domain:${eventId}`);
    } catch (e) {
      return null;
    }
  };

  const extractDefaultEventhexDomain = (domains) => {
    if (!Array.isArray(domains)) return null;
    const match = domains.find((d) => (d?.appType === "eventhex" || d?.route === "eventhex") && d?.isDefault === true && typeof d?.domain === "string" && d?.domain?.length > 0);
    return match ? match.domain : null;
  };

  const purgeOtherEventDomains = (keepIdsSet) => {
    try {
      const prefix = "eventhex:domain:";
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const id = key.substring(prefix.length);
          if (!keepIdsSet.has(id)) {
            keysToRemove.push(key);
          }
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) { }
  };

  // Note: Handler to show exhibitor QR code modal
  const handleShowExhibitorQR = async (challenge) => {
    console.log("handleShowExhibitorQR called with challenge:", challenge);

    // Note: Handle both cases - exhibitor as string ID or populated object
    let exhibitorId = null;
    let exhibitorName = "Exhibitor";

    if (typeof challenge?.exhibitor === "string") {
      // Note: Exhibitor is just an ID string
      exhibitorId = challenge.exhibitor;
      exhibitorName = challenge.title || "Exhibitor"; // Use challenge title as fallback
    } else if (challenge?.exhibitor?._id) {
      // Note: Exhibitor is a populated object
      exhibitorId = challenge.exhibitor._id;
      exhibitorName = challenge.exhibitor.fullName || challenge.exhibitor.firstName || challenge.exhibitor.companyName || "Exhibitor";
    }

    if (!exhibitorId) {
      console.error("No exhibitor ID found in challenge:", challenge);
      toast.error("No exhibitor associated with this challenge");
      return;
    }

    console.log("Opening QR modal for exhibitor:", exhibitorId, exhibitorName);
    setExhibitorQrCodeData({
      show: true,
      exhibitorId: exhibitorId,
      exhibitorName: exhibitorName,
      qrCodeUrl: `https://${window.location.host}/${exhibitorId}`,
    });
  };

  // Note: Handler to close exhibitor QR code modal
  const handleCloseExhibitorQR = () => {
    setExhibitorQrCodeData({
      show: false,
      exhibitorId: "",
      exhibitorName: "",
      qrCodeUrl: "",
    });
  };

  // Note: Handler to download exhibitor QR code
  const handleDownloadExhibitorQR = () => {
    const svg = document.getElementById("exhibitor-qr-code-svg");
    if (!svg) {
      toast.error("QR code not found");
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      // Note: Create download link
      const downloadLink = document.createElement("a");
      downloadLink.download = `exhibitor-qr-${exhibitorQrCodeData.exhibitorId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();

      toast.success("QR code downloaded successfully");
    };

    img.onerror = () => {
      toast.error("Failed to download QR code");
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  // Note: Handler to copy exhibitor link to clipboard
  const copyExhibitorLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exhibitorQrCodeData.exhibitorId);
      toast.success("Exhibitor ID copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy exhibitor ID");
    }
  };

  const refreshCampaign = async (id) => {
    props.setLoaderBox(true);
    try {
      const response = await getData({}, `campaign/${id}/refresh-counts`);
      if (response.status === 200) {
        const { successCount, failedCount, audienceCount, status } = response.data.data;
        const values = {
          status: status,
          successCount: successCount,
          failedCount: failedCount,
          audienceCount: audienceCount,
        };
        toast.success(response.data.customMessage);
        return values;
      } else {
        toast.error(response.data.customMessage);
      }
      return {};
    } catch (error) {
      toast.error(error.message);
      return {};
    } finally {
      props.setLoaderBox(false);
    }
  };
  // Function to close the SetupMenu popup
  const closeModal = () => {
    setOpenMenuSetup(false);
    setOpenMenuSetupAudio(false);
    // setOpenRecordingUpload(false);
    // setOpenMapSession(false);
    // setOpenRemapSession(false);
    // setOpenViewTranscript(false);
    setOpenBadgeSetup(false);
    setOpenItemData(null);
    setOpenPosterMaker(false);
    setOpenPosterUsage(false);
    setOpenCompanyProfile(false);
    setOpenTeamManagement(false);
    setOpenProductCatalog(false);
    setShowCloneProgress(false);
    setCloneProgress(0);
    setCloneCurrentStep(0);
    setCloneEventTitle("");
    setOpenTicketResponse(false);
    setOpenParticipantResponse(false);
    setOpenFormResponse(false);
  };

  // QR Code modal functions
  const handleShowQRCode = (item, data) => {
    try {
      const ticketData = data || item;
      const ticketTitle = ticketData?.title || "ticket";
      const ticketSlug =
        ticketData?.slug ||
        ticketTitle
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");

      // Get the correct domain for this ticket
      const websiteUrl = getCachedEventDomain(slug);

      // Fallback if no cached domain
      const finalUrl = websiteUrl ? `${websiteUrl}/register/${ticketSlug}` : `https://${slug}.eventhex.ai/register/${ticketSlug}`;

      setQrCodeData({
        show: true,
        url: finalUrl,
        title: ticketTitle,
      });
    } catch (error) {
      toast.error("Failed to generate QR code");
    }
  };

  const handleCloseQRCode = () => {
    setQrCodeData({
      show: false,
      url: "",
      title: "",
    });
  };

  const handleDownloadQRCode = () => {
    const svg = document.getElementById("qr-code-svg");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        const padding = 40;
        const width = img.width + padding * 2;
        const height = img.height + padding * 2;

        canvas.width = width;
        canvas.height = height;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, padding, padding);

        const pngFile = canvas.toDataURL("image/png", 1.0);
        const downloadLink = document.createElement("a");
        downloadLink.download = `${qrCodeData.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };

      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  // Handle download submission file
  const handleDownloadSubmission = (data) => {
    try {
      console.log("Downloading submission file for:", data);

      // Get the file path from formData
      const filePath = data?.formData?.file;

      if (!filePath) {
        toast.error("No file found for this submission");
        return;
      }

      // Get CDN URL from environment
      const cdnUrl = import.meta.env.VITE_CDN;

      // Construct full URL
      const fullUrl = `${cdnUrl}${filePath}`;

      console.log("Downloading file from:", fullUrl);

      // Create download link
      const downloadLink = document.createElement("a");
      downloadLink.href = fullUrl;
      downloadLink.download = filePath.split("/").pop() || "submission-file";
      downloadLink.target = "_blank";

      // Trigger download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error("Error downloading submission file:", error);
      toast.error("Failed to download file");
    }
  };

  const onEventChange = (name, updateValue) => {
    // Handle switching between single and multi-day events
    const isMultiDay = updateValue["mutliEvent"];
    if (!updateValue["_multiStartDate"]) {
      updateValue["_multiStartDate"] = updateValue["startDate"];
    }
    if (!updateValue["_multiEndDate"]) {
      updateValue["_multiEndDate"] = updateValue["endDate"];
    }
    if (!updateValue["_singleStartDate"]) {
      updateValue["_singleStartDate"] = updateValue["startDate"];
    }
    if (!updateValue["_singleEndDate"]) {
      updateValue["_singleEndDate"] = updateValue["endDate"];
    }
    if (name === "mutliEvent") {
      if (isMultiDay) {
        // Save current values as single day
        updateValue["startDate"] = updateValue["_multiStartDate"] ?? updateValue["startDate"];
        updateValue["endDate"] = updateValue["_multiEndDate"] ?? updateValue["endDate"];
      } else {
        // Save current values as multi-day
        updateValue["startDate"] = updateValue["_singleStartDate"] ?? updateValue["startDate"];
        updateValue["endDate"] = updateValue["_singleEndDate"] ?? updateValue["endDate"];
      }
    }

    // Handle date changes and enforce minimum duration
    if (updateValue["startDate"] || updateValue["endDate"]) {
      const startTime = moment(updateValue["startDate"]);
      const endTime = moment(updateValue["endDate"]);

      if (!isMultiDay) {
        // For single-day events, end date should match start date
        if (name === "startDate") {
          updateValue["endDate"] = moment(startTime).hours(endTime.hours()).minutes(endTime.minutes()).format();
        }

        // Store the single-day values
        updateValue["_singleStartDate"] = updateValue["startDate"];
        updateValue["_singleEndDate"] = updateValue["endDate"];
      } else {
        // Store the multi-day values
        updateValue["_multiStartDate"] = updateValue["startDate"];
        updateValue["_multiEndDate"] = updateValue["endDate"];
      }

      // Ensure end time is after start time
      if (moment(updateValue["endDate"]).isBefore(startTime)) {
        updateValue["endDate"] = moment(startTime).add(1, "hour").format();
      }
    }

    console.log(isMultiDay, moment(updateValue["endDate"]).diff(moment(updateValue["startDate"]), "days"));

    return updateValue;
  };

  const [attributes] = useState([
    ...(checkprivilege([privileges.admin], userType)
      ? [
        {
          type: "select",
          placeholder: "Creating Event for",
          name: "franchise",
          validation: "",
          editable: true,
          label: "Creating Event for",
          group: "Basic",
          sublabel: "",
          showItem: "",
          required: true,
          customClass: "full",
          filter: false,
          view: true,
          add: true,
          update: true,
          apiType: "API",
          footnote: "You are logged in as a admin, so you need to select the organisation you want to create the event for!",
          selectApi: "franchise/select",
        },
      ]
      : []),
    {
      type: "select",
      name: "availability",
      label: "Availability",
      apiType: "JSON",
      filter: true,
      filterPosition: "right",
      filterType: "tabs",
      selectApi: [
        { value: "All", id: "" },
        { value: "Active", id: "Active" },
        { value: "Archive", id: "Archive" },
      ],
    },
    {
      type: "text",
      placeholder: "Enter Event Title",
      name: "title",
      group: "Basic",
      copy: true,
      validation: "",
      default: "",
      label: "Event Name",
      required: true,
      view: true,
      add: true,
      update: true,
      customClass: "full",
    },
    {
      type: "select",
      placeholder: "Registration Method",
      name: "registrationType",
      validation: "",
      editable: true,
      label: "Registration Method",
      customClass: "full",
      showItem: "",
      required: true,
      filter: false,
      view: true,
      add: true,
      group: "Tickets",
      default: "Single",
      update: true,
      apiType: "JSON",
      selectType: "card",
      selectApi: [
        { value: "Single Registration Form", id: "Single", description: "One registration form per ticket", icon: "user" },
        { value: "Group Checkout Form", id: "Multiple", description: "Buy multiple tickets in one checkout", icon: "checkouts" },
      ],
    },
    {
      type: "checkbox",
      placeholder: "Collect info from each ticket holder",
      name: "isCollectSeperateTicketData",
      validation: "",
      editable: true,
      default: true,
      label: "Collect info from each ticket holder",
      group: "Tickets",
      condition: { item: "registrationType", if: "Multiple", then: "enabled", else: "disabled" },
      required: false,
      customClass: "half",
      filter: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "checkbox",
      placeholder: "Send all ticket in a single pdf",
      name: "singleFileTicket",
      validation: "",
      editable: true,
      default: true,
      label: "Send all ticket in a single pdf",
      group: "Tickets",
      condition: { item: "registrationType", if: "Multiple", then: "enabled", else: "disabled" },
      required: false,
      customClass: "half",
      filter: false,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "titleswitch",
      tabs: [
        { label: "Single Day", value: false, icon: "date" },
        { label: "Multi Day", value: true, icon: "date" },
      ],
      placeholder: "Is this a multi day event?",
      name: "mutliEvent",
      onChange: onEventChange,
      subGroup: "multi-day",
      validation: "",
      default: false,
      tag: false,
      title: "Is this a multi day event?",
      required: false,
      customClass: "full",
      view: true,
      add: true,
      group: "Basic",
      update: true,
    },
    {
      type: "datetime",
      placeholder: "Select date",
      name: "startDate",
      split: true,
      subGroup: "multi-day",
      onChange: onEventChange,
      validation: "",
      default: moment().add(1, "day").set({ hour: 9, minute: 0, second: 0 }).toDate(), // Tomorrow 9 AM
      label: "Start Date & Time",
      minDate: moment().add(-1, "month").startOf("day").toDate(), // Cannot select before tomorrow 12 AM
      tag: true,
      required: true,
      view: true,
      add: true,
      group: "Basic",
      update: true,
      icon: "date",
      customClass: "half",
    },
    {
      type: "datetime",
      placeholder: "Select date",
      name: "endDate",
      split: true,
      subGroup: "multi-day",
      onChange: onEventChange,
      validation: "",
      default: moment().add(1, "day").set({ hour: 16, minute: 0, second: 0 }).toDate(), // Tomorrow 4 PM
      label: "End Date & Time",
      condition: { item: "mutliEvent", if: true, then: "enabled", else: "disabled" },
      minDate: moment().add(1, "day").startOf("day").toDate(),
      tag: true,
      required: true,
      view: true,
      add: true,
      group: "Basic",
      update: true,
      icon: "date",
      customClass: "half",
    },
    {
      type: "time",
      placeholder: "Select time",
      name: "endDate",
      condition: { item: "mutliEvent", if: false, then: "enabled", else: "disabled" },
      onChange: onEventChange,
      validation: "",
      subGroup: "multi-day",
      default: moment().add(1, "day").set({ hour: 16, minute: 0, second: 0 }).toDate(), // Tomorrow 4 PM
      label: "End Time",
      minDate: moment().add(1, "day").startOf("day").toDate(),
      tag: false,
      required: true,
      view: true,
      add: true,
      group: "Basic",
      update: true,
      icon: "time",
      customClass: "quarter",
      hideTimezone: true, // Hide timezone display to align with Start Date & Time field in the same row
    },
    {
      type: "timezone",
      name: "timezone",
      label: "Timezone",
      required: true,
      view: true,
      add: true,
      update: true,
      customClass: "full",
      subGroup: "multi-day",
      group: "Basic",
    },
    {
      type: "titleswitch",
      tabs: [
        { label: "In-person", value: "in-person", icon: "team" },
        { label: "Virtual", value: "virtual", icon: "virtual" },
        { label: "Hybrid", value: "hybrid", icon: "hybrid" },
      ],
      placeholder: "Pin Your Location",
      name: "eventType",
      subGroup: "event-type",
      validation: "",
      default: "in-person",
      tag: false,
      title: "Pin Your Location",
      required: false,
      customClass: "full",
      view: true,
      add: true,
      group: "Basic",
      update: true,
    },
    {
      type: "text",
      placeholder: "Enter location or venue name",
      name: "venue",
      validation: "",
      default: "",
      label: "Venue",
      subGroup: "event-type",
      condition: { item: "eventType", if: "virtual", then: "disabled", else: "enabled" },
      required: true,
      view: true,
      tag: true,
      add: true,
      group: "Basic",
      update: true,
      icon: "location",
      customClass: "full",
      // footnote: "For virtual events, you can leave this blank or enter 'Online' or your event's website URL",
      render: (value, data, attribute) => {
        const getEventStatus = () => {
          const now = moment();
          const start = data.startDate ? moment(data.startDate) : null;
          const end = data.endDate ? moment(data.endDate) : null;

          if (!start) return { status: "No Date", color: "bg-gray-100 text-gray-800" };

          if (now.isBefore(start)) {
            return { status: "Upcoming", color: "bg-blue-100 text-blue-800" };
          } else if (end && now.isAfter(end)) {
            return { status: "Expired", color: "bg-red-100 text-red-800" };
          } else {
            return { status: "Live", color: "bg-green-100 text-green-800" };
          }
        };
        const eventStatus = getEventStatus();
        return (
          <div className="flex flex-col gap-0 w-full">
            <Title>{attribute.label}</Title>
            <div className="flex text-sm justify-between w-full">
              {data.eventType === "virtual" ? (
                <span className="flex items-center gap-2  text-xs ">
                  <Globe className="w-3 h-3" /> Virtual
                </span>
              ) : (
                <span className="flex items-start gap-2  text-xs">
                  <MapPin className="w-3 h-3" /> {value}
                </span>
              )}
              <div className="flex items-center gap-2">
                <div className={`px-2 py-1 rounded-full text-xs ${eventStatus.color}`}>{eventStatus.status} </div>
                <div className="px-2 py-1 rounded-full text-xs items-center flex gap-2 bg-green-100 text-green-800">
                  <User className="w-3 h-3" />
                  {data.registrationCount}
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      type: "text",
      placeholder: "Enter the URL",
      name: "url",
      validation: "",
      editable: true,
      default: "",
      label: "URL",
      group: "Basic",
      subGroup: "event-type",
      required: false,
      view: true,
      add: true,
      update: true,
      icon: "url",
      customClass: "full",
      // footnote: "'https://your-event-url.com' or your event's website URL",
      condition: { item: "eventType", if: ["virtual", "hybrid"], then: "enabled", else: "disabled" },
    },
    {
      type: "select",
      placeholder: "Are you selling tickets?",
      name: "ticketType",
      validation: "",
      editable: true,
      label: "Are you selling tickets?",
      showItem: "",
      selectType: "card",
      required: true,
      customClass: "full",
      default: "free",
      filter: false,
      view: false,
      add: false,
      group: "Tickets",
      update: true,
      apiType: "JSON",
      selectApi: [
        { value: "Free Event", id: "free", description: "No, this event is free for attendees", icon: "free" },
        { value: "Paid Event", id: "paid", description: "Yes, I'll be charging for tickets", icon: "paid" },
      ],
    },
    {
      type: "titleswitch",
      description: "How do you want to sell tickets?",
      name: "ticketType",
      validation: "",
      editable: true,
      title: "Tickets",
      showItem: "",
      selectType: "card",
      required: true,
      customClass: "full",
      subGroup: "tickets",
      default: "free",
      filter: false,
      view: true,
      add: true,
      group: "Tickets",
      update: false,
      apiType: "JSON",
      tabs: [
        { label: "Free", value: "free", icon: "free" },
        { label: "Paid", value: "paid", icon: "paid" },
      ],
    },
    {
      type: "select",
      placeholder: "Currency",
      name: "currency",
      validation: "",
      editable: true,
      label: "Currency",
      group: "Tickets",
      subGroup: "tickets",
      showItem: "",
      required: true,
      customClass: "full",
      filter: false,
      view: true,
      add: true,
      update: true,
      apiType: "API",
      selectApi: "currency/select",
      condition: { item: "ticketType", if: "paid", then: "enabled", else: "disabled" },
    },
    {
      type: "multiForm",
      name: "tickets",
      label: "Ticket",
      validation: "",
      default: [],
      maximumItems: 10,
      minimumItems: 1,
      subGroup: "tickets",
      formMode: "double",
      formType: "inline", //popup or inline
      submitButtonText: "Save Ticket",
      required: true,
      resetOnParent: ["ticketType"],
      multiFormData: [
        {
          type: "text",
          placeholder: "Early Bird, VIP Access...",
          name: "title",
          validation: "",
          default: "",
          label: "Ticket Name",
          required: true,
          view: true,
          add: true,
          update: true,
          tag: true,
          icon: "ticket",
          customClass: "half",
        },
        {
          type: "number",
          placeholder: "Number of Tickets",
          name: "quantity",
          validation: "",
          default: "",
          label: "Number of Tickets",
          required: true,
          view: true,
          add: true,
          update: true,
          tag: true,
          customClass: "half",
        },
        {
          type: "select",
          placeholder: "Ticket Type",
          name: "enablePricing",
          editable: true,
          label: "Ticket Type",
          required: false,
          customClass: "half",
          default: true,
          parentCondition: {
            item: "ticketType",
            if: "paid",
            then: "enabled",
            else: "disabled",
          },
          filter: false,
          tag: false,
          view: true,
          add: true,
          update: true,
          apiType: "JSON",
          selectType: "card",
          cardType: "compact",
          selectApi: [
            { value: "Paid", id: true },
            { value: "Free", id: false },
          ],
          render: (value, data, attribute) => {
            return <div>{value ? "Paid" : "Free"}</div>;
          },
        },
        {
          type: "number",
          placeholder: "Price",
          name: "paymentAmount",
          condition: {
            item: "enablePricing",
            if: true,
            then: "enabled",
            else: "disabled",
          },
          parentCondition: {
            item: "ticketType",
            if: "paid",
            then: "enabled",
            else: "disabled",
          },
          displayFormat: "price",
          validation: "",
          tag: true,
          label: "Price",
          decimalPlaces: 2,
          showItem: "",
          required: true,
          view: true,
          filter: false,
          add: true,
          update: true,
          customClass: "half",
        },
      ],
      view: true,
      add: true,
      update: false,
      group: "Tickets",
      customClass: "full",
    },
    {
      type: "hidden",
      name: "ticketsData",
      default: "",
      add: true,
      update: false,
    },
    {
      type: "select",
      placeholder: "Attendee Information Collection",
      name: "attendeeInfoCollection",
      condition: { item: "registrationMode", if: "checkout", then: "enabled", else: "disabled" },
      validation: "",
      selectType: "card",
      group: "Tickets",
      editable: true,
      label: "Attendee Information Collection",
      sublabel: "",
      showItem: "",
      required: false,
      customClass: "full",
      filter: false,
      view: true,
      add: true,
      update: true,
      apiType: "JSON",
      selectApi: [
        { value: "Buyer is the only attendee (collect data once)", id: "buyerOnly" },
        { value: " Buyer provides information for all attendees", id: "buyerAndAttendee" },
      ],
    },
    {
      type: "text",
      placeholder: "Total Registration",
      name: "regCount",
      validation: "",
      default: "",
      label: "Total Registration",
      tag: false,
      required: false,
      view: false,
      add: false,
      update: false,
      customClass: "quarter",
    },
    {
      type: "image",
      placeholder: "Logo",
      name: "logo",
      subGroup: "logo-banner",
      validation: "",
      default: "false",
      tag: true,
      label: "Event Logo",
      group: "Modules",
      footnote: "For best results, use a logo with a transparent background",
      required: true,
      view: true,
      add: true,
      update: true,
      customClass: "half",
    },
    {
      type: "image",
      placeholder: "Banner",
      name: "banner",
      subGroup: "logo-banner",
      validation: "",
      default: "false",
      tag: true,
      label: "Event Banner",
      group: "Modules",
      footnote: "For best results, use a 2100*900px landscape image",
      required: false,
      view: true,
      add: true,
      update: true,
      customClass: "half",
    },
    {
      type: "toggle",
      placeholder: "Enable Branding",
      name: "enableBranding",
      footnote: "Once you enable this premium feature, custom branding will be applied to all modules, tickets, and event website",
      validation: "",
      default: false,
      label: "Enable Branding",
      group: "Branding",
      required: false,
      view: true,
      add: false,
      update: true,
      customClass: "half",
      parentCondition: {
        item: "whiteLabelEnabled",
        collection: "franchise",
        if: true,
        then: "enabled",
        else: "disabled",
      },
    },
    {
      type: "text",
      placeholder: "Enter Override Brand Title",
      name: "overrideBrandTitle",
      validation: "",
      default: "",
      label: "Brand Title",
      group: "Branding",
      required: false,
      view: true,
      add: false,
      update: true,
      customClass: "half",
      parentCondition: {
        item: "whiteLabelEnabled",
        collection: "franchise",
        if: true,
        then: "enabled",
        else: "disabled",
      },
      condition: {
        item: "enableBranding",
        if: true,
        then: "enabled",
        else: "disabled",
      },
    },
    {
      type: "image",
      placeholder: "Override Brand Logo",
      name: "overrideBrandLogo",
      subGroup: "logo-banner",
      validation: "",
      default: "false",
      tag: true,
      label: "Override Brand Logo",
      group: "Branding",
      footnote: "Override the default brand logo with your own logo",
      required: true,
      view: true,
      add: true,
      update: true,
      customClass: "half",
      parentCondition: {
        item: "whiteLabelEnabled",
        collection: "franchise",
        if: true,
        then: "enabled",
        else: "disabled",
      },
      condition: {
        item: "enableBranding",
        if: true,
        then: "enabled",
        else: "disabled",
      },
    },
    {
      type: "htmleditor",
      placeholder: "About Your Event",
      name: "description",
      validation: "",
      default: "",
      label: "About Your Event",
      group: "About Your Event",
      tag: false,
      required: false,
      view: false,
      add: false,
      update: true,
    },
    {
      type: "multiSelect",
      placeholder: "Core Modules",
      name: "coreModules",
      validation: "",
      selectType: "card",
      editable: true,
      customClass: "full",
      label: "Core Modules",
      showItem: "",
      required: false,
      filter: false,
      view: true,
      add: true,
      group: "Modules",
      update: true,
      apiType: "JSON",
      selectApi: [
        { id: "Sessions & Speakers", value: "Sessions & Speakers", description: "Perfect for conferences, seminars, and multi-track events", icon: "session" },
        { id: "Exhibitors & Sponsors", value: "Exhibitors & Sponsors", description: "Showcase event partners with branded profiles and booth information", icon: "exhibitor" },
        // { id: "Event Website", value: "Event Website", description: "Generate a branded event website with registration and information", icon: "website" },
        // { id: "Display Walls", value: "Display Walls", description: "Show live event feeds, Photos , Summeries and Takeaways on screens`", icon: "wall-fame" },
        { id: "InstaSnap", value: "InstaSnap", description: "Share Event Photos to attendees using AI", icon: "insta-snap" },
        { id: "InstaRecap", value: "InstaRecap", description: "Share Session Summeries, key Takeaways to attendees using AI", icon: "insta-recap" },
        // { id: "Advocacy Poster", value: "Advocacy Poster", description: "Create 'I'm attending' like promotion poster campaigns for your event", icon: "PosterBuilder" },
        { id: "Event Connect", value: "Event Connect", description: "Enable Event connect to access Ai chat and more", icon: "event" },
        { id: "Attendee Mobile App", value: "Attendee Mobile App", description: "Create a mobile app for your event attendees", icon: "mobile-modules" },
        // { id: "Gamification", value: "Gamification", description: "Create a gamification module for your event", icon: "gamification" },
        { id: "Abstracts", value: "Abstracts Management", description: "Create a abstracts module for your event", icon: "abstract" },
      ],
    },
    // {
    //   type: "toggle",
    //   placeholder: "Enable Social Media?",
    //   name: "enableSocialMedia",
    //   validation: "",
    //   default: "",
    //   label: "Enable Social Media?",
    //   group: "Social Media Links",
    //   tag: false,
    //   required: false,
    //   view: true,
    //   add: false,
    //   update: true,
    //   footnote: "Add event's/event organizer's social media profiles",
    //   customClass: "full",
    // },
    {
      type: "text",
      placeholder: "Link your event's email",
      name: "email",
      condition: { item: "enableSocialMedia", if: true, then: "enabled", else: "disabled" },
      validation: "",
      icon: "email",
      suffix: "@eventhex.ai",
      default: "",
      label: "Email",
      group: "Social Media Links",
      tag: false,
      required: false,
      view: true,
      add: false,
      update: true,
      customClass: "half",
    },
    {
      type: "text",
      placeholder: "Link your event's Facebook page",
      name: "facebook",
      condition: { item: "enableSocialMedia", if: true, then: "enabled", else: "disabled" },
      validation: "",
      default: "",
      prefix: "https://www.facebook.com/",
      label: "Facebook URL",
      group: "Social Media Links",
      tag: false,
      required: false,
      view: true,
      add: false,
      update: true,
      customClass: "half",
    },
    {
      type: "text",
      placeholder: "Link your event's Instagram page",
      name: "insta",
      icon: "instagram",
      prefix: "https://www.instagram.com/",
      condition: { item: "enableSocialMedia", if: true, then: "enabled", else: "disabled" },
      validation: "",
      default: "",
      label: "Instagram URL",
      group: "Social Media Links",
      tag: false,
      required: false,
      view: true,
      add: false,
      update: true,
      customClass: "half",
    },
    {
      type: "text",
      placeholder: "Link your event's X page",
      name: "xSocial",
      icon: "x",
      condition: { item: "enableSocialMedia", if: true, then: "enabled", else: "disabled" },
      validation: "",
      default: "",
      label: "X URL",
      group: "Social Media Links",
      tag: false,
      required: false,
      view: true,
      add: false,
      update: true,
      customClass: "half",
    },
    {
      type: "text",
      placeholder: "Link your event's LinkedIn page",
      name: "linkedin",
      icon: "linkedin",
      condition: { item: "enableSocialMedia", if: true, then: "enabled", else: "disabled" },
      validation: "",
      default: "",
      label: "Linkedin URL",
      group: "Social Media Links",
      tag: false,
      required: false,
      view: true,
      add: false,
      update: true,
      customClass: "half",
    },
    {
      type: "text",
      placeholder: "Link your event's Youtube channel",
      name: "youtube",
      icon: "youtube",
      condition: { item: "enableSocialMedia", if: true, then: "enabled", else: "disabled" },
      validation: "",
      default: "",
      label: "Youtube URL",
      group: "Social Media Links",
      tag: false,
      required: false,
      view: true,
      add: false,
      update: true,
      customClass: "half",
    },
    {
      type: "text",
      placeholder: "Link your event's Threads page",
      name: "threads",
      icon: "threads",
      condition: { item: "enableSocialMedia", if: true, then: "enabled", else: "disabled" },
      validation: "",
      default: "",
      label: "Threads URL",
      group: "Social Media Links",
      tag: false,
      required: false,
      view: true,
      add: false,
      update: true,
      customClass: "half",
    },
    {
      type: "text",
      placeholder: "Enter Whatsapp Number with country code",
      name: "whatsapp",
      icon: "whatsapp",
      condition: { item: "enableSocialMedia", if: true, then: "enabled", else: "disabled" },
      validation: "",
      default: "",
      label: "Whatsapp number",
      group: "Social Media Links",
      tag: false,
      required: false,
      view: true,
      add: false,
      update: true,
      customClass: "half",
    },
  ]);

  const [ticketCoupen] = useState(ticketCoupenAttributes);
  const [exhibitor] = useState(exhibitorAttributes);
  const [exhibitorCategory] = useState(exhibitorCategoryAttributes);
  const [boothMember] = useState(boothMemberAttributes);
  const [download] = useState(downloadAttributes);
  const [floorPlan] = useState(floorPlanAttributes);
  const [faq] = useState(faqAttributes);
  const [exhibitorForm] = useState(exhibitorFormAttributes);
  const [passes] = useState(passesAttributes);
  const [sessions] = useState(sessionsAttributes);
  const [sessionSpeaker] = useState(sessionSpeakerAttributes);
  const [sponsors] = useState(sponsorsAttributes);
  const [sponsorCategory] = useState(sponsorCategoryAttributes);
  const [form] = useState(formAttributes);
  const [badge] = useState(badgeAttributes);
  const [attendanceData] = useState(attendanceDataAttributes);
  const [attendanceActions] = useState(attendanceActionsAttributes);
  const [settings] = useState(settingsAttributes);
  const [mobileModules] = useState(mobileModulesAttributes);
  const [paymentHistory] = useState(paymentHistoryAttributes);
  const [partnersSpotlights] = useState(partnersSpotlightsAttributes);
  const [photoPermission] = useState(photoPermissionAttributes);
  const [instance] = useState(instanceAttributes);
  const [instanceData] = useState(instanceDataAttributes);
  const [participantType] = useState(participantTypeAttributes);
  const [emailCampaign] = useState(emailCampaignAttributes);
  const [whatsappCampaign] = useState(whatsappCampaignAttributes);
  const [advocacyPosterFields] = useState(advocacyPosterFieldsAttributes);
  const [audience] = useState(audienceAttributes);
  const [instaRecapSetting] = useState(instaRecapSettingAttributes);
  const [policy] = useState(policyAttributes);
  const [cookies] = useState(cookiesAttributes);
  const [privacyPolicy] = useState(policiesAttributes);
  const [notificationModules] = useState(notificationModulesAttributes);
  const [speakers] = useState(speakersAttributes);
  const [ticketAdmin] = useState(ticketAdminAttributes);
  const [notificationQueue] = useState(notificationQueueAttributes);
  const [configureApp] = useState(configureAppAttributes);
  const [requestApp] = useState(requestAppAttributes);
  const [accessCode] = useState(accessCodeAttributes);
  const [ticketCategory] = useState(ticketCategoryAttributes);
  const [manageChallenges] = useState(manageChallengesAttributes);
  const [leaderboard] = useState(leaderboardAttributes);
  // const [rewards] = useState(rewardsAttributes);
  const [translationSettings] = useState(translationSettingsAttributes);

  // Reviewer assignment form attributes
  const [reviewerAssignmentAttributes] = useState([
    {
      type: "multiSelect",
      name: "reviewers",
      label: "Assign Reviewers",
      placeholder: "Select reviewers",
      required: true,
      view: true,
      add: true,
      update: true,
      apiType: "API",
      // Endpoint that returns reviewers filtered by event via ?event=<id>
      selectApi: "reviewer/reviewer-event",
      showItem: "value",
      icon: "user",
      customClass: "full",
      params: [
        {
          name: "event",
          value: "{{eventId}}",
          dynamic: true,
        },
      ],
    },
  ]);

  const [actions] = useState(
    checkprivilege([privileges.ticketAdmin], userType)
      ? [
        {
          element: "button",
          type: "subTabs",
          id: "registration",
          name: "registration",
          title: "Registrations",
          icon: "registration",
          tabs: [
            {
              type: "title",
              title: "ATTENDEES",
              id: "ATTENDEES",
            },
            {
              element: "button",
              type: "subTabs",
              id: "ticket-registration",
              name: "ticket-registration",
              title: "Registration",
              icon: "ticket",
              dynamicTabs: {
                api: userRole === "Ticket Admin" ? "ticket/ticket-admin" : "ticket/select/all/Ticket",
                preFilter:
                  userRole === "Ticket Admin"
                    ? []
                    : [
                      {
                        id: "all",
                        value: "All",
                        preFilterData: { event: "{{eventId}}" }, // Will load all registrations for the event
                      },
                    ],
                customFilter: "ticketId",
                template: {
                  type: "custom",
                  id: "ticket-registration-attendee",
                  title: userRole === "Ticket Admin" ? "Tickets" : "All",
                  icon: "ticket",
                  page: "attendee",
                  ticketType: "Ticket",
                  description: "View and manage registered participants for this ticket type",
                  params: {
                    api: `ticket-registration`,
                    parentReference: "event",
                    icon: "ticket",
                    itemTitle: {
                      name: "fullName",
                      type: "text",
                      collection: "authentication",
                    },
                    shortName: "Registration",
                    addPrivilege: true,
                    delPrivilege: true,
                    updatePrivilege: true,
                    customClass: "medium",
                    formMode: `single`,
                  },
                },
              },
            },
          ],
        },
      ]
      : [
        {
          element: "button",
          type: "custom",
          id: "dashboard",
          icon: "dashboard",
          title: "Dashboard",
          page: "dashboard",
        },
        {
          element: "button",
          type: "subTabs",
          id: "configure",
          title: "Setup",
          icon: "configure",
          tabs: [
            {
              type: "title",
              title: "BASIC DETAILS",
              id: "BASIC DETAILS",
            },
            {
              type: "information",
              title: "Event Info",
              icon: "info",
              id: "information",
              updateButtonText: "Update Event",
              submitButtonText: "Create Event",
              formTabTheme: "tab",
              params: {
                updateButtonText: "Update Event",
                submitButtonText: "Create Event",
              },
            },
            {
              element: "button",
              type: "subList",
              id: "ticket",
              title: "Ticket",
              icon: "ticket",
              attributes: ticket,
              params: {
                api: `ticket`,
                parentReference: "event",
                icon: "ticket",
                itemTitle: { name: "title", type: "text", collection: "" },
                preFilter: { type: "Ticket" },
                shortName: "Ticket",
                description: "Create and manage different ticket types with customizable pricing and availability ",
                submitButtonText: "Create",
                addPrivilege: true,
                listSort: true,
                dotMenu: true,
                delPrivilege: true,
                updatePrivilege: true,
                popupMode: "small",
                showEditInDotMenu: true,
                formTabTheme: "accordion2",
                actions: [
                  {
                    element: "button",
                    type: "callback",
                    callback: (item, data) => {
                      setOpenItemData({ item, data });
                      setOpenMenuSetup(true);
                    },
                    icon: "form-builder",
                    title: "Form Builder",
                    params: {
                      itemTitle: { name: "title", type: "text", collection: "" },
                      shortName: "Form Builder",
                      addPrivilege: true,
                      delPrivilege: true,
                      updatePrivilege: true,
                      customClass: "full-page",
                    },
                    actionType: "button",
                  },
                  {
                    element: "button",
                    type: "callback",
                    callback: (item, data) => {
                      setOpenItemData({ item, data });
                      setOpenTicketResponse(true);
                    },
                    icon: "textarea",
                    title: "View Responses",
                    params: {
                      itemTitle: { name: "title", type: "text", collection: "" },
                      shortName: "View Responses",
                      addPrivilege: false,
                      delPrivilege: false,
                      updatePrivilege: false,
                      customClass: "full-page",
                    },
                    actionType: "button",
                  },
                  {
                    element: "button",
                    type: "callback",
                    callback: (item, data) => {
                      const eventContext = { event: { _id: slug } };
                      const ticketData = { ...data, ...eventContext };
                      handleShowQRCode(null, ticketData);
                    },
                    icon: "qr",
                    title: "View QR",
                    params: {
                      itemTitle: { name: "title", type: "text", collection: "" },
                      shortName: "View QR",
                      addPrivilege: false,
                      delPrivilege: false,
                      updatePrivilege: false,
                    },
                    // actionType: "button",
                  },
                  // {
                  //   element: "button",
                  //   type: "callback",
                  //   callback: (item, data) => {
                  //     let patchedData = { ...data };
                  //     if (item && (item.ticket?._id || item.ticket)) {
                  //       patchedData._id = item.ticket._id || item.ticket;
                  //     } else if (item && Array.isArray(item.tickets) && item.tickets.length > 0) {
                  //       patchedData._id = item.tickets[0]._id || item.tickets[0].id || item.tickets[0];
                  //     }
                  //     // Ensure event is present
                  //     if (!patchedData.event && item.event) {
                  //       patchedData.event = item.event;
                  //     }
                  //     setOpenItemData({ item, data: patchedData });
                  //     setOpenBadgeSetup(true);
                  //   },
                  //   icon: "badge",
                  //   title: "Badge Builder",
                  //   params: {
                  //     itemTitle: { name: "title", type: "text", collection: "" },
                  //     shortName: "Badge Builder",
                  //     addPrivilege: true,
                  //     delPrivilege: true,
                  //     updatePrivilege: true,
                  //     customClass: "full-page",
                  //   },
                  // },
                ],
                openPage: false,
                itemOpenMode: null,
              },
            },
            {
              element: "button",
              type: "custom",
              id: "custom-domain",
              icon: "url",
              title: "Custom Domain",
              page: "domain",
            },
            {
              type: "title",
              title: "PROGRAM",
              id: "PROGRAM",
              visibilityCondition: {
                conditions: [{ item: "coreModules", if: "Sessions & Speakers", operator: "equals" }],
                operator: "AND",
                then: true,
                else: false,
              },
            },
            {
              element: "button",
              type: "custom",
              id: "sessions",
              icon: "session",
              title: "Sessions",
              page: "sessions",
              visibilityCondition: {
                conditions: [{ item: "coreModules", if: "Sessions & Speakers", operator: "equals" }],
                operator: "AND",
                then: true,
                else: false,
              },
            },
            {
              element: "button",
              type: "custom",
              id: "speakers",
              icon: "speakers",
              title: "Speakers",
              page: "speakers",
              visibilityCondition: {
                conditions: [{ item: "coreModules", if: "Sessions & Speakers", operator: "equals" }],
                operator: "AND",
                then: true,
                else: false,
              },
            },
            // {
            //   element: "button",
            //   type: "subList",
            //   id: "speakers",
            //   icon: "speakers",
            //   visibilityCondition: {
            //     conditions: [{ item: "coreModules", if: "Sessions & Speakers", operator: "equals" }],
            //     operator: "AND",
            //     then: true,
            //     else: false,
            //   },
            //   title: "Speakers",
            //   attributes: speakers,
            //   params: {
            //     api: `speakers`,
            //     parentReference: "event",
            //     itemTitle: { name: "name", type: "text", collection: "" },
            //     shortName: "Speakers",
            //     description: "Create and manage promotional codes and discounts for ticket purchases",
            //     addPrivilege: true,
            //     delPrivilege: true,
            //     updatePrivilege: true,
            //     customClass: "medium",
            //     formMode: `single`,
            //     viewMode: "table",
            //   },
            // },
            {
              type: "title",
              title: "REGISTRATION",
            },
            {
              element: "button",
              type: "subList",
              id: "participant-type",
              title: "Participant Type",
              icon: "participant-type",
              attributes: participantType,
              params: {
                api: `participant-type`,
                parentReference: "event",
                itemTitle: { name: "name", type: "text", collection: "" },
                shortName: "Participant Type",
                description: "Define different types of participants and their access levels",
                formLayout: "single",
                addPrivilege: true,
                updatePrivilege: true,
                delPrivilege: true,
                popupMode: "small",
                openPage: false,
                itemOpenMode: null,
                actions: [
                  {
                    element: "button",
                    type: "callback",
                    callback: (item, data) => {
                      setOpenItemData({ item, data });
                      setOpenMenuSetup(true);
                    },
                    icon: "form-builder",
                    title: "Form Builder",
                    condition: { item: "status", if: true, then: true, else: false },
                    params: {
                      itemTitle: { name: "title", type: "text", collection: "" },
                      shortName: "Form Builder",
                      addPrivilege: true,
                      delPrivilege: true,
                      updatePrivilege: true,
                      customClass: "full-page",
                    },
                    actionType: "button",
                  },
                  {
                    element: "button",
                    type: "callback",
                    callback: (item, data) => {
                      // Generate embed code with event domain and slug
                      const generateEmbedCode = (eventData) => {
                        console.log("[Event Page] Generating embed code for event:", eventData);
                        const domain = eventData?.domain || "m1destinations.eventhex.ai";
                        const slug = eventData?.slug || "explore-rajasthan";
                        const embedUrl = `https://${eventData.event._id}.eventhex.ai/embed/${eventData.ticket.slug}`;
                        return `<div onclick="event.stopPropagation()">  
  <iframe   
    src="${embedUrl}"   
    style="
      position: fixed; 
      top: 0; 
      left: 50%; 
      transform: translateX(-50%);
      width: 80%; 
      height: 100%;
      border: none; 
      margin: 0; 
      padding: 0; 
      overflow: hidden; 
      z-index: 999999;
    "  
    allowfullscreen>  
  </iframe>  
</div>`;
                      };
                      // Copy embed code to clipboard
                      const copyEmbedToClipboard = async (embedCode) => {
                        try {
                          if (navigator.clipboard && navigator.clipboard.writeText) {
                            await navigator.clipboard.writeText(embedCode);
                            toast.success("Embed code copied to clipboard!");
                            if (props?.setMessage) {
                              props.setMessage({
                                type: 1,
                                content: "Embed code copied to clipboard!",
                                icon: "success",
                                title: "Success",
                              });
                            }
                          } else {
                            const textArea = document.createElement("textarea");
                            textArea.value = embedCode;
                            textArea.style.position = "fixed";
                            textArea.style.left = "-999999px";
                            textArea.style.top = "-999999px";
                            document.body.appendChild(textArea);
                            textArea.focus();
                            textArea.select();
                            try {
                              document.execCommand("copy");
                              textArea.remove();
                              toast.success("Embed code copied to clipboard!");
                              if (props?.setMessage) {
                                props.setMessage({
                                  type: 1,
                                  content: "Embed code copied to clipboard!",
                                  icon: "success",
                                  title: "Success",
                                });
                              }
                            } catch (err) {
                              textArea.remove();
                              throw err;
                            }
                          }
                        } catch (error) {
                          toast.error("Failed to copy embed code to clipboard");

                          if (props?.setMessage) {
                            props.setMessage({
                              type: 1,
                              content: "Failed to copy embed code to clipboard",
                              icon: "error",
                              title: "Error",
                            });
                          }
                        }
                      };
                      const embedCode = generateEmbedCode(data);
                      copyEmbedToClipboard(embedCode);
                    },
                    icon: "embed",
                    title: "Copy Embed",
                    params: {
                      itemTitle: { name: "title", type: "text", collection: "" },
                      shortName: "Copy Embed",
                      addPrivilege: true,
                      delPrivilege: true,
                      updatePrivilege: true,
                      customClass: "full-page",
                      showInDotMenu: true,
                    },
                  },

                  // {
                  //   element: "button",
                  //   type: "callback",
                  //   callback: (item, data) => {
                  //     setOpenItemData({ item, data });
                  //     setOpenParticipantResponse(true);
                  //   },
                  //   icon: "textarea",
                  //   title: "View Responses",
                  //   condition: { item: "status", if: true, then: true, else: false },
                  //   params: {
                  //     itemTitle: { name: "name", type: "text", collection: "" },
                  //     shortName: "View Responses",
                  //     addPrivilege: false,
                  //     delPrivilege: false,
                  //     updatePrivilege: false,
                  //     customClass: "full-page",
                  //   },
                  //   actionType: "button",
                  // },
                ],
              },
            },
            {
              element: "button",
              type: "subList",
              id: "form",
              title: "Form",
              icon: "form-builder",
              attributes: form,
              params: {
                api: `ticket`,
                parentReference: "event",
                icon: "form-builder",
                itemTitle: { name: "title", type: "text", collection: "" },
                shortName: "Form",
                description: "Create and customize registration forms for different ticket types",
                formLayout: "single",
                delPrivilege: true,
                itemOpenMode: {
                  type: "callback",
                  callback: (data) => {
                    setOpenItemData({ data });
                    setOpenMenuSetup(true);
                  },
                },
                updatePrivilege: true,
                addPrivilege: true,
                customClass: "medium",
                formMode: `single`,
                popupMode: "full-page",
                popupMenu: "vertical-menu",
                viewMode: "table",
                showEditInDotMenu: false,
                openPage: false,
                // itemOpenMode: null,
                actions: [
                  {
                    element: "button",
                    type: "custom",
                    id: "ticket-registration",
                    icon: "textarea",
                    title: "Responses",
                    page: "regdata",
                  },
                  {
                    element: "button",
                    type: "callback",
                    callback: (item, data) => {
                      setOpenItemData({ item, data });
                      setOpenFormResponse(true);
                    },
                    icon: "textarea",
                    title: "View Responses",
                    params: {
                      itemTitle: { name: "title", type: "text", collection: "" },
                      shortName: "View Responses",
                      addPrivilege: true,
                      delPrivilege: true,
                      updatePrivilege: true,
                      customClass: "full-page",
                      showInDotMenu: true,
                    },
                  },
                  {
                    element: "button",
                    type: "callback",
                    callback: (item, data) => {
                      setOpenItemData({ item, data });
                      setOpenMenuSetup(true);
                    },
                    icon: "form-builder",
                    title: "Form Builder",
                    params: {
                      itemTitle: { name: "title", type: "text", collection: "" },
                      shortName: "Form Builder",
                      addPrivilege: true,
                      delPrivilege: true,
                      updatePrivilege: true,
                      customClass: "full-page",
                    },
                    actionType: "button",
                  },
                  {
                    element: "button",
                    type: "callback",
                    callback: (item, data) => {
                      // Generate embed code with event domain and form slug
                      const generateEmbedCode = (formData) => {
                        const domain = formData?.domain || "m1destinations.eventhex.ai";
                        const slug = formData?.slug || "volunteer-registration";
                        const embedUrl = `https://${formData.event._id}.eventhex.ai/embed/${formData.slug}`;

                        return `<div onclick="event.stopPropagation()">  
  <iframe   
    src="${embedUrl}"   
    style="
      position: fixed; 
      top: 0; 
      left: 50%; 
      transform: translateX(-50%);
      width: 80%; 
      height: 100%;
      border: none; 
      margin: 0; 
      padding: 0; 
      overflow: hidden; 
      z-index: 999999;
    "  
    allowfullscreen>  
  </iframe>  
</div>`;
                      };

                      // Copy embed code to clipboard
                      const copyEmbedToClipboard = async (embedCode) => {
                        try {
                          if (navigator.clipboard && navigator.clipboard.writeText) {
                            await navigator.clipboard.writeText(embedCode);

                            // Show success message
                            toast.success("Form embed code copied to clipboard!");

                            // Also use setMessage if available for additional feedback
                            if (props?.setMessage) {
                              props.setMessage({
                                type: 1,
                                content: "Form embed code copied to clipboard!",
                                icon: "success",
                                title: "Success",
                              });
                            }
                          } else {
                            // Fallback for older browsers
                            const textArea = document.createElement("textarea");
                            textArea.value = embedCode;
                            textArea.style.position = "fixed";
                            textArea.style.left = "-999999px";
                            textArea.style.top = "-999999px";
                            document.body.appendChild(textArea);
                            textArea.focus();
                            textArea.select();

                            try {
                              document.execCommand("copy");
                              textArea.remove();

                              toast.success("Form embed code copied to clipboard!");

                              if (props?.setMessage) {
                                props.setMessage({
                                  type: 1,
                                  content: "Form embed code copied to clipboard!",
                                  icon: "success",
                                  title: "Success",
                                });
                              }
                            } catch (err) {
                              textArea.remove();
                              throw err;
                            }
                          }
                        } catch (error) {
                          toast.error("Failed to copy form embed code to clipboard");

                          if (props?.setMessage) {
                            props.setMessage({
                              type: 1,
                              content: "Failed to copy form embed code to clipboard",
                              icon: "error",
                              title: "Error",
                            });
                          }
                        }
                      };

                      // Execute the copy operation
                      const embedCode = generateEmbedCode(data);
                      copyEmbedToClipboard(embedCode);
                    },
                    icon: "embed",
                    title: "Copy Embed",
                    params: {
                      itemTitle: { name: "title", type: "text", collection: "" },
                      shortName: "Copy Embed",
                      addPrivilege: true,
                      delPrivilege: true,
                      updatePrivilege: true,
                      customClass: "full-page",
                      showInDotMenu: true,
                    },
                  },
                ],
              },
            },
            // {
            //   element: "button",
            //   type: "subList",
            //   id: "badge",
            //   icon: "badge",
            //   title: "Badges",
            //   attributes: badge,
            //   params: {
            //     api: `badge`,
            //     parentReference: "event",
            //     icon: "badge",
            //     itemTitle: { name: "title", type: "text", collection: "" },
            //     shortName: "Badge",
            //     description: "Design and manage attendee badges with customizable templates",
            //     delPrivilege: true,
            //     addPrivilege: true,
            //     updatePrivilege: true,
            //     customClass: "medium",
            //     formMode: `single`,
            //     popupMode: "full-page",
            //     popupMenu: "vertical-menu",
            //     viewMode: "table",
            //     actions: [
            //       {
            //         element: "toggle",
            //         actionType: "toggle",
            //         id: "badge-toggle",
            //         title: "Enabled",
            //         dataKey: "isActive",
            //         api: `badge`,
            //       },
            //       {
            //         element: "button",
            //         type: "callback",
            //         callback: (item, data) => {
            //           setOpenItemData({ item, data });
            //           setOpenBadgeSetup(true);
            //         },
            //         icon: "badge",
            //         title: "Badge Builder",
            //         params: {
            //           itemTitle: { name: "title", type: "text", collection: "" },
            //           shortName: "Badge Builder",
            //           addPrivilege: true,
            //           delPrivilege: true,
            //           updatePrivilege: true,
            //           customClass: "full-page",
            //         },
            //         actionType: "button",
            //       },
            //     ],
            //   },
            // },
            {
              element: "button",
              type: "subList",
              id: "discount-coupons",
              icon: "coupon",
              visibilityCondition: {
                conditions: [{ item: "ticketType", if: "paid", operator: "equals" }],
                operator: "AND",
                then: true,
                else: false,
              },
              itemTitle: "code",
              title: "Discount Coupons",
              attributes: ticketCoupen,
              params: {
                api: `coupen`,
                parentReference: "event",
                itemTitle: { name: "code", type: "text", collection: "" },
                shortName: "Discount Coupons",
                description: "Create and manage promotional codes and discounts for ticket purchases",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                formMode: `single`,
                viewMode: "table",
                openPage: false,
                itemOpenMode: null,
              },
            },
          ],
        },
        {
          element: "button",
          type: "subTabs",
          id: "registration",
          name: "registration",
          title: "Registrations",
          icon: "registration",
          tabs: [
            {
              type: "title",
              title: "ATTENDEES",
              id: "ATTENDEES",
            },
            // {
            //   element: "button",
            //   type: "custom",
            //   id: "registrations",
            //   icon: "attendees",
            //   title: "Registrations",
            //   description: "View and manage all registered participants for your event",
            //   page: "attendee",
            //   ticketType: "Ticket",
            // },
            {
              element: "button",
              type: "subTabs",
              id: "ticket-registration",
              name: "ticket-registration",
              title: "Registration",
              icon: "ticket",
              dynamicTabs: {
                api: userRole === "Ticket Admin" ? "ticket/ticket-admin" : "ticket/select/all/Ticket",
                preFilter:
                  userRole === "Ticket Admin"
                    ? []
                    : [
                      {
                        id: "all",
                        value: "All",
                        preFilterData: { event: "{{eventId}}" }, // Will load all registrations for the event
                      },
                    ],
                customFilter: "ticketId",
                template: {
                  type: "custom",
                  id: "ticket-registration-attendee",
                  title: userRole === "Ticket Admin" ? "Tickets" : "All",
                  icon: "ticket",
                  page: "attendee",
                  ticketType: "Ticket",
                  description: "View and manage registered participants for this ticket type",
                  params: {
                    api: `ticket-registration`,
                    parentReference: "event",
                    icon: "ticket",
                    itemTitle: {
                      name: "fullName",
                      type: "text",
                      collection: "authentication",
                    },
                    shortName: "Registration",
                    addPrivilege: true,
                    delPrivilege: true,
                    updatePrivilege: true,
                    customClass: "medium",
                    formMode: `single`,
                  },
                },
              },
            },
            // {
            //   element: "button",
            //   type: "custom",
            //   id: "approvals",
            //   icon: "registration-approval",
            //   title: "Approvals",
            //   description: "Review and approve pending registration requests requiring manual confirmation",
            //   page: "approval",
            //   ticketType: "Ticket",
            //   visibilityCondition: {
            //     conditions: [{ item: "hasTicketsNeedingApproval", if: true, operator: "equals" }],
            //     operator: "AND",
            //     then: true,
            //     else: false,
            //   },
            // },
            {
              type: "title",
              title: "PARTICIPANT TYPES",
              id: "PARTICIPANT TYPES",
              visibilityCondition: {
                conditions: [{ item: "hasActiveParticipantTypes", if: true, operator: "equals" }],
                operator: "AND",
                then: true,
                else: false,
              },
            },
            {
              element: "button",
              type: "subTabs",
              id: "participant-type-registration",
              name: "participant-type-registration",
              title: "Registration",
              icon: "participant-type",
              visibilityCondition: {
                conditions: [{ item: "hasActiveParticipantTypes", if: true, operator: "equals" }],
                operator: "AND",
                then: true,
                else: false,
              },
              dynamicTabs: {
                api: "participant-type/tickets",
                customFilter: "ticketId",
                template: {
                  type: "custom",
                  id: "participant-type-registration-attendee",
                  title: userRole === "Ticket Admin" ? "Tickets" : "All",
                  icon: "participant-type",
                  page: "attendee",
                  ticketType: "ParticipantType",
                  description: "View and manage registered participants for this ticket type",
                  params: {
                    api: `ticket-registration`,
                    parentReference: "event",
                    icon: "participant-type",
                    itemTitle: {
                      name: "fullName",
                      type: "text",
                      collection: "authentication",
                    },
                    shortName: "Registration",
                    addPrivilege: true,
                    delPrivilege: true,
                    updatePrivilege: true,
                    customClass: "medium",
                    formMode: `single`,
                  },
                },
              },
            },
            // {
            //   element: "button",
            //   type: "custom",
            //   id: "participantApproval",
            //   icon: "registration-approval",
            //   title: "Approvals",
            //   description: "Review and approve pending registration requests requiring manual confirmation",
            //   page: "participantApproval",
            //   ticketType: "Ticket",
            //   visibilityCondition: {
            //     conditions: [{ item: "hasTicketsNeedingApproval", if: true, operator: "equals" }],
            //     operator: "AND",
            //     then: true,
            //     else: false,
            //   },
            // },
            {
              type: "title",
              title: "ORDERS",
              id: "ORDERS",
              visibilityCondition: {
                conditions: [{ item: "ticketType", if: "paid", operator: "equals" }],
                operator: "AND",
                then: true,
                else: false,
              },
            },
            {
              element: "button",
              type: "subList",
              id: "orders",
              title: "Orders",
              icon: "orders",
              visibilityCondition: {
                conditions: [{ item: "ticketType", if: "paid", operator: "equals" }],
                operator: "AND",
                then: true,
                else: false,
              },
              attributes: paymentHistory,
              params: {
                api: `orders/status`,
                parentReference: "event",
                itemTitle: { name: "fullName", type: "text", collection: "authentication" },
                itemDescription: { name: "totalAmount", type: "text" },
                shortName: "Orders",
                description: "Track all ticket purchases and monitor payment status",
                addPrivilege: false,
                delPrivilege: false,
                updatePrivilege: false,
                exportPrivilege: false,
                actions: createPaymentHistoryActions(setShowPDFPreview, setPdfData, props.setMessage),
                openPageContent: (data) => {
                  return <OrderView data={data} />;
                },
                customClass: "medium",
                formMode: "double",
                viewMode: "table",
                popupMode: "small",
                labels: [
                  { key: "No of orders", title: "NO OF ORDERS", icon: "orders", backgroundColor: "rgba(0, 200, 81, 0.15)", color: "#006B27" },
                  { key: "today order", title: "TODAY ORDER", icon: "checked", backgroundColor: "rgba(0, 122, 255, 0.15)", color: "#004999" },
                  { key: "Failed orders", title: "FAILED ORDERS", icon: "close", backgroundColor: "rgba(255, 69, 58, 0.15)", color: "#99231B" },
                  { key: "Total amount", title: "TOTAL AMOUNT", icon: "currency", backgroundColor: "rgba(88, 86, 214, 0.15)", color: "#2B2A69" },
                ],
              },
            },
            {
              element: "button",
              type: "subList",
              id: "cancelled-orders",
              title: "Cancelled Orders",
              icon: "orders",
              visibilityCondition: {
                conditions: [{ item: "ticketType", if: "paid", operator: "equals" }],
                operator: "AND",
                then: true,
                else: false,
              },
              attributes: paymentHistory,
              params: {
                api: `orders/status?status=failed`,
                parentReference: "event",
                itemTitle: { name: "fullName", type: "text", collection: "authentication" },
                shortName: "Cancelled Orders",
                description: "Track cancelled and failed payment orders",
                addPrivilege: false,
                delPrivilege: false,
                updatePrivilege: false,
                exportPrivilege: true,
                actions: createPaymentHistoryActions(setShowPDFPreview, setPdfData, props.setMessage),
                customClass: "medium",
                formMode: "double",
                viewMode: "table",
              },
            },
            {
              type: "title",
              title: "CHECK-IN",
              id: "CHECK-IN",
            },
            {
              element: "button",
              type: "subTabs",
              id: "attendance-registration",
              name: "attendance-registration",
              title: "Attendance",
              icon: "attendance",
              dynamicTabs: {
                api: userRole === "Ticket Admin" ? "ticket/ticket-admin" : "ticket/select/all/Ticket",
                preFilter:
                  userRole === "Ticket Admin"
                    ? []
                    : [
                      {
                        id: "all",
                        value: "All",
                        preFilterData: { event: "{{eventId}}" },
                      },
                    ],
                customFilter: "ticketId",
                template: {
                  type: "custom",
                  id: "attendance-registration-attendee",
                  title: userRole === "Ticket Admin" ? "Tickets" : "All",
                  icon: "attendance",
                  page: "attendee",
                  ticketType: "Ticket",
                  pageMode: "check-in", //"registration" or "check-in"
                  description: "Monitor participant check-ins and track overall event attendance",
                  params: {
                    api: `attendance/check-in`,
                    parentReference: "event",
                    icon: "attendance",
                    itemTitle: {
                      name: "fullName",
                      type: "text",
                      collection: "authentication",
                    },
                    shortName: "Attendance",
                    addPrivilege: false,
                    delPrivilege: true,
                    updatePrivilege: true,
                    customClass: "medium",
                    formMode: `single`,
                  },
                },
              },
            },
            {
              element: "button",
              type: "subList",
              id: "instance",
              title: "Instance",
              icon: "instance",
              attributes: instanceNewAttributes,
              params: {
                api: `instance`,
                parentReference: "event",
                itemTitle: { name: "title", type: "text", collection: "" },
                shortName: "Instance",
                description: "Set up and manage scanning instances to be used in different location which tickets can be validated or scanned",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                showEditInDotMenu: false,
                customClass: "medium",
                formMode: "double",
                formLayout: "center",
                formTabTheme: "steps",
                openPage: false,
              },
            },
            {
              element: "button",
              type: "subTabs",
              id: "instance-check-in",
              title: "Instance Check-In",
              icon: "instance",
              dynamicTabs: {
                api: "instance/select",
                template: {
                  element: "button",
                  type: "subList",
                  id: "instance-all",
                  title: userRole === "Ticket Admin" ? "Tickets" : "All",
                  icon: "all",
                  attributes: instanceData,
                  params: {
                    api: `instance/attendance`,
                    parentReference: "event",
                    itemTitle: { name: "firstName", type: "text", collection: "" },
                    preFilter: { type: "all" },
                    labels: [
                      { key: "checkIn", title: "NO OF CHECK-IN", icon: "check-in", backgroundColor: "rgba(0, 200, 81, 0.15)", color: "#006B27" },
                      { key: "pending", title: "PENDING", icon: "pending", backgroundColor: "rgba(255, 69, 58, 0.15)", color: "#99231B" },
                      { key: "checkInRate", title: "CHECK-IN RATE", icon: "check-in-rate", backgroundColor: "rgba(0, 122, 255, 0.15)", color: "#004999" },
                      { key: "noShow", title: "NO-SHOW RATE", icon: "no-show", backgroundColor: "rgba(153, 153, 6, 0.15)", color: "#856404" },
                    ],
                    shortName: "Instance Check-In",
                    description: "Monitor and manage ticket scans for assigned scanning instances",
                    addPrivilege: false,
                    delPrivilege: false,
                    exportPrivilege: true,
                    updatePrivilege: false,
                    customClass: "medium",
                    viewMode: "table",
                    openPage: false,
                    itemOpenMode: null,
                  },
                },
              },
            },
          ],
        },
        {
          element: "button",
          type: "subList",
          id: "design",
          title: "Website",
          icon: "display",
          tabs: [
            {
              type: "title",
              title: "WEBSITE",
              id: "WEBSITE",
            },
            {
              element: "button",
              type: "custom",
              id: "layout-content",
              icon: "registration-approval",
              title: "Layout & Content",
              page: "layoutContent",
            },
            {
              element: "button",
              type: "custom",
              id: "menu-settings",
              icon: "menu",
              title: "Menu Settings",
              page: "menuSettings",
            },
            {
              element: "button",
              type: "custom",
              id: "theme-settings",
              title: "Theme Settings",
              icon: "app-setting",
              content: ColorPicker,
            },
            {
              element: "button",
              type: "custom",
              id: "integrations",
              icon: "integration",
              title: "Integrations",
              page: "integrations",
            },
            {
              element: "button",
              type: "subList",
              id: "website-settings",
              title: "Website Settings",
              icon: "display",
              attributes: policy,
              params: {
                api: `policy`,
                parentReference: "event",
                itemTitle: { name: "accessibility", type: "", collection: "" },
                shortName: "Website Settings",
                viewMode: "single",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                formMode: "single",
              },
            },
            {
              element: "button",
              type: "subList",
              id: "cookies",
              title: "Cookies",
              icon: "cookie",
              attributes: cookies,
              params: {
                api: `policy`,
                parentReference: "event",
                itemTitle: { name: "cookie", type: "", collection: "" },
                shortName: "Cookies",
                viewMode: "single",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                formMode: "single",
              },
            },
          ],
        },
        {
          element: "button",
          type: "subTabs",
          id: "exhibitor",
          title: "Exhibitors",
          visibilityCondition: {
            conditions: [{ item: "coreModules", if: "Exhibitors & Sponsors", operator: "equals" }],
            operator: "AND",
            then: true,
            else: false,
          },
          icon: "exhibitor",
          tabs: [
            {
              type: "title",
              title: "EXHIBITOR",
              id: "EXHIBITOR",
            },
            {
              element: "button",
              type: "subList",
              id: "exhibitor-list",
              title: "Exhibitors",
              icon: "exhibitor",
              attributes: exhibitor,
              params: {
                api: `ticket-registration/exhibitor`,
                parentReference: "event",
                itemTitle: { name: "firstName", type: "text", collection: "" },
                shortName: "Exhibitors",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                formMode: "single",
                viewMode: "table",
                showEditInDotMenu: false,
                openPage: false,
                itemOpenMode: null,
                actions: [
                  {
                    element: "button",
                    type: "callback",
                    callback: (item, data) => {
                      setOpenItemData({ item, data });
                      setOpenCompanyProfile(true);
                    },
                    icon: "info",
                    title: "Details",
                    params: {
                      itemTitle: { name: "companyName", type: "text", collection: "" },
                      shortName: "Details",
                      addPrivilege: true,
                      delPrivilege: true,
                      updatePrivilege: true,
                      customClass: "full-page",
                    },
                    actionType: "button",
                  },
                  {
                    element: "button",
                    type: "callback",
                    callback: (item, data) => {
                      setOpenItemData({ item, data });
                      setOpenTeamManagement(true);
                    },
                    icon: "users",
                    title: "Team Management",
                    params: {
                      itemTitle: { name: "companyName", type: "text", collection: "" },
                      shortName: "Team Management",
                      addPrivilege: true,
                      delPrivilege: true,
                      updatePrivilege: true,
                      customClass: "full-page",
                    },
                    actionType: "button",
                  },
                  {
                    element: "button",
                    type: "callback",
                    callback: (item, data) => {
                      setOpenItemData({ item, data });
                      setOpenProductCatalog(true);
                    },
                    icon: "package",
                    title: "Product Catalogue",
                    params: {
                      itemTitle: { name: "companyName", type: "text", collection: "" },
                      shortName: "Product Catalogue ",
                      addPrivilege: true,
                      delPrivilege: true,
                      updatePrivilege: true,
                      customClass: "full-page",
                    },
                    actionType: "button",
                  },
                ],
              },
            },
            {
              element: "button",
              type: "subList",
              id: "exhibitor-category",
              title: "Exhibitor Package",
              icon: "exhibitor-category",
              attributes: exhibitorCategory,
              params: {
                api: `exhibitor-category`,
                parentReference: "event",
                itemTitle: { name: "categoryName", type: "text", collection: "" },
                shortName: "Exhibitor Package",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                openPage: false,
                itemOpenMode: null,
              },
            },
            // {
            //   element: "button",
            //   type: "subList",
            //   id: "booth-members",
            //   title: "Booth Member",
            //   icon: "booth-member",
            //   attributes: boothMember,
            //   params: {
            //     api: `ticket-registration/boothmember`,
            //     parentReference: "event",
            //     itemTitle: { name: "fullName", type: "text", collection: "" },
            //     shortName: "Booth Member",
            //     addPrivilege: true,
            //     delPrivilege: true,
            //     updatePrivilege: true,
            //     customClass: "medium",
            //     openPage: false,
            //     itemOpenMode: null,
            //   },
            // },
            {
              type: "title",
              title: "SPONSOR",
              id: "SPONSOR",
            },
            {
              element: "button",
              type: "subList",
              id: "sponsors-list",
              title: "Sponsors",
              icon: "sponsor-list",
              attributes: sponsors,
              params: {
                api: `ticket-registration/sponsor`,
                parentReference: "event",
                itemTitle: { name: "title", type: "text", collection: "" },
                shortName: "Sponsors",
                description: "Manage event sponsors and their promotional materials",
                submitButtonText: "Create",
                profileImage: "logo",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                viewMode: "table",
                openPage: false,
                itemOpenMode: null,
              },
            },
            {
              element: "button",
              type: "subList",
              id: "sponsor-category",
              title: "Sponsor Package",
              icon: "sponsor-category",
              attributes: sponsorCategory,
              params: {
                api: `sponsor-category`,
                parentReference: "event",
                itemTitle: { name: "sponsorCategory", type: "text", collection: "" },
                shortName: "Sponsor Package",
                description: "Add sponsor categories to your event",
                submitButtonText: "Create",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                viewMode: "table",
                openPage: false,
                itemOpenMode: null,
              },
            },
            {
              type: "title",
              title: "ADDITIONAL",
              id: "ADDITIONAL",
            },
            {
              element: "button",
              type: "subList",
              id: "download",
              title: "Download",
              icon: "download",
              attributes: download,
              params: {
                api: `download`,
                parentReference: "event",
                itemTitle: { name: "title", type: "text", collection: "" },
                shortName: "Download",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                openPage: false,
                itemOpenMode: null,
              },
            },
            {
              element: "button",
              type: "subList",
              id: "floor-plan",
              title: "Floor Plan",
              icon: "textarea",
              attributes: floorPlan,
              params: {
                api: `floor-plan`,
                parentReference: "event",
                itemTitle: { name: "title", type: "text", collection: "" },
                shortName: "Floor Plan",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                openPage: false,
                itemOpenMode: null,
              },
            },
            {
              element: "button",
              type: "subList",
              id: "faq",
              title: "Faq",
              icon: "faq",
              attributes: faq,
              params: {
                api: `faq`,
                parentReference: "event",
                itemTitle: { name: "question", type: "text", collection: "" },
                shortName: "Faq",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                openPage: false,
                itemOpenMode: null,
              },
            },
            {
              element: "button",
              type: "subList",
              id: "passes",
              title: "Passes",
              icon: "check-in",
              attributes: passes,
              params: {
                api: `passes`,
                parentReference: "event",
                itemTitle: { name: "numberOfPasses", type: "text", collection: "" },
                shortName: "Passes",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                formMode: "single",
                viewMode: "table",
                showEditInDotMenu: false,
                openPage: false,
                itemOpenMode: null,
              },
            },
          ],
        },
        {
          element: "button",
          type: "subTabs",
          id: "marketing",
          title: "Marketing",
          icon: "marketing",
          tabs: [
            {
              type: "title",
              title: "Campaigns",
              id: "Campaigns",
            },
            {
              element: "button",
              type: "subList",
              id: "email-campaigns",
              title: "Email Campaign",
              name: "email-campaign",
              icon: "registration",
              attributes: emailCampaign,
              params: {
                api: `campaign/email`,
                parentReference: "event",
                itemTitle: { name: "name", type: "text", collection: "" },
                shortName: "Email Campaign",
                description: "Create and send personalized email campaigns to engage with your audience",
                addPrivilege: true,
                delPrivilege: true,
                formStyle: "page",
                actions: [
                  {
                    element: "button",
                    type: "callback",
                    callback: (item, data) => {
                      // Use setMessage for confirmation dialog instead of alert
                      if (props?.setMessage) {
                        props.setMessage({
                          type: 2,
                          title: "Cancel Email Campaign",
                          content: `Are you sure you want to cancel the email campaign "${data.name || "Untitled Campaign"}"? This action cannot be undone.`,
                          proceed: "Cancel",
                          okay: "Continue Sending",
                          onProceed: async () => {
                            try {
                              // TODO: Implement actual campaign cancellation API call
                              console.log("Canceling campaign:", data._id);
                              // const response = await cancelCampaign(data._id);
                              // if (response.success) {
                              //   refreshView(false, slNo, response);
                              // }
                              return true; // Close modal after action
                            } catch (error) {
                              console.error("Error canceling campaign:", error);
                              return false; // Keep modal open on error
                            }
                          },
                          data: data,
                        });
                      } else {
                        // Fallback to alert if setMessage not available
                        alert("cancel");
                      }
                    },
                    condition: { item: "status", if: "scheduled", then: true, else: false },
                    icon: "next",
                    title: "Cancel",
                    actionType: "button",
                  },
                  {
                    element: "button",
                    type: "callback",
                    callback: async (item, data, refreshView, slNo) => {
                      const response = await refreshCampaign(data._id, data);
                      refreshView(false, slNo, response);
                    },
                    condition: { item: "status", if: ["partially_completed", "sending", "completed"], then: true, else: false },
                    icon: "refresh",
                    title: "Refresh",
                    actionType: "button",
                  },
                ],
                updatePrivilege: false,
                customClass: "medium",
                formMode: "single",
                submitButtonText: "Send",
                openPage: false,
                itemOpenMode: null,
              },
            },
            {
              element: "button",
              type: "subList",
              id: "whatsapp-campaigns",
              title: "Whatsapp Campaign",
              icon: "whatsapp",
              name: "whatsapp",
              attributes: whatsappCampaign,
              params: {
                api: `campaign/whatsapp`,
                parentReference: "event",
                itemTitle: { name: "name", type: "text", collection: "" },
                shortName: "Whatsapp Campaign",
                description: "Design and distribute event updates directly via WhatsApp messages",
                addPrivilege: true,
                formStyle: "page",
                delPrivilege: true,
                updatePrivilege: false,
                customClass: "medium",
                formMode: "single",
                actions: [
                  {
                    element: "button",
                    type: "callback",
                    callback: (item, data) => {
                      alert("cancel");
                    },
                    icon: "close",
                    title: "Cancel",
                    actionType: "button",
                    condition: { item: "status", if: "scheduled", then: true, else: false },
                  },
                  {
                    element: "button",
                    type: "callback",
                    callback: async (item, data, refreshView, slNo) => {
                      const response = await refreshCampaign(data._id, data);
                      refreshView(false, slNo, response);
                    },
                    condition: { item: "status", if: ["partially_completed", "sending", "completed"], then: true, else: false },
                    icon: "refresh",
                    title: "Refresh",
                    actionType: "button",
                  },
                ],
                submitButtonText: "Send",
                openPage: false,
                itemOpenMode: null,
              },
            },
            {
              element: "button",
              type: "custom",
              id: "notification-queue",
              title: "Notification Queue",
              icon: "notification",
              page: "notificationQueue",
            },
            {
              element: "button",
              type: "custom",
              id: "communication",
              title: "Communication",
              icon: "message",
              page: "communication",
            },
            {
              type: "title",
              title: "Audience",
              id: "Audience",
            },
            {
              element: "button",
              type: "subList",
              id: "saved-audience",
              name: "savedAudience",
              title: "Saved Audience",
              icon: "booth-member",
              attributes: audience,
              params: {
                api: `audience`,
                parentReference: "event",
                itemTitle: { name: "name", type: "text", collection: "" },
                shortName: "Audience",
                description: "Organize and manage pre-defined audience groups for targeted campaigns",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                showEditInDotMenu: false,
                customClass: "medium",
                formMode: "double",
                formStyle: "center",
                formLayout: "center medium",
                formTabTheme: "steps",
                openPage: false,
                itemOpenMode: null,
              },
            },
            {
              type: "title",
              title: "Advocacy Posters",
              id: "Advocacy Posters",
            },
            {
              element: "button",
              type: "subList",
              id: "advocacy-posters",
              title: "Advocacy Posters",
              icon: "PosterBuilder",
              attributes: advocacyPosterFields,
              params: {
                api: `advocacy-poster`,
                parentReference: "event",
                itemTitle: { name: "title", type: "text", collection: "" },
                profileImage: "backgroundImage",
                shortName: "Advocacy Posters",
                description: "Create 'I'm attending' like promotion poster campaigns for participants to share and promote your event",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                openPage: false,
                itemOpenMode: null,
                actions: [
                  {
                    actionType: "button",
                    element: "button",
                    type: "callback",
                    callback: (item, data) => {
                      setOpenItemData({ item, data });
                      setOpenPosterMaker(true);
                    },
                    icon: "form-builder",
                    title: "Configure Poster",
                    params: {
                      itemTitle: { name: "title", type: "text", collection: "" },
                      shortName: "Configure Poster",
                      addPrivilege: true,
                      delPrivilege: true,
                      updatePrivilege: true,
                      customClass: "full-page",
                    },
                  },
                  {
                    element: "button",
                    actionType: "button",
                    type: "callback",
                    callback: (item, data) => {
                      console.log(item, data);
                      console.log(data._id, "data._id");
                      setOpenItemData({ item, data });
                      setOpenPosterUsage(true);
                    },
                    icon: "form-builder",
                    title: "Poster Usage",
                    params: {
                      api: `advocacy-poster-usage`,
                      parentReference: "advocacy-poster",
                      itemTitle: { name: "title", type: "text", collection: "" },
                      shortName: "Poster Usage",
                    },
                  },
                ],
              },
            },
          ],
        },
        {
          element: "button",
          type: "subTabs",
          id: "attendee-mobile-app",
          name: "attendee-mobile-app",
          title: "Attendee Mobile App",
          icon: "mobile-modules",
          visibilityCondition: {
            conditions: [{ item: "coreModules", if: "Attendee Mobile App", operator: "equals" }],
            operator: "AND",
            then: true,
            else: false,
          },
          tabs: [
            {
              element: "button",
              type: "subList",
              id: "configure-app",
              title: "Configure App",
              icon: "mobile-modules",
              attributes: configureApp,
              params: {
                api: `mobile-module`,
                parentReference: "event",
                icon: "mobile-modules",
                itemTitle: { name: "title", type: "text", collection: "" },
                shortName: "Configure App",
                description: "Configure the app for this event",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "full-page",
                formTabTheme: "accordion2",
                viewMode: "single",
              },
            },
            {
              type: "title",
              title: "APP COMMUNICATIONS",
              id: "APP COMMUNICATIONS",
            },
            {
              element: "button",
              type: "custom",
              id: "feedback",
              icon: "feedback",
              title: "Feedback",
              page: "feedback",
            },
            {
              element: "button",
              type: "subList",
              id: "notification",
              title: "Notification",
              icon: "notification",
              attributes: notificationModules,
              params: {
                api: `notification`,
                parentReference: "eventId",
                itemTitle: {
                  name: "title",
                  type: "text",
                  collection: "",
                },
                shortName: "Notification",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                openPage: false,
                itemOpenMode: null,
              },
            },
            {
              type: "title",
              title: "REQUEST APP",
              id: "REQUEST APP",
            },
            {
              element: "button",
              type: "subList",
              id: "request-app",
              title: "Request App",
              icon: "mobile-modules",
              attributes: requestApp,
              params: {
                api: `request-app`,
                parentReference: "event",
                itemTitle: { name: "name", type: "text", collection: "" },
                shortName: "Request App",
                description: "Manage in-app request pages for attendees",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                formMode: "single",
                openPage: false,
                // viewMode: "single",
              },
            },
            {
              type: "title",
              title: "APP SETTINGS",
              id: "APP SETTINGS",
            },
            {
              element: "button",
              type: "subList",
              id: "mobile-modules",
              title: "App Modules",
              icon: "mobile-modules",
              attributes: appModulesAttributes,
              params: {
                api: `mobile-module`,
                parentReference: "event",
                itemTitle: {
                  name: "instaSnapEnabled",
                  type: "text",
                  collection: "",
                },
                shortName: "App Modules",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                formMode: "double",
                showInfoType: "edit",
                viewMode: "info",
              },
            },
            {
              element: "button",
              type: "subList",
              id: "privacy-policy",
              title: "Privacy Policy",
              icon: "privacy-policy",
              attributes: privacyPolicy,
              params: {
                api: `privacy-policy`,
                parentReference: "event",
                itemTitle: { name: "privacyPolicy", type: "text", collection: "" },
                shortName: "Privacy Policy",
                viewMode: "single",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                formMode: "single",
              },
            },
            {
              element: "button",
              type: "subList",
              id: "app-version",
              title: "Version Setting",
              icon: "app-version",
              attributes: appVersionAttributes,
              params: {
                api: `app-version`,
                parentReference: "event",
                itemTitle: { name: "app", type: "text", collection: "" },
                shortName: "Version Setting",
                addPrivilege: false,
                delPrivilege: false,
                updatePrivilege: true,
                customClass: "medium",
                viewMode: "table",
              },
            },
          ],
        },
        {
          element: "button",
          type: "custom",
          id: "analytics",
          icon: "reports",
          title: "Analytics",
          page: "analytics",
        },

        {
          element: "button",
          type: "subList",
          id: "insta-snap",
          title: "InstaSnap",
          icon: "insta-snap",
          visibilityCondition: {
            conditions: [{ item: "coreModules", if: "InstaSnap", operator: "equals" }],
            operator: "AND",
            then: true,
            else: false,
          },
          tabs: [
            {
              element: "button",
              type: "custom",
              id: "insta-snap-dashboard",
              icon: "dashboard",
              title: "Dashboard",
              page: "InstaSnapDashboard",
            },
            {
              element: "button",
              type: "gallery",
              id: "upload-photos",
              icon: "upload",
              title: "Upload Photos",
              api: "insta-snap",
              imageSettings: { fileName: "file", image: "compressed", thumbnail: "thumbnail", endpoind: "https://event-hex-saas.s3.amazonaws.com/" },
              showTitle: true,
            },
            {
              element: "button",
              type: "custom",
              id: "manage-photos",
              icon: "manage-photos",
              title: "Manage Photos",
              page: "album",
            },
            {
              element: "button",
              type: "custom",
              id: "watermark",
              icon: "attendees",
              title: "Watermark",
              page: "watermark",
            },
            {
              element: "button",
              type: "custom",
              id: "contribute-album",
              icon: "contribute",
              title: "Contribute Album",
              page: "contributeAlbum",
            },
            {
              type: "title",
              title: "PHOTO RETRIEVERS",
              id: "PHOTO RETRIEVERS",
            },
            {
              element: "button",
              type: "custom",
              id: "photo-attendee",
              icon: "attendees",
              title: "Photo Attendee",
              description: "View a list of attendees who scanned their face to retrieve event photos",
              page: "instaAttendee",
            },
            {
              type: "title",
              title: "MONETIZE",
              id: "MONETIZE",
            },
            {
              element: "button",
              type: "subList",
              id: "partners-spotlights",
              title: "Partners Spotlights",
              icon: "partners-spotlight",
              attributes: partnersSpotlights,
              params: {
                api: `partners-spotlight`,
                parentReference: "event",
                itemTitle: { name: "partnerName", type: "text", collection: "" },
                shortName: "Partners Spotlights",
                description: "Add sponsor and partner banners to display prominently in the attendee photo gallery",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                viewMode: "table",
                openPage: false,
                itemOpenMode: null,
              },
            },
            {
              type: "title",
              title: "SETTINGS",
              id: "SETTINGS",
            },
            {
              element: "button",
              type: "custom",
              id: "insta-domain",
              icon: "url",
              title: "Domain",
              content: customDomain,
            },
            {
              element: "button",
              type: "subList",
              id: "insta-snap-settings",
              title: "InstaSnap Settings",
              icon: "display",
              attributes: photoPermission,
              params: {
                api: `photo-permission`,
                parentReference: "event",
                itemTitle: { name: "photoViewAccess", type: "text", collection: "" },
                shortName: "InstaSnap Settings",
                description: "Manage and configure InstaSnap's features and photo-sharing options",
                viewMode: "single",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                formMode: "single",
              },
            },
          ],
        },
        {
          element: "button",
          type: "subList",
          id: "insta-recap",
          title: "InstaRecap",
          icon: "insta-recap",
          visibilityCondition: {
            conditions: [{ item: "coreModules", if: "InstaRecap", operator: "equals" }],
            operator: "AND",
            then: true,
            else: false,
          },
          tabs: [
            {
              element: "button",
              type: "custom",
              id: "insta-recap-dashboard",
              icon: "dashboard",
              title: "Dashboard",
              page: "InstaRecapDashboard",
            },
            {
              element: "button",
              type: "custom",
              id: "sessions-transcripts",
              title: "Sessions Transcripts",
              icon: "session",
              page: "sessionsTranscripts",
              attributes: sessions,
              params: {
                api: `sessions`,
                parentReference: "event",
                itemTitle: { name: "title", type: "text", collection: "" },
                bulkUplaod: true,
                shortName: "Sessions Transcripts",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                viewMode: "list",
                formMode: "single",
                exportPrivilege: true,
                actions: [
                  {
                    element: "action",
                    type: "subList",
                    id: "session-speaker",
                    title: "Add Agenda",
                    icon: "speakers",
                    attributes: sessionSpeaker,
                    params: {
                      api: `session-speaker`,
                      parentReference: "session",
                      itemTitle: { name: "title", type: "text", collection: "" },
                      shortName: "Agenda",
                      addPrivilege: true,
                      delPrivilege: true,
                      updatePrivilege: true,
                      customClass: "medium",
                      viewMode: "table",
                      formMode: "single",
                    },
                  },
                  {
                    element: "button",
                    type: "callback",
                    callback: (item, data) => {
                      setOpenItemData({ item, data });
                      setOpenMenuSetupAudio(true);
                    },
                    itemOpenMode: {
                      type: "callback",
                      callback: (data) => {
                        setOpenItemData({ data });
                        setOpenMenuSetupAudio(true);
                      },
                    },
                    icon: "upload",
                    title: "Upload Audio",
                    params: {
                      parentReference: "session",
                      itemTitle: { name: "title", type: "text", collection: "" },
                      shortName: "Audio",
                      addPrivilege: true,
                      delPrivilege: true,
                      updatePrivilege: true,
                      customClass: "full-page",
                    },
                    actionType: "button",
                  },
                ],
              },
            },
            // {
            //   element: "button",
            //   type: "custom",
            //   id: "session-recordings",
            //   icon: "event",
            //   title: "Session Recordings",
            //   page: "eventAudio",
            // },
            {
              element: "button",
              type: "subList",
              id: "session-recordings",
              title: "Session Recordings",
              icon: "event",
              attributes: sessionRecordingsAttributes,
              params: {
                api: `instarecap-setting/audio-details`,
                parentReference: "event",
                itemTitle: { name: "title", type: "text", collection: "session" },
                shortName: "Session Recording",
                delPrivilege: true,
                openPage: false,
                // viewMode: "list",
                additionalButtons: [
                  {
                    label: "Session Recording",
                    icon: "add",
                    onClick: () => {
                      setOpenNewRecording(true);
                    },
                  },
                ],
                actions: [
                  {
                    element: "button",
                    type: "callback",
                    callback: (item, data) => {
                      setOpenItemData({ item, data });
                      setOpenMapSession(true);
                    },
                    icon: "link",
                    title: "Map to Session",
                    params: {
                      itemTitle: { name: "title", type: "text", collection: "" },
                      shortName: "Map to Session",
                    },
                    actionType: "button",
                    condition: { item: "session", if: [null, undefined, ""], then: true, else: false },
                  },
                  {
                    element: "button",
                    type: "callback",
                    callback: (item, data) => {
                      setOpenItemData({ item, data });
                      setOpenRemapSession(true);
                    },
                    icon: "refresh",
                    title: "Remap Session",
                    params: {
                      itemTitle: { name: "title", type: "text", collection: "" },
                      shortName: "Remap Session",
                    },
                    actionType: "button",
                    condition: { item: "session", if: [null, undefined, ""], then: false, else: true },
                  },
                  {
                    element: "button",
                    type: "callback",
                    callback: (item, data) => {
                      setOpenItemData({ item, data });
                      setOpenViewTranscript(true);
                    },
                    icon: "eye",
                    title: "View Transcript",
                    params: {
                      itemTitle: { name: "title", type: "text", collection: "" },
                      shortName: "View Transcript",
                    },
                    actionType: "button",
                    condition: { item: "status", if: "processed", then: true, else: false },
                  },
                ],
              },
            },
            {
              type: "title",
              title: "Translation Languages",
              id: "Translation Languages",
            },
            {
              element: "button",
              type: "subList",
              id: "manage-translations",
              title: "Manage Translations",
              icon: "display",
              attributes: translationSettings,
              params: {
                api: `instarecap-setting`,
                parentReference: "event",
                itemTitle: { name: "enableLogin", type: "text", collection: "" },
                shortName: "Manage Translations",
                viewMode: "single",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                formMode: "single",
              },
            },
            {
              type: "title",
              title: "Team Management",
              id: "Team Management",
            },
            // {
            //   element: "button",
            //   type: "custom",
            //   id: "manage-team",
            //   icon: "event",
            //   title: "Manage AV Team",
            //   page: "avTeam",
            // },
            {
              element: "button",
              type: "subList",
              id: "manage-team",
              title: "AV Team Access",
              icon: "event",
              attributes: avCodeAttributes,
              params: {
                api: `av-code`,
                parentReference: "event",
                itemTitle: { name: "title", type: "text", collection: "" },
                shortName: "AV Team Access",
                description: "Assign one code to multiple sessions or stages for the AV team.",
                submitButtonText: "Create Access",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                formLayout: "center medium",
                infoBox: {
                  type: "info",
                  design: "2",
                  showIcon: false,
                  closable: false,
                  content: "AV_TEAM_URL_BOX",
                  customComponent: "AvTeamUrlBox",
                },
                openPage: false,
              },
            },
            {
              element: "button",
              type: "custom",
              id: "attendee",
              icon: "attendees",
              title: "Users",
              page: "recapUser",
            },
            {
              type: "title",
              title: "Configuration",
              id: "Configuration",
            },
            {
              element: "button",
              type: "subList",
              id: "insta-recap-settings",
              title: "InstaRecap Settings",
              icon: "display",
              attributes: instaRecapSetting,
              params: {
                api: `instarecap-setting`,
                parentReference: "event",
                itemTitle: { name: "enableLogin", type: "text", collection: "" },
                shortName: "InstaRecap Settings",
                viewMode: "single",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                formMode: "single",
              },
            },
          ],
        },
        {
          element: "button",
          type: "subList",
          id: "settings",
          title: "Settings",
          icon: "mobile-settings",
          tabs: [
            {
              type: "title",
              title: "SETTINGS",
              id: "SETTINGS",
            },
            {
              element: "button",
              type: "subList",
              id: "configurations",
              title: "Configurations",
              icon: "contact",
              attributes: settings,
              params: {
                api: `settings`,
                parentReference: "event",
                itemTitle: { name: "whatsappUrl", type: "text", collection: "" },
                shortName: "Configurations",
                viewMode: "single",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                formMode: "single",
                formTabTheme: "tab",
              },
            },
            {
              element: "button",
              type: "custom",
              id: "domain-settings",
              icon: "url",
              title: "Domain Settings",
              content: customDomain,
            },
            {
              type: "title",
              title: "MOBILE APP SETTINGS",
              id: "MOBILE APP SETTINGS",
            },
            {
              element: "button",
              type: "subList",
              id: "notification",
              title: "Updates",
              icon: "notification",
              attributes: updatesAttributes,
              params: {
                api: `updates`,
                parentReference: "event",
                itemTitle: { name: "title", type: "text", collection: "" },
                shortName: "Updates",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                formStyle: "page",
              },
            },
            {
              type: "title",
              title: "BETA CONFIGURATIONS",
              id: "BETA CONFIGURATIONS",
            },
            // {
            //   element: "button",
            //   type: "custom",
            //   id: "event-chat",
            //   icon: "event",
            //   title: "Event Chat",
            //   page: "eventChat",
            // },
            {
              element: "button",
              type: "custom",
              id: "badge-settings",
              icon: "badge",
              title: "Badge",
              page: "badgeSettings",
            },
            {
              element: "button",
              type: "custom",
              id: "wall-fame",
              icon: "wall-fame",
              title: "Display wall",
              page: "wallFame",
            },
            {
              element: "button",
              type: "custom",
              id: "seo-settings",
              icon: "exhibitor",
              title: "SEO",
              page: "seoSettings",
            },
            {
              element: "button",
              type: "custom",
              id: "website-integrations",
              icon: "website-integrations",
              title: "Website Integrations",
              page: "websiteIntegrations",
            },
            {
              element: "button",
              type: "subList",
              id: "checkout-settings",
              title: "Checkout Settings",
              icon: "checkout",
              attributes: checkoutSettingsAttributes,
              params: {
                api: `checkout-settings`,
                parentReference: "event",
                itemTitle: { name: "headerAppearance", type: "text", collection: "" },
                shortName: "Checkout Settings",
                viewMode: "single",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                formMode: "single",
                formTabTheme: "tab",
              },
            },
            {
              type: "title",
              title: "ADMINS",
              id: "ADMINS",
            },
            {
              element: "button",
              type: "subList",
              id: "ticket-admin",
              title: "Ticket Admin",
              icon: "ticket",
              attributes: ticketAdmin,
              params: {
                api: `user/ticket-admin`,
                parentReference: "event",
                itemTitle: {
                  name: "title",
                  type: "text",
                  collection: "",
                },
                shortName: "Ticket Admin",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                openPage: false,
                itemOpenMode: null,
              },
            },
            {
              element: "button",
              type: "subList",
              id: "access-code",
              title: "Access Code",
              icon: "access-code",
              attributes: accessCode,
              params: {
                api: `access-code`,
                parentReference: "event",
                itemTitle: {
                  name: "accessCode",
                  type: "text",
                  collection: "",
                },
                shortName: "Access Code",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                openPage: false,
                itemOpenMode: null,
              },
            },
            {
              element: "button",
              type: "subList",
              id: "ticket-category",
              title: "Ticket Category",
              icon: "ticket-category",
              attributes: ticketCategory,
              params: {
                api: `ticket-category`,
                parentReference: "event",
                itemTitle: {
                  name: "title",
                  type: "text",
                  collection: "",
                },
                shortName: "Ticket Category",
                addPrivilege: true,
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                openPage: false,
                itemOpenMode: null,
              },
            },
            {
              type: "title",
              title: "GAMIFICATION",
              id: "GAMIFICATION",
            },
            {
              element: "button",
              type: "subList",
              id: "manage-challenges",
              title: "Manage Challenges",
              icon: "manage-challenges",
              attributes: manageChallenges,
              params: {
                api: `event-challenge`,
                parentReference: "event",
                itemTitle: { name: "title", type: "text", collection: "" },
                labels: [
                  { key: "activeChallengesCount", title: "ACTIVE CHALLENGES", icon: "rewards", backgroundColor: "rgba(0, 200, 81, 0.15)", color: "#006B27" },
                  { key: "totalChallengesCount", title: "TOTAL CHALLENGES", icon: "challenges", backgroundColor: "rgba(255, 69, 58, 0.15)", color: "#99231B" },
                  { key: "participantsCount", title: "PARTICIPANTS", icon: "participants", backgroundColor: "rgba(0, 122, 255, 0.15)", color: "#004999" },
                  { key: "pointsAwarded", title: "POINTS AWARDED", icon: "star", backgroundColor: "rgba(153, 153, 6, 0.15)", color: "#856404" },
                ],
                shortName: "Manage Challenges",
                updatePrivilege: true,
                customClass: "medium",
                formMode: "single",
                showInfoType: "edit",
                openPage: false,
                // Note: Add exhibitor QR code action button
                actions: [
                  {
                    element: "button",
                    id: "view-exhibitor-qr",
                    title: "View QR",
                    icon: "qr",
                    type: "callback",
                    actionType: "button", // Note: Important! This categorizes it as a button action
                    // Note: Only show QR button when action type is "Sponsored" (which has exhibitor)
                    condition: {
                      item: "action",
                      if: "Sponsored",
                      then: true,
                      else: false,
                    },
                    callback: (item, data) => {
                      try {
                        console.log("View QR button clicked!", data);
                        // Note: Handle both cases - exhibitor as string ID or populated object
                        let exhibitorId = null;
                        let exhibitorName = "Exhibitor";

                        if (typeof data?.exhibitor === "string") {
                          // Note: Exhibitor is just an ID string
                          exhibitorId = data.exhibitor;
                          exhibitorName = data.title || "Exhibitor";
                        } else if (data?.exhibitor?._id) {
                          // Note: Exhibitor is a populated object
                          exhibitorId = data.exhibitor._id;
                          exhibitorName = data.exhibitor.fullName || data.exhibitor.firstName || data.exhibitor.companyName || "Exhibitor";
                        }

                        if (!exhibitorId) {
                          console.error("No exhibitor ID found");
                          toast.error("No exhibitor associated with this challenge");
                          return;
                        }

                        console.log("Setting exhibitor QR data:", exhibitorId);
                        console.log("setExhibitorQrCodeData function:", typeof setExhibitorQrCodeData);

                        const newData = {
                          show: true,
                          exhibitorId: exhibitorId,
                          exhibitorName: exhibitorName,
                          qrCodeUrl: `https://${window.location.host}/${exhibitorId}`,
                        };
                        console.log("New QR data to set:", newData);

                        setExhibitorQrCodeData(newData);
                        console.log("State set successfully, modal should show now");
                      } catch (error) {
                        console.error("Error in QR button callback:", error);
                        toast.error("Failed to show QR code: " + error.message);
                      }
                    },
                  },
                  {
                    element: "button",
                    type: "callback",
                    callback: (item, data) => {
                      setOpenItemData({ item, data });
                      setOpenAddContest(true);
                    },
                    icon: "add",
                    title: "Add Contest",
                    condition: {
                      item: "action",
                      if: "Contest Based",
                      then: true,
                      else: false,
                    },
                    params: {
                      parentReference: "event",
                      itemTitle: { name: "title", type: "text", collection: "" },
                      shortName: "Add Contest",
                      addPrivilege: true,
                      delPrivilege: true,
                      updatePrivilege: true,
                      formLayout: "center",
                    },
                    actionType: "button",
                  },
                ],
              },
            },
            {
              element: "button",
              type: "subList",
              id: "leaderboard",
              title: "Leaderboard",
              icon: "leaderboard",
              attributes: leaderboard,
              params: {
                api: `user-challenge-points/leaderboard`,
                parentReference: "event",
                itemTitle: { name: "title", type: "text", collection: "" },
                shortName: "Leaderboard",
                delPrivilege: true,
                updatePrivilege: true,
                customClass: "medium",
                showInfoType: "edit",
              },
            },
            {
              element: "button",
              type: "subTabs",
              id: "rewards",
              title: "Rewards",
              icon: "rewards",
              tabs: [
                {
                  element: "button",
                  type: "subList",
                  id: "position-reward",
                  title: "Position Based",
                  icon: "position-reward",
                  attributes: positionRewardsAttributes,
                  params: {
                    api: `position-reward`,
                    parentReference: "event",
                    itemTitle: { name: "prizeName", type: "text", collection: "" },
                    shortName: "Position Rewards",
                    description: "Manage event position based rewards",
                    addPrivilege: false,
                    updatePrivilege: true,
                    openPage: false,
                    // Render rewards as cards similar to Events list
                    viewMode: "list",
                    displayColumn: "triple",
                    // viewMode: "single",
                  },
                },
                {
                  element: "button",
                  type: "subList",
                  id: "milestone-reward",
                  title: "Milestone Based",
                  icon: "milestone-reward",
                  attributes: milestoneRewardsAttributes,
                  params: {
                    api: `milestone-reward`,
                    parentReference: "event",
                    itemTitle: { name: "rewardName", type: "text", collection: "" },
                    shortName: "Milestone Rewards",
                    description: "Create milestone rewards based on points earned",
                    addPrivilege: true,
                    delPrivilege: true,
                    updatePrivilege: true,
                    openPage: false,
                    formMode: "single",
                  },
                },
              ],
            },
            {
              type: "title",
              title: "ABSTRACTION",
            },
            {
              element: "button",
              type: "custom",
              id: "rubric",
              title: "Rubric",
              icon: "abstract",
              page: "configureRubric",
            },
            {
              element: "button",
              type: "subList",
              id: "abstraction",
              title: "Abstract Calling",
              icon: "abstract",
              attributes: abstractionAttributes,
              params: {
                api: `abstraction`,
                parentReference: "event",
                itemTitle: { name: "title", type: "text", collection: "" },
                shortName: "Abstract Calling",
                description: "Define different types of abstractions and their access levels",
                addPrivilege: true,
                updatePrivilege: true,
                delPrivilege: true,
                openPage: false,
                actions: [
                  {
                    element: "button",
                    type: "callback",
                    callback: (item, data) => {
                      setOpenItemData({ item, data });
                      setOpenMenuSetup(true);
                    },
                    icon: "form-builder",
                    title: "Abstract Builder",
                    params: {
                      itemTitle: { name: "title", type: "text", collection: "" },
                      shortName: "Abstract Builder",
                      addPrivilege: true,
                      delPrivilege: true,
                      updatePrivilege: true,
                      customClass: "full-page",
                    },
                    actionType: "button",
                  },
                ],
              },
            },
            {
              type: "subList",
              id: "abstraction-response",
              title: "Submissions",
              icon: "file",
              attributes: abstractionResponse,
              params: {
                api: `ticket-registration`,
                parentReference: "event",
                itemTitle: { name: "title", type: "text", collection: "" },
                shortName: "Submissions",
                description: "View and manage submissions for abstractions",
                addPrivilege: false,
                delPrivilege: true,
                updatePrivilege: false,
                customClass: "medium",
                formMode: `single`,
                openPage: false,
                preFilter: { event: "{{eventId}}", type: "Abstraction" },
                actions: [
                  {
                    element: "button",
                    type: "callback",
                    callback: (item, data) => {
                      setSelectedSubmission(data);
                      setOpenReviewerAssignment(true);
                    },
                    icon: "user",
                    title: "Assign Reviewers",
                    actionType: "button",
                  },
                  {
                    element: "button",
                    type: "callback",
                    callback: (item, data) => {
                      handleDownloadSubmission(data);
                    },
                    icon: "file",
                    title: "Download Submission",
                    actionType: "button",
                  },
                ],
              },
            },
            // {
            //   type: "subList",
            //   id: "submissions",
            //   title: "Submissions",
            //   icon: "file",
            //   attributes: submissionsAttributes,
            //   params: {
            //     api: `ticket-registration`,
            //     parentReference: "event",
            //     itemTitle: { name: "title", type: "text", collection: "" },
            //     shortName: "Submissions",
            //     description: "View and manage submissions for abstractions",
            //     addPrivilege: false,
            //     delPrivilege: true,
            //     updatePrivilege: false,
            //     customClass: "medium",
            //     formMode: `single`,
            //     openPage: false,
            //     viewMode: "info",
            //     preFilter: { type: "Abstraction" },
            //     parents: { type: "Abstraction" },
            //   },
            // },
            {
              element: "button",
              type: "custom",
              id: "reviewer",
              icon: "user",
              title: "Reviewers",
              page: "reviewer",
            },
          ],
        },
        {
          element: "button",
          type: "callback",
          actionType: "dotmenu",
          callback: async (item, data, refreshUpdate) => {
            // Improved confirmation message
            props.setMessage({
              type: 2,
              title: "🎯 Clone Event",
              content: `
            <div style="padding: 8px 0;">
              <div style="margin-bottom: 16px;">
                <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px;">Are you sure you want to clone this event?</h4>
                <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 16px;">
                  <strong style="color: #1f2937;">"${data.title}"</strong>
                </div>
              </div>
              
              <div style="margin-bottom: 16px;">
                <h5 style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">✨ What will be cloned:</h5>
                <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 13px; line-height: 1.6;">
                  <li>🎫 All tickets, forms, and registration settings</li>
                  <li>🎤 Speakers, sessions, and event agenda</li>
                  <li>🏢 Sponsors, exhibitors, and their categories</li>
                  <li>🌐 Website design, landing pages, and content</li>
                  <li>⚙️ All settings, permissions, and configurations</li>
                  <li>🔗 New unique subdomain will be created</li>
                </ul>
              </div>
              
              <div style="background: #fef3c7; padding: 12px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <div style="font-size: 13px; color: #92400e;">
                  <strong>📝 Note:</strong> The cloned event will be titled <strong>"Copy of ${data.title}"</strong> and will start as <strong>inactive</strong>. All registration data will be reset to zero.
                </div>
              </div>
            </div>
          `,
              proceed: "🚀 Yes, Clone Event",
              onProceed: async () => {
                try {
                  // Show progress in the same modal
                  const showProgress = (step, message, progress) => {
                    props.setMessage({
                      type: 2,
                      title: "🎯 Cloning Event",
                      content: `
                    <div style="padding: 20px; text-align: center;">
                      <div style="margin-bottom: 20px;">
                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: white; font-size: 24px; animation: pulse 2s infinite;">
                          🚀
                        </div>
                        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px;">Cloning "${data.title}"</h3>
                        <p style="margin: 0; color: #6b7280; font-size: 14px;">${message}</p>
                      </div>
                      
                      <!-- Progress Bar -->
                      <div style="background: #f3f4f6; border-radius: 10px; height: 8px; margin-bottom: 16px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, #3b82f6, #1d4ed8); height: 100%; width: ${progress}%; transition: width 0.5s ease-out; border-radius: 10px;"></div>
                      </div>
                      
                      <!-- Progress Steps -->
                      <div style="display: flex; justify-content: space-between; font-size: 11px; color: #6b7280; margin-bottom: 20px;">
                        <span style="color: ${step >= 1 ? "#3b82f6" : "#9ca3af"}; font-weight: ${step >= 1 ? "600" : "400"};">Setup</span>
                        <span style="color: ${step >= 2 ? "#3b82f6" : "#9ca3af"}; font-weight: ${step >= 2 ? "600" : "400"};">Tickets</span>
                        <span style="color: ${step >= 3 ? "#3b82f6" : "#9ca3af"}; font-weight: ${step >= 3 ? "600" : "400"};">Content</span>
                        <span style="color: ${step >= 4 ? "#3b82f6" : "#9ca3af"}; font-weight: ${step >= 4 ? "600" : "400"};">Settings</span>
                        <span style="color: ${step >= 5 ? "#3b82f6" : "#9ca3af"}; font-weight: ${step >= 5 ? "600" : "400"};">Speakers</span>
                        <span style="color: ${step >= 6 ? "#3b82f6" : "#9ca3af"}; font-weight: ${step >= 6 ? "600" : "400"};">Sponsors</span>
                        <span style="color: ${step >= 7 ? "#3b82f6" : "#9ca3af"}; font-weight: ${step >= 7 ? "600" : "400"};">Website</span>
                        <span style="color: ${step >= 8 ? "#10b981" : "#9ca3af"}; font-weight: ${step >= 8 ? "600" : "400"};">Complete</span>
                      </div>
                      
                      <!-- Current Step Details -->
                      <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                        <div style="font-size: 13px; color: #374151;">
                          <strong>Step ${step} of 8:</strong> ${message}
                        </div>
                      </div>
                    </div>
                    
                    <style>
                      @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                      }
                    </style>
                  `,
                      hideButtons: true, // Hide all buttons during progress
                    });
                  };

                  const steps = [
                    { message: "Initializing clone process...", delay: 800 },
                    { message: "Cloning tickets and registration settings...", delay: 1000 },
                    { message: "Copying event content and pages...", delay: 900 },
                    { message: "Duplicating settings and configurations...", delay: 800 },
                    { message: "Cloning speakers and sessions...", delay: 900 },
                    { message: "Copying sponsors and exhibitors...", delay: 800 },
                    { message: "Setting up website and subdomain...", delay: 1000 },
                    { message: "Finalizing clone process...", delay: 700 },
                  ];

                  // Start the cloning process with progress updates
                  let currentStep = 0;

                  const updateProgress = async () => {
                    for (let i = 0; i < steps.length; i++) {
                      currentStep = i + 1;
                      const progress = Math.round((currentStep / steps.length) * 100);
                      showProgress(currentStep, steps[i].message, progress);
                      await new Promise((resolve) => setTimeout(resolve, steps[i].delay));
                    }
                  };

                  // Run progress updates and API call in parallel
                  const [_, response] = await Promise.all([updateProgress(), postData({ eventId: data._id }, "event/clone")]);

                  if (response.status === 201 && response.data.success) {
                    props.setMessage({
                      type: 1,
                      title: "🎉 Clone Successful!",
                      content: `
                    <div style="text-align: center; padding: 20px;">
                      <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: white; font-size: 32px; box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);">✓</div>
                      <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 20px;">Event Cloned Successfully! 🎊</h3>
                      <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 15px;">Your event has been successfully duplicated with all settings and content. The event list will be updated automatically.</p>
                      <div style="background: #f0fdf4; padding: 16px; border-radius: 12px; border: 1px solid #bbf7d0; margin-bottom: 16px;">
                        <div style="font-size: 14px; color: #166534; margin-bottom: 4px;"><strong>New Event:</strong></div>
                        <div style="font-weight: 600; color: #15803d; font-size: 16px;">"${response.data.data.title}"</div>
                      </div>
                      <div style="font-size: 13px; color: #6b7280; line-height: 1.5;">
                        💡 The cloned event is currently <strong>inactive</strong>. You can activate it and make any necessary changes from the event settings.
                      </div>
                    </div>
                  `,
                      okay: "🔄 Refresh List",
                      cancel: "📋 View Events",
                      onProceed: async () => {
                        try {
                          // Virtual refresh - update the event list without page reload
                          if (refreshUpdate) {
                            console.log("🔄 Refreshing event list virtually...");
                            console.log("📊 New cloned event data:", response.data.data);

                            // Add a small delay to ensure the backend has processed the new event
                            await new Promise((resolve) => setTimeout(resolve, 1500));

                            // Call refresh function multiple times to ensure it works
                            await refreshUpdate();

                            // Wait a bit more and refresh again to be sure
                            await new Promise((resolve) => setTimeout(resolve, 500));
                            await refreshUpdate();

                            console.log("✅ Virtual refresh completed");

                            // Show confirmation with the new event name
                            props.setMessage({
                              type: 0,
                              title: "✅ List Updated",
                              content: `
                            <div style="text-align: center; padding: 20px;">
                              <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: white; font-size: 24px;">✓</div>
                              <div style="font-size: 16px; color: #059669; margin-bottom: 8px; font-weight: 600;">
                                Event List Updated!
                              </div>
                              <div style="font-size: 14px; color: #374151; margin-bottom: 12px;">
                                Your new event is now available:
                              </div>
                              <div style="background: #f0fdf4; padding: 12px; border-radius: 8px; border: 1px solid #bbf7d0; margin-bottom: 16px;">
                                <div style="font-weight: 600; color: #15803d; font-size: 15px;">"${response.data.data.title}"</div>
                              </div>
                              <div style="font-size: 12px; color: #6b7280;">
                                Look for it in your events list - it should appear at the top or bottom depending on your sort order.
                              </div>
                            </div>
                          `,
                              autoClose: 4000,
                            });
                          } else {
                            console.log("⚠️ No refreshUpdate function available, reloading page...");
                            window.location.reload();
                          }
                        } catch (error) {
                          console.error("Error during virtual refresh:", error);
                          // Fallback to page reload if virtual refresh fails
                          console.log("🔄 Falling back to page reload...");
                          window.location.reload();
                        }
                      },
                      onClose: () => {
                        // Alternative: Force page reload to guarantee the new event shows
                        console.log("🔄 User chose to reload page to see updated list...");
                        window.location.reload();
                      },
                    });
                  } else {
                    throw new Error(response.data.message || "Failed to clone event");
                  }
                } catch (error) {
                  console.error("Clone error:", error);
                  setShowCloneProgress(false);

                  props.setMessage({
                    type: 2,
                    title: "❌ Clone Failed",
                    content: `
                  <div style="text-align: center; padding: 20px;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: white; font-size: 32px; box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);">✕</div>
                    <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px;">Clone Process Failed</h3>
                    <div style="background: #fef2f2; padding: 16px; border-radius: 12px; border: 1px solid #fecaca; margin-bottom: 16px;">
                      <div style="font-size: 14px; color: #991b1b; line-height: 1.5;">
                        <strong>Error:</strong> ${error.message || "An unexpected error occurred during the cloning process"}
                      </div>
                    </div>
                    <div style="font-size: 13px; color: #6b7280;">
                      💡 Please try again or contact support if the issue persists.
                    </div>
                  </div>
                `,
                    okay: "🔄 Try Again",
                    onClose: () => { },
                  });
                }
              },
              data: data,
            });
          },
          icon: "copy",
          title: "Clone Event",
        },
      ]
  );

  const MetricTileRender = ({ labels, data }) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {labels.map((label, index) => {
          const metricData = data?.[label.key] ?? {};
          return (
            <div key={label.key || index} className="bg-white rounded-lg shadow-sm border border-stroke-soft p-4">
              <div className="flex items-center gap-3">
                {label.icon?.length > 0 && (
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center`}
                    style={{
                      backgroundColor: label.backgroundColor || "#f3f4f6",
                      color: label.color || "#6b7280",
                    }}
                  >
                    <GetIcon icon={label.icon} />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-text-sub mb-1">{label.title}</h3>
                  <p className="text-lg font-bold text-text-main">
                    {label.key === "Total amount" ? (
                      <>
                        {typeof metricData.count === "string" ? (
                          // Multiple currencies case - count is already formatted as "KWD 1190 + INR 1000"
                          metricData.count
                        ) : (
                          // Single currency case
                          <>
                            {metricData.currency?.toUpperCase()} {metricData.count}
                          </>
                        )}
                        {metricData?.total && ` / ${metricData.total}`}
                        {metricData?.suffix && metricData.suffix}
                      </>
                    ) : (
                      <>
                        {metricData?.count}
                        {metricData?.total && ` / ${metricData.total}`}
                        {metricData?.suffix && metricData.suffix}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* QR Code Modal - Rendered outside Container to avoid CSS conflicts */}
      {qrCodeData.show && (
        <div data-qr-modal className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 99999 }}>
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex justify-end items-center mb-4">
              <button onClick={handleCloseQRCode} className="text-gray-400 hover:text-gray-500">
                <GetIcon icon="close" className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg mb-4">
                <QRCode id="qr-code-svg" value={qrCodeData.url} size={200} level="H" />
              </div>
              <p className="text-sm text-gray-600 mb-4 text-center">{qrCodeData.title}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(qrCodeData.url)}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-full border border-blue-200 flex items-center gap-2 text-sm font-medium"
                >
                  <GetIcon icon="copy" className="w-4 h-4" />
                  Copy Link
                </button>
                <button onClick={handleDownloadQRCode} className="px-4 py-2 text-green-600 hover:bg-green-50 rounded-full border border-green-200 flex items-center gap-2 text-sm font-medium">
                  <GetIcon icon="download" className="w-4 h-4" />
                  Download QR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Container className="noshadow">
        {/* <pre>{JSON.stringify(props.itemPages, null, 2)}</pre> */}
        <ListTable
          // lastUpdateDate={lastUpdateDate}
          itemDescription={{ name: "startDate", type: "datetime" }}
          rowLimit={9}
          showInfo={false}
          viewMode="list"
          // showFilter={true}
          itemOpenMode={{ type: "open" }}
          // infoBox={{
          //   icon: "message",
          //   showIcon: true,
          //   type: "error",
          //   title: "Quick Tip",
          //   content: "You can create events here and manage your earlier events. Use the action buttons to add new events, upload in bulk, or export your event data.",
          //   content: "Use keyboard shortcuts: Ctrl+A to select all, Delete to remove selected items.",
          //   actionButton: {
          //     primary: {
          //       label: "Try Now",
          //       onClick: () => console.log("Primary clicked"),
          //     },
          //     secondary: {
          //       label: "Learn More",
          //       onClick: () => console.log("Secondary clicked"),
          //     },
          //   },
          //   closable: true,
          //   design: "3",
          // }}
          headerActions={[
            {
              label: "Visit Website",
              icon: "share",
              onClick: (openData) => {
                const eventId = openData?.data?._id;
                // Try cache first
                const cached = getCachedEventDomain(eventId) || getCachedEventDomain(slug);
                if (cached) {
                  console.log("cached", cached);
                  const websiteUrl = cached.includes("http") ? cached : `https://${cached}`;
                  window.open(websiteUrl, "_blank");
                  // Ensure other cached domains are purged after navigation
                  const keep = new Set([eventId, slug].filter(Boolean));
                  purgeOtherEventDomains(keep);
                  return;
                }
                // Fallback to API and then cache
                getData({ event: eventId }, "whitelisted-domains").then((domainRes) => {
                  if (domainRes?.status === 200) {
                    const defaultDomain = extractDefaultEventhexDomain(domainRes?.data?.response || []);
                    if (defaultDomain) {
                      cacheEventDomain(eventId, defaultDomain);
                      if (slug) cacheEventDomain(slug, defaultDomain);
                      const websiteUrl = defaultDomain.includes("http") ? defaultDomain : `https://${defaultDomain}`;
                      window.open(websiteUrl, "_blank");
                      // Purge others now that we have a fresh cache
                      const keep = new Set([eventId, slug].filter(Boolean));
                      purgeOtherEventDomains(keep);
                    } else {
                      // Fallback to regular website URL if no default domain is set
                      getData({ id: eventId }, "event/website").then((res) => {
                        if (res?.status === 200 && res?.data?.data) {
                          const websiteUrl = res.data.data.includes("http") ? res.data.data : `https://${res.data.data}`;
                          window.open(websiteUrl, "_blank");
                        }
                      });
                    }
                  }
                });
              },
            },
          ]}
          icon="event"
          addLabel={{ label: "Create Event", icon: "add" }}
          submitButtonText={"Create"}
          showInfoType={"edit"}
          displayColumn={"triple"}
          profileImage={"logo"}
          // formStyle={"page"}
          enableFullScreen={true}
          bulkUplaod={false}
          formLayout={"center medium"}
          formTabTheme={"steps"}
          isSingle={false}
          subGroupSettings={{
            "multi-day": {
              backgroundColor: "rgba(153, 219, 255, 0.15)",
              icon: "date",
            },
            "logo-banner": {
              title: "Setup your Branding",
              backgroundColor: "rgb(255, 255, 255)",
              icon: "image",
            },
          }}
          popupMode="full-page"
          popupMenu={"vertical-menu"}
          parentReference={"event"}
          actions={actions}
          showTitle={false}
          // description={`Create and manage your events with our comprehensive platform`}
          api={checkprivilege([privileges.admin, privileges.ticketAdmin], userType) ? `event` : checkprivilege([privileges.franchiseAdmin], userType) ? `event/franchise` : `event/event-admin`}
          itemTitle={{ name: "title", type: "text", collection: "" }}
          shortName={`Event`}
          formMode={`double`}
          labels={[
            { key: "Live Events", title: "LIVE EVENTS", icon: "calendar-check", backgroundColor: "rgba(0, 200, 81, 0.15)", color: "#006B27" },
            { key: "Upcoming Events", title: "UPCOMING EVENTS", icon: "calendar-plus", backgroundColor: "rgba(0, 122, 255, 0.15)", color: "#004999" },
            { key: "Archive", title: "PAST EVENTS", icon: "calendar-minus", backgroundColor: "rgba(255, 69, 58, 0.15)", color: "#99231B" },
            { key: "Total Events", title: "TOTAL EVENTS", icon: "calendar-alt", backgroundColor: "rgba(88, 86, 214, 0.15)", color: "#2B2A69" },
          ]}
          {...props}
          updatePrivilege={false}
          attributes={attributes}
          subPageAuthorization={true}
          dotMenu={true}
          showEditInDotMenu={true}
          showDeleteInDotMenu={true}
          delPrivilege={true}
        // ListItemRender={ListItemRender}
        // MetricTileRender={MetricTileRender}
        ></ListTable>
        {openMenuSetup && openItemData && (
          <PopupView
            popupData={
              <EventForm
                {...props}
                data={{
                  _id: openItemData?.data?.ticket?._id || openItemData?.data?._id,
                  title: openItemData?.data?.title,
                  description: openItemData?.data?.description,
                  event: {
                    _id: openItemData?.data?.event?._id,
                    title: openItemData?.data?.event?.title,
                  },
                  // Fix: Use ticket ID for abstractions, fallback to participantType for other types
                  participantType:
                    openItemData?.data?.ticket?._id || (typeof openItemData?.data?.participantType === "object" ? openItemData?.data?.participantType?._id : openItemData?.data?.participantType),
                  participantTypeName: typeof openItemData?.data?.participantType === "object" ? openItemData?.data?.participantType?.name : openItemData?.data?.participantTypeName,
                  slug: openItemData?.data?.slug,
                  status: openItemData?.data?.status,
                  type: openItemData?.data?.ticket?.type || openItemData?.data?.type,
                  enableWhatsapp: openItemData?.data?.enableWhatsapp,
                  enableEmail: openItemData?.data?.enableEmail,
                  // Include all the template data that might be needed
                  emailTemplate: openItemData?.data?.emailTemplate,
                  whatsappTemplate: openItemData?.data?.whatsappTemplate,
                  onsuccessfullMessage: openItemData?.data?.onsuccessfullMessage,
                  needsApproval: openItemData?.data?.needsApproval,
                }}
                user={props?.user}
                themeColors={themeColors}
                setMessage={props?.setMessage}
                setLoaderBox={props?.setLoaderBox}
                setOpenEventFormSettingsTrigger={openEventFormSettingsTrigger}
              />
            }
            themeColors={themeColors}
            closeModal={() => setOpenMenuSetup(false)}
            customClass={"full-page"}
            itemTitle={{
              name: "title",
              type: "text",
              collection: "",
              render: (value, rowData) => <EventFormHeader rowData={rowData} />,
            }}
            openData={{
              data: {
                _id: openItemData?.data?._id || "event-form",
                title: openItemData?.data?.participantType?.name || openItemData?.data?.participantTypeName || openItemData?.data?.name || openItemData?.data?.title || "Event Form",
                slug: openItemData?.data?.slug,
                event: typeof openItemData?.data?.event === "object" ? openItemData?.data?.event?._id : openItemData?.data?.event,
              },
            }}
            headerActions={[{ label: "Settings", icon: "settings", onClick: () => setOpenEventFormSettingsTrigger((prev) => prev + 1) }]}
          />
        )}
        {openTicketForm && openItemData && (
          <PopupView
            popupData={
              <FormBuilderNew
                {...props}
                data={openItemData?.data || {}}
                user={props?.user}
                themeColors={themeColors}
                setMessage={props?.setMessage}
                setLoaderBox={props?.setLoaderBox}
                openSettingsTrigger={openSettingsTrigger}
              />
            }
            themeColors={themeColors}
            closeModal={() => setOpenTicketForm(false)}
            customClass={"full-page"}
            itemTitle={{ name: "title", type: "text", collection: "", render: (value, rowData) => <FormBuilderHeader rowData={rowData} /> }}
            openData={{
              data: { _id: openItemData?.data?._id || "form-builder", title: openItemData?.data?.title || "Form Builder" },
            }}
            headerActions={[
              { label: "Publish", icon: "publish" },
              { label: "Settings", icon: "settings", onClick: () => setOpenSettingsTrigger((prev) => prev + 1) },
            ]}
          ></PopupView>
        )}
        {openPosterMaker && openItemData && (
          <PopupView
            // Popup data is a JSX element which is binding to the Popup Data Area like HOC
            popupData={<PosterBuilder {...props} type={"advocacy"} data={openItemData.data} item={openItemData.item} />}
            themeColors={themeColors}
            closeModal={closeModal}
            itemTitle={{ name: "title", type: "text", collection: "", render: (value, rowData) => <PosterBuilderHeader rowData={rowData} /> }}
            // openData={openItemData} // Pass selected item data to the popup for setting the time and taking menu id and other required data from the list item
            openData={{ data: { _id: "print_preparation", ...openItemData?.data } }}
            customClass={"full-page"}
          ></PopupView>
        )}
        {openPosterUsage && openItemData && (
          <PopupView
            // Popup data is a JSX element which is binding to the Popup Data Area like HOC
            // popupData={<ListTable api={`advocacy-poster-usage?advocacyPoster=${openItemData.data._id}`}
            //   attributes={advocacyPosterUsage}
            //   />}
            popupData={<IAmAttending posterId={openItemData.data._id} />}
            themeColors={themeColors}
            closeModal={closeModal}
            itemTitle={{ name: "title", type: "text", collection: "" }}
            // openData={openItemData} // Pass selected item data to the popup for setting the time and taking menu id and other required data from the list item
            openData={{ data: { _id: "print_preparation", title: "Poster Usage" } }}
            customClass={"full-page"}
          ></PopupView>
        )}
        {openBadgeSetup && openItemData && (
          <PopupView
            // Popup data is a JSX element which is binding to the Popup Data Area like HOC
            // popupData={<BadgeForm {...props} data={openItemData.data} item={openItemData.item} />}
            popupData={<PosterBuilder {...props} type={"badge"} data={openItemData.data} item={openItemData.item} />}
            themeColors={themeColors}
            closeModal={closeModal}
            itemTitle={{ name: "title", type: "text", collection: "" }}
            // openData={openItemData} // Pass selected item data to the popup for setting the time and taking menu id and other required data from the list item
            openData={{ data: { _id: "print_preparation", title: "Badge" } }}
            customClass={"full-page"}
          ></PopupView>
        )}
        {openMenuSetupAudio && (
          <PopupView
            itemTitle={{ name: "title", type: "text", collection: "" }}
            popupData={<UploadAudio {...props} data={openItemData.data} />}
            openData={{ data: { _id: "print_preparation", title: "Upload Audio / " + openItemData?.data?.title } }}
            themeColors={themeColors}
            customClass={"large"}
            closeModal={() => setOpenMenuSetupAudio(false)}
          ></PopupView>
        )}
        {/* New Recording Modal */}
        {openNewRecording && <EventAudioUpload {...props} openData={{ data: { _id: slug } }} autoOpenModal={true} actionType="new-recording" onModalClose={() => setOpenNewRecording(false)} />}
        {/* Map to Session Modal */}
        {openMapSession && (
          <EventAudioUpload
            {...props}
            openData={{ data: { _id: slug } }}
            autoOpenModal={true}
            actionType="map-session"
            selectedRecordingData={openItemData}
            onModalClose={() => {
              setOpenMapSession(false);
              // setOpenItemData(null);
            }}
          />
        )}
        {/* Remap Session Modal */}
        {openRemapSession && <EventAudioUpload {...props} openData={{ data: { _id: slug } }} autoOpenModal={true} actionType="remap-session" onModalClose={() => setOpenRemapSession(false)} />}
        {/* View Transcript Modal */}
        {openViewTranscript && (
          <EventAudioUpload
            {...props}
            openData={{ data: { _id: slug } }}
            autoOpenModal={true}
            actionType="view-transcript"
            selectedRecordingData={openItemData}
            onModalClose={() => {
              setOpenViewTranscript(false);
            }}
          />
        )}

        {openCompanyProfile && openItemData && (
          <PopupView
            popupData={<CompanyProfile exhibitorData={openItemData.data} />}
            themeColors={themeColors}
            closeModal={() => setOpenCompanyProfile(false)}
            itemTitle={{ name: "companyName", type: "text", collection: "" }}
            openData={{ data: { _id: "company_profile", title: openItemData?.data?.companyName || "Company Profile" } }}
            customClass={"full-page"}
          ></PopupView>
        )}
        {openTeamManagement && openItemData && (
          <PopupView
            popupData={<TeamManagement exhibitorData={openItemData.data} />}
            themeColors={themeColors}
            closeModal={() => setOpenTeamManagement(false)}
            itemTitle={{ name: "companyName", type: "text", collection: "" }}
            openData={{ data: { _id: "team_management", title: `${openItemData?.data?.companyName || "Company"} - Team Management` } }}
            customClass={"full-page"}
          ></PopupView>
        )}
        {openProductCatalog && openItemData && (
          <PopupView
            popupData={<ProductCatalog exhibitorData={openItemData.data} />}
            themeColors={themeColors}
            closeModal={() => setOpenProductCatalog(false)}
            itemTitle={{ name: "companyName", type: "text", collection: "" }}
            openData={{ data: { _id: "product_catalog", title: `${openItemData?.data?.companyName || "Company"} - Product Catalog` } }}
            customClass={"full-page"}
          ></PopupView>
        )}
        {openTicketResponse && openItemData && (
          <PopupView
            popupData={
              <TicketResponseViewer ticketData={openItemData?.data || {}} eventId={openItemData?.data?.event?._id || props?.openData?.data?._id} onClose={() => setOpenTicketResponse(false)} />
            }
            themeColors={themeColors}
            closeModal={() => setOpenTicketResponse(false)}
            customClass={"full-page"}
            itemTitle={{ name: "title", type: "text", collection: "" }}
            openData={{
              data: { _id: openItemData?.data?._id || "ticket-response", title: `${openItemData?.data?.title || "Ticket"} Responses` },
            }}
          ></PopupView>
        )}
        {openParticipantResponse && openItemData && (
          <PopupView
            popupData={
              <ParticipantResponseViewer
                participantData={openItemData?.data || {}}
                eventId={openItemData?.data?.event?._id || props?.openData?.data?._id}
                onClose={() => setOpenParticipantResponse(false)}
              />
            }
            themeColors={themeColors}
            closeModal={() => setOpenParticipantResponse(false)}
            customClass={"full-page"}
            itemTitle={{ name: "title", type: "text", collection: "" }}
            openData={{
              data: { _id: openItemData?.data?._id || "participant-response", title: `${openItemData?.data?.name || "Participant Type"} Responses` },
            }}
          ></PopupView>
        )}
        {openFormResponse && openItemData && (
          <PopupView
            popupData={<FormResponseViewer formData={openItemData?.data || {}} eventId={openItemData?.data?.event?._id || props?.openData?.data?._id} onClose={() => setOpenFormResponse(false)} />}
            themeColors={themeColors}
            closeModal={() => setOpenFormResponse(false)}
            customClass={"full-page"}
            itemTitle={{ name: "title", type: "text", collection: "" }}
            openData={{
              data: { _id: openItemData?.data?._id || "form-response", title: `${openItemData?.data?.title || "Form"} Responses` },
            }}
          ></PopupView>
        )}
        {openAddContest && openItemData && (
          <PopupView
            popupData={<ContestBasedModal {...props} openData={props.openData} data={openItemData?.data} item={openItemData?.item} />}
            themeColors={themeColors}
            closeModal={() => setOpenAddContest(false)}
            customClass={"medium"}
            itemTitle={{ name: "title", type: "text", collection: "" }}
            openData={{
              data: { _id: props?.openData?.data?._id || "contest-based", title: "Contest Based" },
            }}
          ></PopupView>
        )}
        {/* Reviewer Assignment Modal */}
        {openReviewerAssignment && selectedSubmission && (
          <AutoForm
            header="Assign Reviewers"
            // description={`Assign reviewers to submission: ${selectedSubmission.fullName || selectedSubmission.emailId || 'Submission'}`}
            formType="put"
            api="ticket-registration"
            parentReference={"event"}
            referenceId={typeof selectedSubmission.event === "object" ? selectedSubmission.event?._id || selectedSubmission.event?.id : selectedSubmission.event}
            formInput={reviewerAssignmentAttributes}
            formLayout={"center"}
            formValues={{
              reviewers: selectedSubmission.reviewers || [],
            }}
            isOpenHandler={() => {
              setOpenReviewerAssignment(false);
              setSelectedSubmission(null);
            }}
            setLoaderBox={() => { }}
            setMessage={props.setMessage}
            onClose={() => {
              setOpenReviewerAssignment(false);
              setSelectedSubmission(null);
            }}
            onCancel={() => {
              setOpenReviewerAssignment(false);
              setSelectedSubmission(null);
            }}
            submitHandler={async (data) => {
              try {
                // Normalize reviewers to array of IDs
                const reviewerIds = Array.isArray(data.reviewers) ? data.reviewers.map((r) => (typeof r === "object" ? r.id || r._id || r.value : r)) : [];

                // Update the submission with selected reviewers using PUT
                const response = await putData(
                  {
                    id: selectedSubmission._id,
                    reviewers: reviewerIds,
                  },
                  "ticket-registration"
                );

                if (response.status === 200) {
                  props.setMessage({
                    type: 1,
                    content: "Reviewers assigned successfully!",
                    icon: "success",
                    title: "Success",
                  });
                  setOpenReviewerAssignment(false);
                  setSelectedSubmission(null);
                  // Refresh the submissions list
                  window.location.reload();
                } else {
                  throw new Error(response.message || "Failed to assign reviewers");
                }
              } catch (error) {
                console.error("Error assigning reviewers:", error);
                props.setMessage({
                  type: 1,
                  content: error.message || "Failed to assign reviewers. Please try again.",
                  icon: "error",
                  title: "Error",
                });
              }
            }}
            button="Assign Reviewers"
            customClass="medium"
          />
        )}

        {/* Note: Exhibitor QR Code Modal */}
        {exhibitorQrCodeData.show &&
          (() => {
            console.log("MODAL IS RENDERING!", exhibitorQrCodeData);
            return (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 99999 }}>
                <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Exhibitor QR Code</h3>
                    <button onClick={handleCloseExhibitorQR} className="text-gray-400 hover:text-gray-500">
                      <GetIcon icon="close" className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-4 rounded-lg mb-4">
                      <QRCode id="exhibitor-qr-code-svg" value={exhibitorQrCodeData.exhibitorId} size={200} level="H" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">{exhibitorQrCodeData.exhibitorName}</p>
                    <p className="text-xs text-gray-600 mb-4">Exhibitor ID: {exhibitorQrCodeData.exhibitorId}</p>
                    <div className="flex gap-2">
                      <button onClick={copyExhibitorLinkToClipboard} className="text-xs px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-full border border-blue-200 flex items-center gap-1">
                        <GetIcon icon="copy" className="w-3 h-3" />
                        Copy ID
                      </button>
                      <button onClick={handleDownloadExhibitorQR} className="text-xs px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-full border border-green-200 flex items-center gap-1">
                        <GetIcon icon="download" className="w-3 h-3" />
                        Download QR
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
      </Container>

      {/* PDF Invoice Preview Modal */}
      {showPDFPreview && <PDFPreview closeModal={() => setShowPDFPreview(false)} title={pdfData.title} isUrl={true} url={pdfData.url} />}
    </>
  );
};
// exporting the page with parent container layout..
export default Layout(Event);
