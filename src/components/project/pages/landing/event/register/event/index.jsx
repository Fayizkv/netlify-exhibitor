import React from "react";
import { useState } from "react";
import { GetIcon } from "../../../../../../../icons";
import DirectRegister from "../direct";

export const EventRegister = ({ colors, setLoaderBox, setMessage, item, event, userToken }) => {
  const [registering, setRegistering] = useState(false);

  return (
    <React.Fragment>
      <button
        className="action"
        onClick={async (e) => {
          e.preventDefault();

          setRegistering(true);
        }}
      >
        Register <GetIcon icon={"open"} />
      </button>
      {/* {registering && registeringData && (
        <PopupView
          // Popup data is a JSX element which is binding to the Popup Data Area like HOC
          popupData={<Registration setMessage={setMessage} setLoaderBox={setLoaderBox} event={event} ticket={item} config={registeringData} single={true} />}
          themeColors={event}
          closeModal={(e) => {
            setRegistering(false);
            setRegisteringData(null);
          }}
          itemTitle={{ name: "title", type: "text", collection: "" }}
          openData={{ data: { _id: "", title: item.title } }} // Pass selected item data to the popup for setting the time and taking menu id and other required data from the list item
          customClass={"small iframe"}
        ></PopupView>
      )} */}
      {registering && (
        <DirectRegister
          setLoaderBox={setLoaderBox}
          ticket={item}
          registserHandler={(e) => {
            setRegistering(false);
            document.body.style.overflow = "";
            // setUser(JSON.parse(localStorage.getItem("--token")) ?? null);
          }}
          colors={colors}
          event={event}
        />
      )}
    </React.Fragment>
  );
};
