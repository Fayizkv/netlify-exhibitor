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

// const imageCDN = import.meta.env.VITE_CDN;

// const SponsorTab = (props) => {
//   const [sponsorsData, setSponsorsData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [eventId, setEventId] = useState(props.openData.data._id);
//   const [isPanelOpen, setIsPanelOpen] = useState(false);
//   const [editingSponsor, setEditingSponsor] = useState(null);
//   const [isAILoading, setIsAILoading] = useState(false);
//   const [linkedinUrl, setLinkedinUrl] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [sponsorCategories, setSponsorCategories] = useState([]);

//   // Filter and search state variables
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
//   const [activeFilters, setActiveFilters] = useState({ categories: [], companies: [] });
//   const [filteredSponsors, setFilteredSponsors] = useState([]);

//   // Delete modal states
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [sponsorToDelete, setSponsorToDelete] = useState(null);

//   const [formData, setFormData] = useState({
//     title: "",
//     userType: "sponsor",
//     sponsorCategory: "",
//     authenticationId: "",
//     emailId: "",
//     website: "",
//     description: "",
//     logo: null,
//     phoneCode: "+91",
//     social: {
//       linkedin: "",
//       twitter: "",
//       facebook: "",
//       instagram: "",
//     },
//   });

//   const sponsorsGridRef = useRef(null);
//   const fileInputRef = useRef(null);

//   // Transform API response to match UI expectations
//   const transformSponsorData = (apiSponsors) => {
//     return apiSponsors
//       .map((sponsor, index) => ({
//         id: sponsor._id,
//         name: sponsor.title,
//         category: sponsor.sponsorCategory?.sponsorCategory || "General",
//         userType: sponsor.userType || "sponsor",
//         website: sponsor.website || "",
//         email: sponsor.emailId || "",
//         description: sponsor.description || "",
//         order: sponsor.order || index,
//         img:
//           sponsor.logo && sponsor.logo !== "false"
//             ? `${imageCDN}${sponsor.logo}`
//             : `https://avatar.vercel.sh/${sponsor.title}.svg?text=${sponsor.title
//                 .split(" ")
//                 .map((n) => n[0])
//                 .join("")}`,
//         social: {
//           linkedin: sponsor.formData?.companyProfile?.linkedin || "",
//           twitter: sponsor.formData?.companyProfile?.twitter || "",
//           facebook: sponsor.formData?.companyProfile?.facebook || "",
//           instagram: sponsor.formData?.companyProfile?.instagram || "",
//         },
//         rawData: sponsor,
//       }))
//       .sort((a, b) => a.order - b.order);
//   };

//   // Fetch sponsors from API
//   const fetchSponsors = async () => {
//     if (!eventId) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const response = await getData({ event: eventId }, "ticket-registration/sponsor");
//       console.log("Sponsors API response:", response);

//       if (response.data.success) {
//         const transformedSponsors = transformSponsorData(response.data.response);
//         setSponsorsData(transformedSponsors);
//       } else {
//         setError("Failed to fetch sponsors");
//       }
//     } catch (error) {
//       console.error("Error fetching sponsors:", error);
//       setError("Error fetching sponsors");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchSponsorCategories = async () => {
//     const response = await getData({ event: eventId }, "sponsor-category/select");
//     console.log("Sponsor categories:", response);
//     setSponsorCategories(response.data);
//   };

//   useEffect(() => {
//     fetchSponsorCategories();
//   }, [eventId]);

//   // Initialize component
//   useEffect(() => {
//     setEventId(props.openData.data._id);
//   }, [props.openData.data._id]);

//   useEffect(() => {
//     fetchSponsors();
//   }, [eventId]);

//   // Delete handlers
//   const showDeleteConfirmation = (sponsor) => {
//     setSponsorToDelete(sponsor);
//     setIsDeleteModalOpen(true);
//   };

//   const handleDeleteSponsor = async () => {
//     if (!sponsorToDelete) return;

//     try {
//       const response = await deleteData({ id: sponsorToDelete.id }, "ticket-registration/sponsor");
//       console.log("Sponsor deleted:", response);

//       if (response.data.success) {
//         // Refresh sponsors list
//         await fetchSponsors();
//         setIsDeleteModalOpen(false);
//         setSponsorToDelete(null);

