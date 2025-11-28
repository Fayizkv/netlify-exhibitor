import styled from "styled-components";
import { Container, Section } from "../styles";
import { lightenColor } from "../../../functions";

const FeaturesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  row-gap: 30px;
  @media (max-width: 768px) {
    align-items: baseline;
    padding: 10px;
  }
`;

const CountItem = styled.div`
  flex: 0 0 33%;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px 60px;

  @media (max-width: 768px) {
    flex: 0 0 50%;
    max-width: 50%;
    min-width: 50%;
    padding: 10px 30px;
    &.full {
      padding: 20px;
      h1 {
        margin: 10px;
      }
    }
  }

  img {
    max-width: 100%;
    width: 100px;
    height: 100px;
    object-fit: cover;
  }

  h2 {
    margin-top: 20px;
    margin-bottom: 0px;
    font-size: 20px;
    font-weight: bold;
  }

  p {
    font-size: 12px;
    font-weight: thin;
    margin-top: 10px;
    color: grey;
  }
`;

const Title = styled.h1`
  text-align: center;
  margin: 20px auto 70px;
  padding: 10px;
`;

const KeyFeatures = ({ id, items = [], event, theme, title, description, config }) => {
  return (
    <Section background={lightenColor(event.themeColor, 230)} id={id} className="padding">
      <Container className="column">
        <FeaturesContainer className={theme}>
          <CountItem className="full">
            <Title>{config.title}</Title>
          </CountItem>
          {items.map((item, index) => (
            <CountItem className={theme} event={event} key={index}>
              <img src={import.meta.env.VITE_CDN + item.icon} alt={item.title} />
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </CountItem>
          ))}
        </FeaturesContainer>
      </Container>
    </Section>
  );
};

export default KeyFeatures;
