import React, { useState } from "react";
import styled from "styled-components";
import { Trash2, AlertCircle, Loader2 } from "lucide-react";

const Container = styled.div`
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const DeleteButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #ff6b81;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
`;

const Title = styled.h2`
  /* font-size: 1.125rem; */
  font-weight: 500;
  color: #1a1a1a;
`;

const WarningBox = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: #fff5f5;
  border-radius: 8px;
  margin: 1rem 0;
`;

const WarningText = styled.p`
  color: #e03131;
  font-size: 0.875rem;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const CancelButton = styled.button`
  padding: 0.625rem 1.25rem;
  background: #f8f9fa;
  color: #343a40;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DeleteAction = ({ onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <Container>
        <DeleteButton onClick={() => setIsModalOpen(true)}>
          <Trash2 size={18} />
          Delete
        </DeleteButton>
      </Container>

      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <Title>Confirm Deletion</Title>
            <WarningBox>
              <AlertCircle size={20} />
              <WarningText>Are you sure you want to delete this? This action cannot be undone.</WarningText>
            </WarningBox>
            <ButtonGroup>
              <CancelButton onClick={() => setIsModalOpen(false)} disabled={isDeleting}>
                Cancel
              </CancelButton>
              <DeleteButton onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Delete
                  </>
                )}
              </DeleteButton>
            </ButtonGroup>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default DeleteAction;
