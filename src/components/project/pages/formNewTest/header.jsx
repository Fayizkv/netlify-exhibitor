import { useState, useEffect } from "react";
import { Copy, Check, X, ExternalLinkIcon } from "lucide-react";
import { FileText } from "lucide-react";
import { getData } from "../../../../backend/api";

const FormBuilderHeader = ({ rowData = {}, onTitleChange }) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(rowData?.data?.title || "Untitled Form");
  const [displayUrlBase, setDisplayUrlBase] = useState("https://eventhex.com");
  const [fullFormUrl, setFullFormUrl] = useState("");
  const formData = rowData?.data;

  useEffect(() => {
    setTempTitle(rowData?.data?.title || "Untitled Form");
  }, [rowData?.data?.title]);

  useEffect(() => {
    const fetchDomainInfo = async () => {
      let baseUrl = "https://forms.example.com"; // Default base
      if (formData?.event) {
        try {
          const domainRes = await getData({ event: formData.event }, "whitelisted-Domains");
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
      setFullFormUrl(`${baseUrl}/form/${rowData?.data?.slug || ""}`);
    };

    fetchDomainInfo();
  }, [rowData?.event, rowData?.data?.slug]); // Depend on event ID and slug

  const handleCopy = async () => {
    if (!fullFormUrl) return;
    await navigator.clipboard.writeText(fullFormUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const redirectToForm = () => {
    // No longer needs to be async here, URL is pre-calculated
    if (!fullFormUrl) return;
    window.open(fullFormUrl, "_blank");
  };

  const handleSave = () => {
    onTitleChange(tempTitle);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempTitle(rowData?.data?.title || "Untitled Form");
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
    <div className="flex items-center   justify-between w-full">
      <div className="flex flex-row items-center gap-3">
        <div className="flex rounded-full p-3 border border-gray-200">
          <FileText className="w-5 h-5 text-gray-600" />
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
              <span>{rowData?.data?.title || "Untitled Form"}</span>
              <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">(click to edit)</span>
            </div>
          )}
          <div className="flex items-center gap-0">
            {/* Display the full URL, but make the base visually distinct from the slug if needed */}
            {/* Or, keep it as displayUrlBase + /form/ + slug */}
            <span className="text-sm text-gray-500 font-medium">{`${displayUrlBase}/form/`}</span>
            <span className="text-sm text-gray-700">{rowData?.data?.slug || ""}</span>
            <button onClick={handleCopy} className="p-0 text-gray-500 hover:bg-gray-50 rounded-md transition-colors ml-2" title="Copy URL" disabled={!fullFormUrl}>
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <button onClick={redirectToForm} className="p-0 text-gray-500 hover:bg-gray-50 rounded-md transition-colors ml-2" title="Open Link" disabled={!fullFormUrl}>
              <ExternalLinkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilderHeader;
