// import React, { useState, useEffect, useRef } from "react";
// import { getData, postData, putData, deleteData } from "../../../../backend/api";
// import { Button } from "../../../../components/core/elements";
// import { ListTableSkeleton } from "../../../../components/core/loader/shimmer";
// import { AddIcon, GetIcon } from "../../../../icons";
// import { PageHeader, SubPageHeader } from "../../../core/input/heading";
// import { AddButton, ButtonPanel, Filter } from "../../../core/list/styles";
// import Search from "../../../core/search";
// import NoDataFound from "../../../core/list/nodata";
// import { RowContainer } from "../../../styles/containers/styles";
// import { exhibitorAttributes } from "../event/attributes/exhibitor";
// import CompanyProfile from "../companyProfile/companyProfile";
// import TeamManagement from "../teamManagement/index";
// import ProductCatalog from "../productCatalog/index";
// import PopupView from "../../../core/popupview";

// const imageCDN = import.meta.env.VITE_CDN;

// const ExhibitorTab = (props) => {
//   const [exhibitorsData, setExhibitorsData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [eventId, setEventId] = useState(props.openData.data._id);
//   const [isPanelOpen, setIsPanelOpen] = useState(false);
//   const [editingExhibitor, setEditingExhibitor] = useState(null);
//   const [isAILoading, setIsAILoading] = useState(false);
//   const [linkedinUrl, setLinkedinUrl] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [sortableInstance, setSortableInstance] = useState(null);
//   const [orderChanged, setOrderChanged] = useState(false);
//   const [savingOrder, setSavingOrder] = useState(false);
//   const [fullScreen, setFullScreen] = useState(false);
//   const [enableFullScreen] = useState(false);
//   const [exhibitorCategories, setExhibitorCategories] = useState([]);

//   // Filter and search state variables
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
//   const [activeFilters, setActiveFilters] = useState({ categories: [], companies: [] });
//   const [filteredExhibitors, setFilteredExhibitors] = useState([]);

//   // Action panel states
//   const [openCompanyProfile, setOpenCompanyProfile] = useState(false);
//   const [openTeamManagement, setOpenTeamManagement] = useState(false);
//   const [openProductCatalog, setOpenProductCatalog] = useState(false);
//   const [openItemData, setOpenItemData] = useState(null);

//   // Delete modal states
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [exhibitorToDelete, setExhibitorToDelete] = useState(null);

//   const [formData, setFormData] = useState({
//     firstName: "",
//     exhibitorCategory: "",
//     boothNumber: "",
//     website: "",
//     logo: null,
//     authenticationId: "",
//     emailId: "",
//     bio: "",
//     social: {
//       linkedin: "",
//       twitter: "",
//       facebook: "",
//       instagram: "",
//     },
//   });

//   const exhibitorsGridRef = useRef(null);
//   const sortableRef = useRef(null);
//   const fileInputRef = useRef(null);

//   // Transform API response to match UI expectations
//   const transformExhibitorData = (apiExhibitors) => {
//     return apiExhibitors
//       .map((exhibitor, index) => ({
//         id: exhibitor._id,
//         name: exhibitor.firstName,
//         category: exhibitor.exhibitorCategory?.categoryName || "General",
//         boothNumber: exhibitor.boothNumber || "",
//         website: exhibitor.website || "",
//         email: exhibitor.emailId || "",
//         description: exhibitor.bio || "",
//         order: exhibitor.order || index,
//         img:
//           exhibitor.logo && exhibitor.logo !== "false"
//             ? `${imageCDN}${exhibitor.logo}`
//             : `https://avatar.vercel.sh/${exhibitor.firstName}.svg?text=${exhibitor.firstName
//                 .split(" ")
//                 .map((n) => n[0])
//                 .join("")}`,
//         social: {
//           linkedin: exhibitor.formData?.companyProfile?.linkedin || "",
//           twitter: exhibitor.formData?.companyProfile?.twitter || "",
//           facebook: exhibitor.formData?.companyProfile?.facebook || "",
//           instagram: exhibitor.formData?.companyProfile?.instagram || "",
//         },
//         rawData: exhibitor,
//       }))
//       .sort((a, b) => a.order - b.order);
//   };

//   // Fetch exhibitors from API
//   const fetchExhibitors = async () => {
//     if (!eventId) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const response = await getData({ event: eventId }, "ticket-registration/exhibitor");
//       console.log("Exhibitors API response:", response);

