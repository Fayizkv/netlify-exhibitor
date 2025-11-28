import styled from "styled-components";

export const Container = styled.div`
  padding: 10px 0px;
  background: ${(props) => props.theme.background};
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.3s;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  &.vertical {
    display: none;
  }
  &.column {
    flex-direction: column;
  }
  &.row {
    flex-direction: row;
  }
  &.reverse {
    flex-direction: row-reverse;
    gap: 50px;
  }
  &.overriding {
    padding: 0;
  }
  @media (max-width: 1250px) and (min-width: 768px) {
    max-width: calc(100% - 50px);
  }
  @media (max-width: 768px) {
    max-width: 100%;
    &.mobile-column {
      flex-direction: column;
    }
    &.footer {
      padding-bottom: 50px;
    }
  }
`;
export const Section = styled.div`
  width: 100%;
  background: ${(props) => props.background};
  background-repeat: no-repeat;
  background-position: top;
  background-size: cover;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
  .ul-event-box {
    max-width: 800px;
    padding: 23px 33px;
    background-color: #ffffffe3;
    border-radius: 10px;
    display: flex;
    gap: 30px;
  }
  .ul-event-box div {
    background-color: rgb(143, 24, 55);
    border-radius: 10px;
    margin-bottom: 10px;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    transform: rotate(180deg);
    padding: 10px;
    font-size: 13px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  ul.ul-event {
    margin: 0;
    padding: 0;
    color: black;
    text-align: left;
    font-size: 13px;
    list-style-type: none; /* Remove default bullets */
  }

  ul.ul-event li {
    margin-bottom: 10px;
    position: relative;
    padding-left: 25px; /* Make space for the icon */
  }

  ul.ul-event li::before {
    content: "»"; /* Use the » character as the icon */
    position: absolute;
    left: 0;
    color: #000; /* You can change the color of the icon */
    font-size: 15px; /* Adjust size as needed */
    line-height: 1;
  }
  .bg {
    position: absolute;
    border: none;
    left: 0;
    right: 0;
    top: -200px;
    height: 562px;
    width: 100%;
    object-fit: cover;
    object-position: top;
  }
  > iframe {
    position: absolute;
    border: none;
    left: 50%;
    right: 50%;
    top: 20%;
    height: 362px;
  }
  &.bg-image {
    height: 90vh;
    min-height: 680px;
    background-size: cover;
    background-position: center;
    overflow: hidden;
  }
  &.center {
    align-items: center;
    justify-content: center;
  }
  &.padding {
    padding: 50px 0;
  }
  &.padding-large {
    padding: 100px 0;
  }
  &.padding-sides {
    padding: 10px 60px;
  }
  &.padding-both {
    padding: 30px 60px;
  }
  &.padding-top {
    padding-top: 60px;
  }
  @media (max-width: 768px) {
    background-position: right;
    .ul-event-box {
      max-width: 90%;
      padding: 23px 33px;
      background-color: #ffffffe3;
      border-radius: 10px;
      flex-direction: column;
      font-size: 14px;
    }
    .ul-event-box div {
      -webkit-writing-mode: inherit;
      text-orientation: mixed;
      transform: inherit;
    }
    &.padding-large {
      padding: 20px 0;
    }
    &.padding-sides {
      padding: 10px 10px;
    }
    &.bg-image {
      height: 80vh;
      max-height: 80vh;
      background-size: cover;
    }
    > iframe {
      position: absolute;
      border: none;
      left: 33%;
      right: 0;
      top: 28%;
      height: 159px;
    }
  }
`;
