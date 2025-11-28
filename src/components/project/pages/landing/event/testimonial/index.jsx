import React, { useState } from "react";
import { Container, Section } from "../styles";
import janePhoto from "../../../../../../images/public/default_food.jpg";
import styled from "styled-components";

const Testimonial = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  h2 {
    font-weight: 400;
  }
`;
const TestimonialWrapper = styled.div`
  display: flex;
  overflow: hidden;
  align-items: center;
  gap: 40px;
  width: 100%;
  &.theme4 {
    padding-top: 60px;
  }
  flex-wrap: ${(props) => (props.deskTopScrolling === "Vertical" ? "wrap" : "nowrap")};
  align-items: ${(props) => (props.deskTopScrolling === "Vertical" ? "center" : "flex-start")};
  justify-content: ${(props) => (props.deskTopScrolling === "Vertical" ? "center" : "flex-start")};
  @media (max-width: 768px) {
    flex-wrap: ${(props) => (props.mobileScrolling === "Vertical" ? "wrap" : "nowrap")};
    align-items: ${(props) => (props.mobileScrolling === "Vertical" ? "center" : "flex-start")};
    justify-content: ${(props) => (props.mobileScrolling === "Vertical" ? "center" : "flex-start")};
    //  display: ${(props) => (props.direction === "Vertical" ? "grid" : "flex")};
    //   grid-template-columns: repeat(
    //     ${(props) => (props.direction === "Vertical" ? "2" : "1")},
    //     1fr
    //   );
    //    gap: ${(props) => (props.direction === "Vertical" ? "40px" : "40px")};
    padding-left: ${(props) => (props.direction === "Vertical" ? "300px" : "20px")};
    &.theme4 {
      padding-left: ${(props) => (props.mobileScrolling === "Vertical" ? "0" : "20px")};
    }
  }
