import React, { useEffect, useState } from "react";
import Layout from "../../../../core/layout";
import ListTable from "../../../../core/list/list";
import { getData } from "../../../../../backend/api";
import { ElementContainer, TabButtons, Title } from "../../../../core/elements";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const RegistrationData = (props) => {
  const eventId = props?.openData?.data?._id;
  //to update the page title
  useEffect(() => {
    document.title = `Registration Data - EventHex Portal`;
  }, []);
  const [data] = useState(props.openData.data);
  const [attributes, setSubAttributes] = useState(null);
  const [loading, setLoading] = useState(null);
  const [selectedTab, setSelectedTab] = useState(1);
  const [tabs, setTabs] = useState([
    {
      key: 1,
      title: "All Data",
      // icon: "user"
    },
  ]);

  const [lastUpdateDate, setLastUpdateDate] = useState(null);

  useEffect(() => {
    getData({ event: eventId, type: "Form" }, "ticket").then((response) => {
      // Replace the tabs with the new ones from the response
      setTabs([
        {
          key: 1,
          title: "All Data", // Keep the default tab
        },
        ...response.data.response.map((item) => ({
          key: item._id, // Use _id as key
          title: item.title, // Replace with actual field names in response
          // Add other properties as needed
        })),
      ]);
    });
  }, [eventId]);

  useEffect(() => {
    const getTickets = async () => {
      setLoading(true);
      const response = await getData({ ticket: data._id }, "ticket-form-data");
      if (response.status === 200) {
        const base = [
          {
            type: "text",
            placeholder: "_id",
            name: "_id",
            validation: "",
            default: "",
            label: "_id",
            minimum: 5,
            maximum: 40,
            required: true,
            view: false,
            tag: false,
            export: true,
          },
          {
            type: "text",
            placeholder: "Name",
            name: "fullName",
            validation: "",
            collection: "authentication",
            showItem: "fullName",
            default: "",
            label: "User Name",
            minimum: 0,
            maximum: 16,
            required: true,
            add: true,
            view: true,
            bulkUplaod: true,
            tag: true,
          },
          {
            type: "text",
            placeholder: "Ticket",
            name: "ticket",
            validation: "",
            collection: "ticket",
            showItem: "title",
            default: "",
            label: "Ticket",
            minimum: 0,
            maximum: 16,
            required: true,
            add: true,
            view: true,
            bulkUplaod: true,
            tag: true,
          },
          {
            type: "show",
            placeholder: "Phone Code",
            name: "phoneCode",
            validation: "",
            default: "",
            label: "Phone Code",
            tag: false,
            required: false,
            view: true,
            add: true,
            update: true,
          },
          {
            type: "text",
            placeholder: "WhatsApp Number",
            name: "authenticationId",
            validation: "",
            default: "",
            label: "WhatsApp Number",
            collection: "authentication",
            showItem: "authenticationId",
            minimum: 5,
            maximum: 40,
            required: true,
            add: true,
            view: true,
            tag: true,
            export: true,
          },
          {
            type: "text",
            placeholder: "Email ID",
            name: "emailId",
            validation: "",
            default: "",
            label: "Email Id",
            collection: "authentication",
            showItem: "formData",
            showSubItem: "emailId",
            minimum: 5,
            maximum: 40,
            add: true,
            required: true,
            view: true,
            tag: true,
            export: true,
          },
          {
            type: "text",
            placeholder: "Token",
            name: "token",
            validation: "",
            default: "",
            label: "Token",
            collection: "",
            showItem: "",
            required: true,
            view: true,
            tag: true,
            export: true,
          },
        ];
        const abstract =
          (data.enableAbstract ?? false)
            ? [
                {
                  type: "file",
                  placeholder: "Abstract",
                  name: "abstract",
                  validation: "",
                  default: "",
                  label: "Abstract",
                  collection: "",
                  showItem: "",
                  required: true,
                  view: true,
                  tag: true,
                  export: true,
                },
                {
                  type: "checkbox",
                  placeholder: "Abstract Uploaded",
                  name: "abstractUploaded",
                  validation: "",
                  default: "",
                  label: "Abstract Uploaded",
                  collection: "",
                  showItem: "",
                  required: true,
                  view: true,
                  tag: true,
                  export: true,
                  filter: true,
                },
              ]
            : [];
        setSubAttributes([
          ...base,
          ...response.data.response.map((item) => {
            let newItem = {
              ...item,
              collection: "formData",
            };
            if (item.conditionEnabled) {
              newItem.condition = {
                item: item.conditionWhenField,
                if: item.conditionCheckMatch.includes(",") ? item.conditionCheckMatch.split(",") : [item.conditionCheckMatch],
                then: item.conditionIfMatch === "enabled" ? "enabled" : "disabled",
                else: item.conditionIfMatch === "enabled" ? "disabled" : "enabled",
              };
            }

            return newItem;
          }),
          ...abstract,
          {
            type: "datetime",
            placeholder: "Registered On",
            name: "createdAt",
            validation: "",
            default: "",
            label: "Registered On",
            minimum: 0,
            maximum: 16,
            required: true,
            view: true,
            tag: true,
          },
          //   {
          //     type: "select",
          //     placeholder: "Approval",
          //     name: "approve",
          //     validation: "",
          //     default: "",
          //     collection: "",
          //     label: "Approval",
          //     required: false,
          //     selectApi: [
          //       { id: true, value: "Approved" },
          //       { id: false, value: "Pending" },
          //     ],
          //     apiType: "JSON",
          //     view: true,
          //     tag: true,
          //     add: false,
          //     filter: true,
          //     export: true,
          //   },
        ]);
      }
    };
    if (!attributes && !loading) {
      getTickets();
    }
  }, [data, attributes, loading]);

  const [eventAttributes] = useState([
    {
      type: "text",
      placeholder: "Name",
      name: "fullName",
      validation: "",
      collection: "authentication",
      showItem: "fullName",
      default: "",
      label: "User Name",
      minimum: 0,
      maximum: 16,
      required: true,
      add: true,
      view: true,
      bulkUplaod: true,
      tag: true,
    },
    {
      type: "text",
      placeholder: "Ticket",
      name: "ticket",
      validation: "",
      collection: "ticket",
      showItem: "title",
      default: "",
      label: "Ticket",
      minimum: 0,
      maximum: 16,
      required: true,
      add: true,
      view: true,
      bulkUplaod: true,
      tag: true,
    },
    {
      type: "text",
      placeholder: "WhatsApp Number",
      name: "authenticationId",
      validation: "",
      default: "",
      label: "WhatsApp Number",
      collection: "authentication",
      showItem: "authenticationId",
      minimum: 5,
      maximum: 40,
      required: true,
      add: true,
      view: true,
      tag: true,
      export: true,
    },
    {
      type: "text",
      placeholder: "Email ID",
      name: "emailId",
      validation: "",
      default: "",
      label: "Email Id",
      collection: "authentication",
      showItem: "formData",
      showSubItem: "emailId",
      minimum: 5,
      maximum: 40,
      add: true,
      required: true,
      view: true,
      tag: true,
      export: true,
    },
    {
      type: "text",
      placeholder: "Order Id",
      name: "_id",
      validation: "",
      default: "",
      label: "Order Id",
      required: true,
      view: true,
      tag: true,
      export: true,
    },
    {
      type: "datetime",
      placeholder: "Registration Time",
      name: "createdAt",
      validation: "",
      default: "",
      label: "Registration Time",
      minimum: 0,
      maximum: 16,
      required: true,
      view: true,
      tag: true,
      filter: true,
      sort: true,
    },
  ]);

  // const getApproved = (id, refreshView, slNo, api) => {
  //   props.setLoaderBox(true);
  //   postData({ id }, `authentication/${api}`)
  //     .then((response) => {
  //       props.setLoaderBox(false);
  //       if (response.data) {
  //         props.setMessage({
  //           type: 1,
  //           content: response.data.message,
  //           icon: "success",
  //         });
  //         if (api === "approve") {
  //           refreshView(false, slNo, { approve: true });
  //         }
  //       } else {
  //         // Handle the case where response.data is undefined
  //         console.error("Response data is undefined.");
  //       }
  //     })
  //     .catch((error) => {
  //       props.setLoaderBox(false);
  //       // Handle any errors that occur during the API request
  //       console.error("API request error:", error);
  //     });
  // };

  // console.log(actions)
  return (
    attributes && (
      <ElementContainer className="column">
        <Title line={false} title="Attendees" />
        <TabButtons
          selectedTab={selectedTab}
          selectedChange={(value) => {
            //how to use loader it will be only available when of thread or long running function is running!
            props.setLoaderBox(true);
            console.log("Cliked Tab", value);
            //turn off loader when it end the use
            setSelectedTab(value);
            setLastUpdateDate(new Date());
            props.setLoaderBox(false);
          }}
          tabs={tabs}
        ></TabButtons>
        {selectedTab === 1 ? (
          <ListTable
            // actions={actions}
            api={`form-registration`}
            key={selectedTab}
            itemTitle={{
              name: "fullName",
              type: "text",
              collection: "authentication",
            }}
            shortName={`Registration`}
            formMode={`single`}
            preFilter={{ event: eventId }}
            bulkUplaod={true}
            delPrivilege={false}
            addPrivilege={false}
            updatePrivilege={false}
            exportPrivilege={true}
            viewMode={"table"}
            name={new Date().toString()}
            {...props}
            dotMenu={true}
            attributes={eventAttributes}
            lastUpdateDate={lastUpdateDate}
          ></ListTable>
        ) : (
          <ListTable
            // actions={actions}
            api={`form-registration`}
            key={selectedTab}
            itemTitle={{
              name: "fullName",
              type: "text",
              collection: "authentication",
            }}
            dotMenu={true}
            shortName={`Registration`}
            formMode={`single`}
            preFilter={{ ticket: selectedTab, event: eventId }}
            bulkUplaod={true}
            delPrivilege={false}
            addPrivilege={false}
            updatePrivilege={false}
            exportPrivilege={true}
            viewMode={"table"}
            name={new Date().toString()}
            {...props}
            attributes={attributes}
            lastUpdateDate={lastUpdateDate}
          ></ListTable>
        )}
      </ElementContainer>
    )
  );
};
// exporting the page with parent container layout..
export default Layout(RegistrationData);
