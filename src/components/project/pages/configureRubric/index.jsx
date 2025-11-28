import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { PageHeader, SubPageHeader } from "../../../core/input/heading";
import { RowContainer } from "../../../styles/containers/styles";
import { ButtonPanel } from "../../../core/list/styles";
import { Button } from "../../../core/elements";
import { GetIcon } from "../../../../icons";
import { getData, postData, putData } from "../../../../backend/api";
import { useToast } from "../../../core/toast";
import FormInput from "../../../core/input";
import Loader from "../../../core/loader";

const ConfigureRubric = (props) => {
  const toast = useToast();
  const params = useParams();
  const [rubricName, setRubricName] = useState("Research Paper Evaluation Rubric");
  const [criteria, setCriteria] = useState([]);
  const [expandedCriteria, setExpandedCriteria] = useState(new Set());
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [existingCriterionIds, setExistingCriterionIds] = useState(new Set());

  // Get event ID from props or params
  const eventId = props?.referenceId || params?.event || props?.parents?.event || props?.event || props?.openData?.data?._id || props?.data?._id || "";

  // Fetch existing rubric data
  useEffect(() => {
    const fetchRubricData = async () => {
      if (!eventId) return;

      setIsLoading(true);
      try {
        const response = await getData({ event: eventId }, "rubric");
        if (response.status === 200) {
          const rubricData = response.data?.response || [];
          
          if (Array.isArray(rubricData) && rubricData.length > 0) {
            // Transform API data to component format
            const transformedCriteria = rubricData.map((item, index) => {
              // Parse criteria JSON string
              let criteriaData = {};
              try {
                criteriaData = item.criteria ? JSON.parse(item.criteria) : {};
              } catch (e) {
                criteriaData = { title: item.rubricName || "New Criterion", description: "" };
              }

              // Determine type from responseType
              let type = "scale";
              if (item.responseType === "multiple") {
                type = "multiple";
              } else if (item.responseType === "yesno") {
                type = "yesno";
              } else if (item.responseType === "text") {
                type = "text";
              } else if (item.responseType && item.responseType.includes("-")) {
                type = "scale";
              }

              // Parse options if available
              let options = [];
              let yesPoints = 5;
              let noPoints = 0;
              if (item.options) {
                try {
                  const parsedOptions = JSON.parse(item.options);
                  if (Array.isArray(parsedOptions)) {
                    options = parsedOptions;
                  } else if (parsedOptions.yes !== undefined) {
                    yesPoints = parsedOptions.yes || 0;
                    noPoints = parsedOptions.no || 0;
                  }
                } catch (e) {
                  console.error("Error parsing options:", e);
                }
              }

              // Parse scale values from responseType (e.g., "1-5")
              let minValue = item.minValue || 1;
              let maxValue = item.maxValue || 5;
              if (item.responseType && item.responseType.includes("-") && type === "scale") {
                const parts = item.responseType.split("-");
                if (parts.length === 2) {
                  minValue = parseInt(parts[0]) || minValue;
                  maxValue = parseInt(parts[1]) || maxValue;
                }
              }

              return {
                id: item._id || Date.now() + index,
                type,
                title: criteriaData.title || item.rubricName || "New Criterion",
                description: criteriaData.description || "",
                weight: item.weight || 10,
                required: item.required || false,
                ...(type === "scale" && {
                  minValue,
                  maxValue,
                  minLabel: item.minLabel || "",
                  maxLabel: item.maxLabel || "",
                }),
                ...(type === "multiple" && {
                  options: options.length > 0 ? options : [
                    { text: "Option 1", points: 5 },
                    { text: "Option 2", points: 3 },
                  ],
                }),
                ...(type === "yesno" && {
                  yesPoints,
                  noPoints,
                }),
                ...(type === "text" && {
                  responseType: item.responseType === "text" ? "short" : (item.responseType || "short"),
                }),
              };
            });

            setCriteria(transformedCriteria);
            
            // Store existing criterion IDs for update tracking
            const ids = new Set(rubricData.map((item) => item._id).filter(Boolean));
            setExistingCriterionIds(ids);
            
            // Set rubric name from first criterion or use default
            if (transformedCriteria.length > 0) {
              const firstCriterion = transformedCriteria[0];
              // Try to get a common rubric name - you might want to store this separately
              setRubricName(firstCriterion.title || "Research Paper Evaluation Rubric");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching rubric data:", error);
        toast.error("Failed to load rubric data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRubricData();
  }, [eventId, toast]);

  // Calculate total weight
  const totalWeight = criteria.reduce((sum, criterion) => {
    if (criterion.type !== "text") {
      return sum + (Number(criterion.weight) || 0);
    }
    return sum;
  }, 0);

  // Toggle accordion
  const toggleCriterion = (index) => {
    const newExpanded = new Set(expandedCriteria);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCriteria(newExpanded);
  };

  // Add new criterion
  const handleAddCriterion = (type) => {
    const newCriterion = {
      id: Date.now(),
      type,
      title: "New Criterion",
      description: "",
      weight: 10,
      required: true,
      ...(type === "scale" && {
        minValue: 1,
        maxValue: 5,
        minLabel: "Poor",
        maxLabel: "Excellent",
      }),
      ...(type === "multiple" && {
        options: [
          { text: "Option 1", points: 5 },
          { text: "Option 2", points: 3 },
        ],
      }),
      ...(type === "yesno" && {
        yesPoints: 5,
        noPoints: 0,
      }),
      ...(type === "text" && {
        responseType: "short",
      }),
    };
    setCriteria([...criteria, newCriterion]);
    setExpandedCriteria(new Set([...expandedCriteria, criteria.length]));
  };

  // Update criterion
  const updateCriterion = (index, updates) => {
    const newCriteria = [...criteria];
    newCriteria[index] = { ...newCriteria[index], ...updates };
    setCriteria(newCriteria);
  };

  // Delete criterion
  const handleDeleteCriterion = (index) => {
    const newCriteria = criteria.filter((_, i) => i !== index);
    setCriteria(newCriteria);
    const newExpanded = new Set(expandedCriteria);
    newExpanded.delete(index);
    // Adjust expanded indices
    const adjustedExpanded = new Set();
    newExpanded.forEach((idx) => {
      if (idx < index) {
        adjustedExpanded.add(idx);
      } else if (idx > index) {
        adjustedExpanded.add(idx - 1);
      }
    });
    setExpandedCriteria(adjustedExpanded);
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newCriteria = [...criteria];
    const [draggedItem] = newCriteria.splice(draggedIndex, 1);
    newCriteria.splice(dropIndex, 0, draggedItem);

    setCriteria(newCriteria);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Save rubric
  const handleSaveRubric = async () => {
    if (!eventId) {
      toast.error("Event ID is required. Please navigate from an event page.");
      return;
    }

    if (criteria.length === 0) {
      toast.error("Please add at least one criterion before saving.");
      return;
    }

    setIsLoading(true);
    try {
      // Save each criterion - update existing or create new
      const savePromises = criteria.map((criterion) => {
        // Store title and description in criteria field as JSON string
        const criteriaData = JSON.stringify({
          title: criterion.title || "New Criterion",
          description: criterion.description || "",
        });

        const payload = {
          rubricName: criterion.title || rubricName, // Use criterion title as rubricName for individual criterion
          event: eventId,
          criteria: criteriaData,
          weight: criterion.type !== "text" ? criterion.weight : undefined,
          minValue: criterion.minValue,
          maxValue: criterion.maxValue,
          minLabel: criterion.minLabel || "",
          maxLabel: criterion.maxLabel || "",
          required: criterion.required || false,
          responseType: criterion.type === "scale" ? `${criterion.minValue}-${criterion.maxValue}` : criterion.type,
          options: criterion.type === "multiple" ? JSON.stringify(criterion.options || []) : criterion.type === "yesno" ? JSON.stringify({ yes: criterion.yesPoints || 0, no: criterion.noPoints || 0 }) : "",
        };

        // Remove undefined fields
        Object.keys(payload).forEach((key) => {
          if (payload[key] === undefined) {
            delete payload[key];
          }
        });

        // Check if this is an existing criterion (has _id and exists in database)
        const isExisting = criterion.id && existingCriterionIds.has(criterion.id);
        
        if (isExisting) {
          // Update existing criterion
          return putData({ ...payload, id: criterion.id }, "rubric");
        } else {
          // Create new criterion
          return postData(payload, "rubric");
        }
      });

      const responses = await Promise.all(savePromises);
      const allSuccess = responses.every((response) => response.status === 200 || response.status === 201);

      if (allSuccess) {
        toast.success("Rubric saved successfully");
        // Refresh data to get updated IDs
        const refreshResponse = await getData({ event: eventId }, "rubric");
        if (refreshResponse.status === 200) {
          const rubricData = refreshResponse.data?.response || [];
          if (Array.isArray(rubricData) && rubricData.length > 0) {
            const ids = new Set(rubricData.map((item) => item._id).filter(Boolean));
            setExistingCriterionIds(ids);
            // Update criterion IDs with database IDs
            const updatedCriteria = criteria.map((criterion, index) => {
              const matchingItem = rubricData.find((item, idx) => {
                // Try to match by index or by existing ID
                if (criterion.id && existingCriterionIds.has(criterion.id)) {
                  return item._id === criterion.id;
                }
                return idx === index;
              });
              return matchingItem ? { ...criterion, id: matchingItem._id } : criterion;
            });
            setCriteria(updatedCriteria);
          }
        }
      } else {
        toast.error("Some criteria failed to save");
      }
    } catch (error) {
      console.error("Error saving rubric:", error);
      toast.error("Failed to save rubric");
    } finally {
      setIsLoading(false);
    }
  };

  // Load template
  const handleLoadTemplate = (template) => {
    // This would load template data - for now just close modal
    setShowTemplateModal(false);
    toast.success(`Loading template: ${template.title}`);
  };

  // Add option for multiple choice
  const addOption = (criterionIndex) => {
    const newCriteria = [...criteria];
    if (!newCriteria[criterionIndex].options) {
      newCriteria[criterionIndex].options = [];
    }
    newCriteria[criterionIndex].options.push({
      text: `Option ${newCriteria[criterionIndex].options.length + 1}`,
      points: 0,
    });
    setCriteria(newCriteria);
  };

  // Remove option for multiple choice
  const removeOption = (criterionIndex, optionIndex) => {
    const newCriteria = [...criteria];
    newCriteria[criterionIndex].options.splice(optionIndex, 1);
    setCriteria(newCriteria);
  };

  // Update option
  const updateOption = (criterionIndex, optionIndex, field, value) => {
    const newCriteria = [...criteria];
    newCriteria[criterionIndex].options[optionIndex][field] = value;
    setCriteria(newCriteria);
  };

  // Templates data
  const templates = [
    {
      id: 1,
      title: "Standard Research Paper",
      description: "Default rubric for academic research papers",
      criteriaCount: 6,
    },
    {
      id: 2,
      title: "Poster Presentation",
      description: "Simplified rubric for poster evaluations",
      criteriaCount: 4,
    },
    {
      id: 3,
      title: "Workshop Proposal",
      description: "Focused on practical value and engagement",
      criteriaCount: 5,
    },
  ];

  const criterionTypes = [
    {
      id: "scale",
      label: "Scale Rating (1-5, 1-10)",
      icon: "sort",
    },
    {
      id: "multiple",
      label: "Multiple Choice",
      icon: "checkbox",
    },
    {
      id: "yesno",
      label: "Yes/No",
      icon: "tick",
    },
    {
      id: "text",
      label: "Text Feedback",
      icon: "textarea",
    },
  ];

  const getTypeLabel = (type) => {
    const typeMap = {
      scale: "Scale Rating (1-5, 1-10)",
      multiple: "Multiple Choice",
      yesno: "Yes/No",
      text: "Text Feedback",
    };
    return typeMap[type] || type;
  };

  return (
    <RowContainer className="data-layout">
      {isLoading && <Loader />}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <SubPageHeader title="Configure Rubric" description="Research Papers 2025" line={false} />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="bg-bg-white hover:bg-bg-weak border border-stroke-soft text-text-main px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <GetIcon icon="eye" />
            <span>{showPreview ? "Hide Preview" : "Show Preview"}</span>
          </button>
          <button
            onClick={handleSaveRubric}
            disabled={isLoading}
            className="bg-primary-base hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GetIcon icon="save" />
            <span>Save Rubric</span>
          </button>
        </div>
      </div>

      {/* Rubric Settings */}
      <div className="bg-bg-white rounded-lg border border-stroke-soft p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <GetIcon icon="settings" />
          <SubPageHeader title="Rubric Settings" line={false} />
        </div>
        <div className="space-y-4">
          <div>
            <FormInput
              type="text"
              name="rubricName"
              label="Rubric Name"
              value={rubricName}
              onChange={(e) => setRubricName(e.target.value)}
              placeholder="Enter rubric name"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-text-sub mb-1 block">Total Weight Distribution</label>
              <p className="text-xs text-text-soft">Should equal 100% (text fields excluded)</p>
            </div>
            <div className="text-right">
              <p className={`text-lg font-semibold ${totalWeight === 100 ? "text-state-success" : "text-state-error"}`}>
                {totalWeight}%
              </p>
              {totalWeight !== 100 && (
                <button
                  onClick={() => {
                    // Auto-adjust weights logic
                    const nonTextCriteria = criteria.filter((c) => c.type !== "text");
                    if (nonTextCriteria.length > 0) {
                      const equalWeight = Math.round(100 / nonTextCriteria.length);
                      const newCriteria = criteria.map((c) => {
                        if (c.type !== "text") {
                          return { ...c, weight: equalWeight };
                        }
                        return c;
                      });
                      setCriteria(newCriteria);
                    }
                  }}
                  className="text-xs text-primary-base hover:text-primary-dark mt-1"
                >
                  Adjust weights
                </button>
              )}
            </div>
          </div>
          <div>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="text-sm text-primary-base hover:text-primary-dark"
            >
              Load from Template
            </button>
          </div>
        </div>
      </div>

      {/* Evaluation Criteria */}
      <div className="mb-6">
        <SubPageHeader title={`Evaluation Criteria (${criteria.length})`} line={false} />
        <div className="space-y-3">
          {criteria.map((criterion, index) => {
            const isExpanded = expandedCriteria.has(index);
            const accordionItems = [
              {
                icon: "drag",
                label: (
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm font-semibold text-text-main leading-5 tracking-tight">
                      {index + 1}. {criterion.title}
                    </span>
                    <span className="px-2 py-1 rounded text-[10px] font-medium bg-primary-light text-primary-dark">
                      {getTypeLabel(criterion.type)}
                    </span>
                    {criterion.required && (
                      <span className="px-2 py-1 rounded text-[10px] font-medium bg-red-50 text-red-700">Required</span>
                    )}
                  </div>
                ),
                rightLabel: (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-text-sub">Weight: {criterion.weight}%</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCriterion(index);
                      }}
                      className="text-state-error hover:opacity-80 p-1 transition-opacity"
                      title="Delete criterion"
                      aria-label="Delete criterion"
                    >
                      <GetIcon icon="delete" />
                    </button>
                  </div>
                ),
                content: (
                  <div className="p-4 border-t border-stroke-soft">
                    {criterion.type === "scale" && (
                      <ScaleRatingForm criterion={criterion} index={index} updateCriterion={updateCriterion} />
                    )}
                    {criterion.type === "multiple" && (
                      <MultipleChoiceForm
                        criterion={criterion}
                        index={index}
                        updateCriterion={updateCriterion}
                        addOption={addOption}
                        removeOption={removeOption}
                        updateOption={updateOption}
                      />
                    )}
                    {criterion.type === "yesno" && (
                      <YesNoForm criterion={criterion} index={index} updateCriterion={updateCriterion} />
                    )}
                    {criterion.type === "text" && (
                      <TextFeedbackForm criterion={criterion} index={index} updateCriterion={updateCriterion} />
                    )}
                  </div>
                ),
              },
            ];

            return (
              <div
                key={criterion.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`bg-bg-white rounded-lg border border-stroke-soft ${
                  draggedIndex === index ? "opacity-50" : ""
                }`}
              >
                <ControlledAccordion
                  items={accordionItems}
                  isOpen={isExpanded}
                  onToggle={() => toggleCriterion(index)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Criterion */}
      <div>
        <SubPageHeader title="Add New Criterion" line={false} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {criterionTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleAddCriterion(type.id)}
              className="bg-bg-white border border-stroke-soft rounded-lg p-4 hover:border-primary-base hover:bg-primary-light transition-all text-left"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="text-2xl text-primary-base">
                  <GetIcon icon={type.icon} />
                </div>
                <span className="text-sm font-medium text-text-main text-center">{type.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowTemplateModal(false)}>
          <div
            className="bg-bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <SubPageHeader title="Load Rubric Template" line={false} />
            <div className="space-y-3 mb-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleLoadTemplate(template)}
                  className="p-4 border border-stroke-soft rounded-lg hover:border-primary-base hover:bg-bg-weak cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <SubPageHeader title={template.title} line={false} />
                      <p className="text-sm text-text-sub mb-2">{template.description}</p>
                      <p className="text-xs text-text-soft">{template.criteriaCount} criteria included</p>
                    </div>
                    <GetIcon icon="file" className="text-text-soft" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button
                ClickEvent={() => setShowTemplateModal(false)}
                value="Cancel"
                type="secondary"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reviewer Preview Modal */}
      {showPreview && (
        <ReviewerPreview criteria={criteria} onClose={() => setShowPreview(false)} />
      )}
    </RowContainer>
  );
};

// Controlled Accordion Component (matches Accordion structure and styling)
const ControlledAccordion = ({ items, isOpen, onToggle }) => {
  return (
    <div className="m-0">
      {items.map((item, index) => (
        <div key={index} className="border-b border-stroke-soft">
          <button
            className={`w-full text-left bg-bg-white border-none rounded-md cursor-pointer transition-colors p-4 flex justify-between items-center gap-2 ${
              isOpen ? "up" : "down"
            }`}
            onClick={onToggle}
          >
            <div className="flex items-center gap-2 flex-1">
              {item.icon && (
                <div className="flex items-center">
                  <GetIcon icon={item.icon} />
                </div>
              )}
              {typeof item.label === 'string' ? (
                <span className="text-base font-semibold text-text-main leading-5 tracking-tight">{item.label}</span>
              ) : (
                item.label
              )}
            </div>
            <div className="flex items-center gap-2">
              {item.rightLabel}
              <div className="flex items-center text-icon-soft [&_svg]:w-[10px] [&_svg]:h-[10px]">
                <GetIcon icon={isOpen ? "up" : "down"} />
              </div>
            </div>
          </button>
          <div
            className="p-4"
            style={{ display: isOpen ? "block" : "none" }}
          >
            {item.content}
          </div>
        </div>
      ))}
    </div>
  );
};

// Scale Rating Form Component
const ScaleRatingForm = ({ criterion, index, updateCriterion }) => {
  return (
    <div className="space-y-4">
      <FormInput
        type="text"
        name={`title-${index}`}
        label="Criterion Title"
        value={criterion.title}
        onChange={(e) => updateCriterion(index, { title: e.target.value })}
        placeholder="Enter criterion title"
        required={true}
      />
      <FormInput
        type="textarea"
        name={`description-${index}`}
        label="Description (Instructions for Reviewers)"
        value={criterion.description}
        onChange={(e) => updateCriterion(index, { description: e.target.value })}
        placeholder="Help reviewers understand what to evaluate..."
      />
      <FormInput
        type="number"
        name={`weight-${index}`}
        label="Weight (%)"
        value={criterion.weight}
        onChange={(e) => updateCriterion(index, { weight: Number(e.target.value) })}
        placeholder="Enter weight percentage"
        required={true}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          type="number"
          name={`minValue-${index}`}
          label="Min Value"
          value={criterion.minValue}
          onChange={(e) => updateCriterion(index, { minValue: Number(e.target.value) })}
          placeholder="1"
          required={true}
        />
        <FormInput
          type="number"
          name={`maxValue-${index}`}
          label="Max Value"
          value={criterion.maxValue}
          onChange={(e) => updateCriterion(index, { maxValue: Number(e.target.value) })}
          placeholder="5"
          required={true}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          type="text"
          name={`minLabel-${index}`}
          label="Min Label"
          value={criterion.minLabel}
          onChange={(e) => updateCriterion(index, { minLabel: e.target.value })}
          placeholder="Poor"
        />
        <FormInput
          type="text"
          name={`maxLabel-${index}`}
          label="Max Label"
          value={criterion.maxLabel}
          onChange={(e) => updateCriterion(index, { maxLabel: e.target.value })}
          placeholder="Excellent"
        />
      </div>
      <FormInput
        type="checkbox"
        name={`required-${index}`}
        label="Required (reviewers must answer)"
        value={criterion.required}
        onChange={(checked) => updateCriterion(index, { required: !!checked })}
      />
    </div>
  );
};

// Multiple Choice Form Component
const MultipleChoiceForm = ({ criterion, index, updateCriterion, addOption, removeOption, updateOption }) => {
  return (
    <div className="space-y-4">
      <FormInput
        type="text"
        name={`title-${index}`}
        label="Criterion Title"
        value={criterion.title}
        onChange={(e) => updateCriterion(index, { title: e.target.value })}
        placeholder="Enter criterion title"
        required={true}
      />
      <FormInput
        type="textarea"
        name={`description-${index}`}
        label="Description (Instructions for Reviewers)"
        value={criterion.description}
        onChange={(e) => updateCriterion(index, { description: e.target.value })}
        placeholder="Help reviewers understand what to evaluate..."
      />
      <FormInput
        type="number"
        name={`weight-${index}`}
        label="Weight (%)"
        value={criterion.weight}
        onChange={(e) => updateCriterion(index, { weight: Number(e.target.value) })}
        placeholder="Enter weight percentage"
        required={true}
      />
      <div>
        <label className="text-xs font-medium text-text-sub mb-1 block">Options</label>
        <div className="space-y-2">
          {criterion.options?.map((option, optionIndex) => (
            <div key={optionIndex} className="flex items-center gap-2">
              <div className="flex-1">
                <FormInput
                  type="text"
                  name={`option-text-${index}-${optionIndex}`}
                  value={option.text}
                  onChange={(e) => updateOption(index, optionIndex, "text", e.target.value)}
                  placeholder="Option text"
                  customClass="full"
                />
              </div>
              <div className="w-24">
                <FormInput
                  type="number"
                  name={`option-points-${index}-${optionIndex}`}
                  value={option.points}
                  onChange={(e) => updateOption(index, optionIndex, "points", Number(e.target.value))}
                  placeholder="Points"
                  customClass="full"
                />
              </div>
              <button
                onClick={() => removeOption(index, optionIndex)}
                className="text-state-error hover:text-red-700 p-2"
                title="Remove option"
              >
                <GetIcon icon="delete" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => addOption(index)}
          className="text-sm text-primary-base hover:text-primary-dark mt-2"
        >
          + Add Option
        </button>
      </div>
      <FormInput
        type="checkbox"
        name={`required-${index}`}
        label="Required (reviewers must answer)"
        value={criterion.required}
        onChange={(checked) => updateCriterion(index, { required: !!checked })}
      />
    </div>
  );
};

// Yes/No Form Component
const YesNoForm = ({ criterion, index, updateCriterion }) => {
  return (
    <div className="space-y-4">
      <FormInput
        type="text"
        name={`title-${index}`}
        label="Criterion Title"
        value={criterion.title}
        onChange={(e) => updateCriterion(index, { title: e.target.value })}
        placeholder="Enter criterion title"
        required={true}
      />
      <FormInput
        type="textarea"
        name={`description-${index}`}
        label="Description (Instructions for Reviewers)"
        value={criterion.description}
        onChange={(e) => updateCriterion(index, { description: e.target.value })}
        placeholder="Help reviewers understand what to evaluate..."
      />
      <FormInput
        type="number"
        name={`weight-${index}`}
        label="Weight (%)"
        value={criterion.weight}
        onChange={(e) => updateCriterion(index, { weight: Number(e.target.value) })}
        placeholder="Enter weight percentage"
        required={true}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          type="number"
          name={`yesPoints-${index}`}
          label='Points for "Yes"'
          value={criterion.yesPoints}
          onChange={(e) => updateCriterion(index, { yesPoints: Number(e.target.value) })}
          placeholder="5"
        />
        <FormInput
          type="number"
          name={`noPoints-${index}`}
          label='Points for "No"'
          value={criterion.noPoints}
          onChange={(e) => updateCriterion(index, { noPoints: Number(e.target.value) })}
          placeholder="0"
        />
      </div>
      <FormInput
        type="checkbox"
        name={`required-${index}`}
        label="Required (reviewers must answer)"
        value={criterion.required}
        onChange={(checked) => updateCriterion(index, { required: !!checked })}
      />
    </div>
  );
};

// Text Feedback Form Component
const TextFeedbackForm = ({ criterion, index, updateCriterion }) => {
  return (
    <div className="space-y-4">
      <FormInput
        type="text"
        name={`title-${index}`}
        label="Criterion Title"
        value={criterion.title}
        onChange={(e) => updateCriterion(index, { title: e.target.value })}
        placeholder="Enter criterion title"
        required={true}
      />
      <FormInput
        type="textarea"
        name={`description-${index}`}
        label="Description (Instructions for Reviewers)"
        value={criterion.description}
        onChange={(e) => updateCriterion(index, { description: e.target.value })}
        placeholder="Help reviewers understand what to evaluate..."
      />
      <FormInput
        type="select"
        name={`responseType-${index}`}
        label="Response Type"
        value={criterion.responseType || "short"}
        onChange={(selectedValue) => updateCriterion(index, { responseType: selectedValue })}
        selectApi={[
          { id: "short", value: "Short Answer (1-2 lines)" },
          { id: "long", value: "Long Answer" },
        ]}
        apiType="JSON"
        showItem="value"
      />
      <FormInput
        type="checkbox"
        name={`required-${index}`}
        label="Required (reviewers must answer)"
        value={criterion.required}
        onChange={(checked) => updateCriterion(index, { required: !!checked })}
      />
    </div>
  );
};

// Reviewer Preview Component
const ReviewerPreview = ({ criteria, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-bg-white border-b border-stroke-soft p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-main">Reviewer Preview</h3>
            <p className="text-sm text-text-sub mt-1">How reviewers will see this rubric</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-soft hover:text-text-main transition-colors p-1"
            aria-label="Close preview"
          >
            <GetIcon icon="close" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-6 space-y-4">
          {criteria.length === 0 ? (
            <div className="text-center py-8 text-text-sub">
              <p>No criteria added yet. Add criteria to see the preview.</p>
            </div>
          ) : (
            criteria.map((criterion, index) => (
              <div key={criterion.id} className="border border-stroke-soft rounded-lg p-4 bg-bg-white">
                {/* Criterion Header */}
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-sm font-semibold text-text-main">
                    {index + 1}. {criterion.title}
                    {criterion.required && <span className="text-state-error ml-1">*</span>}
                  </h4>
                  {criterion.type !== "text" && (
                    <span className="text-xs text-text-sub">{criterion.weight}%</span>
                  )}
                </div>

                {/* Scale Rating Preview */}
                {criterion.type === "scale" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-sub">{criterion.minLabel || "Poor"}</span>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: criterion.maxValue - criterion.minValue + 1 }, (_, i) => {
                          const value = criterion.minValue + i;
                          return (
                            <button
                              key={value}
                              className="w-10 h-10 rounded border border-stroke-soft bg-bg-white hover:bg-primary-light hover:border-primary-base text-sm font-medium text-text-main transition-colors"
                              type="button"
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                      <span className="text-xs text-text-sub">{criterion.maxLabel || "Excellent"}</span>
                    </div>
                  </div>
                )}

                {/* Multiple Choice Preview */}
                {criterion.type === "multiple" && (
                  <div className="space-y-2">
                    {criterion.options?.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-bg-weak"
                      >
                        <input
                          type="radio"
                          name={`criterion-${index}`}
                          className="text-primary-base"
                          disabled
                        />
                        <span className="text-sm text-text-main">
                          {option.text} ({option.points} pts)
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Yes/No Preview */}
                {criterion.type === "yesno" && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-bg-weak">
                      <input
                        type="radio"
                        name={`criterion-${index}`}
                        className="text-primary-base"
                        disabled
                      />
                      <span className="text-sm text-text-main">
                        Yes ({criterion.yesPoints || 0} pts)
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-bg-weak">
                      <input
                        type="radio"
                        name={`criterion-${index}`}
                        className="text-primary-base"
                        disabled
                      />
                      <span className="text-sm text-text-main">
                        No ({criterion.noPoints || 0} pts)
                      </span>
                    </label>
                  </div>
                )}

                {/* Text Feedback Preview */}
                {criterion.type === "text" && (
                  <div>
                    <textarea
                      placeholder="Enter your feedback..."
                      rows={criterion.responseType === "short" ? 2 : 5}
                      className="w-full rounded border border-stroke-soft bg-bg-white px-3 py-2 text-sm text-text-main resize-y focus:outline-none focus:ring-2 focus:ring-primary-base"
                      disabled
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigureRubric;

