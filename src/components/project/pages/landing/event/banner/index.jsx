import React from "react";
import { Section } from "../styles";
import styled from "styled-components";

const ContentBox = styled.div`
  height: auto;
  width: 100%;
  display: flex;
  align-items: center;
  position: relative;
  justify-content: center;
  .inner {
    position: absolute;
    color: white;
    display: flex;
    flex-direction: column;
    margin-left: 0;
    justify-content: center;
    text-align: center;
    h1 {
      font-size: 40px;
      margin: 10px;
    }
    p {
      font-size: 25px;
      margin: 10px;
    }
  }
  @media (max-width: 768px) {
    .inner {
      position: absolute;
      color: white;
      display: flex;
      flex-direction: column;
      margin-left: 0;
      justify-content: center;
      text-align: center;
      h1 {
        font-size: 30px;
        margin: 0px;
        padding: 10px 10px;
      }
      p {
        font-size: 15px;
        margin: 0px;
      }
    }
  }
`;

const Frame = styled.img`
  width: 100vw;
  display: block;
  object-fit: contain;
  &.curved {
    width: 100%;
    display: block;
    object-fit: contain;
    overflow-clip-margin: content-box;
    overflow: clip;
    border-radius: 20px;
    // margin: 10px;
  }
  &.banner {
    width: 100%;
    display: block;
    object-fit: contain;
    overflow-clip-margin: content-box;
    overflow: clip;
    // margin: 10px;
  }
  @media (max-width: 768px) {
    &.banner {
      width: 100%;
      display: block;
      object-fit: cover;
    }
  }
`;

const Banner = ({ id, event, theme, title, description, button }) => {
  const isMobile = window.matchMedia("(max-width: 600px)").matches;
  switch (theme) {
    default:
    case "theme1":
      return (
        <Section>
          <ContentBox>
            <Frame
              onError={(e) => (e.target.src = import.meta.env.VITE_CDN + event.banner)}
              className="banner"
              src={isMobile ? import.meta.env.VITE_CDN + event.mobBanner : import.meta.env.VITE_CDN + event.banner}
              alt="frame"
            />
            {title && (
              <div className="inner">
                {title && <h1> {title}</h1>}
                {description && <p> {description}</p>}
              </div>
            )}
          </ContentBox>
        </Section>
      );
    case "theme2":
      return (
        <Section id={id}>
          <ContentBox>
            <Frame
              onError={(e) => (e.target.src = import.meta.env.VITE_CDN + event.banner)}
              className="curved"
              src={isMobile ? import.meta.env.VITE_CDN + event.mobBanner : import.meta.env.VITE_CDN + event.banner}
              alt="frame"
            />
            {title && (
              <div className="inner">
                {title && <h1> {title}</h1>}
                {description && <p> {description}</p>}
              </div>
            )}
          </ContentBox>
        </Section>
      );
  }
};

export default Banner;
