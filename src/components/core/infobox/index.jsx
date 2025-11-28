import React, { useState } from "react";
import { GetIcon } from "../../../icons";
import TooltipDemo from "../tooltip/demo";

// InfoBox Component
const InfoBox = React.memo(
  ({
    icon = "info",
    showIcon = true,
    type = "info",
    content = "",
    closable = true,
    api = "",
    storageKey = null,
    title = null,
    actionButton = null,
    design = "1", // Design options: "1", "2", "3", "4", "5"
    className = "", // Additional custom classes
  }) => {
    // Generate storage key internally
    const getInfoBoxStorageKey = () => {
      if (storageKey) return storageKey;

      const userStr = localStorage.getItem("user");
      let userId = "anonymous";
      try {
        const user = JSON.parse(userStr);
        userId = user?._id || user?.id || "anonymous";
      } catch (e) {
        // Keep default userId
      }
      return `eventhex:infobox:${api}:${userId}`;
    };

    // Internal state management
    const [show, setShow] = useState(() => {
      if (!content) return false;
      try {
        const key = getInfoBoxStorageKey();
        const dismissed = localStorage.getItem(key);
        return dismissed !== "true";
      } catch (e) {
        return true;
      }
    });

    const handleClose = () => {
      setShow(false);
      try {
        const key = getInfoBoxStorageKey();
        localStorage.setItem(key, "true");
      } catch (e) {
        // Silent fail for localStorage issues
      }
    };

    if (!show || !content) return null;

    const getDesignStyles = () => {
      const baseStyles = {
        info: {
          bg: "bg-primary-lightest",
          border: "border-primary-light",
          text: "text-primary-dark",
          iconColor: "text-primary-base",
          iconBg: "bg-primary-base",
        },
        warning: {
          bg: "bg-yellow-50",
          border: "border-state-warning",
          text: "text-yellow-800",
          iconColor: "text-state-warning",
          iconBg: "bg-state-warning",
        },
        error: {
          bg: "bg-red-50",
          border: "border-state-error",
          text: "text-red-800",
          iconColor: "text-state-error",
          iconBg: "bg-state-error",
        },
        success: {
          bg: "bg-green-50",
          border: "border-state-success",
          text: "text-green-800",
          iconColor: "text-state-success",
          iconBg: "bg-state-success",
        },
        feature: {
          bg: "bg-gradient-to-r from-primary-lightest to-primary-light",
          border: "border-primary-base",
          text: "text-text-main",
          iconColor: "text-white",
          iconBg: "bg-gradient-to-r from-primary-base to-primary-dark",
        },
      };

      const typeKey = type === "warn" ? "warning" : type === "happiness" ? "success" : type === "new" || type === "feature" ? "feature" : type;

      return baseStyles[typeKey] || baseStyles.info;
    };

    const styles = getDesignStyles();

    // Universal Action Button Renderer
    const renderActionButtons = (buttonStyle = "default") => {
      if (!actionButton) return null;

      // Get type-specific button colors
      const getTypeColors = () => {
        const typeKey = type === "warn" ? "warning" : type === "happiness" ? "success" : type === "new" || type === "feature" ? "info" : type;

        const colorMap = {
          info: {
            primary: "bg-primary-base hover:bg-primary-dark",
            secondary: "border-primary-base text-primary-base hover:bg-primary-base",
            text: "text-primary-base hover:text-primary-dark",
          },
          warning: {
            primary: "bg-state-warning hover:bg-yellow-600",
            secondary: "border-state-warning text-state-warning hover:bg-state-warning",
            text: "text-state-warning hover:text-yellow-600",
          },
          error: {
            primary: "bg-state-error hover:bg-red-600",
            secondary: "border-state-error text-state-error hover:bg-state-error",
            text: "text-state-error hover:text-red-600",
          },
          success: {
            primary: "bg-state-success hover:bg-green-600",
            secondary: "border-state-success text-state-success hover:bg-state-success",
            text: "text-state-success hover:text-green-600",
          },
        };

        return colorMap[typeKey] || colorMap.info;
      };

      const typeColors = getTypeColors();

      const getButtonClasses = (variant, style) => {
        const baseClasses = "text-xs px-3 py-1 rounded-md transition-colors";

        if (style === "feature") {
          // Design 4 - Feature Highlight
          switch (variant) {
            case "primary":
              return `${baseClasses} ${typeColors.primary} text-white`;
            case "secondary":
              return `${baseClasses} border ${typeColors.secondary} hover:text-white`;
            default:
              return `${baseClasses} ${typeColors.text}`;
          }
        } else if (style === "compact") {
          // Design 5 - Compact
          switch (variant) {
            case "primary":
              return `text-xs ${typeColors.primary} text-white px-3 py-1.5 rounded-md font-medium transition-colors`;
            case "secondary":
              return `text-xs border ${typeColors.secondary} hover:text-white px-3 py-1.5 rounded-md font-medium transition-colors`;
            default:
              return `text-xs border border-stroke-sub ${typeColors.text} px-2 py-1 rounded transition-colors`;
          }
        } else {
          // Designs 1, 2, 3 - Standard
          switch (variant) {
            case "primary":
              return `${baseClasses} ${typeColors.primary} text-white`;
            case "secondary":
              return `${baseClasses} border ${typeColors.secondary} hover:text-white`;
            default:
              return `${baseClasses} border border-stroke-sub ${typeColors.text}`;
          }
        }
      };

      return (
        <div className={`flex items-center ${buttonStyle === "compact" ? "space-x flex-wrap gap-1" : "space-x flex-wrap gap-2"} ${buttonStyle === "block" ? "mt-3" : ""}`}>
          {actionButton.label && actionButton.onClick && (
            <button onClick={actionButton.onClick} className={getButtonClasses("primary", buttonStyle)}>
              {actionButton.label}
            </button>
          )}

          {/* Handle primary/secondary structure */}
          {actionButton.primary && (
            <button onClick={actionButton.primary.onClick} className={getButtonClasses("primary", buttonStyle)}>
              {actionButton.primary.label}
            </button>
          )}
          {actionButton.secondary && (
            <button onClick={actionButton.secondary.onClick} className={getButtonClasses("secondary", buttonStyle)}>
              {actionButton.secondary.label}
            </button>
          )}

          {/* Handle multiple buttons array */}
          {actionButton.buttons &&
            Array.isArray(actionButton.buttons) &&
            actionButton.buttons.map((btn, index) => (
              <button key={index} onClick={btn.onClick} className={getButtonClasses(btn.variant || "default", buttonStyle)}>
                {btn.label}
              </button>
            ))}
        </div>
      );
    };

    // Helper to check if content is a React element
    const isReactElement = React.isValidElement(content);

    // Design Option 1: Subtle Informational (Left Border)
    if (design === "1") {
      // Override icon color for feature type in Design 1 (no background circle)
      const iconColorOverride = type === "feature" || type === "new" ? "text-primary-base" : styles.iconColor;

      return (
        <div className={`${styles.bg} border-l-4 ${styles.border} rounded-r-lg p-4 mb-4 flex items-start`}>
          {showIcon && (
            <div className={`flex-shrink-0 mr-3 ${iconColorOverride} [&>svg]:w-5 [&>svg]:h-5 [&>svg]:mt-0.5`}>
              <GetIcon icon={icon} />
            </div>
          )}
          <div className="flex-1">
            {isReactElement ? (
              content
            ) : (
              <p className={`text-sm ${styles.text}`}>
                {title && <strong>{title}: </strong>}
                {content}
              </p>
            )}
            {renderActionButtons("block")}
          </div>
          {closable && (
            <button onClick={handleClose} className={`flex-shrink-0 ml-3 ${iconColorOverride} hover:opacity-70 [&>svg]:w-4 [&>svg]:h-4`} aria-label="Close info box">
              <GetIcon icon="close" />
            </button>
          )}
        </div>
      );
    }

    // Design Option 2: Alert/Warning Style (Full Border with Title)
    if (design === "2") {
      // Override icon color for feature type in Design 2 (no background circle)
      const iconColorOverride = type === "feature" || type === "new" ? "text-primary-base" : styles.iconColor;

      return (
        <div className={`${styles.bg} border ${styles.border} rounded-lg p-4 mb-4 flex items-start`}>
          {showIcon && (
            <div className={`flex-shrink-0 mr-3 ${iconColorOverride} [&>svg]:w-5 [&>svg]:h-5 [&>svg]:mt-0.5`}>
              <GetIcon icon={icon} />
            </div>
          )}
          <div className="flex-1">
            {isReactElement ? (
              content
            ) : (
              <>
                {title && <h3 className={`text-sm font-medium ${styles.text} mb-1`}>{title}</h3>}
                <p className={`text-sm ${styles.text}`}>{content}</p>
              </>
            )}
            {renderActionButtons("block")}
          </div>
          {closable && (
            <button onClick={handleClose} className={`flex-shrink-0 ml-3 ${iconColorOverride} hover:opacity-70 [&>svg]:w-4 [&>svg]:h-4`} aria-label="Close info box">
              <GetIcon icon="close" />
            </button>
          )}
        </div>
      );
    }

    // Design Option 3: Feature Highlight (Gradient with Action Buttons)
    if (design === "3") {
      const iconColorOverride = type === "feature" || type === "new" ? "text-primary-base" : styles.iconColor;

      return (
        <div className={`${styles.bg} border ${styles.border} rounded-lg p-4 mb-4`}>
          <div className="flex items-start">
            {showIcon && (
              <div className={`flex-shrink-0 mr-3`}>
                <div className={`w-8 h-8 ${styles.iconBg} rounded-full flex items-center justify-center text-white [&>svg]:w-4 [&>svg]:h-4`}>
                  <GetIcon icon={icon} />
                </div>
              </div>
            )}
            <div className="flex-1">
              {isReactElement ? (
                content
              ) : (
                <>
                  {title && <h3 className="text-sm font-semibold text-text-main mb-1">{title}</h3>}
                  <p className="text-sm text-text-sub mb-3">{content}</p>
                </>
              )}
              {renderActionButtons("feature")}
            </div>
            {closable && (
              <button onClick={handleClose} className={`flex-shrink-0 ml-3 ${iconColorOverride} hover:text-icon-sub [&>svg]:w-4 [&>svg]:h-4`} aria-label="Close info box">
                <GetIcon icon="close" />
              </button>
            )}
          </div>
        </div>
      );
    }

    // Design Option 4: Compact Action-Oriented (Horizontal Layout)
    if (design === "4") {
      // Override icon color for feature type in Design 4 (no background circle)
      const iconColorOverride = type === "feature" || type === "new" ? "text-primary-base" : "text-icon-sub";

      return (
        <div className="bg-bg-weak border border-stroke-soft rounded-lg p-3 mb-4 flex items-center">
          {showIcon && (
            <div className={`flex-shrink-0 pt-2 mr-3 ${iconColorOverride} [&>svg]:w-4 [&>svg]:h-4`}>
              <GetIcon icon={icon} />
            </div>
          )}
          <div className="flex-1">
            {isReactElement ? (
              content
            ) : (
              <p className="text-sm text-text-main">
                {title && <strong>{title}: </strong>}
                {content}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-3 flex-wrap gap-1">
            {renderActionButtons("compact")}
            {closable && (
              <button onClick={handleClose} className={`${iconColorOverride} hover:text-icon-sub [&>svg]:w-4 [&>svg]:h-4`} aria-label="Close info box">
                <GetIcon icon="close" />
              </button>
            )}
          </div>
        </div>
      );
    }

    // Default fallback (Design 1)
    // Override icon color for feature type in default design (no background circle)
    const iconColorOverride = type === "feature" || type === "new" ? "text-primary-base" : styles.iconColor;

    return (
      <div className={`${styles.bg} border-l-4 ${styles.border} rounded-r-lg p-4 mb-4 flex items-start`}>
        {showIcon && (
          <div className={`flex-shrink-0 mr-3 ${iconColorOverride} [&>svg]:w-5 [&>svg]:h-5 [&>svg]:mt-0.5`}>
            <GetIcon icon={icon} />
          </div>
        )}
        <div className="flex-1">
          {isReactElement ? (
            content
          ) : (
            <p className={`text-sm ${styles.text}`}>
              {title && <strong>{title}: </strong>}
              {content}
            </p>
          )}
          {renderActionButtons("block")}
        </div>
        {closable && (
          <button onClick={handleClose} className={`flex-shrink-0 ml-3 ${styles.iconColor} hover:opacity-70`} aria-label="Close info box">
            <GetIcon icon="close" className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);

export default InfoBox;
