import { GetIcon } from "../../../icons";

// Shimmer animation CSS
const shimmerStyle = `
  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
  
  .shimmer-animate {
    animation: shimmer 2s infinite;
    background: linear-gradient(90deg, #f8f8f8 25%, #f0f0f0 50%, #f8f8f8 75%);
    background-size: 200% 100%;
  }
`;

// Add styles to document
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = shimmerStyle;
  document.head.appendChild(style);
}

/**
 * MetricTile Component with loading state support
 * @param {Array} labels - Array of metric label configurations
 * @param {Object} data - Object containing metric data keyed by label.key
 * @param {Boolean} isLoading - Whether data is currently loading
 */
const MetricTile = ({ labels, data, isLoading = false }) => {
  return (
    <div className="flex gap-3 px-3 py-3 border border-stroke-soft shadow-sm shadow-gray-100 rounded-xl flex-wrap bg-bg-white">
      {labels.map((label, index) => {
        const metricData = data?.[label.key] ?? {};
        return (
          <div key={label.key || index} className="flex-1 bg-white px-0 py-0 flex items-center border-r border-stroke-soft last:border-r-0 md:last:border-r-0 max-md:border-r-0 min-h-16">
            <div className="flex items-center gap-3 w-full h-full" style={{ color: label.color }}>
              {label.icon?.length > 0 && (
                <div className="p-2.5 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: label.backgroundColor || "#eef4ff" }}>
                  <GetIcon icon={label.icon} />
                </div>
              )}
              <div className="flex flex-col gap-1 w-full justify-center">
                <span className="text-xs font-medium leading-3 tracking-wider text-left text-text-soft">{label.title}</span>
                {isLoading && data === null ? (
                  <div className="h-3 w-1/3 rounded shimmer-animate"></div>
                ) : (
                  <span className="text-sm font-medium leading-4 tracking-tighter text-left text-text-main">
                    {label.key === "Total amount" ? (
                      <>
                        {typeof metricData.count === "string" ? (
                          metricData.count
                        ) : (
                          <>
                            {metricData.currency?.toUpperCase()} {metricData.count}
                          </>
                        )}
                        {metricData?.total && ` / ${metricData.total}`}
                        {metricData?.suffix && metricData.suffix}
                      </>
                    ) : (
                      <>
                        {metricData?.count || 0}
                        {metricData?.total && ` / ${metricData.total}`}
                        {metricData?.suffix && metricData.suffix}
                      </>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricTile;
