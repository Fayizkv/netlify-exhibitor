import React, { useState, useEffect } from 'react';
import { getData, putData, postData } from '../../../../backend/api';
import { Toggle } from '../../../core/elements';
import Select from '../../../core/select';
import FormInput from '../../../core/input';
import { Button } from '../../../core/elements';
import ListTableSkeleton from '../../../core/loader/shimmer';
import { SubPageHeader } from '../../../core/input/heading';
import EditorNew from '../../../core/editor';

// Module configurations data structure
const moduleConfigs = {
  'google-analytics': {
    title: 'Google Analytics Configuration',
    fields: [
      { label: 'Tracking ID', type: 'text', placeholder: 'GA-XXXXXXXXX-X', required: true },
      { label: 'Property ID', type: 'text', placeholder: '12345678', required: true }
    ]
  },
  'facebook-pixel': {
    title: 'Facebook Pixel Configuration',
    fields: [
      { label: 'Pixel ID', type: 'text', placeholder: '1234567890123456', required: true },
      { label: 'Access Token', type: 'password', placeholder: 'Enter access token', required: true }
    ]
  },
  'whatsapp-chat': {
    title: 'WhatsApp Chat Configuration',
    fields: [
      { label: 'Phone Number', type: 'tel', placeholder: '+1234567890', required: true },
    ]
  },
  'microsoft-clarity': {
    title: 'Microsoft Clarity Configuration',
    fields: [
      { label: 'Project ID', type: 'text', placeholder: 'abcd1234', required: true },
      { label: 'Tracking Code', type: 'textarea', placeholder: 'Paste your Clarity tracking code here', required: true }
    ]
  },
  'ai-voice-form': {
    title: 'AI Voice Form Filling Settings',
    fields: [
      { label: 'Language', type: 'select', options: ['English', 'Spanish', 'French', 'German'], required: true },
      { label: 'Voice Recognition Sensitivity', type: 'range', min: '1', max: '10', value: '7', required: true },
      { label: 'Auto-save Interval (seconds)', type: 'number', placeholder: '30', required: true }
    ]
  },
  'accessibility-menu': {
    title: 'Accessibility Menu Settings',
    fields: [
      { label: 'Enable High Contrast', type: 'checkbox', checked: true },
      { label: 'Enable Screen Reader Support', type: 'checkbox', checked: true },
      { label: 'Enable Keyboard Navigation', type: 'checkbox', checked: true },
      { label: 'Font Size Options', type: 'checkbox', checked: true }
    ]
  },
  'cookies': {
    title: 'Cookies Configuration',
    fields: [
      { label: 'Enable Cookies', type: 'checkbox', checked: true },
      { label: 'Enable Cookies Banner', type: 'checkbox', checked: true },
      { 
        label: 'Cookies Policy', 
        type: 'htmleditor', 
        placeholder: 'Enter cookies policy content', 
        required: false,
        condition: {
          item: 'Enable Cookies Banner',
          if: true,
          then: 'enabled',
          else: 'disabled'
        }
      }
    ]
  }
};

