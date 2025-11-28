import React from "react";
import Login from "../../../public/login";
import Loader from "../../../core/loader";
import { NoData } from "../../../core/list/styles";
import withLayout from "../../../public/langinglayout";
import { IDCardDisplay } from "./event/register/ticket/idcard";
import LuckyDraw from "./event/lucky";
const LuckyDrawWindow = ({ isWhitelisted, data, config, additionalMenus, theme, id, setLoaderBox, setMessage }) => {
  return id !== "" ? (
    config && data && <IDCardDisplay bookedData={data} theme={theme}></IDCardDisplay>
  ) : (
    <React.Fragment>
      {isWhitelisted === null ? (
        <Loader />
      ) : isWhitelisted ? (
        data.route === "admin" ? (
          <Login setMessage={setMessage} setLoaderBox={setLoaderBox}></Login>
        ) : (
          <LuckyDraw eventData={data} theme={theme}></LuckyDraw>
        )
      ) : (
        <NoData style={{ margin: "auto", display: "flex", height: "100vh", flexDirection: "column", gap: "10px" }} className="noshadow white-list">
          The link is not found!
        </NoData>
      )}
    </React.Fragment>
  );
};

export default withLayout(LuckyDrawWindow)("whitelisted-domains/check-domain");
