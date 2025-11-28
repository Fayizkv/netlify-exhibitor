import React, { useRef, useState } from "react";
import styled from "styled-components";
import { GetIcon } from "../../../../../icons";
import moment from "moment";
import { useSelector } from "react-redux";
import { sampleticket } from "../../../brand";
import Loader from "../../../../core/loader";
import DirectRegister from "../event/register/direct";
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  .action {
    background-color: ${(props) => props.event?.primaryColour};
    color: white;
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
  @media (min-width: 768px) and (max-width: 1200px) {
    padding: 0 3rem;
  }
  @media (max-width: 768px) {
    padding: 0 1rem;
    width: 100%;
    overflow-x: hidden;
  }
`;
const Floating = styled.div`
  display: flex;
  justify-content: space-between;
  .action {
    background-color: ${(props) => props.event.primaryColour};
    color: white;
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
  .offer {
    font-size: 12px;
  }
`;
const Content = styled.div`
  display: flex;
  padding: 2rem 0rem;
  gap: 30px;
  p {
    margin: 20px 0;
  }
  @media (max-width: 1024px) {
    flex-direction: column;
    padding: 1rem;
  }
`;
const Events = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem 0rem;
  gap: 20px;

  > h2 {
    color: #1f2937;
    margin-bottom: 1rem;
    font-size: 1.8rem;

    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }
  @media (max-width: 1024px) {
    flex-direction: column;
    padding: 1rem;
  }
`;
const Information = styled.div`
  flex: 1;
  min-width: 60%;
  @media (max-width: 1024px) {
    width: 100%;
  }
`;

const OneTicket = styled.div`
  min-width: 350px;
  max-width: 400px;
  /* position: sticky; */
  top: 10px;
  /* min-height: 200px; */

  @media (max-width: 1024px) {
    position: static;
    min-width: unset;
    width: 100%;
    max-width: 100%;
  }
`;

// Header Components
const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  background: white;
  margin-bottom: 20px;
  .data {
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
  }
  @media (max-width: 768px) {
    padding: 1rem;
    gap: 1rem;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  img {
    width: auto;
    height: auto;
    max-height: 35px;
    max-width: 221px;
    object-fit: contain;

    @media (max-width: 768px) {
      max-height: 50px;
    }
  }

  .logo-text {
    h1 {
      font-size: 1.2rem;
      color: #1f2937;
      margin: 0;

      @media (max-width: 768px) {
        font-size: 1rem;
      }
    }
    p {
      font-size: 0.9rem;
      color: #6b7280;
      margin: 0;
    }
  }
`;

const HeroSection = styled.div`
  display: flex;
  background: linear-gradient(to right, rgb(229, 247, 255), rgb(240, 251, 255));
  margin: 2rem 0rem;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  min-height: fit-content;
  max-height: 200px;
  padding: 0 !important;
  box-shadow: rgba(0, 0, 0, 0.22) 0px 2px 4px;
  @media (max-width: 768px) {
    margin: 1rem 0;
    border-radius: 8px;
  }

  img {
    object-fit: cover;
    max-width: 100%;
    width: 100%;
  }
`;

// Event Details Components
const EventDetails = styled.div`
  h2 {
    color: #1f2937;
    /* font-size: 22px; */
    margin-bottom: 1.5rem;

    @media (max-width: 768px) {
      font-size: 22px;
      margin: 1rem 0;
    }
  }
`;

const DateCards = styled.div`
  display: flex;
  gap: 2rem;
  margin: 2rem 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    margin: 1rem 0;
  }
`;
const IconDiv = styled.div`
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 10px;
`;
const DateCard = styled.div`
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: #ecf3f9;
  width: 100%;
  svg {
    width: 30px;
    height: 30px;
  }
  @media (max-width: 768px) {
    padding: 1rem;
  }

  .date-info {
    h4 {
      color: #6b7280;
      margin: 0 0 0.5rem 0;
      font-weight: 500;

      @media (max-width: 768px) {
        font-size: 0.9rem;
      }
    }
    p {
      margin: 0;
      &.date {
        font-weight: 600;
        color: #1f2937;
      }
      &.time {
        color: #6b7280;
        font-size: 0.9rem;
      }

      @media (max-width: 768px) {
        font-size: 0.85rem;
      }
    }
  }
`;

const LocationCard = styled.div`
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: #ecf3f9;
  margin-bottom: 2rem;
  svg {
    width: 30px;
    height: 30px;
  }
  @media (max-width: 768px) {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .location-info {
    h4 {
      margin: 0 0 0rem 0;
      color: #1f2937;

      @media (max-width: 768px) {
        font-size: 1rem;
      }
    }
    p {
      margin: 0;
      color: #6b7280;

      @media (max-width: 768px) {
        font-size: 0.9rem;
      }
    }
  }
`;

// About Section
const AboutSection = styled.div`
  margin-top: 4rem;

  /* Base text styling */
  p {
    color: #4b5563;
    line-height: 1.6;
    font-size: 18px;
    margin-bottom: 1rem;
  }

  /* Headings */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: #1f2937;
    margin: 1.5rem 0 1rem;
    line-height: 1.3;
    font-weight: 600;
  }

  h1 {
    font-size: 22px;
  } /* 24px */
  h2 {
    font-size: 20px;
  } /* 22px */
  h3 {
    font-size: 18px;
  } /* 20px */
  h4 {
    font-size: 16px;
  } /* 18px */
  h5 {
    font-size: 14px;
  } /* 16px */
  h6 {
    font-size: 12px;
  } /* 14px */

  /* Lists */
  ul,
  ol {
    padding-left: 1.5rem;
    margin-bottom: 1rem;
  }

  ul {
    list-style-type: disc;
  }
  ol {
    list-style-type: decimal;
  }

  li {
    margin-bottom: 0.5rem;
    line-height: 1.5;
  }

  /* Links */
  a {
    color: ${(props) => props.event?.primaryColour || "#2563eb"};
    text-decoration: underline;
    transition: color 0.2s;

    &:hover {
      color: ${(props) => props.event?.primaryDarker || "#1d4ed8"};
    }
  }

  /* Text formatting */
  strong,
  b {
    font-weight: 600;
  }

  em,
  i {
    font-style: italic;
  }

  /* Code blocks */
  pre,
  code {
    background-color: #f3f4f6;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-family: monospace;
    font-size: 0.9em;
  }

  pre {
    padding: 1rem;
    margin: 1rem 0;
    overflow-x: auto;
  }

  /* Blockquotes */
  blockquote {
    border-left: 4px solid ${(props) => props.event?.primaryColour || "#2563eb"};
    margin: 1rem 0;
    padding: 0.5rem 1rem;
    background-color: #f8fafc;
    font-style: italic;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
  }

  th,
  td {
    border: 1px solid #e5e7eb;
    padding: 0.5rem;
    text-align: left;
  }

  th {
    background-color: #f3f4f6;
    font-weight: 600;
  }

  /* Images */
  img {
    max-width: 100%;
    height: auto;
    border-radius: 0.25rem;
    margin: 1rem 0;
  }

  /* Horizontal rule */
  hr {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 1.5rem 0;
  }

  /* Subscript and superscript */
  sub,
  sup {
    font-size: 0.75em;
    line-height: 0;
    position: relative;
    vertical-align: baseline;
  }

  sup {
    top: -0.5em;
  }

  sub {
    bottom: -0.25em;
  }

  /* Marked text */
  mark {
    background-color: #fef3c7;
    padding: 0 0.25rem;
    border-radius: 0.125rem;
  }

  /* Small text */
  small {
    font-size: 0.875em;
  }

  /* Definition lists */
  dl {
    margin: 1rem 0;
  }

  dt {
    font-weight: 600;
    margin-top: 0.5rem;
  }

  dd {
    margin-left: 1.25rem;
    margin-bottom: 0.5rem;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    h1 {
      font-size: 18px;
    } /* 20.8px */
    h2 {
      font-size: 16px;
    } /* 17.6px */
    h3 {
      font-size: 14px;
    } /* 16px */
    h4 {
      font-size: 12px;
    } /* 14.4px */
    h5 {
      font-size: 10px;
    } /* 12.8px */
    h6 {
      font-size: 8px;
    } /* 11.2px */

    p {
      font-size: 16px;
    }
  }
`;

// Location Section
const LocationSection = styled.div`
  padding: 0rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }

  h2 {
    color: #1f2937;
    margin-bottom: 1rem;
    font-size: 1.8rem;

    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }

  .map-container {
    border-radius: 8px;
    overflow: hidden;
    height: 300px;
    background: #f1f1f1;

    @media (max-width: 768px) {
      height: 200px;
    }

    iframe {
      width: 100%;
      height: 100%;
      border: 0;
    }
  }
`;

// Footer Components
const Footer = styled.footer`
  background: #1f2937;
  /* background-color: ${(props) => props.event?.primaryDarker}; */
  color: white;
  padding: 2rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    padding: 14px 0 4.5rem;
    height: 200px;
  }

  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }
  }

  .copyright {
    font-size: 0.9rem;
    color: #d1d5db;

    @media (max-width: 768px) {
      font-size: 0.8rem;
    }
  }

  .social-links {
    display: flex;
    gap: 1rem;

    svg {
      color: #d1d5db;
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: white;
      }
    }
  }
