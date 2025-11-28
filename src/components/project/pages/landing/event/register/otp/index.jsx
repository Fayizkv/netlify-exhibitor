import { useEffect, useState } from "react";
// import { Footer } from "../../../../../../core/form/styles";
import FormInput from "../../../../../../core/input";
import styled from "styled-components";
import { appTheme } from "../../../../../brand/project";
import { Header } from "../../../../../../core/list/manage/styles";
import { Footer } from "../../../../../../core/list/create/styles";
import ErrorLabel from "../../../../../../core/input/error";
const FormBox = styled.div`
  z-index: 1001;
  top: 0;
  right: 0;
  background: white;
  left: 0;
  bottom: 0;
  overflow: auto;
  padding: 0px;
  align-items: baseline;
  display: flex;
  flex-direction: column;
  gap: 24px;
  .center {
    margin: auto;
  }
  label {
    margin: auto;
    display: flex;
    text-align: center;
    justify-content: center;
    font-size: 20px;
    margin-bottom: 0;
  }
`;
const OtpInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
const OtpContainer = styled.div`
  display: flex;
  margin: 0px auto;
  justify-content: center;
  gap: 10px;
`;
const ResendCode = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 4px;
  > div {
    font-family: Inter;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: -0.006em;
    text-align: center;
    color: ${appTheme.text.sub};
  }
`;
const OtpBox = styled.input`
  width: 85px;
  height: 65px;
  font-size: 20px;
  text-align: center;
  border: none;
  border: 1px solid ${appTheme.stroke.soft};
  outline: none;
  border-radius: 10px;
  font-size: 24px;
  font-weight: 500;
  line-height: 32px;
  letter-spacing: -0.015em;
`;

const OTPForm = ({ handleSubmit, authenticationId, error, resendOtp, event, country, onEdit }) => {
  const [otp, setOTP] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [otpEnterd, setOTPEntered] = useState(false);
  const [reset, setReset] = useState(false);
  // Timer logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    if (reset && timer === 0) {
      setTimer(90); // Reset timer to 90 seconds
      setReset(false);
    }

    return () => clearInterval(interval);
  }, [timer, reset]);

  const handleChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    if (index < 3) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
    setOTP(newOtp);
    const isFilled = newOtp.every((digit) => digit !== "");
    setOTPEntered(isFilled);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && index > 0 && !otp[index]) {
      // Move focus to the previous box on Backspace
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOTP(newOtp);
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  return (
    <FormBox
      onSubmit={(event) => {
        event.preventDefault();
        // alert("yes");
      }}
      action="#"
      method="POST"
      className={`plain embed`}
    >
      <Header className={`embed form`}>
        <div>
          <span>Verify your account</span>
          <FormInput customClass="no-line" icon={"edit"} type="linkbutton" value={"Edit"} onChange={onEdit} />
        </div>
        <span>{`We’ve sent a code to ${"+" + country.phoneCode + authenticationId}`}</span>
      </Header>
      <OtpInputContainer>
        <OtpContainer>
          {otp.map((digit, index) => (
            <OtpBox
              placeholder="-"
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          ))}
        </OtpContainer>
        <ErrorLabel error={error} />
      </OtpInputContainer>
      {/* <TextBox type="number" label="Enter OTP" value={otp} onChange={handleChange} maxLength={4} placeholder="Enter OTP" /> */}
      <Footer className={"plain embed"}>
        {/* <FormInput
            disabled={timer > 0}
            type="close"
            value={timer > 0 ? `Resend OTP (${timer}s)` : "Resend OTP"}
            onChange={() => {
              setReset(true);
              resendOtp();
            }}
          /> */}
        <FormInput disabled={!otpEnterd} css="embed" type="submit" name="submit" value={"Submit OTP"} onChange={() => handleSubmit({ otp: otp.join("") })} />
      </Footer>
      {timer === 0 && (
        <ResendCode>
          <div>Experiencing issues receiving the code?</div>
          <FormInput
            disabled={timer > 0}
            type="linkbutton"
            value={timer > 0 ? `Resend OTP (${timer}s)` : "Resend OTP"}
            onChange={() => {
              setReset(true);
              resendOtp();
            }}
          />
        </ResendCode>
      )}
    </FormBox>
  );
};

export default OTPForm;
