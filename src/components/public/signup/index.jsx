import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearLoginSession, fetchLogin } from "../../../store/actions/login";
import withLayout from "../layout";
import { logo } from "../../../images";
import styled from "styled-components";
import PricingTable from "./pricingTable";
import { GoogleLogin } from "@react-oauth/google";
import AutoForm from "../../core/autoform/AutoForm";
import OtpInput from "./otp";
import { getData, postData } from "../../../backend/api";
import { LogOut, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { projectSettings } from "../../project/brand/project";
import { BackIcon } from "../../../icons";

export const SignUp = (props) => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(null);
  const [signUpData, setSignUpData] = useState(null);

  useEffect(() => {
    document.title = `EventHex System`;
  }, []);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((state) => state.login);
  const { setLoaderBox, setMessage } = props;

  // Check if we have a valid pricing_id in the URL
  const pricingId = searchParams.get("id");

  // Define form inputs
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
      icon: "e-mail",
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

  const onGoogleSuccess = async (data) => {
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

  // Handle routing based on user state and URL parameters
  useEffect(() => {
    const handleRouting = async () => {
      setIsLoading(true);

      // If user is logged in and we have a pricing_id, redirect to subscription page
      if (user.data?.token && pricingId) {
        try {
          // Verify the pricing_id is valid
          const response = await getData({ _id: pricingId }, "active-subscription-plan");
          if (response.status === 200 && response.data?.data) {
            // Valid pricing_id, redirect to subscription page
            navigate(`/subscription?id=${pricingId}`);
            return;
          }
        } catch (error) {
          console.error("Error verifying pricing_id:", error);
        }
      }

      // If user is logged in, show pricing plan selection
      if (user.data?.token) {
        if (location.pathname === "/sign-up") {
          navigate("/purchase-plan");
        }
      } else {
        // If user is not logged in, redirect to signup page
        if (location.pathname === "/purchase-plan") {
          navigate("/sign-up");
        }
      }

      setIsLoading(false);
    };

    handleRouting();
  }, [user, navigate, location.pathname, pricingId]);

  const isCreatingHandler = (value, callback) => {};

  const submitChange = async (post) => {
    setIsSubmitting(true);
    setFormErrors({});
    setLoaderBox(true);

    try {
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
        setFormErrors(response.data?.errors || {});
        setMessage({ type: 1, content: response.customMessage || "Something went wrong", icon: "error" });
      }
    } catch (err) {
      setMessage({ type: 1, content: err.message || "Something went wrong", icon: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If loading, show loading state
  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-base"></div>
        </div>
      </PageContainer>
    );
  }

  // If user is not logged in, show the signup form
  if (!user.data?.token) {
    return (
      <PageContainer>
        <div className="min-h-screen bg-white flex flex-col">
          <nav className="flex justify-between items-center p-6">
            <button onClick={() => navigate("/")} className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Website
            </button>
          </nav>

          <main className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-[440px]">
              <div className="bg-white rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.04)] border border-gray-100 p-6">
                <div className="w-full">
                  <div className="mb-6 border-b border-gray-200 pb-4 flex flex-col gap-4 items-center justify-center">
                    <img src={logo} alt="event-logo" className="h-8" />
                    <p className="text-xl font-semibold text-gray-900">Create your {projectSettings.title} Account</p>
                  </div>

                  {!isGoogleAuthenticated ? (
                    <>
                      {isOtpSent ? (
                        <OtpInput
                          key={`otp-input-${signUpData?.email}`}
                          data={signUpData}
                          onSubmit={(otp) => {
                            submitChange({ ...signUpData, otp });
                          }}
                          onResend={() => {
                            submitChange({ ...signUpData });
                          }}
                        />
                      ) : (
                        <>
                          <AutoForm
                            consent={`By signing up, you agree to EventHex's Privacy Policy and Terms of Service. You will receive service-related emails and notifications`}
                            key={`signup-form-${isSubmitting}`}
                            useCaptcha={false}
                            formType="post"
                            header=""
                            formMode={"single"}
                            description=""
                            formValues={{}}
                            formInput={registrationInput}
                            submitHandler={(post) => {
                              const data = { ...post, authenticationType: "email" };
                              setSignUpData(data);
                              submitChange(data);
                            }}
                            button={isSubmitting ? "Creating your account..." : "Create account"}
                            isOpenHandler={isCreatingHandler}
                            isOpen={true}
                            css="plain embed head-hide landing"
                            plainForm={true}
                            customClass="embed"
                            disabled={isSubmitting}
                          />

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
                              onError={() => {
                                setMessage({
                                  type: 1,
                                  content: "Google login failed. Please try again.",
                                  icon: "error",
                                });
                              }}
                              useOneTap
                              type="standard"
                              size="large"
                              shape="rectangular"
                              width="100%"
                              text="continue_with"
                            />
                          </div>

                          <div className="text-center mt-6">
                            <button className="text-sm font-medium text-primary-base hover:text-primary-dark transition-colors" onClick={() => navigate("/")}>
                              Already have an account? Sign in
                            </button>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full">
                      <div className="flex items-center gap-2 mb-6 bg-green-50 text-green-700 p-3 rounded-lg">
                        <CheckCircle className="text-green-500 shrink-0" size={20} />
                        <span className="text-sm">Google authentication successful. Please complete your profile to continue.</span>
                      </div>
                      <AutoForm
                        consent={`By signing up, you agree to EventHex's Privacy Policy and Terms of Service. You will receive service-related emails and notifications`}
                        key={`google-auth-form-${isGoogleAuthenticated?.email}`}
                        useCaptcha={false}
                        formType="post"
                        description={<div></div>}
                        formValues={{}}
                        header=""
                        formInput={gauthInput}
                        formMode={"single"}
                        submitHandler={(post) => {
                          submitChange({ ...post, credential: isGoogleAuthenticated, authenticationType: "google" });
                        }}
                        button={isSubmitting ? "Creating your account..." : "Complete signup"}
                        isOpenHandler={isCreatingHandler}
                        isOpen={true}
                        css="plain embed head-hide landing"
                        plainForm={true}
                        customClass="embed"
                        disabled={isSubmitting}
                      />
                    </div>
                  )}

                  {Object.keys(formErrors).length > 0 && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg w-full">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={18} />
                        <div>
                          <p className="text-sm font-medium text-red-800">Please correct the following errors:</p>
                          <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                            {Object.entries(formErrors).map(([field, error]) => (
                              <li key={field}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </PageContainer>
    );
  }

  // If user is logged in, show the pricing plan
  return (
    <PageContainer>
      <div className="w-full min-h-screen bg-white">
        <nav className="flex justify-between items-center p-6">
          <img src={logo} alt="event-logo" className="h-8" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                dispatch(clearLoginSession());
                navigate("/");
              }}
              className="inline-flex flex-row gap-2 items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
            <button
              onClick={() => {
                navigate(-1);
              }}
              className="inline-flex flex-row gap-2 items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BackIcon className="w-4 h-4" />
              Back
            </button>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <PricingTable email={user.data?.user.email} />
          </div>
        </main>
      </div>
    </PageContainer>
  );
};

export default withLayout(SignUp);

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
