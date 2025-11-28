import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const API_BASE_URL = import.meta.env.VITE_INSTARECAP_API || "https://instarecap-app.ambitiousforest-1ab41110.centralindia.azurecontainerapps.io/api";

const POLLING_INTERVAL = 20000; // 20 seconds
const POLLING_STATUSES = ["queued", "converting", "converted", "transcribing", "tanslating", "summarizing"];
const MAX_SAME_STATUS_COUNT = 3; // Stop after 3 same status checks

const UploadAudio = (props) => {
  console.log(props, "props");
  const [mode, setMode] = useState("upload");
  const [audioFile, setAudioFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const timerRef = useRef(null);
  const { title, _id } = props.data;
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const cancelTokenRef = useRef(null);
  const [forceReplace, setForceReplace] = useState(false);
  const [audioStatus, setAudioStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("summary");
  const [regenerating, setRegenerating] = useState({});
  const pollingIntervalRef = useRef(null);
  const [sameStatusCount, setSameStatusCount] = useState(0);
  const [lastStatus, setLastStatus] = useState(null);
  const [lastProgress, setLastProgress] = useState(null);
  const [isPollingPaused, setIsPollingPaused] = useState(false);
  const lastApiCallTimeRef = useRef(null);
  const MIN_API_INTERVAL = 5000; // Minimum 5 seconds between API calls
  const [isTranscriptEditing, setIsTranscriptEditing] = useState(false);
  const [editedTranscription, setEditedTranscription] = useState("");
  const [transcriptionProgress, setTranscriptionProgress] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [defaultLanguageAudio, setDefaultLanguageAudio] = useState(null);
  const [audioId, setAudioId] = useState(null);

  const checkAudioStatus = useCallback(async () => {
    // Check if we should skip this API call
    if (isPollingPaused) return;

    // Implement rate limiting
    const now = Date.now();
    if (lastApiCallTimeRef.current && now - lastApiCallTimeRef.current < MIN_API_INTERVAL) {
      return;
    }

    try {
      lastApiCallTimeRef.current = now;
      setIsPollingPaused(true);

      let response;
      console.log(props.selectedAudio, "props.selectedAudio");
      if (props.selectedAudio) {
        response = await axios.get(`${API_BASE_URL}/session?audioId=${props.selectedAudio}`, {
          headers: {
            Authorization: `Bearer ${props.user?.token}`,
          },
        });
      }
      // else if( props.data.rawData._id){
      //   response = await axios.get(`${API_BASE_URL}/session/${props.data.rawData._id}/`, {
      //     headers: {
      //       Authorization: `Bearer ${props.user?.token}`,
      //     },
      //   });
      //   // console.log("response", response.data.audio._id);
      //   props.selectedAudio = response.data.audio._id;
      // }
      else {
        response = await axios.get(`${API_BASE_URL}/session/${_id}/`, {
          headers: {
            Authorization: `Bearer ${props.user?.token}`,
          },
        });
        setAudioId(response.data.audio._id);
      }

      const audioData = response.data.audio;
      setDefaultLanguageAudio(audioData);
      if (audioData) {
        // Check if status and progress are the same as last time
        if (audioData.status === lastStatus) {
          if (audioData.status === "transcribing") {
            // For transcribing, also check if segments and progress are the same
            const isSameProgress = audioData.processingProgress?.completedSegments === lastProgress?.completedSegments && audioData.processingProgress?.totalSegments === lastProgress?.totalSegments;

            if (isSameProgress) {
              setSameStatusCount((prev) => prev + 1);
              // Increase polling interval if same status multiple times
              if (sameStatusCount >= 2) {
                await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL * 2));
              }
            } else {
              setSameStatusCount(0);
              setLastProgress(audioData.processingProgress);
            }
          } else {
            setSameStatusCount((prev) => prev + 1);
          }
        } else {
          // Reset counter when status changes
          setSameStatusCount(0);
          setLastStatus(audioData.status);
          setLastProgress(audioData.processingProgress);
        }

        setAudioStatus((prevStatus) => {
          // Only update if data has changed
          if (JSON.stringify(prevStatus) === JSON.stringify(audioData)) {
            return prevStatus;
          }
          return {
            _id: audioData._id,
            status: audioData.status,
            duration: audioData.duration,
            fullTranscription: audioData.fullTranscription,
            fullSummary: audioData.fullSummary,
            keyTakeaways: audioData.keyTakeaways,
            resources: audioData.resources,
            segments: audioData.segments?.map((segment) => ({
              fileName: segment.fileName,
              duration: segment.duration,
              s3Url: segment.s3Url,
              s3Key: segment.s3Key,
              status: segment.status,
              transcription: segment.transcription,
            })),
            session: audioData.session,
            processingProgress: audioData.processingProgress,
            createdAt: audioData.createdAt,
            originalFileName: audioData.originalFileName,
            originalFileS3Url: audioData.originalFileS3Url,
            s3Key: audioData.s3Key,
            summaries: audioData.summaries,
            linkedinPosts: audioData.linkedinPosts,
            twitterPosts: audioData.twitterPosts,
          };
        });
        setShowSuccess(true);
      }
    } catch (error) {
      console.error("Audio status check error:", error);
      setSameStatusCount((prev) => prev + 1);
      if (error.response?.status === 404) {
        setAudioStatus(null);
      } else {
        setError({
          title: "Error",
          message: error.response?.data?.message || "Failed to check audio status. Please try again.",
        });
      }
    } finally {
      setIsPollingPaused(false);
      setIsLoading(false);
    }
  }, [_id, props.user?.token, lastStatus, lastProgress, isPollingPaused, sameStatusCount]);

  useEffect(() => {
    checkAudioStatus();
  }, [checkAudioStatus]);

  useEffect(() => {
    if (audioStatus && POLLING_STATUSES.includes(audioStatus.status) && sameStatusCount < MAX_SAME_STATUS_COUNT) {
      // Clear any existing interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      // Dynamic polling interval based on status
      const interval = audioStatus.status === "transcribing" ? POLLING_INTERVAL : POLLING_INTERVAL + sameStatusCount * 5000; // Increase interval by 5s for each same status

      pollingIntervalRef.current = setInterval(() => {
        if (!isPollingPaused) {
          checkAudioStatus();
        }
      }, interval);
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [audioStatus, checkAudioStatus, sameStatusCount, isPollingPaused]);

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
    } else {
      alert("Please upload an audio file");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
      };

      mediaRecorder.current.start(200);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Error accessing microphone");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.pause();
      setIsPaused(true);
      clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "paused") {
      mediaRecorder.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleTranslation = async (language) => {
    setSelectedLanguage(language);
    try {
      if (language === "default") {
        // Set the default audio data
        setAudioStatus(defaultLanguageAudio);
        setSelectedLanguage("");
        return;
      }

      const audioIdProps = props.selectedAudio || audioId;
      console.log("audioId", audioId);
      const response = await axios.get(`${API_BASE_URL}/translated-audio?audioId=${audioIdProps}&language=${language}`);
      const audioData = response.data.audio;
      // const audioId = audioStatus._id;
      if (audioData) {
        setAudioStatus({
          _id: audioId,
          status: "processed",
          duration: audioData?.duration || 0,
          fullTranscription: audioData?.fullTranscription || "",
          fullSummary: audioData?.fullSummary || "",
          keyTakeaways: audioData?.keyTakeaways || [],
          resources: audioData?.resources || [],
          segments: audioData?.segments?.map((segment) => ({
            fileName: segment?.fileName || "",
            duration: segment?.duration || 0,
            s3Url: segment?.s3Url || "",
            s3Key: segment?.s3Key || "",
            status: segment?.status || "",
            transcription: segment?.transcription || "",
          })),
          session: audioData?.session || "",
          processingProgress: audioData?.processingProgress || {},
          createdAt: audioData?.createdAt || "",
          originalFileName: audioData?.originalFileName || "",
          originalFileS3Url: audioData?.originalFileS3Url || "",
          s3Key: audioData?.s3Key || "",
          summaries: audioData?.summaries || [],
          linkedinPosts: audioData?.linkedinPosts || [],
          twitterPosts: audioData?.twitterPosts || [],
        });
      }
    } catch (error) {
      console.error("Translation error:", error);
      setError({
        title: "Translation Error",
        message: error.response?.data?.message || "Failed to translate audio. Please try again.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      clearInterval(timerRef.current);
      mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      const sanitizedTitle = title.replace(/[^a-z0-9]/gi, "_").toLowerCase();

      let fileToUpload;
      if (mode === "upload" && audioFile) {
        const extension = audioFile.name.split(".").pop();
        fileToUpload = new File([audioFile], `${sanitizedTitle}.${extension}`, { type: audioFile.type });
      } else if (mode === "record" && recordedAudio) {
        const finalBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        fileToUpload = new File([finalBlob], `${sanitizedTitle}.webm`, { type: "audio/webm" });
      }

      formData.append("audio", fileToUpload);
      formData.append("session", _id);
      formData.append("forceReplace", forceReplace);

      cancelTokenRef.current = axios.CancelToken.source();

      const response = await axios.post(`${API_BASE_URL}/upload-audio`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${props.user?.token}`,
        },
        cancelToken: cancelTokenRef.current.token,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      if (response.data.success) {
        setAudioStatus({
          _id: response.data.audioId,
          status: response.data.status,
          session: response.data.session,
        });
        setSuccessMessage(response.data.message);
        setShowSuccess(true);
        setTimeout(() => {
          props.closeModal?.();
        }, 3000);
      } else {
        setError({
          title: "Upload Failed",
          message: response.data.message || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        setError({
          title: "Upload Cancelled",
          message: "The upload was cancelled",
        });
      } else {
        setError({
          title: "Upload Failed",
          message: error.response?.data?.details || "Something went wrong. Please try again.",
        });
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      cancelTokenRef.current = null;
    }
  };

  const handleCancelUpload = () => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel();
      cancelTokenRef.current = null;
    }
  };

  const handleViewPdf = async () => {
    try {
      setIsPdfLoading(true);
      const response = await axios.get(`${API_BASE_URL}/audio/${audioStatus._id}/pdf`, {
        headers: {
          Authorization: `Bearer ${props.user?.token}`,
        },
        responseType: "blob",
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${title}_summary.pdf`);

      // Append to html link element page
      document.body.appendChild(link);

      // Start download
      link.click();

      // Clean up and remove the link
      link.parentNode.removeChild(link);
    } catch (error) {
      setError({
        title: "PDF Download Failed",
        message: "Could not download the PDF summary. Please try again.",
      });
    } finally {
      setIsPdfLoading(false);
    }
  };

  const formatSummaryContent = (content) => {
    if (!content) return null;

    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          components={{
            // Customize components
            strong: ({ node, ...props }) => <strong className="text-gray-900" {...props} />,
            em: ({ node, ...props }) => <em className="text-gray-700" {...props} />,
            p: ({ node, ...props }) => <p className="text-gray-700 mb-2" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1" {...props} />,
            li: ({ node, ...props }) => <li className="text-gray-600" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  const formatHashtags = (hashtags) => {
    if (!hashtags?.length) return null;

    return (
      <div className="mt-4 flex flex-wrap gap-2">
        {hashtags.map((tag, idx) => (
          <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200">
            #{tag}
          </span>
        ))}
      </div>
    );
  };

  const handleShare = async (type, content) => {
    try {
      switch (type) {
        case "linkedin":
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(content)}`, "_blank");
          break;
        case "twitter":
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}`, "_blank");
          break;
        case "copy":
          await navigator.clipboard.writeText(content);
          // You might want to show a toast notification here
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const ContentCard = ({ content, hashtags, showShareButtons = true, type = "default" }) => {
    return (
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <div className="prose prose-sm max-w-none">{formatSummaryContent(content)}</div>
        <div className="flex items-center justify-between mt-4">
          {formatHashtags(hashtags)}
          {showShareButtons && (
            <div className="flex space-x-2 ml-4">
              {type === "linkedin" && (
                <button
                  onClick={() => handleShare("linkedin", content)}
                  className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                  title="Share on LinkedIn"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </button>
              )}
              {type === "twitter" && (
                <button
                  onClick={() => handleShare("twitter", content)}
                  className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                  title="Share on Twitter"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => handleShare("copy", content)}
                className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                title="Copy to clipboard"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M8 4v12a2 2 0 002 2h8a2 2 0 002-2V7.242a2 2 0 00-.602-1.43L16.083 2.57A2 2 0 0014.685 2H10a2 2 0 00-2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 18v2a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // First, let's create a reusable CopyButton component
  const CopyButton = ({ content }) => (
    <button onClick={() => handleShare("copy", content)} className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200" title="Copy to clipboard">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M8 4v12a2 2 0 002 2h8a2 2 0 002-2V7.242a2 2 0 00-.602-1.43L16.083 2.57A2 2 0 0014.685 2H10a2 2 0 00-2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 18v2a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );

  // Add this regenerate handler function
  const handleRegenerate = async (type, id) => {
    const typeMapping = {
      linkedin: "linkedin",
      twitter: "twitter",
      keytakeaways: "keyTakeaways",
      summary: "detailedSummary",
      shortsummary: "shortSummary",
      oneline: "oneLineDescription",
      highlights: "highlights",
      resources: "resources",
      detailedkeytakeaway: "detailedKeytakeaway",
      transcription: "transcription",
    };

    const displayNames = {
      linkedin: "LinkedIn posts",
      twitter: "Twitter posts",
      keyTakeaways: "key takeaways",
      detailedSummary: "detailed summary",
      shortSummary: "short summary",
      // oneLineDescription: "one-line description",
      // highlights: "highlights",
      resources: "resources",
      detailedKeytakeaway: "detailed key takeaways",
      transcription: "transcription",
    };

    try {
      setRegenerating((prev) => ({ ...prev, [type]: true }));
      setTranscriptionProgress(null); // Reset progress

      if (type === "transcription") {
        const response = await axios.post(
          `${API_BASE_URL}/audio/${audioStatus._id}/transcription/regenerate`,
          {},
          {
            headers: {
              Authorization: `Bearer ${props.user?.token}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log(response);
        if (response.status === 200 && response.data?.success) {
          await checkAudioStatus();
          props.setMessage({
            type: 1,
            content: "Transcription regeneration started",
            icon: "success",
          });
        } else if (response.status === 429) {
          // Handle cooldown directly from response
          const nextAvailable = new Date(response.data.nextAvailableAt);
          const waitMinutes = Math.ceil((nextAvailable - new Date()) / (1000 * 60));
          props.setMessage({
            type: 1,
            icon: "error",
            content: "Regeneration Cooldown, " + response.data.message + ". Available again in " + waitMinutes + " minutes.",
          });
        } else if (response.status === 409 && response.data?.progress) {
          // Handle in-progress directly from response
          setTranscriptionProgress(response.data.progress);
          props.setMessage({
            type: 1,
            icon: "error",
            content: "Regeneration in Progress, " + response.data.message || "Transcription is already being regenerated",
          });
        } else {
          throw new Error(response.data?.message || "Regeneration failed");
        }
      } else {
        // Existing regenerate endpoint for other types
        const reqBody = {
          type: typeMapping[type] || type,
        };
        if (selectedLanguage !== "default") {
          reqBody.language = selectedLanguage;
        }
        await axios.post(`${API_BASE_URL}/audio/${audioStatus._id}/regenerate`, reqBody, {
          headers: {
            Authorization: `Bearer ${props.user?.token}`,
            "Content-Type": "application/json",
          },
        });
        await checkAudioStatus();
        props.setMessage({
          type: 1,
          content: `Successfully regenerated ${displayNames[typeMapping[type] || type]}`,
          icon: "success",
        });
      }
    } catch (error) {
      console.error("Regeneration error:", error);
      if (error.response?.data?.progress) {
        setTranscriptionProgress(error.response.data.progress);
        setError({
          title: "Regeneration in Progress",
          message: error.response.data.message || "Transcription is already being regenerated",
        });
      } else {
        setError({
          title: "Regeneration Failed",
          message: error.response?.data?.message || "Failed to regenerate content. Please try again.",
        });
      }
    } finally {
      setRegenerating((prev) => ({ ...prev, [type]: false }));
    }
  };

  // Add a reusable RegenerateButton component
  const RegenerateButton = ({ onClick, type }) => (
    <button
      onClick={onClick}
      disabled={regenerating[type]}
      className={`p-1.5 text-gray-600 rounded-full transition-colors duration-200 ${regenerating[type] ? "bg-gray-50 cursor-not-allowed" : "hover:text-blue-600 hover:bg-blue-50"}`}
      title={regenerating[type] ? "Regenerating..." : "Regenerate content"}
    >
      <svg className={`w-4 h-4 ${regenerating[type] ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );

  // Update the handleReupload function
  const handleReupload = () => {
    setAudioStatus(null);
    setAudioFile(null);
    setRecordedAudio(null);
    setMode("upload");
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
    setShowSuccess(false);
    setSuccessMessage("");
  };

  // Update the helper function to get status details
  const getProcessingStatusDetails = (status, progress) => {
    const statusMap = {
      queued: {
        title: "Queued for Processing",
        description: "Your audio is in queue and will be processed soon",
        color: "gray",
        icon: "clock",
        animate: false,
      },
      converting: {
        title: "Converting Audio",
        description: "Preparing your audio file for processing",
        color: "blue",
        icon: "cog",
        animate: true,
      },
      converted: {
        title: "Audio Converted",
        description: "Audio converted successfully, preparing for transcription",
        color: "blue",
        icon: "check",
        animate: false,
      },
      transcribing: {
        title: "Transcribing Audio",
        description:
          progress?.completedSegments && progress?.totalSegments
            ? `Transcribed ${progress.completedSegments} of ${progress.totalSegments} segments (${progress.percentComplete}%)`
            : "Converting speech to text",
        color: "blue",
        icon: "cog",
        animate: true,
      },
      translating: {
        title: "Processing Completed, Generating Translations",
        description: "Processing Completed, generating translations",
        color: "green",
        icon: "check",
        animate: false,
      },
      summarizing: {
        title: "Generating Summary",
        description: "Creating summaries and key takeaways from the transcription",
        color: "blue",
        icon: "document",
        animate: true,
      },
      processed: {
        title: "Processing Complete",
        description: "Your audio has been fully processed and is ready to view",
        color: "green",
        icon: "check",
        animate: false,
      },
      failed: {
        title: "Processing Failed",
        description: "There was an error processing your audio. We'll automatically retry soon.",
        color: "red",
        icon: "exclamation",
        animate: false,
      },
    };

    return statusMap[status] || statusMap.queued;
  };

  // Add this function to manually retry polling
  const handleRetryPolling = () => {
    setSameStatusCount(0);
    setLastStatus(null);
    setLastProgress(null);
    checkAudioStatus();
  };

  // Enhanced ProcessingStatus component with progress bars and auto-reload
  const ProcessingStatus = ({ status, progress }) => {
    const { title, description, color, icon, animate } = getProcessingStatusDetails(status, progress);

    // Calculate overall progress based on status
    const getOverallProgress = () => {
      const statusProgressMap = {
        queued: 10,
        converting: 25,
        converted: 40,
        transcribing: progress?.percentComplete ? 40 + progress.percentComplete * 0.4 : 50,
        summarizing: 90,
        processed: 100,
        failed: 0,
        processing: 20,
      };
      return statusProgressMap[status] || 0;
    };

    const overallProgress = getOverallProgress();

    // Auto-reload timer (only when showing status)
    const [autoReloadTime, setAutoReloadTime] = useState(30);
    const [isAutoReloadActive, setIsAutoReloadActive] = useState(false);

    useEffect(() => {
      // Only start auto-reload when we're showing status and not in final states
      if (showSuccess && !["processed", "failed"].includes(status)) {
        setIsAutoReloadActive(true);
        const timer = setInterval(() => {
          setAutoReloadTime((prev) => {
            if (prev <= 1) {
              checkAudioStatus();
              return 30; // Reset timer
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } else {
        setIsAutoReloadActive(false);
        setAutoReloadTime(30);
      }
    }, [status, showSuccess]);

    return (
      <div className="bg-white rounded-lg p-6 mx-auto max-w-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className={`w-8 h-8 ${animate ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {icon === "clock" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
              {icon === "cog" && (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
              )}
              {icon === "document" && (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              )}
              {icon === "check" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />}
              {icon === "exclamation" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-6">{description}</p>

          {/* Overall Progress Bar */}
          <div className="w-full max-w-md mx-auto mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm font-medium text-gray-700">{Math.round(overallProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out" style={{ width: `${overallProgress}%` }}></div>
            </div>
          </div>

          {/* Detailed Progress for transcribing */}
          {progress?.percentComplete > 0 && status === "transcribing" && (
            <div className="w-full max-w-md mx-auto mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Transcription Progress</span>
                <span className="text-sm text-gray-600">{progress.percentComplete}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress.percentComplete}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {progress.completedSegments} of {progress.totalSegments} segments
              </p>
            </div>
          )}

          {/* Auto-reload countdown */}
          {/* {isAutoReloadActive && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Auto-refresh in</span>
                <span className="text-sm font-medium text-blue-700">{autoReloadTime}s</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-1 mt-2">
                <div
                  className="bg-blue-500 h-1 rounded-full transition-all duration-1000"
                  style={{ width: `${(autoReloadTime / 30) * 100}%` }}
                ></div>
              </div>
            </div>
          )} */}

          <div className="flex justify-center space-x-3">
            <button
              onClick={checkAudioStatus}
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg
                hover:bg-gray-200 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Now
            </button>

            {sameStatusCount >= MAX_SAME_STATUS_COUNT && (
              <button
                onClick={handleRetryPolling}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg
                  hover:bg-blue-100 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry Auto-refresh
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Update the MissingContent component
  const MissingContent = ({ type, onRegenerate }) => {
    // Map type to display name
    const displayNames = {
      // oneline: "One Line Description",
      // highlights: "Key Highlights",
      shortsummary: "Short Summary",
      summary: "Detailed Summary",
      keytakeaways: "Key Takeaways",
      // detailedKeytakeaway: "Detailed Key Takeaways",
    };

    return (
      <div className="bg-gray-50 p-4 rounded-lg mt-5">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-700">{displayNames[type]}</h4>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Content is missing</p>
          <button onClick={onRegenerate} className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Generate
          </button>
        </div>
      </div>
    );
  };

  // Add handler for transcription update
  const handleTranscriptionUpdate = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/audio/${audioStatus._id}/transcription/update`,
        {
          transcription: editedTranscription,
        },
        {
          headers: {
            Authorization: `Bearer ${props.user?.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      await checkAudioStatus();
      setIsTranscriptEditing(false);
      props.setMessage({
        type: 1,
        content: "Transcription updated successfully",
        icon: "success",
      });
    } catch (error) {
      setError({
        title: "Update Failed",
        message: error.response?.data?.message || "Failed to update transcription",
      });
    }
  };

  // Add this new handler function near the other handlers
  const handleRegenerateTranslation = async (language) => {
    try {
      setRegenerating((prev) => ({ ...prev, [`translation_${language}`]: true }));

      const response = await axios.post(
        `${API_BASE_URL}/translate-audio`,
        {
          audio: props.selectedAudio,
          language: language,
        },
        {
          headers: {
            Authorization: `Bearer ${props.user?.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 && response.data?.success) {
        await checkAudioStatus();
        props.setMessage({
          type: 1,
          content: `Translation regeneration started for ${language}`,
          icon: "success",
        });
      } else {
        throw new Error(response.data?.message || "Translation regeneration failed");
      }
    } catch (error) {
      console.error("Translation regeneration error:", error);
      setError({
        title: "Translation Regeneration Failed",
        message: error.response?.data?.message || "Failed to regenerate translation. Please try again.",
      });
    } finally {
      setRegenerating((prev) => ({ ...prev, [`translation_${language}`]: false }));
    }
  };

  return (
    <div className="w-full mx-auto pt-2">
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Checking audio status...</p>
        </div>
      ) : audioStatus?.status === "queued" ? (
        <div className="bg-white rounded-lg p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Audio Queued for Processing</h3>
            <p className="text-sm text-gray-500 mb-4">
              Your audio file has been uploaded successfully and will begin processing shortly.
              {audioStatus.originalFileName && <span className="block mt-2">File: {audioStatus.originalFileName}</span>}
            </p>
            <button
              onClick={checkAudioStatus}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg 
                hover:bg-blue-100 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Check Status
            </button>
          </div>
        </div>
      ) : audioStatus?.status === "failed" ? (
        <div className="bg-white rounded-lg p-6 mx-auto max-w-2xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Processing Failed</h3>
            <p className="text-sm text-gray-500 mb-4">{audioStatus.error || "There was an error processing your audio file."}</p>
            <div className="space-y-3">
              <button onClick={handleReupload} className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload New Audio
              </button>
              <button onClick={() => props.closeModal?.()} className="block w-full py-2 px-4 text-gray-600 hover:text-gray-900 text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      ) : audioStatus?.status === "processing" ? (
        <div className="bg-white rounded-lg p-6 mx-auto max-w-2xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Processing Audio</h3>
            <p className="text-sm text-gray-500 mb-4">Your audio is currently being processed</p>

            {audioStatus?.processingProgress && (
              <>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${audioStatus.processingProgress.percentComplete}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mb-6">
                  Processing segments: {audioStatus.processingProgress.completedSegments} of {audioStatus.processingProgress.totalSegments}({audioStatus.processingProgress.percentComplete}%)
                </p>
                {audioStatus.processingProgress.errors?.length > 0 && (
                  <div className="text-left mb-6">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <h4 className="text-sm font-medium text-red-700 mb-1">Processing Errors</h4>
                      <ul className="text-sm text-red-600 list-disc list-inside">
                        {audioStatus.processingProgress.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              onClick={checkAudioStatus}
              className="mb-6 inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg 
                hover:bg-blue-100 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Status
            </button>
          </div>
        </div>
      ) : audioStatus?.status === "processed" || audioStatus?.status === "translating" ? (
        <div className="bg-white rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 text-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Processing Complete</h3>
                <p className="text-xs text-gray-500">Audio has been processed successfully</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {props.translatedLanguages?.length > 0 && (
                <div className="flex items-center space-x-2">
                  <select
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => handleTranslation(e.target.value)}
                    value={selectedLanguage || ""}
                  >
                    <option value="">Select Translation</option>
                    <option value="default">Default Audio</option>
                    {props.translatedLanguages.map((language, index) => (
                      <option key={index} value={language}>
                        {language}
                      </option>
                    ))}
                  </select>
                  {selectedLanguage && selectedLanguage !== "default" && (
                    <button
                      onClick={() => handleRegenerateTranslation(selectedLanguage)}
                      disabled={regenerating[`translation_${selectedLanguage}`]}
                      className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200
                        ${regenerating[`translation_${selectedLanguage}`] ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
                      title={regenerating[`translation_${selectedLanguage}`] ? "Regenerating..." : "Regenerate translation"}
                    >
                      <svg className={`w-4 h-4 ${regenerating[`translation_${selectedLanguage}`] ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}
              <button
                onClick={handleViewPdf}
                disabled={isPdfLoading}
                className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200
                  ${isPdfLoading ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
              >
                {isPdfLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Downloading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Download PDF
                  </>
                )}
              </button>
              {!props.selectedAudio && (
                <button onClick={handleReupload} className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Re-upload
                </button>
              )}
            </div>
          </div>

          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
              {[
                { id: "summary", label: "Summary" },
                { id: "keyTakeaways", label: "Key Takeaways" },
                { id: "transcription", label: "Transcription" },
                { id: "social", label: "Social Posts" },
                { id: "resources", label: "Resources" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 font-medium text-sm ${activeTab === tab.id ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="text-left">
            {activeTab === "summary" && (
              <div className="space-y-6">
                {/* {audioStatus.summaries?.oneLineDescription ? (
                    <div className="bg-gray-50 p-4 rounded-lg mt-5">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700">One Line Description</h4>
                        <div className="flex space-x-2">
                          <RegenerateButton onClick={() => handleRegenerate("oneline", audioStatus._id)} type="oneline" />
                          <CopyButton content={audioStatus.summaries.oneLineDescription} />
                        </div>
                      </div>
                      <div className="prose prose-sm max-w-none">{formatSummaryContent(audioStatus.summaries.oneLineDescription)}</div>
                    </div>
                  ) : ( */}
                {/* <MissingContent type="oneline" onRegenerate={() => handleRegenerate("oneline", audioStatus._id)} /> */}
                {/* )} */}

                {/* {audioStatus.summaries?.highlights ? (
                  <div className="bg-gray-50 p-4 rounded-lg mt-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Key Highlights</h4>
                      <div className="flex space-x-2">
                        <RegenerateButton onClick={() => handleRegenerate("highlights", audioStatus._id)} type="highlights" />
                        <CopyButton content={audioStatus.summaries.highlights} />
                </div>
                    </div>
                    <div className="prose prose-sm max-w-none">{formatSummaryContent(audioStatus.summaries.highlights)}</div>
                  </div>
                ) : (
                  <MissingContent type="highlights" onRegenerate={() => handleRegenerate("highlights", audioStatus._id)} />
                )} */}

                {audioStatus.summaries?.shortSummary ? (
                  <div className="bg-gray-50 p-4 rounded-lg mt-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Short Summary</h4>
                      <div className="flex space-x-2">
                        <RegenerateButton onClick={() => handleRegenerate("shortsummary", audioStatus._id)} type="shortsummary" />
                        <CopyButton content={audioStatus.summaries.shortSummary} />
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none">{formatSummaryContent(audioStatus.summaries.shortSummary)}</div>
                  </div>
                ) : (
                  <MissingContent type="shortsummary" onRegenerate={() => handleRegenerate("shortsummary", audioStatus._id)} />
                )}

                {audioStatus.summaries?.detailedSummary ? (
                  <div className="bg-gray-50 p-4 rounded-lg mt-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Detailed Summary</h4>
                      <div className="flex space-x-2">
                        <RegenerateButton onClick={() => handleRegenerate("summary", audioStatus._id)} type="summary" />
                        <CopyButton content={audioStatus.summaries.detailedSummary} />
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none">{formatSummaryContent(audioStatus.summaries.detailedSummary)}</div>
                  </div>
                ) : (
                  <MissingContent type="summary" onRegenerate={() => handleRegenerate("summary", audioStatus._id)} />
                )}
                {/* {audioStatus.summaries?.detailedKeytakeaway ? (
                  <div className="bg-gray-50 p-4 rounded-lg mt-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Detailed Key Takeaways</h4>
                      <div className="flex space-x-2">
                        <RegenerateButton onClick={() => handleRegenerate("detailedKeytakeaway", audioStatus._id)} type="keytakeaways" />
                        <CopyButton content={audioStatus.summaries.detailedKeytakeaway} />
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none">{formatSummaryContent(audioStatus.summaries.detailedKeytakeaway)}</div>
                  </div>
                ) : (
                  <MissingContent type="keytakeaways" onRegenerate={() => handleRegenerate("detailedKeytakeaway", audioStatus._id)} />
                )} */}
              </div>
            )}

            {activeTab === "keyTakeaways" && (
              <div className="bg-gray-50 p-4 rounded-lg mt-5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">{audioStatus.keyTakeaways?.length} Key Takeaways</h4>
                  <div className="flex space-x-2">
                    <RegenerateButton onClick={() => handleRegenerate("keytakeaways", audioStatus._id)} type="keytakeaways" />
                    <CopyButton content={audioStatus.keyTakeaways.map((t) => `${t.heading}\n${t.explanation}\n${t.hashtags?.map((h) => `#${h}`).join(" ")}`).join("\n\n")} />
                  </div>
                </div>
                <div className="space-y-3">
                  {audioStatus.keyTakeaways?.map((takeaway, index) => (
                    <div key={index} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-sm font-medium text-gray-800">{formatSummaryContent(takeaway.heading)}</h5>
                        <CopyButton content={`${takeaway.heading}\n${takeaway.explanation}\n${takeaway.hashtags?.map((h) => `#${h}`).join(" ")}`} />
                      </div>
                      <div className="text-sm text-gray-600">{formatSummaryContent(takeaway.explanation)}</div>
                      {takeaway.hashtags?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {takeaway.hashtags.map((tag, idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "transcription" && (
              <div className="bg-gray-50 p-4 rounded-lg mt-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-700">Full Transcription</h4>
                  <div className="flex space-x-2">
                    <RegenerateButton onClick={() => handleRegenerate("transcription", audioStatus._id)} type="transcription" />
                    {!isTranscriptEditing ? (
                      <>
                        <button
                          onClick={() => {
                            setEditedTranscription(audioStatus.fullTranscription);
                            setIsTranscriptEditing(true);
                          }}
                          className="inline-flex items-center px-2 py-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit
                        </button>
                        <CopyButton content={audioStatus.fullTranscription} />
                      </>
                    ) : (
                      <div className="flex space-x-2">
                        <button onClick={handleTranscriptionUpdate} className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-600 bg-green-50 rounded hover:bg-green-100">
                          Save
                        </button>
                        <button onClick={() => setIsTranscriptEditing(false)} className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100">
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {transcriptionProgress && (
                  <div className="mb-4 bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700">Regeneration in Progress</span>
                      <span className="text-sm text-blue-600">{transcriptionProgress.percentage}%</span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${transcriptionProgress.percentage}%` }} />
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Completed: {transcriptionProgress.completed} of {transcriptionProgress.total} segments
                    </p>
                  </div>
                )}

                {isTranscriptEditing ? (
                  <textarea
                    value={editedTranscription}
                    onChange={(e) => setEditedTranscription(e.target.value)}
                    className="w-full h-64 p-3 text-sm text-gray-700 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter transcription..."
                  />
                ) : (
                  <div className="prose prose-sm max-w-none">{formatSummaryContent(audioStatus.fullTranscription)}</div>
                )}
              </div>
            )}

            {activeTab === "social" && (
              <div className="space-y-6">
                {audioStatus.linkedinPosts?.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg mt-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700">LinkedIn Posts</h4>
                      <RegenerateButton onClick={() => handleRegenerate("linkedin", audioStatus._id)} type="linkedin" />
                    </div>
                    <div className="space-y-4">
                      {audioStatus.linkedinPosts.map((post, index) => (
                        <ContentCard key={index} content={post.content} hashtags={post.hashtags} type="linkedin" />
                      ))}
                    </div>
                  </div>
                )}
                {audioStatus.twitterPosts?.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg mt-5">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Twitter Posts</h4>
                      <RegenerateButton onClick={() => handleRegenerate("twitter", audioStatus._id)} type="twitter" />
                    </div>
                    <div className="space-y-4">
                      {audioStatus.twitterPosts.map((post, index) => (
                        <ContentCard key={index} content={post.content} hashtags={post.hashtags} type="twitter" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "resources" && (
              <div className="bg-gray-50 p-4 rounded-lg mt-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-700">Resources</h4>
                  <div className="flex space-x-2">
                    <RegenerateButton onClick={() => handleRegenerate("resources", audioStatus._id)} type="resources" />
                    <CopyButton
                      content={audioStatus.resources?.map((category) => `${category.category}\n${category.items.map((item) => `${item.title}\n${item.description}`).join("\n\n")}`).join("\n\n")}
                    />
                  </div>
                </div>

                {audioStatus.resources?.length > 0 ? (
                  <div className="space-y-4">
                    {audioStatus.resources.map((resourceCategory, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-medium text-gray-800">{formatSummaryContent(resourceCategory.category)}</h5>
                          <CopyButton content={resourceCategory.items.map((item) => `${item.title}\n${item.description}`).join("\n\n")} />
                        </div>
                        <div className="space-y-3">
                          {resourceCategory.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h6 className="text-sm font-medium text-gray-800 mb-1">{formatSummaryContent(item.title)}</h6>
                                  <p className="text-sm text-gray-600">{formatSummaryContent(item.description)}</p>
                                </div>
                                <CopyButton content={`${item.title}\n${item.description}`} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <MissingContent type="resources" onRegenerate={() => handleRegenerate("resources", audioStatus._id)} />
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {!showSuccess ? (
            <>
              {error && (
                <div className="space-y-6 p-6 mx-auto max-w-2xl mt-6 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-sm font-medium text-red-800">{error.title}</h3>
                  </div>
                  <p className="text-sm text-red-600">{error.message}</p>
                </div>
              )}

              {isUploading ? (
                <div className="space-y-6 p-6 mx-auto max-w-2xl">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Uploading Audio</h3>
                    <p className="text-sm text-gray-500">Please wait while we upload your file</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Uploading...</span>
                      <span className="text-sm text-gray-500">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <button
                      onClick={handleCancelUpload}
                      className="mt-4 w-full py-2 px-4 border border-red-300 text-red-600 rounded-lg 
                        hover:bg-red-50 transition-colors duration-200"
                    >
                      Cancel Upload
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex pt-4 justify-center mb-8">
                    <div className="inline-flex p-1 bg-gray-100 rounded-xl">
                      <button
                        className={`px-8 py-2.5 rounded-lg font-medium transition-all duration-200
                          ${mode === "upload" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                        onClick={() => setMode("upload")}
                      >
                        Upload Audio
                      </button>
                      <button
                        className={`px-8 py-2.5 rounded-lg font-medium transition-all duration-200
                          ${mode === "record" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                        onClick={() => setMode("record")}
                      >
                        Record Audio
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6 p-6 mx-auto max-w-2xl">
                    {mode === "upload" && (
                      <div className="space-y-4">
                        <input type="file" id="audio-upload" accept="audio/*" onChange={handleFileUpload} className="hidden" />

                        {!audioFile ? (
                          <label
                            htmlFor="audio-upload"
                            className="block w-full py-12 px-6 text-center bg-gray-50 
                              rounded-xl border-2 border-dashed border-gray-200 cursor-pointer
                              hover:bg-gray-100 transition-colors duration-200"
                          >
                            <div className="flex flex-col items-center space-y-3">
                              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-base font-medium text-gray-900">Click to upload audio</p>
                                <p className="text-sm text-gray-500">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">MP3, WAV, PCM or M4A</p>
                            </div>
                          </label>
                        ) : (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm text-gray-600">Selected file: {audioFile.name}</p>
                              <button onClick={() => setAudioFile(null)} className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <audio controls src={URL.createObjectURL(audioFile)} className="w-full" />
                          </div>
                        )}
                      </div>
                    )}

                    {mode === "record" && (
                      <div className="space-y-4">
                        <div className="p-6 bg-gray-50 rounded-xl text-center">
                          {isRecording && (
                            <div className="mb-4">
                              <p className="text-2xl font-semibold text-gray-900">{formatTime(recordingTime)}</p>
                              <p className="text-sm text-gray-500">Recording in progress</p>
                            </div>
                          )}

                          <div className="flex justify-center space-x-3">
                            {!isRecording ? (
                              <button
                                onClick={startRecording}
                                className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium 
                                  hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2"
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 2a2 2 0 00-2 2v6a2 2 0 104 0V4a2 2 0 00-2-2z" />
                                  <path d="M16 10a6 6 0 11-12 0 6 6 0 0112 0z" />
                                </svg>
                                <span>Start Recording</span>
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={isPaused ? resumeRecording : pauseRecording}
                                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium 
                                    hover:bg-gray-200 transition-colors duration-200"
                                >
                                  {isPaused ? "Resume" : "Pause"}
                                </button>
                                <button
                                  onClick={stopRecording}
                                  className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium 
                                    hover:bg-red-600 transition-colors duration-200"
                                >
                                  Stop Recording
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {recordedAudio && (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-2">Preview recording</p>
                            <audio controls src={recordedAudio} className="w-full" />
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="forceReplace"
                        checked={forceReplace}
                        onChange={(e) => setForceReplace(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded 
                          focus:ring-blue-500 focus:ring-2"
                      />
                      <label htmlFor="forceReplace" className="ml-2 text-sm text-gray-600">
                        Replace existing audio if present
                      </label>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => props.closeModal?.()}
                        disabled={isUploading}
                        className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200
                          ${isUploading ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={!(audioFile || recordedAudio) || isUploading}
                        className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors duration-200
                          ${(audioFile || recordedAudio) && !isUploading ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                      >
                        {isUploading ? "Uploading..." : "Submit"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : showSuccess ? (
            <ProcessingStatus status={audioStatus?.status || "queued"} progress={audioStatus?.processingProgress} />
          ) : (
            <div className="bg-white rounded-lg p-6 mx-auto max-w-2xl">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Upload Successful!</h3>
                <p className="text-sm text-gray-500">{successMessage}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UploadAudio;
