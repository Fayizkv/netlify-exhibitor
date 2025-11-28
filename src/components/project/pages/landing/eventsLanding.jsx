import React from "react";
import Event from "./event";
import Loader from "../../../core/loader";
import { NoData } from "../../../core/list/styles";
import { logo } from "../../../../images";
import withLayout from "../../../public/langinglayout";
import Events from "./event/events";
const EventsLanding = ({ isWhitelisted, data, config, additionalMenus, theme, id, setLoaderBox }) => {
  return id ? (
    config && data && <Event theme={theme} setLoaderBox={setLoaderBox} config={config} data={data}></Event>
  ) : (
    <React.Fragment>
      {isWhitelisted === null ? (
        <Loader />
      ) : isWhitelisted ? (
        data.route === "admin" ? (
          <NoData style={{ margin: "auto", display: "flex", height: "100vh", flexDirection: "column", gap: "10px" }} className="noshadow white-list">
            Page not found!
          </NoData>
        ) : (
          <Events setLoaderBox={setLoaderBox} additionalMenus={additionalMenus} theme={theme} config={config} data={data}></Events>
        )
      ) : (
        <NoData style={{ margin: "auto", display: "flex", height: "100vh", flexDirection: "column", gap: "10px" }} className="noshadow white-list">
          <img src={logo} alt="EventHex.co"></img>The domain {window.location.hostname} is not connfigured!
        </NoData>
      )}
    </React.Fragment>
  );
};

export default withLayout(EventsLanding)("whitelisted-domains/events");
