import React from "react";
import { Overlay, Page, Header, Footer } from "../../../../core/list/create/styles";
import { Button, IconButton } from "../../../../core/elements";

const AbstractFormSettingsModal = ({ isOpen, onClose, renderApprovalSettings, onSave }) => {
  if (!isOpen) return null;

  return (
    <Overlay className="center" onClick={onClose}>
      <Page className="center large" onClick={(e) => e.stopPropagation()}>
        <Header className="custom">
          <div className="flex items-center justify-between w-full">
            <div className="text-left pl-8 pt-5 pb-0 mb-0">
              <span>Abstract Form Settings</span>
            </div>
            <div className="text-right pr-8 py-5 mb-0 pb-0">
              <IconButton icon="back" ClickEvent={onClose} aria-label="Close settings" />
            </div>
          </div>
        </Header>

        <div className="p-4">
          <div className="w-full px-2">
            <div className="flex gap-4 border-b border-gray-200 mb-2">
              <button className="py-3 text-sm font-medium border-b-2 border-blue-600 text-gray-900 transition-all duration-200 ease-in-out items-center gap-2 align-center flex px-2">
                <span>Approval</span>
              </button>
            </div>
          </div>
          <div className="mt-4">{renderApprovalSettings?.()}</div>
        </div>

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

export default AbstractFormSettingsModal;
