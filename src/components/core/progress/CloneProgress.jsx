import React from "react";
import styled from "styled-components";
import { GetIcon } from "../../../icons";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 480px;
  width: 90%;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
`;

const ProgressContainer = styled.div`
  margin-bottom: 24px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: 4px;
  transition: width 0.3s ease;
  width: ${(props) => props.progress}%;
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
`;

const StatusIcon = styled.div`
  width: 16px;
  height: 16px;
  color: #3b82f6;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const StatusText = styled.div`
  flex: 1;
`;

const StatusTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 2px;
`;

const StatusDescription = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const StepsContainer = styled.div`
  margin-top: 20px;
`;

const StepItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  opacity: ${(props) => (props.completed ? 1 : props.active ? 1 : 0.5)};
`;

const StepIcon = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;

  ${(props) =>
    props.completed &&
    `
    background: #10b981;
    color: white;
  `}

  ${(props) =>
    props.active &&
    !props.completed &&
    `
    background: #3b82f6;
    color: white;
  `}
  
  ${(props) =>
    !props.active &&
    !props.completed &&
    `
    background: #e5e7eb;
    color: #9ca3af;
  `}
`;

const StepText = styled.div`
  font-size: 14px;
  color: ${(props) => (props.completed ? "#10b981" : props.active ? "#1f2937" : "#9ca3af")};
  font-weight: ${(props) => (props.active ? 500 : 400)};
`;

const CloneProgress = ({ isVisible, progress = 0, currentStep = 0, currentStatus = "Initializing clone process...", eventTitle = "Event" }) => {
  const steps = [
    "Creating event structure",
    "Cloning tickets and forms",
    "Copying speakers and sessions",
    "Duplicating sponsors and exhibitors",
    "Setting up website and landing pages",
    "Configuring settings and permissions",
    "Creating subdomain",
    "Finalizing clone",
  ];

  if (!isVisible) return null;

  return (
    <Overlay>
      <Modal>
        <Header>
          <Title>Cloning Event</Title>
          <Subtitle>Creating a complete copy of "{eventTitle}"</Subtitle>
        </Header>

        <ProgressContainer>
          <ProgressBar>
            <ProgressFill progress={progress} />
          </ProgressBar>

          <StatusContainer>
            <StatusIcon>
              <GetIcon icon="progress" />
            </StatusIcon>
            <StatusText>
              <StatusTitle>{steps[currentStep] || "Processing..."}</StatusTitle>
              <StatusDescription>{currentStatus}</StatusDescription>
            </StatusText>
          </StatusContainer>
        </ProgressContainer>

        <StepsContainer>
          {steps.map((step, index) => (
            <StepItem key={index} completed={index < currentStep} active={index === currentStep}>
              <StepIcon completed={index < currentStep} active={index === currentStep}>
                {index < currentStep ? <GetIcon icon="check" /> : index + 1}
              </StepIcon>
              <StepText completed={index < currentStep} active={index === currentStep}>
                {step}
              </StepText>
            </StepItem>
          ))}
        </StepsContainer>
      </Modal>
    </Overlay>
  );
};

export default CloneProgress;
