import { useState, useEffect } from "react";
import { Copy, Check, X, ExternalLinkIcon } from "lucide-react";
import { FileText } from "lucide-react";
import { getData, putData } from "../../../../../backend/api";
import useToast from "../../../../core/toast";

// Helper functions to work with cached domains
const getCachedEventDomain = (eventId) => {
  try {
    return localStorage.getItem(`eventhex:domain:${eventId}`);
  } catch (e) {
    return null;
  }
};

// Fallback: try to find any eventhex domain stored in localStorage
const getAnyCachedDomain = () => {
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith("eventhex:domain:")) {
        const value = localStorage.getItem(key);
        if (typeof value === "string" && value.length > 0) return value;
      }
    }
    return null;
  } catch (e) {
    return null;
  }
};

const extractDefaultEventhexDomain = (domains) => {
  if (!Array.isArray(domains)) return null;
  const match = domains.find((d) => (d?.appType === "eventhex" || d?.route === "eventhex") && d?.isDefault === true && typeof d?.domain === "string" && d?.domain?.length > 0);
  return match ? match.domain : null;
};

const EventFormHeader = ({ rowData = {}, onTitleChange }) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(rowData?.data?.title || "Untitled Form");
  const [fullTicketUrl, setFullTicketUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const formData = rowData?.data;
  const toast = useToast();

  useEffect(() => {
    setTempTitle(rowData?.data?.title || "Untitled Form");
  }, [rowData?.data?.title]);

  useEffect(() => {
    const fetchTicketUrl = async () => {
      // Get the ticket slug from the data
      const ticketSlug =
        formData?.slug ||
        (formData?.title
          ? formData.title
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, "")
              .replace(/\s+/g, "-")
              .replace(/-+/g, "-")
              .replace(/^-|-$/g, "")
          : "");

      // Debug logging
      // console.log("Header Debug:", {
      //   formData,
      //   event: formData?.event,
      //   slug: formData?.slug,
      //   title: formData?.title,
      //   ticketSlug,
      // });

      // Always generate a URL even if we don't have event data
      if (!ticketSlug) {
        setFullTicketUrl("");
        setIsLoading(false);
        return;
      }

      // If we have event data, try to get the proper domain
      if (formData?.event) {
        const eventId = typeof formData.event === "string" ? formData.event : formData.event._id;

        // First try to get from cached domain
        const cachedDomain = getCachedEventDomain(eventId);
        if (cachedDomain) {
          const websiteUrl = cachedDomain.includes("http") ? cachedDomain : `https://${cachedDomain}`;
          const url = `${websiteUrl}/register/${ticketSlug}`;
          setFullTicketUrl(url);
          setIsLoading(false);
          return;
        }

        try {
          // Fallback to API if not cached
          const domainRes = await getData({ event: eventId }, "whitelisted-domains");
          if (domainRes?.status === 200) {
            const domains = domainRes.data.response || [];
            const defaultDomain = extractDefaultEventhexDomain(domains);

            if (defaultDomain) {
              const websiteUrl = defaultDomain.includes("http") ? defaultDomain : `https://${defaultDomain}`;
              const url = `${websiteUrl}/register/${ticketSlug}`;
              setFullTicketUrl(url);
              setIsLoading(false);
              return;
            }
          }

          // Fallback to event website
          const websiteRes = await getData({ id: eventId }, "event/website");
          if (websiteRes?.status === 200 && websiteRes.data.data) {
            const websiteUrl = websiteRes.data.data.includes("http") ? websiteRes.data.data : `https://${websiteRes.data.data}`;
            const url = `${websiteUrl}/register/${ticketSlug}`;
            setFullTicketUrl(url);
          } else {
            // Final fallback: prefer any cached domain, otherwise example.com
            const anyDomain = getAnyCachedDomain();
            const websiteUrl = anyDomain ? (anyDomain.includes("http") ? anyDomain : `https://${anyDomain}`) : "https://example.com";
            setFullTicketUrl(`${websiteUrl}/register/${ticketSlug}`);
          }
        } catch (error) {
          console.error("Error fetching ticket URL:", error);
          // Fallback: prefer cached or any stored domain; else example.com
          const cached = getCachedEventDomain(eventId) || getAnyCachedDomain();
          const websiteUrl = cached ? (cached.includes("http") ? cached : `https://${cached}`) : "https://example.com";
          setFullTicketUrl(`${websiteUrl}/register/${ticketSlug}`);
        } finally {
          setIsLoading(false);
        }
      } else {
        // No event data. Prefer any cached domain; else example.com
        const anyDomain = getAnyCachedDomain();
        const websiteUrl = anyDomain ? (anyDomain.includes("http") ? anyDomain : `https://${anyDomain}`) : "https://example.com";
        setFullTicketUrl(`${websiteUrl}/register/${ticketSlug}`);
        setIsLoading(false);
      }
    };

    fetchTicketUrl();
  }, [formData?.event, formData?.slug, formData?.title]);

  const handleCopy = async () => {
    if (!fullTicketUrl) return;
    await navigator.clipboard.writeText(fullTicketUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const redirectToTicket = () => {
    if (!fullTicketUrl) return;
    window.open(fullTicketUrl, "_blank");
  };

  // Handle saving the updated ticket title
  const handleSave = async () => {
    // Validate that title is not empty
    if (!tempTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    // If title hasn't changed, just close editing mode
    if (tempTitle === rowData?.data?.title) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      // Update the ticket in the database using PUT method
      const response = await putData(
        {
          id: formData._id,
          title: tempTitle.trim(),
        },
        "ticket"
      );

      if (response?.status === 200) {
        // Update successful
        toast.success("Ticket title updated successfully!");

        // Update the local data
        if (onTitleChange) {
          onTitleChange(tempTitle.trim());
        }

        // Update the formData to trigger URL regeneration
        formData.title = tempTitle.trim();
        formData.slug =
          response.data?.data?.slug ||
          tempTitle
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");

        // Update the rowData to reflect changes in the UI
        if (rowData?.data) {
          rowData.data.title = tempTitle.trim();
          rowData.data.slug = formData.slug;
        }

        // Force URL regeneration by updating the dependencies
        setTimeout(() => {
          // Trigger a re-render by updating the state
          setFullTicketUrl((prevUrl) => {
            const newSlug = formData.slug;
            const baseUrl = prevUrl.replace(/\/register\/[^/]+$/, "");
            return `${baseUrl}/register/${newSlug}`;
          });
        }, 100);

        setIsEditing(false);
      } else {
        throw new Error(response?.data?.message || "Failed to update ticket");
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast.error(error.message || "Failed to update ticket title");
      // Reset to original title on error
      setTempTitle(rowData?.data?.title || "Untitled Form");
    } finally {
      setIsSaving(false);
    }
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
    <div className="flex items-center justify-between w-full">
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
                disabled={isSaving}
              />
              <button onClick={handleSave} className="p-1 text-[rgb(99,102,241)] hover:bg-[rgb(238,242,255)] rounded-md transition-colors" title="Save" disabled={isSaving}>
                {isSaving ? <div className="w-4 h-4 border-2 border-[rgb(99,102,241)] border-t-transparent rounded-full animate-spin"></div> : <Check className="w-4 h-4" />}
              </button>
              <button onClick={handleCancel} className="p-1 text-gray-500 hover:bg-gray-50 rounded-md transition-colors" title="Cancel" disabled={isSaving}>
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div onClick={() => setIsEditing(true)} className="text-base font-semibold text-[rgb(17,24,39)] cursor-pointer group flex items-center gap-2">
              <span>{rowData?.data?.title || "Untitled Form"}</span>
              <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">(click to edit)</span>
            </div>
          )}
          <div className="flex items-center gap-0 mt-1">
            {/* Display the full ticket registration URL */}
            {isLoading ? (
              <span className="text-sm text-gray-400">Loading URL...</span>
            ) : fullTicketUrl ? (
              <>
                <span className="text-sm text-gray-700 font-inter">{fullTicketUrl}</span>
                <button onClick={handleCopy} className="p-1 text-gray-500 hover:bg-gray-50 rounded-md transition-colors ml-2" title="Copy URL">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button onClick={redirectToTicket} className="p-1 text-gray-500 hover:bg-gray-50 rounded-md transition-colors ml-2" title="Open Link">
                  <ExternalLinkIcon className="w-4 h-4" />
                </button>
              </>
            ) : (
              <span className="text-sm text-gray-400">No URL available</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventFormHeader;