`;

// Mobile Fixed Button
const MobileFixed = styled.div`
  display: none;

  @media (max-width: 1024px) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #ffffffa3;
    padding: 0px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(10px);
  }
`;
const Button = styled.button`
  background-color: ${(props) => props.event.primaryColour};
  color: white;
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
  justify-content: center;
`;

const CountItem = styled.div`
  position: relative;
  color: inherit; /* Use the default text color */
  text-decoration: none; /* Remove underline */
  /* width: calc(50% - 15px); */
  margin-right: 0px; /* Spacing between the divs */
  margin-bottom: 10px; /* Spacing between rows */
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 12.63157844543457px 25.26315689086914px 0px #0000001a;
  background-color: #ecf3f9;
  padding: 0;
  border-radius: 12px;
  margin: 10px 0;
  padding: 20px;
  &.single {
    width: 100%;
  }
  img {
    max-width: 100%;
    width: 100%;
    /* max-height: 200px;
    height: 200px; */
    object-fit: cover;
    border-radius: 12px;
  }
  .demo-img {
    object-fit: contain;
  }
  > h2 {
    margin-top: 20px;
    margin-bottom: 0px;
    font-size: 20px;
    font-weight: bold;
    color: ${(props) => props.event?.primaryBase};
  }

  > div > p {
    font-size: 14px;
    /* font-weight: thin; */
    margin-top: 10px;
    /* color: grey; */
  }
  @media (max-width: 768px) {
    flex: 0 0 100%;
    min-width: 100%;
    max-width: 100%;
    margin: 0px 0;
    padding: 10px;
    &.vertical {
      flex: 0 0 calc(100% - 30px);
      max-width: calc(100% - 30px);
      min-width: calc(100% - 30px);
    }
    img {
      max-width: 100%;
      object-fit: cover;
      border-radius: 12px;
    }
    &.hm {
      display: none;
    }
  }
