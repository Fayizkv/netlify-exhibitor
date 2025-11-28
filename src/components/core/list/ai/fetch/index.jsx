import React, { useState } from "react";
import { Button } from "../../../elements";
import { Input } from "../../../input/styles";
import { getData } from "../../../../../backend/api";
import { useToast } from "../../../toast";

const FetchAIData = (props) => {
  const {
    onChange,
    apiUrl,
    title = "Speaker Profile",
    type = "linkedin",
    placeholder = "e.g., https://linkedin.com/in/satyanadella",
    buttonText = "Generate",
    loadingText = "Generating...",
    defaultUrl = "",
    dataMapping = null,
    onSuccess = null,
    onError = null,
    clearOnSuccess = true,
    customClass = "",
    formValues,
  } = props;

  // State for AI functionality
  const [isAILoading, setIsAILoading] = useState(false); // Loading state for AI API calls
  const [isAISuccess, setIsAISuccess] = useState(false); // Success state after AI data is fetched
  const [urlInput, setUrlInput] = useState(defaultUrl); // URL input value

  // Toast for user feedback
  const toast = useToast();

  /**
   * Handle AI data fetching with comprehensive error handling
   */
  const handleAIFill = async () => {
    // Validate URL input
    if (!urlInput.trim()) {
      toast.error(`Please enter a ${type} URL.`);
      return;
    }

    setIsAILoading(true);

    try {
      // Call AI API to extract profile data from URL
      const response = await getData({ linkedinProfile: urlInput }, apiUrl);

      // Check if API response is successful
      if (response.data.success && response.data.data) {
        const profileData = response.data.data;
        profileData.urlInput = urlInput;

        // Use custom data mapping if provided, otherwise use profile data directly
        const updatedValues = dataMapping ? dataMapping(profileData) : { ...profileData };

        // Update parent form with extracted data
        onChange(updatedValues, 0, "object");

        // Clear the URL input after successful extraction if enabled
        if (clearOnSuccess) {
          setUrlInput("");
        }

        // Show success state
        setIsAISuccess(true);

        // Call success callback if provided
        if (onSuccess) {
          onSuccess(profileData, updatedValues);
        }
      } else {
        // Handle API response failure
        const errorMsg = `Failed to generate ${title}. Please try again.`;
        toast.error(errorMsg);

        if (onError) {
          onError(new Error(errorMsg), response);
        }
      }
    } catch (error) {
      // Handle different types of errors with specific messages
      let errorMessage = `Error generating ${title}. `;

      if (error.response?.status === 404) {
        errorMessage += "API endpoint not found. Please contact support.";
      } else if (error.response?.status === 500) {
        errorMessage += "Server error. Please try again later.";
      } else if (error.message?.includes("Network Error")) {
        errorMessage += "Network error. Please check your connection.";
      } else {
        errorMessage += "Please check your LinkedIn URL and try again.";
      }

      toast.error(errorMessage);

      if (onError) {
        onError(error, null);
      }
    } finally {
      setIsAILoading(false);
    }
  };

  /**
   * Handle refetch button click - reset states and allow new generation
   */
  const handleRefetch = () => {
    setIsAISuccess(false);
    setUrlInput("");
  };

  return (
    <div className={`space-y-4 ${customClass}`}>
      {/* AI-powered profile generation section */}
      <div className="bg-indigo-50 border-l-4 border-indigo-400 p-3 md:p-4 rounded-r-md">
        {!isAILoading && !isAISuccess ? (
          // Normal form state
          <>
            {/* Section header with AI icon */}
            <h3 className="text-sm md:text-base font-semibold text-text-main flex items-center gap-2">
              <span className="text-yellow-500">✨</span>
              Save time with AI
            </h3>

            {/* Instructions for users */}
            <p className="text-xs md:text-sm text-text-sub mt-1">Paste a LinkedIn profile URL to auto-fill {title.toLowerCase()} information.</p>

            {/* Input and action controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center mt-3 gap-2">
              {/* URL input field using reusable Input component */}
              <div className="flex-grow min-w-0">
                <Input type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder={placeholder} disabled={isAILoading} customClass="w-full" name="aiUrlInput" />
              </div>

              {/* Generate button using reusable Button component */}
              <Button
                ClickEvent={handleAIFill}
                isDisabled={isAILoading || !urlInput.trim()}
                value={
                  <div className="flex items-center justify-center gap-2">
                    <span>{buttonText}</span>
                  </div>
                }
                className="bg-primary-base hover:bg-primary-dark text-white px-3 py-2 rounded-md text-xs md:text-sm font-medium flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              ></Button>
            </div>
          </>
        ) : isAILoading ? (
          // AI Generation Animation State
          <div className="flex flex-col items-center justify-center py-3">
            {/* AI Brain Animation */}
            <div className="relative mb-3">
              {/* Outer rotating ring */}
              <div className="w-10 h-10 border-2 border-blue-200 rounded-full animate-spin">
                <div className="w-full h-full border-2 border-transparent border-t-blue-500 rounded-full"></div>
              </div>

              {/* Inner pulsing brain */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full animate-pulse flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
              </div>

              {/* Floating particles */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-300 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.5s" }}></div>
              <div className="absolute top-1 -left-2 w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "1s" }}></div>
            </div>

            {/* Generation status text with typing animation */}
            <div className="text-center">
              <h3 className="text-sm font-semibold text-text-main mb-1">AI is working...</h3>
              <p className="text-xs text-text-sub">
                <span className="inline-block animate-pulse">Analyzing profile</span>
                <span className="inline-block animate-pulse" style={{ animationDelay: "0.3s" }}>
                  .
                </span>
                <span className="inline-block animate-pulse" style={{ animationDelay: "0.6s" }}>
                  .
                </span>
                <span className="inline-block animate-pulse" style={{ animationDelay: "0.9s" }}>
                  .
                </span>
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-40 mt-2">
              <div className="h-1 bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        ) : (
          // AI Success State
          <div className="flex flex-col items-center justify-center py-3">
            {/* Success checkmark animation */}
            <div className="relative mb-3">
              {/* Success circle with checkmark */}
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  {/* Checkmark SVG */}
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* Success particles */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
              <div className="absolute top-1 -left-2 w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0.6s" }}></div>
            </div>

            {/* Refetch button */}
            <Button
              ClickEvent={handleRefetch}
              value={
                <div className="flex items-center justify-center gap-2">
                  <span>Regenerate</span>
                </div>
              }
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-xs md:text-sm font-medium flex items-center justify-center gap-2"
            ></Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FetchAIData;
