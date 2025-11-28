// Action to set event timezone when loading an event page
export const setEventTimezone = (timezone, eventInfo = null) => ({
  type: "SET_EVENT_TIMEZONE",
  payload: {
    timezone,
    eventInfo,
  },
});

// Action to clear event timezone when leaving event page
export const clearEventTimezone = () => ({
  type: "CLEAR_EVENT_TIMEZONE",
});

// Action to set browser timezone
export const setBrowserTimezone = (timezone) => ({
  type: "SET_BROWSER_TIMEZONE",
  payload: timezone,
});

// Helper function to get timezone info safely
const getTimezoneInfo = (timezone) => {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short",
    });

    const parts = formatter.formatToParts(now);
    const time = parts.find((part) => part.type === "hour").value + ":" + parts.find((part) => part.type === "minute").value + " " + parts.find((part) => part.type === "dayPeriod").value;
    const abbr = parts.find((part) => part.type === "timeZoneName")?.value || "";

    return {
      timezone,
      currentTime: time,
      abbreviation: abbr,
      displayName: timezone.replace(/_/g, " "),
    };
  } catch (error) {
    return {
      timezone,
      currentTime: "",
      abbreviation: "",
      displayName: timezone.replace(/_/g, " "),
    };
  }
};

// Thunk action to set event timezone with info
export const setEventTimezoneWithInfo = (timezone, eventData = null) => {
  return (dispatch) => {
    const timezoneInfo = getTimezoneInfo(timezone);
    dispatch(
      setEventTimezone(timezone, {
        ...timezoneInfo,
        eventData,
      })
    );
  };
};
