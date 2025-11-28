import React from "react";
import moment from "moment";
import { Upload } from "lucide-react";

// Helpers
const getInitials = (name) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getRandomColor = (index) => {
  const colors = ["red", "blue", "green", "purple", "yellow", "pink"];
  return colors[index % colors.length];
};

const RecentPhotoContributors = ({ contributors = [], limit = 5, loading = false }) => {
  // Only show available contributors, no placeholders
  const displayContributors = contributors.slice(0, limit);
  // Dynamically adjust gap based on number of contributors
  let gapClass = "space-y-4";
  if (displayContributors.length < limit && displayContributors.length > 0) {
    // Increase gap to fill the box more evenly
    gapClass = displayContributors.length === 1 ? "space-y-20" : displayContributors.length === 2 ? "space-y-10" : displayContributors.length === 3 ? "space-y-7" : "space-y-5";
    console.log(`Adjusting gap for ${displayContributors.length} contributors: ${gapClass}`);
  }
  return (
    <div className={`${gapClass} h-full`}>
      {loading ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-sm text-gray-500">Loading recent contributors...</p>
        </div>
      ) : displayContributors.length > 0 ? (
        <>
          {displayContributors.map((contributor, index) => (
            <div key={index} className="flex items-center gap-4 py-1">
              <div className={`w-10 h-10 bg-${getRandomColor(index)}-500 rounded-full flex items-center justify-center text-white font-semibold`}>
                {getInitials(contributor.addedBy?.fullName || "N/A")}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{contributor.addedBy?.fullName || "N/A"}</p>
                <p className="text-xs text-gray-500">{moment(contributor.createdAt).fromNow()}</p>
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="h-full flex items-center justify-center">
          <p className="text-lg font-semibold text-gray-800">No recent contributors</p>
        </div>
      )}
    </div>
  );
};

export default RecentPhotoContributors;
