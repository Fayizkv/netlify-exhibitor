import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { GetIcon } from "../../../../../../icons";
import { postData } from "../../../../../../backend/api";
import AutoForm from "../../../../../core/autoform/AutoForm";
import PopupView from "../../../../../core/popupview";

const PageWrapper = styled.div`
  position: fixed;
  z-index: 1001;
  top: 0;
  right: 0;
  background: white;
  left: 0;
  bottom: 0;
  overflow: auto;
  background-image: repeating-radial-gradient(circle at 0 0, transparent 0, #e5e5f7 6px), repeating-linear-gradient(#b4b4b455, #b4b4b4);
  &.Horizontal {
    display: flex;
    flex-direction: column-reverse;
    height: 100vh;
    @media (max-width: 768px) {
      height: auto;
      overflow: auto;
    }
  }
`;

const Banner = styled.div`
  width: 100%;
  height: 250px;
  background-color: #f5f7fa;
  display: flex;
  justify-content: center;
  position: relative;
  overflow: hidden;
  img {
    align-items: center;
    object-fit: cover;
    object-position: top;
    z-index: 0;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    width: 100%;
  }
  div {
    background: linear-gradient(to top, rgb(0, 0, 0), rgba(0, 0, 0, 0)) center center / cover no-repeat;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    right: 0;
    bottom: 0;
    width: 100%;
  }
  &.Horizontal {
    width: 50%;
    right: 0px;
    left: auto;
    height: 100vh;
    position: inherit;
    div {
      background: transparent;
    }
    img {
      height: 100%;
      border-radius: 0;
    }
  }
  @media (max-width: 768px) {
    img {
      position: inherit;
    }
    &.Horizontal {
      width: 100%;
    }
  }
`;
const Content = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: auto;
  margin-top: -50px;
  position: relative;
  z-index: 3;
  &.Horizontal {
    width: 50%;
    margin: auto auto auto 0;
    position: initial;
    /* height: 100vh; */
    overflow: auto;
    display: flex;
    align-self: center;
  }
  @media (max-width: 768px) {
    &.Horizontal {
      width: 100%;
      height: auto;
      overflow: hidden;
    }
  }
`;
const Header = styled.div`
  padding: 0px 20px 0px;
  background: ${(props) => props.event?.themeColor};
  color: ${(props) => props.event?.themeTextColor};
  align-items: center;
  display: flex;
  color: white;
  border-radius: 11px 11px 0px 0px;
  height: 50px;
  font-size: 16px;
  gap: 10px;
  align-items: center;
  h2 {
    margin: 0;
    font-size: 18px;
    color: white;
  }
  div {
    cursor: pointer;
    align-items: center;
    display: flex;
    gap: 5px;
  }
  @media screen and (max-width: 768px) {
    height: auto;
    padding: 10px 20px;
    h2 {
      font-size: 15px;
    }
  }
`;
const CenteredDiv = styled.div`
  width: fit-content;
  max-width: 600px; /* Adjust as needed */
  padding: 0px;
  background-color: #ffffff;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: auto;
  border-radius: 12px;
  margin: auto;
  @media screen and (max-width: 768px) {
    width: 100%;
    max-width: 100%;
  }
