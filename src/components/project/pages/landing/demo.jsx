import React, { useEffect, useState } from "react";
import { getData } from "../../../../backend/api";
import Login from "../../../public/login";
import Event from "./event";
import Loader from "../../../core/loader";
import { useDispatch, useSelector } from "react-redux";
import { NoData } from "../../../core/list/styles";
import { logo } from "../../../../images";
import { useParams } from "react-router-dom";
import Layout from "../../../core/layout";
const Demo = () => {
  const { id } = useParams();
  const [isWhitelisted, setIsWhitelisted] = useState(null);
  const [isLoading, setisLoading] = useState(false);
  const [data, setData] = useState(null);
  const [config, setConfig] = useState(null);
  const themeColors = useSelector((state) => state.themeColors);
  const [theme, setTheme] = useState(themeColors);
  const dispatch = useDispatch();
  useEffect(() => {
    const getCurrentDomain = async () => {
      if (isLoading || isWhitelisted !== null) {
        return;
      }
      setisLoading(true);
      try {
        let hostname = window.location.hostname;
        if (hostname === "localhost" && window.location.port !== "") {
          // Append port number if not default for localhost
          hostname += `:${window.location.port}`;
        }

        // Check if isWhitelisted is already set

        const response = await getData(id ? { event: id } : { domain: hostname }, "whitelisted-domains/check-domain");

        // Allow loading from all origins - always set isWhitelisted to true
        setIsWhitelisted(true);

        if (response.data.response) {
          setData(response.data.response);
          if (response.data.response.route === "event") {
            const tempTheme = {
              ...themeColors,
              theme: response.data.response.event?.themeColor,
              themeBackground: response.data.response.event?.themeColor,
              themeForeground: response.data.response.event?.themeTextColor,
              secondaryColor: response.data.response.event?.secondaryColor,
              secondaryTextColor: response.data.response.event?.secondaryTextColor,
            };
            document.title = `${response.data.response?.event?.title}`;
            console.log("Event title:", response.data.response?.event?.title);
            // dispatch(changeThemeColor(tempTheme));
            setTheme(tempTheme);
            setConfig(response.data.configs ?? []);
          }
        }
      } catch (error) {
        console.error("Error validating domain:", error);
        // Allow loading from all origins even on error - set to true
        setIsWhitelisted(true);
      }
    };
    if (isLoading || isWhitelisted !== null) {
      return;
    } else {
      getCurrentDomain();
    }
  }, [dispatch, isLoading, themeColors, isWhitelisted, id]);

  return id ? (
    config && data && <Event theme={theme} config={config} data={data}></Event>
  ) : (
    <React.Fragment>
      {isWhitelisted === null ? (
        <Loader />
      ) : isWhitelisted ? (
        data.route === "admin" ? (
          <Login></Login>
        ) : (
          <Event theme={theme} config={config} data={data}></Event>
        )
      ) : (
        <NoData style={{ margin: "auto", display: "flex", height: "100vh", flexDirection: "column", gap: "10px" }} className="noshadow white-list">
          <img src={logo} alt="EventHex.co"></img>The domain {window.location.hostname} is not connfigured!
        </NoData>
      )}
    </React.Fragment>
  );
};

export default Layout(Demo);