//         if (props.setMessage) {
//           props.setMessage({
//             type: 1,
//             content: "Sponsor deleted successfully",
//             icon: "success",
//             title: "Success",
//           });
//         }
//       } else {
//         console.error("Delete response indicates failure:", response.data);
//         alert("Failed to delete sponsor");
//       }
//     } catch (error) {
//       console.error("Error deleting sponsor:", error);
//       alert("Error deleting sponsor");
//     }
//   };

//   // Panel handlers
//   const handleOpenPanel = (sponsor = null) => {
//     console.log("Opening panel for sponsor:", sponsor);
//     setEditingSponsor(sponsor);
//     if (sponsor) {
//       setFormData({
//         title: sponsor.name,
//         userType: sponsor.rawData.userType || "sponsor",
//         sponsorCategory: sponsor.rawData.sponsorCategory?._id || "",
//         authenticationId: sponsor.rawData.authenticationId || "",
//         emailId: sponsor.email,
//         website: sponsor.website,
//         description: sponsor.description,
//         logo: sponsor.rawData.logo,
//         phoneCode: sponsor.rawData.phoneCode || "+91",
//         social: sponsor.social || { linkedin: "", twitter: "", facebook: "", instagram: "" },
//       });
//     } else {
//       setFormData({
//         title: "",
//         userType: "sponsor",
//         sponsorCategory: "",
//         authenticationId: "",
//         emailId: "",
//         website: "",
//         description: "",
//         logo: null,
//         phoneCode: "+91",
//         social: {
//           linkedin: "",
//           twitter: "",
//           facebook: "",
//           instagram: "",
//         },
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
//     setEditingSponsor(null);

//     // Reset form data
//     setFormData({
//       title: "",
//       userType: "sponsor",
//       sponsorCategory: "",
//       authenticationId: "",
//       emailId: "",
//       website: "",
//       description: "",
//       logo: null,
//       phoneCode: "+91",
//       social: {
//         linkedin: "",
//         twitter: "",
//         facebook: "",
//         instagram: "",
//       },
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
//     console.log("Submitting sponsor form:", formData);

//     if (!formData.title.trim()) {
//       alert("Sponsor name is required");
//       return;
//     }

//     setSubmitting(true);

//     try {
//       const submitData = {
//         event: eventId,
//         title: formData.title,
//         userType: formData.userType,
//         sponsorCategory: formData.sponsorCategory,
//         authenticationId: formData.authenticationId,
//         emailId: formData.emailId,
//         website: formData.website,
//         description: formData.description,
//         logo: formData.logo,
//         phoneCode: formData.phoneCode,
//         formData: {
//           companyProfile: {
//             linkedin: formData.social.linkedin,
//             twitter: formData.social.twitter,
//             facebook: formData.social.facebook,
//             instagram: formData.social.instagram,
//           },
//         },
//       };

//       let response;
//       if (editingSponsor) {
//         // Update existing sponsor
//         console.log("Update data:", submitData);
//         response = await putData({ id: editingSponsor.id, ...submitData }, "ticket-registration/sponsor");
//         console.log("Sponsor updated:", response);
//       } else {
//         // Create new sponsor
//         console.log("Submit data:", submitData);
//         response = await postData(submitData, "ticket-registration/sponsor");
//         console.log("New sponsor created:", response);
//       }

//       if (response.data.success) {
//         // Refresh sponsors list
//         await fetchSponsors();
//         handleClosePanel();

//         // if (props.setMessage) {
//         //   props.setMessage(editingSponsor ? "Sponsor updated successfully" : "Sponsor added successfully");
//         // }
//       } else {
//         console.error("API response indicates failure:", response.data);
//         alert("Failed to save sponsor");
//       }
//     } catch (error) {
//       console.error("Error submitting sponsor:", error);
//       alert("Error submitting sponsor");
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
//       // Call the API to get sponsor profile data
//       const response = await getData({ profile: linkedinUrl }, "ticket-registration/sponsor/get-sponsor-profile");

//       console.log("AI API response:", response);

//       if (response.data.success && response.data.data) {
//         const profileData = response.data.data;

//         setFormData({
//           title: profileData.title || "",
//           userType: "sponsor",
//           sponsorCategory: "",
//           authenticationId: profileData.authenticationId || "",
//           emailId: profileData.emailId || "",
//           website: profileData.website || "",
//           description: profileData.description || "",
//           logo: null,
//           phoneCode: "+91",
//           social: {
//             linkedin: profileData.social?.linkedin || "",
//             twitter: profileData.social?.twitter || "",
//             facebook: profileData.social?.facebook || "",
//             instagram: profileData.social?.instagram || "",
//           },
//         });