//       if (response.data.success) {
//         const transformedExhibitors = transformExhibitorData(response.data.response);
//         setExhibitorsData(transformedExhibitors);
//         setOrderChanged(false);
//       } else {
//         setError("Failed to fetch exhibitors");
//       }
//     } catch (error) {
//       console.error("Error fetching exhibitors:", error);
//       setError("Error fetching exhibitors");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchExhibitorCategories = async () => {
//     const response = await getData({ event: eventId }, "exhibitor-category/select");
//     console.log("Exhibitor categories:", response);
//     setExhibitorCategories(response.data);
//   };
//   useEffect(() => {
//     fetchExhibitorCategories();
//   }, [eventId]);

//   // Initialize component
//   useEffect(() => {
//     setEventId(props.openData.data._id);
//   }, [props.openData.data._id]);

//   useEffect(() => {
//     fetchExhibitors();
//   }, [eventId]);

//   // Handle action buttons
//   const handleActionClick = (action, exhibitor) => {
//     setOpenItemData({ data: exhibitor.rawData });

//     switch (action) {
//       case "details":
//         setOpenCompanyProfile(true);
//         break;
//       case "team":
//         setOpenTeamManagement(true);
//         break;
//       case "catalog":
//         setOpenProductCatalog(true);
//         break;
//       default:
//         break;
//     }
//   };

//   // Delete handlers
//   const showDeleteConfirmation = (exhibitor) => {
//     setExhibitorToDelete(exhibitor);
//     setIsDeleteModalOpen(true);
//   };

//   const handleDeleteExhibitor = async () => {
//     if (!exhibitorToDelete) return;

//     try {
//       const response = await deleteData({ id: exhibitorToDelete.id }, "ticket-registration/exhibitor");
//       console.log("Exhibitor deleted:", response);

//       if (response.data.success) {
//         // Refresh exhibitors list
//         await fetchExhibitors();
//         setIsDeleteModalOpen(false);
//         setExhibitorToDelete(null);

//         if (props.setMessage) {
//           props.setMessage({
//             type: 1,
//             content: "Exhibitor deleted successfully",
//             icon: "success",
//             title: "Success",
//           });
//         }
//       } else {
//         console.error("Delete response indicates failure:", response.data);
//         alert("Failed to delete exhibitor");
//       }
//     } catch (error) {
//       console.error("Error deleting exhibitor:", error);
//       alert("Error deleting exhibitor");
//     }
//   };

//   // Panel handlers
//   const handleOpenPanel = (exhibitor = null) => {
//     console.log("Opening panel for exhibitor:", exhibitor);
//     setEditingExhibitor(exhibitor);
//     if (exhibitor) {
//       setFormData({
//         firstName: exhibitor.name,
//         exhibitorCategory: exhibitor.rawData.exhibitorCategory?._id || "",
//         boothNumber: exhibitor.boothNumber,
//         website: exhibitor.website,
//         authenticationId: exhibitor.rawData.authenticationId || "",
//         emailId: exhibitor.email,
//         bio: exhibitor.description,
//         logo: exhibitor.rawData.logo,
//         social: exhibitor.social || { linkedin: "", twitter: "", facebook: "", instagram: "" },
//       });
//     } else {
//       setFormData({
//         firstName: "",
//         exhibitorCategory: "",
//         boothNumber: "",
//         website: "",
//         authenticationId: "",
//         emailId: "",
//         bio: "",
//         logo: null,
//         social: { linkedin: "", twitter: "", facebook: "", instagram: "" },
//       });
//     }
//     setIsPanelOpen(true);
//   };

//   const handleClosePanel = () => {
//     console.log("Closing panel");

//     // Clean up any blob URLs to prevent memory leaks
//     if (formData.logo instanceof File) {
//       URL.revokeObjectURL(URL.createObjectURL(formData.logo));
//     }

//     setIsPanelOpen(false);
//     setEditingExhibitor(null);

//     // Reset form data
//     setFormData({
//       firstName: "",
//       exhibitorCategory: "",
//       boothNumber: "",
//       website: "",
//       authenticationId: "",
//       emailId: "",
//       bio: "",
//       logo: null,
//       social: { linkedin: "", twitter: "", facebook: "", instagram: "" },
//     });

//     // Clear file input
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }

//     // Clear LinkedIn URL
//     setLinkedinUrl("");
//   };

//   const handleFormChange = (field, value) => {
//     console.log("Form field changed:", field, value);
//     if (field.startsWith("social.")) {
//       const socialField = field.replace("social.", "");
//       setFormData((prev) => ({
//         ...prev,
//         social: {
//           ...prev.social,
//           [socialField]: value,
//         },
//       }));
//     } else if (field === "logo") {
//       setFormData((prev) => ({
//         ...prev,
//         logo: value,
//       }));
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         [field]: value,
//       }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     console.log("Submitting exhibitor form:", formData);

