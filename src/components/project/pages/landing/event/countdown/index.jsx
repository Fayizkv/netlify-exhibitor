import React, { useEffect, useState } from "react";
import { Section } from "../styles";

import styled from "styled-components";
const Countdown = styled.div`
  width: 100%;
  height: auto;
  background-color: ${(props) => props.event.themeColor};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  padding: 10px 50px;
  text-align: center;
  .aligned-text {
    font-family: Arial, Helvetica, sans-serif;
    text-align: center;
    font-weight: 100;
    font-size: 14px;
  }
  .custom-button {
    background-color: ${(props) => props.event.themeColor};
    border: 1px solid ${(props) => props.event.themeColor};
    color: white;
    margin-top: 10px;
    border-radius: 20px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
  }
  .custom-button:hover {
    background-color: white;
    color: ${(props) => props.event.themeColor};
  }
  @media (max-width: 768px) {
    .aligned-text {
      font-size: 12px;
    }
  }
`;
const CountdownNew = styled.div`
  width: 80%;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #000;
  padding: 10px 50px;
  text-align: center;
  .aligned-textNew {
    font-family: Arial, Helvetica, sans-serif;
    text-align: center;
    font-weight: 100;
    font-size: 18px;
  }
  .custom-button {
    background-color: ${(props) => props.event.themeColor};
    border: 1px solid ${(props) => props.event.themeColor};
    color: white;
    margin-top: 10px;
    border-radius: 20px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
  }
  .custom-button:hover {
    background-color: white;
    color: ${(props) => props.event.themeColor};
  }
  @media (max-width: 768px) {
    .aligned-text {
      font-size: 12px;
    }
    width: 100%;
  }
`;
const CountDownStyle = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: auto;
  margin-top: 20px;
  margin-bottom: 20px;
  div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 10px;
    border: 0px solid;
    background: none;
    width: 100px;
    height: 100px;
    &.theme1 {
      flex-direction: row;
      width: 400px;
      background: #fff;
    }
    &.theme3 {
      flex-direction: row;
      width: 400px;
    }
  }
  .theme2,
  .theme1 {
    background: #fff;
    border-radius: 10px;
  }
  .theme3 {
    border-radius: 10px;
    background: linear-gradient(to top, ${(props) => props.event.themeColor}, ${(props) => props.event.secondaryColor});
  }
  .theme4 {
    background: #fff;
  }
  .countTimer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-weight: 500;
  }
  .colon {
    display: flex;
    align-self: center;
    font-size: 20px;
    color: #fff;
    height: 10px;
    width: 10px;
  }
  div span:first-child {
    font-size: 40px;
    color: ${(props) => props.event.themeColor};
  }
  div span:last-child {
    font-size: 14px;
    color: gray;
  }

  @media (max-width: 768px) {
    gap: 5px;
    width: 80%;
    div {
      padding: 10px;
      width: 20px;
      height: 60px;
    }
    div span:first-child {
      font-size: 20px;
    }
    div span:last-child {
      font-size: 10px;
      color: gray;
    }
  }
