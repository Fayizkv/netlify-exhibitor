import React, { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../../../../core/layout";
import ListTable from "../../../../core/list/list";
import { getData } from "../../../../../backend/api";

const InstaAttendee = (props) => {
  const { id } = props;
  const eventId = props?.openData?.data?._id;
  const { title } = props;
  const [selectedTab] = useState("all");
  const [eventAttributes, setEventAttributes] = useState([]);

  const lastFields = useMemo(
    () => [
      {
        type: "datetime",
        placeholder: "Match Time",
        name: "matchDate",
        validation: "",
        default: "",
        label: "Match Time",
        minimum: 0,
        maximum: 16,
        required: true,
        view: true,
        tag: true,
        export: true,
      },
    ],
    []
  );

  const formatArray = useCallback(
    (eventForm) => {
      if (!Array.isArray(eventForm)) return [];

      const formFields = eventForm.map((attribute) => {
        const formattedAttribute = { ...attribute };

        if (formattedAttribute.type === "select") {
          formattedAttribute.search = true;
          formattedAttribute.filter = true;
        } else {
          formattedAttribute.filter = false;
        }

        if (!["file", "image"].includes(formattedAttribute.name)) {
          formattedAttribute.sort = true;
        }

        if (["user"].includes(formattedAttribute.name)) {
          formattedAttribute.collection = "user";
        } else {
          formattedAttribute.collection = "faceMatch";
        }

        formattedAttribute.showItem = formattedAttribute.name;
        formattedAttribute.update = true;
        formattedAttribute.tag = true;
        formattedAttribute.view = true;
        formattedAttribute.export = true;

        return formattedAttribute;
      });

      return [...formFields, ...lastFields];
    },
    [lastFields]
  );

  useEffect(() => {
    document.title = `${title} - Face Match`;
    getData({ event: props?.openData?.data?._id }, "face-match-form").then((response) => {
      const fields = formatArray(response?.data?.response);
      const base = [
        {
          type: "text",
          placeholder: "Event",
          name: "value",
          validation: "",
          collection: "event",
          showItem: "value",
          default: "",
          label: "Event",
          minimum: 0,
          maximum: 16,
          required: true,
          view: true,
          tag: false,
          export: true,
          filter: true,
        },
        {
          type: "text",
          placeholder: "Your Name",
          name: "value",
          validation: "",
          collection: "user",
          showItem: "value",
          default: "",
          label: "Your Name",
          minimum: 0,
          maximum: 100,
          required: true,
          view: true,
          tag: true,
          export: true,
          filter: true,
          sort: true,
        },
        {
          type: "text",
          placeholder: "Mobile Number",
          name: "authenticationId",
          validation: "",
          collection: "user",
          showItem: "authenticationId",
          default: "",
          label: "Mobile Number",
          minimum: 0,
          maximum: 15,
          required: true,
          view: true,
          tag: true,
          export: true,
          filter: true,
          sort: true,
        },
        {
          type: "text",
          placeholder: "Email ID",
          name: "emailId",
          validation: "",
          collection: "user",
          showItem: "emailId",
          default: "",
          label: "Email ID",
          minimum: 0,
          maximum: 100,
          required: false,
          view: true,
          tag: true,
          export: true,
          filter: true,
          sort: true,
        },
        {
          type: "text",
          placeholder: "Image ID",
          name: "imageId",
          validation: "",
          default: "",
          label: "Image ID",
          minimum: 0,
          maximum: 100,
          required: true,
          view: true,
          tag: false,
          export: true,
          filter: false,
          sort: true,
        },
        {
          type: "datetime",
          placeholder: "Match Date & Time",
          name: "matchDate",
          validation: "",
          default: "",
          label: "Match Date & Time",
          minimum: 0,
          maximum: 100,
          required: true,
          view: true,
          tag: true,
          export: true,
          filter: false,
          sort: true,
        },
        {
          type: "image",
          placeholder: "Face Match Image",
          name: "image",
          validation: "",
          default: "",
          label: "Face Match",
          required: true,
          view: false,
          tag: false,
          export: false,
          imageSettings: { fileName: "file", image: "file", thumbnail: "compressed", endpoind: "https://event-hex-saas.s3.amazonaws.com/" },
        },
        {
          type: "image",
          placeholder: "Thumbnail",
          name: "thumbnail",
          validation: "",
          default: "",
          label: "Thumbnail",
          required: true,
          view: false,
          tag: false,
          export: false,
        },
        {
          type: "image",
          placeholder: "Compressed",
          name: "compressed",
          validation: "",
          default: "",
          label: "Compressed",
          required: true,
          view: false,
          tag: false,
          export: false,
        },
      ];
      setEventAttributes([...base, ...fields]);
    });
  }, [props?.openData?.data?._id, formatArray, title, eventId, selectedTab]);

  // Process data to ensure we get unique users with their latest match
  const processData = useCallback((data) => {
    if (!Array.isArray(data)) return [];

    // Create a Map to store the latest match for each user
    const userMap = new Map();

    data.forEach((match) => {
      const userId = match.user._id;
      if (!userMap.has(userId) || new Date(match.matchDate) > new Date(userMap.get(userId).matchDate)) {
        userMap.set(userId, match);
      }
    });

    // Convert Map values back to array
    return Array.from(userMap.values());
  }, []);

  return (
    eventAttributes.length > 0 &&
    selectedTab === "all" && (
      <ListTable
        api="face-match/unique"
        key={`face-match-${id}`}
        itemTitle={{
          name: "value",
          type: "text",
          collection: "user",
        }}
        shortName={title}
        formMode="single"
        preFilter={{ event: eventId }}
        parents={{ event: eventId }}
        delPrivilege={false}
        addPrivilege={false}
        updatePrivilege={false}
        exportPrivilege={true}
        viewMode="table"
        name={`face-match-${id}`}
        processData={processData}
        {...props}
        attributes={eventAttributes}
      />
    )
  );
};

export default Layout(InstaAttendee);
