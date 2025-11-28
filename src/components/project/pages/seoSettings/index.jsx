import React, { useState, useEffect } from "react";
import { getData, putData, postData } from "../../../../backend/api";
import { SubPageHeader } from "../../../core/input/heading";
import { Button } from "../../../core/elements";

// Helper to resolve image URL for preview
function getImageUrl(path) {
  if (!path) return "";
  if (typeof path === "string" && (path.startsWith("http") || path.startsWith("data:"))) return path;
  if (typeof path === "object" && path instanceof File) {
    // For new uploads, show a preview using a blob URL
    return URL.createObjectURL(path);
  }
  // Assume CDN or static path for backend relative paths
  if (typeof path === "string") {
    return `https://event-manager.syd1.cdn.digitaloceanspaces.com/${path.replace(/^\/+/, "")}`;
  }
  return "";
}

// Helper to extract domain from URL
function getDomain(url) {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
}

// Add a generic ImageUpload component for image fields
function ImageUpload({ label, value, onChange, accept = ".jpg,.jpeg,.png,.gif,.webp", helpText = "PNG, JPG, GIF up to 5MB" }) {
  const [previewUrl, setPreviewUrl] = React.useState("");

  React.useEffect(() => {
    if (!value) {
      setPreviewUrl("");
      return;
    }
    if (typeof value === "object" && value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof value === "string") {
      setPreviewUrl(getImageUrl(value));
    }
  }, [value]);

  return (
    <div>
      <label className="block text-sm font-medium text-text-main mb-2">{label}</label>
      <div className="flex flex-col items-center border-2 border-dashed border-stroke-soft rounded-md p-4 bg-bg-white">
        {previewUrl ? (
          <div className="relative inline-block">
            <img src={previewUrl} alt="Preview" className="object-contain max-h-40 mb-2 rounded" style={{ maxWidth: "100%" }} />
            <button type="button" className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-white bg-opacity-80 rounded-full p-1" title="Delete" onClick={() => onChange(null)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"
                />
              </svg>
            </button>
          </div>
        ) : (
          <>
            <label className="cursor-pointer text-builder-primary hover:text-builder-primary-hover font-medium">
              <span>+ Choose file</span>
              <input type="file" className="sr-only" accept={accept} onChange={(e) => onChange(e.target.files[0])} />
            </label>
            <p className="text-xs text-text-soft mt-2">{helpText}</p>
          </>
        )}
      </div>
    </div>
  );
}

