import React from "react";
import Loader from "../../../core/loader";
import { NoData } from "../../../core/list/styles";
import withLayout from "../../../public/langinglayout";
import EventDetails from "./event/eventdetails";
const EventDetailLanding = ({ isWhitelisted, data, config, additionalMenus, theme, slug, setLoaderBox }) => {
  return slug ? (
    config && data && <EventDetails setLoaderBox={setLoaderBox} additionalMenus={additionalMenus} theme={theme} config={config} data={data}></EventDetails>
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
          <Loader />
        )
      ) : (
        <NoData style={{ margin: "auto", display: "flex", height: "100vh", flexDirection: "column", gap: "10px" }} className="noshadow white-list">
          Page Not Found!
        </NoData>
      )}
    </React.Fragment>
  );
};

export default withLayout(EventDetailLanding)("whitelisted-domains/event-details");
