import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { RowContainer } from "../../../../../styles/containers/styles";
import { ButtonPanel } from "../../../../../core/list/styles";
import { Button } from "../../../../../core/elements";
import Search  from "../../../../../core/search";
import NoDataFound  from "../../../../../core/list/nodata";
import Loader  from "../../../../../core/loader";
import { useToast } from "../../../../../core/toast";
import { SubPageHeader } from "../../../../../core/input/heading";
import { getData, putData, deleteData} from "../../../../../../backend/api";
import  AutoForm  from "../../../../../core/autoform/AutoForm";
import { positionRewardsAttributes } from "./rewards";
import { ThreeDotMenu } from "../../../../../core/list/threedotmenu";

// Note: Styled card component for position rewards - matching event card design
const RewardCard = styled.div`
  background: white;
  border: 1px solid #e2e4e9;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
 
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.4;
`;

const ThreeDotButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InfoRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CardLabel = styled.div`
  color: #9ca3af;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4;
`;

const CardValue = styled.div`
  color: #1a1a1a;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.4;
`;

const BadgeValue = styled.div`
  color: #1a1a1a;
  line-height: 1.4;

  font-size: 14px;
  font-weight: 400;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const PositionRewardsCards = ({ openData, ...props }) => {
  // Note: Extract eventId from openData or props
  const eventId = openData?.data?._id || props.eventId;
  const [rewards, setRewards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReward, setSelectedReward] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const toast = useToast();

  // Note: Fetch position rewards data
  const fetchRewards = async () => {
    setIsLoading(true);
    try {
      const response = await getData({ event: eventId }, 'position-reward');
      if (response.status === 200) {
        setRewards(response.data?.response || []);
      }
    } catch (error) {
      toast.error("Failed to fetch rewards");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchRewards();
    }
  }, [eventId]);

  // Note: Filter rewards based on search term
  const filteredRewards = rewards.filter(reward => 
    reward.prizeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reward.prizeValue?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Note: Handle add new reward
  const handleAdd = () => {
    setSelectedReward(null);
    setIsModalOpen(true);
  };

  // Note: Handle edit reward
  const handleEdit = (reward) => {
    setSelectedReward(reward);
    setIsModalOpen(true);
  };

  // Note: Handle delete reward
//   const handleDelete = async (reward) => {
//     try {
//       await deleteData({ id: reward._id }, 'position-reward');
//       toast.success("Reward deleted successfully");
//       fetchRewards();
//     } catch (error) {
//       toast.error("Failed to delete reward");
//     }
//   };

  // Note: Handle form submission
  const handleFormSubmit = async (data) => {
    try {
      const payload = {
        prizeName: data.prizeName,
        prizeValue: data.prizeValue,
        prizeDescription: data.prizeDescription || data.description || "",
        ...(selectedReward ? { id: selectedReward._id } : { event: eventId })
      };
      
      console.log("Submitting reward data:", payload);
      
      if (selectedReward) {
        await putData(payload, 'position-reward');
        toast.success("Reward updated successfully");
      } else {
        await putData(payload, 'position-reward');
        toast.success("Reward created successfully");
      }
      
      setIsModalOpen(false);
      setSelectedReward(null);
      fetchRewards();
    } catch (error) {
      console.error("Error saving reward:", error);
      toast.error("Failed to save reward");
    }
  };

  return (
    <RowContainer className="data-layout">
      {/* Note: Header section */}
      <SubPageHeader 
        title="Position Based Rewards"
        description="Manage rewards for different positions in your event"
        line={false}
      />
      
      {/* Note: Content area */}
      {isLoading ? (
        <Loader />
      ) : filteredRewards.length === 0 ? (
        <NoDataFound 
          shortName="Rewards"
          addPrivilege={true}
          addLabel="Add Reward"
          isCreatingHandler={handleAdd}
        />
      ) : (
        <CardsGrid>
          {filteredRewards.map((reward) => (
            <RewardCard key={reward._id}>
              <CardHeader>
                <CardTitle>
                  {reward.prizeName || "Untitled Reward"}
                </CardTitle>
                <ThreeDotMenu
                  items={[
                    {
                      label: "Edit",
                      icon: "edit",
                      onClick: () => handleEdit(reward),
                    },
                   
                  ]}
                />
              </CardHeader>
              
              <CardContent>
                <InfoRow>
                  <CardLabel>Value:</CardLabel>
                  <BadgeValue>{reward.prizeValue}</BadgeValue>
                </InfoRow>
                
                <InfoRow>
                  <CardLabel>Description:</CardLabel>
                  <CardValue>{reward.prizeDescription || reward.description || "No description provided"}</CardValue>
                </InfoRow>
              </CardContent>
            </RewardCard>
          ))}
        </CardsGrid>
      )}

      {/* Note: Modal for add/edit */}
      {isModalOpen && (
        <AutoForm
          header={selectedReward ? "Edit Reward" : "Add Reward"}
          api="position-reward"
          formType={selectedReward ? "put" : "post"}
          formInput={positionRewardsAttributes}
          formValues={selectedReward || {}}
          isOpenHandler={() => {
            setIsModalOpen(false);
            setSelectedReward(null);
          }}
          setLoaderBox={setIsLoading}
          setMessage={() => {}}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedReward(null);
          }}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedReward(null);
          }}
          submitHandler={handleFormSubmit}
        />
      )}
    </RowContainer>
  );
};

export default PositionRewardsCards;
