import React, { useMemo } from "react";
import { Overlay, Page, Header, Footer } from "../../../../core/list/create/styles";
import { Button, IconButton } from "../../../../core/elements";

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
    <Overlay className="center" onClick={onClose}>
      <Page className="center large" onClick={(e) => e.stopPropagation()}>
        <Header className="custom">
          <div className="flex items-center justify-between w-full">
            <div className="text-left pl-8 pt-5 pb-0 mb-0">
              <span>Form Settings</span>
            </div>
            <div className="text-right pr-8 py-5 mb-0 pb-0">
              <IconButton icon="back" ClickEvent={onClose} aria-label="Close settings" />
            </div>
          </div>
        </Header>
        {(() => {
          const iconMap = {
            general: "info",
            submissions: "submissions",
            approval: "approvalmessaging",
            security: "securityprivacy",
            notifications: "message",
          };
          const currentTabKey = activeSettingsTab ?? settingsTabs?.[0]?.id;
          const tabs = useMemo(
            () =>
              settingsTabs.map((tab) => ({
                key: tab.id,
                icon: tab.icon ?? iconMap[tab.id] ?? "settings",
                title: tab.label,
              })),
            [settingsTabs]
          );

          const renderById = (id) => {
            switch (id) {
              case "general":
                return renderGeneralSettings?.();
              case "submissions":
                return renderSubmissionSettings?.();
              case "approval":
                return renderApprovalSettings?.();
              case "security":
                return renderSecuritySettings?.();
              case "notifications":
                return renderNotificationSettings?.();
              default:
                return null;
            }
          };

          return (
            <div className="p-4">
              {/* Only show tabs if there are any */}
              {tabs.length > 0 && (
                <div className="w-full px-2">
                  <div className={`flex gap-4 border-b border-gray-200 mb-2 overflow-x-auto whitespace-nowrap`}>
                    {tabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => onTabChange?.(tab.key)}
                        className={`py-3 text-sm font-medium border-b-2 transition-all duration-200 ease-in-out items-center gap-2 align-center flex px-2 ${
                          currentTabKey === tab.key ? "text-gray-900 border-blue-600" : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <span>{tab.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className={tabs.length > 0 ? "mt-4" : ""}>{tabs.length > 0 ? renderById(currentTabKey) : renderApprovalSettings?.()}</div>
            </div>
          );
        })()}
        <Footer className="popup plain">
          <div className="flex items-center gap-3 ml-auto">
            <Button type="secondary" value="Cancel" ClickEvent={onClose} />
            <Button
              type="primary"
              value="Save & Close"
              ClickEvent={() => {
                try {
                  onClose?.();
                } finally {
                  setTimeout(() => {
                    try {
                      onSave?.();
                    } catch (e) {}
                  }, 0);
                }
              }}
            />
          </div>
        </Footer>
      </Page>
    </Overlay>
  );
};

export default SettingsModal;
