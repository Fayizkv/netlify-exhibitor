import { useState, useEffect, useRef } from "react";
import { SketchPicker } from "react-color";
import chroma from "chroma-js";
import ColorThief from "colorthief";
import { getData, postData } from "../../../../backend/api";
import { noimage } from "../../../../images";
import { Droplet, Copy, Check, Palette } from "lucide-react";

const ColorPicker = (props) => {
  const [primaryColour, setPrimaryColour] = useState("");
  const [colorShades, setColorShades] = useState({});
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [copiedColor, setCopiedColor] = useState("");
  const [eyedropperSupported, setEyedropperSupported] = useState(false);
  const [suggestedColors, setSuggestedColors] = useState([]);
  const pickerRef = useRef(null);
  const bannerRef = useRef(null);

  useEffect(() => {
    // Check if EyeDropper API is supported
    setEyedropperSupported(typeof window !== "undefined" && window.EyeDropper !== undefined);
  }, []);

  useEffect(() => {
    // Set suggested colors from event model
    if (props.openData.data.suggestedColors) {
      setSuggestedColors(props.openData.data.suggestedColors);
    }
  }, [props.openData.data.suggestedColors]);

  useEffect(() => {
    const extractColors = async () => {
      if (!bannerRef.current) return;

      try {
        const colorThief = new ColorThief();
        const img = bannerRef.current;

        // Wait for image to load
        if (!img.complete) {
          await new Promise((resolve) => {
            img.onload = resolve;
          });
        }

        // Get dominant colors
        const palette = colorThief.getPalette(img, 5);
        const colors = palette.map((color) => {
          const [r, g, b] = color;
          return `#${[r, g, b]
            .map((x) => {
              const hex = x.toString(16);
              return hex.length === 1 ? "0" + hex : hex;
            })
            .join("")}`;
        });

        setSuggestedColors(colors);

        // Save colors to event
        try {
          const response = await postData(
            {
              imageUrl: import.meta.env.VITE_CDN + props.openData.data.banner,
              eventId: props.openData.data._id,
            },
            "event/extract-colors"
          );

          if (response.status === 200) {
            console.log("Colors saved to event:", response.data.colors);
          }
        } catch (error) {
          console.error("Error saving colors to event:", error);
        }
      } catch (error) {
        console.error("Error extracting colors:", error);
      }
    };

    extractColors();
  }, [props.openData.data.banner, props.openData.data._id]);

  useEffect(() => {
    const fetchInitialColors = async () => {
      try {
        const response = await getData({ event: props.openData.data._id }, "app-setting");
        if (response.data.response.length > 0) {
          const colorData = response.data.response[0];
          setPrimaryColour(colorData.primaryColour);
          setColorShades({
            primaryDarker: colorData.primaryDarker,
            primaryDark: colorData.primaryDark,
            primaryBase: colorData.primaryBase,
            primaryLighter: colorData.primaryLighter,
            primaryLightest: colorData.primaryLightest,
          });
        }
      } catch (error) {
        console.error("Error fetching initial colors:", error);
      }
    };

    fetchInitialColors();
  }, [props.openData.data._id]);

  const generateShades = (color) => {
    const primaryDarker = chroma(color).darken(2.2).desaturate(0.3).hex();
    const primaryDark = chroma(color).darken(1).desaturate(0.1).hex();
    const primaryBase = chroma(color).hex();
    const primaryLighter = chroma(color).brighten(1.8).mix("white", 0.4).hex();
    const primaryLightest = chroma(color).brighten(2.2).mix("white", 0.6).hex();

    setColorShades({
      primaryDarker,
      primaryDark,
      primaryBase,
      primaryLighter,
      primaryLightest,
    });
  };

  const handlePrimaryColorChange = (color) => {
    const selectedColor = color.hex;
    setPrimaryColour(selectedColor);
    generateShades(selectedColor);
  };

  const handleSave = async () => {
    try {
      const payload = {
        event: props.openData.data._id,
        primaryColour,
        ...colorShades,
      };
      const response = await postData(payload, "app-setting");
      if (response.status === 200) {
        props.setMessage({
          type: 1,
          content: "Color settings saved successfully!",
          proceed: "Okay",
          icon: "success",
        });
      }
    } catch (error) {
      props.setMessage({
        type: 1,
        content: "Failed to save color settings",
        proceed: "Okay",
        icon: "error",
      });
    }
  };

  const handleCopyColor = (color) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(""), 2000);
  };

  const handleEyedropper = async () => {
    if (!eyedropperSupported) {
      props.setMessage({
        type: 1,
        content: "Color picker is not supported in your browser. Please use the color picker instead.",
        proceed: "Okay",
        icon: "error",
      });
      return;
    }

    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      handlePrimaryColorChange({ hex: result.sRGBHex });
    } catch (error) {
      console.error("Error using eyedropper:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pickerRef]);

  return (
    <div className="w-full">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Banner */}
          <div className="lg:sticky lg:top-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Event Banner</h3>
              <div className="aspect-[16/9] relative overflow-hidden rounded-md bg-black">
                <img
                  ref={bannerRef}
                  src={import.meta.env.VITE_CDN + props.openData.data.banner}
                  onError={(e) => {
                    e.target.src = noimage;
                  }}
                  alt="Event Banner"
                  className="w-full h-full object-contain bg-white"
                />
              </div>
              {suggestedColors.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="w-4 h-4 text-gray-500" />
                    <h4 className="text-xs font-medium text-gray-500">Suggested Colors</h4>
                  </div>
                  <div className="flex gap-2">
                    {suggestedColors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => handlePrimaryColorChange({ hex: color })}
                        className="w-8 h-8 rounded-md border-2 border-gray-200 hover:border-gray-300 transition-colors"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Color Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-gray-900">Primary Color</h3>
              <div className="flex items-center gap-2">
                {eyedropperSupported && (
                  <button onClick={handleEyedropper} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                    <Droplet className="w-3.5 h-3.5" />
                    Pick from Banner
                  </button>
                )}
              </div>
            </div>

            <div className="relative" ref={pickerRef}>
              <div className="flex items-center gap-3">
                <div
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="flex-1 h-12 rounded-md cursor-pointer border border-gray-200 hover:border-gray-300 transition-colors"
                  style={{ backgroundColor: primaryColour || "#eee" }}
                />
                {primaryColour && (
                  <button
                    onClick={() => handleCopyColor(primaryColour)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    {copiedColor === primaryColour ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                )}
              </div>
              {showColorPicker && (
                <div className="absolute mt-2 z-50">
                  <SketchPicker color={primaryColour} onChangeComplete={handlePrimaryColorChange} />
                </div>
              )}
            </div>

            {primaryColour && (
              <div className="mt-6">
                <h4 className="text-xs font-medium text-gray-500 mb-3">Color Palette</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2.5 p-3 rounded-md bg-gray-50 border border-gray-100">
                    <div className="w-8 h-8 rounded-md border border-gray-200" style={{ backgroundColor: primaryColour }} />
                    <div>
                      <div className="text-xs font-medium text-gray-900">Primary</div>
                      <div className="font-mono text-xs text-gray-500">{primaryColour}</div>
                    </div>
                  </div>
                  {Object.entries(colorShades).map(([name, color]) => (
                    <div key={name} className="flex items-center gap-2.5 p-3 rounded-md bg-gray-50 border border-gray-100">
                      <div className="w-8 h-8 rounded-md border border-gray-200" style={{ backgroundColor: color }} />
                      <div>
                        <div className="text-xs font-medium text-gray-900">{name}</div>
                        <div className="font-mono text-xs text-gray-500">{color}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSave}
                disabled={!primaryColour}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors
                  ${primaryColour ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"}`}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
