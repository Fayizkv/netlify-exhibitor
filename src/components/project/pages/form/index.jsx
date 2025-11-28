import React, { useState, useEffect } from "react";
import { PageHeader } from "../../../core/input/heading";
import { RowContainer } from "../../../styles/containers/styles";
import { Button } from "../../../core/elements";
import Search from "../../../core/search";
import { Filter, ButtonPanel } from "../../../core/list/styles";
import NoDataFound from "../../../core/list/nodata";
import Loader from "../../../core/loader";
import { GetIcon } from "../../../../icons";

const FormPage = () => {
  const [formsData, setFormsData] = useState([
    {
      id: 1,
      name: "Online Workshop on Artificial Intelligence for Teachers",
      type: "Ticket",
      regCount: 45,
      slug: "ai-workshop-teachers",
      status: true,
      formCollection: true,
      limit: 100,
      liveUntil: "2024-12-31T23:59",
    },
    {
      id: 2,
      name: "Media Registration",
      type: "Participant Type",
      regCount: 0,
      slug: "media-participant",
      status: true,
      formCollection: true,
      limit: null,
      liveUntil: null,
    },
    {
      id: 3,
      name: "Volunteer Registration",
      type: "Form",
      regCount: 12,
      slug: "volunteer-registration",
      status: true,
      formCollection: true,
      limit: 50,
      liveUntil: "2024-11-30T23:59",
    },
    {
      id: 4,
      name: "Early Bird Registration",
      type: "Form",
      regCount: 150,
      slug: "early-bird-registration",
      status: true,
      formCollection: true,
      limit: 200,
      liveUntil: "2024-10-15T23:59",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    type: "Form",
    formCollection: true,
    limit: "",
    liveUntil: "",
  });
  const [copyTooltip, setCopyTooltip] = useState({});

  const BASE_URL = "https://example.com/form/";

  // Generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // Update URL preview
  const updateUrlPreview = () => {
    const slug = formData.slug;
    if (slug) {
      return `${BASE_URL}${slug}`;
    }
    return "";
  };

  // Handle status toggle
  const handleStatusToggle = (id) => {
    console.log("Status toggle clicked for form ID:", id);
    setFormsData((prev) => prev.map((f) => (f.id === id ? { ...f, status: !f.status } : f)));
  };

  // Handle form collection toggle
  const handleFormCollectionToggle = (id, action) => {
    console.log("Form collection toggle clicked for form ID:", id, "Action:", action);
    setFormsData((prev) => prev.map((f) => (f.id === id ? { ...f, formCollection: action === "enable" } : f)));
  };

  // Handle edit
  const handleEdit = (form) => {
    console.log("Edit form:", form);
    setEditingForm(form);
    setFormData({
      name: form.name,
      slug: form.slug,
      type: form.type,
      formCollection: form.formCollection,
      limit: form.limit || "",
      liveUntil: form.liveUntil || "",
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = (id) => {
    console.log("Delete form ID:", id);
    if (window.confirm("Are you sure you want to delete this form?")) {
      setFormsData((prev) => prev.filter((f) => f.id !== id));
    }
  };

  // Handle copy URL
  const handleCopyUrl = (url) => {
    console.log("Copying URL:", url);
    navigator.clipboard.writeText(url).then(() => {
      setCopyTooltip((prev) => ({ ...prev, [url]: true }));
      setTimeout(() => {
        setCopyTooltip((prev) => ({ ...prev, [url]: false }));
      }, 2000);
    });
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-generate slug when name changes
    if (field === "name") {
      const slug = generateSlug(value);
      setFormData((prev) => ({
        ...prev,
        slug: slug,
      }));
    }
  };

  // Open modal for new form
  const openModal = () => {
    setEditingForm(null);
    setFormData({
      name: "",
      slug: "",
      type: "Form",
      formCollection: true,
      limit: "",
      liveUntil: "",
    });
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingForm(null);
  };

  // Handle form submit
  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);

    if (editingForm) {
      // Update existing form
      setFormsData((prev) =>
        prev.map((f) =>
          f.id === editingForm.id
            ? {
                ...f,
                name: formData.name,
                slug: formData.slug,
                type: formData.type,
                formCollection: formData.formCollection,
                limit: formData.limit || null,
                liveUntil: formData.liveUntil || null,
              }
            : f
        )
      );
    } else {
      // Add new form
      const newForm = {
        id: Date.now(),
        name: formData.name,
        slug: formData.slug,
        type: formData.type,
        regCount: 0,
        status: true,
        formCollection: formData.formCollection,
        limit: formData.limit || null,
        liveUntil: formData.liveUntil || null,
      };
      setFormsData((prev) => [...prev, newForm]);
    }

    closeModal();
  };

  // Filter forms based on search term
  const filteredForms = formsData.filter((form) => form.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Sort forms by name
  const sortedData = [...filteredForms].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <RowContainer className="data-layout">
      {/* Header */}
      <PageHeader title="Forms" description="Manage registration forms and their settings" line={false} />

      {/* Action Panel */}
      <ButtonPanel className="custom">
        <div className="flex items-center gap-3">
          <Search title="Search" placeholder="Search forms..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <Filter onClick={() => {}}>
            <GetIcon icon="filter" />
            <span>Filter</span>
          </Filter>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={openModal} className="bg-primary-base hover:bg-primary-dark text-white">
            <GetIcon icon="add" />
            <span>Add Form</span>
          </Button>
        </div>
      </ButtonPanel>

      {/* Content */}
      {isLoading ? (
        <Loader />
      ) : sortedData.length === 0 ? (
        <NoDataFound shortName="Forms" icon="form-builder" addPrivilege={true} addLabel="Add Form" isCreatingHandler={openModal} />
      ) : (
        <div className="bg-bg-white rounded-lg border border-stroke-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-bg-weak">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-sub uppercase tracking-wider">Form Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-sub uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-sub uppercase tracking-wider">Registrations</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-sub uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-sub uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm text-gray-700">
                {sortedData.map((form) => {
                  const hasFormAccess = (form.formCollection || form.isDefault) && form.status;
                  const fullUrl = `${BASE_URL}${form.slug}`;
                  let regInfo = hasFormAccess ? `${form.regCount}` : "---";
                  if (hasFormAccess && form.limit) {
                    regInfo += ` / ${form.limit}`;
                  }

                  return (
                    <tr key={form.id} className="bg-white">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{form.name}</div>
                          {hasFormAccess && (
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded border max-w-xs truncate">{fullUrl}</span>
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleCopyUrl(fullUrl)} className="p-1 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Copy URL">
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                  </svg>
                                </button>
                                <button onClick={() => window.open(fullUrl, "_blank")} className="p-1 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Open URL">
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            form.type === "Ticket" ? "bg-red-100 text-red-800" : form.type === "Participant Type" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {form.type === "Ticket" && (
                            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                              />
                            </svg>
                          )}
                          {form.type === "Participant Type" && (
                            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          )}
                          {form.type === "Form" && (
                            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          )}
                          {form.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{regInfo}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleStatusToggle(form.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                            form.status ? "bg-indigo-600" : "bg-gray-200"
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.status ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEdit(form)} className="text-indigo-600 hover:text-indigo-900">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(form.id)} className="text-red-600 hover:text-red-900">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
          <div className="bg-white w-full max-w-md h-full shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{editingForm ? "Edit Form" : "Add New Form"}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-grow">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label htmlFor="form-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Form Name
                  </label>
                  <input
                    type="text"
                    id="form-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Volunteer Registration"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="form-slug" className="block text-sm font-medium text-gray-700 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    id="form-slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., volunteer-registration"
                    required
                  />
                  {formData.slug && (
                    <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded-md break-all">
                      Your form will be available at: <span className="text-gray-800 font-medium">{updateUrlPreview()}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="form-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Form Type
                  </label>
                  <select
                    id="form-type"
                    value={formData.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Form">Form</option>
                    <option value="Ticket">Ticket</option>
                    <option value="Participant Type">Participant Type</option>
                  </select>
                </div>
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Form Collection</h3>
                      <p className="text-sm text-gray-500">Enable form data collection</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInputChange("formCollection", !formData.formCollection)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        formData.formCollection ? "bg-indigo-600" : "bg-gray-200"
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.formCollection ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                </div>
                {formData.formCollection && (
                  <>
                    <div>
                      <label htmlFor="form-limit" className="block text-sm font-medium text-gray-700 mb-1">
                        Registration Limit
                      </label>
                      <input
                        type="number"
                        id="form-limit"
                        value={formData.limit}
                        onChange={(e) => handleInputChange("limit", e.target.value)}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Leave empty for unlimited"
                        min="1"
                      />
                    </div>
                    <div>
                      <label htmlFor="form-live-until" className="block text-sm font-medium text-gray-700 mb-1">
                        Live Until
                      </label>
                      <input
                        type="datetime-local"
                        id="form-live-until"
                        value={formData.liveUntil}
                        onChange={(e) => handleInputChange("liveUntil", e.target.value)}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </>
                )}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {editingForm ? "Update Form" : "Create Form"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </RowContainer>
  );
};

export default FormPage;
