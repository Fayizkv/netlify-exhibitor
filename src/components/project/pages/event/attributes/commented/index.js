// ***************** attributes commented code ***************** //
// {
//   type: "text",
//   placeholder: "Slug",
//   name: "slug",
//   validation: "",
//   default: "",
//   label: "Slug",
//   validate: "slug",
//   group: "Event Details",
//   required: true,
//   add: false,
//   update: true,
//   customClass: "full",
// },
// {
//   type: "select",
//   apiType: "API",
//   selectApi: "event-category/select",
//   name: "eventCategory",
//   showItem: "eventCategory",
//   validation: "",
//   default: "",
//   tag: false,
//   label: "Event Category",
//   required: false,
//   view: true,
//   add: false,
//   update: true,
//   filter: false,
//   footnote: "This will help us to better personalise our services for you",
//   customClass: "full",
// },
// {
//   type: "select",
//   placeholder: "Registration Mode",
//   name: "registrationMode",
//   validation: "",
//   editable: true,
//   label: "Registration Mode",
//   sublabel: "Choose how attendees will register and pay for your event",
//   group: "Registration",
//   showItem: "",
//   required: true,
//   customClass: "full",
//   default: "formReg",
//   filter: false,
//   view: true,
//   add: true,
//   update: true,
//   apiType: "JSON",
//   selectType: "card",
//   selectApi: [
//     {
//       value: "Simple Form Registration",
//       id: "formReg",
//       description: "Collect attendee information and payment in a single streamlined form",
//       icon: "simple",
//     },
//     {
//       value: " Checkout with Registration",
//       id: "checkout",
//       description: "Step-by-step checkout process with payment confirmation.",
//       icon: "checkout",
//     },
//   ],
// },
// {
//   type: "title",
//   title: "Enable or Disable Modules for Your Event",
//   name: "Enable or Disable Modules for Your Event",
//   icon: "registration",
//   add: false,
//   update: true,
// },
// {
//   type: "title",
//   title: "Enable or Disable Modules for Your Event",
//   description: "Customize your experience by selecting the modules that best suit your event needs. You can adjust these settings at any time.",
//   name: "about",
//   customClass: "full",
//   add: true,
//   group: "Modules",
//   update: false,
// },
// {
//   type: "multiSelect",
//   placeholder: "Core Modules",
//   name: "coreModules",
//   validation: "",
//   selectType: "card",
//   editable: true,
//   customClass: "full",
//   label: "Core Modules",
//   showItem: "",
//   required: true,
//   filter: false,
//   view: true,
//   add: true,
//   group: "Modules",
//   update: true,
//   apiType: "API",
//   selectApi: "event-module/select",
// },
// {
//   type: "multiSelect",
//   placeholder: "Addons",
//   name: "addons",
//   validation: "",
//   selectType: "card",
//   editable: true,
//   label: "Addons",
//   showItem: "",
//   required: true,
//   filter: false,
//   view: true,
//   add: true,
//   group: "Modules",
//   update: true,
//   customClass: "full",
//   apiType: "API",
//   selectApi: "add-on/select",
// },
// {
//   type: "multiSelect",
//   apiType: "API",
//   selectApi: "country/select",
//   placeholder: "Allowed Countries",
//   showItem: "title",
//   name: "countries",
//   validation: "",
//   default: "",
//   tag: false,
//   label: "Countries",
//   required: false,
//   view: true,
//   add: false,
//   update: true,
//   filter: true,
//   icon: "country",
// },
// {
//   type: "element",
//   name: "website",
//   label: "Website Demo",
//   view: true,
//   add: true,
//   update: true,
//   customClass: "full",
//   filter: false,
//   element: (props) => {
//     const { formValues } = props;

//     const formatDate = (date) => {
//       return moment(date).format('MMM DD, YYYY h:mm A');
//     };

