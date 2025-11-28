import React, { useEffect, useState } from "react";
import Layout from "../../../core/layout";
import ListTable from "../../../core/list/list";
import { Container } from "../../../core/layout/styels";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const ContestBased = (props) => {
    console.log("ContestBased - Props:", props);
    //to update the page title
    useEffect(() => {
        document.title = `Contest Based - EventHex Portal`;
    }, []);

    const [attributes] = useState([
        {
            type: "select",
            placeholder: "Contest Type",
            name: "contestType",
            apiType: "CSV",
            selectApi: "MCQ",
            validation: "",
            default: "MCQ",
            label: "Contest Type",
            tag: true,
            required: true,
            view: true,
            add: true,
            update: true,
        },
        {
            type: "textarea",
            placeholder: "Question",
            name: "question",
            validation: "",
            default: "",
            tag: true,
            label: "Question",
            required: false,
            view: true,
            add: true,
            update: true,
        },
        {
            type: "text",
            placeholder: "Option 1",
            name: "option1",
            validation: "",
            default: "",
            tag: true,
            label: "Option 1",
            required: false,
            view: true,
            add: true,
            update: true,
        },
        {
            type: "text",
            placeholder: "Option 2",
            name: "option2",
            validation: "",
            default: "",
            tag: true,
            label: "Option 2",
            required: false,
            view: true,
            add: true,
            update: true,
        },
        {
            type: "text",
            placeholder: "Option 3",
            name: "option3",
            validation: "",
            default: "",
            tag: true,
            label: "Option 3",
            required: false,
            view: true,
            add: true,
            update: true,
        },
        {
            type: "text",
            placeholder: "Option 4",
            name: "option4",
            validation: "",
            default: "",
            tag: true,
            label: "Option 4",
            required: false,
            view: true,
            add: true,
            update: true,
        },
        {
            type: "multiSelect",
            placeholder: "Correct Answer",
            name: "correctAnswer",
            apiType: "JSON",
            selectApi: [
                { id: "option1", value: "Option 1" },
                { id: "option2", value: "Option 2" },
                { id: "option3", value: "Option 3" },
                { id: "option4", value: "Option 4" }
            ],
            validation: "",
            default: "",
            label: "Correct Answer",
            tag: true,
            required: true,
            view: true,
            add: true,
            update: true,
        },
        {
            type: "number",
            placeholder: "Points",
            name: "contestPoints",
            validation: "required|min:0",
            default: 10,
            tag: true,
            label: "Points",
            required: true,
            view: true,
            add: true,
            update: true,
        },
    ]);
    console.log(props);

    // Get event ID from props when used in modal context
    const eventId = props?.data?.event;
    const eventChallengeId = props?.data?._id;

    console.log("ContestBased - Event ID:", eventId);
    console.log("ContestBased - Event Challenge ID:", eventChallengeId);
    // Add event and eventChallenge fields to attributes if available
    const prependAttributes = [];
    if (eventId) {
        prependAttributes.push({
            type: "hidden",
            name: "event",
            default: eventId,
            add: true,
            update: false,
        });
    }
    if (eventChallengeId) {
        prependAttributes.push({
            type: "hidden",
            name: "eventChallenge",
            default: eventChallengeId,
            add: true,
            update: false,
        });
    }
    const finalAttributes = prependAttributes.length ? [...prependAttributes, ...attributes] : attributes;


    return (
        <Container className="noshadow">
            <ListTable
                // actions={actions}
                api={`contest-based`}
                itemTitle={{ name: "title", type: "text", collection: "" }}
                shortName={`Contest Based`}
                formMode={`single`}
                viewMode={`table`}
                preFilter={eventId || eventChallengeId ? { ...(eventId ? { event: eventId } : {}), ...(eventChallengeId ? { eventChallenge: eventChallengeId } : {}) } : {}}
                addPrivilege={true}
                delPrivilege={true}
                updatePrivilege={true}
                exportPrivilege={true}
                bulkUplaod={false}
                attributes={finalAttributes}
                parentReference="event"
            ></ListTable>
        </Container>
    );
};
// Export both with and without Layout wrapper
export default ContestBased;
export { ContestBased as ContestBasedModal };
