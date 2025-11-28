import React from "react";
import styled from "styled-components";
import { Container, Section } from "../styles";
import { lightenColor } from "../../../functions";
import janePhoto from "../../../../../../images/public/default_food.jpg";
import { useState } from "react";

const SpeakersWrapper = styled.div`
  display: flex;
  gap: 40px;
  overflow: auto;
  align-items: center;
  padding: 20px 50px 20px calc(50% - 560px);
  &.theme4 {
    padding: 20px 50px 0px calc(50% - 560px);
  }
  flex-wrap: ${(props) => (props.deskTopScrolling === "Vertical" ? "wrap" : "nowrap")};
  align-items: ${(props) => (props.deskTopScrolling === "Vertical" ? "center" : "flex-start")};
  justify-content: ${(props) => (props.deskTopScrolling === "Vertical" ? "center" : "flex-start")};
  @media (max-width: 768px) {
    flex-wrap: ${(props) => (props.mobileScrolling === "Vertical" ? "wrap" : "nowrap")};
    align-items: ${(props) => (props.mobileScrolling === "Vertical" ? "center" : "flex-start")};
    justify-content: ${(props) => (props.mobileScrolling === "Vertical" ? "center" : "flex-start")};
    // display: ${(props) => (props.direction === "Vertical" ? "grid" : "flex")};
    // grid-template-columns: repeat(${(props) => (props.direction === "Vertical" ? "2" : "1")}, 1fr);
    //   gap: ${(props) => (props.mobileScrolling === "Vertical" ? "40px" : "40px")};
    padding-left: ${(props) => (props.mobileScrolling === "Vertical" ? "60px" : "20px")};
  }
`;
const SpeakerData = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: 0 50px 10px 50px;
  width: 100%;
  &.theme4 {
    flex-direction: column;
  }
  h1 {
    font-weight: 400;
  }
  .speaker-text {
    width: 80%;
  }
  .custom-text-speaker {
    font-family: Arial, Helvetica, sans-serif;
    color: #717171;
    font-size: 16px;
    font-weight: 400;
    text-align: center;
    &.theme3 {
      color: #ffffff;
    }
  }
  @media (max-width: 768px) {
    flex-direction: column;
    h1 {
      width: 100%;
      padding: 0 10px;
      text-align: center;
      margin: 0px;
    }
    .speaker {
      margin: 0px 0 10px;
    }
  }
`;

const Speaker = styled.div`
  .speaker-card {
    transition: transform 0.3s;
    cursor: pointer;
    min-width: 250px;
    height: 350px;
    position: relative;
    &.theme3 {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      width: 250px;
      height: 300px;
      overflow: hidden;
      border: 1px solid #fff;
      border-radius: 20px;
      background: ${(props) => props.event.themeColor};
      border: 1px solid transparent;
    }
    &.theme4 {
      height: 300px;
      margin-top: 10px;
    }
  }
  .speaker-card::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50%;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 4));
    z-index: 1;
  }
  .speaker-card.theme2::after {
    background: none;
  }
  .speaker-card.theme4::after {
    background: none;
  }
  .new {
    background-color: ${(props) => props.event.themeColor} !important;
    float: right;
    position: absolute;
    &.theme1 {
      height: 75px;
      width: 75px;
      right: -17px;
      top: -15px;
    }
    &.theme2 {
      height: 100%;
      width: 100%;
      right: 0px;
      top: 0px;
      border-top-left-radius: 30%;
      border-top-right-radius: 30%;
      border-bottom-left-radius: 30%;
      border-bottom-right-radius: 30%;
    }
  }
  .speaker-image {
    display: block;
    object-fit: cover;
    filter: grayscale(1);
    position: absolute;
    &.theme1 {
      width: 250px;
      height: 350px;
    }
    &.theme2 {
      width: 230px;
      height: 330px;
      top: 55%;
      left: 50%;
      transform: translate(-50%, -59%);
      border-top-left-radius: 30%;
      border-top-right-radius: 30%;
      border-bottom-left-radius: 30%;
      border-bottom-right-radius: 30%;
    }
    &.theme3 {
      top: 0;
      left: 0;
      width: 100%;
      height: 70%;
      border-top-left-radius: 20px;
      border-top-right-radius: 20px;
    }
    &.theme4 {
      top: 38%;
      left: 50%;
      transform: translate(-50%, -59%);
      max-width: 94%;
      max-height: 75%;
      border-radius: 50%;
      overflow: hidden;
      outline: 2px dashed ${(props) => props.event.themeColor};
      display: block;
      padding: 5px;
    }
  }
  .quote {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    width: 200px;
    color: #fff;
    padding: 0;
    &.theme1 {
    }
    span {
      font-size: 12px;
    }
    p {
      font-size: 16px;
      font-weight: 500;
    }
    &.theme2 {
      bottom: 0px;
      left: 50%;
      width: 80%;
      height: 80px;
      background-color: #222226;
      border-radius: 20px;
      border-top: 8px solid ${(props) => props.event.themeColor};
    }
    &.theme4 {
      color: #000;
      height: 70px;
    }
  }