//     return (
//       <div className="w-full bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
//         {/* Hero Section with Banner */}
//         <div className="relative h-[400px] bg-amber-100">
//           {formValues?.banner?.[0] ? (
//             <img
//               src={URL.createObjectURL(formValues.banner[0])}
//               alt="Event Banner"
//               className="absolute inset-0 w-full h-full object-cover"
//             />
//           ) : formValues?.banner ? (
//             <img
//               src={formValues.banner}
//               alt="Event Banner"
//               className="absolute inset-0 w-full h-full object-cover"
//             />
//           ) : (
//             <div className="absolute inset-0 bg-gradient-to-r from-amber-200 to-amber-100">
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <div className="text-center space-y-4 p-8">
//                   {formValues?.logo?.[0] ? (
//                     <img
//                       src={URL.createObjectURL(formValues.logo[0])}
//                       alt="Event Logo"
//                       className="h-24 mx-auto object-contain"
//                     />
//                   ) : formValues?.logo ? (
//                     <img
//                       src={formValues.logo}
//                       alt="Event Logo"
//                       className="h-24 mx-auto object-contain"
//                     />
//                   ) : null}
//                   <h1 className="text-5xl font-bold text-gray-800">{formValues?.title || 'M1 Destinations'}</h1>
//                   <p className="text-xl text-gray-600">Your Gateway to Exploration!</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Floating Icons */}
//           <div className="absolute inset-0">
//             <GetIcon icon="camera" className="absolute top-10 left-10 w-8 h-8 text-gray-600 opacity-50" />
//             <GetIcon icon="location" className="absolute bottom-20 left-20 w-8 h-8 text-gray-600 opacity-50" />
//             <GetIcon icon="compass" className="absolute top-20 right-20 w-8 h-8 text-gray-600 opacity-50" />
//             <GetIcon icon="ticket" className="absolute bottom-10 right-10 w-8 h-8 text-gray-600 opacity-50" />
//           </div>
//         </div>

//         {/* Event Details */}
//         <div className="p-8 space-y-8">
//           {/* Trip Highlights */}
//           <div className="space-y-4">
//             <h2 className="text-2xl font-semibold text-gray-800">Trip Highlights</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
//                 <GetIcon icon="calendar" className="w-6 h-6 text-amber-600" />
//                 <div>
//                   <h3 className="font-medium text-gray-800">Dates</h3>
//                   <p className="text-gray-600">{formatDate(formValues?.startDate)} - {formatDate(formValues?.endDate)}</p>
//                 </div>
//               </div>

//               <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
//                 <GetIcon icon="location" className="w-6 h-6 text-amber-600" />
//                 <div>
//                   <h3 className="font-medium text-gray-800">Destinations</h3>
//                   <p className="text-gray-600">{formValues?.venue || 'Multiple Locations'}</p>
//                 </div>
//               </div>

//               <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
//                 <GetIcon icon={formValues?.ticketType === 'free' ? 'ticket' : 'paid'} className="w-6 h-6 text-amber-600" />
//                 <div>
//                   <h3 className="font-medium text-gray-800">Fee</h3>
//                   <p className="text-gray-600">{formValues?.ticketType === 'free' ? 'Free Event' : '₹19,500/- plus 18% Gst.'}</p>
//                 </div>
//               </div>

//               <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
//                 <GetIcon icon="user-group" className="w-6 h-6 text-amber-600" />
//                 <div>
//                   <h3 className="font-medium text-gray-800">Age Group</h3>
//                   <p className="text-gray-600">13 to 17 Years</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Description */}
//           {formValues?.description && (
//             <div className="space-y-4">
//               <h2 className="text-2xl font-semibold text-gray-800">About The Journey</h2>
//               <div
//                 className="prose prose-amber max-w-none text-gray-600"
//                 dangerouslySetInnerHTML={{ __html: formValues.description }}
//               />
//             </div>
//           )}

//           {/* Photo Gallery */}
//           <div className="space-y-4">
//             <h2 className="text-2xl font-semibold text-gray-800">Experience Glimpses</h2>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {[1, 2, 3, 4].map((i) => (
//                 <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
//                   <img
//                     src={`https://source.unsplash.com/random/400x400?travel&${i}`}
//                     alt={`Gallery ${i}`}
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Registration CTA */}
//           <div className="text-center space-y-4 py-8">
//             <h2 className="text-3xl font-bold text-gray-800">Ready to Explore?</h2>
//             <p className="text-gray-600">Registration ends on 30th March 2025</p>
//             <button className="px-8 py-3 bg-amber-600 text-white rounded-full font-medium hover:bg-amber-700 transition-colors">
//               Register Now
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   },
// },

