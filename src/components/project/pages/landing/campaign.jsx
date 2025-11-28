import React from "react";
import Login from "../../../public/login";
import Loader from "../../../core/loader";
import { NoData } from "../../../core/list/styles";
import withLayout from "../../../public/langinglayout";
import Posters from "./event/posters/posters";
const Campaign = ({ colors, isWhitelisted, data, config, additionalMenus, theme, id, setLoaderBox, setMessage }) => {
  return id !== "" ? (
    config && data && <Posters colors={colors} config={config} setLoaderBox={setLoaderBox} data={data.event} theme={theme}></Posters>
  ) : (
    <React.Fragment>
      {isWhitelisted === null ? (
        <Loader />
      ) : isWhitelisted ? (
        data.route === "admin" ? (
          <Login setMessage={setMessage} setLoaderBox={setLoaderBox}></Login>
        ) : (
          <Posters colors={colors} setLoaderBox={setLoaderBox} config={config} data={data.event} theme={theme}></Posters>
        )
      ) : (
        <NoData style={{ margin: "auto", display: "flex", height: "100vh", flexDirection: "column", gap: "10px" }} className="noshadow white-list">
          The link is not found!
        </NoData>
      )}
    </React.Fragment>
  );
};

export default withLayout(Campaign)("whitelisted-domains/campaign");
