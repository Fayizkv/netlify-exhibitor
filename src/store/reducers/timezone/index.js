const initialState = {
  eventTimezone: null,
  browserTimezone: null,
  isActive: false,
  eventInfo: null,
};

const timezoneReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_EVENT_TIMEZONE":
      return {
        ...state,
        eventTimezone: action.payload.timezone,
        eventInfo: action.payload.eventInfo,
        isActive: true,
        browserTimezone: state.browserTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

    case "CLEAR_EVENT_TIMEZONE":
      return {
        ...state,
        eventTimezone: null,
        eventInfo: null,
        isActive: false,
      };

    case "SET_BROWSER_TIMEZONE":
      return {
        ...state,
        browserTimezone: action.payload,
      };

    default:
      return state;
  }
};

export default timezoneReducer;
