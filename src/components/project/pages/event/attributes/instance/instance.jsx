import React, { useState } from "react";
import { GetIcon } from "../../../../../../icons";
import CreateInstance from "../../instance/index";
import PopupView from "../../../../../core/popupview";
import Search from "../../../../../core/search";
import { useMessage } from "../../../../../core/message/useMessage";

// Wrapper component to manage popup state
const UsersDisplayWithPopup = (props) => {
  const { users, onRemoveUser } = props;
  const [showPopup, setShowPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { showMessage } = useMessage();

  // Debug: Check if onRemoveUser is passed
  console.log("UsersDisplayWithPopup - props:", props);
  console.log("UsersDisplayWithPopup - onRemoveUser:", onRemoveUser ? "PASSED ✅" : "NOT PASSED ❌");

  if (!users || users.length === 0) {
    return <span>--</span>;
  }

  // Show first 2 users as text
  const displayCount = 2;
  const displayUsers = users.slice(0, displayCount);
  const remainingCount = users.length - displayCount;

  // Get user display name
  const getUserName = (user) => {
    if (typeof user === "object") {
      return user.fullName || user.name || user.email || user.value || "User";
    }
    return String(user);
  };

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    const userName = getUserName(user).toLowerCase();
    return userName.includes(searchTerm.toLowerCase());
  });

  const handleRemoveUser = (userToRemove, index) => {
    const userName = getUserName(userToRemove);
    
    // Show confirmation dialog
    showMessage({
      type: 2, // Confirmation type
      content: `Do you want to remove "${userName}" from this instance? This action cannot be undone.`,
      proceed: "Remove",
      okay: "Cancel",
      onProceed: async () => {
        if (onRemoveUser) {
          onRemoveUser(userToRemove, index);
        }
      },
    });
  };

  return (
    <>
      <span className="text-sm text-gray-700">
        {displayUsers.map((user, index) => (
          <span key={index}>
            {getUserName(user)}
            {index < displayUsers.length - 1 && ", "}
          </span>
        ))}
        {remainingCount > 0 && (
          <>
            <span>, </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPopup(true);
              }}
              className="text-xs font-semibold text-primary-base hover:text-primary-dark underline transition-colors"
            >
              View More ({users.length})
            </button>
          </>
        )}
      </span>

      {/* Popup to show all users */}
      {showPopup && (
        <PopupView
          popupData={
            <div className="space-y-4 p-4">
              {/* Search Bar */}
              <Search 
                placeholder="Search users..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                active={true}
              />

              {/* Users List */}
              <div className="space-y-2 overflow-y-auto">
                {filteredUsers && filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between gap-3 px-3 py-2 bg-bg-weak rounded-lg border border-stroke-soft hover:bg-bg-soft transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#deebff" }}>
                          <span className="text-xs font-semibold" style={{ color: "#4876b6" }}>
                            {typeof user === "object" ? (user.fullName?.[0] || user.name?.[0] || user.email?.[0] || "U").toUpperCase() : String(user)[0]?.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-text-main truncate">{typeof user === "object" ? user.fullName || user.name || user.email || user : user}</span>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onRemoveUser) {
                            handleRemoveUser(user, index);
                          }
                        }}
                        className="flex-shrink-0 p-2 hover:bg-red-50 rounded-md transition-colors group border border-gray-200"
                        title="Remove user"
                        style={{ minWidth: '32px', minHeight: '32px' }}
                      >
                        <GetIcon icon="delete" className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-text-sub">{searchTerm ? `No users found matching "${searchTerm}"` : "No users selected"}</div>
                )}
              </div>
            </div>
          }
          themeColors={{}}
          closeModal={() => {
            setShowPopup(false);
            setSearchTerm("");
          }}
          itemTitle={{
            name: "title",
            type: "text",
            collection: "",
          }}
          openData={{
            data: {
              _id: "users-popup",
              title: `Selected Users (${users.length})`,
            },
          }}
          customClass="small"
          headerActions={[]}
        />
      )}
    </>
  );
};

