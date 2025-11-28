import React, { useState } from "react";
import styled from "styled-components";
import { FaMicrophone } from "react-icons/fa";

const MainContainer = styled.div`
  padding: 20px;
  background-color: #f6f8fa;
  min-height: 100vh;
`;

const ContentContainer = styled.div`
  padding: 20px;
  background-color: #ffffff;
  border-radius: 10px;
  border: 1px solid #d3d3d3;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
`;

const VoiceIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: #375dfb;
  border-radius: 50%;

  svg {
    color: #ffffff;
    font-size: 24px;
  }
`;

const DebugFormBuilder = () => {
  console.log("DebugFormBuilder rendering...");

  const [formFields, setFormFields] = useState([]);

  return (
    <MainContainer>
      <h1>Debug Form Builder</h1>
      <ContentContainer>
        <Header>
          <div>
            <h2>Feedback Form</h2>
            <p>This is a sample description</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <VoiceIconWrapper>
              <FaMicrophone size={20} />
            </VoiceIconWrapper>
            <span>Type using AI</span>
          </div>
        </Header>

        <div>
          <p>Form fields: {formFields.length}</p>
          <button
            style={{
              padding: "10px 20px",
              backgroundColor: "#375dfb",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={() => setFormFields([...formFields, { id: Date.now(), label: "Test Field" }])}
          >
            + Add Test Field
          </button>
        </div>

        {formFields.map((field, index) => (
          <div
            key={field.id}
            style={{
              padding: "10px",
              margin: "10px 0",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          >
            Field {index + 1}: {field.label}
          </div>
        ))}
      </ContentContainer>
    </MainContainer>
  );
};

export default DebugFormBuilder;
