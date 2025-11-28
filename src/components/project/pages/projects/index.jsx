import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
import PopupView from "../../../core/popupview";
import ViewMenu from "./viewMenu";
import AutoForm from "../../../core/autoform/AutoForm";
import { postData } from "../../../../backend/api";
import { attributeAttributes, menuAttributes, modelAttributes, permissionAttributes, projectAttributes } from "../../router/attributes/project";
import { Eye, ExternalLink, Database, Code, Users, DollarSign } from "lucide-react";
import { noimage } from "../../../../images/index.js";

//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const Projects = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Projects - EventHex Portal`;
  }, []);
  const [attributes] = useState(projectAttributes);
  const actions = [
    {
      element: "button",
      type: "subList",
      id: "Schemas",
      title: "Schemas",
      icon: "Schemas",
      attributes: modelAttributes,
      params: {
        api: `model`,
        parentReference: "project",
        icon: "model",
        itemTitle: { name: "shortName", type: "text", collection: "" },
        shortName: "Schema",
        addPrivilege: true,
        delPrivilege: true,
        updatePrivilege: true,
        customClass: "medium",
        formMode: `double`,
        popupMode: "full-page",
        popupMenu: "vertical-menu",
        actions: [
          {
            element: "button",
            type: "subList",
            id: "attributes",
            itemTitle: "label",
            title: "Attributes",
            icon: "attributes",
            attributes: attributeAttributes,
            params: {
              api: `attribute`,
              parentReference: "model",
              icon: "ticket-form-data",
              itemTitle: {
                name: "label",
                type: "text",
                collection: "",
              },
              shortName: "Attributes",
              addPrivilege: true,
              delPrivilege: true,
              updatePrivilege: true,
              customClass: "medium",
              formMode: `double`,
              additionalButtons: [
                {
                  label: "JSON Upload",
                  onClick: (item) => {
                    console.log("OnClick json", item);
                    setJsonUpload(item);
                  },
                  icon: "add",
                },
              ],
            },
          },
          {
            element: "button",
            type: "subList",
            id: "Sort",
            itemTitle: "Sort",
            title: "Sort",
            icon: "sort",
            attributes: attributeAttributes,
            params: {
              preFilter: { type: "sort" },
              api: `sort-filter`,
              parentReference: "model",
              icon: "filter",
              shortName: "Sort",
              addPrivilege: true,
              delPrivilege: true,
              updatePrivilege: true,
              customClass: "medium",
              formMode: `double`,
            },
          },
          {
            element: "button",
            type: "subList",
            id: "Filter",
            itemTitle: "Filter",
            title: "Filter",
            icon: "filter",
            attributes: attributeAttributes,
            params: {
              preFilter: { type: "filter" },
              api: `sort-filter`,
              parentReference: "model",
              icon: "filter",
              shortName: "Filter",
              addPrivilege: true,
              delPrivilege: true,
              updatePrivilege: true,
              customClass: "medium",
              formMode: `double`,
            },
          },
          {
            element: "button",
            type: "subList",
            id: "env",
            itemTitle: "key",
            title: "Environmental Variables",
            icon: "env",
            attributes: attributeAttributes,
            params: {
              preenv: { type: "env" },
              api: `env`,
              parentReference: "model",
              icon: "env",
              shortName: "Environmental Variables",
              addPrivilege: true,
              delPrivilege: true,
              updatePrivilege: true,
              customClass: "medium",
              formMode: `double`,
            },
          },
        ],
      },
    },
    {
      element: "button",
      type: "subList",
      id: "Menus",
      title: "Menus",
      icon: "Menus",
      attributes: menuAttributes,
      params: {
        api: `menu-item`,
        parentReference: "project",
        preFilter: { parentId: null },
        icon: "model",
        itemTitle: { name: "title", type: "text", collection: "" },
        shortName: "Menus",
        addPrivilege: true,
        delPrivilege: true,
        updatePrivilege: true,
        customClass: "medium",
        formMode: `double`,
        popupMode: "full-page",
        popupMenu: "vertical-menu",
        additionalButtons: [
          {
            label: "View Menu",
            onClick: (item) => {
              console.log("OnClick", item);
              setOpenItemData(item);
            },
            icon: "menu",
          },
        ],
        actions: [
          {
            element: "button",
            type: "subList",
            id: "permission",
            title: "Permissions",
            attributes: permissionAttributes,
            params: {
              api: `permission`,
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
            attributes: menuAttributes,
            params: {
              api: `menu-item`,
              parentReference: "parentId",
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
                    api: `permission`,
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
                  attributes: menuAttributes,
                  params: {
                    api: `menu-item`,
                    parentReference: "parentId",
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
                          api: `permission`,
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
                        attributes: menuAttributes,
                        params: {
                          api: `menu-item`,
                          parentReference: "parentId",
                          itemTitle: {
                            name: "title",
                            type: "text",
                            collection: "",
                          },
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
                                api: `permission`,
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
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ];
  const [openItemData, setOpenItemData] = useState(null);
  const [jsonUpload, setJsonUpload] = useState(null);

  const jsonData = [
    {
      type: "textarea",
      placeholder: `Your JSON Content`,
      name: "data",
      validation: "",
      default: "",
      // label: `JSON Content`,
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
  ];
  const submitChange = async (data) => {
    props.setLoaderBox(true);
    postData({ ...data, model: jsonUpload }, "attribute/json-upload").then((res) => {
      console.log(res, "logging response");

      if (res.status === 200) {
        setJsonUpload(null);
        props.setMessage({
          type: 1,
          content: res.data.message,
          okay: "Okay",
        });
      } else if (res.status === 400) {
        props.setMessage({
          type: 1,
          content: res.customMessage,
          okay: "Okay",
        });
      }
      props.setLoaderBox(false);
    });
  };

  const isCreatingHandler = (value, callback) => {};

  const ListItemRender = ({ data, attributes, shortName, api, itemTitle, actions, onClick }) => {
    // Helper function to get field value
    const getFieldValue = (fieldName) => {
      const value = data[fieldName];
      if (value === null || value === undefined || value === "") return null;

      // Handle object values (from API responses)
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        if (value.value) return value.value;
        if (value.label) return value.label;
        if (value.name) return value.name;
        if (value.title) return value.title;
      }

      return value;
    };

    // Get project data
    const projectTitle = getFieldValue("title") || "Untitled Project";
    const description = getFieldValue("description");
    const dbType = getFieldValue("dbType");
    const developmentStatus = getFieldValue("developmentStatus");
    const projectStatus = getFieldValue("projectStatus");
    const projectCost = getFieldValue("projectCost");
    const amc = getFieldValue("amc");
    const client = getFieldValue("client");
    const teamMembers = getFieldValue("teamMembers");
    const techStack = getFieldValue("techStack");
    const logo = getFieldValue("logo");
    const version = getFieldValue("version");

    // Get status color
    const getStatusColor = () => {
      switch (projectStatus) {
        case "onLive":
          return "bg-green-100 text-green-800";
        case "onDevelopment":
          return "bg-blue-100 text-blue-800";
        case "proposalAccepted":
          return "bg-purple-100 text-purple-800";
        case "proposal":
          return "bg-yellow-100 text-yellow-800";
        case "declined":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    // Get development status color
    const getDevelopmentStatusColor = () => {
      switch (developmentStatus) {
        case "live":
          return "bg-green-100 text-green-800";
        case "deployment":
          return "bg-blue-100 text-blue-800";
        case "testing":
          return "bg-yellow-100 text-yellow-800";
        case "developing":
          return "bg-purple-100 text-purple-800";
        case "designing":
          return "bg-indigo-100 text-indigo-800";
        case "discussion":
          return "bg-gray-100 text-gray-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    // Get database icon
    const getDatabaseIcon = () => {
      switch (dbType) {
        case "mongodb":
          return "🍃";
        case "postgresql":
          return "🐘";
        case "mysql":
          return "🐬";
        default:
          return "🗄️";
      }
    };

    // Format tech stack
    const formatTechStack = () => {
      if (!techStack) return null;
      if (Array.isArray(techStack)) {
        return techStack.slice(0, 3).join(", ") + (techStack.length > 3 ? "..." : "");
      }
      return techStack;
    };

    // Format team members
    const formatTeamMembers = () => {
      if (!teamMembers) return null;
      if (Array.isArray(teamMembers)) {
        return `${teamMembers.length} members`;
      }
      return teamMembers;
    };

    return (
      <div className="bg-white overflow-hidden flex border-b pb-4 border-gray-200">
        <div className="w-[300px] shadow-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold overflow-hidden">
          <img
            onError={(e) => {
              e.target.src = noimage;
            }}
            src={import.meta.env.VITE_CDN + (logo || "")}
            alt="Project Logo"
            className="w-full h-full object-cover aspect-[16/9]"
          />
        </div>

        <div className="flex-1 px-6 py-4 flex justify-between items-stretch">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold mb-1">{projectTitle}</h3>
                {description && <p className="text-gray-600 text-sm mb-2 line-clamp-2">{description}</p>}
              </div>
              <div className="flex gap-2">
                <span className={`inline-block ${getStatusColor()} text-xs px-2 py-1 rounded`}>{projectStatus || "Unknown"}</span>
                <span className={`inline-block ${getDevelopmentStatusColor()} text-xs px-2 py-1 rounded`}>{developmentStatus || "Unknown"}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Database size={14} className="text-gray-500" />
                  <span className="font-medium">Database:</span>
                  <span className="flex items-center gap-1">
                    {getDatabaseIcon()} {dbType || "Not set"}
                  </span>
                </div>

                {client && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={14} className="text-gray-500" />
                    <span className="font-medium">Client:</span>
                    <span>{client}</span>
                  </div>
                )}

                {teamMembers && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={14} className="text-gray-500" />
                    <span className="font-medium">Team:</span>
                    <span>{formatTeamMembers()}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {techStack && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Code size={14} className="text-gray-500" />
                    <span className="font-medium">Tech Stack:</span>
                    <span className="truncate">{formatTechStack()}</span>
                  </div>
                )}

                {projectCost && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign size={14} className="text-gray-500" />
                    <span className="font-medium">Cost:</span>
                    <span>${projectCost?.toLocaleString()}</span>
                  </div>
                )}

                {version && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="font-medium">Version:</span>
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">{version}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between ml-4 min-h-full">
            <div className="flex flex-col gap-2">{actions}</div>
            <div className="flex flex-col gap-2">
              <button onClick={onClick} className="px-3 py-2 bg-primary-base hover:bg-primary-dark text-white text-sm font-medium rounded-md transition-colors duration-200 flex items-center gap-2">
                <Eye size={16} />
                View Project
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Container className="noshadow">
      <ListTable
        viewMode="list"
        bulkUplaod={true}
        openTheme="style3"
        actions={actions}
        popupMode="full-page"
        popupMenu={"vertical-menu"}
        api={`project`}
        itemTitle={{ name: "title", type: "text", collection: "" }}
        shortName={`Project`}
        formMode={`double`}
        {...props}
        attributes={attributes}
        ListItemRender={ListItemRender}
      ></ListTable>
      {openItemData && (
        <PopupView
          popupData={<ViewMenu project={openItemData} />}
          closeModal={() => setOpenItemData(null)}
          itemTitle={{ name: "title", type: "text", collection: "" }}
          openData={{ data: { _id: openItemData, title: "View Menu" } }} // Pass selected item data to the popup for setting the time and taking menu id and other required data from the list item
          customClass={"small side"}
        ></PopupView>
      )}
      {jsonUpload && (
        <PopupView
          popupData={
            // <ViewMenu project={jsonUpload} />
            <AutoForm
              useCaptcha={false}
              key={`json`}
              useCheckbox={false}
              customClass={"embed"}
              description={""}
              formValues={{}}
              formMode={"double"}
              formType={"post"}
              header={"JSON FORM"}
              formInput={jsonData}
              submitHandler={submitChange}
              button={"Submit"}
              isOpenHandler={isCreatingHandler}
              css="plain embed"
              isOpen={true}
              plainForm={true}
            ></AutoForm>
          }
          closeModal={() => setJsonUpload(null)}
          itemTitle={{ name: "title", type: "text", collection: "" }}
          openData={{ data: { _id: jsonUpload, title: "JSON Upload" } }} // Pass selected item data to the popup for setting the time and taking menu id and other required data from the list item
          customClass={"small side"}
        ></PopupView>
      )}
    </Container>
  );
};
// exporting the page with parent container layout..
export default Layout(Projects);
