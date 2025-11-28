import React, { createContext, useContext, useState } from "react";

const WatermarkContext = createContext(undefined);

export const WatermarkProvider = ({ children }) => {
  const [opacity, setOpacity] = useState(70);
  const [scale, setScale] = useState(20);
  const [watermarkPosition, setWatermarkPosition] = useState({ x: 85, y: 85 });
  const [watermarkType, setWatermarkType] = useState("image");
  const [watermarkImage, setWatermarkImage] = useState("https://pub-cdn.sider.ai/u/U05XH95LXVE/web-coder/684fcbea0484c40371d6c8f6/resource/fc94e8b3-1d4d-460c-9774-c44920a24309.jpg");
  const [watermarkText, setWatermarkText] = useState("© Copyright 2025");
  const [textFont, setTextFont] = useState("Arial");
  const [textColor, setTextColor] = useState("#000000");
  const [textBackgroundColor, setTextBackgroundColor] = useState("#ffffff");
  const [textSize, setTextSize] = useState(16);
  const [textWeight, setTextWeight] = useState("normal");
  const [textStyle, setTextStyle] = useState("normal");

  const contextValue = {
    opacity,
    setOpacity,
    scale,
    setScale,
    watermarkPosition,
    setWatermarkPosition,
    watermarkType,
    setWatermarkType,
    watermarkImage,
    setWatermarkImage,
    watermarkText,
    setWatermarkText,
    textFont,
    setTextFont,
    textColor,
    setTextColor,
    textBackgroundColor,
    setTextBackgroundColor,
    textSize,
    setTextSize,
    textWeight,
    setTextWeight,
    textStyle,
    setTextStyle,
  };

  return <WatermarkContext.Provider value={contextValue}>{children}</WatermarkContext.Provider>;
};

export const useWatermark = () => {
  const context = useContext(WatermarkContext);
  if (context === undefined) {
    throw new Error("useWatermark must be used within a WatermarkProvider");
  }
  return context;
};
