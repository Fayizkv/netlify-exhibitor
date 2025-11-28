import React from "react";
import { deleteData, postData } from "../../../../../../../backend/api";
import Register from "..";
import { useState } from "react";
import { GetIcon } from "../../../../../../../icons";
import PopupView from "../../../../../../core/popupview";
import FormInput from "../../../../../../core/input";
import styled from "styled-components";
import AutoForm from "../../../../../../core/autoform/AutoForm";
import { useEffect } from "react";
import DirectRegister from "../direct";
import { Footer } from "../../../../../../core/list/create/styles";
const DivTable = styled.div`
  width: 100%;
  button {
    background-color: ${(props) => props.event.secondaryColor};
    color: ${(props) => props.event.secondaryTextColor};
    outline: none;
    border: none;
    padding: 15px 20px;
    min-width: 100px;
    cursor: pointer;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    gap: 10px;
    border-radius: 9px;
  }
`;

const DivTableRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const DivTableHeader = styled.div`
  flex: 1;
  padding: 8px;
  font-weight: bold;
  @media (max-width: 768px) {
    display: none;
  }
`;

const IFrame = styled.iframe`
  width: -webkit-fill-available;
  min-height: 70vh;
  /* display: flex;
  height: 100vh;
 
  overflow: auto;
  position: fixed !important;
  z-index: 1001;
  left: auto;
  top: 10%;
  left: 20%;
  right: 20%;
  height: 80%;
  border: 0;
  border-radius: 12px; */
  @media (max-width: 768px) {
  }
`;
const DivTableCell = styled.div`
  flex: 1;
  padding: 8px;
  border-top: 1px solid #ddd;
  span {
    display: none;
    margin-right: 5px;
    color: gray;
  }
  @media (max-width: 768px) {
    display: flex;
    span {
      display: flex;
    }
  }
`;