//         console.log("AI form filling completed with data:", profileData);
//       } else {
//         console.error("AI API response indicates failure:", response.data);
//         alert("Failed to generate sponsor profile. Please try again.");
//       }
//     } catch (error) {
//       console.error("Error calling AI API:", error);
//       alert("Error generating sponsor profile. Please check your LinkedIn URL and try again.");
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
//     if (editingSponsor && editingSponsor.img) {
//       return editingSponsor.img;
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

//   const isFormValid = formData.title.trim() && formData.sponsorCategory.trim();

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
//               <button onClick={fetchSponsors} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
//                 Try Again
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <RowContainer className="data-layout">
//         <PageHeader line={false} dynamicClass="sub inner" title="Event Sponsors" description="Manage sponsors and partners for your event." />
//         <ButtonPanel className="custom">
//           <div className="flex items-center space-x-2 w-full md:w-auto">
//             <Search title={"Search"} placeholder="Search sponsors" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
//           </div>
//           <div className="flex items-center space-x-2 self-start md:self-center mr-0 ml-auto">
//             <AddButton onClick={() => handleOpenPanel()}>
//               <AddIcon></AddIcon>
//               <span>Add Sponsor</span>
//             </AddButton>
//           </div>
//         </ButtonPanel>

//         {sponsorsData.length === 0 ? (
//           <NoDataFound
//             shortName={"Sponsors"}
//             icon={"sponsor"}
//             addPrivilege={true}
//             addLabel={"Add Sponsor"}
//             isCreatingHandler={() => handleOpenPanel()}
//             className="white-list"
//             description={"Get started by creating your first sponsor."}
//           ></NoDataFound>
//         ) : (
//           <div ref={sponsorsGridRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-2">
//             {sponsorsData.map((sponsor) => (
//               <div key={sponsor.id} className="sponsor-card bg-white border border-gray-200 rounded-md shadow-sm flex flex-col" data-id={sponsor.id}>
//                 <div className="p-4 md:p-6 flex-grow">
//                   <div className="flex items-start">
//                     <img className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mr-3 md:mr-4 object-cover rounded-full flex-shrink-0" src={sponsor.img} alt={sponsor.name} />
//                     <div className="min-w-0 flex-1">
//                       <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate">{sponsor.name}</h3>
//                       <p className="text-xs md:text-sm font-medium text-blue-600 truncate">{sponsor.category}</p>
//                       <p className="text-xs md:text-sm text-gray-600 truncate capitalize">{sponsor.userType}</p>
//                     </div>
//                   </div>
//                   {sponsor.description && <p className="text-xs md:text-sm text-gray-600 mt-3 md:mt-4 border-t border-gray-100 pt-3 md:pt-4 line-clamp-3">{sponsor.description}</p>}
//                 </div>

//                 <div className="p-3 md:p-4 bg-gray-50 flex items-center justify-between border-t border-gray-200">
//                   <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">{generateSocialIcons(sponsor.social, sponsor.website)}</div>
//                   <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
//                     <button
//                       onClick={() => handleOpenPanel(sponsor)}
//                       className="bg-white text-gray-600 px-2 md:px-3 py-1 md:py-1.5 border border-gray-200 rounded-md text-xs md:text-sm hover:bg-gray-50"
//                     >
//                       Edit
//                     </button>
//                     <button onClick={() => showDeleteConfirmation(sponsor)} className="bg-red-500 text-white px-1.5 md:px-2 py-1 md:py-1.5 rounded-md text-xs hover:bg-red-600">
//                       <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth="2"
//                           d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//                         ></path>
//                       </svg>
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </RowContainer>

//       {/* Add/Edit Sponsor Side Panel */}
//       <div
//         className={`panel-container fixed inset-0 z-40 flex justify-end bg-black bg-opacity-50 transition-opacity duration-300 ${isPanelOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
//         onClick={handleClosePanel}
//       >
//         <div
//           className={`side-panel bg-white w-full sm:max-w-md h-full shadow-lg transform transition-transform duration-300 ${isPanelOpen ? "translate-x-0" : "translate-x-full"}`}
//           onClick={(e) => e.stopPropagation()}
//         >
//           <form onSubmit={handleSubmit} className="flex flex-col h-full">
//             <div className="flex items-center justify-between py-3 md:py-4 px-4 md:px-6 border-b border-gray-200">
//               <h1 className="text-sm md:text-[16px] font-[500] text-gray-900">{editingSponsor ? "Edit Sponsor" : "Add a Sponsor"}</h1>
//               <button type="button" onClick={handleClosePanel} className="p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100">
//                 <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
//                 </svg>
//               </button>
//             </div>