// ***************** actions commented code ***************** //
// {
//   type: "title",
//   title: "MOBILE APP SETTINGS",
//   id: "MOBILE APP SETTINGS",
// },
// {
//   element: "button",
//   type: "subList",
//   id: "mobile-modules",
//   title: "App Modules",
//   icon: "mobile-modules",
//   attributes: mobileModules,
//   params: {
//     api: `mobile-module`,
//     parentReference: "event",
//     itemTitle: {
//       name: "instaSnapEnabled",
//       type: "text",
//       collection: "",
//     },
//     shortName: "App Modules",
//     addPrivilege: true,
//     delPrivilege: true,
//     updatePrivilege: true,
//     customClass: "medium",
//     showInfoType: "edit",
//     viewMode: "info",
//   },
// },
// {
//   element: "button",
//   type: "subList",
//   id: "dashboard-banner",
//   title: "Banner",
//   icon: "banner",
//   attributes: dashboardBanner,
//   params: {
//     api: `dashboard-banner`,
//     parentReference: "event",
//     imageSettings: {
//       fileName: "file",
//       image: "file",
//       thumbnail: "compressed",
//       endpoind: "https://event-hex-saas.s3.amazonaws.com/",
//     },
//     itemTitle: { name: "image", type: "text", collection: "" },
//     rowLimit: 30,
//     viewMode: "gallery",
//     shortName: "Banner",
//     addLabel: { label: "Add Banners" },
//     addPrivilege: true,
//     delPrivilege: true,
//     updatePrivilege: true,
//     customClass: "medium",
//   },
// },
// {
//   element: "button",
//   type: "subList",
//   id: "notification",
//   title: "Notification",
//   icon: "notification",
//   attributes: notification,
//   params: {
//     api: `notification`,
//     parentReference: "event",
//     itemTitle: { name: "title", type: "text", collection: "" },
//     profileImage: "image",
//     shortName: "Notification",
//     addPrivilege: true,
//     delPrivilege: true,
//     updatePrivilege: true,
//     customClass: "medium",
//   },
// },
// {
//   element: "button",
//   type: "custom",
//   id: "app-setting",
//   title: "App Settings",
//   icon: "app-setting",
//   content: ColorPicker,
// },
// {
//   element: "button",
//   type: "subList",
//   id: "app-version",
//   title: "App Version",
//   icon: "app-version",
//   attributes: appVersion,
//   params: {
//     api: `app-version`,
//     parentReference: "event",
//     itemTitle: { name: "version", type: "text", collection: "" },
//     shortName: "App Version",
//     addPrivilege: false,
//     delPrivilege: false,
//     updatePrivilege: true,
//     customClass: "medium",
//     viewMode: "table",
//   },
// },
// {
//   element: "button",
//   type: "custom",
//   id: "automationTab",
//   icon: "dashboard",
//   title: "Automation",
//   page: "automationTab",
// },
// {
//   element: "button",
//   type: "subList",
//   id: "campaign",
//   title: "Campaign",
//   icon: "campaign",
//   tabs: [
//     {
//       element: "button",
//       type: "subList",
//       id: "campaign",
//       title: "Campaign",
//       icon: "campaign",
//       attributes: campaign,
//       params: {
//         api: `campaign`,
//         parentReference: "event",
//         itemTitle: {
//           name: "campaignName",
//           type: "text",
//           collection: "",
//         },
//         shortName: "Campaign",
//         addPrivilege: true,
//         delPrivilege: true,
//         updatePrivilege: true,
//         customClass: "medium",
//       },
//     },
//   ],
// },
// {
//   element: "button",
//   type: "custom",
//   id: "instance-attendance",
//   icon: "checkin",
//   title: "Instance Attendance",
//   content: instanceAttendance,
// },
// {
//   element: "button",
//   type: "custom",
//   id: "missed-instance-attendance",
//   icon: "checkin",
//   title: "Missed Instance Attendance",
//   content: missedInstanceAttendance,
// },
// {
//   type: "title",
//   title: "FEED BACK",
//   id: "FEED BACK",
// },
// {
//   element: "button",
//   type: "subList",
//   id: "feedbacks",
//   title: "Feedback",
//   icon: "feedback",
//   attributes: feedback,
//   params: {
//     api: `mobile/feedback`,
//     parentReference: "event",
//     icon: "feedbacks",
//     itemTitle: { name: "overall", type: "text", collection: "" },
//     shortName: "Feedback",
//     addPrivilege: true,
//     delPrivilege: true,
//     updatePrivilege: true,
//     customClass: "medium",
//     viewMode: "table",
//   },
// },
// {
//   element: "button",
//   type: "subTabs",
//   id: "addOns",
//   title: "Add Ons",
//   icon: "addOns",
//   tabs: [
//     {
//       element: "button",
//       type: "subList",
//       id: "add-ons",
//       title: "Add Ons",
//       icon: "addOns",
//       attributes: addonmodules,
//       params: {
//         api: `event`,
//         parentReference: "_id",
//         itemTitle: { name: "addons", type: "text", collection: "" },
//         shortName: "Add Ons",
//         addPrivilege: false,
//         delPrivilege: false,
//         updatePrivilege: true,
//         customClass: "medium",
//         showInfoType: "edit",
//         viewMode: "info",
//       },
//     },
//     {
//       element: "button",
//       type: "subList",
//       id: "core-module",
//       title: "Modules",
//       icon: "core-module",
//       attributes: coremodules,
//       params: {
//         api: `event`,
//         parentReference: "_id",
//         itemTitle: { name: "coreModules", type: "text", collection: "" },
//         shortName: "Modules",
//         addPrivilege: false,
//         delPrivilege: false,
//         updatePrivilege: true,
//         customClass: "medium",
//         showInfoType: "edit",
//         viewMode: "info",
//       },
//     },
//   ],
// },
// {
//   element: "button",
//   type: "subList",
//   id: "manage-photos",
//   title: "Manage Photos",
//   icon: "manage-photos",
//   attributes: instaSnap,
//   params: {
//     api: `insta-snap`,
//     imageSettings: {
//       fileName: "file",
//       image: "compressed",
//       thumbnail: "thumbnail",
//       endpoind: "https://event-hex-saas.s3.amazonaws.com/",
//     },
//     parentReference: "event",
//     itemTitle: { name: "name", type: "text", collection: "" },
//     rowLimit: 30,
//     viewMode: "gallery",
//     shortName: "Photos",
//     description: "Organize, edit, and oversee all uploaded photos from your event",
//     addLabel: { label: "Add Photos" },
//     addPrivilege: true,
//     delPrivilege: true,
//     updatePrivilege: true,
//     customClass: "medium",
//   },
// },
// {
//   element: "button",
//   type: "subList",
//   id: "eventHighlights",
//   title: "Event Highlights",
//   icon: "event-highlights",
//   attributes: eventHighlights,
//   params: {
//     api: `event-highlight`,
//     imageSettings: {
//       fileName: "file",
//       image: "compressed",
//       thumbnail: "thumbnail",
//       endpoind: "https://event-hex-saas.s3.amazonaws.com/",
//     },
//     parentReference: "event",
//     itemTitle: { name: "name", type: "text", collection: "" },
//     rowLimit: 30,
//     viewMode: "gallery",
//     shortName: "Event Highlights",
//     description: "Showcase selected event photos visible to all attendees in the gallery",
//     addLabel: { label: "Add Event Highlights" },
//     addPrivilege: false,
//     delPrivilege: true,
//     updatePrivilege: false,
//     customClass: "medium",
//   },
// },
// {
//   type: "title",
//   title: "CONTRIBUTE",
//   id: "CONTRIBUTE",
// },
// {
//   element: "button",
//   type: "subList",
//   id: "contribute",
//   title: "Contribute",
//   icon: "contribute",
//   attributes: instaSnap,
//   params: {
//     api: `contribute`,
//     imageSettings: {
//       fileName: "file",
//       image: "compressed",
//       thumbnail: "thumbnail",
//       endpoind: "https://event-hex-saas.s3.amazonaws.com/",
//     },
//     parentReference: "event",
//     itemTitle: { name: "name", type: "text", collection: "" },
//     rowLimit: 30,
//     viewMode: "gallery",
//     shortName: "contribute",
//     addLabel: { label: "Add Contribute" },
//     addPrivilege: true,
//     delPrivilege: true,
//     updatePrivilege: true,
//     customClass: "medium",
//   },
// },
// {
//   element: "button",
//   type: "subList",
//   id: "upload-history",
//   title: "Upload History",
//   icon: "upload-history",
//   attributes: uploadHistory,
//   params: {
//     api: `insta-upload-history`,
//     parentReference: "event",
//     itemTitle: { name: "imageCount", type: "text", collection: "" },
//     shortName: "Upload History",
//     addPrivilege: false,
//     delPrivilege: true,
//     updatePrivilege: true,
//     customClass: "medium",
//     viewMode: "table",
//   },
// },
// {
//   element: "button",
//   type: "custom",
//   id: "face-match",
//   icon: "attendees",
//   title: "Photo Attendee",
//   description: "View a list of attendees who scanned their face to retrieve event photos",
//   page: "faceMatch",
// },
// {
//   type: "title",
//   title: "STATISTICS",
//   id: "STATISTICS",
// },
// {
//   element: "button",
//   type: "custom",
//   id: "photo-usage-analytics",
//   icon: "photo-usage",
//   title: "Photo Usage Analytics",
//   content: photoAnalytics,
// },
// {
//   type: "title",
//   title: "PRINTABLES",
//   id: "PRINTABLES",
// },
// {
//   element: "button",
//   type: "custom",
//   id: "qr-code",
//   icon: "qr",
//   title: "QR Code",
//   page: "qrCode",
// },
// {
//   element: "button",
//   type: "subList",
//   id: "sessions",
//   title: "Sessions",
//   icon: "session",
//   attributes: sessions,
//   params: {
//     api: `sessions`,
//     parentReference: "event",
//     itemTitle: { name: "title", type: "text", collection: "" },
//     bulkUplaod: true,
//     shortName: "Sessions",
//     description: "Organize your event into time slots with customizable sessions",
//     submitButtonText: "Create",
//     itemOpenMode: {
//       type: "callback",
//       callback: (data) => {
//         setOpenItemData({ data });
//         setOpenMenuSetupAudio(true);
//       },
//     },
//     addPrivilege: true,
//     delPrivilege: true,
//     updatePrivilege: true,
//     customClass: "medium",
//     viewMode: "list",
//     formMode: "single",
//     exportPrivilege: true,
//     showEditInDotMenu: false,
//     actions: [
//       {
//         element: "action",
//         type: "subList",
//         id: "session-speaker",
//         title: "Add Sub Program",
//         icon: "speakers",
//         actionType: "button",
//         attributes: sessionSpeaker,
//         params: {
//           api: `session-speaker`,
//           parentReference: "session",
//           itemTitle: { name: "title", type: "text", collection: "" },
//           shortName: "Sub Program",
//           description: "Add sub programs to your sessions",
//           addPrivilege: true,
//           delPrivilege: true,
//           updatePrivilege: true,
//           customClass: "medium",
//           viewMode: "table",
//           formMode: "single",
//         },
//       },
//     ],
//   },
// },
// {
//   element: "button",
//   type: "subList",
//   id: "speakers",
//   title: "Speakers",
//   icon: "speakers",
//   attributes: speakers,
//   params: {
//     api: `speakers`,
//     parentReference: "event",
//     itemTitle: { name: "name", type: "text", collection: "" },
//     profileImage: "photo",
//     shortName: "Speaker",
//     description: "Manage your event's speakers, their profiles, and session assignments",
//     submitButtonText: "Create",
//     addPrivilege: true,
//     delPrivilege: true,
//     updatePrivilege: true,
//     customClass: "medium",
//     viewMode: "table",
//     formMode: "single",
//   },
// },