//     if (!formData.firstName.trim()) {
//       alert("Company name is required");
//       return;
//     }

//     setSubmitting(true);

//     try {
//       const submitData = {
//         event: eventId,
//         firstName: formData.firstName,
//         exhibitorCategory: formData.exhibitorCategory,
//         boothNumber: formData.boothNumber,
//         website: formData.website,
//         authenticationId: formData.authenticationId,
//         emailId: formData.emailId,
//         bio: formData.bio,
//         logo: formData.logo,
//         formData: {
//           companyProfile: {
//             linkedin: formData.social.linkedin,
//             twitter: formData.social.twitter,
//             facebook: formData.social.facebook,
//             instagram: formData.social.instagram,
//           },
//         },
//       };

//       // Add order for new exhibitors - calculate next available order number
//       //   if (!editingExhibitor) {
//       //     const maxOrder = exhibitorsData.length > 0 ? Math.max(...exhibitorsData.map((e) => e.order || 0)) : -1;
//       //     submitData.order = maxOrder + 1;
//       //   }

//       let response;
//       if (editingExhibitor) {
//         // Update existing exhibitor
//         console.log("Update data:", submitData);
//         response = await putData({ id: editingExhibitor.id, ...submitData }, "ticket-registration/exhibitor");
//         console.log("Exhibitor updated:", response);
//       } else {
//         // Create new exhibitor
//         console.log("Submit data:", submitData);
//         response = await postData(submitData, "ticket-registration/exhibitor");
//         console.log("New exhibitor created:", response);
//       }

//       if (response.data.success) {
//         // Refresh exhibitors list
//         await fetchExhibitors();
//         handleClosePanel();

//         // if (props.setMessage) {
//         //   props.setMessage(editingExhibitor ? "Exhibitor updated successfully" : "Exhibitor added successfully");
//         // }
//       } else {
//         console.error("API response indicates failure:", response.data);
//         alert("Failed to save exhibitor");
//       }
//     } catch (error) {
//       console.error("Error submitting exhibitor:", error);
//       alert("Error submitting exhibitor");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleAIFill = async () => {
//     if (!linkedinUrl) {
//       alert("Please enter a LinkedIn URL.");
//       return;
//     }

//     console.log("AI filling form with LinkedIn URL:", linkedinUrl);
//     setIsAILoading(true);

//     try {
//       // Call the API to get exhibitor profile data
//       const response = await getData({ profile: linkedinUrl }, "ticket-registration/exhibitor/get-exhibitor-profile");

//       console.log("AI API response:", response);

//       if (response.data.success && response.data.data) {
//         const profileData = response.data.data;

//         setFormData({
//           firstName: profileData.firstName || "",
//           exhibitorCategory: "",
//           boothNumber: "",
//           website: profileData.website || "",
//           authenticationId: profileData.authenticationId || "",
//           emailId: profileData.emailId || "",
//           bio: profileData.bio || "",
//           logo: null,
//           social: {
//             linkedin: profileData.social?.linkedin || linkedinUrl,
//             twitter: profileData.social?.twitter || "",
//             facebook: profileData.social?.facebook || "",
//             instagram: profileData.social?.instagram || "",
//           },
//         });

//         console.log("AI form filling completed with data:", profileData);
//       } else {
//         console.error("AI API response indicates failure:", response.data);
//         alert("Failed to generate exhibitor profile. Please try again.");
//       }
//     } catch (error) {
//       console.error("Error calling AI API:", error);
//       alert("Error generating exhibitor profile. Please check your LinkedIn URL and try again.");
//     } finally {
//       setIsAILoading(false);
//     }
//   };

//   const handleImageUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       // Validate file type
//       const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
//       if (!allowedTypes.includes(file.type)) {
//         alert("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
//         return;
//       }

//       // Validate file size (5MB limit)
//       const maxSize = 5 * 1024 * 1024; // 5MB
//       if (file.size > maxSize) {
//         alert("File size must be less than 5MB");
//         return;
//       }

//       console.log("Image selected:", file.name, file.type, `${(file.size / 1024 / 1024).toFixed(2)}MB`);
//       handleFormChange("logo", file);
//     }
//   };

//   const handleRemoveImage = () => {
//     handleFormChange("logo", null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   const getImagePreview = () => {
//     if (formData.logo instanceof File) {
//       return URL.createObjectURL(formData.logo);
//     }
//     if (editingExhibitor && editingExhibitor.img) {
//       return editingExhibitor.img;
//     }
//     return null;
//   };

//   const generateSocialIcons = (social, website) => {
//     const icons = [];

