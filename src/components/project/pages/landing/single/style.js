import styled from "styled-components";
export const Container = styled.div`
  width: 100%;
`;

export const Header = styled.div`
  width: 100%;
  display: flex;
  font-family: "Inter";
  /* box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1); */
  justify-content: center;
  align-items: center;
  & > div:nth-child(1) {
    max-width: 1300px;
    flex-wrap: wrap;
    display: flex;
    width: 100%;
    & > div:nth-child(1) {
      padding: 10px;
      width: 50%;
      position: relative;
      img {
        width: auto;
        height: 81px;
        @media (max-width: 425px) {
          width: 150px;
        }
      }
    }
    & > div:nth-child(2) {
      display: flex;
      justify-content: end;
      align-items: center;
      width: 50%;
      padding: 10px;
      button {
        background-color: #0a9fcd;
        border: none;
        padding: 10px;
        border-radius: 10px;
        width: 120px;
        color: white;
        font-size: 1rem;
      }
    }
  }
`;
// ...............Banner......................

export const Banner = styled.div`
  width: 100%;
  display: flex;
  font-family: "Inter";
  justify-content: center;
  align-items: center;
  & > div:nth-child(1) {
    width: 100%;
    max-width: 1300px;
    display: flex;
    & > div:nth-child(1) {
      padding: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      img {
        width: 100%;
        border-radius: 50px;
        @media (max-width: 769px) {
          border-radius: 10px;
        }
      }
    }
  }
`;
// ..................Section.........................

export const Section = styled.div`
  margin-top: 20px;
  width: 100%;
  display: flex;
  padding: 10px;
  justify-content: center;
  .section-container {
    max-width: 1300px;
    display: flex;
    /* gap: 10px; */
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;
    & > div:nth-child(1) {
      width: 65%;
      .AIMER-Nexus-HR-Conclave {
        gap: 60px;
        display: flex;

        flex-direction: column;

        & > div:nth-child(1) {
          padding: 5px;
        }
        & > div:nth-child(2) {
          width: 100%;
          padding: 5px;
          border-radius: 20px;

          display: flex;
          background-color: #f3f3f3;

          gap: 20px;
          & > div:nth-child(1) {
            background-color: white;
            border-radius: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 20%;
          }
          & > div:nth-child(2) {
            border-radius: 15px;
            line-height: 5px;
            width: 80%;
          }
        }
        & > div:nth-child(3) {
          width: 100%;
          padding: 5px;
          background-color: #f3f3f3;
          border-radius: 20px;
          display: flex;
          gap: 20px;
          & > div:nth-child(1) {
            background-color: white;
            display: flex;
            justify-content: center;
            border-radius: 20px;
            align-items: center;
            width: 20%;
          }
          & > div:nth-child(2) {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 5px;
            border-radius: 15px;
            width: 80%;
            button {
              color: white;
              background-color: #0a9fcd;
              padding: 8px 15px;
              border: none;
              border-radius: 5px;
            }
          }
        }
      }
      @media (max-width: 767px) {
        width: 100%;
      }

      /* ......About Event...... */
      .About-Event {
        width: 100%;
        display: flex;
        flex-direction: column;
        & > div:nth-child(3) {
          ol {
            line-height: 30px;
          }
        }
      }
      /* ............KeyFeature..........  */
      .Key-Feature {
        width: 100%;
        img {
          width: 100%;
        }
      }

      /* ..............Location..............  */
      .Location {
        width: 100%;
        & > div:nth-child(2) {
          border-radius: 20px;
          /* background-color: red; */
          width: 100%;
          box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
          iframe {
            width: 100%;
            height: 400px;
          }
        }
      }
    }
  }
  /* .........sticky........... */
  .sticky {
    width: 35%;
    /* background-color: yellow; */
    padding-left: 20px;
    & > div:nth-child(1) {
      position: sticky;
      top: 10px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding-bottom: 40px;
      border-radius: 25px;
      box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
      .stcky-1 {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        /* background-color: red; */
        & > div:nth-child(1) {
          display: flex;
          justify-content: center;
          align-items: center;
          border-bottom: 1px solid;
        }
      }
      .stcky-2 {
        width: 100%;
        display: flex;

        justify-content: center;
        align-items: center;
        /* background-color: red; */
        & > div:nth-child(1) {
          display: flex;
          flex-direction: column;
          font-size: 0.8rem;
          font-weight: 600;
          justify-content: center;
          align-items: center;
          border-bottom: 1px solid;
        }
      }
      .stcky-3 {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        /* background-color: red; */

        button {
          padding: 8px 15px;
          border-radius: 2px;
          color: white;
          font-size: 1rem;
          background-color: #0a9fcd;

          border: none;
        }
      }
    }
    @media (max-width: 767px) {
      width: 100%;
      padding-left: 0px;
    }
  }
`;

export const Footer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: black;

  .footer {
    width: 100%;
    max-width: 1300px;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    & > div:nth-child(1) {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      align-items: center;

      & > div:nth-child(1) {
        width: 60%;
        padding-left: 10px;
        font-size: 0.8rem;
        display: flex;
        justify-content: center;
        align-items: center;
        /* background-color: yellow; */
        @media (max-width: 768px) {
          width: 100%;
        }
      }
      & > div:nth-child(2) {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 40%;
        /* background-color: red; */
        gap: 30px;
        @media (max-width: 768px) {
          width: 100%;
        }
      }
    }
  }
`;
export const Fixed = styled.div`
  /* margin-top: 95px; */
  width: 100%;
  background-color: red;
  display: flex;
  justify-content: center;
  align-items: center;
  & > div:nth-child(1) {
    max-width: 1300px;
    width: 100%;
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 20px;
    position: relative;
    display: none;
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);

    .rupees {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      button {
        font-size: 1rem;
        background-color: #0a9fcd;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 12px;
      }
    }
    @media (max-width: 768px) {
      display: block;
      position: fixed;
      bottom: 0px;
    }
  }
  @media (max-width: 768px) {
    margin-bottom: 100px;
  }
  @media (max-width: 424px) {
    margin-bottom: 95px;
  }
  @media (max-width: 375px) {
    margin-bottom: 95px;
  }
`;
