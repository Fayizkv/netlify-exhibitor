import { useEffect, useState } from "react";
import { postData } from "../../../../../../backend/api";
import { X } from "lucide-react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// We'll initialize Stripe with the key from props instead of environment variable
// const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Payment Form Component
const PaymentForm = ({ colors, stripeOrder, onSuccess, onError, onClose, postDataTemp }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [stripeError, setStripeError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  const handleStripePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setMessage("Payment system is not ready. Please try again.");
      onError("Payment system is not ready. Please try again.");
      return;
    }

    setIsProcessing(true);
    setStripeError(null);

    try {
      // Confirm the payment with Stripe using the existing payment intent
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/payment-success",
          payment_method_data: {
            billing_details: {
              name: postDataTemp?.firstName || "",
              email: postDataTemp?.emailId || "",
            },
          },
          billing_address_collection: "required",
        },
      });

      if (error) {
        setStripeError(error.message);
        onError(error.message);
        return;
      }

      // Handle successful payment
      if (paymentIntent.status === "succeeded") {
        // Send the payment confirmation to the server
        const res = await postData(
          {
            ...postDataTemp,
            paymentIntentId: paymentIntent.id,
            domain: window.location.hostname,
            reference: stripeOrder.reference,
          },
          "authentication/direct"
        );

        if (res.status === 200) {
          setMessage("Payment successful! You'll receive a confirmation email shortly.");
          onSuccess({
            ...res.data,
            paymentIntent: paymentIntent,
          });
        } else {
          setMessage(res.customMessage || "There was an issue with your registration. Please contact support.");
          onError(res.customMessage || "There was an issue with your registration. Please contact support.");
        }
      } else {
        throw new Error(`Payment status: ${paymentIntent.status}`);
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      setMessage("We're processing your registration. If you don't receive confirmation within 15 minutes, please contact support.");
      onError("We're processing your registration. If you don't receive confirmation within 15 minutes, please contact support.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
          {/* Close Button */}
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 focus:outline-none">
            <X className="h-6 w-6" />
          </button>

          {/* Header */}
          <div className="mb-6 text-center">
            <h3 className="text-lg font-medium text-gray-900">Complete Payment</h3>
            <p className="mt-1 text-sm text-gray-500">Please enter your payment details to proceed</p>
          </div>

          {/* Payment Details Section */}
          {/* <div className="mb-6 space-y-2">
            {stripeOrder.discountApplied && (
              <div className="flex justify-between items-center text-gray-600">
                <span>Discount</span>
                <span className="font-medium text-green-600">
                  -{stripeOrder.currency} {stripeOrder.discountAmount / 100}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="font-medium">Total</span>
              <span className="font-medium text-lg">
                {stripeOrder.currency} {stripeOrder.total / 100}
              </span>
            </div>
          </div> */}

          {/* Stripe Payment Element */}
          <form id="payment-form" onSubmit={handleStripePayment} className="mb-6">
            <div className="p-3 border border-gray-300 rounded-md">
              <PaymentElement
                options={{
                  layout: "tabs",
                  defaultValues: {
                    billingDetails: {
                      name: postDataTemp?.firstName || "",
                      email: postDataTemp?.emailId || "",
                      address: {
                        country: postDataTemp?.country || "IN",
                      },
                    },
                  },

                  fields: {
                    billingDetails: {
                      address: "if_required",
                    },
                  },
                }}
                onChange={(event) => {
                  if (event.error) {
                    setStripeError(event.error.message);
                  } else {
                    setStripeError(null);
                  }
                }}
              />
            </div>
            {stripeError && <p className="mt-2 text-sm text-red-600">{stripeError}</p>}
          </form>

          {/* Pay Button */}
          <button
            type="submit"
            form="payment-form"
            disabled={isProcessing || !stripe || !elements}
            className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${isProcessing || !stripe || !elements ? "bg-gray-400 cursor-not-allowed" : "bg-[#005dbc] hover:bg-[#005dbc]/90"}`}
            style={{
              backgroundColor: isProcessing || !stripe || !elements ? undefined : colors?.primaryColour || "#005dbc",
              "--tw-hover-bg-opacity": "0.9",
            }}
          >
            {isProcessing ? "Processing..." : `Pay ${stripeOrder.currency} ${stripeOrder.total / 100}`}
          </button>

          {/* Message Display */}
          {message && <div className="mt-4 p-3 text-sm text-center border-t border-gray-200">{message}</div>}
        </div>
      </div>
    </div>
  );
};

// Main Component with Elements Provider
const StripePaymentForm = (props) => {
  const [stripePromise, setStripePromise] = useState(null);

  // Initialize Stripe with the key from props
  useEffect(() => {
    if (props.stripeOrder?.key) {
      setStripePromise(loadStripe(props.stripeOrder.key));
    }
  }, [props.stripeOrder?.key]);

  const options = {
    clientSecret: props.stripeOrder.clientSecret, // Use the client secret from order details
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: props.colors?.primaryColour || "#2563eb",
        colorBackground: "#ffffff",
        colorText: "#1f2937",
        colorDanger: "#ef4444",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        spacingUnit: "4px",
        borderRadius: "8px",
      },
    },
    billing_address_collection: "required",
  };

  return (
    <>
      {props.stripeOrder?.clientSecret && stripePromise ? (
        <Elements stripe={stripePromise} options={options}>
          <PaymentForm {...props} />
        </Elements>
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payment form...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default StripePaymentForm;
