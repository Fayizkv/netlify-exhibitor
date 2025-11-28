import React from "react";

const SimpleFormBuilder = () => {
  return (
    <div style={{ padding: "20px", backgroundColor: "#f6f8fa", minHeight: "100vh" }}>
      <h1>Form Builder</h1>
      <p>This is a simple test to verify the component loads correctly.</p>
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          marginTop: "20px",
        }}
      >
        <h2>Feedback Form</h2>
        <p>This is a sample description</p>
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#375dfb",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          + Insert Fields
        </button>
      </div>
    </div>
  );
};

export default SimpleFormBuilder;
