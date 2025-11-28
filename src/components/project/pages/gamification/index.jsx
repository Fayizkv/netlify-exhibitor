import React, { useState, useEffect } from "react";
import { Trophy, Users, Award, Star, Plus, Search, Edit2, Trash2, X } from "lucide-react";
import { Button, Select, Toggle, Checkbox, TabButtons } from "../../../core/elements";
import { ThreeDotMenu, getMenuItems } from "../../../core/list/threedotmenu";
import Pagination from "../../../core/list/pagination";
import Input from "../../../core/input";
import { SubPageHeader } from "../../../core/input/heading";
import { GetIcon } from "../../../../icons";
import { getData, postData, putData, deleteData } from "../../../../backend/api";
import ListTable from "../../../core/list/list";
import { useToast } from "../../../core/toast";

const GamificationPlatform = (props) => {
  const [activeTab, setActiveTab] = useState("challenges");
  const [showEditModal, setShowEditModal] = useState(false);
  const [gamificationEnabled, setGamificationEnabled] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [modalChallengeType, setModalChallengeType] = useState("App Action");
  const [currentEventId, setCurrentEventId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [challengeActions, setChallengeActions] = useState([]);
  const [contestTitles, setContestTitles] = useState([]);

  // Form state for modal
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    points: "100",
    frequency: "Single",
    contestName: "",
    contestDescription: "",
    sponsorName: "",
    challengeDescription: "",
    status: true,
    selectedAction: "",
  });

  const toast = useToast();

  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("All Types");
  const [activeChallengesCount, setActiveChallengesCount] = useState(0);
  const [draggedId, setDraggedId] = useState(null);

  // Pagination state for challenges list
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [leaderboardData] = useState([
    { rank: 1, name: "Sarah Johnson", badge: "Networking Queen", points: 3450, color: "bg-yellow-500" },
    { rank: 2, name: "Mike Chen", badge: "Challenge Master", points: 3200, color: "bg-gray-400" },
    { rank: 3, name: "Emma Davis", badge: "Content Creator", points: 2980, color: "bg-orange-500" },
    { rank: 4, name: "Alex Kumar", badge: "Early Bird", points: 2750, color: "bg-gray-300" },
    { rank: 5, name: "Lisa Wang", badge: "Social Butterfly", points: 2420, color: "bg-gray-300" },
  ]);

  const [rewards, setRewards] = useState([
    { id: `pos-1`, position: "1st Place", prize: "$500 Gift Card", description: "", coupon: "WINNER500", value: "$500" },
    { id: `pos-2`, position: "2nd Place", prize: "$300 Gift Card", description: "", coupon: "WINNER300", value: "$300" },
    { id: `pos-3`, position: "3rd Place", prize: "$100 Gift Card", description: "", coupon: "WINNER100", value: "$100" },
  ]);

  // Rewards sub-tabs and milestone form state
  const [rewardSubTab, setRewardSubTab] = useState("position");
  const [milestonesEnabled, setMilestonesEnabled] = useState(true);
  const [milestones, setMilestones] = useState([
    {
      id: Date.now(),
      pointsRequired: "",
      rewardName: "",
      description: "",
      coupon: "",
      rewardValue: "",
      notify: true,
    },
  ]);
  // Reward configuration backend sync state
  const [positionEnabled, setPositionEnabled] = useState(true);
  const [leaderboardSettings, setLeaderboardSettings] = useState({
    showLeaderboard: true,
    updateFrequency: "Real-time",
    displayTop: 10,
    tieBreaker: "First to reach score",
    showRank: true,
    anonymousMode: false,
  });
  const [additionalSettings, setAdditionalSettings] = useState({
    sendWinnerNotificationsAutomatically: true,
    displayWinnersPublicly: false,
    requireManualApprovalBeforeDeclaringWinners: true,
  });
  const [rewardConfigId, setRewardConfigId] = useState(null);

  // Optimistic status overrides for instant toggle feedback in ListTable
  const [statusOverrides, setStatusOverrides] = useState({});

  const addMilestone = () => {
    setMilestones((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        pointsRequired: "",
        rewardName: "",
        description: "",
        coupon: "",
        rewardValue: "",
        notify: true,
      },
    ]);
  };

  const updateMilestone = (id, field, value) => {
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const removeMilestone = (id) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  // ---------------- Reward Configuration: API Sync ---------------- //
  const normalizePositionRewardsFromApi = (apiRewards = []) => {
    // Map backend fields to UI fields
    // position: number -> display label
    const suffix = (n) => {
      if (n % 100 >= 11 && n % 100 <= 13) return "th";
      if (n % 10 === 1) return "st";
      if (n % 10 === 2) return "nd";
      if (n % 10 === 3) return "rd";
      return "th";
    };
    return apiRewards.map((r) => ({
      id: r._id || `pos-${r.position}`,
      position: `${r.position}${suffix(r.position)} Place`,
      prize: r.prizeName || "",
      description: r.prizeDescription || "",
      coupon: r.couponCode || "",
      value: r.prizeValue || "",
    }));
  };

  const denormalizePositionRewardsToApi = (uiRewards = []) => {
    // Extract numeric position and map UI fields to backend
    const parsePositionNumber = (label) => {
      if (typeof label === "number") return label;
      const match = String(label).match(/^(\d+)/);
      if (match) return parseInt(match[1]);
      // Fallback: try common strings
      if (String(label).startsWith("1")) return 1;
      if (String(label).startsWith("2")) return 2;
      if (String(label).startsWith("3")) return 3;
      return 1;
    };
    return uiRewards.map((r, idx) => ({
      position: parsePositionNumber(r.position ?? `${idx + 1}`),
      prizeName: r.prize || "",
      prizeDescription: r.description || "",
      couponCode: r.coupon || "",
      prizeValue: r.value || "",
    }));
  };

  const loadRewardConfiguration = async () => {
    if (!currentEventId) return;
    try {
      const resp = await getData({ event: currentEventId }, "reward-configuration");
      if (resp.status === 200) {
        const data = Array.isArray(resp.data?.response) ? resp.data.response[0] : resp.data?.response || resp.data;
        if (data) {
          setRewardConfigId(data._id || null);
          setPositionEnabled(Boolean(data.positionBased?.enabled));
          setRewards(normalizePositionRewardsFromApi(data.positionBased?.rewards || []));
          setMilestonesEnabled(Boolean(data.milestoneBased?.enabled));
          setMilestones(
            (data.milestoneBased?.milestones || []).map((m) => ({
              id: `${m.pointsRequired}-${Math.random()}`,
              pointsRequired: m.pointsRequired ?? "",
              rewardName: m.rewardName ?? "",
              description: m.description ?? "",
              coupon: m.coupon ?? "",
              rewardValue: m.rewardValue ?? "",
              notify: Boolean(m.notify),
            }))
          );
          setLeaderboardSettings({
            showLeaderboard: data.leaderboardSettings?.showLeaderboard ?? true,
            updateFrequency: data.leaderboardSettings?.updateFrequency ?? "Real-time",
            displayTop: data.leaderboardSettings?.displayTop ?? 10,
            tieBreaker: data.leaderboardSettings?.tieBreaker ?? "First to reach score",
            showRank: data.leaderboardSettings?.showRank ?? true,
            anonymousMode: data.leaderboardSettings?.anonymousMode ?? false,
          });
          setAdditionalSettings({
            sendWinnerNotificationsAutomatically: data.additionalSettings?.sendWinnerNotificationsAutomatically ?? true,
            displayWinnersPublicly: data.additionalSettings?.displayWinnersPublicly ?? false,
            requireManualApprovalBeforeDeclaringWinners: data.additionalSettings?.requireManualApprovalBeforeDeclaringWinners ?? true,
          });
        } else {
          // No existing config; keep defaults
          setRewardConfigId(null);
        }
      }
    } catch (error) {
      console.error("Failed to load reward configuration", error);
      toast.error("Failed to load reward configuration");
    }
  };

  const saveRewardConfiguration = async () => {
    if (!currentEventId) {
      toast.error("No event selected");
      return;
    }
    try {
      const payload = {
        event: currentEventId,
        positionBased: {
          enabled: Boolean(positionEnabled),
          rewards: denormalizePositionRewardsToApi(rewards),
        },
        milestoneBased: {
          enabled: Boolean(milestonesEnabled),
          milestones: milestones.map((m) => ({
            pointsRequired: Number(m.pointsRequired) || 0,
            rewardName: m.rewardName || "",
            description: m.description || "",
            coupon: m.coupon || "",
            rewardValue: m.rewardValue || "",
            notify: Boolean(m.notify),
          })),
        },
        leaderboardSettings: { ...leaderboardSettings },
        additionalSettings: { ...additionalSettings },
        isActive: true,
      };

      let resp;
      if (rewardConfigId) {
        resp = await putData({ id: rewardConfigId, ...payload }, "reward-configuration");
      } else {
        resp = await postData(payload, "reward-configuration");
      }
      if (resp.status === 200) {
        toast.success("Reward configuration saved");
        await loadRewardConfiguration();
      } else {
        toast.error("Failed to save reward configuration");
      }
    } catch (error) {
      console.error("Failed to save reward configuration", error);
      toast.error("Failed to save reward configuration");
    }
  };

  // Get current event ID from props
  useEffect(() => {
    console.log("GamificationPlatform: Getting current event ID from props");
    const eventId = props?.openData?.data?._id || props?.data?._id || props?.eventId || new URLSearchParams(window.location.search).get("event");

    console.log("GamificationPlatform: Event ID from props:", eventId);
    console.log("GamificationPlatform: Available props:", props);

    if (eventId) {
      setCurrentEventId(eventId);
      console.log("GamificationPlatform: Set current event ID:", eventId);
    } else {
      console.log("GamificationPlatform: No event ID found in props");
    }
  }, [props]);

  // Fetch challenge actions from challenge/select API
  const fetchChallengeActions = async () => {
    try {
      console.log("Fetching challenge actions from challenge/select API");
      const params = {};

      // Add event parameter if available to exclude already linked challenges
      if (currentEventId) {
        params.event = currentEventId;
      }

      const response = await getData(params, "challenge/select");

      if (response.status === 200 && response.data) {
        console.log("Challenge actions fetched successfully:", response.data);
        console.log(
          "Challenge actions structure:",
          response.data.map((item) => ({ id: item.id, title: item.title, action: item.action }))
        );
        setChallengeActions(response.data);
      } else {
        console.error("Failed to fetch challenge actions:", response);
        toast.error("Failed to load challenge actions");
      }
    } catch (error) {
      console.error("Error fetching challenge actions:", error);
      toast.error("Error loading challenge actions");
    }
  };

  // Fetch contest titles from existing event challenges
  const fetchContestTitles = async () => {
    if (!currentEventId) {
      console.log("No event ID available, skipping contest titles fetch");
      return;
    }

    try {
      console.log("Fetching contest titles for event:", currentEventId);
      const response = await getData(
        {
          event: currentEventId,
          action: "Contest Based",
        },
        "event-challenge"
      );

      if (response.status === 200 && response.data?.response) {
        console.log("Contest titles fetched successfully:", response.data.response);

        // Extract unique contest names from existing challenges
        const contestNames = response.data.response
          .filter((challenge) => challenge.ContestName)
          .map((challenge) => ({
            id: challenge._id,
            value: challenge.ContestName,
          }))
          .filter((contest, index, self) => index === self.findIndex((c) => c.value === contest.value));

        setContestTitles(contestNames);
      } else {
        console.error("Failed to fetch contest titles:", response);
        setContestTitles([]);
      }
    } catch (error) {
      console.error("Error fetching contest titles:", error);
      setContestTitles([]);
    }
  };

  // Filter challenges based on selected filter type
  const filterChallenges = (challengesList, filterType) => {
    if (filterType === "All Types") {
      return challengesList;
    }
    return challengesList.filter((challenge) => challenge.action === filterType);
  };

  // Helper function to get filtered challenge actions by type
  const getFilteredChallengeActions = (actionType) => {
    if (!challengeActions || challengeActions.length === 0) {
      console.log(`getFilteredChallengeActions: No challenge actions available for type: ${actionType}`);
      return [];
    }

    // Check if action field is available in the data
    const hasActionField = challengeActions.some((challenge) => challenge.action !== undefined);
    if (!hasActionField) {
      console.warn(`getFilteredChallengeActions: Action field not available in challenge data. Returning all challenges for type: ${actionType}`);
      // Fallback: return all challenges if action field is not available
      return challengeActions.map((challenge) => ({
        id: challenge.id,
        value: challenge.title,
      }));
    }

    const filtered = challengeActions
      .filter((challenge) => challenge.action === actionType)
      .map((challenge) => ({
        id: challenge.id,
        value: challenge.title,
      }));

    console.log(`getFilteredChallengeActions: Found ${filtered.length} challenges for type: ${actionType}`, filtered);
    return filtered;
  };

  // Handle filter selection
  const handleFilterChange = (selectedOption) => {
    const filterValue = selectedOption.value || selectedOption;
    setSelectedFilter(filterValue);
    const filtered = filterChallenges(challenges, filterValue);
    setFilteredChallenges(filtered);
  };

  // Fetch event challenges from event-challenge API
  const fetchEventChallenges = async () => {
    if (!currentEventId) {
      console.log("No event ID available, skipping challenge fetch");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Fetching event challenges for event:", currentEventId);
      const response = await getData({ event: currentEventId }, "event-challenge");

      if (response.status === 200 && response.data?.response) {
        console.log("Event challenges fetched successfully:", response.data.response);
        setChallenges(response.data.response);
        // Apply current filter to the new data
        const filtered = filterChallenges(response.data.response, selectedFilter);
        setFilteredChallenges(filtered);
      } else {
        console.error("Failed to fetch event challenges:", response);
        toast.error("Failed to load challenges");
      }
    } catch (error) {
      console.error("Error fetching event challenges:", error);
      toast.error("Error loading challenges");
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when event ID is available
  useEffect(() => {
    if (currentEventId) {
      fetchEventChallenges();
      fetchChallengeActions();
      fetchContestTitles();
      loadRewardConfiguration();
    }
  }, [currentEventId]);

  // Update filtered challenges when challenges or selectedFilter changes
  useEffect(() => {
    const filtered = filterChallenges(challenges, selectedFilter);
    setFilteredChallenges(filtered);
    // Reset to first page when filter/data changes
    setCurrentPage(1);
  }, [challenges, selectedFilter]);

  // Derived pagination values
  const totalItems = filteredChallenges.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedChallenges = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredChallenges.slice(start, end);
  }, [filteredChallenges, currentPage, pageSize]);

  const goToPrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  // Calculate active challenges count when challenges change
  useEffect(() => {
    // Count challenges that are active (status is true or undefined for active)
    const activeCount = challenges.filter(
      (challenge) => challenge.status !== false // Consider active if status is not explicitly false
    ).length;

    console.log(`Active challenges count: ${activeCount} out of ${challenges.length} total challenges`);
    setActiveChallengesCount(activeCount);
  }, [challenges]);

  // Header count widget data (modeled after dashboard count widget)
  const challengeStats = React.useMemo(
    () => [
      {
        id: 1,
        title: "ACTIVE CHALLENGES",
        value: isLoading ? "-" : String(activeChallengesCount || 0),
        icon: "trophy",
        iconColorClass: "text-state-success",
      },
      {
        id: 2,
        title: "TOTAL CHALLENGES",
        value: isLoading ? "-" : String(challenges?.length || 0),
        icon: "award",
        iconColorClass: "text-primary-base",
      },
      {
        id: 3,
        title: "PARTICIPANTS",
        value: isLoading ? "-" : "1,247", // Placeholder until API available
        icon: "users",
        iconColorClass: "text-text-main",
      },
      {
        id: 4,
        title: "POINTS AWARDED",
        value: isLoading ? "-" : "18,450", // Placeholder until API available
        icon: "star",
        iconColorClass: "text-state-warning",
      },
    ],
    [isLoading, activeChallengesCount, challenges?.length]
  );

  // Handle row drag start
  const handleRowDragStart = (id) => {
    setDraggedId(id);
  };

  // Handle row drag over (allow drop)
  const handleRowDragOver = (e) => {
    e.preventDefault();
  };

  // Handle row drop: reorder locally and persist order for moved item
  const handleRowDrop = async (overId) => {
    try {
      if (!draggedId || draggedId === overId) return;
      const sourceIdx = challenges.findIndex((c) => c._id === draggedId);
      const targetIdx = challenges.findIndex((c) => c._id === overId);
      if (sourceIdx === -1 || targetIdx === -1 || sourceIdx === targetIdx) return;

      // Reorder locally for instant UI feedback
      const newList = [...challenges];
      const [moved] = newList.splice(sourceIdx, 1);
      newList.splice(targetIdx, 0, moved);

      // Normalize local orders to prevent post-drop jump
      const normalized = newList.map((item, idx) => ({ ...item, order: idx + 1 }));
      setChallenges(normalized);
      setFilteredChallenges(filterChallenges(normalized, selectedFilter));

      // Persist only the moved item's new order (1-based)
      const newOrder = normalized.findIndex((c) => c._id === draggedId) + 1;
      await putData({ id: draggedId, order: newOrder, event: currentEventId }, "event-challenge");
    } catch (error) {
      console.error("Error updating challenge order:", error);
      toast.error("Failed to update order");
      // Fallback: refetch to restore correct state
      fetchEventChallenges();
    } finally {
      setDraggedId(null);
    }
  };

  // Handle form input changes
  const handleFormInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Reset form data
  const resetFormData = () => {
    setFormData({
      title: "",
      description: "",
      points: "100",
      frequency: "Single",
      contestName: "",
      contestDescription: "",
      sponsorName: "",
      challengeDescription: "",
      status: true,
      selectedAction: "",
    });
  };

  const handleEditChallenge = (challenge) => {
    setSelectedChallenge(challenge);
    setModalChallengeType(challenge.action || "App Action");

    // Populate form with existing challenge data
    // If title contains a persisted selectedAction prefix (e.g., "Selected Action — Title"), split it
    const titleString = challenge.title || "";
    const titleParts = titleString.split(" — ");
    const derivedSelectedAction = titleParts.length > 1 ? titleParts[0] : "";
    const derivedTitle = titleParts.length > 1 ? titleParts[1] : titleString;

    setFormData({
      title: derivedTitle,
      description: challenge.description || "",
      points: challenge.points?.toString() || "100",
      frequency: challenge.type === "single" ? "Single" : "Recurring (Multiple times)",
      contestName: challenge.ContestName || "",
      contestDescription: challenge.ContestDescription || "",
      sponsorName: challenge.SponsoredName || "",
      challengeDescription: challenge.SponsoredDescription || "",
      status: challenge.status !== false,
      // Use derived selected action from title if available; otherwise leave empty
      selectedAction: derivedSelectedAction,
    });

    setShowEditModal(true);
  };

  const handleCreateChallenge = () => {
    setSelectedChallenge(null);
    setModalChallengeType("App Action");
    resetFormData();
    setShowEditModal(true);
  };

  const handleDeleteChallenge = async (challenge) => {
    if (!challenge._id) {
      toast.error("Invalid challenge ID");
      return;
    }

    try {
      console.log("Deleting challenge:", challenge._id);
      const response = await deleteData({ id: challenge._id }, "event-challenge");

      if (response.status === 200) {
        console.log("Challenge deleted successfully");
        toast.success("Challenge deleted successfully");
        fetchEventChallenges(); // Refresh the list
      } else {
        console.error("Failed to delete challenge:", response);
        toast.error("Failed to delete challenge");
      }
    } catch (error) {
      console.error("Error deleting challenge:", error);
      toast.error("Error deleting challenge");
    }
  };

  const handleToggleStatus = async (challenge) => {
    if (!challenge._id) {
      toast.error("Invalid challenge ID");
      return;
    }

    try {
      // Optimistic UI: flip immediately
      setStatusOverrides((prev) => ({ ...prev, [challenge._id]: !(statusOverrides[challenge._id] ?? challenge.status) }));

      const nextStatus = !(statusOverrides[challenge._id] ?? challenge.status);
      const response = await putData({ id: challenge._id, status: nextStatus }, "event-challenge");

      if (response.status === 200) {
        // Keep optimistic state; no refetch to avoid jump
        toast.success("Challenge status updated");
      } else {
        // Revert optimistic update
        setStatusOverrides((prev) => ({ ...prev, [challenge._id]: challenge.status }));
        toast.error("Failed to update challenge status");
      }
    } catch (error) {
      setStatusOverrides((prev) => ({ ...prev, [challenge._id]: challenge.status }));
      toast.error("Error updating challenge status");
    }
  };

  const handleSaveChallenge = async (formData) => {
    if (!currentEventId) {
      toast.error("No event selected");
      return;
    }

    try {
      console.log("Saving challenge:", formData);

      // Prepare data for API
      const challengeData = {
        ...formData,
        event: currentEventId,
        action: modalChallengeType,
        type: formData.frequency === "Single" ? "single" : "recurring",
        points: parseInt(formData.points) || 0,
        status: formData.status !== undefined ? formData.status : true,
      };

      // Compose display title to include selected action (so it shows in list)
      const withSelectedAction = (baseTitle) => {
        if (formData.selectedAction && formData.selectedAction.trim() !== "") {
          return `${formData.selectedAction} — ${baseTitle}`;
        }
        return baseTitle;
      };

      // Set title and description based on challenge type
      if (modalChallengeType === "App Action") {
        challengeData.title = withSelectedAction(formData.title || "App Action Challenge");
        challengeData.description = formData.description || "App action challenge";
      } else if (modalChallengeType === "Contest Based") {
        challengeData.title = withSelectedAction(formData.contestName || "Contest Challenge");
        challengeData.description = formData.contestDescription || "Contest based challenge";
      } else if (modalChallengeType === "Sponsored") {
        challengeData.title = withSelectedAction(formData.sponsorName || "Sponsored Challenge");
        challengeData.description = formData.challengeDescription || "Sponsored challenge";
      }

      // Ensure title is not empty
      if (!challengeData.title || challengeData.title.trim() === "") {
        challengeData.title = `${modalChallengeType} Challenge`;
      }

      // Ensure description is not empty
      if (!challengeData.description || challengeData.description.trim() === "") {
        challengeData.description = `${modalChallengeType} challenge description`;
      }

      // Log the final challenge data for debugging
      console.log("Final challenge data being sent:", challengeData);

      // Add specific fields based on challenge type
      if (modalChallengeType === "Contest Based") {
        challengeData.ContestName = formData.contestName;
        challengeData.ContestDescription = formData.contestDescription;
      } else if (modalChallengeType === "Sponsored") {
        challengeData.SponsoredName = formData.sponsorName;
        challengeData.SponsoredDescription = formData.challengeDescription;
      }

      let response;
      if (selectedChallenge) {
        // Update existing challenge
        response = await putData(
          {
            id: selectedChallenge._id,
            ...challengeData,
          },
          "event-challenge"
        );
      } else {
        // Create new challenge
        response = await postData(challengeData, "event-challenge");
      }

      if (response.status === 200) {
        console.log("Challenge saved successfully");
        toast.success(selectedChallenge ? "Challenge updated successfully" : "Challenge created successfully");
        setShowEditModal(false);
        setSelectedChallenge(null);
        fetchEventChallenges(); // Refresh the list
      } else {
        console.error("Failed to save challenge:", response);
        toast.error("Failed to save challenge");
      }
    } catch (error) {
      console.error("Error saving challenge:", error);
      toast.error("Error saving challenge");
    }
  };

  // Render only toggle inside table cell for status column (no label text)
  const renderStatusCell = (value, data) => {
    const effective = statusOverrides[data._id] ?? data.status;
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          handleToggleStatus(data);
        }}
        className="inline-flex"
      >
        <Toggle isEnabled={Boolean(effective)} onToggle={() => {}} size="small" color="blue" />
      </div>
    );
  };

  const ChallengesTab = () => (
    <div className="space-y-6">
      {/* Header Count Widget */}
      <div className="w-full border border-stroke-soft p-2 bg-bg-white rounded-xl shadow-sm mt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {challengeStats.map((stat, index) => (
            <div key={stat.id} className={`flex items-center p-2 gap-3 ${index !== challengeStats.length - 1 ? "md:border-r border-stroke-soft" : ""}`}>
              <div className="flex items-center justify-center border border-stroke-soft rounded-full">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-bg-weak">
                  {stat.icon === "trophy" ? (
                    <Trophy className={`${stat.iconColorClass}`} width={18} height={18} />
                  ) : stat.icon === "users" ? (
                    <Users className={`${stat.iconColorClass}`} width={18} height={18} />
                  ) : stat.icon === "star" ? (
                    <Star className={`${stat.iconColorClass}`} width={18} height={18} />
                  ) : (
                    <Award className={`${stat.iconColorClass}`} width={18} height={18} />
                  )}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-medium font-inter text-text-sub">{stat.title}</p>
                <p className="text-[16px] font-bold font-inter text-text-main">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="mt-4">
          <ListTable
            key={`${currentEventId}-list`}
            api={"event-challenge"}
            shortName="Challenges"
            formMode="single"
            viewMode="table"
            parents={{ event: currentEventId }}
            addPrivilege={false}
            delPrivilege={true}
            updatePrivilege={true}
            exportPrivilege={false}
            showFilter={false}
            openPage={false}
            itemOpenMode={{ type: "none" }}
            itemTitle={{ name: "title", type: "text", collection: "" }}
            attributes={[
              { type: "text", name: "title", label: "Challenge Name", view: true, add: false, update: true, tag: true, required: true },
              { type: "select", name: "action", label: "Type", view: true, add: false, update: true, filter: true, apiType: "CSV", selectApi: "App Action,Contest Based,Sponsored", tag: true },
              { type: "textarea", name: "description", label: "Description", view: true, add: false, update: true },
              { type: "select", name: "type", label: "Frequency", view: true, add: false, update: true, filter: true, apiType: "CSV", selectApi: "single,recurring", tag: true },
              { type: "number", name: "points", label: "Points", view: true, add: false, update: true },
              { type: "toggle", name: "status", label: "Status", showLabel: false, view: true, add: false, update: true, inlineAction: true, tag: true, render: renderStatusCell },
            ]}
          />
        </div>
      </div>
    </div>
  );

  const LeaderboardTab = () => (
    <div className="w-full">
      {!currentEventId ? (
        <div className="mt-4 text-text-sub text-sm">Select an event to view leaderboard.</div>
      ) : (
        <div className="mt-4">
          <ListTable
            api={"user-challenge-points/leaderboard"}
            shortName="Leaderboard"
            formMode="single"
            preFilter={{}}
            parents={{ event: currentEventId }}
            bulkUplaod={false}
            delPrivilege={false}
            addPrivilege={false}
            updatePrivilege={false}
            exportPrivilege={true}
            viewMode="table"
            name="leaderboard"
            attributes={[
              { name: "rank", label: "Rank", type: "number", view: true },
              { name: "userName", label: "Participant", type: "text", view: true },
              { name: "email", label: "Email", type: "text", view: true },
              { name: "totalPoints", label: "Points", type: "number", view: true },
            ]}
            itemTitle={{ name: "userName", type: "text", collection: "" }}
            openPage={false}
            itemOpenMode={null}
          />
        </div>
      )}
    </div>
  );

  const RewardsTabEl = (
    <div className="bg-white rounded-lg shadow-sm p-6 text-xs">
      <h2 className="text-base font-bold mb-6">Reward Configuration</h2>

      <div className="flex gap-4 mb-6 border-b">
        <button
          className={`px-4 py-2 font-medium ${rewardSubTab === "position" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-600 hover:text-gray-900"} text-xs`}
          onClick={() => setRewardSubTab("position")}
        >
          Position Based Rewards
        </button>
        <button
          className={`px-4 py-2 font-medium ${rewardSubTab === "milestone" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-600 hover:text-gray-900"} text-xs`}
          onClick={() => setRewardSubTab("milestone")}
        >
          Milestone Based Rewards
        </button>
      </div>

      {rewardSubTab === "position" && (
        <>
          <div className="mb-6">
            <Checkbox label="Enable Position Based Rewards" value={positionEnabled} onChange={(checked) => setPositionEnabled(checked)} customClass="" />
          </div>

          <div className="space-y-6">
            {rewards.map((reward, idx) => (
              <div key={reward.id} className="border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${idx === 0 ? "bg-yellow-100" : idx === 1 ? "bg-gray-100" : "bg-orange-100"}`}>
                    {idx === 0 ? "🏆" : idx === 1 ? "🥈" : "🥉"}
                  </div>
                  <div>
                    <div className="font-semibold">Position</div>
                    <input type="text" value={reward.position} className="mt-1 px-3 py-2 border border-gray-300 rounded-lg w-48" readOnly />
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="font-semibold">Prize Name</div>
                    <Input
                      type="text"
                      name={`prize_${reward.id}`}
                      id={`prize_${reward.id}`}
                      placeholder="e.g., $500 Gift Card"
                      value={reward.prize}
                      onChange={(e) => {
                        const value = e.target.value;
                        const targetId = reward.id;
                        setRewards((prev) => prev.map((r, i) => ((r.id ?? i) === (targetId ?? idx) ? { ...r, prize: value } : r)));
                      }}
                      customClass="mt-1 w-full"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="font-semibold mb-2">Prize Description</div>
                  <Input
                    type="textarea"
                    name={`prize_desc_${reward.id}`}
                    id={`prize_desc_${reward.id}`}
                    placeholder="Describe the prize details..."
                    value={reward.description}
                    onChange={(e) => {
                      const value = e.target.value;
                      const targetId = reward.id;
                      setRewards((prev) => prev.map((r, i) => ((r.id ?? i) === (targetId ?? idx) ? { ...r, description: value } : r)));
                    }}
                    customClass="w-full h-20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-semibold mb-2">Coupon Code (Optional)</div>
                    <Input
                      type="text"
                      name={`coupon_${reward.id}`}
                      id={`coupon_${reward.id}`}
                      placeholder="e.g., WINNER500"
                      value={reward.coupon}
                      onChange={(e) => {
                        const value = e.target.value;
                        const targetId = reward.id;
                        setRewards((prev) => prev.map((r, i) => ((r.id ?? i) === (targetId ?? idx) ? { ...r, coupon: value } : r)));
                      }}
                      customClass="w-full"
                    />
                  </div>
                  <div>
                    <div className="font-semibold mb-2">Prize Value</div>
                    <Input
                      type="text"
                      name={`value_${reward.id}`}
                      id={`value_${reward.id}`}
                      placeholder="e.g., $500"
                      value={reward.value}
                      onChange={(e) => {
                        const value = e.target.value;
                        const targetId = reward.id;
                        setRewards((prev) => prev.map((r, i) => ((r.id ?? i) === (targetId ?? idx) ? { ...r, value: value } : r)));
                      }}
                      customClass="w-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {rewardSubTab === "milestone" && (
        <>
          <div className="mb-4 flex items-center gap-3 flex-wrap">
            <Checkbox label="Enable Milestone Based Rewards" value={milestonesEnabled} onChange={(checked) => setMilestonesEnabled(checked)} customClass="" />
            <Button value="+ Add Milestone" type="primary" ClickEvent={addMilestone} customClass="shrink-0" />
          </div>

          <div className="space-y-6">
            {milestones.map((m, idx) => (
              <div key={m.id} className="border rounded-lg p-6 bg-bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${idx === 0 ? "bg-emerald-100" : idx === 1 ? "bg-sky-100" : "bg-rose-100"}`}>🎯</div>
                  <div className="font-semibold text-text-main">Milestone Reward</div>
                  <div className="ml-auto text-state-error text-sm cursor-pointer" onClick={() => removeMilestone(m.id)}>
                    Delete
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-semibold mb-2 text-text-sub">Points Required</div>
                    <Input
                      type="number"
                      name={`points_${idx}`}
                      placeholder="e.g., 500"
                      value={m.pointsRequired}
                      onChange={(e) => updateMilestone(m.id, "pointsRequired", e.target.value)}
                      customClass="w-full"
                    />
                  </div>
                  <div>
                    <div className="font-semibold mb-2 text-text-sub">Reward Name</div>
                    <Input
                      type="text"
                      name={`reward_${idx}`}
                      placeholder="e.g., Bronze Badge"
                      value={m.rewardName}
                      onChange={(e) => updateMilestone(m.id, "rewardName", e.target.value)}
                      customClass="w-full"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="font-semibold mb-2 text-text-sub">Reward Description</div>
                  <Input
                    type="textarea"
                    name={`desc_${idx}`}
                    placeholder="Describe what participants will receive..."
                    value={m.description}
                    onChange={(e) => updateMilestone(m.id, "description", e.target.value)}
                    customClass="w-full h-20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="font-semibold mb-2 text-text-sub">Coupon Code (Optional)</div>
                    <Input type="text" name={`coupon_${idx}`} placeholder="e.g., BRONZE500" value={m.coupon} onChange={(e) => updateMilestone(m.id, "coupon", e.target.value)} customClass="w-full" />
                  </div>
                  <div>
                    <div className="font-semibold mb-2 text-text-sub">Reward Value</div>
                    <Input
                      type="text"
                      name={`value_${idx}`}
                      placeholder="e.g., $50 or Free Access"
                      value={m.rewardValue}
                      onChange={(e) => updateMilestone(m.id, "rewardValue", e.target.value)}
                      customClass="w-full"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Checkbox label="Send notification when milestone is reached" value={m.notify} onChange={(checked) => updateMilestone(m.id, "notify", checked)} customClass="" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="mt-8 pt-6 border-t">
        <h3 className="font-semibold mb-4 text-xs">Additional Settings</h3>
        <div className="space-y-3">
          <Checkbox
            label="Send winner notifications automatically"
            value={additionalSettings.sendWinnerNotificationsAutomatically}
            onChange={(checked) => setAdditionalSettings((p) => ({ ...p, sendWinnerNotificationsAutomatically: checked }))}
            customClass=""
          />
          <Checkbox
            label="Display winners publicly on event website"
            value={additionalSettings.displayWinnersPublicly}
            onChange={(checked) => setAdditionalSettings((p) => ({ ...p, displayWinnersPublicly: checked }))}
            customClass=""
          />
          <Checkbox
            label="Require manual approval before declaring winners"
            value={additionalSettings.requireManualApprovalBeforeDeclaringWinners}
            onChange={(checked) => setAdditionalSettings((p) => ({ ...p, requireManualApprovalBeforeDeclaringWinners: checked }))}
            customClass=""
          />
        </div>
        <div className="mt-6 flex justify-end">
          <Button value="Save Reward Configuration" type="primary" ClickEvent={saveRewardConfiguration} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-white">
      <div className="max-w-7xl mx-auto p-6">
        <TabButtons
          tabs={[
            { key: "challenges", title: "Manage Challenges", icon: "trophy" },
            { key: "leaderboard", title: "Leaderboard", icon: "users" },
            { key: "rewards", title: "Rewards", icon: "award" },
          ]}
          selectedTab={activeTab}
          selectedChange={setActiveTab}
          design="underline"
        />

        {activeTab === "challenges" && <ChallengesTab />}
        {activeTab === "leaderboard" && <LeaderboardTab />}
        {activeTab === "rewards" && RewardsTabEl}
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedChallenge ? "Edit Challenge" : "Create Challenge"}</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedChallenge(null);
                  resetFormData();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <Select
                  label="Challenge Type"
                  required={true}
                  value={modalChallengeType}
                  onSelect={(option) => {
                    setModalChallengeType(option.value);
                    // Reset form data when challenge type changes
                    resetFormData();
                  }}
                  apiType="JSON"
                  selectApi={[
                    { id: "1", value: "App Action" },
                    { id: "2", value: "Contest Based" },
                    { id: "3", value: "Sponsored" },
                  ]}
                  customClass="w-full"
                />
              </div>

              {modalChallengeType === "App Action" && (
                <>
                  <div>
                    <Select
                      label="Select App Action"
                      required={true}
                      placeholder="Choose an action"
                      apiType="JSON"
                      selectApi={getFilteredChallengeActions("App Action")}
                      value={formData.selectedAction}
                      onSelect={(option) => handleFormInputChange("selectedAction", option.value)}
                      customClass="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        type="number"
                        name="points"
                        label="Points"
                        required={true}
                        value={formData.points}
                        onChange={(e) => handleFormInputChange("points", e.target.value)}
                        customClass="w-full"
                      />
                    </div>
                    <div>
                      <Select
                        label="Frequency"
                        required={true}
                        apiType="JSON"
                        selectApi={[
                          { id: "1", value: "Recurring (Multiple times)" },
                          { id: "2", value: "Single" },
                        ]}
                        value={formData.frequency}
                        onSelect={(option) => handleFormInputChange("frequency", option.value)}
                        customClass="w-full"
                      />
                    </div>
                  </div>
                </>
              )}

              {modalChallengeType === "Contest Based" && (
                <>
                  <div>
                    <Select
                      label="Challenge Action"
                      required={true}
                      placeholder="Choose a contest action"
                      apiType="JSON"
                      selectApi={getFilteredChallengeActions("Contest Based")}
                      value={formData.selectedAction}
                      onSelect={(option) => handleFormInputChange("selectedAction", option.value)}
                      customClass="w-full"
                    />
                  </div>

                  <div>
                    <Input
                      type="text"
                      name="contestName"
                      label="Contest Name"
                      required={true}
                      placeholder="e.g., Daily Quiz Challenge"
                      value={formData.contestName}
                      onChange={(e) => handleFormInputChange("contestName", e.target.value)}
                      customClass="w-full"
                    />
                  </div>

                  <div>
                    <Input
                      type="textarea"
                      name="contestDescription"
                      label="Contest Description"
                      placeholder="Describe the contest rules and how to participate..."
                      value={formData.contestDescription}
                      onChange={(e) => handleFormInputChange("contestDescription", e.target.value)}
                      customClass="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        type="number"
                        name="points"
                        label="Points"
                        required={true}
                        value={formData.points}
                        onChange={(e) => handleFormInputChange("points", e.target.value)}
                        customClass="w-full"
                      />
                    </div>
                    <div>
                      <Select
                        label="Frequency"
                        required={true}
                        apiType="JSON"
                        selectApi={[
                          { id: "1", value: "Recurring (Multiple times)" },
                          { id: "2", value: "Single" },
                        ]}
                        value={formData.frequency}
                        onSelect={(option) => handleFormInputChange("frequency", option.value)}
                        customClass="w-full"
                      />
                    </div>
                  </div>
                </>
              )}

              {modalChallengeType === "Sponsored" && (
                <>
                  <div>
                    <Input
                      type="text"
                      name="sponsorName"
                      label="Sponsor/Exhibitor Name"
                      required={true}
                      placeholder="e.g., TechCorp"
                      value={formData.sponsorName}
                      onChange={(e) => handleFormInputChange("sponsorName", e.target.value)}
                      customClass="w-full"
                    />
                  </div>

                  <div>
                    <Select
                      label="Challenge Action"
                      required={true}
                      apiType="JSON"
                      selectApi={getFilteredChallengeActions("Sponsored")}
                      value={formData.selectedAction}
                      onSelect={(option) => handleFormInputChange("selectedAction", option.value)}
                      customClass="w-full"
                    />
                  </div>

                  <div>
                    <Input
                      type="textarea"
                      name="challengeDescription"
                      label="Challenge Description"
                      placeholder="e.g., Visit TechCorp booth and scan the QR code"
                      value={formData.challengeDescription}
                      onChange={(e) => handleFormInputChange("challengeDescription", e.target.value)}
                      customClass="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        type="number"
                        name="points"
                        label="Points"
                        required={true}
                        value={formData.points}
                        onChange={(e) => handleFormInputChange("points", e.target.value)}
                        customClass="w-full"
                      />
                    </div>
                    <div>
                      <Select
                        label="Frequency"
                        required={true}
                        apiType="JSON"
                        selectApi={[
                          { id: "1", value: "Recurring (Multiple times)" },
                          { id: "2", value: "Single" },
                        ]}
                        value={formData.frequency}
                        onSelect={(option) => handleFormInputChange("frequency", option.value)}
                        customClass="w-full"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <Checkbox label="Enable this challenge immediately" value={formData.status} onChange={(checked) => handleFormInputChange("status", checked)} customClass="checkbox" />
              </div>
            </div>

            <div className="p-6 border-t flex gap-3">
              <Button
                value="Cancel"
                type="secondary"
                ClickEvent={() => {
                  setShowEditModal(false);
                  setSelectedChallenge(null);
                  resetFormData();
                }}
                customClass="flex-1"
              />
              <Button
                value={selectedChallenge ? "Update Challenge" : "Create Challenge"}
                type="primary"
                ClickEvent={() => {
                  handleSaveChallenge(formData);
                }}
                customClass="flex-1"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationPlatform;
