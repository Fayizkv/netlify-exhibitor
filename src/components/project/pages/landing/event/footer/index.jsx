import React from "react";
import styled from "styled-components";
import { Container } from "../styles";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { GetIcon } from "../../../../../../icons";
import forth from "./global.jpg";
import fifth from "./indian-region.jpg";
import sixth from "./new-inter.jpg";

const FooterContent = styled.footer`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: auto;
  background-color: #000000;
  &.new {
    background-color: #1e1d1d;
  }
  // padding-top: 20px;
  padding: 0 50px;
  @media (max-width: 768px) {
    text-align: center;
    padding: 0 10px;
  }
`;

const FooterInside = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 30px 0;
  align-items: flex-start;
  font-weight: normal;
  .footer-logo {
    width: 300px;
    height: auto;
    img {
      max-height: 75px;
      max-width: 100%;
      filter: invert(1) grayscale(1);
    }
  }
  .social-icons {
    display: flex;
    gap: 40px;
    color: white;
    font-size: 25px;
    flex-wrap: wrap;
    justify-content: space-between;
    a {
      color: white;
      cursor: pointer;
    }
  }
  .footer-links {
    display: flex;
    flex-direction: column;
    max-width: 20%;
    font-weight: normal;
  }
  .footer-address {
    max-width: 20%;
    color: white;
    font-weight: normal;
  }

  .footer-links p,
  .footer-address p {
    margin: 5px 0;
    color: #fff;
  }
  @media (max-width: 768px) {
    flex-direction: column;
    .footer-links {
      justify-content: center;
      align-items: center;
      gap: 10px;
      margin-bottom: 50px;
    }
    .footer-address,
    .footer-links {
      max-width: 100%;
      margin: 20px auto;
    }
    .social-icons {
      margin: auto;
    }
    .footer-logo {
      max-width: 100%;
      height: auto;
      justify-content: center;
      display: flex;
      flex-direction: column;
      text-align: center;
      width: 100%;
      padding: 10px;
      img {
        max-width: 100%;
        width: auto;
        filter: invert(1) grayscale(1);
        margin: auto;
        margin-bottom: 30px;
        max-height: 75px;
      }

      p {
        padding: 10px;
        margin: auto;
      }
    }
  }
`;

const SubscriptionForm = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 350px;
  &.theme2 {
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
  }
  @media (max-width: 768px) {
    flex-direction: column;
    width: auto;
    &.theme2 {
      align-items: center;
      justify-content: center;
    }
  }
`;

const EmailInput = styled.input`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 5px 0 0 5px;
  font-size: 16px;
  outline: none;
  background-color: #505050;
  color: white;
  &.theme2 {
    border-radius: 5px;
  }
  @media (max-width: 768px) {
    border-radius: 5px;
  }
`;

const Separator = styled.div`
  width: 100%;
  margin: 20px 0;
  border-bottom: 1px solid #474646;
`;

const PoweredBy = styled.div`
  flex: 1;
  color: #fff;
  &.theme2 {
    margin-top: 20px;
  }
  a {
    color: inherit;
    text-decoration: none;
  }
  a:hover {
    text-decoration: none;
  }
  @media (max-width: 768px) {
    padding: 20px;
    text-align: center;
  }
`;

const SubscribeButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 0 5px 5px 0;
  background-color: #fff;
  color: #000000;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  outline: none;
  @media (max-width: 768px) {
    border-radius: 5px;
    margin-top: 10px;
  }
  &:hover {
    background-color: #979798;
  }
`;
const ContactRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  color: white;
  width: 100%;
`;
const ContactItem = styled.div`
  display: flex;
  flex-direction: column; /* Ensure column direction for alignment */
  align-items: center; /* Center items vertically */
  justify-content: center; /* Center items horizontally */
  text-align: center; /* Ensure text-align center for all text elements */

  h4 {
    margin-bottom: 5px;
    font-size: 28px;
    font-weight: 300;
    max-width: 50%;
  }

  p {
    font-size: 12px;
    font-weight: 300;

    span {
      font-weight: 400;
      font-size: 14px;
    }

    &.new {
      margin-top: 40px;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column; /* Ensure column direction for alignment */
    align-items: center; /* Center items vertically */
    justify-content: center; /* Center items horizontally */
    text-align: center; /* Ensure text-align center for all text elements */

    h4 {
      text-align: center; /* Center individual text elements */
      max-width: 50%;
    }
    p {
      text-align: center;
      max-width: 80%;
    }
  }
`;