// Custom Shimmer Component for SEO Settings
const SeoSettingsShimmer = () => (
  <div className="bg-white text-text-main font-sans">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-5">
        {/* Left Column: Settings with Tabs (3/5 width) */}
        <div className="p-6 border-r border-stroke-soft lg:col-span-3">
          <div id="settings-tabs">
            {/* Tab Headers Shimmer */}
            <div className="border-b border-stroke-soft">
              <div className="flex space-x-8">
                <div className="animate-pulse">
                  <div className="h-10 w-24 bg-bg-soft rounded"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-10 w-32 bg-bg-soft rounded"></div>
                </div>
              </div>
            </div>

            {/* Tab Content Shimmer */}
            <div className="pt-6 space-y-6">
              {/* Section Title */}
              <div className="space-y-2">
                <div className="animate-pulse">
                  <div className="h-6 w-48 bg-bg-soft rounded"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-4 w-64 bg-bg-soft rounded"></div>
                </div>
              </div>

              {/* Form Fields Shimmer */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="animate-pulse">
                    <div className="h-4 w-24 bg-bg-soft rounded mb-2"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-10 w-full bg-bg-soft rounded"></div>
                  </div>
                  {i === 2 && (
                    <div className="animate-pulse">
                      <div className="h-3 w-80 bg-bg-soft rounded"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Previews (2/5 width) */}
        <div className="p-6 bg-bg-white lg:col-span-2">
          {/* Preview Header */}
          <div className="space-y-2 mb-6">
            <div className="animate-pulse">
              <div className="h-6 w-32 bg-bg-soft rounded"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 w-48 bg-bg-soft rounded"></div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Google Search Preview Shimmer */}
            <div>
              <div className="animate-pulse mb-3">
                <div className="h-6 w-32 bg-bg-soft rounded"></div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-stroke-soft shadow-sm space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse">
                    <div className="w-5 h-5 bg-bg-soft rounded"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-4 w-32 bg-bg-soft rounded"></div>
                  </div>
                </div>
                <div className="animate-pulse">
                  <div className="h-6 w-64 bg-bg-soft rounded"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-4 w-full bg-bg-soft rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SeoSettings = (props) => {
  const [formData, setFormData] = useState({
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    metaRobots: "index, follow",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    twitterTitle: "",
    twitterDescription: "",
    ogImage: null,
    twitterImage: null,
  });
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [websiteSettings, setWebsiteSettings] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const eventId = props.openData?.data?._id;

  useEffect(() => {
    if (!eventId) return;

    setLoading(true);
    setError(null);
    setDataLoaded(false);

    getData({ event: eventId }, "website-settings")
      .then((result) => {
        const settingsData = result.data?.data || (Array.isArray(result.data?.response) ? result.data.response[0] : null);

        if (result.status === 200 && settingsData) {
          setWebsiteSettings(settingsData);

          setFormData({
            metaTitle: settingsData.meta_title || "My Awesome Event | Conference 2025",
            metaDescription: settingsData.meta_description || "Join us for the leading conference in the industry! My Awesome Event brings together experts from around the world.",
            metaKeywords: settingsData.meta_keywords || "conference, event, networking, technology",
            metaRobots: settingsData.meta_robots || "index, follow",
            canonicalUrl: settingsData.canonical_url || "",
            ogTitle: settingsData.og_title || "My Awesome Event | Conference 2025",
            ogDescription: settingsData.og_description || "Join us for the leading conference in the industry!",
            twitterTitle: settingsData.twitter_title || "My Awesome Event | Conference 2025",
            twitterDescription: settingsData.twitter_description || "Join us for the leading conference!",
            ogImage: settingsData.og_image || null,
            twitterImage: settingsData.twitter_image || null,
          });
        } else {
          // Set default values if no data exists
          setFormData({
            metaTitle: "My Awesome Event | Conference 2025",
            metaDescription: "Join us for the leading conference in the industry! My Awesome Event brings together experts from around the world.",
            metaKeywords: "conference, event, networking, technology",
            metaRobots: "index, follow",
            canonicalUrl: "",
            ogTitle: "My Awesome Event | Conference 2025",
            ogDescription: "Join us for the leading conference in the industry!",
            twitterTitle: "My Awesome Event | Conference 2025",
            twitterDescription: "Join us for the leading conference!",
            ogImage: null,
            twitterImage: null,
          });
        }

        setDataLoaded(true);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load website settings data");

        // Set default values on error
        setFormData({
          metaTitle: "My Awesome Event | Conference 2025",
          metaDescription: "Join us for the leading conference in the industry! My Awesome Event brings together experts from around the world.",
          metaKeywords: "conference, event, networking, technology",
          metaRobots: "index, follow",
          canonicalUrl: "",
          ogTitle: "My Awesome Event | Conference 2025",
          ogDescription: "Join us for the leading conference in the industry!",
          twitterTitle: "My Awesome Event | Conference 2025",
          twitterDescription: "Join us for the leading conference!",
          ogImage: null,
          twitterImage: null,
        });

        setDataLoaded(true);
        setLoading(false);
      });
  }, [eventId]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle file uploads
  const handleFileUpload = (field, file) => {
    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!eventId) {
      return;
    }

    setLoading(true);
    setError(null);

    // Create the payload
    const payload = {
      event: String(eventId),
      meta_title: String(formData.metaTitle || ""),
      meta_description: String(formData.metaDescription || ""),
      meta_keywords: String(formData.metaKeywords || ""),
      meta_robots: String(formData.metaRobots || "index, follow"),
      canonical_url: String(formData.canonicalUrl || ""),
      og_title: String(formData.ogTitle || ""),
      og_description: String(formData.ogDescription || ""),
      twitter_title: String(formData.twitterTitle || ""),
      twitter_description: String(formData.twitterDescription || ""),
      og_image: formData.ogImage || null,
      twitter_image: formData.twitterImage || null,
    };

    try {
      let result;

      if (websiteSettings && websiteSettings._id) {
        // Try PUT first if we have an existing document

        result = await putData(payload, `website-settings/${websiteSettings._id}`);

        // Check if PUT returned an error status (like 404)
        if (result.status === 404) {
          result = await postData(payload, "website-settings");
        } else if (result.status !== 200 && result.status !== 201) {
          // Handle other error statuses
          let backendMsg = result.data?.message || result.message || `API returned error status (${result.status})`;
          setError(backendMsg);
          throw new Error(backendMsg);
        }
      } else {
        // No existing document, use POST
        result = await postData(payload, "website-settings");
      }

      if (result.status !== 200 && result.status !== 201) {
        let backendMsg = result.data?.message || result.message || `API returned error status (${result.status})`;
        setError(backendMsg);
        throw new Error(backendMsg);
      }

      // Handle different response structures
      let settingsData;
      if (result.data && result.data.data) {
        settingsData = result.data.data;
      } else if (result.data && result.data._id) {
        settingsData = result.data;
      } else {
        settingsData = result.data;
      }

      setWebsiteSettings(settingsData);
      setLoading(false);

      // Show success message
      if (props.setMessage) {
        props.setMessage({
          content: "Website settings updated successfully!",
          type: 1,
          icon: "success",
        });
      }
    } catch (err) {
      setLoading(false);

      // Extract meaningful error message
      let errorMessage = "Failed to update website settings";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);

      // Show detailed error to user
      if (err.response?.data?.errors) {
        const errorDetails = err.response.data.errors.map((e) => `${e.field}: ${e.message}`).join("\n");
        alert(`Update failed:\n${errorDetails}`);
      } else {
        alert(`Update failed: ${errorMessage}`);
      }
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Show loading state
  if (loading && !dataLoaded) {
    return <SeoSettingsShimmer />;
  }

  return (
    <div className="bg-white text-text-main font-sans">
      {/* Header */}
      {/* <header className="bg-white border-b border-stroke-soft px-6 py-4 sticky top-0 z-30">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-xl font-semibold text-text-main">SEO Settings</h1>
          <button onClick={handleSaveChanges} disabled={loading} className="px-5 py-2 text-sm font-medium text-white bg-builder-primary rounded-md hover:bg-builder-primary-hover shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </header> */}

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="text-red-500 p-4 bg-red-50 border border-red-200 rounded-lg">{error}</div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5">
          {/* Left Column: Settings with Tabs (3/5 width) */}
          <div className="p-6 border-r border-stroke-soft lg:col-span-3">
            <div id="settings-tabs">
              {/* Tab Headers */}
              <div className="border-b border-stroke-soft">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <button
                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "general" ? "border-builder-primary text-builder-primary font-semibold" : "border-transparent text-text-soft hover:text-builder-primary"}`}
                    onClick={() => handleTabChange("general")}
                  >
                    General SEO
                  </button>
                  <button
                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "social" ? "border-builder-primary text-builder-primary font-semibold" : "border-transparent text-text-soft hover:text-builder-primary"}`}
                    onClick={() => handleTabChange("social")}
                  >
                    Social Sharing
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="pt-6">
                {/* General SEO Tab */}
                {activeTab === "general" && (
                  <div className="space-y-6">
                    <SubPageHeader title="Search Engine Listing" line={false} description="How your page will appear on Google." />
                    <div>
                      <label htmlFor="meta-title" className="block text-sm font-medium text-text-main mb-2">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        id="meta-title"
                        className="w-full border border-stroke-soft rounded-md px-3 py-2 text-sm text-text-main bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-builder-primary focus:border-builder-primary transition-colors"
                        placeholder="Page Title"
                        value={formData.metaTitle}
                        onChange={(e) => handleInputChange("metaTitle", e.target.value)}
                        maxLength={60}
                      />
                    </div>
                    <div>
                      <label htmlFor="meta-description" className="block text-sm font-medium text-text-main mb-2">
                        Meta Description
                      </label>
                      <textarea
                        id="meta-description"
                        rows={4}
                        className="w-full border border-stroke-soft rounded-md px-3 py-2 text-sm text-text-main bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-builder-primary focus:border-builder-primary transition-colors"
                        placeholder="A brief summary of the page"
                        value={formData.metaDescription}
                        onChange={(e) => handleInputChange("metaDescription", e.target.value)}
                        maxLength={160}
                      />
                      <p className="text-xs text-text-soft mt-1.5">Keep your description between 50-160 characters for best results.</p>
                    </div>
                    <div>
                      <label htmlFor="meta-keywords" className="block text-sm font-medium text-text-main mb-2">
                        Meta Keywords
                      </label>
                      <input
                        type="text"
                        id="meta-keywords"
                        className="w-full border border-stroke-soft rounded-md px-3 py-2 text-sm text-text-main bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-builder-primary focus:border-builder-primary transition-colors"
                        placeholder="event, conference, networking, technology"
                        value={formData.metaKeywords}
                        onChange={(e) => handleInputChange("metaKeywords", e.target.value)}
                      />
                      <p className="text-xs text-text-soft mt-1.5">Separate keywords with commas.</p>
                    </div>
                    {/* <div>
                      <label htmlFor="meta-robots" className="block text-sm font-medium text-text-main mb-2">
                        Meta Robots
                      </label>
                      <select id="meta-robots" className="w-full border border-stroke-soft rounded-md px-3 py-2 text-sm text-text-main bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-builder-primary focus:border-builder-primary transition-colors" value={formData.metaRobots} onChange={(e) => handleInputChange("metaRobots", e.target.value)}>
                        <option value="index, follow">index, follow</option>
                        <option value="noindex, follow">noindex, follow</option>
                        <option value="index, nofollow">index, nofollow</option>
                        <option value="noindex, nofollow">noindex, nofollow</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="canonical-url" className="block text-sm font-medium text-text-main mb-2">
                        Canonical URL
                      </label>
                      <input type="url" id="canonical-url" className="w-full border border-stroke-soft rounded-md px-3 py-2 text-sm text-text-main bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-builder-primary focus:border-builder-primary transition-colors" placeholder="https://my-awesome-event.com" value={formData.canonicalUrl} onChange={(e) => handleInputChange("canonicalUrl", e.target.value)} />
                    </div> */}
                  </div>
                )}

                {/* Social Sharing Tab */}
                {activeTab === "social" && (
                  <div className="space-y-4">
                    {/* Facebook (Open Graph) */}
                    <div className="border border-stroke-soft rounded-lg">
                      <details className="group" open>
                        <summary className="font-semibold text-text-main cursor-pointer list-none flex justify-between items-center p-4 text-base">
                          Facebook (Open Graph)
                          <svg className="w-5 h-5 transition-transform duration-300 group-open:rotate-180 text-icon-sub" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </summary>
                        <div className="border-t border-stroke-soft p-4 space-y-4">
                          <div>
                            <label htmlFor="og-title" className="block text-sm font-medium text-text-main mb-2">
                              OG Title
                            </label>
                            <input
                              type="text"
                              id="og-title"
                              className="w-full border border-stroke-soft rounded-md px-3 py-2 text-sm text-text-main bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-builder-primary focus:border-builder-primary transition-colors"
                              placeholder="Facebook Title"
                              value={formData.ogTitle}
                              onChange={(e) => handleInputChange("ogTitle", e.target.value)}
                            />
                          </div>
                          <div>
                            <label htmlFor="og-description" className="block text-sm font-medium text-text-main mb-2">
                              OG Description
                            </label>
                            <textarea
                              id="og-description"
                              rows={3}
                              className="w-full border border-stroke-soft rounded-md px-3 py-2 text-sm text-text-main bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-builder-primary focus:border-builder-primary transition-colors"
                              placeholder="Facebook Description"
                              value={formData.ogDescription}
                              onChange={(e) => handleInputChange("ogDescription", e.target.value)}
                            />
                          </div>
                          <ImageUpload
                            label="OG Image"
                            value={formData.ogImage}
                            onChange={(file) => handleFileUpload("ogImage", file)}
                            accept=".jpg,.jpeg,.png,.gif,.webp"
                            helpText="PNG, JPG, GIF up to 5MB"
                          />
                        </div>
                      </details>
                    </div>

                    {/* Twitter Card */}
                    <div className="border border-stroke-soft rounded-lg">
                      <details className="group">
                        <summary className="font-semibold text-text-main cursor-pointer list-none flex justify-between items-center p-4 text-base">
                          Twitter Card
                          <svg className="w-5 h-5 transition-transform duration-300 group-open:rotate-180 text-icon-sub" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </summary>
                        <div className="border-t border-stroke-soft p-4 space-y-4">
                          <div>
                            <label htmlFor="twitter-title" className="block text-sm font-medium text-text-main mb-2">
                              Twitter Title
                            </label>
                            <input
                              type="text"
                              id="twitter-title"
                              className="w-full border border-stroke-soft rounded-md px-3 py-2 text-sm text-text-main bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-builder-primary focus:border-builder-primary transition-colors"
                              placeholder="Twitter Title"
                              value={formData.twitterTitle}
                              onChange={(e) => handleInputChange("twitterTitle", e.target.value)}
                            />
                          </div>
                          <div>
                            <label htmlFor="twitter-description" className="block text-sm font-medium text-text-main mb-2">
                              Twitter Description
                            </label>
                            <textarea
                              id="twitter-description"
                              rows={3}
                              className="w-full border border-stroke-soft rounded-md px-3 py-2 text-sm text-text-main bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-builder-primary focus:border-builder-primary transition-colors"
                              placeholder="Twitter Description"
                              value={formData.twitterDescription}
                              onChange={(e) => handleInputChange("twitterDescription", e.target.value)}
                            />
                          </div>
                          <ImageUpload
                            label="Twitter Image"
                            value={formData.twitterImage}
                            onChange={(file) => handleFileUpload("twitterImage", file)}
                            accept=".jpg,.jpeg,.png,.gif,.webp"
                            helpText="PNG, JPG, GIF up to 5MB"
                          />
                        </div>
                      </details>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Previews (2/5 width) */}
          <div className="p-6 bg-bg-white lg:col-span-2">
            <SubPageHeader title="Live Preview" line={false} description="See how your page will look." />

            <div className="space-y-8">
              {/* Google Search Preview */}
              {activeTab === "general" && (
                <div id="preview-google">
                  <SubPageHeader title="Google Search" line={false} />
                  <div className="p-4 bg-white rounded-lg border border-stroke-soft shadow-sm">
                    <div className="flex items-center space-x-2">
                      <img src="https://www.google.com/s2/favicons?domain=google.com&sz=64" alt="Favicon" className="w-5 h-5" />
                      <div>
                        <p className="text-sm text-text-main truncate">{getDomain(formData.canonicalUrl) || "your-domain.com"}</p>
                        <p className="text-xs text-green-600 truncate">{formData.canonicalUrl || "https://your-domain.com"}</p>
                      </div>
                    </div>
                    <SubPageHeader
                      dynamicClass="text-blue-600"
                      title={formData.metaTitle || "Your Page Title"}
                      line={false}
                      description={formData.metaDescription || "A description of your page will be shown here."}
                    />
                  </div>
                </div>
              )}

              {/* Social Sharing Previews */}
              {activeTab === "social" && (
                <div id="preview-social" className="space-y-8">
                  {/* Facebook Preview */}
                  <div>
                    <SubPageHeader title="Facebook Post" line={false} />
                    <div className="bg-white rounded-lg border border-stroke-soft shadow-sm overflow-hidden">
                      <div className="aspect-video bg-bg-weak flex items-center justify-center text-text-soft">
                        {formData.ogImage ? (
                          <img src={getImageUrl(formData.ogImage)} alt="OG Preview" className="object-contain w-full h-full" style={{ maxHeight: "100%", maxWidth: "100%" }} />
                        ) : (
                          "Image Preview (1200×630)"
                        )}
                      </div>
                      <div className="p-4 bg-white">
                        {/* <h4 className="text-base font-bold text-text-main mt-1 truncate">{formData.ogTitle || "Your Facebook Title"}</h4>
                        <p className="text-sm text-text-soft mt-1 text-ellipsis overflow-hidden" style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
                          {formData.ogDescription || "Your Facebook description"}
                        </p> */}
                        <SubPageHeader title={formData.ogTitle || "Your Facebook Title"} line={false} description={formData.ogDescription || "Your Facebook description"} />
                      </div>
                    </div>
                  </div>

                  {/* Twitter Preview */}
                  <div>
                    <SubPageHeader title="Twitter Card" line={false} />
                    <div className="bg-white rounded-lg border border-stroke-soft shadow-sm overflow-hidden">
                      <div className="aspect-video bg-bg-weak flex items-center justify-center text-text-soft">
                        {formData.twitterImage ? (
                          <img src={getImageUrl(formData.twitterImage)} alt="Twitter Preview" className="object-contain w-full h-full" style={{ maxHeight: "100%", maxWidth: "100%" }} />
                        ) : (
                          "Image Preview (1200×600)"
                        )}
                      </div>
                      <div className="p-3">
                        {/* <h4 className="text-sm font-bold text-text-main truncate">{formData.twitterTitle || "Your Twitter Title"}</h4>
                        <p className="text-sm text-text-soft mt-0.5 text-ellipsis overflow-hidden" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {formData.twitterDescription || "Your Twitter description"}
                        </p> */}
                        <SubPageHeader title={formData.twitterTitle || "Your Twitter Title"} line={false} description={formData.twitterDescription || "Your Twitter description"} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <Button value={loading ? "Saving..." : "Save Changes"} ClickEvent={handleSaveChanges} isDisabled={loading} type="primary" align="center" />
        </div>
      </main>
    </div>
  );
};

export default SeoSettings;
