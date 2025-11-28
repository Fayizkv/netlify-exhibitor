import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { postData } from "../../../../../../../backend/api";
import moment from "moment";
import { GetIcon } from "../../../../../../../icons";
import AutoForm from "../../../../../../core/autoform/AutoForm";
import Loader from "../../../../../../core/loader";
import { Button } from "../../../../../../core/select/styles";
import * as htmlToImage from "html-to-image";
import QRCode from "react-qr-code";
import { calicut, malappuram } from "../../../../../brand";
import FormInput from "../../../../../../core/input";
const FormBox = styled.div`
  z-index: 1001;
  top: 0;
  right: 0;
  background: white;
  left: 0;
  bottom: 0;
  padding: 0px;
  display: flex;
  flex-direction: column;
  min-width: 250px;
  width: 400px;
  max-width: 100%;
  .center {
    margin: auto;
  }
  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const Header = styled.div`
  text-align: left;
  padding: 0.5em 0 0.5em;
  font-weight: 500;
  font-size: 1.5em;
  line-height: 100%;
  bold {
    font-weight: 700;
  }
  p {
    font-size: 15px;
    margin: 5px 0;
    span {
      text-decoration: underline;
      cursor: pointer;
    }
  }
  &.popup {
    text-align: center;
  }

  b {
    font-weight: 700;
  }

  @media (max-width: 768px) {
    &.popup {
      position: sticky;
      padding: 1em 0 1em;
    }

    font-size: 18px;
    top: 0;
    background: white;
    z-index: 1;
    border-bottom: 1px solid rgb(224, 224, 227);
  }
