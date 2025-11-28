import React from "react";
import { COMPARE_TYPES } from "../../../../../core/functions/conditions";
import CustomTooltip from "../../../../../core/tooltip";

export const avCodeAttributes = [
  {
    type: "text",
    placeholder: "Access Code Name",
    name: "title",
    validation: "",
    default: "",
    label: "Access Code Name",
    tag: true,
    required: true,
    view: true,
    add: true,
    update: true,
    customClass: "full",
  },
  {
    type: "text",
    placeholder: "Code",
    name: "code",
    copy: true,
    validation: "",
    default: "",
    label: "Code",
    tag: true,
    required: false,
    view: true,
    add: false,
    update: false,
  },
  {
    type: "select",
    placeholder: "Grant Access By",
    name: "type",
    validation: "",
    editable: true,
    default: "Session",
    label: "Grant Access By",
    required: true,
    customClass: "half",
    filter: false,
    tag: true,
    view: true,
    add: true,
    update: true,
    apiType: "JSON",
    selectType: "card",
    selectApi: [
      { value: "Session", id: "session", description: "Specific sessions" },
      { value: "Stage", id: "stage", description: "One or more stages" },
    ],
    hide: true,
    statusLabel: {
      nextLine: false,
      size: "small",
      conditions: [
        {
          when: "type",
          condition: COMPARE_TYPES.EQUALS,
          compare: "session",
          type: "string",
          label: "Session",
          icon: "session",
          color: "mint",
        },
        {
          when: "type",
          condition: COMPARE_TYPES.EQUALS,
          compare: "stage",
          type: "string",
          label: "Stage",
          icon: "stage",
          color: "beige",
        },
      ],
    },
  },
  {
    type: "multiSelect",
    apiType: "API",
    selectApi: "sessions/select",
    placeholder: "Assign Sessions",
    name: "assignerSessions",
    showItem: "value",
    label: "Assign Sessions",
    condition: { item: "type", if: "session", then: "enabled", else: "disabled" },
    required: false,
    tag: false,
    view: false,
    add: true,
    update: true,
  },
  {
    type: "multiSelect",
    apiType: "API",
    selectApi: "sessions/select",
    placeholder: "Assign Sessions",
    name: "assignerSessions",
    showItem: "value",
    validation: "",
    default: "",
    label: "Assign Sessions",
    tag: true,
    required: true,
    view: true,
    add: false,
    update: false,
    customClass: "full",
    render: (value, data, attribute) => {
      // Get assignerSessions array from data
      const sessions = data?.assignerSessions || value || [];
      
      // Convert to array if it's not already
      const sessionsArray = Array.isArray(sessions) ? sessions : [];
      const sessionCount = sessionsArray.length;

      // Determine display value
      const displayValue = sessionCount === 0 
        ? "No sessions assigned" 
        : `${sessionCount} ${sessionCount === 1 ? 'Session' : 'Sessions'}`;

      // Create tooltip content with session list
      const tooltipContent = (
        <div className="space-y-2">
          <div className="font-semibold text-sm border-b border-gray-200 pb-2">Assigned Sessions</div>
          {sessionCount === 0 ? (
            <div className="text-sm text-gray-400 italic py-1">No sessions assigned</div>
          ) : (
            <div className="space-y-2">
              {sessionsArray.map((session, index) => {
                // Handle session objects with _id and value properties
                let sessionTitle = "Session";
                if (session) {
                  if (typeof session === "object") {
                    sessionTitle = session.value || session.title || session.name || "Session";
                  } else if (typeof session === "string") {
                    // If it's just an ID string, we can't get the title without a lookup
                    sessionTitle = "Session";
                  }
                }

                // Capitalize first letter
                const capitalizedTitle = sessionTitle.charAt(0).toUpperCase() + sessionTitle.slice(1);

                return (
                  <div key={session?._id || index} className="flex items-center gap-2">
                    <span className="text-sm">⚫️</span>
                    <div className="text-sm font-medium">{capitalizedTitle}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );

      // Return wrapped content with tooltip
      return (
        <CustomTooltip content={tooltipContent} variant="default" size="large" place="left">
          <div className="text-sm cursor-help hover:text-primary-base transition-colors">{displayValue}</div>
        </CustomTooltip>
      );
    },
  },
  {
    type: "multiSelect",
    apiType: "API",
    selectApi: "stage/master/select",
    placeholder: "Assign Stages",
    name: "assignerStages",
    validation: "",
    showItem: "value",
    default: "",
    label: "Assign Stages",
    condition: { item: "type", if: "stage", then: "enabled", else: "disabled" },
    required: false,
    view: false,
    add: true,
    update: true,
  },
];