// {
//   element: "button",
//   type: "subTabs",
//   id: "sponsors",
//   title: "Sponsor",
//   icon: "sponsors",
//   tabs: [
//     {
//       element: "button",
//       type: "subList",
//       id: "sponsors-list",
//       title: "Sponsors List",
//       icon: "sponsor-list",
//       attributes: sponsors,
//       params: {
//         api: `sponsors`,
//         parentReference: "event",
//         itemTitle: { name: "title", type: "text", collection: "" },
//         shortName: "Sponsors",
//         description: "Manage event sponsors and their promotional materials",
//         submitButtonText: "Create",
//         profileImage: "logo",
//         addPrivilege: true,
//         delPrivilege: true,
//         updatePrivilege: true,
//         customClass: "medium",
//         viewMode: "table",
//       },
//     },
//     {
//       element: "button",
//       type: "subList",
//       id: "sponsor-category",
//       title: "Sponsor Category",
//       icon: "sponsor-category",
//       attributes: sponsorCategory,
//       params: {
//         api: `sponsor-category`,
//         parentReference: "event",
//         itemTitle: {
//           name: "sponsorCategory",
//           type: "text",
//           collection: "",
//         },
//         shortName: "Sponsor Category",
//         description: "Add sponsor categories to your event",
//         submitButtonText: "Create",
//         addPrivilege: true,
//         delPrivilege: true,
//         updatePrivilege: true,
//         customClass: "medium",
//         viewMode: "table",
//       },
//     },
//   ],
// },
// {
//   element: "button",
//   type: "subTabs",
//   id: "exhibitor",
//   title: "Exhibitor",
//   icon: "exhibitor",
//   tabs: [
//     {
//       element: "button",
//       type: "subList",
//       id: "exhibitor-list",
//       title: "Exhibitors",
//       icon: "exhibitor",
//       attributes: exhibitor,
//       params: {
//         api: `ticket-registration/exhibitor`,
//         parentReference: "event",
//         itemTitle: {
//           name: "companyName",
//           type: "text",
//           collection: "",
//         },
//         shortName: "Exhibitors",
//         addPrivilege: true,
//         delPrivilege: true,
//         updatePrivilege: true,
//         customClass: "medium",
//         formMode: "single",
//         viewMode: "table",
//         showEditInDotMenu: false,
//         actions: [
//           {
//             element: "button",
//             type: "callback",
//             callback: (item, data) => {
//               setOpenItemData({ item, data });
//               setOpenCompanyProfile(true);
//             },
//             icon: "info",
//             title: "Details",
//             params: {
//               api: ``,
//               parentReference: "",
//               itemTitle: { name: "companyName", type: "text", collection: "" },
//               shortName: "Details",
//               addPrivilege: true,
//               delPrivilege: true,
//               updatePrivilege: true,
//               customClass: "full-page",
//             },
//             actionType: "button",
//           },
//           {
//             element: "button",
//             type: "callback",
//             callback: (item, data) => {
//               setOpenItemData({ item, data });
//               setOpenTeamManagement(true);
//             },
//             icon: "users",
//             title: "Team Management",
//             params: {
//               api: ``,
//               parentReference: "",
//               itemTitle: { name: "companyName", type: "text", collection: "" },
//               shortName: "Team Management",
//               addPrivilege: true,
//               delPrivilege: true,
//               updatePrivilege: true,
//               customClass: "full-page",
//             },
//             actionType: "button",
//           },
//           {
//             element: "button",
//             type: "callback",
//             callback: (item, data) => {
//               setOpenItemData({ item, data });
//               setOpenProductCatalog(true);
//             },
//             icon: "package",
//             title: "Product Catalog",
//             params: {
//               api: ``,
//               parentReference: "",
//               itemTitle: { name: "companyName", type: "text", collection: "" },
//               shortName: "Product Catalog",
//               addPrivilege: true,
//               delPrivilege: true,
//               updatePrivilege: true,
//               customClass: "full-page",
//             },
//             actionType: "button",
//           },
//         ],
//       },
//     },
//     {
//       element: "button",
//       type: "subList",
//       id: "exhibitor-category",
//       title: "Exhibitor Package",
//       icon: "exhibitor-category",
//       attributes: exhibitorCategory,
//       params: {
//         api: `exhibitor-category`,
//         parentReference: "event",
//         itemTitle: {
//           name: "categoryName",
//           type: "text",
//           collection: "",
//         },
//         shortName: "Exhibitor Package",
//         addPrivilege: true,
//         delPrivilege: true,
//         updatePrivilege: true,
//         customClass: "medium",
//       },
//     },
//     {
//       element: "button",
//       type: "subList",
//       id: "booth-members",
//       title: "Booth Member",
//       icon: "booth-member",
//       attributes: boothMember,
//       params: {
//         api: `ticket-registration/boothmember`,
//         parentReference: "event",
//         itemTitle: { name: "fullName", type: "text", collection: "" },
//         shortName: "Booth Member",
//         addPrivilege: true,
//         delPrivilege: true,
//         updatePrivilege: true,
//         customClass: "medium",
//       },
//     },
//     {
//       element: "button",
//       type: "subList",
//       id: "download",
//       title: "Download",
//       icon: "download",
//       attributes: download,
//       params: {
//         api: `download`,
//         parentReference: "event",
//         itemTitle: { name: "title", type: "text", collection: "" },
//         shortName: "Download",
//         addPrivilege: true,
//         delPrivilege: true,
//         updatePrivilege: true,
//         customClass: "medium",
//       },
//     },
//     {
//       element: "button",
//       type: "subList",
//       id: "floor-plan",
//       title: "Floor Plan",
//       icon: "floor-plan",
//       attributes: floorPlan,
//       params: {
//         api: `floor-plan`,
//         parentReference: "event",
//         itemTitle: { name: "title", type: "text", collection: "" },
//         shortName: "Floor Plan",
//         addPrivilege: true,
//         delPrivilege: true,
//         updatePrivilege: true,
//         customClass: "medium",
//       },
//     },
//     {
//       element: "button",
//       type: "subList",
//       id: "faq",
//       title: "Faq",
//       icon: "faq",
//       attributes: faq,
//       params: {
//         api: `faq`,
//         parentReference: "event",
//         itemTitle: { name: "question", type: "text", collection: "" },
//         shortName: "Faq",
//         addPrivilege: true,
//         delPrivilege: true,
//         updatePrivilege: true,
//         customClass: "medium",
//       },
//     },
//     {
//       element: "button",
//       type: "subList",
//       id: "passes",
//       title: "Passes",
//       icon: "passes",
//       attributes: passes,
//       params: {
//         api: `passes`,
//         parentReference: "event",
//         itemTitle: { name: "numberOfPasses", type: "text", collection: "" },
//         shortName: "Passes",
//         addPrivilege: true,
//         delPrivilege: true,
//         updatePrivilege: true,
//         customClass: "medium",
//         formMode: "single",
//         viewMode: "table",
//         showEditInDotMenu: false,
//       },
//     },
//   ],
// },

