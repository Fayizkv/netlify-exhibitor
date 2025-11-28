import React, { useState } from "react";
import styled from "styled-components";
import { Container, Section } from "../styles";

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  @media (max-width: 768px) {
    width: 100%;
    padding: 30px;
  }
`;

const Title = styled.h2`
  font-size: 35px;
  color: white;
  padding: 0px;
`;

const Description = styled.span`
  font-size: 14px;
  color: white;
  padding: 0px;
  font-weight: 200;
`;

const AccordionWrapper = styled.div`
  width: 100%;
  margin-top: 20px;
`;

const AccordionItem = styled.div`
  color: white;
  margin-bottom: 20px;
`;

const AccordionHeader = styled.div`
  padding: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const QuestionNumber = styled.span`
  font-size: 18px;
  margin-right: 10px;
  color: grey;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #666;
  margin-top: 5px;
`;

const ArrowIcon = styled.span`
  font-size: 20px;
  transition: transform 0.3s;
  transform: ${(props) => (props.isOpen ? "rotate(180deg)" : "rotate(0deg)")};
`;

const AccordionContent = styled.div`
  padding: 10px;
  display: ${(props) => (props.isOpen ? "block" : "none")};
  font-size: 12px;
  font-weight: 200;
`;

const Accordion = ({ items }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <AccordionWrapper>
      {items.map((item, index) => (
        <AccordionItem key={index}>
          <AccordionHeader onClick={() => toggleAccordion(index)}>
            <div>
              <QuestionNumber>{(index + 1).toString().padStart(2, "0")}</QuestionNumber>
              <span>{item.question}</span>
            </div>
            <ArrowIcon isOpen={openIndex === index}></ArrowIcon>
          </AccordionHeader>
          <AccordionContent isOpen={openIndex === index}>{item.answer}</AccordionContent>
          {index !== items.length - 1 && <Divider />}
        </AccordionItem>
      ))}
    </AccordionWrapper>
  );
};

const Faq = ({ event, theme, id, config }) => {
  const faqData = [
    {
      question: "What is Lorem Ipsum?",
      answer: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    },
    {
      question: "Why do we use it?",
      answer: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
    },
    {
      question: "Where does it come from?",
      answer: "Contrary to popular belief, Lorem Ipsum is not simply random text.",
    },
  ];

  switch (theme) {
    case "theme1":
    default:
      return (
        <Section className="padding-both" style={{ backgroundColor: "black" }} id={id}>
          <Container className="column">
            <MainContent>
              <Title>{config.title}</Title>
              <Description>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text</Description>
              <Accordion items={faqData} />
            </MainContent>
          </Container>
        </Section>
      );
  }
};

export default Faq;
