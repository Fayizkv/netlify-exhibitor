import { useState, useRef, useEffect, useCallback } from "react";
import { Info, Plus, UploadCloud, Save, ChevronLeft, ChevronRight, Image, Maximize2 } from "lucide-react";
import { postData, getData, putData } from "../../../../backend/api";
import ListTableSkeleton from "../../../core/loader/shimmer";
import { SubPageHeader } from "../../../core/input/heading";

// Slider Component
const Slider = ({ value, min, max, step, onValueChange, className }) => {
  return (
    <div className={`relative ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={(e) => onValueChange([parseInt(e.target.value)])}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, #375DFB 0%, #2852fa ${((value[0] - min) / (max - min)) * 100}%, #e5e7eb ${((value[0] - min) / (max - min)) * 100}%, #e5e7eb 100%)`,
        }}
      />
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #375dfb;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #375dfb;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

const sampleImages = [
  {
    id: 1,
    name: "Sample Image",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    orientation: "landscape",
  },
];

const WatermarkSettings = ({
  opacity,
  setOpacity,
  scale,
  setScale,
  setWatermarkImage,
  onSave,
  isSaving,
  savedSettings,
  eventId,
  onBackgroundImageUpload,
  customBackgroundImages,
  selectedBackgroundImage,
  onSelectBackgroundImage,
}) => {
  const [selectedImage, setSelectedImage] = useState(1);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      let watermarkId = savedSettings?._id;

      // If no saved settings exist, create a basic watermark settings record first
      if (!watermarkId) {
        console.log("No existing watermark settings found, creating new record...");
        const initialData = {
          mode: "Image",
          event: eventId,
          appearance: {
            opacity: opacity,
            scale: scale,
          },
          defaultPosition: {
            left: watermarkPosition.x,
            top: watermarkPosition.y,
          },
          imageSettings: {
            imageUrl: "",
            fileName: "watermark-image",
            fileSize: 0,
            mimeType: "image/png",
          },
        };

        const createResponse = await postData(initialData, "water-mark-settings");
        if (createResponse.status === 200 || createResponse.status === 201) {
          watermarkId = createResponse.data?.data?._id;
          setSavedSettings(createResponse.data?.data);
          setIsExist(true);
          console.log("Created new watermark settings with ID:", watermarkId);
        } else {
          throw new Error("Failed to create watermark settings");
        }
      }

      // Create object with file and id for putData function
      const uploadData = {
        watermarkImage: file,
        id: watermarkId,
      };

      console.log("Uploading image with data:", uploadData);

      // Use putData for image upload - it will handle FormData creation
      const response = await putData(uploadData, "water-mark-settings/upload-image");

      if (response.status === 200 && response.data?.data?.imageUrl) {
        // Construct full CDN URL
        const cdnUrl = `https://event-manager.syd1.digitaloceanspaces.com/${response.data.data.imageUrl}`;
        setWatermarkImage(cdnUrl);

        if (window.showMessage) {
          window.showMessage({
            content: "Image uploaded successfully!",
            type: 0,
            icon: "success",
          });
        }
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      if (window.showMessage) {
        window.showMessage({
          content: "Failed to upload image. Please try again.",
          type: 1,
          icon: "error",
        });
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleBackgroundImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      if (window.showMessage) {
        window.showMessage({
          content: "Please select a valid image file.",
          type: 1,
          icon: "error",
        });
      }
      return;
    }

    // Create a FileReader to convert the file to a data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onBackgroundImageUpload(event.target.result, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectImage = (image) => {
    if (onSelectBackgroundImage) {
      onSelectBackgroundImage(image);
    }
  };

  // Combine sample images with custom background images
  const allImages = [...sampleImages, ...customBackgroundImages];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h1 className="font-medium text-[20px] text-gray-800">Watermark Settings</h1>
      </div>

      <div className="p-4  space-y-6">
        {/* Watermark Source */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Source</h3>

          <div>
            <input type="file" id="watermark-upload" accept="image/png, image/jpeg, image/jpg, image/svg+xml" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
            <button
              className={`w-full flex items-center justify-center px-4 py-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors ${isUploadingImage ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => document.getElementById("watermark-upload")?.click()}
              disabled={isUploadingImage}
            >
              {isUploadingImage ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 mr-2" />
                  Choose file
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">Supports: PNG, JPG, JPEG, SVG</p>
          </div>
        </div>

        {/* Position Info */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Position</h3>
          <div className="bg-indigo-50 text-[#375DFB] p-3 rounded-md text-sm">
            <p className="flex items-start">
              <Info className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-xs sm:text-sm">Drag and drop the watermark on the preview image to set its position.</span>
            </p>
          </div>
        </div>

        {/* Appearance */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-4">Appearance</h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Opacity</label>
                <span className="text-sm text-gray-500">{opacity}%</span>
              </div>
              <Slider value={[opacity]} min={0} max={100} step={1} onValueChange={(value) => setOpacity(value[0])} className="py-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Scale</label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{scale}%</span>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={scale}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setScale(Math.max(1, Math.min(1000, value)));
                    }}
                    className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <Slider value={[scale]} min={1} max={500} step={1} onValueChange={(value) => setScale(value[0])} className="py-2" />
              <p className="text-xs text-gray-500 mt-1">Scale represents percentage of image width. Values over 100% may be adjusted to fit.</p>
              {scale > 100 && <p className="text-xs text-amber-600 mt-1">⚠️ Large scale values may be automatically adjusted to fit the image dimensions</p>}
            </div>
          </div>
        </div>

        {/* Preview Images */}
        {/* <div> */}
        {/* <h3 className="text-sm font-medium text-gray-500 mb-3">Preview Image</h3> */}
        {/* <div className="space-y-2 max-h-48 overflow-y-auto"> */}
        {/* {allImages.map((image) => (
              <div key={image.id} className={`flex items-center p-2 rounded-md border cursor-pointer transition-all ${selectedBackgroundImage?.id === image.id ? "border-indigo-500 bg-indigo-50" : "border-transparent hover:bg-gray-50"}`} onClick={() => handleSelectImage(image)}>
                <img src={image.url} className="w-10 h-8 object-cover rounded-sm mr-3" alt={image.name} />
                <span className={`text-sm font-medium ${selectedBackgroundImage?.id === image.id ? "text-indigo-700" : "text-gray-600"}`}>{image.name}</span>
              </div>
            ))} */}

        {/* Hidden file input for background image upload */}
        {/* <input type="file" id="background-image-upload" accept="image/png, image/jpeg, image/jpg, image/webp" className="hidden" onChange={handleBackgroundImageUpload} /> */}

        {/* <button className="w-full flex items-center justify-center px-4 py-2 mt-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors" onClick={() => document.getElementById("background-image-upload")?.click()}> */}
        {/* <Plus className="w-4 h-4 mr-2" /> */}
        {/* Add your photo */}
        {/* </button> */}
        {/* </div> */}
        {/* </div> */}

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={onSave}
            disabled={isSaving || isUploadingImage}
            className=" text-[14px] w-full flex items-center justify-center px-4 py-2 bg-[#375DFB] text-white rounded-md hover:bg-[#3357e8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Watermark Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

const WatermarkEditor = ({ opacity, scale, setScale, watermarkPosition, setWatermarkPosition, watermarkImage, customBackgroundImages, selectedBackgroundImage }) => {
  const [currentImage, setCurrentImage] = useState(sampleImages[0]);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [initialScale, setInitialScale] = useState(0);

  const canvasRef = useRef(null);
  const watermarkRef = useRef(null);

  // Update current image when selectedBackgroundImage changes
  useEffect(() => {
    if (selectedBackgroundImage) {
      setCurrentImage(selectedBackgroundImage);
    }
  }, [selectedBackgroundImage]);

  // Handle watermark dragging
  const handleMouseDown = (e) => {
    if (!watermarkRef.current) return;

    setIsDragging(true);

    const watermarkRect = watermarkRef.current.getBoundingClientRect();
    setDragStartPos({
      x: e.clientX - watermarkRect.left - watermarkRect.width / 2,
      y: e.clientY - watermarkRect.top - watermarkRect.height / 2,
    });
  };

  // Handle resize start
  const handleResizeStart = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    setInitialScale(scale);
    setResizeStartPos({
      x: e.clientX,
      y: e.clientY,
    });
  };

  // Handle mouse movement for both dragging and resizing
  const handleMouseMove = (e) => {
    if (!canvasRef.current || !watermarkRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();

    if (isDragging) {
      // Calculate new position based on mouse movement
      let x = e.clientX - canvasRect.left - dragStartPos.x;
      let y = e.clientY - canvasRect.top - dragStartPos.y;

      // Convert to percentage relative to canvas
      const xPercent = (x / canvasRect.width) * 100;
      const yPercent = (y / canvasRect.height) * 100;

      // Clamp values to keep watermark within canvas bounds
      const clampedX = Math.max(5, Math.min(95, xPercent));
      const clampedY = Math.max(5, Math.min(95, yPercent));

      setWatermarkPosition({ x: clampedX, y: clampedY });
    } else if (isResizing) {
      // Calculate distance from initial resize position
      const dx = e.clientX - resizeStartPos.x;
      const dy = e.clientY - resizeStartPos.y;

      // Calculate scale change based on diagonal distance
      const distance = Math.sqrt(dx * dx + dy * dy);
      const direction = dx + dy > 0 ? 1 : -1; // Determine if dragging outward or inward

      // Scale the distance to a reasonable scale change rate
      const scaleChange = (distance * direction) / 5;

      let newScale = initialScale + scaleChange;

      // Clamp scale within bounds
      newScale = Math.max(1, Math.min(500, newScale));

      setScale(Math.round(newScale));
    }
  };

  // Handle mouse up - stop all interactions
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  // Add global event listeners for mouse movement and release
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStartPos, resizeStartPos, initialScale, scale]);

  const navigateImage = (direction) => {
    // Combine sample images with custom background images
    const allImages = [...sampleImages, ...customBackgroundImages];
    const currentIndex = allImages.findIndex((img) => img.id === currentImage.id);

    if (direction === "next") {
      setCurrentImage(allImages[(currentIndex + 1) % allImages.length]);
    } else {
      setCurrentImage(allImages[(currentIndex - 1 + allImages.length) % allImages.length]);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow bg-gray-100   rounded-lg flex  relative overflow-hidden" style={{ minHeight: "60vh" }}>
        {/* Checkered background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(45deg, #f1f5f9 25%, transparent 25%), 
                           linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), 
                           linear-gradient(45deg, transparent 75%, #f1f5f9 75%), 
                           linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)`,
            backgroundSize: "20px 20px",
          }}
        ></div>

        {/* Canvas with the preview image */}
        <div ref={canvasRef} className="relative w-full max-w-3xl aspect-[4/3] bg-white rounded-md shadow-lg overflow-hidden">
          <img src={currentImage.url} alt={currentImage.name} className="w-full h-full object-cover" />

          {/* Draggable Watermark element */}
          <div
            ref={watermarkRef}
            className="absolute cursor-move group select-none"
            style={{
              left: `${watermarkPosition.x}%`,
              top: `${watermarkPosition.y}%`,
              transform: "translate(-50%, -50%)",
              opacity: opacity / 100,
              pointerEvents: "auto",
            }}
            onMouseDown={handleMouseDown}
          >
            <div className="relative">
              <img
                src={watermarkImage}
                alt="Watermark"
                style={{
                  filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.5))",
                  userSelect: "none",
                  width: `${Math.min(scale * 3, 300)}px`, // Scale affects image size - capped for preview
                  height: "auto",
                }}
                className="pointer-events-none max-w-none"
                draggable={false}
              />

              {/* Resize handle - only visible on hover */}
              <div
                className="absolute -bottom-2 -right-2 bg-[#375DFB] rounded-full p-1.5 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border-2 border-white"
                onMouseDown={handleResizeStart}
                style={{
                  transform: "none",
                  zIndex: 10,
                }}
              >
                <Maximize2 className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Toolbar */}
        {/* <div className="absolute bottom-9 left-1/2 -translate-x-1/2 bg-white/90 rounded-lg shadow-md p-1.5 flex items-center space-x-4 text-sm text-gray-600">
          <button className="p-1.5 rounded hover:bg-gray-200 transition-colors" onClick={() => navigateImage("prev")}>
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2">
            <Image className="w-4 h-4" />
            <span>{currentImage.name}</span>
          </div>

          <button className="p-1.5 rounded hover:bg-gray-200 transition-colors" onClick={() => navigateImage("next")}>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div> */}
      </div>
    </div>
  );
};