// {
//   type: "title",
//   title: "Testing Form",
//   id: "BADGE",
// },
// {
//   element: "button",
//   type: "subList",
//   id: "ticket",
//   title: "Ticket",
//   icon: "ticket",
//   attributes: ticket,
//   params: {
//     api: `ticket`,
//     parentReference: "event",
//     icon: "ticket",
//     itemTitle: { name: "title", type: "text", collection: "" },
//     preFilter: { type: "Ticket" },
//     shortName: "Ticket",
//     description: "Create and manage different ticket types with customizable pricing and availability",
//     submitButtonText: "Create",
//     addPrivilege: true,
//     dotMenu: true,
//     delPrivilege: true,
//     updatePrivilege: true,
//     customClass: "medium",
//     formMode: `single`,
//     popupMode: "full-page",
//     popupMenu: "vertical-menu",
//     viewMode: "table",
//     showEditInDotMenu: false,
//     actions: [
//       {
//         element: "button",
//         type: "callback",
//         callback: (item, data) => {
//           setOpenItemData({ item, data });
//           setOpenTicketForm(true);
//         },
//         icon: "form-builder",
//         title: "Form Builder",
//         params: {
//           api: ``,
//           parentReference: "",
//           itemTitle: { name: "title", type: "text", collection: "" },
//           shortName: "Form Builder",
//           addPrivilege: true,
//           delPrivilege: true,
//           updatePrivilege: true,
//           customClass: "full-page",
//         },
//         actionType: "button",
//       },
//       {
//         element: "button",
//         type: "callback",
//         callback: (item, data) => {
//           let patchedData = { ...data };
//           if (item && (item.ticket?._id || item.ticket)) {
//             patchedData._id = item.ticket._id || item.ticket;
//           } else if (item && Array.isArray(item.tickets) && item.tickets.length > 0) {
//             patchedData._id = item.tickets[0]._id || item.tickets[0].id || item.tickets[0];
//           }
//           // Ensure event is present
//           if (!patchedData.event && item.event) {
//             patchedData.event = item.event;
//           }
//           setOpenItemData({ item, data: patchedData });
//           setOpenBadgeSetup(true);
//         },
//         icon: "badge",
//         title: "Badge Builder",
//         params: {
//           api: ``,
//           parentReference: "",
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

