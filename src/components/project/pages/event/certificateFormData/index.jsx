import React, { useState } from "react";
import Layout from "../../../../core/layout";
import { GetIcon } from "../../../../../icons";
import { Content, DragBox, SideBar } from "./certificateData.styled";

import { ElementContainer, TabButtons } from "../../../../core/elements";
import Elements from "./elements";

const LandingPage = (props) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleBackClick = () => {
    setActiveTab(0);
    console.log("back clicked");
  };

  const tabs = [
    {
      key: 0,
      title: "Elements",
      icon: "user",
    },
    {
      key: 1,
      title: "Content",
      icon: "user",
    },
  ];

  // const protocol = window.location.protocol;
  // const hostname = window.location.hostname;
  // const port = window.location.port;
  return (
    <div
      style={{
        flexWrap: "wrap",
        display: "flex",
        height: "calc(100vh - 100px)",
      }}
    >
      <SideBar>
        <ElementContainer>
          <TabButtons
            selectedTab={activeTab}
            selectedChange={(value) => {
              //how to use loader it will be only available when of thread or long running function is running!
              setActiveTab(value);
            }}
            tabs={tabs}
          ></TabButtons>
        </ElementContainer>
        <ElementContainer className="column" style={{ display: 0 === activeTab ? "block" : "none" }}>
          <Elements onBackClick={handleBackClick} props event={props?.openData?.data?._id} />
        </ElementContainer>
        <ElementContainer style={{ display: 1 === activeTab ? "block" : "none" }} className="noshadow top">
          {/* <ListTable
                preFilter={{ event: `${props?.openData?.data?._id}` }}
                // actions={actions}
                api={form.api}
                itemTitle={{
                  name: form.itemTitle,
                  type: "text",
                  collection: "",
                }}
                shortName={form.shortName}
                formMode={`double`}
                attributes={form.attributes}
                {...props}
              /> */}
          <></>
        </ElementContainer>
      </SideBar>
      <Content className="">
        {/* {data && config ? (
          <iframe
            referrerPolicy="no-referrer"
            sandbox="allow-same-origin allow-scripts allow-storage-access-by-user-activation"
            title="Demo Event"
            src={`${protocol}//${hostname}${
              port ? `:${port}` : ""
            }/landing-page/${props?.openData?.data?._id}`}
          ></iframe>
        ) : (
          // <Event config={config} data={data} theme={selectedTheme?.key} desktopScrolling={desktopScrolling}></Event>
          <Loader />
        )} */}

        <DragBox>
          <GetIcon icon="circlePlus" />
          Drag Elements Here
        </DragBox>
      </Content>
    </div>
  );
};
export default Layout(LandingPage);
