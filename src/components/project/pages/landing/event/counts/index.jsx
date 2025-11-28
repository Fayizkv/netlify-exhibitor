import React from "react";
import { Container, Section } from "../styles";
import styled from "styled-components";

const CountContainer = styled.div`
  display: flex;
  text-align: center;
  width: 100%;
  justify-content: center;
  gap: 50px;
  &.theme1 {
    gap: 0;
    margin-right: 0px;
  }
  .count-box {
    width: 60%;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 20%;
    border: 1px solid #000;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
    gap: 10%;
    border-radius: 20px;
    position: absolute;
    top: 56%;
    left: 50%;
    transform: translate(-50%);
    z-index: 1;
    background-color: #fff;
  }
  @media (max-width: 768px) {
    overflow: auto;
    align-items: center;
    justify-content: center;
    gap: 3%;
    padding: 10px;
    .count-box {
      width: 90%;
      gap: 0;
      padding-left: 20px;
      top: 81%;
      left: 50%;
      height: 12%;
    }
  }
  &.theme2,
  &.theme3 {
    padding-left: 10px;
  }
  &.theme4 {
    padding-left: 10px;
    padding-right: 10px;
  }
`;
const CountItem = styled.div`
  height: 180px;
  border-radius: 50%;
  border: 1px solid transparent;
  -webkit-box-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  align-items: center;
  margin-bottom: 5px;
  color: ${(props) => props.event.themeColor};
  font-size: 24px;
  margin-right: 20px;
  text-align: center;
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: none;
  position: relative;
  &.theme3 {
    width: 180px;
    margin-right: 20px;
    background:
      linear-gradient(to right, #000, #000) padding-box,
      linear-gradient(to right, ${(props) => props.event.secondaryColor}, #000) border-box;
  }
  &.theme2 {
    width: 180px;
    margin-right: 20px;
    border: 1px solid ${(props) => props.event.themeColor};
  }
  &.theme2::after {
    content: "";
    position: absolute;
    width: 10px;
    height: 10px;
    background-color: ${(props) => props.event.themeColor};
    border-radius: 50%;
    top: 20%;
    left: 90%;
    transform: translate(-50%, -50%);
  }

  &.theme2:nth-child(2)::after {
    top: 40%;
    left: 99%;
    transform: translate(-50%, -50%);
  }

  &.theme2:nth-child(3)::after {
    top: 60%;
    left: 99%;
    transform: translate(-50%, -50%);
  }

  &.theme2:nth-child(4)::after {
    top: 80%;
    left: 90%;
    transform: translate(-50%, -50%);
  }
  &.theme1 {
    border: 0;
    margin-right: 0px;
    width: 220px;
    gap: 10px;
  }
  &.theme1::after {
    content: "";
    width: 2px;
    height: 50%;
    border: 0;
    background: lightgrey;
    border-radius: 0;
    position: absolute;
    right: 0;
  }
  &.theme4::after {
    content: "";
    width: 2px;
    height: 70px;
    border: 0;
    background: lightgrey;
    border-radius: 0;
    position: absolute;
    right: -35px;
  }
  &:first-child.theme1 {
    border: 0;
    border-radius: 0;
  }
  &:last-child.theme1::after {
    display: none;
  }
  &:last-child.theme4::after {
    display: none;
  }
  h2 {
    margin: 0;
    color: black;
  }
  p {
    font-size: 18px;
    margin: 0;
    color: ${(props) => props.event.themeColor};
  }
  @media (max-width: 768px) {
    flex: none;
    width: 100px;
    height: 100px;
    &.theme4::after {
      right: -20px;
      height: 30px;
    }
    &:first-child {
      margin-left: 10px;
    }
    &.theme1 {
      border: 0;
      margin-right: 0px;
      width: 25%;
      flex-wrap: wrap;
      gap: 10px;
    }
    &.theme2,
    &.theme3,
    &.theme4 {
      width: 70px;
      height: 70px;
    }
    h2 {
      margin: 0;
      font-size: 20px;
    }
    p {
      font-size: 12px;
      margin: 0;
    }
  }
`;
const countsList = [
  {
    name: "Sessions",
    count: 23,
  },
  {
    name: "Guests",
    count: 50,
  },
  {
    name: "Delegates",
    count: "10k",
  },
  {
    name: "Stages",
    count: 7,
  },
];

const Counts = ({ id, counts, event, theme }) => {
  switch (theme) {
    case "theme1":
    default:
      return (
        <Section id={id}>
          <CountContainer>
            {countsList &&
              countsList.map((count, index) => (
                <CountItem className="theme1" event={event} key={index}>
                  <div key={index}>
                    <h2>{count.count}+</h2>
                    <p>{count.name}</p>
                  </div>
                </CountItem>
              ))}
          </CountContainer>
        </Section>
      );
    case "theme2":
      return (
        <Section id={id}>
          <Container>
            <CountContainer className={theme}>
              {countsList &&
                countsList.map((count, index) => (
                  <CountItem className={theme} event={event} key={index}>
                    <div key={index}>
                      <h2>{count.count}+</h2>
                      <p>{count.name}</p>
                    </div>
                  </CountItem>
                ))}
            </CountContainer>
          </Container>
        </Section>
      );
    case "theme3":
      return (
        <Section id={id} style={{ backgroundColor: "black" }}>
          <Container>
            <CountContainer className={theme}>
              {countsList &&
                countsList.map((count, index) => (
                  <CountItem className={theme} event={event} key={index}>
                    <div key={index}>
                      <h2 style={{ color: "#fff" }}>{count.count}+</h2>
                      <p>{count.name}</p>
                    </div>
                  </CountItem>
                ))}
            </CountContainer>
          </Container>
        </Section>
      );
    // case "theme4":
    //   return (
    //     <Section id={id}>
    //       <Container className="overriding">
    //         <CountContainer className={theme}>
    //           <div className="count-box">
    //             {countsList &&
    //               countsList.map((count, index) => (
    //                 <CountItem className={theme} event={event} key={index}>
    //                   <div key={index}>
    //                     <h2>{count.count}+</h2>
    //                     <p>{count.name}</p>
    //                   </div>
    //                 </CountItem>
    //               ))}
    //           </div>
    //         </CountContainer>
    //       </Container>
    //     </Section>
    //   );
  }
};

export default Counts;