`;
const CountDownStyleNew = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: auto;
  margin-top: 20px;
  margin-bottom: 20px;
  div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 10px;
    border: 0px solid;
    background: none;
    width: 100px;
    height: 100px;
    &.theme1 {
      flex-direction: row;
      width: 400px;
      background: #fff;
    }
    &.theme3 {
      flex-direction: row;
      width: 400px;
    }
  }
  .theme2,
  .theme1 {
    background: #fff;
    border-radius: 10px;
  }
  .theme3 {
    border-radius: 10px;
    background: linear-gradient(to top, ${(props) => props.event.themeColor}, ${(props) => props.event.secondaryColor});
  }
  .theme4 {
    background: #fff;
  }
  .countTimer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-weight: 800;
  }
  .colon {
    display: flex;
    align-self: center;
    font-size: 20px;
    color: #fff;
    height: 10px;
    width: 10px;
  }
  div span:first-child {
    font-size: 40px;
    color: #8f1837;
  }
  div span:last-child {
    font-size: 14px;
    color: gray;
  }

  @media (max-width: 768px) {
    gap: 5px;
    width: 80%;
    div {
      padding: 10px;
      width: 30px;
      height: 60px;
    }
    div span:first-child {
      font-size: 28px;
    }
    div span:last-child {
      font-size: 12px;
      color: gray;
    }
  }
`;
const CountDown = ({ id, targetDate, event, theme, config }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  switch (theme) {
    default:
    case "theme5":
      return (
        <Section id={id} className="padding-top" style={{ display: "flex", alignItems: "center" }}>
          <CountdownNew event={event}>
            <span className="aligned-textNew">{config.description}</span>
            <CountDownStyleNew event={event}>
              <div className="theme1">
                <div className="countTimer">
                  <span>{timeLeft.days ?? 0}</span> <span>days</span>
                </div>
                <div style={{ color: "#000" }}>:</div>
                <div className="countTimer">
                  <span>{timeLeft.hours ?? 0}</span> <span>hours</span>
                </div>
                <div style={{ color: "#000" }}>:</div>
                <div className="countTimer">
                  <span>{timeLeft.minutes ?? 0}</span> <span>minutes</span>
                </div>
                <div style={{ color: "#000" }}>:</div>
                <div className="countTimer">
                  <span>{timeLeft.seconds ?? 0}</span> <span>seconds</span>
                </div>
              </div>
            </CountDownStyleNew>
          </CountdownNew>
        </Section>
      );
    case "theme1":
      return (
        <Section id={id}>
          <Countdown event={event}>
            <h2>{config.title}</h2>
            <span className="aligned-text">{config.description}</span>
            <CountDownStyle event={event}>
              <div className="theme1">
                <div className="countTimer">
                  <span>{timeLeft.days ?? 0}</span> <span>days</span>
                </div>
                <div style={{ color: "#000" }}>:</div>
                <div className="countTimer">
                  <span>{timeLeft.hours ?? 0}</span> <span>hours</span>
                </div>
                <div style={{ color: "#000" }}>:</div>
                <div className="countTimer">
                  <span>{timeLeft.minutes ?? 0}</span> <span>minutes</span>
                </div>
                <div style={{ color: "#000" }}>:</div>
                <div className="countTimer">
                  <span>{timeLeft.seconds ?? 0}</span> <span>seconds</span>
                </div>
              </div>
            </CountDownStyle>
          </Countdown>
        </Section>
      );
    case "theme2":
      return (
        <Section id={id}>
          <Countdown event={event}>
            <h2>{config.title}</h2>
            <span className="aligned-text">{config.description}</span>
            <CountDownStyle className={theme} event={event}>
              <div className={theme}>
                <span style={{ width: "40px" }}>{timeLeft.days ?? 0}</span> <span>days</span>
              </div>
              <div className="colon">:</div>
              <div className={theme}>
                <span style={{ width: "40px" }}>{timeLeft.hours ?? 0}</span> <span>hours</span>
              </div>
              <div className="colon">:</div>
              <div className={theme}>
                <span style={{ width: "40px" }}>{timeLeft.minutes ?? 0}</span> <span>minutes</span>
              </div>
              <div className="colon">:</div>
              <div className={theme}>
                <span style={{ width: "40px" }}>{timeLeft.seconds ?? 0}</span> <span>seconds</span>
              </div>
            </CountDownStyle>
          </Countdown>
        </Section>
      );
    case "theme3":
      return (
        <Section id={id}>
          <Countdown event={event} style={{ background: "#000" }}>
            <h2>{config.title}</h2>
            <span className="aligned-text">{config.description}</span>
            <CountDownStyle event={event} className={theme}>
              <div className={theme}>
                <div className="countTimer">
                  <span style={{ color: "#fff" }}>{timeLeft.days ?? 0}</span> <span>days</span>
                </div>
                <div style={{ color: "gray" }}>:</div>
                <div className="countTimer">
                  <span style={{ color: "#fff" }}>{timeLeft.hours ?? 0}</span> <span>hours</span>
                </div>
                <div style={{ color: "gray" }}>:</div>
                <div className="countTimer">
                  <span style={{ color: "#fff" }}>{timeLeft.minutes ?? 0}</span> <span>minutes</span>
                </div>
                <div style={{ color: "gray" }}>:</div>
                <div className="countTimer">
                  <span style={{ color: "#fff" }}>{timeLeft.seconds ?? 0}</span> <span>seconds</span>
                </div>
              </div>
            </CountDownStyle>
          </Countdown>
        </Section>
      );
    case "theme4":
      return (
        <Section id={id}>
          <Countdown event={event}>
            <h2>{config.title}</h2>
            <span className="aligned-text">{config.description}</span>
            <CountDownStyle className={theme} event={event}>
              <div className={theme} style={{ borderRadius: "10px 0 0 10px" }}>
                <span>{timeLeft.days ?? 0}</span> <span>days</span>
              </div>
              <div className={theme}>
                <span>{timeLeft.hours ?? 0}</span> <span>hours</span>
              </div>
              <div className={theme}>
                <span>{timeLeft.minutes ?? 0}</span> <span>minutes</span>
              </div>
              <div className={theme} style={{ borderRadius: "0 10px 10px 0" }}>
                <span>{timeLeft.seconds ?? 0}</span> <span>seconds</span>
              </div>
            </CountDownStyle>
            <button class="custom-button">Register Now &rarr;</button>
          </Countdown>
        </Section>
      );
  }
};

export default CountDown;
