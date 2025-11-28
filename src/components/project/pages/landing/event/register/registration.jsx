import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { GetIcon, SuccessIcon } from "../../../../../../icons";
import { postData } from "../../../../../../backend/api";
import AutoForm from "../../../../../core/autoform/AutoForm";
import { appTheme } from "../../../../brand/project";
import moment from "moment";
const PageWrapper = styled.div`
  overflow: auto;
  height: 100dvh;
`;
const Image = styled.img`
  max-width: 100%;
  height: 150px;
  object-fit: cover;
  width: 100%;
  box-shadow:
    rgba(0, 0, 0, 0) 0px 0px,
    rgba(0, 0, 0, 0) 0px 0px,
    rgba(0, 0, 0, 0.25) 0px -1px 20px -12px;
  border-radius: 12px;
  margin-top: 20px;
  border: 1px solid lightgray;
`;
const FormHeader = styled.div`
  text-align: left;
  padding: 10px 0 0 0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1001;
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
  svg {
    margin: 0;
    font-size: 2px;
    border-radius: 50%;
    width: 13px;
    height: 13px;
  }
  border-bottom: 1px solid ${appTheme.stroke.soft};
  margin-bottom: 20px;
  width: 100%;
  padding-bottom: 10px;
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
  margin: 5px 0px 0px;
  color: rgb(254, 123, 123);
  font-size: 12px;
  width: 100%;
  border-top: 1px solid lightgrey;
  text-align: center;
  padding: 10px;
  z-index: 1000;
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
  height: calc(100dvh - 50px);
  svg {
    font-size: 25px;
    color: green;
  }
  &.red svg {
    color: red;
  }

  h2 {
    font-size: 20px;
    margin: 10px 0 0;
    text-align: center;
  }
  h3 {
    font-size: 15px;
    margin: 10px 0 20px;
    font-weight: normal;
    text-align: center;
  }
`;
const Registration = ({ setMessage, setLoaderBox, event, ticket, config, single = true }) => {
  const { countries, primaryFields, secondaryFields } = config;
  const [userRegistered, setUserRegistered] = useState(false);
  const [input, setInput] = useState(null);
  const [formId, setFormId] = useState(0);
  const [couenFormId, setCouenFormId] = useState(0);
  const [couponApplied, setCouponApplied] = useState(null);
  const [message, setGreetings] = useState("");
  const [couponForm, setCouponForm] = useState(false);
  const [formMode] = useState(ticket.formMode ?? (input?.length > 6 ? "double" : "single"));

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
      // const response = await postData({ direct: true, ticket: ticket._id }, "authentication/ticket-direct-data");
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
            attribute.countries = countries;
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
      setFormId((formId) => formId + 1);
    };
    if (!input || input?.length === 0) {
      getTicket();
    }
  }, [event.loginPage, input, countries, ticket, primaryFields, secondaryFields, event.collectEmailId]);

  const isCreatingHandler = (value, callback) => {};
  const verfiyCoupen = async (temppost) => {
    setLoaderBox(true);
    const postDataTemp = { ticketId: ticket._id, ...temppost };
    await postData(postDataTemp, "authentication/verify-coupen").then((res) => {
      if (res.status === 200) {
        setCouponApplied({ ...res.data, couponCode: temppost.couponCode });
        // setMessage("");
      } else {
        setMessage({ content: res.customMessage });
        setCouenFormId((prev) => prev + 1);
      }
      setLoaderBox(false);
    });
  };
  const submitChange = async (temppost) => {
    setLoaderBox(true);
    const postDataTemp = {
      authenticationType: event.enableAuthentication ? event.authenticationType : "none",
      event: event._id,
      ticket: ticket._id,
      franchise: event.franchise._id,
      domain: window.location.hostname,
      ...(couponApplied?.couponId ? { couponId: couponApplied?.couponId } : {}),
      ...temppost,
    };
    await postData(postDataTemp, "authentication/direct").then((res) => {
      if (res.status === 200) {
        if (res.data.status === "payment") {
          console.log(res.response);
          const orderData = res.data.order;
          if (orderData.razorpayOrderId) {
            const options = {
              key: orderData.key,
              amount: orderData.amount,
              currency: orderData.currency,
              name: orderData.company.title,
              description: "Event Registration",
              order_id: orderData.razorpayOrderId,
              image: import.meta.env.VITE_CDN + orderData.company.logo, // Add this line for the logo
              handler: async function (response) {
                setLoaderBox(true);
                const res = await postData({ ...postDataTemp, ...response, domain: window.location.hostname, reference: orderData.reference }, "authentication/direct");
                if (res.status === 200) {
                  setUserRegistered(true);
                  setGreetings(res.data.response.onsuccessfullMessage);
                } else if (res.status === 400) {
                  setMessage({ content: res.customMessage });
                }
                setLoaderBox(false);
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
                color: orderData.company.color,
              },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", function (response) {
              setMessage({
                content:
                  "If your payment was successful but you haven't received confirmation, don't worry! Our team will process it within one hour. If you have concerns, contact our support team after one hour.",
              });
              console.error("Payment failed:", response.error);
            });
            rzp.open();
          }
        } else if (res.data.status === "success") {
          setUserRegistered(true);
          setGreetings(res.data.response.onsuccessfullMessage);
        } else if (res.data.status === "false") {
          //crreat payment opip razorpay
        }
      } else if (res.status === 400) {
        setMessage({ content: res.customMessage });
      }
      setLoaderBox(false);
    });
  };
  const getRegistrationStatus = () => {
    const now = moment();
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
  };

  const statusmessage = getRegistrationStatus();
  return statusmessage ? (
    <FormContainer className={`${event.loginPage} embed ${formMode}`}>
      <Message className="red">
        <GetIcon icon={"error"} />
        <h2>{statusmessage.message}</h2>
      </Message>
    </FormContainer>
  ) : (
    <PageWrapper>
      {userRegistered ? (
        <FormContainer className={`${event.loginPage}  embed ${formMode}`}>
          <Message>
            <SuccessIcon></SuccessIcon>
            <h2>You’ve Registered Successfully!</h2>
            <h3 dangerouslySetInnerHTML={{ __html: message }}></h3>
          </Message>
        </FormContainer>
      ) : (
        input && (
          <FormContainer className={`${event.loginPage}  embed  ${formMode}`}>
            {!userRegistered && input?.length > 0 && (
              <React.Fragment>
                {ticket.banner && <Image src={import.meta.env.VITE_CDN + ticket.banner} alt="banner"></Image>}
                <FormHeader>
                  <span>
                    <strong>{ticket.title}</strong>
                    {single ? null : (
                      <>
                        , <br />
                        <span>Registration Form</span>
                      </>
                    )}

                    {ticket.enablePayment &&
                      (couponApplied ? (
                        <p style={{ fontSize: "14px", fontStyle: "italic" }}>
                          Congratulations! The coupon discount of {couponApplied.discountValue}% has been applied. You need to pay{" "}
                          <strong style={{ fontWeight: "bold" }}>{couponApplied.discountAmount}</strong> ({ticket.currency}) to complete this registration! -{" "}
                          <i>
                            {couponApplied.couponCode}
                            <span onClick={() => setCouponApplied(null)}>
                              <GetIcon icon={"delete"} />
                            </span>
                          </i>
                        </p>
                      ) : (
                        <p style={{ fontSize: "14px", fontStyle: "italic", lineHeight: "20px" }}>
                          You need to pay <strong style={{ fontWeight: "bold" }}>{ticket.paymentAmount}</strong> ({ticket.currency}) to complete this registration!
                          {ticket?.enableCoupenCode && (
                            <>
                              <br />
                              Do you have a coupon code?
                              <i
                                onClick={() => {
                                  // setMessage("");
                                  setCouponForm(true);
                                }}
                              >
                                Apply Here
                              </i>
                            </>
                          )}
                        </p>
                      ))}
                  </span>
                </FormHeader>

                <AutoForm
                  useCaptcha={false}
                  key={`type-${formId}`}
                  useCheckbox={false}
                  customClass="embed iframe"
                  description=""
                  formValues={{}}
                  formMode={formMode}
                  formType="post"
                  header=" "
                  formInput={input}
                  submitHandler={submitChange}
                  button={ticket.enablePayment ? "Pay & Register" : "Register Now"}
                  isOpenHandler={isCreatingHandler}
                  css="plain embed head-hide landing iframe"
                  isOpen={true}
                  plainForm={true}
                  consent={ticket.consent ? ticket.consentLetter : ""}
                />
              </React.Fragment>
            )}
            {!userRegistered && message?.length > 0 && <ErrorMessage>{message}</ErrorMessage>}
            {userRegistered && message?.length > 0 && (
              <Message>
                <SuccessIcon></SuccessIcon>
                <h2>You’ve Registered Successfully!</h2>
                <h3>{message}</h3>
              </Message>
            )}
            {ticket && couponForm && ticket?.enableCoupenCode && !couponApplied && (
              <Message>
                <AutoForm
                  useCaptcha={false}
                  key={`coupen-${couenFormId}`}
                  useCheckbox={false}
                  customClass={"embed"}
                  description={""}
                  formValues={{}}
                  formMode={"single"}
                  formType={"post"}
                  header={`<span style="font-size:14px;">Do you have a Coupon Code?</span>`}
                  formInput={[
                    {
                      type: "text",
                      placeholder: "Coupon Code",
                      name: "couponCode",
                      format: "uppercase",
                      default: "",
                      label: "Coupon Code",
                      minimum: 3,
                      info: "Enter your you Coupon code recived from the team!",
                      maximum: 15,
                      required: true,
                      add: true,
                    },
                    ...(message.length > 0
                      ? [
                          {
                            type: "html",
                            content: <ErrorMessage>{message}</ErrorMessage>,
                            name: "eror",
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
                    // setMessage("");
                  }}
                  css="landing"
                  isOpen={true}
                  plainForm={false}
                ></AutoForm>
              </Message>
            )}
          </FormContainer>
        )
      )}
    </PageWrapper>
  );
};

export default Registration;
