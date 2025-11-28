import React, { useEffect, useRef } from "react";
import { getData, putData } from "../../../../backend/api";
import { mergeMenuSettingsData, logEventWebsiteOperation } from "../../../../utils/eventWebsiteUtils";
import { SubPageHeader } from "../../../core/input/heading";
import { Button } from "../../../core/elements";

// Module mapping - maps frontend module names to backend module types
const moduleTypeMapping = {
  2: "overview",
  3: "speakers",
  4: "sessions",
  5: "sponsors",
  6: "location",
  7: "social",
  8: "exhibitors",
  9: "gallery",
  // 10: "carousel",
  11: "tickets",
  12: "countdown",
  13: "whatsapp",
};

// All available modules that can be added to menu
const allAvailableModules = [
  // { id: 2, name: "Event Overview", type: "overview" },
  { id: 3, name: "Speakers", type: "speakers" },
  { id: 4, name: "Sessions", type: "sessions" },
  { id: 5, name: "Sponsors", type: "sponsors" },
  // { id: 6, name: "Location", type: "location" },
  // { id: 7, name: "Contact Us", type: "social" },
  { id: 8, name: "Exhibitors", type: "exhibitors" },
  { id: 9, name: "Gallery", type: "gallery" },
  // { id: 10, name: "Carousel", type: "carousel" },
  // { id: 11, name: "Tickets", type: "tickets" },
  // { id: 12, name: "Countdown", type: "countdown" },
  // { id: 13, name: "WhatsApp", type: "whatsapp" },
];

const initialMenuItems = [
  { id: "menu-1", type: "internal", moduleId: 3, label: "Speakers", isMenu: false },
  { id: "menu-2", type: "internal", moduleId: 4, label: "Sessions", isMenu: false },
  { id: "menu-3", type: "internal", moduleId: 8, label: "Exhibitors", isMenu: false },
  { id: "menu-4", type: "internal", moduleId: 9, label: "Gallery", isMenu: false },
];

