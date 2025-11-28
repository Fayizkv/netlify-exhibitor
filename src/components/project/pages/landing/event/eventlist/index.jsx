import styled from "styled-components";
import { Container, Section } from "../styles";
import { Link } from "react-router-dom";
import React, { useState } from "react";
import moment from "moment";
import { GetIcon } from "../../../../../../icons";
import Register from "../register";
import { EventRegister } from "../register/event";

const FeaturesContainer = styled.div`
  display: flex;
  justify-content: left;
  gap: 30px;
  align-items: stretch;
  flex-wrap: wrap;
  width: 100%;
  &.vertical {
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
    &.vertical {
      padding: 0;
    }
  }
`;

const CountItem = styled.div`
  position: relative;
  color: inherit; /* Use the default text color */
  text-decoration: none; /* Remove underline */
  width: calc(50% - 15px); /* Adjusted for the gap */
  margin-right: 0px; /* Spacing between the divs */
  margin-bottom: 10px; /* Spacing between rows */
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 12.63157844543457px 25.26315689086914px 0px #0000001a;
  padding: 0;
  border-radius: 12px;
  margin: 10px 0;
  background-color: white;
  img {
    max-width: 100%;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-bottom-left-radius: 12px;
    border-top-left-radius: 12px;
  }

  > h2 {
    margin-top: 20px;
    margin-bottom: 0px;
    font-size: 20px;
    font-weight: bold;
    color: ${(props) => props.event?.themeColor};
  }

  > div > p {
    font-size: 12px;
    font-weight: thin;
    margin-top: 10px;
    color: grey;
  }
  @media (max-width: 768px) {
    flex: 0 0 100%;
    min-width: 100%;
    max-width: 100%;
    margin: 0px 0;
    padding: 0px;
    &.vertical {
      flex: 0 0 calc(100% - 30px);
      max-width: calc(100% - 30px);
      min-width: calc(100% - 30px);
    }
    img {
      max-width: 100%;
      object-fit: cover;
      border-bottom-left-radius: 12px;
      border-top-left-radius: 12px;
    }
  }
`;
const LinkButton = styled(Link)`
  font-weight: normal;
  text-decoration: none;
  font-size: 14px;
`;

const Title = styled.div`
  text-align: left;
  margin: 20px auto 0px;
  padding: 0px;
  width: 100%;
  div {
    font-size: 30px;
  }
  p {
    font-weight: lighter;
  }
  @media (max-width: 768px) {
    margin: auto;
    max-width: 70%;
    text-align: center;
  }
`;
const Left = styled.div`
  flex: 40%;
  position: relative;
  height: 360px;
  border-bottom-left-radius: 12px;
  border-top-left-radius: 12px;
  svg {
    position: absolute;
    right: -10px;
    height: 200p;
    top: 0;
    bottom: 0;
  }
`;

const Right = styled.div`
  flex: 1 1 60%;
  padding: 20px;
  justify-content: flex-start;
  display: flex;
  flex-direction: column;
  align-items: self-start;
  text-align: left;
  align-self: flex-start;
  cursor: initial;
  height: 100%;
  > h4 {
    background-color: #e3e3e3;
    padding: 5px 10px;
    border-radius: 8px;
    font-weight: lighter;
    font-size: 14px;
  }
  > h2,
  .h2 {
    color: ${(props) => props.event.themeColor};
    margin-top: 10px;
    font-size: 20px;
    font-weight: bold;
  }
  > div {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-top: auto;
  }
  p {
    margin-top: 10px;
    font-size: 15px;
    font-weight: lighter;
  }
  .action {
    background-color: ${(props) => props.event.secondaryColor};
    color: ${(props) => props.event.secondaryTextColor};
    outline: none;
    border: none;
    padding: 15px 20px;
    min-width: 100px;
    cursor: pointer;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    gap: 10px;
    border-radius: 9px;
  }

  .remove {
    background-color: gray;
  }
  h3 {
    border-width: 1px 0px 1px 0px;
    border-style: solid;
    padding: 10px 0;
    border-color: lightgrey;
    font-weight: lighter;
    font-size: 15px;
    width: 100%;
  }
  @media (max-width: 768px) {
    h2 {
      font-size: 17px;
    }
    p {
      font-size: 12px;
    }
    h3 {
      font-size: 10px;
    }
    > div {
      flex-direction: column;
    }
  }
`;
const Tabs = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  font-weight: lighter;
  margin-top: 10px;
  div {
    border: 1px solid lightgray;
    padding: 10px 20px;
    border-radius: 12px;
    &.active {
      background-color: ${(props) => props.event.themeColor};
      color: ${(props) => props.event.themeTextColor};
    }
  }
  @media (max-width: 768px) {
    margin-left: 20px;
    white-space: nowrap;
    overflow: auto;
    width: calc(100% - 20px);
  }
