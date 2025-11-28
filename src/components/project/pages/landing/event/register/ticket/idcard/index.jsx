import React, { useState } from "react";
import QRCode from "react-qr-code";
import styled from "styled-components";
import { Button } from "../../../../../../../core/select/styles";
import * as htmlToImage from "html-to-image";
import { useRef } from "react";
import { IconButton } from "../../../../../../../core/elements";
const IDCardLayer = styled.div`
  display: flex;
  position: absolute;
  top: ${(props) => props.top || "auto"};
  bottom: ${(props) => props.bottom || "auto"};
  font-size: ${(props) => props.xfontSize || "inherit"};
  left: ${(props) => props.left || "auto"};
  right: ${(props) => props.right || "auto"};
  align-items: ${(props) => (props.align === "center" ? "center" : "auto")};
  text-align: ${(props) => (props.align === "center" ? "center" : "auto")};
  justify-content: ${(props) => (props.align === "center" ? "center" : "auto")};
  font-weight: ${(props) => props.xfontWeight || "normal"};
  color: ${(props) => props.color || ""};
  width: ${(props) => props.xWidth || "auto"};
  height: ${(props) => props.xHeight || "auto"};
  &.BackgroundImage {
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  &.BackgroundGradient {
  }
  &.Text {
    overflow: hidden;
    max-width: -webkit-fill-available;
    /* margin-right: 10px; */
    /* white-space: nowrap; */
  }
  &.Image {
  }
  &.Qr {
    svg {
      position: absolute;
      height: 100px;
      width: 100px;
      background: white;
      border: 0px solid white;
      border-radius: 0px;
    }
  }
`;
export const IDCard = styled.div`
  display: flex;
  position: relative;
`;
export const Title = styled.div`
  display: flex;
  overflow: auto;
  width: 400px;
  max-width: 95%;
  -webkit-box-pack: justify;
  justify-content: space-between;
  margin: auto;
  background: #dfdfdf;
  padding: 5px 10px;
  align-items: center;
  border-radius: 10px;
  font-weight: 600;
  min-height: 50px;
  div {
    display: flex;
    gap: 5px;
  }
  &.plain {
    background-color: transparent;
    border-bottom: 1px solid #dfdfdf;
    margin-bottom: 20px;
    margin-top: 10px;
    font-weight: bold;
    font-size: 20px;
    border-radius: 0;
  }
`;
export const CardBox = styled.div`
  display: flex;
  position: relative;
  width: 400px;
  max-width: 95%;
  -webkit-box-pack: justify;
  justify-content: space-between;
  margin: auto auto 30px;
  flex-direction: column;
  border: 1px solid #dfdfdf;
  border-radius: 10px;
  margin-top: 10px;
  padding-bottom: 20px;
`;
export const IDCardDisplay = ({ config, bookedData, theme }) => {
  const componentRefs = useRef([]); // Initialize as an array to hold multiple refs

  const downloadPDF = (index, name) => {
    if (componentRefs.current[index]) {
      htmlToImage
        .toPng(componentRefs.current[index], { foreignObjectRendering: false })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `IDCARD-${name}.png`;
          link.click();
        })
        .catch((error) => {
          console.error("Failed to generate image", error);
        });
    }
  };
  const [idcarddata] = useState([]);

  return (
    <React.Fragment>
      <div style={{ textAlign: "center", fontWeight: "bold", padding: "20px", display: "none", justifyContent: "center", marginBottom: 10, marginTop: 0 }}>The ID card for Main Event!</div>
      <div style={{ display: "none", overflow: "auto", justifyContent: "center", marginBottom: 0, marginTop: 20 }}>
        <IDCard
          ref={(el) => (componentRefs.current[0] = el)}
          style={{
            width: "350px",
            height: "390px",
            margin: "auto",
          }}
        >
          <React.Fragment>
            {idcarddata?.map((layer, index) => {
              switch (layer.layerType) {
                case "BackgroundImage":
                  return (
                    <IDCardLayer className="BackgroundImage" top={"0px"} left={"0px"} bottom={"0px"} right={"0px"}>
                      <img src={"card"} alt="BG"></img>
                    </IDCardLayer>
                  );
                case "Text":
                  return (
                    <IDCardLayer
                      xfontSize={layer.fontSize}
                      xfontWeight={layer.fontStyle}
                      key={index}
                      className="Text"
                      top={layer.top}
                      left={layer.left}
                      bottom={layer.bottom}
                      right={layer.right}
                      align={layer.textAlignment.toLowerCase()}
                      color={layer.color}
                      xHeight={layer.height}
                      xWidth={layer.width}
                    >
                      {bookedData[layer.source]}
                    </IDCardLayer>
                  );
                case "Qr":
                  return (
                    <IDCardLayer key={index} className="Qr" top={layer.top} left={layer.left} bottom={layer.bottom} right={layer.right} align={layer.textAlignment.toLowerCase()}>
                      <QRCode value={bookedData[layer.source]} />
                    </IDCardLayer>
                  );
                // Add more cases for other types of layers if needed
                default:
                  return null; // Or you can render a default component or handle the case as needed
              }
            })}
          </React.Fragment>
        </IDCard>
      </div>
      <div style={{ textAlign: "center", display: "none", justifyContent: "center", marginBottom: 10, marginTop: 10 }}>
        <Button
          onClick={() => downloadPDF(0, bookedData.firstName)}
          style={{
            padding: "10px 20px",
            backgroundColor: theme.themeColor,
            color: theme.themeTextColor,
            outline: "none",
            borderRadius: 5,
            margin: "20px 0px 0px 0px",
          }}
        >
          Download ID Card/Coupon
        </Button>
      </div>
      <Title className="plain">The ID Cards/Coupon for {bookedData.event}</Title>
      {bookedData.idCards.length > 0
        ? bookedData.idCards.map((idData, index) => {
            return (
              <React.Fragment key={index}>
                <Title>
                  <span>{idData.ticket}</span>{" "}
                  <div>
                    <IconButton ClickEvent={() => downloadPDF(index + 1, idData.fullName)} icon="download"></IconButton>
                    {/* <IconButton icon="down"></IconButton> */}
                  </div>
                </Title>
                <CardBox>
                  <div
                    style={{
                      display: "flex",
                      overflow: "auto",
                      justifyContent: "center",
                      marginBottom: 0,
                      marginTop: 20,
                    }}
                  >
                    <IDCard
                      ref={(el) => (componentRefs.current[index + 1] = el)}
                      style={{
                        width: `${idData.width}px`,
                        height: `${idData.height}px`,
                        margin: "auto",
                      }}
                    >
                      <React.Fragment>
                        {idData.certificateData?.map((layer, subIndex) => {
                          switch (layer.layerType) {
                            case "BackgroundImage":
                              return (
                                <IDCardLayer key={`bg-${subIndex}`} className="BackgroundImage" top="0px" left="0px" bottom="0px" right="0px">
                                  <img src={`${import.meta.env.VITE_CDN}${layer.source}`} alt="BG" />
                                </IDCardLayer>
                              );
                            case "Text":
                              return (
                                <IDCardLayer
                                  key={`text-${subIndex}`}
                                  xfontSize={layer.fontSize}
                                  xfontWeight={layer.fontStyle}
                                  className="Text"
                                  top={layer.top}
                                  left={layer.left}
                                  bottom={layer.bottom}
                                  color={layer.color ?? "white"}
                                  right={layer.right}
                                  align={layer.textAlignment.toLowerCase()}
                                  xHeight={layer.height}
                                  xWidth={layer.width}
                                >
                                  {idData[layer.source]}
                                </IDCardLayer>
                              );
                            case "Qr":
                              return (
                                <IDCardLayer
                                  key={`qr-${subIndex}`}
                                  className="Qr"
                                  top={layer.top}
                                  left={layer.left}
                                  bottom={layer.bottom}
                                  right={layer.right}
                                  align={layer.textAlignment.toLowerCase()}
                                >
                                  <QRCode value={idData._id} />
                                </IDCardLayer>
                              );
                            // Add more cases for other types of layers if needed
                            default:
                              return null; // Or you can render a default component or handle the case as needed
                          }
                        })}
                      </React.Fragment>
                    </IDCard>
                  </div>
                </CardBox>
              </React.Fragment>
            );
          })
        : null}

      <div style={{ textAlign: "center", fontWeight: "bold", padding: "20px", display: "flex", justifyContent: "center", marginBottom: 10, marginTop: 0 }}>
        {bookedData.idCards.length > 0 ? (
          "Note: Please show this ID Card/Coupon as per the request!"
        ) : (
          <span>
            No Registration found for {bookedData.event}{" "}
            <a target="_blank" rel="noopener noreferrer" href={`${window.location.origin}`}>
              Click here to Register
            </a>
          </span>
        )}
      </div>
    </React.Fragment>
  );
};
