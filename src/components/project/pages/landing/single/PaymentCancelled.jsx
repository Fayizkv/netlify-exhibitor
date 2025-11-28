import React, { useEffect } from "react";
import { XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PaymentCancelled = ({ colors, event, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to main page after 5 seconds
    const timer = setTimeout(() => {
      if (onClose) {
        onClose();
      } else {
        // If no close handler is provided, navigate back to the event page
        navigate(`/`);
      }
    }, 5000);

    // Cleanup timer on component unmount
    return () => clearTimeout(timer);
  }, [navigate, event, onClose]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">Payment Cancelled</h3>
            <p className="mt-1 text-sm text-gray-500">Your payment process was cancelled. Redirecting to main page in 5 seconds...</p>
          </div>

          {/* Loading indicator */}
          <div className="mt-4 flex justify-center">
            <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-5000 ease-linear"
                style={{
                  width: "100%",
                  backgroundColor: colors?.primaryColour || "#2563eb",
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelled;
