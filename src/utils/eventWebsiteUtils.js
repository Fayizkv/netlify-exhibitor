/**
 * Event Website Utilities
 * Provides helper functions for managing event website data across different pages
 * to prevent data loss when updating from different components.
 */

/**
 * Merges layout content data with existing event website data
 * @param {Object} existingData - Current event website data from database
 * @param {Object} layoutData - New layout content data to merge
 * @returns {Object} Merged payload for API update
 */
export const mergeLayoutContentData = (existingData, layoutData) => {
  // Handle modules - if it's a string, parse it; if it's already an array, use as-is
  let modules = layoutData.modules;
  if (typeof modules === "string") {
    try {
      modules = JSON.parse(modules);
    } catch (error) {
      modules = [];
    }
  }

  const payload = {
    // Layout content fields
    title: String(layoutData.title || existingData?.title || ""),
    subtitle: String(layoutData.subtitle || existingData?.subtitle || ""),
    button: {
      show: Boolean(layoutData.button?.show !== undefined ? layoutData.button.show : existingData?.button?.show !== false),
      text: String(layoutData.button?.text || existingData?.button?.text || "Register Now"),
      link: String(layoutData.button?.link || existingData?.button?.link || ""),
    },
    modules: modules, // Send as array, not string
    event: String(layoutData.event),

    // Preserve existing menu data
    ...(existingData?.menus && { menus: existingData.menus }),
  };

  return payload;
};

/**
 * Merges menu settings data with existing event website data
 * @param {Object} existingData - Current event website data from database
 * @param {Object} menuData - New menu settings data to merge
 * @returns {Object} Merged payload for API update
 */
export const mergeMenuSettingsData = (existingData, menuData) => {
  const payload = {
    // Preserve existing layout content
    title: String(existingData?.title || ""),
    subtitle: String(existingData?.subtitle || ""),
    button: {
      show: Boolean(existingData?.button?.show !== false),
      text: String(existingData?.button?.text || "Register Now"),
      link: String(existingData?.button?.link || ""),
    },

    // Menu and module data
    menus: menuData.menus,
    modules: menuData.modules,
    event: String(existingData?.event),
  };

  return payload;
};

/**
 * Validates event website data structure
 * @param {Object} data - Data to validate
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export const validateEventWebsiteData = (data) => {
  const errors = [];

  if (!data) {
    errors.push("Data object is required");
    return { isValid: false, errors };
  }

  if (data.modules && !Array.isArray(data.modules)) {
    errors.push("Modules must be an array");
  }

  if (data.menus && !Array.isArray(data.menus)) {
    errors.push("Menus must be an array");
  }

  if (data.event && typeof data.event !== "string") {
    errors.push("Event must be a string");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Logs event website operations for debugging
 * @param {string} operation - Operation being performed
 * @param {string} component - Component performing the operation
 * @param {Object} data - Data being processed
 */
export const logEventWebsiteOperation = (operation, component, data) => {};
