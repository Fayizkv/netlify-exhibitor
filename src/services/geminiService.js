// Gemini AI Service for Form Generation
// Now uses backend API for secure API key handling
import { postData } from "../backend/api";

class GeminiService {
  constructor() {
    this.apiEndpoint = "/api/v1/ai/generate-form-fields";
  }

  // Main method to generate form fields from user description
  async generateFormFields(description) {
    try {
      if (!description || description.trim().length === 0) {
        throw new Error("Description is required");
      }

      // Call backend API instead of OpenRouter directly
      const response = await postData(
        { description: description.trim() },
        "ai/generate-form-fields"
      );

      if (response.status === 200 && response.data?.success) {
        return response.data.fields;
      } else {
        throw new Error(response.data?.message || "Failed to generate form fields");
      }
    } catch (error) {
      console.error("Gemini Service Error:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
export default geminiService;
