import React from "react";
import styled from "styled-components";
import { Container, Section } from "../styles";
import { lightenColor } from "../../../functions";

const SpeakersWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start; /* Start from left */
  gap: 0px; /* Adjust as needed */
  @media (max-width: 768px) {
    flex-wrap: nowrap;
    width: 100%;
    overflow: auto;
  }
  @media (max-width: 768px) {
    gap: 10px;
    div {
      min-width: 50%;
      padding: 20px;
      font-size: 30px;
      line-height: normal;
    }
    img {
      min-width: 70%;
    }
  }
`;
const SpeakerData = styled.div`
  width: 33.33%;
  font-size: 35px;
  font-weight: normal;
  padding: 20px 40px 0 0;
  font-size: 40px;
  font-weight: 500;
  line-height: 48px;
  span {
    color: ${(props) => props.event?.themeColor};
  }
`;

const Speaker = styled.img`
  flex: 0 0 calc(33.33%); /* Three images in a row, adjust gap */
  max-width: calc(33.33%); /* Ensure images don't exceed one-third of container width */
  height: auto; /* Maintain aspect ratio */
  margin-bottom: 0px; /* Adjust as needed */
  height: 250px;
  object-fit: cover;
`;

const Gallery = ({ id, items = [], event, sectionTheme, theme = "theme1", config }) => {
  // const isMobile = window.matchMedia("(max-width: 800px)").matches;
  // const numberOfButtons = isMobile ? Math.ceil(mockSpeakers.length / 2) : Math.ceil(mockSpeakers.length / 4);

  // const [current, setCurrent] = useState(0);
  // const handleClick = (index) => {
  //   setCurrent(index);
  //   const speakerItem = document.getElementById(`speakerItem`);
  //   if (speakerItem) {
  //     const offset = isMobile ? 20 : 0;
  //     speakerItem.scrollTo({
  //       left: index === 0 ? 0 : index * window.outerWidth - offset,
  //       behavior: "smooth",
  //     });
  //   }
  // };

  switch (theme) {
    case "theme1":
    default:
      return (
        <Section className={sectionTheme + " padding"} background={lightenColor(event.themeColor, 230)} id={id}>
          <Container className="column">
            <SpeakersWrapper id="speakerItem" deskTopScrolling={config.deskTopScrolling} mobileScrolling={config.mobileScrolling}>
              <SpeakerData event={event} dangerouslySetInnerHTML={{ __html: config.title }}></SpeakerData>
              {items &&
                items.map((speaker, index) => (
                  <Speaker event={event} key={index} id={`speakerItem-${index}`} src={import.meta.env.VITE_CDN + speaker.image} alt={speaker.name} className="speaker-image theme1"></Speaker>
                ))}
            </SpeakersWrapper>
          </Container>
        </Section>
      );
    case "theme2":
      return <Section></Section>;
  }
};

export default Gallery;
