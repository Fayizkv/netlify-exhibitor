import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
import { getData, postData } from "../../../../backend/api";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const RegistrationFormData = (props) => {
  //to update the page title
  useEffect(() => {
    document.title = `Responses - EventHex Portal`;
  }, []);
  const data = useMemo(() => props.openData.data, [props.openData.data]);
  const [attributes, setSubAttributes] = useState(null);
  const [loading, setLoading] = useState(null);
  const type = useMemo(() => props.openData.data.type ?? "Ticket", [props.openData.data.type]);
  useEffect(() => {
    const getTickets = async () => {
      setLoading(true);
      const response = await getData({ ticket: data._id, eventId: data.event._id ?? data.event }, "ticket-form-data");
      const ticket = response.data.ticketData.event.countries;
      if (response.status === 200) {
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
        const formFields = [
          ...[...(type === "Ticket" ? response.data.eventForm : []), ...response.data.response].map((attribute) => {
            const formattedAttribute = { ...attribute };

            if (formattedAttribute.conditionEnabled) {
              formattedAttribute.condition = {
                item: formattedAttribute.conditionWhenField,
                if: formattedAttribute.conditionCheckMatch.includes(",") ? formattedAttribute.conditionCheckMatch.split(",") : [formattedAttribute.conditionCheckMatch],
                then: formattedAttribute.conditionIfMatch === "enabled" ? "enabled" : "disabled",
                else: formattedAttribute.conditionIfMatch === "enabled" ? "disabled" : "enabled",
              };
            }

            if (formattedAttribute.type === "select") {
              formattedAttribute.search = true;
              formattedAttribute.filter = true;
            } else {
              formattedAttribute.filter = false;
            }
            if (!["file", "image"].includes(formattedAttribute.name)) {
              formattedAttribute.sort = true;
            }

            if (formattedAttribute.type === "multiSelect") {
              if (formattedAttribute.apiType === "CSV") {
                formattedAttribute.selectApi = formattedAttribute.selectApi
                  .toString()
                  .split(",")
                  .map((item) => ({
                    id: item,
                    value: item,
                  }));
                formattedAttribute.apiType = "JSON";
              }
              formattedAttribute.default = "";
            }

            if (["firstName", "authenticationId", "emailId"].includes(formattedAttribute.name)) {
              formattedAttribute.collection = "";
              if (formattedAttribute.name === "authenticationId" && ticket?.event?.countries) {
                formattedAttribute.countries = ticket.event.countries;
              }
            } else {
              formattedAttribute.collection = "formData";
            }

            formattedAttribute.showItem = formattedAttribute.name;
            formattedAttribute.update = true;
            if (!formattedAttribute.type === "title" && !formattedAttribute.type === "info") {
              formattedAttribute.tag = true;
              formattedAttribute.view = true;
            }
            formattedAttribute.export = true;

            return formattedAttribute;
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
          {
            type: "select",
            placeholder: "Approval",
            name: "approve",
            validation: "",
            default: "",
            collection: "",
            label: "Approval",
            required: false,
            selectApi: [
              { id: true, value: "Approved" },
              { id: false, value: "Pending" },
            ],
            apiType: "JSON",
            view: true,
            tag: true,
            add: false,
            filter: true,
            export: true,
          },
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
        ];
        if (!attributes) {
          setSubAttributes(formFields);
        }
      }
    };
    if (!attributes && !loading) {
      getTickets();
    }
  }, [data, attributes, loading, type]);

  const getApproved = (id, refreshView, slNo, api) => {
    props.setLoaderBox(true);
    postData({ id }, `authentication/${api}`)
      .then((response) => {
        props.setLoaderBox(false);
        if (response.data) {
          props.setMessage({
            type: 1,
            content: response.data.message,
            icon: "success",
          });
          if (api === "approve") {
            refreshView(false, slNo, { approve: true });
          }
        } else {
          // Handle the case where response.data is undefined
          console.error("Response data is undefined.");
        }
      })
      .catch((error) => {
        props.setLoaderBox(false);
        // Handle any errors that occur during the API request
        console.error("API request error:", error);
      });
  };

  const [actions] = useState([
    {
      element: "button",
      type: "callback",
      callback: (item, data, refreshView, slNo) => {
        getApproved(data._id, refreshView, slNo, "approve");
      },
      itemTitle: {
        name: "user",
        type: "text",
        collection: "",
      },
      condition: {
        item: "approve",
        if: "false",
        then: true,
        else: false,
      },
      icon: "next",
      title: "Approve",
      params: {
        api: ``,
        parentReference: "",
        itemTitle: {
          name: "user",
          type: "text",
          collection: "",
        },
        shortName: "Approve",
        addPrivilege: true,
        delPrivilege: true,
        updatePrivilege: true,
        customClass: "medium",
      },
    },
    {
      element: "button",
      type: "callback",
      callback: (item, data, refreshView, slNo) => {
        getApproved(data._id, refreshView, slNo, "resend");
      },
      itemTitle: {
        name: "user",
        type: "text",
        collection: "",
      },
      icon: "next",
      title: "Resend Confirmation",
      params: {
        api: ``,
        parentReference: "",
        itemTitle: {
          name: "user",
          type: "text",
          collection: "",
        },
        shortName: "Resend Confirmation",
        addPrivilege: true,
        delPrivilege: true,
        updatePrivilege: true,
        customClass: "medium",
      },
    },
  ]);
  // console.log(actions)
  return (
    attributes?.length > 0 && (
      <Container className="noshadow">
        <ListTable
          actions={actions}
          api={`ticket-registration/${data._id}`}
          itemTitle={{
            name: "fullName",
            type: "text",
            collection: "authentication",
          }}
          shortName={`${data.title} Responses`}
          formMode={`single`}
          preFilter={{ ticket: data._id, type: type }}
          bulkUplaod={true}
          delPrivilege={false}
          addPrivilege={false}
          updatePrivilege={false}
          exportPrivilege={true}
          viewMode={"table"}
          name={data._id}
          {...props}
          attributes={attributes}
        ></ListTable>
      </Container>
    )
  );
};
// exporting the page with parent container layout..
export default Layout(RegistrationFormData);
