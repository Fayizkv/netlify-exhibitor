import React, { useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { keyframes } from "styled-components";
//using translation
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { clearLoginSession, fetchLogin } from "../../../store/actions/login";
import withLayout from "../layout";
import { Container, Right, MainHeader, HeaderContent } from "./style";
import { mobLogo } from "../../../images";
import { Logo, Section } from "./style";
import { Accordion } from "../../core/accordian/signupaccrodion";
import { useState } from "react";
import styled from "styled-components";
import { GetIcon } from "../../../icons";
import PaymentSummary from "./paymentSummary";
import PricingTable from "./pricingTable";
import { IconButton } from "../../core/elements";
import { GoogleLogin } from "@react-oauth/google";
import AutoForm from "../../core/autoform/AutoForm";
import OtpInput from "./otp";
import { getData, postData } from "../../../backend/api";
import { LogOut } from "lucide-react";
import PaymentMethod from "./PaymentMethod";
import PaymentSuccess from "./PaymentSuccess";
const Signup = (props) => {
  const [searchParams] = useSearchParams();
  const [selectedPackageId, setSelectedPackageId] = useState(localStorage.getItem("plan") || searchParams.get("id") || null);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(null);

  useEffect(() => {
    document.title = `EventHex System`;
    
    // Fetch event ID from domain
    const fetchEventFromDomain = async () => {
      try {
        let hostname = window.location.hostname;
        
        // Use testing.eventhex.ai as fallback for localhost
        const domainToUse = hostname === "localhost" ? "testing.eventhex.ai" : hostname;

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
        }
      } catch (error) {
        console.error("Error fetching event from domain:", error);
      }
    };

    fetchEventFromDomain();
  }, []);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((state) => state.login);
  const { setLoaderBox, setMessage } = props;
  const { t } = useTranslation();
  const [currentStage, setCurrentStage] = useState(0);
  const [isLoginForm, setIsLoginForm] = useState(false);
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(null);
  const [signUpData, setSignUpData] = useState(null);
  const [autoFormValues, setAutoFormValues] = useState({});
  const [hasBillingAddress, setHasBillingAddress] = useState(false);
  const [eventId, setEventId] = useState(null);
  const [eventLogo, setEventLogo] = useState(mobLogo);
  // First, add this to your existing useEffect or create a new one
  useEffect(() => {
    const getBillingAddress = async () => {
      try {
        if (user.data?.token) {
          const response = await getData({}, "franchise/get-billing-address");
          if (response.status === 200 && response.data?.data) {
            // Pre-fill the billing form with existing data
            const billingData = response.data.data;
            setHasBillingAddress(billingData._id ? true : false);
            // Update form values if using a form management system
            // If you're using AutoForm, you can pass this as formValues
            setAutoFormValues({
              firstName: billingData.firstName,
              lastName: billingData.lastName,
              addressLine1: billingData.addressLine1,
              addressLine2: billingData.addressLine2,
              city: billingData.city,
              state: billingData.state,
              country: billingData.country,
              postalCode: billingData.postalCode,
              phoneCode: billingData.phoneCode,
              contactPersonphone: billingData.contactPersonphone,
              companyName: billingData.companyName,
              taxId: billingData.taxId,
              updatedAt: billingData.updatedAt,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching billing address:", error);
      }
    };

    if (user.data?.token) {
      getBillingAddress();
    }
  }, [user.data?.token]);
  // const [loginMode, setLoginMode] = useState(null);
  const [loginInput] = useState([
    {
      type: "text",
      placeholder: "Enter your mobile number",
      name: "mobile",
      validation: "",
      default: "",
      label: "Mobile Number",
      minimum: 10,
      maximum: 15,
      required: true,
      icon: "phone",
      add: true,
    },
    {
      type: "select",
      apiType: "CSV",
      selectApi: "+1,+91,+44,+971,+86,+81,+82,+65,+60,+66,+62,+84,+61,+64",
      placeholder: "Select country code",
      name: "phoneCode",
      showItem: "value",
      label: "Country Code",
      required: true,
      add: true,
    },
  ]);
  const [billingInput] = useState([
    {
      type: "text",
      placeholder: "First Name",
      name: "firstName",
      customClass: "half",
      validation: "",
      default: "",
      label: "First Name",
      minimum: 2,
      maximum: 50,
      required: true,
      add: true,
    },
    {
      type: "text",
      placeholder: "Last Name",
      name: "lastName",
      customClass: "half",
      validation: "",
      default: "",
      label: "Last Name",
      minimum: 2,
      maximum: 50,
      required: true,
      add: true,
    },
    {
      type: "select",
      placeholder: "Country",
      name: "country",
      validation: "",
      info: "",
      selectApi: "country/select",
      apiType: "API",
      default: "",
      label: "Country",
      minimum: 2,
      maximum: 50,
      required: true,
      add: true,
      isBasic: true,
    },
    {
      type: "mobilenumber",
      placeholder: "Phone Number",
      name: "contactPersonphone",
      validation: "phone",
      default: "",
      label: "Phone",
      minimum: 10,
      countries: [
        {
          title: "United States",
          countryCode: "US",
          phoneCode: 1,
          language: "English",
          PhoneNumberLength: 10,
          flag: "🇺🇸",
        },
        {
          title: "United Kingdom",
          countryCode: "GB",
          phoneCode: 44,
          language: "English",
          PhoneNumberLength: 10,
          flag: "🇬🇧",
        },
        {
          title: "India",
          countryCode: "IN",
          phoneCode: 91,
          language: "Hindi, English",
          PhoneNumberLength: 10,
          flag: "🇮🇳",
        },
        {
          title: "Canada",
          countryCode: "CA",
          phoneCode: 1,
          language: "English, French",
          PhoneNumberLength: 10,
          flag: "🇨🇦",
        },
        {
          title: "Australia",
          countryCode: "AU",
          phoneCode: 61,
          language: "English",
          PhoneNumberLength: 9,
          flag: "🇦🇺",
        },
        {
          title: "Germany",
          countryCode: "DE",
          phoneCode: 49,
          language: "German",
          PhoneNumberLength: 11,
          flag: "🇩🇪",
        },
        {
          title: "France",
          countryCode: "FR",
          phoneCode: 33,
          language: "French",
          PhoneNumberLength: 9,
          flag: "🇫🇷",
        },
        {
          title: "Japan",
          countryCode: "JP",
          phoneCode: 81,
          language: "Japanese",
          PhoneNumberLength: 10,
          flag: "🇯🇵",
        },
        {
          title: "China",
          countryCode: "CN",
          phoneCode: 86,
          language: "Chinese",
          PhoneNumberLength: 11,
          flag: "🇨🇳",
        },
        {
          title: "Singapore",
          countryCode: "SG",
          phoneCode: 65,
          language: "English, Malay, Mandarin, Tamil",
          PhoneNumberLength: 8,
          flag: "🇸🇬",
        },
        {
          title: "United Arab Emirates",
          countryCode: "UAE",
          phoneCode: 971,
          language: "Arabic",
          PhoneNumberLength: 9,
          flag: "🇦🇪",
        },
        {
          title: "Saudi Arabia",
          countryCode: "SA",
          phoneCode: 966,
          language: "Arabic",
          PhoneNumberLength: 9,
          flag: "🇸🇦",
        },
        {
          title: "Brazil",
          countryCode: "BR",
          phoneCode: 55,
          language: "Portuguese",
          PhoneNumberLength: 11,
          flag: "🇧🇷",
        },
        {
          title: "South Korea",
          countryCode: "KR",
          phoneCode: 82,
          language: "Korean",
          PhoneNumberLength: 11,
          flag: "🇰🇷",
        },
        {
          title: "Russia",
          countryCode: "RU",
          phoneCode: 7,
          language: "Russian",
          PhoneNumberLength: 10,
          flag: "🇷🇺",
        },
        {
          title: "Qatar",
          countryCode: "QA",
          phoneCode: 974,
          language: "Arabic",
          PhoneNumberLength: 8,
          flag: "🇶🇦",
        },
        {
          title: "Kuwait",
          countryCode: "KW",
          phoneCode: 965,
          language: "Arabic",
          PhoneNumberLength: 8,
          flag: "🇰🇼",
        },
        {
          title: "Oman",
          countryCode: "OM",
          phoneCode: 968,
          language: "Arabic",
          PhoneNumberLength: 8,
          flag: "🇴🇲",
        },
        {
          title: "Bahrain",
          countryCode: "BH",
          phoneCode: 973,
          language: "Arabic",
          PhoneNumberLength: 8,
          flag: "🇧🇭",
        },
        {
          title: "Malaysia",
          countryCode: "MY",
          phoneCode: 60,
          language: "Malay",
          PhoneNumberLength: 9,
          flag: "🇲🇾",
        },
        {
          title: "New Zealand",
          countryCode: "NZ",
          phoneCode: 64,
          language: "English",
          PhoneNumberLength: 9,
          flag: "🇳🇿",
        },
        {
          title: "Hong Kong",
          countryCode: "HK",
          phoneCode: 852,
          language: "Chinese, English",
          PhoneNumberLength: 8,
          flag: "🇭🇰",
        },
        {
          title: "Maldives",
          countryCode: "MV",
          phoneCode: 960,
          language: "Dhivehi",
          PhoneNumberLength: 7,
          flag: "🇲🇻",
        },
        {
          title: "Thailand",
          countryCode: "TH",
          phoneCode: 66,
          language: "Thai",
          PhoneNumberLength: 9,
          flag: "🇹🇭",
        },
        {
          title: "Israel",
          countryCode: "IL",
          phoneCode: 972,
          language: "Hebrew",
          PhoneNumberLength: 9,
          flag: "🇮🇱",
        },
        {
          title: "South Africa",
          countryCode: "ZA",
          phoneCode: 27,
          language: "Multiple",
          PhoneNumberLength: 9,
          flag: "🇿🇦",
        },
        {
          title: "Italy",
          countryCode: "IT",
          phoneCode: 39,
          language: "Italian",
          PhoneNumberLength: 10,
          flag: "🇮🇹",
        },
        {
          title: "Ireland",
          countryCode: "IE",
          phoneCode: 353,
          language: "English, Irish",
          PhoneNumberLength: 9,
          flag: "🇮🇪",
        },
        {
          title: "Netherlands",
          countryCode: "NL",
          phoneCode: 31,
          language: "Dutch",
          PhoneNumberLength: 9,
          flag: "🇳🇱",
        },
      ],
      maximum: 15,
      required: true,
      add: true,
      isBasic: true,
    },
    {
      type: "text",
      placeholder: "Address Line 1",
      name: "addressLine1",
      validation: "",
      default: "",
      label: "Address Line 1",
      customClass: "full",
      minimum: 5,
      maximum: 100,
      required: true,
      add: true,
      isBasic: true,
    },
    {
      type: "text",
      placeholder: "Address Line 2",
      name: "addressLine2",
      validation: "",
      footnote: "Apartment, suite, unit, building, floor, etc.",
      default: "",
      label: "Address Line 2",
      customClass: "full",
      minimum: 5,
      maximum: 100,
      required: false,
      add: true,
      isBasic: true,
    },
    {
      type: "text",
      placeholder: "City",
      name: "city",
      customClass: "third",
      validation: "",
      default: "",
      label: "City",
      minimum: 2,
      maximum: 50,
      required: true,
      add: true,
    },
    {
      type: "text",
      placeholder: "State/Province",
      name: "state",
      validation: "",
      customClass: "third",
      default: "",
      label: "State/Province",
      minimum: 2,
      maximum: 50,
      required: true,
      add: true,
    },
    {
      type: "number",
      placeholder: "Postal Code",
      name: "postalCode",
      customClass: "third",
      validation: "",
      default: "",
      label: "Postal Code",
      minimum: 5,
      maximum: 10,
      required: true,
      add: true,
      isBasic: true,
    },
    // Advanced fields (initially hidden)
    {
      type: "text",
      placeholder: "Company Name",
      name: "companyName",
      validation: "",
      default: "",
      label: "Company Name",
      minimum: 2,
      maximum: 100,
      required: true,
      add: true,
      isAdvanced: true,
    },
    {
      type: "text",
      placeholder: "GST/Tax ID",
      name: "taxId",
      sublabel: "optional",
      validation: "",
      default: "",
      label: "GST/Tax ID",
      minimum: 0,
      maximum: 50,
      required: false,
      add: true,
      isAdvanced: true,
    },
  ]);
  const [registrationInput] = useState([
    {
      type: "text",
      placeholder: "Name",
      name: "name",
      validation: "",
      default: "",
      label: "Name",
      minimum: 3,
      maximum: 40,
      required: true,
      icon: "name",
      add: true,
    },
    {
      type: "text",
      placeholder: "Company Name",
      name: "companyName",
      validation: "",
      default: "",
      label: "Company Name",
      minimum: 3,
      maximum: 40,
      required: true,
      icon: "company",
      add: true,
    },
    {
      type: "email",
      placeholder: "Email",
      name: "email",
      validation: "email",
      default: "",
      label: "Email",
      minimum: 0,
      maximum: 60,
      required: true,
      icon: "email",
      add: true,
    },
    {
      type: "password",
      placeholder: "Password",
      name: "password",
      validation: "password",
      info: "At least one uppercase letter (A-Z) \n At least one lowercase letter (a-z) \n At least one digit (0-9) \n At least one special character (@, $, !, %, *, ?, &) \n Minimum length of 8 characters",
      default: "",
      label: "Password",
      minimum: 6,
      maximum: 16,
      required: true,
      icon: "password",
      add: true,
    },
  ]);
  const [gauthInput] = useState([
    {
      type: "text",
      placeholder: "Name",
      name: "name",
      validation: "",
      default: "",
      label: "Name",
      minimum: 2,
      maximum: 40,
      required: true,
      icon: "name",
      add: true,
    },
    {
      type: "text",
      placeholder: "Company Name",
      name: "companyName",
      validation: "",
      default: "",
      label: "Company Name",
      minimum: 2,
      maximum: 40,
      required: true,
      icon: "company",
      add: true,
    },
  ]);
  const Header = [
    {
      title: `Let's complete your purchase`,
      subTilte: user.data?.token ? ` Review your account info and enter your billing info.` : "Please log in or sign up to proceed with your order.",
    },
  ];
  useEffect(() => {
    if (user.data?.token) {
      if (location.pathname === "/sign-up") {
        navigate("/purchase-plan");
      } else {
        setCurrentStage(hasBillingAddress ? 3 : selectedPlanDetails ? 2 : 1);
      }
    } else {
      if (location.pathname === "/purchase-plan") {
        navigate("/sign-up");
      }
    }
    // if (loginMode) {
    //   setLoaderBox(user.isLoading);
    // }
    if (user.error !== null) {
    }
  }, [user, navigate, location.pathname, hasBillingAddress, selectedPlanDetails, setLoaderBox, t, props, dispatch]);
  useEffect(() => {
    const getPlan = async () => {
      try {
        if (selectedPackageId) {
          const response = await getData({ _id: selectedPackageId }, "active-subscription-plan");

          if (response.status === 200) {
            setSelectedPlanDetails(response.data.data);
          }
        }
      } catch (error) {
        console.error("Error fetching plan details:", error);
        // You may want to add error handling here, such as showing a message to the user
      }
    };
    getPlan();
  }, [selectedPackageId]); // Only depend on selectedPackageId
  const onGoogleSuccess = async (data) => {
    console.log(data);
    if (data.credential) {
      const response = await postData({ authenticationType: "google", credential: data.credential }, "auth/login");
      if (response.status === 200) {
        if (response.data.success) {
          dispatch(fetchLogin({}, response));
        } else {
          setIsGoogleAuthenticated(data.credential);
        }
      } else {
        setIsGoogleAuthenticated(data.credential);
      }
    }
  };
  useEffect(() => {
    console.log({ currentStage });
  }, [currentStage]);
  const isCreatingHandler = (value, callback) => {};
  const submitChange = async (post) => {
    setLoaderBox(true);
    try {
      // Check if this is OTP verification (has otp field)
      if (post.otp && isOtpSent) {
        // Verify OTP for exhibitor login
        const verifyResponse = await postData(
          {
            mobile: signUpData?.mobile || signUpData?.authenticationId,
            otp: post.otp,
            event: signUpData?.event,
            phoneCode: signUpData?.phoneCode,
          },
          "exhibitor/verify-otp"
        );
        
        if (verifyResponse.status === 200 && verifyResponse.data?.success) {
          setIsOtpSent(false);
          setSignUpData(null);
          dispatch(fetchLogin({}, verifyResponse));
          setMessage({ type: 1, content: "Login successful!", icon: "success" });
          setLoaderBox(false);
        } else {
          setLoaderBox(false);
          setMessage({ type: 1, content: verifyResponse.data?.message || "Invalid OTP. Please try again.", icon: "error" });
        }
        return;
      }

      // Check if this is exhibitor login (has mobile and phoneCode, and isLoginForm is true)
      if (isLoginForm && (post.mobile || post.authenticationId) && post.phoneCode && eventId) {
        // Exhibitor login - send OTP
        const loginResponse = await postData(
          {
            mobile: post.mobile || post.authenticationId,
            event: eventId,
            phoneCode: post.phoneCode,
          },
          "exhibitor/login"
        );

        if (loginResponse.status === 200 && loginResponse.data?.success) {
          setIsOtpSent(true);
          setSignUpData({
            mobile: post.mobile || post.authenticationId,
            event: eventId,
            phoneCode: post.phoneCode,
          });
          setMessage({ type: 1, content: "OTP sent to your mobile number", icon: "success" });
          setLoaderBox(false);
        } else {
          setLoaderBox(false);
          setMessage({ type: 1, content: loginResponse.data?.message || "Something went wrong", icon: "error" });
        }
        return;
      }

      // Original signup/login flow
      const response = await postData(post, "auth/signup");
      if (response.status === 200) {
        if (response.data?.requireOTP) {
          setIsOtpSent(true);
          setMessage({ type: 1, content: "OTP sent to your email", icon: "success" });
        } else if (response.data?.success) {
          const loginresponse = await postData(post, "auth/login");
          if (loginresponse.status === 200) {
            if (loginresponse.data.success) {
              dispatch(fetchLogin({}, loginresponse));
            }
          }
          setMessage({ type: 1, content: "Signup successful!", icon: "success" });
        }
        setLoaderBox(false);
      } else {
        setLoaderBox(false);
        setMessage({ type: 1, content: response.customMessage || "Something went wrong", icon: "error" });
      }
    } catch (err) {
      setLoaderBox(false);
      setMessage({ type: 1, content: err.message || "Something went wrong", icon: "error" });
    } finally {
    }
  };
  const submitBillingAddress = async (post) => {
    setLoaderBox(true);
    try {
      const response = await postData(post, "franchise/update-billing-address");
      if (response.status === 200) {
        setCurrentStage(3);
        setMessage({ type: 1, content: response.data.message, icon: "success" });

        setLoaderBox(false);
      } else {
        setLoaderBox(false);
        setMessage({ type: 1, content: response.customMessage || "Something went wrong", icon: "error" });
      }
    } catch (err) {
      setMessage({ type: 1, content: err.message || "Something went wrong", icon: "error" });
    } finally {
    }
  };

  const accordionItems = [
    {
      id: "account",
      title: user.data?.user?.email ? "Signed In As" : isLoginForm ? `Sign in` : `Create an Account`,
      subtitle: user.data?.user?.email ?? "",
      button1: user.data?.user?.email ? (
        <button
          className="flex border rounded-lg p-1 pr-3 pl-3  border-stroke-soft justify-center items-center gap-2 cursor-pointer font-medium text-primary-base hover:text-primary-dark transition-colors duration-200 text-sm"
          onClick={(e) => {
            dispatch(clearLoginSession());
            navigate("sign-up");
          }}
        >
          <LogOut size={16} />
          Change User
        </button>
      ) : (
        <div className="flex items-center gap-2 text-sm ">
          {isLoginForm ? <span>Don't have an account?</span> : <span>Already have an account?</span>}
          <button
            className="font-medium text-primary-base hover:text-primary-dark transition-colors duration-200"
            onClick={(e) => {
              setIsLoginForm((prev) => !prev);
              e.preventDefault();
            }}
          >
            {isLoginForm ? `Create an Account` : `Sign in`}
          </button>
        </div>
      ),
      editable: false,
      content: (
        <div className="m-auto w-full flex flex-col items-center">
          <div className={`p-2 w-full  ${isGoogleAuthenticated ? "hidden" : "block"}`}>
            <button className={`m-auto mt-4 w-auto flex items-center justify-center gap-2 py-2.5 px-4 mb-4 `}>
              <GoogleLogin key={"isLoginForm"} onSuccess={onGoogleSuccess} onError={() => console.log("Login Failed")} useOneTap theme="outline" shape="rectangular" logo_alignment="center" />
            </button>
            <div className={`relative w-full text-center my-0  ${isGoogleAuthenticated ? "hidden" : "block"}`}>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stroke-soft"></div>
              </div>
              <div className="relative">
                <span className="px-4 text-sm text-text-sub bg-white">{isGoogleAuthenticated ? "" : "or"}</span>
              </div>
            </div>
            <div className={`relative w-full text-center my-0  ${!isGoogleAuthenticated ? "hidden" : "block"}`}>Fill your data</div>
            <div className={`max-w-[400px] m-auto pt-10 ${isLoginForm ? "block" : "hidden"}`}>
              {isOtpSent ? (
                <OtpInput
                  length={4}
                  data={signUpData}
                  onSubmit={(otp) => {
                    submitChange({ ...signUpData, otp });
                  }}
                  onResend={() => {
                    submitChange({ ...signUpData });
                  }}
                ></OtpInput>
              ) : (
                <AutoForm
                  consent={"By logging in, you agree to our security practices and notifications."}
                  key="login"
                  useCaptcha={false}
                  formType="post"
                  header="Login to your account"
                  description=""
                  formValues={{}}
                  formInput={loginInput}
                  submitHandler={submitChange}
                  button={"Login"}
                  isOpenHandler={isCreatingHandler}
                  isOpen={true}
                  css="plain embed head-hide landing"
                  plainForm={true}
                  customClass="embed"
                />
              )}
            </div>
            <div className={`w-full m-auto pt-10 ${!isLoginForm ? "block" : "hidden"}`}>
              {isOtpSent ? (
                <OtpInput
                  length={4}
                  data={signUpData}
                  onSubmit={(otp) => {
                    submitChange({ ...signUpData, otp });
                  }}
                  onResend={() => {
                    submitChange({ ...signUpData });
                  }}
                ></OtpInput>
              ) : (
                <AutoForm
                  consent={`By signing up, you agree to EventHex's Privacy Policy and Terms of Service. You will receive service-related emails and notifications`}
                  key="registration"
                  useCaptcha={false}
                  formType="post"
                  header="Create Account"
                  formMode={registrationInput.length > 2 ? "double" : "single"}
                  description=""
                  formValues={{}}
                  formInput={registrationInput}
                  submitHandler={(post) => {
                    const data = { ...post, authenticationType: "email" };
                    setSignUpData(data);
                    submitChange(data);
                  }}
                  button={"Sign Up"}
                  isOpenHandler={isCreatingHandler}
                  isOpen={true}
                  css="plain embed head-hide landing"
                  plainForm={true}
                  customClass="embed"
                />
              )}
            </div>
          </div>
          <div className={`max-w-[400px] ${isGoogleAuthenticated ? "block" : "hidden"}`}>
            <h3 className="m-auto mt-5 mb-5 text-center font-medium border-b-[1px] pb-3 text-primary-base">
              Google Authenticated successfully <GetIcon icon={"success"} />
              <br /> <span className="text-sm text-text-sub">Please provide the information to complete the signup!</span>
            </h3>
            <AutoForm
              consent={`By signing up, you agree to EventHex's Privacy Policy and Terms of Service. You will receive service-related emails and notifications`}
              key="registration-gauth"
              useCaptcha={false}
              formType="post"
              description={<div></div>}
              formValues={{}}
              header="Complete your profile!"
              formInput={gauthInput}
              formMode={gauthInput.length > 2 ? "double" : "single"}
              submitHandler={(post) => {
                submitChange({ ...post, credential: isGoogleAuthenticated, authenticationType: "google" });
              }}
              button={"Sign Up"}
              isOpenHandler={isCreatingHandler}
              isOpen={true}
              css="plain embed head-hide landing"
              plainForm={true}
              customClass="embed"
            />
          </div>
        </div>
      ),
    },
    {
      id: "plan",
      title: selectedPlanDetails?.title ?? "Selected a Plan",
      subtitle: selectedPlanDetails?.description ?? "You can select a plan from from the list!",
      editable: true,
      content: (
        <PlanContainer>
          {selectedPlanDetails ? (
            <div
              style={{
                paddingTop: "10px",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div className="flex justify-between">
                <p className="pt-0 m-0 font-normal">{selectedPlanDetails?.title}</p>

                <button
                  className="font-medium  text-primary-base hover:text-primary-dark transition-colors duration-200"
                  onClick={() => {
                    setCurrentStage(1);
                    setIsOpen(true);
                  }}
                >
                  Change Plan
                </button>
              </div>
              <div className="flex justify-between">
                <p className="m-0 p-0">
                  {selectedPlanDetails.defaultPricing?.currency?.symbol}
                  {selectedPlanDetails.defaultPricing.price} / monthly
                </p>{" "}
                <p style={{ padding: "0px", margin: "0px" }}>
                  {selectedPlanDetails.defaultPricing?.currency?.symbol}
                  {selectedPlanDetails.defaultPricing.price * 12}/yr
                </p>
              </div>
            </div>
          ) : (
            <div className="font-medium text-sm text-text-soft">You haven't selected a plan. Please choose a plan.</div>
          )}
        </PlanContainer>
      ),
    },
    {
      id: "billing",
      title: "Add your billing details",
      stepNumber: 3,
      editable: true,
      content: (
        <div className="mt-5" key={autoFormValues.updatedAt}>
          <AutoForm
            css="plain embed head-hide landing"
            formValues={autoFormValues}
            useCaptcha={false}
            formMode={"double"}
            formType={"post"}
            formInput={billingInput}
            submitHandler={submitBillingAddress}
            button={"Update Billing Address"}
            isOpenHandler={isCreatingHandler}
            isOpen={true}
            plainForm={true}
          />
        </div>
      ),
    },
    {
      id: "payment",
      title: "Choose a payment method",
      stepNumber: 4,
      editable: hasBillingAddress ? true : false,
      content: <PaymentMethod></PaymentMethod>,
    },
  ];
  return (
    <Container>
      <ContainerWrap>
        <MainHeader>
          <Logo>
            <img src={eventLogo} alt="event-logo" />
            {user.data?.token ? (
              <IconButton
                label="Logout"
                icon="logout"
                ClickEvent={() => {
                  dispatch(clearLoginSession());
                  navigate("/");
                }}
              ></IconButton>
            ) : (
              <IconButton
                label="Back to Webiste"
                icon="back"
                labelPosition="left"
                ClickEvent={() => {
                  dispatch(clearLoginSession());
                  navigate("/");
                }}
              ></IconButton>
            )}
          </Logo>
          <HeaderContent>
            <h5>{Header[0].title}</h5>
            <p>{Header[0].subTilte}</p>
          </HeaderContent>
        </MainHeader>
        <SectionContainer>
          <Section>
            <Accordion setCurrentStage={setCurrentStage} items={accordionItems} currentStage={currentStage} />
          </Section>
          <Right>
            <PaymentSummary
              onPaymentSuccess={() => {
                setShowPaymentSuccess(true);
              }}
              setMessage={setMessage}
              readyToPay={hasBillingAddress && selectedPlanDetails && user.data?.token}
              openPricingPlan={setIsOpen}
              selectedPlanDetails={selectedPlanDetails}
            />
          </Right>
        </SectionContainer>
        {isOpen && (
          <ModalOverlay onClick={() => setIsOpen(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <CloseButton onClick={() => setIsOpen(false)}>
                <GetIcon icon={"close"} />
              </CloseButton>
              {isOpen && (
                <PricingTable
                  onSelect={(id) => {
                    setSelectedPackageId(id);
                    localStorage.setItem("plan", id);
                    setIsOpen(false);
                  }}
                />
              )}
            </ModalContent>
          </ModalOverlay>
        )}
      </ContainerWrap>
      {showPaymentSuccess && <PaymentSuccess showPaymentSuccess={showPaymentSuccess} onClose={() => setShowPaymentSuccess(null)} />}
    </Container>
  );
};

export default withLayout(Signup);
const ContainerWrap = styled.div`
  max-width: 1300px;
  width: 100%;
  flex-direction: column;
  display: flex;
`;
const PlanContainer = styled.div`
  display: flex;
  align-items: start;
  justify-content: space-between;
  flex-direction: column;
  width: 100%;
`;

const SectionContainer = styled.div`
  display: flex;
  gap: 10px;
  max-width: 1300px;
  flex-wrap: wrap;
  justify-content: center;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 4rem;
  width: 95%;
  max-width: 100%;
  max-height: 100dvh;
  overflow-y: auto;
  position: relative;

  animation: ${fadeIn} 0.3s ease-out;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  color: #6b7280;

  &:hover {
    background-color: #f3f4f6;
  }
`;
