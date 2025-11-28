import React from "react";
import Login from "../../../public/login";
import Event from "./event";
import Loader from "../../../core/loader";
import { NoData } from "../../../core/list/styles";
import { logo } from "../../../../images";
import withLayout from "../../../public/langinglayout";
import Checkout from "./event/checkout/ticketSelection";
import { SinglePageLanding } from "./single";
const Landing = ({ isWhitelisted, colors, data, config, additionalMenus, theme, id, setLoaderBox, setMessage }) => {
  return id !== "" ? (
    config && data && <Event setLoaderBox={setLoaderBox} additionalMenus={additionalMenus} theme={theme} config={config} data={data}></Event>
  ) : (
    <React.Fragment>
      {isWhitelisted === null ? (
        <Loader />
      ) : isWhitelisted ? (
        data.route === "admin" ? (
          <Login colors={colors} setMessage={setMessage} setLoaderBox={setLoaderBox}></Login>
        ) : data.route === "single" || data.route === "eventhex" ? (
          <SinglePageLanding colors={colors} tickets={config} data={data} setMessage={setMessage} setLoaderBox={setLoaderBox}></SinglePageLanding>
        ) : data.route === "checkout" ? (
          <Checkout colors={colors} tickets={config} data={data} setMessage={setMessage} setLoaderBox={setLoaderBox}></Checkout>
        ) : (
          <Event colors={colors} setLoaderBox={setLoaderBox} additionalMenus={additionalMenus} theme={theme} config={config} data={data}></Event>
        )
      ) : (
        <NoData style={{ margin: "auto", display: "flex", height: "100vh", flexDirection: "column", gap: "10px" }} className="noshadow white-list">
          <img src={logo} alt="EventHex.co"></img>The domain {window.location.hostname} is not connfigured!
        </NoData>
      )}
    </React.Fragment>
  );
};

export default withLayout(Landing)("whitelisted-domains/check-domain");
