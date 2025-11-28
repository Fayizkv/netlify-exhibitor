import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";
import { postData } from "../../../../../backend/api";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        // Get payment intent ID from URL parameters
        const params = new URLSearchParams(location.search);
        // const paymentIntentId = params.get("payment_intent");
        const session_id = params.get("session_id");
        console.log(session_id);
        if (!session_id) {
          setStatus("error");
          setError("Invalid payment information. Please contact support.");
          return;
        }

        // Send the payment confirmation to the server
        const res = await postData(
          {
            session_id: session_id,
            domain: window.location.origin,
          },
          "authentication/payment-validation"
        );

        if (res.status === 200) {
          setStatus("success");
          setMessage(res.data.message || "Registration successful! You'll receive a confirmation email shortly.");
          // setTimeout(() => {
          //   navigate(`/`);
          // }, 5000);
        } else {
          setStatus("error");
          setError(res.customMessage || "There was an issue with your registration. Please contact support.");
        }
      } catch (err) {
        console.error("Payment confirmation error:", err);
        setStatus("error");
        setError("We're processing your registration. If you don't receive confirmation within 15 minutes, please contact support.");
      }
    };

    handlePaymentSuccess();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        {status === "loading" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <h2 className="mt-6 text-xl font-semibold text-gray-900">Processing your payment</h2>
            <p className="mt-2 text-sm text-gray-600">Please wait while we confirm your registration...</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-6 text-xl font-semibold text-gray-900">Payment Successful!</h2>
            <div
              className="mt-4 text-sm text-gray-600 text-left prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: message }}
              style={{
                overflow: "auto",
                maxHeight: "300px",
                padding: "0.75rem",
                borderRadius: "0.375rem",
                backgroundColor: "#f9fafb",
              }}
              ref={(el) => {
                if (el) {
                  // Apply styles to HTML elements inside the container
                  const styleSheet = document.createElement("style");
                  styleSheet.textContent = `
                    .prose h1 { font-size: 1.5rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; }
                    .prose h2 { font-size: 1.25rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; }
                    .prose h3 { font-size: 1.125rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; }
                    .prose p { margin-bottom: 0.75rem; line-height: 1.5; }
                    .prose ul, .prose ol { margin-left: 1rem; margin-bottom: 0.75rem; }
                    .prose li { margin-bottom: 0.25rem; }
                    .prose a { color: #3b82f6; text-decoration: underline; }
                    .prose strong { font-weight: 600; }
                    .prose em { font-style: italic; }
                    .prose blockquote { border-left: 4px solid #e5e7eb; padding-left: 1rem; margin-left: 0; margin-bottom: 0.75rem; }
                    .prose code { background-color: #f3f4f6; padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-size: 0.875em; }
                    .prose pre { background-color: #f3f4f6; padding: 0.75rem; border-radius: 0.375rem; overflow-x: auto; margin-bottom: 0.75rem; }
                    .prose table { width: 100%; border-collapse: collapse; margin-bottom: 0.75rem; }
                    .prose th, .prose td { border: 1px solid #e5e7eb; padding: 0.5rem; text-align: left; }
                    .prose th { background-color: #f9fafb; font-weight: 600; }
                  `;
                  el.appendChild(styleSheet);
                }
              }}
            />
            <div className="mt-6">
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-6 text-xl font-semibold text-gray-900">Payment Issue</h2>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
            <div className="mt-6">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
