// import React, { useState, useEffect } from 'react';
// import {
//   Building,
//   Globe,
//   Camera,
//   File,
//   Upload,
//   Eye,
//   Save,
//   Key,
//   Linkedin,
//   Twitter,
//   Facebook,
//   Instagram,
//   X
// } from "lucide-react";

// import { getData, putData } from "../../../../backend/api";
// import axios from "axios";
// import { GetAccessToken } from "../../../../backend/authentication";

// export default function CompanyProfile({ exhibitorData }) {
//   console.log(exhibitorData);
//   const [activeTab, setActiveTab] = useState("basic");
//   const [isLoading, setIsLoading] = useState(false);

//   // Use exhibitor data from formData.companyProfile if provided, otherwise use default values
//   const [formData, setFormData] = useState({
//     companyName: exhibitorData?.firstName || "",
//     industry: exhibitorData?.formData?.companyProfile?.industry || "",
//     description: exhibitorData?.formData?.companyProfile?.description || "",
//     website: exhibitorData?.website || "",
//     boothLocation: exhibitorData?.boothLocation || "",
//     logo: exhibitorData?.logo || exhibitorData?.formData?.companyProfile?.logo || "",
//     banner: exhibitorData?.banner || exhibitorData?.formData?.companyProfile?.banner || "",
//     brochure: exhibitorData?.brochure || exhibitorData?.formData?.companyProfile?.brochure || "",
//     linkedin: exhibitorData?.formData?.companyProfile?.linkedin || "",
//     twitter: exhibitorData?.formData?.companyProfile?.twitter || "",
//     facebook: exhibitorData?.formData?.companyProfile?.facebook || "",
//     instagram: exhibitorData?.formData?.companyProfile?.instagram || "",
//   });

//   // File upload states
//   const [logoFile, setLogoFile] = useState(null);
//   const [bannerFile, setBannerFile] = useState(null);
//   const [brochureFile, setBrochureFile] = useState(null);

//   // Helper function to construct full URL for images
//   const getImageUrl = (path) => {
//     if (!path) return "";
//     if (path.startsWith('http')) return path;
//     if (path.startsWith('blob:')) return path;
//     // For relative paths, construct the full URL using CDN
//     const CDN_BASE_URL = import.meta.env.VITE_CDN || "https://event-manager.syd1.cdn.digitaloceanspaces.com/";
//     const cleanPath = path.replace(/^\/+/, "");
//     return `${CDN_BASE_URL}${cleanPath}`;
//   };

//   const [logoPreview, setLogoPreview] = useState(getImageUrl(exhibitorData?.logo || exhibitorData?.formData?.companyProfile?.logo || ""));
//   const [bannerPreview, setBannerPreview] = useState(getImageUrl(exhibitorData?.banner || exhibitorData?.formData?.companyProfile?.banner || ""));
//   const [brochurePreview, setBrochurePreview] = useState(exhibitorData?.brochure || exhibitorData?.formData?.companyProfile?.brochure || "");

//   // Update form data when exhibitorData changes
//   useEffect(() => {
//     if (exhibitorData) {
//       setFormData({
//         companyName: exhibitorData.firstName || "",
//         industry: exhibitorData.formData?.companyProfile?.industry || "",
//         description: exhibitorData.formData?.companyProfile?.description || "",
//         website: exhibitorData.website || "",
//         boothLocation: exhibitorData.boothLocation || "",
//         logo: exhibitorData.logo || exhibitorData.formData?.companyProfile?.logo || "",
//         banner: exhibitorData.banner || exhibitorData.formData?.companyProfile?.banner || "",
//         brochure: exhibitorData.brochure || exhibitorData.formData?.companyProfile?.brochure || "",
//         linkedin: exhibitorData.formData?.companyProfile?.linkedin || "",
//         twitter: exhibitorData.formData?.companyProfile?.twitter || "",
//         facebook: exhibitorData.formData?.companyProfile?.facebook || "",
//         instagram: exhibitorData.formData?.companyProfile?.instagram || "",
//       });
//       setLogoPreview(getImageUrl(exhibitorData.logo || exhibitorData.formData?.companyProfile?.logo || ""));
//       setBannerPreview(getImageUrl(exhibitorData.banner || exhibitorData.formData?.companyProfile?.banner || ""));
//       setBrochurePreview(exhibitorData.brochure || exhibitorData.formData?.companyProfile?.brochure || "");
//     }
//   }, [exhibitorData]);

//   // File handling functions
//   const handleFileChange = (file, type) => {
//     if (!file) return;

//     // Validate file size
//     const maxSize = type === 'brochure' ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB for PDF, 5MB for images
//     if (file.size > maxSize) {
//       alert(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
//       return;
//     }

//     // Validate file type
//     if (type === 'brochure') {
//       if (file.type !== 'application/pdf') {
//         alert('Please select a PDF file for the brochure');
//         return;
//       }
//     } else {
//       if (!file.type.startsWith('image/')) {
//         alert('Please select an image file');
//         return;
//       }
//     }

