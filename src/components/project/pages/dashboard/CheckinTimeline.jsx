import React, { useState, useEffect, useMemo } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, BarElement } from "chart.js";
import { Bar } from "react-chartjs-2";
import { Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { getData } from "../../../../backend/api/index.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const LATE_THRESHOLD_HOUR = 16; // 4 PM

// Generate time slots outside the component as they are constant
const TIME_SLOTS = [];
for (let hour = 8; hour <= 17; hour++) {
  TIME_SLOTS.push(`${hour}:00`, `${hour}:30`);
}

const CheckinTimeline = ({ eventId }) => {
  const [checkinData, setCheckinData] = useState([]);
  const [totalCheckedIn, setTotalCheckedIn] = useState(0);
  const [lateArrivals, setLateArrivals] = useState(0);
  const [peakHour, setPeakHour] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCheckinData = async () => {
      if (!eventId) return;

      try {
        setLoading(true);
        const response = await getData({ ticket: "all", event: eventId, attendance: true, skip: 0, limit: 10000 }, "attendance/check-in");
        if (response.status === 200 && response.data) {
          const checkedInAttendees = response.data.response || [];
          setTotalCheckedIn(checkedInAttendees.length);
          // Initialize hourly data with zeros
          const hourlyData = {};
          TIME_SLOTS.forEach((slot) => {
            hourlyData[slot] = 0;
          });
          // Process check-in times with half-hour precision
          let maxCount = 0;
          let peakTimeSlot = null;

          checkedInAttendees.forEach((attendee) => {
            if (attendee.attendance === true && attendee.updatedAt) {
              const date = new Date(attendee.updatedAt);
              let hour = date.getHours();
              let minutes = date.getMinutes();
              // Calculate late arrivals
              if (hour >= LATE_THRESHOLD_HOUR) {
                setLateArrivals((prev) => prev + 1);
              }
              // Format time slot
              const timeSlot = `${hour}:${minutes >= 30 ? "30" : "00"}`;
              if (hourlyData[timeSlot] !== undefined) {
                hourlyData[timeSlot] += 1;

                // Track peak hour
                if (hourlyData[timeSlot] > maxCount) {
                  maxCount = hourlyData[timeSlot];
                  peakTimeSlot = timeSlot;
                }
              }
            }
          });
          // Set peak hour
          setPeakHour(peakTimeSlot);
          // Convert to array format for chart
          const chartDataFormatted = TIME_SLOTS.map((slot) => ({
            time: slot,
            count: hourlyData[slot] || 0,
          }));
          setCheckinData(chartDataFormatted);
        }
      } catch (error) {
        console.error("Error fetching check-in data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckinData();
  }, [eventId]);

  // Calculate late arrival rate
  const lateArrivalRate = totalCheckedIn > 0 ? ((lateArrivals / totalCheckedIn) * 100).toFixed(1) : 0;
  // Chart data
  const chartBarData = useMemo(() => {
    const barColors = checkinData.map((item) => {
      const hour = parseInt(item.time.split(":")[0], 10);
      if (hour < 12) return "#3B82F6";
      if (hour < 22) return "#FBBF24";
      return "#EF4444";
    });

    return {
      labels: checkinData.map((item) => item.time),
      datasets: [{ label: "Check-ins", data: checkinData.map((item) => item.count), backgroundColor: barColors, borderRadius: 4, barPercentage: 0.8, categoryPercentage: 0.8 }],
    };
  }, [checkinData]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { font: { size: 11, family: "Inter, sans-serif" }, color: "#9ca3af", maxRotation: 45, minRotation: 45 },
        },
        y: {
          beginAtZero: true,
          grid: { display: true, color: "#e5e7eb", drawBorder: false, borderDash: [4, 4] },
          border: { display: false },
          ticks: {
            font: { size: 12, family: "Inter, sans-serif" },
            color: "#9ca3af",
            padding: 8,
            stepSize: 1,
            callback: function (value) {
              if (Number.isInteger(value)) return value;
            },
          },
        },
      },
      plugins: false,
    }),
    []
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 w-full h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
        <div className="flex items-center gap-2 font-semibold text-md text-gray-800">
          <Clock size={20} className="text-gray-600" />
          Check-in Timeline
        </div>
        <div className="flex items-center gap-3">
          {peakHour && totalCheckedIn > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <TrendingUp size={14} />
              <span>Peak: {peakHour}</span>
            </div>
          )}
          {totalCheckedIn > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
              <AlertTriangle size={14} />
              <span>{lateArrivalRate}% Late Arrivals</span>
              <span className="text-gray-400 ml-1">(after {LATE_THRESHOLD_HOUR}:00)</span>
            </div>
          )}
        </div>
      </div>
      <div className="relative flex-grow">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : totalCheckedIn === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-lg font-semibold text-gray-800">No check-ins recorded yet</p>
            <p className="text-sm text-gray-500 mt-2">Check-in data will appear here as attendees arrive at your event.</p>
          </div>
        ) : (
          <Bar data={chartBarData} options={chartOptions} />
        )}
      </div>
    </div>
  );
};

export default CheckinTimeline;
