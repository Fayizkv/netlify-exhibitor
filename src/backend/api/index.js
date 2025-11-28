import { GetAccessToken, SetAccessToken } from "../authentication";
import axios from "axios";

// Universal function to convert any JavaScript object to FormData recursively
const convertToFormData = (data, formData = new FormData(), parentKey = '') => {
  if (data === null || data === undefined) {
    return formData;
  }

  // Handle File objects
  if (data instanceof File || data instanceof Blob) {
    formData.append(parentKey, data);
    return formData;
  }

  // Handle Arrays
  if (Array.isArray(data)) {
    if (data.length === 0) {
      // Don't append empty arrays to FormData
      return formData;
    }
    
    data.forEach((item, index) => {
      const key = `${parentKey}[${index}]`;
      convertToFormData(item, formData, key);
    });
    return formData;
  }

  // Handle Objects
  if (typeof data === 'object') {
    // Handle select values with _id and value properties
    if ('_id' in data && 'value' in data) {
      formData.append(parentKey, data._id);
      return formData;
    }

    // Handle regular objects recursively
    Object.entries(data).forEach(([key, value]) => {
      const formKey = parentKey ? `${parentKey}[${key}]` : key;
      convertToFormData(value, formData, formKey);
    });
    return formData;
  }

  // Handle primitive values (string, number, boolean)
  formData.append(parentKey, data);
  return formData;
};

// You can now use the formData object as needed, such as sending it via AJAX or submitting a form

