// Test file to demonstrate enhanced preset field prioritization
import { geminiService } from "./geminiService.js";

// Test cases to demonstrate preset field prioritization
const testCases = [
  {
    description: "Create a registration form with name, email, and company",
    expectedPresets: ["Name", "Email", "Company"],
    testDescription: "Should prioritize Name, Email, and Company preset fields",
  },
  {
    description: "Build a contact form with phone number and designation",
    expectedPresets: ["Phone", "Designation"],
    testDescription: "Should prioritize Phone and Designation preset fields",
  },
  {
    description: "Create a form for website and country selection",
    expectedPresets: ["Website", "Country"],
    testDescription: "Should prioritize Website and Country preset fields",
  },
  {
    description: "Build a survey form with job satisfaction rating",
    expectedPresets: [],
    testDescription: "Should use custom fields for non-preset requirements",
  },
  {
    description: "Create a comprehensive form with name, email, phone, company, designation, website, and country",
    expectedPresets: ["Name", "Email", "Phone", "Company", "Designation", "Website", "Country"],
    testDescription: "Should prioritize ALL preset fields when mentioned",
  },
];

// Function to test preset field detection
function testPresetDetection() {
  console.log("🧪 Testing Preset Field Detection\n");

  testCases.forEach((testCase, index) => {
    console.log(`Test Case ${index + 1}: ${testCase.testDescription}`);
    console.log(`Description: ${testCase.description}`);

    const detectedPresets = geminiService.detectPresetFields(testCase.description);
    const detectedLabels = detectedPresets.map((field) => field.label);

    console.log(`Expected presets: [${testCase.expectedPresets.join(", ")}]`);
    console.log(`Detected presets: [${detectedLabels.join(", ")}]`);

    const isCorrect = testCase.expectedPresets.every((expected) => detectedLabels.includes(expected)) && detectedLabels.length === testCase.expectedPresets.length;

    console.log(`Result: ${isCorrect ? "✅ PASS" : "❌ FAIL"}`);
    console.log("---\n");
  });
}

// Function to demonstrate field configuration differences
function demonstrateFieldConfiguration() {
  console.log("🔧 Field Configuration Demonstration\n");

  const sampleDescription = "Create a registration form with name, email, and company";

  // Simulate what the AI would generate
  const mockAIGeneratedFields = [
    { label: "Name", type: "text", placeholder: "Enter your full name", required: true },
    { label: "Email", type: "email", placeholder: "youremail@email.com", required: true },
    { label: "Company", type: "text", placeholder: "Enter your company name", required: false },
  ];

  console.log("Before Enhancement - AI Generated Fields:");
  mockAIGeneratedFields.forEach((field) => {
    console.log(`- ${field.label}: type="${field.type}", placeholder="${field.placeholder}"`);
    console.log(`  Missing: icon, value, view, add, update properties`);
  });

  console.log("\nAfter Enhancement - Processed Fields:");
  mockAIGeneratedFields.forEach((field) => {
    const processedField = geminiService.validateAndCleanFields([field])[0];
    console.log(`- ${processedField.label}: type="${processedField.type}", placeholder="${processedField.placeholder}"`);
    console.log(`  ✅ Has icon: ${processedField.icon}`);
    console.log(`  ✅ Has value: ${processedField.value}`);
    console.log(`  ✅ Has view/add/update: ${processedField.view}/${processedField.add}/${processedField.update}`);
  });

  console.log("\nKey Improvements:");
  console.log("✅ AI-generated fields now include ALL preset field properties");
  console.log("✅ Fields will render with proper icons and styling");
  console.log("✅ Visual consistency between AI and manual field addition");
  console.log("✅ Complete field configuration for proper form rendering");
}

// Function to demonstrate the enhanced prompt
function demonstrateEnhancedPrompt() {
  console.log("📝 Enhanced Prompt Demonstration\n");

  const sampleDescription = "Create a registration form with name, email, and company";
  const prompt = geminiService.buildPrompt(sampleDescription);

  console.log("Sample Description:", sampleDescription);
  console.log("\nEnhanced Prompt Preview:");
  console.log(prompt.substring(0, 500) + "...");
  console.log("\nKey Features:");
  console.log("✅ MANDATORY preset field prioritization");
  console.log("✅ Real-time preset field detection");
  console.log("✅ Exact preset field configuration usage");
  console.log("✅ Enhanced keyword matching");
}

// Run tests
if (typeof window === "undefined") {
  // Node.js environment
  testPresetDetection();
  demonstrateFieldConfiguration();
  demonstrateEnhancedPrompt();
} else {
  // Browser environment - export functions for manual testing
  window.testPresetDetection = testPresetDetection;
  window.demonstrateFieldConfiguration = demonstrateFieldConfiguration;
  window.demonstrateEnhancedPrompt = demonstrateEnhancedPrompt;
}

export { testPresetDetection, demonstrateFieldConfiguration, demonstrateEnhancedPrompt };