`;

const Button = styled.div`
  text-align: center;
  margin: 0 auto 0;
  padding: 10px;
  gap: 10px;
  display: flex;
  button {
    background: lightgray;
    border-radius: 5px;
    cursor: pointer;
    border: 0;
    height: 5px;
  }
  button.active {
    width: 30px;
    background: ${(props) => props.event?.themeColor};
  }
`;

const mockSpeakers = [
  {
    name: "Name A",
    photo: janePhoto,
    designation: "CEO, Company A",
  },
  {
    name: "Name B",
    photo: janePhoto,
    designation: "CTO, Company B",
  },
  {
    name: "Name C",
    photo: janePhoto,
    designation: "CTO, Company C",
  },
  {
    name: "Name D",
    photo: janePhoto,
    designation: "CTO, Company D",
  },
  {
    name: "Name E",
    photo: janePhoto,
    designation: "CTO, Company E",
  },
  {
    name: "Name F",
    photo: janePhoto,
    designation: "CTO, Company F",
  },
];

const Speakers = ({ id, speakers = [], event, theme, config }) => {
  const isMobile = window.matchMedia("(max-width: 800px)").matches;
  const numberOfButtons = isMobile ? Math.ceil(mockSpeakers.length / 2) : Math.ceil(mockSpeakers.length / 4);

  const [current, setCurrent] = useState(0);
  const handleClick = (index) => {
    setCurrent(index);
    const speakerItem = document.getElementById(`speakerItem`);
    if (speakerItem) {
      const offset = isMobile ? 20 : 0;
      speakerItem.scrollTo({
        left: index === 0 ? 0 : index * window.outerWidth - offset,
        behavior: "smooth",
      });
    }
  };

  switch (theme) {
    case "theme1":
    default:
      return (
        <Section className={theme} background={lightenColor(event.themeColor, 230)} id={id}>
          <Container>
            <SpeakerData>
              <h1>{config.title}</h1>
              <div className="speaker-text">
                <p className="custom-text-speaker">{config.description}</p>
              </div>
            </SpeakerData>
          </Container>
          <SpeakersWrapper id="speakerItem" deskTopScrolling={config.deskTopScrolling} mobileScrolling={config.mobileScrolling}>
            {mockSpeakers &&
              mockSpeakers.map((speaker, index) => (
                <Speaker event={event} key={index} id={`speakerItem-${index}`}>
                  <div className="speaker-card theme1">
                    <div className="new theme1"></div>
                    <img src={import.meta.env.VITE_CDN + event.image} alt={speaker.name} className="speaker-image theme1" />
                    <div className="quote theme1">
                      <p>{speaker.name}</p>
                      <span
                        className="text"
                        dangerouslySetInnerHTML={{
                          __html: speaker.designation,
                        }}
                      ></span>
                    </div>
                  </div>
                </Speaker>
              ))}
          </SpeakersWrapper>
          {config.deskTopScrolling === "Horizontal" && !isMobile && (
            <Container className="column">
              <Button event={event}>
                {Array.from({ length: numberOfButtons }, (_, index) => (
                  <button className={current === index ? "active" : ""} onClick={() => handleClick(index)} key={index}></button>
                ))}
              </Button>
            </Container>
          )}

          {config.mobileScrolling === "Horizontal" && isMobile && (
            <Container className="column">
              <Button event={event}>
                {Array.from({ length: numberOfButtons }, (_, index) => (
                  <button className={current === index ? "active" : ""} onClick={() => handleClick(index)} key={index}></button>
                ))}
              </Button>
            </Container>
          )}
        </Section>
      );
    case "theme2":
      return (
        <Section className={theme} background={lightenColor(event.themeColor, 230)} id={id}>
          <Container>
            <SpeakerData>
              <h1>{config.title}</h1>
              <div className="speaker-text">
                <p className="custom-text-speaker">{config.description}</p>
              </div>
            </SpeakerData>
          </Container>
          <SpeakersWrapper id="speakerItem" deskTopScrolling={config.deskTopScrolling} mobileScrolling={config.mobileScrolling}>
            {mockSpeakers &&
              mockSpeakers.map((speaker, index) => (
                <Speaker event={event} key={index} id={`speakerItem-${index}`}>
                  <div className="speaker-card theme2">
                    <div className="new theme2"></div>
                    <img src={speaker.photo} alt={speaker.name} className="speaker-image theme2" />
                    <div className="quote theme2">
                      <p>{speaker.name}</p>
                      <span
                        className="text"
                        dangerouslySetInnerHTML={{
                          __html: speaker.designation,
                        }}
                      ></span>
                    </div>
                  </div>
                </Speaker>
              ))}
          </SpeakersWrapper>
          {config.deskTopScrolling === "Horizontal" && !isMobile && (
            <Container className="column">
              <Button event={event}>
                {Array.from({ length: numberOfButtons }, (_, index) => (
                  <button className={current === index ? "active" : ""} onClick={() => handleClick(index)} key={index}></button>
                ))}
              </Button>
            </Container>
          )}

          {config.mobileScrolling === "Horizontal" && isMobile && (
            <Container className="column">
              <Button event={event}>
                {Array.from({ length: numberOfButtons }, (_, index) => (
                  <button className={current === index ? "active" : ""} onClick={() => handleClick(index)} key={index}></button>
                ))}
              </Button>
            </Container>
          )}
        </Section>
      );
    case "theme3":
      return (
        <Section className={theme} background={lightenColor(event.themeColor, 230)} id={id} style={{ backgroundColor: "black" }}>
          <Container>
            <SpeakerData>
              <h1 style={{ color: event.themeColor }}>{config.title}</h1>
              <div className="speaker-text">
                <p className="custom-text-speaker theme3">{config.description}</p>
              </div>
            </SpeakerData>
          </Container>
          <SpeakersWrapper id="speakerItem" deskTopScrolling={config.deskTopScrolling} mobileScrolling={config.mobileScrolling}>
            {mockSpeakers &&
              mockSpeakers.map((speaker, index) => (
                <Speaker event={event} key={index} id={`speakerItem-${index}`}>
                  <div className="speaker-card theme3">
                    <img src={speaker.photo} alt={speaker.name} className="speaker-image theme3" />
                    <div className="quote">
                      <p>{speaker.name}</p>
                      <span
                        className="text"
                        dangerouslySetInnerHTML={{
                          __html: speaker.designation,
                        }}
                      ></span>
                    </div>
                  </div>
                </Speaker>
              ))}
          </SpeakersWrapper>
          {config.deskTopScrolling === "Horizontal" && !isMobile && (
            <Container className="column">
              <Button event={event}>
                {Array.from({ length: numberOfButtons }, (_, index) => (
                  <button className={current === index ? "active" : ""} onClick={() => handleClick(index)} key={index}></button>
                ))}
              </Button>
            </Container>
          )}

          {config.mobileScrolling === "Horizontal" && isMobile && (
            <Container className="column">
              <Button event={event}>
                {Array.from({ length: numberOfButtons }, (_, index) => (
                  <button className={current === index ? "active" : ""} onClick={() => handleClick(index)} key={index}></button>
                ))}
              </Button>
            </Container>
          )}
        </Section>
      );
    case "theme4":
      return (
        <Section
          className={theme}
          // background={lightenColor(event.themeColor, 230)}
          id={id}
        >
          <Container>
            <SpeakerData className={theme}>
              <h1>{config.title}</h1>
              <div className="speaker-text">
                <p className="custom-text-speaker">{config.description}</p>
              </div>
            </SpeakerData>
          </Container>
          <SpeakersWrapper id="speakerItem" deskTopScrolling={config.deskTopScrolling} mobileScrolling={config.mobileScrolling}>
            {mockSpeakers &&
              mockSpeakers.map((speaker, index) => (
                <Speaker event={event} key={index} id={`speakerItem-${index}`}>
                  <div className="speaker-card theme4">
                    <img src={speaker.photo} alt={speaker.name} className="speaker-image theme4" />
                    <div className="quote theme4">
                      <p>{speaker.name}</p>
                      <span
                        className="text"
                        dangerouslySetInnerHTML={{
                          __html: speaker.designation,
                        }}
                      ></span>
                    </div>
                  </div>
                </Speaker>
              ))}
          </SpeakersWrapper>
          {config.deskTopScrolling === "Horizontal" && !isMobile && (
            <Container className="column">
              <Button event={event}>
                {Array.from({ length: numberOfButtons }, (_, index) => (
                  <button className={current === index ? "active" : ""} onClick={() => handleClick(index)} key={index}></button>
                ))}
              </Button>
            </Container>
          )}

          {config.mobileScrolling === "Horizontal" && isMobile && (
            <Container className="column">
              <Button event={event}>
                {Array.from({ length: numberOfButtons }, (_, index) => (
                  <button className={current === index ? "active" : ""} onClick={() => handleClick(index)} key={index}></button>
                ))}
              </Button>
            </Container>
          )}
        </Section>
      );
  }
};

export default Speakers;