export const EventRegister = ({ setLoaderBox, item, event, itemsList, setItemsList, userToken }) => {
  const [user, setUser] = useState(userToken);
  const [registering, setRegistering] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [booked, setBooked] = useState(false);
  const [buyTicket, setBuyTicket] = useState(false);
  const [bookedData, setBookedData] = useState({});
  const [parameters, setParameters] = useState(null);
  const [isOpen, setIsOpen] = useState(null);
  const [registrations, setRegistrations] = useState(null);
  useEffect(() => {
    setUser(userToken);
  }, [userToken]);

  const checkTicket = async (e) => {
    e.preventDefault();
    setLoaderBox(true);
    const response = await postData({ token: user.token, userid: user.u, ticket: item._id }, "authentication/ticket-data");
    if (response.status === 200) {
      setTicket(item);
      setBooked(false);
      setParameters([
        ...(response.data.response.length > 0 ? response.data.response : []),
        {
          type: "checkbox",
          placeholder: "Check this box to confirm you interest!",
          name: "confimation",
          validation: "true",
          default: null,
          tag: false,
          label: "Check this box to confirm you interest!",
          required: true,
          view: true,
          add: true,
          update: true,
        },
      ]);
      setIsOpen({
        submitHandler: async (post) => {
          setLoaderBox(true);
          const data = { ...post, token: user.token, userid: user.u, ticket: item._id };
          const response = await postData(data, "authentication/ticket-form-data");
          if (response.status === 200) {
            if (response.data.response.isMultipleEntry === false) {
              setTicket(null);
            }
            setBooked(true);
            // setGreeting(response.data.response.onsuccessfullMessage ?? "Congratulations!");
            setBookedData(response.data.response);

            // Find the item in itemsList that matches the ID of the item in response
            const currentItemIndex = itemsList.findIndex((newItem) => newItem._id === item._id);

            if (currentItemIndex !== -1) {
              itemsList[currentItemIndex].registered = true;
              // Check if the registrations array exists, if not, create it
              if (!itemsList[currentItemIndex].registrations) {
                itemsList[currentItemIndex].registrations = []; // Initialize registrations as an empty array
              }
              itemsList[currentItemIndex].registrations.push(response.data.ticketData);

              setItemsList([...itemsList]); // Update state
            } else {
              console.error("Item not found in itemsList");
            }

            setItemsList([...itemsList]);
          } else if (response.status === 400) {
            setBooked(true);
            setTicket(null);
            // setGreeting(response.customMessage + "<br/>" + response.data.onsuccessfullMessage ?? "Congratulations!");
            setBookedData(response.data);
          } else if (response.status === 401) {
            localStorage.clear();
            window.location.reload();
          }
          setLoaderBox(false);
        },
        submit: "Register Now",
        api: "authentication/ticket-form-data",
        header: `Register for ${item.title}`,
        description: "",
      });
    } else if (response.status === 401) {
      localStorage.clear();
      window.location.reload();
    } else if (response.status === 400) {
      setBooked(true);
      setTicket(item);
      // setGreeting(response.customMessage ?? "Congratulations!");
    }
    setLoaderBox(false);
  };
  //   return null;
  return (
    <React.Fragment>
      {item.registered ? (
        item.isMultipleEntry ? (
          <button
            className="action remove"
            onClick={async (e) => {
              e.preventDefault();
              setTicket(item);
              setRegistrations(item);
            }}
          >
            View Registrations <GetIcon icon={"open"} />
          </button>
        ) : (
          <button
            className="action remove"
            onClick={async (e) => {
              e.preventDefault();
              setLoaderBox(true);
              const response = await deleteData({ token: user.token, userid: user.u, ticket: item._id, registration: item.registrations[0]._id }, "authentication/ticket-form-data");
              if (response.status === 200) {
                const currentItemIndex = itemsList.findIndex((newitem) => newitem._id === item._id);
                const currentItemsIndex = itemsList[currentItemIndex].registrations.findIndex((newitem) => newitem._id === item.registrations[0]._id);
                if (currentItemsIndex !== -1) {
                  itemsList[currentItemIndex].registrations.splice(currentItemsIndex, 1);
                  if (itemsList[currentItemIndex].registrations.length === 0) {
                    itemsList[currentItemIndex].registered = false;
                  }
                  setItemsList([...itemsList]);
                }
                setLoaderBox(false);
              }
            }}
          >
            Unregister <GetIcon icon={"delete"} />
          </button>
        )
      ) : user ? (
        <button
          className="action"
          onClick={async (e) => {
            await checkTicket(e);
          }}
        >
          Register <GetIcon icon={"open"} />
        </button>
      ) : item.status === false ? (
        <button className="action" style={{ background: "lightgrey" }}>
          {item.status}Registration Closed
        </button>
      ) : (
        <button
          className="action"
          onClick={(e) => {
            e.preventDefault();
            if (item.enableDirectRegistration) {
              setRegistering(true);
            } else {
              setRegistering(true);
            }
          }}
        >
          Register <GetIcon icon={"open"} />
        </button>
      )}
      {bookedData && booked && (
        <PopupView
          // Popup data is a JSX element which is binding to the Popup Data Area like HOC
          popupData={
            <div style={{ padding: "25px" }}>
              <p>Thank you for registering the event!</p>
              {bookedData?.isMultipleEntry && (
                <Footer>
                  <FormInput
                    onChange={async (e) => {
                      await checkTicket(e);
                    }}
                    value={"Add Another"}
                    type="submit"
                  ></FormInput>
                </Footer>
              )}
              {user.referenceNumber?.length > 0 ? null : (
                <React.Fragment>
                  <p>If you have purchased a ticket, please enter your ticket number, or purchase one now!</p>
                  <Footer>
                    <FormInput
                      type="close"
                      value={"Add Q Ticket number"}
                      className={"red"}
                      onChange={() => {
                        setParameters([
                          {
                            type: "number",
                            placeholder: "Q Ticket Confirmation Number",
                            name: "referenceNumber",
                            customClass: "full",
                            validation: "qt",
                            info: "If you have purchased ticket, enter your Q Ticket Number",
                            default: "",
                            label: "Q Ticket Number",
                            minimum: 0,
                            maximum: 16,
                            required: false,
                            add: true,
                          },
                        ]);
                        setIsOpen({
                          submitHandler: async (post) => {
                            setLoaderBox(true);
                            const data = { ...post, token: user.token, userid: user.u };
                            const response = await postData(data, "authentication/update-reference");
                            if (response.status === 200) {
                              setBooked(false);
                              setTicket(null);
                              setBookedData(null);
                              localStorage.setItem("--token", JSON.stringify({ ...user, referenceNumber: post.referenceNumber }));
                              window.location.reload();
                            } else if (response.status === 401) {
                              window.location.reload();
                            }
                            setLoaderBox(false);
                          },
                          submit: "Save",
                          api: "authentication/update-reference",
                          header: `Add Your Q Ticket Number`,
                          description: "",
                        });
                        setTicket({});
                        setBooked(false);
                      }}
                    />
                    <FormInput
                      onChange={() => {
                        window.location.href = "https://events.q-tickets.com/uae/eventtickets/5960495144";
                        //navigate("/book-tickets");
                        //setBuyTicket(true);
                      }}
                      value={"Buy Tickets"}
                      type="submit"
                    ></FormInput>
                  </Footer>
                </React.Fragment>
              )}
            </div>
          }
          themeColors={event}
          closeModal={(e) => {
            setBookedData(null);
            setBooked(false);
            setTicket(null);
          }}
          itemTitle={{ name: "title", type: "text", collection: "" }}
          openData={{ data: { _id: "", title: "Registration Status!" } }} // Pass selected item data to the popup for setting the time and taking menu id and other required data from the list item
          customClass={"small"}
        ></PopupView>
      )}
      {registrations && ticket && (
        <PopupView
          // Popup data is a JSX element which is binding to the Popup Data Area like HOC
          popupData={
            <div style={{ padding: "25px" }}>
              <DivTable event={event}>
                <DivTableRow>
                  {registrations?.ticketformdatas?.map((head, index) => (
                    <DivTableHeader key={index}>{head.placeHolder}</DivTableHeader>
                  ))}
                  <DivTableHeader>Action</DivTableHeader>
                </DivTableRow>
                {registrations?.registrations?.map((entry, index) => (
                  <DivTableRow key={index}>
                    {registrations.ticketformdatas.map((head, index) => (
                      <DivTableCell key={index}>
                        <span>{head.label}: </span>
                        {entry[head.dbcollection][head.showItem]}
                      </DivTableCell>
                    ))}
                    <DivTableCell>
                      <button
                        className="remove"
                        onClick={async (e) => {
                          e.preventDefault();
                          setLoaderBox(true);
                          const response = await deleteData({ token: user.token, userid: user.u, registration: entry._id, ticket: item._id }, "authentication/ticket-form-data");
                          if (response.status === 200) {
                            const currentItemIndex = itemsList.findIndex((newitem) => newitem._id === ticket._id);
                            const currentItemsIndex = itemsList[currentItemIndex].registrations.findIndex((newitem) => newitem._id === entry._id);
                            if (currentItemsIndex !== -1) {
                              itemsList[currentItemIndex].registrations.splice(currentItemsIndex, 1);
                              if (itemsList[currentItemIndex].registrations.length === 0) {
                                itemsList[currentItemIndex].registered = false;
                              }
                              setItemsList([...itemsList]);
                            }
                            setLoaderBox(false);
                          } else if (response.status === 401) {
                            localStorage.clear();
                            window.location.reload();
                          }
                        }}
                      >
                        Unregister <GetIcon icon={"delete"} />
                      </button>
                    </DivTableCell>
                  </DivTableRow>
                ))}
              </DivTable>
              <Footer>
                <FormInput
                  onChange={async (e) => {
                    setBookedData(null);
                    setBooked(false);
                    setTicket(null);
                    setRegistrations(null);
                    await checkTicket(e);
                  }}
                  value={"Add Another"}
                  type="submit"
                ></FormInput>
              </Footer>
            </div>
          }
          themeColors={event}
          closeModal={(e) => {
            setRegistrations(null);
            setTicket(null);
          }}
          itemTitle={{ name: "title", type: "text", collection: "" }}
          openData={{ data: { _id: "", title: "Registered List of " + ticket?.title } }} // Pass selected item data to the popup for setting the time and taking menu id and other required data from the list item
          customClass={"medium"}
        ></PopupView>
      )}

      {!booked &&
        !registrations &&
        ticket &&
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
            isOpenHandler={() => {
              setTicket(null);
            }}
            css=""
            isOpen={true}
            plainForm={false}
          ></AutoForm>
        ) : (
          <FormInput onChange={isOpen.submitHandler} value={"Register Now"} type="submit"></FormInput>
        ))}
      {buyTicket && (
        <PopupView
          // Popup data is a JSX element which is binding to the Popup Data Area like HOC
          popupData={<IFrame title="QTicket" src="https://events.q-tickets.com/uae/eventtickets/5963350334?webview=true" frameborder="0" />}
          themeColors={event}
          closeModal={(e) => {
            setBuyTicket(false);
          }}
          itemTitle={{ name: "title", type: "text", collection: "" }}
          openData={{ data: { _id: "", title: "Buy Tickets" } }} // Pass selected item data to the popup for setting the time and taking menu id and other required data from the list item
          customClass={"medium"}
        ></PopupView>
      )}
      {registering && !item.enableDirectRegistration && (
        <Register
          setLoaderBox={setLoaderBox}
          registserHandler={(e) => {
            setRegistering(false);
            document.body.style.overflow = "";
            setUser(JSON.parse(localStorage.getItem("--token")) ?? null);
          }}
          event={event}
        />
      )}
      {registering && item.enableDirectRegistration && (
        <DirectRegister
          setLoaderBox={setLoaderBox}
          ticket={item}
          registserHandler={(e) => {
            setRegistering(false);
            document.body.style.overflow = "";
            setUser(JSON.parse(localStorage.getItem("--token")) ?? null);
          }}
          event={event}
        />
      )}
    </React.Fragment>
  );
};
