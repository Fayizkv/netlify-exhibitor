import React from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { PieChartIcon } from "lucide-react";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"]; // Extend if more categories

const ContentBreakdownChart = ({ data = [], isFromAnalytics = false, loading = false }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-gray-500">Loading content breakdown...</span>
      </div>
    );
  }
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-lg font-semibold text-gray-800">No content breakdown data</span>
      </div>
    );
  }

  if (isFromAnalytics) {
    // Analytics view: fixed height, horizontal legend
    return (
      <>
        <div className="flex flex-col items-center justify-center flex-1 pt-2 pb-2">
          <PieChart width={160} height={160} className="mx-auto">
            <Pie data={data} cx={80} cy={80} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
          {/* Two-column, bold, spaced legend below the chart */}
          <div className="w-full mt-4">
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-sm font-normal whitespace-nowrap">{item.name}</span>
                </div>
                <span className="text-base font-bold ml-8">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  // Default/standalone view: original layout
  return (
    <>
      <div className="flex flex-col items-center justify-center h-[calc(100%-3.5rem)] ">
        <PieChart width={220} height={220} className="mx-auto">
          <Pie data={data} cx={110} cy={110} innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
        <div className="w-full  p-2">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between ">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-sm font-normal whitespace-nowrap">{item.name}</span>
              </div>
              <span className="text-base font-bold ">{item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ContentBreakdownChart;
