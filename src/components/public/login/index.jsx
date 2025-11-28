import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearLoginSession, fetchLogin } from "../../../store/actions/login";
import { GoogleLogin } from "@react-oauth/google";
import AutoForm from "../../core/autoform/AutoForm";
import OtpInput from "../signup/otp";
import { logo } from "../../../images";
import withLayout from "../layout";
import { ArrowLeft, Mail, MessageCircle } from "lucide-react";
import styled from "styled-components";
import { projectSettings, appTheme } from "../../project/brand/project";
import { postData, getData } from "../../../backend/api";
import { useToast } from "../../core/toast";
import { getCountries } from "../../project/pages/event/attributes/countries";

export const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.login);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const [error, setError] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loginData, setLoginData] = useState(null);
  const [eventId, setEventId] = useState(null);
  const [eventLogo, setEventLogo] = useState(logo);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [loginMethod, setLoginMethod] = useState("mobile"); // "mobile" or "email"

  useEffect(() => {
    document.title = `EventHex System`;
    
    // Fetch event ID from domain
    const fetchEventFromDomain = async () => {
      try {
        let hostname = window.location.hostname;
        
        // Use testing.eventhex.ai as fallback for localhost
        const domainToUse = hostname === "localhost" ? "69156d7320f887e7af37d6e8.eventhex.ai" : hostname;
        // const domainToUse = import.meta.env.VITE_API || hostname;
        const response = await getData({ domain: domainToUse }, "auth/domain-event");
        
        if (response.status === 200 && response.data?.success && response.data?.domainData?.event?._id) {
          const eventIdFromDomain = response.data.domainData.event._id;
          setEventId(eventIdFromDomain);
          
          // Get logo from event data
          if (response.data.domainData.event.logo) {
            const logoUrl = import.meta.env.VITE_CDN + response.data.domainData.event.logo;
            setEventLogo(logoUrl);
            // Save logo to localStorage
            localStorage.setItem("exhibitor:event:logo", logoUrl);
          }
          
          setIsLoadingEvent(false);
        } else {
          setIsLoadingEvent(false);
          setError("Unable to fetch event information. Please check the domain.");
        }
      } catch (error) {
        console.error("Error fetching event from domain:", error);
        setIsLoadingEvent(false);
        setError("Unable to fetch event information. Please check the domain.");
      }
    };

    fetchEventFromDomain();
  }, []);

  const [formInput] = useState([
    {
      type: "mobilenumber",
      placeholder: "Mobile",
      name: "authenticationId",
      validation: "",
      default: "",
      label: "Admin Mobile Number",
      icon: "mobilenumber",
      required: true,
      view: true,
      add: true,
      update: true,
      search: true,
      footnote: "By logging in, you agree to our security practices and notifications.",
      countries: getCountries(),
    },
  ]);

  const [emailFormInput] = useState([
    {
      type: "email",
      placeholder: "Email",
      name: "email",
      validation: "email",
      default: "",
      label: "Email Address",
      icon: "email",
      required: true,
      view: true,
      add: true,
      update: true,
      search: true,
      footnote: "By logging in, you agree to our security practices and notifications.",
    },
  ]);

  useEffect(() => {
    if (user.data?.token) {
      navigate(user.data?.menu[0]?.path ?? "dashboard");
    }
    if (user.error !== null) {
      dispatch(clearLoginSession());
    }
  }, [user, navigate, dispatch]);

  const submitChange = async (post) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Check if this is OTP verification (has otp field)
      if (post.otp && isOtpSent && loginData) {
        // Verify OTP for exhibitor login
        const verifyResponse = await postData(
          {
            ...(loginData.mobile && { mobile: loginData.mobile }),
            ...(loginData.email && { email: loginData.email }),
            otp: post.otp,
            event: loginData.event,
            ...(loginData.phoneCode && { phoneCode: loginData.phoneCode }),
          },
          "exhibitor/verify-otp"
        );
        
        if (verifyResponse.status === 200 && verifyResponse.data?.success) {
          setIsOtpSent(false);
          setLoginData(null);
          setError(null);
          dispatch(fetchLogin({}, verifyResponse));
          toast.success("Login successful!");
        } else {
          setIsSubmitting(false);
          setError(verifyResponse.data?.message || "Invalid OTP. Please try again.");
        }
        return;
      }

      // Extract mobile number and phone code from mobilenumber input format
      let mobile = null;
      let phoneCode = null;
      let email = null;

      // Handle email login
      if (loginMethod === "email" && post.email) {
        email = post.email;
      }
      // Handle mobile login
      else if (post.authenticationId) {
        // Handle mobilenumber input format: {number: "9562981771", country: 91, numberLength: 10}
        if (typeof post.authenticationId === 'object' && post.authenticationId.number) {
          mobile = post.authenticationId.number;
          // Prioritize post.phoneCode if available, otherwise use authenticationId.country
          phoneCode = post.phoneCode || post.authenticationId.country;
        } else if (typeof post.authenticationId === 'string') {
          // Fallback: if authenticationId is a string, use it as mobile
          mobile = post.authenticationId;
          phoneCode = post.phoneCode;
        }
      } else if (post.mobile) {
        // Handle old format with separate mobile and phoneCode fields
        mobile = post.mobile;
        phoneCode = post.phoneCode;
      }

      // Exhibitor login - send OTP (for both email and mobile)
      if (eventId && (email || (mobile && phoneCode))) {
        const loginPayload = {
          event: eventId,
        };
        
        if (email) {
          loginPayload.email = email;
        } else {
          loginPayload.mobile = mobile;
          loginPayload.phoneCode = phoneCode.toString();
        }

        const loginResponse = await postData(loginPayload, "exhibitor/login");

        if (loginResponse.status === 200 && loginResponse.data?.success) {
          setIsOtpSent(true);
          setLoginData({
            ...(email && { email }),
            ...(mobile && { mobile }),
            event: eventId,
            ...(phoneCode && { phoneCode: phoneCode.toString() }),
          });
          setError(null);
          toast.success(email ? "OTP sent to your email address" : "OTP sent to your mobile number");
          setIsSubmitting(false);
        } else {
          setIsSubmitting(false);
          setError(loginResponse.data?.message || "Failed to send OTP. Please try again.");
        }
        return;
      }

      // If event ID is not available, show error
      if (!eventId) {
        setIsSubmitting(false);
        setError("Event information not available. Please refresh the page.");
        return;
      }

      // If neither email nor mobile/phoneCode found, show error
      if (!email && (!mobile || !phoneCode)) {
        setIsSubmitting(false);
        setError(loginMethod === "email" ? "Please enter a valid email address." : "Please enter a valid mobile number.");
        return;
      }

      // Fallback to original auth/login if needed (for backward compatibility)
      const response = await postData(post, "auth/login");
      if (response.status === 200) {
        if (response.data.success) {
          setError(null);
          dispatch(fetchLogin(post, response));
        } else {
          setIsSubmitting(false);
          setError(response.data.message);
        }
      } else {
        setIsSubmitting(false);
        setError(response.data.message);
      }
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      if (!isOtpSent) {
        setIsSubmitting(false);
      }
    }
  };

  const onGoogleSuccess = async (data) => {
    if (data.credential) {
      dispatch(fetchLogin({ authenticationType: "google", credential: data.credential }));
    }
  };

  // Add Google Client ID validation
  const isValidGoogleClientId = useMemo(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    // Google Client ID pattern: numbers-letters.apps.googleusercontent.com
    const pattern = /^\d{12}-[a-z0-9]{32}\.apps\.googleusercontent\.com$/;
    return clientId && pattern.test(clientId);
  }, []);

  return (
    <PageContainer>
      <div className="min-h-screen bg-white flex flex-col">
        {/* <nav className="flex justify-between items-center p-6">
          <button onClick={() => (window.location.href = "https://eventhex.ai")} className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Website
          </button>
        </nav> */}

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-[440px]">
            <div className="bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.04)] border border-gray-100 p-6">
              <div className="w-full">
                <div className="mb-6 border-b border-gray-200 pb-4 flex flex-col gap-4 items-center justify-center">
                  <img src={eventLogo} alt="event-logo" className="h-8" />
                  <p className="text-xl font-semibold text-gray">Log in to your Exhibitor Account.</p>
                </div>
                {isLoadingEvent && (
                  <div className="text-center text-sm text-gray-500 mb-4">Loading event information...</div>
                )}
                {error && <div className="text-red-500 text-sm mb-2 border border-red-500 rounded-md p-2 mb-4">{error}</div>}
                {isOtpSent ? (
                  <OtpInput
                    length={4}
                    data={loginData}
                    onSubmit={(otp) => {
                      submitChange({ ...loginData, otp });
                    }}
                    onResend={() => {
                      submitChange({ ...loginData });
                    }}
                  />
                ) : (
                  <>
                    <AutoForm
                      key={`login-form-${loginMethod}`}
                      useCaptcha={false}
                      formType="post"
                      header=""
                      description=""
                      formValues={{}}
                      formInput={loginMethod === "email" ? emailFormInput : formInput}
                      submitHandler={submitChange}
                      button={isSubmitting ? "Sending OTP..." : "Send OTP"}
                      isOpen={true}
                      css="plain embed head-hide landing"
                      plainForm={true}
                      customClass="embed"
                      disabled={isSubmitting || isLoadingEvent || !eventId}
                    />
                    
                    {/* Separator */}
                    <div className="relative w-full text-center my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative">
                        <span className="px-4 text-sm text-gray-500 bg-white">or</span>
                      </div>
                    </div>
                    
                    {/* Continue with Email/Mobile Button */}
                    <button
                      onClick={() => setLoginMethod(loginMethod === "mobile" ? "email" : "mobile")}
                      className="w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      disabled={isSubmitting || isLoadingEvent}
                    >
                      {loginMethod === "mobile" ? (
                        <>
                          <Mail className="w-5 h-5" />
                          Continue with Email
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-5 h-5" />
                          Continue with Mobile
                        </>
                      )}
                    </button>
                  </>
                )}
                {/* Hide Google login for exhibitor OTP login */}
                {false && isValidGoogleClientId && (
                  <React.Fragment>
                    <div className="relative w-full text-center my-2 mb-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative">
                        <span className="px-4 text-sm text-gray-500 bg-white">or</span>
                      </div>
                    </div>
                    <div className="w-full flex justify-center">
                      <GoogleLogin
                        onSuccess={onGoogleSuccess}
                        onError={() => console.log("Login Failed")}
                        useOneTap
                        type="standard"
                        size="large"
                        shape="rectangular"
                        width="100%"
                        text="continue_with"
                      />
                    </div>
                  </React.Fragment>
                )}
                {/* <div className="text-center mt-6">
                  <button className="text-sm font-medium text-primary-base hover:text-primary-dark transition-colors" onClick={() => navigate("/sign-up")}>
                    Don't have an account? Sign up
                  </button>
                </div> */}
              </div>
            </div>
          </div>
        </main>
      </div>
    </PageContainer>
  );
};

export default withLayout(Login);

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #ffffff;

  .google-button {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }
`;
