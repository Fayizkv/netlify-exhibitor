import React, { useEffect, useState } from "react";
import Layout from "../../../../core/layout";
import ListTable from "../../../../core/list/list";
import { Container } from "../../../../core/layout/styels";
import PopupView from "../../../../core/popupview";
import PermissionManager from "./PermissionManager";

const UserType = (props) => {
  const [openMenuPermissions, setOpenMenuPermissions] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState(null);

  useEffect(() => {
    document.title = `User Type - EventHex Portal`;
  }, []);

  const closeModal = () => {
    setOpenMenuPermissions(false);
    setSelectedUserType(null);
  };

  const [attributes] = useState([
    {
      type: "text",
      placeholder: "Role",
      name: "role",
      validation: "",
      default: "",
      label: "Role",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Display Name",
      name: "roleDisplayName",
      validation: "",
      default: "",
      tag: true,
      label: "Display Name",
      required: true,
      view: true,
      add: true,
      update: true,
    },
  ]);

  const actions = [
    {
      element: "button",
      type: "callback",
      callback: (item, data) => {
        setSelectedUserType(data);
        setOpenMenuPermissions(true);
      },
      icon: "menu",
      title: "Manage Permissions",
      params: {
        api: ``,
        parentReference: "",
        itemTitle: { name: "title", type: "text", collection: "" },
        shortName: "Manage Permissions",
        addPrivilege: true,
        delPrivilege: true,
        updatePrivilege: true,
        customClass: "full-page",
      },
      actionType: "button",
    },
  ];

  return (
    <Container className="noshadow">
      <ListTable displayColumn="double" api={`user-type`} itemTitle={{ name: "role", type: "text", collection: "" }} shortName={`Role`} {...props} attributes={attributes} actions={actions} />

      {openMenuPermissions && selectedUserType && (
        <PopupView
          popupData={<PermissionManager userTypeId={selectedUserType._id} title={selectedUserType.roleDisplayName} />}
          themeColors={props.themeColors}
          closeModal={closeModal}
          itemTitle={{ name: "title", type: "text", collection: "" }}
          openData={{
            data: {
              _id: "permissions_manager",
              title: "Manage User Role Permissions",
            },
          }}
          customClass={"large"}
        />
      )}
    </Container>
  );
};

export default Layout(UserType);