`;

const EventList = ({ id, items = [], event, theme, title = "Ongoing Events", setLoaderBox }) => {
  const [selectedTab, setSelectedTab] = useState("All");
  const [tabs] = useState(["All", "Registered", "Not Registered"]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("--token")) ?? null);
  const [registering, setRegistering] = useState(false);
  const [itemsList, setItemsList] = useState(items);

  return (
    <Section id={id} className="padding">
      <Container className="column">
        <Title>
          <div>{title} </div>
          <p>{`Total ${items.length ?? 0} ongoing Events `}</p>
        </Title>

        <Tabs event={event}>
          {tabs.map((item, index) => (
            <div key={index} onClick={() => setSelectedTab(item)} className={selectedTab === item ? "active" : ""}>
              {item}
            </div>
          ))}
        </Tabs>
      </Container>
      <Container id="countItem" className={`${theme} `}>
        <FeaturesContainer>
          {itemsList
            .filter((item) => {
              if (selectedTab === "Registered") {
                return item.registered; // Show only registered items
              } else if (selectedTab === "Not Registered") {
                return !item.registered; // Show only not registered items
              } else {
                return true;
              }
            })
            .map((item, index) => (
              <CountItem key={index} id={`countItem-${index}`} className={`${theme} `} event={event}>
                <Left>
                  <img onError={(e) => (e.target.src = import.meta.env.VITE_CDN + event.banner)} src={import.meta.env.VITE_CDN + item.thumbnail} alt={item.title} />
                  <svg width="17" height="359" viewBox="0 0 17 359" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8.20225" cy="8.20225" r="8.20225" fill="white" />
                    <circle cx="8.20225" cy="29.6068" r="8.20225" fill="white" />
                    <circle cx="8.20225" cy="51.0112" r="8.20225" fill="white" />
                    <circle cx="8.20225" cy="72.4157" r="8.20225" fill="white" />
                    <circle cx="8.20225" cy="93.8202" r="8.20225" fill="white" />
                    <circle cx="8.20225" cy="115.225" r="8.20225" fill="white" />
                    <circle cx="8.20225" cy="136.629" r="8.20225" fill="white" />
                    <circle cx="8.20225" cy="158.034" r="8.20225" fill="white" />
                    <circle cx="8.20225" cy="179.438" r="8.20225" fill="white" />
                    <circle cx="8.20225" cy="200.843" r="8.20225" fill="white" />
                    <circle cx="8.20225" cy="222.247" r="8.20225" fill="white" />
                    <circle cx="8.20225" cy="243.652" r="8.20225" fill="white" />
                    <circle cx="8.20225" cy="265.056" r="8.20225" fill="white" />
                    <circle cx="8.20225" cy="286.461" r="8.20225" fill="white" />
                    <circle cx="8.20225" cy="307.865" r="8.20225" fill="white" />
                    <circle cx="8.20225" cy="329.27" r="8.20225" fill="white" />
                    <circle cx="8.20225" cy="350.674" r="8.20225" fill="white" />
                  </svg>
                </Left>
                <Right event={event}>
                  {item.tag?.length > 0 && <h4>{item.tag}</h4>}
                  <LinkButton to={item.slug?.length > 2 ? item.slug : `${item._id}`} className="h2">
                    {item.title}
                  </LinkButton>
                  <p>{item.shortDescription}</p>
                  <h3>{`${moment(item.startDate).format("MMM DD ddd | h:mmA")} - ${moment(item.endDate).format("h:mmA")}`}</h3>
                  <div>
                    <LinkButton to={item.slug?.length > 2 ? item.slug : `${item._id}`} className="action remove">
                      Details <GetIcon icon={"info"} />
                    </LinkButton>
                    <EventRegister
                      setLoaderBox={setLoaderBox}
                      item={item}
                      event={event}
                      itemsList={itemsList}
                      userToken={user}
                      setItemsList={(list) => {
                        setItemsList(list);
                      }}
                    />
                  </div>
                </Right>
              </CountItem>
            ))}

          {registering && (
            <Register
              setLoaderBox={setLoaderBox}
              registserHandler={() => {
                setRegistering(false);
                document.body.style.overflow = "";
                setUser(JSON.parse(localStorage.getItem("--token")) ?? null);
              }}
              event={event}
            />
          )}
        </FeaturesContainer>
      </Container>
    </Section>
  );
};

export default EventList;
