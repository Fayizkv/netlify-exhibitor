import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getData } from "../../../../../../backend/api";

const FormEmbed = () => {
  const { slug } = useParams();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        console.log("[FormEmbed] Fetching form data for slug:", slug);

        // Fetch form data based on slug
        const response = await getData({ slug }, "ticket/form-by-slug");

        if (response.status === 200) {
          console.log("[FormEmbed] Form data fetched successfully:", response.data);
          setFormData(response.data);
        } else {
          console.error("[FormEmbed] Failed to fetch form data:", response);
          setError("Form not found");
        }
      } catch (err) {
        console.error("[FormEmbed] Error fetching form data:", err);
        setError("Failed to load form");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchFormData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-6xl mb-4">📝</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Not Available</h1>
          <p className="text-gray-600">This form is not currently available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white">
            <h1 className="text-3xl font-bold mb-2">{formData.title || "Registration Form"}</h1>
            {formData.description && <p className="text-blue-100 text-lg">{formData.description}</p>}
          </div>

          {/* Form Content */}
          <div className="p-6">
            <div className="text-center mb-8">
              <div className="text-gray-600 text-6xl mb-4">📋</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Registration Form</h2>
              <p className="text-gray-600">Please fill out the form below to complete your registration.</p>
            </div>

            {/* Form Fields Placeholder */}
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-gray-400 text-4xl mb-4">🔧</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Form Builder</h3>
                <p className="text-gray-600 mb-4">This form is configured through the EventHex Form Builder.</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Form ID:</strong> {formData._id}
                    <br />
                    <strong>Slug:</strong> {slug}
                    <br />
                    <strong>Type:</strong> {formData.type || "Form"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 pt-6">
                <button onClick={() => window.close()} className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  Close
                </button>
                <button onClick={() => window.print()} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Powered by EventHex - Event Management Platform</p>
        </div>
      </div>
    </div>
  );
};

export default FormEmbed;
