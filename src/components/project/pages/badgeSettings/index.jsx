import React, { useState, useRef, useEffect } from "react";
import { Plus, Search, MoreVertical, Trash2, Printer, Ticket, User, Users, BadgeCheck, FileText, UserCheck } from "lucide-react";
import { getData, putData, postData, deleteData } from "../../../../backend/api";
import BadgeSetupModalRealSizes from "./createBadge";
import PrintBadge from "./printBadge";
import PosterBuilder from "./configureBadge";
import PopupView from "../../../core/popupview";
import { PageHeader } from "../../../core/input/heading";
import SearchComponent from "../../../core/search";
import { AddButton } from "../../../core/list/styles";
import { AddIcon } from "../../../../icons";
import { useMessage } from "../../../core/message/useMessage";

// Add CSS for spinner animation
const spinnerStyle = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// --- Reusable Components ---
const Button = ({ variant = "primary", size = "default", children, iconLeft, className = "", onClick }) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md cursor-pointer transition-all duration-200 border-0";

  const sizeClasses = {
    default: "h-10 px-4 text-sm",
    sm: "h-8 px-3 rounded-sm",
    icon: "h-8 w-8 rounded-sm",
  };

  const variantClasses = {
    primary: "bg-[hsl(222.2,47.4%,11.2%)] text-[hsl(210,40%,98%)]",
    secondary: " text-[hsl(222.2,47.4%,11.2%)] border border-[hsl(214.3,31.8%,91.4%)]",
  };

  return (
    <button onClick={onClick} className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {iconLeft}
      {children}
    </button>
  );
};

