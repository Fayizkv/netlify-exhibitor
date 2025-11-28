import React, { useState, useMemo, useEffect } from "react";
import styled from "styled-components";
import { MoreVertical, MessageSquare, Plus } from "lucide-react";
import { getData } from "../../../../backend/api";
import { PageHeader } from "../../../core/input/heading";
import { AddButton } from "../../../core/list/styles";
import { GetIcon } from "../../../../icons";

const Container = styled.div`
  /* padding: 24px; */
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
`;

const TabList = styled.div`
  display: flex;
  gap: 32px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 16px;
`;

const Tab = styled.button`
  padding: 8px 0;
  border: none;
  background: none;
  color: ${(props) => (props.active ? "#3b82f6" : "#6b7280")};
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid ${(props) => (props.active ? "#3b82f6" : "transparent")};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  padding: 12px 16px;
  text-align: left;
  background-color: #f9fafb;
  color: #6b7280;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;

  &:first-child {
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
  }

  &:last-child {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #e5e7eb;

  &:hover {
    background-color: #f9fafb;
  }
`;

const TableCell = styled.td`
  padding: 16px;
  color: #374151;
`;

// const Checkbox = styled.input`
//   width: 16px;
//   height: 16px;
//   border-radius: 4px;
//   cursor: pointer;
//   border: 1.5px solid #d1d5db;

//   &:checked {
//     background-color: #4361ee;
//     border-color: #4361ee;
//   }
// `;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;

  ${(props) => {
    switch (props.status.toLowerCase()) {
      case "draft":
        return "background-color: #fff3e0; color: #ed6c02;";
      case "scheduled":
        return "background-color: #e3f2fd; color: #1976d2;";
      case "completed":
        return "background-color: #e8f5e9; color: #2e7d32;";
      case "cancelled":
        return "background-color: #ffebee; color: #d32f2f;";
      default:
        return "background-color: #f5f5f5; color: #616161;";
    }
  }}
`;

const ColorBar = styled.div`
  width: 4px;
  height: 24px;
  background-color: ${(props) => props.color};
  border-radius: 2px;
  margin-right: 16px;
`;

const RowWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background-color: white;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #f9fafb;
    border-color: #9ca3af;
  }
`;

// Empty State Components
const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 0;
  text-align: center;
`;

const IconWrapper = styled.div`
  width: 140px;
  height: 140px;
  background-color: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  position: relative;

  &::before {
    content: "✨";
    position: absolute;
    top: 0;
    right: 10px;
    font-size: 24px;
  }

  &::after {
    content: "✨";
    position: absolute;
    bottom: 10px;
    left: 10px;
    font-size: 24px;
  }
`;

const MessageIcon = styled.div`
  position: relative;

  svg {
    color: #9ca3af;
  }

  &::before {
    content: "";
    position: absolute;
    top: -10px;
    right: -15px;
    width: 32px;
    height: 32px;
    background-color: #f3f4f6;
    border-radius: 8px;
    transform: rotate(45deg);
  }

  svg:last-child {
    position: absolute;
    top: -20px;
    right: -25px;
  }
`;

const EmptyTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
`;

const EmptyText = styled.p`
  color: #6b7280;
  margin-bottom: 24px;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const TabContainer = styled.div`
  margin-bottom: 24px;
`;

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  min-width: 120px;
  gap: 8px;

  ${(props) =>
    props.variant === "primary" &&
    `
    background: #4361ee;
    color: white;
    border: none;
    
    &:hover {
      background: #2541df;
      box-shadow: 0 4px 12px rgba(67, 97, 238, 0.15);
    }
    
    &:active {
      background: #1f38b3;
      box-shadow: none;
    }
  `}

  ${(props) =>
    props.variant === "secondary" &&
    `
    background: transparent;
    color: #4361ee;
    border: 1px solid #4361ee;
    
    &:hover {
      background: rgba(67, 97, 238, 0.05);
      border-color: #2541df;
      color: #2541df;
    }
    
    &:active {
      background: rgba(67, 97, 238, 0.1);
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #6b7280;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const EmailCampaignsList = (props) => {
  const eventId = props.openData.data._id;
  const [activeTab, setActiveTab] = useState("All");
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = ["All", "Draft", "Scheduled", "Completed", "Cancelled"];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const response = await getData({ event: eventId }, "campaign");
        setCampaigns(response.data.response);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [eventId]);

  const filteredCampaigns = useMemo(() => {
    if (activeTab === "All") return campaigns;

    return campaigns.filter((campaign) => {
      const status = campaign.status.toLowerCase();
      const filter = activeTab.toLowerCase();
      return status === filter;
    });
  }, [activeTab, campaigns]);

  const hasData = filteredCampaigns.length > 0;

  const handleCreateCampaign = () => {
    if (props.onCreateClick) {
      props.onCreateClick();
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "draft":
        return "#9c27b0";
      case "scheduled":
        return "#2196f3";
      case "completed":
        return "#2e7d32";
      case "cancelled":
        return "#d32f2f";
      default:
        return "#9c27b0";
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <span>Loading campaigns...</span>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <HeaderSection>
        <PageHeader dynamicClass="sub" line={false} title={"Email Campaigns"} description={"Send emails to the registered attendees!"}></PageHeader>

        <AddButton onClick={() => handleCreateCampaign}>
          <GetIcon icon={"add"}></GetIcon>
          <span>Create Campaign</span>
        </AddButton>
      </HeaderSection>

      <TabContainer>
        <TabList>
          {tabs.map((tab) => (
            <Tab key={tab} active={tab === activeTab} onClick={() => setActiveTab(tab)}>
              {tab}
            </Tab>
          ))}
        </TabList>
      </TabContainer>

      {!hasData ? (
        <EmptyStateContainer>
          <IconWrapper>
            <MessageIcon>
              <MessageSquare size={48} />
              <MessageSquare size={48} />
            </MessageIcon>
          </IconWrapper>
          <EmptyTitle>{activeTab === "All" ? "You haven't created any campaigns yet. Would you like to create one?" : `No ${activeTab.toLowerCase()} campaigns found.`}</EmptyTitle>
          <EmptyText>{activeTab === "All" ? "Get started by creating your first email campaign" : `Create a new campaign or switch filters to see other campaigns`}</EmptyText>
          <StyledButton variant="primary" onClick={handleCreateCampaign}>
            <Plus size={20} />
            Create campaign
          </StyledButton>
        </EmptyStateContainer>
      ) : (
        <Table>
          <thead>
            <tr>
              <TableHeader>Campaign Name</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Audience Count</TableHeader>
              <TableHeader>Last Updated at</TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </thead>
          <tbody>
            {filteredCampaigns.map((campaign) => (
              <TableRow key={campaign._id}>
                <TableCell>
                  <RowWrapper>
                    <ColorBar color={getStatusColor(campaign.status)} />
                    {campaign.name}
                  </RowWrapper>
                </TableCell>
                <TableCell>
                  <StatusBadge status={campaign.status}>{campaign.status}</StatusBadge>
                </TableCell>
                <TableCell>{campaign.audienceCount}</TableCell>
                <TableCell>{formatDate(campaign.updatedAt)}</TableCell>
                <TableCell>
                  <ActionsContainer>
                    <div style={{ cursor: "pointer" }}>
                      <MoreVertical size={20} color="#6b7280" />
                    </div>
                    {(campaign.status.toLowerCase() === "draft" || campaign.status.toLowerCase() === "scheduled") && <ActionButton>Edit</ActionButton>}
                  </ActionsContainer>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default EmailCampaignsList;
