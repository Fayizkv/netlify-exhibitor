import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { GetIcon, SuccessIcon } from "../../../../../../icons";
import { postData } from "../../../../../../backend/api";
import AutoForm from "../../../../../core/autoform/AutoForm";
import moment from "moment";
import StripePaymentForm from "./StripePaymentForm";
import PaymentCancelled from "../../single/PaymentCancelled";

// Add this constant at the top of the file, after imports
const paymentFailureMessage = "Your payment is being processed. If you don't receive confirmation within 15 minutes, please contact our support team.";

const PageWrapper = styled.div`
  position: fixed;
  z-index: 1001;
  top: 0;
  right: 0;
  background: white;
  left: 0;
  bottom: 0;
  background-image: repeating-radial-gradient(circle at 0 0, transparent 0, #e5e5f7 6px), repeating-linear-gradient(#b4b4b455, #b4b4b4);
  &.Horizontal {
    display: flex;
    @media (max-width: 768px) {
      height: auto;
      overflow: auto;
    }
  }
  &.Vertical {
    background: #00000075;
  }
  &.embed {
    background: white;
  }
  ~ body {
    overflow: hidden;
  }
`;

const Banner = styled.div`
  position: fixed;
  left: auto;
  bottom: 0;
  top: 0;
  right: right;
  width: 40%;
  overflow: auto;

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
  &.Vertical img {
    display: none;
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
    width: 40%;
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
  &.single {
    width: calc(100% - 500px);
  }
  &.Vertical {
    max-width: 100%;
    width: 100%;
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
  position: fixed;
  left: 0;
  bottom: 0;
  top: 0;
  right: auto;
  width: 60%;
  overflow: auto;
  padding: 30px;
  min-width: 850px;
  max-width: 60%;
  z-index: 1;
  &.Horizontal {
    width: 60%;
    position: initial;
    /* height: 100vh; */
    /* overflow: auto; */
    display: flex;
  }
  &.single {
    width: 500px;
    min-width: 500px;
  }
  &.Vertical {
    max-width: 100%;
    width: 100%;
  }
  &.embeding {
    width: 100%;
    padding: 0;
    max-width: -webkit-fill-available;
    right: 0;
    min-width: auto;
  }
  @media (max-width: 768px) {
    &.Horizontal {
      width: 100%;
      height: auto;
      overflow: hidden;
    }
  }
`;
const FormHeader = styled.div`
  text-align: left;
  padding: 10px 0 0 0;
  span > bold {
    font-weight: 700;
  }
  span > span {
    font-size: 17px;
  }
  > span {
    font-size: 1.5em;
    text-align: left;
    -webkit-box-align: baseline;
    align-items: baseline;
    font-weight: normal;
    flex-direction: column;
    color: black;
  }
  i {
    border: 1px dashed;
    padding: 0px 5px;
    margin-left: 5px;
    font-style: normal;
    cursor: pointer;
  }
  > svg {
    margin: 0;
    font-size: 2px;
    border-radius: 50%;
    width: 13px;
    height: 13px;
  }
  &.coupon {
    padding: 0px;
    margin-bottom: 10px;
  }
`;
const Header = styled.div`
  padding: 0px 20px 0px;
  background: ${(props) => props.event?.primaryColour ?? "darkblue"};
  color: white;
  align-items: center;
  display: flex;
  color: white;
  border-radius: 11px 11px 0px 0px;
  height: 50px;
  font-size: 16px;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
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
  &.embed {
    position: sticky;
    top: 0;
    z-index: 1000;
    border-radius: 0;
  }
  &.embed > div > div {
    border-radius: 0 !important;
  }
  @media screen and (max-width: 768px) {
    height: auto;
    padding: 10px 20px;
    border-radius: 0px;
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
  &.embeding {
    box-shadow: none;
    width: 100%;
    max-width: 100%;
    top: 0;
    bottom: 0;
  }
  @media screen and (max-width: 768px) {
    width: 100%;
    max-width: 100%;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: auto;
    border-radius: 0;
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
  color: black;
  img {
    max-width: 100%;
  }
  &.embed {
    margin: 0px auto;
    padding: 10px 25px 25px;
    width: 400px;
    &.Horizontal {
      align-items: flex-start;
      justify-content: flex-start;
      /* overflow: auto; */
    }
    &.double {
      width: 650px;
    }
  }
  &.embeding {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 20px !important;
    margin: auto !important;
    margin-left: 0 !important;
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
        /* max-height: 90vh; */
      }
      &.double {
        max-width: 100%;
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
  display: flex;
  flex-direction: column;
  width: 100%;
  -webkit-box-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  align-items: center;
  padding: 0px;
  min-height: 300px;
  > svg {
    font-size: 25px;
    color: green;
  }
  &.red > svg {
    color: red;
  }

  h2 {
    font-size: 20px;
    margin: 10px 0 0;
    text-align: center;
  }
  h3 {
    font-size: 15px;
    margin: 20px 0 20px;
    font-weight: normal;
    text-align: center;
    border-radius: 12px;
    background-color: rgb(255, 255, 255);
    box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 4px;
    padding: 20px;
    text-align: left;
  }
  p {
    margin-bottom: 10px;
  }
`;
const CouponText = styled.div`
  margin: 10px 0 10px;
  font-size: 14px;

  .applied-coupon {
    padding: 12px;
    background: ${(props) => (props.event?.primaryColour ? `${props.event.primaryColour}10` : "#2563eb10")};
    border: 1px solid ${(props) => (props.event?.primaryColour ? `${props.event.primaryColour}20` : "#2563eb20")};
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .coupon-details {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 4px;

      strong {
        color: ${(props) => props.event?.primaryColour ?? "#2563eb"};
        font-weight: 500;
      }

      .divider {
        color: #6b7280;
      }
    }

    .remove-coupon {
      display: inline-flex;
      align-items: center;
      color: ${(props) => props.event?.primaryColour ?? "#2563eb"};
      cursor: pointer;
      font-weight: 500;
      border: none;
      background: none;
      padding: 0;
      margin-left: 8px;
      font-size: 14px;

      svg {
        width: 14px;
        height: 14px;
        margin-left: 4px;
      }
    }
  }

  .coupon-info {
    button {
      margin-left: 8px;
      color: ${(props) => props.event?.primaryColour ?? "#2563eb"};
      cursor: pointer;
      border: none;
      background: none;
      padding: 0;
      font-weight: 500;
    }
  }
`;

