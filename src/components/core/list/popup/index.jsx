import { Header, HeaderBox, Overlay, Page } from "../manage/styles";
import { getValue } from "../functions";
import { GetIcon } from "../../../../icons";
import { Logo } from "./styles";
import Tabs from "../../tab";
import React, { useCallback, useEffect, useState } from "react";
import { RowContainer } from "../../../styles/containers/styles";
import { ProfileImage } from "../styles";
import { IconButton } from "../../elements";
import { noimage, mobLogo } from "../../../../images";
import { PageHeader } from "../../input/heading";
import HeaderActions from "./headerActions";
import SearchMenu from "./SearchMenu";

// Utility function to safely get nested property values
const getNestedValue = (obj, path) => {
  if (!obj || !path) return undefined;

  // Handle dot notation (e.g., "coreModules.instaSnap")
  if (path.includes(".")) {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  // Handle direct property access
  return obj[path];
};

// Utility function to check if value exists in array by property or value
const checkArrayCondition = (array, searchValue, searchType = "value") => {
  if (!Array.isArray(array)) return false;

  if (searchType === "value") {
    // Direct value search: coreModules includes "instaSnap"
    return array.includes(searchValue);
  } else if (searchType === "property") {
    // Object property search: coreModules.some(item => item.name === "instaSnap")
    return array.some((item) => typeof item === "object" && item !== null && Object.values(item).includes(searchValue));
  }

  return false;
};

// Utility function to evaluate visibility conditions (supports single and multiple conditions)
const evaluateVisibilityCondition = (visibilityCondition, openData) => {
  if (!visibilityCondition || !openData?.data) {
    return true; // Show by default if no condition or data
  }

  // Handle single condition (legacy format)
  if (visibilityCondition.item && visibilityCondition.if !== undefined) {
    const { item, if: ifValue, then: thenValue, else: elseValue } = visibilityCondition;
    const actualValue = getNestedValue(openData.data, item);
    const conditionMet = actualValue === ifValue;
    return conditionMet ? thenValue : elseValue;
  }

  // Handle multiple conditions with logical operators
  if (visibilityCondition.conditions && Array.isArray(visibilityCondition.conditions)) {
    const { conditions, operator = "AND", then: thenValue = true, else: elseValue = false } = visibilityCondition;

    // Evaluate each individual condition
    const evaluateCondition = (condition) => {
      const { item, if: ifValue, operator: conditionOperator = "equals", arraySearchType = "value" } = condition;
      const actualValue = getNestedValue(openData.data, item);

      // Auto-detect array operations for common operators
      const isActualValueArray = Array.isArray(actualValue);
      const isIfValueArray = Array.isArray(ifValue);

      switch (conditionOperator.toLowerCase()) {
        case "equals":
        case "==":
          // Auto-detect: if actualValue is array, check if it includes ifValue
          if (isActualValueArray) {
            return checkArrayCondition(actualValue, ifValue, arraySearchType);
          }
          return actualValue === ifValue;

        case "not_equals":
        case "!=":
          // Auto-detect: if actualValue is array, check if it doesn't include ifValue
          if (isActualValueArray) {
            return !checkArrayCondition(actualValue, ifValue, arraySearchType);
          }
          return actualValue !== ifValue;

        case "greater_than":
        case ">":
          return Number(actualValue) > Number(ifValue);
        case "less_than":
        case "<":
          return Number(actualValue) < Number(ifValue);
        case "greater_equal":
        case ">=":
          return Number(actualValue) >= Number(ifValue);
        case "less_equal":
        case "<=":
          return Number(actualValue) <= Number(ifValue);

        case "contains":
          // Auto-detect: if actualValue is array, check array inclusion
          if (isActualValueArray) {
            return checkArrayCondition(actualValue, ifValue, arraySearchType);
          }
          // String contains for non-arrays
          return String(actualValue).toLowerCase().includes(String(ifValue).toLowerCase());

        case "in":
          return isIfValueArray ? ifValue.includes(actualValue) : false;
        case "not_in":
          return isIfValueArray ? !ifValue.includes(actualValue) : true;

        // Legacy array operators (still supported but auto-detection makes them optional)
        case "array_includes":
          return checkArrayCondition(actualValue, ifValue, arraySearchType);
        case "array_not_includes":
          return !checkArrayCondition(actualValue, ifValue, arraySearchType);

        case "exists":
          return actualValue !== null && actualValue !== undefined && actualValue !== "";
        case "not_exists":
          return actualValue === null || actualValue === undefined || actualValue === "";

        default:
          // Default case with auto-detection
          if (isActualValueArray) {
            return checkArrayCondition(actualValue, ifValue, arraySearchType);
          }
          return actualValue === ifValue;
      }
    };

    // Apply logical operator
    let result;
    if (operator.toLowerCase() === "or") {
      result = conditions.some(evaluateCondition);
    } else {
      // Default to AND
      result = conditions.every(evaluateCondition);
    }

    return result ? thenValue : elseValue;
  }

  // Fallback: show by default
  return true;
};

const Popup = ({
  noAnimation = false,
  openTheme,
  itemDescription = { type: "", name: "" },
  showInfoType = "view",
  editData,
  customProfileSource,
  profileImage,
  isSingle = false,
  popupMode = "medium",
  showInfo,
  popupMenu,
  formMode,
  selectedMenuItem,
  viewMode,
  themeColors,
  openData,
  setLoaderBox,
  setMessage,
  closeModal,
  itemTitle,
  updatePrivilege,
  isEditingHandler,
  udpateView,
  parentName,
  parentIcon,
  parents = {},
  parentReference,
  headerActions = [],
  routingEnabled = false,
  parentPageAuthorization = false,
  itemPages = [],
  parentData = null,
}) => {
  const titleValue = (itemTitle.collection?.length > 0 ? (openData?.data?.[itemTitle.collection]?.[itemTitle.name] ?? "") : openData?.data?.[itemTitle.name]) || "Please update the itemTitle.";
  const descriptionValue = (itemDescription.collection?.length > 0 ? (openData?.data?.[itemDescription.collection]?.[itemDescription.name] ?? "") : openData?.data?.[itemDescription.name]) || "";
  const makeSlug = (text, existingNames) => {
    const hasPermission = itemPages.find((permission) => permission.key === text);

    let slug = text
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    if (existingNames.has(slug)) {
      let counter = 1;
      while (existingNames.has(`${slug}-${counter}`)) {
        counter++;
      }
      slug = `${slug}-${counter}`;
    }

    existingNames.add(slug);
    return { slug, hasPermission };
  };

  const tabHandler = useCallback(() => {
    const existingNames = new Set();
    const tempTab = openData.actions
      .filter((item) => ["subList", "subTabs", "subItem", "custom", "information", "title", "gallery"].includes(item.type) && evaluateVisibilityCondition(item.visibilityCondition, openData))
      .map((item, index) => {
        const { slug, hasPermission } = makeSlug(item.id, existingNames);
        return {
          name: slug,
          hasPermission: hasPermission,
          title: item.title,
          icon: item.icon,
          type: item.type,
          css: item.type === "information" ? "info" : "",
          formTabTheme: item.formTabTheme ?? "normal",
          content: item.content,
          element: item.tabs?.length ? null : item, // If there are tabs, we set element to null
          dynamicTabs: item.dynamicTabs ?? null,
          tabs: item.tabs
            ?.filter(
              (tabItem) => ["subList", "subTabs", "subItem", "custom", "information", "title", "gallery"].includes(tabItem.type) && evaluateVisibilityCondition(tabItem.visibilityCondition, openData)
            )
            .map((tabItem, index2) => {
              const { slug, hasPermission } = makeSlug(tabItem.id, existingNames);
              return {
                name: slug,
                hasPermission: hasPermission,
                title: tabItem.title,
                type: tabItem.type,
                icon: tabItem.icon,
                css: tabItem.type === "information" ? "info" : "",
                formTabTheme: tabItem.formTabTheme ?? "normal",
                content: tabItem.content,
                element: tabItem.tabs?.length ? null : tabItem,
                dynamicTabs: tabItem.dynamicTabs ?? null,
                tabs: tabItem.tabs
                  ?.filter(
                    (subTabItem) =>
                      ["subList", "subTabs", "subItem", "custom", "information", "title", "gallery"].includes(subTabItem.type) && evaluateVisibilityCondition(subTabItem.visibilityCondition, openData)
                  )
                  .map((subTabItem, index3) => {
                    const { slug, hasPermission } = makeSlug(subTabItem.id, existingNames);
                    return {
                      name: slug,
                      hasPermission: hasPermission,
                      title: subTabItem.title,
                      type: subTabItem.type,
                      icon: subTabItem.icon,
                      css: subTabItem.type === "information" ? "info" : "",
                      element: subTabItem,
                      content: subTabItem.content,
                    };
                  }),
              };
            }),
        };
      });
    showInfo &&
      tempTab.unshift({
        name: `information-${openData.data._id}`,
        hasPermission: true,
        title: `${parentName} Details`,
        icon: "info",
        css: "info",
        type: showInfoType === "edit" ? "edit" : "details",
        element: editData,
        editData: editData,
        parentData: parentData,
        content: { openTheme, titleValue, updatePrivilege, isEditingHandler, udpateView, formMode, parentData, openPageContent: editData?.openPageContent },
      });
    setTabs(tempTab);
  }, [formMode, isEditingHandler, titleValue, openTheme, udpateView, updatePrivilege, showInfo, showInfoType, editData, parentName, openData, parentData]);

  const [tabs, setTabs] = useState([]);
  const [onTabChange, setOnTabChange] = useState(null);
  useEffect(() => {
    tabHandler();
  }, [tabHandler]);
  return (
    <Overlay className={isSingle ? "plain" : ""}>
      <Page className={`${isSingle ? "plain" : ""} ${popupMode ?? "medium"} popup-child ${noAnimation ? "no-animation" : ""}`}>
        {!isSingle && (
          <Header className={`parent ${popupMenu}`}>
            <Logo src={mobLogo} alt="logo" />
            <HeaderBox className="header-data">
              <div>
                {profileImage ? (
                  <ProfileImage className="full profile-image1">
                    <img
                      src={openData?.data[profileImage] ? (customProfileSource ? "" : import.meta.env.VITE_CDN) + openData?.data[profileImage] : noimage}
                      onError={(e) => {
                        e.target.src = noimage; // Hide the image on error
                      }}
                      alt="Profile"
                    ></img>
                  </ProfileImage>
                ) : (
                  <div className="flex items-center justify-center w-[40px] min-w-[40px] h-[40px] min-h-[40px] mr-2 rounded-md border border-gray-300 ">
                    {" "}
                    <GetIcon icon={parentIcon ?? selectedMenuItem.icon}></GetIcon>
                  </div>
                )}
                {/* <div>
                  <span> {`${getValue(itemTitle, titleValue)}`}</span>
                  <span> {getValue(itemDescription, descriptionValue)}</span>
                </div> */}
                <PageHeader title={getValue(itemTitle, titleValue)} line={false} description={getValue(itemDescription, descriptionValue)} wrap={false}></PageHeader>
              </div>
              <div className="flex-1 flex justify-end pr-4 relative">{tabs.length > 0 && <SearchMenu tabs={tabs} onTabChange={setOnTabChange} />}</div>
              <div className="flex items-centerjustify-end gap-[10px!important]">
                {headerActions.length === 0 ? null : <HeaderActions openData={openData} actions={headerActions}></HeaderActions>}
                <IconButton icon="back" theme={themeColors} ClickEvent={closeModal}></IconButton>
              </div>
            </HeaderBox>
          </Header>
        )}

        <RowContainer theme={themeColors} className="popup-data">
          {tabs.length > 0 && (
            <Tabs
              parentReference={parentReference}
              setLoaderBox={setLoaderBox}
              setMessage={setMessage}
              parents={parents}
              editData={editData}
              openData={openData}
              popupMenu={popupMenu}
              tabs={tabs}
              onTabChange={onTabChange}
              routingEnabled={routingEnabled}
            ></Tabs>
          )}
        </RowContainer>
      </Page>
    </Overlay>
  );
};
export default Popup;