//     // Set file and preview
//     if (type === 'logo') {
//       setLogoFile(file);
//       setLogoPreview(URL.createObjectURL(file));
//     } else if (type === 'banner') {
//       setBannerFile(file);
//       setBannerPreview(URL.createObjectURL(file));
//     } else if (type === 'brochure') {
//       setBrochureFile(file);
//       setBrochurePreview(file.name);
//     }
//   };

//   // Cleanup function for object URLs
//   useEffect(() => {
//     return () => {
//       // Cleanup object URLs when component unmounts
//       if (logoPreview && logoPreview.startsWith('blob:')) {
//         URL.revokeObjectURL(logoPreview);
//       }
//       if (bannerPreview && bannerPreview.startsWith('blob:')) {
//         URL.revokeObjectURL(bannerPreview);
//       }
//     };
//   }, [logoPreview, bannerPreview]);

//   const removeFile = (type) => {
//     if (type === 'logo') {
//       setLogoFile(null);
//       setLogoPreview("");
//       setFormData({ ...formData, logo: "" });
//     } else if (type === 'banner') {
//       setBannerFile(null);
//       setBannerPreview("");
//       setFormData({ ...formData, banner: "" });
//     } else if (type === 'brochure') {
//       setBrochureFile(null);
//       setBrochurePreview("");
//       setFormData({ ...formData, brochure: "" });
//     }
//   };

//   const handleSave = async () => {
//     setIsLoading(true);
//     try {
//       // Prepare the data in the format expected by the backend
//       const updateData = {
//         id: exhibitorData._id,
//         firstName: formData.companyName, // Save company name as firstName
//         website: formData.website, // Save website to top-level field
//         boothLocation: formData.boothLocation, // Save booth location to top-level field
//         "formData[companyProfile][industry]": formData.industry,
//         "formData[companyProfile][description]": formData.description,
//         "formData[companyProfile][linkedin]": formData.linkedin,
//         "formData[companyProfile][twitter]": formData.twitter,
//         "formData[companyProfile][facebook]": formData.facebook,
//         "formData[companyProfile][instagram]": formData.instagram,
//       };

//       // Add files to the update data if they exist
//       if (logoFile) {
//         updateData.logo = logoFile;
//         console.log("Adding logo file:", logoFile.name, logoFile.size);
//       }
//       if (bannerFile) {
//         updateData.banner = bannerFile;
//         console.log("Adding banner file:", bannerFile.name, bannerFile.size);
//       }
//       if (brochureFile) {
//         updateData.brochure = brochureFile;
//         console.log("Adding brochure file:", brochureFile.name, brochureFile.size);
//       }

//       console.log("Saving company profile data:", updateData);
//       console.log("Files being sent:", {
//         logo: logoFile ? { name: logoFile.name, size: logoFile.size, type: logoFile.type } : null,
//         banner: bannerFile ? { name: bannerFile.name, size: bannerFile.size, type: bannerFile.type } : null,
//         brochure: brochureFile ? { name: brochureFile.name, size: brochureFile.size, type: brochureFile.type } : null
//       });

//       const hasFiles = !!(logoFile || bannerFile || brochureFile);

//       let result;
//       if (hasFiles) {
//         // Use existing helper for multipart submissions
//         result = await putData(updateData, 'ticket-registration/exhibitor');
//       } else {
//         // Send clean JSON when no files are present to avoid FormData parsing issues
//         const token = GetAccessToken();
//         const response = await axios.put(
//           `${import.meta.env.VITE_API}ticket-registration/exhibitor`,
//           updateData,
//           {
//             headers: {
//               'Content-Type': 'application/json',
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         result = { status: response.status, data: response.data };
//       }

//       console.log("API Response:", result);

//       if (result.status === 200 && result.data?.success) {
//         console.log("Save successful:", result);
//         console.log("Updated exhibitor data:", result.data.data);
//         console.log("Company profile data:", result.data.data?.formData?.companyProfile);
//         alert("Company profile saved successfully!");

//         // Clear file states after successful save
//         setLogoFile(null);
//         setBannerFile(null);
//         setBrochureFile(null);

//         // Update previews with the returned URLs (prefer top-level fields)
//         const updated = result.data.data || {};
//         if (updated.logo || updated.formData?.companyProfile?.logo) {
//           setLogoPreview(getImageUrl(updated.logo || updated.formData?.companyProfile?.logo));
//         }
//         if (updated.banner || updated.formData?.companyProfile?.banner) {
//           setBannerPreview(getImageUrl(updated.banner || updated.formData?.companyProfile?.banner));
//         }
//         if (updated.brochure || updated.formData?.companyProfile?.brochure) {
//           setBrochurePreview(updated.brochure || updated.formData?.companyProfile?.brochure);
//         }
//       } else {
//         console.error("Save failed:", result);
//         alert("Failed to save company profile. Please try again.");
//       }
//     } catch (error) {
//       console.error("Error saving company profile:", error);
//       alert("Error saving company profile. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       {/* Sidebar */}
//       {/* <div className="w-64 bg-white shadow-sm border-r border-gray-200 hidden lg:block">
//         <div className="p-6">
//           <div className="text-xl font-bold text-gray-900">Company Portal</div>
//         </div>
//       </div> */}

