import React, { useEffect, useState } from "react";
import styled from "styled-components";
// import AutoForm from "../../../../../core/form";
import { useTranslation } from "react-i18next";
import { GetIcon } from "../../../../../../icons";
import OTPForm from "./otp";
import { postData } from "../../../../../../backend/api";
import Loader from "../../../../../core/loader";
import Ticket from "./ticket";
import AutoForm from "../../../../../core/autoform/AutoForm";
import { useLocation, useNavigate } from "react-router-dom";

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
const LoginTypeButton = styled.div`
  display: flex;
  border-top: 1px solid lightgray;
  padding-top: 10px;
  width: 100%;
  text-align: center;
  justify-content: center;
  font-size: 18px;
  span {
    color: ${(props) => props.event?.themeColor};
    margin-left: 5px;
    cursor: pointer;
    font-weight: bold;
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
    margin: 0px;
    position: initial;
    margin-top: 100px;
    height: 100vh;
    margin-bottom: auto;
    overflow: auto;
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
  margin-bottom: 40px;
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
      max-height: 68vh;
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
        max-height: 78vh;
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
const Register = ({ setLoaderBox, event, registserHandler, item }) => {
  const { t } = useTranslation();
  const [otpSent, setOTPSent] = useState(false);
  const [post, setPost] = useState(null);
  const [userRegistered, setUserRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUsers] = useState(JSON.parse(localStorage.getItem("--token")) ?? null);
  const [authenticationId, setAuthenticationId] = useState("");
  const [error, setError] = useState(false);
  const [country, setCountry] = useState(event.countries[0] ?? null);
  const [input, setInput] = useState(null);
  const [formId, setFormId] = useState(0);
  const [isLogin, setIsLogin] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    console.log(country);
    const loginForm = [
      {
        type: "mobilenumber",
        placeholder: `WhatsApp Number`,
        name: "authenticationId",
        validation: "mobileNumber",
        info: "This number will be your unique indentification number",
        default: "",
        label: `Digit WhatsApp Number`,
        minimum: 0,
        countries: event.countries,
        required: true,
        add: true,
      },
    ];
    const regForm =
      event.loginPage === "Vertical"
        ? [
            {
              type: "text",
              placeholder: "First Name",
              name: "firstName",
              validation: "name",
              default: "",
              label: "First Name",
              minimum: 3,
              maximum: 40,
              required: true,
              add: true,
            },
            {
              type: "text",
              placeholder: "Last Name",
              name: "lastName",
              validation: "name",
              default: "",
              label: "Last Name",
              minimum: 1,
              maximum: 40,
              required: true,
              add: true,
            },
            {
              type: "number",
              placeholder: `${country.PhoneNumberLength} Digit WhatsApp Number (Without +${country.phoneCode})`,
              name: "authenticationId",
              validation: "phoneNumber",
              info: "Enter an active whatsapp number to receive authenication OTP",
              default: "",
              label: `${country.PhoneNumberLength} Digit WhatsApp Number (Without +${country.phoneCode})`,
              minimum: 0,
              maximum: country.PhoneNumberLength,
              country: country.title,
              required: true,
              add: true,
            },
          ]
        : [
            {
              type: "text",
              placeholder: "Your Name",
              name: "firstName",
              validation: "name",
              default: "",
              label: "Your Name",
              minimum: 3,
              maximum: 40,
              required: true,
              add: true,
            },
            {
              type: "hidden",
              placeholder: "Last Name",
              name: "lastName",
              validation: "name",
              default: "",
              label: "Last Name",
              minimum: 1,
              maximum: 40,
              required: false,
              add: true,
            },
            {
              type: "mobilenumber",
              placeholder: `WhatsApp Number`,
              name: "authenticationId",
              validation: "mobileNumber",
              customClass: "full",
              info: "This number will be your unique indentification number",
              default: "",
              label: `Digit WhatsApp Number`,
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
          ];
    if (isLogin) {
      setInput(loginForm);
    } else {
      setInput(regForm);
    }
    setFormId((formId) => formId + 1);
  }, [country, event.loginPage, isLogin, event.collectEmailId, event.countries]);

  const isCreatingHandler = (value, callback) => {};
  const setIsLoading = (value) => {
    setLoading(value);
  };
  const loginType = (isLogin) => {
    setIsLogin(isLogin);
  };
  const location = useLocation();
  const navigate = useNavigate();
  const submitChange = async (temppost) => {
    setLoaderBox(true);
    const postDataTemp = { authenticationType: event.authenticationType, event: event._id, franchise: event.franchise._id, isLogin, ...temppost };
    postData(postDataTemp, "authentication/add").then((res) => {
      if (res.status === 200) {
        setPost(postDataTemp);
        setOTPSent(true);
        setAuthenticationId(temppost.authenticationId);
        localStorage.setItem("--reg", JSON.stringify({ e: event._id, u: res.data.user }));
      } else if (res.status === 400) {
        setMessage(res.customMessage);
      }
      setLoaderBox(false);
    });
  };
  const resendOtp = async () => {
    submitChange(post);
  };
  useEffect(() => {
    if (user?.token) {
      setUserRegistered(true);
    }
  }, [user]);
  const submitOtp = async (post) => {
    setLoaderBox(true);
    const data = JSON.parse(localStorage.getItem("--reg"));
    postData({ ...data, ...post }, "authentication/verify").then((res) => {
      if (res.status === 200) {
        if (res.data.success === true) {
          if (res.data.sessionToken) {
            localStorage.setItem("--token", JSON.stringify({ ...data, fullName: res.data.fullName, token: res.data.sessionToken, referenceNumber: res.data.referenceNumber }));
            if (event.homePage === "Sub Events") {
              console.log(location.pathname);
              if (location.pathname === "/events") {
                window.location.reload(); // Reload the page
              } else if (location.pathname === "/") {
                navigate("/events");
              } else {
                window.location.reload();
              }
            } else {
              setUsers({ ...data, fullName: res.data.fullName, token: res.data.sessionToken });
              setUserRegistered(true);
              setError("");
            }
          }
        } else {
          setLoaderBox(false);
          setError("You have entered an invalid OTP!");
        }
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
          {userRegistered ? (
            <Header event={event}>
              <div onClick={() => registserHandler()}>
                <GetIcon icon={"previous"}></GetIcon>
              </div>
              <h2>{user.fullName}</h2>
              <div
                style={{ marginLeft: "auto" }}
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
              >
                <GetIcon icon={"logout"}></GetIcon> Logout
              </div>
            </Header>
          ) : (
            <Header event={event}>
              <div onClick={() => registserHandler()}>
                <GetIcon icon={"previous"}></GetIcon>
              </div>
              <h2>Back to Home</h2>
            </Header>
          )}
          {userRegistered ? (
            <FormContainer className={`${event.loginPage}  embed`}>
              <Ticket theme={event} user={user}></Ticket>
            </FormContainer>
          ) : (
            country && (
              <FormContainer className={`${event.loginPage}  embed`}>
                {/* <h2>{item.title}</h2> */}
                <div>
                  {event.countries.length > 5 &&
                    event.countries.map((countryItem) => {
                      return (
                        <button
                          key={countryItem._id}
                          className={countryItem._id === country._id ? "active" : ""}
                          onClick={() => {
                            setCountry(countryItem);
                          }}
                        >
                          {countryItem.title}
                        </button>
                      );
                    })}
                </div>
                {input?.length > 0 && (
                  <AutoForm
                    useCaptcha={false}
                    key={`type-${isLogin}${formId}`}
                    useCheckbox={false}
                    customClass={"embed"}
                    description={""}
                    formValues={{}}
                    formMode={"double"}
                    formType={"post"}
                    header={t(
                      event.loginPage === "Vertical"
                        ? isLogin
                          ? "<bold>Login With OTP,</bold> Reserve Your Seat!"
                          : "<bold>Register Now,</bold> Manage Your Events!"
                        : isLogin
                          ? "<bold>Login With OTP,</bold> Manage Your Tickets!"
                          : "<bold>Register Now,</bold> Book Your Events!"
                    )}
                    formInput={input}
                    submitHandler={submitChange}
                    button={"Get OTP"}
                    isOpenHandler={isCreatingHandler}
                    css="plain embed"
                    isOpen={true}
                    plainForm={true}
                  ></AutoForm>
                )}
                {message?.length > 0 && <ErrorMessage>{message}</ErrorMessage>}
                {isLogin ? (
                  <LoginTypeButton event={event} onClick={() => loginType(false)}>
                    Don't have an account? <span>Sign Up</span>
                  </LoginTypeButton>
                ) : (
                  <LoginTypeButton event={event} onClick={() => loginType(true)}>
                    Already registered? <span>Login</span>
                  </LoginTypeButton>
                )}
                {/* <AutoForm useCaptcha={false} formType={"post"} description={t("")} header={t("<bold>Register Now,</bold></br> Reserve Your Seat!")} formInput={formInput} submitHandler={submitChange} button={t("Get OTP")} isOpenHandler={isCreatingHandler} isOpen={true} plainForm={true}></AutoForm> */}
                {otpSent && authenticationId && (
                  <OTPForm country={country} event={event} resendOtp={resendOtp} setIsLoading={setIsLoading} error={error} authenticationId={authenticationId} handleSubmit={submitOtp}></OTPForm>
                )}
              </FormContainer>
            )
          )}
        </CenteredDiv>
      </Content>
      {loading && <Loader></Loader>}
    </PageWrapper>
  );
};

export default Register;