// Website integration modules data
const integrationModules = [
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Track event performance, attendee behavior, and conversion metrics with comprehensive analytics.',
    icon: (
      <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 640 640">
        <path d="M564 325.8C564 467.3 467.1 568 324 568C186.8 568 76 457.2 76 320C76 182.8 186.8 72 324 72C390.8 72 447 96.5 490.3 136.9L422.8 201.8C334.5 116.6 170.3 180.6 170.3 320C170.3 406.5 239.4 476.6 324 476.6C422.2 476.6 459 406.2 464.8 369.7L324 369.7L324 284.4L560.1 284.4C562.4 297.1 564 309.3 564 325.8z"/>
      </svg>
    ),
    iconBg: 'bg-orange-100',
    enabled: true,
    connectionStatus: 'connected',
    hasProBadge: false
  },
  {
    id: 'facebook-pixel',
    name: 'Facebook Pixel',
    description: 'Optimize event advertising and retarget potential attendees with Facebook advertising insights.',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    iconBg: 'bg-blue-100',
    enabled: false,
    connectionStatus: 'not-connected',
    hasProBadge: false
  },
  {
    id: 'microsoft-clarity',
    name: 'Microsoft Clarity',
    description: 'Gain deep insights into user behavior with heatmaps and session recordings for event optimization.',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M0 0h11.377v11.372H0V0zm12.623 0H24v11.372H12.623V0zM0 12.623h11.377V24H0V12.623zm12.623 0H24V24H12.623V12.623z"/>
      </svg>
    ),
    iconBg: 'bg-blue-100',
    enabled: false,
    connectionStatus: 'not-connected',
    hasProBadge: true
  },
  {
    id: 'whatsapp-chat',
    name: 'WhatsApp Chat',
    description: 'Enable instant customer support and event inquiries through integrated WhatsApp messaging.',
    icon: (
      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
      </svg>
    ),
    iconBg: 'bg-green-100',
    enabled: true,
    connectionStatus: 'needs-setup',
    hasProBadge: false
  },
  {
    id: 'ai-voice-form',
    name: 'AI Voice Form Filling',
    description: 'Streamline event registration with AI-powered voice-to-form technology for faster bookings.',
    icon: (
      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
      </svg>
    ),
    iconBg: 'bg-purple-100',
    enabled: false,
    connectionStatus: null,
    hasProBadge: true
  },
  {
    id: 'accessibility-menu',
    name: 'Accessibility Menu',
    description: 'Ensure inclusive event experiences with comprehensive accessibility features and compliance tools.',
    icon: (
      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
      </svg>
    ),
    iconBg: 'bg-indigo-100',
    enabled: true,
    connectionStatus: null,
    hasProBadge: false
  },
  {
    id: 'cookies',
    name: 'Cookies Management',
    description: 'Manage cookie consent, policies, and compliance settings for your event website.',
    icon: (
      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
      </svg>
    ),
    iconBg: 'bg-amber-100',
    enabled: true,
    connectionStatus: null,
    hasProBadge: false
  },
 
];

// Connection status component for displaying module connection state
const ConnectionStatus = ({ status }) => {
  if (!status) return null;

  const statusConfig = {
    'connected': {
      bg: 'bg-green-100',
      text: 'text-green-800',
      dot: 'bg-green-500',
      label: 'Connected'
    },
    'not-connected': {
      bg: 'bg-red-100',
      text: 'text-red-800',
      dot: 'bg-red-500',
      label: 'Not Connected'
    },
    'needs-setup': {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      dot: 'bg-yellow-500',
      label: 'Needs Setup'
    }
  };

  const config = statusConfig[status];

  return (
    <span className={`${config.bg} ${config.text} text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1`}>
      <div className={`w-2 h-2 ${config.dot} rounded-full`}></div>
      {config.label}
    </span>
  );
};

// Replaced inline ToggleSwitch with reusable Toggle component from core/elements