`;
const Test = styled.div`
  .test-card {
    display: flex;
    border: 1px solid #ccc;
    width: 300px;
    border-bottom-right-radius: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    margin-bottom: 20px;
    &.theme2 {
      box-shadow: 0 4px 8px rgba(177, 176, 176, 0.4);
      height: auto;
      width: 200px;
      flex-direction: column;
      text-align: left;
      position: relative;
      border-bottom-right-radius: 0;
    }
    &.theme2::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 25%;
      height: 100%;
      border-top: 4px solid ${(props) => props.event.themeColor};
    }
    &.theme3 {
      border-radius: 12px;
      height: 280px;
      width: 230px;
      flex-direction: column;
      justify-content: space-between;
      text-align: left;
      position: relative;
      background:
        linear-gradient(to right, ${(props) => props.event.themeColor}, ${(props) => props.event.secondaryColor}) padding-box,
        linear-gradient(to right, #453f91, #5f5e5e) border-box;
      border: 1px solid transparent;
    }
    &.theme4 {
      border-radius: 10px;
      height: 230px;
      width: 320px;
      flex-direction: column;
      justify-content: space-between;
      text-align: left;
      position: relative;
      background: #fff;
      overflow: visible;
      box-shadow: 0 4px 8px rgba(177, 176, 176, 0.4);
      padding: 10px;
    }
    &.theme4::after {
      content: "";
      position: absolute;
      bottom: 0;
      right: 0;
      width: 0;
      height: 0;
      border-left: 40px solid transparent;
      border-bottom: 40px solid ${(props) => props.event.themeColor};
      border-radius: 4px;
    }
  }
  .theme4-img {
    max-width: 30%;
    height: auto;
    position: absolute;
    top: -25%;
    left: 50%;
    transform: translate(-50%);
    z-index: 1;
    border-radius: 50%;
    padding: 4px;
  }
  .testimonial-image {
    display: flex;
    flex: 1;
    position: relative;
    overflow: hidden;
  }
  .testimonial-image img {
    width: 100%;
    height: auto;
    object-fit: cover;
  }
  .testimonial-image::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50%;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 2));
    z-index: 1;
  }
  .testimonial-content {
    flex: 2;
    padding: 20px;
    text-align: left;
  }
  .testimonial-content .designation {
    color: #666;
    font-size: 12px;
  }
  .testimonial-content .name {
    font-weight: bold;
    margin-top: 20px;
    text-transform: capitalize;
    font-size: 14px;
  }
  .testimonial-text {
    font-family: Arial, Helvetica, sans-serif;
    color: #555555;
    font-weight: 300;
    font-size: 14px;
    &.theme3 {
      color: #fff;
      font-size: 12px;
    }
  }
  .quote {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
  }
  .name-chip {
    display: flex;
    align-items: center;
    &.theme2 {
      width: 100%;
      height: 65px;
      background-color: ${(props) => props.event.themeColor};
      flex-direction: row;
      font-size: 12px;
      color: #fff;
    }
    &.theme3 {
      width: 100%;
      height: 65px;
      background-color: #fff;
      border-radius: 10px;
      color: #000000;
      flex-direction: row;
      font-size: 12px;
    }
    &.theme4 {
      flex-direction: column;
      justify-content: center;
      margin-top: 50px;
      margin-bottom: 20px;
      font-size: 14px;
    }
  }
  .name-chip img {
    width: 55px;
    height: auto;
    border-radius: 50%;
    padding: 10px;
  }
  .column {
    display: flex;
    flex-direction: column;
  }
  .tests {
    color: #fff;
    padding: 10px;
  }
  .name-head {
    font-weight: bold;
    text-transform: capitalize;
    font-size: 14px;
  }
  .test-padding {
    padding: 10px;
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

const mockTestimonials = [
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
const Testimonials = ({ id, theme, event, config }) => {
  const isMobile = window.matchMedia("(max-width: 800px)").matches;
  const numberOfButtons = isMobile ? Math.ceil(mockTestimonials.length / 1) : Math.ceil(mockTestimonials.length / 4);
  const [current, setCurrent] = useState(0);

  const handleClick = (index) => {
    setCurrent(index);
    const testimonialItem = document.getElementById(`testimonialItem`);
    if (testimonialItem) {
      const offset = isMobile ? 20 : 0;
      testimonialItem.scrollTo({
        left: index === 0 ? 0 : index * window.outerWidth - offset,
        behavior: "smooth",
      });
    }
  };
  switch (theme) {
    case "theme1":
    default:
      return (
        <Section id={id} className="padding-sides">
          <Testimonial>
            <h2>{config.title}</h2>
            <TestimonialWrapper id="testimonialItem" deskTopScrolling={config.deskTopScrolling} mobileScrolling={config.mobileScrolling}>
              {mockTestimonials &&
                mockTestimonials.map((test, index) => (
                  <Test key={index} id={`testimonialItem-${index}`} event={event}>
                    <div className="test-card">
                      <div class="testimonial-image">
                        <img src={test.photo} alt={test.name} />
                        <div class="quote"></div>
                      </div>
                      <div class="testimonial-content">
                        <div class="testimonial-text">
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
                        </div>
                        <div class="name">{test.name}</div>
                        <div class="designation">{test.designation}</div>
                      </div>
                    </div>
                  </Test>
                ))}
            </TestimonialWrapper>
          </Testimonial>
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
        <Section id={id} className="padding-sides">
          <Testimonial>
            <h2>{config.title}</h2>
            <TestimonialWrapper id="testimonialItem" deskTopScrolling={config.deskTopScrolling} mobileScrolling={config.mobileScrolling}>
              {mockTestimonials &&
                mockTestimonials.map((test, index) => (
                  <Test key={index} id={`testimonialItem-${index}`} event={event}>
                    <div className="test-card theme2">
                      <div className="test-padding">
                        <h4>"Lovely Healthier Alternative"</h4>
                        <p class="testimonial-text">
                          Choosing a healthier alternative is not only a mindful decision but also a loving gesture towards oneself. Embracing healthier alternatives means nourishing our bodies with
                          choices that promote vitality and well-being.
                        </p>
                      </div>
                      <div class="name-chip theme2">
                        <img src={test.photo} alt={test.name} />
                        <div class="column">
                          <span class="name-head">{test.name}</span>
                          <span>{test.designation}</span>
                        </div>
                      </div>
                    </div>
                  </Test>
                ))}
            </TestimonialWrapper>
          </Testimonial>
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
        <Section id={id} className="padding-sides" style={{ backgroundColor: "black" }}>
          <Testimonial>
            <h2 style={{ color: "#fff" }}>{config.title}</h2>
            <TestimonialWrapper id="testimonialItem" deskTopScrolling={config.deskTopScrolling} mobileScrolling={config.mobileScrolling}>
              {mockTestimonials &&
                mockTestimonials.map((test, index) => (
                  <Test key={index} id={`testimonialItem-${index}`} event={event}>
                    <div class="test-card theme3">
                      <div class="tests">
                        <h4>"Lovely Healthier Alternative"</h4>
                        <p class="testimonial-text theme3">
                          Choosing a healthier alternative is not only a mindful decision but also a loving gesture towards oneself. Embracing healthier alternatives means nourishing our bodies with
                          choices that promote vitality and well-being.
                        </p>
                      </div>
                      <div class="name-chip theme3">
                        <img src={test.photo} alt={test.name} />
                        <div class="column">
                          <span class="name-head">{test.name}</span>
                          <span>{test.designation}</span>
                        </div>
                      </div>
                    </div>
                  </Test>
                ))}
            </TestimonialWrapper>
          </Testimonial>
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
        <Section id={id} className="padding-sides">
          <Testimonial>
            <h2>{config.title}</h2>
            <TestimonialWrapper id="testimonialItem" deskTopScrolling={config.deskTopScrolling} mobileScrolling={config.mobileScrolling} className={theme}>
              {mockTestimonials &&
                mockTestimonials.map((test, index) => (
                  <Test key={index} id={`testimonialItem-${index}`} event={event}>
                    <div class="test-card theme4">
                      <div class="name-chip theme4">
                        <span class="name-head">{test.name}</span>
                        <span>{test.designation}</span>
                      </div>
                      <p class="testimonial-text">
                        Choosing a healthier alternative is not only a mindful decision but also a loving gesture towards oneself. Embracing healthier alternatives means nourishing our bodies with
                        choices that promote vitality and well-being.
                      </p>
                      <img src={test.photo} alt={test.name} className="theme4-img" />
                    </div>
                  </Test>
                ))}
            </TestimonialWrapper>
          </Testimonial>
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
export default Testimonials;
