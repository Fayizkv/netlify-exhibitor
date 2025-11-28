import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Ticket } from "lucide-react";
import { getData } from "../../../../backend/api";

ChartJS.register(ArcElement, Tooltip, Legend);

// Custom plugin to draw text in the center
const centerTextPlugin = {
  id: "centerText",
  afterDraw: (chart) => {
    const ctx = chart.ctx;
    const { width, height } = chart.chartArea;
    const centerX = width / 2 + chart.chartArea.left;
    const centerY = height / 2 + chart.chartArea.top + 25;

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Title Text
    ctx.font = "12px Inter, sans-serif";
    ctx.fillStyle = "#6b7280";
    ctx.fillText("TOTAL REGISTRATION", centerX, centerY - 10);

    // Value Text - Use the total registrations from the API
    ctx.font = "bold 28px Inter, sans-serif";
    ctx.fillStyle = "#1f2937";
    const total = chart.options.plugins?.centerText?.totalRegistrations || chart.data.datasets[0].data.reduce((sum, value) => sum + value, 0);
    ctx.fillText(total.toLocaleString(), centerX, centerY + 15);

    ctx.restore();
  },
};

ChartJS.register(centerTextPlugin);

const RegistrationBreakdownChart = ({ propData, eventId, hideTitle = false, totalCount, returningUserCount, attendance = false }) => {
  // console.log("totalCount", totalCount);
  // console.log("returningUserCount", returningUserCount);
  const [firstTime, setFirstTime] = useState(totalCount - returningUserCount);
  const [returning, setReturning] = useState(returningUserCount);
  const [totalRegistrations, setTotalRegistrations] = useState(totalCount || 0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);

  // console.log("totalCount", totalCount);
  // console.log("returningUserCount", returningUserCount);
  // Fetch franchise-wide registration breakdown data
  useEffect(() => {
    const fetchFranchiseRegistrationBreakdown = async () => {
      if (!eventId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // If totalCount and returningUserCount are provided, use them directly
        if (typeof totalCount === 'number' && typeof returningUserCount === 'number') {
          setTotalRegistrations(totalCount);
          setReturning(returningUserCount);
          setFirstTime(totalCount - returningUserCount);
          setIsLoading(false);
          return;
        }

  
      } catch (error) {
        console.error("Error fetching franchise registration breakdown:", error);
        setError("Failed to load franchise registration breakdown");
      } finally {
        setIsLoading(false);
      }
    };


    fetchFranchiseRegistrationBreakdown();

  }, [totalCount, returningUserCount]);

  // Keep total in sync if parent updates it later (without refetch)
  useEffect(() => {
    if (typeof totalCount === "number") {
      setTotalRegistrations(totalCount);
    }
  }, [totalCount]);

  // Chart data: only First Time and Returning
  const data = {
    labels: ["First Time Attendees", "Returning Attendees"],
    datasets: [
      {
        label: "Registrations",
        data: [firstTime, returning],
        backgroundColor: ["#F6C34F", "#6A44F2"],
        borderColor: ["#F6C34F", "#6A44F2"],
        borderWidth: 0,
        circumference: 180,
        rotation: -90,
        cutout: "75%",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            let label = context.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed !== null) {
              label += context.parsed.toLocaleString();
            }
            return label;
          },
        },
      },
      centerText: {
        totalRegistrations: totalRegistrations,
      },
    },
  };

  // Show loading indicator
  if (isLoading) {
    return (
      <div className={`${!hideTitle ? "bg-white rounded-xl border border-gray-200 p-5" : ""} w-full h-full flex flex-col`}>
        {!hideTitle && (
          <div className="flex items-center gap-2 font-semibold text-md text-gray-800 mb-4 border-b border-gray-100 pb-3">
            <Ticket size={20} className="text-gray-600" />
            Registration Breakdown
          </div>
        )}
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading data...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`${!hideTitle ? "bg-white rounded-xl border border-gray-200 p-5" : ""} w-full h-full flex flex-col`}>
        {!hideTitle && (
          <div className="flex items-center gap-2 font-semibold text-md text-gray-800 mb-4 border-b border-gray-100 pb-3">
            <Ticket size={20} className="text-gray-600" />
            Registration Breakdown
          </div>
        )}
        <div className="flex-grow flex flex-col items-center justify-center text-center">
          <p className="text-lg font-semibold text-gray-800">No registration breakdown yet</p>
          <p className="text-sm text-gray-500 mt-2">First-time and returning attendee stats will show up as registrations come in.</p>
        </div>
      </div>
    );
  }

  // Don't show empty state anymore, always render chart with at least default values
  return (
    <div className={`${!hideTitle ? "bg-white rounded-xl border border-gray-200 p-5" : ""} w-full h-full flex flex-col`}>
      {!hideTitle && (
        <div className="flex items-center gap-2 font-semibold text-md text-gray-800 mb-4 border-b border-gray-100 pb-3">
          <Ticket size={20} className="text-gray-600" />
          Registration Breakdown
        </div>
      )}
      <div className="relative flex-grow flex items-center justify-center">
        <Doughnut data={data} options={options} />
      </div>
      {/* Custom Legend */}
      <div className="flex justify-center items-center gap-6 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#F6C34F]"></span>
          <span className="text-sm text-gray-700 font-inter">First Time ({firstTime.toLocaleString()})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#6A44F2]"></span>
          <span className="text-sm text-gray-700 font-inter">Returning ({returning.toLocaleString()})</span>
        </div>
      </div>
    </div>
  );
};

export default RegistrationBreakdownChart;