//     if (website) {
//       icons.push(
//         <a key="website" href={website} target="_blank" rel="noopener noreferrer" className="social-icon text-gray-400 hover:text-blue-600">
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
//           </svg>
//         </a>
//       );
//     }

//     if (social?.linkedin) {
//       icons.push(
//         <a key="linkedin" href={social.linkedin} target="_blank" rel="noopener noreferrer" className="social-icon text-gray-400 hover:text-blue-600">
//           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//             <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
//           </svg>
//         </a>
//       );
//     }

//     if (social?.twitter) {
//       icons.push(
//         <a key="twitter" href={social.twitter} target="_blank" rel="noopener noreferrer" className="social-icon text-gray-400 hover:text-blue-600">
//           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//             <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-.424.727-.666 1.561-.666 2.477 0 1.61.82 3.027 2.053 3.847-.764-.024-1.482-.232-2.11-.583v.062c0 2.256 1.605 4.14 3.737 4.568-.39.106-.803.163-1.227.163-.3 0-.593-.028-.877-.082.593 1.85 2.303 3.203 4.334 3.239-1.59 1.247-3.604 1.991-5.79 1.991-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.092 7.14 2.092 8.57 0 13.255-7.098 13.255-13.254 0-.202-.005-.403-.014-.602.91-.658 1.7-1.476 2.323-2.41z" />
//           </svg>
//         </a>
//       );
//     }

//     if (social?.facebook) {
//       icons.push(
//         <a key="facebook" href={social.facebook} target="_blank" rel="noopener noreferrer" className="social-icon text-gray-400 hover:text-blue-600">
//           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//             <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
//           </svg>
//         </a>
//       );
//     }

//     if (social?.instagram) {
//       icons.push(
//         <a key="instagram" href={social.instagram} target="_blank" rel="noopener noreferrer" className="social-icon text-gray-400 hover:text-blue-600">
//           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//             <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.896 3.708 13.745 3.708 12.448s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.281c-.49 0-.98-.49-.98-.98s.49-.98.98-.98.98.49.98.98-.49.98-.98.98zm-1.96 1.96c-1.297 0-2.448-.49-3.323-1.297-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297z" />
//           </svg>
//         </a>
//       );
//     }

//     return <div className="flex items-center space-x-3">{icons}</div>;
//   };

//   const isFormValid = formData.firstName.trim() && formData.exhibitorCategory.trim();

//   // Loading state
//   if (loading) {
//     return (
//       <div className="py-8">
//         <div className="max-w-7xl mx-auto px-4">
//           <div className="space-y-4">
//             <ListTableSkeleton />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="py-8">
//         <div className="max-w-7xl mx-auto px-4">
//           <div className="flex justify-center items-center min-h-64">
//             <div className="text-center">
//               <p className="text-red-600 mb-4">{error}</p>
//               <button onClick={fetchExhibitors} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
//                 Try Again
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <style>
//         {`
//           @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
          
//           :root {
//               --primary-blue: #4F46E5;
//               --primary-blue-hover: #4338CA;
//               --danger-red: #EF4444;
//               --danger-red-hover: #DC2626;
//               --gray-50: #F9FAFB;
//               --gray-100: #F3F4F6;
//               --gray-200: #E5E7EB;
//               --gray-400: #9CA3AF;
//               --gray-500: #6B7280;
//               --gray-600: #4B5563;
//               --gray-900: #111827;
//               --white: #FFFFFF;
//               --shadow-sm: 0px 2px 4px 0px rgba(27, 28, 29, 0.04);
//               --shadow-md: 0px 16px 32px -12px rgba(88, 92, 95, 0.10);
//               --radius-md: 6px;
//               --radius-full: 9999px;
//           }
          
//           body {
//               font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
//               background-color: var(--white);
//               color: var(--gray-900);
//           }
          
//           /* Drag-and-Drop Styles */
//           .exhibitor-card { 
//             cursor: grab; 
//             transition: all 0.2s ease;
//             position: relative;
//           }
//           .exhibitor-card:active { 
//             cursor: grabbing; 
//           }
//           .exhibitor-card:hover {
//             transform: translateY(-2px);
//             box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.1);
//           }
          
//           .sortable-ghost { 
//             opacity: 0.4 !important; 
//             background: var(--primary-blue) !important; 
//             border: 2px dashed var(--primary-blue-hover) !important;
//             transform: rotate(5deg) !important;
//           }
          
//           .sortable-chosen { 
//             box-shadow: var(--shadow-md) !important; 
//             transform: scale(1.05) !important; 
//             z-index: 1000 !important;
//           }
          
