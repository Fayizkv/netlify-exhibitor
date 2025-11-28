import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Container, Section } from "../styles";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { EventRegister } from "../register/event";
import { GetIcon } from "../../../../../../icons";
import background from "../../../../brand/images/events-background.png";

const Header = styled.div`
  display: flex;
  -webkit-box-pack: center;
  justify-content: center;
  width: 70%;
  align-items: baseline;
  margin: auto;
  gap: 30px;
  margin-bottom: 30px;
  @media (max-width: 768px) {
    flex-direction: column;
    width: 90%;
    text-align: center;
    margin: auto;
    padding: 0;
    justify-content: center;
    align-items: center;
    h2 {
      color: white;
      padding: 0px;
      width: 250px;
      font-size: 38px;
      font-weight: 500;
      line-height: 38px;
      margin: 0;
      margin-top: 40px;
    }
    p {
      width: 100%;
      margin: 0;
      margin-bottom: 20px;
      font-size: 15px;
      line-height: 22px;
    }
  }
`;

const EventList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  .item {
    display: flex;
    margin-bottom: 20px;
    width: 100%;
    background-color: white;
    > div:first-child {
      width: 150px;
      background: #1a7266;
      color: white;
      padding: 10px;
      line-height: 27.43px;
      margin-left: 20px;
      text-align: center;
      align-items: center;
      display: flex;
      justify-content: center;
      display: flex;
      flex-direction: column;
    }
    > div:nth-child(2) {
      width: 60%;
      padding: 20px;
      div:first-child {
        font-size: 25px;
        font-weight: 500;
        line-height: 48px;
        text-align: left;
        color: ${(props) => props.event.themeColor};
      }
      button {
        display: none;
      }
    }
    > div:nth-child(3) {
      width: calc(40% - 150px);
      text-align: center;
      align-items: center;
      display: flex;
      justify-content: right;
      padding: 20px;
    }
  }
  @media (max-width: 768px) {
    .item {
      font-size: inherit;
      width: 90%;
      margin: auto;
      margin-bottom: 10px;
      > div:first-child {
        font-size: 12px;
        margin-left: 0;
      }
      > div:nth-child(2) {
        font-size: 12px;
        width: 100%;
        padding: 10px;
        line-height: 18px;
        div:first-child {
          font-size: 16px;
          line-height: 18px;
        }
        div:last-child {
          margin-top: 10px;
        }
        button {
          display: flex;
          font-size: 12px;
          margin-top: 10px;
        }
      }
      > div:nth-child(3) {
        font-size: inherit;
        display: none;
      }
    }
  }
`;
const Title = styled.h2`
  font-size: 35px;
  color: white;
  padding: 0px;
  &.black {
    color: black;
  }
  width: 250px;
  font-size: 38px;
  font-weight: 500;
  line-height: 38px;
`;

const Description = styled.p`
  font-size: 17px;
  line-height: 26px;
  color: white;
  &.black {
    color: black;
  }
  max-width: 90%;
  line-height: 30px;
  font-size: 18px;
  font-weight: lighter;
`;

const ReadMoreButton = styled.button`
  background: ${(props) => props.event.secondaryColor};
  color: ${(props) => props.event.secondaryTextColor};
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 18px;
  margin-top: 10px;
  cursor: pointer;
`;
const Tabs = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  font-weight: lighter;
  margin-top: 10px;
  margin-bottom: 30px;
  div {
    border: 1px solid lightgray;
    padding: 10px 20px;
    border-radius: 12px;
    color: white;
    &.active {
      background: #e4cd59;
      color: black;
    }
  }
  @media (max-width: 768px) {
    margin-left: 20px;
    white-space: nowrap;
    overflow: auto;
    width: calc(100% - 20px);
  }
`;
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
const TicketBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const RegBox = styled.div`
  position: relative;
  bottom: 80px;
  display: flex;
  .action {
    background-color: transparent;
    outline: none;
    border: none;
    padding: 15px 20px;
    min-width: 101px;
    cursor: pointer;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    gap: 10px;
    border-radius: 9px;
    margin-top: 0;
    font-size: 25px;
    color: white;
  }
`;

