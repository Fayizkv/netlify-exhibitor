import React, { useState, useEffect } from "react";
import { GetIcon } from "../../../../../icons";
import styled from "styled-components";
import { putData, getData } from "../../../../../backend/api";
import { Button } from "../../../../core/elements";
import Accordion from "../../../../core/accordian";
import AttendeePrintModal from "./bulk";

// Styled Components
const Container = styled.div`
  display: flex;
  gap: 2rem;
  padding: 1rem;
  margin: 0 auto;
`;

const FormSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 70%;
`;

const PreviewSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const BadgeOption = styled.div`
  width: 100%;
  margin-top: 1rem;
`;

const BadgeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const BadgeItem = styled.div`
  width: 100%;
`;

const BadgeLabel = styled.label`
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background-color: #f5f5f5;
  }

  .icon-container {
    margin-right: 1rem;
  }

  .text-container {
    flex: 1;

    span {
      display: block;
      font-weight: 500;
      margin-bottom: 0.25rem;
    }

    p {
      color: #666;
      font-size: 0.875rem;
      margin: 0;
    }
  }

  .right-arrow {
    color: #666;
    font-size: 0.875rem;
  }
`;

const CircularIconContainer = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const PreviewImage = styled.div`
  width: 100%;
  height: auto;
  background-color: #f0f0f0;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  img {
    width: 100%;
    object-fit: contain;
  }
`;

const ButtonSection = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 0rem;
`;

const TemplateCard = styled.div`
  border: ${(props) => (props.$isSelected ? "2px solid #2563eb" : "1px solid #e5e7eb")};
  border-radius: 8px;
  overflow: hidden;
`;

const ImageContainer = styled.div`
  cursor: pointer;
`;

const TemplateImage = styled.img`
  width: 100%;
  aspect-ratio: 3/4;
  object-fit: cover;
`;

const TemplateTitle = styled.div`
  padding: 0.5rem;
  text-align: center;
  border-top: 1px solid #e5e7eb;
  background: ${(props) => (props.$isSelected ? "#eff6ff" : "#ffffff")};
`;

const ActionContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  border-top: 1px solid #e5e7eb;
  background: #f8f9fa;
`;

const DownloadButton = styled.button`
  flex: 1;
  padding: 0.5rem;
  font-size: 0.875rem;
  color: #2563eb;
  background: white;
  border: 1px solid #2563eb;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #eff6ff;
  }
`;

const CanvaLink = styled.a`
  flex: 1;
  padding: 0.5rem;
  font-size: 0.875rem;
  color: #666;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  text-decoration: none;
  text-align: center;

  &:hover {
    background: #f8f9fa;
  }
`;

const BadgeComponentsSection = styled.div`
  margin-top: 0rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
`;

const ComponentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
`;

const CheckboxWrapper = styled.div`
  display: inline-block;
  vertical-align: middle;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledCheckbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  padding: 0 40px;
  margin: 20px 0;
`;

const CarouselTrack = styled.div`
  display: flex;
  transition: transform 0.5s ease;
  transform: translateX(-${(props) => props.$currentIndex * (100 / props.$slidesToShow)}%);
`;

const CarouselSlide = styled.div`
  flex: 0 0 ${(props) => 100 / props.$slidesToShow}%;
  padding: 0 10px;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    flex: 0 0 ${(props) => (props.$slidesToShow <= 2 ? "50%" : `${100 / props.$slidesToShow}%`)};
  }

  @media (max-width: 768px) {
    flex: 0 0 100%;
  }
`;

const CarouselArrow = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: all 0.3s ease;

  &:hover {
    background: #f5f5f5;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.prev {
    left: 0;
  }

  &.next {
    right: 0;
  }

  svg {
    width: 20px;
    height: 20px;
    color: #666;
  }
`;

const CarouselWrapper = styled.div`
  overflow: hidden;
`;

const CarouselDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
`;

const Dot = styled.button`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => (props.$active ? "#2563eb" : "#e5e7eb")};
  border: none;
  padding: 0;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background: ${(props) => (props.$active ? "#2563eb" : "#d1d5db")};
  }
`;

