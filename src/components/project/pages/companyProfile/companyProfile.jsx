import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMessage } from "../../../core/message/useMessage";

import { getData, putData } from "../../../../backend/api";
import axios from "axios";
import { GetAccessToken } from "../../../../backend/authentication";
import FormInput from "../../../core/input";
import { SubPageHeader } from "../../../core/input/heading";
import { TabButtons } from "../../../core/elements";
import { useUser } from "../../../../contexts/UserContext";
import { SimpleShimmer } from "../../../core/loader/shimmer";
import { GetIcon } from "../../../../icons";
import { RowContainer } from "../../../styles/containers/styles";
import ListTable from "../../../core/list/list";
import { type } from "@testing-library/user-event/dist/cjs/utility/type.js";
import { allCountries } from "../event/attributes/countries";

// Note: Centralized configuration keeps the social link cards consistent across the page
const SOCIAL_LINK_FIELDS = [
  {
    name: "linkedin",
    label: "LinkedIn URL",
    placeholder: "https://www.linkedin.com/company/yourcompany",
    icon: "linkedin",
  },
  {
    name: "twitter",
    label: "X (Twitter) URL",
    placeholder: "https://www.x.com/yourcompany",
    icon: "x",
  },
  {
    name: "facebook",
    label: "Facebook URL",
    placeholder: "https://www.facebook.com/yourcompany",
    icon: "facebook",
  },
  {
    name: "instagram",
    label: "Instagram URL",
    placeholder: "https://www.instagram.com/yourcompany",
    icon: "instagram",
  },
];

