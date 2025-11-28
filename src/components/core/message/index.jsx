import { useTranslation } from "react-i18next";
import FormInput from "../input";
import { useEffect, useState } from "react";
import { GetIcon } from "../../../icons";
import { useToast } from "../toast/ToastContext";

const Message = (props) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [proceedLoading, setProceedLoading] = useState(false);

  const closeModal = async () => {
    if (buttonsDisabled) return; // Prevent multiple clicks
    setButtonsDisabled(true); // Disable all buttons
    
    try {
      if (typeof props.message.onClose === "function") {
        await props.message.onClose().then((status) => {
          (status ?? true) && props.closeMessage();
        });
      } else {
        props.closeMessage();
      }
    } catch (error) {
      console.error("Error in onClose:", error);
      setButtonsDisabled(false); // Re-enable buttons on error
    }
  };

  const proceedAction = async () => {
    if (buttonsDisabled) return; // Prevent multiple clicks
    setButtonsDisabled(true); // Disable all buttons
    setProceedLoading(true); // Show loading spinner
    
    try {
      if (typeof props.message.onProceed === "function") {
        await props.message.onProceed(props.message?.data, props.message?.data?._id).then((status) => {
          (status ?? true) && props.closeMessage();
        });
      } else {
        props.closeMessage();
      }
    } catch (error) {
      console.error("Error in onProceed:", error);
      setButtonsDisabled(false); // Re-enable buttons on error
      setProceedLoading(false); // Hide loading spinner on error
    }
  };

  useEffect(() => {
    if (props.message.type === 1 && props.showMessage) {
      // Use existing toast system for notifications
      const iconType = props.message.icon ?? "info";
      const message = props.message.content;

      switch (iconType) {
        case "success":
        case "check":
          toast.success(message);
          break;
        case "error":
        case "close":
          toast.error(message);
          break;
        case "warning":
          toast.warning(message);
          break;
        case "info":
        default:
          toast.info(message);
          break;
      }

      // Close the message after showing toast
      setTimeout(() => {
        if (typeof props.message.onClose === "function") {
          props.message.onClose();
        }
        props.closeMessage();
      }, 100); // Small delay to let toast show
    }
  }, [props, toast]);

  // Reset button states when a new message appears
  useEffect(() => {
    if (props.showMessage) {
      setButtonsDisabled(false);
      setProceedLoading(false);
    }
  }, [props.showMessage, props.message]);

  // Loading Spinner Component
  const LoadingSpinner = ({ size = "w-4 h-4" }) => (
    <svg className={`animate-spin ${size}`} viewBox="0 0 24 24">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        className="opacity-25"
        fill="none"
      />
      <path
        fill="currentColor"
        className="opacity-75"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const renderConfirmation = () => (
    <div className={`${props.showMessage ? "" : "hidden"} fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm`}>
      <div className="relative w-full max-w-[420px] bg-white rounded-3xl shadow-2xl animate-fade-in-up overflow-hidden">
        {/* Close Button - Top Right */}
        <button 
          onClick={buttonsDisabled ? undefined : closeModal} 
          disabled={buttonsDisabled}
          className={`absolute top-5 right-5 p-1.5 rounded-lg transition-colors duration-200 z-10 ${
            buttonsDisabled 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`} 
          aria-label="Close"
        >
          <GetIcon icon="close" className="w-4 h-4" />
        </button>

        {/* Modal Content Section */}
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-start gap-4">
            {/* Icon Section - Left Aligned (only show if icon exists) */}
            {props.message.icon && (
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full flex-shrink-0">
                <GetIcon icon={props.message.icon || "check"} className="w-6 h-6 text-green-600" />
              </div>
            )}

            {/* Text Section */}
            <div className="flex-1 pt-1 pr-8">
              {/* Title - Only show if provided */}
              {props.message.title && <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">{props.message.title}</h3>}

              {/* Description */}
              <div className={`text-gray-600 text-sm leading-relaxed ${!props.message.title ? "pt-0" : ""}`} dangerouslySetInnerHTML={{ __html: props.message.content }} />
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div className="border-t border-gray-200"></div>

        {/* Button Section */}
        <div className="px-6 py-4">
          <div className="flex gap-3">
            <button
              onClick={buttonsDisabled ? undefined : closeModal}
              disabled={buttonsDisabled}
              className={`flex-1 px-4 py-2.5 text-sm font-medium border rounded-lg transition-colors duration-200 focus:outline-none ${
                buttonsDisabled
                  ? 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'text-gray-700 bg-white hover:bg-gray-50 border-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
              }`}
            >
              {props.message.okay || "Cancel"}
            </button>
            <button
              onClick={buttonsDisabled ? undefined : proceedAction}
              disabled={buttonsDisabled}
              className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors duration-200 focus:outline-none flex items-center justify-center gap-2 ${
                buttonsDisabled
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            >
              {proceedLoading && <LoadingSpinner size="w-4 h-4" />}
              <span className={proceedLoading ? 'opacity-75' : ''}>{props.message.proceed || "View Receipt"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Only render confirmation modals (type 2) - notifications (type 1) are handled by toast system
  if (!props.showMessage || props.message.type === 1) return null;

  return renderConfirmation();
};

export default Message;
