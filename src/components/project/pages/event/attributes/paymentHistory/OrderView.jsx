import React from "react";
import { GetIcon } from "../../../../../../icons";
import ProfileImage from "../../../../../core/list/ProfileImage";

const OrderView = ({ data }) => {
  if (!data) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No order data available</p>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount, currency = "₹") => {
    return `${currency.toUpperCase()} ${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get user info
  const userName = data?.userName || data?.authentication?.fullName || "N/A";
  const userEmail = data?.userDetails?.emailId || "N/A";
  let userPhone = "N/A";
  if (data?.userDetails?.authenticationId) {
    const authId = data.userDetails.authenticationId;
    if (typeof authId === "object" && authId.country && authId.number) {
      userPhone = `+${authId.country} ${authId.number}`;
    } else if (data?.userDetails?.phoneCode) {
      userPhone = `+${data.userDetails.phoneCode} ${data.userDetails.authenticationId}`;
    }
  }

  // Status configuration
  const getStatusColor = (status) => {
    const status_lower = status?.toLowerCase() || "pending";
    const colors = {
      paid: "text-green-600",
      captured: "text-green-600",
      authorized: "text-green-600",
      pending: "text-yellow-600",
      failed: "text-red-600",
      refunded: "text-blue-600",
    };
    return colors[status_lower] || "text-gray-600";
  };

  // Get attendees
  const attendees = data?.userDetailsList || [];

  // Calculate totals
  const discount = data?.discountAmount || 0;
  const tax = data?.tax || 0;
  const grandTotal = data?.amount || 0;

  return (
    <div className="w-full bg-white">
      {/* Header Section */}
      <div className="px-0 py-3 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <GetIcon icon="orders" className="text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 font-medium mb-1">Order ID</p>
                <p className="text-sm font-bold text-gray-900 truncate">{data._id}</p>
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-500 mb-1">{formatDate(data.transactionDate || data.createdAt)}</p>
            <p className={`text-sm font-semibold ${getStatusColor(data.status)}`}>{data.status?.charAt(0).toUpperCase() + data.status?.slice(1).toLowerCase()}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-0 space-y-3 pt-3 px-0 pb-4">
        {/* Customer Details - Curved Box */}
        <div className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Customer Details</h3>

          <div className="space-y-2">
            {/* Row 1: Date & Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Order Date & Time</p>
                <p className="text-sm text-gray-900 font-medium break-words">{formatDate(data.transactionDate || data.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Customer Name</p>
                <p className="text-sm text-gray-900 font-medium break-words">{userName}</p>
              </div>
            </div>

            {/* Row 2: Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Customer Email</p>
                <p className="text-sm text-gray-900 font-medium break-all">{userEmail}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Customer Phone Name</p>
                <p className="text-sm text-gray-900 font-medium break-all">{userPhone}</p>
              </div>
            </div>

            {/* Row 3: Payment Method & Razorpay ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Payment Method</p>
                <p className="text-sm text-gray-900 font-medium capitalize break-words">{data.paymentMethod || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Razorpay ID</p>
                <p className="text-sm text-gray-900 font-medium font-mono break-all">{data.razorpayPaymentId || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendees - Curved Box */}
        {attendees && attendees.length > 0 && (
          <div className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Attendees in this Order</h3>

            <div className="space-y-1">
              {attendees.map((attendee, index) => {
                const attendeeName = `${attendee.firstName || ""} ${attendee.lastName || ""}`.trim() || attendee.name || attendee.fullName || "Attendee";
                const attendeeEmail = attendee.emailId || attendee.email || "N/A";
                return (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <ProfileImage imageUrl={attendee.image || attendee.profileImage} title={attendeeName} className="!w-10 !h-10 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{attendeeName}</p>
                        <p className="text-xs text-gray-500 truncate">{attendeeEmail}</p>
                      </div>
                    </div>
                    <GetIcon icon="next" className="text-gray-400 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Information - Curved Box */}
        <div className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Order Information</h3>

          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="px-0 py-3 text-left text-xs font-semibold text-gray-600 border-b border-gray-100">Ticket</th>
                <th className="px-0 py-3 text-right text-xs font-semibold text-gray-600 border-b border-gray-100">Price</th>
              </tr>
            </thead>
            <tbody>
              {data.cartSummary &&
                Array.isArray(data.cartSummary) &&
                data.cartSummary.map((item, index) => (
                  <tr key={index} className="group hover:bg-gray-50/50 transition-all duration-200">
                    <td className="px-0 py-3 border-b border-gray-50 group-hover:border-gray-100 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{item.ticketTitle || `Item ${index + 1}`}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.quantity} x {formatCurrency(item.unitPrice, data.currency)}
                        </p>
                      </div>
                    </td>
                    <td className="px-0 py-3 text-right border-b border-gray-50 group-hover:border-gray-100 transition-colors">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.quantity * item.unitPrice, data.currency)}</p>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="space-y-1 pt-2 border-t border-gray-200">
            {/* Total Amount */}
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-semibold text-gray-900">{formatCurrency(grandTotal + discount, data.currency)}</span>
            </div>

            {/* Tax */}
            {tax > 0 && (
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Tax</span>
                <span className="font-semibold text-gray-900">{formatCurrency(tax, data.currency)}</span>
              </div>
            )}

            {/* Discount */}
            {discount > 0 && (
              <div className="flex justify-between py-1 pb-2 border-b border-gray-200">
                <div>
                  <p className="text-gray-600">Discount</p>
                  {data.couponCode && (
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs font-mono bg-red-50 text-red-600 px-2 py-1 rounded flex items-center gap-1">
                        <GetIcon icon="coupon" className="text-xs" />
                        {data.couponCode}
                      </span>
                      {data.discountPercentage && (
                        <span className="text-xs font-semibold bg-green-50 text-green-600 px-2 py-1 rounded flex items-center gap-1">
                          <GetIcon icon="checked" className="text-xs" /> {formatCurrency(data.discountPercentage, data.currency)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <span className="font-semibold text-green-600">- {formatCurrency(discount, data.currency)}</span>
              </div>
            )}

            {/* Grand Total */}
            <div className="flex justify-between pt-2">
              <span className="font-bold text-gray-900 text-base">Grand Total</span>
              <span className="font-bold text-gray-900 text-base">{formatCurrency(grandTotal, data.currency)}</span>
            </div>
          </div>
        </div>

        {/* Notes - Curved Box */}
        {data.notes && (
          <div className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
            <p className="text-xs text-gray-500 font-bold uppercase mb-2">Notes</p>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg break-words">{data.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderView;
