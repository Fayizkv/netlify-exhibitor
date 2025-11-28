import React from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { TrendingUp } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981"]; // blue-500, green-500

const PhotoBreakdownChart = ({ data = [], loading = false }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-gray-500">Loading photo breakdown...</span>
      </div>
    );
  }
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-gray-500">No photo breakdown data</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center">
        <PieChart width={200} height={200}>
          <Pie data={data} cx={100} cy={100} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>
      <div className="mt-4 space-y-2">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${index === 0 ? "bg-blue-500" : "bg-green-500"}`}></div>
              <span className="text-sm">{entry.name}</span>
            </div>
            <span className="text-sm font-semibold">{entry.value}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default PhotoBreakdownChart;