//           .sortable-drag {
//             opacity: 0.8 !important;
//             transform: rotate(5deg) !important;
//           }
          
//           .primary-button { background-color: var(--primary-blue); color: var(--white); padding: 10px 20px; border-radius: var(--radius-md); font-weight: 500; font-size: 14px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid transparent; transition: background-color 0.2s; }
//           .primary-button:hover { background-color: var(--primary-blue-hover); }
//           .primary-button:disabled { background-color: var(--gray-200); color: var(--gray-400); cursor: not-allowed; }

//           .secondary-button { background-color: var(--white); color: var(--gray-600); padding: 10px 20px; border-radius: var(--radius-md); font-weight: 500; font-size: 14px; border: 1px solid var(--gray-200); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: background-color 0.2s, border-color 0.2s; }
//           .secondary-button:hover { background-color: var(--gray-50); }

//           .danger-button { background-color: var(--danger-red); color: var(--white); padding: 8px 16px; border-radius: var(--radius-md); font-weight: 500; font-size: 12px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid transparent; transition: background-color 0.2s; }
//           .danger-button:hover { background-color: var(--danger-red-hover); }
          
//           .action-button { background-color: var(--gray-100); color: var(--gray-700); padding: 6px 12px; border-radius: var(--radius-md); font-weight: 500; font-size: 12px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; border: 1px solid var(--gray-200); transition: background-color 0.2s, border-color 0.2s; }
//           .action-button:hover { background-color: var(--gray-200); }
          
//           /* Social Icons */
//           .social-icon { transition: color 0.2s ease; }
//           .social-icon:hover { transform: scale(1.1); }
          
//           .card-actions { opacity: 0; transform: translateY(4px); transition: all 0.2s; }
//           .exhibitor-card:hover .card-actions { opacity: 1; transform: translateY(0); }
          
//           /* Drag indicator */
//           .exhibitor-card::before {
//             content: "⋮⋮";
//             position: absolute;
//             top: 10px;
//             right: 10px;
//             color: var(--gray-400);
//             font-size: 12px;
//             opacity: 0;
//             transition: opacity 0.2s;
//           }
          
//           .exhibitor-card:hover::before {
//             opacity: 1;
//           }
          
//           /* Responsive text utilities */
//           .line-clamp-3 {
//             display: -webkit-box;
//             -webkit-line-clamp: 3;
//             -webkit-box-orient: vertical;
//             overflow: hidden;
//           }

//           /* Focus styles for accessibility */
//           .primary-button:focus,
//           .secondary-button:focus,
//           .action-button:focus {
//             outline: 2px solid var(--primary-blue);
//             outline-offset: 2px;
//           }
          
//           /* Mobile responsive adjustments */
//           @media (max-width: 640px) {
//             .exhibitor-card {
//               transform: none !important;
//             }
            
//             .exhibitor-card:hover {
//               transform: none !important;
//             }
            
//             .sortable-ghost,
//             .sortable-chosen { 
//               transform: none !important;
//             }
            
//             .card-actions {
//               opacity: 1 !important;
//               transform: none !important;
//             }
//           }
//         `}
//       </style>

//       <div>
//         <RowContainer className="data-layout">
//           <PageHeader line={false} dynamicClass="sub inner" title="Event Exhibitors" description="Manage exhibitors for your event." />
//           <ButtonPanel className="custom">
//             <div className="flex items-center space-x-2 w-full md:w-auto">
//               <Search title={"Search"} placeholder="Search exhibitors" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
//             </div>
//             <div className="flex items-center space-x-2 self-start md:self-center mr-0 ml-auto">
//               <AddButton onClick={() => handleOpenPanel()}>
//                 <AddIcon></AddIcon>
//                 <span>Add Exhibitor</span>
//               </AddButton>
//             </div>
//           </ButtonPanel>

//           {exhibitorsData.length === 0 ? (
//             <NoDataFound
//               shortName={"Exhibitors"}
//               icon={"exhibitor"}
//               addPrivilege={true}
//               addLabel={"Add Exhibitor"}
//               isCreatingHandler={() => handleOpenPanel()}
//               className="white-list"
//               description={"Get started by creating your first exhibitor."}
//             ></NoDataFound>
//           ) : (
//             <div ref={exhibitorsGridRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-2">
//               {exhibitorsData.map((exhibitor) => (
//                 <div key={exhibitor.id} className="exhibitor-card bg-white border border-gray-200 rounded-md shadow-sm flex flex-col" data-id={exhibitor.id}>
//                   <div className="p-4 md:p-6 flex-grow">
//                     <div className="flex items-start">
//                       <img className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mr-3 md:mr-4 object-cover rounded-full flex-shrink-0" src={exhibitor.img} alt={exhibitor.name} />
//                       <div className="min-w-0 flex-1">
//                         <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate">{exhibitor.name}</h3>
//                         <p className="text-xs md:text-sm font-medium text-blue-600 truncate">{exhibitor.category}</p>
//                         <p className="text-xs md:text-sm text-gray-600 truncate">Booth #{exhibitor.boothNumber}</p>
//                       </div>
//                     </div>
//                     {exhibitor.description && <p className="text-xs md:text-sm text-gray-600 mt-3 md:mt-4 border-t border-gray-100 pt-3 md:pt-4 line-clamp-3">{exhibitor.description}</p>}
//                   </div>

