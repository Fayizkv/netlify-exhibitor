import React, { useState, useEffect } from "react";
import { EmailBuilder } from "react-email-builder";
import { nanoid } from "nanoid";

// Example React component using the email-builder package
function EmailBuilderApp() {
  // State to track templates
  const [templates, setTemplates] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(null);

  // Create a default template when the component mounts if no templates exist
  useEffect(() => {
    if (templates.length === 0) {
      const defaultTemplate = {
        id: nanoid(),
        name: "Welcome Email",
        content: [],
        createdAt: new Date().toISOString(),
      };

      setTemplates([defaultTemplate]);
      setCurrentTemplate(defaultTemplate);
    }
  }, []);

  // Handle when a template changes
  const handleTemplateChange = (template) => {
    console.log("Template updated:", template);
    setCurrentTemplate(template);

    // Update the template in the templates array
    setTemplates((prevTemplates) => prevTemplates.map((t) => (t.id === template.id ? template : t)));
  };

  // Handle when templates collection changes (add/remove)
  const handleTemplatesChange = (newTemplates) => {
    console.log("Templates updated:", newTemplates);
    setTemplates(newTemplates);

    // If current template was deleted, select the first available template
    if (currentTemplate && !newTemplates.find((t) => t.id === currentTemplate.id)) {
      setCurrentTemplate(newTemplates[0] || null);
    }
  };

  return (
    <div className="email-builder-container">
      <h1>Email Template Builder</h1>

      {/* Email Builder Component */}
      <EmailBuilder templates={templates} initialTemplate={currentTemplate} onTemplateChange={handleTemplateChange} onTemplatesChange={handleTemplatesChange} />

      {/* Display the current template in JSON format (for demonstration) */}
      <div className="template-json">
        <h3>Current Template JSON:</h3>
        <pre>{currentTemplate ? JSON.stringify(currentTemplate, null, 2) : "No template selected"}</pre>
      </div>
    </div>
  );
}

export default EmailBuilderApp;
