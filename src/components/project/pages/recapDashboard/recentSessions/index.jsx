import React from "react";
import { FileText } from "lucide-react";

const COLORS = ["blue", "green", "purple", "orange"];

const RecentSessions = ({ sessions = [], limit = 5, loading = false }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 h-[400px]">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FileText size={20} />
        Recent Sessions
      </h3>

      <div className="h-[300px] overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-gray-500">Loading sessions...</p>
          </div>
        ) : sessions?.length > 0 ? (
          <div className="space-y-3">
            {sessions.slice(0, limit).map((session, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-${COLORS[index % COLORS.length]}-500 rounded-full flex items-center justify-center text-white font-semibold`}>
                  {session.title?.substring(0, 2).toUpperCase() || "NA"}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{session.title || "Untitled Session"}</p>
                  <p className="text-xs text-gray-500">
                    Updated • {new Date(session.updatedAt).toLocaleDateString()}{" "}
                    {new Date(session.updatedAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-lg font-semibold text-gray-800">No recent sessions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentSessions;
