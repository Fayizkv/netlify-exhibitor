import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastProvider, useToast } from "./ToastContext";

const Toast = () => {
  return (
    <ToastContainer
      position="bottom-center"
      autoClose={6000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      style={{
        zIndex: 1001,
      }}
      toastStyle={{
        backgroundColor: "white",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        color: "#374151",
        fontSize: "14px",
        minHeight: "48px",
      }}
    />
  );
};

export { ToastProvider, useToast };
export default Toast;