const Footer = ({ id, event, theme, additionalMenus = [] }) => {
  const socialPlatforms = [
    { platform: "facebook", icon: "facebook" },
    { platform: "whatsapp", icon: "whatsapp" },
    { platform: "insta", icon: "instagram" },
    { platform: "xSocial", icon: "x" },
    { platform: "dailymotion", icon: "dailymotion" },
    { platform: "linkedin", icon: "linkedin" },
    { platform: "youtube", icon: "youtube" },
    { platform: "sharechat", icon: "sharechat" },
    { platform: "threads", icon: "threads" },
  ];

  const navigate = useNavigate();
  const addmenuhandleClick = (index, item) => {
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

  switch (theme) {
    default:
    case "theme1":
      return (
        <FooterContent id={id}>
          <Container className="column footer">
            <FooterInside>
              <div className="footer-logo">
                <img src={import.meta.env.VITE_CDN + event?.footerLogo} alt="Logo" />
                {event.description && (
                  <p style={{ color: "white", fontSize: "small" }} className="timer-texts">
                    {event.description}
                  </p>
                )}
                {event.contactNumber && (
                  <p style={{ color: "white", fontSize: "small" }} className="timer-texts">
                    {event.contactNumber}
                  </p>
                )}
                {event.alternateContactNumber && (
                  <p style={{ color: "white", fontSize: "small" }} className="timer-texts">
                    {event.alternateContactNumber}
                  </p>
                )}
                {event.emailId && (
                  <p style={{ color: "white", fontSize: "small" }} className="timer-texts">
                    {event.emailId}
                  </p>
                )}
                {event.website && (
                  <p style={{ color: "white", fontSize: "small" }} className="timer-texts">
                    {event.website}
                  </p>
                )}
              </div>
              <div className="footer-links">
                {additionalMenus
                  .filter((menu) => menu.placement === "both" || menu.placement === "footer")
                  .map((menuItem, index) => (
                    <p key={index + 20} onClick={() => addmenuhandleClick(index + 20, menuItem)}>
                      {menuItem.title}
                    </p>
                  ))}
              </div>
              {event.OfficeAddress?.length > 3 && <div dangerouslySetInnerHTML={{ __html: event.OfficeAddress }} className="footer-address"></div>}
              {event.corporateOfficeAddress?.length > 3 && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: event.corporateOfficeAddress,
                  }}
                  className="footer-address"
                ></div>
              )}

              {/* <SubscriptionForm>
              <EmailInput
                type="email"
                className="email-input"
                placeholder="Type your email here"
              />
              <SubscribeButton type="submit" className="subscribe-button">
                Subscribe
              </SubscribeButton>
            </SubscriptionForm> */}
            </FooterInside>
            <Separator />
            <FooterInside>
              <PoweredBy>
                ©{moment().format("y")} {event.franchise?.name}. All rights reserved | Developed by <a href="https://datahex.co">DataHex</a>
              </PoweredBy>
              <div className="social-icons">
                {socialPlatforms.map(
                  ({ platform, icon }) =>
                    event[platform] &&
                    event[platform].length > 1 && (
                      <a key={platform} href={event[platform]}>
                        <GetIcon icon={icon}></GetIcon>
                      </a>
                    )
                )}
              </div>
            </FooterInside>
          </Container>
        </FooterContent>
      );
    // case "theme4":
    //   return (
    //     <FooterContent id={id}>
    //       <Container className="column footer">
    //         <ContactRow>
    // <ContactItem>
    //   <h4>For More Information</h4>
    // </ContactItem>
    //   <ContactItem style={{marginTop:"40px"}}>
    //     {" "}
    //     <p className="new">
    //       <span>Shri. Abdullakutty AP</span>
    //       <br />
    //       Event Convener
    //       <br />
    //       Ph: +91 96056 23333
    //     </p>
    //   </ContactItem>

    //   <ContactItem style={{marginTop:"40px"}}>
    //     {""}
    //     <p className="new">
    //       <span>Dr. Aji Abdulla</span>
    //       <br />
    //       Conference Organising Secretary
    //       <br />
    //       Ph: +91 94473 82438
    //     </p>
    //   </ContactItem>
    //   <ContactItem style={{marginTop:"40px"}}>
    //     {""}
    //     <p className="new">
    //       <span> Mr. Manoj Joseph</span>
    //       <br />
    //       International Business Forum Secretary
    //       <br />
    //       Ph: +971 50301 44999
    //     </p>
    //   </ContactItem>
    // </ContactRow>
    //         <Separator />
    //           <ContactRow>
    //             <div style={{display:'flex',flexDirection:'row',justifyContent:'center',alignItems:'center',}}>
    //               <ContactColumn style={{transform: 'rotate(-90deg)',height:'30px',color:'#FFF0B3',fontWeight:300}}>Global</ContactColumn>
    //             <ContactColumn> <ContactItem >
    //               <p>
    //                 <span>Mr. Gopala Pillai</span>
    //                 <br/>
    //                 Chairperson
    //               </p>
    //             </ContactItem>
    //             <ContactItem>
    //               <p>
    //                 <span>Mr. John Mathai</span>
    //                 <br/>
    //                 President
    //               </p>
    //             </ContactItem>
    //             <ContactItem>
    //               <p>
    //                 <span>Mr. Pinto Kannampally</span>
    //                 <br/>
    //                 Secretary
    //               </p>
    //             </ContactItem></ContactColumn>
    //             </div>

    //             <div style={{display:'flex',flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
    //             <ContactColumn style={{transform: 'rotate(-90deg)',height:'30px',color:'#FFF0B3',fontWeight:300}}>India Region</ContactColumn>
    //             <ContactColumn> <ContactItem>
    //               <p>
    //                 <span>Dr.K G Vijayalekshmy</span>
    //                 <br/>
    //                 Chairperson
    //               </p>
    //             </ContactItem>
    //             <ContactItem>
    //               <p>
    //              <span>Mr. Krishna Kumar KP</span>
    //                 <br/>
    //                 President
    //               </p>
    //             </ContactItem>
    //             <ContactItem>
    //               <p>
    //                 <span>Dr. Ajil Abdulla</span>
    //                 <br/>
    //                 Secretary
    //               </p>
    //             </ContactItem>
    //             </ContactColumn>
    //             </div>
    //             <div style={{display:'flex',flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
    //               <ContactColumn style={{transform: 'rotate(-90deg)',height:'30px',color:'#FFF0B3',fontWeight:300}}><p>International<br/>Business Forum</p></ContactColumn>
    //             <ContactColumn> <ContactItem>
    //               <p>
    //                 <span>Mr. Krishna Kumar KP</span>
    //                 <br/>
    //                 President
    //               </p>
    //             </ContactItem>
    //             <ContactItem>
    //               <p>
    //               <span>Dr. Ajil Abdulla</span>
    //                 <br/>
    //                 Secretary
    //               </p>
    //             </ContactItem></ContactColumn>
    //             </div>
    //           </ContactRow>
    //           {/* <SubscriptionForm>
    //         <EmailInput
    //           type="email"
    //           className="email-input"
    //           placeholder="Type your email here"
    //         />
    //         <SubscribeButton type="submit" className="subscribe-button">
    //           Subscribe
    //         </SubscribeButton>
    //       </SubscriptionForm> */}
    //         <Separator />
    //         <FooterInside>
    //           <PoweredBy>
    //             ©{moment().format("y")} {event.franchise?.name}. All rights
    //             reserved | Developed by <a href="https://datahex.co">DataHex</a>
    //           </PoweredBy>
    //           <div className="social-icons">
    //             {socialPlatforms.map(
    //               ({ platform, icon }) =>
    //                 event[platform] &&
    //                 event[platform].length > 1 && (
    //                   <a key={platform} href={event[platform]}>
    //                     <GetIcon icon={icon}></GetIcon>
    //                   </a>
    //                 )
    //             )}
    //           </div>

    //         </FooterInside>
    //       </Container>
    //     </FooterContent>
    //   );
    case "theme4":
      return (
        <FooterContent id={id} className="new">
          <Container className="column footer">
            <ContactRow>
              <ContactItem className="mobile-view">
                <h4>For More Information</h4>
              </ContactItem>
              <ContactItem style={{ marginTop: "40px" }}>
                {" "}
                <p className="new">
                  <span>Shri. Abdullakutty AP</span>
                  <br />
                  Event Convener
                  <br />
                  Ph: +91 96056 23333
                </p>
              </ContactItem>

              <ContactItem style={{ marginTop: "40px" }}>
                {""}
                <p className="new">
                  <span>Dr. Aji Abdulla</span>
                  <br />
                  Conference Organising Secretary
                  <br />
                  Ph: +91 94473 82438
                </p>
              </ContactItem>
              <ContactItem style={{ marginTop: "40px" }}>
                {""}
                <p className="new">
                  <span> Mr. Manoj Joseph</span>
                  <br />
                  International Business Forum Secretary
                  <br />
                  Ph: +971 50301 44999
                </p>
              </ContactItem>
            </ContactRow>
            <Separator />
            <ContactRow>
              <ContactItem>
                <img alt="forth" src={forth} width={250} height={150}></img>
              </ContactItem>
              <ContactItem>
                <img alt="fifth" src={fifth} width={250} height={150}></img>
              </ContactItem>
              <ContactItem>
                <img alt="sixth" src={sixth} width={250} height={150}></img>
              </ContactItem>
            </ContactRow>
            <Separator />
            <FooterInside>
              <PoweredBy>
                ©{moment().format("y")} {event.franchise?.name}. All rights reserved | Developed by <a href="https://datahex.co">DataHex</a>
              </PoweredBy>
              <div className="social-icons">
                {socialPlatforms.map(
                  ({ platform, icon }) =>
                    event[platform] &&
                    event[platform].length > 1 && (
                      <a key={platform} href={event[platform]}>
                        <GetIcon icon={icon}></GetIcon>
                      </a>
                    )
                )}
              </div>
            </FooterInside>
          </Container>
        </FooterContent>
      );
    case "theme2":
      return (
        <FooterContent id={id}>
          <Container className="column footer">
            <FooterInside>
              <div className="footer-logo">
                <img src={import.meta.env.VITE_CDN + event.franchise.logo} alt="Logo" />
                <PoweredBy className={theme}>
                  ©{moment().format("y")} {event.franchise?.name}. All rights reserved | Developed by Datahex
                </PoweredBy>
              </div>
              <div className="footer-links">
                <h3 style={{ color: "#fff" }}>Company</h3>
                <p>About Us</p>
                <p> Contact us</p>
                <p>Pricing</p>
                <p>Testimonials</p>
              </div>
              <div className="footer-links">
                <h3 style={{ color: "#fff" }}>Support</h3>
                <p>Help Center</p>
                <p>Legal</p>
                <p>Privacy and Policy</p>
                <p>Terms &amp; Conditions</p>
              </div>
              <SubscriptionForm className={theme}>
                <p style={{ color: "#fff" }}>Stay upto date</p>
                <EmailInput type="email" className="email-input theme2" placeholder="Your email address" />
              </SubscriptionForm>
            </FooterInside>
            <FooterInside>
              <div className="social-icons">
                {socialPlatforms.map(
                  ({ platform, icon }) =>
                    event[platform] &&
                    event[platform].length > 1 && (
                      <a key={platform} href={event[platform]}>
                        <GetIcon icon={icon}></GetIcon>
                      </a>
                    )
                )}
              </div>
            </FooterInside>
          </Container>
        </FooterContent>
      );
    case "theme3":
      return (
        <FooterContent id={id} className={theme}>
          <h1 style={{ color: "#fff" }}>Subscribe to get latest news</h1>
          <SubscriptionForm>
            <EmailInput type="email" className="email-input" placeholder="Type your email here" />
            <SubscribeButton type="submit" className="subscribe-button">
              Subscribe
            </SubscribeButton>
          </SubscriptionForm>
          <Container className="column footer">
            <FooterInside>
              <div className="footer-logo">
                <img src={import.meta.env.VITE_CDN + event.franchise.logo} alt="Logo" />
                <p style={{ color: "white", fontSize: "small" }} className="timer-texts">
                  {event.description}
                </p>
              </div>
              <div className="footer-links">
                <p>About Us</p>
                <p>Events</p>
                <p>Album</p>
                <p>Update</p>
              </div>
              <div className="footer-links">
                <p>Contact Us</p>
                <p>Speakers</p>
                <p>Privacy and Policy</p>
                <p>Terms &amp; Conditions</p>
              </div>
            </FooterInside>
            <Separator />
            <FooterInside>
              <PoweredBy>
                ©{moment().format("y")} {}. All rights reserved |Developed by <a href="https://datahex.co">DataHex</a>
              </PoweredBy>
              <div className="social-icons">
                {socialPlatforms.map(
                  ({ platform, icon }) =>
                    event[platform] &&
                    event[platform].length > 1 && (
                      <a key={platform} href={event[platform]}>
                        <GetIcon icon={icon}></GetIcon>
                      </a>
                    )
                )}
              </div>
            </FooterInside>
          </Container>
        </FooterContent>
      );
  }
};

export default Footer;
