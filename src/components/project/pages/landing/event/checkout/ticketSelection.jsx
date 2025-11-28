import React, { useState } from "react";
import { GetIcon, SuccessIcon } from "../../../../../../icons";
import moment from "moment";
import { Line } from "../../../../../core/input/styles";
import { Button, TextBoxWithButton } from "../../../../../core/elements";
import { PlainNoData } from "../../../../../core/list/nodata";
import { postData } from "../../../../../../backend/api";
import {
  Availability,
  CenterBox,
  ColumnOne,
  ColumnTwo,
  Container,
  Content,
  DiscountedPrice,
  DiscountedTag,
  Eligibility,
  Footer,
  Forms,
  Header,
  HeaderText,
  Heading,
  Item,
  LeftBox,
  Logo,
  Navigation,
  Note,
  OrderSummary,
  Price,
  PriceSummary,
  QuantityButton,
  QuantityControl,
  QuantityInput,
  Remaining,
  RightBox,
  Round,
  SalesEndDate,
  Section,
  SessionLink,
  Subtitle,
  Success,
  Tags,
  Thumbnail,
  TicketCard,
  TicketContent,
  TicketDescription,
  TicketItem,
  TicketListings,
  TicketPrice,
  TicketSection,
  TicketTitle,
  Title,
} from "./styles";
import AutoForm from "../../../../../core/autoform/AutoForm";
import OTPForm from "../register/otp";
import PhoneVerified from "./verfied";
import { Attendees } from "./attendes";
import { logo } from "../../../../../../images";
import { timeFormat } from "../../../../../core/functions/date";
const Checkout = ({ data, tickets, setLoaderBox }) => {
  const [disableContinue, setDisableContinue] = useState(true);
  const [formData, setFormData] = useState({});
  const [quantities, setQuantities] = useState({});
  const [primary, setPrimary] = useState({});
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponStatus, setCouponStatus] = useState("");
  const [couponTickets, setCouponTickets] = useState([]);
  const [discountInfo, setDiscountInfo] = useState(null); // State to hold discount info
  const [couponSuccess, setCouponSuccess] = useState("");
  const [selectedTicketCount, setSelectedTicketCount] = useState(0);
  const handleQuantityChange = (ticketId, change) => {
    setQuantities((prev) => {
      const currentQuantity = prev[ticketId] || 0;
      const ticket = tickets.find((t) => t._id === ticketId); // Find the ticket in the tickets array

      // Check if the change is to increase the quantity
      if (change > 0 && currentQuantity >= ticket.maximumBuying) {
        // If the current quantity is already at maximum, do not increase it
        return prev;
      }

      const newQuantity = Math.max(0, currentQuantity + change);

      // Calculate the total selected ticket count
      const updatedQuantities = {
        ...prev,
        [ticketId]: newQuantity,
      };

      // Update the selected ticket count
      const totalSelected = Object.values(updatedQuantities).reduce((total, qty) => total + qty, 0);
      setSelectedTicketCount(totalSelected);
      setDisableContinue(totalSelected === 0);
      return updatedQuantities;
    });
  };

  //verfication
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState(1);
  const [phoneNumberData, setPhoneNumberData] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [formError, setFormError] = useState("");

  const handleSendCode = async (values) => {
    try {
      setLoaderBox(true);
      if (data.event.enableAuthentication) {
        const response = await postData(
          {
            ...values,
            event: data.event._id,
            franchise: data.event.franchise._id,
          },
          "checkout/send-verification-code"
        );

        if (response.status === 200) {
          console.log(response.data.message); // Optionally log or display the success message
          setPhoneNumberData(values); // Update the phone number state
          setPrimary(values);
          setStep(2); // Move to the next step in the process
          setFormError(""); // Clear any previous errors
          setSubStep(2);
        } else {
          // Handle errors from the API response
          console.error("Sending verification code failed:", response.data.message);
          setFormError(response.data.message); // Set the error message for user feedback
        }
      } else {
        setSubStep(2);
        setPhoneNumberData(values); // Update the phone number state
        setPrimary(values);
        setStep(3); // Move to the next step in the verification process
        setFormError(""); // Clear any previous errors
        setVerificationCode("");
      }
      setLoaderBox(false);
    } catch (error) {
      setLoaderBox(false);
      console.error("Error during sending verification code:", error);
      setFormError("An error occurred while sending the verification code."); // Set a generic error message
    }
  };

  const handleVerifyCode = async (oneTimePassword) => {
    try {
      setLoaderBox(true);
      const response = await postData(
        {
          ...phoneNumberData,
          oneTimePassword: oneTimePassword.otp,
          event: data.event._id,
          franchise: data.event.franchise._id,
        },
        "checkout/verify-code"
      );

      if (response.status === 200) {
        console.log(response.data.message); // Optionally log or alert the success message
        setStep(3); // Move to the next step in the verification process
        setFormError(""); // Clear any previous errors
        setVerificationCode(oneTimePassword.otp);
      } else {
        console.error("Verification failed:", response.data.message);
        setFormError(response.data.message); // Set the error message for user feedback
      }
      setLoaderBox(false);
    } catch (error) {
      console.error("Error during verification:", error);
      setLoaderBox(false);
      setFormError("An error occurred during verification."); // Set a generic error message
    }
  };

  const handleChangePhoneNumber = () => {
    setStep(1); // Go back to step 1
    setSubStep(1);
    setDisableContinue(true);
    setPhoneNumberData(""); // Clear the phone number input
    setVerificationCode(""); // Clear the verification code input
    setFormError(""); // Clear any previous errors
  };

  const [stages] = useState([
    { id: 1, label: "Select Tickets" },
    { id: 2, label: "Attendee details" },
    { id: 3, label: "Checkout" },
  ]);
  const [activeStages, setSctiveStages] = useState(1);
  // const getTotalPrice = () => {
  //   return tickets.reduce((total, ticket) => total + (quantities[ticket._id] || 0) * (ticket.price - ticket.price * (ticket.discountValue / 100)), 0);
  // };
  const getTotalPrice = () => {
    return tickets.reduce((total, ticket) => {
      const quantity = quantities[ticket._id] || 0;
      if (quantity > 0) {
        // Check if the ticket is in the eligible tickets
        const isEligible = couponTickets.some((eligibleTicket) => eligibleTicket._id === ticket._id);

        // Calculate the base price considering the ticket's own discount
        const basePrice = ticket.price - ticket.price * (ticket.discountValue / 100);

        // Calculate the discounted price based on the coupon if applicable
        const discountedPrice = isEligible && discountInfo && discountInfo.type === "percentage" ? basePrice - basePrice * (discountInfo.value / 100) : basePrice; // Apply coupon discount if it exists and is applicable

        // Add to total based on the quantity of tickets selected
        if (basePrice > 0) {
          return total + (quantities[ticket._id] || 0) * discountedPrice;
        } else {
          return total;
        }
      } else {
        return total;
      }
    }, 0);
  };
  const getOriginalPrice = () => {
    return tickets.reduce((total, ticket) => {
      const quantity = quantities[ticket._id] || 0;
      if (quantity > 0) {
        // Calculate the base price considering the ticket's own discount
        const basePrice = ticket.price - ticket.price * (ticket.discountValue / 100);

        // Add to total based on the quantity of tickets selected
        if (basePrice > 0) {
          return total + (quantities[ticket._id] || 0) * basePrice;
        } else {
          return total;
        }
      } else {
        return total;
      }
    }, 0);
  };
  const getTotalDicount = () => {
    return tickets.reduce((total, ticket) => {
      const quantity = quantities[ticket._id] || 0;
      if (quantity > 0) {
        // Check if the ticket is in the eligible tickets
        const isEligible = couponTickets.some((eligibleTicket) => eligibleTicket._id === ticket._id);

        // Calculate the base price considering the ticket's own discount
        const basePrice = ticket.price - ticket.price * (ticket.discountValue / 100);

        // Calculate the discounted price based on the coupon if applicable
        const discountedPrice = isEligible && discountInfo && discountInfo.type === "percentage" ? basePrice * (discountInfo.value / 100) : basePrice; // Apply coupon discount if it exists and is applicable

        // Add to total based on the quantity of tickets selected
        if (basePrice > 0) {
          return total + (quantities[ticket._id] || 0) * discountedPrice;
        } else {
          return total;
        }
      } else {
        return total;
      }
    }, 0);
  };
  const getDiscountCount = () => {
    return tickets.reduce((total, ticket) => {
      const quantity = quantities[ticket._id] || 0;
      const isEligible = couponTickets.some((eligibleTicket) => eligibleTicket._id === ticket._id);
      if (quantity > 0 && isEligible) {
        return total + 1 * quantity;
      } else {
        return total;
      }
    }, 0);
  };
  const formatDateRange = (startDate, endDate) => {
    const start = moment(startDate).format("MMM D");
    const end = moment(endDate).format("MMM D, YYYY");
    return `${start} to ${end}`;
  };

  const calculateTax = () => {
    const total = getTotalPrice();
    const taxRate = 0.18; // Example: 18% tax - modify as needed
    return total * taxRate;
  };
  const [country] = useState(data.event.countries?.[0]);
  const calculateTotalAmount = () => {
    const total = getTotalPrice();
    return total;
  };
  const submitForm = async () => {
    const response = await postData({ data: JSON.stringify({ formData, quantities }), verificationCode }, "authentication/checkout");
    if (response.status === 200) {
    }
    setSctiveStages(3);
    setDisableContinue(true);
  };
  const handlePhaseChange = () => {
    switch (activeStages) {
      case 1:
        setSctiveStages(2);
        setSubStep(2);
        setDisableContinue(true);
        break;
      case 2:
        submitForm();
        // setSctiveStages(3);
        // setDisableContinue(true);
        break;
      case 3:
        submitForm();
        setSctiveStages(4);
        setDisableContinue(true);
        break;
      default:
        break;
    }
  };
  return (
    <React.Fragment>
      <Section background={"url(" + import.meta.env.VITE_CDN + data.event.banner + ")"}>
        <Container>
          <Header>
            <Logo src={import.meta.env.VITE_CDN + data.event.logo}></Logo>
            <HeaderText>
              <Title>{data.event.title}</Title>
              <Subtitle>
                <Item>
                  <GetIcon icon={"date"} />
                  {formatDateRange(data.event.startDate, data.event.endDate)}
                </Item>
                <Item>
                  <GetIcon icon={"location"} />
                  {data.event.venue}
                </Item>
              </Subtitle>
            </HeaderText>
          </Header>
        </Container>
      </Section>
      <Section>
        <Container>
          <Navigation>
            {stages.map((stage, index) => {
              const isActive = activeStages === stage.id;
              const isDone = activeStages > stage.id;
              const statusClass = isActive ? "active" : isDone ? "done" : "upcoming";

              return (
                <React.Fragment key={stage.id}>
                  {index > 0 && <GetIcon icon={"arrowRight"} />}
                  <Round className={statusClass}>{isDone ? <GetIcon icon={"tick"}></GetIcon> : stage.id}</Round>
                  <span className={statusClass}>{stage.label}</span>
                </React.Fragment>
              );
            })}
          </Navigation>

          <Content>
            {activeStages === 1 ? (
              <TicketSection>
                <Heading>Choose your tickets!</Heading>
                <Line />
                {tickets.map((ticket) => (
                  <TicketCard key={ticket._id}>
                    <TicketContent>
                      <LeftBox>
                        <Thumbnail src={import.meta.env.VITE_CDN + ticket.thumbnail} alt="Ticket Thumbnail" />
                        <Remaining>
                          <GetIcon icon={"info"}></GetIcon>
                          {ticket.numberOfTicketsToBeSold} Remainig
                        </Remaining>
                      </LeftBox>

                      <CenterBox>
                        <TicketTitle>
                          <span>{ticket.title} </span>
                          {ticket.needsApproval ? <Availability>Approval Required</Availability> : null}
                        </TicketTitle>
                        {ticket.description?.length > 0 && <TicketDescription>{ticket.description}</TicketDescription>}
                        <SessionLink>{`${timeFormat(ticket.startDate)}-${timeFormat(ticket.endDate)}`}</SessionLink>
                        {/* <SessionLink href={`/sessions/${ticket.sessionId}`}>View Session</SessionLink> */}
                        <Tags>
                          <SalesEndDate>{(ticket.enablePricing ? "Sales ends on" : "Registration ends on ") + moment(ticket.salesEndsOn).format("MMM D, YYYY")}</SalesEndDate>
                          {couponTickets.some((eligibleTicket) => eligibleTicket._id === ticket._id) ? <Eligibility className="green">COUPON APPLIED</Eligibility> : <Eligibility></Eligibility>}
                        </Tags>
                      </CenterBox>

                      <RightBox>
                        <TicketPrice>
                          {ticket.enablePricing ? (
                            <>
                              <Price>
                                ₹<span>{ticket.price - (ticket.price * ticket.discountValue) / 100}</span>
                              </Price>
                              {ticket.discountValue > 0 && (
                                <>
                                  <DiscountedPrice>
                                    <span>₹{ticket.price}</span> <span>- {ticket.discountValue}%</span>
                                  </DiscountedPrice>
                                  <DiscountedTag>{ticket.discountTag}</DiscountedTag>
                                </>
                              )}
                            </>
                          ) : (
                            ""
                          )}
                        </TicketPrice>
                        {(ticket.maximumBuying === 1) & (quantities[ticket._id] === 1) ? (
                          <QuantityControl className="red" onClick={() => handleQuantityChange(ticket._id, -1)}>
                            Remove
                          </QuantityControl>
                        ) : quantities[ticket._id] > 0 ? (
                          <QuantityControl>
                            <QuantityButton onClick={() => handleQuantityChange(ticket._id, -1)}>-</QuantityButton>
                            <QuantityInput value={quantities[ticket._id] || 0} readOnly />
                            <QuantityButton onClick={() => handleQuantityChange(ticket._id, 1)}>+</QuantityButton>
                          </QuantityControl>
                        ) : (
                          <QuantityControl onClick={() => handleQuantityChange(ticket._id, 1)}>Add</QuantityControl>
                        )}
                      </RightBox>
                    </TicketContent>
                  </TicketCard>
                ))}
              </TicketSection>
            ) : activeStages === 2 ? (
              <TicketSection>
                <Heading>{data.event.enableAuthentication ? "Verify" : "Primary Details"}</Heading> <Line />
                {step === 1 && (
                  <React.Fragment>
                    {country && (
                      <AutoForm
                        key={"sendcode"}
                        formValues={primary}
                        description={data.event.enableAuthentication ? "Enter your mobile number" : ""}
                        header={data.event.enableAuthentication ? "Authenticate your account" : "Provide your necessary information!"}
                        formInput={[
                          {
                            type: "text",
                            placeholder: "Full Name",
                            name: "firstName",
                            format: "propercase",
                            validation: "name",
                            default: "",
                            label: "Full Name",
                            minimum: 3,
                            info: "",
                            maximum: 40,
                            required: true,
                            add: true,
                          },
                          {
                            type: "mobilenumber",
                            placeholder: `Enter your phone number`,
                            name: "authenticationId",
                            validation: "mobileNumber",
                            default: "",
                            label: `Phone Number`,
                            minimum: 0,
                            countries: data.event.countries,
                            required: true,
                            add: true,
                          },
                          {
                            type: "email",
                            placeholder: "Email ID",
                            name: "emailId",
                            customClass: "half",
                            validation: "email",
                            info: "We will use this Email-ID for further email communication!",
                            default: "",
                            label: "Email ID",
                            minimum: 0,
                            maximum: 50,
                            required: data.event.collectEmailId ? true : false,
                            add: true,
                          },
                          {
                            type: "select",
                            placeholder: "Gender",
                            name: "gender",
                            validation: "",
                            default: "",
                            tag: true,
                            label: "Gender",
                            showItem: "Gender",
                            required: true,
                            view: true,
                            filter: false,
                            add: true,
                            update: true,
                            apiType: "CSV",
                            selectApi: "Male,Female",
                          },
                          {
                            type: "number",
                            placeholder: "Contact Number",
                            name: "contactNumber",
                            validation: "",
                            default: "",
                            tag: true,
                            label: "Contact Number",
                            required: true,
                            view: true,
                            add: true,
                            update: true,
                          },
                          {
                            type: "number",
                            placeholder: "Birth Year",
                            name: "birthYear",
                            validation: "",
                            default: "",
                            tag: true,
                            label: "Birth Year",
                            required: true,
                            view: true,
                            add: true,
                            update: true,
                          },
                          {
                            type: "text",
                            placeholder: "Street, City, State, Country, Zip Code",
                            name: "address",
                            validation: "",
                            default: "",
                            tag: true,
                            label: "Address",
                            required: true,
                            view: true,
                            add: true,
                            update: true,
                          },
                          {
                            type: "select",
                            placeholder: "Country",
                            name: "country",
                            validation: "",
                            default: "",
                            tag: true,
                            label: "Country",
                            required: true,
                            selectApi:
                              "Saudi Arabia, India, United Arab Emirates, Kuwait, Qatar, Bahrain, Oman, Germany, France, Italy, Spain, Netherlands, China, Japan, South Korea, Singapore, United States, Canada, United Kingdom, Brazil, Mexico"
                                .split(",")
                                .map((item) => {
                                  return { id: item.trim(), value: item.trim() };
                                }),
                            apiType: "JSON",
                            view: true,
                            add: true,
                            update: true,
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
                        ]}
                        css="plain embed checkout"
                        button={data.event.enableAuthentication ? "Send Code" : "Next"}
                        submitHandler={handleSendCode}
                      ></AutoForm>
                    )}
                  </React.Fragment>
                )}
                {step === 2 && (
                  <React.Fragment>
                    <OTPForm
                      handleSubmit={handleVerifyCode}
                      authenticationId={phoneNumberData.authenticationId}
                      error={formError}
                      onEdit={handleChangePhoneNumber}
                      resendOtp={() => setFormError("")}
                      event={data.event}
                      country={phoneNumberData}
                    ></OTPForm>
                  </React.Fragment>
                )}
                {step === 3 && (
                  <Forms>
                    <PhoneVerified enableAuthentication={data.event.enableAuthentication} phoneNumberData={phoneNumberData} onEdit={handleChangePhoneNumber}></PhoneVerified>
                    <Heading>Additional Informations</Heading>
                    <Attendees
                      statusChange={(status, data) => {
                        if (status) {
                          setFormData(data);
                          setDisableContinue(false);
                        } else {
                          setFormData(null);
                          setDisableContinue(true);
                        }
                      }}
                      tickets={tickets}
                      quantities={quantities}
                    ></Attendees>
                  </Forms>
                )}
              </TicketSection>
            ) : activeStages === 3 ? (
              <TicketSection>
                <Success>
                  <SuccessIcon></SuccessIcon>
                  <h2>You’ve registered successfully</h2>
                  <h3>Thank you for registering</h3>
                  <div>
                    <Button value="Book Another" ClickEvent={() => window.location.reload()}></Button>
                  </div>
                </Success>
              </TicketSection>
            ) : (
              <TicketSection />
            )}
            {selectedTicketCount > 0 ? (
              <OrderSummary className={`${activeStages === 3 ? "hide" : ""} ${step === 1 && subStep === 2 ? "hm" : ""}`}>
                <Heading>Order Details</Heading>
                <TicketListings>
                  {getOriginalPrice() > 0 && (
                    <TextBoxWithButton
                      icon={"ticket"}
                      onClick={async (status) => {
                        if (couponStatus) {
                          setCouponStatus(null);
                          setCouponTickets([]);
                          setCouponError("");
                          setDiscountInfo(null);
                          setCouponError("");
                          setCouponStatus("");
                          setCouponSuccess("");
                          setCouponInput("");
                        } else {
                          setLoaderBox(true);
                          await postData({ event: data.event._id, couponCode: couponInput }, "authentication/verify-event-coupen").then((res) => {
                            if (res.status === 200) {
                              console.log(res.data);
                              setCouponStatus(res.data);
                              setCouponTickets(res.data.tickets);
                              setCouponError("");
                              setCouponSuccess(res.data.discountType === "percentage" ? `${res.data.discountValue}% off applied` : `Rs.${res.data.discountValue}% off applied`);
                              setDiscountInfo({
                                type: res.data.discountType,
                                value: res.data.discountValue,
                              });
                            } else {
                              setCouponStatus(null);
                              setCouponTickets([]);
                              setCouponError("");
                              setDiscountInfo(null);
                              setCouponError(res.customMessage);
                              setCouponStatus("");
                              setCouponSuccess("");
                              setCouponInput("");
                            }
                            setLoaderBox(false);
                          });

                          if (couponInput.length === 0) {
                            setCouponError("Please enter a promo code!");
                          }
                        }
                      }}
                      onChange={(value) => !couponStatus && setCouponInput(value)}
                      status={couponStatus ? true : false}
                      text={couponStatus ? "Remove" : "Apply"}
                      success={couponSuccess}
                      label="Promotions"
                      error={couponError}
                      value={couponInput}
                      placeholder="Enter Code"
                    ></TextBoxWithButton>
                  )}
                  <TicketItem className="head">
                    <ColumnOne>Tickets</ColumnOne>
                    {getOriginalPrice() > 0 && <ColumnTwo>Price</ColumnTwo>}
                  </TicketItem>
                  {tickets.map((ticket) => {
                    const quantity = quantities[ticket._id] || 0;

                    if (quantity > 0) {
                      return (
                        <TicketItem key={ticket._id}>
                          <ColumnOne>
                            <span>{ticket.title}</span> <span>{ticket.price > 0 ? `${quantity} x ₹${(ticket.price - ticket.price * (ticket.discountValue / 100)).toFixed(2)}` : ""}</span>
                          </ColumnOne>
                          <ColumnTwo>
                            {ticket.price > 0 ? (
                              ticket.price - ticket.price * (ticket.discountValue / 100) > 0 ? (
                                <span>₹{(quantity * (ticket.price - ticket.price * (ticket.discountValue / 100))).toFixed(2)}</span>
                              ) : (
                                <span>Free</span>
                              )
                            ) : (
                              <span></span>
                            )}
                          </ColumnTwo>
                        </TicketItem>
                      );
                    }
                    return null;
                  })}
                  <Line />
                  {getOriginalPrice() > 0 ? (
                    <PriceSummary>
                      <ColumnOne>
                        <span>Original Price</span>
                        <span>{selectedTicketCount} Tickets</span>
                      </ColumnOne>
                      <ColumnTwo>₹{getOriginalPrice().toFixed(2)}</ColumnTwo>
                    </PriceSummary>
                  ) : (
                    <PriceSummary>
                      <ColumnOne>Total</ColumnOne>
                      <ColumnTwo>{selectedTicketCount} Tickets</ColumnTwo>
                    </PriceSummary>
                  )}
                  {couponStatus && (
                    <React.Fragment>
                      <PriceSummary className="green">
                        <ColumnOne>
                          <span>Total Discount - {discountInfo.value}%</span>
                          <span>{getDiscountCount()} Tickets</span>
                        </ColumnOne>
                        <ColumnTwo>{getTotalDicount().toFixed(2)}</ColumnTwo>
                      </PriceSummary>
                    </React.Fragment>
                  )}
                  <Line />
                  {calculateTotalAmount() > 0 && (
                    <React.Fragment>
                      <PriceSummary>
                        <ColumnOne>Total Amount</ColumnOne>
                        <ColumnTwo>₹{calculateTotalAmount().toFixed(2)}</ColumnTwo>
                      </PriceSummary>
                      <PriceSummary>
                        <ColumnOne>Tax</ColumnOne>
                        <ColumnTwo>₹{calculateTax().toFixed(2)}</ColumnTwo>
                      </PriceSummary>
                      <Line />
                      <PriceSummary>
                        <ColumnOne>Grand Total</ColumnOne>
                        <ColumnTwo>₹{(calculateTotalAmount() + calculateTax()).toFixed(2)}</ColumnTwo>
                      </PriceSummary>
                    </React.Fragment>
                  )}
                </TicketListings>
                {/* {JSON.stringify({ step, activeStages })} */}

                <Footer>
                  <Note>Note: All registrations are required to participate in the particular activations. An entry ticket is applicable to enter the carnival.</Note>
                  <Button isDisabled={disableContinue} ClickEvent={handlePhaseChange} type="full-width" value="Continue" />
                  <div>
                    Developed by <img src={logo} alt="logo"></img>
                  </div>
                </Footer>
              </OrderSummary>
            ) : (
              <OrderSummary>
                <Heading>Ticket Details</Heading>
                <PlainNoData className="hm" icon={"ticket"} title={"Choose tickets to continue"}></PlainNoData>
                <Footer>
                  <Button isDisabled={disableContinue} ClickEvent={handlePhaseChange} type="full-width" value="Continue" />
                  <div>
                    Developed by <img src={logo} alt="logo"></img>
                  </div>
                </Footer>
              </OrderSummary>
            )}
          </Content>
        </Container>
      </Section>
    </React.Fragment>
  );
};

export default Checkout;
