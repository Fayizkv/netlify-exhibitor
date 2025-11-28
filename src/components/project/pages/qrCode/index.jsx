import React, { useState, useRef, useEffect } from "react";
import QRCode from "react-qr-code";
import styled from "styled-components";
import { getData } from "../../../../backend/api";
import { Download, Globe } from "lucide-react";

// Styled components remain the same...
const Container = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding: 24px;
`;

const DomainsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const DomainCard = styled.div`
  padding: 20px;
  background: white;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${(props) => (props.isSelected ? "#0d6efd" : "#e2e8f0")};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    border-color: #0d6efd;
  }

  .domain-name {
    font-size: 15px;
    font-weight: 500;
    color: #1e293b;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .domain-info {
    font-size: 13px;
    color: #64748b;
  }
`;

const QRSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 48px;
  background: white;
  border-radius: 24px;
  padding: 40px;
  margin-top: 24px;
  position: relative;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 32px;
  }
`;

const QRDisplay = styled.div`
  padding: 32px;
  background: #f8fafc;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
`;

const QRInfo = styled.div`
  max-width: 280px;

  h3 {
    font-size: 20px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 12px;
  }

  p {
    font-size: 14px;
    color: #64748b;
    margin-bottom: 24px;
    line-height: 1.6;
  }
`;

const DownloadButton = styled.button`
  padding: 12px 24px;
  background: #0d6efd;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #0d6efd;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  background: white;
  border-radius: 24px;
  color: #64748b;

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    color: #64748b;
  }
`;

const QrCode = ({ openData }) => {
  const eventId = openData.data._id;
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const qrRef = useRef(null);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await getData({ event: eventId }, "whitelisted-Domains");
        const fetchedDomains = response.data.response;
        setDomains(fetchedDomains);

        // Auto-select if there's only one domain
        if (fetchedDomains.length === 1) {
          setSelectedDomain(fetchedDomains[0].domain);
        }
      } catch (error) {
        console.error("Error fetching domains:", error);
      }
    };

    fetchDomains();
  }, [eventId]);

  const downloadQRCode = () => {
    const svg = qrRef.current.querySelector("svg");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const padding = 40;
      const width = img.width + padding * 2;
      const height = img.height + padding * 2;

      canvas.width = width;
      canvas.height = height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, padding, padding);

      const pngFile = canvas.toDataURL("image/png", 1.0);
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-code-${selectedDomain}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Show domains grid only if there's more than one domain
  const shouldShowDomainsGrid = domains.length > 1;

  return (
    <Container>
      {shouldShowDomainsGrid && (
        <DomainsGrid>
          {domains.map((item) => (
            <DomainCard key={item._id} isSelected={selectedDomain === item.domain} onClick={() => setSelectedDomain(item.domain)}>
              <div className="domain-name">
                <Globe size={16} />
                {item.domain}
              </div>
              <div className="domain-info">
                {item.title} • Created {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </DomainCard>
          ))}
        </DomainsGrid>
      )}

      {selectedDomain ? (
        <QRSection>
          <QRDisplay ref={qrRef}>
            <QRCode value={`https://${selectedDomain}`} size={200} level="H" />
          </QRDisplay>
          <QRInfo>
            <h3>Your QR Code is Ready!</h3>
            <p>
              This QR code will direct users to:
              <br />
              <strong>https://{selectedDomain}</strong>
            </p>
            <DownloadButton onClick={downloadQRCode}>
              <Download size={18} />
              Download QR Code
            </DownloadButton>
          </QRInfo>
        </QRSection>
      ) : (
        <EmptyState>
          <h3>Select a Domain</h3>
          <p>Choose a domain from above to generate its QR code</p>
        </EmptyState>
      )}
    </Container>
  );
};

export default QrCode;
