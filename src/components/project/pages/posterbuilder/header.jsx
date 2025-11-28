import { useState, useEffect } from "react";
import { Copy, Check, X, ExternalLinkIcon } from "lucide-react";
import { PosterBuilder } from "../../../../icons";
import { getData } from "../../../../backend/api";

const PosterBuilderHeader = ({ rowData = {}, onTitleChange }) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(rowData?.data?.title || "Untitled Poster");
  const [displayUrlBase, setDisplayUrlBase] = useState("https://eventhex.com");
  const [fullCampaignUrl, setFullCampaignUrl] = useState("");
  const posterData = rowData?.data;
  useEffect(() => {
    setTempTitle(rowData?.data?.title || "Untitled Poster");
  }, [rowData?.data?.title]);

  useEffect(() => {
    const fetchDomainInfo = async () => {
      let baseUrl = "https://eventhex.ai"; // Default base
      if (posterData?.event) {
        try {
          const domainRes = await getData({ event: posterData.event }, "whitelisted-Domains");
          if (domainRes?.status === 200) {
            const domains = domainRes.data.response || [];
            const activeDomain = domains.find((domain) => domain.appType === "eventhex" && domain.status && (domain.verified || domain.domainType === "subdomain"));
            if (activeDomain && activeDomain.domain) {
              baseUrl = activeDomain.domain.includes("http") ? activeDomain.domain : `https://${activeDomain.domain}`;
            }
          }
        } catch (error) {
          console.error("Error fetching whitelisted domains for display:", error);
          // baseUrl remains default on error
        }
      }
      setDisplayUrlBase(baseUrl);
      setFullCampaignUrl(`${baseUrl}/campaign/${rowData?.data?.slug || ""}`);
    };

    fetchDomainInfo();
  }, [rowData?.event, rowData?.data?.slug]); // Depend on event ID and slug

  const handleCopy = async () => {
    if (!fullCampaignUrl) return;
    await navigator.clipboard.writeText(fullCampaignUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const redirectToPoster = () => {
    // No longer needs to be async here, URL is pre-calculated
    if (!fullCampaignUrl) return;
    window.open(fullCampaignUrl, "_blank");
  };

  const handleSave = () => {
    onTitleChange(tempTitle);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempTitle(rowData?.data?.title || "Untitled Poster");
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex flex-row items-center gap-3">
        <div className="flex rounded-full p-4 border border-gray-200">
          <PosterBuilder />
        </div>
        <div className="flex flex-col gap-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-base font-semibold text-[rgb(17,24,39)] px-2 py-1 border border-[rgb(99,102,241)] rounded-md focus:outline-none"
                autoFocus
              />
              <button onClick={handleSave} className="p-1 text-[rgb(99,102,241)] hover:bg-[rgb(238,242,255)] rounded-md transition-colors" title="Save">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={handleCancel} className="p-1 text-gray-500 hover:bg-gray-50 rounded-md transition-colors" title="Cancel">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div onClick={() => setIsEditing(true)} className="text-base font-semibold text-[rgb(17,24,39)] cursor-pointer group flex items-center gap-2">
              <span>{rowData?.data?.title || "Untitled Poster"}</span>
              <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">(click to edit)</span>
            </div>
          )}
          <div className="flex items-center gap-0 ">
            {/* Display the full URL, but make the base visually distinct from the slug if needed */}
            {/* Or, keep it as displayUrlBase + /campaign/ + slug */}
            <span className="text-sm text-gray-500 font-medium">{`${displayUrlBase}/campaign/`}</span>
            <span className="text-sm text-gray-700">{rowData?.data?.slug || ""}</span>
            <button onClick={handleCopy} className="p-0 text-gray-500 hover:bg-gray-50 rounded-md transition-colors ml-2" title="Copy URL" disabled={!fullCampaignUrl}>
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <button onClick={redirectToPoster} className="p-0 text-gray-500 hover:bg-gray-50 rounded-md transition-colors ml-2" title="Open Link" disabled={!fullCampaignUrl}>
              <ExternalLinkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosterBuilderHeader;
