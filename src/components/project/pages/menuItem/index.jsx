import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
// src/components/styles/page/index.js
// if you want to write custom style, write in the above file
const MenuItem = (props) => {
  useEffect(() => {
    document.title = `Menu Item - EventHex Portal`;
  }, []);

  const [attributes] = useState([
    {
      type: "text",
      placeholder: "Title",
      name: "title",
      validation: "",
      default: "",
      label: "Title",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "select",
      placeholder: "Sub Menu Type",
      name: "subMenuType",
      validation: "",
      default: "",
      tag: true,
      label: "Sub Menu Type",
      showItem: "Sub Menu Type",
      required: true,
      view: true,
      filter: false,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "itemMenu,subMenu,information,label",
    },
    {
      type: "number",
      placeholder: "Order",
      name: "order",
      validation: "",
      default: 0,
      label: "Order",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Icon",
      name: "icon",
      validation: "",
      default: "",
      label: "Icon",
      required: false,
      tag: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "checkbox",
      placeholder: "Is Active",
      name: "isActive",
      validation: "",
      default: true,
      label: "Is Active",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
  ]);

  const [permissionAttributes] = useState([
    {
      type: "select",
      apiType: "API",
      selectApi: "user-type/select",
      placeholder: "Role",
      name: "role",
      validation: "",
      showItem: "role",
      tag: true,
      default: "",
      label: "Role",
      required: true,
      view: true,
      add: true,
      update: true,
      filter: false,
    },
    {
      type: "multiSelect",
      placeholder: "Actions",
      listView: true,
      name: "actions",
      validation: "",
      label: "Actions",
      tag: true,
      required: true,
      view: true,
      customClass: "list",
      add: true,
      update: true,
      apiType: "JSON",
      search: false,
      selectApi: [
        { value: "Add", id: "add" },
        { value: "Edit", id: "edit" },
        { value: "Delete", id: "delete" },
        { value: "View", id: "view" },
        { value: "Print", id: "print" },
        { value: "Export", id: "export" },
        { value: "Filter", id: "filter" },
        { value: "Search", id: "search" },
      ],
    },
  ]);

  const [subMenu] = useState([
    {
      type: "text",
      placeholder: "Title",
      name: "title",
      validation: "",
      default: "",
      label: "Title",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "select",
      placeholder: "Sub Menu Type",
      name: "subMenuType",
      validation: "",
      default: "",
      tag: true,
      label: "Sub Menu Type",
      showItem: "Sub Menu Type",
      required: true,
      view: true,
      filter: false,
      add: true,
      update: true,
      apiType: "CSV",
      selectApi: "itemMenu,subMenu,information,label",
    },
    {
      type: "number",
      placeholder: "Order",
      name: "order",
      validation: "",
      default: "",
      label: "Order",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Icon",
      name: "icon",
      validation: "",
      default: "",
      label: "Icon",
      required: false,
      tag: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "checkbox",
      placeholder: "Is Active",
      name: "isActive",
      validation: "",
      default: true,
      label: "Is Active",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
  ]);

  const [actions] = useState([
    {
      element: "button",
      type: "subList",
      id: "permission",
      title: "Permissions",
      attributes: permissionAttributes,
      params: {
        api: `menu-item/menuitem-permission`,
        parentReference: "menuItem",
        itemTitle: {
          name: "role",
          type: "text",
          collection: "role",
        },
        shortName: "Permissions",
        addPrivilege: true,
        delPrivilege: true,
        updatePrivilege: true,
        customClass: "medium",
      },
    },
    {
      element: "button",
      type: "subList",
      id: "sub-menu",
      title: "Sub Menu",
      attributes: subMenu,
      params: {
        api: `menu-item/submenu-item`,
        parentReference: "menuItem",
        itemTitle: { name: "title", type: "text", collection: "" },
        shortName: "Sub Menu",
        addPrivilege: true,
        delPrivilege: true,
        updatePrivilege: true,
        customClass: "medium",
        formMode: `double`,
        actions: [
          {
            element: "button",
            type: "subList",
            id: "permission",
            title: "Permissions",
            attributes: permissionAttributes,
            params: {
              api: `menu-item/submenuitem-permission`,
              parentReference: "menuItem",
              itemTitle: { name: "role", type: "text", collection: "role" },
              shortName: "Permissions",
              addPrivilege: true,
              delPrivilege: true,
              updatePrivilege: true,
              customClass: "medium",
            },
          },
        ],
      },
    },
  ]);

  return (
    <Container className="noshadow">
      <ListTable
        actions={actions}
        api={`menu-item`}
        itemTitle={{ name: "title", type: "text", collection: "" }}
        shortName={`Menu Item`}
        formMode={`double`}
        {...props}
        attributes={attributes}
      ></ListTable>
    </Container>
  );
};

export default Layout(MenuItem);
