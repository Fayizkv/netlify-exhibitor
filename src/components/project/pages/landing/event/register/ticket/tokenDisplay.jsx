import { useState } from "react";
import styled from "styled-components";
import AutoForm from "../../../../../../core/autoform/AutoForm";
import { postData } from "../../../../../../../backend/api";
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
  max-width: 800px; /* Adjust as needed */
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
    &.double {
      width: 650px;
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
export default function TokenDisplay({ event, setLoaderBox }) {
  const [regForm] = useState([
    {
      type: "text",
      placeholder: `Registration No`,
      name: "registrationNo",
      validation: "",
      info: "This number will be your unique indentification number",
      default: "",
      label: `Registration No`,
      minimum: 0,
      countries: event.countries,
      required: true,
      add: true,
    },
  ]);

  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");

  const isCreatingHandler = (value, callback) => {};
  const submitChange = async (temppost) => {
    setLoaderBox(true);
    const postDataTemp = {
      event: event._id,
      ...temppost,
    };
    await postData(postDataTemp, "ticket-registration/token").then((res) => {
      console.log({ res });
      if (res.status === 200) {
        // setUserRegistered(true);
        setMessage(res.data.message);
        setToken(res.data.token);
        setName(res.data.ticketReg.authentication.fullName);
        setGrade(res.data.ticketReg.formData.grade);
      } else if (res.status === 400 || res.status === 500 || res.status === 404) {
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
            <h2>{regForm ? "Token Registration" : "Form is Loading.."}</h2>{" "}
          </Header>

          <FormContainer className={`${event.loginPage}  embed single`}>
            {message?.length > 0 && token ? (
              <Message
                style={{
                  border: "1px solid #ccc",
                  padding: "16px",
                  borderRadius: "8px",
                  maxWidth: "400px",
                  margin: "0 auto",
                }}
              >
                <p>
                  Name: <b>{name}</b>
                </p>
                <p>
                  Grade: <b>{grade}</b>
                </p>
                <p style={{ fontSize: "24px", fontWeight: "bold" }}>Token: {token}</p>
                <div style={{ fontWeight: "lighter" }}>{message}</div>
              </Message>
            ) : (
              <AutoForm
                useCaptcha={false}
                key={`type-${0}`}
                useCheckbox={false}
                customClass={"embed"}
                description={""}
                formValues={{}}
                formMode={"single"}
                formType={"post"}
                header={`Get Token,<br><bold>${event.title}</bold>`}
                formInput={regForm}
                submitHandler={submitChange}
                button={"Register Now"}
                isOpenHandler={isCreatingHandler}
                css="plain embed"
                isOpen={true}
                plainForm={true}
              ></AutoForm>
            )}
            {message?.length > 0 && !token && <ErrorMessage>{message}</ErrorMessage>}
          </FormContainer>
        </CenteredDiv>
      </Content>
    </PageWrapper>
  );
}