// Individual integration module card component
const IntegrationModuleCard = ({ module, enabled, onToggle, onManage }) => {
  // Modules that don't need configuration (no manage button)
  const noConfigModules = ['accessibility-menu', 'ai-voice-form'];
  const showManageButton = !noConfigModules.includes(module.id);

  return (
    <div className="bg-bg-white rounded-lg border border-stroke-soft p-6 transition-shadow">
      <div className="flex items-start justify-between mb-4">
        {/* Module icon */}
        <div className={`w-12 h-12 ${module.iconBg} rounded-lg flex items-center justify-center`}>
          {module.icon}
        </div>
        
        {/* Toggle switch and pro badge */}
        <div className="flex items-center gap-2">
          {module.hasProBadge && (
            <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">PRO</span>
          )}
          <Toggle
            isEnabled={enabled}
            onToggle={() => onToggle(module.id)}
            size="small"
            color="blue"
          />
        </div>
      </div>
      
      {/* Module title and connection status */}
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold text-text-main">{module.name}</h3>
        <ConnectionStatus status={enabled ? module.connectionStatus : null} />
      </div>
      
      {/* Module description */}
      <p className={`text-sm text-text-sub ${showManageButton ? 'mb-6' : 'mb-0'}`}>{module.description}</p>
      
      {/* Manage button - only show for modules that need configuration */}
      {showManageButton && (
        <button 
          onClick={() => onManage(module.id)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer mt-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          Manage
        </button>
      )}
    </div>
  );
};

// Configuration modal component
const ConfigurationModal = ({ isOpen, onClose, moduleId, onSave, eventWebsite, policyData }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const config = moduleConfigs[moduleId];

  // Load existing data when modal opens
  useEffect(() => {
    if (isOpen && moduleId && (eventWebsite || policyData)) {
      const existingData = {};
      
      switch (moduleId) {
        case 'google-analytics':
          if (eventWebsite?.googleAnalytics?.[0]) {
            const ga = eventWebsite.googleAnalytics[0];
            existingData['Tracking ID'] = ga.trackingId || '';
            existingData['Property ID'] = ga.propertyId || '';
          }
          break;
          
        case 'facebook-pixel':
          if (eventWebsite?.facebookPixel?.[0]) {
            const fp = eventWebsite.facebookPixel[0];
            existingData['Pixel ID'] = fp.pixelId || '';
            existingData['Access Token'] = fp.accessToken || '';
          }
          break;
          
        case 'whatsapp-chat':
          if (eventWebsite?.whatsappChat?.[0]) {
            const wa = eventWebsite.whatsappChat[0];
            existingData['Phone Number'] = wa.phoneNumber || '';
            existingData['Welcome Message'] = wa.welcomeMessage || '';
            existingData['Business Hours'] = wa.businessHours || '';
          } else if (policyData) {
            // Load from policy data if eventWebsite data not available
            existingData['Phone Number'] = policyData.whatsappNumber || '';
            existingData['Welcome Message'] = '';
            existingData['Business Hours'] = '';
          }
          break;
          
        case 'ai-voice-form':
          if (eventWebsite?.aiVoiceForm?.[0]) {
            const avf = eventWebsite.aiVoiceForm[0];
            existingData['Language'] = avf.language || 'English';
            existingData['Voice Recognition Sensitivity'] = avf.voiceRecognitionSensitivity || 7;
            existingData['Auto-save Interval (seconds)'] = avf.autoSaveInterval || 30;
          } else if (policyData) {
            // Load from policy data if eventWebsite data not available
            existingData['Language'] = 'English';
            existingData['Voice Recognition Sensitivity'] = 7;
            existingData['Auto-save Interval (seconds)'] = 30;
          }
          break;
          
        case 'microsoft-clarity':
          if (eventWebsite?.microsoftClarity?.[0]) {
            const mc = eventWebsite.microsoftClarity[0];
            existingData['Project ID'] = mc.projectId || '';
            existingData['Tracking Code'] = mc.trackingCode || '';
          }
          break;
          
        case 'accessibility-menu':
          if (eventWebsite?.accessibilityMenu?.[0]) {
            const am = eventWebsite.accessibilityMenu[0];
            existingData['Enable High Contrast'] = am.enableHighContrast ?? true;
            existingData['Enable Screen Reader Support'] = am.enableScreenReaderSupport ?? true;
            existingData['Enable Keyboard Navigation'] = am.enableKeyboardNavigation ?? true;
            existingData['Font Size Options'] = am.fontSizeOptions ?? true;
          } else if (policyData) {
            // Load from policy data if eventWebsite data not available
            existingData['Enable High Contrast'] = true;
            existingData['Enable Screen Reader Support'] = true;
            existingData['Enable Keyboard Navigation'] = true;
            existingData['Font Size Options'] = true;
          }
          break;
          
        case 'cookies':
          if (policyData) {
            // Load from policy data
            existingData['Enable Cookies'] = policyData.cookie ?? true;
            existingData['Enable Cookies Banner'] = policyData.cookieBanner ?? true;
            existingData['Cookies Policy'] = policyData.cookiesPolicy || '';
          }
          break;
      }
      
      setFormData(existingData);
    } else if (!isOpen) {
      // Clear form data when modal closes
      setFormData({});
      setErrors({});
    }
  }, [isOpen, moduleId, eventWebsite, policyData]);

  // Handle form input changes
  const handleInputChange = (fieldLabel, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldLabel]: value
    }));
    // Clear error when user starts typing
    if (errors[fieldLabel]) {
      setErrors(prev => ({
        ...prev,
        [fieldLabel]: null
      }));
    }
    
    // Handle conditional field logic - if cookies banner is disabled, clear cookies policy
    if (fieldLabel === 'Enable Cookies Banner' && !value) {
      setFormData(prev => ({
        ...prev,
        'Cookies Policy': ''
      }));
    }
  };

  // Handle form submission
  const handleSave = async () => {
    const newErrors = {};
    
    // Validate required fields
    config.fields.forEach(field => {
      if (field.required && (!formData[field.label] || formData[field.label].toString().trim() === '')) {
        newErrors[field.label] = 'This field is required';
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setSaving(true);
      try {
        await onSave(moduleId, formData);
        onClose();
      } catch (error) {
        console.error('Error saving configuration:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  // Generate form field based on type
  const renderFormField = (field) => {
    const hasError = errors[field.label];
    
    // Handle conditional fields
    if (field.condition) {
      const conditionValue = formData[field.condition.item];
      const shouldShow = conditionValue === field.condition.if;
      
      if (!shouldShow) {
        return null;
      }
    }
    
    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.label} className="mb-4">
            <FormInput
              type="textarea"
              id={field.label}
              name={field.label}
              label={field.label}
              placeholder={field.placeholder || ''}
              required={field.required}
              value={formData[field.label] || ''}
              onChange={(event) => handleInputChange(field.label, event.target.value)}
            />
          </div>
        );
      
      case 'htmleditor':
        return (
          <div key={field.label} className="mb-4">
            <EditorNew
              value={formData[field.label] || ''}
              onChange={(content) => handleInputChange(field.label, content)}
              placeholder={field.placeholder || 'Enter content...'}
              label={field.label}
              required={field.required}
              error={hasError}
            />
          </div>
        );
      
      case 'select':
        return (
          <div key={field.label} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
            <Select
              showLabel={false}
              selectType="dropdown"
              apiType="JSON"
              selectApi={field.options.map((opt) => ({ id: opt, value: opt }))}
              placeholder="Select an option"
              value={formData[field.label] || ''}
              onSelect={(option) => handleInputChange(field.label, option?.id || '')}
            />
            {hasError && <p className="text-red-500 text-xs mt-1">{hasError}</p>}
          </div>
        );
      
      case 'checkbox':
        return (
          <div key={field.label} className="mb-4">
            <FormInput
              type="checkbox"
              id={field.label}
              name={field.label}
              label={field.label}
              required={field.required}
              value={formData[field.label] ?? field.checked ?? false}
              onChange={(val) => handleInputChange(field.label, val)}
            />
          </div>
        );
      
      case 'range':
        return (
          <div key={field.label} className="mb-4">
            <FormInput
              type="range"
              id={field.label}
              name={field.label}
              label={field.label}
              required={field.required}
              value={formData[field.label] || field.value}
              min={field.min}
              max={field.max}
              onChange={(event) => handleInputChange(field.label, event.target.value)}
            />
          </div>
        );
      case 'number':
        return (
          <div key={field.label} className="mb-4">
            <FormInput
              type="number"
              id={field.label}
              name={field.label}
              label={field.label}
              placeholder={field.placeholder || 'Enter value'}
              required={field.required}
              value={formData[field.label] || ''}
              onChange={(event) => handleInputChange(field.label, event.target.value)}
            />
            {hasError && <p className="text-red-500 text-xs mt-1">{hasError}</p>}
          </div>
        );
      
      default:
        return (
          <div key={field.label} className="mb-4">
            <FormInput
              type={field.type === 'tel' ? 'text' : field.type}
              id={field.label}
              name={field.label}
              label={field.label}
              placeholder={field.placeholder || ''}
              required={field.required}
              value={formData[field.label] || ''}
              onChange={(event) => handleInputChange(field.label, event.target.value)}
            />
          </div>
        );
    }
  };

  if (!isOpen || !config) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{config.title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="mb-6">
          {config.fields.map(renderFormField)}
        </div>
        
        <div className="flex gap-3">
          <Button
            value={saving ? 'Saving...' : 'Save Configuration'}
            isDisabled={saving}
            ClickEvent={handleSave}
            type="primary"
          />
        </div>
      </div>
    </div>
  );
};

// Notification component for user feedback
const Notification = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  
  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300`}>
      {message}
      <button 
        onClick={onClose}
        className="ml-4 text-white hover:text-gray-200"
      >
        ×
      </button>
    </div>
  );
};

// Main Website Integrations component
const WebsiteIntegrations = (props) => {
  // Extract eventId from props
  const eventId = props?.openData?.data?._id;
  
  // State management for modules and modal
  const [modules, setModules] = useState(
    integrationModules.reduce((acc, module) => {
      acc[module.id] = module.enabled;
      return acc;
    }, {})
  );
  
  const [modalOpen, setModalOpen] = useState(false);
  const [currentModuleId, setCurrentModuleId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [eventWebsite, setEventWebsite] = useState(null);
  const [policyData, setPolicyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch eventWebsite and policy data on component mount
  useEffect(() => {
    if (!eventId) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch both eventWebsite and policy data in parallel
        const [eventWebsiteResult, policyResult] = await Promise.all([
          getData({ event: eventId }, 'event-website'),
          getData({ event: eventId }, 'policy')
        ]);
        
        // Handle eventWebsite data
        if (eventWebsiteResult.status === 200 && eventWebsiteResult.data?.data) {
          const eventWebsiteData = eventWebsiteResult.data.data;
          setEventWebsite(eventWebsiteData);
          
          // Update module states based on backend data
          const updatedModules = { ...modules };
          
          // Update Google Analytics
          if (eventWebsiteData.googleAnalytics?.[0]) {
            updatedModules['google-analytics'] = eventWebsiteData.googleAnalytics[0].enableConnection;
          }
          
          // Update Facebook Pixel
          if (eventWebsiteData.facebookPixel?.[0]) {
            updatedModules['facebook-pixel'] = eventWebsiteData.facebookPixel[0].enableConnection;
          }
          
          // Update WhatsApp Chat
          if (eventWebsiteData.whatsappChat?.[0]) {
            updatedModules['whatsapp-chat'] = eventWebsiteData.whatsappChat[0].enableConnection;
          }
          
          // Update AI Voice Form
          if (eventWebsiteData.aiVoiceForm?.[0]) {
            updatedModules['ai-voice-form'] = eventWebsiteData.aiVoiceForm[0].enableConnection;
          }
          
          // Update Microsoft Clarity
          if (eventWebsiteData.microsoftClarity?.[0]) {
            updatedModules['microsoft-clarity'] = eventWebsiteData.microsoftClarity[0].enableConnection;
          }
          
          // Update Accessibility Menu
          if (eventWebsiteData.accessibilityMenu?.[0]) {
            updatedModules['accessibility-menu'] = eventWebsiteData.accessibilityMenu[0].enableConnection;
          }
          
          setModules(updatedModules);
        }
        
        // Handle policy data
        if (policyResult.status === 200 && policyResult.data?.response) {
          const policyData = policyResult.data.response;
          setPolicyData(policyData);
          
          // Update module states based on policy data
          const updatedModules = { ...modules };
          
          // Update AI Voice from policy
          if (policyData.aiVoice !== undefined) {
            updatedModules['ai-voice-form'] = policyData.aiVoice;
          }
          
          // Update WhatsApp Floating from policy
          if (policyData.whatsappFloatting !== undefined) {
            updatedModules['whatsapp-chat'] = policyData.whatsappFloatting;
          }
          
          // Update Accessibility from policy
          if (policyData.accessibility !== undefined) {
            updatedModules['accessibility-menu'] = policyData.accessibility;
          }
          
          // Update Cookies from policy
          if (policyData.cookie !== undefined) {
            updatedModules['cookies'] = policyData.cookie;
          }
          
          setModules(updatedModules);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load integration data');
        if (props.setMessage) {
          props.setMessage({
            content: 'Failed to load integration data',
            type: 0,
            icon: 'error'
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  // Handle module toggle - persists enableConnection via API and policy data
  const handleModuleToggle = async (moduleId) => {
    const newEnabled = !modules[moduleId];

    // Optimistic UI update
    setModules(prev => ({ ...prev, [moduleId]: newEnabled }));

    try {
      // Handle policy-based modules (AI Voice, WhatsApp Floating, Accessibility, Cookies)
      const policyModules = ['ai-voice-form', 'whatsapp-chat', 'accessibility-menu', 'cookies'];
      
      if (policyModules.includes(moduleId)) {
        // Update policy data for these modules
        let policyFieldName;
        switch (moduleId) {
          case 'ai-voice-form':
            policyFieldName = 'aiVoice';
            break;
          case 'whatsapp-chat':
            policyFieldName = 'whatsappFloatting';
            break;
          case 'accessibility-menu':
            policyFieldName = 'accessibility';
            break;
          case 'cookies':
            policyFieldName = 'cookie';
            break;
        }

        if (policyFieldName) {
          const policyResponse = await putData(
            { eventId: eventId, fieldName: policyFieldName, fieldValue: newEnabled },
            `policy/field/${eventId}`
          );

          if (policyResponse.status === 200) {
            // Update local policy data
            setPolicyData(prev => ({
              ...prev,
              [policyFieldName]: newEnabled
            }));
          } else {
            // Revert optimistic update on failure
            setModules(prev => ({ ...prev, [moduleId]: !newEnabled }));
            return;
          }
        }
      } else {
        // Handle eventWebsite-based modules (Google Analytics, Facebook Pixel, Microsoft Clarity)
        const basePayload = {
          event: eventId,
          // Preserve existing required fields
          title: eventWebsite?.title || "",
          subtitle: eventWebsite?.subtitle || "",
          button: eventWebsite?.button || { show: true, text: "Register Now", link: "" },
          modules: eventWebsite?.modules || [],
          menus: eventWebsite?.menus || [],
          trackingId: eventWebsite?.trackingId || "",
          pixelId: eventWebsite?.pixelId || 0,
        };

        const payload = { ...basePayload };

        switch (moduleId) {
          case "google-analytics":
            payload.googleAnalytics = [
              {
                ...(eventWebsite?.googleAnalytics?.[0] || {}),
                enableConnection: newEnabled,
              },
            ];
            break;
          case "facebook-pixel":
            payload.facebookPixel = [
              {
                ...(eventWebsite?.facebookPixel?.[0] || {}),
                enableConnection: newEnabled,
              },
            ];
            break;
          case "microsoft-clarity":
            payload.microsoftClarity = [
              {
                ...(eventWebsite?.microsoftClarity?.[0] || {}),
                enableConnection: newEnabled,
              },
            ];
            break;
        }

        let response;
        if (eventWebsite && eventWebsite._id) {
          response = await putData({ id: eventWebsite._id, ...payload }, `event-website`);
        } else {
          response = await postData(payload, "event-website");
        }

        if (response.status === 200 || response.status === 201) {
          const updated = response.data?.data || response.data;
          setEventWebsite(updated);
        } else {
          // Revert optimistic update on failure
          setModules(prev => ({ ...prev, [moduleId]: !newEnabled }));
        }
      }
    } catch (err) {
      console.error('Error toggling module:', err);
      // Revert optimistic update on error
      setModules(prev => ({ ...prev, [moduleId]: !newEnabled }));
    }
  };

  // Handle manage button click
  const handleManage = (moduleId) => {
    setCurrentModuleId(moduleId);
    setModalOpen(true);
  };

  // Handle configuration save
  const handleSaveConfig = async (moduleId, formData) => {
    if (!eventId) {
      if (props.setMessage) {
        props.setMessage({
          content: 'Event ID not found',
          type: 1,
          icon: 'error'
        });
      }
      return;
    }

    setLoading(true);
    
    try {
      // Handle policy-based modules (AI Voice, WhatsApp Floating, Accessibility, Cookies)
      const policyModules = ['ai-voice-form', 'whatsapp-chat', 'accessibility-menu', 'cookies'];
      
      if (policyModules.includes(moduleId)) {
        // Update policy data for these modules
        let policyUpdateData = {};
        
        switch (moduleId) {
          case 'whatsapp-chat':
            policyUpdateData = {
              whatsappFloatting: true,
              whatsappNumber: formData['Phone Number'] || ''
            };
            break;
          case 'ai-voice-form':
            policyUpdateData = {
              aiVoice: true
            };
            break;
          case 'accessibility-menu':
            policyUpdateData = {
              accessibility: true
            };
            break;
          case 'cookies':
            policyUpdateData = {
              cookie: true,
              cookieBanner: formData['Enable Cookies Banner'] ?? true,
              cookiesPolicy: formData['Cookies Policy'] || ''
            };
            break;
        }

        let policyResponse;
        
        // Use the new cookies endpoint for cookies-related fields
        if (moduleId === 'cookies') {
          // Update each field individually using the cookies endpoint
          const updatePromises = Object.entries(policyUpdateData).map(([fieldName, fieldValue]) => 
            putData(
              { fieldName, fieldValue },
              `policy/cookies/${eventId}`
            )
          );
          
          const responses = await Promise.all(updatePromises);
          
          // Check if all updates were successful
          const allSuccessful = responses.every(response => response.status === 200);
          
          if (!allSuccessful) {
            throw new Error('Failed to update some cookies fields');
          }
          
          // Use the last response for consistency
          policyResponse = responses[responses.length - 1];
        } else {
          // For other policy modules, use the field endpoint
          if (moduleId === 'whatsapp-chat') {
            // For WhatsApp, update both fields separately
            const updatePromises = Object.entries(policyUpdateData).map(([fieldName, fieldValue]) => 
              putData(
                { eventId: eventId, fieldName, fieldValue },
                `policy/field/${eventId}`
              )
            );
            
            const responses = await Promise.all(updatePromises);
            
            // Check if all updates were successful
            const allSuccessful = responses.every(response => response.status === 200);
            
            if (!allSuccessful) {
              throw new Error('Failed to update some WhatsApp fields');
            }
            
            // Use the last response for consistency
            policyResponse = responses[responses.length - 1];
          } else {
            // For other modules, use single field update
            policyResponse = await putData(
              { eventId: eventId, fieldName: Object.keys(policyUpdateData)[0], fieldValue: Object.values(policyUpdateData)[0] },
              `policy/field/${eventId}`
            );
          }
        }

        if (policyResponse.status === 200) {
          // Update local policy data
          setPolicyData(prev => ({
            ...prev,
            ...policyUpdateData
          }));
          
          // Update module state
          setModules(prev => ({
            ...prev,
            [moduleId]: true
          }));

          if (props.setMessage) {
            props.setMessage({
              content: 'Configuration saved successfully!',
              type: 1,
              icon: 'success'
            });
          }
        } else {
          const errorMessage = policyResponse.customMessage || 'Failed to save configuration';
          
          if (props.setMessage) {
            props.setMessage({
              content: `Failed to save configuration: ${errorMessage}`,
              type: 1,
              icon: 'error'
            });
          }
        }
      } else {
        // Handle eventWebsite-based modules (Google Analytics, Facebook Pixel, Microsoft Clarity)
        let payload = {
          event: eventId,
          // Preserve existing data
          title: eventWebsite?.title || '',
          subtitle: eventWebsite?.subtitle || '',
          button: eventWebsite?.button || { show: true, text: 'Register Now', link: '' },
          modules: eventWebsite?.modules || [],
          menus: eventWebsite?.menus || [],
          trackingId: eventWebsite?.trackingId || '',
          pixelId: eventWebsite?.pixelId || 0,
          // Initialize integration arrays if they don't exist
          googleAnalytics: eventWebsite?.googleAnalytics || [{}],
          facebookPixel: eventWebsite?.facebookPixel || [{}],
          whatsappChat: eventWebsite?.whatsappChat || [{}],
          aiVoiceForm: eventWebsite?.aiVoiceForm || [{}],
          microsoftClarity: eventWebsite?.microsoftClarity || [{}],
          accessibilityMenu: eventWebsite?.accessibilityMenu || [{}]
        };

        // Update the specific module configuration
        switch (moduleId) {
          case 'google-analytics':
            payload.googleAnalytics = [{
              trackingId: formData['Tracking ID'] || '',
              propertyId: formData['Property ID'] || '',
              enableConnection: true
            }];
            break;
            
          case 'facebook-pixel':
            payload.facebookPixel = [{
              pixelId: formData['Pixel ID'] || '',
              accessToken: formData['Access Token'] || '',
              enableConnection: true
            }];
            break;
            
          case 'microsoft-clarity':
            payload.microsoftClarity = [{
              projectId: formData['Project ID'] || '',
              trackingCode: formData['Tracking Code'] || '',
              enableConnection: true
            }];
            break;
        }

        let response;
        if (eventWebsite && eventWebsite._id) {
            // Update existing eventWebsite
            response = await putData({id:eventWebsite._id, ...payload}, `event-website`);
        } else {
          // Create new eventWebsite
          response = await postData(payload, 'event-website');
        }

        if (response.status === 200 || response.status === 201) {
          // Update local state
          let eventWebsiteData;
          if (response.data && response.data.data) {
            eventWebsiteData = response.data.data;
          } else if (response.data && response.data._id) {
            eventWebsiteData = response.data;
          } else {
            eventWebsiteData = response.data;
          }

          setEventWebsite(eventWebsiteData);
          
          // Update module state
          setModules(prev => ({
            ...prev,
            [moduleId]: true
          }));

          if (props.setMessage) {
            props.setMessage({
              content: 'Configuration saved successfully!',
              type: 1,
              icon: 'success'
            });
          }
        } else {
          const errorMessage = response.customMessage || 'Failed to save configuration';
          
          if (props.setMessage) {
            props.setMessage({
              content: `Failed to save configuration: ${errorMessage}`,
              type: 1,
              icon: 'error'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      const errorMessage = 'Network error while saving configuration';
      
      if (props.setMessage) {
        props.setMessage({
          content: errorMessage,
          type: 1,
          icon: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // (removed) handleTestConnection was unused

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Show loading state
  if (loading && !eventWebsite) {
    return (
      <div className="bg-bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <ListTableSkeleton viewMode="list" displayColumn="triple" />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no eventId
  if (!eventId) {
    return (
      <div className="bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Event Not Selected</h3>
            <p className="text-gray-600">Please select an event to configure integrations.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <SubPageHeader 
          title="Website Integrations" 
          description="Configure and manage third-party integrations for your event website" 
          line={false} 
        />

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-7">
          {integrationModules.map((module) => (
            <IntegrationModuleCard
              key={module.id}
              module={module}
              enabled={modules[module.id]}
              onToggle={handleModuleToggle}
              onManage={handleManage}
            />
          ))}
        </div>

        {/* Configuration Modal */}
        <ConfigurationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          moduleId={currentModuleId}
          onSave={handleSaveConfig}
          eventWebsite={eventWebsite}
          policyData={policyData}
        />

        {/* Notification */}
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    </div>
  );
};

export default WebsiteIntegrations;
