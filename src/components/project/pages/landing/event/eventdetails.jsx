import { useState } from "react";
import styled from "styled-components";
import Menu from "./menu";
import Register from "./register";
import { Container } from "./styles";
import moment from "moment";
import { GetIcon } from "../../../../../icons";
import Footer from "./footer";
import { EventRegister } from "./register/event";
const EventDetailsContainer = styled.div`
  width: 100%;
`;

const EventDetailsColumns = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  gap: 50px;
  width: 100%;
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 20px;
    gap: 20px;
    margin-top: 0px;
  }
`;

const EventDetailsColumn = styled.div`
  flex: 0 0 60%;
  margin-right: 20px;
  img {
    width: 100%;
    max-height: 200px;
    object-fit: cover;
  }
  h2 {
    font-size: 30px;
    font-weight: normal;
  }
  h3 {
    font-size: 15px;
    display: flex;
    gap: 10px;
    svg {
      color: ${(props) => props.event.secondaryColor};
    }
  }
  p {
    font-weight: normal;
  }
  @media (max-width: 768px) {
    flex: auto;
  }
`;

const EventRegisterColumn = styled.div`
  flex: 0 0 30%;
`;

const Left = styled.div`
  flex: 100%;
  position: relative;
  width: 100%;
  border-top-right-radius: 12px;
  border-top-left-radius: 12px;
  svg {
    position: absolute;
    width: 100%;
    top: auto;
    bottom: -5px;
    left: 0;
    right: 0;
  }