//                   {/* Action Buttons */}
//                   <div className="p-3 md:p-4 bg-gray-50 border-t border-gray-200">
//                     <div className="flex flex-wrap gap-2 mb-3">
//                       <button onClick={() => handleActionClick("details", exhibitor)} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-xs hover:bg-gray-200 transition-colors">
//                         Details
//                       </button>
//                       <button onClick={() => handleActionClick("team", exhibitor)} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-xs hover:bg-gray-200 transition-colors">
//                         Team Management
//                       </button>
//                       <button onClick={() => handleActionClick("catalog", exhibitor)} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-xs hover:bg-gray-200 transition-colors">
//                         Product Catalog
//                       </button>
//                     </div>
//                   </div>

//                   <div className="p-3 md:p-4 bg-gray-50 flex items-center justify-between border-t border-gray-200">
//                     <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">{generateSocialIcons(exhibitor.social, exhibitor.website)}</div>
//                     <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
//                       <button
//                         onClick={() => handleOpenPanel(exhibitor)}
//                         className="bg-white text-gray-600 px-2 md:px-3 py-1 md:py-1.5 border border-gray-200 rounded-md text-xs md:text-sm hover:bg-gray-50"
//                       >
//                         Edit
//                       </button>
//                       <button onClick={() => showDeleteConfirmation(exhibitor)} className="bg-red-500 text-white px-1.5 md:px-2 py-1 md:py-1.5 rounded-md text-xs hover:bg-red-600">
//                         <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth="2"
//                             d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//                           ></path>
//                         </svg>
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </RowContainer>

//         {/* Add/Edit Exhibitor Side Panel */}
//         <div
//           className={`panel-container fixed inset-0 z-40 flex justify-end bg-black bg-opacity-50 transition-opacity duration-300 ${isPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
//           onClick={handleClosePanel}
//         >
//           <div
//             className={`side-panel bg-white w-full sm:max-w-md h-full shadow-lg transform transition-transform duration-300 ${isPanelOpen ? "translate-x-0" : "translate-x-full"}`}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <form onSubmit={handleSubmit} className="flex flex-col h-full">
//               <div className="flex items-center justify-between py-3 md:py-4 px-4 md:px-6 border-b border-gray-200">
//                 <h1 className="text-sm md:text-[16px] font-[500] text-gray-900">{editingExhibitor ? "Edit Exhibitor" : "Add an Exhibitor"}</h1>
//                 <button type="button" onClick={handleClosePanel} className="p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100">
//                   <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
//                   </svg>
//                 </button>
//               </div>

//               <div className="p-4 md:p-6 overflow-y-auto flex-grow">
//                 {/* AI Section */}
//                 <div className="bg-indigo-50 border-l-4 border-indigo-400 p-3 md:p-4 rounded-r-md mb-4 md:mb-6">
//                   <h3 className="text-sm md:text-base font-semibold text-gray-900">✨ Save time with AI</h3>
//                   <p className="text-xs md:text-sm text-gray-600 mt-1">Paste a company name, website address or LinkedIn profile URL to auto-fill.</p>
//                   <div className="flex flex-col sm:flex-row items-stretch sm:items-center mt-3 gap-2">
//                     <input
//                       type="url"
//                       value={linkedinUrl}
//                       onChange={(e) => setLinkedinUrl(e.target.value)}
//                       placeholder="OpenAI, openai.com, or https://linkedin.com/company/openai"
//                       className="flex-grow border border-gray-200 rounded-md px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
//                     />
//                     <button type="button" onClick={handleAIFill} disabled={isAILoading} className="primary-button flex-shrink-0 text-xs md:text-sm px-3 py-2">
//                       <span>{isAILoading ? "" : "Generate"}</span>
//                       {isAILoading && (
//                         <svg className="w-4 h-4 md:w-5 md:h-5 ml-2 text-white animate-spin" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                       )}
//                     </button>
//                   </div>
//                 </div>

