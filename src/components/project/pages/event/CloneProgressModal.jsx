import React from "react";
import styled from "styled-components";
import { GetIcon } from "../../../../icons";

const ProgressContainer = styled.div`
  padding: 24px;
  text-align: center;
  max-width: 420px;
  margin: 0 auto;
  position: relative;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;

  &:hover {
    background: #e5e7eb;
    color: #374151;
  }
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 6px 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
`;

const ProgressSection = styled.div`
  margin-bottom: 20px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: #f3f4f6;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: 6px;
  transition: width 0.5s ease;
  width: ${(props) => props.progress}%;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;

const ProgressText = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 8px;
`;

const CurrentStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 24px;
`;

const StatusIcon = styled.div`
  width: 24px;
  height: 24px;
  color: #3b82f6;
  animation: spin 1.5s linear infinite;

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
  text-align: left;
`;

const StatusTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
`;

const StatusDescription = styled.div`
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
`;

const StepsContainer = styled.div`
  text-align: left;
  max-height: 200px;
  overflow-y: auto;
`;

const StepItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  opacity: ${(props) => (props.completed ? 1 : props.active ? 1 : 0.6)};
  transition: all 0.3s ease;
`;

const StepIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
  transition: all 0.3s ease;

  ${(props) =>
    props.completed &&
    `
    background: #10b981;
    color: white;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  `}

  ${(props) =>
    props.active &&
    !props.completed &&
    `
    background: #3b82f6;
    color: white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    animation: pulse 2s infinite;
  `}
  
  ${(props) =>
    !props.active &&
    !props.completed &&
    `
    background: #e5e7eb;
    color: #9ca3af;
  `}
  
  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
`;

const StepText = styled.div`
  flex: 1;
`;

const StepTitle = styled.div`
  font-size: 13px;
  font-weight: ${(props) => (props.active ? 600 : 500)};
  color: ${(props) => (props.completed ? "#10b981" : props.active ? "#1f2937" : "#9ca3af")};
  margin-bottom: 1px;
  transition: all 0.3s ease;
`;

const StepDescription = styled.div`
  font-size: 11px;
  color: ${(props) => (props.completed ? "#059669" : props.active ? "#6b7280" : "#9ca3af")};
  line-height: 1.2;
  transition: all 0.3s ease;
`;

const CloneProgressModal = ({ progress = 0, currentStep = 0, eventTitle = "Event", onClose = () => {} }) => {
  const steps = [
    {
      title: "Creating Event Structure",
      description: "Setting up basic event information and configuration",
    },
    {
      title: "Cloning Tickets & Forms",
      description: "Copying registration forms, ticket types, and form fields",
    },
    {
      title: "Duplicating Speakers & Sessions",
      description: "Copying speakers, sessions, agenda, and program details",
    },
    {
      title: "Copying Sponsors & Exhibitors",
      description: "Duplicating sponsors, exhibitors, and their categories",
    },
    {
      title: "Setting Up Website & Pages",
      description: "Copying website design, landing pages, and content modules",
    },
    {
      title: "Configuring Settings & Permissions",
      description: "Applying settings, permissions, policies, and configurations",
    },
    {
      title: "Creating New Subdomain",
      description: "Setting up unique subdomain and domain configuration",
    },
    {
      title: "Finalizing Clone Process",
      description: "Completing the cloning and preparing the new event",
    },
  ];

  const currentStepInfo = steps[currentStep] || steps[steps.length - 1];

  return (
    <ProgressContainer>
      <CloseButton onClick={onClose} title="Cancel Clone">
        <GetIcon icon="close" />
      </CloseButton>

      <Header>
        <Title>🎯 Cloning Event</Title>
        <Subtitle>
          Creating a copy of "<strong>{eventTitle}</strong>"
        </Subtitle>
      </Header>

      <ProgressSection>
        <ProgressText>{Math.round(progress)}% Complete</ProgressText>
        <ProgressBar>
          <ProgressFill progress={progress} />
        </ProgressBar>

        <CurrentStatus>
          <StatusIcon>
            <GetIcon icon="progress" />
          </StatusIcon>
          <StatusText>
            <StatusTitle>{currentStepInfo.title}</StatusTitle>
            <StatusDescription>{currentStepInfo.description}</StatusDescription>
          </StatusText>
        </CurrentStatus>
      </ProgressSection>

      <StepsContainer>
        {steps.map((step, index) => (
          <StepItem key={index} completed={index < currentStep} active={index === currentStep}>
            <StepIcon completed={index < currentStep} active={index === currentStep}>
              {index < currentStep ? <GetIcon icon="check" /> : index + 1}
            </StepIcon>
            <StepText>
              <StepTitle completed={index < currentStep} active={index === currentStep}>
                {step.title}
              </StepTitle>
              <StepDescription completed={index < currentStep} active={index === currentStep}>
                {step.description}
              </StepDescription>
            </StepText>
          </StepItem>
        ))}
      </StepsContainer>
    </ProgressContainer>
  );
};

export default CloneProgressModal;
