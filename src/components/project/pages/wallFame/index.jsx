import React, { useState, useEffect } from "react";
import { Monitor, Users, Camera, MessageSquare, FileText, Copy, ExternalLink, Settings, PlusCircle, Share2, Edit, Trash2, MoreHorizontal } from "lucide-react";
import OnOffToggle from "../../../core/toggle";
import Input from "../../../core/input";
import { getData, postData, putData, deleteData } from "../../../../backend/api";
import axios from "axios";
import { SubPageHeader } from "../../../core/input/heading";

// Utility function to get domain from localStorage
const getDomainFromLocalStorage = () => {
  // Get the current event ID from the URL
  const pathParts = window.location.pathname.split("/");
  const eventId = pathParts[2]; // URL structure: /event/{eventId}/settings-1/wall-fame

  console.log("getDomainFromLocalStorage: Path parts:", pathParts);
  console.log("getDomainFromLocalStorage: Event ID:", eventId);

  if (eventId) {
    const domainKey = `eventhex:domain:${eventId}`;
    const domain = localStorage.getItem(domainKey);
    console.log("getDomainFromLocalStorage: Domain key:", domainKey);
    console.log("getDomainFromLocalStorage: Domain from localStorage:", domain);
    console.log("getDomainFromLocalStorage: Domain type:", typeof domain);
    console.log("getDomainFromLocalStorage: All localStorage keys:", Object.keys(localStorage));

    // Check if the exact key exists
    if (localStorage.hasOwnProperty(domainKey)) {
      console.log("getDomainFromLocalStorage: Key exists in localStorage");
    } else {
      console.log("getDomainFromLocalStorage: Key does NOT exist in localStorage");
    }

    return domain || "eventex.ai"; // Fallback to eventex.ai if domain not found
  }

  console.log("getDomainFromLocalStorage: No event ID found, using fallback");
  return "eventex.ai"; // Fallback if eventId not found
};

// Build wall link using domain in localStorage; falls back to existing link if no shortCode
const buildWallLink = (shortCode, link) => {
  const domain = getDomainFromLocalStorage();
  const code = shortCode || (typeof link === "string" && link.includes("/w/") ? link.split("/w/")[1] : "");
  return code ? `https://${domain}/w/${code}` : link;
};