`;
const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: baseline;
  width: 40%;
  margin-bottom: 60px;
  margin-top: 60px;
  justify-content: center;
  max-width: 1200px;
  width: 100%;
  margin: auto;
  position: relative;
  padding-bottom: 10px;

  img {
    max-width: 100%;
  }
  &.embed {
    margin: 0px auto;
    padding: 10px 25px 25px;
    width: 400px;
    &.Horizontal {
      max-height: 95vh;
      align-items: flex-start;
      justify-content: flex-start;
      overflow: auto;
    }
  }
  @media screen and (max-width: 1200px) and (min-width: 768px) {
    max-width: 768px;
  }
  @media screen and (max-width: 768px) {
    flex: 1 1 100%;
    width: auto;
    padding: 10px;
    margin: 0px auto;
    &.embed {
      margin: 0px auto;
      padding: 10px 25px 25px;
      width: 100%;
      &.Horizontal {
        /* max-height: inherit;
        min-height: auto !important;
        overflow: auto;
        display: flex;
        justify-content: flex-start; */
        max-height: 90vh;
      }
    }
  }
`;
const ErrorMessage = styled.div`
  margin: 5px 10px 0px;
  color: rgb(254, 123, 123);
  font-size: 12px;
  width: 100%;
  border-top: 1px solid lightgrey;
  text-align: center;
  padding: 10px;
`;
const Message = styled.div`
  margin: 10px 0 0 0;
  font-size: 16px;
  width: 100%;
  text-align: left;
  padding: 0;
`;
const TicketDraw = ({ setLoaderBox, event, registserHandler }) => {
  const [userRegistered, setUserRegistered] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [input, setInput] = useState(null);
  const [formId, setFormId] = useState(0);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const getTicket = async () => {
      const country = event.countries[0];
      const regForm = [
        {
          type: "text",
          placeholder: "Type Your Name",
          name: "firstName",
          validation: "",
          default: "",
          label: "Type Your Name",
          minimum: 3,
          maximum: 40,
          required: true,
          add: true,
        },
        {
          type: "select",
          placeholder: "Emirates",
          name: "yourPlace",
          customClass: "full",
          validation: "",
          default: "",
          label: "Emirates",
          minimum: 0,
          maximum: 50,
          required: true,
          apiType: "CSV",
          selectApi: "Dubai,Sharjah,Abu Dhabi,Ajman,Fujairah,Ras Al khaimah,Umm Al Quwain",
          add: true,
        },
        {
          type: "mobilenumber",
          placeholder: `Contact Number`,
          name: "contactNumber",
          validation: "mobileNumber",
          info: "This number will be your unique indentification number",
          default: "",
          label: `Contact Number`,
          minimum: 0,
          countries: event.countries,
          required: true,
          add: true,
        },
        {
          type: "email",
          placeholder: "Email ID",
          name: "emailId",
          customClass: "full",
          validation: "email",
          info: "We will use this Email-ID for further email communication!",
          default: "",
          label: "Email ID",
          minimum: 0,
          maximum: 50,
          required: event.collectEmailId ? true : false,
          add: true,
        },
        {
          type: "info",
          content: "Provide your Qticket confirmation code or physical ticket number in the box below.",
          name: "qTicketNumber",
          customClass: "full",
          required: false,
          add: true,
        },
        {
          type: "text",
          placeholder: "Ticket No. / Confirmation Code",
          name: "qTicketNumber",
          customClass: "full",
          validation: "",
          default: "",
          label: "Ticket No. / Confirmation Code",
          minimum: 5,
          maximum: 50,
          required: true,
          add: true,
        },
        {
          type: "html",
          content: (
            <div>
              By submitting this form you are agreeing
              <span
                // style={{ color: "green", cursor: "pointer" }}
                onClick={() => setShowTerms(false)}
              >
                Rules and Regulations.
              </span>
            </div>
          ),
          name: "agrement",
          customClass: "full",
          validation: "qt",
          default: "",
          label: "Your Qtickets Ticket Confirmation Code",
          minimum: 5,
          maximum: 50,
          required: false,
          add: true,
        },

        {
          type: "hidden",
          placeholder: "PhoneNumberLength",
          name: "PhoneNumberLength",
          validation: "",
          default: country.PhoneNumberLength,
          label: "PhoneNumberLength",
          minimum: 1,
          maximum: 40,
          required: false,
          add: true,
        },
        {
          type: "hidden",
          placeholder: "phoneCode",
          name: "phoneCode",
          default: country.phoneCode,
          validation: "",
          label: "phoneCode",
          minimum: 1,
          maximum: 40,
          required: false,
          add: true,
        },
      ];
      setInput(regForm);
      setFormId((formId) => formId + 1);
    };
    getTicket();
  }, [event.loginPage, event.countries, event.collectEmailId]);

  const isCreatingHandler = (value, callback) => {};
  const submitChange = async (temppost) => {
    setLoaderBox(true);
    const postDataTemp = { event: event._id, franchise: event.franchise._id, ...temppost };
    await postData(postDataTemp, "authentication/luckydraw").then((res) => {
      if (res.status === 200) {
        setUserRegistered(true);
        setMessage(res.data.response.onsuccessfullMessage);
      } else if (res.status === 400) {
        setMessage(res.customMessage);
      }
      setLoaderBox(false);
    });
  };

  return (
    <PageWrapper className={`${event.loginPage}`} event={event}>
      <Banner className={`${event.loginPage}`}>
        <img src={import.meta.env.VITE_CDN + event.regBanner} alt="frame" />
        <div></div>
      </Banner>
      <Content className={`${event.loginPage}`}>
        <CenteredDiv>
          <Header event={event}>
            <div onClick={() => registserHandler()}>
              <GetIcon icon={"previous"}></GetIcon>
            </div>
            <h2>{input ? "Back to Home" : "Form is Loading.."}</h2>
          </Header>

          {userRegistered ? (
            <FormContainer className={`${event.loginPage}  embed`}>
              <Message dangerouslySetInnerHTML={{ __html: message }}></Message>
            </FormContainer>
          ) : (
            input && (
              <FormContainer className={`${event.loginPage}  embed`}>
                {!userRegistered && input?.length > 0 && (
                  <AutoForm
                    useCaptcha={false}
                    key={`type-${formId}`}
                    useCheckbox={false}
                    customClass={"embed"}
                    description={""}
                    formValues={{}}
                    formMode={"single"}
                    formType={"post"}
                    header={`Win A Car,<br><bold>Registration</bold>`}
                    formInput={input}
                    submitHandler={submitChange}
                    button={"Register Now"}
                    isOpenHandler={isCreatingHandler}
                    css="plain embed"
                    isOpen={true}
                    plainForm={true}
                  ></AutoForm>
                )}
                {!userRegistered && message?.length > 0 && <ErrorMessage>{message}</ErrorMessage>}
                {userRegistered && message?.length > 0 && <Message>{message}</Message>}
              </FormContainer>
            )
          )}
        </CenteredDiv>
      </Content>

      {showTerms && (
        <PopupView
          // Popup data is a JSX element which is binding to the Popup Data Area like HOC
          popupData={
            <div style={{ padding: "15px 25px" }}>
              <div class="section">
                <div class="section-title">Eligibility</div>
                <ul>
                  <li>
                    <strong>Event Participation:</strong> Only individuals who purchase a ticket for COME ON KERALA 2024 are eligible to enter the raffle draw.
                  </li>
                  <li>
                    <strong>Residency Requirement:</strong> The raffle is open to residents of India & UAE.
                  </li>
                  <li>
                    <strong>Age Restriction:</strong> Participants must be at least 18 years old to enter the raffle draw.
                  </li>
                </ul>
              </div>

              <div class="section">
                <div class="section-title">Entry Process</div>
                <ul>
                  <li>
                    <strong>Ticket Purchase:</strong> Purchase a ticket for the event.
                  </li>
                  <li>
                    <strong>Entry Form:</strong> Enter the QTicket Confirmation Code. If you have the hard copy ticket, kindly enter the ticket number printed on the ticket.
                  </li>
                  <li>Complete the raffle entry form by entering Name, Email & Contact Number and submit.</li>
                  <li>
                    <strong>One Entry per Ticket:</strong> Each ticket grants one entry into the raffle draw. Multiple entries per person are allowed if multiple tickets are purchased.
                  </li>
                </ul>
              </div>

              <div class="section">
                <div class="section-title">Draw and Prize Details</div>
                <ul>
                  <li>
                    <strong>Prize:</strong> The prize for the raffle draw is a car, which will be available to the winner in Kerala, India.
                  </li>
                  <li>
                    <strong>Draw Date:</strong> The raffle draw will take place on 9th June 2024 at Sharjah Expo Center, Sharjah, UAE.
                  </li>
                  <li>
                    <strong>Winner Announcement:</strong> The winner will be announced at the event.
                  </li>
                  <li>
                    <strong>Presence Requirement:</strong> The winner should be physically present during the announcement of the raffle. If the winner is not present at that time, the next winner
                    will be selected by running a new raffle at the same time.
                  </li>
                </ul>
              </div>

              <div class="section">
                <div class="section-title">Terms and Conditions</div>
                <ul>
                  <li>
                    <strong>Non-transferable:</strong> The raffle entry and the prize are non-transferable and cannot be exchanged for cash or other items.
                  </li>
                  <li>
                    <strong>Documentation:</strong> The winner must provide valid identification and proof of ticket purchase to claim the prize.
                  </li>
                  <li>
                    <strong>Tax and Duties:</strong> Any taxes, duties, or additional costs associated with receiving the prize in Kerala will be the responsibility of the winner.
                  </li>
                  <li>
                    <strong>Compliance:</strong> By entering the raffle, participants agree to comply with these rules and the decisions of the organizers, which are final and binding in all respects.
                  </li>
                </ul>
              </div>

              <div class="section">
                <div class="section-title">Disqualification</div>
                <ul>
                  <li>
                    <strong>False Information:</strong> Providing false information on the entry form will result in disqualification.
                  </li>
                  <li>
                    <strong>Multiple Entries:</strong> Providing multiple entries with the same ticket number will result in automatic disqualification by the system.
                  </li>
                  <li>
                    <strong>Failure to Claim:</strong> If the winner does not claim the prize within 10 days of the announcement, a new winner will be selected by an online draw.
                  </li>
                </ul>
              </div>

              <div class="section">
                <div class="section-title">General</div>
                <ul>
                  <li>
                    <strong>Organizer Rights:</strong> The event organizers reserve the right to amend these rules or cancel the raffle at any time without prior notice.
                  </li>
                  <li>
                    <strong>Publicity:</strong> The winner agrees to the use of their name and image for promotional purposes without additional compensation.
                  </li>
                </ul>
              </div>
            </div>
          }
          themeColors={event}
          closeModal={(e) => {
            setShowTerms(false);
          }}
          itemTitle={{ name: "title", type: "text", collection: "" }}
          openData={{ data: { _id: "", title: "Raffle Draw - Rules and Regulations" } }} // Pass selected item data to the popup for setting the time and taking menu id and other required data from the list item
          customClass={"medium iframe"}
        ></PopupView>
      )}
    </PageWrapper>
  );
};

export default TicketDraw;
