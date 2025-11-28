import React, { useState, useCallback, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { findChangedValues } from "./functions";
import { getData, putData } from "../../../backend/api";
import { useSelector, useDispatch } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Popup from "./popup";
import Loader from "../loader";
import { SubpageSkeleton } from "../loader/shimmer";
import { useToast } from "../toast";
import { setEventTimezoneWithInfo, clearEventTimezone } from "../../../store/actions/timezone";
const ListItem = ({
  headerActions = [],
  icon,
  popupMode = "medium",
  showInfo = true,
  showInfoType = "open",
  profileImage,
  formMode = "single",
  parentReference = "_id",
  referenceId = 0,
  actions = [],
  api,
  setMessage,
  attributes = [],
  updatePrivilege = false,
  shortName = "Item",
  itemTitle = { type: "text", name: "title" },
  preFilter = {},
  popupMenu = "horizontal",
  parents = {},
  itemDescription = { type: "datetime", name: "createdAt" },
  itemPages = [],
  subPageAuthorization = false,
  formTabTheme = "normal",
  remoundKeyToCheck = ["coreModules", "title"],
}) => {
  const themeColors = useSelector((state) => state.themeColors);
  const selectedMenuItem = useSelector((state) => state.selectedMenu);
  const toast = useToast();
  const { slug } = useParams();
  const [currentApi] = useState(api);
  const queryClient = useQueryClient();
  const [formInput, setFormInput] = useState([]);
  const [updateValues, setUpdateValues] = useState({});
  const [updateId, setUpdateId] = useState("");
  const [openData, setOpenData] = useState({});
  const [errroInput, setErrorInput] = useState([]);
  const [udpateView, setUpdateView] = useState(() => {});
  const [showLoader, setShowLoader] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [shimmer, setShimmer] = useState(true);
  const [previousData, setPreviousData] = useState({});
  const [isDataChange, setIsDataChange] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const setLoaderBox = (status) => {
    setShowLoader(status);
  };

  // Helper function to compare arrays
  const arraysEqual = (arr1, arr2) => {
    if (!arr1 || !arr2) return false;
    if (arr1.length !== arr2.length) return false;
    return arr1.every((item, index) => item === arr2[index]);
  };

  // Helper function to compare dynamic fields
  const hasFieldsChanged = (previousData, currentData, fieldsToCheck) => {
    if (!fieldsToCheck || fieldsToCheck.length === 0) return false;

    return fieldsToCheck.some((field) => {
      const prevValue = previousData[field];
      const currentValue = currentData[field];

      // Handle array comparison
      if (Array.isArray(prevValue) && Array.isArray(currentValue)) {
        return !arraysEqual(prevValue, currentValue);
      }

      // Handle primitive comparison
      return prevValue !== currentValue;
    });
  };

  // React Query for data fetching
  const { data: queryData, isLoading } = useQuery({
    queryKey: ["list-item", currentApi, slug],
    queryFn: async () => {
      const response = await getData({ id: slug }, currentApi);
      if (response.status === 200) {
        try {
          const currentResponseData = response.data?.response || {};

          // Check if any of the specified fields have changed
          const hasChanged = hasFieldsChanged(previousData, currentResponseData, remoundKeyToCheck);

          // Update previous data and change flag
          setPreviousData(currentResponseData);
          setIsDataChange(hasChanged);
        } catch (error) {
          console.log("Error processing data comparison:", error);
        }
        return { data: response.data.response, actions: actions };
      }
      throw new Error("Failed to fetch data");
    },
    enabled: !!currentApi && !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Update openData when queryData changes
  useEffect(() => {
    if (queryData) {
      setOpenData(queryData);
    }
  }, [queryData]);

  // Update shimmer based on loading state
  useEffect(() => {
    setShimmer(isLoading);
  }, [isLoading]);

  // Reset data change flag after rerender
  useEffect(() => {
    if (isDataChange && openData?.data?._id) {
      console.log("Popup rerendered due to data change, resetting flag");
      const timer = setTimeout(() => {
        setIsDataChange(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isDataChange, openData?.data?._id]);

  const refreshView = useCallback(async () => {
    try {
      console.log("Invalidating query for:", ["list-item", currentApi, slug]);
      await queryClient.invalidateQueries({ queryKey: ["list-item", currentApi, slug] });
      console.log("Query invalidated successfully");
    } catch (error) {
      setShimmer(false);
      setLoaderBox(false);
      console.error("Error refreshing data:", error);
    }
  }, [currentApi, slug, queryClient]);

  // Set event timezone when item data loads
  useEffect(() => {
    if (openData?.data?.timezone) {
      // Set event timezone using the item's timezone data
      dispatch(setEventTimezoneWithInfo(openData.data.timezone, openData.data));
    }

    // Clear timezone when component unmounts or data changes
    return () => {
      if (openData?.data?.timezone) {
        dispatch(clearEventTimezone());
      }
    };
  }, [openData?.data?.timezone, dispatch]);

  useEffect(() => {
    const initialCheck = async () => {
      if (attributes.length > 0 && openData?.data?._id) {
        const value = openData?.data;
        const addValuesTemp = {
          updateValues: {},
          errorValues: {},
        };
        const promises = attributes.map(async (item) => {
          if (item.type === "checkbox" || item.type === "toggle") {
            let bool = JSON.parse(item.default === "false" || item.default === "true" ? item.default : "false");

            addValuesTemp.updateValues[item.name] = bool;
          } else if (item.type === "datetime" || item.type === "date" || item.type === "time") {
          } else if (item.type === "image" || item.type === "file") {
            if (item.update) {
              addValuesTemp.updateValues[item.name] = [];
            }
          } else if (item.type === "multiSelect") {
            if (item.update) {
              addValuesTemp.updateValues[item.name] = [];
            }
          } else {
            addValuesTemp.updateValues[item.name] = item.default;
          }
          addValuesTemp.errorValues[item.name] = "";

          let itemValue = item.collection?.length > 0 && item.showItem?.length > 0 ? value[item.collection]?.[item.showItem] : (value[item.name] ?? "");
          if (item.showSubItem) {
            itemValue = item.collection?.length > 0 && item.showItem?.length > 0 ? (value[item.collection][item.showItem][item.showSubItem] ?? "") : value[item.name];
          }
          if (item.update || item.view) {
            if (item.type === "checkbox" || item.type === "toggle") {
              let bool = value[item.name]?.toString() === "true" ? true : false;
              addValuesTemp.updateValues[item.name] = bool;
            } else if (item.type === "number") {
              addValuesTemp.updateValues[item.name] = addValuesTemp.updateValues[item.name] = parseFloat(value[item.name]);
            } else if (item.type === "titleswitch") {
              addValuesTemp.updateValues[item.name] = value[item.name];
            } else if (item.type === "select") {
              addValuesTemp.updateValues[item.name] =
                typeof itemValue === "undefined"
                  ? ""
                  : typeof itemValue === "string" || typeof itemValue === "number" || typeof itemValue === "boolean"
                    ? itemValue
                    : value[item.name]?._id
                      ? value[item.name]._id
                      : "";
            } else if (item.type === "multiSelect") {
              try {
                if (item.apiType === "API") {
                  addValuesTemp.updateValues[item.name] = value[item.name].map((obj) => obj._id);
                } else {
                  addValuesTemp.updateValues[item.name] = value[item.name].map((obj) => obj);
                }
              } catch (error) {
                addValuesTemp.updateValues[item.name] = [];
              }
            } else if (item.type === "image") {
              addValuesTemp.updateValues["old_" + item.name] = value[item.name] ? value[item.name] : "";
              addValuesTemp.updateValues[item.name] = [];
            } else {
              addValuesTemp.updateValues[item.name] = itemValue ? itemValue : "";
            }
          }
          addValuesTemp.updateValues["_id"] = value._id;
          addValuesTemp.updateValues["clone"] = false;
          addValuesTemp.updateValues["_title"] = value[itemTitle.name];
        });

        await Promise.all(promises);

        setFormInput(attributes);
        setErrorInput(addValuesTemp.errorValues);
        setUpdateValues(addValuesTemp.updateValues);
        setInitialized(true);
      }
    };
    initialCheck();
  }, [attributes, dispatch, setFormInput, setUpdateValues, parentReference, referenceId, openData?.data, initialized, itemTitle]);

  const updateHandler = async (data, formInput, oldData) => {
    // if (!updatePrivilege) {
    //   toast.error("You are not authorized to update this item!");
    //   setLoaderBox(false);
    //   return false;
    // }
    setLoaderBox(true);
    let status = false;

    const updatedItems = findChangedValues(oldData, data);
    const dataChanged = { ...updatedItems.changedObject, id: data._id };

    try {
      const response = await putData(dataChanged, `${currentApi}`);

      if (response.status === 200) {
        if (response?.data.customMessage?.length > 0) {
          toast.success(response?.data.customMessage);
        } else {
          toast.success(`The '${data._title ?? shortName}' ${data.clone ? "cloned" : "updated"} successfully!`);
        }
        status = true;
        setLoaderBox(true);
        console.log("Data updated successfully, refreshing view...");
        refreshView();
        setIsEditing(false);
      } else if (response.status === 404) {
        if (response?.data.customMessage?.length > 0) {
          toast.error(response?.data.customMessage);
        } else {
          toast.error("User not found!");
        }
      } else {
        if (response.customMessage?.length > 0) {
          toast.error(response.customMessage);
        } else {
          toast.error("Something went wrong!");
        }
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoaderBox(false);
    }

    return status; // Return the status at the end of the function
  };
  const isEditingHandler = (value, callback, titleValue, clone = false, view = false) => {
    setLoaderBox(true);
    if (!isEditing) {
      if (!clone) {
        setUpdateView(() => callback);
        let updateValuesTemp = {};
        setUpdateId(value._id);
        setEditingData(value, updateValuesTemp);
        updateValuesTemp["_id"] = value._id;
        updateValuesTemp["clone"] = clone;
        updateValuesTemp["_title"] = titleValue;
        setUpdateValues(updateValuesTemp);
        if (!view) {
          setIsEditing(true);
        }

        window.location.hash = "edit";
      } else {
        updateHandler({ id: value._id, _title: titleValue, clone: true });
      }
    } else {
      setUpdateId("");
      navigate({}, "", window.location.pathname);
      setIsEditing(false);
    }
    setLoaderBox(false);
  };
  const setEditingData = (value, updateValuesTemp) => {
    console.log("setEditingData", value);
    formInput.forEach((item) => {
      let itemValue = item.collection?.length > 0 && item.showItem?.length > 0 ? value[item.collection]?.[item.showItem] : (value[item.name] ?? "");
      if (item.showSubItem) {
        itemValue = item.collection?.length > 0 && item.showItem?.length > 0 ? (value[item.collection][item.showItem][item.showSubItem] ?? "") : value[item.name];
      }
      if (item.update || item.view) {
        if (item.type === "checkbox" || item.type === "toggle") {
          let bool = value[item.name]?.toString() === "true" ? true : false;
          updateValuesTemp[item.name] = bool;
        } else if (item.type === "titleswitch") {
          console.log("titleswitch", value[item.name]);
          updateValuesTemp[item.name] = value[item.name];
        } else if (item.type === "number") {
          updateValuesTemp[item.name] = updateValuesTemp[item.name] = parseFloat(value[item.name]);
        } else if (item.type === "select") {
          updateValuesTemp[item.name] =
            typeof itemValue === "undefined"
              ? ""
              : typeof itemValue === "string" || typeof itemValue === "number" || typeof itemValue === "boolean"
                ? itemValue
                : value[item.name]?._id
                  ? value[item.name]._id
                  : "";
        } else if (item.type === "multiSelect") {
          try {
            if (item.apiType === "API") {
              updateValuesTemp[item.name] = value[item.name].map((obj) => obj._id);
            } else {
              updateValuesTemp[item.name] = value[item.name].map((obj) => obj);
            }
          } catch (error) {
            updateValuesTemp[item.name] = [];
          }
        } else if (item.type === "image") {
          updateValuesTemp["old_" + item.name] = value[item.name] ? value[item.name] : "";
          updateValuesTemp[item.name] = [];
        } else {
          updateValuesTemp[item.name] = itemValue ? itemValue : "";
        }
      }
    });
    updateValuesTemp["_id"] = value._id;
    return updateValuesTemp;
  };

  const closeModal = () => {
    setIsEditing(false);
    // When closing a popup, navigate to the base path of the current entity
    const pathSegments = location.pathname.split("/");
    if (pathSegments.length > 2) {
      const basePath = `/${pathSegments[1]}`; // Navigates to /event, /users, etc.
      navigate(basePath, { replace: true });
    } else {
      // Fallback for safety, though the above should handle most cases
      navigate("..", { replace: true, relative: "path" });
    }
  };

  return (
    <div key={openData?.data?._id} className="bg-white fixed top-0 left-0 w-full h-full flex items-center z-[1001] justify-center">
      {shimmer ? (
        <SubpageSkeleton viewMode={"list"} displayColumn={1} tableColumnCount={attributes.filter((attribute) => attribute.view && (attribute.tag ?? false)).length} />
      ) : (
        <React.Fragment>
          {updateValues?._id && openData?.data?._id && isDataChange !== null && (
            <Popup
              key={`popup-${openData?.data?._id}-${isDataChange ? openData?.data?.updatedAt : "stable"}`}
              subPageAuthorization={subPageAuthorization}
              noAnimation={true}
              showInfoType={showInfoType}
              parentReference={parentReference}
              referenceId={referenceId}
              headerActions={headerActions}
              routingEnabled={true}
              editData={{
                parentReference: parentReference,
                referenceId: referenceId,
                formMode: formMode,
                api: api,
                formType: "put",
                updateId: updateId,
                header: `${shortName} details`,
                formInput: formInput,
                formErrors: errroInput,
                formValues: updateValues,
                submitHandler: updateHandler,
                isOpenHandler: isEditingHandler,
                isOpen: isEditing,
                profileImage: profileImage,
                parentName: shortName,
                parentIcon: icon,
                setMessage: setMessage,
                setLoaderBox: setLoaderBox,
              }}
              popupMode={popupMode}
              showInfo={showInfo}
              popupMenu={popupMenu}
              parents={{ ...parents, [parentReference]: openData?.data?._id }}
              selectedMenuItem={selectedMenuItem}
              formMode={formMode}
              closeModal={closeModal}
              themeColors={themeColors}
              isEditingHandler={isEditingHandler}
              updateValue={udpateView}
              setMessage={setMessage}
              setLoaderBox={setLoaderBox}
              itemTitle={itemTitle}
              itemDescription={itemDescription}
              parentName={shortName}
              openData={openData}
              updatePrivilege={updatePrivilege}
              profileImage={profileImage}
              itemPages={itemPages}
              formTabTheme={formTabTheme}
            ></Popup>
          )}
        </React.Fragment>
      )}
      {showLoader && <Loader list={"absolute1"}></Loader>}
    </div>
  );
};

export default ListItem;