//             <div className="p-4 md:p-6 overflow-y-auto flex-grow">
//               {/* AI Section */}
//               <div className="bg-indigo-50 border-l-4 border-indigo-400 p-3 md:p-4 rounded-r-md mb-4 md:mb-6">
//                 <h3 className="text-sm md:text-base font-semibold text-gray-900">✨ Save time with AI</h3>
//                 <p className="text-xs md:text-sm text-gray-600 mt-1">Paste a company name, website address or LinkedIn profile URL to auto-fill.</p>
//                 <div className="flex flex-col sm:flex-row items-stretch sm:items-center mt-3 gap-2">
//                   <input
//                     type="url"
//                     value={linkedinUrl}
//                     onChange={(e) => setLinkedinUrl(e.target.value)}
//                     placeholder="OpenAI, openai.com, or https://linkedin.com/company/openai"
//                     className="flex-grow border border-gray-200 rounded-md px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
//                   />
//                   <button
//                     type="button"
//                     onClick={handleAIFill}
//                     disabled={isAILoading}
//                     className="bg-indigo-600 text-white px-3 py-2 rounded-md text-xs md:text-sm hover:bg-indigo-700 disabled:bg-gray-300"
//                   >
//                     <span>{isAILoading ? "" : "Generate"}</span>
//                     {isAILoading && (
//                       <svg className="w-4 h-4 md:w-5 md:h-5 ml-2 text-white animate-spin" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                     )}
//                   </button>
//                 </div>
//               </div>

//               {/* Form Fields */}
//               <div className="space-y-4 md:space-y-5">
//                 <div>
//                   <label className="block text-xs md:text-sm font-medium text-gray-600 mb-1">
//                     Sponsor Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     value={formData.title}
//                     onChange={(e) => handleFormChange("title", e.target.value)}
//                     className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Enter Sponsor Name"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs md:text-sm font-medium text-gray-600 mb-1">
//                     Type <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     value={formData.userType}
//                     onChange={(e) => handleFormChange("userType", e.target.value)}
//                     className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="sponsor">Sponsor</option>
//                     <option value="partner">Partner</option>
//                   </select>
//                 </div>

//                 <div>
//                   {sponsorCategories.length > 0 ? (
//                     <div className="w-full">
//                       <label htmlFor="sponsorCategory" className="block text-sm font-medium text-gray-700 mb-1">
//                         Sponsor Category <span className="text-red-500">*</span>
//                       </label>
//                       <select
//                         id="sponsorCategory"
//                         required
//                         value={formData.sponsorCategory}
//                         onChange={(e) => handleFormChange("sponsorCategory", e.target.value)}
//                         className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-700 text-sm p-2"
//                       >
//                         <option value="">Select Category</option>
//                         {sponsorCategories.map((category) => (
//                           <option key={category.id} value={category.id}>
//                             {category.value}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   ) : (
//                     <div className="text-gray-500">No categories found</div>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-600 mb-1">Contact Number</label>
//                   <input
//                     type="tel"
//                     value={formData.authenticationId}
//                     onChange={(e) => handleFormChange("authenticationId", e.target.value)}
//                     className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Enter Contact Number"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
//                   <input
//                     type="email"
//                     value={formData.emailId}
//                     onChange={(e) => handleFormChange("emailId", e.target.value)}
//                     className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Enter Email"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-600 mb-1">Website</label>
//                   <input
//                     type="url"
//                     value={formData.website}
//                     onChange={(e) => handleFormChange("website", e.target.value)}
//                     className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="https://company.com"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
//                   <textarea
//                     rows="3"
//                     value={formData.description}
//                     onChange={(e) => handleFormChange("description", e.target.value)}
//                     className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     placeholder="Enter sponsor description and relevant information..."
//                   />
//                 </div>

//                 {/* Social Media Fields */}
//                 <div className="border-t border-gray-200 pt-4">
//                   <h3 className="text-base font-semibold text-gray-900 mb-3">Social Media Links</h3>

