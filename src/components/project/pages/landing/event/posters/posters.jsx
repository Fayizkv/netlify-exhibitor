import React, { useEffect, useState } from "react";
import AutoForm from "../../../../../core/autoform/AutoForm";
import { noimage } from "../../../../../../images";
import html2canvas from "html2canvas";
import { ExternalLink, Download, X, Share2, Twitter, MessageCircle, Loader2 } from "lucide-react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { postData } from "../../../../../../backend/api";
const Button = styled.button`
  background-color: ${(props) => props.event.primaryColour};
  color: white;
  outline: none;
  border: none;
  padding: 15px 20px;
  min-width: 100px;
  cursor: ${(props) => (props.isDisabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.isDisabled ? "0.5" : "1")};
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  gap: 10px;
  border-radius: 9px;
  justify-content: center;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${(props) => (props.isDisabled ? props.event.primaryColour : props.event.primaryDark)};
  }

  &:active {
    background-color: ${(props) => props.event.primaryDarker};
  }

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <span>{message}</span>
      </div>
    </div>
  );
};

const Posters = ({ colors, data, config, setLoaderBox }) => {
  console.log(colors);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [userData, setUserData] = useState({});
  const [imageData, setImageData] = useState({});
  const [attributes, setAttributes] = useState([]);
  const [formValid, setFormValid] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [scale, setScale] = useState(10);
  const [originalWidth, setOriginalWidth] = useState(500);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [uniqueId, setUniqueId] = useState(""); // State to hold the unique ID
  const [isDownloading, setIsDownloading] = useState(false); // Add loading state
  const [showSuccess, setShowSuccess] = useState(false); // Add success message state
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null); // Add state for generated image URL
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Generate a unique ID on component mount
    const id = uuidv4();
    setUniqueId(id);
  }, []);
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const calculateReduction = () => {
      if (originalWidth <= screenWidth) {
      } else {
        const reduction = ((originalWidth - screenWidth) / originalWidth) * 100;
        setScale(9.5 - Math.round(reduction * 100) / 100 / 10); // Round to 2 decimal places
      }
    };

    calculateReduction();
  }, [originalWidth, screenWidth]);

  // setLoaderBox(true, "Please wait while we are generating your poster!")
  useEffect(() => {
    if (config?.length > 0) {
      const ticket = config[0];
      const parsedData = JSON.parse(ticket.imageBulderData);
      setOriginalWidth(ticket.layoutWidth);
      const formAttributes = parsedData.map((attribute) => {
        if (attribute.type === "image") {
          return {
            type: "image",
            placeholder: attribute.label,
            name: `image-${attribute.id}`,
            validation: "",
            default: "false",
            tag: true,
            label: attribute.label,
            required: true,
            view: true,
            add: true,
            update: true,
            height: attribute.height,
            width: attribute.width,
          };
        } else if (attribute.type === "text") {
          return {
            type: "text",
            placeholder: attribute.label,
            name: `text-${attribute.id}`,
            validation: "",
            default: "",
            label: attribute.label,
            tag: true,
            required: true,
            view: true,
            add: true,
            update: true,
          };
        } else {
          return null;
        }
      });

      setAttributes(formAttributes.filter((attr) => attr !== null));
      setSelectedTicket(ticket);
    }
  }, [config]);

  // const GeneratePoster = async () => {
  //   try {
  //     const post = userData;
  //     setLoaderBox(true, "Please wait while we are generating your poster!");
  //     const response = await postDataCustom({ ...post, uniqueId, posterId: selectedTicket._id }, "https://poster-builder-api.eventhex.ai/api/v1/user/get-my-poster");

  //     if (response.status === 200) {
  //       const base64 = response.data.response;
  //       const binaryData = atob(base64);
  //       const arrayBuffer = new ArrayBuffer(binaryData.length);
  //       const uint8Array = new Uint8Array(arrayBuffer);

  //       for (let i = 0; i < binaryData.length; i++) {
  //         uint8Array[i] = binaryData.charCodeAt(i);
  //       }

  //       const blob = new Blob([uint8Array], { type: "image/png" });

  //       // Use the navigator.msSaveBlob() method to trigger the download
  //       if (navigator.msSaveBlob) {
  //         navigator.msSaveBlob(blob, "event-poster.png");
  //       } else {
  //         // Fallback to the previous method for non-Apple devices
  //         const downloadUrl = URL.createObjectURL(blob);
  //         const downloadLink = document.createElement("a");
  //         downloadLink.href = downloadUrl;
  //         downloadLink.download = "event-poster.png";
  //         document.body.appendChild(downloadLink);
  //         downloadLink.click();
  //         document.body.removeChild(downloadLink);
  //         URL.revokeObjectURL(downloadUrl);
  //       }

  //       setLoaderBox(false);
  //     } else {
  //       console.error("Error generating poster:", response.error);
  //       setLoaderBox(false);
  //     }
  //   } catch (error) {
  //     console.error("Error submitting poster data:", error);
  //   }
  // };
  const GeneratePoster = async () => {
    try {
      setIsDownloading(true);
      // setLoaderBox(true, "Generating your poster...");

      // Create a temporary container for the full-size poster
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "-9999px";
      document.body.appendChild(tempContainer);

      // Create full-size poster element
      const fullSizePoster = document.createElement("div");
      fullSizePoster.id = "fullSizePoster";
      fullSizePoster.className = "Poster";
      fullSizePoster.style.position = "relative";
      fullSizePoster.style.width = `${selectedTicket.layoutWidth}px`;
      fullSizePoster.style.height = `${selectedTicket.layoutHeight}px`;
      fullSizePoster.style.backgroundColor = "white";
      fullSizePoster.style.overflow = "hidden";
      tempContainer.appendChild(fullSizePoster);

      // Add background image using proxy
      const bgImage = document.createElement("img");
      const bgImageUrl = `${import.meta.env.VITE_API}campaign/image-proxy?imageUrl=${encodeURIComponent(selectedTicket.backgroundImage)}`;

      bgImage.crossOrigin = "anonymous"; // Enable CORS
      bgImage.src = bgImageUrl;
      bgImage.style.position = "absolute";
      bgImage.style.inset = "0";
      bgImage.style.width = "100%";
      bgImage.style.height = "100%";
      bgImage.style.objectFit = "cover";
      bgImage.style.objectPosition = "center";

      const elements = JSON.parse(selectedTicket.imageBulderData);
      const hasBackground = elements.some((element) => element.type === "background");
      if (!hasBackground) {
        fullSizePoster.appendChild(bgImage);
      }

      // Wait for background image to load
      await new Promise((resolve, reject) => {
        bgImage.onload = resolve;
        bgImage.onerror = () => {
          console.error("Background image failed to load");
          resolve(); // Continue even if bg image fails
        };
      });

      // Add all elements at full size

      for (const element of elements) {
        if (element.type === "text") {
          const textDiv = document.createElement("div");
          textDiv.style.position = "absolute";
          textDiv.style.color = element.color;
          textDiv.style.fontSize = `${element.fontSize}px`;
          textDiv.style.fontWeight = element.fontWeight;
          textDiv.style.fontStyle = element.fontStyle;
          textDiv.style.textAlign = element.textAlign;
          textDiv.style.lineHeight = `${element.lineHeight}px`;
          textDiv.style.top = `${element.positionY}px`;
          textDiv.style.left = `${element.positionX}px`;
          textDiv.style.width = `${element.width}px`;
          textDiv.style.height = `${element.height}px`;
          textDiv.textContent = userData?.["text-" + element.id] || element.label;
          fullSizePoster.appendChild(textDiv);
        } else if (element.type === "background") {
          fullSizePoster.appendChild(bgImage);
        } else if (element.type === "image") {
          const imgContainer = document.createElement("div");
          imgContainer.style.position = "absolute";
          imgContainer.style.top = `${element.positionY}px`;
          imgContainer.style.left = `${element.positionX}px`;
          imgContainer.style.width = `${element.width}px`;
          imgContainer.style.height = `${element.height}px`;
          imgContainer.style.minWidth = `${element.width}px`;
          imgContainer.style.minHeight = `${element.height}px`;
          imgContainer.style.maxWidth = `${element.width}px`;
          imgContainer.style.maxHeight = `${element.height}px`;
          imgContainer.style.borderRadius = `${element.borderRadius}px`;
          imgContainer.style.overflow = "hidden";
          imgContainer.style.backgroundColor = "#ffffff";
          if (element.borderWidth) {
            imgContainer.style.border = `${element.borderWidth}px solid ${element.borderColor}`;
          }

          const imgSrc = imageData?.["image-" + element.id + "preview"];
          const imageUrl = imgSrc?.startsWith("http") ? `${import.meta.env.VITE_API}campaign/image-proxy?imageUrl=${encodeURIComponent(imgSrc)}` : (imgSrc ?? noimage);

          try {
            await new Promise((resolve, reject) => {
              const tempImg = new Image();
              tempImg.onload = () => {
                imgContainer.style.backgroundImage = `url(${imageUrl})`;
                imgContainer.style.backgroundSize = "cover";
                imgContainer.style.backgroundPosition = "center";
                imgContainer.style.backgroundRepeat = "no-repeat";
                resolve();
              };
              tempImg.onerror = () => reject(new Error("Image failed to load"));
              tempImg.src = imageUrl;

              // Set timeout for image loading
              setTimeout(() => reject(new Error("Image load timeout")), 5000);
            }).catch((error) => {
              console.error("Image loading error:", error);
              imgContainer.style.backgroundImage = `url(${noimage})`;
              imgContainer.style.backgroundSize = "cover";
              imgContainer.style.backgroundPosition = "center";
              imgContainer.style.backgroundRepeat = "no-repeat";
            });
          } catch (error) {
            console.error("Final image loading error:", error);
            imgContainer.style.backgroundImage = `url(${noimage})`;
            imgContainer.style.backgroundSize = "cover";
            imgContainer.style.backgroundPosition = "center";
            imgContainer.style.backgroundRepeat = "no-repeat";
          }

          fullSizePoster.appendChild(imgContainer);
        }
      }
      // Small delay to ensure all elements are properly rendered
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Generate canvas from the full-size poster
      const canvas = await html2canvas(fullSizePoster, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: true,
        width: selectedTicket.layoutWidth,
        height: selectedTicket.layoutHeight,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById("fullSizePoster");
          if (clonedElement) {
            // Ensure all images maintain cover behavior in clone
            const images = clonedElement.getElementsByTagName("img");
            Array.from(images).forEach((img) => {
              img.style.objectFit = "cover";
              img.style.width = "100%";
              img.style.height = "100%";
            });
          }
        },
      });

      // Convert to blob and download
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error("Failed to create blob");
            setLoaderBox(false);
            setIsDownloading(false);
            return;
          }

          // Create and save the URL for sharing
          const url = URL.createObjectURL(blob);
          setGeneratedImageUrl(url);

          // Create and trigger download
          const link = document.createElement("a");
          link.href = url;
          link.download = `${data?.title || "event"}-poster.png`;
          document.body.appendChild(link);
          link.click();

          // Cleanup download elements
          document.body.removeChild(link);

          // Note: Don't revoke the URL here as we need it for sharing
          setLoaderBox(false);
          setIsDownloading(false);
          document.body.removeChild(tempContainer);
          setShowSuccess(true);
        },
        "image/png",
        1.0
      );
      // Create a clean version of userData without binary data
      const cleanUserData = Object.entries(userData).reduce((acc, [key, value]) => {
        // Only remove File and Blob instances
        if (key.startsWith("image-")) {
          return acc;
        }
        acc[key] = value;

        return acc;
      }, {});

      await postData({ ...cleanUserData, uniqueId, posterId: selectedTicket._id }, "share-poster/update-count");
    } catch (error) {
      console.error("Error generating poster:", error);
      setLoaderBox(false);
      setIsDownloading(false);
      const tempContainer = document.querySelector('div[style*="-9999px"]');
      if (tempContainer) {
        document.body.removeChild(tempContainer);
      }
    }
  };

  // Cleanup function for the generated image URL
  useEffect(() => {
    return () => {
      if (generatedImageUrl) {
        URL.revokeObjectURL(generatedImageUrl);
      }
    };
  }, [generatedImageUrl]);

  const showToast = (message) => {
    setToast(message);
  };

  const handleShare = async (platform) => {
    const shareUrl = window.location.href;
    const shareText = `Check out my poster for ${data?.title || "the event"}!`;

    const copyToClipboard = async (text) => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
          return true;
        }

        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand("copy");
          textArea.remove();
          return true;
        } catch (err) {
          textArea.remove();
          return false;
        }
      } catch (err) {
        return false;
      }
    };

    switch (platform) {
      case "share":
        try {
          if (navigator.share && navigator.canShare) {
            try {
              const blob = await fetch(generatedImageUrl).then((r) => r.blob());
              const file = new File([blob], `${data?.title || "event"}-poster.png`, { type: "image/png" });
              const shareData = {
                title: data?.title || "Event Poster",
                text: shareText,
                url: shareUrl,
                files: [file],
              };

              if (navigator.canShare(shareData)) {
                await navigator.share(shareData);
                return;
              }
            } catch (err) {
              console.error("Failed to share with files:", err);
            }

            await navigator.share({
              title: data?.title || "Event Poster",
              text: shareText,
              url: shareUrl,
            });
          } else {
            const copied = await copyToClipboard(shareUrl);
            if (copied) {
              showToast("Link copied to clipboard");
            } else {
              showToast("Unable to copy link automatically");
            }
          }
        } catch (err) {
          console.error("Failed to share:", err);
          const copied = await copyToClipboard(shareUrl);
          if (copied) {
            showToast("Link copied to clipboard");
          } else {
            showToast("Unable to copy link automatically");
          }
        }
        break;

      case "twitter":
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, "_blank", "width=600,height=400");
        break;

      case "whatsapp":
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
          window.location.href = whatsappUrl;
        } else {
          const whatsappWebUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
          window.open(whatsappWebUrl, "_blank");
        }
        break;

      default:
        return;
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img src={import.meta.env.VITE_CDN + data?.logo} alt="Logo" className="h-12 w-auto object-contain" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-200px)]">
              {/* Form Section */}
              <div className="w-full lg:w-2/5 p-8">
                {selectedTicket && (
                  <div className="flex flex-col h-full">
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-1" style={{ color: colors.primaryBase }}>
                        {selectedTicket.title}
                      </h3>
                      <p className="text-sm text-gray-500"> {selectedTicket.description}</p>
                    </div>
                    <div className="overflow-y-auto">
                      <AutoForm
                        autoUpdate={true}
                        liveData={true}
                        useCaptcha={false}
                        key={`type-${selectedTicket.id}`}
                        useCheckbox={false}
                        customClass="embed"
                        description=""
                        formValues={{}}
                        formMode={"single"}
                        formType="post"
                        header=" "
                        formInput={attributes}
                        submitHandler={(data, status) => {
                          setFormValid(status);
                          setUserData((prev) => ({ ...prev, ...data }));
                          Object.entries(data).forEach(([key, value]) => {
                            if (key.startsWith("image-")) {
                              const file = data[key];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  setImageData((prev) => ({ ...prev, [`${key}preview`]: e.target.result }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }
                          });
                        }}
                        button={"Download Poster"}
                        isOpenHandler={() => {}}
                        css="plain embed head-hide landing shadow-none"
                      />
                    </div>
                    <div className="flex flex-col gap-4 mt-8">
                      <div className="block sm:hidden">
                        <Button
                          icon="open"
                          type="button"
                          value="Preview"
                          onClick={() => setShowPreview(true)}
                          className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg shadow-sm transition-all duration-200 text-white"
                          event={colors}
                        >
                          <ExternalLink size={20} />
                          Preview
                        </Button>
                      </div>
                      <div className="hidden sm:block">
                        <Button
                          icon="download"
                          type="button"
                          value="Generate Poster"
                          isDisabled={!formValid || isDownloading}
                          onClick={GeneratePoster}
                          className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                          event={colors}
                        >
                          {isDownloading ? (
                            <>
                              <Loader2 className="animate-spin" size={20} />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Download size={20} />
                              Generate Poster
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Vertical Separator */}
              <div className="hidden lg:block w-px bg-gray-200 self-center h-[60%]" />

              {/* Preview Section */}
              <div className="hidden lg:block w-full lg:w-3/5 p-8">
                {selectedTicket && (
                  <div className="relative flex items-center justify-center h-full">
                    <div
                      className="Poster relative bg-white rounded-lg shadow-lg overflow-hidden max-w-full"
                      style={{
                        width: selectedTicket.layoutWidth * scale * 0.1,
                        height: selectedTicket.layoutHeight * scale * 0.1,
                        minWidth: selectedTicket.layoutWidth * scale * 0.1,
                        minHeight: selectedTicket.layoutHeight * scale * 0.1,
                        transform: `scale(${Math.min(1, (window.innerWidth * 0.25) / (selectedTicket.layoutWidth * scale * 0.1))})`,
                        transformOrigin: "center center",
                      }}
                    >
                      <img className="absolute inset-0 w-full h-full object-contain" alt="background" src={import.meta.env.VITE_CDN + selectedTicket.backgroundImage} />
                      <pre>{selectedTicket.imageBulderData}</pre>
                      {JSON.parse(selectedTicket.imageBulderData).map((element) => (
                        <React.Fragment key={element.id}>
                          {element.type === "text" && (
                            <div
                              className="absolute"
                              style={{
                                color: element.color,
                                fontSize: `${element.fontSize * scale * 0.1}px`,
                                fontWeight: element.fontWeight,
                                fontStyle: element.fontStyle,
                                textAlign: element.textAlign,
                                lineHeight: `${element.lineHeight * scale * 0.1}px`,
                                top: `${element.positionY * scale * 0.1}px`,
                                left: `${element.positionX * scale * 0.1}px`,
                                width: `${element.width * scale * 0.1}px`,
                                height: `${element.height * scale * 0.1}px`,
                              }}
                            >
                              {userData?.["text-" + element.id] || element.label}
                            </div>
                          )}
                          {element.type === "image" && (
                            <img
                              className="absolute object-cover"
                              style={{
                                top: `${element.positionY * scale * 0.1}px`,
                                left: `${element.positionX * scale * 0.1}px`,
                                width: `${element.width * scale * 0.1}px`,
                                height: `${element.height * scale * 0.1}px`,
                                borderRadius: `${element.borderRadius * scale * 0.1}px`,
                                border: element.borderWidth ? `${element.borderWidth * scale * 0.1}px solid ${element.borderColor}` : "none",
                              }}
                              src={imageData?.["image-" + element.id + "preview"] ?? noimage}
                              alt="Element"
                              onError={(e) => (e.target.src = noimage)}
                            />
                          )}
                          {element.type === "background" && (
                            <img
                              className="absolute object-cover"
                              style={{
                                top: `0px`,
                                left: `0px`,
                                width: `100%`,
                                height: `100%`,
                                borderRadius: `0px`,
                                border: `none`,
                              }}
                              src={import.meta.env.VITE_CDN + selectedTicket.backgroundImage}
                              alt="Element"
                              onError={(e) => (e.target.src = noimage)}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden">
          <div className="h-full w-full flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-auto shadow-xl">
              <div className="sticky top-0 z-10 bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-semibold" style={{ color: colors.primaryBase }}>
                  Preview Poster
                </h3>
                <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all duration-200" aria-label="Close preview">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 flex items-center justify-center">
                {selectedTicket && (
                  <div className="relative">
                    <div
                      className="Poster relative bg-white rounded-lg overflow-hidden shadow-lg"
                      style={{
                        width: selectedTicket.layoutWidth * scale * 0.1,
                        height: selectedTicket.layoutHeight * scale * 0.1,
                        transform: `scale(${Math.min(1, (window.innerWidth * 0.8) / (selectedTicket.layoutWidth * scale * 0.1))})`,
                        transformOrigin: "top center",
                      }}
                    >
                      <img className="absolute inset-0 w-full h-full object-contain" alt="background" src={import.meta.env.VITE_CDN + selectedTicket.backgroundImage} />
                      {JSON.parse(selectedTicket.imageBulderData).map((element) => (
                        <React.Fragment key={element.id}>
                          {element.type === "text" && (
                            <div
                              className="absolute"
                              style={{
                                color: element.color,
                                fontSize: `${element.fontSize * scale * 0.1}px`,
                                fontWeight: element.fontWeight,
                                fontStyle: element.fontStyle,
                                textAlign: element.textAlign,
                                lineHeight: `${element.lineHeight * scale * 0.1}px`,
                                top: `${element.positionY * scale * 0.1}px`,
                                left: `${element.positionX * scale * 0.1}px`,
                                width: `${element.width * scale * 0.1}px`,
                                height: `${element.height * scale * 0.1}px`,
                              }}
                            >
                              {userData?.["text-" + element.id] || element.label}
                            </div>
                          )}
                          {element.type === "image" && (
                            <img
                              className="absolute object-cover"
                              style={{
                                top: `${element.positionY * scale * 0.1}px`,
                                left: `${element.positionX * scale * 0.1}px`,
                                width: `${element.width * scale * 0.1}px`,
                                height: `${element.height * scale * 0.1}px`,
                                borderRadius: `${element.borderRadius * scale * 0.1}px`,
                                border: element.borderWidth ? `${element.borderWidth * scale * 0.1}px solid ${element.borderColor}` : "none",
                              }}
                              src={imageData?.["image-" + element.id + "preview"] ?? noimage}
                              alt="Element"
                              onError={(e) => (e.target.src = noimage)}
                            />
                          )}
                          {element.type === "background" && (
                            <img
                              className="absolute object-cover"
                              src={import.meta.env.VITE_CDN + selectedTicket.backgroundImage}
                              alt="Element"
                              style={{
                                top: `0px`,
                                left: `0px`,
                                width: `100%`,
                                height: `100%`,
                                borderRadius: `0px`,
                                border: `none`,
                              }}
                              onError={(e) => (e.target.src = noimage)}
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="sticky bottom-0 z-10 bg-white px-6 py-4 border-t border-gray-100">
                <Button
                  icon="download"
                  value="Generate Poster"
                  isDisabled={!formValid || isDownloading}
                  onClick={GeneratePoster}
                  className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                  event={colors}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      Generate Poster
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Thank you for downloading!</h3>
              <p className="text-sm text-gray-500">Share your poster with friends and family</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button onClick={() => handleShare("whatsapp")} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <MessageCircle size={18} />
                WhatsApp
              </button>
              <button onClick={() => handleShare("twitter")} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <Twitter size={18} />
                Twitter
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleShare("share")} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors">
                <Share2 size={18} />
                Share
              </button>
              <button onClick={() => setShowSuccess(false)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-center items-center">
            <span className="text-gray-400 text-base mr-2.5">Powered by</span>
            <a href="https://eventhex.ai/" target="_blank" rel="noopener noreferrer" className="flex items-center hover:opacity-80 transition-opacity -mt-0.5">
              <img src="https://eventhex.ai/wp-content/uploads/2024/09/Layer-1-1.png" alt="Eventhex" className="h-5 w-auto object-contain" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Posters;
