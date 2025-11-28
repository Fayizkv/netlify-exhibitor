import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Clock } from "lucide-react";

const PhotoDownloadTimeChart = ({ data = [], loading = false }) => {
  // Always render the chart structure, even if data is empty
  const isEmpty = !data || data.length === 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-gray-500">Loading download time data...</span>
      </div>
    );
  }
  return (
    <div className="relative w-full h-[260px]">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          {/* <CartesianGrid /> */}
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="time" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
      {isEmpty && !loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-lg font-semibold text-gray-800">No download time data</span>
        </div>
      )}
    </div>
  );
};

export default PhotoDownloadTimeChart;