`;
export const TicketBox = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
`;
const IDCardLayer = styled.div`
  display: flex;
  position: absolute;
  top: ${(props) => props.top || "auto"};
  bottom: ${(props) => props.bottom || "auto"};
  font-size: ${(props) => props.xfontSize || "inherit"};
  left: ${(props) => props.left || "auto"};
  right: ${(props) => props.right || "auto"};
  align-items: ${(props) => (props.align === "center" ? "center" : "auto")};
  text-align: ${(props) => (props.align === "center" ? "center" : "auto")};
  justify-content: ${(props) => (props.align === "center" ? "center" : "auto")};
  font-weight: ${(props) => props.xfontWeight || "normal"};
  &.BackgroundImage {
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  &.BackgroundGradient {
  }
  &.Text {
  }
  &.Image {
  }
  &.Qr {
    svg {
      position: absolute;
      height: 60px;
      width: 60px;
      background: white;
      border: 0px solid white;
      border-radius: 0px;
    }
  }
`;
export const IDCard = styled.div`
  display: flex;
  position: relative;
`;
const TicketButton = styled.button`
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  text-align: left;
  padding: 10px;
  background-color: white;
  border: 1px solid;
  box-shadow: 0px 5px 15px 0px rgba(0, 0, 0, 0.1);
  gap: 5px;
  display: flex;
  flex-direction: column;
  div:first-child {
    font-weight: bold;
  }
  div {
    display: flex;
    gap: 5px;
    align-items: center;
  }
  &:hover {
    transform: scale(1.02);
    cursor: pointer;
    transition:
      opacity 1s ease,
      transform 1s ease;
  }
`;
const Ticket = ({ handleResend, handleSubmit, theme }) => {
  const [user] = useState(JSON.parse(localStorage.getItem("--token")) ?? null);
  const [tickets, setTickets] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [booked, setBooked] = useState(false);
  const [bookedData, setBookedData] = useState({});
  const [greeting, setGreeting] = useState("");
  const [loading, setLoading] = useState(false);
  const [parameters, setParameters] = useState(null);
  const [isOpen, setIsOpen] = useState(null);
  const closeEdit = () => {
    setIsOpen(null);
  };
  useEffect(() => {
    const getTickets = async () => {
      const data = { token: user.token, userid: user.u };
      setLoading(true);
      const response = await postData(data, "authentication/tickets");
      if (response.status === 200) {
        setTickets(response.data.response);
        setBookedData(null);
      } else if (response.status === 400) {
        setTickets(null);
        setBooked(true);
        setTicket(null);
        setGreeting(response.data.onsuccessfullMessage ?? "Congratulations!");
        setBookedData(response.data);
        // setBarcodeComponent(

        // );
      } else if (response.status === 401) {
        localStorage.clear();
        window.location.reload();
      }
      setLoading(false);
    };
    if (user && !tickets) {
      getTickets();
    }
  }, [user, tickets]);
  const formatDate = (date) => {
    return moment(date).format("D-MMM-YY hh :mm A");
  };
  const componentRef = useRef(null);

  const downloadPDF = () => {
    htmlToImage.toPng(componentRef.current).then((dataUrl) => {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `IDCARD.png`;
      link.click();
    });
  };

  return (
    user && (
      <FormBox
        onSubmit={(event) => {
          event.preventDefault();
          // alert("yes");
        }}
        action="#"
        method="POST"
        className={`plain`}
      >
        <Header>
          <bold>Hi {user.fullName},</bold> <br />
          {!booked &&
            (ticket ? (
              <p>
                <span onClick={() => setTicket(null)}>
                  <GetIcon icon={"edit"}></GetIcon> Change Ticket
                </span>
              </p>
            ) : (
              <p>Please book your seat ASAP!</p>
            ))}
        </Header>
        <TicketBox>
          {!ticket ? (
            tickets?.length > 0 ? (
              tickets?.map((item) => {
                return (
                  <TicketButton
                    key={item._id}
                    onClick={async () => {
                      const response = await postData({ token: user.token, userid: user.u, ticket: item._id }, "authentication/ticket-data");
                      if (response.status === 200) {
                        setTicket(item);
                        setBooked(false);
                        setParameters(response.data.response);
                        setIsOpen({
                          submitHandler: async (post) => {
                            setLoading(true);
                            const data = { ...post, token: user.token, userid: user.u, ticket: item._id };
                            const response = await postData(data, "authentication/ticket-form-data");
                            if (response.status === 200) {
                              console.log(response);
                              setBooked(true);
                              setGreeting(response.data.response.onsuccessfullMessage ?? "Congratulations!");
                              setBookedData(response.data.response);
                            } else if (response.status === 400) {
                              setTickets(null);
                              setBooked(true);
                              setTicket(null);
                              setGreeting(response.customMessage + "<br/>" + (response.data.onsuccessfullMessage || "Congratulations!"));
                              setBookedData(response.data);
                            } else {
                            }
                            setLoading(false);
                          },
                          submit: "Register Now",
                          api: "authentication/ticket-form-data",
                          header: `Register for ${item.title}`,
                          description: "",
                        });
                      } else if (response.status === 400) {
                        setBooked(true);
                        setTicket(item);
                        setGreeting(response.customMessage ?? "Congratulations!");
                      }
                    }}
                  >
                    <div style={{ fontSize: "18px" }}>{item.title}</div>
                    <div>
                      <GetIcon icon={"location"}></GetIcon>
                      <span> {item.venue}</span>
                    </div>
                    <div style={{ fontSize: "13px" }}>
                      <GetIcon icon={"time"}></GetIcon>
                      <span>
                        {formatDate(item.startDate)} - {formatDate(item.endDate)}
                      </span>
                    </div>
                  </TicketButton>
                );
              })
            ) : !booked ? (
              <div>No tickets found!</div>
            ) : null
          ) : null}
        </TicketBox>
        {ticket &&
          !booked &&
          (parameters.length > 0 ? (
            <AutoForm
              useCaptcha={isOpen.useCaptcha}
              useCheckbox={false}
              customClass={isOpen.customClass ?? ""}
              description={isOpen.description}
              formValues={{}}
              formMode={isOpen.customClass ?? ""}
              key={isOpen.header}
              formType={"post"}
              header={isOpen.header}
              formInput={parameters}
              submitHandler={isOpen.submitHandler}
              button={isOpen.submit}
              isOpenHandler={(value) => {
                closeEdit(value);
              }}
              css="plain"
              isOpen={true}
              plainForm={true}
            ></AutoForm>
          ) : (
            <FormInput onChange={isOpen.submitHandler} value={"Register Now"} type="submit"></FormInput>
          ))}
        <TicketBox style={{ paddingTop: "10px" }}>
          <div>{greeting}</div>
          {/* <div>{JSON.stringify(bookedData)}</div> */}
          {bookedData && (
            <React.Fragment>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 0, marginTop: 20 }}>
                <IDCard
                  ref={componentRef}
                  style={{
                    width: "300px",
                    height: "390px",
                  }}
                >
                  <React.Fragment>
                    {bookedData?.idCardData?.map((layer, index) => {
                      switch (layer.layerType) {
                        case "BackgroundImage":
                          return (
                            <IDCardLayer className="BackgroundImage" top={"0px"} left={"0px"} bottom={"0px"} right={"0px"}>
                              <img src={bookedData.venue === "MSP Ground. Malappuram" ? malappuram : calicut} alt="BG"></img>
                            </IDCardLayer>
                          );
                        case "Text":
                          return (
                            <IDCardLayer
                              xfontSize={layer.fontSize}
                              xfontWeight={layer.fontStyle}
                              key={index}
                              className="Text"
                              top={layer.top}
                              left={layer.left}
                              bottom={layer.bottom}
                              right={layer.right}
                              align={layer.align}
                            >
                              {bookedData[layer.source]}
                            </IDCardLayer>
                          );
                        case "Qr":
                          return (
                            <IDCardLayer key={index} className="Qr" top={layer.top} left={layer.left} bottom={layer.bottom} right={layer.right} align={layer.align}>
                              <QRCode value={bookedData["registrationId"]} />
                            </IDCardLayer>
                          );
                        // Add more cases for other types of layers if needed
                        default:
                          return null; // Or you can render a default component or handle the case as needed
                      }
                    })}
                  </React.Fragment>
                </IDCard>
              </div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 10, marginTop: 10 }}>
                <Button
                  onClick={downloadPDF}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: theme.themeColor,
                    color: theme.themeTextColor,
                    outline: "none",
                    borderRadius: 5,
                    margin: "20px 0px 0px 0px",
                  }}
                >
                  Download ID Card
                </Button>
              </div>
            </React.Fragment>
          )}
        </TicketBox>
        {loading && <Loader></Loader>}
      </FormBox>
    )
  );
};

export default Ticket;