export default function CompanyProfile(props) {
  const user = useUser();
  const queryClient = useQueryClient();
  const { showMessage } = useMessage();
  console.log(props, "props");
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [currentExhibitorId, setCurrentExhibitorId] = useState(props.user.userId || props.user?.user?._id || null);
  const [loaderBox, setLoaderBox] = useState(false); // For select component with addNew
  const hasFetchedRef = useRef(false); // Prevent duplicate API calls
  const previousIndustryCountRef = useRef(0); // Track previous industry count for auto-selection
  const lastCreatedIndustryIdRef = useRef(null); // Track the last created industry ID
  const previousIndustryDataRef = useRef([]); // Track previous industry data for comparison
  const exhibitorData = props.user || null;
  // Initialize form data - will be populated from API or exhibitorData
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "", // Changed from array to single value for select
    exhibitorCategory: "", // For display only (non-editable)
    exhibitorCategoryName: "", // For display only (non-editable)
    category: "",
    description: "",
    phoneNumber: "",
    email: "",
    address: "",
    country: "",
    website: "",
    boothLocation: "", // Non-editable
    logo: "",
    banner: "",
    brochure: "",
    linkedin: "",
    twitter: "",
    facebook: "",
    instagram: "",
    exhibitorContactPerson: "", // Exhibitor contact person
    enableSocialMedia: true,
  });

  // File upload states
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [brochureFile, setBrochureFile] = useState(null);
  

  // Helper function to construct full URL for images
  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    if (path.startsWith("blob:")) return path;
    // For relative paths, construct the full URL using CDN
    const CDN_BASE_URL = import.meta.env.VITE_CDN || "https://event-manager.syd1.cdn.digitaloceanspaces.com/";
    const cleanPath = path.replace(/^\/+/, "");
    return `${CDN_BASE_URL}${cleanPath}`;
  };

  const [logoPreview, setLogoPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [brochurePreview, setBrochurePreview] = useState("");

  // Helper function to get current exhibitor/user ID - memoized with useCallback
  // Current exhibitor ID is simply the user ID
  const getCurrentExhibitorId = useCallback(() => {
    // Return current exhibitor ID from state if available
    if (currentExhibitorId) {
      return currentExhibitorId;
    }

    // Try to get from exhibitorData (the exhibitor we're managing)
    if (exhibitorData?._id) {
      return exhibitorData._id;
    }

    // Try to get from user context (user ID is the exhibitor ID)
    if (user?._id) {
      return user._id;
    }

    // Try to get from localStorage as last fallback
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.userId) {
          return userData.userId;
        }
        if (userData.user?._id) {
          return userData.user._id;
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage", error);
      }
    }

    return null;
  }, [currentExhibitorId, exhibitorData, user]);

  // Update currentExhibitorId when user or exhibitorData changes
  useEffect(() => {
    const exhibitorId = exhibitorData?._id || user?._id;
    if (exhibitorId && exhibitorId !== currentExhibitorId) {
      setCurrentExhibitorId(exhibitorId);
    }
  }, [exhibitorData?._id, user?._id, currentExhibitorId]);

  // Helper function to populate form data from exhibitor data
  const populateFormFromExhibitorData = useCallback((exhibitor) => {
    if (!exhibitor) {
      console.log("populateFormFromExhibitorData: No exhibitor data provided");
      return;
    }
    
    console.log("populateFormFromExhibitorData: Populating form with exhibitor data:", exhibitor);
    
    // Helper function to normalize industry to single value
    const normalizeIndustry = (industryValue) => {
      if (!industryValue) return "";
      if (typeof industryValue === 'string') return industryValue;
      if (Array.isArray(industryValue) && industryValue.length > 0) {
        // Take first industry if it's an array
        const first = industryValue[0];
        return typeof first === 'object' ? (first.id || first._id || "") : first;
      }
      if (typeof industryValue === 'object' && industryValue !== null) {
        return industryValue._id || industryValue.id || "";
      }
      return "";
    };

    const newFormData = {
      companyName: exhibitor.firstName || exhibitor.companyName || "",
      // Handle industry as single value
      industry: normalizeIndustry(exhibitor.formData?.companyProfile?.industry || exhibitor.industry || ""),
      // Exhibitor category - for display only
      exhibitorCategory: exhibitor.exhibitorCategory?._id || exhibitor.exhibitorCategory || "",
      exhibitorCategoryName: exhibitor.exhibitorCategory?.value || exhibitor.exhibitorCategory?.categoryName || exhibitor.exhibitorCategory?.title || "",
      category: exhibitor.formData?.companyProfile?.category || exhibitor.category || "",
      // Map bio field from API response to description field in form
      description: exhibitor.formData?.companyProfile?.description || exhibitor.description || exhibitor.bio || "",
      phoneNumber: exhibitor.formData?.companyProfile?.phoneNumber || exhibitor.phoneNumber || "",
      email: exhibitor.formData?.companyProfile?.email || exhibitor.emailId || exhibitor.email || "",
      address: exhibitor.formData?.companyProfile?.address || exhibitor.address || "",
      country: exhibitor.formData?.companyProfile?.country || exhibitor.country || "",
      website: exhibitor.website || exhibitor.formData?.companyProfile?.website || "",
      boothLocation: exhibitor.boothLocation || exhibitor.boothNumber || "",
      logo: exhibitor.logo || exhibitor.formData?.companyProfile?.logo || "",
      banner: exhibitor.banner || exhibitor.formData?.companyProfile?.banner || "",
      brochure: exhibitor.brochure || exhibitor.formData?.companyProfile?.brochure || "",
      linkedin: exhibitor.formData?.companyProfile?.linkedin || exhibitor.linkedin || "",
      twitter: exhibitor.formData?.companyProfile?.twitter || exhibitor.twitter || "",
      facebook: exhibitor.formData?.companyProfile?.facebook || exhibitor.facebook || "",
      instagram: exhibitor.formData?.companyProfile?.instagram || exhibitor.instagram || "",
      exhibitorContactPerson: exhibitor.formData?.companyProfile?.exhibitorContactPerson || exhibitor.exhibitorContactPerson || "",
      enableSocialMedia:
        typeof exhibitor.formData?.companyProfile?.enableSocialMedia === "boolean"
          ? exhibitor.formData?.companyProfile?.enableSocialMedia
          : true,
    };
    
    console.log("populateFormFromExhibitorData: Setting form data to:", newFormData);
    
    setFormData(newFormData);
    
    // Update previews
    const logoPath = exhibitor.logo || exhibitor.formData?.companyProfile?.logo || "";
    const bannerPath = exhibitor.banner || exhibitor.formData?.companyProfile?.banner || "";
    const brochurePath = exhibitor.brochure || exhibitor.formData?.companyProfile?.brochure || "";
    
    console.log("populateFormFromExhibitorData: Setting previews - logo:", logoPath, "banner:", bannerPath, "brochure:", brochurePath);
    
    setLogoPreview(getImageUrl(logoPath));
    setBannerPreview(getImageUrl(bannerPath));
    setBrochurePreview(brochurePath);
  }, []);

  // Fetch company details - always try CompanyProfile first, then fall back to exhibitor data
  useEffect(() => {
    // Skip if already fetched
    if (hasFetchedRef.current) {
      return;
    }

    const fetchCompanyDetails = async () => {
      // Get exhibitor ID - prefer exhibitorData prop, then user context
      const exhibitorId = exhibitorData?.userId || getCurrentExhibitorId();

      console.log("Fetching company details for exhibitor:", exhibitorId);
      console.log("exhibitorData prop:", exhibitorData);

      // If no exhibitor ID found, skip fetching
      if (!exhibitorId) {
        console.warn("No exhibitor ID found to fetch company details");
        hasFetchedRef.current = true;
        return;
      }

      // Mark as fetching to prevent duplicate calls
      hasFetchedRef.current = true;
      setIsFetching(true);
      setCurrentExhibitorId(exhibitorId);
      
      try {
        // First, try to fetch CompanyProfile from the separate collection
        // Try using the exhibitor ID as a query parameter
        try {
          console.log("Attempting to fetch CompanyProfile with exhibitor:", exhibitorId);
          const response = await getData({ exhibitor: exhibitorId }, "company-profile");
          
          console.log("CompanyProfile API response:", response);
          
          if (response.status === 200 && response.data?.success) {
            const profileData = response.data.response || response.data.data;
            
            console.log("CompanyProfile raw response:", profileData);
            console.log("Is array:", Array.isArray(profileData), "Length:", Array.isArray(profileData) ? profileData.length : "N/A");
            
            // Check if response is empty array
            if (Array.isArray(profileData) && profileData.length === 0) {
              console.log("CompanyProfile not found (empty array), falling back to exhibitor data");
              // Don't return here, let it fall through to fallback logic
            } else {
              // Handle array response (dynamic routes may return array)
              const companyProfile = Array.isArray(profileData) && profileData.length > 0 ? profileData[0] : profileData;
              
              console.log("CompanyProfile data:", companyProfile);
              
              // Check if we got a valid company profile (not empty array)
              if (companyProfile && companyProfile._id && !Array.isArray(companyProfile)) {
                // CompanyProfile exists - use that data, but also fetch exhibitor data to merge
                console.log("Using CompanyProfile data to populate form, will merge with exhibitor data");
                // Helper function to normalize industry to single value
                const normalizeIndustry = (industryValue) => {
                  if (!industryValue) return "";
                  if (typeof industryValue === 'string') return industryValue;
                  if (Array.isArray(industryValue) && industryValue.length > 0) {
                    const first = industryValue[0];
                    return typeof first === 'object' ? (first.id || first._id || "") : first;
                  }
                  if (typeof industryValue === 'object' && industryValue !== null) {
                    return industryValue._id || industryValue.id || "";
                  }
                  return "";
                };

                // Set initial form data from CompanyProfile
                setFormData({
                  companyName: companyProfile.companyName || "",
                  industry: normalizeIndustry(companyProfile.industry || ""),
                  exhibitorCategory: companyProfile.exhibitorCategory?._id || companyProfile.exhibitorCategory || "",
                  exhibitorCategoryName: companyProfile.exhibitorCategory?.value || companyProfile.exhibitorCategory?.categoryName || companyProfile.exhibitorCategory?.title || "",
                  category: companyProfile.category || "",
                  description: companyProfile.description || "",
                  phoneNumber: companyProfile.phoneNumber || "",
                  email: companyProfile.email || "",
                  address: companyProfile.address || "",
                  country: companyProfile.country || "",
                  website: companyProfile.website || "",
                  boothLocation: companyProfile.boothLocation || "",
                  logo: companyProfile.logo || "",
                  banner: companyProfile.banner || "",
                  brochure: companyProfile.brochure || "",
                  linkedin: companyProfile.linkedin || "",
                  twitter: companyProfile.twitter || "",
                  facebook: companyProfile.facebook || "",
                  instagram: companyProfile.instagram || "",
                  exhibitorContactPerson: companyProfile.exhibitorContactPerson || "",
                  enableSocialMedia:
                    typeof companyProfile.enableSocialMedia === "boolean" ? companyProfile.enableSocialMedia : true,
                });
                
                // Update previews
                setLogoPreview(getImageUrl(companyProfile.logo || ""));
                setBannerPreview(getImageUrl(companyProfile.banner || ""));
                setBrochurePreview(companyProfile.brochure || "");
                
                // Also fetch exhibitor data to merge missing fields (like exhibitorContactPerson, website)
                // Don't return here, continue to fetch exhibitor data for merging
                console.log("CompanyProfile loaded, now fetching exhibitor data to merge missing fields");
              } else {
                console.log("CompanyProfile data invalid, falling back to exhibitor data");
              }
            }
          } else {
            console.log("CompanyProfile API returned non-success response, falling back to exhibitor data");
          }
        } catch (profileError) {
          console.log("CompanyProfile not found or error fetching:", profileError);
          // Continue to fallback logic
        }

        // Fetch exhibitor data to merge with CompanyProfile or use as fallback
        // If exhibitorData prop is provided, use it directly
        let exhibitor = null;
        if (exhibitorData && exhibitorData._id === exhibitorId) {
          console.log("Using exhibitorData prop to populate form");
          console.log("Exhibitor data:", exhibitorData);
          exhibitor = exhibitorData;
        } else {
        // Otherwise, fetch exhibitor data from API
        // Try using the exhibitor-specific endpoint first
        try {
            console.log("Fetching exhibitor data from API");
          
          // Try the exhibitor endpoint with id parameter
          let exhibitorResponse = null;
          try {
            exhibitorResponse = await getData({ id: exhibitorId }, "ticket-registration/exhibitor");
            console.log("Exhibitor API response (exhibitor endpoint):", exhibitorResponse);
          } catch (exhibitorEndpointError) {
            console.log("Exhibitor endpoint failed, trying alternative:", exhibitorEndpointError);
            
            // Alternative: Try to get event from user context and use that
            const userEvent = user?.event || exhibitorData?.event;
            if (userEvent) {
              try {
                exhibitorResponse = await getData({ id: exhibitorId, event: userEvent }, "ticket-registration");
                console.log("Exhibitor API response (with event):", exhibitorResponse);
              } catch (eventError) {
                console.log("Failed with event parameter:", eventError);
              }
            }
          }
          
          if (exhibitorResponse && exhibitorResponse.status === 200 && exhibitorResponse.data?.success) {
            const exhibitorDataFromApi = exhibitorResponse.data.response || exhibitorResponse.data.data;
              exhibitor = Array.isArray(exhibitorDataFromApi) && exhibitorDataFromApi.length > 0 
              ? exhibitorDataFromApi[0] 
              : exhibitorDataFromApi;
            
            console.log("Exhibitor data from API:", exhibitor);
          } else if (exhibitorResponse) {
            console.warn("Failed to fetch exhibitor data:", exhibitorResponse.data?.message);
          } else {
            console.warn("Could not fetch exhibitor data - no valid endpoint found");
          }
        } catch (exhibitorError) {
          console.error("Error fetching exhibitor data:", exhibitorError);
        }
        }

        // Merge exhibitor data with existing form data (from CompanyProfile if it exists)
        if (exhibitor && exhibitor._id) {
          console.log("Merging exhibitor data with form data");
          setFormData(prevFormData => {
            // Helper function to get value, preferring non-empty existing value, then exhibitor value
            const getMergedValue = (existingValue, exhibitorValue, exhibitorFormDataValue) => {
              // If existing value is not empty, use it
              if (existingValue && typeof existingValue === 'string' && existingValue.trim() !== "") return existingValue;
              if (existingValue && existingValue !== "") return existingValue;
              // Otherwise, try exhibitor direct value, then formData value
              return exhibitorValue || exhibitorFormDataValue || existingValue || "";
            };
            
            // Merge exhibitor data, using existing form data as base and exhibitor data as fallback for empty fields
            return {
              ...prevFormData,
              // Use exhibitor data for fields that are empty in CompanyProfile
              website: getMergedValue(prevFormData.website, exhibitor.website, exhibitor.formData?.companyProfile?.website),
              exhibitorContactPerson: getMergedValue(prevFormData.exhibitorContactPerson, exhibitor.exhibitorContactPerson, exhibitor.formData?.companyProfile?.exhibitorContactPerson),
              // Also update other fields that might be missing
              boothLocation: getMergedValue(prevFormData.boothLocation, exhibitor.boothLocation || exhibitor.boothNumber, exhibitor.formData?.companyProfile?.boothLocation),
              email: getMergedValue(prevFormData.email, exhibitor.emailId || exhibitor.email, exhibitor.formData?.companyProfile?.email),
              phoneNumber: getMergedValue(prevFormData.phoneNumber, exhibitor.phoneNumber, exhibitor.formData?.companyProfile?.phoneNumber),
            };
          });
        } else {
          // If no CompanyProfile was found, use exhibitor data directly
          if (exhibitor && exhibitor._id) {
            console.log("No CompanyProfile found, using exhibitor data directly");
            populateFormFromExhibitorData(exhibitor);
          } else {
            console.warn("No exhibitor data found to merge");
          }
        }
        
        setIsFetching(false);
      } catch (error) {
        console.error("Error fetching company details:", error);
        // Reset ref on error so it can retry if needed
        hasFetchedRef.current = false;
      } finally {
        setIsFetching(false);
      }
    };

    fetchCompanyDetails();
  }, [exhibitorData, getCurrentExhibitorId, populateFormFromExhibitorData]);

  // Immediate population when exhibitorData prop is available (for faster initial render)
  // This runs before the main fetch to show data immediately
  useEffect(() => {
    if (exhibitorData && exhibitorData._id) {
      console.log("Immediate population from exhibitorData prop");
      const exhibitorId = exhibitorData._id;
      setCurrentExhibitorId(exhibitorId);
      // Only populate if we haven't fetched yet (to avoid overwriting CompanyProfile data)
      if (!hasFetchedRef.current) {
        populateFormFromExhibitorData(exhibitorData);
      }
    }
  }, [exhibitorData, populateFormFromExhibitorData]);

  // File handling functions
  const handleFileChange = (file, type) => {
    if (!file) return;

    // Validate file size
    const maxSize = type === "brochure" ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB for PDF, 5MB for images
    if (file.size > maxSize) {
      alert(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    // Validate file type
    if (type === "brochure") {
      if (file.type !== "application/pdf") {
        alert("Please select a PDF file for the brochure");
        return;
      }
    } else {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
    }

    // Set file and preview
    if (type === "logo") {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    } else if (type === "banner") {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    } else if (type === "brochure") {
      setBrochureFile(file);
      setBrochurePreview(file.name);
    }
  };

  // Hide refresh button in resources section
  useEffect(() => {
    if (activeTab === "resources") {
      const hideRefreshButton = () => {
        const resourcesSection = document.querySelector(".resources-section");
        if (resourcesSection) {
          const buttons = resourcesSection.querySelectorAll(".flex.left button");
          buttons.forEach((button) => {
            const svg = button.querySelector("svg[viewBox='0 0 512 512']");
            if (svg && !button.querySelector("span")) {
              // This is the refresh button (has reload icon SVG and no text span)
              button.style.display = "none";
            }
          });
        }
      };

      // Run immediately and also after a short delay to catch dynamically rendered content
      hideRefreshButton();
      const timeoutId = setTimeout(hideRefreshButton, 100);
      const intervalId = setInterval(hideRefreshButton, 500);

      return () => {
        clearTimeout(timeoutId);
        clearInterval(intervalId);
        // Restore button visibility when leaving resources tab
        const resourcesSection = document.querySelector(".resources-section");
        if (resourcesSection) {
          const buttons = resourcesSection.querySelectorAll(".flex.left button");
          buttons.forEach((button) => {
            button.style.display = "";
          });
        }
      };
    }
  }, [activeTab]);

  // Cleanup function for object URLs
  useEffect(() => {
    return () => {
      // Cleanup object URLs when component unmounts
      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
      if (bannerPreview && bannerPreview.startsWith("blob:")) {
        URL.revokeObjectURL(bannerPreview);
      }
    };
  }, [logoPreview, bannerPreview]);

  const removeFile = (type) => {
    if (type === "logo") {
      setLogoFile(null);
      setLogoPreview("");
      setFormData({ ...formData, logo: "" });
    } else if (type === "banner") {
      setBannerFile(null);
      setBannerPreview("");
      setFormData({ ...formData, banner: "" });
    } else if (type === "brochure") {
      setBrochureFile(null);
      setBrochurePreview("");
      setFormData({ ...formData, brochure: "" });
    }
  };


  const handleSave = async (event, id, type, sub) => {
    setIsLoading(true);
    try {
      // Get the current exhibitor ID (either from exhibitorData prop or fetched data)
      const userId = currentExhibitorId || exhibitorData?._id || getCurrentExhibitorId();
      
      if (!userId) {
        alert("Unable to identify user. Please refresh the page and try again.");
        setIsLoading(false);
        return;
      }

      // First, check if company profile exists
      let existingProfile = null;
      try {
        const checkResponse = await getData({ exhibitor: userId }, "company-profile");
        if (checkResponse.status === 200 && checkResponse.data?.success) {
          const profileData = checkResponse.data.response || checkResponse.data.data;
          existingProfile = Array.isArray(profileData) ? profileData[0] : profileData;
        }
      } catch (error) {
        console.log("No existing profile found, will create new one");
      }

      // Prepare the data in the format expected by the CompanyProfile model
      // Industry is now a single ObjectId reference
      console.log("Saving industry data - formData.industry:", formData.industry);
      // Extract ID from industry value if it's an object, otherwise use value directly
      let industryValue = "";
      if (formData.industry) {
        if (typeof formData.industry === 'object' && formData.industry !== null) {
          industryValue = formData.industry.id || formData.industry._id || "";
        } else {
          industryValue = formData.industry;
        }
      }

      const updateData = {
        exhibitor: userId,
        companyName: formData.companyName,
        industry: industryValue,
        exhibitorCategory: formData.exhibitorCategory || "",
        category: formData.category || "",
        description: formData.description || "",
        phoneNumber: formData.phoneNumber || "",
        email: formData.email || "",
        address: formData.address || "",
        country: formData.country || "",
        website: formData.website || "",
        boothLocation: formData.boothLocation || "",
        linkedin: formData.linkedin || "",
        twitter: formData.twitter || "",
        facebook: formData.facebook || "",
        instagram: formData.instagram || "",
        exhibitorContactPerson: formData.exhibitorContactPerson || "",
      enableSocialMedia: Boolean(formData.enableSocialMedia),
      };

      // Add event reference if available from exhibitorData
      if (exhibitorData?.event) {
        updateData.event = exhibitorData.event;
      }

      // Add files to the update data if they exist
      if (logoFile) {
        updateData.logo = logoFile;
        console.log("Adding logo file:", logoFile.name, logoFile.size);
      }
      if (bannerFile) {
        updateData.banner = bannerFile;
        console.log("Adding banner file:", bannerFile.name, bannerFile.size);
      }
      if (brochureFile) {
        updateData.brochure = brochureFile;
        console.log("Adding brochure file:", brochureFile.name, brochureFile.size);
      }

      // If profile exists, include its ID for update
      if (existingProfile?._id) {
        updateData.id = existingProfile._id;
      }

        console.log("Saving company profile data:", updateData);
      console.log("Files being sent:", {
        logo: logoFile ? { name: logoFile.name, size: logoFile.size, type: logoFile.type } : null,
        banner: bannerFile ? { name: bannerFile.name, size: bannerFile.size, type: bannerFile.type } : null,
        brochure: brochureFile ? { name: brochureFile.name, size: brochureFile.size, type: brochureFile.type } : null,
      });

      const hasFiles = !!(logoFile || bannerFile || brochureFile);

      let result;
      if (hasFiles || existingProfile?._id) {
        // Use existing helper for multipart submissions (PUT for update)
        result = await putData(updateData, "company-profile");
      } else {
        // Use POST for creating new profile without files
        const token = GetAccessToken();
        const response = await axios.post(`${import.meta.env.VITE_API}company-profile`, updateData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        result = { status: response.status, data: response.data };
      }

      console.log("API Response:", result);

      if (result.status === 200 && result.data?.success) {
        console.log("Save successful:", result);
        const updated = result.data.response || result.data.data || {};
        const companyProfile = Array.isArray(updated) ? updated[0] : updated;
        
        console.log("Updated company profile:", companyProfile);
        alert("Company profile saved successfully!");

        // Clear file states after successful save
        setLogoFile(null);
        setBannerFile(null);
        setBrochureFile(null);

        // Helper function to normalize industry to single value
        const normalizeIndustry = (industryValue) => {
          if (!industryValue) return "";
          if (typeof industryValue === 'string') return industryValue;
          if (Array.isArray(industryValue) && industryValue.length > 0) {
            const first = industryValue[0];
            return typeof first === 'object' ? (first.id || first._id || "") : first;
          }
          if (typeof industryValue === 'object' && industryValue !== null) {
            return industryValue._id || industryValue.id || "";
          }
          return "";
        };

        // Update form data and previews with the returned data
        setFormData({
          companyName: companyProfile.companyName || formData.companyName,
          industry: normalizeIndustry(companyProfile.industry ?? formData.industry),
          exhibitorCategory: companyProfile.exhibitorCategory?._id || companyProfile.exhibitorCategory || formData.exhibitorCategory,
          exhibitorCategoryName: companyProfile.exhibitorCategory?.value || companyProfile.exhibitorCategory?.categoryName || companyProfile.exhibitorCategory?.title || formData.exhibitorCategoryName,
          category: companyProfile.category ?? formData.category,
          description: companyProfile.description ?? formData.description,
          phoneNumber: companyProfile.phoneNumber ?? formData.phoneNumber,
          email: companyProfile.email ?? formData.email,
          address: companyProfile.address ?? formData.address,
          country: companyProfile.country ?? formData.country,
          website: companyProfile.website ?? formData.website,
          boothLocation: companyProfile.boothLocation ?? formData.boothLocation,
          logo: companyProfile.logo || formData.logo,
          banner: companyProfile.banner || formData.banner,
          brochure: companyProfile.brochure || formData.brochure,
          linkedin: companyProfile.linkedin ?? formData.linkedin,
          twitter: companyProfile.twitter ?? formData.twitter,
          facebook: companyProfile.facebook ?? formData.facebook,
          instagram: companyProfile.instagram ?? formData.instagram,
          exhibitorContactPerson: companyProfile.exhibitorContactPerson ?? formData.exhibitorContactPerson,
          enableSocialMedia:
            typeof companyProfile.enableSocialMedia === "boolean" ? companyProfile.enableSocialMedia : formData.enableSocialMedia,
        });
        
        // Update previews
        if (companyProfile.logo) {
          setLogoPreview(getImageUrl(companyProfile.logo));
        }
        if (companyProfile.banner) {
          setBannerPreview(getImageUrl(companyProfile.banner));
        }
        if (companyProfile.brochure) {
          setBrochurePreview(companyProfile.brochure);
        }
      } else {
        console.error("Save failed:", result);
        alert("Failed to save company profile. Please try again.");
      }
    } catch (error) {
      console.error("Error saving company profile:", error);
      alert("Error saving company profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RowContainer className="data-layout">
      {/* Form Content */}
      {isFetching ? (
        <div className="bg-bg-white rounded-xl shadow-sm p-6">
          <SimpleShimmer message="Loading company profile..." />
        </div>
      ) : (
        <div className="bg-bg-white rounded-xl shadow-sm">
          {/* Tabs */}
          <div className="px-6 pt-6 pb-0">
            <TabButtons
              tabs={[
                { key: "basic", icon: "info", title: "Basic Info" },
                { key: "media", icon: "package", title: "Media & Assets" },
                { key: "social", icon: "globe", title: "Social Media" },
                { key: "resources", icon: "file", title: "Resources" },
              ]}
              selectedTab={activeTab}
              selectedChange={(key) => setActiveTab(key)}
              design="underline"
            />
          </div>

          <div className={`p-6 ${activeTab === "resources" ? "pt-2" : ""}`}>
            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <div className="space-y-8">
                <div className="space-y-6">
                  <div>
                    <div className="mb-4">
                      <SubPageHeader title="Company Information" line={true} dynamicClass="text-xl md:text-2xl font-bold leading-tight text-text-main" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <FormInput
                          type="text"
                          name="companyName"
                          label="Company Name"
                          required={true}
                          placeholder="Enter your company name"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        />
                      </div>
                      <div>
                        <FormInput
                          type="select"
                          name="industry"
                          label="Industry"
                          placeholder="Select industry"
                          value={formData.industry}
                          onChange={(value, id, type) => {
                            // Handle select onChange - extract ID from value if it's an object
                            console.log("Industry onChange - received value:", value);
                            // Extract ID if value is an object, otherwise use value directly
                            const industryId = typeof value === 'object' && value !== null 
                              ? (value.id || value._id || value) 
                              : value;
                            setFormData({ ...formData, industry: industryId });
                          }}
                          apiType="API"
                          selectApi={`industry/master/select?exhibitor=${exhibitorData?.userId || getCurrentExhibitorId()}`}
                          displayValue="value"
                          showItem="industryTitle"
                          search={true}
                          setLoaderBox={setLoaderBox}
                          setMessage={showMessage}
                          addNew={{
                            attributes: [
                              {
                                type: "text",
                                placeholder: "Industry Name",
                                name: "industryTitle",
                                validation: "",
                                default: "",
                                label: "Add an industry",
                                required: true,
                                view: true,
                                add: true,
                                update: true,
                              },
                              {
                                type : "text",
                                name : "exhibitor",
                                label : "Exhibitor ID",
                                placeholder : "Exhibitor ID",
                                default : exhibitorData?._id || getCurrentExhibitorId(),
                                required : true,
                                view : false,
                                add : false,
                                update : false,
                              },
                              {
                                type : "text",
                                name : "event",
                                label : "Event ID",
                                placeholder : "Event ID",
                                default : exhibitorData?.event || user?.event,
                                required : false,
                                view : false,
                                add : false,
                                update : false,
                              }
                            ],
                            api: "industry",
                            additionalData: {
                              exhibitor: currentExhibitorId || exhibitorData?._id || getCurrentExhibitorId(),
                              event: exhibitorData?.event || user?.event,
                            },
                            submitButtonText: "Create",
                          }}
                        />
                      </div>
                      <div>
                        <FormInput
                          type="text"
                          name="exhibitorCategory"
                          label="Exhibitor Category"
                          placeholder="N/A"
                          value={formData.exhibitorCategoryName}
                          disabled={true}
                          edit={false}
                          info="This is assigned by the event organizer"
                        />
                      </div>
                      <div>
                        <FormInput
                          type="text"
                          name="boothLocation"
                          label="Booth Location"
                          placeholder="Not assigned yet"
                          value={formData.boothLocation}
                          disabled={true}
                          info="This will be assigned by the event organizer"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-4">
                      <SubPageHeader title="Description" line={false} dynamicClass="text-lg font-semibold text-text-main" />
                    </div>
                    <div>
                      <FormInput
                        type="textarea"
                        name="description"
                        label="Company Description"
                        placeholder="Tell attendees about your company and what you do..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-4">
                      <SubPageHeader title="Contact Information" line={true} dynamicClass="text-xl md:text-2xl font-bold leading-tight text-text-main" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <FormInput
                          type="mobilenumber"
                          name="phoneNumber"
                          label="Phone Number"
                          required={false}
                          value={formData.phoneNumber}
                          onChange={(e) => {
                            // Support both raw string and mobilenumber object { number, country }
                            const value = e?.target?.value ?? e?.value ?? e ?? "";
                            setFormData({ ...formData, phoneNumber: value });
                          }}
                          countries={allCountries}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div>
                        <FormInput
                          type="email"
                          name="email"
                          label="Email"
                          placeholder="Enter email address"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <FormInput
                          type="text"
                          name="website"
                          label="Company Website"
                          placeholder="https:https://your-website.com"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        />
                      </div>
                      <div>
                        <FormInput
                          type="text"
                          name="exhibitorContactPerson"
                          label="Name of Contact Person"
                          placeholder="Enter contact person"
                          value={formData.exhibitorContactPerson}
                          onChange={(e) => setFormData({ ...formData, exhibitorContactPerson: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-4">
                      <SubPageHeader title="Location Details" line={true} dynamicClass="text-xl md:text-2xl font-bold leading-tight text-text-main" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <FormInput
                          type="textarea"
                          name="address"
                          label="Address"
                          placeholder="Enter address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      </div>
                      <div>
                        <FormInput
                          type="select"
                          name="country"
                          label="Country"
                          placeholder="Select country"
                          value={formData.country}
                          onChange={(value, id, type) => {
                            // Handle select onChange - extract ID from value if it's an object
                            const countryId = typeof value === 'object' && value !== null 
                              ? (value.id || value._id || value) 
                              : value;
                            setFormData({ ...formData, country: countryId });
                          }}
                          apiType="API"
                          selectApi="country/select"
                          showItem="countryName"
                          search={true}
                          setLoaderBox={setLoaderBox}
                          setMessage={showMessage}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Media & Assets Tab */}
            {activeTab === "media" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FormInput
                      type="image"
                      name="logo"
                      label="Company Logo"
                      required={true}
                      value={logoFile ? [logoFile] : []}
                      formValues={{ ["old_" + "logo"]: formData.logo ? [formData.logo] : [] }}
                      onChange={(event) => {
                        const file = event?.target?.files?.[0];
                        if (!file) return;
                        const maxSize = 5 * 1024 * 1024;
                        if (!file.type.startsWith("image/")) {
                          alert("Please select an image file");
                          return;
                        }
                        if (file.size > maxSize) {
                          alert("File size must be less than 5MB");
                          return;
                        }
                        setLogoFile(file);
                        setLogoPreview(URL.createObjectURL(file));
                      }}
                    />
                  </div>
                </div>

                <div>
                  <FormInput
                    type="file"
                    name="brochure"
                    label="Company Portfolio / Brochure"
                    value={brochureFile ? [brochureFile] : []}
                    formValues={{ ["old_" + "brochure"]: formData.brochure ? [formData.brochure] : [] }}
                    onChange={(event) => {
                      const file = event?.target?.files?.[0];
                      if (!file) return;
                      const maxSize = 10 * 1024 * 1024;
                      if (file.type !== "application/pdf") {
                        alert("Please select a PDF file for the brochure");
                        return;
                      }
                      if (file.size > maxSize) {
                        alert("File size must be less than 10MB");
                        return;
                      }
                      setBrochureFile(file);
                      setBrochurePreview(file.name);
                    }}
                    info="PDF up to 10MB"
                  />
                </div>
              </div>
            )}

            {/* Social Media Tab */}
            {activeTab === "social" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-stroke-soft bg-bg-white p-6 shadow-[0px_24px_60px_rgba(15,23,42,0.04)]">
                  <div className="space-y-1.5">
                    <h5 className="text-lg font-semibold text-text-main">Social Media Profiles</h5>
                    <p className="text-sm text-text-sub">Add your company&apos;s social media profiles so prospects can connect across channels.</p>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                    {SOCIAL_LINK_FIELDS.map((field) => (
                      <FormInput
                        key={field.name}
                        type="text"
                        name={field.name}
                        label={field.label}
                        placeholder={field.placeholder}
                        icon={field.icon}
                        value={formData[field.name] || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === "resources" && (
              <div className="space-y-2 -mt-2">
                {/* Hide search icon and refresh button in resources section */}
                <style>{`
                  /* Hide Search component by targeting its input field */
                  .resources-section input[type="text"][name="search-1"][placeholder="Search"] {
                    display: none !important;
                  }
                  /* Hide the parent container of the Search component */
                  .resources-section .flex.left > div:has(input[name="search-1"]) {
                    display: none !important;
                  }
                  /* Alternative: Hide by targeting the search icon's parent */
                  .resources-section .flex.left > div:has(> div > svg[data-icon="search"]) {
                    display: none !important;
                  }
                  /* Hide refresh/reload button - multiple selectors for better compatibility */
                  .resources-section .flex.left button svg[viewBox="0 0 512 512"],
                  .resources-section .ButtonPanel .flex.left button svg[viewBox="0 0 512 512"] {
                    display: none !important;
                  }
                  .resources-section .flex.left button:has(svg[viewBox="0 0 512 512"]),
                  .resources-section .ButtonPanel .flex.left button:has(svg[viewBox="0 0 512 512"]) {
                    display: none !important;
                  }
                  /* Fallback: Hide button that only contains SVG with viewBox 512x512 (reload icon) */
                  .resources-section .flex.left > button:has(> svg[viewBox="0 0 512 512"]:only-child) {
                    display: none !important;
                  }
                  /* Additional selector: target button that is sibling before Search component */
                  .resources-section .flex.left > button:nth-of-type(2):not(:has(span)) {
                    display: none !important;
                  }
                  /* Adjust ButtonPanel spacing when refresh and search are hidden */
                  .resources-section .ButtonPanel {
                    padding-bottom: 0.5rem !important;
                    margin-top: -0.5rem !important;
                  }
                `}</style>
                {/* Resources ListTable */}
                {currentExhibitorId && (
                  <div className="resources-section">
                  <ListTable
                    api="resources"
                    itemTitle={{
                      name: "resourceName",
                      type: "text",
                      collection: "",
                    }}
                    shortName="Resource"
                    formMode="single"
                    preFilter={{
                      exhibitor: currentExhibitorId,
                    }}
                    parents={{
                      exhibitor: currentExhibitorId,
                      ...(exhibitorData?.event ? { event: exhibitorData.event } : {}),
                    }}
                    parentReference="exhibitor"
                    referenceId={currentExhibitorId}
                    viewMode="list"
                    displayColumn="triple"
                    attributes={[
                      {
                        type: "text",
                        name: "resourceName",
                        label: "Resource Name",
                        required: true,
                        tag: true,
                        view: true,
                        add: true,
                        update: true,
                        customClass: "full",
                      },
                      {
                        type: "textarea",
                        name: "shortDescription",
                        label: "Short Description",
                        required: true,
                        tag: true,
                        view: true,
                        add: true,
                        update: true,
                        customClass: "full",
                      },
                      {
                        type: "file",
                        name: "fileUpload",
                        label: "File Upload",
                        required: true,
                        tag: false,
                        view: false,
                        add: true,
                        update: true,
                        customClass: "full",
                        allowedFileTypes: [
                          "image/*",
                          "application/pdf",
                          "application/msword",
                          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                          "application/vnd.ms-excel",
                          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                          "application/vnd.ms-powerpoint",
                          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                          "text/plain",
                          "text/csv",
                          "application/rtf",
                        ],
                      },
                    ]}
                    ListItemRender={({ data, actions, onClick }) => {
                      // Helper function to get full URL for file
                      const getFileUrl = (path) => {
                        if (!path) return "";
                        if (path.startsWith("http")) return path;
                        if (path.startsWith("blob:")) return path;
                        return `${import.meta.env.VITE_CDN || ""}${path}`;
                      };

                      return (
                        <div 
                          className="border border-stroke-soft rounded-lg p-4 hover:shadow-md transition-shadow bg-bg-white cursor-pointer relative"
                          onClick={onClick}
                        >
                          {/* Actions - positioned at top right */}
                          {actions && (
                            <div 
                              className="absolute top-4 right-4 flex-shrink-0 z-10" 
                              onClick={(e) => e.stopPropagation()}
                            >
                              {actions}
                            </div>
                          )}
                          
                          {/* Content */}
                          <div className="pr-10">
                            {/* Resource Name */}
                            <h3 className="text-lg font-semibold text-text-main mb-2">
                              {data.resourceName || "Untitled Resource"}
                            </h3>
                            
                            {/* Short Description */}
                            {data.shortDescription && (
                              <p className="text-sm text-text-soft mb-3 line-clamp-2">
                                {data.shortDescription}
                              </p>
                            )}
                            
                            {/* File Link */}
                            {data.fileUpload && (
                              <div className="flex items-center gap-2 text-sm text-primary-dark">
                                <GetIcon icon="file" className="w-4 h-4" />
                                <a
                                  href={getFileUrl(data.fileUpload)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View File
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }}
                    {...props}
                    showSearch={false}
                    showTitle={false}
                    addPrivilege={true}
                    formLayout="center"
                    delPrivilege={true}
                    updatePrivilege={true}
                    dotMenu={false}
                  />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions - Hidden on Resources tab */}
          {activeTab !== "resources" && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8 p-6 bg-bg-weak rounded-xl border-t border-stroke-soft">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-light rounded-lg">
                  <GetIcon icon="info" className="w-5 h-5 text-primary-dark" />
                </div>
                <SubPageHeader 
                  title="Profile Tips" 
                  description="Complete profile increases attendee engagement" 
                  line={false}
                  dynamicClass="text-base font-medium text-text-main"
                />
              </div>
              <div className="flex items-center gap-3">
                <FormInput type="submit" name="saveButton" value={isLoading ? "Saving..." : "Save Changes"} icon="save" disabled={isLoading} css="theme" onChange={handleSave} />
              </div>
            </div>
          )}
        </div>
      )}
    </RowContainer>
  );
}