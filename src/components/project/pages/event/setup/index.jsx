import React, { useEffect, useState } from "react";
import QrReader from "react-qr-scanner";
import { ColumnContainer, RowContainer } from "../../../../styles/containers/styles";
import { Button } from "./styles";
// import { deleteData, getData, postData, putData } from "../../../../../backend/api";
import { getData } from "../../../../../backend/api";

const SetupRecipe = ({ openData, setMessage }) => {
  const [event] = useState(openData.data._id); // Changed state name to 'event'
  const [qrCodeData, setQrCodeData] = useState(null); // State to store QR code data
  const [qrReaderActive, setQrReaderActive] = useState(false); // State to control QR reader activation

  useEffect(() => {
    getData({ event, qrCodeData }, "scanning")
      .then((response) => {
        if (response.data) {
        } else {
          // Handle the case where response.data is undefined
          console.error("Response data is undefined.");
        }
      })
      .catch((error) => {
        // Handle any errors that occur during the API request
        console.error("API request error:", error);
      });
  }, [event, qrCodeData]);

  // Function to handle QR code scanning
  const handleScan = (data) => {
    if (data) {
      const parsedData = JSON.parse(data.text);
      const userId = parsedData.userId;
      console.log(userId);
      setQrCodeData(userId); // Set the scanned QR code data to state
      setQrReaderActive(false);
    }
  };

  // Function to handle QR code scan errors
  const handleError = (err) => {
    console.error(err);
  };

  const videoConstraints = {
    facingMode: "environment",
  };

  return (
    <ColumnContainer className="custom">
      <RowContainer className="quarter">
        {/* Button to activate QR code reader */}
        <Button onClick={() => setQrReaderActive(true)}>Scan QR Code</Button>
        {/* QR code reader component */}
        {qrReaderActive && <QrReader delay={300} onError={handleError} onScan={handleScan} style={{ width: "100%" }} videoConstraints={videoConstraints} />}
      </RowContainer>
      <RowContainer>{/* ... Rest of your code ... */}</RowContainer>
      {/* ... Rest of your code ... */}
    </ColumnContainer>
  );
};
export default SetupRecipe;