// {
//     type: "title",
//     title: "MODULES",
//     id: "MODULES",
//   },
//   {
//     element: "button",
//     type: "subList",
//     id: "mobile-modules",
//     title: "App Modules",
//     icon: "mobile-modules",
//     attributes: mobileModules,
//     params: {
//       api: `mobile-module`,
//       parentReference: "event",
//       itemTitle: {
//         name: "instaSnapEnabled",
//         type: "text",
//         collection: "",
//       },
//       shortName: "App Modules",
//       addPrivilege: true,
//       delPrivilege: true,
//       updatePrivilege: true,
//       customClass: "medium",
//       showInfoType: "edit",
//       viewMode: "info",
//     },
//   },

// {
//     type: "title",
//     title: "Beta Features",
//     id: "BETA",
//   },
//   {
//     element: "button",
//     type: "subList",
//     id: "ticket",
//     title: "Ticket",
//     icon: "ticket",
//     attributes: ticket,
//     params: {
//       api: `ticket`,
//       parentReference: "event",
//       icon: "ticket",
//       itemTitle: { name: "title", type: "text", collection: "" },
//       preFilter: { type: "Ticket" },
//       shortName: "Ticket",
//       description: "Create and manage different ticket types with customizable pricing and availability",
//       submitButtonText: "Create",
//       addPrivilege: true,
//       dotMenu: true,
//       delPrivilege: true,
//       updatePrivilege: true,
//       customClass: "medium",
//       formMode: `single`,
//       popupMode: "full-page",
//       popupMenu: "vertical-menu",
//       viewMode: "table",
//       formTabTheme: "tab",
//       showEditInDotMenu: false,
//       actions: [
//         {
//           element: "button",
//           type: "callback",
//           callback: (item, data) => {
//             setOpenItemData({ item, data });
//             setOpenTicketForm(true);
//           },
//           icon: "form-builder",
//           title: "Form Builder",
//           params: {
//             itemTitle: { name: "title", type: "text", collection: "" },
//             shortName: "Form Builder",
//             addPrivilege: true,
//             delPrivilege: true,
//             updatePrivilege: true,
//             customClass: "full-page",
//           },
//           actionType: "button",
//         },
//         {
//           element: "button",
//           type: "callback",
//           callback: (item, data) => {
//             setOpenItemData({ item, data });
//             setOpenTicketResponse(true);
//           },
//           icon: "ticket",
//           title: "Responses",
//           params: {
//             itemTitle: { name: "title", type: "text", collection: "" },
//             shortName: "Responses",
//             addPrivilege: false,
//             delPrivilege: false,
//             updatePrivilege: false,
//             customClass: "full-page",
//           },
//           actionType: "button",
//         },
//         {
//           element: "button",
//           type: "callback",
//           callback: (item, data) => {
//             let patchedData = { ...data };
//             if (item && (item.ticket?._id || item.ticket)) {
//               patchedData._id = item.ticket._id || item.ticket;
//             } else if (item && Array.isArray(item.tickets) && item.tickets.length > 0) {
//               patchedData._id = item.tickets[0]._id || item.tickets[0].id || item.tickets[0];
//             }
//             // Ensure event is present
//             if (!patchedData.event && item.event) {
//               patchedData.event = item.event;
//             }
//             setOpenItemData({ item, data: patchedData });
//             setOpenBadgeSetup(true);
//           },
//           icon: "badge",
//           title: "Badge Builder",
//           params: {
//             itemTitle: { name: "title", type: "text", collection: "" },
//             shortName: "Badge Builder",
//             addPrivilege: true,
//             delPrivilege: true,
//             updatePrivilege: true,
//             customClass: "full-page",
//           },
//           actionType: "button",
//         },
//         {
//           element: "button",
//           type: "callback",
//           callback: (item, data) => {
//             console.log("[Event Page] Copy Embed button clicked for ticket item:", item);