const CountItem = styled.div`
  flex: 0 0 calc(23% - 30px);
  max-width: calc(23% - 30px);
  min-width: calc(23% - 30px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 12.63157844543457px 25.26315689086914px 0px #0000001a;
  padding: 40px 20px;
  border-radius: 12px;
  margin: 30px 0;
  justify-content: space-between;
  &:first-child {
    margin-left: 10px;
  }
  &:last-child {
    margin-right: 10px;
  }
  .action {
    background-color: ${(props) => props?.event?.secondaryColor};
    color: ${(props) => props?.event?.secondaryTextColor};
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
    margin-top: 10px;
  }
  .action.disabled {
    opacity: 0.5;
    cursor: initial;
  }
  > img {
    max-width: 100%;
    width: 70px;
    height: 70px;
    object-fit: cover;
  }

  > h2 {
    margin-top: 20px;
    margin-bottom: 0px;
    font-size: 20px;
    font-weight: bold;
    color: ${(props) => props?.event?.themeColor};
  }

  > p {
    font-size: 12px;
    font-weight: thin;
    margin-top: 10px;
    color: grey;
  }
  &.theme3 {
    width: 100%;
    flex: 100%;
    max-width: 100%;
    > img {
      max-width: 100%;
      width: auto;
      height: 70px;
      object-fit: cover;
    }
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
    > img {
      max-width: 100%;
      width: 70px;
      height: 70px;
      object-fit: cover;
    }
    &.theme3 {
      width: 100%;
      flex: 100%;
      max-width: 100%;
      > img {
        width: auto;
      }
    }
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
const Title1 = styled.h1`
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

const Header1 = styled.div`
  display: flex;
  -webkit-box-pack: center;
  justify-content: center;
  width: 90%;
  align-items: baseline;
  margin: auto;
  gap: 30px;
  margin-bottom: 30px;
  &.theme1 {
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
const Description1 = styled.p`
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
const TicketsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0px; /* Adjust the gap between the tickets */
  padding: 20px;
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const TicketImage = styled.img`
  width: 250px; /* Adjust the width of the ticket image */
  height: auto; /* Maintain the aspect ratio */
  @media (max-width: 768px) {
    width: 100%; /* Adjust width for smaller screens */
  }
`;
const TicketRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0px; // Adjust as needed
  gap: 30px;
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;
const Heading = styled.div`
  height: auto; /* Maintain the aspect ratio */
  margin: 10px 20px 30px;
  /* Target all p elements inside the Heading */
  p {
    margin: 0.2rem 0;
    font-weight: normal;
  }

  /* Target the first p element */
  & > p:first-child {
    font-size: 2rem;
  }

  /* Target the second p element */
  & > p:nth-child(2) {
    font-size: 2.5rem;
  }

  @media (max-width: 768px) {
    width: 90%; /* Adjust width for smaller screens */
    margin: 20px;
    & > p:first-child {
      font-size: 1.5rem;
    }

    /* Target the second p element */
    & > p:nth-child(2) {
      font-size: 2rem;
    }
  }
`;

