import React, { useState, useEffect, useMemo, useRef } from "react";
import { ChevronDown, Globe, RotateCcw, Clock } from "lucide-react";

const STORAGE_KEY = "app_timezone_override";

// Simple timezone override - just store the preference
const getStoredTimezone = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    return null;
  }
};

const setStoredTimezone = (timezone) => {
  try {
    if (timezone) {
      localStorage.setItem(STORAGE_KEY, timezone);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.warn("Failed to store timezone preference");
  }
};

// Alternative/historical names for cities
const getAlternativeNames = () => ({
  Kolkata: ["Calcutta", "India"],
  Mumbai: ["Bombay", "India"],
  Chennai: ["Madras", "India"],
  Delhi: ["New Delhi", "India"],
  Ho_Chi_Minh: ["Saigon", "Vietnam"],
  Istanbul: ["Constantinople", "Turkey"],
  Beijing: ["Peking", "China"],
  Shanghai: ["China"],
  Tokyo: ["Japan"],
  Seoul: ["Korea", "South Korea"],
  Bangkok: ["Thailand"],
  Singapore: ["SG"],
  Hong_Kong: ["HK", "Hong Kong"],
  Taipei: ["Taiwan"],
  Manila: ["Philippines"],
  Jakarta: ["Indonesia"],
  Dubai: ["UAE", "United Arab Emirates"],
  Riyadh: ["Saudi Arabia"],
  New_York: ["NYC", "New York City", "Eastern", "EST", "EDT"],
  Los_Angeles: ["LA", "Los Angeles", "Pacific", "PST", "PDT", "California"],
  Chicago: ["Central", "CST", "CDT"],
  Denver: ["Mountain", "MST", "MDT"],
  Phoenix: ["Arizona", "MST"],
  London: ["UK", "Britain", "GMT", "BST", "England"],
  Paris: ["France", "CET", "CEST"],
  Berlin: ["Germany", "CET", "CEST"],
  Rome: ["Italy", "CET", "CEST"],
  Madrid: ["Spain", "CET", "CEST"],
  Amsterdam: ["Netherlands", "CET", "CEST"],
  Brussels: ["Belgium", "CET", "CEST"],
  Zurich: ["Switzerland", "CET", "CEST"],
  Vienna: ["Austria", "CET", "CEST"],
  Stockholm: ["Sweden", "CET", "CEST"],
  Oslo: ["Norway", "CET", "CEST"],
  Copenhagen: ["Denmark", "CET", "CEST"],
  Helsinki: ["Finland", "EET", "EEST"],
  Moscow: ["Russia", "MSK"],
  Sao_Paulo: ["São Paulo", "Sao Paulo", "Brazil"],
  Mexico_City: ["Mexico DF", "CDMX", "Mexico"],
  Buenos_Aires: ["Buenos Aires", "Argentina"],
  Rio_de_Janeiro: ["Rio", "Brazil"],
  Santiago: ["Santiago de Chile", "Chile"],
  Lima: ["Peru"],
  Bogota: ["Colombia"],
  Caracas: ["Venezuela"],
  Godthab: ["Nuuk", "Greenland"],
  Rangoon: ["Yangon", "Myanmar"],
  Calcutta: ["Kolkata", "India"],
  Bombay: ["Mumbai", "India"],
  Madras: ["Chennai", "India"],
  Saigon: ["Ho Chi Minh", "Vietnam"],
  Peking: ["Beijing", "China"],
});

// Get available timezones grouped by region
const getGroupedTimezones = () => {
  const alternativeNames = getAlternativeNames();

  try {
    const timezones = Intl.supportedValuesOf("timeZone");
    const grouped = {};

    timezones.forEach((tz) => {
      const parts = tz.split("/");
      const region = parts[0];
      const city = parts.slice(1).join("/");
      const cityDisplay = city ? city.replace(/_/g, " ") : tz;

      if (!grouped[region]) {
        grouped[region] = [];
      }

      // Create search terms including alternative names
      const searchTerms = [
        tz, // Full timezone name
        tz.replace(/_/g, " "), // Spaced version
        cityDisplay, // City name
        region, // Region name
      ];

      // Add alternative names
      const cityKey = city.replace(/ /g, "_");
      if (alternativeNames[cityKey]) {
        searchTerms.push(...alternativeNames[cityKey]);
      }

      grouped[region].push({
        value: tz,
        label: cityDisplay,
        fullLabel: tz.replace(/_/g, " "),
        searchTerms: searchTerms.join(" ").toLowerCase(),
      });
    });

    // Sort regions and cities
    Object.keys(grouped).forEach((region) => {
      grouped[region].sort((a, b) => a.label.localeCompare(b.label));
    });

    return grouped;
  } catch (error) {
    console.warn("Intl.supportedValuesOf not supported, using fallback timezones");
    // Fallback for older browsers
    return {
      UTC: [
        {
          value: "UTC",
          label: "UTC",
          fullLabel: "UTC",
          searchTerms: "utc coordinated universal time",
        },
      ],
      America: [
        { value: "America/New_York", label: "New York", fullLabel: "America/New York", searchTerms: "america/new_york new york nyc new york city eastern" },
        { value: "America/Los_Angeles", label: "Los Angeles", fullLabel: "America/Los Angeles", searchTerms: "america/los_angeles los angeles la pacific" },
        { value: "America/Chicago", label: "Chicago", fullLabel: "America/Chicago", searchTerms: "america/chicago chicago central" },
      ],
      Europe: [
        { value: "Europe/London", label: "London", fullLabel: "Europe/London", searchTerms: "europe/london london uk britain gmt" },
        { value: "Europe/Paris", label: "Paris", fullLabel: "Europe/Paris", searchTerms: "europe/paris paris france cet" },
        { value: "Europe/Berlin", label: "Berlin", fullLabel: "Europe/Berlin", searchTerms: "europe/berlin berlin germany cet" },
      ],
      Asia: [
        { value: "Asia/Tokyo", label: "Tokyo", fullLabel: "Asia/Tokyo", searchTerms: "asia/tokyo tokyo japan jst" },
        { value: "Asia/Shanghai", label: "Shanghai", fullLabel: "Asia/Shanghai", searchTerms: "asia/shanghai shanghai china cst" },
        { value: "Asia/Kolkata", label: "Kolkata", fullLabel: "Asia/Kolkata", searchTerms: "asia/kolkata kolkata calcutta india ist" },
      ],
    };
  }
};

// Get browser timezone
const getBrowserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    return "UTC";
  }
};

