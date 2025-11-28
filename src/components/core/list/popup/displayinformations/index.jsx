import { useState } from "react";
import { Title as TitleElement } from "../../../elements";
import { GetIcon } from "../../../../../icons";
import { getValue } from "../../functions";
import { Pencil } from "lucide-react";
import React from "react"; // Added missing import for React

export const DisplayInformations = ({ editingHandler, attributes, data, formMode, popupMenu, style = "style2", parentData, updatePrivilege = true }) => {
  const [showImage, setShowImage] = useState(false);

  // Helper function to check if field should be displayed based on parentCondition
  const shouldDisplayField = (attribute) => {
    if (!attribute.parentCondition || !parentData) return true;
    
    const { item, if: ifValue, then: thenAction } = attribute.parentCondition;
    const parentValue = parentData[item];
    
    if (parentValue === ifValue) {
      return thenAction === "enabled";
    } else {
      return thenAction === "disabled";
    }
  };

  // Helper function to render field value
  const renderFieldValue = (attribute, itemValue) => {
    // Check if attribute has a custom render function
    if (typeof attribute.render === "function") {
      try {
        return attribute.render(itemValue, data, attribute);
      } catch (error) {
        console.error("Error in custom render function:", error);
        return "—";
      }
    }
    
    // Use default getValue function
    if (attribute.type === "image") {
      return getValue(attribute, itemValue, true, false, (src) => setShowImage(src));
    }
    
    return getValue(attribute, itemValue, true) || "—";
  };

  const EditButton = () => {
    if (!updatePrivilege) return null;
    
    return (
      <div className="mt-6 bg-white rounded-lg border border-gray-100">
        <div className="p-4">
          <button
            onClick={editingHandler}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 w-full"
          >
            <Pencil className="w-4 h-4" />
            <span>Edit Details</span>
          </button>
        </div>
      </div>
    );
  };

  // Style 3: Table layout with borders
  const renderStyle3 = () => (
    <>
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-2">
          {/* Content Rows */}
          {attributes.map((attribute, index) => {
            if (attribute.view && attribute.type !== "title" && shouldDisplayField(attribute)) {
              try {
                const itemValue = attribute.collection?.length > 0 && attribute.showItem?.length > 0 ? data[attribute.collection][attribute.showItem] : data[attribute.name];

                return (
                  <React.Fragment key={index}>
                    <div className="px-6 py-3 border-b border-gray-100 border-r bg-white">
                      <div className="flex items-center gap-2">
                        {attribute.icon?.length > 0 && <GetIcon icon={attribute.icon} className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                        <span className="text-sm text-gray-600">{attribute.label}</span>
                      </div>
                    </div>
                    <div className="px-6 py-3 border-b border-gray-100 bg-white">
                      <div className="text-sm font-medium text-gray-900 text-right">
                        {renderFieldValue(attribute, itemValue)}
                      </div>
                    </div>
                  </React.Fragment>
                );
              } catch (error) {
                console.error("Error rendering attribute:", attribute, error);
                return (
                  <React.Fragment key={index}>
                    <div className="px-6 py-3 border-b border-gray-100 border-r bg-white">
                      <div className="flex items-center gap-2">
                        {attribute.icon?.length > 0 && <GetIcon icon={attribute.icon} className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                        <span className="text-sm text-gray-600">{attribute.label}</span>
                      </div>
                    </div>
                    <div className="px-6 py-3 border-b border-gray-100 bg-white">
                      <span className="text-sm text-gray-400">—</span>
                    </div>
                  </React.Fragment>
                );
              }
            }
            return null;
          })}
        </div>
      </div>
      <EditButton />
      {showImage && <ImagePopup onClose={() => setShowImage(null)} src={showImage.src} />}
    </>
  );

  // Style 2: Two-column layout
  const renderStyle2 = () => (
    <>
      <div className="bg-white rounded-lg border border-gray-100">
        <div className="p-6">
          <div className="grid grid-cols-2 gap-x-24 gap-y-6">
            {attributes.map((attribute, index) => {
              if (attribute.view && shouldDisplayField(attribute)) {
                try {
                  const itemValue = attribute.collection?.length > 0 && attribute.showItem?.length > 0 ? data[attribute.collection][attribute.showItem] : data[attribute.name];

                  if (attribute.type === "title") {
                    return (
                      <div key={index} className="col-span-2 mb-4">
                        <div className="flex items-center gap-2">
                          {attribute.icon?.length > 0 && <GetIcon icon={attribute.icon} className="w-5 h-5 text-gray-500" />}
                          <span className="text-sm font-semibold text-gray-900">{attribute.title}</span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={index} className="flex flex-col gap-1">
                      <span className="text-sm text-gray-500">{attribute.label}</span>
                      <div className="text-sm font-medium text-gray-900 text-right">
                        {renderFieldValue(attribute, itemValue)}
                      </div>
                    </div>
                  );
                } catch (error) {
                  console.error("Error rendering attribute:", attribute, error);
                  return (
                    <div key={index} className="flex flex-col gap-1">
                      <span className="text-sm text-gray-500">{attribute.label}</span>
                      <span className="text-sm text-gray-400">—</span>
                    </div>
                  );
                }
              }
              return null;
            })}
          </div>
        </div>
      </div>
      <EditButton />
      {showImage && <ImagePopup onClose={() => setShowImage(null)} src={showImage.src} />}
    </>
  );

  // Style 1: List view with labels and values side by side
  const renderStyle1 = () => (
    <>
      <div className="bg-white rounded-lg border border-gray-100">
        <div className={`flex flex-col ${formMode}`}>
          {attributes.map((attribute, index) => {
            if (attribute.view && shouldDisplayField(attribute)) {
              try {
                const itemValue = attribute.collection?.length > 0 && attribute.showItem?.length > 0 ? data[attribute.collection][attribute.showItem] : data[attribute.name];

                if (attribute.type === "title") {
                  return (
                    <div key={index} className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        {attribute.icon?.length > 0 && <GetIcon icon={attribute.icon} className="w-5 h-5 text-gray-500" />}
                        <span className="text-sm font-semibold text-gray-900">{attribute.title}</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={index} className="px-4 py-3 flex items-center justify-between border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-2">
                      {attribute.icon?.length > 0 && <GetIcon icon={attribute.icon} className="w-4 h-4 text-gray-400" />}
                      <span className="text-sm text-gray-600">{attribute.label}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 text-right">
                      {renderFieldValue(attribute, itemValue)}
                    </div>
                  </div>
                );
              } catch (error) {
                console.error("Error rendering attribute:", attribute, error);
                return (
                  <div key={index} className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                    <span className="text-sm text-gray-600">{attribute.label}</span>
                    <span className="text-sm text-gray-400">—</span>
                  </div>
                );
              }
            }
            return null;
          })}
        </div>
      </div>
      <EditButton />
      {showImage && <ImagePopup onClose={() => setShowImage(null)} src={showImage.src} />}
    </>
  );
  if (style === "style3") {
    return renderStyle3();
  }
  return style === "style2" ? renderStyle2() : renderStyle1();
};

const ImagePopup = ({ onClose, src }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="relative bg-white p-4 rounded-lg max-w-3xl w-full mx-4">
      <button onClick={onClose} className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full transition-colors">
        <GetIcon icon="close" className="w-5 h-5 text-gray-500" />
      </button>
      <img src={src} alt="Preview" className="w-full h-auto rounded-lg" />
    </div>
  </div>
);