//       <div className="flex-1 flex flex-col overflow-hidden min-w-0">
//         {/* Header */}
//         <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">
//                 {exhibitorData?.firstName ? `${exhibitorData.firstName} - Company Profile` : "Company Profile"}
//               </h1>
//               <p className="text-sm text-gray-600">Welcome back, Exhibitor</p>
//             </div>
//             <div className="flex items-center gap-4">
//               <div className="text-right">
//                 <div className="text-sm font-medium text-gray-900">User</div>
//                 <div className="text-xs text-gray-500">Exhibitor Admin</div>
//               </div>
//             </div>
//           </div>
//         </header>

//         <main className="flex-1 overflow-y-auto">
//           <div className="max-w-7xl mx-auto p-4 sm:p-6">
//             {/* Form Content */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200">
//               {/* Tabs */}
//               <div className="border-b border-gray-200 p-6 pb-0">
//                 <div className="flex bg-gray-50 rounded-lg p-1">
//                   <button
//                     onClick={() => setActiveTab("basic")}
//                     className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "basic"
//                         ? "bg-white shadow-sm text-gray-900"
//                         : "text-gray-600 hover:text-gray-900"
//                       }`}
//                   >
//                     <Building className="w-4 h-4" />
//                     Basic Info
//                   </button>
//                   <button
//                     onClick={() => setActiveTab("media")}
//                     className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "media"
//                         ? "bg-white shadow-sm text-gray-900"
//                         : "text-gray-600 hover:text-gray-900"
//                       }`}
//                   >
//                     <Camera className="w-4 h-4" />
//                     Media & Assets
//                   </button>
//                   <button
//                     onClick={() => setActiveTab("social")}
//                     className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "social"
//                         ? "bg-white shadow-sm text-gray-900"
//                         : "text-gray-600 hover:text-gray-900"
//                       }`}
//                   >
//                     <Globe className="w-4 h-4" />
//                     Social Media
//                   </button>
//                 </div>
//               </div>

//               <div className="p-6">
//                 {/* Basic Info Tab */}
//                 {activeTab === "basic" && (
//                   <div className="space-y-8">
//                     <div className="space-y-6">
//                       <div>
//                         <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
//                             <input
//                               type="text"
//                               placeholder="Enter your company name"
//                               value={formData.companyName}
//                               onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
//                               className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                             />
//                           </div>
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
//                             <input
//                               type="text"
//                               placeholder="e.g., Technology, Healthcare, Finance"
//                               value={formData.industry}
//                               onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
//                               className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                             />
//                           </div>
//                         </div>
//                       </div>

//                       <div>
//                         <h4 className="text-base font-medium text-gray-900 mb-3">Description</h4>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
//                           <textarea
//                             rows={4}
//                             placeholder="Tell attendees about your company and what you do..."
//                             value={formData.description}
//                             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                           />
//                         </div>
//                       </div>

