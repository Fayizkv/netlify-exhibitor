import moment from "moment";
import "moment-timezone";
import { useSelector } from "react-redux";
import React from "react";

// Hook to get current timezone from Redux
export const useCurrentTimezone = () => {
  const timezone = useSelector((state) => state.timezone);
  return {
    currentTimezone: timezone?.isActive ? timezone.eventTimezone : null,
    isEventActive: timezone?.isActive || false,
    eventInfo: timezone?.eventInfo || null,
  };
};

// Utility function to format dates with timezone (for use outside components)
export const formatDateWithTimezone = (date, timezone = null, format = "MMM DD, YYYY hh:mm A") => {
  if (!moment(date).isValid()) return "--";

  if (timezone && moment.tz) {
    return moment.tz(date, timezone).format(format);
  }

  return moment(date).format(format);
};

// Enhanced date formatting functions that work with Redux timezone
export const createDateFormatter =
  (defaultFormat, appendTimezone = false) =>
  (date, timezone = null) => {
    if (!moment(date).isValid()) return "--";

    // Determine effective timezone
    let effectiveTimezone = timezone;
    if (!effectiveTimezone) {
      try {
        if (typeof window !== "undefined") {
          const state = window.__REDUX_STORE__?.getState?.() || window.store?.getState?.();
          effectiveTimezone = state?.timezone?.isActive ? state.timezone.eventTimezone : null;
        }
      } catch (error) {
        /* Ignore */
      }
    }

    // Format with timezone if available
    if (effectiveTimezone && moment.tz) {
      const formattedMoment = moment.tz(date, effectiveTimezone);
      const mainFormat = formattedMoment.format(defaultFormat);

      if (appendTimezone) {
        const tzAbbr = formattedMoment.format("z");
        return `${mainFormat} (${tzAbbr})`;
      }
      return mainFormat;
    }

    // Fallback to local moment formatting
    return moment(date).format(defaultFormat);
  };

// Create the specific formatters
export const dateTimeFormat = createDateFormatter("MMM DD, YYYY hh:mm A", true);
export const dateFormat = createDateFormatter("MMM DD, YYYY");
export const timeFormat = createDateFormatter("hh:mm A", true);

// Component-based date formatter that uses the hook
export const DateDisplay = ({ date, format = "MMM DD, YYYY hh:mm A", showTimezone = false, className = "" }) => {
  const { currentTimezone, isEventActive } = useCurrentTimezone();

  if (!moment(date).isValid()) return <span className={className}>--</span>;

  let formattedDate;
  let timezoneInfo = "";

  if (currentTimezone && moment.tz) {
    const formatted = moment.tz(date, currentTimezone);
    formattedDate = formatted.format(format);
    if (showTimezone) {
      timezoneInfo = ` (${formatted.format("z")})`;
    }
  } else {
    formattedDate = moment(date).format(format);
  }

  return (
    <span className={`${className} ${isEventActive ? "text-blue-600" : ""}`}>
      {formattedDate}
      {timezoneInfo}
    </span>
  );
};
