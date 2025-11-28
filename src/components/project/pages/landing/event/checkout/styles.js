import styled from "styled-components";
import { appTheme } from "../../../../brand/project";

export const Section = styled.section`
  width: 100%;
  padding: 0;
  background: ${(props) => props.background};
  background-size: cover;
  background-position: center;
`;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

export const Header = styled.header`
  text-align: left;
  margin-bottom: 20px;
  padding: 20px 0;
  display: flex;
  gap: 30px;
  @media screen and (max-width: 768px) {
    margin-bottom: 0px;
    flex-direction: column;
    align-items: center;
    img {
      height: 67px;
      width: auto;
    }
    > div {
      > div:first-child {
        font-size: 20px;
        font-weight: 500;
        line-height: 28px;
        text-align: center;
      }
      > div:last-child {
        font-size: 12px;
        font-weight: 400;
        line-height: 16px;
        text-align: left;
      }
    }
  }
`;
export const Round = styled.div`
  /* Icon */

  /* Auto layout */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2px;
  font-family: Inter;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  text-align: center;

  width: 20px;
  height: 20px;
  background: transparent;
  border: 1px solid ${appTheme.stroke.soft};
  color: ${appTheme.text.sub};
  &.active {
    background: #375dfb;
    color: ${appTheme.text.white};
  }
  &.done {
    background: ${appTheme.state.success};
    color: ${appTheme.text.white};
  }
  svg {
    color: white;
  }
  border-radius: 50%;
`;
export const HeaderText = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
`;

export const Logo = styled.img`
  width: 200px;
  max-height: 90%;
`;

export const Navigation = styled.div`
  display: flex;
  gap: 15px;
  padding: 0;
  margin-bottom: 20px;
  align-items: center;
  span {
    color: ${appTheme.text.sub};
    &.active {
      color: ${appTheme.text.main};
    }
  }
  svg {
    font-size: 10px;
  }
  @media screen and (max-width: 768px) {
    gap: 7px;
    font-size: 11.2px;
    font-weight: 500;
    line-height: 13.56px;
    letter-spacing: -0.006em;
    text-align: left;
    -webkit-box-pack: justify;
    justify-content: space-between;
    max-width: 360px;
    position: sticky;
    top: 0;
    background: white;
    padding: 10px 0;
    margin-bottom: 0;
  }
`;

export const Title = styled.div`
  color: ${appTheme.text.white};
  font-size: 32px;
  font-weight: 500;
  line-height: 40px;
  text-align: left;
`;

export const Heading = styled.div`
  color: ${appTheme.text.main};
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
  text-align: left;
  height: 25px;
  top: 0;
  background-color: white;
  @media screen and (max-width: 768px) {
    display: none;
  }
`;

export const Subtitle = styled.div`
  color: ${appTheme.text.white};
  display: flex;
  gap: 10px;
`;

export const Item = styled.div`
  display: flex;
  gap: 5px;
  color: ${appTheme.text.white};
`;

export const Content = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const TicketSection = styled.section`
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding-bottom: 50px;
  @media screen and (max-width: 768px) {
    padding-bottom: 98px;
  }
`;

export const TicketCard = styled.div`
  background-color: #ffffff;
  margin-top: 10px;
  border-radius: 0px;
  width: 100%;
  text-align: center;
  display: flex;
  padding: 0px;
  align-items: flex-start;
  height: auto; /* Allow auto-height to adjust based on content */
  border-bottom: 1px solid ${appTheme.stroke.soft};
  padding-bottom: 10px;
`;

export const TicketContent = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  gap: 10px;
  @media screen and (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

export const LeftBox = styled.div`
  flex: 1;
  display: flex;
  justify-content: left;
  align-items: left;
  flex-direction: column;
  gap: 5px;
  @media screen and (max-width: 768px) {
    width: 200px;
    order: 1;
    /* flex: 1 1 200px; */
  }
`;

export const Thumbnail = styled.img`
  max-width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
  max-height: 150px;
`;
export const Remaining = styled.div`
  font-family: Inter;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  text-align: left;
  color: ${appTheme.state.away};
  display: flex;
  gap: 5px;
  align-items: center;
`;
export const CenterBox = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  padding: 0 10px;
  text-align: left;
  @media screen and (max-width: 768px) {
    width: calc(100% - 200px);
    flex: 1 1 calc(100% - 200px);
    order: 0;
  }
`;

export const TicketTitle = styled.div`
  color: #333;
  font-size: 18px;
  font-weight: 700;
  line-height: 24px;
  letter-spacing: -0.015em;
  text-align: left;
  padding: 5px 0 10px;
`;

export const TicketDescription = styled.div`
  color: #666;
  font-size: 14px;
  display: -webkit-box; /* Use flexbox */
  -webkit-box-orient: vertical; /* Set orientation to vertical */
  overflow: hidden; /* Hide overflow */
  -webkit-line-clamp: 2; /* Limit to 3 lines */
  line-height: 1.5; /* Adjust line height for clarity */
  max-height: 4.5em; /* Adjust max height based on line height */
  //styleName: Paragraph/Small;
  font-family: Inter;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: -0.006em;
  text-align: left;
`;

export const SessionLink = styled.button`
  font-weight: 500;
  font-size: 14px;
  margin-top: 5px;
  text-align: left;
  display: flex;
  background-color: transparent;
  border: 0;
  cursor: pointer;
  padding: 5px 0px;
  color: ${appTheme.state.information};
`;

export const Tags = styled.div`
  display: flex;
  gap: 10px;
`;
export const SalesEndDate = styled.div`
  color: #555;
  font-size: 12px;
`;

export const Eligibility = styled.div`
  color: ${appTheme.text.sub};
  font-size: 12px;
  &.green {
    color: green;
  }
`;

