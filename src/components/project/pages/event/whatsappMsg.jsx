import { useEffect, useState } from "react";
import { Button, ElementContainer, TextArea, Title } from "../../../core/elements";
import { putData } from "../../../../backend/api";
export const WhatsappMsg = ({ openData, closeModal, setMessage }) => {
  //   const [whatsappMessage, setWhatsappMessage] = useState("");
  //   const [whatsappMessageError, setWhatsappMessageError] = useState("");

  const [whatsappTemplate, setWhatsappTemplate] = useState("");
  const [whatsappTemplateError, setWhatsappTemplateError] = useState("");

  useEffect(() => {
    // const isWhatsappMessage = whatsappMessage.trim().length > 0;
    const isWhatsappTemplateValid = whatsappTemplate.trim().length > 0;

    // setWhatsappMessageError(
    //   isWhatsappMessage ? "" : "There should be a valid text!!"
    // );
    setWhatsappTemplateError(isWhatsappTemplateValid ? "" : "There should be a valid text!!");
  }, [whatsappTemplate]);

  async function handleSave() {
    await putData({ whatsappTemplate, eventId: openData.data._id }, "event/sendBulkMsg").then((response) => {
      console.log("Response", response);
    });
    closeModal();
    console.log("Saved Successfully");
  }

  return (
    <ElementContainer className="column" style={{ padding: 20 }}>
      <Title title="On Successfull Message"></Title>
      <TextArea
        label="Whatsapp Template"
        value={whatsappTemplate}
        error={whatsappTemplateError}
        info="Please enter the message to be sent on successful registration."
        onChange={(value) => {
          setWhatsappTemplate(value);
        }}
      ></TextArea>
      <Button
        ClickEvent={() => {
          setMessage({
            type: 2,
            content: "Is there any edits in this message?",
            proceed: "No",
            okay: "Yes",
            onClose: async () => {
              try {
                setMessage({
                  type: 1,
                  content: "Please edit the message and submit!",
                  okay: "Okay",
                });
                //return false if this second message to show..
                return false;
              } catch (error) {}
            },
            onProceed: async () => {
              try {
                handleSave();
                setMessage({
                  type: 1,
                  content: "Thank you for confirming! Message Sent Successfully!",
                  okay: "Welcome",
                });
                //return false if this second message to show..
                return false;
              } catch (error) {
                console.log("Error", error);
              }
            },
            data: { id: 1 },
          });
        }}
        icon={"next"}
        value="Submit"
      ></Button>
    </ElementContainer>
  );
};
