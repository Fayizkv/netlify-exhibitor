import React from "react";
import { X } from "lucide-react";

const SettingsModal = ({
  isOpen,
  onClose,
  settingsTabs = [],
  activeSettingsTab,
  onTabChange,
  renderGeneralSettings,
  renderSubmissionSettings,
  renderApprovalSettings,
  renderSecuritySettings,
  renderNotificationSettings,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Form Settings</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex max-h-[calc(90vh-140px)]">
          <div className="w-64 border-r border-gray-200">
            <nav className="p-4 space-y-2">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeSettingsTab === tab.id ? "bg-gray-100 text-gray-900 border-gray-200" : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeSettingsTab === "general" && renderGeneralSettings?.()}
            {activeSettingsTab === "submissions" && renderSubmissionSettings?.()}
            {activeSettingsTab === "approval" && renderApprovalSettings?.()}
            {activeSettingsTab === "security" && renderSecuritySettings?.()}
            {activeSettingsTab === "notifications" && renderNotificationSettings?.()}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
