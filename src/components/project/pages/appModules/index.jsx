import React, { useState } from 'react';

// App Modules data structure with all module information
const appModules = [
  {
    id: 'instasnap',
    name: 'InstaSnap',
    description: 'Add a feature for attendees to take and share photos and videos during the event.',
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
      </svg>
    ),
    enabled: false
  },
  {
    id: 'instarecap',
    name: 'InstaRecap',
    description: 'Allow attendees to create and share video recaps of their event experience.',
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.636 5.636a9 9 0 0112.728 0m-12.728 0a9 9 0 000 12.728m0-12.728L12 12"></path>
      </svg>
    ),
    enabled: false
  },
  {
    id: 'networking',
    name: 'Networking',
    description: 'Enable a networking feature for attendees to connect before, during, or after the event.',
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.5a2.25 2.25 0 012.25-2.25H18.75a2.25 2.25 0 012.25 2.25v.001H3v-.001z"></path>
      </svg>
    ),
    enabled: true
  },
  {
    id: 'meetings',
    name: 'Meetings',
    description: 'Add a meetings feature to allow attendees to schedule 1-on-1 connections.',
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.25 3v1.5M4.5 8.25H19.5M12 18a3.75 3.75 0 110-7.5 3.75 3.75 0 010 7.5zM12 10.5h.008v.008H12v-.008z"></path>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 5.25H4.5a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 20.25h15a2.25 2.25 0 002.25-2.25V7.5A2.25 2.25 0 0019.5 5.25z"></path>
      </svg>
    ),
    enabled: false
  },
  {
    id: 'messaging',
    name: 'Messaging',
    description: 'Provide a messaging feature for attendees to communicate with each other.',
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"></path>
      </svg>
    ),
    enabled: false
  },
  {
    id: 'speakers',
    name: 'Speakers',
    description: 'Add and manage speakers or guests for your event\'s sessions.',
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75-11.25a3 3 0 116 0v1.5a3 3 0 11-6 0v-1.5z"></path>
      </svg>
    ),
    enabled: true
  },
  {
    id: 'exhibitors',
    name: 'Exhibitors',
    description: 'Add exhibitors to your event for attendees to learn more about.',
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.25a.75.75 0 01-.75-.75v-11.25a.75.75 0 01.75-.75h19.5a.75.75 0 01.75.75v11.25a.75.75 0 01-.75.75h-4.5m-4.5 0v-7.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21m-4.5 0h4.5"></path>
      </svg>
    ),
    enabled: false
  },
  {
    id: 'sponsors',
    name: 'Sponsors',
    description: 'Add exhibitors and sponsors to your event for attendees to learn more about.',
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5v-8.25M12 15.75v-9.75m0 0l-3.75 3.75M12 6l3.75 3.75"></path>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75L12 6"></path>
      </svg>
    ),
    enabled: false
  },
  {
    id: 'feedback',
    name: 'Feedback',
    description: 'Add a feature to your event for attendees to provide feedback on sessions and speakers.',
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.006 3 11.55c0 2.944 1.79 5.546 4.375 6.944.25.124.25.472 0 .596C4.79 20.046 3 22.5 3 22.5c0 0 2.5-1.79 4.375-3.194.25-.199.5-.199.75 0A12.012 12.012 0 0012 20.25z"></path>
      </svg>
    ),
    enabled: true
  }
];

// Toggle switch component for module enable/disable functionality
const ToggleSwitch = ({ enabled, onChange, moduleId }) => {
  return (
    <label className="absolute top-5 right-5 inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        className="sr-only peer"
        checked={enabled}
        onChange={() => onChange(moduleId)}
      />
      <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${
        enabled ? 'bg-primary' : 'bg-gray-200'
      } peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
    </label>
  );
};

// Individual module card component
const ModuleCard = ({ module, enabled, onToggle }) => {
  return (
    <div className={`relative bg-white rounded-lg border p-5 transition-colors duration-200 group ${
      enabled ? 'border-primary' : 'border-gray-200 hover:border-primary'
    }`}>
      {/* Toggle switch for enabling/disabling the module */}
      <ToggleSwitch 
        enabled={enabled} 
        onChange={onToggle}
        moduleId={module.id}
      />
      
      <div className="flex flex-col gap-4">
        {/* Module icon container */}
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          {module.icon}
        </div>
        
        {/* Module information */}
        <div>
          <h3 className="font-semibold text-gray-900">{module.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{module.description}</p>
        </div>
      </div>
    </div>
  );
};

// Main App Modules component
const AppModules = () => {
  // State management for tracking which modules are enabled
  const [modules, setModules] = useState(
    appModules.reduce((acc, module) => {
      acc[module.id] = module.enabled;
      return acc;
    }, {})
  );

  // Function to handle module toggle state changes
  const handleModuleToggle = (moduleId) => {
    setModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  return (
    <div className="bg-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page header section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enable App Modules</h1>
          <p className="text-gray-600">Choose the features you want to activate for your event.</p>
        </div>

        {/* Modules grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {appModules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              enabled={modules[module.id]}
              onToggle={handleModuleToggle}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppModules;