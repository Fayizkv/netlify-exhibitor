import React from "react";
import { Users } from "lucide-react";

const bgColors = ["bg-indigo-500", "bg-pink-500", "bg-teal-500", "bg-red-500"];

// Utility to get relative time like "2 hours ago"
const getRelativeTime = (timestamp) => {
  const now = new Date();
  const past = new Date(timestamp);
  const diff = Math.floor((now - past) / 1000); // in seconds

  if (diff < 60) return `${diff} sec ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};

const RecentInstaRecapUsers = ({ users = [], limit = 5, loading = false }) => {
  // Only show available users, no placeholders
  const displayUsers = users.slice(0, limit);
  // Dynamically adjust gap based on number of users
  let gapClass = "space-y-4";
  if (displayUsers.length < limit && displayUsers.length > 0) {
    gapClass = displayUsers.length === 1 ? "space-y-20" : displayUsers.length === 2 ? "space-y-10" : displayUsers.length === 3 ? "space-y-7" : "space-y-5";
    console.log(`Adjusting gap for ${displayUsers.length} users: ${gapClass}`);
  }
  return (
    <div className={`${gapClass} h-full`}>
      {loading ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-sm text-gray-500">Loading users...</p>
        </div>
      ) : displayUsers.length > 0 ? (
        <>
          {displayUsers.map((user, index) => {
            const initials = user.fullname
              ? user.fullname
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
              : "NA";

            return (
              <div key={user.authenticationId || index} className="flex items-center gap-4 py-1">
                <div className={`w-10 h-10 ${bgColors[index % bgColors.length]} rounded-full flex items-center justify-center text-white font-semibold`}>{initials}</div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{user.fullname || "Anonymous User"}</p>
                  <p className="text-xs text-gray-500">Last Logged In: {getRelativeTime(user.instarecapLoggedTime)}</p>
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <div className="h-full flex items-center justify-center">
          <p className="text-lg font-semibold text-gray-800">No InstaRecap users</p>
        </div>
      )}
    </div>
  );
};

export default RecentInstaRecapUsers;