// Custom Shimmer Component for Wall Fame Page
const WallFameShimmer = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Header Shimmer */}
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <div className="animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-6 w-32 bg-gray-200 rounded mb-1"></div>
              <div className="h-4 w-48 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="animate-pulse">
            <div className="h-10 w-40 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>

    {/* Main Content Shimmer */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Current Wall Fame Card Shimmer */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 rounded-t-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="animate-pulse">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-5 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 w-64 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-48 bg-gray-200 rounded"></div>
              <div className="h-4 w-96 bg-gray-200 rounded"></div>
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-9 flex-1 bg-gray-200 rounded"></div>
                <div className="h-9 w-20 bg-gray-200 rounded"></div>
                <div className="h-9 w-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Default Walls Card Shimmer */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 rounded-t-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="animate-pulse">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-5 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 w-80 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="animate-pulse">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="animate-pulse">
                        <div className="h-5 w-48 bg-gray-200 rounded"></div>
                      </div>
                      <div className="animate-pulse">
                        <div className="h-4 w-80 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="animate-pulse">
                    <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Walls Card Shimmer */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 rounded-t-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="animate-pulse">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-5 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 w-80 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="p-12 text-center">
            <div className="animate-pulse space-y-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto"></div>
              <div className="h-5 w-32 bg-gray-200 rounded mx-auto"></div>
              <div className="h-4 w-64 bg-gray-200 rounded mx-auto"></div>
              <div className="h-10 w-40 bg-gray-200 rounded-lg mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Initialize default walls with dynamic domain
const getInitialDefaultWalls = () => {
  const domain = getDomainFromLocalStorage();
  return [
    {
      id: "def-1",
      name: "Sessions Wall",
      description: "Display upcoming sessions, speakers, and real-time schedules",
      isActive: false,
      link: `https://${domain}/session-wall`,
      icon: Users,
      color: "#3b82f6",
    },
    {
      id: "def-2",
      name: "Photo Wall",
      description: "Live photo feed from event hashtags and uploads",
      isActive: false,
      link: `https://${domain}/photo-wall`,
      icon: Camera,
      color: "#8b5cf6",
    },
    {
      id: "def-3",
      name: "Session Summary Wall",
      description: "Key insights, takeaways, and session highlights",
      isActive: false,
      link: `https://${domain}/session-summary`,
      icon: FileText,
      color: "#10b981",
    },
    {
      id: "def-4",
      name: "Social Media Wall",
      description: "Live social media posts with event hashtags",
      isActive: false,
      link: `https://${domain}/social-media`,
      icon: MessageSquare,
      color: "#ec4899",
    },
  ];
};

// Initialize custom walls with dynamic domain
const getInitialCustomWalls = () => {
  const domain = getDomainFromLocalStorage();
  return [
    {
      id: "cust-1",
      name: "Main Hall Display",
      description: "Photos + Social Media for main entrance",
      isActive: true,
      link: `https://${domain}/w/c-main-hall-90ij`,
      components: ["Photo Wall", "Social Media"],
      lastUpdated: "2 hours ago",
    },
    {
      id: "cust-2",
      name: "Lobby Information Screen",
      description: "Sessions + Summaries for lobby area",
      isActive: true,
      link: `https://${domain}/w/c-lobby-11kl`,
      components: ["Sessions", "Summaries"],
      lastUpdated: "1 day ago",
    },
  ];
};

export default function DisplayWallListPage(props) {
  console.log("DisplayWallListPage: Props:", props);
  const [defaultWalls, setDefaultWalls] = useState(getInitialDefaultWalls());
  const [customWalls, setCustomWalls] = useState(getInitialCustomWalls());
  const [copiedLink, setCopiedLink] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [wallFameData, setWallFameData] = useState(null);

  // Get current event ID from props
  useEffect(() => {
    console.log("DisplayWallListPage: Getting current event ID from props");
    const eventId = props?.openData?.data?._id || props?.data?._id || props?.eventId || new URLSearchParams(window.location.search).get("event");

    console.log("DisplayWallListPage: Event ID from props:", eventId);
    console.log("DisplayWallListPage: Available props:", props);

    if (eventId) {
      setCurrentEventId(eventId);
      console.log("DisplayWallListPage: Set current event ID:", eventId);
    } else {
      console.log("DisplayWallListPage: No event ID found in props");
    }
  }, [props]);

  // Load existing wall fame data when event ID is available
  useEffect(() => {
    const loadWallFameData = async () => {
      if (!currentEventId) {
        console.log("DisplayWallListPage: No event ID available, skipping wall fame data load");
        return;
      }

      console.log("DisplayWallListPage: Loading wall fame data for event:", currentEventId);
      const existenceCheck = await checkWallFameExists(currentEventId);

      if (existenceCheck.success && existenceCheck.exists) {
        console.log("DisplayWallListPage: Found existing wall fame data:", existenceCheck.data);
        setWallFameData(existenceCheck.data);

        // Sync default walls with existing data
        syncDefaultWallsWithExistingData(existenceCheck.data);
      } else {
        console.log("DisplayWallListPage: No existing wall fame data found");
        setWallFameData(null);
      }
    };

    loadWallFameData();
  }, [currentEventId]);

  // Show loading state while data is being fetched
  if (!currentEventId) {
    return <WallFameShimmer />;
  }

  // Sync default walls with existing wall fame data
  const syncDefaultWallsWithExistingData = (existingData) => {
    console.log("DisplayWallListPage: Syncing default walls with existing data:", existingData);

    if (existingData.wallType === "default" && existingData.components) {
      // Update default walls based on existing data
      setDefaultWalls((prevWalls) => {
        return prevWalls.map((wall) => {
          // Map wall names to component names
          let componentName;
          switch (wall.name) {
            case "Sessions Wall":
              componentName = "Sessions";
              break;
            case "Photo Wall":
              componentName = "Photo Wall";
              break;
            case "Session Summary Wall":
              componentName = "Session Summary";
              break;
            case "Social Media Wall":
              componentName = "Social Media";
              break;
            default:
              componentName = wall.name;
          }

          // Find the matching component
          const matchingComponent = existingData.components.find((comp) => comp.name === componentName);

          console.log(`DisplayWallListPage: Syncing wall "${wall.name}" with component "${componentName}":`, matchingComponent);

          return {
            ...wall,
            isActive: matchingComponent ? matchingComponent.isActive : false,
          };
        });
      });
    }
  };

  // Check if wall fame exists for the current event
  const checkWallFameExists = async (eventId) => {
    console.log("DisplayWallListPage: Checking if wall fame exists for event:", eventId);
    try {
      const response = await getData({ event: eventId }, "wall-fame");
      console.log("DisplayWallListPage: Check existence response:", response);

      if (response.status === 200) {
        return {
          success: true,
          exists: response.data.exists,
          data: response.data.data,
        };
      } else {
        console.error("DisplayWallListPage: Error checking wall fame existence:", response);
        return {
          success: false,
          exists: false,
          error: response.data || "Failed to check wall fame existence",
        };
      }
    } catch (error) {
      console.error("DisplayWallListPage: Exception checking wall fame existence:", error);
      return {
        success: false,
        exists: false,
        error: error.message || "Failed to check wall fame existence",
      };
    }
  };

  // Create a new wall fame entry
  const createWallFame = async (wallFameData) => {
    console.log("DisplayWallListPage: Creating new wall fame entry:", wallFameData);
    try {
      // Use axios directly to send JSON data instead of FormData
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");

      const response = await axios.post(`${import.meta.env.VITE_API}wall-fame`, wallFameData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("DisplayWallListPage: Create response:", response);

      if (response.status === 201) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      } else {
        console.error("DisplayWallListPage: Error creating wall fame:", response);
        return {
          success: false,
          error: response.data?.message || "Failed to create wall fame",
        };
      }
    } catch (error) {
      console.error("DisplayWallListPage: Exception creating wall fame:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to create wall fame",
      };
    }
  };

  // Delete a wall fame entry
  const deleteWallFame = async (wallId) => {
    console.log("DisplayWallListPage: Deleting wall fame:", wallId);
    try {
      // Backend expects DELETE /api/v1/wall-fame/:id
      const response = await deleteData({}, `wall-fame/${wallId}`);
      console.log("DisplayWallListPage: Delete response:", response);

      if (response.status === 200) {
        return {
          success: true,
          message: response.data.message,
        };
      } else {
        console.error("DisplayWallListPage: Error deleting wall fame:", response);
        return {
          success: false,
          error: response.customMessage || response.data?.message || "Failed to delete wall fame",
        };
      }
    } catch (error) {
      console.error("DisplayWallListPage: Exception deleting wall fame:", error);
      return {
        success: false,
        error: error.message || "Failed to delete wall fame",
      };
    }
  };

  // Update an existing wall fame entry
  const updateWallFame = async (wallFameData) => {
    console.log("DisplayWallListPage: Updating wall fame entry:", wallFameData);
    try {
      // Use axios directly to send JSON data instead of FormData
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");

      const response = await axios.put(`${import.meta.env.VITE_API}wall-fame`, wallFameData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("DisplayWallListPage: Update response:", response);

      if (response.status === 200) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message,
        };
      } else {
        console.error("DisplayWallListPage: Error updating wall fame:", response);
        return {
          success: false,
          error: response.data?.message || "Failed to update wall fame",
        };
      }
    } catch (error) {
      console.error("DisplayWallListPage: Exception updating wall fame:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to update wall fame",
      };
    }
  };

  // Create or update wall fame entry
  const createOrUpdateWallFame = async (wallFameData, eventId) => {
    console.log("DisplayWallListPage: Creating or updating wall fame for event:", eventId);
    setIsLoading(true);

    try {
      // First check if a wall fame already exists
      const existenceCheck = await checkWallFameExists(eventId);

      if (!existenceCheck.success) {
        console.error("DisplayWallListPage: Failed to check wall fame existence");
        setIsLoading(false);
        return existenceCheck;
      }

      let result;
      if (existenceCheck.exists) {
        console.log("DisplayWallListPage: Wall fame exists, updating...");
        // Update existing wall fame
        result = await updateWallFame(wallFameData);
      } else {
        console.log("DisplayWallListPage: No wall fame exists, creating new...");
        // Create new wall fame
        result = await createWallFame(wallFameData);
      }

      if (result.success) {
        setWallFameData(result.data);
        console.log("DisplayWallListPage: Successfully saved wall fame:", result.data);
      }

      setIsLoading(false);
      return result;
    } catch (error) {
      console.error("DisplayWallListPage: Exception in createOrUpdateWallFame:", error);
      setIsLoading(false);
      return {
        success: false,
        error: error.message || "Failed to create or update wall fame",
      };
    }
  };

  // Generate wall fame data from all default walls with their individual active status
  const generateWallFameDataFromAllWalls = (eventId, wallsToUse = defaultWalls) => {
    console.log("DisplayWallListPage: Generating wall fame data from all walls with individual status");

    const timestamp = new Date().toISOString();
    const shortCode = `d-multi-${Date.now()}`;

    // Get all walls (both active and inactive)
    console.log("DisplayWallListPage: All walls:", wallsToUse);

    // Map default wall types to components with individual active status
    const getComponentFromWall = (wall) => {
      switch (wall.name) {
        case "Sessions Wall":
          return {
            name: "Sessions",
            type: "sessions",
            isActive: wall.isActive,
          };
        case "Photo Wall":
          return {
            name: "Photo Wall",
            type: "photo",
            isActive: wall.isActive,
          };
        case "Session Summary Wall":
          return {
            name: "Session Summary",
            type: "sessionSummary",
            isActive: wall.isActive,
          };
        case "Social Media Wall":
          return {
            name: "Social Media",
            type: "social",
            isActive: wall.isActive,
          };
        default:
          return {
            name: wall.name,
            type: "custom",
            isActive: wall.isActive,
          };
      }
    };

    // Create components array from all walls with their individual active status
    const components = wallsToUse.map((wall) => getComponentFromWall(wall));

    // Get active walls for name/description
    const activeWalls = wallsToUse.filter((wall) => wall.isActive);

    // Generate a combined name and description
    const combinedName = activeWalls.length > 0 ? `${activeWalls.map((w) => w.name).join(" + ")}` : "Multi-Wall Display";

    const combinedDescription = activeWalls.length > 0 ? `Combined display featuring: ${activeWalls.map((w) => w.name).join(", ")}` : "Multi-component display wall";

    const domain = getDomainFromLocalStorage();
    return {
      name: combinedName,
      description: combinedDescription,
      wallType: "default",
      isActive: activeWalls.length > 0,
      link: `https://${domain}/w/${shortCode}`,
      shortCode: shortCode,
      components: components,
      location: "Main Display",
      event: eventId,
      configuration: {
        sessions: {
          showUpcoming: true,
          showCurrent: true,
          showCompleted: false,
          refreshInterval: 30000,
        },
        photos: {
          hashtags: ["#Event", "#Live"],
          sources: ["instagram", "upload"],
          autoRefresh: true,
          refreshInterval: 60000,
        },
        socialMedia: {
          platforms: ["twitter", "instagram"],
          hashtags: ["#Event"],
          mentions: [],
          moderationEnabled: false,
          refreshInterval: 30000,
        },
        sessionSummary: {
          showKeyTakeaways: true,
          showHighlights: true,
          showResources: false,
          maxItems: 10,
        },
      },
      displaySettings: {
        theme: "auto",
        layout: "grid",
        autoRotate: false,
        rotationInterval: 300000,
      },
      isPublic: true,
      accessCode: null,
      viewCount: 0,
      lastViewed: timestamp,
      status: activeWalls.length > 0 ? "active" : "paused",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  };

  // Generate sample wall fame data
  const generateSampleWallFameData = (eventId, wallType = "custom") => {
    console.log("DisplayWallListPage: Generating sample wall fame data for event:", eventId);

    const timestamp = new Date().toISOString();
    const shortCode = `c-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const domain = getDomainFromLocalStorage();

    return {
      name: "Tech Expo Wall",
      description: "Live social and session updates from Tech Expo 2025.",
      wallType: wallType,
      isActive: true,
      link: `https://${domain}/w/${shortCode}`,
      shortCode: shortCode,
      components: [
        {
          name: "Photo Wall",
          type: "photo",
          isActive: true,
        },
        {
          name: "Session Summary",
          type: "sessionSummary",
          isActive: true,
        },
      ],
      location: "Main Hall A",
      event: eventId,
      configuration: {
        sessions: {
          showUpcoming: true,
          showCurrent: true,
          showCompleted: true,
          refreshInterval: 60000,
        },
        photos: {
          hashtags: ["#TechExpo2025", "#Innovation"],
          sources: ["instagram", "upload"],
          autoRefresh: true,
          refreshInterval: 60000,
        },
        socialMedia: {
          platforms: ["twitter", "linkedin"],
          hashtags: ["#TechExpo2025"],
          mentions: ["@TechExpo"],
          moderationEnabled: true,
          refreshInterval: 30000,
        },
        sessionSummary: {
          showKeyTakeaways: true,
          showHighlights: true,
          showResources: true,
          maxItems: 5,
        },
      },
      displaySettings: {
        theme: "auto",
        layout: "masonry",
        autoRotate: true,
        rotationInterval: 180000,
      },
      isPublic: true,
      accessCode: null,
      viewCount: 0,
      lastViewed: timestamp,
      status: "active",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  };

  // Handle create custom wall button click
  const handleCreateCustomWall = async () => {
    console.log("DisplayWallListPage: Create custom wall button clicked");
    if (!currentEventId) {
      console.error("DisplayWallListPage: No event ID available for creating wall fame");
      alert("No event ID available. Please try again.");
      return;
    }

    const sampleData = generateSampleWallFameData(currentEventId, "custom");
    console.log("DisplayWallListPage: Sample data generated:", sampleData);

    const result = await createOrUpdateWallFame(sampleData, currentEventId);

    if (result.success) {
      console.log("DisplayWallListPage: Wall fame created/updated successfully:", result.data);
      alert("Wall fame created/updated successfully!");
    } else {
      console.error("DisplayWallListPage: Failed to create/update wall fame:", result.error);
      alert(`Failed to create/update wall fame: ${result.error}`);
    }
  };

  const toggleDefaultWall = async (id) => {
    console.log("DisplayWallListPage: Toggling default wall:", id);

    if (!currentEventId) {
      console.error("DisplayWallListPage: No event ID available for toggling wall");
      alert("No event ID available. Please try again.");
      return;
    }

    // Calculate the new state BEFORE updating the state
    const newDefaultWalls = defaultWalls.map((wall) => (wall.id === id ? { ...wall, isActive: !wall.isActive } : wall));

    console.log("DisplayWallListPage: New walls state after toggle:", newDefaultWalls);

    // Update local state for immediate UI feedback
    setDefaultWalls(newDefaultWalls);

    // Generate wall fame data based on the NEW state of walls
    const generatedWallFameData = generateWallFameDataFromAllWalls(currentEventId, newDefaultWalls);
    console.log("DisplayWallListPage: Generated wall fame data for toggle:", generatedWallFameData);

    // Check if any walls are active using the NEW state
    const anyWallsActive = newDefaultWalls.some((wall) => wall.isActive);

    if (!anyWallsActive) {
      // If no walls are active, update the wall fame entry to set isActive: false instead of deleting
      console.log("DisplayWallListPage: No walls active, updating wall fame entry to inactive");
      if (wallFameData?._id) {
        // Update the wall fame data to be inactive but keep the entry
        const inactiveWallFameData = {
          ...generatedWallFameData,
          isActive: false,
          status: "paused",
        };

        const updateResult = await updateWallFame(inactiveWallFameData);
        if (updateResult.success) {
          console.log("DisplayWallListPage: Successfully updated wall fame entry to inactive");
          setWallFameData(updateResult.data);
        } else {
          console.error("DisplayWallListPage: Failed to update wall fame entry to inactive:", updateResult.error);
          // Revert the toggle if update failed
          setDefaultWalls((walls) => walls.map((wall) => (wall.id === id ? { ...wall, isActive: !wall.isActive } : wall)));
          alert(`Failed to update wall fame: ${updateResult.error}`);
        }
      } else {
        // If no wall fame data exists, create an inactive one
        const inactiveWallFameData = {
          ...generatedWallFameData,
          isActive: false,
          status: "paused",
        };

        const createResult = await createWallFame(inactiveWallFameData);
        if (createResult.success) {
          console.log("DisplayWallListPage: Successfully created inactive wall fame entry");
          setWallFameData(createResult.data);
        } else {
          console.error("DisplayWallListPage: Failed to create inactive wall fame entry:", createResult.error);
          // Revert the toggle if create failed
          setDefaultWalls((walls) => walls.map((wall) => (wall.id === id ? { ...wall, isActive: !wall.isActive } : wall)));
          alert(`Failed to create wall fame: ${createResult.error}`);
        }
      }
    } else {
      // Save to database
      const result = await createOrUpdateWallFame(generatedWallFameData, currentEventId);

      if (result.success) {
        console.log("DisplayWallListPage: Successfully saved wall fame after toggle:", result.data);
        setWallFameData(result.data);
      } else {
        console.error("DisplayWallListPage: Failed to save wall fame after toggle:", result.error);
        // Revert the toggle if save failed
        setDefaultWalls((walls) => walls.map((wall) => (wall.id === id ? { ...wall, isActive: !wall.isActive } : wall)));
        alert(`Failed to save wall fame: ${result.error}`);
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(text);
    setTimeout(() => setCopiedLink(""), 2000);
  };

  const handleDeleteWall = async (id) => {
    console.log("DisplayWallListPage: Deleting custom wall:", id);

    // For now, just remove from local state since we're using mock data
    // In a real implementation, you would call the API to delete the wall fame entry
    setCustomWalls((walls) => walls.filter((wall) => wall.id !== id));
    setDropdownOpen(null);

    // If you want to delete from database, you would do:
    // const result = await deleteWallFame(id);
    // if (result.success) {
    //   setCustomWalls((walls) => walls.filter((wall) => wall.id !== id));
    //   setDropdownOpen(null);
    // } else {
    //   alert(`Failed to delete wall: ${result.error}`);
    // }
  };

  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      {/* <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-0">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Monitor size={24} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 m-0">Display Walls</h1>
                <p className="text-sm text-gray-600 m-0">Create and manage digital displays for your event</p>
              </div>
            </div>
            <button 
              onClick={handleCreateCustomWall} 
              disabled={isLoading}
              className="bg-indigo-600 text-white border-none rounded-lg px-4 py-3 text-sm font-medium cursor-pointer flex items-center gap-2 mt-4 sm:mt-0 transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              <PlusCircle size={16} />
              {isLoading ? "Creating..." : "Create Custom Wall"}
            </button>
          </div>
        </div>
      </div> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Combined Wall Fame (single view) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="border-b border-gray-200 px-6 py-4 rounded-t-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 rounded">
                  <Monitor size={26} className="text-indigo-600" />
                </div>
                <SubPageHeader title="Display Wall" line={false} description="Toggle components to build a single combined wall and share the link." />
              </div>
            </div>
            <div className="p-0">
              {wallFameData && (
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-800 m-0 flex items-center gap-3">
                    {wallFameData.name}
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${
                        wallFameData.isActive ? "bg-green-100 text-green-800 border border-green-200" : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {wallFameData.isActive ? "Active" : "Inactive"}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-600 m-3 0">{wallFameData.description}</p>

                  {/* Component tags removed as requested */}

                  {wallFameData.lastUpdatedFormatted && <div className="text-sm text-gray-600 m-3 0">Last updated {wallFameData.lastUpdatedFormatted}</div>}

                  <div className="flex items-center gap-2 mt-3">
                    <input
                      readOnly
                      value={buildWallLink(wallFameData.shortCode, wallFameData.link)}
                      className="h-9 text-sm bg-gray-50 border border-gray-200 rounded-md px-3 font-mono flex-1 text-gray-600"
                    />
                    <button
                      onClick={() => copyToClipboard(buildWallLink(wallFameData.shortCode, wallFameData.link))}
                      className="h-9 px-3 border border-gray-200 rounded-md bg-white text-gray-600 text-sm cursor-pointer flex items-center gap-1 transition-colors hover:bg-gray-50"
                    >
                      {copiedLink === buildWallLink(wallFameData.shortCode, wallFameData.link) ? (
                        <>
                          <Copy size={16} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Share2 size={16} />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => window.open(buildWallLink(wallFameData.shortCode, wallFameData.link), "_blank")}
                      className="h-9 px-3 border border-gray-200 rounded-md bg-white text-gray-600 text-sm cursor-pointer flex items-center gap-1 transition-colors hover:bg-gray-50"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              )}
              <div className="border-t border-gray-100">
                {defaultWalls.map((wall) => {
                  const IconComponent = wall.icon;
                  return (
                    <div key={wall.id} className="p-6 border-b border-gray-100 transition-colors hover:bg-gray-50 last:border-b-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p-3 rounded-lg flex-shrink-0`}>
                            <IconComponent size={20} style={{ color: wall.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-800 m-0 flex items-center gap-3">
                              {wall.name}
                              {wall.isActive && <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-green-100 text-green-800 border border-green-200">Active</span>}
                            </h3>
                            <p className="text-sm text-gray-600 m-3 0">{wall.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center ml-4">
                          <OnOffToggle on={wall.isActive} handleToggle={() => toggleDefaultWall(wall.id)} label="" description="" footnote="" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Custom Walls */}
          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="bg-purple-50 border-b border-gray-200 px-6 py-4 rounded-t-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-purple-100 rounded">
                  <Settings size={16} className="text-purple-600" />
                </div>
                <h1 className="text-lg font-semibold text-gray-800 m-0">Custom Walls</h1>
              </div>
              <p className="text-sm text-gray-600 m-2 0 0 0">Walls you've created by combining different content types for specific locations.</p>
            </div>
            <div className="p-0">
              {customWalls.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-gray-300 mb-4">
                    <Settings size={48} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 m-0 mb-2">No custom walls yet</h3>
                  <p className="text-gray-600 m-0 mb-4">Create your first custom wall by combining different content types.</p>
                  <button 
                    onClick={handleCreateCustomWall} 
                    disabled={isLoading}
                    className="bg-indigo-600 text-white border-none rounded-lg px-4 py-3 text-sm font-medium cursor-pointer flex items-center gap-2 mx-auto transition-colors hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <PlusCircle size={16} />
                    {isLoading ? "Creating..." : "Create Custom Wall"}
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-100">
                  {customWalls.map((wall) => (
                    <div key={wall.id} className="p-6 border-b border-gray-100 transition-colors hover:bg-gray-50 last:border-b-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-800 m-0 flex items-center gap-3">
                            {wall.name}
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${
                              wall.isActive 
                                ? "bg-green-100 text-green-800 border border-green-200" 
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}>
                              {wall.isActive ? "Active" : "Inactive"}
                            </span>
                          </h3>
                          <p className="text-sm text-gray-600 m-3 0">{wall.description}</p>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {wall.components.map((component, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200">
                                {component}
                              </span>
                            ))}
                          </div>

                          <div className="text-sm text-gray-600 m-3 0">Last updated {wall.lastUpdated}</div>

                          <div className="flex items-center gap-2 mt-3">
                            <input 
                              readOnly 
                              value={wall.link} 
                              className="h-9 text-sm bg-gray-50 border border-gray-200 rounded-md px-3 font-mono flex-1 text-gray-600"
                            />
                            <button 
                              onClick={() => copyToClipboard(wall.link)}
                              className="h-9 px-3 border border-gray-200 rounded-md bg-white text-gray-600 text-sm cursor-pointer flex items-center gap-1 transition-colors hover:bg-gray-50"
                            >
                              {copiedLink === wall.link ? (
                                <>
                                  <Copy size={16} />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Share2 size={16} />
                                  Copy
                                </>
                              )}
                            </button>
                            <button 
                              onClick={() => window.open(wall.link, "_blank")}
                              className="h-9 px-3 border border-gray-200 rounded-md bg-white text-gray-600 text-sm cursor-pointer flex items-center gap-1 transition-colors hover:bg-gray-50"
                            >
                              <ExternalLink size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="relative inline-block">
                          <button 
                            onClick={() => toggleDropdown(wall.id)}
                            className="bg-transparent border-none p-2 cursor-pointer rounded-md hover:bg-gray-100"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          <div className={`absolute right-0 top-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48 ${
                            dropdownOpen === wall.id ? "block" : "hidden"
                          }`}>
                            <button className="w-full p-3 bg-none border-none text-left cursor-pointer flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg">
                              <Edit size={16} />
                              Edit Wall
                            </button>
                            <button className="w-full p-3 bg-none border-none text-left cursor-pointer flex items-center gap-2 text-sm text-gray-700 hover:bg-gray-50">
                              <Copy size={16} />
                              Duplicate
                            </button>
                            <button 
                              onClick={() => handleDeleteWall(wall.id)}
                              className="w-full p-3 bg-none border-none text-left cursor-pointer flex items-center gap-2 text-sm text-red-600 hover:bg-gray-50 rounded-b-lg"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
