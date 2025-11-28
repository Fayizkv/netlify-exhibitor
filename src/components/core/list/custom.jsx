import React, { useState, useMemo, Suspense, lazy } from "react";
import { useSelector } from "react-redux";
import { RowContainer } from "../../styles/containers/styles";

// Loading component for lazy-loaded pages
const LazyLoadingFallback = ({ pageName }) => (
  <div className="flex items-center justify-center min-h-[400px] w-full">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <div className="text-sm text-gray-600">
        Loading {pageName || 'content'}...
      </div>
    </div>
  </div>
);

// Error boundary for lazy-loaded components
class LazyErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px] w-full">
          <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
            <div className="text-red-600 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to load content</h3>
            <p className="text-sm text-red-600 mb-4">
              There was an error loading this page. Please try refreshing.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const CustomPageTemplate = React.memo((props) => {
  const Page = props.content;
  const themeColors = useSelector((state) => state.themeColors);
  
  // Memoize the data to prevent unnecessary re-renders
  const data = useMemo(() => props, [
    props.openData?.data?._id,
    props.page,
    props.setLoaderBox,
    props.setMessage,
    props.viewMode
  ]);
  
  // Memoize the className to prevent string concatenation on every render
  const className = useMemo(() => 
    "data-layout " + (props.viewMode || ""), 
    [props.viewMode]
  );

  // Get page name for better loading messages
  const pageName = useMemo(() => {
    if (props.page) {
      return props.page.charAt(0).toUpperCase() + props.page.slice(1);
    }
    return props.title || 'Content';
  }, [props.page, props.title]);
  
  return (
    <RowContainer theme={themeColors} className={className}>
      {data && (
        <LazyErrorBoundary>
          <Suspense fallback={<LazyLoadingFallback pageName={pageName} />}>
            <Page {...data} themeColors={themeColors} />
          </Suspense>
        </LazyErrorBoundary>
      )}
    </RowContainer>
  );
});
