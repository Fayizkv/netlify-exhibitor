import React, { useState, useEffect } from "react";
import { getData } from "../../../../backend/api";
import { GetAccessToken } from "../../../../backend/authentication";
import { SubPageHeader } from "../../../core/input/heading";
import { Button } from "../../../core/elements";
import FormInput from "../../../core/input";

// Custom Shimmer Component for Integrations Page
const IntegrationsShimmer = () => (
  <div className="bg-background p-6 font-sans">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Analytics Section Shimmer */}
          <div className="relative">
            <div className="animate-pulse">
              <div className="h-6 w-20 bg-gray-200 rounded mb-2"></div>
            </div>
            <div className="notched-card p-6 border border-subtle-border mt-2">
              <div className="flex items-start mb-4">
                <div className="animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
                </div>
                <div className="flex-1">
                  <div className="animate-pulse">
                    <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-80 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="animate-pulse">
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                    <div className="h-12 w-full bg-gray-200 rounded"></div>
                    <div className="h-3 w-96 bg-gray-200 rounded mt-2"></div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-accent-light rounded-lg">
                  <div className="animate-pulse">
                    <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-4 w-64 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Facebook Pixel Section Shimmer */}
          <div className="relative">
            <div className="animate-pulse">
              <div className="h-6 w-24 bg-gray-200 rounded mb-2"></div>
            </div>
            <div className="notched-card p-6 border border-subtle-border mt-2">
              <div className="flex items-start mb-4">
                <div className="animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
                </div>
                <div className="flex-1">
                  <div className="animate-pulse">
                    <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-80 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="animate-pulse">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                    <div className="h-12 w-full bg-gray-200 rounded"></div>
                    <div className="space-y-2 mt-2">
                      <div className="h-3 w-80 bg-gray-200 rounded"></div>
                      <div className="h-16 w-full bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-accent-light rounded-lg">
                  <div className="animate-pulse">
                    <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-4 w-72 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button Shimmer */}
          <div className="pt-6 space-y-4">
            <div className="animate-pulse">
              <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const IntegrationsPage = (props) => {
  const eventId = props.openData?.data?._id;
  const [formData, setFormData] = useState({
    trackingId: "",
    pixelId: "",
  });
  const [eventWebsite, setEventWebsite] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Fetch existing eventWebsite data on component mount
  useEffect(() => {
    if (!eventId) {
      return;
    }

    setDataLoaded(false);

    getData({ event: eventId }, "event-website")
      .then((result) => {
        if (result.status === 200 && result.data?.data) {
          const websiteData = result.data.data;
          setEventWebsite(websiteData);

          // Populate form with existing data
          const newFormData = {
            trackingId: websiteData.trackingId || "",
            pixelId: websiteData.pixelId ? websiteData.pixelId.toString() : "",
          };

          setFormData(newFormData);
          setDataLoaded(true);
        } else {
          setEventWebsite(null);
          setDataLoaded(true);
        }
      })
      .catch((error) => {
        setEventWebsite(null);
        setDataLoaded(true);
      });
  }, [eventId]);

  // Listen for updates from other components
  useEffect(() => {
    const handleLayoutUpdate = (event) => {
      if (event.detail?.eventWebsiteId === eventWebsite?._id) {
        getData({ event: eventId }, "event-website")
          .then((result) => {
            if (result.status === 200 && result.data?.data) {
              const websiteData = result.data.data;
              setEventWebsite(websiteData);
              setFormData({
                trackingId: websiteData.trackingId || "",
                pixelId: websiteData.pixelId ? websiteData.pixelId.toString() : "",
              });
            }
          })
          .catch((err) => {});
      }
    };

    const handleMenuUpdate = (event) => {
      if (event.detail?.eventWebsiteId === eventWebsite?._id) {
        getData({ event: eventId }, "event-website")
          .then((result) => {
            if (result.status === 200 && result.data?.data) {
              const websiteData = result.data.data;
              setEventWebsite(websiteData);
              setFormData({
                trackingId: websiteData.trackingId || "",
                pixelId: websiteData.pixelId ? websiteData.pixelId.toString() : "",
              });
            }
          })
          .catch((err) => {});
      }
    };

    window.addEventListener("layoutUpdated", handleLayoutUpdate);
    window.addEventListener("menuUpdated", handleMenuUpdate);

    return () => {
      window.removeEventListener("layoutUpdated", handleLayoutUpdate);
      window.removeEventListener("menuUpdated", handleMenuUpdate);
    };
  }, [eventId, eventWebsite?._id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validate input based on field type
    if (name === "pixelId") {
      // Only allow numbers for Pixel ID
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    const errors = [];

    // Validate Tracking ID (Google Analytics)
    if (formData.trackingId && !formData.trackingId.match(/^(UA-|G-|GTM-)[A-Z0-9-]+$/)) {
      errors.push("Invalid Google Analytics Tracking ID format. Use UA-XXXXXXXXX-X, G-XXXXXXXXXX, or GTM-XXXXXXX");
    }

    // Validate Pixel ID (Facebook)
    if (formData.pixelId && formData.pixelId.length < 10) {
      errors.push("Facebook Pixel ID must be at least 10 digits");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      if (props.setMessage) {
        props.setMessage({
          content: validationErrors.join(", "),
          type: 0,
          icon: "error",
        });
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare payload - preserve existing data
      const payload = {
        // Preserve existing layout content
        title: String(eventWebsite?.title || ""),
        subtitle: String(eventWebsite?.subtitle || ""),
        button: {
          show: Boolean(eventWebsite?.button?.show !== false),
          text: String(eventWebsite?.button?.text || "Register Now"),
          link: String(eventWebsite?.button?.link || ""),
        },
        // Preserve existing modules and menus
        modules: eventWebsite?.modules || [],
        menus: eventWebsite?.menus || [],
        event: String(eventId),
        // Update integration fields
        trackingId: String(formData.trackingId || ""),
        pixelId: formData.pixelId ? Number(formData.pixelId) : 0,
      };

      let response;
      if (eventWebsite && eventWebsite._id) {
        // Update existing eventWebsite
        response = await fetch(`${import.meta.env.VITE_API}event-website/${eventWebsite._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + GetAccessToken(),
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new eventWebsite
        response = await fetch(`${import.meta.env.VITE_API}event-website`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + GetAccessToken(),
          },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();

      if (response.ok) {
        // Update local state
        let eventWebsiteData;
        if (result.data && result.data.data) {
          eventWebsiteData = result.data.data;
        } else if (result.data && result.data._id) {
          eventWebsiteData = result.data;
        } else {
          eventWebsiteData = result.data;
        }

        setEventWebsite(eventWebsiteData);

        // Show success message
        if (props.setMessage) {
          props.setMessage({
            content: "Integrations saved successfully!",
            type: 1,
            icon: "success",
          });
        }

        // Dispatch integration update event to notify other components
        const integrationUpdateEvent = new CustomEvent("integrationUpdated", {
          detail: {
            eventWebsiteId: eventWebsiteData._id,
            trackingId: formData.trackingId,
            pixelId: formData.pixelId,
          },
        });
        window.dispatchEvent(integrationUpdateEvent);
      } else {
        const errorMessage = result.message || `API returned error status (${response.status})`;
        setError(errorMessage);

        if (props.setMessage) {
          props.setMessage({
            content: `Failed to save integrations: ${errorMessage}`,
            type: 0,
            icon: "error",
          });
        }
      }
    } catch (error) {
      const errorMessage = "Network error while saving integrations";
      setError(errorMessage);

      if (props.setMessage) {
        props.setMessage({
          content: errorMessage,
          type: 0,
          icon: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while data is being fetched
  if (!dataLoaded) {
    return <IntegrationsShimmer />;
  }

  return (
    <div className="bg-background p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Google Analytics */}
              <div className="relative">
                <div className="tag-enhanced">Analytics</div>
                <div className="notched-card p-6 border border-subtle-border mt-2">
                  <div className="flex items-start mb-4">
                    <div className="integration-icon bg-blue-50">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 18V8h4v10H4zM10 18V4h4v14h-4zM16 18v-6h4v6h-4z" fill="rgb(55, 93, 251)" stroke="rgb(55, 93, 251)" strokeWidth="1.5" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      {/* <h3 className="text-design-h3 font-semibold text-primary-text">Google Analytics</h3>
                      <p className="text-design-body text-secondary-text mt-1">Monitor website traffic, user behavior, and conversion metrics.</p> */}
                      <SubPageHeader title="Google Analytics" line={false} description="Monitor website traffic, user behavior, and conversion metrics." />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <FormInput
                        type="text"
                        name="trackingId"
                        label="Tracking ID"
                        placeholder="UA-XXXXXXXXX-X or G-XXXXXXXXXX"
                        value={formData.trackingId}
                        onChange={handleInputChange}
                        info={"Find this in your Google Analytics account under Admin → Property → Data Streams."}
                      />
                    </div>

                    <div className="flex items-center p-3 bg-accent-light rounded-lg">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                        <path d="M8 1C4.1 1 1 4.1 1 8s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm0 13c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" fill="rgb(55, 93, 251)" />
                        <path d="M8.5 4h-1v5l4.2 2.5.8-1.3L9 8V4z" fill="rgb(55, 93, 251)" />
                      </svg>
                      <span className="text-design-label text-accent">Analytics will be active within 24 hours of setup</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Facebook Pixel */}
              <div className="relative">
                <div className="tag-enhanced">Marketing</div>
                <div className="notched-card p-6 border border-subtle-border mt-2">
                  <div className="flex items-start mb-4">
                    <div className="integration-icon bg-blue-50">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                          fill="rgb(55, 93, 251)"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-design-h3 font-semibold text-primary-text">Meta Pixel (Facebook)</h3>
                      <p className="text-design-body text-secondary-text mt-1">Track conversions, optimize ads, and build targeted audiences.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <FormInput type="text" name="pixelId" label="Pixel ID (Numbers Only)" placeholder="714817277989488" value={formData.pixelId} onChange={handleInputChange} />
                      <div className="mt-2 space-y-2">
                        <p className="text-design-label text-secondary-text">Enter only the numeric Pixel ID, not the entire code.</p>
                        <div className="code-example rounded">
                          <strong>From your code:</strong> fbq('init', '<span className="text-accent font-semibold">714817277989488</span>');
                          <br />
                          <strong>Enter this:</strong> <span className="text-accent font-semibold">714817277989488</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center p-3 bg-accent-light rounded-lg">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                        <path d="M8 1C4.1 1 1 4.1 1 8s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm0 13c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" fill="rgb(55, 93, 251)" />
                        <path d="M8.5 4h-1v5l4.2 2.5.8-1.3L9 8V4z" fill="rgb(55, 93, 251)" />
                      </svg>
                      <span className="text-design-label text-accent">Pixel tracking begins immediately after activation</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-red-800 text-sm font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-6 space-y-4">
                {/* Primary Save Button */}
                <Button value={loading ? "Saving Integrations..." : "Save Integrations"} ClickEvent={handleSubmit} isDisabled={loading} type="primary" align="center" />
              </div>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        .notched-card {
          border-radius: 16px;
          position: relative;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          background: #ffffff;
          transition: all 0.2s ease;
        }

        .notched-card:hover {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .notched-card::before {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 24px;
          height: 24px;
          background: #ffffff;
          border-bottom-left-radius: 16px;
          z-index: 1;
        }

        .integration-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
        }

        .input-enhanced {
          transition: all 0.2s ease;
          border: 2px solid #f3f4f6;
        }

        .input-enhanced:focus {
          border-color: rgb(55, 93, 251);
          box-shadow: 0 0 0 3px rgba(55, 93, 251, 0.1);
        }

        .tag-enhanced {
          position: absolute;
          top: -8px;
          right: 16px;
          background: #f3f4f6;
          border-radius: 12px;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 500;
          color: #6b7280;
          z-index: 2;
        }

        .code-example {
          background: #f8f9fa;
          border-left: 3px solid #6b7280;
          padding: 8px 12px;
          font-family: "Monaco", "Menlo", monospace;
          font-size: 12px;
          color: #374151;
        }
      `}</style>
    </div>
  );
};

export default IntegrationsPage;