function MenuSettings(props) {
  const eventId = props.openData?.data?._id;
  const [menuItems, setMenuItems] = React.useState(initialMenuItems);
  const [eventWebsite, setEventWebsite] = React.useState(null);
  const [isMenuEnabled, setIsMenuEnabled] = React.useState(false);
  const activeMenuListRef = useRef(null);

  // Logging state changes
  useEffect(() => {
    menuItems.filter((i) => i.type === "internal").map((i) => `${i.label}: moduleId ${i.moduleId}`);
  }, [menuItems]);

  useEffect(() => {
    if (eventWebsite?.modules) {
      eventWebsite.modules.map((m, idx) => `${idx}: ${m.type} (enabled: ${m.enabled})`);
    }
  }, [eventWebsite]);

  useEffect(() => {
    if (!eventId) return;
    // Fetch eventWebsite and menus
    getData({ event: eventId }, "event-website")
      .then((result) => {
        if (result.status === 200 && result.data?.data) {
          setEventWebsite(result.data.data);
          if (Array.isArray(result.data.data.menus) && result.data.data.menus.length > 0) {
            const sortedMenus = result.data.data.menus.sort((a, b) => (a.order || 0) - (b.order || 0));
            setMenuItems(sortedMenus);
            // Check if ALL menu items have isMenu true to determine the button state
            const allMenusEnabled = sortedMenus.every((item) => item.isMenu === true);
            setIsMenuEnabled(allMenusEnabled);
          } else {
            setMenuItems(initialMenuItems);
            setIsMenuEnabled(false);
          }
        } else {
          setMenuItems(initialMenuItems);
          setIsMenuEnabled(false);
        }
      })
      .catch((error) => {
        setMenuItems(initialMenuItems);
        setIsMenuEnabled(false);
      });
  }, [eventId]);

  // Listen for layout updates from LayoutContents component
  useEffect(() => {
    const handleLayoutUpdate = (event) => {
      if (event.detail?.eventWebsiteId === eventWebsite?._id) {
        getData({ event: eventId }, "event-website")
          .then((result) => {
            if (result.status === 200 && result.data?.data) {
              setEventWebsite(result.data.data);
            }
          })
          .catch((err) => {});
      }
    };

    window.addEventListener("layoutUpdated", handleLayoutUpdate);
    return () => window.removeEventListener("layoutUpdated", handleLayoutUpdate);
  }, [eventId, eventWebsite?._id]);

  // Helper function to find module index by type
  const findModuleIndexByType = (moduleType) => {
    if (!eventWebsite?.modules) return -1;
    return eventWebsite.modules.findIndex((module) => module.type === moduleType);
  };

  // Helper function to get module name from moduleId
  const getModuleDisplayName = (menuItem) => {
    if (menuItem.type === "custom") {
      return menuItem.label;
    }

    // Try to get module name from backend modules array
    if (eventWebsite?.modules && menuItem.moduleId < eventWebsite.modules.length) {
      const module = eventWebsite.modules[menuItem.moduleId];
      if (module) {
        const frontendModule = allAvailableModules.find((m) => m.type === module.type);
        return frontendModule ? frontendModule.name : module.type;
      }
    }
    return menuItem.label;
  };

  // Helper function to generate next sequential menu ID
  const generateNextMenuId = () => {
    const existingIds = menuItems.map((item) => item.id);

    // Extract numeric IDs and find the highest
    const numericIds = existingIds
      .filter((id) => id.startsWith("menu-"))
      .map((id) => {
        const numPart = id.replace("menu-", "");
        return isNaN(numPart) ? 0 : parseInt(numPart);
      })
      .filter((num) => !isNaN(num));

    const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
    return `menu-${maxId + 1}`;
  };

  // Add module to menu with auto-save
  const handleAddToMenu = async (module) => {
    // Find the actual module index in the backend array
    const moduleIndex = findModuleIndexByType(module.type);

    if (moduleIndex === -1) {
    }

    const newMenuItem = {
      id: generateNextMenuId(),
      type: "internal",
      moduleId: moduleIndex >= 0 ? moduleIndex : module.id,
      moduleType: module.type,
      label: module.name,
      order: menuItems.length,
      isMenu: isMenuEnabled,
    };

    const updatedMenuItems = [...menuItems, newMenuItem];
    setMenuItems(updatedMenuItems);

    // Auto-save the changes
    await saveMenuChanges(updatedMenuItems, isMenuEnabled);
  };

  // Remove item from menu with auto-save
  const handleRemoveFromMenu = async (itemId) => {
    const updatedMenuItems = menuItems.filter((item) => item.id !== itemId);
    setMenuItems(updatedMenuItems);

    // Auto-save the changes
    await saveMenuChanges(updatedMenuItems, isMenuEnabled);
  };

  // Add custom link with auto-save
  const handleAddCustomLink = async () => {
    const newCustomLink = {
      id: generateNextMenuId(),
      type: "custom",
      label: "New Custom Link",
      url: "",
      order: menuItems.length,
      isMenu: isMenuEnabled,
    };

    const updatedMenuItems = [...menuItems, newCustomLink];
    setMenuItems(updatedMenuItems);

    // Auto-save the changes
    await saveMenuChanges(updatedMenuItems, isMenuEnabled);
  };

  // Update label or url
  const handleInputChange = (itemId, field, value) => {
    setMenuItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)));
  };

  // Toggle individual menu item with auto-save
  const handleToggleMenuItem = async (itemId) => {
    const updatedMenuItems = menuItems.map((item) => (item.id === itemId ? { ...item, isMenu: !item.isMenu } : item));
    setMenuItems(updatedMenuItems);

    // Update the global menu state based on whether all items are enabled
    const allEnabled = updatedMenuItems.every((item) => item.isMenu === true);
    setIsMenuEnabled(allEnabled);

    // Auto-save individual toggle changes
    await saveMenuChanges(updatedMenuItems, allEnabled);
  };

  // Enable/Disable all menu items with auto-save
  const handleToggleAllMenus = async () => {
    const newIsMenuEnabled = !isMenuEnabled;
    setIsMenuEnabled(newIsMenuEnabled);

    // Update menu items state - set ALL items to the new state
    const updatedMenuItems = menuItems.map((item) => ({ ...item, isMenu: newIsMenuEnabled }));
    setMenuItems(updatedMenuItems);

    // Auto-save the changes
    await saveMenuChanges(updatedMenuItems, newIsMenuEnabled);
  };

  // Drag and drop logic
  useEffect(() => {
    const container = activeMenuListRef.current;
    if (!container) return;
    let draggedItem = null;

    const handleDragStart = (e) => {
      draggedItem = e.target.closest(".menu-item");
      if (draggedItem) setTimeout(() => draggedItem.classList.add("dragging"), 0);
    };
    const handleDragEnd = async () => {
      if (draggedItem) {
        draggedItem.classList.remove("dragging");
        draggedItem = null;
        const newOrderIds = Array.from(container.querySelectorAll(".menu-item")).map((el) => el.dataset.itemId);
        const updatedMenuItems = (() => {
          const idToItem = Object.fromEntries(menuItems.map((i) => [i.id, i]));
          return newOrderIds.map((id) => idToItem[id]);
        })();

        setMenuItems(updatedMenuItems);

        // Auto-save the changes
        await saveMenuChanges(updatedMenuItems, isMenuEnabled);
      }
    };
    const handleDragOver = (e) => {
      e.preventDefault();
      if (!draggedItem) return;
      const items = Array.from(container.querySelectorAll(".menu-item:not(.dragging)"));
      let afterElement = null;
      let closestOffset = Number.NEGATIVE_INFINITY;
      items.forEach((child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - box.top - box.height / 2;
        if (offset < 0 && offset > closestOffset) {
          closestOffset = offset;
          afterElement = child;
        }
      });
      if (afterElement == null) {
        container.appendChild(draggedItem);
      } else {
        container.insertBefore(draggedItem, afterElement);
      }
    };
    container.addEventListener("dragstart", handleDragStart);
    container.addEventListener("dragend", handleDragEnd);
    container.addEventListener("dragover", handleDragOver);
    return () => {
      container.removeEventListener("dragstart", handleDragStart);
      container.removeEventListener("dragend", handleDragEnd);
      container.removeEventListener("dragover", handleDragOver);
    };
  }, [menuItems]);

  const getMenuModuleTypes = () => {
    const moduleTypes = new Set();

    menuItems
      .filter((item) => item.type === "internal")
      .forEach((item) => {
        let resolvedType = null;

        // Method 1: If moduleType is directly available (newly added items)
        if (item.moduleType) {
          moduleTypes.add(item.moduleType);
          resolvedType = item.moduleType;
          return;
        }

        // Method 2: Try to get module type from backend modules array using moduleId as index
        if (eventWebsite?.modules && typeof item.moduleId === "number" && item.moduleId >= 0 && item.moduleId < eventWebsite.modules.length) {
          const module = eventWebsite.modules[item.moduleId];
          if (module?.type) {
            moduleTypes.add(module.type);
            resolvedType = module.type;
            return;
          }
        }

        // Method 3: Try to get module type from frontend mapping
        const moduleType = moduleTypeMapping[item.moduleId];
        if (moduleType) {
          moduleTypes.add(moduleType);
          resolvedType = moduleType;
          return;
        }

        // Method 4: Try to find by label matching
        const matchingModule = allAvailableModules.find((m) => m.name === item.label);
        if (matchingModule) {
          moduleTypes.add(matchingModule.type);
          resolvedType = matchingModule.type;
          return;
        }
      });

    return moduleTypes;
  };

  const menuModuleTypes = getMenuModuleTypes();
  const availableModules = allAvailableModules.filter((module) => {
    const isNotInMenu = !menuModuleTypes.has(module.type);
    return isNotInMenu;
  });

  // Updated handleSaveMenus function to ONLY update menus, not modules
  const saveMenuChanges = async (menuItemsToSave = menuItems, currentMenuEnabled = isMenuEnabled) => {
    if (!eventWebsite || !eventWebsite._id) {
      return;
    }

    const menusToSave = menuItemsToSave.map((item, idx) => ({ ...item, order: idx }));

    // Create clean menu objects - preserve moduleType and isMenu
    const cleanMenus = menusToSave.map((menu) => ({
      id: String(menu.id),
      type: String(menu.type),
      moduleId: menu.moduleId ? Number(menu.moduleId) : undefined,
      moduleType: menu.moduleType ? String(menu.moduleType) : undefined,
      label: String(menu.label),
      url: menu.url ? String(menu.url) : undefined,
      order: Number(menu.order || 0),
      isMenu: Boolean(menu.isMenu),
    }));

    // ONLY update menus - preserve ALL existing data including modules
    const payload = {
      title: String(eventWebsite?.title || ""),
      subtitle: String(eventWebsite?.subtitle || ""),
      button: {
        show: Boolean(eventWebsite?.button?.show !== false),
        text: String(eventWebsite?.button?.text || "Register Now"),
        link: String(eventWebsite?.button?.link || ""),
      },
      menus: cleanMenus, // ONLY update menus
      modules: eventWebsite.modules, // Keep modules exactly as they are
      event: String(eventWebsite?.event),
    };

    try {
      // const response = await fetch(`http://localhost:8074/api/v1/event-website/${eventWebsite._id}`, {
      const response = await fetch(`https://app-api.eventhex.ai/api/v1/event-website/${eventWebsite._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.data) {
          setEventWebsite(result.data);

          // Verify the saved data
          if (result.data.menus) {
          }
        }

        const menuUpdateEvent = new CustomEvent("menuUpdated", {
          detail: {
            menus: cleanMenus,
            eventWebsiteId: eventWebsite._id,
          },
        });
        window.dispatchEvent(menuUpdateEvent);

        if (props.setMessage) {
          props.setMessage({
            content: "Menu changes saved successfully!",
            type: 1,
            icon: "success",
          });
        }
      } else {
        if (props.setMessage) {
          props.setMessage({
            content: `Failed to save menu changes: ${result.message || "Unknown error"}`,
            type: 0,
            icon: "error",
          });
        }
      }
    } catch (error) {
      if (props.setMessage) {
        props.setMessage({
          content: "Network error while saving",
          type: 0,
          icon: "error",
        });
      }
    }
  };

  // Legacy function for manual save button
  const handleSaveMenus = () => saveMenuChanges();

  return (
    <div className="mt-[10px] text-builder-text-main ">
      {/* Header */}
      <SubPageHeader
        title="Menu Settings"
        line={false}
        description="Customize your event website navigation menu by adding pages, custom links, and managing menu visibility"
        // icon="menu"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5">
          {/* Left Column: Add to Menu */}
          <div className="p-6 border-r border-gray-200 md:col-span-3">
            <div className="space-y-4">
              <div className="border p-4 rounded-lg">
                <h3 className="text-base font-medium text-builder-text-main mb-3">Content Pages</h3>
                {/* Two-column grid for content pages */}
                <div className="grid grid-cols-2 gap-3">
                  {availableModules.length > 0 ? (
                    availableModules.map((module) => (
                      <div key={module.id} className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm border border-gray-200">
                        <span className="text-sm font-medium text-builder-text-main">{module.name}</span>
                        <button
                          className="add-to-menu-btn w-8 h-8 flex items-center justify-center rounded-full bg-bg-weak text-text-main hover:bg-primary-base hover:text-primary-lightest transition-colors"
                          onClick={() => handleAddToMenu(module)}
                          type="button"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-builder-text-light text-center py-2 col-span-2">All pages are in the menu.</p>
                  )}
                </div>
              </div>
              <div className="border p-4 rounded-lg">
                <h3 className="text-base font-medium text-builder-text-main mb-3">Custom Link</h3>
                <button
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-[#375dfd] bg-builder-primary-light border border-dashed border-builder-primary-light rounded-lg hover:bg-blue-100 hover:border-blue-300"
                  onClick={handleAddCustomLink}
                  type="button"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                  <span>Add a custom link</span>
                </button>
              </div>
            </div>
          </div>
          {/* Right Column: Primary Menu */}
          <div className="p-6 md:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[16px] font-[500] text-builder-text-main">Primary Menu</h4>

              <Button value={isMenuEnabled ? "Disable Menu" : "Enable Menu"} ClickEvent={handleToggleAllMenus} isDisabled={false} type="primary" />
            </div>
            <p className="text-[14px] font-[400] text-builder-text-light mb-4">Drag and drop to reorder items.</p>
            <div ref={activeMenuListRef} className="space-y-3 border rounded-lg p-3 min-h-[400px] max-h-[400px] overflow-y-auto">
              {menuItems.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                  <p className="text-sm font-medium text-builder-text-main">Your menu is empty</p>
                  <p className="text-sm text-builder-text-light mt-1">Add a page or link from the left.</p>
                </div>
              ) : (
                menuItems.map((item) => {
                  let content = null;
                  if (item.type === "internal") {
                    content = (
                      <div className="flex items-center space-x-2 flex-grow">
                        <svg className="w-5 h-5 text-gray-400 cursor-grab flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        <input
                          type="text"
                          value={item.label}
                          className="text-sm p-1 bg-transparent focus:bg-gray-100 rounded w-full"
                          onChange={(e) => handleInputChange(item.id, "label", e.target.value)}
                        />
                        {/* Toggle Switch */}
                        <button
                          onClick={() => handleToggleMenuItem(item.id)}
                          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            item.isMenu ? "bg-[#375dfd]" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              item.isMenu ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    );
                  } else {
                    content = (
                      <div className="flex-grow space-y-2">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-gray-400 cursor-grab flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                          <input
                            type="text"
                            value={item.label}
                            placeholder="Link Text"
                            className="text-sm p-1 font-medium bg-gray-50 focus:bg-white rounded w-full border border-gray-200"
                            onChange={(e) => handleInputChange(item.id, "label", e.target.value)}
                          />
                          {/* Toggle Switch */}
                          <button
                            onClick={() => handleToggleMenuItem(item.id)}
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              item.isMenu ? "bg-[#375dfd]" : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                item.isMenu ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                        <div className="flex items-center space-x-2 pl-7">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                            />
                          </svg>
                          <input
                            type="url"
                            value={item.url}
                            placeholder="https://example.com"
                            className="text-xs p-1 bg-gray-50 focus:bg-white rounded w-full border border-gray-200"
                            onChange={(e) => handleInputChange(item.id, "url", e.target.value)}
                          />
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={item.id} className="menu-item bg-white p-2 rounded-lg shadow-sm border border-gray-200" data-item-id={item.id} draggable>
                      <div className="flex items-start justify-between">
                        {content}
                        <button
                          className="remove-from-menu-btn p-1.5 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-500 ml-2 flex-shrink-0"
                          onClick={() => handleRemoveFromMenu(item.id)}
                          type="button"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {/* Save Button - Optional since auto-save is now enabled */}
            {/* <div className="mt-4">
              <button className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 shadow-sm" onClick={handleSaveMenus}>
                Manual Save (Auto-save enabled)
              </button>
            </div> */}
          </div>
        </div>
      </main>
      <style>{`.menu-item.dragging { opacity: 0.5; background: #EEF2FF; border: 1px dashed #375dfd; }`}</style>
    </div>
  );
}

export default MenuSettings;
