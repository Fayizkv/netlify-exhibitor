import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Layout from "../../../core/layout";
import { MainContainer } from "../../../core/layout/styels";
import Message from "../../../core/message";
import { clearLogin } from "../../../../store/actions/login";
//src/components/styles/page/index.js
//if you want to write custom style wirte in above file
const Page404 = () => {
  const user = useSelector((state) => state.login);
  const { t } = useTranslation();
  // Use useNavigate hook from react-router-dom to navigate programmatically.
  const navigate = useNavigate();
  // Use useDispatch hook from react-redux to dispatch actions.
  const dispatch = useDispatch();
  //to update the page title
  useEffect(() => {
    document.title = `404 - EventHex Portal`;
  }, []);
  const [message, setMessage] = useState({
    type: 1,
    content: t("sessionExpired"),
    okay: t("startOver"),
    onClose: () => {
      navigate("/");
      dispatch(clearLogin());
    },
  });
  /**
   * Function to close the message.
   */
  const closeMessage = () => {
    setMessage({ ...message, onClose: null });
    // setShowMessage(false);
  };
  // const [showMessage, setShowMessage] = useState(false);
  // console.log(user.data.token);
  // Use the useTranslation hook from react-i18next to handle translations
  // const parkingDuration = totalDuration > 120 ? (days > 0 ? days + `d, ` : ``) + (hours > 0 ? hours + `h, ` : ``) + (minutes + t("m")) : totalDuration.toFixed(0) + ` ` + t("minutes");
  const content = user.data.token ? <MainContainer className="center"></MainContainer> : <Message meessage={message} closeMessage={closeMessage} setLoaderBox={() => {}} showMessage={true} />;

  return <Layout>{content}</Layout>;
};
// exporting the page with parent container layout..
export default Page404;