export const RightBox = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: end;
  padding-left: 20px;
  order: 3;
`;

export const TicketPrice = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #2ecc71;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const Price = styled.div`
  font-family: Inter;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  text-align: right;
  color: ${appTheme.text.main};
  span {
    //styleName: Label/Large;
    font-family: Inter;
    font-size: 18px;
    font-weight: 700;
    line-height: 24px;
    letter-spacing: -0.015em;
    text-align: right;
  }
`;
export const DiscountedPrice = styled.div`
  font-size: 11px;
  font-weight: 500;
  line-height: 12px;
  letter-spacing: 0.02em;
  text-align: right;
  span:first-child {
    color: ${appTheme.text.sub};
    text-decoration: line-through;
  }
  span:last-child {
    color: ${appTheme.state.success};
    text-decoration: none;
  }
`;
export const DiscountedTag = styled.div`
  /* Auto layout */
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 2px 8px;
  background: #38c793;
  border-radius: 12px;
  color: ${appTheme.text.white};
  font-size: 11px;
  font-weight: 500;
  line-height: 12px;
  letter-spacing: 0.02em;
  text-align: center;
`;
export const Availability = styled.span`
  color: ${({ status }) => (status === "Sold Out" ? "#e74c3c" : "#555")};
  border: 1px solid #b47818;
  color: #b47818;
  border-radius: 12px;
  width: auto;
  padding: 2px 10px;
  font-family: Inter;
  font-size: 11px;
  font-weight: 500;
  line-height: 12px;
  letter-spacing: 0.02em;
  text-align: center;
  margin-left: 10px;
`;

export const QuantityControl = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
  border-radius: 10px;
  border: 1px solid;
  padding: 5px;
  border: 1px solid ${appTheme.stroke.soft};
  width: 100px;
  height: 35px;
  text-align: center;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &.red {
    border: 1px solid ${appTheme.state.error};
    color: ${appTheme.state.error};
  }
`;

export const QuantityButton = styled.button`
  border: none;
  border-radius: 4px;
  padding: 2px 5px;
  cursor: pointer;
  color: ${appTheme.text.sub};
  background-color: transparent;
  font-size: 20px;
`;

export const QuantityInput = styled.input`
  width: 30px;
  text-align: center;
  margin: 0 5px;
  color: ${appTheme.text.sub};
  border: 0;
  border: none;
  font-weight: 500;
  :focus {
    border: 0;
    outline: none;
  }
`;

export const OrderSummary = styled.div`
  flex: 1;
  margin-left: 20px;
  padding: 0;
  background: #ffffff;
  border-radius: 8px;
  display: flex;
  gap: 10px;
  flex-direction: column;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border: 1px solid ${appTheme.stroke.soft};
  padding: 10px;
  border-radius: 12px;
  margin-top: -100px;
  padding: 24px 16px 4px 16px;
  max-height: calc(100vh - 50px);
  overflow: auto;
  height: fit-content;
  position: sticky;
  top: 18px;
  bottom: 0px;
  &.hide {
    display: none;
  }
  @media screen and (max-width: 768px) {
    position: fixed;
    bottom: 0;
    top: auto;
    left: 0;
    right: 0;
    margin: 0;
    border-radius: 0px;
    &.hm {
      display: none;
    }
  }
`;

export const TicketListings = styled.div`
  /* display: grid; */
  gap: 10px;
  max-height: calc(100% - 50px);
  overflow: auto;
  @media screen and (max-width: 768px) {
    display: none;
  }
`;

export const TicketItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background-color: transparent;
  border-radius: 8px;
  border: 0;
  &.head {
    background-color: ${appTheme.bg.weak};
  }
`;

export const ColumnOne = styled.div`
  display: flex;
  flex-direction: column;
  //styleName: Label/Small;
  font-family: Inter;
  font-size: 14px;
  font-weight: 500;
  line-height: 16.94px;
  letter-spacing: -0.006em;
  text-align: left;

  span:first-child {
    font-size: 14px;
    font-weight: 500;
    line-height: 16.94px;
    letter-spacing: -0.006em;
    text-align: left;
    color: ${appTheme.text.main};
  }
  span:last-child {
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    text-align: left;
    color: ${appTheme.text.sub};
  }
`;

export const ColumnTwo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  color: #555;
  font-size: 14px;
  font-weight: 500;
  line-height: 16.94px;
  letter-spacing: -0.006em;
  text-align: right;
`;

export const PriceSummary = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  color: #333;
  padding: 10px;
  &.green span {
    color: green;
  }
`;
export const Note = styled.div`
  font-size: 10px;
  padding: 10px;
`;
export const Success = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
  align-items: center;
  padding: 30px;
  svg {
    font-size: 25px;
    color: green;
  }
  h2 {
    font-size: 20px;
    margin: 10px 0 0;
  }
  h3 {
    font-size: 15px;
    margin: 10px 0 20px;
    font-weight: normal;
  }
`;

export const Footer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  div:last-child {
    margin-top: 5px;
    margin-bottom: 5px;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    justify-content: center;
    gap: 5px;
    font-size: 12px;
    img {
      height: 20px;
    }
  }
`;
export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${appTheme.stroke.soft};
  width: 100%;
`;
export const FormHead = styled.div`
  cursor: pointer;
  padding: 16px;
  justify-content: space-between;
  display: flex;
  width: 100%;
  align-items: center;
  div {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .info span {
    font-size: 10px;
  }
  .info svg {
    color: ${appTheme.state.success};
  }
`;
export const Form = styled.div`
  padding: 16px;
  width: 100%;
  border-top: 1px solid ${appTheme.stroke.soft};
  &.hidden {
    display: none;
  }
`;
export const Forms = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: baseline;
  width: 100%;
  padding-bottom: 20px;
`;
