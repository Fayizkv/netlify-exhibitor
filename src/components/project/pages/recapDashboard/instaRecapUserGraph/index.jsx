import React, { useState, useEffect } from "react";
import moment from "moment";

// InstaRecap User Graph component - matching RegistrationTimeline design
const InstaRecapUserGraph = ({ data = [], loading = false }) => {
  const [timelineData, setTimelineData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    setIsLoading(loading);
    if (!loading && data && data.length > 0) {
      // Process data - handle different possible formats
      const processedData = data.map((d) => {
        // Handle different data structures
        const date = d.date || d.createdAt || d._id;
        const users = d.users || d.count || d.value || 0;
        
        return {
          label: moment(date).format("MMM D"),
          fullDate: moment(date).format("MMM D, YYYY"),
          value: typeof users === 'number' ? users : parseInt(users) || 0,
        };
      });
      
      // Sort by date
      processedData.sort((a, b) => moment(a.fullDate, "MMM D, YYYY").diff(moment(b.fullDate, "MMM D, YYYY")));
      
      setTimelineData(processedData);
      setNoData(false);
    } else if (!loading) {
      setTimelineData([]);
      setNoData(true);
    }
  }, [data, loading]);

  // Chart dimensions and margins
  const width = 734;
  const height = 300;
  const margin = { top: 30, right: 30, bottom: 50, left: 40 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Only calculate scales if we have data
  const hasData = timelineData.length > 0;
  const maxDataValue = hasData ? Math.max(...timelineData.map((d) => d.value)) : 0;
  const yMax = getNiceYAxisMax(maxDataValue);
  
  // Generate y-axis ticks (divide into 5 equal segments)
  const yTicks = [];
  const tickCount = 5;
  for (let i = 0; i <= tickCount; i++) {
    yTicks.push(Math.round((yMax / tickCount) * i));
  }
  
  // X axis configuration - Use a subset of dates for readability
  const xLabels = hasData ? timelineData.filter((d, i) => i % Math.ceil(timelineData.length / 10) === 0).map((d) => d.label) : [];
  
  // Get X position based on index in the data array
  const getXPosition = (label) => {
    if (!hasData) return 0;
    const index = timelineData.findIndex((d) => d.label === label);
    return margin.left + (index / (timelineData.length - 1 || 1)) * chartWidth;
  };
  
  // Y scale function - converts data value to Y coordinate
  const yScale = (v) => chartHeight - ((v - 0) / (yMax - 0)) * chartHeight;
  
  // Tooltip state
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (event, index) => {
    if (!hasData) return;
    const svgRect = event.currentTarget.ownerSVGElement.getBoundingClientRect();
    const pointX = margin.left + (index / (timelineData.length - 1)) * chartWidth;
    const pointY = margin.top + yScale(timelineData[index].value);
    setHoveredIndex(index);
    setTooltipPos({ x: pointX, y: pointY - 15 });
  };
  
  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  // Generate polyline points string
  const points = hasData ? timelineData.map((d, i) => `${margin.left + (i / (timelineData.length - 1 || 1)) * chartWidth},${margin.top + yScale(d.value)}`).join(" ") : "";

  return (
    <div className="w-full">
      <div style={{ width: "100%", height: height }} className="relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-base"></div>
            <span className="ml-3 text-text-sub">Loading data...</span>
          </div>
        ) : noData || timelineData.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-lg font-semibold text-text-main">No user activity yet</p>
            <p className="text-sm text-text-sub mt-2">InstaRecap users will appear here as they start using the platform.</p>
          </div>
        ) : (
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* Y grid lines and labels */}
            {yTicks.map((tick) => (
              <g key={tick}>
                <line
                  x1={margin.left}
                  x2={width - margin.right}
                  y1={margin.top + yScale(tick)}
                  y2={margin.top + yScale(tick)}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                  strokeDasharray="4, 4"
                />
                <text
                  x={margin.left - 10}
                  y={margin.top + yScale(tick) + 5}
                  textAnchor="end"
                  fontSize={12}
                  fill="#9ca3af"
                  fontFamily="Inter, sans-serif"
                >
                  {tick}
                </text>
              </g>
            ))}

            {/* X axis labels - selected dates for readability */}
            {xLabels.map((label, i) => (
              <text
                key={i}
                x={getXPosition(label)}
                y={height - margin.bottom + 20}
                textAnchor="middle"
                fontSize={11}
                fill="#9ca3af"
                fontFamily="Inter, sans-serif"
              >
                {label}
              </text>
            ))}

            {/* Line path */}
            <polyline fill="none" stroke="#375DFB" strokeWidth={2} points={points} />

            {/* Data points - small blue dots */}
            {timelineData.map((d, i) => (
              <React.Fragment key={i}>
                <circle
                  cx={margin.left + (i / (timelineData.length - 1 || 1)) * chartWidth}
                  cy={margin.top + yScale(d.value)}
                  r={2}
                  fill="#375DFB"
                />
                <rect
                  x={margin.left + (i / (timelineData.length - 1 || 1)) * chartWidth - 10}
                  y={margin.top + yScale(d.value) - 10}
                  width={20}
                  height={20}
                  fill="transparent"
                  onMouseEnter={(e) => handleMouseMove(e, i)}
                  onMouseLeave={handleMouseLeave}
                  style={{ cursor: "pointer" }}
                />
              </React.Fragment>
            ))}

            {/* Hovered Point - larger highlighted dot */}
            {hoveredIndex !== null && (
              <circle
                cx={margin.left + (hoveredIndex / (timelineData.length - 1 || 1)) * chartWidth}
                cy={margin.top + yScale(timelineData[hoveredIndex].value)}
                r={5}
                fill="#375DFB"
                stroke="#fff"
                strokeWidth={2}
              />
            )}
          </svg>
        )}

        {/* Tooltip HTML Element */}
        {hoveredIndex !== null && timelineData.length > 0 && (
          <div
            className="absolute bg-white rounded shadow-lg px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-200"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y - 25}px`,
              transform: "translateX(-50%)",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            {`${timelineData[hoveredIndex].value} users on ${timelineData[hoveredIndex].fullDate}`}
          </div>
        )}
      </div>
    </div>
  );
};

function getNiceYAxisMax(maxValue) {
  if (maxValue <= 0) return 5; // fallback for empty data

  const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
  const niceSteps = [1, 2, 2.5, 4, 5, 10];

  for (let step of niceSteps) {
    const niceMax = step * magnitude;
    if (maxValue <= niceMax) {
      return niceMax;
    }
  }
  return 10 * magnitude;
}

export default InstaRecapUserGraph;
