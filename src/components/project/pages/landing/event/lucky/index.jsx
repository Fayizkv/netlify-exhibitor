import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { postData } from "../../../../../../backend/api";
import { GetIcon } from "../../../../../../icons";
// import FireworksDisplay from "./FireworksDisplay";

const Container = styled.div`
  display: flex;
  background: ${(props) => props.background};
  background-repeat: no-repeat;
  background-position: top;
  background-size: cover;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f0f0;
  font-family: Arial, sans-serif;
  color: lightgray;
`;

const Title = styled.h1`
  margin-bottom: 20px;
  color: lightgray;
`;
const swale = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;
const Display = styled.div`
  margin: 20px 0;
  animation: ${swale} 1s infinite; /* Apply the swaling animation */
  text-align: center;
  color: lightgray;
  max-width: 85%;
  .counter {
    font-size: 50px;
  }
  h1 {
    font-size: 60px;
    border: 10px solid lightgray;
    padding: 10px 30px;
  }
  h2 {
    font-size: 100px;
    border: 10px solid lightgray;
    padding: 10px 30px;
    min-width: 500px;
    text-align: center;
  }
  svg:last-child {
    margin-left: 10px;
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 1em;
`;

const LuckyDraw = ({ eventData }) => {
  const [randomNumber, setRandomNumber] = useState(0);
  const [randomName, setRandomName] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { event } = eventData;
  const fetchData = async () => {
    try {
      const response = await postData({}, `lucky-draw/random-users/${event._id}`);
      setRandomName(null);
      setSelectedUsers(response.data.data);
      setTotalUsers(response.data.totalUsers);
      setIsDrawing(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    let randomNumberInterval;
    let randomNameTimeout;
    let nameIntervalTime = Math.floor(Math.random() * 200) + 400; // Initial random interval time for name generation

    if (isDrawing) {
      // Random interval time between 50 and 150 ms for number generation
      const randomNumberIntervalTime = Math.floor(Math.random() * 100) + 50;
      randomNumberInterval = setInterval(() => {
        setRandomNumber(Math.floor(Math.random() * totalUsers) + 1);
      }, randomNumberIntervalTime);

      // Random delay between 9000 and 11000 ms to stop number generation
      const randomDelayForNumber = Math.floor(Math.random() * 2000) + 9000;
      let SerialNo = 0;
      setCurrentIndex(SerialNo);
      setTimeout(() => {
        clearInterval(randomNumberInterval);
        setRandomNumber(null);

        const updateName = () => {
          const sel = selectedUsers[SerialNo];
          SerialNo += 1;
          if (SerialNo < selectedUsers.length) {
            setCurrentIndex(SerialNo);
            setRandomName(sel);
            setIsDrawing(true);

            // Increase interval time by a small random amount to gradually slow down
            nameIntervalTime += Math.floor(Math.random() * 100);

            // Schedule next update
            randomNameTimeout = setTimeout(updateName, nameIntervalTime);
          }
        };

        updateName();

        // Random delay between 9000 and 11000 ms to stop name generation
        const randomDelayForName = Math.floor(Math.random() * 2000) + 35000;
        setTimeout(() => {
          clearTimeout(randomNameTimeout);
          setIsDrawing(false);
        }, randomDelayForName);
      }, randomDelayForNumber);
    }

    return () => {
      clearInterval(randomNumberInterval);
      clearTimeout(randomNameTimeout);
    };
  }, [isDrawing, selectedUsers, totalUsers]);
  return (
    <Container background={"url(" + import.meta.env.VITE_CDN + event.luckyDrawBackground + ")"}>
      <Title>
        {randomNumber === null && randomName && !isDrawing
          ? "Lucky Draw Winner is!"
          : !isDrawing
            ? "Lucky Draw Spin!"
            : randomNumber
              ? "Taking Random 30 participants.."
              : "Let's count down for the Winner.."}
      </Title>
      {randomNumber !== null && (
        <Display>
          <h2 style={{ fontSize: "100px" }}>{String(randomNumber).padStart(6, "0")}</h2>
        </Display>
      )}

      {randomNumber === null && randomName && (
        <Display>
          <h1>{randomName.firstName ? randomName.firstName.toUpperCase() : randomName.authentication.fullName.toUpperCase()}</h1>
          <h3>
            <GetIcon icon="call" />
            {` ${randomName?.contactNumber ?? ` ${randomName?.authentication.phoneCode}${randomName?.authentication.authenticationId}`}`}
            {randomName?.yourPlace && (
              <>
                <GetIcon icon="location" />
                {" " + randomName.yourPlace}
              </>
            )}
          </h3>

          {isDrawing ? (
            <h3 className="counter">{selectedUsers.length - currentIndex}</h3>
          ) : (
            randomName?.qTicketNumber && (
              <div>
                <h3>{`Ticket Number: ${randomName?.qTicketNumber}`}</h3>
                {/* <FireworksDisplay />  */}
              </div>
            )
          )}
        </Display>
      )}
      <Button onClick={() => fetchData()} disabled={isDrawing}>
        Start Spin
      </Button>
    </Container>
  );
};

export default LuckyDraw;
