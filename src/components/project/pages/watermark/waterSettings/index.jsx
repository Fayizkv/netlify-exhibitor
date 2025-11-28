import { useState, useEffect } from "react";
import { Info, Plus, UploadCloud, Bold, Italic } from "lucide-react";
import { Slider, sampleImages } from "../uicompoents";
import { useWatermark } from "../../../../../contexts/watermarkContext";

const WatermarkSettings = () => {
  const {
    watermarkType,
    setWatermarkType,
    opacity,
    setOpacity,
    scale,
    setScale,
    setWatermarkImage,
    watermarkText,
    setWatermarkText,
    textColor,
    setTextColor,
    textBackgroundColor,
    setTextBackgroundColor,
    textSize,
    setTextSize,
    textWeight,
    setTextWeight,
    textStyle,
    setTextStyle,
  } = useWatermark();

  const [selectedImage, setSelectedImage] = useState(1);
  const [activeTab, setActiveTab] = useState("image");

  useEffect(() => {
    setWatermarkType(activeTab);
  }, [activeTab, setWatermarkType]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-800">Watermark Settings</h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Watermark Source */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Source</h3>
          <div className="flex border-b border-gray-200 mb-3">
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "image" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("image")}
            >
              Image
            </button>
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "text" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("text")}
            >
              Text
            </button>
          </div>

          <div>
            {activeTab === "image" ? (
              <>
                <input
                  type="file"
                  id="watermark-upload"
                  accept="image/png, image/jpeg, image/jpg, image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          setWatermarkImage(event.target.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <button
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
                  onClick={() => document.getElementById("watermark-upload")?.click()}
                >
                  <UploadCloud className="w-4 h-4 mr-2" />
                  Choose file
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">Supports: PNG, JPG, JPEG, SVG</p>
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <label htmlFor="watermark-text" className="block text-sm font-medium text-gray-700 mb-1">
                    Watermark Text
                  </label>
                  <input
                    type="text"
                    id="watermark-text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter text for watermark"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                  />
                </div>

                {/* Font Size */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">Font Size</label>
                    <span className="text-sm text-gray-500">{textSize}px</span>
                  </div>
                  <Slider value={[textSize]} min={10} max={72} step={1} onValueChange={(value) => setTextSize(value[0])} className="py-2" />
                </div>

                {/* Colors */}
                <div className="space-y-3">
                  {/* Text Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                    <div className="flex items-center space-x-2">
                      <input type="color" id="text-color" className="w-10 h-10 rounded border border-gray-200 cursor-pointer" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
                      <input type="text" value={textColor} className="flex-grow px-3 py-2 border border-gray-200 rounded-md" onChange={(e) => setTextColor(e.target.value)} />
                    </div>
                  </div>

                  {/* Background Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        id="background-color"
                        className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                        value={textBackgroundColor}
                        onChange={(e) => setTextBackgroundColor(e.target.value)}
                      />
                      <input type="text" value={textBackgroundColor} className="flex-grow px-3 py-2 border border-gray-200 rounded-md" onChange={(e) => setTextBackgroundColor(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Text Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text Style</label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      className={`p-2 border rounded-md flex items-center justify-center ${textWeight === "bold" ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "border-gray-200 text-gray-500"}`}
                      onClick={() => setTextWeight(textWeight === "bold" ? "normal" : "bold")}
                    >
                      <Bold className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      className={`p-2 border rounded-md flex items-center justify-center ${
                        textStyle === "italic" ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "border-gray-200 text-gray-500"
                      }`}
                      onClick={() => setTextStyle(textStyle === "italic" ? "normal" : "italic")}
                    >
                      <Italic className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Position Info */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Position</h3>
          <div className="bg-indigo-50 text-indigo-700 p-3 rounded-md text-sm">
            <p className="flex items-start">
              <Info className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>Drag and drop the watermark on the preview image to set its position.</span>
            </p>
          </div>
        </div>

        {/* Appearance */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-4">Appearance</h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Opacity</label>
                <span className="text-sm text-gray-500">{opacity}%</span>
              </div>
              <Slider value={[opacity]} min={0} max={100} step={1} onValueChange={(value) => setOpacity(value[0])} className="py-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Scale</label>
                <span className="text-sm text-gray-500">{scale}%</span>
              </div>
              <Slider value={[scale]} min={5} max={50} step={1} onValueChange={(value) => setScale(value[0])} className="py-2" />
            </div>
          </div>
        </div>

        {/* Preview Images */}
        {/* <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">Preview Image</h3>
          <div className="space-y-2">
            {sampleImages.map((image) => (
              <div 
                key={image.id}
                className={`flex items-center p-2 rounded-md border cursor-pointer transition-all ${
                  selectedImage === image.id 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-transparent hover:bg-gray-50'
                }`}
                onClick={() => setSelectedImage(image.id)}
              >
                <img 
                  src={image.url} 
                  className="w-10 h-8 object-cover rounded-sm mr-3" 
                  alt={image.name}
                />
                <span className={`text-sm font-medium ${
                  selectedImage === image.id ? 'text-indigo-700' : 'text-gray-600'
                }`}>
                  {image.name}
                </span>
              </div>
            ))}
            
            <button className="w-full flex items-center justify-center px-4 py-2 mt-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Add your photo
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default WatermarkSettings;