`;

const Right = styled.div`
  flex: 1 1 100%;
  width: 100%;
  padding: 0px;
  justify-content: flex-start;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
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
    color: black;
    margin-top: 20px;
    font-size: 20px;
    font-weight: bold;
  }
  > div {
    display: flex;
    justify-content: space-between;
    width: 100%;
    gap: 15px;
    margin-top: auto;
    flex-direction: column;
    align-items: center;
  }
  .title {
    margin-bottom: 20px;

    .h2 {
      color: black;
      margin-top: 20px;
      font-size: 20px;
      font-weight: bold;
    }

    p {
      font-size: 14px;
      margin-top: 10px;
      color: #4b5563;
      line-height: 1.5;
      overflow: hidden;
      max-height: 100px;
      transition: max-height 0.3s ease-in-out;

      /* Text formatting */
      strong,
      b {
        font-weight: 600;
      }

      em,
      i {
        font-style: italic;
      }

      /* Links */
      a {
        color: ${(props) => props.event?.primaryColour || "#2563eb"};
        text-decoration: underline;
        transition: color 0.2s;

        &:hover {
          color: ${(props) => props.event?.primaryDarker || "#1d4ed8"};
        }
      }
    }
  }
  > p {
    margin-top: 0px;
    font-size: 16px;
    font-weight: light;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.5;
    margin-bottom: 0;
  }
  .action {
    background-color: ${(props) => props.event.primaryColour};
    justify-content: center;
    color: white;
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
  .price {
    > div {
      margin-bottom: 10px;
      font-weight: bold;
      font-size: 18px;
      .offer {
        font-size: 12px;
        font-weight: 400;
      }
      .strike {
        text-decoration: line-through;
        font-weight: 400;
        margin-right: 5px;
      }
    }
  }
  .remove {
    background-color: gray;
  }
  > h3 {
    border-width: 1px 0px 1px 0px;
    border-style: solid;
    padding: 10px 0;
    border-color: #333333;
    font-weight: light;
    font-size: 12px;
    width: 100%;
    font-weight: 500;
    margin: 10px;
  }
  @media (max-width: 768px) {
    h2 {
      font-size: 17px;
    }
    p {
      font-size: 12px;
      -webkit-line-clamp: 4;
    }
    > h3 {
      font-size: 12px;
    }
  }
`;
const FeaturesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr); // Creates 3 equal columns
  @media (min-width: 768px) and (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
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
    padding-left: 0px;
    padding-right: 0px;

    grid-template-columns: repeat(1, 1fr); // Creates 3 equal columns
    &.vertical {
      padding: 0;
    }
  }
`;
export const SinglePageLanding = ({ colors, setMessage, data, tickets }) => {
  // const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3927.271724288086!2d76.37364157451023!3d10.158554170287491!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b08061b468975ab%3A0xdeeba8a7f2436d7d!2sCIAL%20Convention%20Centre!5e0!3m2!1sen!2sin!4v1728543012977!5m2!1sen!2sin`;
  // Format dates using moment
  const { event } = data;
  const start = moment(event.startDate);
  const end = moment(event.endDate);
  const [loaderBox, setLoaderBox] = useState(false);
  const theme = useSelector((state) => state.theme);
  // Check if start and end dates are the same day
  const isSameDay = start.isSame(end, "day");
  // Inside the SinglePageLanding component, add the ref
  const ticketsSectionRef = useRef(null);
  const oneTicketsSectionRef = useRef(null);
  // Add scroll handler function
  const scrollToTickets = () => {
    if (tickets.length > 1) {
      ticketsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      oneTicketsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };
  const formatDateRange = (start, end) => {
    if (start.isSame(end, "day")) {
      return `${start.format("D MMMM YYYY")}`;
    }
    return `${start.format("D MMMM YYYY")} - ${end.format("D MMMM YYYY")}`;
  };
  const EventCard = (item, index, customClass = "") => {
    return (
      <CountItem key={index} id={`countItem-${index}`} className={`${theme} ${customClass} hm`} event={colors}>
        <Right event={colors}>
          <img className="demo-img" onError={(e) => (e.target.src = import.meta.env.VITE_CDN + event.banner)} src={sampleticket} alt={item.title} />

          {/* {item.tag?.length > 0 && <h4>{item.tag}</h4>} */}
          {/* <LinkButton>{event.title}</LinkButton> */}
          {/* <div className="price">{getFormattedPrice(item)}</div> */}
          <h3>
            {formatDateRange(start, end)}
            <br /> {event.venue}
          </h3>
          <div>
            <Button event={colors} onClick={scrollToTickets} className="action">
              Get Tickets
            </Button>
          </div>
        </Right>
      </CountItem>
    );
  };
  const ExpoCard = (item, index, customClass = "") => {
    const startDate = moment(item.saleStartDate);
    const endDate = moment(item.saleEndDate);

    const formatDateDisplay = () => {
      const now = moment();
      if (endDate.isBefore(now)) {
        return "Registration Closed";
      }
      // If registration hasn't started yet
      if (startDate.isAfter(now)) {
        if (startDate.isSame(now, "day")) {
          return `Registration starts today at ${startDate.format("h:mm A")}`;
        }
        return `Registration starts on ${startDate.format("Do MMMM YYYY")}`;
      }
      // If registration is ongoing
      if (endDate.isSame(now, "day")) {
        return `Registration ends today at ${endDate.format("h:mm A")}`;
      }
      return `Registration ends on ${endDate.format("Do MMMM YYYY")}`;
    };

    return (
      <CountItem key={index} id={`countItem-${index}`} className={`${theme} ${customClass}`} event={colors}>
        <Right event={colors}>
          <img onError={(e) => (e.target.src = sampleticket)} src={import.meta.env.VITE_CDN + item.thumbnail} alt={item.title} />
          <div className="title">
            <div className="h2">{item.title}</div>
            {item.description?.length > 0 && <div className="description" dangerouslySetInnerHTML={{ __html: item.description }} />}
          </div>
          <div className="price">{getFormattedPrice(item)}</div>
          <div>
            <h3>{formatDateDisplay()}</h3>
            <Button event={colors} onClick={() => handleTicketSelect(item)} className="action">
              Register <GetIcon icon={"open"} />
            </Button>
          </div>
        </Right>
      </CountItem>
    );
  };
  const buildGoogleMapsUrl = ({
    location,
    apiKey = "YOUR_API_KEY",
    zoom = "15",
    mapType = "roadmap", // roadmap, satellite, hybrid, terrain
  }) => {
    // Basic input validation
    if (!location || typeof location !== "string") {
      throw new Error("Location must be a non-empty string");
    }

    // Base URL for Google Maps Embed API
    const baseUrl = "https://www.google.com/maps/embed/v1/place";

    const formatLocation = (loc) => {
      return loc
        .trim()
        .replace(/\s+/g, "+") // Replace spaces with plus
        .replace(/[^\w\s,+]/g, "") // Remove special chars except commas and plus
        .replace(/,/g, "%2C"); // Encode commas
    };

    // Build the query parameters
    const params = new URLSearchParams({
      key: apiKey,
      q: formatLocation(location),
      zoom: zoom,
      maptype: mapType,
    });

    // Construct final URL
    return `${baseUrl}?${params.toString()}`;
  };
  const getFormattedPrice = (ticket) => {
    // Check if ticket is free
    if (!ticket.paymentAmount || ticket.paymentAmount === 0) {
      return "";
    }

    // Get currency symbol
    const currency = event.currency ?? "INR";

    // If regular discount is enabled
    if (ticket.enableDiscount) {
      return (
        <div>
          <span style={{ textDecoration: "line-through", fontSize: "14px", marginRight: "5px" }}>{ticket.paymentAmount}</span>
          {ticket.discountValue} {currency}
          <br />
          <span className="offer">{ticket.discountTag} discount applied!</span>
        </div>
      );
    } else {
      return (
        <div>
          {ticket.paymentAmount} {currency}
        </div>
      );
    }
  };
  const mapUrl = buildGoogleMapsUrl({
    location: event.venue,
    apiKey: import.meta.env.VITE_MAP,
    zoom: "15",
    mapType: "roadmap",
  });

  const VenueMaker = ({ venue }) => {
    const renderVenue = () => {
      const parts = venue.split(",");
      return {
        main: parts[0].trim(),
        // Return sub only if there are parts after comma
        sub: parts.length > 1 ? parts.slice(1).join(",").trim() : null,
      };
    };

    const { main, sub } = renderVenue();

    return (
      <div className="location-info">
        <h4>{main}</h4>
        {sub && <p>{sub}</p>}
      </div>
    );
  };

  // Add state for selected ticket
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);

  // Handler for ticket selection and registration
  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
    setShowRegistration(true);
  };

  // Replace EventRegister component with a button
  const RegisterButton = ({ ticket }) => (
    <button className="action" onClick={() => handleTicketSelect(ticket)}>
      Register <GetIcon icon={"open"} />
    </button>
  );

  return (
    <>
      <Header>
        <Container event={colors} className="action">
          <div className="data">
            <Logo>
              <img src={import.meta.env.VITE_CDN + event.logo} onError={(e) => (e.target.src = sampleticket)} alt="Logo" />
            </Logo>
            {tickets.length > 1 ? (
              <Button event={colors} onClick={scrollToTickets} className="action">
                Register
              </Button>
            ) : (
              <RegisterButton ticket={tickets[0]} />
            )}
          </div>
        </Container>
      </Header>
      <Container>
        {event.banner && (
          <HeroSection>
            <img src={import.meta.env.VITE_CDN + event.banner} alt="Dental illustration" />
          </HeroSection>
        )}
        <Content>
          <Information>
            <EventDetails>
              <h1 className="text-[26px] font-bold md:text-2xl text-gray-800 mb-6">{event.title}</h1>

              {isSameDay ? (
                <DateCards>
                  <DateCard event={colors}>
                    <IconDiv>
                      <GetIcon icon="date" />
                    </IconDiv>
                    <div className="date-info">
                      <p className="date">{start.format("dddd, Do MMMM YYYY")}</p>
                      <p className="time">{start.format("h:mm A - ") + end.format("h:mm A")}</p>
                    </div>
                  </DateCard>
                </DateCards>
              ) : (
                <DateCards>
                  <DateCard event={colors}>
                    <IconDiv>
                      <GetIcon icon="date" />
                    </IconDiv>
                    <div className="date-info">
                      <p className="date">{start.format("dddd, Do MMMM YYYY")}</p>
                      <p className="time">Starts at {start.format("h:mm A")}</p>
                    </div>
                  </DateCard>

                  <DateCard event={colors}>
                    <IconDiv>
                      <GetIcon icon="date" />
                    </IconDiv>
                    <div className="date-info">
                      <p className="date">{end.format("dddd, Do MMMM YYYY")}</p>
                      <p className="time">Ends on {end.format("h:mm A")}</p>
                    </div>
                  </DateCard>
                </DateCards>
              )}
              {
                event.eventType !== "virtual" ? (
                  <LocationCard event={colors}>
                    <IconDiv>
                      <GetIcon icon="location" size={24} color="#0284C7" />
                    </IconDiv>
                    <VenueMaker venue={event.venue} />
                  </LocationCard>
                ) : null
                // <LocationCard event={colors}>
                //   <IconDiv>
                //     <GetIcon icon="globe" size={24} color="#0284C7" />
                //   </IconDiv>
                //   <VenueMaker venue={"Virtual Event!"} />
                // </LocationCard>
              }
            </EventDetails>
            <AboutSection>
              <div dangerouslySetInnerHTML={{ __html: event.description }}></div>
            </AboutSection>
          </Information>
          <OneTicket>
            <div ref={oneTicketsSectionRef} style={{ position: "sticky", top: "20px" }}>
              {tickets.length > 1 ? EventCard(tickets[0], 0, "single") : tickets.length > 0 ? ExpoCard(tickets[0], 0, "single") : null}
            </div>
          </OneTicket>
        </Content>
        {tickets.length > 1 && (
          <Events ref={ticketsSectionRef}>
            <h2>Tickets</h2>
            <FeaturesContainer>{tickets.map((item, index) => ExpoCard(item, index))}</FeaturesContainer>
          </Events>
        )}
        {event.eventType !== "virtual" && (
          <LocationSection>
            <h2>Location</h2>
            <div className="map-container">
              <iframe title={event.title} src={mapUrl} style={{ border: "0" }} allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>{" "}
            </div>
          </LocationSection>
        )}
      </Container>

      <Footer event={colors}>
        <div className="footer-content">
          <div className="copyright">
            <p>
              ©{`${new Date().getFullYear()} ${event.title}`} All Rights Reserved | Developed by{" "}
              <a href="https://eventhex.ai/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200">
                Eventhex
              </a>
            </p>
          </div>
          <div className="social-links"></div>
        </div>
      </Footer>
      {tickets.length > 1 ? (
        <MobileFixed>
          <Container>
            <Floating className="action remove" event={colors}>
              <div className="flex col-auto">
                <p className="m-auto text-black">
                  <span>From </span>
                  {tickets
                    .map((ticket) => (ticket.enableDiscount ? ticket.discountValue : ticket.paymentAmount))
                    .filter((price) => price > 0)
                    .reduce((min, price) => Math.min(min, price), Infinity)}
                  {event.currency ?? "INR"}
                </p>
              </div>
              <Button event={colors} onClick={scrollToTickets} className="action">
                View Tickets
              </Button>
            </Floating>
          </Container>
        </MobileFixed>
      ) : (
        <MobileFixed>
          <Container>
            <Floating className="action remove" event={colors}>
              <div className="text-black font-bold text-2xl leading-[10px]">{getFormattedPrice(tickets[0])}</div>
              <RegisterButton ticket={tickets[0]} />
            </Floating>
          </Container>
        </MobileFixed>
      )}
      {showRegistration && selectedTicket && (
        <DirectRegister
          setLoaderBox={setLoaderBox}
          ticket={selectedTicket}
          registserHandler={() => {
            setShowRegistration(false);
            setSelectedTicket(null);
            document.body.style.overflow = "";
          }}
          colors={colors}
          event={event}
        />
      )}
      {loaderBox && <Loader />}
    </>
  );
};

export default SinglePageLanding;
