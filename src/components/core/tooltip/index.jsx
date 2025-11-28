import React from "react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

function CustomTooltip({ children, content, id, place = "top", variant = "default", size = "medium", className = "", showArrow = true, ...props }) {
  // Generate unique ID if not provided
  const tooltipId = id || `tooltip-${Math.random().toString(36).substr(2, 9)}`;

  // AlignUI inspired variant styles - refined and professional
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "!bg-emerald-50 !text-emerald-900 !border-emerald-200";
      case "error":
        return "!bg-red-50 !text-red-900 !border-red-200";
      case "warning":
        return "!bg-amber-50 !text-amber-900 !border-amber-200";
      case "info":
        return "!bg-blue-50 !text-blue-900 !border-blue-200";
      case "dark":
        return "!bg-gray-900 !text-white !border-gray-700";
      default:
        return "!bg-white !text-gray-900 !border-gray-200";
    }
  };

  // AlignUI inspired size styles - proper spacing and typography
  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return "!text-xs !px-2 !py-1.5 !max-w-xs";
      case "large":
        return "!text-sm !px-4 !py-3 !max-w-sm";
      default:
        return "!text-sm !px-3 !py-2 !max-w-xs";
    }
  };

  // AlignUI professional tooltip styling
  const tooltipStyles = `
    !z-[9999] !rounded-xl !border !font-medium !leading-snug
    !shadow-2xl !backdrop-blur-md
    ${getVariantStyles()} ${getSizeStyles()} ${className}
  `.trim();

  return (
    <>
      <div data-tooltip-id={tooltipId} {...props}>
        {children}
      </div>
      <Tooltip
        id={tooltipId}
        place={place}
        className={tooltipStyles}
        delayShow={150}
        delayHide={100}
        noArrow={!showArrow}
        offset={12}
        style={{
          borderRadius: "12px",
          boxShadow:
            variant === "dark"
              ? "0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)"
              : "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 8px 16px -4px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="relative">
          {content}

          {/* AlignUI subtle accent border */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></div>

          {/* AlignUI micro-interaction glow */}
          <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-transparent via-current to-transparent opacity-5 pointer-events-none"></div>
        </div>
      </Tooltip>
    </>
  );
}

export default CustomTooltip;