const ActionsMenu = ({ onDelete, onPrint }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative p-1 bg-black/50 backdrop-blur-sm rounded-lg">
      <Button variant="secondary" size="icon" onClick={() => setIsOpen(!isOpen)}>
        <MoreVertical color="white" size={16} />
      </Button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2  rounded-md bg-white border border-[hsl(214.3,31.8%,91.4%)] shadow-lg w-32 z-10 p-1">
          <button onClick={onPrint} className="bg-transparent border-0 w-full flex items-center p-2 rounded-sm cursor-pointer text-sm text-left hover:bg-gray-50">
            <Printer size={14} className="mr-2" /> Print
          </button>
          <button onClick={onDelete} className="bg-transparent border-0 w-full flex items-center p-2 rounded-sm cursor-pointer text-sm text-[hsl(0,72%,51%)] text-left hover:bg-gray-50">
            <Trash2 size={14} className="mr-2" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

// --- Badge Card Component ---
const BadgeCard = ({ badge, onEdit, onDelete, onPrint }) => {
  const getBadgeTypeIcon = (type) => {
    const iconProps = {
      size: 14,
      className: "text-[hsl(215,20.2%,65.1%)] flex-shrink-0",
    };
    // Add null check to prevent error when type is undefined or null
    if (!type) return <User {...iconProps} />;

    if (type.toLowerCase().includes("ticket")) return <Ticket {...iconProps} />;
    if (type.toLowerCase().includes("participant")) return <Users {...iconProps} />;
    return <User {...iconProps} />;
  };

  const getBadgeTypeText = (badgeType) => {
    // Add null check to prevent error when badgeType is undefined or null
    if (!badgeType) return "Unknown Type";

    switch (badgeType) {
      case "COMMON_TICKET":
        return "Common for all Tickets";
      case "SPECIFIC_TICKET":
        return "Specific Ticket";
      case "COMMON_PARTICIPANT":
        return "Common for all Participants";
      case "SPECIFIC_PARTICIPANT":
        return "Specific Participant";
      default:
        return "Unknown Type";
    }
  };

  const handleCardClick = (e) => {
    // Prevent edit when clicking on the actions menu
    if (e.target.closest('.actions-menu')) {
      return;
    }
    onEdit(badge);
  };

  return (
    <div 
      className="border border-[hsl(214.3,31.8%,91.4%)] rounded-lg shadow-sm flex flex-col cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={handleCardClick}
    >
      <div className="relative h-[280px] flex-col flex items-center p-2">
        {badge.backgroundImage ? (
          <img
            src={
              typeof badge.backgroundImage === "string" && badge.backgroundImage.startsWith("http")
                ? badge.backgroundImage
                : `https://event-manager.syd1.digitaloceanspaces.com/${badge.backgroundImage}`
            }
            alt={`Preview of ${badge.name || "Badge"}`}
            className="max-h-full max-w-full object-contain rounded-md"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div className={`${badge.backgroundImage ? "hidden" : "flex"} flex-col items-center gap-3`}>
          <BadgeCheck size={48} className="text-[hsl(215,20.2%,65.1%)]" />
          <span className="text-sm font-medium text-[hsl(215,20.2%,65.1%)]">No Preview</span>
        </div>
        <div className="absolute top-3 right-2 actions-menu">
          <ActionsMenu onDelete={() => onDelete(badge)} onPrint={() => onPrint(badge)} />
        </div>
      </div>
      <div className="p-4 pt-3 border-t border-[hsl(214.3,31.8%,91.4%)] flex flex-col flex-grow">
        <h3 className="text-base font-semibold text-[hsl(222.2,84%,4.9%)] m-0 whitespace-nowrap overflow-hidden text-ellipsis">{badge.name || "Unnamed Badge"}</h3>
        <div className="flex items-center gap-2 mt-1 flex-grow">
          {getBadgeTypeIcon(badge.badgeType)}
          <p className="text-sm text-[hsl(215,20.2%,65.1%)] m-0">{getBadgeTypeText(badge.badgeType)}</p>
        </div>
      </div>
    </div>
  );
};

const CreateBadgeCard = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-full h-full border-2 border-dashed border-[hsl(214.3,31.8%,91.4%)] rounded-lg bg-[hsl(0,0%,100%)] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-[hsl(215,20.2%,65.1%)] p-4 min-h-[365px] hover:border-gray-400"
  >
    <Plus size={32} />
    <span className="text-sm font-semibold mt-3">Create New Badge</span>
  </button>
);

// --- Main View Component ---
const BadgeSettings = (props) => {
  console.log("BadgeSettings props:", props);
  // const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [eventId, setEventId] = useState(null);
  const [openConfigureModal, setOpenConfigureModal] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageContent, setMessageContent] = useState({});
  
  // Message component hook
  const { showMessage: showMessageModal } = useMessage();

  // Get event ID from props
  useEffect(() => {
    console.log("BadgeSettings props:", props);
    setEventId(props.openData.data._id);
  }, [props]);

  // Fetch badges for the event
  useEffect(() => {
    if (eventId) {
      fetchBadges();
    }
  }, [eventId]);

  const fetchBadges = async () => {
    try {
      console.log("Fetching badges for event:", eventId);
      setLoading(true);
      const response = await getData({ event: eventId }, "badge");
      console.log("Badge fetch response:", response);
      if (response?.data?.response) {
        setBadges(response.data.response);
      } else {
        setBadges([]);
      }
    } catch (error) {
      console.error("Error fetching badges:", error);
      setBadges([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBadges = badges.filter((badge) => (badge.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (badge.badgeType || "").toLowerCase().includes(searchTerm.toLowerCase()));

  const handleCreateBadge = () => {
    console.log("Creating new badge");
    setShowCreateModal(true);
  };

  const handleEditBadge = (badge) => {
    console.log("Editing badge:", badge);
    setSelectedBadge(badge);
    setOpenConfigureModal(true);
  };

  const handleDeleteBadge = (badge) => {
    const badgeName = badge.name || "this badge";
    
    showMessageModal({
      type: 2,
      content: `Are you sure you want to delete "${badgeName}"? This action cannot be undone.`,
      proceed: "Delete",
      okay: "Cancel",
      icon: "question",
      onProceed: async () => {
        try {
          console.log("Deleting badge:", badge._id);
          await deleteData({ id: badge._id }, "badge");
          fetchBadges();
          return true; // Close modal after successful deletion
        } catch (error) {
          console.error("Error deleting badge:", error);
          // Show error message
          showMessageModal({
            type: 1,
            content: "Failed to delete badge. Please try again.",
            icon: "error",
            title: "Error"
          });
          return false; // Keep modal open on error
        }
      },
      data: badge
    });
  };

  const handlePrintBadge = (badge) => {
    console.log("Printing badge:", badge);
    setSelectedBadge(badge);
    setShowPrintModal(true);
  };

  const handleBadgeCreated = (createdBadge) => {
    console.log("Badge created:", createdBadge);
    setShowCreateModal(false);
    setSelectedBadge(null);
    fetchBadges();
  };

  const handlePrintModalClose = () => {
    console.log("Closing print modal");
    setShowPrintModal(false);
    setSelectedBadge(null);
  };

  // Helper functions for PosterBuilder
  const setLoaderBox = (status) => {
    console.log("Setting loader box:", status);
    setShowLoader(status);
  };

  const setMessage = (messageContent) => {
    console.log("Setting message:", messageContent);
    setMessageContent(messageContent);
    setShowMessage(true);
  };

  return (
    <div className="bg-[hsl(0,0%,100%)] text-[hsl(222.2,84%,4.9%)] min-h-screen font-sans">
      {/* Inject CSS for spinner animation */}
      <style>{spinnerStyle}</style>

      {/* Message Display */}
      {showMessage && messageContent.content && (
        <div
          className={`fixed top-5 right-5 z-[1000] p-4 rounded-md max-w-96 shadow-lg ${
            messageContent.type === 1 ? "bg-yellow-50 text-yellow-800 border border-yellow-200" : "bg-green-50 text-green-800 border border-green-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold">{messageContent.icon === "warning" ? "⚠️" : "✅"}</span>
            <span>{messageContent.content}</span>
            <button onClick={() => setShowMessage(false)} className="ml-auto bg-transparent border-0 cursor-pointer text-lg">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Loader */}
      {showLoader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <span>Processing...</span>
          </div>
        </div>
      )}

      <div>
        <PageHeader
          action={
            <AddButton onClick={handleCreateBadge}>
              <AddIcon />
              <span>Add Badge</span>
            </AddButton>
          }
          dynamicClass="sub inner"
          title="Badges"
          description="Create and manage custom badges for your event participants and tickets."
        />

        {loading ? (
          <div className="text-center py-8">
            <span className="text-base text-[hsl(215,20.2%,65.1%)] leading-7">Loading badges...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
            <CreateBadgeCard onClick={handleCreateBadge} />
            {filteredBadges.map((badge) => (
              <BadgeCard key={badge._id} badge={badge} onEdit={handleEditBadge} onDelete={handleDeleteBadge} onPrint={handlePrintBadge} />
            ))}
            {filteredBadges.length === 0 && !loading && (
              <div className="col-span-full text-center py-12 text-[hsl(215,20.2%,65.1%)]">
                <h3 className="text-base font-semibold text-[hsl(222.2,84%,4.9%)]">No Badges Found</h3>
                <p className="text-base leading-7">Create your first badge to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Badge Modal */}
      {showCreateModal && <BadgeSetupModalRealSizes onClose={() => setShowCreateModal(false)} onComplete={handleBadgeCreated} eventId={eventId} />}

      {openConfigureModal && (
        <PopupView
          popupData={<PosterBuilder {...props} type={"badge"} data={selectedBadge} item={selectedBadge} setLoaderBox={setLoaderBox} setMessage={props.setMessage} />}
          closeModal={() => {
            setOpenConfigureModal(false);
            setSelectedBadge(null);
            fetchBadges();
          }}
          itemTitle={{ name: "title", type: "text", collection: "" }}
          openData={{
            data: {
              _id: "configure_badge",
              title: "Configure Badge : " + selectedBadge.badgeType,
            },
          }}
          customClass={"full-page"}
        />
      )}

      {/* Print Badge Modal */}
      {showPrintModal && selectedBadge && <PrintBadge onClose={handlePrintModalClose} badge={selectedBadge} eventId={eventId} />}
    </div>
  );
};

// --- Badge Create Modal Component ---
const BadgeCreateModal = ({ onClose, onSuccess, badge, eventId }) => {
  const [step, setStep] = useState(1);
  const [badgeData, setBadgeData] = useState({
    name: badge?.name || "",
    badgeType: badge?.badgeType || "COMMON_TICKET",
    tickets: badge?.tickets || [],
    participantTypes: badge?.participantTypes || [],
    isActive: badge?.isActive ?? true,
  });

  const badgeTypes = [
    { id: "COMMON_TICKET", name: "Common for all Tickets", icon: Ticket },
    { id: "SPECIFIC_TICKET", name: "Specific Ticket", icon: Users },
    {
      id: "COMMON_PARTICIPANT",
      name: "Common for all Participants",
      icon: User,
    },
    {
      id: "SPECIFIC_PARTICIPANT",
      name: "Specific Participant Type",
      icon: UserCheck,
    },
  ];

  const handleSave = async () => {
    try {
      console.log("Saving badge data:", badgeData);

      // Restructure data based on badge type
      let data = {
        name: badgeData.name,
        badgeType: badgeData.badgeType,
        isActive: badgeData.isActive,
        event: eventId,
      };

      // For both SPECIFIC_TICKET and SPECIFIC_PARTICIPANT, send as tickets
      if (badgeData.badgeType === "SPECIFIC_TICKET" || badgeData.badgeType === "SPECIFIC_PARTICIPANT") {
        data.tickets = badgeData.tickets || badgeData.participantTypes || [];
        // Remove participantTypes from the data
        delete data.participantTypes;
      } else {
        // For COMMON types, don't send tickets or participantTypes
        data.tickets = [];
        delete data.participantTypes;
      }
      console.log("Data to save:", data);

      if (badge) {
        // Update existing badge
        await putData({ ...data, id: badge._id }, "badge");
      } else {
        // Create new badge
        await postData(data, "badge");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving badge:", error);
      alert("Failed to save badge");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-[hsl(0,0%,100%)] rounded-lg max-w-[600px] w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-[hsl(214.3,31.8%,91.4%)]">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight m-0">{badge ? "Edit Badge" : "Create New Badge"}</h2>
            <button onClick={onClose} className="bg-transparent border-0 cursor-pointer">
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="text-sm font-medium block mb-2">Badge Name</label>
            <input
              type="text"
              value={badgeData.name}
              onChange={(e) => setBadgeData({ ...badgeData, name: e.target.value })}
              className="w-full p-3 rounded-md border border-[hsl(214.3,31.8%,91.4%)] text-base"
              placeholder="Enter badge name"
            />
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium block mb-2">Badge Type</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {badgeTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setBadgeData({ ...badgeData, badgeType: type.id })}
                  className={`p-4 rounded-md border-2 cursor-pointer flex items-center gap-3 transition-all ${
                    badgeData.badgeType === type.id
                      ? "border-[hsl(222.2,47.4%,11.2%)] bg-[hsl(222.2,47.4%,11.2%)] text-[hsl(210,40%,98%)]"
                      : "border-[hsl(214.3,31.8%,91.4%)] bg-[hsl(0,0%,100%)] text-[hsl(222.2,84%,4.9%)]"
                  }`}
                >
                  <type.icon size={20} />
                  <span className="text-sm">{type.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Badge</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeSettings;
