import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getData } from "../../../../../backend/api";
import { Loader } from "lucide-react";

const CampaignInstasnap = () => {
  const { eventId, type } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        setLoading(true);
        setError(null);

        // Call the API to get the whitelisted domain URL
        const response = await getData({ eventId, type }, "whitelisted-domains/app-url");

        if (response.status === 200 && response.data?.success) {
          const { url } = response.data.data;

          if (url) {
            // Redirect to the URL
            window.location.href = url;
          } else {
            setError("No URL found for this campaign - the event may not be ready yet");
          }
        } else if (response.status === 404) {
          setError("Campaign not found - please check the link or contact the event organizer");
        } else if (response.status === 403) {
          setError("Campaign access denied - this campaign may be private or restricted");
        } else if (response.status >= 500) {
          setError("Server error - please try again later");
        } else {
          setError(response.data?.message || "Failed to fetch campaign URL - please try again");
        }
      } catch (err) {
        console.error("Campaign Instasnap error:", err);
        setError("An error occurred while fetching the campaign URL");
      } finally {
        setLoading(false);
      }
    };

    if (eventId && type) {
      fetchAndRedirect();
    } else {
      setError("Event ID and type are required");
      setLoading(false);
    }
  }, [eventId, type]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-white px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg border border-stroke-soft p-8">
            {/* Loading Icon */}
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-primary-base/10 rounded-full flex items-center justify-center">
                <Loader className="w-8 h-8 text-primary-base animate-spin" />
              </div>
            </div>

            {/* Loading Content */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-text-main mb-3">
                Loading Campaign
              </h1>
              <p className="text-text-sub mb-4">
                We're preparing your campaign experience...
              </p>
              <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-primary-base rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary-base rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-primary-base rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>

            {/* Loading Info */}
            <div className="bg-bg-weak p-3 rounded-lg">
              <p className="text-sm text-text-soft">
                This usually takes just a few seconds...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const getErrorMessage = () => {
      // Special handling for InstaSnap campaigns
      if (type === "instasnap") {
        if (error.includes("Event ID and type are required")) {
          return {
            title: "📸 InstaSnap Link Issue",
            message: "The InstaSnap link seems incomplete. Please use the complete link shared by your event organizer.",
            suggestion: "Make sure you're clicking the full InstaSnap link from your event invitation.",
            icon: "camera",
            isInstasnapError: true
          };
        } else if (error.includes("No URL found") || error.includes("not ready")) {
          return {
            title: "📷 InstaSnap Coming Soon",
            message: "InstaSnap for this event isn't ready yet, but it will be available soon!",
            suggestion: "Please check back later or contact your event organizer for the latest updates.",
            icon: "camera",
            isInstasnapError: true
          };
        } else if (error.includes("not found") || error.includes("Failed to fetch")) {
          return {
            title: "📸 InstaSnap Unavailable",
            message: "We can't find InstaSnap for this event right now.",
            suggestion: "Please verify your InstaSnap link or contact the event organizer for assistance.",
            icon: "camera",
            isInstasnapError: true
          };
        } else {
          return {
            title: "📷 InstaSnap Temporarily Unavailable",
            message: "We're having trouble loading InstaSnap right now.",
            suggestion: "Please try again in a few minutes or contact the event organizer.",
            icon: "camera",
            isInstasnapError: true
          };
        }
      }

      // Special handling for InstaRecap campaigns
      if (type === "instarecap") {
        if (error.includes("Event ID and type are required")) {
          return {
            title: "🎥 InstaRecap Link Issue",
            message: "The InstaRecap link seems incomplete. Please use the complete link shared by your event organizer.",
            suggestion: "Make sure you're clicking the full InstaRecap link from your event invitation.",
            icon: "video",
            isInstasnapError: true
          };
        } else if (error.includes("No URL found") || error.includes("not ready")) {
          return {
            title: "🎬 InstaRecap Coming Soon",
            message: "InstaRecap for this event isn't ready yet, but it will be available soon!",
            suggestion: "Please check back later or contact your event organizer for the latest updates.",
            icon: "video",
            isInstasnapError: true
          };
        } else if (error.includes("not found") || error.includes("Failed to fetch")) {
          return {
            title: "🎥 InstaRecap Unavailable",
            message: "We can't find InstaRecap for this event right now.",
            suggestion: "Please verify your InstaRecap link or contact the event organizer for assistance.",
            icon: "video",
            isInstasnapError: true
          };
        } else {
          return {
            title: "🎬 InstaRecap Temporarily Unavailable",
            message: "We're having trouble loading InstaRecap right now.",
            suggestion: "Please try again in a few minutes or contact the event organizer.",
            icon: "video",
            isInstasnapError: true
          };
        }
      }

      // Default error messages for other campaign types
      if (error.includes("Event ID and type are required")) {
        return {
          title: "Invalid Campaign Link",
          message: "The campaign link appears to be incomplete or invalid. Please check the link and try again.",
          suggestion: "Make sure you're using the complete campaign URL provided by the event organizer.",
          icon: "warning",
          isInstasnapError: false
        };
      } else if (error.includes("No URL found")) {
        return {
          title: "Campaign Not Ready",
          message: "This campaign is not yet available or has been temporarily disabled.",
          suggestion: "Please check back later or contact the event organizer for more information.",
          icon: "warning",
          isInstasnapError: false
        };
      } else if (error.includes("Failed to fetch")) {
        return {
          title: "Campaign Not Found",
          message: "We couldn't find this campaign. It may have been moved, removed, or is not yet available.",
          suggestion: "Please verify the campaign link or contact the event organizer for assistance.",
          icon: "warning",
          isInstasnapError: false
        };
      } else {
        return {
          title: "Something Went Wrong",
          message: "We're having trouble loading this campaign right now.",
          suggestion: "Please try refreshing the page or check back in a few minutes.",
          icon: "warning",
          isInstasnapError: false
        };
      }
    };

    const errorInfo = getErrorMessage();

    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-white px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg border border-stroke-soft p-8">
            {/* Error Icon */}
            <div className="mb-6">
              <div className={`mx-auto w-16 h-16 ${errorInfo.isInstasnapError ? 'bg-blue-100' : 'bg-state-error/10'} rounded-full flex items-center justify-center`}>
                {errorInfo.isInstasnapError ? (
                  errorInfo.icon === "video" ? (
                    // Video Icon for InstaRecap
                    <svg 
                      className="w-8 h-8 text-blue-600" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  ) : (
                    // Camera Icon for InstaSnap
                    <svg 
                      className="w-8 h-8 text-blue-600" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )
                ) : (
                  // Warning Icon for other campaigns
                  <svg 
                    className="w-8 h-8 text-state-error" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                )}
              </div>
            </div>

            {/* Error Content */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-text-main mb-3">
                {errorInfo.title}
              </h1>
              <p className="text-text-sub mb-4 leading-relaxed">
                {errorInfo.message}
              </p>
              <p className={`text-sm text-text-soft p-3 rounded-lg ${errorInfo.isInstasnapError ? 'bg-blue-50 border border-blue-200' : 'bg-bg-weak'}`}>
                {errorInfo.isInstasnapError ? (errorInfo.icon === "video" ? '🎥' : '📸') : '💡'} {errorInfo.suggestion}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()} 
                className={`w-full px-4 py-3 text-white rounded-lg transition-colors font-medium ${
                  errorInfo.isInstasnapError 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-primary-base hover:bg-primary-dark'
                }`}
              >
                Try Again
              </button>
              <button 
                onClick={() => window.history.back()} 
                className="w-full px-4 py-3 bg-bg-weak text-text-main rounded-lg hover:bg-bg-soft transition-colors font-medium"
              >
                Go Back
              </button>
            </div>

            {/* Support Info */}
            <div className="mt-6 pt-6 border-t border-stroke-soft">
              <p className="text-xs text-text-soft">
                {errorInfo.isInstasnapError 
                  ? (errorInfo.icon === "video" 
                      ? 'Need help with InstaRecap? Contact your event organizer for assistance.' 
                      : 'Need help with InstaSnap? Contact your event organizer for assistance.'
                    )
                  : 'Need help? Contact the event organizer or visit our support page.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // This should not be reached as we redirect on success
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-white">
      <div className="text-center">
        <p className="text-text-sub">Redirecting...</p>
      </div>
    </div>
  );
};

export default CampaignInstasnap;