//             // Generate embed code with event domain and ticket slug
//             const generateEmbedCode = (ticketData) => {
//               console.log("ticketData", ticketData);
//               console.log("[Event Page] Generating embed code for ticket:", ticketData);
//               const domain = ticketData?.domain || "m1destinations.eventhex.ai";
//               const slug = ticketData?.slug || "early-bird-ticket";
//               const embedUrl = `https://${ticketData.event._id}.eventhex.ai/embed/${ticketData.slug}`;

//               return `<div onclick="event.stopPropagation()">
// <iframe
// src="${embedUrl}"
// style="
// position: fixed;
// top: 0;
// left: 50%;
// transform: translateX(-50%);
// width: 80%;
// height: 100%;
// border: none;
// margin: 0;
// padding: 0;
// overflow: hidden;
// z-index: 999999;
// "
// allowfullscreen>
// </iframe>
// </div>`;
//             };

//             // Copy embed code to clipboard
//             const copyEmbedToClipboard = async (embedCode) => {
//               try {
//                 console.log("[Event Page] Copying ticket embed code to clipboard:", embedCode);

//                 if (navigator.clipboard && navigator.clipboard.writeText) {
//                   await navigator.clipboard.writeText(embedCode);
//                   console.log("[Event Page] Ticket embed code copied successfully using navigator.clipboard");

