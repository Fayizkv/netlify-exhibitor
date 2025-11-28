import React, { useState, useEffect, useMemo } from "react";
import { getData, postData } from "../../../../backend/api";
import { Camera, Star, Upload, Download, Users, Clock, TrendingUp, FileImage, BarChart3 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import moment from "moment";
import PhotoBreakdownChart from "./photoBreakdownChart";
import PhotoDownloadTimeChart from "./photoDownloadTimeChart";
import RecentPhotoRetrievers from "./recentPhotoRetrievers";
import RecentPhotoContributors from "./recentPhotoContributors";

const InstaSnapDashboard = ({ openData, isFromAnalytics = false }) => {
  // Sample data for charts
  const [totalUploaded, setTotalUploaded] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [averageSize, setAverageSize] = useState(0);
  const [uniqueUser, setUniqueUser] = useState(0);
  const [highlightImages, setHighlightImages] = useState(0);
  const [contribute, setContribute] = useState(0);
  const [event, setEvent] = useState("");
  const [photoTypeData, setPhotoTypeData] = useState([]);
  const [recentContributers, setRecentContributers] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [usersOverTime, setUsersOverTime] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log(openData, "open data");
    setEvent(openData.data._id);
  }, [openData]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getData({ event }, "dashboard/insta");
        console.log(data, "data");
        setTotalUploaded(data.data[0]);
        setTotalSize(data.data[1]);
        setAverageSize(data.data[2]);
        setUniqueUser(data.data[3]);
        setHighlightImages(data.data[4]);
        setContribute(data.data[5]);
        setPhotoTypeData([
          { name: "Contributed", value: data.data[5].count },
          { name: "Highlighted", value: data.data[4].count },
        ]);
      } finally {
        setLoading(false);
      }
    };
    if (event) {
      fetchData();
    }
  }, [event]);

  useEffect(() => {
    const fetchRecentContributers = async () => {
      setLoading(true);
      try {
        const data = await getData({ event }, "dashboard/recent-contributers");
        console.log(data, "data");
        const formattedData = data.data.response.map((item) => ({
          addedBy: item?.addedBy || { fullName: "N/A" },
          createdAt: item.createdAt,
        }));
        console.log(formattedData, "formattedData");
        setRecentContributers(formattedData);
      } finally {
        setLoading(false);
      }
    };
    if (event) {
      fetchRecentContributers();
    }
  }, [event]);

  useEffect(() => {
    const fetchRecentUsers = async () => {
      setLoading(true);
      try {
        const data = await getData({ event }, "dashboard/snap-recent-users");
        console.log(data, "data");
        setRecentUsers(data.data.response);
        setUsersOverTime(data.data.usersOverTime);
      } finally {
        setLoading(false);
      }
    };
    if (event) {
      fetchRecentUsers();
    }
  }, [event]);

  const downloadTimeData = [
    { date: "May 17", time: 2.1 },
    { date: "May 18", time: 2.3 },
    { date: "May 19", time: 2.5 },
    { date: "May 20", time: 2.2 },
    { date: "May 21", time: 3.1 },
    { date: "May 22", time: 4.2 },
    { date: "May 23", time: 3.8 },
    { date: "May 24", time: 2.9 },
    { date: "May 25", time: 2.4 },
  ];

  const hourlyActivityData = [
    { hour: "10 AM", count: 45 },
    { hour: "11 AM", count: 67 },
    { hour: "12 PM", count: 89 },
    { hour: "1 PM", count: 234 },
    { hour: "2 PM", count: 256 },
    { hour: "3 PM", count: 289 },
    { hour: "4 PM", count: 312 },
    { hour: "5 PM", count: 298 },
    { hour: "6 PM", count: 276 },
    { hour: "7 PM", count: 245 },
    { hour: "8 PM", count: 189 },
    { hour: "9 PM", count: 156 },
  ];

  const COLORS = ["#3b82f6", "#10b981"];

  const getRandomColor = (index) => {
    const colors = ["blue", "green", "purple", "orange", "pink", "indigo"];
    return colors[index % colors.length];
  };

  const getInitials = (name) => {
    if (!name || name === "N/A") return "N/A";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const stats = useMemo(
    () => [
      {
        id: 1,
        title: totalUploaded.title || "TOTAL UPLOADED",
        value: totalUploaded.count || "0",
        icon: "camera",
        bgColor: "bg-[#e2f6e6]",
        iconColor: "text-green-500",
      },
      {
        id: 2,
        title: highlightImages.title || "HIGHLIGHTED IMAGES",
        value: highlightImages.count || "0",
        icon: "star",
        bgColor: "bg-[#deebff]",
        iconColor: "text-blue-500",
      },
      {
        id: 3,
        title: averageSize.title || "AVERAGE SIZE",
        value: averageSize.count || "0",
        icon: "users",
        bgColor: "bg-[#ffe5e2]",
        iconColor: "text-red-500",
      },
      {
        id: 4,
        title: totalSize.title || "TOTAL SIZE",
        value: totalSize.count || "0",
        icon: "upload",
        bgColor: "bg-[#e6e6f9]",
        iconColor: "text-purple-500",
      },
      {
        id: 5,
        title: uniqueUser.title || "UNIQUE USERS",
        value: uniqueUser.count || "0",
        icon: "download",
        bgColor: "bg-[#deebff]",
        iconColor: "text-blue-500",
      },
      {
        id: 6,
        title: contribute.title || "CONTRIBUTORS",
        value: contribute.count || "0",
        icon: "users",
        bgColor: "bg-[#e6e6f9]",
        iconColor: "text-purple-500",
      },
    ],
    [totalUploaded, highlightImages, averageSize, totalSize, uniqueUser, contribute]
  );

  return (
    <div className="min-h-screen ">
      {/* Top Metrics Cards - Modern Design, Show All 4 Stats */}
      <div className="w-full border border-gray-200 p-2 bg-white rounded-xl shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {[
            {
              id: 1,
              title: "TOTAL UPLOADED",
              value: totalUploaded.count || "0",
              icon: "camera",
              bgColor: "bg-[#e2f6e6]",
              iconColor: "text-green-500",
            },
            {
              id: 2,
              title: "HIGHLIGHTED IMAGES",
              value: highlightImages.count || "0",
              icon: "star",
              bgColor: "bg-[#deebff]",
              iconColor: "text-blue-500",
            },
            {
              id: 3,
              title: "NUMBER OF UNIQUE USERS",
              value: uniqueUser.count || "0",
              icon: "download",
              bgColor: "bg-[#deebff]",
              iconColor: "text-blue-500",
            },
            {
              id: 4,
              title: "NUMBER OF CONTRIBUTED PHOTOS",
              value: contribute.count || "0",
              icon: "users",
              bgColor: "bg-[#e6e6f9]",
              iconColor: "text-purple-500",
            },
          ].map((stat, index, arr) => (
            <div key={stat.id} className={`flex items-center p-2 gap-3 ${index !== arr.length - 1 ? "border-r border-gray-200" : ""}`}>
              <div className="flex items-center justify-center border border-gray-200 rounded-full">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bgColor}`}>
                  {stat.icon === "camera" && <Camera className={stat.iconColor} size={18} />}
                  {stat.icon === "star" && <Star className={stat.iconColor} size={18} />}
                  {stat.icon === "download" && <Download className={stat.iconColor} size={18} />}
                  {stat.icon === "users" && <Users className={stat.iconColor} size={18} />}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-medium font-inter text-gray-500">{stat.title}</p>
                <p className="text-[16px] font-bold font-inter text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Duplicate cards row below */}
      {/* <div className="w-full border border-gray-200 p-2 bg-white rounded-xl shadow-sm mb-6"> */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-2"> */}
      {/* NUMBER OF UNIQUE USERS Card */}
      {/* <div className="flex items-center p-2 gap-3 border-r border-gray-200">
            <div className="flex items-center justify-center border border-gray-200 rounded-full">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#deebff]">
                <Download className="text-blue-500" size={18} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium font-inter text-gray-500">
                NUMBER OF UNIQUE USERS
              </p>
              <p className="text-[16px] font-bold font-inter text-gray-900">
                {uniqueUser.count || "0"}
              </p>
            </div>
          </div> */}
      {/* NUMBER OF CONTRIBUTED PHOTOS Card */}
      {/* <div className="flex items-center p-2 gap-3 border-r border-gray-200">
            <div className="flex items-center justify-center border border-gray-200 rounded-full">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#e6e6f9]">
                <Users className="text-purple-500" size={18} />
              </div>
            </div>
            <div>
              <p className="text-[11px] font-medium font-inter text-gray-500">
                NUMBER OF CONTRIBUTED PHOTOS
              </p>
              <p className="text-[16px] font-bold font-inter text-gray-900">
                {contribute.count || "0"}
              </p>
            </div>
          </div> */}
      {/* </div> */}
      {/* </div> */}

      {isFromAnalytics ? (
        // Analytics View Layout
        <div className="grid grid-cols-12 gap-6">
          {/* First Column: Photo Breakdown and Recent Contributors */}
          <div className="col-span-4 space-y-6">
            {/* Photo Type Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm h-full flex flex-col">
              <div className="flex items-center gap-2 font-semibold text-md text-gray-800 mb-4 border-b border-gray-100 pb-3">
                <BarChart3 size={20} className="text-gray-600" />
                Photo Type Breakdown
              </div>
              <PhotoBreakdownChart data={photoTypeData} title={null} loading={loading} />
            </div>
            {/* Recent Photo Contributors */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm h-full flex flex-col">
              <div className="flex items-center gap-2 font-semibold text-md text-gray-800 mb-4 border-b border-gray-100 pb-3">
                <Upload size={20} className="text-gray-600" />
                Recent Photo Contributors
              </div>
              <RecentPhotoContributors contributors={recentContributers} limit={5} loading={loading} />
            </div>
          </div>

          {/* Second Column: Photo Download Time */}
          <div className="col-span-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm h-full flex flex-col">
              <div className="flex items-center gap-2 font-semibold text-md text-gray-800 mb-4 border-b border-gray-100 pb-3">
                <Clock size={20} className="text-gray-600" />
                Photo Download Time
              </div>
              <PhotoDownloadTimeChart data={usersOverTime} title={null} loading={loading} />
            </div>
          </div>

          {/* Third Column: Recent Photo Retrievers */}
          <div className="col-span-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm h-full flex flex-col">
              <div className="flex items-center gap-2 font-semibold text-md text-gray-800 mb-4 border-b border-gray-100 pb-3">
                <Download size={20} className="text-gray-600" />
                Recent Photo Retrievers
              </div>
              <RecentPhotoRetrievers users={recentUsers} limit={5} title={null} loading={loading} />
            </div>
          </div>
        </div>
      ) : (
        // Default View Layout (when accessed directly)
        <div className="grid grid-cols-12 gap-6">
          {/* Photo Breakdown and Download Time Row */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm h-full flex flex-col">
              <div className="flex items-center gap-2 font-semibold text-md text-gray-800 mb-4 border-b border-gray-100 pb-3">
                <BarChart3 size={20} className="text-gray-600" />
                Photo Type Breakdown
              </div>
              <PhotoBreakdownChart data={photoTypeData} title={null} loading={loading} />
            </div>
          </div>

          {/* Photo Download Time Chart */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm h-full flex flex-col">
              <div className="flex items-center gap-2 font-semibold text-md text-gray-800 mb-4 border-b border-gray-100 pb-3">
                <Clock size={20} className="text-gray-600" />
                Photo Download Time
              </div>
              <PhotoDownloadTimeChart data={usersOverTime} title={null} loading={loading} />
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Photo Retrievers */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm h-full flex flex-col">
              <div className="flex items-center gap-2 font-semibold text-md text-gray-800 mb-4 border-b border-gray-100 pb-3">
                <Download size={20} className="text-gray-600" />
                Recent Photo Retrievers
              </div>
              <RecentPhotoRetrievers users={recentUsers} limit={5} title={null} loading={loading} />
            </div>

            {/* Recent Photo Contributors */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm h-full flex flex-col">
              <div className="flex items-center gap-2 font-semibold text-md text-gray-800 mb-4 border-b border-gray-100 pb-3">
                <Upload size={20} className="text-gray-600" />
                Recent Photo Contributors
              </div>
              <RecentPhotoContributors contributors={recentContributers} limit={5} loading={loading} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstaSnapDashboard;
