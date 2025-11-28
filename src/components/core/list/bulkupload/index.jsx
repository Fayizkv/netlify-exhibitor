import React, { useEffect, useState, useRef } from "react";
import FormInput from "../../input";
import { Footer, Form, Page, Overlay, ErrorMessage } from "./styles";

import { CloseButton } from "../popup/styles";
import { DwonlaodIcon, GetIcon } from "../../../../icons";
import { useDispatch, useSelector } from "react-redux";
import { Header } from "../manage/styles";
import { customValidations } from "../../../project/form/validation";
import ExcelJS from "exceljs";
import moment from "moment";
import { AddButton, ButtonPanel, FileButton, TableView, TdView, ThView, TrView } from "../styles";
import { addSelectObject } from "../../../../store/actions/select";
import { bulkUploadData, getData } from "../../../../backend/api";
import { RowContainer } from "../../../styles/containers/styles";
import { NoBulkDataSelected } from "../nodata";
import { IconButton } from "../../elements";
import Loader from "../../loader";
// import { TableView } from "../styles";
const BulkUplaodForm = React.memo((props) => {
  const [selectedLanguage] = useState("en");
  const [errorCount, setErrorCount] = useState(0);
  const dispatch = useDispatch();
  const { setMessage, currentApi } = props;
  const [loaderBox, setLoaderBox] = useState(false);
  const [formBulkErrors, setBulkFormErrors] = useState([]);
  // State to store the form input fields
  const [formState] = useState(props.formInput);
  // State to store the submit button's disabled status
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [selectData, setSelectData] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editingRowData, setEditingRowData] = useState(null);
  const [isLoadingSelectData, setIsLoadingSelectData] = useState(false);
  const selectDataLoadedRef = useRef(false);
  // Add state for conditional data caching
  const [conditionalSelectData, setConditionalSelectData] = useState({});
  const conditionalCacheRef = useRef({});
  // State to store the validation messages
  // const [formErrors, setFormErrors] = useState(props.formErrors);
  const themeColors = useSelector((state) => state.themeColors);
  /**
   * fieldValidation is a callback function to validate a form field based on its properties
   *
   * @param {object} field - The field to be validated
   * @param {string} value - The value of the field
   *
   * @returns {number} flags - The number of validation errors for the field
   */

  useEffect(() => {
    const loadSelectData = async () => {
      // Prevent multiple executions if already loading or already loaded
      if (isLoadingSelectData || selectDataLoadedRef.current) {
        console.log("Select data already loading or loaded, skipping...");
        return;
      }

      // Check if there are any select boxes or multi-select boxes with selectApi to load
      const hasApiSelectBoxes = formState.some((item) => (item.type === "select" || item.type === "multiSelect") && item.add && item.selectApi);

      if (hasApiSelectBoxes) {
        try {
          setIsLoadingSelectData(true);
          setLoaderBox(true);
          const processedSelectData = await processSelectBoxData(formState, selectedLanguage);
          setSelectData(processedSelectData);
          selectDataLoadedRef.current = true; // Mark as loaded
        } catch (error) {
          console.error("Error loading select box data:", error);
          setMessage({ type: 1, content: `Error loading select box data: ${error.message}`, proceed: "Okay" });
        } finally {
          setLoaderBox(false);
          setIsLoadingSelectData(false);
        }
      } else {
        // No API select boxes to load, set empty object immediately and mark as loaded
        setSelectData({});
        selectDataLoadedRef.current = true;
        setIsLoadingSelectData(false);
      }
    };

    // Initialize select data loading if form state exists
    if (formState && formState.length > 0) {
      loadSelectData();
    }
  }, [formState, selectedLanguage]);

  // Reset select data loading state when form changes
  useEffect(() => {
    selectDataLoadedRef.current = false;
    setSelectData(null);
    setConditionalSelectData({});
    conditionalCacheRef.current = {};
  }, [props.formInput]);

  const validation = (fields, udpatedValue, formErrors, agreement, useCheckbox, useCaptcha) => {
    const tempformErrors = { ...formErrors };
    let flags = 0;
    fields.forEach((item) => {
      if (item.name !== "_id") {
        if (item.type === "multiple") {
          item.forms.forEach((form, multipleIndex) => {
            form.forEach((inputs, index) => {
              const res = fieldValidation(
                inputs,
                typeof udpatedValue[item.name][multipleIndex][inputs.name] === "undefined" ? "" : udpatedValue[item.name][multipleIndex][inputs.name],
                null,
                udpatedValue
              );
              tempformErrors[item.name][multipleIndex][inputs.name] = res.tempformError;
              flags += res.flag;
            });
          });
        } else if (item.validation === "greater") {
          const res = fieldValidation(
            item,
            typeof udpatedValue[item.name] === "undefined" ? "" : udpatedValue[item.name],
            typeof udpatedValue[item.reference] === "undefined" ? new Date() : udpatedValue[item.reference],
            udpatedValue
          );
          tempformErrors[item.name] = res.tempformError;
          flags += res.flag;
        } else {
          if (item.type === "url" || item.type === "select") {
            console.log(item.name, typeof udpatedValue[item.name] === "undefined" ? "" : udpatedValue[item.name]);
          }
          const res = fieldValidation(item, typeof udpatedValue[item.name] === "undefined" ? "" : udpatedValue[item.name], null, udpatedValue);
          tempformErrors[item.name] = res.tempformError;
          flags += res.flag;
        }
      }
    });

    setSubmitDisabled(flags > 0);

    // Return proper structure for bulk upload
    return {
      isValid: flags === 0,
      tempformErrors,
      flags,
    };
  };

  const fieldValidation = (field, value, ref = new Date(), udpatedValue = {}) => {
    let flag = 0;
    let tempformError = "";

    if (!field.update && props.formType === "put") {
      return { flag, tempformError };
    }
    if (!field.add && props.formType === "post") {
      return { flag, tempformError };
    }
    if (field.type === "title") {
      return { flag, tempformError };
    }
    if (field.type !== "number" && !field.required && (value?.length ?? 0) === 0) {
      return { flag, tempformError };
    }

    if (field.condition) {
      let conditionStatus = false;
      if (Array.isArray(field.condition.if)) {
        // Code to execute if field.condition.if is an array
        conditionStatus = field.condition.if.some((item) => item === udpatedValue[field.condition.item]);
      } else {
        // Code to execute if field.condition.if is not an array
        conditionStatus = udpatedValue[field.condition.item] === field.condition.if;
      }
      if (conditionStatus) {
        if (field.condition.then === "disabled") {
          return { flag, tempformError };
        }
      } else {
        if (field.condition.else === "disabled") {
          return { flag, tempformError };
        }
      }
    }

    if (field.type === "element" && field.required) {
      if (value === undefined || value === null) {
        flag += 1;
        tempformError = "Required";
        return { flag, tempformError };
      }
    }

    switch (field?.validation) {
      case "slug":
        const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
        if (!slugRegex.test(value)) {
          tempformError = "Invalid slug format";
          flag += 1;
        }
        break;
      case "email":
        const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g;
        if (!regex.test(value)) {
          if ((value?.length ?? 0) > 0) {
            tempformError = "Invalid email format";
          } else {
            tempformError = "";
          }
          flag += 1;
        }
        break;
      case "qt":
        const qtRegex = /^\d{8}$|^$/;
        if (!qtRegex.test(value)) {
          tempformError = "Invalid format";
          flag += 1;
        }
        break;
      case "number":
        if (field.required && (value?.toString().length ?? 0) === 0) {
          flag += 1;
          return { flag, tempformError };
        } else {
          let numberRegex;
          let decimalPlaces = field.decimalPlaces ?? 0;
          if (decimalPlaces === 0) {
            numberRegex = /^\d+$/; // Integer only
          } else if (decimalPlaces === -1) {
            numberRegex = /^\d+(\.\d+)?$/; // Supports unlimited decimal places
          } else if (decimalPlaces === 1) {
            numberRegex = /^\d+(\.\d{0,1})?$/; // Up to 1 decimal place
          } else if (field.decimalPlaces === 2) {
            numberRegex = /^\d+(\.\d{0,2})?$/; // Up to 2 decimal places
          } else {
            numberRegex = /^\d+(\.\d*)?$/; // Any number of decimal places
          }

          if (value === null || typeof value === "undefined" || !numberRegex.test(value?.toString())) {
            tempformError = "Invalid number format";
            return { flag: 1, tempformError };
          }
        }

        // If value exists, validate number format and range
        if (value !== null && value !== undefined && value.toString().length > 0) {
          const numValue = parseFloat(value);

          // Validate minimum if set
          if (field.minimum !== undefined && numValue < field.minimum) {
            flag += 1;
            return {
              flag,
              tempformError: `Minimum: ${field.minimum}`,
            };
          }

          // Validate maximum if set
          if (field.maximum !== undefined && numValue > field.maximum) {
            flag += 1;
            return {
              flag,
              tempformError: `Maximum: ${field.maximum}`,
            };
          }
        }
        break;
      case "mobilenumber":
        const phoneRegex = new RegExp(`^[1-9]\\d{${(value.numberLength ?? 10) - 1}}$`);
        if (!phoneRegex.test(value)) {
          if ((value?.number?.length ?? 0) > 0) {
            tempformError = `Invalid ${value.numberLength ?? 10}-digit number`;
          }
          flag += 1;
        }
        break;
      case "cvv":
        if (!/^[0-9]{3}$/.test(value)) {
          tempformError = "Invalid CVV format";
          flag += 1;
        }
        break;
      case "ccn":
        if (!/^[0-9]{16}$/.test(value)) {
          tempformError = "Invalid card number";
          flag += 1;
        }
        let sum = 0;
        for (let i = 0; i < (value?.length ?? 0); i++) {
          let digit = parseInt(value[i]);
          if (i % 2 === 0) {
            digit *= 2;
            if (digit > 9) {
              digit -= 9;
            }
          }
          sum += digit;
        }
        if (sum % 10 !== 0) {
          tempformError = "Invalid card number";
          flag += 1;
        }
        break;
      case "expiry":
        if (!validateExpiry(value)) {
          tempformError = "Invalid expiry date";
          flag += 1;
        }
        break;
      case "true":
        if (value !== true) {
          tempformError = "Must be true";
          flag += 1;
        }
        break;
      case "fileNumber":
        const fileNumber = /[A-Z0-9-]/;
        if (!fileNumber.test(value)) {
          tempformError = "Invalid file number";
          flag += 1;
        }
        break;
      case "licensePlate":
        const german = /^[A-Z]{3}[ -]?[A-Z0-9]{2}[ -]?[A-Z0-9]{3,5}$/i;
        if (!german.test(value)) {
          tempformError = "Invalid license plate";
          flag += 1;
        }
        break;
      case "url":
        const url = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
        if (!url.test(value)) {
          tempformError = "Invalid URL format";
          flag += 1;
        }
        break;
      case "name":
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(value)) {
          if ((value?.length ?? 0) > 0) {
            tempformError = "Only English characters allowed";
          }
          flag += 1;
        }
        break;
      case "greater":
        const referedDate = new Date(ref);
        if (new Date(value) < referedDate) {
          tempformError = "Date must be in future";
          flag += 1;
        }
        break;
      case "amount":
        const amount = /^\d+([.,]\d{1,2})?$/;
        if (!amount.test(value)) {
          tempformError = "Invalid amount format";
          flag += 1;
        }
        break;
      case "datetime":
        // Accept ISO datetime format for datetime fields
        if (value && value.length > 0) {
          const isValidDateTime = moment(value, moment.ISO_8601, true).isValid();
          if (!isValidDateTime) {
            tempformError = "Invalid datetime format";
            flag += 1;
          }
        }
        break;
      case "time":
        // Accept HH:MM format for time fields
        const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
        if (value && value.length > 0 && !timeRegex.test(value)) {
          tempformError = "Invalid time format";
          flag += 1;
        }
        break;
      case "date":
        // Accept ISO date format for date fields
        if (value && value.length > 0) {
          const isValidDate = moment(value, moment.ISO_8601, true).isValid();
          if (!isValidDate) {
            tempformError = "Invalid date format";
            flag += 1;
          }
        }
        break;
      case "password-match":
        const passwordMatchRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@.$!%*?&]{8,}$/;
        const newPassword = udpatedValue["newPassword"];
        const confirmPassword = udpatedValue["confirmPassword"];
        if (newPassword !== confirmPassword) {
          tempformError = "Passwords do not match";
          flag += 1;
        } else {
          if (!passwordMatchRegex.test(value)) {
            tempformError = "Invalid password format";
            flag += 1;
          }
        }
        break;
      case "password":
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$.!%*?&]{8,}$/;
        if (!passwordRegex.test(value)) {
          if ((value?.length ?? 0) > 0) {
            tempformError = "Invalid password format";
          }
          flag += 1;
        }
        break;
      case "text":
      case "info":
      case "title":
        break;
      default:
        break;
    }

    const customStatus = customValidations(field, tempformError, value, flag, null);
    tempformError = customStatus.tempformError;
    flag = customStatus.flag;

    // Enhanced file validation logic
    if ((field.type === "image" || field.type === "file") && props.formType === "post") {
      if (field.type === "image") {
        if (field.multiple) {
          if ((value?.length ?? 0) === 0) {
            tempformError = "Image required";
            flag += 1;
          } else {
            const isValidImageFormat = (file) => {
              const validFormats = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif", "image/tiff"];
              return validFormats.includes(file.type);
            };
            value.map((item) => {
              const isValidFormat = isValidImageFormat(item);
              if (!isValidFormat) {
                tempformError = "Invalid image format";
                flag += 1;
              }
            });
          }
        } else {
          const isValidImageFormat = (file) => {
            const validFormats = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif", "image/tiff"];
            return validFormats.includes(file?.type);
          };
          const isValidFormat = isValidImageFormat(value);
          if (!isValidFormat) {
            tempformError = "Invalid image format";
            flag += 1;
          }
        }
      } else {
        const allowedTypes = (field.allowedFileTypes || (field?.type === "image" ? ["image/*"] : ["document/*"])).map((type) => type.toLowerCase());
        const isFileTypeAllowed = (file) => {
          const fileType = file?.type ? file.type.toLowerCase() : "";
          return allowedTypes.some((allowedType) => {
            if (allowedType.endsWith("/*")) {
              const mainType = allowedType.split("/")[0];
              return fileType.startsWith(mainType);
            }
            return fileType === allowedType;
          });
        };
        if (!isFileTypeAllowed(value)) {
          tempformError = "Invalid file type";
          flag += 1;
        }
      }
    } else if (field.type === "mobilenumber") {
      const phoneRegex = new RegExp(`^[1-9]\\d{${value.numberLength - 1}}$`);
      if (!phoneRegex.test(value?.number)) {
        if ((value?.number?.length ?? 0) > 0) {
          tempformError = `Invalid ${value.numberLength}-digit number`;
        }
        flag += 1;
      }
    } else if ((field.type === "image" || field.type === "file") && props.formType === "put") {
      return { flag, tempformError };
    } else if (field.type === "checkbox" || field.type === "toggle") {
      return { flag, tempformError };
    } else if (field.type === "number") {
      if (field.required && (value?.toString().length ?? 0) === 0) {
        flag += 1;
        return { flag, tempformError };
      } else {
        let numberRegex;
        let decimalPlaces = field.decimalPlaces ?? 0;
        if (decimalPlaces === 0) {
          numberRegex = /^\d+$/; // Integer only
        } else if (decimalPlaces === -1) {
          numberRegex = /^\d+(\.\d+)?$/; // Supports unlimited decimal places
        } else if (decimalPlaces === 1) {
          numberRegex = /^\d+(\.\d{0,1})?$/; // Up to 1 decimal place
        } else if (field.decimalPlaces === 2) {
          numberRegex = /^\d+(\.\d{0,2})?$/; // Up to 2 decimal places
        } else {
          numberRegex = /^\d+(\.\d*)?$/; // Any number of decimal places
        }

        if (value === null || typeof value === "undefined" || !numberRegex.test(value?.toString())) {
          tempformError = "Invalid number format";
          return { flag: 1, tempformError };
        }
      }

      // If value exists, validate number format and range
      if (value !== null && value !== undefined && value.toString().length > 0) {
        const numValue = parseFloat(value);

        // Validate minimum if set
        if (field.minimum !== undefined && numValue < field.minimum) {
          flag += 1;
          return {
            flag,
            tempformError: `Minimum: ${field.minimum}`,
          };
        }

        // Validate maximum if set
        if (field.maximum !== undefined && numValue > field.maximum) {
          flag += 1;
          return {
            flag,
            tempformError: `Maximum: ${field.maximum}`,
          };
        }
      }
    } else {
      if (field.required && (value?.toString()?.length ?? 0) === 0) {
        tempformError = "Required";
        flag += 1;
      } else if ((field.minimum ?? 0) > (value?.length ?? 0)) {
        tempformError = `Minimum ${field.minimum ?? 0} characters`;
        flag += 1;
      } else if ((field.maximum ?? 10000) < (value?.length ?? 0)) {
        tempformError = `Maximum ${field.maximum ?? 10000} characters`;
        flag += 1;
      }
    }
    return { flag, tempformError };
  };
  function validateExpiry(expiry) {
    let month = parseInt(expiry.substring(0, 2));
    let year = parseInt("20" + expiry.substring(3));
    let now = new Date();
    let currentYear = now.getFullYear();
    let currentMonth = now.getMonth() + 1; // JavaScript months are 0-11
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false; // Expiry date is in the past
    }
    if (month < 1 || month > 12) {
      return false; // Invalid month
    }
    return true;
  }

  // const handleBulkChange = (data = {}) => {
  //   return true;
  // };
  // bulk uplaod format
  const [jsonData, setJsonData] = useState(null);
  const uploadData = async (event) => {
    // Check if there are any select/multiSelect fields that need data
    const hasSelectFields = formState.some((item) => (item.type === "select" || item.type === "multiSelect") && item.add && item.selectApi);

    // Only check for select data if we have select fields
    if (hasSelectFields && !selectData) {
      setMessage({ type: 1, content: "Select box data is still loading. Please wait and try again.", proceed: "Okay" });
      return;
    }

    // Clear previous upload result
    setUploadResult(null);
    setLoaderBox(true);
    const file = event.target.files?.[0];
    if (file) {
      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await file.arrayBuffer());

        const worksheet = workbook.worksheets[0];
        if (!worksheet) {
          throw new Error("No worksheet found in the Excel file");
        }

        const json = [];
        const headers = {};

        // Get headers from first row
        worksheet.getRow(1).eachCell((cell, colNumber) => {
          headers[colNumber] = cell.value;
        });

        // Get data from remaining rows
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // Skip header row

          const rowData = {};
          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber];
            if (header) {
              rowData[header] = cell.value;
            }
          });
          json.push(rowData);
        });

        const errorData = [];

        // 1. Extract unique parent values from Excel data for conditional fields
        const uniqueParentValues = extractUniqueParentValues(json, formState);

        // 2. Load basic select data (non-conditional fields)
        const basicSelectData = selectData;

        // 3. Load conditional data only for required parent values
        const conditionalData = await loadRequiredConditionalData(uniqueParentValues, formState, basicSelectData);
        setConditionalSelectData(conditionalData);

        const finalData = await Promise.all(
          json.map(async (item, itemIndex) => {
            const formErrorItem = {};
            const temp = {};
            let date = new Date();

            await Promise.all(
              formState
                .filter((item) => item.type !== "title" && item.type !== "description")
                .map(async (attribute) => {
                  if (attribute.add) {
                    const itemValue = item[attribute.label];
                    let val = "";
                    // Handle different field types and ensure proper value assignment
                    if (attribute.type === "checkbox") {
                      if (itemValue !== null && itemValue !== undefined) {
                        // Convert Excel value to boolean
                        val = itemValue === true || itemValue === "true" || itemValue === "TRUE" || itemValue === 1;
                      } else {
                        val = JSON.parse(attribute.default === "false" || attribute.default === "true" ? attribute.default : "false");
                      }
                    } else if (attribute.type === "multiSelect") {
                      // Enhanced multi-select processing with conditional support
                      let selectDataToUse = basicSelectData;

                      if (attribute.updateOn) {
                        // This is a conditional field, get the parent value
                        const parentFieldConfig = formState.find((f) => f.name === attribute.updateOn);
                        const parentLabel = parentFieldConfig ? parentFieldConfig.label : attribute.updateOn;
                        const parentValue = item[parentLabel];

                        if (parentValue) {
                          // Get conditional data for this specific parent value
                          const conditionalOptions = getConditionalDataForParent(attribute.name, attribute.updateOn, parentValue, conditionalData);
                          selectDataToUse = {
                            ...basicSelectData,
                            [attribute.name]: conditionalOptions,
                          };
                        }
                      }

                      const multiSelectResult = validateMultiSelectData(attribute, itemValue, selectDataToUse);
                      val = multiSelectResult.value;
                      if (multiSelectResult.error) {
                        formErrorItem[attribute.name] = multiSelectResult.error;
                      }
                    } else if (attribute.type === "datetime" || attribute.type === "date" || attribute.type === "time") {
                      if (itemValue && itemValue !== "") {
                        val = parseExcelDate(itemValue, attribute.type);
                      } else if (attribute.default === "0") {
                        date.setUTCHours(0, 0, 0, 0);
                        val = date.toISOString();
                      } else if (attribute.default === "1") {
                        date.setUTCHours(23, 59, 0, 0);
                        val = date.toISOString();
                      } else if (attribute.default === "empty") {
                        val = "";
                      } else {
                        val = date.toISOString();
                      }
                    } else if (attribute.type === "image" || attribute.type === "file") {
                      val = itemValue || "";
                    } else if (attribute.type === "select") {
                      // Enhanced select box processing with conditional support
                      let selectDataToUse = basicSelectData;

                      if (attribute.updateOn) {
                        // This is a conditional field, get the parent value
                        const parentFieldConfig = formState.find((f) => f.name === attribute.updateOn);
                        const parentLabel = parentFieldConfig ? parentFieldConfig.label : attribute.updateOn;
                        const parentValue = item[parentLabel];

                        if (parentValue) {
                          // Get conditional data for this specific parent value
                          const conditionalOptions = getConditionalDataForParent(attribute.name, attribute.updateOn, parentValue, conditionalData);
                          selectDataToUse = {
                            ...basicSelectData,
                            [attribute.name]: conditionalOptions,
                          };
                        }
                      }

                      const selectResult = validateSelectBoxData(attribute, itemValue, selectDataToUse);
                      val = selectResult.value;
                      if (selectResult.error) {
                        formErrorItem[attribute.name] = selectResult.error;
                      }
                    } else if (attribute.type === "number") {
                      // Handle number fields specifically
                      if (itemValue !== null && itemValue !== undefined && itemValue !== "") {
                        // Convert to number first, then to string for validation
                        const numericValue = Number(itemValue);
                        if (!isNaN(numericValue)) {
                          val = numericValue.toString();
                        } else {
                          val = itemValue.toString();
                          formErrorItem[attribute.name] = "Invalid number format";
                        }
                      } else {
                        val = attribute.default ?? "";
                      }
                    } else if (attribute.type === "mobilenumber") {
                      // Handle mobile number fields - expecting separate columns for phone code and number
                      const phoneCodeKey = `${attribute.label} - Phone Code`;
                      const numberKey = `${attribute.label} - Number`;

                      const phoneCode = item[phoneCodeKey];
                      const phoneNumber = item[numberKey];

                      if (phoneCode && phoneNumber) {
                        // Clean phone code - remove + sign if user added it
                        const cleanPhoneCode = phoneCode.toString().replace(/^\+/, "");

                        // Find the matching country from the attribute's countries array
                        const matchingCountry = attribute.countries?.find((country) => country.phoneCode === parseInt(cleanPhoneCode));

                        if (matchingCountry) {
                          // Validate phone number length according to country
                          const phoneNumberStr = phoneNumber.toString().replace(/\D/g, ""); // Remove non-digits

                          if (phoneNumberStr.length === matchingCountry.PhoneNumberLength) {
                            // Create the mobile number object as expected by the component
                            val = {
                              number: phoneNumberStr,
                              country: matchingCountry.phoneCode,
                              numberLength: matchingCountry.PhoneNumberLength,
                            };
                          } else {
                            formErrorItem[attribute.name] = `Phone number must be ${matchingCountry.PhoneNumberLength} digits for ${matchingCountry.title}`;
                            val = {
                              number: phoneNumberStr,
                              country: matchingCountry.phoneCode,
                              numberLength: matchingCountry.PhoneNumberLength,
                            };
                          }
                        } else {
                          formErrorItem[attribute.name] = `Invalid phone code: ${cleanPhoneCode}. Available codes: ${attribute.countries?.map((c) => c.phoneCode).join(", ")}`;
                          val = {
                            number: phoneNumber.toString().replace(/\D/g, ""),
                            country: parseInt(cleanPhoneCode) || 91,
                            numberLength: 10,
                          };
                        }
                      } else {
                        // Missing phone code or number
                        if (!phoneCode && !phoneNumber) {
                          val = attribute.default ? JSON.parse(attribute.default) : "";
                        } else {
                          formErrorItem[attribute.name] = "Both phone code and number are required";
                          val = {
                            number: phoneNumber ? phoneNumber.toString().replace(/\D/g, "") : "",
                            country: phoneCode ? parseInt(phoneCode.toString().replace(/^\+/, "")) : 91,
                            numberLength: 10,
                          };
                        }
                      }
                    } else {
                      // For all other field types (text, email, etc.)
                      if (itemValue !== null && itemValue !== undefined && itemValue !== "") {
                        // Handle Excel hyperlink objects for URL fields
                        if (typeof itemValue === "object" && itemValue !== null) {
                          // Extract URL from Excel hyperlink object
                          val = itemValue.hyperlink || itemValue.text || itemValue.toString();
                        } else {
                          val = itemValue.toString();
                        }

                        // Clean email values by removing mailto: prefix
                        if (attribute.type === "email") {
                          console.log(`Processing email field ${attribute.label}:`, itemValue);
                          val = cleanEmailValue(val);
                        }

                        // Clean URL values by removing any unwanted prefixes
                        if (attribute.type === "url" && typeof itemValue === "object" && itemValue !== null) {
                          val = cleanEmailValue(val); // This also handles URL cleaning
                        }
                      } else {
                        val = attribute.default ?? "";
                      }
                    }

                    // Always set the processed value to temp using attribute.name as key
                    temp[attribute.name] = val;

                    // Initialize error field if not already set
                    if (!formErrorItem[attribute.name]) {
                      formErrorItem[attribute.name] = "";
                    }
                  }
                })
            );
            errorData.push(formErrorItem);

            return temp;
          })
        );

        // Enhanced validation with proper error structure
        let isValidate = 0;
        finalData.forEach((data, index) => {
          const validationResult = validation(formState, data, errorData[index], false, false, false);

          if (typeof validationResult === "object" && validationResult.tempformErrors) {
            errorData[index] = { ...errorData[index], ...validationResult.tempformErrors };
            isValidate += validationResult.flags || 0;
          } else {
            // Legacy validation - count errors in errorData
            Object.values(errorData[index]).forEach((error) => {
              if (error && error.length > 0) {
                isValidate += 1;
              }
            });
          }
        });

        setErrorCount(isValidate);
        setSubmitDisabled(isValidate > 0);
        setBulkFormErrors(errorData);
        setJsonData(finalData);
      } catch (error) {
        console.error("Error processing Excel file:", error);
        setMessage({ type: 1, content: `Error processing Excel file: ${error.message}`, proceed: "Okay" });
      } finally {
        setLoaderBox(false);
      }
    }
  };

  const bulkUplaodFormat = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("report");

      // Helper function to get fields included in bulk upload
      const getIncludedFields = (formState) => {
        return formState.filter(
          (attribute) => attribute.add && (attribute.bulkUpload ?? true) && attribute.type !== "title" && attribute.type !== "description" && attribute.type !== "image" && attribute.type !== "file"
        );
      };

      // Add headers with special handling for mobile numbers
      const includedFields = getIncludedFields(formState);
      const headers = [];

      includedFields.forEach((attribute) => {
        if (attribute.type === "mobilenumber") {
          // For mobile number fields, create separate columns for phone code and number
          headers.push(`${attribute.label} - Phone Code`);
          headers.push(`${attribute.label} - Number`);
        } else {
          headers.push(attribute.label);
        }
      });

      worksheet.addRow(headers);

      // Add example row with proper formatting for different field types
      const exampleRow = [];

      includedFields.forEach((attribute) => {
        // Generate example data based on field type
        switch (attribute.type) {
          case "mobilenumber":
            // For mobile number fields, add examples for both phone code and number
            if (attribute.countries && attribute.countries.length > 0) {
              const exampleCountry = attribute.countries[0];
              exampleRow.push(exampleCountry.phoneCode); // Phone Code column
              exampleRow.push("1234567890".substring(0, exampleCountry.PhoneNumberLength)); // Number column
            } else {
              exampleRow.push("91"); // Default phone code
              exampleRow.push("1234567890"); // Default number
            }
            break;
          case "select":
            switch (attribute.apiType) {
              case "API":
                exampleRow.push("Example Display Value");
                break;
              case "JSON":
                exampleRow.push("Example Display Value");
                break;
              case "CSV":
                exampleRow.push("Example Display Value");
                break;
              default:
                exampleRow.push("Select Option");
            }
            break;
          case "text":
            exampleRow.push("Example Text");
            break;
          case "email":
            exampleRow.push("example@domain.com");
            break;
          case "number":
            exampleRow.push("123.45");
            break;
          case "date":
            exampleRow.push("2024-01-01");
            break;
          case "datetime":
            exampleRow.push("2024-01-01T10:00:00");
            break;
          case "time":
            exampleRow.push("10:00");
            break;
          case "checkbox":
            exampleRow.push("true");
            break;
          case "multiSelect":
            switch (attribute.apiType) {
              case "API":
                exampleRow.push("Display Value 1, Display Value 2");
                break;
              case "JSON":
                exampleRow.push("Display Value 1, Display Value 2");
                break;
              case "CSV":
                exampleRow.push("Display Value 1, Display Value 2");
                break;
              default:
                exampleRow.push("Option1, Option2");
            }
            break;
          default:
            exampleRow.push("Example Value");
        }
      });

      // worksheet.addRow(exampleRow);

      // Add instructions sheet
      const instructionsSheet = workbook.addWorksheet("Instructions");

      const instructions = [
        ["Field Type", "Description", "Example"],
        ["Text", "Plain text input", "Sample text"],
        ["Email", "Valid email address (no mailto: prefix needed)", "user@example.com"],
        ["Number", "Numeric value (integers or decimals)", "123.45"],
        ["Date", "Date in various formats (Excel dates, YYYY-MM-DD, DD/MM/YYYY, etc.)", "2024-01-01 or 01/01/2024"],
        ["DateTime", "Date and time in various formats (Excel dates, ISO format, etc.)", "2024-01-01T10:00:00 or 01/01/2024 10:00"],
        ["Time", "Time in HH:MM format", "14:30"],
        ["Checkbox", "true or false", "true"],
        ["Mobile Number", "Two columns: Phone Code (numeric, + optional) and Number (digits only)", "Phone Code: 91 or +91, Number: 1234567890"],
        ["Select (API)", "Use display value from available options", "Display Name"],
        ["Select (JSON)", "Use display value from available options", "Display Name"],
        ["Select (CSV)", "Use display value from available options", "Display Name"],
        ["Multi-Select (API)", "Multiple display values separated by commas", "Display Name 1, Display Name 2"],
        ["Multi-Select (JSON)", "Multiple display values separated by commas", "Display Name 1, Display Name 2"],
        ["Multi-Select (CSV)", "Multiple display values separated by commas", "Display Name 1, Display Name 2"],
      ];

      instructions.forEach((row, index) => {
        const worksheetRow = instructionsSheet.addRow(row);
        if (index === 0) {
          worksheetRow.font = { bold: true };
          worksheetRow.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "E0E0E0" },
          };
        }
      });

      // Auto-fit columns for both sheets
      worksheet.columns = headers.map((header) => ({
        header,
        key: header,
        width: Math.max(15, header.length + 5),
      }));

      instructionsSheet.columns = [
        { header: "Field Type", key: "type", width: 15 },
        { header: "Description", key: "description", width: 40 },
        { header: "Example", key: "example", width: 30 },
      ];

      // Style the header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, size: 12 };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F5F5F5" },
      };

      // Style the example row
      const exampleRowStyle = worksheet.getRow(2);
      exampleRowStyle.font = { italic: true };
      exampleRowStyle.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "E8F5E8" },
      };

      // Generate buffer and create download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${props.shortName}-template.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error creating template:", error);
      setMessage({ type: 1, content: `Error creating template: ${error.message}`, proceed: "Okay" });
    }
  };
  const bulkUploadHandler = async (event) => {
    setLoaderBox(true);

    // Convert your array/data to JSON string
    const jsonDataString = JSON.stringify(jsonData);

    // Creating a blob from JSON string
    const blob = new Blob([jsonDataString], { type: "application/json" });
    const file = new File([blob], "bulkUploadData.json", { type: "application/json" });

    // Create form data and append file
    const formData = new FormData();
    formData.append("file", file);
    if (props.parents && typeof props.parents === "object" && !Array.isArray(props.parents)) {
      Object.keys(props.parents).forEach((key) => {
        // Append each key-value pair in the FormData
        formData.append(key, props.parents[key]);
      });
    }

    try {
      const response = await bulkUploadData(formData, `${currentApi}/bulk-upload`);

      if (response.status === 200) {
        const { data } = response;

        // Handle new API response format
        if (data.success && data.summary) {
          const { summary, existingRecords, newRecords, failedRecords } = data;

          // Combine all records for display
          const displayData = [
            ...existingRecords.map((record) => ({ ...record.data, _bulkStatus: "existing" })),
            ...newRecords.map((record) => ({ ...record.data, _bulkStatus: "success" })),
            ...failedRecords.map((record) => ({ ...record.bulkItem, _bulkStatus: "failed", _bulkError: record.error })),
          ];

          setJsonData(displayData);

          // Set upload result for custom display
          setUploadResult({
            type: summary.failed > 0 ? "warning" : "success",
            summary,
            failedRecords,
            newRecords,
            existingRecords,
          });
        } else {
          // Handle legacy response format
          setJsonData(data.alreadyExist || []);
          setUploadResult({
            type: "success",
            legacy: true,
            summary: {
              totalProcessed: (data.alreadyExist || []).length + (data.newRegistrations || []).length,
              successful: (data.newRegistrations || []).length,
              existing: (data.alreadyExist || []).length,
              failed: 0,
            },
            message: `Bulk upload completed. ${(data.alreadyExist || []).length} already exist, ${(data.newRegistrations || []).length} new registrations added.`,
          });
        }
      } else if (response.status === 404) {
        setUploadResult({
          type: "error",
          message: response.data || "Resource not found",
        });
      } else {
        setUploadResult({
          type: "error",
          message: response.data || "Upload failed",
        });
      }
    } catch (error) {
      console.error("Bulk upload error:", error);
      setUploadResult({
        type: "error",
        message: `Upload failed: ${error.message}`,
      });
    } finally {
      setLoaderBox(false);
    }
  };

  const closeModal = () => {
    props.isOpenHandler(false);
  };

  const handleEditRow = (rowIndex, rowData) => {
    setEditingRowIndex(rowIndex);
    setEditingRowData({ ...rowData });
  };

  const handleSaveEdit = (rowIndex) => {
    // Update the jsonData with the edited data
    const updatedJsonData = [...jsonData];
    updatedJsonData[rowIndex] = { ...editingRowData };
    setJsonData(updatedJsonData);

    // Re-validate the edited row
    const updatedBulkFormErrors = [...formBulkErrors];
    const rowFormErrors = updatedBulkFormErrors[rowIndex] || {};

    // Initialize error object for this row if it doesn't exist
    formState.forEach((attribute) => {
      if (attribute.add && attribute.type !== "title" && attribute.type !== "description") {
        if (!rowFormErrors[attribute.name]) {
          rowFormErrors[attribute.name] = "";
        }
      }
    });

    // Validate the edited row
    const validationResult = validation(formState, editingRowData, rowFormErrors, false, false, false);

    if (typeof validationResult === "object" && validationResult.tempformErrors) {
      updatedBulkFormErrors[rowIndex] = validationResult.tempformErrors;
    } else {
      updatedBulkFormErrors[rowIndex] = rowFormErrors;
    }

    setBulkFormErrors(updatedBulkFormErrors);

    // Recalculate total error count and submit disabled state
    let totalErrors = 0;
    updatedBulkFormErrors.forEach((rowErrors) => {
      Object.values(rowErrors).forEach((error) => {
        if (error && error.length > 0) {
          totalErrors += 1;
        }
      });
    });

    setErrorCount(totalErrors);
    setSubmitDisabled(totalErrors > 0);

    // Reset editing state
    setEditingRowIndex(null);
    setEditingRowData(null);
  };

  const handleCancelEdit = () => {
    setEditingRowIndex(null);
    setEditingRowData(null);
  };

  const handleEditFieldChange = async (fieldName, event, type = "text", selectType = null, country = null) => {
    // Find the field configuration
    const field = formState.find((f) => f.name === fieldName);

    let value = "";

    if (type === "checkbox" || type === "toggle" || type === "htmleditor" || type === "element") {
      value = event;
    } else if (type === "multiDate") {
      value = event;
    } else if (type === "select" || type === "timezone") {
      value = event.id;
    } else if (type === "multiSelect") {
      value = event.map((item) => item.id);
    } else if (type === "email" || type === "text" || type === "number" || type === "password") {
      value = event.target.value;
    } else if (type === "mobilenumber") {
      const phoneNumberLength = parseInt(country?.PhoneNumberLength) ?? 10;
      const trimmedValue = event.target.value?.slice(0, phoneNumberLength);
      value = { number: trimmedValue ?? "", country: parseInt(country?.phoneCode), numberLength: phoneNumberLength };
    } else if (type === "search") {
      value = JSON.stringify(event);
    } else if (type === "image" || type === "file" || type === "video") {
      if (field?.multiple) {
        value = event.files;
      } else {
        value = event.target.files[0];
      }
    } else if (type === "datetime" || type === "time") {
      value = event ? event.toISOString() : null;
    } else if (type === "date") {
      value = event ? moment(event).set({ hour: 12, minute: 0, second: 0, millisecond: 0 }).toISOString() : null;
    } else if (type === "textarea") {
      value = event;
    } else if (type === "options") {
      value = event;
    } else {
      value = event.target ? event.target.value : event;
    }

    // Apply field maximum length if specified
    if (field?.maximum && typeof value === "string") {
      value = value.slice(0, field.maximum);
    }

    // Apply number formatting
    if (type === "number") {
      value = value?.replace(/[^0-9.]/g, "");
    }

    // Apply field format if specified
    if (field?.format) {
      switch (field.format) {
        case "uppercase":
          value = value.toUpperCase();
          break;
        case "lowercase":
          value = value.toLowerCase();
          break;
        case "camelcase":
          value = value.replace(/\b\w/g, (char) => char.toUpperCase());
          break;
        case "propercase":
          value = value.toLowerCase().replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());
          break;
        case "sentence":
          break;
        default:
          break;
      }
    }

    let updatedData = {
      ...editingRowData,
      [fieldName]: value,
    };

    // Handle mobilenumber special case
    if (type === "mobilenumber") {
      updatedData = {
        ...editingRowData,
        [fieldName]: value,
        phoneCode: country?.phoneCode,
        PhoneNumberLength: country?.PhoneNumberLength,
      };
    }

    // Handle select field with updateFields
    if (type === "select" && field?.updateFields) {
      field.updateFields?.forEach((element) => {
        updatedData[element.id] = element.collection ? event[element.collection]?.[element.value] : event[element.value];
      });
    }

    // Call field's onChange function if it exists
    if (typeof field?.onChange === "function") {
      updatedData = field.onChange(fieldName, updatedData, "put");
    }

    // Handle dynamic loading for conditional fields when parent value changes
    if (type === "select" || type === "multiSelect") {
      const affectedFields = formState.filter((affectedField) => affectedField.updateOn === fieldName);

      for (const affectedField of affectedFields) {
        const newParentValue = value;
        const displayValue = type === "select" ? event.value || event.name || event.label : value;

        // Check if data for this parent value is already loaded
        const existingData = getConditionalDataForParent(affectedField.name, fieldName, displayValue, conditionalSelectData);

        if (!existingData || existingData.length === 0) {
          try {
            console.log(`Dynamically loading ${affectedField.name} data for ${fieldName}=${newParentValue}`);

            // Use the cacheKey to check if we already have this data
            const cacheKey = `${affectedField.selectApi}_${newParentValue}`;

            if (conditionalCacheRef.current[cacheKey]) {
              // Use cached data
              const updatedConditionalData = {
                ...conditionalSelectData,
                [affectedField.name]: {
                  ...conditionalSelectData[affectedField.name],
                  [displayValue]: conditionalCacheRef.current[cacheKey],
                },
              };
              setConditionalSelectData(updatedConditionalData);
            } else {
              // Load from API
              const response = await getData({ [fieldName]: newParentValue }, affectedField.selectApi);
              const newData = response.status === 200 ? response.data : [];

              // Cache the result
              conditionalCacheRef.current[cacheKey] = newData;

              // Update conditional select data
              const updatedConditionalData = {
                ...conditionalSelectData,
                [affectedField.name]: {
                  ...conditionalSelectData[affectedField.name],
                  [displayValue]: newData,
                },
              };
              setConditionalSelectData(updatedConditionalData);

              console.log(`Loaded ${newData.length} options for ${affectedField.name}`);
            }
          } catch (error) {
            console.error("Error loading conditional data during edit:", error);
          }
        }
      }
    }

    setEditingRowData(updatedData);
  };

  // Helper function to convert IDs to display values for table display
  const getDisplayValue = (attribute, value, selectData, rowData = null) => {
    if (value === null || value === undefined || value === "") return "—";

    // Handle object values with _id and value properties (from API response)
    if (typeof value === "object" && value !== null && !Array.isArray(value) && value.hasOwnProperty("_id") && value.hasOwnProperty("value")) {
      return value.value;
    }

    // Handle arrays of objects with _id and value properties
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object" && value[0].hasOwnProperty("_id") && value[0].hasOwnProperty("value")) {
      return value.map((item) => item.value).join(", ");
    }

    // Handle mobile number fields
    if (attribute.type === "mobilenumber") {
      // Mobile number value is expected to be an object: { number: "1234567890", country: 91, numberLength: 10 }
      if (typeof value === "object" && value !== null && value.number && value.country) {
        const countryName = attribute.countries?.find((c) => c.phoneCode === value.country)?.title || "";
        return `+${value.country} ${value.number}${countryName ? ` (${countryName})` : ""}`;
      } else if (typeof value === "string" && value.trim() !== "") {
        return value; // Fallback for string values
      }
      return "—";
    }

    // Handle checkbox fields
    if (attribute.type === "checkbox") {
      return value ? "Yes" : "No";
    }

    // Handle date/time fields
    if (attribute.type === "date" || attribute.type === "datetime" || attribute.type === "time") {
      if (!value) return "";
      try {
        const date = new Date(value);
        if (attribute.type === "date") {
          return date.toLocaleDateString();
        } else if (attribute.type === "time") {
          return date.toLocaleTimeString();
        } else {
          return date.toLocaleString();
        }
      } catch (e) {
        return value;
      }
    }

    // Handle number fields
    if (attribute.type === "number") {
      return isNaN(value) ? value : Number(value).toLocaleString();
    }

    // Handle text fields (truncate if too long)
    if (attribute.type === "text" || attribute.type === "description") {
      const textValue = Array.isArray(value) ? value.join(", ") : value.toString();
      return textValue.length > 50 ? textValue.substring(0, 50) + "..." : textValue;
    }

    // Handle non-select fields
    if (attribute.type !== "select" && attribute.type !== "multiSelect") {
      // Handle objects (should rarely happen, but safety check)
      if (typeof value === "object" && value !== null) {
        return Array.isArray(value) ? value.join(", ") : JSON.stringify(value);
      }

      return Array.isArray(value) ? value.join(", ") : value.toString();
    }

    // Handle select and multi-select fields
    let options = selectData?.[attribute.name];

    // For conditional fields, get the appropriate options based on parent value
    if (attribute.updateOn && rowData) {
      const parentValue = rowData[attribute.updateOn];
      if (parentValue) {
        // First, get the display value of the parent if it's also a select field
        const parentField = formState.find((f) => f.name === attribute.updateOn);
        let parentDisplayValue = parentValue;

        if (parentField && (parentField.type === "select" || parentField.type === "multiSelect")) {
          const parentOptions = selectData?.[attribute.updateOn];
          if (parentOptions && Array.isArray(parentOptions)) {
            const parentDisplayField = parentField.displayValue || (parentField.showItem === "locale" ? selectedLanguage : "value");
            const foundParentOption = parentOptions.find((opt) => (opt.id || opt._id) === parentValue);
            if (foundParentOption) {
              parentDisplayValue = foundParentOption[parentDisplayField] || foundParentOption.value || foundParentOption.name || foundParentOption.label;
            }
          }
        }

        // Get conditional options for this parent value
        const conditionalOptions = getConditionalDataForParent(attribute.name, attribute.updateOn, parentDisplayValue, conditionalSelectData);
        if (conditionalOptions && conditionalOptions.length > 0) {
          options = conditionalOptions;
        }
      }
    }

    if (!options) {
      return Array.isArray(value) ? value.join(", ") : value;
    }

    const displayField = attribute.displayValue || (attribute.showItem === "locale" ? selectedLanguage : "value");

    if (attribute.type === "multiSelect") {
      if (!Array.isArray(value)) return value;

      // For all apiTypes, convert IDs to display values
      const displayValues = value.map((id) => {
        const option = options.find((opt) => (opt.id || opt._id) === id);
        return option ? option[displayField] || option.value || option.name || option.label || id : id;
      });
      return displayValues.join(", ");
    } else {
      // Single select field - for all apiTypes, look up by ID and display the value
      const option = options.find((opt) => (opt.id || opt._id) === value);
      return option ? option[displayField] || option.value || option.name || option.label || value : value;
    }
  };

  // Enhanced validation function to handle multi-select data validation
  const validateMultiSelectData = (attribute, itemValue, selectData) => {
    let validatedValues = [];
    let errorMessage = "";

    if (!itemValue || itemValue.toString().trim() === "") {
      return { value: [], error: "" };
    }

    // Split comma-separated values and trim whitespace
    const inputValues = itemValue
      .toString()
      .split(",")
      .map((val) => val.trim())
      .filter((val) => val);

    if (inputValues.length === 0) {
      return { value: [], error: "" };
    }

    // All apiTypes (API, JSON, CSV) now have same structure after processing
    if (selectData[attribute.name] && Array.isArray(selectData[attribute.name])) {
      const name = attribute.displayValue || (attribute.showItem === "locale" ? selectedLanguage : "value");

      inputValues.forEach((inputValue) => {
        const foundItem = selectData[attribute.name].find((option) => {
          const displayValue = option[name] || option.value || option.name || option.label;
          return displayValue && displayValue.toString().toLowerCase() === inputValue.toLowerCase();
        });

        if (foundItem) {
          // Save the actual ID from the selectApi data, not the user input
          validatedValues.push(foundItem.id || foundItem._id);
        } else {
          errorMessage = `Invalid ${attribute.label}: "${inputValue}" not found in available options`;
          return;
        }
      });
    } else {
      errorMessage = `Options data not available for ${attribute.label}`;
      validatedValues = [];
    }

    return { value: validatedValues, error: errorMessage };
  };

  // Enhanced validation function to handle select box data validation
  const validateSelectBoxData = (attribute, itemValue, selectData) => {
    let validatedValue = itemValue;
    let errorMessage = "";

    if (!itemValue || itemValue.toString().trim() === "") {
      return { value: attribute.default ?? "", error: "" };
    }

    // All apiTypes (API, JSON, CSV) now have same structure after processing
    if (selectData[attribute.name] && Array.isArray(selectData[attribute.name])) {
      const name = attribute.displayValue || (attribute.showItem === "locale" ? selectedLanguage : "value");
      const foundItem = selectData[attribute.name].find((option) => {
        const displayValue = option[name] || option.value || option.name || option.label;
        return displayValue && displayValue.toString().toLowerCase() === itemValue.toString().toLowerCase();
      });

      if (foundItem) {
        // Save the actual ID from the selectApi data, not the user input
        validatedValue = foundItem.id || foundItem._id;
      } else {
        errorMessage = `Invalid ${attribute.label}: "${itemValue}" not found in available options`;
        validatedValue = "";
      }
    } else {
      errorMessage = `Options data not available for ${attribute.label}`;
      validatedValue = "";
    }

    return { value: validatedValue, error: errorMessage };
  };

  // Enhanced data processing function - fetch data for all select boxes and multi-select boxes with selectApi
  const processSelectBoxData = async (formState, selectedLanguage) => {
    const selectData = {};
    const apiCache = {}; // Cache to prevent duplicate API calls for same endpoint

    // Process all select boxes and multi-select boxes that have selectApi, but skip conditional fields
    for (const attribute of formState.filter((item) => (item.type === "select" || item.type === "multiSelect") && item.add && item.selectApi)) {
      // Skip conditional fields (those with updateOn property) during initial loading
      if (attribute.updateOn) {
        console.log(`Skipping conditional field: ${attribute.name}, depends on: ${attribute.updateOn}`);
        continue;
      }

      if (attribute.selectApi && !selectData[attribute.name]) {
        try {
          let processedData = [];

          // Process data based on apiType - following the pattern from MultiSelect and Select components
          if (attribute.apiType === "API") {
            // Check cache first to avoid duplicate API calls
            const cacheKey = attribute.selectApi;
            if (apiCache[cacheKey]) {
              processedData = apiCache[cacheKey];
              console.log(`Using cached data for API: ${cacheKey}`);
            } else {
              // Make API call and cache the result
              console.log(`Making API call to: ${cacheKey}`);
              const response = await getData({}, `${attribute.selectApi}`);
              if (response.status === 200) {
                processedData = response.data;
                apiCache[cacheKey] = processedData; // Cache for reuse
                dispatch(addSelectObject(processedData, attribute.selectApi)); // Only dispatch once per API
              } else {
                console.error(`API call failed for ${attribute.selectApi}:`, response.customMessage);
                processedData = [];
                apiCache[cacheKey] = []; // Cache empty array to prevent retries
              }
            }
          } else if (attribute.apiType === "CSV") {
            // Parse CSV string directly from selectApi property
            processedData = attribute.selectApi.split(",").map((itemValue) => ({
              id: itemValue.trim(),
              value: itemValue.trim().charAt(0).toUpperCase() + itemValue.trim().slice(1),
            }));
          } else if (attribute.apiType === "JSON") {
            // Use selectApi as JSON array directly
            processedData = attribute.selectApi;
          } else {
            // Default to API type if no apiType specified - use cache here too
            const cacheKey = attribute.selectApi;
            if (apiCache[cacheKey]) {
              processedData = apiCache[cacheKey];
              console.log(`Using cached data for default API: ${cacheKey}`);
            } else {
              console.log(`Making default API call to: ${cacheKey}`);
              const response = await getData({}, `${attribute.selectApi}`);
              if (response.status === 200) {
                processedData = response.data;
                apiCache[cacheKey] = processedData; // Cache for reuse
                dispatch(addSelectObject(processedData, attribute.selectApi)); // Only dispatch once per API
              } else {
                console.error(`API call failed for ${attribute.selectApi}:`, response.customMessage);
                processedData = [];
                apiCache[cacheKey] = []; // Cache empty array to prevent retries
              }
            }
          }

          // Store processed data using attribute.name as key
          selectData[attribute.name] = processedData;
        } catch (error) {
          console.error(`Error processing data for ${attribute.name}:`, error);
          selectData[attribute.name] = [];
        }
      }
    }

    console.log(`Total unique API calls made: ${Object.keys(apiCache).length}`);
    return selectData;
  };

  // Helper function to clean email formatting (remove mailto: prefix)
  const cleanEmailValue = (emailValue) => {
    if (!emailValue) return emailValue;

    let processedValue = emailValue;

    // Handle Excel hyperlink objects
    if (typeof emailValue === "object" && emailValue !== null) {
      if (emailValue.hyperlink) {
        processedValue = emailValue.hyperlink;
      } else if (emailValue.text) {
        processedValue = emailValue.text;
      } else {
        processedValue = emailValue.toString();
      }
    }

    // Convert to string if not already
    if (typeof processedValue !== "string") {
      processedValue = processedValue.toString();
    }

    // Remove mailto: prefix if present (case insensitive)
    const cleanedEmail = processedValue.replace(/^mailto:\s*/i, "").trim();

    console.log(`Email cleaning: "${emailValue}" -> "${cleanedEmail}"`);
    return cleanedEmail;
  };

  // Helper function to parse Excel date values
  const parseExcelDate = (dateValue, fieldType) => {
    if (!dateValue) return "";

    console.log(`Parsing ${fieldType} value:`, dateValue, typeof dateValue);

    let parsedDate;

    try {
      // Handle Excel serial date numbers
      if (typeof dateValue === "number") {
        // Excel serial date: days since January 1, 1900 (with leap year bug)
        const excelEpoch = new Date(1900, 0, 1);
        const daysOffset = dateValue - 1; // Excel counts from 1, not 0
        parsedDate = new Date(excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000);

        // Adjust for Excel's leap year bug (1900 was not a leap year)
        if (dateValue > 59) {
          parsedDate = new Date(parsedDate.getTime() - 24 * 60 * 60 * 1000);
        }
      }
      // Handle Excel Date objects
      else if (dateValue instanceof Date) {
        parsedDate = new Date(dateValue);
      }
      // Handle string dates
      else if (typeof dateValue === "string") {
        // Try to parse various date formats
        const dateStr = dateValue.trim();

        // Handle time-only formats like "14:30" or "14:30:45"
        if (fieldType === "time" && /^\d{1,2}:\d{2}(:\d{2})?$/.test(dateStr)) {
          const today = new Date();
          const [hours, minutes, seconds = 0] = dateStr.split(":").map(Number);
          parsedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, seconds);
        }
        // Handle various date formats
        else {
          parsedDate = new Date(dateStr);

          // If standard parsing fails, try moment parsing for more complex formats
          if (isNaN(parsedDate.getTime())) {
            const momentDate = moment(
              dateStr,
              [
                "DD/MM/YYYY",
                "MM/DD/YYYY",
                "YYYY-MM-DD",
                "DD-MM-YYYY",
                "MM-DD-YYYY",
                "DD/MM/YYYY HH:mm",
                "MM/DD/YYYY HH:mm",
                "YYYY-MM-DD HH:mm",
                "DD/MM/YYYY HH:mm:ss",
                "MM/DD/YYYY HH:mm:ss",
                "YYYY-MM-DD HH:mm:ss",
                "HH:mm",
                "HH:mm:ss",
              ],
              true
            );

            if (momentDate.isValid()) {
              parsedDate = momentDate.toDate();
            }
          }
        }
      }

      // Validate the parsed date
      if (!parsedDate || isNaN(parsedDate.getTime())) {
        console.error(`Failed to parse date: ${dateValue}`);
        return "";
      }

      // Format according to field type
      let formattedValue;
      switch (fieldType) {
        case "date":
          // Set to noon to avoid timezone issues
          formattedValue = moment(parsedDate).set({ hour: 12, minute: 0, second: 0, millisecond: 0 }).toISOString();
          break;
        case "time":
          // Keep only time, set to today's date
          const timeOnly = moment(parsedDate);
          formattedValue = timeOnly.format("HH:mm");
          break;
        case "datetime":
          formattedValue = moment(parsedDate).toISOString();
          break;
        default:
          formattedValue = moment(parsedDate).toISOString();
      }

      console.log(`Date parsing result: ${dateValue} (${fieldType}) -> ${formattedValue}`);
      return formattedValue;
    } catch (error) {
      console.error("Error parsing date:", error, "Original value:", dateValue);
      return "";
    }
  };

  // Helper function to extract unique parent values from Excel data
  const extractUniqueParentValues = (jsonData, formState) => {
    const parentValues = {};

    // Find all conditional fields and their parent fields
    const conditionalFields = formState.filter((field) => field.updateOn);

    conditionalFields.forEach((field) => {
      const parentField = field.updateOn;

      // Get the label for the parent field to match Excel headers
      const parentFieldConfig = formState.find((f) => f.name === parentField);
      const parentLabel = parentFieldConfig ? parentFieldConfig.label : parentField;

      const uniqueValues = [...new Set(jsonData.map((row) => row[parentLabel]).filter((val) => val !== null && val !== undefined && val !== ""))];

      if (uniqueValues.length > 0) {
        if (!parentValues[parentField]) {
          parentValues[parentField] = [];
        }
        parentValues[parentField] = [...new Set([...parentValues[parentField], ...uniqueValues])];
      }
    });

    console.log("Extracted unique parent values:", parentValues);
    return parentValues;
  };

  // Helper function to load conditional data only for required parent values
  const loadRequiredConditionalData = async (uniqueParentValues, formState, basicSelectData) => {
    const conditionalData = {};

    const conditionalFields = formState.filter((f) => f.updateOn);

    for (const field of conditionalFields) {
      const parentField = field.updateOn;
      const parentValues = uniqueParentValues[parentField] || [];

      console.log(`Loading conditional data for ${field.name}, parent values:`, parentValues);
      conditionalData[field.name] = {};

      // Load data only for parent values that exist in Excel
      for (const parentValue of parentValues) {
        try {
          // First, we need to convert display value to ID if the parent is also a select field
          let parentId = parentValue;
          const parentFieldConfig = formState.find((f) => f.name === parentField);

          if (parentFieldConfig && (parentFieldConfig.type === "select" || parentFieldConfig.type === "multiSelect")) {
            // Find the ID for this display value from basic select data
            const parentOptions = basicSelectData[parentField];
            if (parentOptions && Array.isArray(parentOptions)) {
              const parentDisplayField = parentFieldConfig.displayValue || (parentFieldConfig.showItem === "locale" ? selectedLanguage : "value");
              const foundParent = parentOptions.find((opt) => {
                const displayValue = opt[parentDisplayField] || opt.value || opt.name || opt.label;
                return displayValue && displayValue.toString().toLowerCase() === parentValue.toString().toLowerCase();
              });

              if (foundParent) {
                parentId = foundParent.id || foundParent._id;
              }
            }
          }

          console.log(`Making API call for ${field.name} with ${parentField}=${parentId}`);
          const response = await getData({ [parentField]: parentId }, field.selectApi);
          conditionalData[field.name][parentValue] = response.status === 200 ? response.data : [];

          // Cache this result
          const cacheKey = `${field.selectApi}_${parentId}`;
          conditionalCacheRef.current[cacheKey] = conditionalData[field.name][parentValue];
        } catch (error) {
          console.error(`Error loading conditional data for ${field.name}:`, error);
          conditionalData[field.name][parentValue] = [];
        }
      }
    }

    console.log("Loaded conditional data:", conditionalData);
    return conditionalData;
  };

  // Helper function to get conditional data for a specific parent value
  const getConditionalDataForParent = (fieldName, parentFieldName, parentValue, conditionalSelectData) => {
    const fieldData = conditionalSelectData[fieldName];
    if (!fieldData) return [];

    // Try to find data for this parent value (case-insensitive)
    const exactMatch = fieldData[parentValue];
    if (exactMatch) return exactMatch;

    // Try case-insensitive match
    const parentValueLower = parentValue.toString().toLowerCase();
    const matchingKey = Object.keys(fieldData).find((key) => key.toString().toLowerCase() === parentValueLower);

    return matchingKey ? fieldData[matchingKey] : [];
  };

  /**
   * Replace field name placeholders in error messages with their actual labels
   * @param {string} errorMessage - The error message with {fieldName} placeholders
   * @param {array} formState - The form state containing field definitions
   * @returns {string} - The error message with replaced labels
   */
  const replaceFieldLabelsInError = (errorMessage, formState) => {
    if (!errorMessage || !formState) return errorMessage;

    // Find all {fieldName} patterns in the error message
    const fieldPlaceholderRegex = /\{([^}]+)\}/g;

    return errorMessage.replace(fieldPlaceholderRegex, (match, fieldName) => {
      // Find the field in formState
      const field = formState.find((f) => f.name === fieldName);

      // Return the field label if found, otherwise return the original placeholder
      return field ? `"${field.label}"` : match;
    });
  };

  return (
    <Overlay key={props.referenceId} className={`form-container ${props.css ?? ""}`}>
      <Page className={`${props.css ?? ""} ${props.formMode ?? "single"} ${props.bulkUpload ? "bulk" : ""}`}>
        <Header className={`${props.css ?? ""} form bulk`}>
          <div>
            <span dangerouslySetInnerHTML={{ __html: props.header ? props.header : "Login" }}></span>
          </div>
          {(props.css ?? "") === "" && (
            <CloseButton theme={themeColors} onClick={closeModal}>
              <GetIcon icon={"Close"} />
            </CloseButton>
          )}
        </Header>
        <Form className="list bulk" action="#">
          {selectData === null && formState.some((item) => (item.type === "select" || item.type === "multiSelect") && item.add && item.selectApi) ? (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                color: "#666",
                fontStyle: "italic",
              }}
            >
              Loading API select box data...
            </div>
          ) : null}

          {jsonData?.length > 0 && (
            <ButtonPanel>
              <AddButton onClick={() => bulkUplaodFormat()}>
                <DwonlaodIcon></DwonlaodIcon>
                <span>Download Template</span>
              </AddButton>
              <FileButton
                type="file"
                accept=".xlsx, .xls"
                onChange={uploadData}
                disabled={selectData === null && formState.some((item) => (item.type === "select" || item.type === "multiSelect") && item.add && item.selectApi)}
              ></FileButton>{" "}
            </ButtonPanel>
          )}

          {uploadResult && (
            <div
              style={{
                margin: "20px 0",
                padding: "16px",
                borderRadius: "8px",
                border: `1px solid ${uploadResult.type === "success" ? "#28a745" : uploadResult.type === "warning" ? "#ffc107" : "#dc3545"}`,
                backgroundColor: uploadResult.type === "success" ? "#d4edda" : uploadResult.type === "warning" ? "#fff3cd" : "#f8d7da",
                color: uploadResult.type === "success" ? "#155724" : uploadResult.type === "warning" ? "#856404" : "#721c24",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "18px", marginRight: "8px" }}>{uploadResult.type === "success" ? "✅" : uploadResult.type === "warning" ? "⚠️" : "❌"}</span>
                <strong style={{ fontSize: "16px" }}>Bulk Upload {uploadResult.type === "success" ? "Completed" : uploadResult.type === "warning" ? "Completed with Issues" : "Failed"}</strong>
              </div>

              {uploadResult.summary && (
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "8px", fontSize: "14px" }}>
                    <div>
                      <strong>Total:</strong> {uploadResult.summary.totalProcessed}
                    </div>
                    <div style={{ color: "#28a745" }}>
                      <strong>✅ Successful:</strong> {uploadResult.summary.successful}
                    </div>
                    <div style={{ color: "#ffc107" }}>
                      <strong>📝 Existing:</strong> {uploadResult.summary.existing}
                    </div>
                    <div style={{ color: "#dc3545" }}>
                      <strong>❌ Failed:</strong> {uploadResult.summary.failed}
                    </div>
                  </div>
                </div>
              )}

              {uploadResult.message && <div style={{ fontSize: "14px", marginBottom: "8px" }}>{uploadResult.message}</div>}

              {uploadResult.failedRecords && uploadResult.failedRecords.length > 0 && (
                <div style={{ marginTop: "12px" }}>
                  <strong style={{ fontSize: "14px", marginBottom: "8px", display: "block" }}>Errors:</strong>
                  <div style={{ maxHeight: "200px", overflowY: "auto", backgroundColor: "rgba(255,255,255,0.3)", padding: "8px", borderRadius: "4px" }}>
                    {uploadResult.failedRecords.map((record, index) => (
                      <div
                        key={index}
                        style={{ fontSize: "13px", marginBottom: "6px", paddingBottom: "6px", borderBottom: index < uploadResult.failedRecords.length - 1 ? "1px solid rgba(0,0,0,0.1)" : "none" }}
                      >
                        <strong>Row {index + 1}:</strong> {replaceFieldLabelsInError(record.customMessage || record.error, formState)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: "12px", textAlign: "right" }}>
                <button
                  onClick={() => setUploadResult(null)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "transparent",
                    border: `1px solid ${uploadResult.type === "success" ? "#28a745" : uploadResult.type === "warning" ? "#ffc107" : "#dc3545"}`,
                    color: uploadResult.type === "success" ? "#155724" : uploadResult.type === "warning" ? "#856404" : "#721c24",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <RowContainer className=" bulk">
            {jsonData?.length > 0 ? (
              <TableView className="small">
                <thead>
                  <tr>
                    <ThView>Status</ThView>
                    <ThView>Action</ThView>
                    {formState &&
                      formState
                        .filter((attribute) => attribute.add && attribute.type !== "title" && attribute.type !== "description" && attribute.type !== "image" && attribute.type !== "file")
                        .map((attribute, index) => <ThView key={props.shortName + attribute.name + index}>{attribute.label}</ThView>)}
                  </tr>
                </thead>
                <tbody>
                  {jsonData?.map((data, rowIndex) => {
                    const getStatusStyle = (status) => {
                      switch (status) {
                        case "success":
                          return { backgroundColor: "#d4edda", color: "#155724", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" };
                        case "existing":
                          return { backgroundColor: "#fff3cd", color: "#856404", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" };
                        case "failed":
                          return { backgroundColor: "#f8d7da", color: "#721c24", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" };
                        default:
                          return { backgroundColor: "#e2e3e5", color: "#383d41", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" };
                      }
                    };

                    const getStatusText = (status) => {
                      switch (status) {
                        case "success":
                          return "✅ Success";
                        case "existing":
                          return "📝 Existing";
                        case "failed":
                          return "❌ Failed";
                        default:
                          return "⏳ Processing";
                      }
                    };

                    return (
                      <TrView key={`${props.shortName}-${rowIndex}-${rowIndex}`} className={"no-border bulk"}>
                        <TdView className="bulk">
                          <div style={getStatusStyle(data._bulkStatus)}>{getStatusText(data._bulkStatus)}</div>
                          {data._bulkError && (
                            <div
                              style={{ fontSize: "11px", color: "#721c24", marginTop: "4px", maxWidth: "150px", wordWrap: "break-word" }}
                              title={replaceFieldLabelsInError(data._bulkError, formState)}
                            >
                              {replaceFieldLabelsInError(data._bulkError, formState).length > 50
                                ? replaceFieldLabelsInError(data._bulkError, formState).substring(0, 50) + "..."
                                : replaceFieldLabelsInError(data._bulkError, formState)}
                            </div>
                          )}
                        </TdView>
                        <TdView className="bulk">
                          {editingRowIndex === rowIndex ? (
                            <div style={{ display: "flex", gap: "4px" }}>
                              <IconButton icon="save" ClickEvent={() => handleSaveEdit(rowIndex)}></IconButton>
                              <IconButton icon="close" ClickEvent={handleCancelEdit}></IconButton>
                            </div>
                          ) : (
                            <IconButton icon="edit" ClickEvent={() => handleEditRow(rowIndex, data)}></IconButton>
                          )}
                        </TdView>
                        {formState &&
                          formState
                            .filter(
                              (attribute) =>
                                attribute.add &&
                                attribute.type !== "hidden" &&
                                attribute.type !== "title" &&
                                attribute.type !== "description" &&
                                attribute.type !== "image" &&
                                attribute.type !== "file"
                            )
                            .map((attribute, index) => {
                              const itemValue = data[attribute.name];
                              const displayValue = getDisplayValue(attribute, itemValue, selectData, data);
                              const fullValue = Array.isArray(itemValue) ? itemValue.join(", ") : itemValue?.toString() || "";
                              const isTextTruncated = (attribute.type === "text" || attribute.type === "description") && fullValue.length > 50;

                              return (
                                <TdView
                                  className="bulk"
                                  key={index}
                                  title={isTextTruncated ? fullValue : displayValue}
                                  style={{ cursor: isTextTruncated ? "help" : "default", width: editingRowIndex === rowIndex ? "auto" : "auto" }}
                                >
                                  {editingRowIndex === rowIndex ? (
                                    <div style={{ width: "max-content", minWidth: "fit-content" }}>
                                      <FormInput
                                        type={attribute.type}
                                        name={attribute.name}
                                        value={editingRowData[attribute.name] || ""}
                                        onChange={(e, id, type, sub, country) => handleEditFieldChange(attribute.name, e, type, sub, country)}
                                        placeholder={attribute.label}
                                        selectApi={
                                          attribute.updateOn
                                            ? (() => {
                                                // For conditional fields, provide the appropriate options based on parent value
                                                const parentValue = editingRowData[attribute.updateOn];
                                                if (parentValue) {
                                                  const parentField = formState.find((f) => f.name === attribute.updateOn);
                                                  let parentDisplayValue = parentValue;

                                                  if (parentField && (parentField.type === "select" || parentField.type === "multiSelect")) {
                                                    const parentOptions = selectData?.[attribute.updateOn];
                                                    if (parentOptions && Array.isArray(parentOptions)) {
                                                      const parentDisplayField = parentField.displayValue || (parentField.showItem === "locale" ? selectedLanguage : "value");
                                                      const foundParentOption = parentOptions.find((opt) => (opt.id || opt._id) === parentValue);
                                                      if (foundParentOption) {
                                                        parentDisplayValue = foundParentOption[parentDisplayField] || foundParentOption.value || foundParentOption.name || foundParentOption.label;
                                                      }
                                                    }
                                                  }

                                                  const conditionalOptions = getConditionalDataForParent(attribute.name, attribute.updateOn, parentDisplayValue, conditionalSelectData);
                                                  return conditionalOptions || [];
                                                }
                                                return [];
                                              })()
                                            : attribute.selectApi
                                        }
                                        apiType={attribute.updateOn ? "JSON" : attribute.apiType}
                                        countries={attribute.countries ?? []}
                                        showItem={attribute.showItem}
                                        displayValue={attribute.displayValue}
                                        style={{ fontSize: "12px", padding: "4px", border: "1px solid #ccc", width: "100%" }}
                                      />
                                    </div>
                                  ) : (
                                    displayValue
                                  )}
                                  {formBulkErrors[rowIndex]?.[attribute.name] && <p style={{ color: "red", fontSize: "12px", margin: "2px 0" }}>{formBulkErrors[rowIndex][attribute.name]}</p>}
                                </TdView>
                              );
                            })}
                      </TrView>
                    );
                  })}
                </tbody>
              </TableView>
            ) : (
              <NoBulkDataSelected upload={uploadData} download={bulkUplaodFormat} icon={props.icon} shortName={props.shortName}></NoBulkDataSelected>
            )}
            {errorCount > 0 && <ErrorMessage style={{ marginTop: "10px" }}>Error count: {errorCount}</ErrorMessage>}
          </RowContainer>
        </Form>

        <Footer className={`${props.css ?? ""} ${submitDisabled ? "disabled" : ""} bulk`}>
          {(props.css ?? "") === "" && <FormInput type="close" value={"Cancel"} onChange={closeModal} />}
          <FormInput disabled={submitDisabled} type="submit" name="submit" value={props.button ? props.button : "Uplaod Data"} onChange={bulkUploadHandler} />
        </Footer>
        {loaderBox && <Loader className="absolute"></Loader>}
      </Page>
    </Overlay>
  );
});

export default BulkUplaodForm;
