import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Container, Section } from "../styles";
import { GetIcon } from "../../../../../../icons";
import Banner from "../banner";
import { useNavigate } from "react-router-dom";
import { bannerimage } from "../../../../brand";
import TicketDraw from "../register/TicketDraw";

// Styled components
const Header = styled.header`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 0;
  @media (max-width: 768px) {
    padding: 10px 30px;
  }
  @media (max-width: 408px) {
    padding: 10px 10px;
  }
`;

const Logo = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: center;

  button {
    display: none;
  }
  img {
    max-width: 150px;
    height: auto;
    margin-right: 10px;
    max-height: 75px;
  }
  &.background img {
    max-width: 200px;
    max-height: 80px;
  }
  @media (max-width: 768px) {
    img {
      width: 75px;
    }
    button {
      width: 50px;
      height: 50px;
      outline: none;
      border: none;
      background-color: #eeeeee;
      font-size: 33px;
      display: flex;
      color: black;
      justify-content: center;
      align-items: center;
      border-radius: 5px;
    }
  }
`;

const Navbar = styled.div`
  overflow: hidden;
  svg {
    display: none;
  }
  button {
    float: left;
    display: block;
    color: grey;
    text-align: center;
    padding: 14px 20px;
    text-decoration: none;
    font-weight: 400;
    font-size: 16px;
    font-family: Arial, Helvetica, sans-serif;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: transparent;
    border: 0;

    &.active {
      border-bottom: 2px solid ${(props) => props.event.themeColor};
      color: ${(props) => props.event.themeColor};
    }
  }
  &.theme-2 button {
    font-size: 18px;
    font-weight: 400;
    line-height: 30.26px;
    text-align: left;
    color: black;
    position: relative;
    &.active {
      border-bottom: 0px solid ${(props) => props.event.themeColor};
      /* color: ${(props) => props.event.themeColor}; */
    }
    span {
      z-index: 1001;
      position: relative;
    }
  }
  &.theme-2 button.active::before,
  &.theme-2 button:hover::before {
    content: "";
    position: absolute;
    left: 12px;
    top: 18px;
    bottom: 50%;
    height: 22px;
    width: 22px;
    border-radius: 50%;
    border: 0px;
    background: ${(props) => props.event.themeColor};
    border: 0;
    color: black !important;
  }
  .register {
    display: none;
  }
  &.Navbar {
    display: flex;
    top: 75px;
    bottom: auto;
    svg {
      display: none;
    }
    div {
      flex-direction: column;
      width: 100%;
    }
  }
  @media (max-width: 768px) {
    position: fixed;
    bottom: 0;
    left: 1px;
    right: 1px;
    border-radius: 0;
    display: flex;
    z-index: 1;
    justify-content: center;
    .register {
      display: flex;
      background: ${(props) => props.event.secondaryColor};
      color: ${(props) => props.event.secondaryTextColor};
      width: 78px;
      font-weight: bold;
      animation: blink 1s infinite;
    }

    &.Navbar.active {
      display: flex;
    }
    @keyframes blink {
      50% {
        opacity: 0.6;
      }
    }
    div {
      background: ${(props) => props.event.themeColor};
      color: ${(props) => props.event.themeTextColor};
      justify-content: center;
      border-radius: 10px;
      display: flex;
      margin: 10px;
      gap: 15px;
      padding: 0 15px;
    }
    svg {
      display: initial;
      font-size: 16px;
    }
    button {
      color: ${(props) => props.event.themeTextColor};
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: auto;
      overflow: hidden;
      flex-direction: column;
      display: flex;
      gap: 10px;
      font-size: 10px;
      padding: 15px 10px;
      &.active {
        border-bottom: 2px solid ${(props) => props.event.themeTextColor};
        color: ${(props) => props.event.themeTextColor};
        font-weight: bold;
      }
    }
    &.Navbar {
      position: absolute;
      display: none;
      div {
        padding: 15px;
      }
      button {
        display: flex;
        flex-direction: row;
        color: white;
        font-size: 16px;
        border-bottom: 1px solid #ffffff2b;
      }
      button:last-child {
        border: 0;
      }
      .register {
        width: 100%;
        border-radius: 8px;
      }
    }
  }