//                   <div className="space-y-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-600 mb-1">LinkedIn URL</label>
//                       <input
//                         type="url"
//                         value={formData.social?.linkedin || ""}
//                         onChange={(e) => handleFormChange("social.linkedin", e.target.value)}
//                         className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="https://linkedin.com/company/..."
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-600 mb-1">Twitter URL</label>
//                       <input
//                         type="url"
//                         value={formData.social?.twitter || ""}
//                         onChange={(e) => handleFormChange("social.twitter", e.target.value)}
//                         className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="https://twitter.com/..."
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-600 mb-1">Facebook URL</label>
//                       <input
//                         type="url"
//                         value={formData.social?.facebook || ""}
//                         onChange={(e) => handleFormChange("social.facebook", e.target.value)}
//                         className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="https://facebook.com/..."
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-600 mb-1">Instagram URL</label>
//                       <input
//                         type="url"
//                         value={formData.social?.instagram || ""}
//                         onChange={(e) => handleFormChange("social.instagram", e.target.value)}
//                         className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         placeholder="https://instagram.com/..."
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Logo Upload */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-600 mb-1">Sponsor Logo</label>
//                   <p className="text-xs text-gray-500 mb-3">Upload a sponsor logo (JPEG, PNG, GIF, WebP - Max 5MB)</p>

//                   {getImagePreview() ? (
//                     <div className="space-y-3">
//                       <div className="relative inline-block">
//                         <img src={getImagePreview()} alt="Logo preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
//                         <button
//                           type="button"
//                           onClick={handleRemoveImage}
//                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
//                         >
//                           ×
//                         </button>
//                       </div>
//                       <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white text-gray-600 px-3 py-2 border border-gray-200 rounded-md text-sm hover:bg-gray-50">
//                         Change Logo
//                       </button>
//                     </div>
//                   ) : (
//                     <div
//                       onClick={() => fileInputRef.current?.click()}
//                       className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
//                     >
//                       <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
//                         <path
//                           d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
//                           strokeWidth="2"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                         />
//                       </svg>
//                       <div className="mt-4">
//                         <p className="text-sm text-gray-600">
//                           <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag and drop
//                         </p>
//                         <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
//                       </div>
//                     </div>
//                   )}

//                   <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
//                 </div>
//               </div>
//             </div>

//             <div className="flex flex-col sm:flex-row justify-end p-3 md:p-4 border-t bg-gray-50 gap-2 sm:gap-0">
//               <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 order-1 sm:order-2">
//                 <button type="button" onClick={handleClosePanel} className="bg-white text-gray-600 px-4 py-2 border border-gray-200 rounded-md text-xs md:text-sm hover:bg-gray-50 sm:mr-2">
//                   Cancel
//                 </button>
//                 <button type="submit" disabled={!isFormValid || submitting} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-xs md:text-sm hover:bg-indigo-700 disabled:bg-gray-300">
//                   {submitting ? "Saving..." : editingSponsor ? "Save Changes" : "Create"}
//                 </button>
//               </div>
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* Delete Confirmation Modal */}
//       <div
//         className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${isDeleteModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
//         onClick={() => setIsDeleteModalOpen(false)}
//       >
//         <div
//           className={`bg-white rounded-lg shadow-xl w-full max-w-md p-4 md:p-6 transform transition-transform duration-200 ${isDeleteModalOpen ? "scale-100" : "scale-95"}`}
//           onClick={(e) => e.stopPropagation()}
//         >
//           <div className="flex items-center mb-3 md:mb-4">
//             <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
//               <svg className="w-5 h-5 md:w-6 md:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
//                 ></path>
//               </svg>
//             </div>
//           </div>
//           <div className="text-center">
//             <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Delete Sponsor</h3>
//             <p className="text-xs md:text-sm text-gray-600 mb-4 md:mb-6">
//               Are you sure you want to delete <span className="font-medium">{sponsorToDelete?.name}</span>? This action cannot be undone.
//             </p>
//           </div>
//           <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
//             <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="bg-white text-gray-600 px-4 py-2 border border-gray-200 rounded-md text-xs md:text-sm hover:bg-gray-50">
//               Cancel
//             </button>
//             <button type="button" onClick={handleDeleteSponsor} className="bg-red-500 text-white px-4 py-2 rounded-md text-xs md:text-sm hover:bg-red-600">
//               Delete Sponsor
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SponsorTab;
