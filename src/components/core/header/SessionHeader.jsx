import React, { useState } from "react";
import { Copy, Check, ExternalLinkIcon } from "lucide-react";

const SessionHeader = ({ 
  title = "Agenda & Sessions", 
  description = "Organize your event's schedule by adding sessions, workshops, and keynotes.",
  sessionUrl = "",
  onCopyUrl = () => {},
  onOpenUrl = () => {},
  showUrlActions = false,
  icon: IconComponent
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!sessionUrl) return;
    await navigator.clipboard.writeText(sessionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onCopyUrl) onCopyUrl();
  };

  const handleOpenUrl = () => {
    if (!sessionUrl) return;
    window.open(sessionUrl, "_blank", "noopener,noreferrer");
    if (onOpenUrl) onOpenUrl();
  };

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex flex-row items-center gap-3">
        <div className="flex rounded-full p-3 border border-gray-200">
          <IconComponent className="w-5 h-5 text-gray-600" />
        </div>
        <div className="flex flex-col gap-0">
          <div className="text-base font-semibold text-[rgb(17,24,39)]">
            {title}
          </div>
          <div className="flex items-center gap-0 mt-1">
            {showUrlActions && sessionUrl ? (
              <>
                <span className="text-sm text-gray-700 font-inter">{sessionUrl}</span>
                <button 
                  onClick={handleCopy} 
                  className="p-1 text-gray-500 hover:bg-gray-50 rounded-md transition-colors ml-2" 
                  title="Copy URL"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button 
                  onClick={handleOpenUrl} 
                  className="p-1 text-gray-500 hover:bg-gray-50 rounded-md transition-colors ml-2" 
                  title="Open Link"
                >
                  <ExternalLinkIcon className="w-4 h-4" />
                </button>
              </>
            ) : (
              <span className="text-sm text-gray-600">{description}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionHeader;