`;

const Right = styled.div`
  flex: 1 1 100%;
  padding: 20px;
  justify-content: flex-start;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: left;
  align-self: flex-start;
  margin: auto;
  > h4 {
    background-color: #e3e3e3;
    padding: 5px 10px;
    border-radius: 8px;
    font-weight: lighter;
    font-size: 14px;
    margin: 0;
    text-align: center;
  }
  > h2 {
    color: ${(props) => props.event.themeColor};
    margin-top: 10px;
    font-size: 20px;
    font-weight: bold;
    text-align: center;
  }
  > p {
    margin-top: 10px;
    font-size: 15px;
    font-weight: lighter;
    text-align: center;
  }
  > .action {
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
  > h3 {
    border-width: 1px 0px 1px 0px;
    border-style: solid;
    padding: 10px 0;
    border-color: lightgrey;
    font-weight: lighter;
    font-size: 15px;
    width: 100%;
    text-align: center;
  }
  @media (max-width: 768px) {
    h2 {
      font-size: 17px;
    }
    &.float > .action {
      position: fixed;
      bottom: 20px;
    }
    p {
      font-size: 12px;
    }
    h3 {
      font-size: 10px;
    }
  }
`;
const Content = styled.div`
  strong {
    font-size: inherit;
    /* Add any other styles for strong elements */
  }
  h1 {
    font-size: inherit;
  }
  h2 {
    font-size: inherit;
  }
  h3 {
    font-size: inherit;
  }
  h4 {
    font-size: inherit;
  }
  h5 {
    font-size: inherit;
  }
  h6 {
    font-size: inherit;
  }
  p {
    font-size: inherit;
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;

    li {
      margin-bottom: 0.5rem;
    }
  }

  ol {
    font-size: inherit;
  }

  a {
    color: blue;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  div {
    /* Add any styles for div elements */
  }
`;

const CountItem = styled.div`
  position: relative;
  color: inherit; /* Use the default text color */
  text-decoration: none; /* Remove underline */
  width: 100%; /* Adjusted for the gap */
  margin-right: 0px; /* Spacing between the divs */
  margin-bottom: 10px; /* Spacing between rows */
  text-align: center;
  display: flex;
  flex-direction: column;
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
    height: 275px;
    object-fit: cover;
    border-bottom-left-radius: 12px;
    border-top-left-radius: 12px;
    object-position: top;
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
const EventDetails = ({ data, event, config, theme, additionalMenus, setLoaderBox }) => {
  const [registering, setRegistering] = useState(false);
  const [itemsList, setItemsList] = useState([config]);
  const [sections] = useState([{ sequence: 8, title: "", showInMenu: false, type: "footer" }]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("--token")) ?? null);
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };
  return (
    config && (
      <EventDetailsContainer className="landing">
        <Menu
          theme
          event={{ ...data.event, mobBanner: config?.banner ?? data.event.banner, banner: config?.banner ?? data.event.banner, bannerType: "normal" }}
          registserHandler={() => {
            setRegistering(true);
          }}
          additionalMenus={additionalMenus}
          bannerType="background"
          text={"All Events"}
          user={user}
          menuItems={sections
            .filter((section) => section.showInMenu)
            .map((section, index) => ({
              title: section.menuTitle,
              icon: section.type,
              onClick: () => scrollToSection(`section-${section.sequence}`),
            }))}
        ></Menu>
        <Container className="mobile-column">
          {config?.title && (
            <EventDetailsColumns>
              <EventDetailsColumn event={data.event}>
                <h2>{config.title}</h2>
                <h3>
                  <GetIcon icon={"date"}></GetIcon> {`${moment(config.startDate).format("MMM DD ddd | h:mmA")} - ${moment(config.endDate).format("h:mmA")}`}
                </h3>
                <h3>
                  <GetIcon icon={"location"}></GetIcon> {config.venue}
                </h3>
                <p>{config.description}</p>
                <Content dangerouslySetInnerHTML={{ __html: config.content }}></Content>
              </EventDetailsColumn>
              <EventRegisterColumn>
                <CountItem to={config.slug?.length > 2 ? config.slug : `${config._id}`} key={0} id={`countItem-${0}`} className={`${theme} `} event={event}>
                  <Left>
                    <img onError={(e) => (e.target.src = import.meta.env.VITE_CDN + data.event.banner)} src={import.meta.env.VITE_CDN + (config.thumbnail ?? data.event.banner)} alt={config.title} />
                    <svg width="359" height="17" viewBox="0 0 359 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M350.672 16.4045C346.142 16.4045 342.469 12.7322 342.469 8.20226C342.469 3.67229 346.142 1.47719e-05 350.672 1.49699e-05C355.202 1.51679e-05 358.874 3.67229 358.874 8.20226C358.874 12.7322 355.202 16.4045 350.672 16.4045Z"
                        fill="white"
                      />
                      <path
                        d="M329.267 16.4045C324.737 16.4045 321.065 12.7322 321.065 8.20226C321.065 3.67228 324.737 1.38363e-05 329.267 1.40343e-05C333.797 1.42323e-05 337.469 3.67229 337.469 8.20226C337.469 12.7322 333.797 16.4045 329.267 16.4045Z"
                        fill="white"
                      />
                      <path
                        d="M307.863 16.4045C303.333 16.4045 299.66 12.7322 299.66 8.20226C299.66 3.67228 303.333 1.29007e-05 307.863 1.30987e-05C312.393 1.32967e-05 316.065 3.67228 316.065 8.20226C316.065 12.7322 312.393 16.4045 307.863 16.4045Z"
                        fill="white"
                      />
                      <path
                        d="M286.458 16.4045C281.928 16.4045 278.256 12.7322 278.256 8.20226C278.256 3.67228 281.928 1.1965e-05 286.458 1.21631e-05C290.988 1.23611e-05 294.66 3.67228 294.66 8.20226C294.66 12.7322 290.988 16.4045 286.458 16.4045Z"
                        fill="white"
                      />
                      <path
                        d="M265.054 16.4045C260.524 16.4045 256.851 12.7322 256.851 8.20226C256.851 3.67228 260.524 1.10294e-05 265.054 1.12274e-05C269.584 1.14255e-05 273.256 3.67228 273.256 8.20226C273.256 12.7322 269.584 16.4045 265.054 16.4045Z"
                        fill="white"
                      />
                      <path
                        d="M243.649 16.4045C239.119 16.4045 235.447 12.7322 235.447 8.20226C235.447 3.67228 239.119 1.00938e-05 243.649 1.02918e-05C248.179 1.04898e-05 251.851 3.67228 251.851 8.20226C251.851 12.7322 248.179 16.4045 243.649 16.4045Z"
                        fill="white"
                      />
                      <path
                        d="M222.245 16.4045C217.715 16.4045 214.042 12.7322 214.042 8.20226C214.042 3.67228 217.715 9.15819e-06 222.245 9.3562e-06C226.775 9.55421e-06 230.447 3.67228 230.447 8.20226C230.447 12.7322 226.775 16.4045 222.245 16.4045Z"
                        fill="white"
                      />
                      <path
                        d="M200.84 16.4045C196.31 16.4045 192.638 12.7322 192.638 8.20226C192.638 3.67228 196.31 8.22257e-06 200.84 8.42058e-06C205.37 8.61859e-06 209.042 3.67228 209.042 8.20226C209.042 12.7322 205.37 16.4045 200.84 16.4045Z"
                        fill="white"
                      />
                      <path
                        d="M179.436 16.4045C174.906 16.4045 171.233 12.7322 171.233 8.20225C171.233 3.67228 174.906 7.28695e-06 179.436 7.48496e-06C183.966 7.68297e-06 187.638 3.67228 187.638 8.20226C187.638 12.7322 183.966 16.4045 179.436 16.4045Z"
                        fill="white"
                      />
                      <path
                        d="M158.031 16.4045C153.501 16.4045 149.829 12.7322 149.829 8.20225C149.829 3.67228 153.501 6.35133e-06 158.031 6.54934e-06C162.561 6.74735e-06 166.233 3.67228 166.233 8.20225C166.233 12.7322 162.561 16.4045 158.031 16.4045Z"
                        fill="white"
                      />
                      <path
                        d="M136.627 16.4045C132.097 16.4045 128.424 12.7322 128.424 8.20225C128.424 3.67228 132.097 5.41571e-06 136.627 5.61372e-06C141.157 5.81173e-06 144.829 3.67228 144.829 8.20225C144.829 12.7322 141.157 16.4045 136.627 16.4045Z"
                        fill="white"
                      />
                      <path
                        d="M115.222 16.4045C110.692 16.4045 107.02 12.7322 107.02 8.20225C107.02 3.67228 110.692 4.48009e-06 115.222 4.6781e-06C119.752 4.87611e-06 123.424 3.67228 123.424 8.20225C123.424 12.7322 119.752 16.4045 115.222 16.4045Z"
                        fill="white"
                      />
                      <path
                        d="M93.8177 16.4045C89.2878 16.4045 85.6155 12.7322 85.6155 8.20225C85.6155 3.67228 89.2878 3.54447e-06 93.8177 3.74248e-06C98.3477 3.94049e-06 102.02 3.67228 102.02 8.20225C102.02 12.7322 98.3477 16.4045 93.8177 16.4045Z"
                        fill="white"
                      />
                      <path
                        d="M72.4132 16.4045C67.8833 16.4045 64.211 12.7322 64.211 8.20225C64.211 3.67227 67.8833 2.60885e-06 72.4132 2.80686e-06C76.9432 3.00487e-06 80.6155 3.67227 80.6155 8.20225C80.6155 12.7322 76.9432 16.4045 72.4132 16.4045Z"
                        fill="white"
                      />
                      <path
                        d="M51.0088 16.4045C46.4788 16.4045 42.8065 12.7322 42.8065 8.20225C42.8065 3.67227 46.4788 1.67323e-06 51.0088 1.87124e-06C55.5387 2.06925e-06 59.211 3.67227 59.211 8.20225C59.211 12.7322 55.5387 16.4045 51.0088 16.4045Z"
                        fill="white"
                      />
                      <path
                        d="M29.6043 16.4045C25.0743 16.4045 21.402 12.7322 21.402 8.20225C21.402 3.67227 25.0743 7.37608e-07 29.6043 9.35619e-07C34.1343 1.13363e-06 37.8065 3.67227 37.8065 8.20225C37.8065 12.7322 34.1343 16.4045 29.6043 16.4045Z"
                        fill="white"
                      />
                      <path
                        d="M8.19981 16.4045C3.66983 16.4045 -0.0024416 12.7322 -0.00244141 8.20225C-0.00244121 3.67227 3.66983 -1.98012e-07 8.19981 0C12.7298 1.98012e-07 16.4021 3.67227 16.4021 8.20225C16.4021 12.7322 12.7298 16.4045 8.19981 16.4045Z"
                        fill="white"
                      />
                    </svg>
                  </Left>
                  <Right className="float" event={data.event}>
                    <h4>{config.tag}</h4>
                    <h2>{config.title}</h2>
                    <p>{config.shortDescription}</p>
                    <h3>{`${moment(config.startDate).format("MMM DD ddd | h:mmA")} - ${moment(config.endDate).format("h:mmA")}`}</h3>

                    <EventRegister
                      customClass="float"
                      userToken={user}
                      setLoaderBox={setLoaderBox}
                      item={itemsList[0]}
                      event={data.event}
                      itemsList={itemsList}
                      setItemsList={(items) => {
                        setItemsList(items);
                      }}
                    ></EventRegister>
                  </Right>
                </CountItem>
              </EventRegisterColumn>
            </EventDetailsColumns>
          )}
        </Container>
        <Footer additionalMenus={additionalMenus} key={0} event={data.event} id={`section-${0}`} theme={theme}></Footer>
        {registering && (
          <Register
            setLoaderBox={setLoaderBox}
            registserHandler={() => {
              setRegistering(false);
              document.body.style.overflow = "";
              setUser(JSON.parse(localStorage.getItem("--token")) ?? null);
            }}
            event={data.event}
          />
        )}
      </EventDetailsContainer>
    )
  );
};

export default EventDetails;
