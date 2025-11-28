import React, { useState, useEffect, useMemo } from "react";
import { TableView, ThView, TdView, TrView } from "../list/styles";
import { AddButton } from "../list/styles";
import { AddIcon, GetIcon } from "../../../icons";
import { useSelector } from "react-redux";
import CrudForm from "../list/create";
import { getValue } from "../list/functions";
import { IconButton } from "../elements";
import moment from "moment";
// import { CustomLabel, ErrorLabel, Footnote } from "./index";
import InfoBoxItem from "./info";
import CustomLabel from "./label";
import ErrorLabel from "./error";
import Footnote from "./footnote";
// import InfoBoxItem from "../infobox/InfoBoxItem";

const MultiForm = React.memo((props) => {
  const themeColors = useSelector((state) => state.themeColors);
  const [items, setItems] = useState(props.value || []);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [defaultValues, setDefaultValues] = useState({});

  // Get compact attributes from multiFormData
  const [compactAttributes] = useState(props.multiFormData);

  // Track previous parent data for reset detection
  const [prevParentData, setPrevParentData] = useState(null);

  // Helper function to check if attribute should be shown based on parentCondition
  const checkParentCondition = (attribute, parentData) => {
    if (!attribute.parentCondition || !parentData) {
      return true; // Show by default if no parentCondition or no parentData
    }

    const { item, collection, if: ifValue, then: thenValue, else: elseValue } = attribute.parentCondition;
    
    // Determine the source of the value based on collection property
    let parentValue;
    if (collection) {
      // If collection is specified and not empty, read from the nested object
      parentValue = parentData[collection]?.[item];
    } else {
      // If collection is empty or not specified, read from the main object
      parentValue = parentData[item];
    }

    let conditionMet = false;
    if (Array.isArray(ifValue)) {
      conditionMet = ifValue.some((val) => val?.toString() === parentValue?.toString());
    } else {
      conditionMet = parentValue?.toString() === ifValue?.toString();
    }

    const resultValue = conditionMet ? thenValue : elseValue;
    
    // Return false (hide) if the result is "hidden" or "disabled", otherwise return true (show)
    return resultValue !== "hidden" && resultValue !== "disabled";
  };

  // Filter attributes based on parentCondition - recalculates when parentData changes
  const visibleAttributes = useMemo(() => {
    return compactAttributes.filter((attr) => checkParentCondition(attr, props.parentData));
  }, [compactAttributes, props.parentData]);

  useEffect(() => {
    setItems(props.value || []);
  }, [props.value]);

  // Initialize default values from attributes and parent data
  useEffect(() => {
    const initializeDefaults = async () => {
      if (!compactAttributes || compactAttributes.length === 0) return;

      const defaults = {};
      const date = new Date();

      const promises = compactAttributes.map(async (item) => {
        // Check if default value should come from parent data
        if (item.default?.source === "parent" && item.default?.field && props.parentData) {
          const parentValue = props.parentData[item.default.field];
          
          if (item.default.type === "match" && item.default.dataset) {
            // Match value from dataset
            const matchedItem = item.default.dataset.find(d => d.match === parentValue);
            defaults[item.name] = matchedItem ? matchedItem.value : (item.default.fallback ?? null);
          } else {
            // Direct value from parent
            defaults[item.name] = parentValue ?? (item.default.fallback ?? null);
          }
        } else {
          // Use attribute's default value
          if (item.type === "checkbox" || item.type === "toggle") {
            const bool = JSON.parse(item.default === "false" || item.default === "true" ? item.default : "false");
            if (item.add) {
              defaults[item.name] = bool;
            }
          } else if (item.type === "datetime" || item.type === "date" || item.type === "time") {
            if (item.add) {
              defaults[item.name] = item.default === "empty" ? "" : moment(item.default).isValid() ? moment(item.default).toISOString() : date.toISOString();
            }
          } else if (item.type === "image" || item.type === "file") {
            if (item.add) {
              defaults[item.name] = item.multiple ? [] : "";
            }
          } else if (item.type === "multiSelect") {
            if (item.add) {
              defaults[item.name] = Array.isArray(item.default) ? item.default : [];
            }
          } else {
            if (item.add) {
              defaults[item.name] = item.default ?? "";
            }
          }
        }
      });

      await Promise.all(promises);
      setDefaultValues(defaults);
    };

    initializeDefaults();
  }, [compactAttributes, props.parentData]);

  // Reset items when specified parent fields change
  useEffect(() => {
    console.log("props.parentData", props.parentData);
    
    if (!props.resetOnParent || !props.parentData || !prevParentData) {
      setPrevParentData(props.parentData);
      return;
    }

    // Check if any of the resetOnParent fields have changed
    const shouldReset = props.resetOnParent.some((fieldName) => {
      const currentValue = props.parentData?.[fieldName];
      const previousValue = prevParentData?.[fieldName];
      return currentValue !== previousValue;
    });

    if (shouldReset) {
      // Reset items and close any open forms
      setItems([]);
      setIsCreating(false);
      setIsEditing(false);
      setSelectedItem(null);
      setSelectedIndex(null);
      // Notify parent component of the reset
      props.onChange({ target: { value: [] } }, props.id, props.type);
    }

    setPrevParentData(props.parentData);
  }, [props.parentData, props.resetOnParent, prevParentData, props.onChange, props.id, props.type]);

  const handleAdd = () => {
    const maxItems = props.maximumItems ?? Infinity;
    
    // Check if maximum items limit is reached
    if (items.length >= maxItems) {
      if (props.setMessage) {
        props.setMessage({
          type: 1,
          content: `Maximum ${maxItems} ${props.label || "item"}${maxItems > 1 ? "s" : ""} allowed`,
          icon: "warning",
          title: "Limit Reached"
        });
      }
      return;
    }
    
    setSelectedItem(null);
    setSelectedIndex(null);
    setIsCreating(true);
  };

  const handleEdit = (item, index) => {
    setSelectedItem(item);
    setSelectedIndex(index);
    setIsEditing(true);
  };

  const handleDelete = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    props.onChange({ target: { value: newItems } }, props.id, props.type);
  };

  const handleSubmit = async (data) => {
    let newItems;
    if (selectedIndex !== null) {
      // Update existing item
      newItems = items.map((item, i) => (i === selectedIndex ? data : item));
    } else {
      // Add new item
      newItems = [...items, data];
    }
    setItems(newItems);
    props.onChange({ target: { value: newItems } }, props.id, props.type);
    setIsCreating(false);
    setIsEditing(false);
    setSelectedItem(null);
    setSelectedIndex(null);
    return true; // Return true to close the form
  };

  const handleClose = () => {
    setIsCreating(false);
    setIsEditing(false);
    setSelectedItem(null);
    setSelectedIndex(null);
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {props.title && <CustomLabel name={props.name} label={props.title} required={props.required} sublabel={props.sublabel} error={props.error ?? ""} />}
      <InfoBoxItem info={props.info} />

      {/* 1. TableView - Show existing items or empty state */}
      {items.length > 0 ? (
        <div className="border border-stroke-soft rounded-lg overflow-hidden">
          <TableView theme={themeColors}>
            <thead>
              <tr>
                {visibleAttributes.map((attr, index) => (
                  <ThView key={`header-${attr.name}-${index}`}>
                    <span>{attr.label}</span>
                  </ThView>
                ))}
                <ThView key="actions" style={{ width: "100px" }}>
                  <span>Actions</span>
                </ThView>
              </tr>
            </thead>
            <tbody>
              {items.map((item, itemIndex) => (
                <TrView key={`row-${itemIndex}`}>
                  {visibleAttributes.map((attr, attrIndex) => {
                    let itemValue = attr.collection?.length > 0 && attr.showItem?.length > 0 ? item[attr.collection]?.[attr.showItem] : item[attr.name];

                    if (attr.showSubItem) {
                      itemValue = attr.collection?.length > 0 && attr.showItem?.length > 0 ? (item[attr.collection]?.[attr.showItem]?.[attr.showSubItem] ?? "") : item[attr.name];
                    }

                    const value = typeof attr.render === "function" ? attr.render(itemValue, item, attr, props) : getValue(attr, itemValue);

                    return <TdView key={`cell-${itemIndex}-${attrIndex}`}>{typeof attr.render === "function" ? attr.render(itemValue, item, attr, props) : <span>{value || "--"}</span>}</TdView>;
                  })}
                  <TdView key={`actions-${itemIndex}`}>
                    <div className="flex gap-2">
                      <IconButton
                        icon="edit"
                        align="plain small"
                        ClickEvent={(e) => {
                          e.stopPropagation();
                          handleEdit(item, itemIndex);
                        }}
                      />
                      <IconButton
                        icon="delete"
                        align="plain small error"
                        ClickEvent={(e) => {
                          e.stopPropagation();
                          if (props.setMessage) {
                            props.setMessage({
                              type: 2,
                              content: `Do you want to delete this ${props.label || "item"}?`,
                              proceed: "Delete",
                              onProceed: async () => {
                                handleDelete(itemIndex);
                                return true;
                              },
                            });
                          } else {
                            if (window.confirm(`Delete this ${props.label || "item"}?`)) {
                              handleDelete(itemIndex);
                            }
                          }
                        }}
                      />
                    </div>
                  </TdView>
                </TrView>
              ))}
            </tbody>
          </TableView>
        </div>
      ) : !isCreating && !isEditing ? (
        <div className="border border-stroke-soft rounded-lg p-8 text-center bg-bg-weak">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-bg-soft flex items-center justify-center">
              <GetIcon icon="ticket" />
            </div>
            <div>
              <p className="text-text-main font-medium">No {props.label || "items"} added yet</p>
              <p className="text-text-sub text-sm mt-1">Click the button below to add your first {(props.label || "item").toLowerCase()}</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* 2. Form - Plain form (no popup) */}
      {(isCreating || isEditing) && (
        <div className="border border-stroke-soft rounded-lg p-4 bg-bg-white">
          <CrudForm
            formStyle={props.formStyle}
            setMessage={props.setMessage}
            setLoaderBox={props.setLoaderBox || (() => {})}
            formMode={props.formMode || "single"}
            api={props.api || "temp"}
            formType={isEditing ? "put" : "post"}
            header={props.formType === "inline" ? "" : `${isEditing ? "Edit" : "Add"} ${props.label || "Item"}`}
            button={isEditing ? "Update" :  "Save"}
            formInput={visibleAttributes}
            formValues={selectedItem || defaultValues}
            formErrors={{}}
            formLayout={props.formLayout}
            submitHandler={handleSubmit}
            isOpenHandler={handleClose}
            isOpen={true}
            css={props.formType === "inline" ? "plain multiForm" : ""}
            formTabTheme={"normal"}
            parentData={props.parentData}
          />
        </div>
      )}

      {/* 3. Add New Button - Centered */}
      {!isCreating && !isEditing && (
        <div className="flex justify-center pt-2">
          <AddButton 
            theme={themeColors} 
            onClick={handleAdd} 
            className="secondary"
            disabled={items.length >= (props.maximumItems ?? Infinity)}
            style={{
              opacity: items.length >= (props.maximumItems ?? Infinity) ? 0.5 : 1,
              cursor: items.length >= (props.maximumItems ?? Infinity) ? 'not-allowed' : 'pointer'
            }}
          >
            <AddIcon />
            <span>Add {props.label || "Item"}</span>
          </AddButton>
        </div>
      )}

      <ErrorLabel error={props.error} info={props.info} />
      <Footnote {...props} />
    </div>
  );
});

export default MultiForm;
