import { useState, useEffect, useRef } from "react";
import { getData, deleteData } from "../../../../backend/api";
import axios from "axios";
import UploadAudio from "../event/uploadAudio";
import PopupView from "../../../core/popupview";
import { PageHeader } from "../../../core/input/heading";
import { RowContainer } from "../../../styles/containers/styles";
import { ButtonPanel } from "../../../core/list/styles";
import { Button } from "../../../core/elements";
import CustomSelect from "../../../core/select";
import Shimmer from "../../../core/loader";
import { useMessage } from "../../../core/message/useMessage";
import { useToast } from "../../../core/toast";
import { GetIcon } from "../../../../icons";
import NoDataFound from "../../../core/list/nodata";
import { ThreeDotMenu } from "../../../core/list/threedotmenu";
import AutoForm from "../../../core/autoform/AutoForm";

const API_BASE_URL = import.meta.env.VITE_INSTARECAP_API || "https://instarecap-app.ambitiousforest-1ab41110.centralindia.azurecontainerapps.io/api";

const EventAudioUpload = (props) => {
  const [recordings, setRecordings] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [showAudioUpload, setShowAudioUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);  
  const [uploadError, setUploadError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mode, setMode] = useState("upload");
  const [audioFile, setAudioFile] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [translatedLanguages, setTranslatedLanguages] = useState([]);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [isRemapping, setIsRemapping] = useState(false);
  const [loaderBox, setLoaderBox] = useState(false);
  const toast = useToast();
  const { showMessage } = useMessage();

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE_URL}/audio-details?event=${props.openData.data._id}`);
        if (response.data.success) {
          const formattedRecordings = response.data.audio.map((recording) => ({
            id: recording._id,
            title: recording.originalFileName,
            status: recording.status,
            session: recording.session?.title || null,
            sessionId: recording.session?._id || null,
            progress: recording.processingProgress?.percentComplete || 0,
            error: recording.processingProgress?.error || null,
          }));
          setRecordings(formattedRecordings);
        }
      } catch (error) {
        console.error("Error fetching recordings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecordings();
  }, [props]);

  useEffect(() => {
    const fetchTranslatedLanguages = async () => {
      try {
        const response = await getData({ event: props.openData.data._id }, "instarecap-setting");
        if (response.data.success) {
          console.log("Translated languages:", response.data.response[0].translationLanguages);
          setTranslatedLanguages(response.data.response[0].translationLanguages);
        }
      } catch (error) {
        console.error("Error fetching translated languages:", error);
        toast.error("Error fetching translated languages, error: " + error);
      }
    };
    fetchTranslatedLanguages();
  }, [props]);

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      try {
        const response = await getData({ event: props.openData.data._id }, "sessions/select");
        setSessions(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        setSessions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, [props]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        setRecordedAudio(url);
        setAudioFile(new File([blob], "recording.wav", { type: "audio/wav" }));
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
    } catch (err) {
      console.error("Error starting recording:", err);
      setUploadError({ message: "Could not access microphone" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("audio", file);
    formData.append("event", props.openData.data._id);
    formData.append("freeUpload", true);
    try {
      const response = await axios.post(`${API_BASE_URL}/upload-free-audio`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      if (response.data.success) {
        const updatedRecordings = [...recordings];
        updatedRecordings.unshift({
          id: response.data.audio._id,
          title: response.data.audio.originalFileName,
          status: response.data.audio.status,
          session: null,
          sessionId: null,
          progress: response.data.audio.processingProgress?.percentComplete || 0,
        });
        setRecordings(updatedRecordings);
        toast.success(response.data.message || "Audio uploaded successfully!");
        
        // Close upload modal and reset state
        setShowUploadModal(false);
        setMode("upload");
        setRecordedAudio(null);
        setAudioFile(null);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error uploading file";
      setUploadError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const mapSession = async (sessionId) => {
    if (selectedRecording && sessionId) {
      try {
        let response;
        if (sessionId === "none") {
          response = await axios.post(`${API_BASE_URL}/audio/map-to-none`, {
            audioId: selectedRecording.id,
          });
        } else {
          response = await axios.post(`${API_BASE_URL}/audio/map-session`, {
            audio: selectedRecording.id,
            session: sessionId,
          });
        }
        if (response.data.success) {
          const selectedSessionChanged = sessions.find((s) => s.id === sessionId);
          const sessionValue = selectedSessionChanged ? selectedSessionChanged.value : "";

          setRecordings((prev) => prev.map((rec) => (rec.id === selectedRecording.id ? { ...rec, session: sessionValue, sessionId: sessionId === "none" ? null : sessionId } : rec)));
          toast.success(sessionId === "none" ? "Session unmapped successfully!" : (isRemapping ? "Session remapped successfully!" : "Session mapped successfully!"));
        }
      } catch (error) {
        console.error("Error mapping session:", error);
        toast.error("Failed to map session: " + (error.response?.data?.message || error.message));
      }
      setShowSessionModal(false);
      setSelectedRecording(null);
      setIsRemapping(false);
    }
  };

  const handleRecordedAudioUpload = () => {
    if (!audioFile) {
      toast.error("No recording available to upload");
      return;
    }
    handleFileUpload(audioFile);
    // Note: handleFileUpload will handle closing the modal and resetting state
  };

  const handleDelete = async (recordingId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/audio?audioId=${recordingId}`);
      if (response.data.success) {
        setRecordings((prev) => prev.filter((rec) => rec.id !== recordingId));
        toast.success("Recording deleted successfully!");
        return true;
      }
      toast.error("Delete failed");
      return false;
    } catch (error) {
      console.error("Error deleting recording:", error);
      toast.error("Failed to delete recording: " + (error.response?.data?.message || error.message));
      return false;
    }
  };

  if (isLoading) {
    return (
      <RowContainer className="data-layout">
        <PageHeader title="Event Session Transcriber" description="Recordings" line={false} />
        <Shimmer count={5} />
      </RowContainer>
    );
  }

  return (
    <RowContainer className="data-layout">
      {/* Header */}
      <PageHeader 
        title="Event Session Transcriber" 
        description="Recordings"
        line={false}
      />
      
      {/* Action Panel */}
      <ButtonPanel className="custom">
        <div className="flex items-center gap-3">
          {/* Search and filter can be added here if needed */}
        </div>
        
        <div className="flex items-center gap-3">
            <Button 
              value="New Recording"
              icon="add"
            ClickEvent={() => setShowUploadModal(true)}
              type="primary"
              align="bg-primary-base hover:bg-primary-dark text-white"
            />
        </div>
      </ButtonPanel>

      {/* Recordings List */}
      {recordings.length === 0 ? (
        <NoDataFound
          shortName="Recordings"
          icon="music"
          addPrivilege={true}
          addLabel="New Recording"
          isCreatingHandler={() => setShowUploadModal(true)}
        />
      ) : (
        <div className="space-y-3 mt-3">
          {recordings.map((recording) => (
            <div key={recording.id} className="p-4 border border-stroke-soft rounded-xl bg-bg-white hover:border-stroke-sub hover:shadow-sm transition-all duration-200">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
                      <GetIcon icon="play" className="text-primary-base" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-main mb-1 text-base">{recording.title}</h3>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {/* Show status only if mapped OR if processing/processed/failed */}
                        {(recording.session || recording.status === "processed" || recording.status === "failed" || (recording.status === "processing" && recording.progress > 0)) && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              recording.status === "processed" 
                                ? "bg-green-50 text-green-700 border border-green-200" 
                                : recording.status === "failed" 
                                ? "bg-red-50 text-red-700 border border-red-200" 
                                : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                            }`}
                          >
                            {recording.status === "processed" ? "✓ Processed" : recording.status === "failed" ? "✗ Failed" : `Processing ${recording.progress}%`}
                          </span>
                        )}
                        {!recording.session && recording.status !== "processed" && recording.status !== "failed" && !(recording.status === "processing" && recording.progress > 0) && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            Uploaded
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-soft">Session:</span>
                        {recording.session ? (
                          <span className="text-sm text-text-main font-medium">{recording.session}</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm text-text-soft">Not mapped</span>
                            <div className="w-3.5 h-3.5 text-red-500">
                              <GetIcon icon="close" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {/* Map/Remap Session Button */}
                  <Button
                    value={recording.session ? "Remap Session" : "Map to Session"}
                    icon={recording.session ? "refresh" : "link"}
                    ClickEvent={() => {
                      setSelectedRecording(recording);
                      setIsRemapping(!!recording.session);
                      setSelectedSession(null); // Reset selected session
                      setShowSessionModal(true);
                    }}
                    type="secondary"
                    align="bg-bg-weak hover:bg-bg-soft text-text-main px-3 py-1.5 text-sm font-medium"
                  />

                  {/* View Transcript Button - Only show if processed */}
                  {recording.status === "processed" && (
                    <Button
                      value="View Transcript"
                      icon="eye"
                      ClickEvent={() => {
                        setSelectedRecording(recording);
                        setSelectedSession(recording.session);
                        setShowAudioUpload(true);
                      }}
                      type="primary"
                      align="bg-primary-base hover:bg-primary-dark text-white px-3 py-1.5 text-sm font-medium"
                    />
                  )}

                  {/* Three Dot Menu - Only for Delete */}
                  <ThreeDotMenu
                    items={[
                      {
                        icon: "delete",
                        label: "Delete",
                        variant: "danger",
                        onClick: () => {
                          const itemName = recording?.title || "recording";
                          showMessage({
                            type: 2,
                            content: `Do you want to delete '${itemName}'? This action cannot be undone.`,
                            proceed: "Delete",
                            okay: "Cancel",
                            data: recording,
                            onProceed: async (data, id) => {
                              try {
                                const result = await handleDelete(recording.id);
                                return result;
                              } catch (e) {
                                toast.error("Delete failed");
                                return false;
                              }
                            }
                          });
                        }
                      }
                    ]}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Session Selection Modal */}
      {showSessionModal && selectedRecording && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-bg-white p-6 rounded-xl max-w-md w-full mx-4 shadow-xl">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-main mb-2">
                {isRemapping ? "Remap Session" : "Map to Session"}
              </h3>
              <p className="text-sm text-text-sub">Recording: {selectedRecording.title}</p>
            </div>

            <div className="mb-6">
              <CustomSelect
                label="Select Session"
                placeholder="Choose a session"
                required={true}
                apiType="JSON"
                selectApi={[
                  { id: "none", value: "None" },
                  ...sessions.map(s => ({ id: s.id, value: s.value }))
                ]}
                value={selectedRecording.sessionId || ""}
                onSelect={(option) => {
                  setSelectedSession(option);
                }}
                showLabel={true}
                customClass="full"
                theme={{ primaryBase: "#375DFB" }}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                value="Cancel"
                ClickEvent={() => {
                  setShowSessionModal(false);
                  setSelectedRecording(null);
                  setIsRemapping(false);
                  setSelectedSession(null);
                }}
                type="secondary"
                align="bg-bg-weak hover:bg-bg-soft text-text-main px-4 py-2"
              />
              <Button
                value={isRemapping ? "Remap Session" : "Map Session"}
                icon={isRemapping ? "refresh" : "link"}
                ClickEvent={() => {
                  if (selectedSession) {
                    mapSession(selectedSession.id);
                  }
                }}
                type="primary"
                align="bg-primary-base hover:bg-primary-dark text-white px-4 py-2"
              />
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <PopupView
          customClass="medium"
          popupData={
            <div className="space-y-6 p-2">
          {/* Mode Toggle */}
          <div className="flex justify-center">
                <div className="flex gap-2 p-1 bg-bg-weak rounded-xl">
                  <button
                    onClick={() => setMode("upload")}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  mode === "upload" 
                    ? "bg-bg-white text-text-main shadow-sm" 
                    : "text-text-sub hover:text-text-main"
                }`}
                  >
                    Upload Audio
                  </button>
                  <button
                    onClick={() => setMode("record")}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  mode === "record" 
                    ? "bg-bg-white text-text-main shadow-sm" 
                    : "text-text-sub hover:text-text-main"
                }`}
                  >
                    Record Audio
                  </button>
            </div>
          </div>

          {/* Upload Content */}
              <div className="space-y-6">
            {mode === "upload" ? (
              <div className="space-y-4">
                <input 
                  type="file" 
                      id="audio-upload-modal" 
                  accept="audio/*" 
                      onChange={(e) => {
                        handleFileUpload(e.target.files[0]);
                        if (e.target.files[0]) {
                          setShowUploadModal(false);
                        }
                      }} 
                  className="hidden" 
                />

                {isUploading ? (
                  <div className="space-y-6">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-medium text-text-main">Uploading Audio</h3>
                      <p className="text-sm text-text-sub">Please wait while we upload your file</p>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-text-main">Uploading...</span>
                        <span className="text-sm text-text-sub">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-bg-weak rounded-full h-2.5">
                        <div 
                          className="bg-primary-base h-2.5 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label
                        htmlFor="audio-upload-modal"
                    className="block w-full py-12 px-6 text-center bg-bg-weak 
                      rounded-xl border-2 border-dashed border-stroke-soft cursor-pointer
                      hover:bg-bg-soft transition-colors duration-200"
                  >
                    <div className="flex flex-col items-center space-y-3">
                          <div className="w-14 h-14 bg-primary-light text-primary-base rounded-full flex items-center justify-center">
                            <GetIcon icon="upload" className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-base font-medium text-text-main">Click to upload audio</p>
                        <p className="text-sm text-text-sub">or drag and drop</p>
                      </div>
                      <p className="text-xs text-text-soft">MP3, WAV, or M4A up to 10MB</p>
                    </div>
                  </label>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                    <div className="flex justify-center gap-3">
                  {!isRecording ? (
                    <Button
                      value="Start Recording"
                      icon="mic"
                      ClickEvent={startRecording}
                      type="primary"
                      align="bg-primary-base hover:bg-primary-dark text-white px-6 py-3"
                    />
                  ) : (
                    <>
                      <Button
                        value={isPaused ? "Resume" : "Pause"}
                            icon={isPaused ? "play" : "pause"}
                        ClickEvent={isPaused ? resumeRecording : pauseRecording}
                        type="secondary"
                        align="bg-bg-weak hover:bg-bg-soft text-text-main px-6 py-3"
                      />
                      <Button
                            value="Stop"
                            icon="stop"
                        ClickEvent={stopRecording}
                        type="primary"
                        align="bg-state-error hover:bg-red-600 text-white px-6 py-3"
                      />
                    </>
                  )}
                </div>

                {recordedAudio && (
                  <div className="p-4 bg-bg-weak rounded-lg space-y-4">
                        <p className="text-sm font-medium text-text-main mb-2">Preview Recording</p>
                    <audio controls src={recordedAudio} className="w-full" />
                    <div className="flex gap-3 justify-center">
                      <Button
                        value={isUploading ? "Uploading..." : "Upload Recording"}
                        icon={isUploading ? "loader" : "upload"}
                            ClickEvent={() => {
                              handleRecordedAudioUpload();
                              setShowUploadModal(false);
                            }}
                        isDisabled={isUploading}
                        type="primary"
                        align={`bg-state-success hover:bg-green-600 text-white px-6 py-3 ${
                          isUploading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      />
                    </div>
                  </div>
                )}
                </div>
              )}
            </div>
            </div>
          }
          closeModal={() => {
            setShowUploadModal(false);
                setMode("upload");
                setRecordedAudio(null);
                setAudioFile(null);
              }}
          itemTitle={{ name: "title", type: "text" }}
          openData={{ data: { _id: "new-recording", title: "New Recording" } }}
        />
      )}

      {/* Transcript Viewer */}
      {showAudioUpload && selectedRecording && (
        <PopupView
          itemTitle={{ name: "title", type: "text" }}
          popupData={<UploadAudio {...props} data={{ title: selectedRecording.session, _id: selectedRecording.id }} translatedLanguages={translatedLanguages} selectedAudio={selectedRecording.id} />}
          openData={{
            data: {
              _id: selectedRecording.id,
              title: "Transcript - " + selectedRecording.title,
            },
          }}
          customClass="large"
          closeModal={() => {
            setShowAudioUpload(false);
            setSelectedRecording(null);
          }}
        />
      )}
    </RowContainer>
  );
};

export default EventAudioUpload;
