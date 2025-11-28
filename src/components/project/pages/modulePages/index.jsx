import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
import PopupView from "../../../core/popupview";
import ModulePermissionManager from "./ModulePermissionManager";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const ModulePages = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Modules - EventHex Portal`;
  }, []);

  const [openMenuPermissions, setOpenMenuPermissions] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  const closeModal = () => {
    setOpenMenuPermissions(false);
    setSelectedModule(null);
  };

  const [attributes] = useState([
    {
      type: "select",
      apiType: "API",
      selectApi: "modules/select",
      placeholder: "Display Module",
      name: "module",
      validation: "",
      showItem: "value",
      tag: true,
      default: "",
      label: "Display Module",
      required: true,
      view: true,
      add: true,
      update: true,
      filter: true,
    },
    {
      type: "select",
      apiType: "API",
      selectApi: "item-pages/select",
      placeholder: "Page",
      name: "page",
      validation: "",
      showItem: "value",
      tag: false,
      default: "",
      label: "Page",
      required: true,
      view: true,
      add: true,
      update: true,
      filter: true,
    },
  ]);

  const actions = [
    {
      element: "button",
      type: "callback",
      callback: (item, data) => {
        setSelectedModule(data);
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
      <ListTable
        actions={actions}
        api={`module-pages`}
        itemTitle={{ name: "title", type: "text", collection: "page" }}
        shortName={`Module Pages`}
        formMode={`single`}
        {...props}
        attributes={attributes}
      ></ListTable>

      {openMenuPermissions && selectedModule && (
        <PopupView
          popupData={<ModulePermissionManager moduleId={selectedModule._id} title={selectedModule.title || selectedModule.module || "Module Permissions"} />}
          themeColors={props.themeColors}
          closeModal={closeModal}
          itemTitle={{ name: "title", type: "text", collection: "" }}
          openData={{
            data: {
              _id: "permissions_manager",
              title: "Manage Module Permissions",
            },
          }}
          customClass={"large"}
        />
      )}
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(ModulePages);