//                 {/* Form Fields */}
//                 <div className="space-y-4 md:space-y-5">
//                   <div>
//                     <label className="block text-xs md:text-sm font-medium text-gray-600 mb-1">
//                       Company Name <span className="text-red-500">*</span>
//                     </label>
//                     <div className="form-input-container">
//                       <svg className="form-input-icon w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth="2"
//                           d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
//                         ></path>
//                       </svg>
//                       <input
//                         type="text"
//                         required
//                         value={formData.firstName}
//                         onChange={(e) => handleFormChange("firstName", e.target.value)}
//                         className="form-input text-xs md:text-sm"
//                         placeholder="Enter Company Name"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     {/* <label className="block text-sm font-medium text-gray-600 mb-1">
//                     Exhibitor Category <span className="text-red-500">*</span>
//                   </label> */}
//                     <div className="form-input-container">
//                       {/* <svg className="form-input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7.5 7.5 0 01-7.5 7.5h-1a7.5 7.5 0 01-7.5-7.5V7.5a7.5 7.5 0 0115 0v3.5z"></path>
//                     </svg> */}
//                       {exhibitorCategories.length > 0 ? (
//                         <div className="w-full">
//                           <label htmlFor="exhibitorCategory" className="block text-sm font-medium text-gray-700 mb-1">
//                             Exhibitor Category
//                           </label>
//                           <select
//                             id="exhibitorCategory"
//                             required
//                             value={formData.exhibitorCategory}
//                             onChange={(e) => handleFormChange("exhibitorCategory", e.target.value)}
//                             className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700 text-sm p-2"
//                           >
//                             <option value="">Select Category</option>
//                             {exhibitorCategories.map((category) => (
//                               <option key={category.id} value={category.id}>
//                                 {category.value}
//                               </option>
//                             ))}
//                           </select>
//                         </div>
//                       ) : (
//                         <div className="text-gray-500">No categories found</div>
//                       )}
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-600 mb-1">Booth Number</label>
//                     <div className="form-input-container">
//                       <svg className="form-input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
//                       </svg>
//                       <input type="text" value={formData.boothNumber} onChange={(e) => handleFormChange("boothNumber", e.target.value)} placeholder="e.g., A-101" className="form-input" />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-600 mb-1">Website</label>
//                     <div className="form-input-container">
//                       <svg className="form-input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
//                       </svg>
//                       <input type="url" value={formData.website} onChange={(e) => handleFormChange("website", e.target.value)} className="form-input" placeholder="https://company.com" />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
//                     <div className="form-input-container">
//                       <svg className="form-input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth="2"
//                           d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
//                         ></path>
//                       </svg>
//                       <input type="email" value={formData.emailId} onChange={(e) => handleFormChange("emailId", e.target.value)} className="form-input" placeholder="Enter Email" />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-600 mb-1">Mobile Number</label>
//                     <div className="form-input-container">
//                       <svg className="form-input-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth="2"
//                           d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
//                         ></path>
//                       </svg>
//                       <input
//                         type="tel"
//                         value={formData.authenticationId}
//                         onChange={(e) => handleFormChange("authenticationId", e.target.value)}
//                         className="form-input"
//                         placeholder="Enter Mobile Number"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-600 mb-1">Company Description</label>
//                     <textarea
//                       rows="3"
//                       value={formData.bio}
//                       onChange={(e) => handleFormChange("bio", e.target.value)}
//                       className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       placeholder="Enter company description and relevant information..."
//                     />
//                   </div>

//                   {/* Logo Upload */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-600 mb-1">Company Logo</label>
//                     <p className="text-xs text-gray-500 mb-3">Upload a company logo (JPEG, PNG, GIF, WebP - Max 5MB)</p>

//                     {getImagePreview() ? (
//                       <div className="space-y-3">
//                         <div className="relative inline-block">
//                           <img src={getImagePreview()} alt="Logo preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
//                           <button
//                             type="button"
//                             onClick={handleRemoveImage}
//                             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
//                           >
//                             ×
//                           </button>
//                         </div>
//                         <button type="button" onClick={() => fileInputRef.current?.click()} className="secondary-button text-sm">
//                           Change Logo
//                         </button>
//                       </div>
//                     ) : (
//                       <div
//                         onClick={() => fileInputRef.current?.click()}
//                         className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
//                       >
//                         <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
//                           <path
//                             d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
//                             strokeWidth="2"
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                           />
//                         </svg>
//                         <div className="mt-4">
//                           <p className="text-sm text-gray-600">
//                             <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag and drop
//                           </p>
//                           <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
//                         </div>
//                       </div>
//                     )}

//                     <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
//                   </div>

