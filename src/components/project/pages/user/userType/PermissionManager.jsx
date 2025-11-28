import React, { useState } from "react";
import { ChevronRight, Eye, EyeOff, Settings } from "lucide-react";
import { PageHeader, SubPageHeader } from "../../../../core/input/heading";
import { putData, getData, deleteData, postData } from "../../../../../backend/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../../../core/toast";
import { GetIcon } from "../../../../../icons";
import Search from "../../../../core/search";

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

// Permission Modal Component
const PermissionModal = ({ menu, onClose, currentPermissions, onSave, isLoading }) => {
  console.log("PermissionModal currentPermissions:", currentPermissions);
  const [formData, setFormData] = useState({
    id: currentPermissions.id, // Get id directly from currentPermissions
    add: currentPermissions?.add || false,
    update: currentPermissions?.update || false,
    delete: currentPermissions?.delete || false,
    export: currentPermissions?.export || false,
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

  const handleChange = (name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Configure Permissions for {menu.label || menu.title}</h3>
        <div className="space-y-4">
          <input type="hidden" className="form-checkbox h-5 w-5 text-blue-600 rounded" value={formData._id} onChange={() => handleChange("_id")} />
          <label className="flex items-center gap-2">
            <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600 rounded" checked={formData.add} onChange={() => handleChange("add")} />
            <span>Add Permission</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600 rounded" checked={formData.update} onChange={() => handleChange("update")} />
            <span>Update Permission</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600 rounded" checked={formData.delete} onChange={() => handleChange("delete")} />
            <span>Delete Permission</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600 rounded" checked={formData.export} onChange={() => handleChange("export")} />
            <span>Export Permission</span>
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
            Cancel
          </button>
          <button onClick={() => onSave(formData)} className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const PermissionManager = ({ title, userTypeId }) => {
  const [showOnlyPermitted, setShowOnlyPermitted] = useState(true);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [expandedMenus, setExpandedMenus] = useState(new Set()); // Track expanded menus
  const [searchTerm, setSearchTerm] = useState(""); // Add search state
  const queryClient = useQueryClient();
  const toast = useToast();

  // Fetch menu data once when component mounts
  const { data: menuData, isLoading: menuLoading } = useQuery({
    queryKey: ["menu-permissions", userTypeId],
    queryFn: async () => {
      const response = await getData({}, `user-type/${userTypeId}/menus`);
      if (response.status === 200) {
        return response.data.response;
      }
      throw new Error(response.customMessage || "Failed to fetch menu data");
    },
    staleTime: Infinity, // Never consider the data stale
    cacheTime: 0, // Don't cache between component unmounts
  });

  const updateStateAfterPermissionChange = (menuId, newPermissions) => {
    queryClient.setQueryData(["menu-permissions", userTypeId], (old) => {
      const updateItem = (items) => {
        if (!items) return items;
        return items.map((item) => {
          if (item._id === menuId) {
            return {
              ...item,
              ...newPermissions,
              hasPermission: newPermissions.hasPermission ?? true,
            };
          }
          return {
            ...item,
            submenus: item.submenus ? updateItem(item.submenus) : item.submenus,
            itemPages: item.itemPages ? updateItem(item.itemPages) : item.itemPages,
          };
        });
      };
      return updateItem([...old]);
    });
  };

  const createPermissionMutation = useMutation({
    mutationFn: async ({ menu, permissions }) => {
      const endpoint = menu.type === "menu" ? "menu-role" : menu.type === "submenu" ? "submenu-role" : "item-pages-role";
      return await postData(
        {
          [menu.type === "menu" ? "menu" : menu.type === "submenu" ? "subMenu" : "pages"]: menu._id,
          userType: userTypeId,
          ...permissions,
        },
        endpoint
      );
    },
    onMutate: async ({ menu, permissions }) => {
      const previousData = queryClient.getQueryData(["menu-permissions", userTypeId]);
      updateStateAfterPermissionChange(menu._id, permissions);
      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["menu-permissions", userTypeId], context.previousData);
      toast.error("Failed to create permissions");
    },
    onSuccess: () => {
      // toast.success("Permissions created successfully");
    },
  });

  const updatePermissionMutation = useMutation({
    mutationFn: async ({ menu, permissions }) => {
      const endpoint = menu.type === "menu" ? "menu-role" : menu.type === "submenu" ? "submenu-role" : "item-pages-role";
      return await putData(
        {
          id: permissions.id,
          [menu.type === "menu" ? "menu" : menu.type === "submenu" ? "subMenu" : "pages"]: menu._id,
          userType: userTypeId,
          add: permissions.add,
          update: permissions.update,
          delete: permissions.delete,
          export: permissions.export,
        },
        endpoint
      );
    },
    onMutate: async ({ menu, permissions }) => {
      const previousData = queryClient.getQueryData(["menu-permissions", userTypeId]);

      // Update the cache optimistically
      queryClient.setQueryData(["menu-permissions", userTypeId], (old) => {
        if (!old) return old;

        const updateItem = (items) => {
          return items.map((item) => {
            if (item._id === menu._id) {
              return {
                ...item,
                privilegeDetails: {
                  ...item.privilegeDetails,
                  _id: permissions.id,
                  add: permissions.add,
                  update: permissions.update,
                  delete: permissions.delete,
                  export: permissions.export,
                },
                hasPermission: true,
              };
            }
            if (item.submenus) {
              return {
                ...item,
                submenus: updateItem(item.submenus),
              };
            }
            if (item.itemPages) {
              return {
                ...item,
                itemPages: updateItem(item.itemPages),
              };
            }
            return item;
          });
        };

        return updateItem([...old]);
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["menu-permissions", userTypeId], context.previousData);
      toast.error("Failed to update permissions");
    },
    onSuccess: () => {
      toast.success("Permissions updated successfully");
    },
  });

  const deletePermissionMutation = useMutation({
    mutationFn: async (menu) => {
      const endpoint = menu.type === "menu" ? "menu-role" : menu.type === "submenu" ? "submenu-role" : "item-pages-role";
      return await deleteData(
        {
          [menu.type === "menu" ? "menu" : menu.type === "submenu" ? "subMenu" : "pages"]: menu._id,
          userType: userTypeId,
        },
        endpoint
      );
    },
    onMutate: async (menu) => {
      const previousData = queryClient.getQueryData(["menu-permissions", userTypeId]);
      updateStateAfterPermissionChange(menu._id, {
        hasPermission: false,
        add: false,
        update: false,
        delete: false,
        export: false,
      });
      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["menu-permissions", userTypeId], context.previousData);
      toast.error("Failed to delete permissions");
    },
    onSuccess: () => {
      if (showOnlyPermitted) {
        toast.success("Permissions deleted successfully");
      }
    },
  });

  const handlePermissionToggle = async (menu, enabled) => {
    if (enabled) {
      const permissions = {
        add: true,
        update: true,
        delete: true,
        export: true,
        hasPermission: true,
      };

      const hasExistingRole = menu.menuRoles?.length > 0 || menu.subMenuRoles?.length > 0 || menu.itemPageRoles?.length > 0;

      if (hasExistingRole) {
        updatePermissionMutation.mutate({ menu, permissions });
      } else {
        createPermissionMutation.mutate({ menu, permissions });
      }
    } else {
      deletePermissionMutation.mutate(menu);
    }
  };

  const handleConfigurePermissions = (menu) => {
    setSelectedMenu(menu);
    setShowPermissionModal(true);
  };

  const handleSavePermissions = (permissions) => {
    console.log("handleSavePermissions received:", permissions);
    if (selectedMenu) {
      const permissionData = {
        menu: selectedMenu,
        permissions: {
          id: permissions.id,
          add: permissions.add,
          update: permissions.update,
          delete: permissions.delete,
          export: permissions.export,
          hasPermission: true,
        },
      };
      console.log("Calling updatePermissionMutation with:", permissionData);
      updatePermissionMutation.mutate(permissionData);
      setShowPermissionModal(false);
      setSelectedMenu(null);
    }
  };

  const shouldShowItem = (menu) => {
    if (!showOnlyPermitted) return true;
    if (menu.hasPermission) return true;

    const hasPermittedChildren = (items) => {
      if (!items) return false;
      return items.some((item) => {
        if (item.hasPermission) return true;
        return hasPermittedChildren(item.submenus) || hasPermittedChildren(item.itemPages) || hasPermittedChildren(item.children);
      });
    };

    return hasPermittedChildren(menu.submenus) || hasPermittedChildren(menu.itemPages) || hasPermittedChildren(menu.children);
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

    console.log(`Rendering ${menu.label || menu.title} at depth ${depth}, hasChildren: ${hasChildren}, children:`, menu.children);

    return (
      <div
        key={menu._id}
        className={`
          transition-all duration-200 ease-in-out
          ${depth === 0 ? "" : ""}
        `}
      >
        <div
          className={`
            group flex items-center justify-between py-3 px-4
            ${depth === 0 ? "hover:bg-gray-50/80" : "hover:bg-white/80"}
            ${menu.hasPermission ? "" : "opacity-75"}
            ${depth > 0 ? "pl-6 border-l border-gray-300" : ""}
            ${hasChildren ? "cursor-pointer" : ""}
          `}
          style={{ marginLeft: depth > 0 ? `${depth * 24}px` : "0px" }}
          onClick={() => hasChildren && toggleMenu(menu._id)}
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-3 min-w-[200px]">
              {menu.icon && <GetIcon icon={menu.icon} />}
              <span
                className={`
                  font-medium text-sm
                  ${menu.hasPermission ? "text-gray-900" : "text-gray-400"}
                `}
              >
                {menu.label || menu.title}
              </span>
            </div>

            {menu.description && <span className="text-sm text-gray-500 hidden md:block">{menu.description}</span>}
          </div>

          <div className="flex items-center gap-3">
            {hasChildren && (
              <ChevronRight
                className={`
                  w-4 h-4 text-gray-400 transition-transform duration-200
                  ${isExpanded ? "rotate-90" : ""}
                `}
              />
            )}

            {menu.hasPermission && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent accordion toggle
                  handleConfigurePermissions(menu);
                }}
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                title="Configure Permissions"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}

            <label
              className="relative inline-flex items-center cursor-pointer"
              onClick={(e) => e.stopPropagation()} // Prevent accordion toggle
            >
              <input type="checkbox" className="sr-only peer" checked={menu.hasPermission} onChange={(e) => handlePermissionToggle(menu, e.target.checked)} />
              <div
                className={`
                  w-11 h-6 rounded-full peer 
                  peer-focus:outline-none peer-focus:ring-4 
                  peer-focus:ring-blue-300/20
                  after:content-[''] after:absolute 
                  after:top-[2px] after:left-[2px] 
                  after:bg-white after:rounded-full 
                  after:h-5 after:w-5 after:transition-all
                  after:shadow-sm
                  ${menu.hasPermission ? "bg-blue-600 after:translate-x-full border-transparent" : "bg-gray-200 border-gray-200"}
                  border-2 transition-colors duration-200
                `}
              />
            </label>
          </div>
        </div>

        {hasChildren && menu.hasPermission && isExpanded && (
          <div
            className={`
              transition-all duration-200 ease-in-out
              ${depth === 0 ? "bg-gray-50/50" : depth === 1 ? "bg-gray-100/30" : "bg-white"}
              rounded-lg my-1
            `}
          >
            {menu.submenus?.map((submenu) => renderMenuItem({ ...submenu, type: "submenu" }, depth + 1))}
            {menu.itemPages?.map((item) => renderMenuItem({ ...item, type: "itemPage" }, depth + 1))}
            {menu.children?.map((child) => renderMenuItem({ ...child, type: "itemPage" }, depth + 1))}
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

    console.log("Building hierarchy for:", itemPages);

    // Create a map for quick lookup
    const itemMap = new Map();
    const rootItems = [];

    // First pass: create map of all items
    itemPages.forEach((item) => {
      itemMap.set(item.key, { ...item, children: [] });
    });

    // Second pass: build hierarchy
    itemPages.forEach((item) => {
      const currentItem = itemMap.get(item.key);

      if (item.parentKey === "root" || !item.parentKey) {
        // This is a root item
        rootItems.push(currentItem);
      } else {
        // This is a child item
        const parentItem = itemMap.get(item.parentKey);
        if (parentItem) {
          parentItem.children.push(currentItem);
        } else {
          // Parent not found, treat as root
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

    const result = sortItems(rootItems);
    console.log("Hierarchy result:", result);
    return result;
  };

  // Transform menu data to include hierarchical itemPages
  const transformMenuData = (data) => {
    if (!data) return data;

    return data.map((menu) => ({
      ...menu,
      itemPages: buildHierarchy(menu.itemPages),
      submenus: menu.submenus
        ? menu.submenus.map((submenu) => ({
            ...submenu,
            itemPages: buildHierarchy(submenu.itemPages),
          }))
        : menu.submenus,
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
        <SubPageHeader line={false} title={title} description="Manage access permissions for different features and functionalities" />
        <button
          onClick={() => setShowOnlyPermitted(!showOnlyPermitted)}
          className={`whitespace-nowrap
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
            transition-colors duration-200
            ${showOnlyPermitted ? "bg-blue-50 text-blue-600 hover:bg-blue-100" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}
          `}
        >
          {showOnlyPermitted ? (
            <>
              <Eye className="w-4 h-4" />
              Show Permissions
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4" />
              Show All Permissions
            </>
          )}
        </button>
      </div>

      {/* Search Section */}
      <div className="px-6 py-4 border-b border-gray-100">
        <Search
          title="Search"
          // theme={{ foreground: "#374151", bg: { weak: "#F3F4F6" }, text: { main: "#111827", sub: "#6B7280" } }}
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
            <div className="text-gray-500 text-sm">{searchTerm ? `No results found for "${searchTerm}"` : "No menu data available"}</div>
          </div>
        )}
      </div>

      {showPermissionModal && selectedMenu && (
        <div>
          {console.log("Selected Menu:", selectedMenu)}
          {console.log("Privilege Details:", selectedMenu.privilegeDetails)}
          <PermissionModal
            menu={selectedMenu}
            currentPermissions={{
              id: selectedMenu.privilegeDetails?._id, // Try both possible paths
              add: selectedMenu.privilegeDetails?.add || false,
              update: selectedMenu.privilegeDetails?.update || false,
              delete: selectedMenu.privilegeDetails?.delete || false,
              export: selectedMenu.privilegeDetails?.export || false,
            }}
            onClose={() => {
              setShowPermissionModal(false);
              setSelectedMenu(null);
            }}
            onSave={handleSavePermissions}
            isLoading={false}
          />
        </div>
      )}
    </div>
  );
};

export default PermissionManager;
