import React, { useState } from "react";
// import Draggable from "react-draggable";

import { ButtonMenu, Main, NewDiv, RowWise, StyledCustomForm, TextBoxContainer, RowWiseSingle, HorizontalLine, CheckBoxes, ButtonDiv, IconContainer } from "./styles";
// import Popup from "./popup";
import { GetIcon } from "../../../../icons";
import { TextBox, Checkbox } from "../../../core/elements";
import { GetCustomIcon } from "../../icons";

const CustomForm = () => {
  const [divs, setDivs] = useState([]);

  // Function to handle the addition of a new div
  const handleAddDiv = (icon) => {
    // Create a new form data object for the new div
    const newFormData = {
      name: "",
      placeholder: "",
      label: "",
      orderId: "",
      validation: "",
      showItem: "",
      textDataError: "",
      defaultValue: "",
      tag: false,
      required: false,
      view: false,
      add: false,
      update: false,
      filter: false,
      icon: icon,
    };

    // Add the new form data object to the formData array
    const newDivs = [...divs, newFormData];
    setDivs(newDivs);
  };
  // Function to handle change in input values
  const handleInputChange = (index, key, value) => {
    const newDivs = [...divs];
    newDivs[index][key] = value;
    setDivs(newDivs);
  };
  const handleDeleteDiv = (index) => {
    const newDivs = [...divs];
    newDivs.splice(index, 1);
    setDivs(newDivs);
  };

  const dragItem = React.useRef(null);
  const dragOverItem = React.useRef(null);
  const handleSort = () => {
    let _items = [...divs];
    const draggedItems = _items.splice(dragItem.current, 1)[0];
    _items.splice(dragOverItem.current, 0, draggedItems);
    dragItem.current = null;
    dragOverItem.current = null;
    setDivs(_items);
  };
  return (
    <StyledCustomForm>
      <Main>
        {/* Render dynamically added divs */}
        {divs.map((formData, index) => (
          <NewDiv
            draggable
            key={index}
            onDragStart={(e) => (dragItem.current = index)}
            onDragEnter={(e) => (dragOverItem.current = index)}
            onDragEnd={handleSort}
            onDragOver={(e) => e.preventDefault()}
          >
            <IconContainer>
              <GetCustomIcon icon={formData.icon} />
              <GetIcon icon="down" />
            </IconContainer>
            <RowWise>
              <TextBoxContainer>
                <TextBox label="Name" value={formData.name} error={formData.textDataError} onChange={(value) => handleInputChange(index, "name", value)} />
              </TextBoxContainer>
              <TextBoxContainer>
                <TextBox label="Placeholder" value={formData.placeholder} error={formData.textDataError} onChange={(value) => handleInputChange(index, "placeholder", value)} />
              </TextBoxContainer>
            </RowWise>
            <RowWise>
              <TextBoxContainer>
                <TextBox label="Label" value={formData.label} error={formData.textDataError} onChange={(value) => handleInputChange(index, "label", value)} />
              </TextBoxContainer>
              <TextBoxContainer>
                <TextBox label="Order Id" value={formData.orderId} error={formData.textDataError} onChange={(value) => handleInputChange(index, "orderId", value)} />
              </TextBoxContainer>
            </RowWise>
            <RowWise>
              <TextBoxContainer>
                <TextBox label="Validation" value={formData.validation} error={formData.textDataError} onChange={(value) => handleInputChange(index, "validation", value)} />
              </TextBoxContainer>
              <TextBoxContainer>
                <TextBox label="Show Item" value={formData.showItem} error={formData.textDataError} onChange={(value) => handleInputChange(index, "showItem", value)} />
              </TextBoxContainer>
            </RowWise>
            <RowWiseSingle>
              <TextBoxContainer>
                <TextBox label="Default" value={formData.defaultValue} error={formData.textDataError} onChange={(value) => handleInputChange(index, "defaultValue", value)} />
              </TextBoxContainer>
            </RowWiseSingle>
            <HorizontalLine />
            <CheckBoxes>
              <Checkbox label="Tag" value={formData.tag} onChange={(value) => handleInputChange(index, "tag", value)}></Checkbox>
              <Checkbox label="Required" value={formData.required} onChange={(value) => handleInputChange(index, "required", value)}></Checkbox>
              <Checkbox label="View" value={formData.view} onChange={(value) => handleInputChange(index, "view", value)}></Checkbox>
              <Checkbox label="Add" value={formData.add} onChange={(value) => handleInputChange(index, "add", value)}></Checkbox>
              <Checkbox label="Update" value={formData.update} onChange={(value) => handleInputChange(index, "update", value)}></Checkbox>
              <Checkbox label="Filter" value={formData.filter} onChange={(value) => handleInputChange(index, "filter", value)}></Checkbox>
              <ButtonDiv onClick={() => handleDeleteDiv(index)} title="Delete">
                <GetIcon icon="delete" />
              </ButtonDiv>
              <ButtonDiv title="Edit">
                <GetIcon icon="edit" />
              </ButtonDiv>
            </CheckBoxes>
          </NewDiv>
        ))}
      </Main>
      <ButtonMenu>
        <ButtonDiv onClick={() => handleAddDiv("shortAnswer")} title="Short Answer">
          <GetIcon icon="shortAnswer" />{" "}
        </ButtonDiv>
        <ButtonDiv onClick={() => handleAddDiv("paragraph")} title="Paragraph">
          <GetIcon icon="paragraph" />{" "}
        </ButtonDiv>
        <ButtonDiv onClick={() => handleAddDiv("multipleChoice")} title="Multiple Choice">
          <GetIcon icon="multipleChoice" />{" "}
        </ButtonDiv>
        <ButtonDiv onClick={() => handleAddDiv("checkBoxes")} title="Checkbox">
          <GetIcon icon="checkBoxes" />{" "}
        </ButtonDiv>
        <ButtonDiv onClick={() => handleAddDiv("dropdowns")} title="Dropdown">
          <GetIcon icon="dropdowns" />{" "}
        </ButtonDiv>
        <ButtonDiv onClick={() => handleAddDiv("fileUpload")} title="File Upload">
          <GetIcon icon="fileUpload" />{" "}
        </ButtonDiv>
        <ButtonDiv onClick={() => handleAddDiv("date")} title="Date">
          <GetIcon icon="date" />{" "}
        </ButtonDiv>
        <ButtonDiv onClick={() => handleAddDiv("dateBox")} title="Date">
          <GetIcon icon="dateBox" />{" "}
        </ButtonDiv>
      </ButtonMenu>
    </StyledCustomForm>
  );
};

export default CustomForm;
