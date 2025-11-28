import React from "react";
import ReactPlayer from "react-player";
import { Section } from "../styles"; // Assuming you have a Section component
import styled from "styled-components";

const Title = styled.h1`
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
`;

const VideoPlayer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  width: 500px;
  box-shadow: -10px 10px 20px rgba(0, 0, 0, 0.4);
  margin-top: 30px;
  margin-bottom: 30px;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Video = ({ id, event, theme, config }) => {
  const videoUrl = "https://www.youtube.com/watch?v=B0WdX8MijGg";

  switch (theme) {
    case "theme1":
    default:
      return (
        <Section id={id} className="padding-both" style={{ alignItems: "center" }}>
          <Title>{config.title}</Title>
          <VideoPlayer>
            <ReactPlayer url={videoUrl} controls width="100%" height="100%" />
          </VideoPlayer>
        </Section>
      );
  }
};

export default Video;
