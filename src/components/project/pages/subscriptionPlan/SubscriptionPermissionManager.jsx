import React, { useState } from "react";
import { ChevronRight, Eye, EyeOff, Settings } from "lucide-react";
import { PageHeader, SubPageHeader } from "../../../core/input/heading";
import { putData, getData, deleteData, postData } from "../../../../backend/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../../core/toast";
import { GetIcon } from "../../../../icons";
import Search from "../../../core/search";

// Shimmer Components
const MenuShimmer = ({ count = 5 }) => {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(count)].map((_, index) => (
        <div key={index} className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="w-32 h-5 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-6 bg-gray-200 rounded-full"></div>
            </div>
          </div>

          {index < 2 && (
            <div className="ml-6 pl-6 border-l border-gray-300 space-y-3">
              {[...Array(2)].map((_, subIndex) => (
                <div key={`sub-${index}-${subIndex}`} className="flex items-center justify-between p-4 bg-white rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-6 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Visibility Modal Component
const VisibilityModal = ({ menu, onClose, currentVisibility, onSave, isLoading }) => {
  const [formData, setFormData] = useState({
    id: currentVisibility.id,
    premiumMessage: currentVisibility?.premiumMessage || "",
    showLabel: currentVisibility?.showLabel || false,
    showDescription: currentVisibility?.showDescription || false,
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  <div className="h-5 w-32 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <div className="w-20 h-8 bg-gray-200 rounded-lg"></div>
              <div className="w-24 h-8 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value !== undefined ? value : !prev[name],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <h3 className="text-lg font-semibold mb-4">Configure Visibility for {menu.label || menu.title}</h3>
        <div className="space-y-4">
          <input type="hidden" value={formData.id} />
          
          {/* Premium Message - Always visible */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Premium Message</label>
            <textarea 
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="e.g., This feature requires a premium subscription"
              value={formData.premiumMessage} 
              onChange={(e) => handleChange("premiumMessage", e.target.value)}
            />
          </div>

          {/* Show Options */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                className="form-checkbox h-5 w-5 text-blue-600 rounded" 
                checked={formData.showLabel} 
                onChange={() => handleChange("showLabel")} 
              />
              <span>Show Menu Label</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                className="form-checkbox h-5 w-5 text-blue-600 rounded" 
                checked={formData.showDescription} 
                onChange={() => handleChange("showDescription")} 
              />
              <span>Show Description</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
            Cancel
          </button>
          <button onClick={() => onSave(formData)} className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg">
            Save Visibility Settings
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const SubscriptionPermissionManager = ({ title, subscriptionPlanId }) => {
  const [showOnlyVisible, setShowOnlyVisible] = useState(false);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [expandedMenus, setExpandedMenus] = useState(new Set(["6593f1ff8c6b81b5a1ea5605"])); // Track expanded menus
  const [searchTerm, setSearchTerm] = useState(""); // Add search state
  const queryClient = useQueryClient();
  const toast = useToast();

  // Fetch menu data once when component mounts
  const { data: menuData, isLoading: menuLoading } = useQuery({
    queryKey: ["subscription-menu-visibility", subscriptionPlanId],
    queryFn: async () => {
      const response = await getData({}, `subscription-plan-visibility/${subscriptionPlanId}/menus`);
      if (response.status === 200) {
        return response.data?.response || response.data?.data || response.data;
      }
      throw new Error(response.customMessage || "Failed to fetch menu data");
    },
    enabled: !!subscriptionPlanId,
    staleTime: Infinity,
    cacheTime: 0,
  });


  const createVisibilityMutation = useMutation({
    mutationFn: async ({ menu, visibility }) => {
      const endpoint = menu.type === "menu" ? "subscription-plan-visibility/menu-visibility" : menu.type === "submenu" ? "subscription-plan-visibility/submenu-visibility" : "subscription-plan-visibility/item-pages-visibility";
      return await postData(
        {
          [menu.type === "menu" ? "menu" : menu.type === "submenu" ? "subMenu" : "pages"]: menu._id,
          subscriptionPlan: subscriptionPlanId,
          ...visibility,
        },
        endpoint
      );
    },
    onMutate: async ({ menu, visibility }) => {
      const previousData = queryClient.getQueryData(["subscription-menu-visibility", subscriptionPlanId]);
      
      // Update the cache optimistically - set hasVisibility to true and add visibility details
      queryClient.setQueryData(["subscription-menu-visibility", subscriptionPlanId], (old) => {
        if (!old) return old;

        const updateItem = (items) => {
          return items.map((item) => {
            if (item._id === menu._id) {
              return {
                ...item,
                hasVisibility: true,
                visibilityDetails: {
                  ...item.visibilityDetails,
                  ...visibility,
                },
              };
            }
            
            // Update nested structures
            const updatedItem = { ...item };
            
            if (item.submenus && item.submenus.length > 0) {
              updatedItem.submenus = updateItem(item.submenus);
            }
            
            if (item.itemPages && item.itemPages.length > 0) {
              updatedItem.itemPages = updateItem(item.itemPages);
            }
            
            if (item.children && item.children.length > 0) {
              updatedItem.children = updateItem(item.children);
            }
            
            return updatedItem;
          });
        };

        return updateItem([...old]);
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["subscription-menu-visibility", subscriptionPlanId], context.previousData);
      toast.error("Failed to create visibility settings");
    },
    onSuccess: () => {
      // toast.success("Visibility settings created successfully");
    },
  });

  const updateVisibilityMutation = useMutation({
    mutationFn: async ({ menu, visibility }) => {
      const endpoint = menu.type === "menu" ? "subscription-plan-visibility/menu-visibility" : menu.type === "submenu" ? "subscription-plan-visibility/submenu-visibility" : "subscription-plan-visibility/item-pages-visibility";
      return await putData(
        {
          id: visibility.id,
          [menu.type === "menu" ? "menu" : menu.type === "submenu" ? "subMenu" : "pages"]: menu._id,
          subscriptionPlan: subscriptionPlanId,
          isVisible: visibility.isVisible,
          premiumMessage: visibility.premiumMessage,
          showLabel: visibility.showLabel,
          showDescription: visibility.showDescription,
        },
        endpoint
      );
    },
    onMutate: async ({ menu, visibility }) => {
      const previousData = queryClient.getQueryData(["subscription-menu-visibility", subscriptionPlanId]);

      // Update the cache optimistically
      queryClient.setQueryData(["subscription-menu-visibility", subscriptionPlanId], (old) => {
        if (!old) return old;

        const updateItem = (items) => {
          return items.map((item) => {
            if (item._id === menu._id) {
              return {
                ...item,
                hasVisibility: true, // Ensure hasVisibility is true when updating
                visibilityDetails: {
                  ...item.visibilityDetails,
                  _id: visibility.id,
                  isVisible: visibility.isVisible,
                  premiumMessage: visibility.premiumMessage,
                  showLabel: visibility.showLabel,
                  showDescription: visibility.showDescription,
                },
              };
            }
            
            // Update nested structures
            const updatedItem = { ...item };
            
            if (item.submenus && item.submenus.length > 0) {
              updatedItem.submenus = updateItem(item.submenus);
            }
            
            if (item.itemPages && item.itemPages.length > 0) {
              updatedItem.itemPages = updateItem(item.itemPages);
            }
            
            if (item.children && item.children.length > 0) {
              updatedItem.children = updateItem(item.children);
            }
            
            return updatedItem;
          });
        };

        return updateItem([...old]);
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["subscription-menu-visibility", subscriptionPlanId], context.previousData);
      toast.error("Failed to update visibility settings");
    },
    onSuccess: () => {
      toast.success("Visibility settings updated successfully");
    },
  });

  const deleteVisibilityMutation = useMutation({
    mutationFn: async (menu) => {
      const endpoint = menu.type === "menu" ? "subscription-plan-visibility/menu-visibility" : menu.type === "submenu" ? "subscription-plan-visibility/submenu-visibility" : "subscription-plan-visibility/item-pages-visibility";
      return await deleteData(
        {
          id: menu.visibilityDetails?._id,
          [menu.type === "menu" ? "menu" : menu.type === "submenu" ? "subMenu" : "pages"]: menu._id,
          subscriptionPlan: subscriptionPlanId,
        },
        endpoint
      );
    },
    onMutate: async (menu) => {
      const previousData = queryClient.getQueryData(["subscription-menu-visibility", subscriptionPlanId]);
      
      // Update the cache optimistically - remove visibility details and set hasVisibility to false
      queryClient.setQueryData(["subscription-menu-visibility", subscriptionPlanId], (old) => {
        if (!old) return old;

        const updateItem = (items) => {
          return items.map((item) => {
            if (item._id === menu._id) {
              return {
                ...item,
                hasVisibility: false,
                visibilityDetails: null,
              };
            }
            
            // Update nested structures
            const updatedItem = { ...item };
            
            if (item.submenus && item.submenus.length > 0) {
              updatedItem.submenus = updateItem(item.submenus);
            }
            
            if (item.itemPages && item.itemPages.length > 0) {
              updatedItem.itemPages = updateItem(item.itemPages);
            }
            
            if (item.children && item.children.length > 0) {
              updatedItem.children = updateItem(item.children);
            }
            
            return updatedItem;
          });
        };

        return updateItem([...old]);
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["subscription-menu-visibility", subscriptionPlanId], context.previousData);
      toast.error("Failed to delete visibility settings");
    },
    onSuccess: () => {
      if (showOnlyVisible) {
        toast.success("Visibility settings deleted successfully");
      }
    },
  });

  const handleVisibilityToggle = async (menu, enabled) => {
    if (enabled) {
      const visibility = {
        isVisible: true,
        premiumMessage: "",
        showLabel: true,
        showDescription: true,
      };

      const hasExistingVisibility = menu.visibilityDetails?._id;

      if (hasExistingVisibility) {
        updateVisibilityMutation.mutate({ menu, visibility });
      } else {
        createVisibilityMutation.mutate({ menu, visibility });
      }
    } else {
      deleteVisibilityMutation.mutate(menu);
    }
  };

  const handleConfigureVisibility = (menu) => {
    setSelectedMenu(menu);
    setShowVisibilityModal(true);
  };

  const handleSaveVisibility = (visibility) => {
    if (selectedMenu) {
      const visibilityData = {
        menu: selectedMenu,
        visibility: {
          id: visibility.id,
          isVisible: true, // Always visible when configuring
          premiumMessage: visibility.premiumMessage,
          showLabel: visibility.showLabel,
          showDescription: visibility.showDescription,
        },
      };
      updateVisibilityMutation.mutate(visibilityData);
      setShowVisibilityModal(false);
      setSelectedMenu(null);
    }
  };

  const shouldShowItem = (menu) => {
    if (!showOnlyVisible) return true;
    if (menu.hasVisibility) return true;

    const hasVisibleChildren = (items) => {
      if (!items) return false;
      return items.some((item) => {
        if (item.hasVisibility) return true;
        return hasVisibleChildren(item.submenus) || hasVisibleChildren(item.itemPages) || hasVisibleChildren(item.children);
      });
    };

    return hasVisibleChildren(menu.submenus) || hasVisibleChildren(menu.itemPages) || hasVisibleChildren(menu.children);
  };

  const toggleMenu = (menuId) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };

  const renderMenuItem = (menu, depth = 0) => {
    const hasChildren = menu.submenus?.length > 0 || menu.itemPages?.length > 0 || (menu.children && menu.children.length > 0);
    const isExpanded = expandedMenus.has(menu._id);

    if (!shouldShowItem(menu)) return null;

    // Create a unique key that includes depth and type to avoid conflicts
    const uniqueKey = `${menu._id}-${depth}-${menu.type || 'menu'}`;

    return (
      <div key={uniqueKey} className="transition-all duration-200 ease-in-out">
        <div
          className={`
            group flex items-center justify-between py-3 px-4
            ${depth === 0 ? "hover:bg-gray-50/80" : "hover:bg-white/80"}
            ${!menu.hasVisibility ? "opacity-75" : ""}
            ${depth > 0 ? "pl-6 border-l border-gray-300" : ""}
            ${hasChildren ? "cursor-pointer" : ""}
          `}
          style={{ marginLeft: depth > 0 ? `${depth * 24}px` : "0px" }}
          onClick={() => hasChildren && toggleMenu(menu._id)}
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-3 min-w-[200px]">
              {menu.icon && <GetIcon icon={menu.icon} />}
              <span className={`font-medium text-sm ${menu.hasVisibility ? "text-gray-900" : "text-gray-400"}`}>
                {menu.label || menu.title}
              </span>
              
              {menu.hasVisibility && menu.visibilityDetails?.premiumMessage && (
                <span className="px-2 py-1 text-xs rounded-full font-medium bg-yellow-100 text-yellow-700">
                  Premium Message
                </span>
              )}
            </div>
            {menu.description && <span className="text-sm text-gray-500 hidden md:block">{menu.description}</span>}
          </div>

          <div className="flex items-center gap-3">
            {hasChildren && (
              <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
            )}

            {menu.hasVisibility && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfigureVisibility(menu);
                }}
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                title="Configure Visibility Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}

            <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={menu.hasVisibility} 
                onChange={(e) => handleVisibilityToggle(menu, e.target.checked)} 
              />
              <div
                className={`
                  w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20
                  after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full 
                  after:h-5 after:w-5 after:transition-all after:shadow-sm border-2 transition-colors duration-200
                  ${menu.hasVisibility ? "bg-green-600 after:translate-x-full border-transparent" : "bg-gray-200 border-gray-200"}
                `}
              />
            </label>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className={`transition-all duration-200 ease-in-out ${depth === 0 ? "bg-gray-50/50" : depth === 1 ? "bg-gray-100/30" : "bg-white"} rounded-lg my-1`}>
            {menu.submenus?.map((submenu, index) => 
              renderMenuItem({ ...submenu, type: "submenu" }, depth + 1)
            )}
            {menu.itemPages?.map((item, index) => 
              renderMenuItem({ ...item, type: "itemPage" }, depth + 1)
            )}
            {menu.children?.map((child, index) => 
              renderMenuItem({ ...child, type: "itemPage" }, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  // Filter menu data based on search term
  const filterMenuData = (menus, searchTerm) => {
    if (!searchTerm.trim()) return menus;

    const searchLower = searchTerm.toLowerCase();

    // Helper function to check if this specific item matches
    const itemMatches = (menu) => {
      return (menu.label || menu.title || "").toLowerCase().includes(searchLower) || (menu.description || "").toLowerCase().includes(searchLower);
    };

    // Helper function to filter menus (top level)
    const filterMenu = (menu) => {
      const menuMatches = itemMatches(menu);

      // Filter submenus
      const filteredSubmenus = menu.submenus ? menu.submenus.filter(filterSubmenu) : [];

      // Filter item pages (if any at menu level)
      const filteredItemPages = menu.itemPages ? menu.itemPages.filter(filterItemPage) : [];

      // Include this menu if it matches or has matching submenus/itemPages
      if (menuMatches || filteredSubmenus.length > 0 || filteredItemPages.length > 0) {
        return {
          ...menu,
          submenus: filteredSubmenus,
          itemPages: filteredItemPages,
        };
      }

      return null;
    };

    // Helper function to filter submenus (second level)
    const filterSubmenu = (submenu) => {
      const submenuMatches = itemMatches(submenu);

      // Filter item pages under this submenu
      const filteredItemPages = submenu.itemPages ? submenu.itemPages.filter(filterItemPage) : [];

      // Include this submenu if it matches or has matching itemPages
      if (submenuMatches || filteredItemPages.length > 0) {
        return {
          ...submenu,
          itemPages: filteredItemPages,
        };
      }

      return null;
    };

    // Helper function to filter item pages (third level) - now handles hierarchical structure
    const filterItemPage = (itemPage) => {
      const matches = itemMatches(itemPage);
      const hasMatchingChildren = itemPage.children ? itemPage.children.some(filterItemPage) : false;

      if (matches || hasMatchingChildren) {
        return {
          ...itemPage,
          children: itemPage.children ? itemPage.children.filter(filterItemPage) : itemPage.children,
        };
      }

      return null;
    };

    return menus.filter(filterMenu);
  };

  // Function to build hierarchical structure from flat itemPages array
  const buildHierarchy = (itemPages) => {
    if (!itemPages || !Array.isArray(itemPages)) return [];

    // Create a map for quick lookup
    const itemMap = new Map();
    const rootItems = [];

    // First pass: create map of all items
    itemPages.forEach((item) => {
      itemMap.set(item.key, { 
        ...item, 
        children: []
      });
    });

    // Second pass: build hierarchy
    itemPages.forEach((item) => {
      const currentItem = itemMap.get(item.key);

      if (item.parentKey === "root" || !item.parentKey) {
        rootItems.push(currentItem);
      } else {
        const parentItem = itemMap.get(item.parentKey);
        if (parentItem) {
          parentItem.children.push(currentItem);
        } else {
          rootItems.push(currentItem);
        }
      }
    });

    // Sort each level
    const sortItems = (items) => {
      return items
        .sort((a, b) => {
          const aLabel = (a.label || a.title || "").toLowerCase();
          const bLabel = (b.label || b.title || "").toLowerCase();
          return aLabel < bLabel ? -1 : aLabel > bLabel ? 1 : 0;
        })
        .map((item) => ({
          ...item,
          children: sortItems(item.children || []),
        }));
    };

    return sortItems(rootItems);
  };

  // Transform menu data to include hierarchical itemPages
  const transformMenuData = (data) => {
    if (!data) return data;

    return data.map((menu) => ({
      ...menu,
      itemPages: buildHierarchy(menu.itemPages || []),
      submenus: menu.submenus
        ? menu.submenus.map((submenu) => ({
            ...submenu,
            itemPages: buildHierarchy(submenu.itemPages || []),
          }))
        : [],
    }));
  };

  // Get filtered menu data
  const filteredMenuData = menuData ? filterMenuData(transformMenuData(menuData), searchTerm) : [];

  if (menuLoading) {
    return (
      <div className="bg-white rounded-xl border-gray-100">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <div className="animate-pulse">
            <div className="h-6 w-64 bg-gray-200 rounded"></div>
            <div className="h-4 w-96 bg-gray-200 rounded mt-2"></div>
          </div>
          <div className="w-32 h-10 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="p-4">
          <MenuShimmer />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-gray-100">
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <SubPageHeader line={false} title={title} description="Manage feature visibility and premium messaging for subscription plan users" />
        <button
          onClick={() => setShowOnlyVisible(!showOnlyVisible)}
          className={`whitespace-nowrap
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
            transition-colors duration-200
            ${showOnlyVisible ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}
          `}
        >
          {showOnlyVisible ? (
            <>
              <Eye className="w-4 h-4" />
              Show Visible Only
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4" />
              Show All Features
            </>
          )}
        </button>
      </div>

      {/* Search Section */}
      <div className="px-6 py-4 border-b border-gray-100">
        <Search
          title="Search"
          placeholder="Search.."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          active={true}
        />
      </div>

      <div className="p-4 space-y-1 bg-white">
        {filteredMenuData.length > 0 ? (
          filteredMenuData.map((menu) => renderMenuItem({ ...menu, type: "menu" }))
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 text-sm">
              {searchTerm ? `No results found for "${searchTerm}"` : "No menu data available"}
            </div>
          </div>
        )}
      </div>

      {showVisibilityModal && selectedMenu && (
        <VisibilityModal
          menu={selectedMenu}
          currentVisibility={{
            id: selectedMenu.visibilityDetails?._id,
            premiumMessage: selectedMenu.visibilityDetails?.premiumMessage || "",
            showLabel: selectedMenu.visibilityDetails?.showLabel !== false,
            showDescription: selectedMenu.visibilityDetails?.showDescription !== false,
          }}
          onClose={() => {
            setShowVisibilityModal(false);
            setSelectedMenu(null);
          }}
          onSave={handleSaveVisibility}
          isLoading={false}
        />
      )}
    </div>
  );
};

export default SubscriptionPermissionManager;