import styled from "styled-components";
import { Container, Section } from "../styles";
import React, { useState } from "react";

const FeaturesContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: left;
  gap: 30px;
  overflow: auto;
  align-items: stretch;
  padding-left: calc((100% - 1200px) / 2);
  &.Vertical {
    flex-wrap: wrap;
    justify-content: center;
    padding-left: inherit;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
  }
  @media (max-width: 768px) {
    align-items: stretch;
    padding-left: 20px;
    padding-right: 20px;
    &.Vertical {
      padding: 0;
    }
  }
`;

const CountItem = styled.div`
  flex: 0 0 calc(23% - 30px);
  max-width: calc(23% - 30px);
  min-width: calc(23% - 30px);
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 12.63157844543457px 25.26315689086914px 0px #0000001a;
  padding: 40px 20px;
  border-radius: 12px;
  margin: 30px 0;
  &* {
    align-items: initial;
  }
  &:first-child {
    margin-left: 10px;
  }
  &:last-child {
    margin-right: 10px;
  }

  img {
    max-width: 100%;
    width: 70px;
    height: 70px;
    object-fit: cover;
  }

  h2 {
    margin-top: 20px;
    margin-bottom: 0px;
    font-size: 20px;
    font-weight: bold;
    color: ${(props) => props.event?.themeColor};
  }

  p {
    font-size: 12px;
    font-weight: thin;
    margin-top: 10px;
    color: grey;
  }
  @media (max-width: 768px) {
    flex: 0 0 45%;
    min-width: 45%;
    max-width: 45%;
    margin: 10px 0;
    padding: 40px 20px;
    &.vertical {
      flex: 0 0 calc(100% - 30px);
      max-width: calc(100% - 30px);
      min-width: calc(100% - 30px);
    }
    img {
      max-width: 100%;
      width: 70px;
      height: 70px;
      object-fit: cover;
    }
  }
`;

const Title = styled.h1`
  text-align: center;
  margin: 20px auto 30px;
  padding: 10px;
  font-size: 35px;
  font-weight: 500;
  line-height: 48px;
  text-align: left;

  @media (max-width: 768px) {
    margin: 20px auto 30px;
    max-width: 70%;
    font-size: 25px;
    text-align: center;
    line-height: normal;
    margin-top: 0px;
    margin-bottom: 0px;
  }
`;

const Button = styled.div`
  text-align: center;
  margin: 20px auto 10px;
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
const Header = styled.div`
  display: flex;
  -webkit-box-pack: center;
  justify-content: center;
  width: 90%;
  align-items: baseline;
  margin: auto;
  gap: 30px;
  margin-bottom: 30px;
  &.theme2 {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    h1 {
      padding: 0;
      margin: 0;
    }
    p {
      margin: 0;
    }
  }
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;
const Description = styled.p`
  font-size: 17px;
  line-height: 26px;
  max-width: 90%;
  line-height: 30px;
  font-size: 18px;
  font-weight: lighter;
  @media (max-width: 768px) {
    font-size: 17px;
    text-align: center;
    margin: auto;
  }
`;
const Features = ({ id, items = [], sectionTheme, event, theme, title, description, deskTopScrolling = "vertical", mobileScrolling = "vertical", config }) => {
  const isMobile = window.matchMedia("(max-width: 600px)").matches;
  const numberOfButtons = isMobile ? Math.ceil(items.length / 2) : Math.ceil(items.length / 4);
  const [current, setCurrent] = useState(0);
  const handleClick = (index) => {
    setCurrent(index);
    // Scroll to the next set of items
    const countItem = document.getElementById(`countItem`);
    if (countItem) {
      const offset = isMobile ? 20 : 0;
      countItem.scrollTo({
        left: index === 0 ? 0 : index * window.outerWidth - offset,
        behavior: "smooth",
      });
    }
  };

  return (
    <Section id={id} className="padding">
      <Container className="column">
        <Header className={`mobile-column ${sectionTheme}`}>
          <Title>{config.title}</Title>
          <Description dangerouslySetInnerHTML={{ __html: config.description }}></Description>
        </Header>
      </Container>
      <FeaturesContainer id="countItem" className={`${sectionTheme} ${isMobile ? config.mobileScrolling : config.deskTopScrolling}`}>
        {items.map((item, index) => (
          <CountItem id={`countItem-${index}`} className={`${sectionTheme} ${deskTopScrolling}`} event={event} key={index}>
            <img src={import.meta.env.VITE_CDN + item.icon} alt={item.title} />
            <h2>{item.title}</h2>
            {config.sectionTheme === "theme1" && <p>{item.description}</p>}
          </CountItem>
        ))}
      </FeaturesContainer>
      <Container className={`column ${deskTopScrolling}`}>
        <Button event={event}>
          {Array.from({ length: numberOfButtons }, (_, index) => (
            <button className={current === index ? "active" : ""} onClick={() => handleClick(index)} key={index}></button>
          ))}
        </Button>
      </Container>
    </Section>
  );
};

export default Features;
