import React from "react";
import CustomTooltip from "./index";

const TooltipDemo = () => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Tooltip Demo</h2>

      {/* Simple Tooltips */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Simple Tooltips</h3>
        <div className="flex flex-wrap gap-3">
          <CustomTooltip content="Simple warning message" variant="warning" size="large">
            <button className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Warning</button>
          </CustomTooltip>

          <CustomTooltip content="Error occurred!" variant="error" size="small">
            <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Error</button>
          </CustomTooltip>
        </div>
      </div>

      {/* Rich Content Tooltips */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Rich Content Tooltips</h3>
        <div className="flex flex-wrap gap-3">
          <CustomTooltip
            content={
              <div className="space-y-1">
                <div className="font-semibold text-sm leading-tight">AlignUI Design System</div>
                <div className="text-xs leading-relaxed opacity-90">Professional tooltip design inspired by AlignUI's clean aesthetics and modern UI patterns.</div>
              </div>
            }
            variant="default"
          >
            <button className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm">Rich Tooltip</button>
          </CustomTooltip>

          <CustomTooltip
            content={
              <div className="space-y-1">
                <div className="font-semibold text-sm leading-tight">Success State</div>
                <div className="text-xs leading-relaxed opacity-90">Operation completed successfully with no errors.</div>
              </div>
            }
            variant="success"
          >
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Success</button>
          </CustomTooltip>

          <CustomTooltip
            content={
              <div className="space-y-1">
                <div className="font-semibold text-sm leading-tight">Information Panel</div>
                <div className="text-xs leading-relaxed opacity-90">This tooltip provides helpful context and additional information about the feature you're interacting with.</div>
              </div>
            }
            variant="info"
          >
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Info</button>
          </CustomTooltip>

          <CustomTooltip
            content={
              <div className="space-y-1">
                <div className="font-semibold text-sm leading-tight">Dark Theme</div>
                <div className="text-xs leading-relaxed opacity-90">Professional dark tooltip with enhanced contrast and readability.</div>
              </div>
            }
            variant="dark"
          >
            <button className="bg-gray-800 hover:bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Dark</button>
          </CustomTooltip>
        </div>
      </div>

      {/* AlignUI Tooltip 04 Style */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">AlignUI Tooltip 04 Style</h3>
        <div className="flex flex-wrap gap-3">
          <CustomTooltip
            content={
              <div className="space-y-3">
                {/* Progress bar (AlignUI Tooltip 04 style) */}
                <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-300" style={{ width: "100%" }} />
                </div>

                {/* Header text */}
                <div className="text-sm font-medium text-gray-700 leading-tight">Must contain at least;</div>

                {/* List items with checkmarks */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-sm text-gray-700 leading-tight">At least 1 uppercase</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-sm text-gray-700 leading-tight">At least 1 number</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-sm text-gray-700 leading-tight">At least 8 characters</span>
                  </div>
                </div>
              </div>
            }
            variant="default"
            size="large"
          >
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Password Requirements</button>
          </CustomTooltip>
        </div>
      </div>

      {/* Different Positions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Different Positions</h3>
        <div className="flex flex-wrap gap-3">
          <CustomTooltip content="Top tooltip" place="top">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Top</button>
          </CustomTooltip>

          <CustomTooltip content="Right tooltip" place="right">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Right</button>
          </CustomTooltip>

          <CustomTooltip content="Bottom tooltip" place="bottom">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Bottom</button>
          </CustomTooltip>

          <CustomTooltip content="Left tooltip" place="left">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Left</button>
          </CustomTooltip>
        </div>
      </div>

      {/* Different Sizes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Different Sizes</h3>
        <div className="flex flex-wrap gap-3">
          <CustomTooltip content="Small tooltip" size="small">
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Small</button>
          </CustomTooltip>

          <CustomTooltip content="Medium tooltip (default)" size="medium">
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Medium</button>
          </CustomTooltip>

          <CustomTooltip content="Large tooltip with more content" size="large">
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">Large</button>
          </CustomTooltip>
        </div>
      </div>
    </div>
  );
};

export default TooltipDemo;
