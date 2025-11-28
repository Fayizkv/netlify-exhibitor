import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Copy, ExternalLink, Link, Check, AlertCircle } from "lucide-react";
import { getData } from "../../../../../../backend/api";

const AvTeamUrlBox = ({ eventId: propEventId }) => {
  const [url, setUrl] = useState("Loading...");
  const [copyState, setCopyState] = useState({ status: 'idle', message: '' }); // idle, success, error
  const linkRef = useRef(null);
  const textAreaRef = useRef(null);

  // Get current event from Redux state as fallback
  const openData = useSelector((state) => state.openData);
  const currentEvent = openData?.data;
  const actualEventId = propEventId || currentEvent?._id;

  const generateUrl = async (evId) => {
    console.log("generateUrl called with eventId:", evId);
    if (!evId) {
      console.log("No eventId provided to generateUrl");
      setUrl("No event ID available");
      return;
    }

    try {
      // Helper function to extract default eventhex domain
      const extractDefaultEventhexDomain = (domains) => {
        if (!Array.isArray(domains)) return null;
        const match = domains.find((d) => (d?.appType === "eventhex" || d?.route === "eventhex") && d?.isDefault === true && typeof d?.domain === "string" && d?.domain?.length > 0);
        return match ? match.domain : null;
      };

      // Helper function to get cached domain
      const getCachedEventDomain = (eventId) => {
        try {
          return localStorage.getItem(`eventhex:domain:${eventId}`);
        } catch (e) {
          return null;
        }
      };

      // Helper function to cache domain
      const cacheEventDomain = (eventId, domain) => {
        try {
          if (eventId && domain) {
            localStorage.setItem(`eventhex:domain:${eventId}`, domain);
          }
        } catch (e) {}
      };

      // Check cache first
      const cachedDomain = getCachedEventDomain(evId);
      console.log("Cached domain:", cachedDomain);

      if (cachedDomain) {
        const websiteUrl = cachedDomain.includes("http") ? cachedDomain : `https://${cachedDomain}`;
        setUrl(`${websiteUrl}/av`);
        return;
      }

      // If not cached, fetch and cache for future use
      const domainRes = await getData({ event: evId }, "whitelisted-domains");
      console.log("Domain response:", domainRes);

      if (domainRes?.status === 200) {
        const defaultDomain = extractDefaultEventhexDomain(domainRes?.data?.response || []);
        console.log("Default domain:", defaultDomain);

        if (defaultDomain) {
          cacheEventDomain(evId, defaultDomain);
          const websiteUrl = defaultDomain.includes("http") ? defaultDomain : `https://${defaultDomain}`;
          setUrl(`${websiteUrl}/av`);
        } else {
          // Fallback to regular website URL if no default domain is set
          const res = await getData({ id: evId }, "event/website");
          console.log("Website response:", res);

          if (res?.status === 200 && res?.data?.data) {
            const websiteUrl = res.data.data.includes("http") ? res.data.data : `https://${res.data.data}`;
            cacheEventDomain(evId, websiteUrl);
            setUrl(`${websiteUrl}/av`);
          } else {
            setUrl("example.com/av");
          }
        }
      } else {
        setUrl("example.com/av");
      }
    } catch (e) {
      console.error("Error generating URL:", e);
      setUrl("example.com/av");
    }
  };

  useEffect(() => {
    console.log("AvTeamUrlBox - eventId:", actualEventId);
    if (actualEventId) {
      generateUrl(actualEventId);
    } else {
      console.log("AvTeamUrlBox - No eventId available");
      setUrl("No event ID available");
    }
  }, [actualEventId]);

  // Enhanced copy function with multiple fallbacks
  const handleCopyUrl = (e) => {
    e.stopPropagation();
    
    if (!url || url === "Loading..." || url === "No event ID available") {
      return;
    }

    // Create a hidden textarea for fallback
    if (!textAreaRef.current) {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textAreaRef.current = textArea;
    } else {
      textAreaRef.current.value = url;
    }

    // Try the Clipboard API first
    const copyWithAPI = () => {
      return navigator.clipboard.writeText(url)
        .then(() => {
          setCopyState({ status: 'success', message: 'Copied!' });
          return true;
        })
        .catch(err => {
          console.warn('Clipboard API failed:', err);
          return false;
        });
    };

    // Fallback using execCommand
    const copyWithExecCommand = () => {
      try {
        textAreaRef.current.select();
        const success = document.execCommand('copy');
        if (success) {
          setCopyState({ status: 'success', message: 'Copied!' });
          return true;
        }
        return false;
      } catch (err) {
        console.warn('execCommand failed:', err);
        return false;
      }
    };

    // Try another approach - select the text in the visible element
    const copyWithSelection = () => {
      try {
        if (linkRef.current) {
          const range = document.createRange();
          range.selectNodeContents(linkRef.current);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          const success = document.execCommand('copy');
          if (success) {
            setCopyState({ status: 'success', message: 'Copied!' });
            return true;
          }
        }
        return false;
      } catch (err) {
        console.warn('Selection copy failed:', err);
        return false;
      }
    };

    // Try all methods in sequence
    copyWithAPI().then(success => {
      if (!success && !copyWithExecCommand() && !copyWithSelection()) {
        setCopyState({ 
          status: 'error', 
          message: 'Select and copy manually (Ctrl+C/⌘+C)' 
        });
        
        // Select the text to make it easier for manual copying
        if (linkRef.current) {
          const range = document.createRange();
          range.selectNodeContents(linkRef.current);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    });

    // Reset state after delay
    setTimeout(() => {
      setCopyState({ status: 'idle', message: '' });
    }, 3000);
  };

  const handleOpenLink = (e) => {
    e.stopPropagation();
    if (url && url !== "Loading..." && url !== "No event ID available" && url !== "example.com/av") {
      const fullUrl = url.includes("http") ? url : `https://${url}`;
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
    }
  };
  
  const handleDoubleClick = () => {
    if (linkRef.current) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(linkRef.current);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (textAreaRef.current && document.body.contains(textAreaRef.current)) {
        document.body.removeChild(textAreaRef.current);
        textAreaRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full">
      <div className="text-sm font-medium text-text-main mb-2">AV Team Access URL</div>
      <p className="text-xs text-text-sub mb-3">Share this URL with your AV team to access their assigned sessions</p>
      
      <div className="group relative bg-bg-weak border border-stroke-soft rounded-lg px-3 py-2 transition-all duration-300 ease-in-out hover:bg-bg-white hover:border-primary-base hover:shadow-md">
        <div className="flex items-center gap-3">
          <Link className="w-4 h-4 text-text-soft group-hover:text-primary-base transition-colors duration-300 flex-shrink-0" />
          
          <div 
            className="flex-1 min-w-0 overflow-x-auto scroll-container"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#a0aec0 #edf2f7' }}
          >
            <style>{`
              .scroll-container::-webkit-scrollbar { height: 4px; }
              .scroll-container::-webkit-scrollbar-track { background: #f7fafc; }
              .scroll-container::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 2px; }
              .group:hover .scroll-container::-webkit-scrollbar-thumb { background: #a0aec0; }
            `}</style>
            <div>
              <span 
                ref={linkRef}
                className="text-sm font-mono text-text-main whitespace-nowrap select-text cursor-text block"
                onDoubleClick={handleDoubleClick}
                title="Drag to scroll or double-click to select all"
              >
                {url}
              </span>
            </div>
          </div>
          
          {/* Status Display (Success or Error) */}
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center">
            {/* Show status message if there is one */}
            <div 
              className={`transition-all duration-300 ease-in-out ${
                copyState.status !== 'idle' ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
              }`}
            >
              <div 
                className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-md ${
                  copyState.status === 'success' 
                    ? 'bg-state-success text-white' 
                    : 'bg-state-warning text-white'
                }`}
              >
                {copyState.status === 'success' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span>{copyState.message}</span>
              </div>
            </div>

            {/* Show action buttons if status is idle */}
            <div 
              className={`absolute right-0 flex items-center gap-1 transition-all duration-300 ease-in-out 
                ${copyState.status !== 'idle' 
                  ? 'opacity-0 scale-90' 
                  : 'opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
                }`}
            >
              <div className="flex items-center gap-1 bg-bg-white/50 backdrop-blur-sm border border-stroke-soft rounded-md p-1 shadow-sm">
                <button 
                  onClick={handleCopyUrl}
                  className="p-1.5 rounded-md hover:bg-primary-light transition-colors" 
                  title="Copy link"
                  aria-label="Copy link to clipboard"
                >
                  <Copy className="w-4 h-4 text-text-sub hover:text-primary-base" />
                </button>
                
                <button 
                  onClick={handleOpenLink}
                  className="p-1.5 rounded-md hover:bg-state-success transition-colors" 
                  title="Open link"
                  aria-label="Open link in new tab"
                >
                  <ExternalLink className="w-4 h-4 text-text-sub hover:text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvTeamUrlBox;
