import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getData } from "../../../../../backend/api";
import { GetIcon } from "../../../../../icons";

const MenuContainer = styled.div`
  padding: 20px;
`;

const MenuItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px; /* Smaller gap for a compact look */
`;

const MenuItem = styled.div`
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MenuItemLabel = styled.span`
  font-weight: bold; /* Bold for clear distinction */
  font-size: 1.1em; /* Size for visibility */
  display: flex;
  gap: 10px;
`;

const MenuItemDescription = styled.p`
  font-size: 0.9em;
  color: #555;
  margin: 2px 0; /* Minimal margin to keep it close */
`;

const ChildMenuItems = styled.div`
  padding-left: 20px; /* Indentation for child items */
  margin-left: 10px; /* Extra margin for separation */
  border-left: 1px dashed #ccc; /* Dashed line for hierarchy visualization */
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const NumberedLabel = styled.span`
  display: inline-block; /* To align numbers properly */
  width: 30px; /* Fixed width for numbers */
  text-align: right; /* Right-align numbers */
  margin-right: 5px; /* Space between number and text */
`;

const ViewMenu = ({ project }) => {
  const [menuItems, setMenuItems] = useState([]);
  useEffect(() => {
    getData({ project }, "menu/hierarchical").then((response) => {
      setMenuItems(response.data.response);
    });
  }, [project]);

  const renderMenuItems = (items, level = 1) => {
    return (
      items &&
      items.map((item, index) => (
        <MenuItem key={item._id}>
          <MenuItemLabel>
            <NumberedLabel>{`${level}.${index + 1}`}</NumberedLabel>
            {item.icon && <GetIcon icon={item.icon} style={{ marginRight: "5px", verticalAlign: "middle" }} />}
            {item.title}
          </MenuItemLabel>

          {item.description && <MenuItemDescription>{item.description}</MenuItemDescription>}

          {item.children && item.children.length > 0 && <ChildMenuItems>{renderMenuItems(item.children, level + 1)}</ChildMenuItems>}
        </MenuItem>
      ))
    );
  };

  return (
    <MenuContainer>
      <MenuItems>{renderMenuItems(menuItems)}</MenuItems>
    </MenuContainer>
  );
};

export default ViewMenu;
