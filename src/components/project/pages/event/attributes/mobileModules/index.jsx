import React, { useEffect, useMemo, useState } from "react";
import { Toggle } from "../../../../../core/elements";
import { GetIcon } from "../../../../../../icons";
import { getData, postData, putData } from "../../../../../../backend/api";

// Stable component wrapper to safely use hooks. Avoids re-mounting on parent re-renders
function MobileModulesInlineGrid({ eventId, setMessage }) {
  const modulesList = useMemo(
    () => [
      {
        id: "InstaSnap",
        name: "InstaSnap",
        description: "Add an InstaSnap feature to your event for attendees to take photos and videos and share them with each other.",
        icon: "insta-snap",
        iconBg: "bg-gray-100",
      },
      {
        id: "InstaRecap",
        name: "InstaRecap",
        description: "Add an InstaRecap feature to your event for attendees to take photos and videos and share them with each other.",
        icon: "insta-recap",
        iconBg: "bg-gray-100",
      },
      {
        id: "Networking",
        name: "Networking",
        description: "Add a networking feature to your event for attendees to connect with each other before or after the event",
        icon: "networking",
        iconBg: "bg-gray-100",
      },
      {
        id: "Meetings",
        name: "Meetings",
        description: "Add a meetings feature to your event for attendees to connect with each other before or after the event",
        icon: "networking",
        iconBg: "bg-gray-100",
      },
      { id: "Messaging", name: "Messaging", description: "Add a messaging feature to your event for attendees to communicate with each other", icon: "message", iconBg: "bg-gray-100" },
      { id: "Speakers", name: "Speakers", description: "Add and manage speakers or guests for your sessions`", icon: "speakers", iconBg: "bg-gray-100" },
      { id: "Exhibitors", name: "Exhibitors", description: "Add exhibitors to your event for attendees to learn more about", icon: "exhibitor", iconBg: "bg-gray-100" },
      { id: "Sessions", name: "Sessions", description: "Manage event sessions(enable if applicable)", icon: "session", iconBg: "bg-gray-100" },
      { id: "Sponsors", name: "Sponsors", description: "Add exhibitors and sponsors to your event for attendees to learn more about", icon: "exhibitor", iconBg: "bg-gray-100" },
      { id: "Feedback", name: "Feedback", description: "Add a feedback feature to your event for attendees to provide feedback", icon: "feedback", iconBg: "bg-gray-100" },
      { id: "Videos", name: "Videos", description: "Add a videos feature to your event for attendees to watch videos", icon: "video", iconBg: "bg-gray-100" },
      { id: "Ticket", name: "Ticket", description: "Add a ticket feature to your event for attendees to purchase tickets", icon: "ticket", iconBg: "bg-gray-100" },
      { id: "AI Chat", name: "AI Chat", description: "Add an AI chat feature to your event for attendees to communicate with each other", icon: "message", iconBg: "bg-gray-100" },
      { id: "Gamification", name: "Gamification", description: "Add a gamification feature to your event for attendees to compete with each other", icon: "gamification", iconBg: "bg-gray-100" },
    ],
    []
  );

  const [loading, setLoading] = useState(false);
  const [docId, setDocId] = useState(null);
  const [enabledMap, setEnabledMap] = useState(() => {
    try {
      const cached = sessionStorage.getItem(`mobile-modules:${eventId}`);
      return cached ? JSON.parse(cached) : {};
    } catch (_e) {
      return {};
    }
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!eventId) return;
      // Show loader only if we have no cached data yet
      const hasCache = Object.keys(enabledMap).length > 0;
      if (!hasCache) setLoading(true);
      try {
        const res = await getData({ event: eventId }, "mobile-module");
        const doc = res?.data?.response?.[0];
        if (mounted && doc) {
          setDocId(doc._id);
          const enabled = Array.isArray(doc.mobileModules) ? doc.mobileModules : [];
          const map = modulesList.reduce((acc, m) => ({ ...acc, [m.id]: enabled.includes(m.id) }), {});
          setEnabledMap(map);
          try {
            sessionStorage.setItem(`mobile-modules:${eventId}`, JSON.stringify(map));
          } catch (_e) {}
        } else if (mounted) {
          const map = modulesList.reduce((acc, m) => ({ ...acc, [m.id]: false }), {});
          setEnabledMap(map);
          try {
            sessionStorage.setItem(`mobile-modules:${eventId}`, JSON.stringify(map));
          } catch (_e) {}
        }
      } catch (e) {
        setMessage && setMessage({ type: 1, icon: "error", content: "Failed to load modules" });
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [eventId, modulesList, setMessage]);

  const persist = async (newMap) => {
    const selected = Object.keys(newMap).filter((k) => newMap[k]);
    try {
      let res;
      if (docId) {
        res = await putData({ id: docId, mobileModules: selected, event: eventId }, "mobile-module");
      } else {
        res = await postData({ mobileModules: selected, event: eventId }, "mobile-module");
      }
      const updated = res?.data?.data || res?.data;
      if (updated?._id && !docId) setDocId(updated._id);
    } catch (e) {
      setMessage && setMessage({ type: 1, icon: "error", content: "Failed to save selection" });
    }
  };

  const handleToggle = async (id) => {
    const newMap = { ...enabledMap, [id]: !enabledMap[id] };
    setEnabledMap(newMap);
    try {
      sessionStorage.setItem(`mobile-modules:${eventId}`, JSON.stringify(newMap));
    } catch (_e) {}
    await persist(newMap);
  };

  const Card = ({ module }) => (
    <div className="bg-bg-white rounded-lg border border-stroke-soft p-6 transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${module.iconBg} rounded-lg flex items-center justify-center`}>
          <GetIcon icon={module.icon} />
        </div>
        <div className="flex items-center gap-2">
          <Toggle isEnabled={!!enabledMap[module.id]} onToggle={() => handleToggle(module.id)} size="small" color="blue" />
        </div>
      </div>
      <div className="flex items-center gap-2 mb-3">
        {/* Title: enforce 14px size, bold weight, and specific brand color */}
        <h5 className="text-[14px] font-bold" style={{ color: "#0A0D14" }}>
          {module.name}
        </h5>
      </div>
      <p className="font-inter-[12px] text-sm">{module.description}</p>
    </div>
  );

  return (
    <div className="bg-bg-white p-0">
      {loading ? (
        <div className="py-6">Loading modules...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-0">
          {modulesList.map((m) => (
            <Card key={m.id} module={m} />
          ))}
        </div>
      )}
    </div>
  );
}

export const appModulesAttributes = [
  {
    type: "element",
    name: "integrations",
    label: "",
    view: true,
    add: false,
    update: true,
    customClass: "full",
    element: ({ referenceId, parents, setMessage }) => {
      const eventId = referenceId || parents?.event;
      return <MobileModulesInlineGrid eventId={eventId} setMessage={setMessage} />;
    },
  },
];
