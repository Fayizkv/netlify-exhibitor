import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100vh; /* Full height of the viewport */
  padding-left: 4rem;
  padding-top: 0; /* Remove space at the top */
  box-sizing: border-box; /* Ensure padding doesn't affect the width */
  margin: 0; /* Ensure no margin is applied */
  transform: scale(0.85); /* Scale down the content to 90% */
  transform-origin: center center; /* Center the scaling */

  // @media (max-width: 1440px) {
  //     padding: 1rem; /* Reduce padding on smaller screens */
  //     transform: scale(0.9); /* Scale down content */
  //   }
`;

export const FormSection = styled.div`
  width: 50%; /* Adjust based on the desired width */
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%; /* Ensure it takes full height of the container */
  //   paddingtop: 100rem; /* Adjust padding to fit content */
  box-sizing: border-box;
`;

export const BadgeOption = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* Allow it to grow and fill space */
  justify-content: center;
`;

export const BadgeList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

export const BadgeItem = styled.li`
  margin-bottom: 1rem;
  // input[type='radio'] {
  //       margin-right: 1rem;
  //     }
`;

export const BadgeRadio = styled.input.attrs({ type: "radio" })`
  -webkit-appearance: none;
  appearance: none;
  width: 20px; /* Adjust size as needed */
  height: 20px; /* Adjust size as needed */
  border-radius: 50%;
  border: 2px solid #ddd;
  background-color: #fff;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;

  &:checked::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #007bff;
    transform: translate(-50%, -50%);
  }

  &:focus {
    outline: none;
  }
`;

export const BadgeLabel = styled.label`
  display: flex;
  align-items: flex-start; /* Align items to the start */
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  font-weight: 500;
  margin-top: 1rem;
  box-sizing: border-box;
  position: relative; /* Position relative for absolute positioning of radio button and arrow */

  .icon-container {
    display: flex;
    align-items: center;
    margin-right: 1rem; /* Space between icon and text */
  }

  .text-container {
    display: flex;
    flex-direction: column;
    justify-content: center;

    span {
      display: block;
      font-size: 1rem; /* Adjust size as needed */
      color: #333; /* Adjust color as needed */
      margin: 0;
      padding: 0;
      text-indent: 0;
    }

    p {
      margin: 0;
      color: #666;
      font-size: 0.875rem;
      margin-top: 0.5rem; /* Adjust spacing as needed */
      margin-left: 0; /* Remove extra padding to align text */
      text-indent: 0;
    }
  }

  .right-radio {
    position: absolute;
    right: 1rem; /* Adjust distance from right as needed */
    top: 40%;
    transform: translateY(-50%); /* Center vertically */
  }

  .right-arrow {
    position: absolute;
    right: 1rem; /* Position at the right end of the label */
    top: 50%;
    transform: translateY(-50%); /* Center vertically */
    font-size: 1rem; /* Adjust size as needed */
    color: #666; /* Adjust color as needed */
  }
`;

export const ButtonSection = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 3rem;
`;

export const ChooseTemplateButton = styled.button`
  background-color: black;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background-color: black;
  }
`;

export const CancelButton = styled.button`
  background-color: transparent;
  color: #666;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    color: #333;
  }
`;

export const ImageSection = styled.div`
  width: 100vw; /* Adjust based on the desired width, or use 100vw for full viewport width */
  height: 100vh; /* Full height of the viewport */
  display: flex;
  justify-content: flex-end; /* Align image to the end (right side) */
  align-items: center;
  padding: 0; /* Remove padding */
  box-sizing: border-box; /* Include padding and border in the element's width and height */
  overflow: hidden; /* Hide any overflow */

  img {
    height: 100%; /* Cover full height */
    width: 79%; /* Maintain aspect ratio */
    object-fit: cover; /* Cover the container */
  }
`;
export const FullWidthDivider = styled.hr`
  border: 0;
  border-top: 1px solid #ddd;
  width: 100vw; /* Full width of the viewport */
  position: relative;
  // left: 50%;
  right: 90%;
  margin-left: calc(-50vw + 50%);
  margin-right: calc(-50vw + 50%);
  margin: 2rem 0; /* Adjust margin as needed */
  box-sizing: border-box; /* Ensure padding doesn't affect the width */
`;

// Circular icon container
export const CircularIconContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 60%; /* Makes it a circle */
  display: flex;
  border: 1px solid lightgrey; /* Correctly adds a light grey border */
  justify-content: center;
  align-items: center;
  // background-color: #f0f0f0; /* Optional: Background color */
  margin-right: 0.75rem; /* Space between icon and text */
  margin-top: 4px; /* Adds space above the container */
`;

export const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 10; /* Ensure dropdown is above other content */
  width: 250px; /* Adjust width as needed */
  max-height: 200px; /* Adjust max height as needed */
  overflow-y: auto; /* Scroll if content overflows */
`;

export const DropdownItem = styled.div`
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between; /* Space between text and checkbox */
  align-items: center; /* Align items vertically */
  background-color: white;
  border-bottom: 1px solid #ddd;

  &:hover {
    background-color: #f5f5f5;
  }
`;

export const Checkbox = styled.input`
  margin: 0; /* Remove any margins to ensure alignment */
`;