const BadgeForm = (props) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isChanged, setIsChanged] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(3);
  const { setMessage } = props;
  // Fetch badge templates
  useEffect(() => {
    const fetchBadgeTemplates = async () => {
      try {
        setLoading(true);
        const response = await getData({}, "badge-template");
        if (response.data?.response) {
          setBadges(response.data.response);
          // Select the first template by default if exists
          if (response.data.response.length > 0) {
            setSelectedTemplate(response.data.response[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching badge templates:", error);
        setMessage({
          type: 2,
          content: "Failed to load badge templates. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBadgeTemplates();
  }, [setMessage]);

  // Set preview image if exists in props
  useEffect(() => {
    const cdnUrl = import.meta.env.VITE_CDN;
    if (props.data?.idCardBackground) {
      setPreviewImage(`${cdnUrl}${props.data.idCardBackground}`);
    }
  }, [props.data]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setImageFile(e.target.files);
        setIsChanged(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTemplateSelect = (badge) => {
    setSelectedTemplate(badge);
    // Reset image if selecting first template
    if (badge._id === badges[0]?._id) {
      setPreviewImage(null);
      setImageFile(null);
      const input = document.getElementById("idCardBackground");
      if (input) input.value = "";
    }
  };

  const handleComponentToggle = (component) => {
    if (!selectedTemplate) return;
    const componentMap = {
      name: "isdisplayname",
      qr: "isQrcode",
      event: "isdisplayEvent",
      ticket: "isdisplayTicket",
      defaultTemplate: "isDefault",
    };

    setSelectedTemplate((prev) => ({
      ...prev,
      [componentMap[component]]: !prev[componentMap[component]],
    }));
    setIsChanged(true); // Set changed to true when components are toggled
  };

  const handleCancel = () => {
    setPreviewImage(null);
    setImageFile(null);
    setMessage({ type: 0, content: "" });
    setIsChanged(false); // Reset changed state
    const input = document.getElementById("idCardBackground");
    if (input) input.value = "";
  };

  const downloadTemplate = async (e, template) => {
    e.stopPropagation();
    try {
      const link = document.createElement("a");
      link.href = `${import.meta.env.VITE_CDN}${template.templateImage}`;
      link.download = `${template.templateName.toLowerCase()}-template.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading template:", error);
      setMessage({
        type: 2,
        content: "Failed to download template. Please try again.",
      });
    }
  };

  const submitChange = async () => {
    if (!selectedTemplate) {
      setMessage({
        type: 2,
        content: "Please select a template",
      });
      return;
    }

    // Only check for image if it's not the first template and no image is uploaded
    if (!imageFile && selectedTemplate._id !== badges[0]?._id) {
      setMessage({
        type: 2,
        content: "Please select an image to upload",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData = {
        id: props.data?._id,
        // isdisplayname: selectedTemplate.isdisplayname,
        // isQrcode: selectedTemplate.isQrcode,
        // isdisplayEvent: selectedTemplate.isdisplayEvent,
        // isdisplayTicket: selectedTemplate.isdisplayTicket,
        // isDefault: selectedTemplate.isDefault,
      };

      // Only add image if it exists
      if (imageFile) {
        requestData.idCardBackground = imageFile;
      }
      const response = await putData(requestData, "ticket");

      if (response?.status === 200) {
        setIsChanged(false); // Reset changed state after successful update
        handleCancel();
        setMessage({
          type: 1,
          content: `Badge updated successfully`,
          proceed: "Okay",
          icon: "deleted",
        });
      } else {
        setMessage({
          type: 1,
          content: "Failed to update badge. Please try again.",
          proceed: "error",
        });
      }
    } catch (error) {
      console.error("Error updating badge:", error);
      setMessage({
        type: 2,
        content: error.message || "Failed to update badge. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSlidesToShow(1);
      } else if (window.innerWidth <= 1024) {
        setSlidesToShow(2);
      } else {
        setSlidesToShow(3);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Add carousel control functions
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + slidesToShow >= badges.length ? prev : prev + 1));
  };
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? 0 : prev - 1));
  };
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <React.Fragment>
      <Container>
        <FormSection>
          <BadgeOption>
            <BadgeList>
              <BadgeItem>
                <Accordion
                  customClass="plain"
                  items={[
                    {
                      key: "template",
                      label: "Choose Badge Template",
                      icon: "template",
                      content: (
                        <React.Fragment>
                          {loading ? (
                            <LoadingSpinner>Loading badge templates...</LoadingSpinner>
                          ) : (
                            <CarouselContainer>
                              <CarouselArrow className="prev" onClick={prevSlide} disabled={currentIndex === 0}>
                                <GetIcon icon={"ArrowLeft"} />
                              </CarouselArrow>
                              <CarouselWrapper>
                                <CarouselTrack $currentIndex={currentIndex} $slidesToShow={slidesToShow}>
                                  {badges.map((badge) => (
                                    <CarouselSlide key={badge._id} $slidesToShow={slidesToShow}>
                                      <TemplateCard $isSelected={selectedTemplate?._id === badge._id}>
                                        <ImageContainer onClick={() => handleTemplateSelect(badge)}>
                                          <TemplateImage src={`${import.meta.env.VITE_CDN}${badge.templateImage}` || "/api/placeholder/250/350"} alt={badge.templateName} />
                                          <TemplateTitle $isSelected={selectedTemplate?._id === badge._id}>{badge.templateName}</TemplateTitle>
                                        </ImageContainer>
                                        <ActionContainer>
                                          <DownloadButton onClick={(e) => downloadTemplate(e, badge)}>Download</DownloadButton>
                                          <CanvaLink href={badge.canvaUrl || "#"} target="_blank" rel="noopener noreferrer">
                                            Edit in Canva
                                          </CanvaLink>
                                        </ActionContainer>
                                      </TemplateCard>
                                    </CarouselSlide>
                                  ))}
                                </CarouselTrack>
                              </CarouselWrapper>
                              <CarouselArrow className="next" onClick={nextSlide} disabled={currentIndex + slidesToShow >= badges.length}>
                                <GetIcon icon={"arrowRight"} />
                              </CarouselArrow>
                              <CarouselDots>
                                {Array.from({ length: Math.ceil(badges.length / slidesToShow) }).map((_, index) => (
                                  <Dot key={index} $active={Math.floor(currentIndex / slidesToShow) === index} onClick={() => goToSlide(index * slidesToShow)} />
                                ))}
                              </CarouselDots>
                            </CarouselContainer>
                          )}
                        </React.Fragment>
                      ),
                    },
                    {
                      key: "image-upload",
                      label: "Upload Image",
                      icon: "image",
                      content: (
                        <React.Fragment>
                          {selectedTemplate && selectedTemplate._id && selectedTemplate.isUploadImage && (
                            <BadgeLabel htmlFor="idCardBackground" style={{ position: "relative" }}>
                              <div className="icon-container">
                                <CircularIconContainer>
                                  {previewImage ? (
                                    <img
                                      src={previewImage}
                                      alt="Preview"
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        borderRadius: "50%",
                                      }}
                                    />
                                  ) : (
                                    <GetIcon icon={"image"} style={{ fontSize: "24px" }} />
                                  )}
                                </CircularIconContainer>
                              </div>
                              <div className="text-container">
                                <span>Upload Image</span>
                                <p>Upload your own badge image for customization</p>
                              </div>
                              <input type="file" id="idCardBackground" name="idCardBackground" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
                              <GetIcon icon={"arrowRight"} />
                            </BadgeLabel>
                          )}
                        </React.Fragment>
                      ),
                    },
                    {
                      key: "image-settings",
                      label: "Set Labels on Card",
                      icon: "text",
                      content: (
                        <BadgeComponentsSection>
                          <h3 style={{ fontSize: "1rem", fontWeight: "500", marginBottom: "0.5rem" }}>Badge Components</h3>
                          <ComponentsGrid>
                            <CheckboxWrapper>
                              <StyledCheckbox type="checkbox" checked={selectedTemplate?.isdisplayname} onChange={() => handleComponentToggle("name")} />
                              Display Name
                            </CheckboxWrapper>
                            <CheckboxWrapper>
                              <StyledCheckbox type="checkbox" checked={selectedTemplate?.isQrcode} onChange={() => handleComponentToggle("qr")} />
                              QR Code
                            </CheckboxWrapper>
                            <CheckboxWrapper>
                              <StyledCheckbox type="checkbox" checked={selectedTemplate?.isdisplayEvent} onChange={() => handleComponentToggle("event")} />
                              Event Name
                            </CheckboxWrapper>
                            <CheckboxWrapper>
                              <StyledCheckbox type="checkbox" checked={selectedTemplate?.isdisplayTicket} onChange={() => handleComponentToggle("ticket")} />
                              Ticket
                            </CheckboxWrapper>
                            <CheckboxWrapper>
                              <StyledCheckbox type="checkbox" checked={selectedTemplate?.isDefault} onChange={() => handleComponentToggle("defaultTemplate")} />
                              Default Template
                            </CheckboxWrapper>
                          </ComponentsGrid>
                        </BadgeComponentsSection>
                      ),
                    },
                  ]}
                ></Accordion>
              </BadgeItem>
            </BadgeList>
          </BadgeOption>
          {/* {message.content && <div className={`p-3 rounded ${message.type === 1 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{message.content}</div>} */}
          <ButtonSection>
            <Button type="secondary" ClickEvent={handleCancel} value={"Cancel"}></Button>
            <Button type="primary" isDisabled={!isChanged} ClickEvent={submitChange} value={isSubmitting ? "Submitting..." : "Submit"}></Button>
          </ButtonSection>
        </FormSection>
        <PreviewSection>
          <h3 className="text-lg font-semibold mb-2">Preview</h3>
          {previewImage ? (
            <PreviewImage>
              <img src={previewImage} alt="Badge Background" />
              <Button
                value="Generate PDF for All Attendeees"
                ClickEvent={() => {
                  setIsOpen(true);
                }}
              ></Button>
            </PreviewImage>
          ) : (
            <div className="text-center text-gray-500 py-8">No image selected for preview</div>
          )}
        </PreviewSection>
      </Container>
      {isOpen && <AttendeePrintModal onClose={setIsOpen}></AttendeePrintModal>}
    </React.Fragment>
  );
};

export default BadgeForm;
