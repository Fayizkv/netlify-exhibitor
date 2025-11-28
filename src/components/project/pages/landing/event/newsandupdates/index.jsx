import React, { useState } from "react";
import { Container, Section } from "../styles";
import styled from "styled-components";
import janePhoto from "../../../../../../images/public/default_food.jpg";

const NewsUpdates = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: auto;
  @media (max-width: 768px) {
    h1 {
      text-align: center;
    }
  }
`;
const CardColumn = styled.div`
  display: flex;
  flex-direction: row;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;
const NewsColumn1 = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  &.theme1 {
    width: 100%;
    flex-wrap: wrap;
  }
  .news-image {
    width: 1100px;
    height: 300px;
    border-radius: 10px;
  }
  .news-image-2 {
    width: 250px;
    height: 220px;
    border-radius: 10px;
  }
  .news-box {
    width: 250px;
    margin-top: 20px;
    &.theme4 {
      margin-top: 0;
      align-self: center;
    }
  }
  .latest-box {
    display: flex;
    flex-direction: row;
    margin-top: 20px;
    width: 100%;
  }
  .dot {
    width: 10px;
    height: 10px;
    background-color: ${(props) => props.event.themeColor};
    border-radius: 50%;
    display: inline-block;
    margin-right: 5px;
  }
  .name-text {
    font-weight: 400;
    text-align: left;
  }
  .time {
    font-size: 12px;
    font-weight: 200;
  }
  &.theme4 {
    gap: 40px;
    overflow: auto;
    align-items: center;
    flex-wrap: ${(props) => (props.deskTopScrolling === "Vertical" ? "wrap" : "nowrap")};
    align-items: ${(props) => (props.deskTopScrolling === "Vertical" ? "center" : "flex-start")};
    justify-content: ${(props) => (props.deskTopScrolling === "Vertical" ? "center" : "flex-start")};
  }
  @media (max-width: 768px) {
    // flex-direction: column;
    flex-wrap: wrap;
    justify-content: space-between;
    padding-left: 10px;
    padding-right: 10px;
    &.theme4 {
      flex-wrap: ${(props) => (props.mobileScrolling === "Vertical" ? "wrap" : "nowrap")};
      align-items: ${(props) => (props.mobileScrolling === "Vertical" ? "center" : "flex-start")};
      justify-content: ${(props) => (props.mobileScrolling === "Vertical" ? "center" : "flex-start")};
    }
    .news-image {
      width: 100%;
      height: 200px;
    }
    .latest-box {
      flex-direction: column;
    }
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
const LatestBlock = styled.div`
  margin-left: 20px;
  width: 100%;
  height: auto;
  font-weight: 400;
  .latest-info {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .latest-info p {
    font-size: 14px;
  }
  .latest-btn {
    background-color: ${(props) => props.event.themeColor} !important;
    width: 70px;
    height: 30px;
    border: none;
    border-radius: 5px;
    color: #fff;
    margin-right: 10px;
  }
  .news-text {
    display: flex;
    margin-right: 30px;
    color: #555555;
  }
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;
const NewsCard = styled.div`
  display: flex;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  width: 600px;
  height: 230px;
  padding: 15px;
  margin-bottom: 40px;
  &.theme3 {
    background: linear-gradient(to top, ${(props) => props.event.themeColor}, ${(props) => props.event.secondaryColor});
  }
  .news-image img {
    width: 100%;
    height: 100%;
    display: block;
  }
  .news-content {
    flex: 2;
    text-align: left;
    margin-left: 20px;
    &.theme3 {
      color: #fff;
    }
  }
  .chip {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${(props) => props.event.themeColor} !important;
    width: 72px;
    height: 21px;
    border-radius: 5px;
    font-family: Arial, Helvetica, sans-serif;
    color: #fff;
    font-size: 14px;
  }
  .chip-new {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 95%;
    height: 30px;
    margin-bottom: 10px;
    font-size: 14px;
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 300;
  }
  .chip-new img {
    width: 20px;
    height: auto;
    border-radius: 50%;
  }
  .profile-name,
  .calendar,
  .clock {
    margin-right: 8px;
    margin-left: 8px;
  }
  .divider {
    margin-right: 4px;
  }
  .news-text {
    font-family: Arial, Helvetica, sans-serif;
    color: #555555;
    font-weight: 100;
    font-size: 11px;
    height: auto;
    &.theme3 {
      color: #fff;
    }
  }
  @media (max-width: 768px) {
    width: 100%;
    .chip-new img {
      display: none;
    }
    .chip-new {
      display: none;
    }
  }
`;
const VerticalLine = styled.hr`
  border-left: 1px solid rgb(164, 162, 162);
  margin-right: 40px;
  margin-left: 40px;
  @media (max-width: 768px) {
    display: none;
  }
`;
const NewsCardSmall = styled.div`
  display: flex;
  overflow: hidden;
  width: 450px;
  height: 120px;
  margin-bottom: 8px;
  .news-image img {
    width: 100%;
    height: 100%;
    display: block;
  }
  .news-content {
    flex: 2;
    text-align: left;
    margin-left: 20px;
  }
  .chip {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${(props) => props.event.themeColor} !important;
    width: 72px;
    height: 21px;
    border-radius: 5px;
    font-family: Arial, Helvetica, sans-serif;
    color: #fff;
    font-size: 14px;
  }
  .chip-new {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 95%;
    height: 30px;
    margin-bottom: 10px;
    font-size: 14px;
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 300;
  }
  .chip-new img {
    width: 20px;
    height: auto;
    border-radius: 50%;
  }
  .profile-name,
  .calendar,
  .clock {
    margin-right: 8px;
    margin-left: 8px;
  }
  .divider {
    margin-right: 4px;
  }
  .news-text {
    font-family: Arial, Helvetica, sans-serif;
    color: #555555;
    font-weight: 100;
    font-size: 11px;
    height: auto;
  }
  @media (max-width: 768px) {
    width: 100%;
  }
`;
const mockNewsLatest = [
  {
    name: "Set Video Playback Speed with Javascript",
    photo: janePhoto,
    type: "Lifestyle",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry",
    author: "Jessica kohli",
    date: "02-Dec-2023",
    time: 3,
    authorImage: janePhoto,
  },
  {
    name: "Set Video Playback Speed with Javascript",
    photo: janePhoto,
    type: "Lifestyle",
    description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
    author: "Jessica kohli",
    date: "02-Dec-2023",
    time: 3,
    authorImage: janePhoto,
  },
];
const mockNews = [
  {
    name: "Set Video Playback Speed with Javascript",
    photo: janePhoto,
    type: "Travel",
    description: "Did you come here for something in particular or just general bike rashing",
    author: "Jessica kohli",
    date: "02-Dec-2023",
    time: 3,
    authorImage: janePhoto,
  },
  {
    name: "Set Video Playback Speed with Javascript",
    photo: janePhoto,
    type: "Lifestyle",
    description: "Did you come here for something in particular or just general bike rashing",
    author: "Jessica kohli",
    date: "02-Dec-2023",
    time: 3,
    authorImage: janePhoto,
  },
  {
    name: "Set Video Playback Speed with Javascript",
    photo: janePhoto,
    type: "Travel",
    description: "Did you come here for something in particular or just general bike rashing",
    author: "Jessica kohli",
    date: "02-Dec-2023",
    time: 3,
    authorImage: janePhoto,
  },
  {
    name: "Set Video Playback Speed with Javascript",
    photo: janePhoto,
    type: "Travel",
    description: "Did you come here for something in particular or just general bike rashing",
    author: "Jessica kohli",
    date: "02-Dec-2023",
    time: 3,
    authorImage: janePhoto,
  },
  {
    name: "Set Video Playback Speed with Javascript",
    photo: janePhoto,
    type: "Travel",
    description: "Did you come here for something in particular or just general bike rashing",
    author: "Jessica kohli",
    date: "02-Dec-2023",
    time: 3,
    authorImage: janePhoto,
  },
  {
    name: "Set Video Playback Speed with Javascript",
    photo: janePhoto,
    type: "Lifestyle",
    description: "Did you come here for something in particular or just general bike rashing",
    author: "Jessica kohli",
    date: "02-Dec-2023",
    time: 3,
    authorImage: janePhoto,
  },
  {
    name: "Set Video Playback Speed with Javascript",
    photo: janePhoto,
    type: "Travel",
    description: "Did you come here for something in particular or just general bike rashing",
    author: "Jessica kohli",
    date: "02-Dec-2023",
    time: 3,
    authorImage: janePhoto,
  },
  {
    name: "Set Video Playback Speed with Javascript",
    photo: janePhoto,
    type: "Travel",
    description: "Did you come here for something in particular or just general bike rashing",
    author: "Jessica kohli",
    date: "02-Dec-2023",
    time: 3,
    authorImage: janePhoto,
  },
];

const NewsAndUpdates = ({ id, news = [], event, theme, config }) => {
  const isMobile = window.matchMedia("(max-width: 800px)").matches;
  const numberOfButtons = isMobile ? Math.ceil(mockNews.length / 2) : Math.ceil(mockNews.length / 4);
  const [current, setCurrent] = useState(0);
  const handleClick = (index) => {
    setCurrent(index);
    const newsItem = document.getElementById(`newsItem`);
    if (newsItem) {
      const offset = isMobile ? 20 : 0;
      newsItem.scrollTo({
        left: index === 0 ? 0 : index * window.outerWidth - offset,
        behavior: "smooth",
      });
    }
  };
  switch (theme) {
    case "theme1":
    default:
      return (
        <Section id={id}>
          <Container className="column">
            <NewsUpdates>
              <h1 style={{ fontWeight: 400 }}>{config.title}</h1>
              <NewsColumn1 event={event} className="theme1">
                {mockNewsLatest &&
                  mockNewsLatest.map((news, index) => (
                    <div className="latest-box">
                      <img src={news.photo} alt={news.name} className="news-image" />
                      <LatestBlock event={event}>
                        <h3>{news.name}</h3>
                        <div class="latest-info">
                          <button class="latest-btn">Latest</button>
                          <p class="timer-texts">{news.time} MINUTES AGO</p>
                        </div>
                        <div class="news-text">
                          <p class="timer-texts">{news.description}</p>
                        </div>
                      </LatestBlock>
                    </div>
                  ))}
              </NewsColumn1>
              <NewsColumn1 event={event} className="theme1">
                {mockNews &&
                  mockNews.map((news, index) => (
                    <>
                      <div class="news-box">
                        <img src={news.photo} alt={news.name} className="news-image-2" />
                        <p class="name-text">{news.name}</p>
                        <div>
                          <span class="dot"></span>
                          <span class="time">{news.time} minutes ago</span>
                        </div>
                      </div>
                    </>
                  ))}
              </NewsColumn1>
            </NewsUpdates>
          </Container>
        </Section>
      );
    case "theme2":
      return (
        <Section id={id} className="padding-sides">
          <h1 style={{ fontWeight: 400 }}>{config.title}</h1>
          <CardColumn>
            <div class="column">
              {mockNewsLatest &&
                mockNewsLatest.map((news, index) => (
                  <NewsCard event={event}>
                    <div class="news-image">
                      <img src={news.photo} alt={news.name} />
                    </div>
                    <div class="news-content">
                      <div class="chip">Travel</div>
                      <h3>Set Video Plackback Speed With Javascript</h3>
                      <div class="chip-new">
                        <img src={news.photo} alt={news.name} />
                        <span class="profile-name">John Doe</span>
                        <span class="divider">|</span>
                        <span class="calendar">
                          <i class="fas fa-calendar-alt"></i>
                          29 Feb 2024
                        </span>
                        <span class="divider">|</span>
                        <span class="clock">
                          <i class="fas fa-clock"></i>3 Min. to read
                        </span>
                      </div>
                      <div class="news-text">Did you come here for something in particular or just general Riker bashing.</div>
                    </div>
                  </NewsCard>
                ))}
            </div>
            <VerticalLine></VerticalLine>
            <div class="column">
              {mockNews &&
                mockNews.map((news, index) => (
                  <NewsCardSmall event={event}>
                    <div class="news-image">
                      <img src={news.photo} alt={news.name} />
                    </div>
                    <div class="news-content">
                      <div class="chip">Lifestyle</div>
                      <h5>Set Video Plackback Speed With Javascript</h5>
                      <div class="chip-new">
                        <span class="profile-name">John Doe</span>
                        <span class="divider">|</span>
                        <span class="clock">
                          <i class="fas fa-clock"></i> 3 Min. to read
                        </span>
                      </div>
                    </div>
                  </NewsCardSmall>
                ))}
            </div>
          </CardColumn>
        </Section>
      );
    case "theme3":
      return (
        <Section id={id} className="padding-sides" style={{ backgroundColor: "black" }}>
          <h1 style={{ fontWeight: 400, color: "#fff" }}>{config.title}</h1>
          <CardColumn>
            <div class="column">
              {mockNewsLatest &&
                mockNewsLatest.map((news, index) => (
                  <NewsCard event={event} className={theme}>
                    <div class="news-image">
                      <img src={news.photo} alt={news.name} />
                    </div>
                    <div class="news-content theme3">
                      <div class="chip">Travel</div>
                      <h3>Set Video Plackback Speed With Javascript</h3>
                      <div class="chip-new">
                        <img src={news.photo} alt={news.name} />
                        <span class="profile-name">John Doe</span>
                        <span class="divider">|</span>
                        <span class="calendar">
                          <i class="fas fa-calendar-alt"></i>
                          29 Feb 2024
                        </span>
                        <span class="divider">|</span>
                        <span class="clock">
                          <i class="fas fa-clock"></i>3 Min. to read
                        </span>
                      </div>
                      <div class="news-text theme3">Did you come here for something in particular or just general Riker bashing.</div>
                    </div>
                  </NewsCard>
                ))}
            </div>
            <VerticalLine></VerticalLine>
            <div class="column">
              {mockNews &&
                mockNews.map((news, index) => (
                  <NewsCardSmall event={event}>
                    <div class="news-image">
                      <img src={news.photo} alt={news.name} />
                    </div>
                    <div class="news-content">
                      <div class="chip">Lifestyle</div>
                      <p style={{ color: "#fff" }}>Set Video Plackback Speed With Javascript</p>
                      <div class="chip-new" style={{ color: "#fff" }}>
                        <span class="profile-name">John Doe</span>
                        <span class="divider">|</span>
                        <span class="clock">
                          <i class="fas fa-clock"></i> 3 Min. to read
                        </span>
                      </div>
                    </div>
                  </NewsCardSmall>
                ))}
            </div>
          </CardColumn>
        </Section>
      );
    case "theme4":
      return (
        <Section id={id} className="padding-sides center">
          <h1 style={{ fontWeight: 400 }}>{config.title}</h1>
          <Container className="column">
            {/* <NewsUpdates> */}
            <NewsColumn1 event={event} id="newsItem" className={theme} deskTopScrolling={config.deskTopScrolling} mobileScrolling={config.mobileScrolling}>
              {mockNews &&
                mockNews.map((news, index) => (
                  <>
                    <div class="news-box theme4" id={`newsItem-${index}`} key={index}>
                      <img src={news.photo} alt={news.name} className="news-image-2" />
                      <p class="name-text">{news.name}</p>
                      <div>
                        <span class="dot"></span>
                        <span class="time">{news.time} minutes ago</span>
                      </div>
                    </div>
                  </>
                ))}
            </NewsColumn1>
            {/* </NewsUpdates> */}
          </Container>
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
export default NewsAndUpdates;
