import React, { useState, startTransition, useEffect, useCallback, memo, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { InlineMenu, InlineMenuItem, PopIconMenuItem, PopMenuItem, Tab, TabContainer, TabContents, TabHeader, Title } from "./styles";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { GetIcon } from "../../../icons";
import { HLine } from "../dashboard/styles";
import ListTable from "../list/list";
import CrudForm from "../list/create";
import ImageGallery from "../list/imagegallery";
import { CustomPageTemplate } from "../list/custom";
import RenderSubPage from "../../project/router/pages";
import { getData } from "../../../backend/api";
import { DisplayInformations } from "../list/popup/displayinformations";
import LoaderBox from "../loader";

// Helper functions defined at the top level
const generateSlug = (text) => {
  return text
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

const findTabBySlug = (tabs, slug) => {
  return tabs?.find((tab) => generateSlug(tab.title) === slug);
};

const Tabs = ({
  tabs: tabsData = [],
  className = "",
  popupMenu = "horizontal",
  editData,
  setMessage,
  setLoaderBox,
  openData,
  parentReference,
  parents,
  item,
  onTabChange = null,
  routingEnabled = false,
}) => {
  // Development-only render tracking (set to false in production)
  const ENABLE_RENDER_TRACKING = false;
  const renderCount = useRef(0);
  const lastRenderReason = useRef("initial");

  if (ENABLE_RENDER_TRACKING) {
    renderCount.current += 1;
    const reasons = [];

    // Track what might be causing re-renders
    if (renderCount.current > 1) {
      if (tabsData?.length !== (renderCount.lastTabsLength || 0)) {
        reasons.push(`tabsData length changed: ${renderCount.lastTabsLength} -> ${tabsData?.length}`);
      }
      if (openData?.data?._id !== renderCount.lastOpenDataId) {
        reasons.push(`openData._id changed: ${renderCount.lastOpenDataId} -> ${openData?.data?._id}`);
      }
    }

    renderCount.lastTabsLength = tabsData?.length;
    renderCount.lastOpenDataId = openData?.data?._id;
    lastRenderReason.current = reasons.length > 0 ? reasons.join(", ") : "props unchanged";

    console.log(`[Tabs] Render #${renderCount.current} - Reason: ${lastRenderReason.current}`);
  }
  const { slug, mainTab: mainTabParam, subTab: subTabParam, inlineTab: inlineTabParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [t] = useTranslation();
  const themeColors = useSelector((state) => state.themeColors);
  // Declare tabs before any effect/hooks that reference it
  const [tabs, setTabs] = useState(tabsData);

  // Find tab and its parent hierarchy - defined before it's used
  const findTabHierarchy = (tabName, sourceTabsParam = null) => {
    const sourceTabs = sourceTabsParam ?? tabsData;
    if (!tabName) {
      return {
        activeTab: sourceTabs[0]?.name || null,
        subActiveTab: null,
        subActiveInlineTab: null,
        openedTab: {
          [sourceTabs[0]?.name]: true,
        },
        subMenus: sourceTabs[0]?.tabs || null,
      };
    }
    // Look in main tabs
    const mainTab = sourceTabs.find((tab) => tab.name === tabName);
    if (mainTab) return { mainTab };

    // Look in secondary tabs
    for (const main of sourceTabs) {
      if (!main.tabs) continue;
      const subTab = main.tabs.find((tab) => tab.name === tabName);
      if (subTab) return { mainTab: main, subTab };

      // Look in inline tabs
      for (const sub of main.tabs) {
        if (!sub.tabs) continue;
        const inlineTab = sub.tabs.find((tab) => tab.name === tabName);
        if (inlineTab) return { mainTab: main, subTab: sub, inlineTab };
      }
    }
    return {};
  };

  // Initialize state from URL or defaults
  const initializeState = (sourceTabs) => {
    const workingTabs = Array.isArray(sourceTabs) && sourceTabs.length > 0 ? sourceTabs : tabsData;
    let mainTab, subTab, inlineTab;

    // Build hierarchy step by step from URL parameters
    if (mainTabParam) {
      mainTab = workingTabs.find((tab) => tab.name === mainTabParam);
    }

    if (mainTab && subTabParam) {
      subTab = mainTab.tabs?.find((tab) => tab.name === subTabParam);
    }

    if (subTab && inlineTabParam) {
      // For dynamic tabs, the inline tab might not exist yet, so we'll store the target
      inlineTab = subTab.tabs?.find((tab) => tab.name === inlineTabParam);
    }

    // Fallback to first available tab if no match found
    if (!mainTab && workingTabs.length > 0) {
      mainTab = workingTabs[0];
      if (mainTab.tabs?.length > 0) {
        subTab = mainTab.tabs.find((tab) => tab.type !== "title");
        if (subTab?.tabs?.length > 0) {
          inlineTab = subTab.tabs.find((tab) => tab.type !== "title");
        }
      }
    } else if (mainTab && !subTab && mainTab.tabs?.length > 0) {
      subTab = mainTab.tabs.find((tab) => tab.type !== "title");
      if (subTab?.tabs?.length > 0) {
        inlineTab = subTab.tabs.find((tab) => tab.type !== "title");
      }
    }

    // Ensure we always have a valid state
    const activeTab = mainTab?.name || workingTabs[0]?.name || null;
    const subActiveTab = subTab?.name || null;
    // For dynamic tabs, preserve the inlineTabParam even if the tab doesn't exist yet
    const subActiveInlineTab = inlineTab?.name || (subTab?.dynamicTabs && inlineTabParam) || null;

    const openedTab = {};
    if (activeTab) openedTab[activeTab] = true;
    if (subActiveTab) openedTab[subActiveTab] = true;
    if (subActiveInlineTab) openedTab[subActiveInlineTab] = true;

    return {
      activeTab,
      subActiveTab,
      subActiveInlineTab,
      openedTab,
      subMenus: mainTab?.tabs || workingTabs[0]?.tabs || null,
    };
  };

  const [state, setState] = useState(() => {
    if (!routingEnabled) {
      // If routing is disabled, just select the first tab
      const firstTab = tabsData[0];
      return {
        activeTab: firstTab?.name || null,
        subActiveTab: null,
        subActiveInlineTab: null,
        openedTab: { [firstTab?.name]: true },
        subMenus: firstTab?.tabs || null,
      };
    }
    return initializeState(tabsData);
  });

  useEffect(() => {
    if (routingEnabled) {
      try {
        setError(null);
        setIsLoading(true);
        const newState = initializeState(tabs);
        setState(newState);

        // Check if we need to load dynamic tabs for URL-based navigation
        if (newState.subActiveTab && tabs.length > 0) {
          const mainTab = tabs.find((t) => t.name === newState.activeTab);
          const subTab = mainTab?.tabs?.find((t) => t.name === newState.subActiveTab);

          // Check if subTab has dynamic tabs and needs loading:
          // 1. Dynamic tabs are not loaded yet, OR
          // 2. We have a specific inline tab from URL that doesn't exist in current tabs
          const needsDynamicLoad =
            subTab?.dynamicTabs && (!subTab.tabs || subTab.tabs.length === 0 || (newState.subActiveInlineTab && !subTab.tabs?.find((t) => t.name === newState.subActiveInlineTab)));

          if (needsDynamicLoad) {
            // Initialize dynamic tabs for URL-based loading
            getData({ [parentReference]: openData?.data?._id }, subTab.dynamicTabs.api)
              .then((response) => {
                if (response.status === 200) {
                  // Merge preFilter items with API data
                  const preFilterItems = subTab.dynamicTabs.preFilter || [];
                  const apiItems = response.data || [];

                  // Process preFilter items
                  const preFilterTabs = preFilterItems.map((preItem) => ({
                    name: preItem.id + "-" + subTab.name,
                    title: preItem.value,
                    type: subTab.dynamicTabs.template.type || "subList",
                    icon: subTab.dynamicTabs.template.icon || "",
                    css: subTab.dynamicTabs.template.css || "",
                    element: {
                      ...subTab.dynamicTabs.template,
                      // Pass dynamic title to the component
                      title: preItem.value, // This will be passed as props.title
                      ...(subTab.dynamicTabs.template.type === "custom" && {
                        page: subTab.dynamicTabs.template.page,
                        ticketType: subTab.dynamicTabs.template.ticketType,
                        description: subTab.dynamicTabs.template.description,
                      }),
                      params: {
                        ...subTab.dynamicTabs.template.params,
                        shortName: preItem.value,
                        preFilter: {
                          ...subTab.dynamicTabs.template.params?.preFilter,
                          // Process preFilterData and replace placeholders
                          ...(preItem.preFilterData &&
                            Object.keys(preItem.preFilterData).reduce((acc, key) => {
                              let value = preItem.preFilterData[key];
                              // Replace {{eventId}} with actual eventId
                              if (value === "{{eventId}}") {
                                value = openData?.data?._id;
                              }
                              acc[key] = value;
                              return acc;
                            }, {})),
                        },
                        dynamicId: preItem.id,
                        dynamicValue: preItem.value,
                        dynamicData: preItem,
                      },
                    },
                    content: subTab.dynamicTabs.template.content,
                  }));

                  // Process API items
                  const apiTabs =
                    apiItems.map((itemMenu) => ({
                      name: `${subTab.name}-${itemMenu.id}`,
                      title: itemMenu.value,
                      type: subTab.dynamicTabs.template.type || "subList",
                      icon: subTab.dynamicTabs.template.icon || "",
                      css: subTab.dynamicTabs.template.css || "",
                      element: {
                        ...subTab.dynamicTabs.template,
                        // Pass dynamic title to the component
                        title: itemMenu.value, // This will be passed as props.title
                        ...(subTab.dynamicTabs.template.type === "custom" && {
                          page: subTab.dynamicTabs.template.page,
                          ticketType: subTab.dynamicTabs.template.ticketType,
                          description: subTab.dynamicTabs.template.description,
                        }),
                        params: {
                          ...subTab.dynamicTabs.template.params,
                          shortName: itemMenu.value,
                          preFilter: {
                            ...subTab.dynamicTabs.template.params?.preFilter,
                            instance: itemMenu.id,
                            ...(subTab.dynamicTabs.customFilter && { [subTab.dynamicTabs.customFilter]: itemMenu.id }),
                          },
                          dynamicId: itemMenu.id,
                          dynamicValue: itemMenu.value,
                          dynamicData: itemMenu,
                        },
                      },
                      content: subTab.dynamicTabs.template.content,
                    })) || [];

                  // Combine preFilter tabs with API tabs
                  const newTabs = [...preFilterTabs, ...apiTabs];

                  const updatedTab = { ...subTab, tabs: newTabs };
                  const updatedMainTabsList = mainTab.tabs.map((st) => (st.name === subTab.name ? updatedTab : st));
                  setTabs((prevTabs) => prevTabs.map((t) => (t.name === mainTab.name ? { ...t, tabs: updatedMainTabsList } : t)));

                  // Update state with dynamic tab selection based on URL
                  // First, try to find the specific inline tab from URL, otherwise use first tab
                  const targetInlineTab = (newState.subActiveInlineTab && newTabs.find((dt) => dt.name === newState.subActiveInlineTab)) || newTabs[0];

                  if (targetInlineTab) {
                    // If no specific inline tab in URL, navigate to first available tab
                    if (!newState.subActiveInlineTab && routingEnabled) {
                      let path = `${location.pathname.split("/").slice(0, 3).join("/")}`;
                      if (newState.activeTab) path += `/${newState.activeTab}`;
                      if (newState.subActiveTab) path += `/${newState.subActiveTab}`;
                      if (targetInlineTab.name) path += `/${targetInlineTab.name}`;
                      navigate(path, { replace: true });
                    }

                    setState((prev) => ({
                      ...prev,
                      subActiveInlineTab: targetInlineTab.name,
                      openedTab: {
                        ...prev.openedTab,
                        [targetInlineTab.name]: true,
                      },
                      subMenus: updatedMainTabsList,
                    }));
                  }
                }
              })
              .catch((error) => {
                console.error("Error loading dynamic tabs on URL load:", error);
              });
          }
        }
      } catch (err) {
        console.error("Error initializing tab state:", err);
        setError("Failed to initialize tabs. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [mainTabParam, subTabParam, inlineTabParam, tabsData, routingEnabled]);

  // Prevent infinite re-renders - only run when tabsData changes and no active tab is set
  useEffect(() => {
    if (tabsData && tabsData.length > 0 && !state.activeTab && !routingEnabled) {
      try {
        setState((prevState) => ({
          ...prevState,
          activeTab: tabsData[0]?.name || null,
          subMenus: tabsData[0]?.tabs || null,
          openedTab: { [tabsData[0]?.name]: true },
        }));
      } catch (err) {
        console.error("Error setting default tab:", err);
        setError("Failed to load default tab.");
      }
    }
  }, [tabsData, routingEnabled]);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debug logging
  // console.log("Tab State:", {
  //   activeTab: state.activeTab,
  //   subActiveTab: state.subActiveTab,
  //   subActiveInlineTab: state.subActiveInlineTab,
  //   tabsData: tabsData.length,
  //   routingEnabled
  // });
  // Update state and URL atomically
  const updateState = (updates) => {
    setState((prev) => {
      const newState = { ...prev, ...updates };
      if (!routingEnabled) return newState;
      // Build the new path
      let path = `${location.pathname.split("/").slice(0, 3).join("/")}`; // Assumes base path is /entity/:slug
      if (newState.activeTab) path += `/${newState.activeTab}`;
      if (newState.subActiveTab) path += `/${newState.subActiveTab}`;
      if (newState.subActiveInlineTab) path += `/${newState.subActiveInlineTab}`;

      navigate(path, { replace: true });
      return newState;
    });
  };

  const mainTabChange = (tab) => {
    if (!tab || tab.name === state.activeTab || isTransitioning) return;

    setIsTransitioning(true);
    startTransition(() => {
      try {
        const { mainTab } = findTabHierarchy(tab.name, tabs);
        if (!mainTab) return;

        // Find first non-title sub tab
        let firstSubTab = null;
        let firstInlineTab = null;

        if (mainTab.tabs?.length > 0) {
          firstSubTab = mainTab.tabs.find((tab) => tab.type !== "title");

          // If the first sub tab has dynamic tabs already loaded, select the first one
          if (firstSubTab?.dynamicTabs && firstSubTab.tabs?.length > 0) {
            firstInlineTab = firstSubTab.tabs.find((t) => t.type !== "title");
          }
        }

        // Update state atomically
        updateState({
          activeTab: mainTab.name,
          subActiveTab: firstSubTab?.name || null,
          subActiveInlineTab: firstInlineTab?.name || null,
          openedTab: {
            [mainTab.name]: true,
            [firstSubTab?.name]: true,
            ...(firstInlineTab ? { [firstInlineTab.name]: true } : {}),
          },
          subMenus: mainTab.tabs || null,
        });
      } finally {
        setIsTransitioning(false);
      }
    });
  };

  const subTabChange = async (tab) => {
    if (!tab || tab.name === state.subActiveTab || isTransitioning) return;

    setIsTransitioning(true);
    try {
      const { mainTab, subTab } = findTabHierarchy(tab.name, tabs);
      if (!mainTab || !subTab) return;

      // Handle dynamic tabs
      if (tab.dynamicTabs && (!tab.tabs || tab.tabs.length === 0)) {
        try {
          const response = await getData({ [parentReference]: openData?.data?._id }, tab.dynamicTabs.api);

          if (response.status === 200) {
            // Merge preFilter items with API data
            const preFilterItems = tab.dynamicTabs.preFilter || [];
            const apiItems = response.data || [];

            // Process preFilter items
            const preFilterTabs = preFilterItems.map((preItem) => ({
              name: `${subTab.name}-${preItem.id}`,
              title: preItem.value,
              type: tab.dynamicTabs.template.type || "subList",
              icon: tab.dynamicTabs.template.icon || "",
              css: tab.dynamicTabs.template.css || "",
              element: {
                ...tab.dynamicTabs.template,
                // Pass dynamic title to the component
                title: preItem.value, // This will be passed as props.title
                ...(tab.dynamicTabs.template.type === "custom" && {
                  page: tab.dynamicTabs.template.page,
                  ticketType: tab.dynamicTabs.template.ticketType,
                  description: tab.dynamicTabs.template.description,
                }),
                params: {
                  ...tab.dynamicTabs.template.params,
                  shortName: preItem.value,
                  preFilter: {
                    ...tab.dynamicTabs.template.params?.preFilter,
                    // Process preFilterData and replace placeholders
                    ...(preItem.preFilterData &&
                      Object.keys(preItem.preFilterData).reduce((acc, key) => {
                        let value = preItem.preFilterData[key];
                        // Replace {{eventId}} with actual eventId
                        if (value === "{{eventId}}") {
                          value = openData?.data?._id;
                        }
                        acc[key] = value;
                        return acc;
                      }, {})),
                  },
                  dynamicId: preItem.id,
                  dynamicValue: preItem.value,
                  dynamicData: preItem,
                },
              },
              content: tab.dynamicTabs.template.content,
            }));

            // Process API items
            const apiTabs =
              apiItems.map((itemMenu) => ({
                name: `${subTab.name}-${itemMenu.id}`,
                title: itemMenu.value,
                type: tab.dynamicTabs.template.type || "subList", // Use template type or default to subList
                icon: tab.dynamicTabs.template.icon || "",
                css: tab.dynamicTabs.template.css || "",
                element: {
                  ...tab.dynamicTabs.template,
                  // Pass dynamic title to the component
                  title: itemMenu.value, // This will be passed as props.title
                  // For custom pages, include page property
                  ...(tab.dynamicTabs.template.type === "custom" && {
                    page: tab.dynamicTabs.template.page,
                    ticketType: tab.dynamicTabs.template.ticketType,
                    description: tab.dynamicTabs.template.description,
                  }),
                  params: {
                    ...tab.dynamicTabs.template.params,
                    shortName: itemMenu.value,
                    // Add dynamic filtering based on the item
                    preFilter: {
                      ...tab.dynamicTabs.template.params?.preFilter,
                      instance: itemMenu.id,
                      // Allow custom filtering based on template configuration
                      ...(tab.dynamicTabs.customFilter && { [tab.dynamicTabs.customFilter]: itemMenu.id }),
                    },
                    // Pass additional dynamic props
                    dynamicId: itemMenu.id,
                    dynamicValue: itemMenu.value,
                    dynamicData: itemMenu,
                  },
                },
                content: tab.dynamicTabs.template.content,
              })) || [];

            // Combine preFilter tabs with API tabs
            const newTabs = [...preFilterTabs, ...apiTabs];

            // Update tabs with dynamic content
            const updatedTab = { ...tab, tabs: newTabs };
            const updatedMainTabsList = mainTab.tabs.map((st) => (st.name === tab.name ? updatedTab : st));
            setTabs((prevTabs) =>
              prevTabs.map((t) =>
                t.name === mainTab.name
                  ? {
                      ...t,
                      tabs: updatedMainTabsList,
                    }
                  : t
              )
            );

            // Update state atomically with first dynamic tab and refreshed subMenus
            if (newTabs?.length > 0) {
              const firstDynamicTab = newTabs[0];
              updateState({
                activeTab: mainTab.name,
                subActiveTab: updatedTab.name,
                subActiveInlineTab: firstDynamicTab.name,
                openedTab: {
                  [mainTab.name]: true,
                  [updatedTab.name]: true,
                  [firstDynamicTab.name]: true,
                },
                subMenus: updatedMainTabsList,
              });
            }
          }
        } catch (error) {
          console.error("Error loading dynamic tabs:", error);
        }
      } else {
        // Find first inline tab if available
        const firstInlineTab = tab.tabs?.find((t) => t.type !== "title");

        // For dynamic tabs that are already loaded, we need to handle selection properly
        let targetInlineTab = null;

        if (tab.dynamicTabs && tab.tabs?.length > 0) {
          // For dynamic tabs, check if current inline tab belongs to this sub tab
          const currentInlineTabBelongsToThisSubTab = state.subActiveInlineTab && tab.tabs.some((t) => t.name === state.subActiveInlineTab);

          if (currentInlineTabBelongsToThisSubTab) {
            // Keep the current selection if it belongs to this sub tab
            targetInlineTab = tab.tabs.find((t) => t.name === state.subActiveInlineTab);
          } else {
            // Auto-select first tab when switching to this dynamic tab
            targetInlineTab = firstInlineTab;
          }
        } else {
          // For non-dynamic tabs, use the first inline tab
          targetInlineTab = firstInlineTab;
        }

        // Update state atomically
        updateState({
          activeTab: mainTab.name,
          subActiveTab: subTab.name,
          subActiveInlineTab: targetInlineTab?.name || null,
          openedTab: {
            [mainTab.name]: true,
            [subTab.name]: true,
            ...(targetInlineTab ? { [targetInlineTab.name]: true } : {}),
          },
        });
      }
    } finally {
      setIsTransitioning(false);
    }
  };

  const subInlineTabChange = (tab) => {
    if (!tab || tab.name === state.subActiveInlineTab || isTransitioning) return;
    console.log({ tab });
    setIsTransitioning(true);
    try {
      const { mainTab, subTab, inlineTab } = findTabHierarchy(tab.name, tabs);
      if (mainTab && subTab && inlineTab) {
        updateState({
          activeTab: mainTab.name,
          subActiveTab: subTab.name,
          subActiveInlineTab: inlineTab.name,
          openedTab: {
            [mainTab.name]: true,
            [subTab.name]: true,
            [inlineTab.name]: true,
          },
        });
      }
    } finally {
      setIsTransitioning(false);
    }
  };

  const rederInlineMenu = (subTab, index) => {
    return (
      <InlineMenuItem
        key={`${subTab.name}-${index}`}
        theme={themeColors}
        className={`${subTab.name} ${state.subActiveInlineTab === subTab.name && "active"} ${popupMenu}`}
        onClick={() => {
          subInlineTabChange(subTab);
        }}
      >
        {subTab.icon && <GetIcon icon={subTab.icon}></GetIcon>}
        <span>{t(subTab.title ?? subTab.value)}</span>
      </InlineMenuItem>
    );
  };

  const renderPage = useCallback(
    (tab, editData, setMessage, setLoaderBox, openData, parents) => {
      try {
        const { element, type, content, hasPermission } = tab;

        // Add fallback for missing element
        if (!element && type !== "jsx" && type !== "information") {
          // Only log warning once per tab to avoid spam
          if (!tab._warningLogged) {
            console.warn(`Tab ${tab.name || tab.title || "unknown"} has no element defined`);
            tab._warningLogged = true;
          }
          return (
            <div className="p-4 text-center text-gray-500">
              <p>No content available for this tab</p>
              <p className="text-sm text-gray-400 mt-1">Tab: {tab.name || tab.title || "Unknown"}</p>
            </div>
          );
        }

        switch (type) {
          case "custom":
            return (
              <CustomPageTemplate
                key={`${tab.name}-${openData?.data?._id || "default"}`}
                openData={openData}
                {...element}
                themeColors={themeColors}
                setLoaderBox={setLoaderBox}
                setMessage={setMessage}
                content={content ?? RenderSubPage(tab.element, content)}
              />
            );

          case "information":
            return <CrudForm key={tab.name} {...editData} css="plain head-hide info" formTabTheme={tab.formTabTheme} noTabView={true} parentData={openData?.data} />;

          case "gallery":
            return <ImageGallery key={tab.name} showTitle={element.showTitle} imageSettings={element.imageSettings} api={`${element.api}`} openData={openData} />;

          case "edit":
            return <CrudForm key={tab.name} {...editData} css="plain head-hide info" parentData={openData?.data} />;

          case "details":
            return (
              <TabContainer className="tab">
                {content.openPageContent ? (
                  content.openPageContent(openData?.data, content)
                ) : (
                  <>
                    <DisplayInformations
                      opentThem={content.opentTheme}
                      editingHandler={(event) => {
                        event.stopPropagation();
                        content.isEditingHandler(openData?.data, content.udpateView, content.titleValue);
                      }}
                      titleValue={content.titleValue}
                      popupMenu={popupMenu}
                      formMode={content.formMode}
                      style={content.style ?? "style1"}
                      attributes={openData.attributes}
                      data={openData.data}
                      parentData={content.parentData}
                      updatePrivilege={content.updatePrivilege}
                    />
                  </>
                )}
              </TabContainer>
            );

          case "jsx":
            return content;

          default:
            if (element?.attributes) {
              return (
                <ListTable
                  hasPermission={hasPermission}
                  name={tab.name}
                  headerStyle={"sub"}
                  icon={element.icon ?? ""}
                  showInfo={element.showInfo ?? true}
                  viewMode={element.viewMode ?? "table"}
                  setMessage={setMessage}
                  setLoaderBox={setLoaderBox}
                  parentReference={element?.params?.parentReference}
                  referenceId={openData?.data?._id}
                  attributes={element.attributes}
                  {...element.params}
                  {...hasPermission?.permission}
                  parentData={openData?.data}
                  parents={{
                    ...parents,
                  }}
                />
              );
            }

            // Handle case where element exists but has no attributes
            if (element && !element.attributes) {
              return (
                <div className="p-4 text-center text-gray-500">
                  <p>Tab configuration incomplete</p>
                  <p className="text-sm text-gray-400 mt-1">Missing attributes for tab: {tab.name || tab.title || "Unknown"}</p>
                </div>
              );
            }

            return (
              <div className="p-4 text-center text-gray-500">
                <p>No content configured for this tab</p>
                <p className="text-sm text-gray-400 mt-1">Tab: {tab.name || tab.title || "Unknown"}</p>
              </div>
            );
        }
      } catch (error) {
        console.error(`Error rendering tab ${tab.name}:`, error);
        return (
          <div className="p-4 text-center text-red-500">
            <p>Error loading content for this tab</p>
            <p className="text-sm text-gray-500 mt-2">{error.message}</p>
          </div>
        );
      }
    },
    [themeColors, popupMenu, t]
  );

  // Show error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">
          <h3 className="text-lg font-semibold">Something went wrong</h3>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={() => {
            setError(null);
            window.location.reload();
          }}
          className="px-4 py-2 bg-primary-base text-white rounded hover:bg-primary-dark"
        >
          Reload Page
        </button>
      </div>
    );
  }

  // Show loading state
  if (isLoading || isTransitioning) {
    return (
      <div className="p-8 text-center">
        <LoaderBox></LoaderBox>
      </div>
    );
  }

  // Show empty state
  if (!tabs || tabs.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No tabs available</p>
      </div>
    );
  }

  return (
    <TabContainer className={popupMenu}>
      {tabs.length > 1 && (
        <TabHeader className={`sub-menu ${className} ${popupMenu}`}>
          <HLine className={popupMenu}></HLine>
          {tabs.map((tab, index) => {
            return (
              <PopIconMenuItem
                key={`1-${tab.name}-${index}`}
                theme={themeColors}
                className={`${tab.name} ${state.activeTab === tab.name && "active"}  ${popupMenu}`}
                onClick={() => {
                  mainTabChange(tab);
                }}
              >
                {/* <pre>{JSON.stringify(tab.hasPermission  , null, 2)}</pre> */}
                <GetIcon icon={tab.icon}></GetIcon>
                {t(tab.title)}
              </PopIconMenuItem>
            );
          })}
        </TabHeader>
      )}
      {state.subMenus?.length > 0 && (
        <TabHeader className={`menu secondary-menu ${className} ${popupMenu}`}>
          {state.subMenus.map((tab, index) => {
            return tab.type === "title" ? (
              <Title key={`2-${tab.name}-title`} className="flex items-center gap-3">
                <span className="">{t(tab.title)}</span>
              </Title>
            ) : (
              <React.Fragment key={`${tab.name}-${index}`}>
                <PopMenuItem
                  key={`${tab.name}-${index}`}
                  theme={themeColors}
                  className={`${tab.tabs?.length > 0 ? "submenu" : ""} ${state.subActiveTab === tab.name ? "active" : ""} ${popupMenu}`}
                  onClick={async () => {
                    subTabChange(tab);
                  }}
                >
                  {tab.icon && <GetIcon icon={tab.icon} />}
                  {t(tab.title)} {tab?.length}
                </PopMenuItem>

                {tab.tabs?.length > 0 && tab.name === state.subActiveTab && <InlineMenu>{tab.tabs?.map((subTab, index) => rederInlineMenu(subTab, index))}</InlineMenu>}
              </React.Fragment>
            );
          })}
        </TabHeader>
      )}
      <TabContents className={`tab-page ${popupMenu} ${state.subMenus ? "sub-menu" : "menu"}`}>
        {tabs.map((tab, index) => {
          const isActive = state.subActiveTab === null && state.activeTab === tab.name;
          // Only render content for active tabs to implement true lazy loading
          const shouldRender = isActive;

          return (
            <React.Fragment key={`3-${tab.name}-tab-content-${index}`}>
              <Tab className={`${className} ${popupMenu} ${tab.css ?? ""} tab-page`} theme={themeColors} $active={isActive}>
                {shouldRender && (
                  <React.Suspense
                    fallback={
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-base mx-auto mb-2"></div>
                        <p className="text-sm text-gray-500">Loading {tab.title || "content"}...</p>
                      </div>
                    }
                  >
                    {console.log({ tab: tab.name })}
                    {renderPage(tab, editData, setMessage, setLoaderBox, openData, parents)}
                  </React.Suspense>
                )}
              </Tab>

              {tab.tabs?.map((subTab, index1) => {
                const isSubActive = state.subActiveInlineTab === null && state.subActiveTab === subTab.name;
                // Only render content for active sub-tabs to implement true lazy loading
                const shouldRenderSub = isSubActive;

                return (
                  <React.Fragment key={`${subTab.name}-${index1}-tab-content`}>
                    <Tab className={`${className} ${popupMenu} ${subTab.css ?? ""} tab-page`} theme={themeColors} $active={isSubActive}>
                      {shouldRenderSub && (
                        <React.Suspense
                          fallback={
                            <div className="p-4 text-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-base mx-auto mb-2"></div>
                              <p className="text-sm text-gray-500">Loading {subTab.title || "content"}...</p>
                            </div>
                          }
                        >
                          {renderPage(subTab, editData, setMessage, setLoaderBox, openData, parents)}
                        </React.Suspense>
                      )}
                    </Tab>

                    {subTab.tabs?.map((subInlineTab, index2) => {
                      const isInlineActive = state.subActiveInlineTab === subInlineTab.name;
                      // Only render content for active inline tabs to implement true lazy loading
                      const shouldRenderInline = isInlineActive;

                      return (
                        <React.Fragment key={`${subInlineTab.name}-${index2}-sub-sub-tab-content`}>
                          <Tab className={`${className} ${popupMenu} ${subInlineTab.css ?? ""} tab-page`} theme={themeColors} $active={isInlineActive}>
                            {shouldRenderInline && (
                              <React.Suspense
                                fallback={
                                  <div className="p-4 text-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-base mx-auto mb-2"></div>
                                    <p className="text-sm text-gray-500">Loading {subInlineTab.title || "content"}...</p>
                                  </div>
                                }
                              >
                                {renderPage(subInlineTab, editData, setMessage, setLoaderBox, openData, parents)}
                              </React.Suspense>
                            )}
                          </Tab>
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          );
        })}
      </TabContents>
    </TabContainer>
  );
};

// Add custom comparison function to prevent unnecessary re-renders
const areEqual = (prevProps, nextProps) => {
  // Compare primitive props
  if (
    prevProps.className !== nextProps.className ||
    prevProps.popupMenu !== nextProps.popupMenu ||
    prevProps.routingEnabled !== nextProps.routingEnabled ||
    prevProps.parentReference !== nextProps.parentReference
  ) {
    return false;
  }

  // Compare tabs data (shallow comparison for performance)
  if (prevProps.tabs?.length !== nextProps.tabs?.length) {
    return false;
  }

  // Compare openData._id which is the most critical for re-rendering
  if (prevProps.openData?.data?._id !== nextProps.openData?.data?._id) {
    return false;
  }

  // If all critical props are the same, prevent re-render
  return true;
};

export default memo(Tabs, areEqual);