const postData = async (fields, url, dispatch, navigate) => {
  const data = new Promise(async (resolve, reject) => {
    try {
      let token = GetAccessToken();
      let isUploading = false;
      let requestData;
console.log("fields", fields);
      // Check if we need to upload files
      const checkForFiles = (obj) => {
        for (const [key, value] of Object.entries(obj)) {
          if (value instanceof File) return true;
          if (Array.isArray(value) && value.some((item) => item instanceof File)) return true;
        }
        return false;
      };

      isUploading = checkForFiles(fields);

      if (isUploading) {
        // Use universal converter for any nested structure
        requestData = convertToFormData(fields);
      } else {
        // Use JSON for regular data (preserves empty arrays properly)
        requestData = JSON.stringify(fields);
      }

      const response = await axios.post(`${import.meta.env.VITE_API}${url}`, requestData, {
        headers: {
          "Content-Type": isUploading ? "multipart/form-data" : "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const tokenUpdated = response.headers.get("Token-Updated");
      if (tokenUpdated === "true") {
        const newToken = response.headers.get("Authorization").split(" ")[1];
        SetAccessToken(newToken);
      }

      if (response.status === 401) {
        localStorage.clear();
        window.location.href = "/";
        return resolve({ status: response.status, data: [] });
      }

      return resolve({ status: response.status, data: response.data });
    } catch (error) {
      console.log("error", error);
      resolve({
        status: error?.response?.status,
        customMessage: error?.response?.data?.customMessage ?? "Something went wrong!",
        data: error?.response?.data,
      });
    }
  });

  return data;
};
const postDataCustom = async (fields, ulr, dispatch, navigate) => {
  const data = new Promise(async (resolve, reject) => {
    try {
      let token = GetAccessToken();
      let isUploading = false;
      let requestData;

      // Check if we need to upload files
      const checkForFiles = (obj) => {
        for (const [key, value] of Object.entries(obj)) {
          if (value instanceof File) return true;
          if (Array.isArray(value) && value.some((item) => item instanceof File)) return true;
        }
        return false;
      };

      isUploading = checkForFiles(fields);

      if (isUploading) {
        // Use universal converter for any nested structure
        requestData = convertToFormData(fields);
      } else {
        // Use JSON for regular data
        requestData = JSON.stringify(fields);
      }

      const response = await axios.post(`${ulr}`, requestData, {
        headers: {
          "Content-Type": isUploading ? "multipart/form-data" : "application/json",
          Authorization: "Bearer " + token,
        },
      });
      const tokenUpdated = response.headers.get("Token-Updated");
      if (tokenUpdated === "true") {
        const newToken = response.headers.get("Authorization").split(" ")[1];
        SetAccessToken(newToken);
      }
      if (response.status === 401) {
        try {
          localStorage.clear();
          window.location.href = "/";
          return resolve({ status: response.status, data: [] });
        } catch (error) {
          console.log(error);
        }
      }

      resolve({ status: response.status, data: response.data });
    } catch (error) {
      // console.log("error", error);
      resolve({
        status: error?.response?.status,
        customMessage: error?.response?.data?.customMessage ?? "Something went wrong!",
        data: error?.response?.data,
      });
    }
  });

  return data;
};
const putData = async (fields, ulr, dispatch, navigate) => {
  console.log("PutData", fields, { ulr });
  try {
    let token = GetAccessToken();
    let isUploading = false;
    let requestData;

    // Check if we need to upload files
    const checkForFiles = (obj) => {
      for (const [key, value] of Object.entries(obj)) {
        if (value instanceof File) return true;
        if (Array.isArray(value) && value.some((item) => item instanceof File)) return true;
      }
      return false;
    };

    isUploading = checkForFiles(fields);

    if (isUploading) {
      // Use universal converter for any nested structure
      requestData = convertToFormData(fields);
    } else {
      // Use JSON for regular data (preserves empty arrays properly)
      requestData = JSON.stringify(fields);
    }

    console.log(fields);
    const response = await axios.put(`${import.meta.env.VITE_API}${ulr}`, requestData, {
      headers: {
        "Content-Type": isUploading ? "multipart/form-data" : "application/json",
        Authorization: "Bearer " + token,
      },
    });

    const tokenUpdated = response.headers.get("Token-Updated");
    if (tokenUpdated === "true") {
      const newToken = response.headers.get("Authorization").split(" ")[1];
      SetAccessToken(newToken);
    }

    if (response.status === 401) {
      try {
        localStorage.clear();
        window.location.href = "/";
        return { status: response.status, data: [] };
      } catch (error) {
        console.log(error);
      }
    }

    return { status: response.status, data: response.data };
  } catch (error) {
    console.log(error);
    return {
      status: error.response?.status,
      customMessage: error.response?.data?.customMessage ?? "Something went wrong!",
      data: error?.response?.data,
    };
  }
};
const bulkUploadData = async (formData, url, signal, dispatch, navigate) => {
  try {
    let token = GetAccessToken();

    const response = await axios.post(`${import.meta.env.VITE_API}${url}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: "Bearer " + token,
      },
      signal: signal,
    });
    const tokenUpdated = response.headers.get("Token-Updated");
    if (tokenUpdated === "true") {
      const newToken = response.headers.get("Authorization").split(" ")[1];
      SetAccessToken(newToken);
    }
    // Handle unauthorized access
    if (response.status === 401) {
      // dispatch(clearLogin()); // Uncomment if you have a clearLogin action
      navigate("/");
      navigate(0);
    }

    return { status: response.status, data: response.data };
  } catch (error) {
    console.log("error", error);
    return {
      status: error.response?.status ?? error,
      data: error.response?.data?.message || "An error occurred while uploading.", // Provide a default message
    };
  }
};

const getData = async (fields, ulr, dispatch, navigate) => {
  const data = new Promise(async (resolve, reject) => {
    try {
      let params = new URLSearchParams();

      // Function to recursively add parameters
      const addParams = (obj, prefix = "") => {
        for (let key in obj) {
          if (obj.hasOwnProperty(key)) {
            let paramKey = prefix ? `${prefix}[${key}]` : key;
            if (typeof obj[key] === "object" && obj[key] !== null) {
              addParams(obj[key], paramKey);
            } else {
              params.append(paramKey, obj[key]);
            }
          }
        }
      };

      // Add all fields to params
      addParams(fields);

      let token = GetAccessToken();
      const hasQueryString = ulr.includes("?");
      const separator = hasQueryString ? "&" : "?";
      const fullUrl = `${import.meta.env.VITE_API}${ulr}${separator}${params.toString()}`;

      const response = await axios.get(fullUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });
      const tokenUpdated = response.headers.get("Token-Updated");
      if (tokenUpdated === "true") {
        const newToken = response.headers.get("Authorization").split(" ")[1];
        SetAccessToken(newToken);
      }
      if (response.status === 401) {
        try {
          localStorage.clear();
          window.location.href = "/";
        } catch (error) {
          console.log(error);
        }
      }
      resolve({ status: response.status, data: response.data });
    } catch (error) {
      if (error.response?.status) {
        if (error.response?.status === 401) {
          try {
            localStorage.clear();
            window.location.href = "/";
          } catch (error) {
            console.log(error);
          }
        }
      }
      resolve({
        status: error.response?.status,
        data: error.response?.data?.message,
      });
    }
  });
  return data;
};
const getCustomData = async (fields, ulr, dispatch, navigate) => {
  const data = new Promise(async (resolve, reject) => {
    try {
      let params = new URLSearchParams();

      // Function to recursively add parameters
      const addParams = (obj, prefix = "") => {
        for (let key in obj) {
          if (obj.hasOwnProperty(key)) {
            let paramKey = prefix ? `${prefix}[${key}]` : key;
            if (typeof obj[key] === "object" && obj[key] !== null) {
              addParams(obj[key], paramKey);
            } else {
              params.append(paramKey, obj[key]);
            }
          }
        }
      };

      // Add all fields to params
      addParams(fields);

      let token = GetAccessToken();
      const hasQueryString = ulr.includes("?");
      const separator = hasQueryString ? "&" : "?";
      const fullUrl = `${ulr}${separator}${params.toString()}`;

      const response = await axios.get(fullUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });
      const tokenUpdated = response.headers.get("Token-Updated");
      if (tokenUpdated === "true") {
        const newToken = response.headers.get("Authorization").split(" ")[1];
        SetAccessToken(newToken);
      }
      if (response.status === 401) {
        try {
          localStorage.clear();
          window.location.href = "/";
        } catch (error) {
          console.log(error);
        }
      }
      resolve({ status: response.status, data: response.data });
    } catch (error) {
      if (error.response?.status) {
        if (error.response?.status === 401) {
          try {
            localStorage.clear();
            window.location.href = "/";
          } catch (error) {
            console.log(error);
          }
        }
      }
      resolve({
        status: error.response?.status,
        data: error.response?.data?.message,
      });
    }
  });
  return data;
};
const deleteData = async (fields, ulr, dispatch, navigate) => {
  const data = new Promise(async (resolve, reject) => {
    try {
      let token = GetAccessToken();
      let queryString = Object.keys(fields)
        .map((key) => key + "=" + fields[key])
        .join("&");
      const response = await axios.delete(`${import.meta.env.VITE_API}${ulr}?${queryString}`, {
        headers: { Authorization: "Bearer " + token },
      });
      const tokenUpdated = response.headers.get("Token-Updated");
      if (tokenUpdated === "true") {
        const newToken = response.headers.get("Authorization").split(" ")[1];
        SetAccessToken(newToken);
      }
      if (response.status === 401) {
        try {
          localStorage.clear();
          window.location.href = "/";
        } catch (error) {
          console.log(error);
        }
      }
      resolve({ status: response.status, data: response.data });
    } catch (error) {
      console.log("API Eror", error.message);
      resolve({
        status: error.response.status,
        customMessage: error.response?.data?.customMessage ?? "Something went wrong!",
      });
    }
  });

  return data;
};
const getBlobData = async (fields, ulr, dispatch, navigate) => {
  console.log("getBlobData called with URL:", ulr);
  const data = new Promise(async (resolve, reject) => {
    try {
      let params = new URLSearchParams();

      // Function to recursively add parameters
      const addParams = (obj, prefix = "") => {
        for (let key in obj) {
          if (obj.hasOwnProperty(key)) {
            let paramKey = prefix ? `${prefix}[${key}]` : key;
            if (typeof obj[key] === "object" && obj[key] !== null) {
              addParams(obj[key], paramKey);
            } else {
              params.append(paramKey, obj[key]);
            }
          }
        }
      };

      // Add all fields to params
      addParams(fields);

      let token = GetAccessToken();
      console.log("Token retrieved:", token ? "Yes" : "No");

      const hasQueryString = ulr.includes("?");
      const separator = hasQueryString ? "&" : "?";
      const fullUrl = `${import.meta.env.VITE_API}${ulr}${separator}${params.toString()}`;
      console.log("Making request to:", fullUrl);

      const response = await axios.get(fullUrl, {
        headers: {
          Accept: "application/pdf",
          Authorization: "Bearer " + token,
        },
        responseType: "arraybuffer",
      });
      console.log("Response received:", {
        status: response.status,
        hasData: !!response.data,
        headers: response.headers,
      });

      // Check token update in headers (fixed from headers.get to direct access)
      const tokenUpdated = response.headers["token-updated"];
      if (tokenUpdated === "true") {
        console.log("Updating token");
        const newToken = response.headers["authorization"]?.split(" ")[1];
        if (newToken) {
          SetAccessToken(newToken);
        }
      }

      if (response.status === 401) {
        console.error("Unauthorized access");
        try {
          localStorage.clear();
          window.location.href = "/";
          return resolve({ status: response.status, data: null });
        } catch (error) {
          console.error("Error during unauthorized handling:", error);
        }
      }

      // Convert array buffer to blob
      const blob = new Blob([response.data], { type: "application/pdf" });
      console.log("Blob created:", {
        size: blob.size,
        type: blob.type,
      });

      resolve({
        status: response.status,
        data: blob,
        headers: response.headers,
      });
    } catch (error) {
      console.error("getBlobData error:", error);
      if (error.response?.status === 401) {
        try {
          localStorage.clear();
          window.location.href = "/";
        } catch (cleanupError) {
          console.error("Error during error handling:", cleanupError);
        }
      }
      resolve({
        status: error.response?.status,
        data: null,
        error: error.message || "Failed to fetch PDF",
      });
    }
  });
  return data;
};
const postJson = async (payload, url, dispatch, navigate) => {
  const data = new Promise(async (resolve) => {
    try {
      const token = GetAccessToken();
      const response = await axios.post(`${import.meta.env.VITE_API}${url}`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const tokenUpdated = response.headers.get?.("Token-Updated");
      if (tokenUpdated === "true") {
        const newToken = response.headers.get("Authorization").split(" ")[1];
        SetAccessToken(newToken);
      }

      if (response.status === 401) {
        localStorage.clear();
        window.location.href = "/";
        return resolve({ status: response.status, data: [] });
      }

      return resolve({ status: response.status, data: response.data });
    } catch (error) {
      console.log("error", error);
      resolve({
        status: error?.response?.status,
        customMessage: error?.response?.data?.customMessage ?? "Something went wrong!",
        data: error?.response?.data,
      });
    }
  });

  return data;
};
// Post JSON to an absolute URL (external services)
const postJsonAbsolute = async (payload, absoluteUrl) => {
  const data = new Promise(async (resolve) => {
    try {
      const token = GetAccessToken();
      const response = await axios.post(`${absoluteUrl}`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? "Bearer " + token : undefined,
        },
      });

      return resolve({ status: response.status, data: response.data });
    } catch (error) {
      resolve({
        status: error?.response?.status,
        data: error?.response?.data,
        customMessage: error?.response?.data?.customMessage ?? "Something went wrong!",
      });
    }
  });

  return data;
};
export { getData, postData, putData, deleteData, bulkUploadData, getCustomData, postDataCustom, getBlobData, postJson, postJsonAbsolute, convertToFormData };
