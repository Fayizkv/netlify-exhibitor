import React, { useState, useEffect, useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Ticket } from "lucide-react";
import { getData } from "../../../../backend/api";

ChartJS.register(ArcElement, Tooltip, Legend);

// Default empty state while data is loading
const defaultAttendanceData = {};
const defaultTicketTypes = [];

// Consistent color palette for ticket types
const colorPalette = ["#4F46E5", "#34D399", "#F6C34F", "#F87171", "#60A5FA", "#9333EA", "#EC4899", "#10B981", "#F59E0B", "#6366F1", "#8B5CF6", "#14B8A6", "#EF4444", "#3B82F6", "#D946EF"];

// Custom plugin to draw text in the center (Total Checked-in)
export const centerCheckinTextPlugin = {
  id: "centerCheckinText",
  afterDraw: (chart) => {
    if (!chart.options.plugins.centerText || !chart.options.plugins.centerText.display) {
      return;
    }
    const ctx = chart.ctx;
    const { width, height } = chart.chartArea;
    const centerX = width / 2 + chart.chartArea.left;
    const centerY = height / 2 + chart.chartArea.top;

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Title Text
    ctx.font = "12px Inter, sans-serif";
    ctx.fillStyle = "#6b7280";
    ctx.fillText("TOTAL CHECKED-IN", centerX, centerY - 10);

    // Value Text
    ctx.font = "bold 28px Inter, sans-serif";
    ctx.fillStyle = "#1f2937";
    const total = chart.data.datasets[0].data.reduce((sum, value) => sum + value, 0);
    ctx.fillText(total.toLocaleString(), centerX, centerY + 15);
    ctx.restore();
  },
};

const RegistrationByTicket = ({ propData, eventId, hideTitle = false }) => {
  const [attendanceData, setAttendanceData] = useState(defaultAttendanceData);
  const [ticketTypes, setTicketTypes] = useState(defaultTicketTypes);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch attendance data from API
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!eventId) {
        setIsLoading(false);
        return;
      }
      if (!propData) {
        return;
      }
      try {
        setIsLoading(true);
        // console.log(propData, "propData");
        const ticketTypes = propData.map((item, index) => ({
          key: item.title,
          name: item.title,
          color: colorPalette[index % colorPalette.length] 
        }));
        const attendanceData = {};
        propData.forEach((item) => {
          attendanceData[item.title] = item.registrationCount;
        });

        setTicketTypes(ticketTypes);
        setAttendanceData(attendanceData);
       
        
      } catch (error) {
        setError("Failed to load attendance data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendanceData();
  }, [eventId, propData]);

  // Prepare data for the chart based on available ticket types
  const { chartLabels, chartData, backgroundColors } = useMemo(() => {
    const labels = [];
    const dataPoints = [];
    const colors = [];

    ticketTypes.forEach((type) => {
      if (attendanceData[type.key] !== undefined && attendanceData[type.key] > 0) {
        labels.push(type.name);
        dataPoints.push(attendanceData[type.key]);
        colors.push(type.color || "#cccccc");
      }
    });
    return { chartLabels: labels, chartData: dataPoints, backgroundColors: colors };
  }, [ticketTypes, attendanceData]);

  const data = useMemo(
    () => ({
      labels: chartLabels,
      datasets: [{ label: "Registrations", data: chartData, backgroundColor: backgroundColors, borderColor: "#ffffff", borderWidth: 2, cutout: "75%" }],
    }),
    [chartLabels, chartData, backgroundColors]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: "bottom", align: "center", labels: { boxWidth: 12, padding: 15, font: { size: 11, family: "Inter, sans-serif" }, color: "#6b7280" } },
        tooltip: {
          enabled: true,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          titleColor: "#1f2937",
          bodyColor: "#374151",
          borderColor: "#e5e7eb",
          borderWidth: 1,
          padding: 8,
          displayColors: false,
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
            title: () => null,
          },
        },
        centerText: { display: true },
      },
    }),
    []
  );

  // Show loading indicator
  if (isLoading) {
    return (
      <div className={`${!hideTitle ? "bg-white rounded-xl border border-gray-200 p-5" : ""} w-full h-full flex flex-col`}>
        {!hideTitle && (
          <div className="flex items-center gap-2 font-semibold text-md text-gray-800 mb-4 border-b border-gray-100 pb-3">
            <Ticket size={20} className="text-gray-600" />
            Registrations by Ticket Type
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
            Registrations by Ticket Type
          </div>
        )}
        <div className="flex-grow flex items-center justify-center text-gray-500">{error}</div>
      </div>
    );
  }

  // Don't render the chart if there's no data
  if (chartData.length === 0 || chartData.reduce((sum, val) => sum + val, 0) === 0) {
    return (
      <div className={`${!hideTitle ? "bg-white rounded-xl border border-gray-200 p-5" : ""} w-full h-full flex flex-col`}>
        {!hideTitle && (
          <div className="flex items-center gap-2 font-semibold text-md text-gray-800 mb-4 border-b border-gray-100 pb-3">
            <Ticket size={20} className="text-gray-600" />
            Registrations by Ticket Type
          </div>
        )}
        <div className="flex-grow flex items-center justify-center" style={{ minHeight: "235px" }}>
          <div className="w-full flex flex-col items-center justify-center text-center">
            <p className="text-lg font-semibold text-gray-800">No ticket registrations yet</p>
            <p className="text-sm text-gray-500 mt-2">Encourage attendees to register for different ticket types.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${!hideTitle ? "bg-white rounded-xl border border-gray-200 p-5" : ""} w-full h-full flex flex-col`}>
      {/* Card Header */}
      {!hideTitle && (
        <div className="flex items-center gap-2 font-semibold text-md text-gray-800 mb-4 border-b border-gray-100 pb-3">
          <Ticket size={20} className="text-gray-600" />
          Registrations by Ticket Type
        </div>
      )}
      {/* Chart Area */}
      <div className="relative flex-grow flex items-center justify-center" style={{ minHeight: "300px" }}>
      {  <Doughnut data={data} options={options} />}
      </div>
    </div>
  );
};

export default RegistrationByTicket;
