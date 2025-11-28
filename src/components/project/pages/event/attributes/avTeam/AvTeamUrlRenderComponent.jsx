import React, { useState, useEffect } from "react";
import AvTeamUrlBox from "./AvTeamUrlBox";

// AV Team URL Render Component - wraps AvTeamUrlBox for dynamic rendering
const AvTeamUrlRenderComponent = ({ eventId }) => {
  const [AvTeamUrlBoxComponent, setAvTeamUrlBoxComponent] = useState(null);

  useEffect(() => {
    // Import dynamically to avoid build-time errors
    import("./AvTeamUrlBox")
      .then((module) => {
        setAvTeamUrlBoxComponent(() => module.default);
      })
      .catch((err) => {
        console.error("Failed to load AvTeamUrlBox:", err);
        setAvTeamUrlBoxComponent(() => () => (
          <div className="flex items-center justify-between w-full">
            <div>
              <h3 className="text-sm font-medium text-text-main mb-1">AV Team Access URL</h3>
              <p className="text-xs text-text-sub">Loading URL...</p>
            </div>
          </div>
        ));
      });
  }, []);

  if (!AvTeamUrlBoxComponent) {
    return (
      <div className="flex items-center justify-between w-full">
        <div>
          <h3 className="text-sm font-medium text-text-main mb-1">AV Team Access URL</h3>
          <p className="text-xs text-text-sub">Loading...</p>
        </div>
      </div>
    );
  }

  return <AvTeamUrlBoxComponent eventId={eventId} />;
};

export default AvTeamUrlRenderComponent;
