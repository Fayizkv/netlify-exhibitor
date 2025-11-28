import { useState } from "react";

// Slider Component
export const Slider = ({ value, min, max, step, onValueChange, className }) => {
  return (
    <div className={`relative ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={(e) => onValueChange([parseInt(e.target.value)])}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((value[0] - min) / (max - min)) * 100}%, #e5e7eb ${((value[0] - min) / (max - min)) * 100}%, #e5e7eb 100%)`,
        }}
      />
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

// Tabs Components
export const Tabs = ({ defaultValue, onValueChange, children }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleChange = (value) => {
    setActiveTab(value);
    onValueChange?.(value);
  };

  return (
    <div data-active-tab={activeTab} onChange={handleChange}>
      {children}
    </div>
  );
};

export const TabsList = ({ children, className }) => <div className={className}>{children}</div>;

export const TabsTrigger = ({ value, children, className }) => {
  const handleClick = () => {
    const tabsContainer = document.querySelector("[data-active-tab]");
    if (tabsContainer) {
      const event = new CustomEvent("change");
      tabsContainer.setAttribute("data-active-tab", value);
      tabsContainer.dispatchEvent(event);
      tabsContainer.onChange?.(value);
    }
  };

  return (
    <button type="button" onClick={handleClick} className={className} data-value={value}>
      {children}
    </button>
  );
};

// Sample Images Data
export const sampleImages = [
  {
    id: 1,
    name: "Landscape Sample",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    orientation: "landscape",
  },
  {
    id: 2,
    name: "Portrait Sample",
    url: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=600&h=800&fit=crop",
    orientation: "portrait",
  },
  {
    id: 3,
    name: "Square Sample",
    url: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=600&h=600&fit=crop",
    orientation: "square",
  },
];
