import React, { useEffect } from "react";
import styled from "styled-components";

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  overflow-y: auto;
  z-index: 1001;
  @media print {
    position: static;
    overflow: visible;
  }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);

  @media print {
    display: none;
  }
`;

const ModalContainer = styled.div`
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;

  @media print {
    min-height: auto;
    padding: 0;
  }
`;

const ModalContent = styled.div`
  position: relative;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 210mm;

  @media print {
    box-shadow: none;
    border-radius: 0;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;

  @media print {
    display: none;
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;

  ${(props) =>
    props.primary &&
    `
    background-color: #3b82f6;
    color: white;
    
    &:hover {
      background-color: #2563eb;
    }
  `}

  ${(props) =>
    props.secondary &&
    `
    background-color: #f3f4f6;
    
    &:hover {
      background-color: #e5e7eb;
    }
  `}
`;

const CardsContainer = styled.div`
  padding: 1rem;

  @media print {
    padding: 0;
  }
`;

const CardsGrid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(${(props) => props.cardsPerRow}, minmax(0, 1fr));

  @media print {
    gap: 0;
  }
`;

const Card = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  padding: 1rem;
  width: ${(props) => props.width}mm;
  height: ${(props) => props.height}mm;
  break-inside: avoid;

  @media print {
    page-break-inside: avoid;
  }
`;

const CardContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Avatar = styled.img`
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
`;

const TextContent = styled.div`
  h3 {
    font-weight: 600;
    font-size: 0.875rem;
  }

  p {
    font-size: 0.75rem;
    color: #4b5563;
  }
`;

// Global style for print
const GlobalStyle = styled.style`
  @media print {
    @page {
      size: ${(props) => props.paperSize};
      margin: 0;
    }
    body {
      margin: 0;
      padding: 0;
    }
  }
`;

const AttendeePrintModal = ({
  isOpen,
  onClose,
  paperSize = "A4",
  idCardWidth = 90,
  idCardHeight = 54,
  attendees = [
    { id: 1, name: "John Doe", role: "Developer", avatar: "/api/placeholder/100/100" },
    { id: 2, name: "Jane Smith", role: "Designer", avatar: "/api/placeholder/100/100" },
    { id: 3, name: "Mike Johnson", role: "Manager", avatar: "/api/placeholder/100/100" },
  ],
}) => {
  const pageDimensions = {
    A4: { width: 210, height: 297 },
  };

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const cardsPerRow = Math.floor(pageDimensions[paperSize].width / idCardWidth);

  return (
    <ModalOverlay>
      <Backdrop onClick={onClose} />
      <ModalContainer>
        <ModalContent>
          <ModalHeader>
            <h2>Print ID Cards</h2>
            <div>
              <Button primary onClick={handlePrint}>
                Print
              </Button>
              <Button secondary onClick={onClose} style={{ marginLeft: "0.5rem" }}>
                ×
              </Button>
            </div>
          </ModalHeader>

          <CardsContainer>
            <CardsGrid cardsPerRow={cardsPerRow}>
              {attendees.map((attendee) => (
                <Card key={attendee.id} width={idCardWidth} height={idCardHeight}>
                  <CardContent>
                    <Avatar src={attendee.avatar} alt={attendee.name} />
                    <TextContent>
                      <h3>{attendee.name}</h3>
                      <p>{attendee.role}</p>
                    </TextContent>
                  </CardContent>
                </Card>
              ))}
            </CardsGrid>
          </CardsContainer>
        </ModalContent>
      </ModalContainer>
      <GlobalStyle paperSize={paperSize} />
    </ModalOverlay>
  );
};

export default AttendeePrintModal;