//                   {/* Social Media Fields */}
//                   <div className="border-t border-gray-200 pt-4">
//                     <h3 className="text-base font-semibold text-gray-900 mb-3">Social Media Links</h3>

//                     <div className="space-y-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-600 mb-1">LinkedIn URL</label>
//                         <input
//                           type="url"
//                           value={formData.social.linkedin}
//                           onChange={(e) => handleFormChange("social.linkedin", e.target.value)}
//                           className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                           placeholder="https://linkedin.com/company/..."
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-600 mb-1">Twitter URL</label>
//                         <input
//                           type="url"
//                           value={formData.social.twitter}
//                           onChange={(e) => handleFormChange("social.twitter", e.target.value)}
//                           className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                           placeholder="https://twitter.com/..."
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-600 mb-1">Facebook URL</label>
//                         <input
//                           type="url"
//                           value={formData.social.facebook}
//                           onChange={(e) => handleFormChange("social.facebook", e.target.value)}
//                           className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                           placeholder="https://facebook.com/..."
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-600 mb-1">Instagram URL</label>
//                         <input
//                           type="url"
//                           value={formData.social.instagram}
//                           onChange={(e) => handleFormChange("social.instagram", e.target.value)}
//                           className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                           placeholder="https://instagram.com/..."
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex flex-col sm:flex-row justify-end p-3 md:p-4 border-t bg-gray-50 gap-2 sm:gap-0">
//                 <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 order-1 sm:order-2">
//                   <button type="button" onClick={handleClosePanel} className="secondary-button sm:mr-2 text-xs md:text-sm">
//                     Cancel
//                   </button>
//                   <button type="submit" disabled={!isFormValid || submitting} className="primary-button text-xs md:text-sm">
//                     {submitting ? "Saving..." : editingExhibitor ? "Save Changes" : "Create"}
//                   </button>
//                 </div>
//               </div>
//             </form>
//           </div>
//         </div>

//         {/* Action Panels using PopupView */}
//         {openCompanyProfile && openItemData && (
//           <PopupView
//             popupData={<CompanyProfile exhibitorData={openItemData.data} />}
//             themeColors={props.themeColors}
//             closeModal={() => setOpenCompanyProfile(false)}
//             itemTitle={{ name: "companyName", type: "text", collection: "" }}
//             openData={{ data: { _id: "company_profile", title: openItemData?.data?.firstName || "Company Profile" } }}
//             customClass={"full-page"}
//           />
//         )}

//         {openTeamManagement && openItemData && (
//           <PopupView
//             popupData={<TeamManagement exhibitorData={openItemData.data} />}
//             themeColors={props.themeColors}
//             closeModal={() => setOpenTeamManagement(false)}
//             itemTitle={{ name: "companyName", type: "text", collection: "" }}
//             openData={{ data: { _id: "team_management", title: `${openItemData?.data?.firstName || "Company"} - Team Management` } }}
//             customClass={"full-page"}
//           />
//         )}

//         {openProductCatalog && openItemData && (
//           <PopupView
//             popupData={<ProductCatalog exhibitorData={openItemData.data} />}
//             themeColors={props.themeColors}
//             closeModal={() => setOpenProductCatalog(false)}
//             itemTitle={{ name: "companyName", type: "text", collection: "" }}
//             openData={{ data: { _id: "product_catalog", title: `${openItemData?.data?.firstName || "Company"} - Product Catalog` } }}
//             customClass={"full-page"}
//           />
//         )}

//         {/* Delete Confirmation Modal */}
//         <div
//           className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${isDeleteModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
//           onClick={() => setIsDeleteModalOpen(false)}
//         >
//           <div
//             className={`bg-white rounded-lg shadow-xl w-full max-w-md p-4 md:p-6 transform transition-transform duration-200 ${isDeleteModalOpen ? "scale-100" : "scale-95"}`}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-center mb-3 md:mb-4">
//               <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
//                 <svg className="w-5 h-5 md:w-6 md:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
//                   ></path>
//                 </svg>
//               </div>
//             </div>
//             <div className="text-center">
//               <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Delete Exhibitor</h3>
//               <p className="text-xs md:text-sm text-gray-600 mb-4 md:mb-6">
//                 Are you sure you want to delete <span className="font-medium">{exhibitorToDelete?.name}</span>? This action cannot be undone.
//               </p>
//             </div>
//             <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
//               <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="secondary-button text-xs md:text-sm">
//                 Cancel
//               </button>
//               <button type="button" onClick={handleDeleteExhibitor} className="danger-button text-xs md:text-sm">
//                 Delete Exhibitor
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ExhibitorTab;
