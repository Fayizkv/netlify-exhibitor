import React, { useEffect, useState } from "react";
import Layout from "../../../../core/layout";
import { GetIcon } from "../../../../../icons";
import { Content, DragBox, SideBar } from "./ticketForm.styled";
import Elements from "./elements";

import { ElementContainer, TabButtons } from "../../../../core/elements";
import { getData } from "../../../../../backend/api";
import AutoForm from "../../../../core/autoform/AutoForm";
import ActiveElements from "./activeElements";

const LandingPage = (props) => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState([]);
  const [refreshLanding, setRefreshLanding] = useState(false);
  const [refreshActiveElements, setRefreshActiveElements] = useState(false);
  // const [selectedElements, setSelectedElements] = useState({});
  // const [isElementSelected, setIsElementSelected] = useState(false);

  const handleBackClick = () => {
    setActiveTab(0);
  };

  useEffect(() => {
    setFormData([]);
    getData({ ticket: props?.openData?.data?._id }, "ticket-form-data").then((response) => {
      const tempFormData = response?.data?.response;
      setFormData(tempFormData.sort((a, b) => a.orderId - b.orderId));
      setRefreshLanding(false);
    });
  }, [props, refreshLanding, refreshActiveElements]);

  const triggerLandingRefresh = (value) => {
    setRefreshLanding(value);
  };

  const handleElementClick = (element) => {
    // setIsElementSelected(true);
    // setSelectedElements(element);
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
              setActiveTab(value);
            }}
            tabs={tabs}
          ></TabButtons>
        </ElementContainer>
        <ElementContainer className="column" style={{ display: 0 === activeTab ? "block" : "none" }}>
          <div style={{ fontWeight: "bold" }}>Active</div>
          <ActiveElements
            onBackClick={handleBackClick}
            props
            ticket={props?.openData?.data?._id}
            onRefreshLandingChange={triggerLandingRefresh}
            refresh={refreshActiveElements}
            onElementClick={handleElementClick}
          />
          <div style={{ fontWeight: "bold" }}>Elements List</div>
          <Elements
            onBackClick={handleBackClick}
            props
            ticket={props?.openData?.data?._id}
            onRefreshLandingChange={triggerLandingRefresh}
            onSubmitSuccess={() => setRefreshActiveElements(!refreshActiveElements)}
          />
        </ElementContainer>
      </SideBar>
      <Content>
        {formData.length === 0 ? (
          <DragBox>
            <GetIcon icon="circlePlus" />
            Select Elements
          </DragBox>
        ) : (
          <ElementContainer className="dashitem">
            <AutoForm
              useCaptcha={false}
              key={"elements"}
              formType={"post"}
              header={"Yes"}
              description={""}
              customClass={"embed"}
              css="plain embed head-hide"
              formInput={formData}
              // submitHandler={submitChange}
              // button={"Save"}
              // isOpenHandler={isCreatingHandler}
              isOpen={true}
              plainForm={true}
              formMode={"single"}
            ></AutoForm>
          </ElementContainer>
        )}
      </Content>
    </div>
  );
};
export default Layout(LandingPage);
