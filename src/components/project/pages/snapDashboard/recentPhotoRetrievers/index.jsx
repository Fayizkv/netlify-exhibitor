import React from "react";
import moment from "moment";
import { Download } from "lucide-react";

// Helper to get initials from name
const getInitials = (name) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Helper to get consistent Tailwind color class
const getRandomColor = (index) => {
  const colors = ["red", "blue", "green", "purple", "yellow", "pink"];
  return colors[index % colors.length];
};

const RecentPhotoRetrievers = ({ users = [], limit = 5, loading = false }) => {
  return (
    <div className="space-y-3 h-full">
      {loading ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-sm text-gray-500">Loading recent retrievers...</p>
        </div>
      ) : users?.length > 0 ? (
        users.slice(0, limit).map((user, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-${getRandomColor(index)}-500 rounded-full flex items-center justify-center text-white font-semibold`}>{getInitials(user.fullName || "N/A")}</div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{user.fullName || "N/A"}</p>
              <p className="text-xs text-gray-500">{moment(user.instaSnapLoggedTime).fromNow()}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="h-full flex items-center justify-center">
          <p className="text-lg font-semibold text-gray-800">No recent retrievers</p>
        </div>
      )}
    </div>
  );
};

export default RecentPhotoRetrievers;
