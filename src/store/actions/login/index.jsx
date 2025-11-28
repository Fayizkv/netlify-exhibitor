// its middlewear to handle reducer call to update a state

import { postData } from "../../../backend/api";
import CustomRoutes from "../../../components/project/router/custom";

// Default menu items to show after login
const getDefaultMenus = () => [
  {
    _id: "default-dashboard",
    label: "Dashboard",
    sequence: 1,
    icon: "dashboard",
    status: true,
    isLink: false,
    path: "/dashboard",
    element: "dashboard",
    submenus: [],
    privilege: {
      status: true,
      add: false,
      update: false,
      delete: false,
      export: false,
    },
  },
  {
    _id: "default-company-profile",
    label: "Company Profile",
    sequence: 2,
    icon: "globe",
    status: true,
    isLink: false,
    path: "/company-profile",
    element: "company-profile",
    submenus: [],
    privilege: {
      status: true,
      add: false,
      update: false,
      delete: false,
      export: false,
    },
  },
  {
    _id: "default-team-management",
    label: "Team Management",
    sequence: 3,
    icon: "users",
    status: true,
    isLink: false,
    path: "/team-management",
    element: "team-management",
    submenus: [],
    privilege: {
      status: true,
      add: false,
      update: false,
      delete: false,
      export: false,
    },
  },
  {
    _id: "default-tickets-passes",
    label: "Tickets & Passes",
    sequence: 4,
    icon: "ticket",
    status: true,
    isLink: false,
    path: "/tickets-passes",
    element: "tickets-passes",
    submenus: [],
    privilege: {
      status: true,
      add: true,
      update: true,
      delete: true,
      export: false,
    },
  },
  {
    _id: "default-lead-management",
    label: "Lead Management",
    sequence: 5,
    icon: "star",
    status: true,
    isLink: false,
    path: "/lead-management",
    element: "lead-management",
    submenus: [],
    privilege: {
      status: true,
      add: false,
      update: false,
      delete: false,
      export: false,
    },
  },
  {
    _id: "default-product-catalog",
    label: "Product Catalogue",
    sequence: 6,
    icon: "package",
    status: true,
    isLink: false,
    path: "/product-catalog",
    element: "product-catalog",
    submenus: [],
    privilege: {
      status: true,
      add: false,
      update: false,
      delete: false,
      export: false,
    },
  },
  {
    _id: "default-resources",
    label: "Resources",
    sequence: 7,
    icon: "file",
    status: true,
    isLink: false,
    path: "/resources",
    element: "resources",
    submenus: [],
    privilege: {
      status: true,
      add: false,
      update: false,
      delete: false,
      export: false,
    },
  },
    {
    _id: "default-faq",
    label: "FAQ",
    sequence: 8,
    icon: "download",
    status: true,
    isLink: false,
    path: "/faq",
    element: "faq",
    submenus: [],
    privilege: {
      status: true,
      add: false,
      update: false,
      delete: false,
      export: false,
    },
  },
  // {
  //   _id: "default-faq",
  //   label: "FAQ",
  //   sequence: 8,
  //   icon: "help-circle",
  //   status: true,
  //   isLink: false,
  //   path: "/faq",
  //   element: "faq",
  //   submenus: [],
  //   privilege: {
  //     status: true,
  //     add: false,
  //     update: false,
  //     delete: false,
  //     export: false,
  //   },
  // },
];

const fetchLogin = (data, predata = null) => {
  return async (dispatch) => {
    try {
      // Dispatch loading state
      dispatch({ type: "FETCH_USER_LOGIN_LOADING" });

      // Determine the response to use
      const response = predata ? predata : await postData(data, "auth/login");

      // Check if the response is successful
      if (response.status === 200) {
        if (response.data.success) {
          // Use default menus instead of backend menus
          const defaultMenus = getDefaultMenus();
          
          // Find the current menu item for the dashboard or the first item without a submenu
          let currentMenu = defaultMenus.find((item) => item.path === "/dashboard") || defaultMenus.find((item) => !item.submenus || item.submenus.length === 0);

          // Prepare the data to dispatch
          const payloadData = {
            ...response.data,
            menu: [...defaultMenus, ...CustomRoutes()],
          };

          // Dispatch actions to update the state
          dispatch({ type: "MENU_STATUS", payload: false });
          dispatch({ type: "SELECTED_MENU", payload: currentMenu ?? { label: "dashboard", icon: "dashboard" } });
          dispatch({ type: "CURRENT_MENU", payload: currentMenu?.label ?? "dashboard" });
          dispatch({ type: "FETCH_USER_LOGIN_SUCCESS", payload: payloadData });
        } else {
          // Dispatch error if login is unsuccessful
          dispatch({
            type: "FETCH_USER_LOGIN_ERROR",
            payload: response.data.message || "Something went wrong!",
          });
        }
      } else {
        // Handle unexpected response status
        dispatch({
          type: "FETCH_USER_LOGIN_ERROR",
          payload: "Unexpected response status: validationFailed",
        });
      }
    } catch (error) {
      // Handle any errors that occur during the fetch
      dispatch({
        type: "FETCH_USER_LOGIN_ERROR",
        payload: error.message || "An error occurred while logging in.",
      });
    }
  };
};
const clearLogin = () => {
  return (dispatch) => {
    dispatch({
      type: "CLEAR_USER_LOGIN",
    });
  };
};
const clearLoginSession = () => {
  return (dispatch) => {
    dispatch({
      type: "CLEAR_USER_LOGIN_SESSION",
    });
  };
};
const udpateLogin = (data) => {
  return (dispatch) => {
    dispatch({
      type: "FETCH_USER_LOGIN_SUCCESS",
      payload: data,
    });
  };
};
export { fetchLogin, clearLogin, clearLoginSession, udpateLogin };
