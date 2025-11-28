import styled from "styled-components";

export const ContentBox = styled.div`
  height: 40%;
  width: 100%;
  display: flex;
  align-items: center;
  position: relative;
  justify-content: center;
`;

export const Frame = styled.img`
  width: 100vw;
  height: 100%;
  display: block;
  object-fit: cover;
  overflow-clip-margin: content-box;
  overflow: clip;
  border-radius: 20px;
  margin: 10px;
`;

export const FieldBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: start;
  width: 75vw;
`;

export const Title = styled.div`
  font-size: 14px;
  font-family: "Inter", sans-serif;
  color: #808c96;
`;

export const Input = styled.input`
  width: calc(95% - 20px);
  height: 20px;
  padding: 10px;
  border-radius: 12px;
  border: none;
  background-color: #ffffff;
  font-size: 14px;
  margin: 0 2%;
  color: #b3bfc9;

  ::placeholder {
    color: #b3bfc9;
  }

  &:focus,
  &:active {
    outline: none;
    box-shadow: none;
  }
`;

export const InputContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px 15px;
  align-items: start;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0px 4px 30px 0px rgba(0, 0, 0, 0.12);
  border-left: ${({ isActive }) => (isActive ? "4px solid #007bff" : "none")};
`;

export const IconButton = styled.button`
  background-color: ${({ active }) => (active ? "#CED9E2" : "transparent")};
  color: ${({ active }) => (active ? "black" : "#808C96")};
  border: none;
  cursor: pointer;
  margin: 5px 0px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  width: 24px;
`;

export const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 2%;
  width: 95%;
`;

export const TabOne = styled.div`
  display: flex;
  align-items: center;
`;

export const TabTwo = styled.div`
  display: flex;
  align-items: center;
`;

export const ToggleDown = styled.div`
  position: relative;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  color: #67737d;
  font-size: 14px;
`;

export const ToggleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  border: none;
  cursor: pointer;
  background-color: "#F2F2F2";
  border: none;
  border-radius: 10px;
  color: #808c96;
  padding: 5px 10px;
  outline: none;
`;

export const DropdownList = styled.div`
  padding: 10px;
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  background-color: white;
  width: auto;
  border: none;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
`;

export const DropdownItem = styled.div`
  border: none;
  cursor: pointer;
  margin: 5px 0px;
  border-radius: 9px;
  display: flex;
  flex-direction: column;
  font-size: 8px;
  width: 50px;
  text-align: center;
  align-items: center;
`;

export const DropDownIconButton = styled.button`
  border: none;
  cursor: pointer;
  margin: 5px 0px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  width: 30px;
  background-color: #f2f2f2;
  color: #67737d;
`;

export const Row = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-evenly;
  /* gap: 5px; */
`;