const DirectRegister = ({ isEmbed = false, colors, setLoaderBox, event, registserHandler, ticket, single = false }) => {
  const [userRegistered, setUserRegistered] = useState(false);
  const [input, setInput] = useState(null);
  const [formId, setFormId] = useState(0);
  const [couenFormId, setCouenFormId] = useState(0);
  const [couponApplied, setCouponApplied] = useState(null);
  const [message, setMessage] = useState("");
  const [couponForm, setCouponForm] = useState(false);
  const [formMode, setFormMode] = useState("single");
  const [stripeOrder, setStripeOrder] = useState(null);
  const [formData, setFormData] = useState(null);
  const [paymentCancelled, setPaymentCancelled] = useState(false);

  // Add window resize handler
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      setFormMode(isMobile ? "single" : input?.length > 6 ? "double" : "single");
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, [input]);

  useEffect(() => {
    // Set overflow hidden on body when component mounts
    document.body.style.overflow = "hidden";

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const getTicket = async () => {
      // const country = event.countries[0];
      const response = await postData({ direct: true, ticket: ticket._id }, "authentication/ticket-direct-data");
      if (response.status === 200) {
        const { primaryFields, secondaryFields } = response.data.configs;
        const regForm = [
          ...[...(ticket.type === "Form" ? [] : primaryFields), ...secondaryFields].map((attribute) => {
            if (attribute.conditionEnabled) {
              attribute.condition = {
                item: attribute.conditionWhenField,
                if: attribute.conditionCheckMatch.includes(",") ? attribute.conditionCheckMatch.split(",") : [attribute.conditionCheckMatch],
                then: attribute.conditionIfMatch === "enabled" ? "enabled" : "disabled",
                else: attribute.conditionIfMatch === "enabled" ? "disabled" : "enabled",
              };
            }
            if (attribute.type === "select") {
              attribute.search = true;
            }
            if (attribute.type === "mobilenumber") {
              attribute.countries = event.countries;
            }
            if (attribute.type === "date" || attribute.dateType === "datetime") {
              attribute.default = "empty";
            }
            if (attribute.type === "email") {
              attribute.validation = "email";
            }
            if (["text", "textarea", "select", "multiselect"].includes(attribute.type) && !attribute.placeholder?.length) {
              attribute.placeholder = attribute.label;
            }
            if (attribute.type === "multiSelect") {
              if (attribute.apiType === "CSV") {
                attribute.selectApi = attribute.selectApi
                  .toString()
                  .split(",")
                  .map((item) => {
                    return { id: item, value: item };
                  });
                attribute.apiType = "JSON";
              }
              attribute.default = "";
            }
            return attribute;
          }),
          // Add "Submit your Abstraction" field for Abstraction type tickets
          ...(ticket.type === "Abstraction"
            ? [
                {
                  type: "file",
                  label: "Submit your Abstraction",
                  placeholder: "Upload your abstraction file",
                  name: "submit_abstraction",
                  required: false,
                  add: true,
                  view: true,
                  update: true,
                  customClass: "full",
                  allowedFileTypes: [
                    // Images
                    "image/jpeg",
                    "image/png",
                    "image/gif",
                    "image/webp",
                    "image/svg+xml",
                    // Documents
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "text/plain",
                    "application/vnd.oasis.opendocument.text",
                    // Spreadsheets
                    "text/csv",
                    "application/vnd.ms-excel",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "application/vnd.oasis.opendocument.spreadsheet",
                    // Archives
                    "application/zip",
                    "application/x-rar-compressed",
                  ],
                },
              ]
            : []),
        ];
        setInput(regForm);
        setFormMode(regForm?.length > 6 ? "double" : "single");
        setFormId((formId) => formId + 1);
      }
    };
    if (!input || input?.length === 0) {
      getTicket();
    }
  }, [event.loginPage, input, event.countries, ticket, event.collectEmailId]);

  const isCreatingHandler = () => {};

  const verfiyCoupen = async (temppost) => {
    setLoaderBox(true);
    try {
      const postDataTemp = { ticketId: ticket._id, ...temppost };
      const res = await postData(postDataTemp, "authentication/verify-coupen");

      if (res.status === 200) {
        setCouponApplied({ ...res.data, couponCode: temppost.couponCode });
        setMessage(""); // Clear any error messages
      } else {
        setMessage(res.customMessage || "Invalid coupon code. Please try again.");
        setCouenFormId((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Coupon verification error:", error);
      setMessage("Unable to verify coupon. Please try again.");
    } finally {
      setLoaderBox(false);
    }
  };

  const handleStripeSuccess = (data) => {
    setUserRegistered(true);
    setMessage(data.response.onsuccessfullMessage || "Registration successful! You'll receive a confirmation email shortly.");
  };

  const handleStripeError = (errorMessage) => {
    setMessage(errorMessage);
  };

  const handlePaymentCancelled = () => {
    setPaymentCancelled(true);
    setStripeOrder(null);
  };

  const submitChange = async (temppost) => {
    setMessage("");
    setLoaderBox(true);
    const postDataTemp = {
      authenticationType: event.authenticationType,
      event: event._id,
      ticket: ticket._id,
      franchise: event.franchise._id,
      domain: window.location.origin,
      ...(couponApplied?.couponId ? { couponId: couponApplied?.couponId } : {}),
      ...temppost,
    };

    setFormData(postDataTemp);

    try {
      const res = await postData(postDataTemp, "authentication/direct");

      if (res.status === 200) {
        if (res.data.status === "payment") {
          const orderData = res.data.order;

          if (orderData.paymentGateway === "stripe") {
            if (orderData.checkoutUrl) {
              window.location.href = orderData.checkoutUrl;
            } else {
              setStripeOrder(orderData);
              setLoaderBox(false);
            }
            return;
          }

          // Handle Razorpay payment
          if (orderData.razorpayOrderId) {
            const options = {
              key: orderData.key,
              amount: orderData.amount,
              currency: orderData.currency,
              name: event.title,
              description: "Event Registration",
              order_id: orderData.razorpayOrderId,
              image: import.meta.env.VITE_CDN + event.logo,
              handler: async function (response) {
                setLoaderBox(true);
                try {
                  const res = await postData(
                    {
                      ...postDataTemp,
                      ...response,
                      domain: window.location.origin,
                      reference: orderData.reference,
                    },
                    "authentication/direct"
                  );

                  if (res.status === 200) {
                    setUserRegistered(true);
                    setMessage(res.data.response.onsuccessfullMessage || "Registration successful! You'll receive a confirmation email shortly.");
                  } else {
                    setMessage(res.customMessage || "There was an issue with your registration. Please contact support.");
                  }
                } catch (error) {
                  console.error("Razorpay payment error:", error);
                  setMessage("We're processing your registration. If you don't receive confirmation within 15 minutes, please contact support.");
                } finally {
                  setLoaderBox(false);
                }
              },
              prefill: {
                name: postDataTemp.firstName,
                email: postDataTemp.emailId,
                contact: postDataTemp.authenticationId,
              },
              notes: {
                address: "",
              },
              theme: {
                color: colors.primaryColour,
              },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", function (response) {
              setMessage(paymentFailureMessage);
              console.error("Payment failed:", response.error);
            });
            rzp.open();
          }
        } else if (res.data.status === "success") {
          setUserRegistered(true);
          setMessage(res.data.response.onsuccessfullMessage || "Registration successful! You'll receive a confirmation email shortly.");
        }
      } else {
        setMessage(res.customMessage || "There was an issue with your registration. Please try again or contact support.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("We're having trouble processing your request. Please try again or contact support.");
    } finally {
      setLoaderBox(false);
    }
  };

  const getRegistrationStatus = () => {
    const now = moment();
    if (!input) {
      return {
        message: "Please wait form is loading!",
        icon: "refresh",
      };
    }
    if (ticket) {
      if (ticket?.enableNumberOfTickets && Number(ticket.numberOfTicketsToBeSold) > 0 && Number(ticket.numberOfTicketsToBeSold) <= Number(ticket.bookingCount)) {
        return {
          message: "All tickets have been sold out! Thank you for your interest.",
          icon: "sold",
        };
      }
      // Check if registration is manually closed
      if (ticket.status === "Closed") {
        return {
          message: "Registration is temporarily closed. Please check back later.",
          icon: "lock",
        };
      }

      // Check if tickets are sold out
      if (ticket.status === "Sold Out") {
        return {
          message: "All tickets have been sold out! Thank you for your interest.",
          icon: "ticket-off",
        };
      }
      // Check if registration hasn't started yet
      if (now.isBefore(ticket.saleStartDate)) {
        return {
          message: "Registration has not started yet. Registration will start soon",
          icon: "clock",
        };
      }

      // Check if registration has ended
      if (now.isAfter(ticket.saleEndDate)) {
        return {
          message: "Registration period has ended. Sales closed on " + moment(ticket.saleEndDate).format("MMMM Do YYYY, h:mm A"),
          icon: "clock",
        };
      }
      return null;
    } else {
      return {
        message: "Please wait form is loading!",
        icon: "refresh",
      };
    }
  };

  const paymentConsent = (ticket) => {
    if (ticket.enablePricing) {
      if (ticket.enableDiscount) {
        return `You need to pay ${ticket.discountValue} (${event.currency ?? "INR"}) to complete this registration! We have applied a '${ticket.discountTag}' discount of ${Math.round(((ticket.paymentAmount - ticket.discountValue) / ticket.paymentAmount) * 100)}% on your ticket!\n`;
      }
      if (ticket.enableCoupenCode) {
        return `You need to pay ${couponApplied?.discountAmount ?? ticket.paymentAmount} (${event.currency ?? "INR"}) to complete this registration!\n`;
      }
      return `You need to pay ${ticket.paymentAmount} (${event.currency ?? "INR"}) to complete this registration!\n`;
    } else {
      return "";
    }
  };

  const statusmessage = getRegistrationStatus();

  return (
    <PageWrapper className={`Vertical ${isEmbed ? "embed" : ""}`} event={event}>
      <Banner className={`Vertical  ${formMode}`}>
        <img src={import.meta.env.VITE_CDN + (ticket.banner ?? event.regBanner)} alt="frame" />
        {!isEmbed && <div></div>}
      </Banner>
      <Content className={`Vertical ${formMode}  ${isEmbed ? "embeding" : ""}`}>
        <CenteredDiv className={`${isEmbed ? "embeding" : ""}`}>
          <Header event={colors} className={`sticky top-0 bg-white z-10 md:relative ${isEmbed ? "embed" : ""}`}>
            <h2>{input ? ticket.title : "Loading.."}</h2>
            {!single && !isEmbed && (
              <div onClick={() => registserHandler()}>
                <GetIcon icon={"close"}></GetIcon>
              </div>
            )}
          </Header>

          {!input ? (
            // Show loading state until input is ready
            <FormContainer className={`Vertical embed ${formMode}`}>
              <Message>
                <GetIcon icon="pending" />
                <h2>Please wait form is loading!</h2>
              </Message>
            </FormContainer>
          ) : statusmessage ? (
            // Show status message if there's one (like registration closed)
            <FormContainer className={`Vertical embed ${formMode}`}>
              <Message className="red">
                <GetIcon icon="error" />
                <h2>{statusmessage.message}</h2>
              </Message>
            </FormContainer>
          ) : userRegistered ? (
            // Show success message after registration
            <FormContainer className={`Vertical embed ${formMode}`}>
              <Message>
                <SuccessIcon />
                <h2>Registration Successful!</h2>
                <h3 dangerouslySetInnerHTML={{ __html: message }}></h3>
              </Message>
            </FormContainer>
          ) : paymentCancelled ? (
            <FormContainer className={`Vertical embed ${formMode}`}>
              <PaymentCancelled
                colors={colors}
                event={event}
                onClose={() => {
                  setPaymentCancelled(false);
                  setStripeOrder(null);
                }}
              />
            </FormContainer>
          ) : (
            // Show registration form
            <FormContainer className={`Vertical embed ${formMode} ${isEmbed ? "embeding" : ""}`}>
              {!userRegistered && input?.length > 0 && (
                <React.Fragment>
                  <FormHeader className="coupon">
                    <span>
                      {ticket.enablePricing && (
                        <CouponText event={colors}>
                          {couponApplied ? (
                            <div className="applied-coupon">
                              <div className="coupon-details">
                                <span>
                                  <strong>{couponApplied.couponCode}</strong> applied - {couponApplied.discountValue}% discount
                                </span>
                                <span>
                                  Final Price: {couponApplied.discountAmount} {event.currency ?? "INR"}
                                </span>
                              </div>
                              <button
                                className="remove-coupon"
                                onClick={() => {
                                  setCouponApplied(null);
                                  setCouponForm(false);
                                }}
                              >
                                Remove
                                <GetIcon icon="close" />
                              </button>
                            </div>
                          ) : (
                            ticket?.enableCoupenCode && (
                              <div className="coupon-info">
                                Have a coupon code?
                                <button
                                  onClick={() => {
                                    setMessage("");
                                    setCouponForm(true);
                                  }}
                                >
                                  Apply Here
                                </button>
                              </div>
                            )
                          )}
                        </CouponText>
                      )}
                    </span>
                  </FormHeader>
                  <AutoForm
                    colors={colors}
                    consent={`${paymentConsent(ticket)} ${ticket.consent ? ticket.consentLetter : ""}`}
                    useCaptcha={false}
                    key={`type-${formId}`}
                    useCheckbox={false}
                    customClass="embed"
                    description=""
                    formValues={{}}
                    formMode={formMode}
                    formType="post"
                    header=" "
                    formInput={input}
                    submitHandler={submitChange}
                    button={ticket.enablePricing ? "Pay & Register" : "Register Now"}
                    isOpenHandler={isCreatingHandler}
                    css="plain embed head-hide landing"
                    isOpen={true}
                    plainForm={true}
                  />
                </React.Fragment>
              )}
              {!userRegistered && message?.length > 0 && <ErrorMessage>{message}</ErrorMessage>}
              {userRegistered && message?.length > 0 && (
                <Message>
                  <SuccessIcon></SuccessIcon>
                  <h2>Registration Successful!</h2>
                  <h3>{message}</h3>
                </Message>
              )}

              {ticket && couponForm && ticket?.enableCoupenCode && !couponApplied && (
                <Message>
                  <AutoForm
                    colors={colors}
                    useCaptcha={false}
                    key={`coupen-${couenFormId}`}
                    useCheckbox={false}
                    description={""}
                    formValues={{}}
                    formMode={"single"}
                    formType={"post"}
                    formLayout="center"
                    header={`<span style="font-size:14px;">Have a Coupon Code?</span>`}
                    formInput={[
                      {
                        type: "text",
                        placeholder: "Enter your coupon code",
                        name: "couponCode",
                        format: "uppercase",
                        default: "",
                        label: "Coupon Code",
                        minimum: 3,
                        info: "Enter the coupon code provided by the event organizer",
                        maximum: 15,
                        required: true,
                        add: true,
                      },
                      ...(message.length > 0
                        ? [
                            {
                              type: "html",
                              content: <ErrorMessage>{message}</ErrorMessage>,
                              name: "error",
                              customClass: "full",
                              required: false,
                              add: true,
                            },
                          ]
                        : []),
                    ]}
                    submitHandler={verfiyCoupen}
                    button={"Apply"}
                    isOpenHandler={() => {
                      setCouponForm(false);
                      setMessage("");
                    }}
                    isOpen={true}
                    plainForm={false}
                  ></AutoForm>
                </Message>
              )}
              {/* {message?.length > 0 && <ErrorMessage>{message}</ErrorMessage>} */}
              {stripeOrder && (
                <FormContainer className={`Vertical embed ${formMode}`}>
                  <StripePaymentForm
                    colors={colors}
                    stripeOrder={stripeOrder}
                    event={event}
                    ticket={ticket}
                    couponApplied={couponApplied}
                    onSuccess={handleStripeSuccess}
                    onError={handleStripeError}
                    postDataTemp={formData}
                    onClose={handlePaymentCancelled}
                  />
                </FormContainer>
              )}
            </FormContainer>
          )}
        </CenteredDiv>
      </Content>
    </PageWrapper>
  );
};

export default DirectRegister;