const Header = ({ onDiscard, onPublish, hasUnsavedChanges, isSaving }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      {/* <h1 className="font-medium text-[24px] text-gray-800">Photo Watermark</h1> */}
      <SubPageHeader title="Photo Watermark" line={false} />
      <div className="flex items-center space-x-2">
        <button
          className="inline-flex items-center justify-center px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          onClick={onDiscard}
          disabled={!hasUnsavedChanges}
        >
          Discard
        </button>
        {hasUnsavedChanges && (
          <button
            className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onPublish}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Publish Changes"}
          </button>
        )}
      </div>
    </div>
  );
};

export default function WatermarkApp(props) {
  const [opacity, setOpacity] = useState(80);
  const [scale, setScale] = useState(15);
  const [watermarkPosition, setWatermarkPosition] = useState({ x: 50, y: 50 });
  const [watermarkImage, setWatermarkImage] = useState(
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjNjM2NkYxIiBvcGFjaXR5PSIwLjgiLz4KPHRleHQgeD0iNTAiIHk9IjU1IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkxPR088L3RleHQ+Cjwvc3ZnPgo="
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedSettings, setSavedSettings] = useState(null);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [isExist, setIsExist] = useState(false);
  const [customBackgroundImages, setCustomBackgroundImages] = useState([]);
  const [selectedBackgroundImage, setSelectedBackgroundImage] = useState(null);
  const [eventId, setEventId] = useState(null);

  // State for tracking original settings and changes
  const [originalSettings, setOriginalSettings] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (props.openData.data) {
      setEventId(props.openData.data._id);
    }
  }, [props]);

  // Load existing watermark settings on component mount
  useEffect(() => {
    loadWatermarkSettings(eventId);
  }, [eventId]);

  // Function to check if current settings differ from original
  const checkForChanges = useCallback(() => {
    if (!originalSettings) {
      setHasUnsavedChanges(false);
      return;
    }

    const currentSettings = {
      opacity,
      scale,
      watermarkPosition,
      watermarkImage,
    };

    const hasChanges = JSON.stringify(currentSettings) !== JSON.stringify(originalSettings);
    setHasUnsavedChanges(hasChanges);
  }, [originalSettings, opacity, scale, watermarkPosition, watermarkImage]);

  // Check for changes whenever any setting changes
  useEffect(() => {
    checkForChanges();
  }, [checkForChanges]);

  // Function to reset settings to original values
  const handleDiscard = () => {
    if (!originalSettings) return;

    setOpacity(originalSettings.opacity);
    setScale(originalSettings.scale);
    setWatermarkPosition(originalSettings.watermarkPosition);
    setWatermarkImage(originalSettings.watermarkImage);
    setCustomBackgroundImages([]);
    setSelectedBackgroundImage(null);

    if (window.showMessage) {
      window.showMessage({
        content: "Changes discarded. Settings restored to original values.",
        type: 0,
        icon: "info",
      });
    }
  };

  const loadWatermarkSettings = async (eventId) => {
    setIsLoading(true);
    try {
      if (eventId) {
        const response = await getData({ event: eventId }, "water-mark-settings");

        if (response.status === 200 && response.data?.data?.length > 0) {
          setIsExist(true);
          const settings = response.data.data[0]; // Get the first settings for this event
          setSavedSettings(settings);

          // Load the settings into the form - only for image mode
          if (settings.mode === "Image" && settings.imageSettings?.imageUrl) {
            // Construct full CDN URL for display
            const cdnUrl = `https://event-manager.syd1.digitaloceanspaces.com/${settings.imageSettings.imageUrl}`;
            setWatermarkImage(cdnUrl);
          }

          // Load appearance settings
          if (settings.appearance) {
            setOpacity(settings.appearance.opacity || 80);
            setScale(settings.appearance.scale || 15);
          }

          // Load position settings
          if (settings.defaultPosition) {
            setWatermarkPosition({
              x: settings.defaultPosition.left || 50,
              y: settings.defaultPosition.top || 50,
            });
          }

          // Store original settings for comparison
          const originalSettingsData = {
            opacity: settings.appearance?.opacity || 80,
            scale: settings.appearance?.scale || 15,
            watermarkPosition: {
              x: settings.defaultPosition?.left || 50,
              y: settings.defaultPosition?.top || 50,
            },
            watermarkImage: settings.imageSettings?.imageUrl
              ? `https://event-manager.syd1.digitaloceanspaces.com/${settings.imageSettings.imageUrl}`
              : "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjNjM2NkYxIiBvcGFjaXR5PSIwLjgiLz4KPHRleHQgeD0iNTAiIHk9IjU1IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkxPR088L3RleHQ+Cjwvc3ZnPgo=",
          };

          setOriginalSettings(originalSettingsData);
          console.log("Watermark settings loaded successfully");
        } else {
          // No existing settings found - set original settings to current default values
          const defaultOriginalSettings = {
            opacity: 80,
            scale: 15,
            watermarkPosition: { x: 50, y: 50 },
            watermarkImage:
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjNjM2NkYxIiBvcGFjaXR5PSIwLjgiLz4KPHRleHQgeD0iNTAiIHk9IjU1IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkxPR088L3RleHQ+Cjwvc3ZnPgo=",
          };
          setOriginalSettings(defaultOriginalSettings);
          console.log("No existing settings found, using default values");
        }
      }
    } catch (error) {
      console.error("Error loading watermark settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Prepare the data according to the waterMarkSettings model
      const watermarkData = {
        mode: "Image",
        appearance: {
          opacity: opacity,
          scale: scale,
        },
        defaultPosition: {
          left: watermarkPosition.x,
          top: watermarkPosition.y,
        },
        event: eventId,
      };

      // Add image settings
      if (watermarkImage) {
        // Extract the relative path from the CDN URL
        let imageUrl = watermarkImage;
        if (watermarkImage.startsWith("https://event-manager.syd1.digitaloceanspaces.com/")) {
          imageUrl = watermarkImage.replace("https://event-manager.syd1.digitaloceanspaces.com/", "");
        }

        watermarkData.imageSettings = {
          imageUrl: imageUrl, // Store relative path in database
          fileName: "watermark-image",
          fileSize: 0, // You can calculate this if needed
          mimeType: "image/png", // You can detect this from the file
        };
      }

      console.log("Saving watermark data:", watermarkData);

      let response;
      if (isExist && savedSettings?._id) {
        // Update existing settings using putData
        console.log("Updating existing watermark settings with ID:", savedSettings._id);
        response = await putData({ ...watermarkData, id: savedSettings._id }, "water-mark-settings");
      } else {
        // Create new settings using postData
        console.log("Creating new watermark settings");
        response = await postData(watermarkData, "water-mark-settings");
      }

      if (response.status === 200 || response.status === 201) {
        console.log("Watermark settings saved successfully");

        // Update saved settings with the response data
        if (response.data?.data) {
          setSavedSettings(response.data.data);
          setIsExist(true); // Mark as existing after successful save
        }

        // Update original settings to current values after successful save
        const updatedOriginalSettings = {
          opacity,
          scale,
          watermarkPosition,
          watermarkImage,
        };
        setOriginalSettings(updatedOriginalSettings);

        // Show success message
        if (window.showMessage) {
          window.showMessage({
            content: "Watermark settings saved successfully!",
            type: 0,
            icon: "success",
          });
        }
      } else {
        console.error("Failed to save watermark settings:", response);
        if (window.showMessage) {
          window.showMessage({
            content: "Failed to save watermark settings. Please try again.",
            type: 1,
            icon: "error",
          });
        }
      }
    } catch (error) {
      console.error("Error saving watermark settings:", error);
      if (window.showMessage) {
        window.showMessage({
          content: "Error saving watermark settings. Please try again.",
          type: 1,
          icon: "error",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackgroundImageUpload = (imageUrl, fileName) => {
    const newImage = {
      id: Date.now(), // Use timestamp as unique ID
      name: fileName || "Custom Image",
      url: imageUrl,
      orientation: "custom",
    };

    setCustomBackgroundImages((prev) => [...prev, newImage]);
    setSelectedBackgroundImage(newImage);

    if (window.showMessage) {
      window.showMessage({
        content: "Background image added successfully!",
        type: 0,
        icon: "success",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <ListTableSkeleton viewMode={"list"} displayColumn={"single"} />
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="w-full">
        <Header onDiscard={handleDiscard} onPublish={handleSave} hasUnsavedChanges={hasUnsavedChanges} isSaving={isSaving} />

        <div className="  w-full flex flex-col gap-2  md:flex-row">
          {/* Left Panel: Preview Canvas */}
          <div className="lg:w-[70%] w-full">
            <WatermarkEditor
              opacity={opacity}
              scale={scale}
              setScale={setScale}
              watermarkPosition={watermarkPosition}
              setWatermarkPosition={setWatermarkPosition}
              watermarkImage={watermarkImage}
              customBackgroundImages={customBackgroundImages}
              selectedBackgroundImage={selectedBackgroundImage}
            />
          </div>
          {/* Right Panel: Settings */}
          <div className="lg:w-[30%] md:w-[40%] w-full">
            <WatermarkSettings
              opacity={opacity}
              setOpacity={setOpacity}
              scale={scale}
              setScale={setScale}
              setWatermarkImage={setWatermarkImage}
              onSave={handleSave}
              isSaving={isSaving}
              savedSettings={savedSettings}
              eventId={eventId}
              onBackgroundImageUpload={handleBackgroundImageUpload}
              customBackgroundImages={customBackgroundImages}
              selectedBackgroundImage={selectedBackgroundImage}
              onSelectBackgroundImage={setSelectedBackgroundImage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