//                       <div>
//                         <h4 className="text-base font-medium text-gray-900 mb-3">Contact & Location</h4>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
//                             <input
//                               type="url"
//                               placeholder="https://your-website.com"
//                               value={formData.website}
//                               onChange={(e) => setFormData({ ...formData, website: e.target.value })}
//                               className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                             />
//                           </div>
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">Booth Location</label>
//                             <input
//                               type="text"
//                               placeholder="e.g., A-123, Hall 1"
//                               value={formData.boothLocation}
//                               onChange={(e) => setFormData({ ...formData, boothLocation: e.target.value })}
//                               className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Media & Assets Tab */}
//                 {activeTab === "media" && (
//                   <div className="space-y-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
//                         {logoPreview ? (
//                           <div className="border-2 border-gray-300 rounded-lg p-4">
//                             <img
//                               src={logoPreview}
//                               alt="Company Logo"
//                               className="mx-auto h-20 w-auto object-contain mb-2"
//                               onError={(e) => {
//                                 e.target.style.display = 'none';
//                                 e.target.nextSibling.style.display = 'block';
//                               }}
//                             />
//                             <div className="text-center" style={{ display: 'none' }}>
//                               <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//                               <p className="text-sm text-gray-600 mb-2">Logo not available</p>
//                             </div>
//                             <div className="flex gap-2">
//                               <button
//                                 type="button"
//                                 className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
//                                 onClick={() => document.getElementById('logo-input').click()}
//                               >
//                                 Change Logo
//                               </button>
//                               <button
//                                 type="button"
//                                 className="px-3 py-2 border border-red-300 rounded-md text-sm text-red-700 hover:bg-red-50"
//                                 onClick={() => removeFile('logo')}
//                               >
//                                 <X className="w-4 h-4" />
//                               </button>
//                             </div>
//                             <input
//                               id="logo-input"
//                               type="file"
//                               accept="image/*"
//                               className="hidden"
//                               onChange={(e) => handleFileChange(e.target.files[0], 'logo')}
//                             />
//                           </div>
//                         ) : (
//                           <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
//                             <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//                             <p className="text-sm text-gray-600 mb-2">Upload your company logo</p>
//                             <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
//                             <input
//                               type="file"
//                               accept="image/*"
//                               className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
//                               onChange={(e) => handleFileChange(e.target.files[0], 'logo')}
//                             />
//                           </div>
//                         )}
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image</label>
//                         {bannerPreview ? (
//                           <div className="border-2 border-gray-300 rounded-lg p-4">
//                             <img
//                               src={bannerPreview}
//                               alt="Banner Image"
//                               className="mx-auto h-20 w-auto object-contain mb-2"
//                               onError={(e) => {
//                                 e.target.style.display = 'none';
//                                 e.target.nextSibling.style.display = 'block';
//                               }}
//                             />
//                             <div className="text-center" style={{ display: 'none' }}>
//                               <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//                               <p className="text-sm text-gray-600 mb-2">Banner not available</p>
//                             </div>
//                             <div className="flex gap-2">
//                               <button
//                                 type="button"
//                                 className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
//                                 onClick={() => document.getElementById('banner-input').click()}
//                               >
//                                 Change Banner
//                               </button>
//                               <button
//                                 type="button"
//                                 className="px-3 py-2 border border-red-300 rounded-md text-sm text-red-700 hover:bg-red-50"
//                                 onClick={() => removeFile('banner')}
//                               >
//                                 <X className="w-4 h-4" />
//                               </button>
//                             </div>
//                             <input
//                               id="banner-input"
//                               type="file"
//                               accept="image/*"
//                               className="hidden"
//                               onChange={(e) => handleFileChange(e.target.files[0], 'banner')}
//                             />
//                           </div>
//                         ) : (
//                           <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
//                             <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//                             <p className="text-sm text-gray-600 mb-2">Upload banner image</p>
//                             <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
//                             <input
//                               type="file"
//                               accept="image/*"
//                               className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
//                               onChange={(e) => handleFileChange(e.target.files[0], 'banner')}
//                             />
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Company Brochure</label>
//                       {brochurePreview ? (
//                         <div className="border-2 border-gray-300 rounded-lg p-4">
//                           <div className="flex items-center gap-2 mb-2">
//                             <File className="w-5 h-5 text-gray-600" />
//                             <span className="text-sm text-gray-700">
//                               {brochurePreview.length > 30 ? brochurePreview.substring(0, 30) + '...' : brochurePreview}
//                             </span>
//                           </div>
//                           <div className="flex gap-2">
//                             <button
//                               type="button"
//                               className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
//                               onClick={() => document.getElementById('brochure-input').click()}
//                             >
//                               Change Brochure
//                             </button>
//                             <button
//                               type="button"
//                               className="px-3 py-2 border border-red-300 rounded-md text-sm text-red-700 hover:bg-red-50"
//                               onClick={() => removeFile('brochure')}
//                             >
//                               <X className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <input
//                             id="brochure-input"
//                             type="file"
//                             accept=".pdf"
//                             className="hidden"
//                             onChange={(e) => handleFileChange(e.target.files[0], 'brochure')}
//                           />
//                         </div>
//                       ) : (
//                         <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
//                           <File className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//                           <p className="text-sm text-gray-600 mb-2">Upload company brochure</p>
//                           <p className="text-xs text-gray-500">PDF up to 10MB</p>
//                           <input
//                             type="file"
//                             accept=".pdf"
//                             className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
//                             onChange={(e) => handleFileChange(e.target.files[0], 'brochure')}
//                           />
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {activeTab === "social" && (
//                   <div className="space-y-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
//                           <Linkedin className="w-4 h-4 text-blue-600" />
//                           LinkedIn
//                         </label>
//                         <input
//                           type="url"
//                           placeholder="https://linkedin.com/company/yourcompany"
//                           value={formData.linkedin}
//                           onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                         />
//                       </div>
//                       <div>
//                         <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
//                           <Twitter className="w-4 h-4 text-blue-400" />
//                           Twitter
//                         </label>
//                         <input
//                           type="url"
//                           placeholder="https://twitter.com/yourcompany"
//                           value={formData.twitter}
//                           onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                         />
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
//                           <Facebook className="w-4 h-4 text-blue-500" />
//                           Facebook
//                         </label>
//                         <input
//                           type="url"
//                           placeholder="https://facebook.com/yourcompany"
//                           value={formData.facebook}
//                           onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                         />
//                       </div>
//                       <div>
//                         <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
//                           <Instagram className="w-4 h-4 text-pink-500" />
//                           Instagram
//                         </label>
//                         <input
//                           type="url"
//                           placeholder="https://instagram.com/yourcompany"
//                           value={formData.instagram}
//                           onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Footer Actions */}
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8 p-6 bg-gray-50 rounded-xl">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-indigo-100 rounded-lg">
//                   <Key className="w-5 h-5 text-indigo-600" />
//                 </div>
//                 <div>
//                   <h3 className="font-medium text-gray-900">Profile Tips</h3>
//                   <p className="text-sm text-gray-600">Complete profile increases attendee engagement</p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-3">
//                 {/* <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
//                   <Eye className="w-4 h-4" />
//                   Preview Changes
//                 </button> */}
//                 <button
//                   onClick={handleSave}
//                   disabled={isLoading}
//                   className={`px-6 py-2.5 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${
//                     isLoading
//                       ? 'bg-gray-400 cursor-not-allowed text-white'
//                       : 'bg-indigo-600 hover:bg-indigo-700 text-white'
//                   }`}
//                 >
//                   <Save className="w-4 h-4" />
//                   {isLoading ? 'Saving...' : 'Save Changes'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </main>

//         {/* Footer */}
//         {/* <footer className="bg-white border-t border-gray-200 px-6 py-4">
//           <div className="text-center text-sm text-gray-500">
//             © 2024 Company Portal. All rights reserved.
//           </div>
//         </footer> */}
//       </div>
//     </div>
//   );
// }

//updated version 2.0

// import React, { useState, useEffect } from "react";
// import { Building, Globe, Camera, File, Upload, Eye, Save, Key, Linkedin, Twitter, Facebook, Instagram, X } from "lucide-react";

// import { getData, putData } from "../../../../backend/api";
// import axios from "axios";
// import { GetAccessToken } from "../../../../backend/authentication";
// import FormInput from "../../../core/input";
// import { PageHeader, SubPageHeader } from "../../../core/input/heading";

// export default function CompanyProfile({ exhibitorData }) {
//   console.log(exhibitorData);
//   const [activeTab, setActiveTab] = useState("basic");
//   const [isLoading, setIsLoading] = useState(false);

//   // Use exhibitor data from formData.companyProfile if provided, otherwise use default values
//   const [formData, setFormData] = useState({
//     companyName: exhibitorData?.firstName || "",
//     industry: exhibitorData?.formData?.companyProfile?.industry || "",
//     description: exhibitorData?.formData?.companyProfile?.description || "",
//     website: exhibitorData?.website || "",
//     boothLocation: exhibitorData?.boothLocation || "",
//     logo: exhibitorData?.logo || exhibitorData?.formData?.companyProfile?.logo || "",
//     banner: exhibitorData?.banner || exhibitorData?.formData?.companyProfile?.banner || "",
//     brochure: exhibitorData?.brochure || exhibitorData?.formData?.companyProfile?.brochure || "",
//     linkedin: exhibitorData?.formData?.companyProfile?.linkedin || "",
//     twitter: exhibitorData?.formData?.companyProfile?.twitter || "",
//     facebook: exhibitorData?.formData?.companyProfile?.facebook || "",
//     instagram: exhibitorData?.formData?.companyProfile?.instagram || "",
//   });

//   // File upload states
//   const [logoFile, setLogoFile] = useState(null);
//   const [bannerFile, setBannerFile] = useState(null);
//   const [brochureFile, setBrochureFile] = useState(null);

//   // Helper function to construct full URL for images
//   const getImageUrl = (path) => {
//     if (!path) return "";
//     if (path.startsWith("http")) return path;
//     if (path.startsWith("blob:")) return path;
//     // For relative paths, construct the full URL using CDN
//     const CDN_BASE_URL = import.meta.env.VITE_CDN || "https://event-manager.syd1.cdn.digitaloceanspaces.com/";
//     const cleanPath = path.replace(/^\/+/, "");
//     return `${CDN_BASE_URL}${cleanPath}`;
//   };

//   const [logoPreview, setLogoPreview] = useState(getImageUrl(exhibitorData?.logo || exhibitorData?.formData?.companyProfile?.logo || ""));
//   const [bannerPreview, setBannerPreview] = useState(getImageUrl(exhibitorData?.banner || exhibitorData?.formData?.companyProfile?.banner || ""));
//   const [brochurePreview, setBrochurePreview] = useState(exhibitorData?.brochure || exhibitorData?.formData?.companyProfile?.brochure || "");

//   // Update form data when exhibitorData changes
//   useEffect(() => {
//     if (exhibitorData) {
//       setFormData({
//         companyName: exhibitorData.firstName || "",
//         industry: exhibitorData.formData?.companyProfile?.industry || "",
//         description: exhibitorData.formData?.companyProfile?.description || "",
//         website: exhibitorData.website || "",
//         boothLocation: exhibitorData.boothLocation || "",
//         logo: exhibitorData.logo || exhibitorData.formData?.companyProfile?.logo || "",
//         banner: exhibitorData.banner || exhibitorData.formData?.companyProfile?.banner || "",
//         brochure: exhibitorData.brochure || exhibitorData.formData?.companyProfile?.brochure || "",
//         linkedin: exhibitorData.formData?.companyProfile?.linkedin || "",
//         twitter: exhibitorData.formData?.companyProfile?.twitter || "",
//         facebook: exhibitorData.formData?.companyProfile?.facebook || "",
//         instagram: exhibitorData.formData?.companyProfile?.instagram || "",
//       });
//       setLogoPreview(getImageUrl(exhibitorData.logo || exhibitorData.formData?.companyProfile?.logo || ""));
//       setBannerPreview(getImageUrl(exhibitorData.banner || exhibitorData.formData?.companyProfile?.banner || ""));
//       setBrochurePreview(exhibitorData.brochure || exhibitorData.formData?.companyProfile?.brochure || "");
//     }
//   }, [exhibitorData]);

//   // File handling functions
//   const handleFileChange = (file, type) => {
//     if (!file) return;

//     // Validate file size
//     const maxSize = type === "brochure" ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB for PDF, 5MB for images
//     if (file.size > maxSize) {
//       alert(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
//       return;
//     }

//     // Validate file type
//     if (type === "brochure") {
//       if (file.type !== "application/pdf") {
//         alert("Please select a PDF file for the brochure");
//         return;
//       }
//     } else {
//       if (!file.type.startsWith("image/")) {
//         alert("Please select an image file");
//         return;
//       }
//     }

//     // Set file and preview
//     if (type === "logo") {
//       setLogoFile(file);
//       setLogoPreview(URL.createObjectURL(file));
//     } else if (type === "banner") {
//       setBannerFile(file);
//       setBannerPreview(URL.createObjectURL(file));
//     } else if (type === "brochure") {
//       setBrochureFile(file);
//       setBrochurePreview(file.name);
//     }
//   };

//   // Cleanup function for object URLs
//   useEffect(() => {
//     return () => {
//       // Cleanup object URLs when component unmounts
//       if (logoPreview && logoPreview.startsWith("blob:")) {
//         URL.revokeObjectURL(logoPreview);
//       }
//       if (bannerPreview && bannerPreview.startsWith("blob:")) {
//         URL.revokeObjectURL(bannerPreview);
//       }
//     };
//   }, [logoPreview, bannerPreview]);

//   const removeFile = (type) => {
//     if (type === "logo") {
//       setLogoFile(null);
//       setLogoPreview("");
//       setFormData({ ...formData, logo: "" });
//     } else if (type === "banner") {
//       setBannerFile(null);
//       setBannerPreview("");
//       setFormData({ ...formData, banner: "" });
//     } else if (type === "brochure") {
//       setBrochureFile(null);
//       setBrochurePreview("");
//       setFormData({ ...formData, brochure: "" });
//     }
//   };

//   const handleSave = async (event, id, type, sub) => {
//     setIsLoading(true);
//     try {
//       // Prepare the data in the format expected by the backend
//       const updateData = {
//         id: exhibitorData._id,
//         firstName: formData.companyName, // Save company name as firstName
//         website: formData.website, // Save website to top-level field
//         boothLocation: formData.boothLocation, // Save booth location to top-level field
//         "formData[companyProfile][industry]": formData.industry,
//         "formData[companyProfile][description]": formData.description,
//         "formData[companyProfile][linkedin]": formData.linkedin,
//         "formData[companyProfile][twitter]": formData.twitter,
//         "formData[companyProfile][facebook]": formData.facebook,
//         "formData[companyProfile][instagram]": formData.instagram,
//       };

//       // Add files to the update data if they exist
//       if (logoFile) {
//         updateData.logo = logoFile;
//         console.log("Adding logo file:", logoFile.name, logoFile.size);
//       }
//       if (bannerFile) {
//         updateData.banner = bannerFile;
//         console.log("Adding banner file:", bannerFile.name, bannerFile.size);
//       }
//       if (brochureFile) {
//         updateData.brochure = brochureFile;
//         console.log("Adding brochure file:", brochureFile.name, brochureFile.size);
//       }

//       console.log("Saving company profile data:", updateData);
//       console.log("Files being sent:", {
//         logo: logoFile ? { name: logoFile.name, size: logoFile.size, type: logoFile.type } : null,
//         banner: bannerFile ? { name: bannerFile.name, size: bannerFile.size, type: bannerFile.type } : null,
//         brochure: brochureFile ? { name: brochureFile.name, size: brochureFile.size, type: brochureFile.type } : null,
//       });

//       const hasFiles = !!(logoFile || bannerFile || brochureFile);

//       let result;
//       if (hasFiles) {
//         // Use existing helper for multipart submissions
//         result = await putData(updateData, "ticket-registration/exhibitor");
//       } else {
//         // Send clean JSON when no files are present to avoid FormData parsing issues
//         const token = GetAccessToken();
//         const response = await axios.put(`${import.meta.env.VITE_API}ticket-registration/exhibitor`, updateData, {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         result = { status: response.status, data: response.data };
//       }

//       console.log("API Response:", result);

//       if (result.status === 200 && result.data?.success) {
//         console.log("Save successful:", result);
//         console.log("Updated exhibitor data:", result.data.data);
//         console.log("Company profile data:", result.data.data?.formData?.companyProfile);
//         alert("Company profile saved successfully!");

//         // Clear file states after successful save
//         setLogoFile(null);
//         setBannerFile(null);
//         setBrochureFile(null);

//         // Update previews with the returned URLs (prefer top-level fields)
//         const updated = result.data.data || {};
//         if (updated.logo || updated.formData?.companyProfile?.logo) {
//           setLogoPreview(getImageUrl(updated.logo || updated.formData?.companyProfile?.logo));
//         }
//         if (updated.banner || updated.formData?.companyProfile?.banner) {
//           setBannerPreview(getImageUrl(updated.banner || updated.formData?.companyProfile?.banner));
//         }
//         if (updated.brochure || updated.formData?.companyProfile?.brochure) {
//           setBrochurePreview(updated.brochure || updated.formData?.companyProfile?.brochure);
//         }
//       } else {
//         console.error("Save failed:", result);
//         alert("Failed to save company profile. Please try again.");
//       }
//     } catch (error) {
//       console.error("Error saving company profile:", error);
//       alert("Error saving company profile. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-bg-white">
//       {/* Sidebar */}
//       {/* <div className="w-64 bg-white shadow-sm border-r border-gray-200 hidden lg:block">
//         <div className="p-6">
//           <div className="text-xl font-bold text-gray-900">Company Portal</div>
//         </div>
//       </div> */}

//       <div className="flex-1 flex flex-col overflow-hidden min-w-0">
//         {/* Header */}
//         <header className="bg-bg-white shadow-sm border-b border-stroke-soft px-6 py-4">
//           <div className="flex w-full items-center justify-between">
//             <PageHeader
//               title={exhibitorData?.firstName ? `${exhibitorData.firstName} - Company Profile` : "Company Profile"}
//               description="Welcome back, Exhibitor"
//               line={false}
//             />
//             <p className="text-sm flex gap-2 text-text-sub">
//               User <span className="text-sm font-medium text-text-sub">Exhibitor Admin</span>
//             </p>
//           </div>
//         </header>

//         <main className="flex-1 overflow-y-auto">
//           <div className="max-w-7xl mx-auto p-4 sm:p-6">
//             {/* Form Content */}
//             <div className="bg-bg-white rounded-xl shadow-sm border border-stroke-soft">
//               {/* Tabs */}
//               <div className="border-b border-stroke-soft p-6 pb-0">
//                 <div className="flex bg-bg-white rounded-lg p-1">
//                   <button
//                     onClick={() => setActiveTab("basic")}
//                     className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
//                       activeTab === "basic" ? "bg-white shadow-sm text-gray-900" : "text-gray-600 hover:text-gray-900"
//                     }`}
//                   >
//                     <Building className="w-4 h-4" />
//                     Basic Info
//                   </button>
//                   <button
//                     onClick={() => setActiveTab("media")}
//                     className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
//                       activeTab === "media" ? "bg-white shadow-sm text-gray-900" : "text-gray-600 hover:text-gray-900"
//                     }`}
//                   >
//                     <Camera className="w-4 h-4" />
//                     Media & Assets
//                   </button>
//                   <button
//                     onClick={() => setActiveTab("social")}
//                     className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
//                       activeTab === "social" ? "bg-white shadow-sm text-gray-900" : "text-gray-600 hover:text-gray-900"
//                     }`}
//                   >
//                     <Globe className="w-4 h-4" />
//                     Social Media
//                   </button>
//                 </div>
//               </div>

//               <div className="p-6">
//                 {/* Basic Info Tab */}
//                 {activeTab === "basic" && (
//                   <div className="space-y-8">
//                     <div className="space-y-6">
//                       <div>
//                         <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                           <div>
//                             <FormInput
//                               type="text"
//                               name="companyName"
//                               label="Company Name"
//                               required={true}
//                               placeholder="Enter your company name"
//                               value={formData.companyName}
//                               onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
//                             />
//                           </div>
//                           <div>
//                             <FormInput
//                               type="text"
//                               name="industry"
//                               label="Industry"
//                               placeholder="e.g., Technology, Healthcare, Finance"
//                               value={formData.industry}
//                               onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
//                             />
//                           </div>
//                         </div>
//                       </div>

//                       <div>
//                         <h4 className="text-base font-medium text-gray-900 mb-3">Description</h4>
//                         <div>
//                           <FormInput
//                             type="textarea"
//                             name="description"
//                             label="Company Description"
//                             placeholder="Tell attendees about your company and what you do..."
//                             value={formData.description}
//                             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                           />
//                         </div>
//                       </div>

//                       <div>
//                         <h4 className="text-base font-medium text-gray-900 mb-3">Contact & Location</h4>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                           <div>
//                             <FormInput
//                               type="text"
//                               name="website"
//                               label="Website"
//                               placeholder="https://your-website.com"
//                               value={formData.website}
//                               onChange={(e) => setFormData({ ...formData, website: e.target.value })}
//                             />
//                           </div>
//                           <div>
//                             <FormInput
//                               type="text"
//                               name="boothLocation"
//                               label="Booth Location"
//                               placeholder="e.g., A-123, Hall 1"
//                               value={formData.boothLocation}
//                               onChange={(e) => setFormData({ ...formData, boothLocation: e.target.value })}
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Media & Assets Tab */}
//                 {activeTab === "media" && (
//                   <div className="space-y-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <FormInput
//                           type="image"
//                           name="logo"
//                           label="Company Logo"
//                           value={logoFile ? [logoFile] : []}
//                           formValues={{ ["old_" + "logo"]: formData.logo ? [formData.logo] : [] }}
//                           onChange={(event) => {
//                             const file = event?.target?.files?.[0];
//                             if (!file) return;
//                             const maxSize = 5 * 1024 * 1024;
//                             if (!file.type.startsWith("image/")) {
//                               alert("Please select an image file");
//                               return;
//                             }
//                             if (file.size > maxSize) {
//                               alert("File size must be less than 5MB");
//                               return;
//                             }
//                             setLogoFile(file);
//                             setLogoPreview(URL.createObjectURL(file));
//                           }}
//                         />
//                       </div>
//                       <div>
//                         <FormInput
//                           type="image"
//                           name="banner"
//                           label="Banner Image"
//                           value={bannerFile ? [bannerFile] : []}
//                           formValues={{ ["old_" + "banner"]: formData.banner ? [formData.banner] : [] }}
//                           onChange={(event) => {
//                             const file = event?.target?.files?.[0];
//                             if (!file) return;
//                             const maxSize = 5 * 1024 * 1024;
//                             if (!file.type.startsWith("image/")) {
//                               alert("Please select an image file");
//                               return;
//                             }
//                             if (file.size > maxSize) {
//                               alert("File size must be less than 5MB");
//                               return;
//                             }
//                             setBannerFile(file);
//                             setBannerPreview(URL.createObjectURL(file));
//                           }}
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <FormInput
//                         type="file"
//                         name="brochure"
//                         label="Company Brochure"
//                         value={brochureFile ? [brochureFile] : []}
//                         formValues={{ ["old_" + "brochure"]: formData.brochure ? [formData.brochure] : [] }}
//                         onChange={(event) => {
//                           const file = event?.target?.files?.[0];
//                           if (!file) return;
//                           const maxSize = 10 * 1024 * 1024;
//                           if (file.type !== "application/pdf") {
//                             alert("Please select a PDF file for the brochure");
//                             return;
//                           }
//                           if (file.size > maxSize) {
//                             alert("File size must be less than 10MB");
//                             return;
//                           }
//                           setBrochureFile(file);
//                           setBrochurePreview(file.name);
//                         }}
//                         info="PDF up to 10MB"
//                       />
//                     </div>
//                   </div>
//                 )}

//                 {/* Social Media Tab */}
//                 {activeTab === "social" && (
//                   <div className="space-y-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <FormInput
//                           type="url"
//                           name="linkedin"
//                           label="LinkedIn"
//                           placeholder="https://linkedin.com/company/yourcompany"
//                           value={formData.linkedin}
//                           onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
//                         />
//                       </div>
//                       <div>
//                         <FormInput
//                           type="url"
//                           name="twitter"
//                           label="Twitter"
//                           placeholder="https://twitter.com/yourcompany"
//                           value={formData.twitter}
//                           onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
//                         />
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <FormInput
//                           type="url"
//                           name="facebook"
//                           label="Facebook"
//                           placeholder="https://facebook.com/yourcompany"
//                           value={formData.facebook}
//                           onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
//                         />
//                       </div>
//                       <div>
//                         <FormInput
//                           type="url"
//                           name="instagram"
//                           label="Instagram"
//                           placeholder="https://instagram.com/yourcompany"
//                           value={formData.instagram}
//                           onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Footer Actions */}
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8 p-6 bg-bg-white rounded-xl">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-indigo-100 rounded-lg">
//                   <Key className="w-5 h-5 text-indigo-600" />
//                 </div>
//                 {/* <div>
//                   <h3 className="font-medium text-gray-900">Profile Tips</h3>
//                   <p className="text-sm text-gray-600">Complete profile increases attendee engagement</p>
//                 </div> */}
//                 <SubPageHeader title="Profile Tips" description="Complete profile increases attendee engagement" />
//               </div>
//               <div className="flex items-center gap-3">
//                 {/* <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
//                    <Eye className="w-4 h-4" />
//                    Preview Changes
//                  </button> */}
//                 <FormInput type="submit" name="saveButton" value={isLoading ? "Saving..." : "Save Changes"} icon="save" disabled={isLoading} css="theme" onChange={handleSave} />
//               </div>
//             </div>
//           </div>
//         </main>

//         {/* Footer */}
//         {/* <footer className="bg-white border-t border-gray-200 px-6 py-4">
//           <div className="text-center text-sm text-gray-500">
//             © 2024 Company Portal. All rights reserved.
//           </div>
//         </footer> */}
//       </div>
//     </div>
//   );
// }
