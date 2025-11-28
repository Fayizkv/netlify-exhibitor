import React from "react";
import styled from "styled-components";
import { GetIcon } from "../../../../../../icons";
import FormInput from "../../../../../core/input";
import { appTheme } from "../../../../brand/project";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid #e5e7eb; /* Tailwind's gray-300 */
  border: 1px solid ${appTheme.stroke.soft};
  border-radius: 0.375rem; /* Tailwind's rounded-lg */
  background-color: white;
  gap: 16px;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: baseline;
  min-width: 216px;
`;

const PhoneIcon = styled.div`
  display: flex;
  background: ${appTheme.bg.white};
  border: 1px solid ${appTheme.stroke.soft};
  border-radius: 50%;
  height: 40px;
  min-width: 40px;
  max-width: 40px;
  align-items: center;
  justify-content: center;
`;

const VerifiedText = styled.span`
  font-size: 16px;
  font-weight: 500;
  line-height: 19.36px;
  letter-spacing: -0.011em;
  text-align: left;
  color: ${appTheme.text.main};
  display: flex;
  gap: 10px;
  svg {
    color: ${appTheme.primary.success};
  }
`;

const PhoneNumber = styled.span`
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: -0.006em;
  text-align: left;
  color: ${appTheme.text.sub};
`;

const PhoneVerified = ({ phoneNumberData, onEdit, enableAuthentication }) => {
  return (
    <Container>
      <PhoneIcon>
        <GetIcon icon="call"></GetIcon>
      </PhoneIcon>
      <InfoContainer>
        <VerifiedText>
          <span>{enableAuthentication ? "Phone Number Verified" : "Personal Details"}</span>
          <GetIcon icon={"success"}></GetIcon>
        </VerifiedText>
        <PhoneNumber>
          {enableAuthentication
            ? "+" + phoneNumberData.phoneCode + phoneNumberData.authenticationId
            : phoneNumberData.firstName + " | +" + phoneNumberData.phoneCode + phoneNumberData.authenticationId}
        </PhoneNumber>
      </InfoContainer>
      <FormInput icon={"edit"} type="linkbutton" customClass="no-line" value={"Edit"} onChange={onEdit} />
    </Container>
  );
};

export default PhoneVerified;
