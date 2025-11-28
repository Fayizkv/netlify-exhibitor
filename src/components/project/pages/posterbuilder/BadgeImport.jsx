import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getData } from "../../../../backend/api";

const BadgeImport = ({ onClose, onImport }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await getData({}, "badge-template");
      if (response?.data?.response) {
        // Only use the first 6 templates
        const filteredTemplates = response.data.response.slice(0, 6).map((template) => ({
          id: template._id,
          size: `${template.width} x ${template.height} inch`,
          design: template.templateName,
          image: `${import.meta.env.VITE_CDN}${template.templateImage}`,
          side: "front", // All are front side
          templateData: template,
        }));
        setTemplates(filteredTemplates);
      }
    } catch (err) {
      console.error("Error fetching badge templates:", err);
      setError("Failed to load badge templates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateClick = (template) => {
    if (onImport) {
      onImport(template);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Modal with fixed header and scrollable content */}
      <div className="bg-white rounded-xl max-w-5xl w-full h-[95vh] flex flex-col">
        {/* Fixed Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-800">Badge Template</h1>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close modal">
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-600 min-h-[400px] flex items-center justify-center">{error}</div>
            ) : (
              <>
                {/* Template Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center min-h-[400px]">
                  {templates.map((template) => (
                    <div key={template.id} className="group cursor-pointer w-full max-w-xs h-full" onClick={() => handleTemplateClick(template)}>
                      <div className="bg-gray-50 rounded-lg p-4 hover:shadow-lg transition-all duration-200 hover:scale-105 relative h-full flex flex-col">
                        {/* Template Image - Fixed Height */}
                        <div className="h-48 mb-3 overflow-hidden rounded-md bg-gray-200 flex items-center justify-center">
                          <img
                            src={template.image}
                            alt={`Badge ${template.side} side template ${template.design}`}
                            className="max-w-full max-h-full object-contain group-hover:opacity-90 transition-opacity"
                          />
                        </div>

                        {/* Template Info - Fixed Height */}
                        <div className="text-center flex-1 flex flex-col justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">{template.size}</p>
                            <p className="text-xs text-gray-500 capitalize mb-2">{template.design.replace("-", " ")}</p>
                          </div>
                          <div>
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${template.side === "front" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                              {template.side} side
                            </span>
                          </div>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-white px-3 py-1 rounded-full text-sm">Click to Import</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Fixed Footer - Success Message */}
        {selectedTemplate && (
          <div className="bg-green-50 border-t border-green-200 px-6 py-4 rounded-b-xl flex-shrink-0">
            <div className="flex items-center justify-center text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Importing {selectedTemplate.side} side template "{selectedTemplate.design}"...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeImport;
