import React, { useEffect, useState } from "react";
import { getData, postData } from "../../../../backend/api";
import { FileText, Users, Lightbulb, Clock, Image, BookOpen, Sparkles, UserCheck, TrendingUp, BarChart3, PieChart as PieChartIcon, Presentation, Twitter, Linkedin } from "lucide-react";
import moment from "moment";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ContentBreakdownChart from "./contentBreakdownChart";
import InstaRecapUserGraph from "./instaRecapUserGraph";
import RecentSessions from "./recentSessions";
import RecentInstaRecapUsers from "./recentInstaRecapUsers";

const getRelativeTime = (timestamp) => {
  if (!timestamp) return "Never logged in";
  const now = new Date();
  const loggedTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now - loggedTime) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return loggedTime.toLocaleDateString();
};

// const baseUrl = 'https://instarecap-app.ambitiousforest-1ab41110.centralindia.azurecontainerapps.io/api';
// const baseUrl = 'http://localhost:3000/api';
const InstaRecapDashboard = ({ openData, isFromAnalytics = false }) => {
  const [contentTypeData, setContentTypeData] = useState([]);
  const [loading, setIsLoading] = useState(false);
  const [eventId, setEventId] = useState("");
  const [recentSessions, setRecentSessions] = useState([]);
  const [recentProcessedSessions, setRecentProcessedSessions] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [usersOverTime, setUsersOverTime] = useState([]);
  const [statsData, setStatsData] = useState(null);

  useEffect(() => {
    setEventId(openData.data._id);
  }, [openData]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const event = eventId;
        const data = await getData({ event }, "dashboard/insta-recap-stats");
        const json = data.data;
        if (json.success) {
          setStatsData(json.data);
          setContentTypeData([
            { name: "InstaRecap Users", value: json.data["Instarecap Users"] || 0 },
            {
              name: "Transcripted Sessions",
              value: json.data["Total Transcribed Count"] || 0,
            },
            {
              name: "Key Takeaways",
              value: json.data["Total Regenerated Take Away Count"] || 0,
            },
            { name: "Hours Transcribed", value: json.data["Total Hours"] || 0 },
          ]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [eventId]);

  useEffect(() => {
    const fetchRecentSessions = async () => {
      setIsLoading(true);
      try {
        const event = eventId;
        const data = await getData({ event }, "dashboard/recent-sessions");
        const json = data.data;
        if (json.success) {
          setRecentSessions(json.response);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecentSessions();
  }, [eventId]);

  useEffect(() => {
    const fetchRecentUsers = async () => {
      setIsLoading(true);
      try {
        const event = eventId;
        const data = await getData({ event }, "dashboard/recap-recent-users");
        const json = data.data;
        if (json.success) {
          setRecentUsers(json.response);
          setUsersOverTime(json.usersOverTime);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecentUsers();
  }, [eventId]);

  useEffect(() => {
    const fetchRecentProcessedSessions = async () => {
      setIsLoading(true);
      try {
        const event = eventId;
        const data = await getData({ event }, "dashboard/recent-processed-sessions");
        const json = data.data;
        if (json.success) {
          setRecentProcessedSessions(json.response);
        }
      } finally {
        setIsLoading(false);
      }
    };
    if (eventId) {
      fetchRecentProcessedSessions();
    }
  }, [eventId]);

  // Sample data for charts
  const usersOverTimeData = [
    { date: "May 17", users: 1250 },
    { date: "May 18", users: 1400 },
    { date: "May 19", users: 1600 },
    { date: "May 20", users: 1850 },
    { date: "May 21", users: 2100 },
    { date: "May 22", users: 2400 },
    { date: "May 23", users: 2800 },
    { date: "May 24", users: 3200 },
    { date: "May 25", users: 3567 },
  ];

  const hourlyActivityData = [
    { hour: "8 AM", sessions: 45 },
    { hour: "9 AM", sessions: 89 },
    { hour: "10 AM", sessions: 156 },
    { hour: "11 AM", sessions: 234 },
    { hour: "12 PM", sessions: 189 },
    { hour: "1 PM", sessions: 276 },
    { hour: "2 PM", sessions: 342 },
    { hour: "3 PM", sessions: 398 },
    { hour: "4 PM", sessions: 425 },
    { hour: "5 PM", sessions: 389 },
    { hour: "6 PM", sessions: 298 },
    { hour: "7 PM", sessions: 234 },
  ];

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];
  return (
    <div className="min-h-screen">
      {/* Top Metrics Cards */}
      {statsData && (
        <>
          <div className="w-full border border-gray-200 p-2 bg-white rounded-xl shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              {/* TRANSCRIPTED SESSIONS Card */}
              <div className="flex items-center p-2 gap-3 border-r border-gray-200">
                <div className="flex items-center justify-center border border-gray-200 rounded-full">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#e2f6e6]">
                    <FileText className="text-green-500" width={18} height={18} />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium font-inter text-gray-500">TRANSCRIPTED SESSIONS</p>
                  <p className="text-[16px] font-bold font-inter text-gray-900">{statsData["Total Transcribed Count"] || 0}</p>
                </div>
              </div>
              {/* INSTARECAP USERS Card */}
              <div className="flex items-center p-2 gap-3 border-r border-gray-200">
                <div className="flex items-center justify-center border border-gray-200 rounded-full">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#deebff]">
                    <Users className="text-blue-500" width={18} height={18} />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium font-inter text-gray-500">INSTARECAP USERS</p>
                  <p className="text-[16px] font-bold font-inter text-gray-900">{statsData["Instarecap Users"] || 0}</p>
                </div>
              </div>
              {/* TWITTER POSTS REGENERATED Card */}
              <div className="flex items-center p-2 gap-3 border-r border-gray-200">
                <div className="flex items-center justify-center border border-gray-200 rounded-full">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#deebff]">
                    <Twitter className="text-blue-500" width={18} height={18} />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium font-inter text-gray-500">TWITTER POSTS REGENERATED</p>
                  <p className="text-[16px] font-bold font-inter text-gray-900">{statsData["Total Generated Twitter Posts"] || 0}</p>
                </div>
              </div>
              {/* HOURS TRANSCRIBED Card */}
              <div className="flex items-center p-2 gap-3">
                <div className="flex items-center justify-center border border-gray-200 rounded-full">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#e6e6f9]">
                    <Clock className="text-purple-500" width={18} height={18} />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium font-inter text-gray-500">HOURS TRANSCRIBED</p>
                  <p className="text-[16px] font-bold font-inter text-gray-900">{statsData["Total Hours"] || 0}</p>
                </div>
              </div>
              {/* KEY TAKEAWAYS Card */}
              {/* <div className="flex items-center p-2 gap-3 border-r border-gray-200">
                <div className="flex items-center justify-center border border-gray-200 rounded-full">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#ffe5e2]">
                    <Lightbulb
                      className="text-red-500"
                      width={18}
                      height={18}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium font-inter text-gray-500">
                    KEY TAKEAWAYS GENERATED
                  </p>
                  <p className="text-[16px] font-bold font-inter text-gray-900">
                    {contentTypeData[2].value}
                  </p>
                </div>
              </div> */}
              {/* HOURS TRANSCRIBED Card */}
              {/* <div className="flex items-center p-2 gap-3">
                <div className="flex items-center justify-center border border-gray-200 rounded-full">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#e6e6f9]">
                    <Clock className="text-purple-500" width={18} height={18} />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium font-inter text-gray-500">
                    LINKEDIN POSTS REGENERATED
                  </p>
                  <p className="text-[16px] font-bold font-inter text-gray-900">
                    {contentTypeData[3].value}
                  </p>
                </div>
              </div> */}
            </div>
          </div>
          {/* Duplicate cards row below */}
          {/* <div className="w-full border border-gray-200 p-2 bg-white rounded-xl shadow-sm mb-6"> */}
          {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-2"> */}
          {/* TWITTER POSTS REGENERATED Card */}
          {/* <div className="flex items-center p-2 gap-3 border-r border-gray-200">
                <div className="flex items-center justify-center border border-gray-200 rounded-full">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#deebff]">
                    <Image className="text-blue-500" width={18} height={18} />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium font-inter text-gray-500">
                    TWITTER POSTS REGENERATED
                  </p>
                  <p className="text-[16px] font-bold font-inter text-gray-900">
                    {contentTypeData[1].value}
                  </p>
                </div>
              </div> */}
          {/* HOURS TRANSCRIBED Card */}
          {/* <div className="flex items-center p-2 gap-3">
                <div className="flex items-center justify-center border border-gray-200 rounded-full">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#e6e6f9]">
                    <Clock className="text-purple-500" width={18} height={18} />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-medium font-inter text-gray-500">
                    HOURS TRANSCRIBED
                  </p>
                  <p className="text-[16px] font-bold font-inter text-gray-900">
                    {contentTypeData[3].value}
                  </p>
                </div>
              </div> */}
          {/* </div> */}
          {/* </div> */}
        </>
      )}

      {isFromAnalytics ? (
        // Analytics View Layout
        <div className="flex flex-col gap-6">
          {/* First Row: Overview and Graph */}
          <div className="grid grid-cols-12 gap-6">
            {/* InstaRecap Overview */}
            <div className="col-span-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm h-full flex flex-col">
                <div className="flex items-center gap-2 font-semibold text-md text-gray-800 mb-4 border-b border-gray-100 pb-3">
                  <BarChart3 size={20} className="text-gray-600" />
                  InstaRecap Overview
                </div>
                <div className="space-y-4 py-2">
                  {/* Total Hours */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock size={18} className="text-purple-600" />
                      <span className="text-sm text-gray-600 font-inter">Total Hours</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600 font-inter">{statsData?.["Total Hours"] || 0}</span>
                  </div>
                  {/* Total Transcribed Sessions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-green-600" />
                      <span className="text-sm text-gray-600 font-inter">Total Transcribed Sessions</span>
                    </div>
                    <span className="text-lg font-bold text-green-600 font-inter">{`${statsData?.["Total Transcribed Count"] || 0} / ${statsData?.["Total Sessions"] || 0}`}</span>
                  </div>
                  {/* Total Regenerated Take Away Count */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Lightbulb size={18} className="text-orange-600" />
                      <span className="text-sm text-gray-600 font-inter">Total Regenerated Take Aways</span>
                    </div>
                    <span className="text-lg font-bold text-orange-600 font-inter">{statsData?.["Total Regenerated Take Away Count"] || 0}</span>
                  </div>
                  {/* Total Generated Linkedin Posts */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Linkedin size={18} className="text-blue-600" />
                      <span className="text-sm text-gray-600 font-inter">Total Generated Linkedin Posts</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600 font-inter">{statsData?.["Total Generated Linkedin Posts"] || 0}</span>
                  </div>
                  {/* Total Generated Twitter Posts */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Twitter size={18} className="text-sky-600" />
                      <span className="text-sm text-gray-600 font-inter">Total Generated Twitter Posts</span>
                    </div>
                    <span className="text-lg font-bold text-sky-600 font-inter">{statsData?.["Total Generated Twitter Posts"] || 0}</span>
                  </div>
                  {/* Instarecap Users */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users size={18} className="text-indigo-600" />
                      <span className="text-sm text-gray-600 font-inter">Instarecap Users</span>
                    </div>
                    <span className="text-lg font-bold text-indigo-600 font-inter">{statsData?.["Instarecap Users"] || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* InstaRecap User Graph - Expanded */}
            <div className="col-span-8">
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm h-full flex flex-col">
                <div className="flex items-center gap-2 font-semibold text-md text-gray-800 mb-4 border-b border-gray-100 pb-3">
                  <TrendingUp size={20} className="text-gray-600" />
                  InstaRecap Users Across Time
                </div>
                <div className="flex-grow w-full h-[calc(100%-3rem)]">
                  <InstaRecapUserGraph data={usersOverTime} loading={loading} />
                </div>
              </div>
            </div>
          </div>
          {/* Second Row: Recent Users and Recent Sessions */}
          <div className="grid grid-cols-12 gap-6">
            {/* Recent InstaRecap Users */}
            <div className="col-span-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm h-full flex flex-col">
                <div className="flex items-center gap-2 font-semibold text-md text-gray-800 mb-4 border-b border-gray-100 pb-3">
                  <Users size={20} className="text-gray-600" />
                  Recent InstaRecap Users
                </div>
                <RecentInstaRecapUsers users={recentUsers} limit={5} loading={loading} />
              </div>
            </div>
            {/* Recent Processed Sessions */}
            <div className="col-span-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm h-full flex flex-col">
                <div className="flex items-center gap-2 font-semibold text-md text-gray-800 mb-4 border-b border-gray-100 pb-3">
                  <FileText size={20} className="text-gray-600" />
                  Recent Processed Sessions
                </div>
                <div className="flex-grow overflow-y-auto">
                  {loading ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-sm text-gray-500">Loading sessions...</p>
                    </div>
                  ) : recentProcessedSessions?.length > 0 ? (
                    <div className="space-y-3">
                      {recentProcessedSessions.slice(0, 5).map((session, index) => (
                        <div key={session._id || index} className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${session.audioProcess === "processed" ? "bg-green-500" : "bg-blue-500"}`}>
                            {session.title?.substring(0, 2).toUpperCase() || "NA"}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{session.title || "Untitled Session"}</p>
                            <p className="text-xs text-gray-500">
                              {session.audioProcess === "processed" ? "Processed" : "Translating"} • {moment(session.updatedAt).fromNow()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-lg font-semibold text-gray-800">No recent processed sessions</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Default View Layout (when accessed directly)
        <div className="flex w-[100%] flex-col gap-4 p-2">
          {/* First Row: Overview and Graph */}
          <div className="flex w-[100%] flex-col md:flex-row gap-4">
            {/* InstaRecap Overview */}
            <div className="w-full md:w-[33.3%]">
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm h-full flex flex-col">
                <div className="flex items-center gap-2 font-semibold text-md text-gray-800 mb-4 border-b border-gray-100 pb-3">
                  <BarChart3 size={20} className="text-gray-600" />
                  InstaRecap Overview
                </div>
                <div className="space-y-4 py-2">
                  {/* Total Hours */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock size={18} className="text-purple-600" />
                      <span className="text-sm text-gray-600 font-inter">Total Hours Transcribed</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600 font-inter">{statsData?.["Total Hours"] || 0}</span>
                  </div>
                  {/* Total Transcribed Sessions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-green-600" />
                      <span className="text-sm text-gray-600 font-inter">Total Transcribed Sessions</span>
                    </div>
                    <span className="text-lg font-bold text-green-600 font-inter">{`${statsData?.["Total Transcribed Count"] || 0} / ${statsData?.["Total Sessions"] || 0}`}</span>
                  </div>
                  {/* Total Regenerated Take Away Count */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Lightbulb size={18} className="text-orange-600" />
                      <span className="text-sm text-gray-600 font-inter">Take Aways Generated</span>
                    </div>
                    <span className="text-lg font-bold text-orange-600 font-inter">{statsData?.["Total Regenerated Take Away Count"] || 0}</span>
                  </div>
                  {/* Total Generated Linkedin Posts */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Linkedin size={18} className="text-blue-600" />
                      <span className="text-sm text-gray-600 font-inter">Linkedin Posts Generated</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600 font-inter">{statsData?.["Total Generated Linkedin Posts"] || 0}</span>
                  </div>
                  {/* Total Generated Twitter Posts */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Twitter size={18} className="text-sky-600" />
                      <span className="text-sm text-gray-600 font-inter">Twitter Posts Generated</span>
                    </div>
                    <span className="text-lg font-bold text-sky-600 font-inter">{statsData?.["Total Generated Twitter Posts"] || 0}</span>
                  </div>
                  {/* Instarecap Users */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users size={18} className="text-indigo-600" />
                      <span className="text-sm text-gray-600 font-inter">Instarecap Users</span>
                    </div>
                    <span className="text-lg font-bold text-indigo-600 font-inter">{statsData?.["Instarecap Users"] || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* InstaRecap User Graph - Expanded */}
            <div className="w-full md:w-[66.6%]">
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm h-full flex flex-col">
                <div className="flex items-center gap-2 font-semibold text-md text-gray-800 mb-4 border-b border-gray-100 pb-3">
                  <TrendingUp size={20} className="text-gray-600" />
                  InstaRecap Users Across Time
                </div>
                <div className="flex-grow w-full h-[calc(100%-3rem)]">
                  <InstaRecapUserGraph data={usersOverTime} loading={loading} />
                </div>
              </div>
            </div>
          </div>
          {/* Second Row: Recent Users and Recent Sessions */}
          <div className="flex w-[100%] flex-col md:flex-row gap-4">
            {/* Recent InstaRecap Users */}
            <div className="w-full md:w-[50%]">
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm h-full flex flex-col">
                <div className="flex items-center gap-2 font-semibold text-md text-gray-800 mb-4 border-b border-gray-100 pb-3">
                  <Users size={20} className="text-gray-600" />
                  Recent InstaRecap Users
                </div>
                <RecentInstaRecapUsers users={recentUsers} limit={5} loading={loading} />
              </div>
            </div>
            {/* Recent Processed Sessions */}
            <div className="w-full md:w-[50%]">
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm h-full flex flex-col">
                <div className="flex items-center gap-2 font-semibold text-md text-gray-800 mb-4 border-b border-gray-100 pb-3">
                  <FileText size={20} className="text-gray-600" />
                  Recent Processed Sessions
                </div>
                <div className="flex-grow overflow-y-auto">
                  {loading ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-sm text-gray-500">Loading sessions...</p>
                    </div>
                  ) : recentProcessedSessions?.length > 0 ? (
                    <div className="space-y-3">
                      {recentProcessedSessions.slice(0, 5).map((session, index) => (
                        <div key={session._id || index} className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${session.audioProcess === "processed" ? "bg-green-500" : "bg-blue-500"}`}>
                            {session.title?.substring(0, 2).toUpperCase() || "NA"}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{session.title || "Untitled Session"}</p>
                            <p className="text-xs text-gray-500">
                              {session.audioProcess === "processed" ? "Processed" : "Translating"} • {moment(session.updatedAt).fromNow()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-lg font-semibold text-gray-800">No recent processed sessions</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstaRecapDashboard;
