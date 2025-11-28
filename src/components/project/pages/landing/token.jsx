import React from "react";
import TokenDisplay from "./event/register/ticket/tokenDisplay";
import withLayout from "../../../public/layout";

const Token = ({ theme, setLoaderBox, setMessage }) => {
  const event = {
    _id: "66473bfe73bd3a8b0dd66843",
    title: "MediaOne A+ Mudra Awards",
    logo: "eventhex/uploads/event/logo-1718863695683.png",
    banner: "eventhex/uploads/event/banner-1718978534554.jpeg",
    mobBanner: "eventhex/uploads/event/mobBanner-1718978534566.jpeg",
    regBanner: "eventhex/uploads/event/regBanner-1718978534574.jpeg",
    themeColor: "rgb(136 13 138)",
    themeTextColor: "white",
    secondaryColor: "#783696",
    secondaryTextColor: "white",
  };

  const hostname = window.location.hostname;
  const validHostnames = ["mudra.mediaoneonline.com", "admin.local", "mudra.eventhex.co"];

  return validHostnames.includes(hostname) && <TokenDisplay event={event} theme={theme} setMessage={setMessage} setLoaderBox={setLoaderBox} />;
};

export default withLayout(Token);