export const instanceNewAttributes = [
  {
    type: "text",
    placeholder: "Instance Name",
    name: "title",
    validation: "",
    default: "",
    label: "Instance Name",
    tag: true,
    required: false,
    view: true,
    add: true,
    update: true,
    icon: "text",
    group: "Instance Details",
    customClass: "full",
    render: (value, rowData, attribute, props) => {
      return React.createElement(
        "div",
        null,
        // Main container with icon and title
        React.createElement(
          "div",
          { style: { display: "flex", alignItems: "center", gap: "12px" } },
          // Image avatar component
          React.createElement(
            "div",
            {
              style: {
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#deebff", // Light blue background
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                position: "relative",
                overflow: "hidden",
              },
            },
            // Instance icon inside the circle
            React.createElement(
              "div",
              {
                style: {
                  color: "#4876b6", // Blue icon color
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                },
              },
              React.createElement(GetIcon, { icon: "instance" })
            )
          ),
          // Instance title
          React.createElement("div", { className: "font-medium text-gray-900", style: { fontWeight: "600" } }, value)
        )
      );
    },
  },
  {
    type: "select",
    placeholder: "Applicable Tickets",
    name: "ticketType",
    validation: "",
    tag: false,
    editable: true,
    default: "All Tickets",
    label: "Who Can Attend?",
    sublabel: "",
    showItem: "",
    required: false,
    customClass: "full",
    filter: false,
    view: true,
    add: true,
    update: true,
    apiType: "JSON",
    selectType: "card",
    group: "Access Control",
    selectApi: [
      { value: "All Tickets", id: "0", description: "Everyone with any ticket type can join" },
      { value: "Selected Tickets & Participant types", id: "1", description: "Limit access to specific ticket types only" },
    ],
    icon: "user-group",
    onChange: (fieldName, formValues, formType) => {
      // Update hasTicketsSelected based on ticketType selection
      const isSelectedTickets = formValues.ticketType === "1";
      const hasTickets = isSelectedTickets && Array.isArray(formValues.ticket) && formValues.ticket.length > 0;
      return {
        ...formValues,
        hasTicketsSelected: hasTickets,
      };
    },
  },
  {
    type: "info",
    content: "The all users can enroll this instance",
    add: true,
    update: true,
    group: "Access Control",
    condition: {
      item: "ticketType",
      if: "0",
      then: "enabled",
      else: "disabled",
    },
  },
  {
    type: "element",
    name: "ticket",
    label: "Select Tickets",
    group: "Access Control",
    required: false,
    showError: false,
    view: false,
    add: true,
    update: true,
    condition: {
      item: "ticketType",
      if: "1",
      then: "enabled",
      else: "disabled",
    },
    onChange: (fieldName, formValues, formType) => {
      // Accept both legacy array and new object { tickets, selection }
      const value = formValues.ticket;
      let next = { ...formValues };
      if (Array.isArray(value)) {
        next.ticket = value;
      } else if (value && typeof value === "object") {
        const tickets = Array.isArray(value.tickets) ? value.tickets : [];
        next.ticket = tickets;
        if (value.selection && typeof value.selection === "object") {
          // Preserve per-ticket selection policy for backend
          next.userSelections = value.selection;
          const allUserIds = Object.values(value.selection).flatMap((entry) => (entry && Array.isArray(entry.users) ? entry.users : []));
          next.users = Array.from(new Set(allUserIds));
        }
      }
      next.hasTicketsSelected = Array.isArray(next.ticket) && next.ticket.length > 0;
      return next;
    },
    element: (data, onChange) => {
      return <CreateInstance {...data} onChange={onChange} />;
    },
  },
  {
    type: "text",
    placeholder: "Applicable Tickets",
    name: "ticket",
    label: "Applicable Tickets",
    validation: "",
    tag: true,
    required: false,
    view: true,
    add: false,
    update: false,
    filter: false,
    export: false,
    footnote: "",
    icon: "ticket",
    render: (value, rowData) => {
      if (rowData?.ticketType === "All Tickets" || rowData?.ticketType === 0 || rowData?.ticketType === "0") {
        return "All Tickets";
      }
      if (typeof rowData?.displayTickets === "string" && rowData.displayTickets.trim().length > 0) {
        return rowData.displayTickets;
      }
      if (Array.isArray(rowData?.ticket) && rowData.ticket.length > 0) {
        const titles = rowData.ticket.map((t) => (typeof t === "object" ? t.title : t)).filter(Boolean);
        return titles.join(", ");
      }
      return "--";
    },
  },
  {
    type: "select",
    apiType: "API",
    selectApi: "ticket/event-ticket",
    placeholder: "Applicable Tickets",
    name: "ticket",
    label: "Applicable Tickets",
    updateOn: "event",
    showItem: "title",
    validation: "",
    tag: false,
    required: false,
    view: false,
    add: false,
    update: false,
    filter: true,
    export: false,
    footnote: "",
    icon: "ticket",
  },
  {
    type: "hidden",
    name: "hasTicketsSelected",
    default: false,
    add: true,
    update: true,
  },
  //   {
  //     type: "multiSelect",
  //     apiType: "API",
  //     selectApi: "instance/registered-users/select",
  //     placeholder: "Select Users",
  //     name: "users",
  //     label: "Selected Users",
  //     updateOn: "ticket",
  //     showItem: "value",
  //     validation: "",
  //     params: [{ name: "event", value: "", dynamic: true }],
  //     condition: { item: "hasTicketsSelected", if: true, then: "enabled", else: "disabled" },
  //     tag: false,
  //     required: false,
  //     view: false,
  //     add: true,
  //     update: true,
  //     filter: false,
  //     export: false,
  //     footnote: "Select specific users who can attend this instance",
  //     icon: "user",
  //     group: "Access Control",
  //   },
  {
    type: "text",
    placeholder: "Select Users",
    name: "users",
    label: "Select Users",
    validation: "",
    tag: true,
    view: true,
    add: false,
    update: false,
    filter: false,
    export: false,
    footnote: "",
    icon: "user",
    render: (value, rowData, attribute, props) => {
      if (rowData?.ticketType === "All Tickets" || rowData?.ticketType === 0 || rowData?.ticketType === "0") {
        return "All Users";
      }

      const users = Array.isArray(rowData?.users) ? rowData.users : [];

      // Callback for removing users
      const handleRemoveUser = (userToRemove, index) => {
        console.log("🗑️ Remove user clicked:", userToRemove, "at index:", index, "from row:", rowData._id);
        // This can be connected to your backend API to remove the user
        // For example: await deleteData({}, `instance/${rowData._id}/user/${userToRemove._id || userToRemove}`);
      };

      console.log("🔍 Rendering UsersDisplayWithPopup with onRemoveUser:", typeof handleRemoveUser);
      
      return <UsersDisplayWithPopup users={users} onRemoveUser={handleRemoveUser} />;
    },
  },
];