//                   // Show success message
//                   toast.success("Ticket embed code copied to clipboard!");

//                   // Also use setMessage if available for additional feedback
//                   if (props?.setMessage) {
//                     props.setMessage({
//                       type: 1,
//                       content: "Ticket embed code copied to clipboard!",
//                       icon: "success",
//                       title: "Success",
//                     });
//                   }
//                 } else {
//                   // Fallback for older browsers
//                   const textArea = document.createElement("textarea");
//                   textArea.value = embedCode;
//                   textArea.style.position = "fixed";
//                   textArea.style.left = "-999999px";
//                   textArea.style.top = "-999999px";
//                   document.body.appendChild(textArea);
//                   textArea.focus();
//                   textArea.select();

//                   try {
//                     document.execCommand("copy");
//                     textArea.remove();
//                     console.log("[Event Page] Ticket embed code copied successfully using fallback method");

//                     toast.success("Ticket embed code copied to clipboard!");

//                     if (props?.setMessage) {
//                       props.setMessage({
//                         type: 1,
//                         content: "Ticket embed code copied to clipboard!",
//                         icon: "success",
//                         title: "Success",
//                       });
//                     }
//                   } catch (err) {
//                     textArea.remove();
//                     console.error("[Event Page] Failed to copy ticket embed code using fallback method:", err);
//                     throw err;
//                   }
//                 }
//               } catch (error) {
//                 console.error("[Event Page] Failed to copy ticket embed code to clipboard:", error);
//                 toast.error("Failed to copy ticket embed code to clipboard");

//                 if (props?.setMessage) {
//                   props.setMessage({
//                     type: 1,
//                     content: "Failed to copy ticket embed code to clipboard",
//                     icon: "error",
//                     title: "Error",
//                   });
//                 }
//               }
//             };

//             // Execute the copy operation
//             const embedCode = generateEmbedCode(data);
//             copyEmbedToClipboard(embedCode);
//           },
//           icon: "embed",
//           title: "Copy Embed",
//           params: {
//             itemTitle: { name: "title", type: "text", collection: "" },
//             shortName: "Copy Embed",
//             addPrivilege: true,
//             delPrivilege: true,
//             updatePrivilege: true,
//             customClass: "full-page",
//             showInDotMenu: true,
//           },
//           actionType: "button",
//         },
//       ],
//     },
//   },
