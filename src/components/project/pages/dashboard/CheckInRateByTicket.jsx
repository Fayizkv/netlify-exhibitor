import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, Percent } from "lucide-react";

// Helper to calculate rate and determine color/icon
const calculateRate = (checkedIn, registered) => {
  if (!registered || registered === 0) return { rate: 0, color: "text-gray-500", Icon: Percent };
  const rate = (checkedIn / registered) * 100;
  let color = "text-yellow-600";
  let Icon = Percent;
  if (rate > 85) {
    color = "text-green-600";
    Icon = TrendingUp;
  } else if (rate < 70) {
    color = "text-red-600";
    Icon = TrendingDown;
  }
  return { rate: rate.toFixed(1), color, Icon };
};

// A simple color palette for dynamically assigned ticket type colors
const ticketColors = ["#F6C34F", "#34D399", "#4F46E5", "#EF4444", "#EC4899", "#10B981", "#8B5CF6"];

const CheckInRateByTicket = ({ eventId, attendanceByTicket, isLoading = false }) => {
  const memoizedRates = useMemo(() => {
    // Use real API data instead of sample data
    if (!attendanceByTicket || !Array.isArray(attendanceByTicket)) {
      return [];
    }

    return attendanceByTicket.map((item, index) => {
      const { rate, color: rateStatusColor, Icon } = calculateRate(item.attendedCount, item.totalCount);
      return {
        key: item.ticketId,
        name: item.ticketName,
        checkedIn: item.attendedCount,
        registered: item.totalCount,
        rate,
        color: rateStatusColor,
        Icon,
        dotColor: ticketColors[index % ticketColors.length],
      };
    });
  }, [attendanceByTicket]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 w-full h-full flex flex-col">
      {/* Card Header */}
      <div className="flex items-center gap-2 font-semibold text-md text-gray-800 mb-4 border-b border-gray-100 pb-3">
        <Percent size={20} className="text-gray-600" />
        Check-in Rate by Ticket Type
      </div>
      {/* Content - List View */}
      <div className="flex-grow space-y-3 overflow-y-auto py-2 pr-2">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-base"></div>
            <p className="text-sm text-gray-500 mt-2">Loading check-in rates...</p>
          </div>
        ) : memoizedRates.length > 0 ? (
          memoizedRates.map((item) => (
            <div key={item.key} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 font-inter">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.dotColor }}></span>
                <span className="text-sm text-gray-700 font-inter flex-grow truncate" title={item.name}>
                  {item.name}
                </span>
              </div>
              <div className={`flex items-center gap-2 text-sm font-semibold ${item.color}`}>
                <item.Icon size={16} />
                <span>{item.rate}%</span>
                <span className="text-xs text-gray-400 font-inter ml-2">
                  ({item.checkedIn}/{item.registered})
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center py-4">
            <p className="text-sm text-gray-500">No ticket data available.</p>
            <p className="text-xs text-gray-400 mt-1">Check-in rates will appear here once attendees start checking in.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckInRateByTicket;