const MyEvents = ({ event, sectionTheme, items = [], id, config, deskTopScrolling = "vertical", mobileScrolling = "vertical", setLoaderBox, user }) => {
  const bg = import.meta.env.VITE_CDN + config.backgroundImage;
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [itemsList, setItemsList] = useState(items);

  // Define state for grouped events
  const [groupedEvents, setGroupedEvents] = useState({});
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
  // Function to group events by start date
  const groupEventsByStartDate = (events) => {
    const grouped = {};
    events.forEach((event) => {
      const startDate = new Date(event.startDate).toLocaleDateString();
      if (!grouped[startDate]) {
        grouped[startDate] = [];
      }
      grouped[startDate].push(event);
    });
    return grouped;
  };

  // Update grouped events state when items change
  useEffect(() => {
    if (items?.length > 0) {
      if (Object.keys(groupedEvents).length === 0) {
        const grouped = groupEventsByStartDate(items);
        setGroupedEvents(grouped);
      }
    }
  }, [items, groupedEvents]);

  useEffect(() => {
    setSelectedGroup(groupedEvents[Object.keys(groupedEvents)[0]]);
  }, [groupedEvents]);

  const navigate = useNavigate();

  const renderTickets = () => {
    const rows = [];
    for (let i = 0; i < items.length; i += config.numberOfItemToShow) {
      const rowItems = items.slice(i, i + config.numberOfItemToShow);
      const row = (
        <TicketRow key={`row-${i}`}>
          {rowItems.map((item, index) => (
            <TicketBox style={{ position: "relative" }} key={item._id}>
              <TicketImage src={import.meta.env.VITE_CDN + item.thumbnail} alt={item.title} />
              <RegBox id={`countItem-${i + index}`}>
                {item.enableRegistration ? (
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
                ) : (
                  <button className="action disabled">
                    Coming Soon
                    <GetIcon icon={"time"} />
                  </button>
                )}
              </RegBox>
            </TicketBox>
          ))}
        </TicketRow>
      );
      rows.push(row);
    }
    return rows;
  };

  switch (sectionTheme) {
    case "theme2":
      return (
        <Section
          id={id}
          className="padding"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3)), url(${background})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "white",
          }}
        >
          <Heading dangerouslySetInnerHTML={{ __html: config.title }}></Heading>
          <TicketsContainer>{renderTickets()}</TicketsContainer>
          {event && event?.title === "Go Global Summit" && (
            <div className="ul-event-box">
              <div>Add-Ons</div>
              <ul className="ul-event">
                <li>
                  Diamond, Gold, and Silver attendees will get exclusive add-ons like two exclusive email newsletters pre and post-event news to the global database of the World Malayalee Council.
                </li>
                <li>Four social media posts and one video post (content to be provided) on the World Malayalee Council's platforms.</li>
                <li>PR and media</li>
              </ul>
            </div>
          )}
        </Section>
      );
    case "theme4":
      return (
        <Section id={id} className="padding">
          <Container className="column">
            <Header1 className={`mobile-column ${sectionTheme}`}>
              <Title1 className="black">{config.title}</Title1>
              <Description1 className="black" dangerouslySetInnerHTML={{ __html: config.description }}></Description1>
            </Header1>
          </Container>
          <FeaturesContainer id="countItem" className={`${sectionTheme} ${isMobile ? config.mobileScrolling : config.deskTopScrolling}`}>
            {items.length > 0 &&
              items.map((item, index) => (
                <CountItem id={`countItem-${index}`} className={`${sectionTheme} ${deskTopScrolling}`} event={event} key={index}>
                  <img src={import.meta.env.VITE_CDN + item.thumbnail} alt={item.title} />
                  <h2>{item.title}</h2>
                  <div>
                    {item.enableRegistration ? (
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
                    ) : (
                      <button className="action disabled">
                        Coming Soon<GetIcon icon={"time"}></GetIcon>
                      </button>
                    )}
                  </div>
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
    case "theme3":
      return (
        <Section id={id} className="padding">
          <Container className="column">
            <Header1 className={`mobile-column ${sectionTheme}`}>
              <Title1 className="black">{config.title}</Title1>
              <Description1 className="black" dangerouslySetInnerHTML={{ __html: config.description }}></Description1>
            </Header1>
          </Container>
          <FeaturesContainer id="countItem" className={`${sectionTheme} ${isMobile ? config.mobileScrolling : config.deskTopScrolling}`}>
            {items.length > 0 &&
              items.map((item, index) => (
                <CountItem id={`countItem-${index}`} className={`${sectionTheme} ${deskTopScrolling}`} event={event} key={index}>
                  <img src={import.meta.env.VITE_CDN + item.thumbnail} alt={item.title} />
                  <h2>{item.title}</h2>
                  <div>
                    {item.enableRegistration ? (
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
                    ) : (
                      <button className="action disabled">
                        Coming Soon<GetIcon icon={"time"}></GetIcon>
                      </button>
                    )}
                  </div>
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
    case "theme1":
    default:
      return (
        <Section className="padding-large" background={`url(${bg}) top center/cover no-repeat;`} id={id}>
          <Container className="column">
            <Header className="mobile-column">
              <Title>{config.title}</Title>
              <Description dangerouslySetInnerHTML={{ __html: config.description }}></Description>
            </Header>
            <Tabs event={event}>
              {Object.keys(groupedEvents).map((startDate, index) => (
                <div key={`tab-${index}`} onClick={() => setSelectedGroup(groupedEvents[startDate])} className={selectedGroup === groupedEvents[startDate] ? "active" : ""}>
                  {`Day ${index + 1}`}
                </div>
              ))}
            </Tabs>
            <EventList event={event}>
              {selectedGroup?.map((item, index) => {
                return (
                  <div key={`item-${index}`} className="item">
                    <div>
                      <div>{`${moment(item.startDate).format("h:mmA")}`}</div>
                      <div> - to - </div> <div>{`${moment(item.endDate).format("h:mmA")}`}</div>{" "}
                    </div>
                    <div>
                      <div>{item.title}</div>
                      <div>{`${moment(item.startDate).format("MMM DD ddd, ")} ${item.venue}`}</div>
                      <ReadMoreButton onClick={() => navigate("events/" + (item.slug?.length > 2 ? item.slug : `${item._id}`))} event={event}>
                        Free Register
                      </ReadMoreButton>
                    </div>
                    <div>
                      <ReadMoreButton onClick={() => navigate("events/" + (item.slug?.length > 2 ? item.slug : `${item._id}`))} event={event}>
                        Free Register
                      </ReadMoreButton>
                    </div>
                  </div>
                );
              })}
            </EventList>
          </Container>
        </Section>
      );
  }
};

export default MyEvents;