// Format timezone with current time
const formatTimezoneWithTime = (timezone) => {
  try {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const abbr = now
      .toLocaleDateString("en-US", {
        timeZone: timezone,
        timeZoneName: "short",
      })
      .split(", ")[1];

    return `${timezone.replace(/_/g, " ")} - ${time} ${abbr}`;
  } catch (error) {
    return timezone.replace(/_/g, " ");
  }
};

const TimezoneSelector = ({ label = "Timezone", placeholder = "Select timezone...", className = "", onChange, showCurrentTime = true, compact = false }) => {
  const [selectedTimezone, setSelectedTimezone] = useState(getStoredTimezone() || getBrowserTimezone());
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const dropdownRef = useRef(null);

  const timezoneGroups = useMemo(() => getGroupedTimezones(), []);

  // Update current time every minute
  useEffect(() => {
    if (!showCurrentTime || !selectedTimezone) return;

    const updateTime = () => {
      try {
        setCurrentTime(
          new Date().toLocaleTimeString("en-US", {
            timeZone: selectedTimezone,
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        );
      } catch (error) {
        setCurrentTime("");
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [selectedTimezone, showCurrentTime]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize from localStorage on mount
  useEffect(() => {
    const stored = getStoredTimezone();
    if (stored && stored !== selectedTimezone) {
      setSelectedTimezone(stored);
    }
  }, []);

  const handleTimezoneSelect = (timezone) => {
    setSelectedTimezone(timezone);
    setStoredTimezone(timezone);
    setIsOpen(false);
    setSearchTerm("");
    onChange?.(timezone);
  };

  const handleReset = () => {
    const browserTz = getBrowserTimezone();
    setSelectedTimezone(browserTz);
    setStoredTimezone(null);
    setIsOpen(false);
    setSearchTerm("");
    onChange?.(null);
  };

  // Filter timezones based on search
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return timezoneGroups;

    const filtered = {};
    const term = searchTerm.toLowerCase();

    Object.entries(timezoneGroups).forEach(([region, zones]) => {
      const matchedZones = zones.filter((zone) => zone.searchTerms.includes(term));

      if (matchedZones.length > 0) {
        filtered[region] = matchedZones;
      }
    });

    return filtered;
  }, [timezoneGroups, searchTerm]);

  const displayText = selectedTimezone ? selectedTimezone.replace(/_/g, " ") : "Select timezone";
  const isStoredTimezone = getStoredTimezone() === selectedTimezone;

  if (compact) {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50">
          <Clock className="w-3 h-3 text-gray-500" />
          <span className="truncate max-w-[100px]">{selectedTimezone ? selectedTimezone.split("/")[1]?.replace(/_/g, " ") || selectedTimezone : "Timezone"}</span>
          {getStoredTimezone() && <span className="px-1 text-xs bg-blue-500 text-white rounded">Override</span>}
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>

        {isOpen && (
          <ul className="absolute z-50 w-72 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
            <li className="p-3 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search timezones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </li>

            {!searchTerm && (
              <>
                <li
                  onClick={() => handleTimezoneSelect(getBrowserTimezone())}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 ${
                    !selectedTimezone || selectedTimezone === getBrowserTimezone() ? "bg-blue-50 text-blue-700" : "text-gray-900"
                  }`}
                >
                  <span>Browser Default</span>
                  {(!selectedTimezone || selectedTimezone === getBrowserTimezone()) && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                </li>
                {getStoredTimezone() && (
                  <li onClick={handleReset} className="px-4 py-2 cursor-pointer hover:bg-gray-50 flex items-center gap-2 text-gray-600 border-b border-gray-200">
                    <RotateCcw className="w-3 h-3" />
                    <span className="text-sm">Reset to browser default</span>
                  </li>
                )}
              </>
            )}

            <div className="max-h-64 overflow-y-auto">
              {Object.entries(filteredGroups).map(([region, timezones]) => (
                <div key={region}>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">{region}</div>
                  {timezones.map((timezone) => (
                    <li
                      key={timezone.value}
                      onClick={() => handleTimezoneSelect(timezone.value)}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${selectedTimezone === timezone.value ? "bg-blue-50 text-blue-700" : "text-gray-900"}`}
                    >
                      <span>{timezone.label}</span>
                      {selectedTimezone === timezone.value && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                    </li>
                  ))}
                </div>
              ))}

              {Object.keys(filteredGroups).length === 0 && <li className="px-4 py-3 text-gray-500 text-center text-sm">No timezones found matching "{searchTerm}"</li>}
            </div>
          </ul>
        )}
      </div>
    );
  }

  // Full version (unchanged for backward compatibility)
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-gray-500" />
            <div className="text-left">
              <div className="font-medium text-gray-900">{displayText}</div>
              {showCurrentTime && currentTime && (
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {currentTime}
                </div>
              )}
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search timezones (e.g., Calcutta, India, EST)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="max-h-80 overflow-y-auto">
              <div className="p-2 border-b border-gray-100">
                <button onClick={handleReset} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                  <RotateCcw className="w-4 h-4" />
                  <div>
                    <div className="font-medium">Reset to Browser Timezone</div>
                    <div className="text-xs text-gray-500">{formatTimezoneWithTime(getBrowserTimezone())}</div>
                  </div>
                </button>
              </div>

              {Object.entries(filteredGroups).length === 0 ? (
                <div className="p-4 text-center text-gray-500">No timezones found matching "{searchTerm}"</div>
              ) : (
                Object.entries(filteredGroups).map(([region, zones]) => (
                  <div key={region} className="p-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 rounded-md mb-1">{region}</div>
                    <div className="space-y-1">
                      {zones.map((zone) => (
                        <button
                          key={zone.value}
                          onClick={() => handleTimezoneSelect(zone.value)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                            selectedTimezone === zone.value ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span>{zone.label}</span>
                            {showCurrentTime && (
                              <span className="text-xs text-gray-500">
                                {new Date().toLocaleTimeString("en-US", {
                                  timeZone: zone.value,
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {isStoredTimezone && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
          <Globe className="w-4 h-4 flex-shrink-0" />
          <span>Global timezone override active</span>
        </div>
      )}
    </div>
  );
};

// Hook to use the stored timezone preference
export const useTimezone = () => {
  const [timezone, setTimezone] = useState(getStoredTimezone());

  useEffect(() => {
    const handleStorageChange = () => {
      setTimezone(getStoredTimezone());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const formatInTimezone = (date, options = {}) => {
    const targetTimezone = timezone || getBrowserTimezone();

    try {
      return new Date(date).toLocaleString("en-US", {
        ...options,
        timeZone: targetTimezone,
      });
    } catch (error) {
      return new Date(date).toLocaleString("en-US", options);
    }
  };

  return {
    timezone,
    isActive: !!timezone,
    formatInTimezone,
    browserTimezone: getBrowserTimezone(),
  };
};

// Export components
export const CompactTimezoneSelector = (props) => <TimezoneSelector {...props} compact />;

export { TimezoneSelector };
export default TimezoneSelector;
