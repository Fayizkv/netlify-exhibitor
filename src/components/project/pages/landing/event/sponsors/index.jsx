import React, { useEffect, useState } from "react";
import { Section } from "../styles";
import styled from "styled-components";
import Marquee from "react-fast-marquee";

const Title = styled.h1`
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  margin: 10px 0 60px;
`;

const LogoContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 20px;
  width: 100%;
  justify-content: center;
`;

const LogoImage = styled.img`
  max-width: 100%;
  max-height: 70px;
  width: auto;
  height: auto;
  object-fit: contain;
  margin-bottom: 10px;
  margin: 0px 10px;
  @media (max-width: 768px) {
  }
`;

const Sponsors = ({ title, sectionTheme, event, theme, items = [], config, id }) => {
  const shuffleArray = (array) => {
    return array
      .map((item) => ({ ...item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ sort, ...item }) => item); // Remove the 'sort' property after sorting
  };
  const [shuffledItemsOne, setshuffledItemsOne] = useState(shuffleArray([...items]));
  const [shuffledItemsTwo, setshuffledItemsTwo] = useState(shuffleArray([...items]));
  useEffect(() => {
    if (items.length > 0) {
      setshuffledItemsOne(shuffleArray([...items]));
      setshuffledItemsTwo(shuffleArray([...items]));
    }
  }, [items]);
  if (sectionTheme === "marquee") {
    return (
      <Section id={id} className="padding">
        <Title>{title}</Title>
        {shuffledItemsOne?.length > 0 && (
          <Marquee speed={60} autoFill={true} pauseOnClick={true}>
            {shuffledItemsOne?.map((sponsor, index) => (
              <LogoImage key={"1" + index} src={import.meta.env.VITE_CDN + sponsor.logo} alt={sponsor.title} />
            ))}
          </Marquee>
        )}
        {shuffledItemsTwo?.length > 0 && (
          <Marquee speed={60} style={{ marginTop: "30px" }} autoFill={true} pauseOnClick={true}>
            {shuffledItemsTwo.map((sponsor, index) => (
              <LogoImage key={"2" + index} src={import.meta.env.VITE_CDN + sponsor.logo} alt={sponsor.title} />
            ))}
          </Marquee>
        )}
      </Section>
    );
  }

  return (
    <Section id={id} className="padding">
      <Title>{title}</Title>
      <LogoContainer>
        {items.map((sponsor, index) => (
          <LogoImage key={index} src={import.meta.env.VITE_CDN + sponsor.logo} alt={sponsor.title} />
        ))}
      </LogoContainer>
    </Section>
  );
};

export default Sponsors;