`;

const RegisterBtn = styled.button`
  background: ${(props) => props.event.secondaryColor};
  color: ${(props) => props.event.secondaryTextColor};
  border-radius: 5px;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  display: flex;
  gap: 10px;
  font-size: 14px;
  &.float {
    position: fixed;
    right: 20px;
    bottom: 20px;
    animation: blink 1s infinite;
    z-index: 1;
  }

  @keyframes blink {
    50% {
      opacity: 0.4;
    }
  }
  @media (max-width: 768px) {
    &.float {
      position: inherit;
      right: 20px;
      bottom: 20px;
    }
  }
`;
const ImageSection = styled.img`
  margin: auto;
  object-fit: contain;
  margin-bottom: 0;
  margin-top: 20vh;
  width: 61%;
  max-height: 40vh;
  @media (max-width: 768px) {
    width: 90%;
    max-height: 60vh;
    max-width: 500px;
  }
  @media (max-width: 768px) {
    width: 90%;
    max-height: 60vh;
  }
`;
const Grab = styled.div`
  display: flex;
  justify-content: center;
  width: fit-content;
  margin: auto;
  gap: 10px;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ReadMoreButton = styled.button`
  background: ${(props) => props.event.secondaryColor};
  color: ${(props) => props.event.themeTextColor};
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  margin-top: 20px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    transform: scale(1.1);
  }
  &.grab {
    border: 0px solid;
    margin: auto auto 0px;
    position: relative;
    /* transform: rotate(350deg); */
    margin-top: 0;
    &.green {
      background: ${(props) => props.event.themeColor};
      /* margin-top: 10px; */
    }
    @media (max-width: 768px) {
      &.green {
        /* margin-bottom: 120px; */
      }
    }
    ::after {
      //content: "";
      position: absolute;
      width: 50px;
      left: -50px;
      height: 2px;
      background: ${(props) => props.event.themeColor};
      top: 50%;
    }
    ::before {
      // content: "";
      position: absolute;
      width: 50px;
      right: -50px;
      height: 2px;
      background: ${(props) => props.event.themeColor};

      top: 50%;
    }
  }
  &.green {
    ::after {
      background: ${(props) => props.event.secondaryColor};
    }
    ::before {
      background: ${(props) => props.event.secondaryColor};
    }
  }
`;
const Menu = ({ menuItems, id, event, registserHandler, user, theme, title, description, additionalMenus = [], setLoaderBox }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isActive, setIsActive] = useState("");
  const navigate = useNavigate();
  const [isFloating, setIsFloating] = useState(false);
  const [isLuckyDraw, setIsLuckyDraw] = useState(false);
  const handleClick = (index) => {
    setActiveIndex(index);
    menuItems[index].onClick();
  };
  const addmenuhandleClick = (index, item) => {
    setActiveIndex(index);
    if (item.targetType !== "External Url") {
      navigate("/" + item.slug);
    } else if (item.targetType === "Home") {
      navigate("");
    } else {
      // Check if the URL is complete (contains 'http' or 'https')
      if (item.url.startsWith("http://") || item.url.startsWith("https://")) {
        // Complete URL, open in a new tab
        window.open(item.url, "_blank");
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        if (user?.token) {
        } else {
          setIsFloating(true);
        }
      } else {
        setIsFloating(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [user?.token]);
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const { bannerType, mobileMenuType, desktopMenuStyle, headerTheme } = event;
  return (
    <Section
      className={`${bannerType === "background" ? "bg-image" : ""}`}
      background={`${bannerType === "background" ? "url(" + import.meta.env.VITE_CDN + (isMobile ? event.mobBanner : event.banner) + ")" : "#ffffff;"}`}
      id={id}
    >
      {/* {bannerType === "background" && <iframe title="lottie" src="https://lottie.host/embed/935ddf81-0079-49a4-8d91-86261d332a97/EII3ZQny6u.json"></iframe>} */}
      {headerTheme !== "none" && (
        <Container>
          <Header>
            <Logo className={bannerType}>
              <button
                onClick={() => {
                  setIsActive((prev) => (prev === "active" ? "" : "active"));
                }}
              >
                {isActive ? <GetIcon icon={"close"}></GetIcon> : <GetIcon icon={"menu"}></GetIcon>}
              </button>
              <img onClick={() => (window.location.href = "/")} src={import.meta.env.VITE_CDN + event.logo} alt={event.title} />
            </Logo>
            <Navbar event={event} className={`${bannerType} ${mobileMenuType} ${desktopMenuStyle} ${isActive}`}>
              <div>
                {menuItems.map((menuItem, index) => (
                  <button key={index} onClick={() => handleClick(index)} className={activeIndex === index ? "active" : ""}>
                    {menuItem.icon?.length > 0 && <GetIcon icon={menuItem.icon}></GetIcon>}
                    <span>{menuItem.title}</span>
                  </button>
                ))}
                {additionalMenus
                  .filter((menu) => menu.placement === "both" || menu.placement === "header")
                  .map((menuItem, index) => (
                    <button key={index + 20} onClick={() => addmenuhandleClick(index + 20, menuItem)} className={activeIndex === index + 20 ? "active" : ""}>
                      {menuItem.icon?.length > 0 && <GetIcon icon={menuItem.icon}></GetIcon>}
                      <span>{menuItem.title}</span>
                    </button>
                  ))}
                {!user?.token && event._id !== "6646477f39a2cf9006ed031f" && (
                  <button className={"more register"} onClick={() => registserHandler()}>
                    <GetIcon icon={"ticket-registration"}></GetIcon>
                    {"Register"}
                  </button>
                )}
                {menuItems.length > 3 && (
                  <button className={"more"}>
                    <GetIcon icon={"menu"}></GetIcon>
                    <span>{"More"}</span>
                  </button>
                )}
              </div>
            </Navbar>
            {
              user?.token
                ? event._id !== "6646477f39a2cf9006ed031f" && (
                    <RegisterBtn
                      className={isFloating ? "float" : ""}
                      onClick={() => {
                        if (event.homePage === "Sub Events") {
                          localStorage.clear();
                          window.location.reload();
                        } else {
                          registserHandler();
                        }
                      }}
                      event={event}
                    >
                      {event.homePage === "Sub Events" ? (
                        <>
                          <GetIcon icon={"logout"}></GetIcon>
                          Logout
                        </>
                      ) : (
                        event._id !== "6646477f39a2cf9006ed031f" && (
                          <>
                            <GetIcon icon={"edit"}></GetIcon>
                            {user.fullName}
                          </>
                        )
                      )}
                    </RegisterBtn>
                  )
                : event._id !== "6646477f39a2cf9006ed031f" && null
              // <RegisterBtn className={isFloating ? "float" : ""} onClick={() => registserHandler()} event={event}>
              //   Register Free
              // </RegisterBtn>
            }
          </Header>
        </Container>
      )}
      {bannerType === "background" && (
        <>
          <iframe title="lottie" src="https://lottie.host/embed/935ddf81-0079-49a4-8d91-86261d332a97/EII3ZQny6u.json"></iframe>
          <ImageSection alt="lottie" src={bannerimage}></ImageSection>
          <Grab>
            <ReadMoreButton onClick={() => (window.location.href = "/book-tickets")} className="grab" event={event}>
              Grab Your Seats
            </ReadMoreButton>
            <ReadMoreButton onClick={() => setIsLuckyDraw((prev) => !prev)} className="grab green" event={event}>
              Win A Car
            </ReadMoreButton>
          </Grab>
        </>
      )}
      {bannerType === "normal" && <Banner key={0} id={`section-0`} event={event} theme={event.bannerTheme ?? "theme1"} title={title} description={description} button={"Grab Your Seat"}></Banner>}
      {isLuckyDraw && (
        <TicketDraw
          setLoaderBox={setLoaderBox}
          registserHandler={(e) => {
            setIsLuckyDraw(false);
            document.body.style.overflow = "";
          }}
          event={event}
        />
      )}
    </Section>
  );
};

export default Menu;
