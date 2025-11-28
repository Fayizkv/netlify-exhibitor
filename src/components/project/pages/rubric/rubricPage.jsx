import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ListTable from "../../../core/list/list";
import { rubricAttributes } from "./index";
import { GetIcon } from "../../../../icons/index.jsx";
import EvaluationCriteria from "./EvaluationCriteria";
// Inline quick add (no overlays)
import { getData, postData } from "../../../../backend/api";

const RubricPage = (props) => {
  const [triggerAdd, setTriggerAdd] = useState(false);
  const hasTriggeredAdd = useRef(false);
  const appliedDefaultsRef = useRef(false);
  const checkIntervalRef = useRef(null);
  const [criteria, setCriteria] = useState([]);
  const [isLoadingCriteria, setIsLoadingCriteria] = useState(false);
  const { referenceId } = props; // Event ID from props
  const params = useParams();
  const computedEventId = referenceId || params?.event || props?.parents?.event || props?.event || "";

  // Inline Quick Add Box
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickType, setQuickType] = useState("");
  const [quickForm, setQuickForm] = useState({
    title: "",
    description: "",
    responseType: "",
    weight: "",
    required: false,
    minValue: "",
    maxValue: "",
    minLabel: "",
    maxLabel: "",
  });
  const quickSavedRef = useRef(false);
  const quickTimerRef = useRef(null);

  const setQuickDefaults = (type) => {
    if (type === "scale") {
      setQuickForm((prev) => ({
        ...prev,
        responseType: "1-5",
        minValue: "1",
        maxValue: "5",
        minLabel: "",
        maxLabel: "",
      }));
    } else if (type === "multiple") {
      setQuickForm((prev) => ({ ...prev, responseType: "multiple" }));
    } else if (type === "yesno") {
      setQuickForm((prev) => ({ ...prev, responseType: "yesno" }));
    } else if (type === "text") {
      setQuickForm((prev) => ({ ...prev, responseType: "text" }));
    }
  };

  // Auto-save when mandatory fields are filled (no save/cancel buttons)
  useEffect(() => {
    if (!showQuickAdd) return;
    const requiredFilled =
      quickForm.title?.trim()?.length > 0 &&
      quickForm.responseType &&
      String(quickForm.weight).length > 0 &&
      String(quickForm.minValue).length > 0 &&
      String(quickForm.maxValue).length > 0;

    if (!requiredFilled || quickSavedRef.current) return;

    if (quickTimerRef.current) clearTimeout(quickTimerRef.current);
    quickTimerRef.current = setTimeout(async () => {
      const payload = {
        title: quickForm.title,
        description: quickForm.description,
        responseType: quickForm.responseType,
        weight: Number(quickForm.weight || 0),
        required: !!quickForm.required,
        minValue: quickForm.minValue !== "" ? Number(quickForm.minValue) : undefined,
        maxValue: quickForm.maxValue !== "" ? Number(quickForm.maxValue) : undefined,
        minLabel: quickForm.minLabel,
        maxLabel: quickForm.maxLabel,
        rubricName: quickForm.title,
        criteria: quickForm.description,
        event: computedEventId,
      };
      const resp = await postData(payload, "rubric");
      if (resp.status === 200 || resp.status === 201) {
        quickSavedRef.current = true;
        setShowQuickAdd(false);
        try {
          const refresh = await getData({ event: computedEventId }, "rubric");
          const rubricData = refresh?.data?.response || [];
          setCriteria(Array.isArray(rubricData) ? rubricData : (rubricData.length ? rubricData : []));
        } catch (_) {}
        props?.setMessage && props.setMessage({ type: 1, content: "Criterion created", icon: "success", title: "Success" });
      }
    }, 500);

    return () => quickTimerRef.current && clearTimeout(quickTimerRef.current);
  }, [showQuickAdd, quickForm, computedEventId]);

  // Fetch criteria data
  useEffect(() => {
    const fetchCriteria = async () => {
      if (!computedEventId) return;
      
      setIsLoadingCriteria(true);
      try {
        const response = await getData({ event: computedEventId }, "rubric");
        if (response.status === 200) {
          const rubricData = response.data?.response || [];
          // If response is an array, use it directly; otherwise wrap in array
          const criteriaList = Array.isArray(rubricData) ? rubricData : (rubricData.length ? rubricData : []);
          setCriteria(criteriaList);
        }
      } catch (error) {
        console.error("Error fetching criteria:", error);
        setCriteria([]);
      } finally {
        setIsLoadingCriteria(false);
      }
    };

    fetchCriteria();
  }, [computedEventId]);

  const handleCriterionTypeClick = (type) => {
    // Store the selected type in sessionStorage to use when form opens
    const defaults = {};
    switch (type) {
      case "scale":
        defaults.responseType = "1-5";
        defaults.minValue = 1;
        defaults.maxValue = 5;
        defaults.type = "Scale Rating";
        break;
      case "multiple":
        defaults.responseType = "multiple";
        defaults.type = "Multiple Choice";
        defaults.options = "Option 1,Option 2,Option 3";
        break;
      case "yesno":
        defaults.responseType = "yesno";
        defaults.type = "Yes/No";
        defaults.options = "Yes,No";
        break;
      case "text":
        defaults.responseType = "text";
        defaults.type = "Text Feedback";
        break;
    }

    setQuickType(type);
    setShowQuickAdd(true);
    setQuickDefaults(type);

    if (props?.setMessage) {
      props.setMessage({
        type: 1,
        content: `Creating ${defaults.type} criterion. Fill in the details below.`,
        icon: "info",
        title: "Add Criterion",
      });
    }
  };

  const handleEditCriterion = (criterion) => {
    // Trigger edit mode - you can implement this based on your needs
    if (props?.setMessage) {
      props.setMessage({
        type: 1,
        content: "Edit functionality - integrate with your edit handler",
        icon: "info",
        title: "Edit Criterion",
      });
    }
  };

  const handleDeleteCriterion = async (criterion, id) => {
    try {
      const response = await postData({ id }, "rubric/delete");
      if (response.status === 200) {
        // Refresh criteria list
        const criteriaResponse = await getData({ event: referenceId }, "rubric");
        if (criteriaResponse.status === 200) {
          const rubricData = criteriaResponse.data?.response || [];
          const criteriaList = Array.isArray(rubricData) ? rubricData : (rubricData.length ? rubricData : []);
          setCriteria(criteriaList);
        }
        
        if (props?.setMessage) {
          props.setMessage({
            type: 1,
            content: "Criterion deleted successfully",
            icon: "success",
            title: "Success",
          });
        }
      }
    } catch (error) {
      console.error("Error deleting criterion:", error);
      if (props?.setMessage) {
        props.setMessage({
          type: 1,
          content: "Failed to delete criterion",
          icon: "error",
          title: "Error",
        });
      }
    }
  };

  // Trigger add form when triggerAdd is true
  useEffect(() => {
    if (triggerAdd && hasTriggeredAdd.current) {
      hasTriggeredAdd.current = false;
      setTriggerAdd(false);
      
      // Use multiple attempts with increasing delays to find and click the button
      const attemptClick = (attempt = 0) => {
        if (attempt > 20) {
          console.warn("Could not find add button after multiple attempts. Attempt:", attempt);
          // Last resort: try to find any button and log what we find
          const allButtons = Array.from(document.querySelectorAll('button'));
          const visibleButtons = allButtons.filter(b => b.offsetParent !== null && !b.disabled);
          console.log("Total visible buttons:", visibleButtons.length);
          console.log("Button texts:", visibleButtons.map(b => b.textContent?.trim()).filter(Boolean));
          
          // Try to find form and check if it's already open
          const formOverlay = document.querySelector('[class*="Overlay"], [class*="overlay"]');
          const formExists = document.querySelector('form, [class*="Form"], [class*="CrudForm"]');
          console.log("Form overlay exists:", !!formOverlay);
          console.log("Form exists:", !!formExists);
          
          return;
        }

        // Strategy 1: Look for button with "Add" text (case insensitive)
        const allButtons = Array.from(document.querySelectorAll('button'));
        let addButton = allButtons.find(btn => {
          const text = (btn.textContent || btn.innerText || '').trim().toLowerCase();
          const hasAdd = text.includes('add');
          const hasRubric = text.includes('rubric');
          const isVisible = btn.offsetParent !== null && !btn.disabled;
          // Match if it says "add" or "add rubric" or "add new rubric" or just "add" in visible buttons
          return hasAdd && (hasRubric || text === 'add' || text.includes('add rubric') || text.includes('add new')) && isVisible;
        });
        
        // Strategy 1b: Specifically look for "Add New Rubric" button (from NoDataFound component)
        if (!addButton) {
          addButton = allButtons.find(btn => {
            const text = (btn.textContent || btn.innerText || '').trim().toLowerCase();
            const isVisible = btn.offsetParent !== null && !btn.disabled;
            return (text.includes('add new rubric') || text === 'add new rubric') && isVisible;
          });
        }

        // Strategy 2: Look in button panels
        if (!addButton) {
          const buttonPanels = document.querySelectorAll('[class*="ButtonPanel"], [class*="button-panel"], .button-panel');
          buttonPanels.forEach(panel => {
            const buttons = panel.querySelectorAll('button');
            buttons.forEach(btn => {
              const text = (btn.textContent || btn.innerText || '').trim().toLowerCase();
              if (text.includes('add') && btn.offsetParent !== null && !btn.disabled) {
                if (!addButton) addButton = btn;
              }
            });
          });
        }

        // Strategy 3: Look for buttons with specific classes or data attributes
        if (!addButton) {
          const classButtons = document.querySelectorAll('button[class*="Add"], button[class*="add"]');
          classButtons.forEach(btn => {
            if (btn.offsetParent !== null && !btn.disabled) {
              if (!addButton) addButton = btn;
            }
          });
        }

        // Strategy 4: Look for buttons near "Rubric" text
        if (!addButton) {
          const rubricElements = Array.from(document.querySelectorAll('*')).filter(el => {
            const text = (el.textContent || '').toLowerCase();
            return text.includes('rubric') && text.includes('add');
          });
          rubricElements.forEach(el => {
            const nearbyButton = el.closest('div')?.querySelector('button');
            if (nearbyButton && nearbyButton.offsetParent !== null && !nearbyButton.disabled) {
              if (!addButton) addButton = nearbyButton;
            }
          });
        }

        // Strategy 5: Look for any visible button that might be the add button
        if (!addButton && attempt > 5) {
          // More aggressive: look for any button near the ListTable
          const listTableContainer = document.querySelector('[class*="ListTable"], [class*="list-table"], .data-layout');
          if (listTableContainer) {
            const buttons = listTableContainer.querySelectorAll('button');
            buttons.forEach(btn => {
              if (btn.offsetParent !== null && !btn.disabled) {
                const text = (btn.textContent || '').toLowerCase();
                if (text.includes('add') || text === 'add') {
                  if (!addButton) addButton = btn;
                }
              }
            });
          }
        }

        // Strategy 6: Check if form is already open (maybe button was already clicked)
        if (!addButton && attempt > 3) {
          const formOverlay = document.querySelector('[class*="Overlay"]:not([style*="display: none"])');
          const formInputs = document.querySelectorAll('input[name="title"], input[name="responseType"], select[name="responseType"]');
          if (formOverlay) {
            console.log("Form overlay found, checking for fields. Inputs found:", formInputs.length);
            
            // If form is open but no inputs visible, try to expand accordions
            if (formInputs.length === 0) {
              // Try to find and click accordion headers to expand them
              const accordionHeaders = document.querySelectorAll('[class*="accordion"], [class*="Accordion"], button[aria-expanded="false"]');
              console.log("Found accordion headers:", accordionHeaders.length);
              
              // Click first accordion header to expand
              if (accordionHeaders.length > 0) {
                accordionHeaders[0].click();
                console.log("Clicked first accordion header");
              }
              
              // Wait a bit and check again
              setTimeout(() => {
                const newInputs = document.querySelectorAll('input[name="title"], input[name="responseType"], select[name="responseType"]');
                console.log("After expanding accordion, inputs found:", newInputs.length);
              }, 500);
            } else {
              // Form is open and fields exist, just need to apply defaults
              console.log("Form is open with fields visible");
              return;
            }
          }
        }

        if (addButton) {
          console.log("Found add button:", addButton.textContent, "Attempt:", attempt);
          // Scroll button into view if needed
          addButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Use a small delay before clicking
          setTimeout(() => {
            // Trigger click event more reliably
            const clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            addButton.dispatchEvent(clickEvent);
            // Also try direct click
            addButton.click();
          }, 150);
        } else {
          // Retry after a delay
          setTimeout(() => attemptClick(attempt + 1), 300);
        }
      };

      // Start attempting after a short delay
      setTimeout(() => attemptClick(), 300);
    }
  }, [triggerAdd]);

  // Apply sessionStorage defaults when form opens
  useEffect(() => {
    const applyDefaultsToFields = (defaults) => {
      // Wait a bit more for all fields to be rendered
      setTimeout(() => {
        // Apply defaults to form fields
        Object.keys(defaults).forEach(key => {
          if (key === 'type') return; // Skip type as it's just for display
          
          // Find input field by name
          const input = document.querySelector(`input[name="${key}"], select[name="${key}"], textarea[name="${key}"]`);
          if (input) {
            if (input.tagName === 'SELECT') {
              // For select, set value
              input.value = defaults[key];
              input.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
              // For text/number inputs
              input.value = defaults[key];
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }
        });
        
        appliedDefaultsRef.current = true;
        // Clear sessionStorage after applying
        sessionStorage.removeItem("rubricCriterionDefaults");
        
        // Clear interval once defaults are applied
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      }, 300);
    };

    const applyDefaults = () => {
      if (appliedDefaultsRef.current) return; // Prevent multiple applications
      
      try {
        const storedDefaults = sessionStorage.getItem("rubricCriterionDefaults");
        if (storedDefaults) {
          const defaults = JSON.parse(storedDefaults);
          
          // Check if form overlay exists first
          const formOverlay = document.querySelector('[class*="Overlay"]:not([style*="display: none"])');
          if (!formOverlay) {
            return; // Form not open yet
          }

          // Check if form fields are available
          let formExists = document.querySelector('input[name="responseType"], select[name="responseType"], input[name="minValue"], input[name="title"]');
          
          // If fields don't exist, try to expand accordions first
          if (!formExists) {
            // Try to find and expand accordion groups
            const accordionButtons = document.querySelectorAll('button[aria-expanded="false"], [class*="accordion-header"] button, [class*="Accordion"] button');
            if (accordionButtons.length > 0) {
              console.log("Expanding accordion to show fields");
              // Click the first accordion button to expand
              accordionButtons[0].click();
              // Wait a moment for accordion to expand
              setTimeout(() => {
                formExists = document.querySelector('input[name="responseType"], select[name="responseType"], input[name="minValue"], input[name="title"]');
                if (formExists) {
                  applyDefaultsToFields(defaults);
                }
              }, 400);
              return;
            }
          }
          
          if (formExists) {
            applyDefaultsToFields(defaults);
          }
        }
      } catch (e) {
        console.error("Error applying defaults:", e);
      }
    };

    // Check periodically for form opening (more reliable than MutationObserver)
    checkIntervalRef.current = setInterval(() => {
      if (!appliedDefaultsRef.current) {
        applyDefaults();
      }
    }, 200);

    // Also check immediately
    applyDefaults();

    // Cleanup
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  const criterionTypes = [
    {
      id: "scale",
      label: "Scale Rating (1-5, 1-10)",
      icon: "chart",
    },
    {
      id: "multiple",
      label: "Multiple Choice",
      icon: "checkbox",
    },
    {
      id: "yesno",
      label: "Yes/No",
      icon: "check",
    },
    {
      id: "text",
      label: "Text Feedback",
      icon: "textarea",
    },
  ];

  return (
    <div className="w-full">
      <ListTable
        {...props}
        api={`rubric`}
        parentReference={"event"}
        itemTitle={{ name: "rubricName", type: "text", collection: "" }}
        shortName="Rubric"
        description="Define evaluation criteria for abstracts"
        addPrivilege={true}
        delPrivilege={true}
        updatePrivilege={true}
        customClass="medium"
        formMode="single"
        formTabTheme="accordion2"
        viewMode="listItem"
        attributes={rubricAttributes}
        subGroupSettings={{
          "rubric-settings": {
            title: "Rubric Settings",
            backgroundColor: "rgba(246, 248, 250, 1)",
            icon: "settings",
          },
        }}
      />
      
      {/* Evaluation Criteria Component */}
      {/* Quick Add Box injected inside EvaluationCriteria, right under its header */}
      <EvaluationCriteria
        criteria={criteria}
        onEdit={handleEditCriterion}
        onDelete={handleDeleteCriterion}
        onAddNew={handleCriterionTypeClick}
        setMessage={props?.setMessage}
        totalCount={criteria.length + (showQuickAdd ? 1 : 0)}
        provisional={showQuickAdd ? {
          __provisional: true,
          title: quickForm.title || "New Criterion",
          responseType: quickForm.responseType,
          weight: Number(quickForm.weight || 0),
          required: !!quickForm.required,
          minValue: quickForm.minValue,
          maxValue: quickForm.maxValue,
        } : null}
        quickAddNode={showQuickAdd ? (
        <div className="mb-4 rounded-lg border border-stroke-soft bg-bg-white">
          {/* Accordion-style header for 'Criterion Title' */}
          <div className="flex items-center justify-between p-4 border-b border-stroke-soft">
           
           
          </div>
          <div className="p-4 grid grid-cols-1 gap-4 text-left">
            <div>
              <label className="text-xs font-medium text-text-sub mb-1 block">Criterion Title *</label>
              <input
                className="w-full rounded border border-stroke-soft bg-bg-white px-3 py-2 text-sm text-text-main"
                placeholder="Criterion Title"
                value={quickForm.title}
                onChange={(e) => setQuickForm((p) => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text-sub mb-1 block">Description (Instructions for Reviewers)</label>
              <textarea
                className="w-full rounded border border-stroke-soft bg-bg-white px-3 py-2 text-sm text-text-main"
                placeholder="Description (Instructions for Reviewers)"
                rows={3}
                value={quickForm.description}
                onChange={(e) => setQuickForm((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-text-sub mb-1 block">Scale Rating *</label>
                <select
                  className="w-full rounded border border-stroke-soft bg-bg-white px-3 py-2 text-sm text-text-main"
                  value={quickForm.responseType}
                  onChange={(e) => setQuickForm((p) => ({ ...p, responseType: e.target.value }))}
                >
                  <option value="">Select</option>
                  <option value="1-5">Scale Rating (1-5)</option>
                  <option value="1-10">Scale Rating (1-10)</option>
                  <option value="multiple">Multiple Choice</option>
                  <option value="yesno">Yes/No</option>
                  <option value="text">Text Feedback</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-text-sub mb-1 block">Weight (%) *</label>
                <input
                  type="number"
                  className="w-full rounded border border-stroke-soft bg-bg-white px-3 py-2 text-sm text-text-main"
                  placeholder="Weight (%)"
                  value={quickForm.weight}
                  onChange={(e) => setQuickForm((p) => ({ ...p, weight: e.target.value }))}
                />
              </div>
            </div>
            <label className="inline-flex items-center gap-2 text-sm text-text-main">
              <input
                type="checkbox"
                checked={quickForm.required}
                onChange={(e) => setQuickForm((p) => ({ ...p, required: e.target.checked }))}
              />
              <span>Required (reviewers must answer)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-text-sub mb-1 block">Min Value *</label>
                <input
                  type="number"
                  className="w-full rounded border border-stroke-soft bg-bg-white px-3 py-2 text-sm text-text-main"
                  placeholder="1"
                  value={quickForm.minValue}
                  onChange={(e) => setQuickForm((p) => ({ ...p, minValue: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-sub mb-1 block">Max Value *</label>
                <input
                  type="number"
                  className="w-full rounded border border-stroke-soft bg-bg-white px-3 py-2 text-sm text-text-main"
                  placeholder="5"
                  value={quickForm.maxValue}
                  onChange={(e) => setQuickForm((p) => ({ ...p, maxValue: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-text-sub mb-1 block">Min Label</label>
                <input
                  className="w-full rounded border border-stroke-soft bg-bg-white px-3 py-2 text-sm text-text-main"
                  placeholder="Min Label"
                  value={quickForm.minLabel}
                  onChange={(e) => setQuickForm((p) => ({ ...p, minLabel: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-sub mb-1 block">Max Label</label>
                <input
                  className="w-full rounded border border-stroke-soft bg-bg-white px-3 py-2 text-sm text-text-main"
                  placeholder="Max Label"
                  value={quickForm.maxLabel}
                  onChange={(e) => setQuickForm((p) => ({ ...p, maxLabel: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded bg-primary-base hover:bg-primary-dark text-white text-sm"
                onClick={async () => {
                  const payload = {
                    title: quickForm.title,
                    description: quickForm.description,
                    responseType: quickForm.responseType,
                    weight: Number(quickForm.weight || 0),
                    required: !!quickForm.required,
                    minValue: quickForm.minValue !== "" ? Number(quickForm.minValue) : undefined,
                    maxValue: quickForm.maxValue !== "" ? Number(quickForm.maxValue) : undefined,
                    minLabel: quickForm.minLabel,
                    maxLabel: quickForm.maxLabel,
                    rubricName: quickForm.title,
                    criteria: quickForm.description,
                    event: computedEventId,
                  };
                  const resp = await postData(payload, "rubric");
                  if (resp.status === 200 || resp.status === 201) {
                    setShowQuickAdd(false);
                    const refresh = await getData({ event: computedEventId }, "rubric");
                    const rubricData = refresh?.data?.response || [];
                    setCriteria(Array.isArray(rubricData) ? rubricData : (rubricData.length ? rubricData : []));
                    props?.setMessage && props.setMessage({ type: 1, content: "Criterion created", icon: "success", title: "Success" });
                  } else {
                    props?.setMessage && props.setMessage({ type: 1, content: "Failed to create criterion", icon: "error", title: "Error" });
                  }
                }}
              >
                Save
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded bg-bg-weak hover:bg-bg-soft text-text-main text-sm"
                onClick={() => setShowQuickAdd(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        ) : null}
      />
    </div>
  );
};

export default RubricPage;

