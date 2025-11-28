const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate form fields using AI
router.post("/generate-form", async (req, res) => {
  try {
    const { description, formType = "general", context = "form_builder" } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `
You are an expert form builder AI assistant. Based on the user's description, generate a JSON array of form fields that would be appropriate for their use case.

User Description: "${description}"
Form Type: ${formType}
Context: ${context}

Generate form fields with the following exact structure:
{
  "label": "Field Label",
  "type": "field_type",
  "placeholder": "Placeholder text",
  "required": true/false,
  "options": ["option1", "option2"] // only for select/multiSelect fields
}

Available field types (use exactly these):
- text: For general text input
- email: For email addresses  
- number: For numeric input
- password: For password fields
- mobilenumber: For phone numbers
- date: For date selection
- time: For time selection
- textarea: For long text/comments
- select: For dropdown selection (single choice)
- multiSelect: For multiple selection
- checkbox: For yes/no questions
- file: For file uploads

Guidelines:
1. Generate 3-8 relevant fields based on the description
2. For registration/event forms: always include name and email
3. For contact forms: include name, email, and message
4. For surveys: include relevant question fields
5. Make fields required only if they are truly essential
6. Use appropriate field types for the data being collected
7. Provide clear, user-friendly labels
8. Add helpful placeholder text that guides users
9. For select fields, provide 3-6 realistic options
10. Consider the user's industry/context when generating fields

Return ONLY a valid JSON array, no additional text or formatting.

Example for a business event registration:
[
  {
    "label": "Full Name",
    "type": "text",
    "placeholder": "Enter your full name",
    "required": true
  },
  {
    "label": "Email Address", 
    "type": "email",
    "placeholder": "Enter your email address",
    "required": true
  },
  {
    "label": "Company",
    "type": "text", 
    "placeholder": "Enter your company name",
    "required": false
  },
  {
    "label": "Job Title",
    "type": "text",
    "placeholder": "Enter your job title", 
    "required": false
  },
  {
    "label": "Industry",
    "type": "select",
    "placeholder": "Select your industry",
    "required": false,
    "options": ["Technology", "Healthcare", "Finance", "Education", "Other"]
  }
]
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    let fields;
    try {
      // Clean the response text
      const cleanedText = text.trim();

      // Try to extract JSON array from the response
      const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        fields = JSON.parse(jsonMatch[0]);
      } else {
        fields = JSON.parse(cleanedText);
      }

      // Validate that we got an array
      if (!Array.isArray(fields)) {
        throw new Error("Response is not an array");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", text);
      console.error("Parse error:", parseError);

      // Fallback based on form type
      if (formType === "registration" || context === "event_registration") {
        fields = [
          {
            label: "Full Name",
            type: "text",
            placeholder: "Enter your full name",
            required: true,
          },
          {
            label: "Email Address",
            type: "email",
            placeholder: "Enter your email address",
            required: true,
          },
          {
            label: "Phone Number",
            type: "mobilenumber",
            placeholder: "Enter your phone number",
            required: false,
          },
          {
            label: "Company",
            type: "text",
            placeholder: "Enter your company name",
            required: false,
          },
        ];
      } else {
        fields = [
          {
            label: "Name",
            type: "text",
            placeholder: "Enter your name",
            required: true,
          },
          {
            label: "Email",
            type: "email",
            placeholder: "Enter your email",
            required: true,
          },
          {
            label: "Message",
            type: "textarea",
            placeholder: "Enter your message",
            required: false,
          },
        ];
      }
    }

    // Validate and sanitize the fields
    const validatedFields = fields
      .map((field, index) => {
        const validTypes = ["text", "email", "number", "password", "mobilenumber", "date", "time", "textarea", "select", "multiSelect", "checkbox", "file"];

        return {
          label: field.label || `Field ${index + 1}`,
          type: validTypes.includes(field.type) ? field.type : "text",
          placeholder: field.placeholder || `Enter ${(field.label || "value").toLowerCase()}`,
          required: Boolean(field.required),
          ...(field.options &&
            Array.isArray(field.options) &&
            field.options.length > 0 && {
              options: field.options.slice(0, 10), // Limit to 10 options max
            }),
        };
      })
      .slice(0, 10); // Limit to 10 fields max

    res.json({
      success: true,
      fields: validatedFields,
      message: `Generated ${validatedFields.length} form fields successfully`,
      metadata: {
        formType,
        context,
        fieldCount: validatedFields.length,
      },
    });
  } catch (error) {
    console.error("AI form generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate form fields",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    });
  }
});

// Test endpoint to verify AI integration
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "AI service is running",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
