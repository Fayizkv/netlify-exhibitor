import React, { useEffect, useState } from "react";
import Layout from "../../../../core/layout";
import { GetIcon } from "../../../../../icons";
import { Content, DragBox, SideBar } from "./landing.styled";
import Elements from "./elements";
import { useDispatch, useSelector } from "react-redux";
import { getData } from "../../../../../backend/api";
import Loader from "../../../../core/loader";
import ListTable from "../../../../core/list/list";
import { ElementContainer, TabButtons } from "../../../../core/elements";
import ActiveElements from "./activeElements";
import SectionList from "./sectionList";

const LandingPage = (props) => {
  console.log("props", props);
  const eventId = props?.openData?.data?._id;
  const themeColors = useSelector((state) => state.themeColors);

  const [activeTab, setActiveTab] = useState(0);
  const [showContentTab, setShowContentTab] = useState(false);
  const [selectedElements, setSelectedElements] = useState({});
  const [isElementSelected, setIsElementSelected] = useState(false);
  const [data, setData] = useState(null);
  const [config, setConfig] = useState(null);
  const [isLoading, setisLoading] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState(null);

  const [form, setForm] = useState();
  const [refreshIframe, setRefreshIframe] = useState(false);
  const [refreshActiveElements, setRefreshActiveElements] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const getCurrentDomain = async () => {
      if (isLoading || isWhitelisted !== null) {
        return;
      }
      setisLoading(true);
      try {
        const response = await getData({ event: props?.openData?.data?._id }, "whitelisted-domains/check-domain");
        // Allow loading from all origins - always set isWhitelisted to true
        setIsWhitelisted(true);
        if (response.data.response) {
          setData(response.data.response);
          setConfig(response.data.configs ?? []);
        }
      } catch (error) {
        // Allow loading from all origins even on error - set to true
        setIsWhitelisted(true);
      }
    };
    if (isLoading || isWhitelisted !== null) {
      return;
    } else {
      getCurrentDomain();
    }
  }, [dispatch, isLoading, themeColors, isWhitelisted, props]);

  useEffect(() => {
    if (refreshIframe) {
      setRefreshIframe(false);
    }
  }, [refreshIframe]);

  const triggerIframeRefresh = (value) => {
    setSelectedElements({});
    setIsElementSelected(false);
    setRefreshIframe(value);
  };

  const handleElementClick = (element) => {
    setShowContentTab(element?.title === "About" || element?.title === "Countdown" || element?.title === "Video");
    setIsElementSelected(true);
    setSelectedElements(element);
    changeForm(element?.title);
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
      icon: "menu",
    },
  ];

  // const handleDrop = (event) => {
  //   event.preventDefault();
  //   const element = JSON.parse(event.dataTransfer.getData("element"));
  //   setSelectedElements([...selectedElements, element]);
  // };

  // const handleDragOver = (event) => {
  //   event.preventDefault();
  // };

  const handleBackClick = () => {
    setShowContentTab(false);
    setSelectedElements({});
    setIsElementSelected(false);
    setActiveTab(0);
    // console.log("back clicked");
  };

  const changeForm = (type) => {
    setForm(
      type === "Gallery"
        ? {
            api: `gallery`,
            attributes: gallery,
            shortName: "Gallery",
            itemTitle: "title",
          }
        : type === "Testimonial"
          ? {
              api: `testimonial`,
              attributes: testimonial,
              shortName: "Testimonial",
              itemTitle: "title",
            }
          : type === "Faq"
            ? {
                api: `faq`,
                attributes: faq,
                shortName: "Faq",
                itemTitle: "title",
              }
            : type === "News & Updates"
              ? {
                  api: `news`,
                  attributes: newsandupdates,
                  shortName: "News & Updates",
                  itemTitle: "title",
                }
              : type === "Sponsors"
                ? {
                    api: `sponsors`,
                    attributes: sponsors,
                    shortName: "Sponsor",
                    itemTitle: "title",
                  }
                : type === "Features"
                  ? {
                      api: `features`,
                      attributes: features,
                      shortName: "Features",
                      itemTitle: "title",
                    }
                  : type === "Key Features"
                    ? {
                        api: `features`,
                        attributes: keyfeatures,
                        shortName: "key features",
                        itemTitle: "title",
                      }
                    : type === "Speakers"
                      ? {
                          api: `speakers`,
                          attributes: speakers,
                          shortName: "Speakers",
                          itemTitle: "name",
                        }
                      : type === "Counts"
                        ? {
                            api: `count`,
                            attributes: counts,
                            shortName: "Count",
                            itemTitle: "title",
                          }
                        : {
                            api: `event`,
                            attributes: speakers,
                            shortName: "Event",
                            itemTitle: "name",
                          } // Add a default value or handle other cases if needed
    );
  };

  const gallery = [
    {
      type: "select",
      apiType: "API",
      selectApi: "event/select",
      // params: [{ name: "pageSection", value: selectedElement?._id }],
      placeholder: "Event",
      name: "event",
      validation: "",
      showItem: "title",
      default: `${props?.openData?.data?._id}`,
      tag: false,
      label: "Event",
      required: false,
      view: false,
      add: false,
      update: false,
      filter: false,
    },
    {
      type: "text",
      placeholder: "Title",
      name: "title",
      validation: "",
      default: "",
      label: "Title",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "image",
      placeholder: "Image",
      name: "image",
      validation: "",
      default: "false",
      tag: true,
      label: "Image",
      required: true,
      view: true,
      add: true,
      update: true,
    },
  ];

  const testimonial = [
    {
      type: "select",
      apiType: "API",
      selectApi: "event/select",
      // params: [{ name: "pageSection", value: selectedElement?._id }],
      placeholder: "Event",
      name: "event",
      validation: "",
      showItem: "title",
      default: `${props?.openData?.data?._id}`,
      tag: false,
      label: "Event",
      required: false,
      view: false,
      add: false,
      update: false,
      filter: false,
    },
    {
      type: "text",
      placeholder: "Title",
      name: "title",
      validation: "",
      default: "",
      label: "Title",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "textarea",
      placeholder: "Content",
      name: "content",
      validation: "",
      default: "",
      label: "Content",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "image",
      placeholder: "Image",
      name: "image",
      validation: "",
      default: "false",
      tag: true,
      label: "Image",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Author",
      name: "author",
      validation: "",
      default: "",
      label: "Author",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Designation",
      name: "designation",
      validation: "",
      default: "",
      label: "Designation",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
  ];

  const faq = [
    {
      type: "text",
      placeholder: "Event",
      name: "event",
      validation: "",
      default: eventId,
      tag: false,
      label: "Event",
      required: false,
      view: false,
      add: false,
      update: false,
    },
    {
      type: "text",
      placeholder: "Question",
      name: "question",
      validation: "",
      default: "",
      label: "Question",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Answer",
      name: "answer",
      validation: "",
      default: "",
      label: "Answer",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
  ];

  const newsandupdates = [
    {
      type: "select",
      apiType: "API",
      selectApi: "event/select",
      // params: [{ name: "pageSection", value: selectedElement?._id }],
      placeholder: "Event",
      name: "event",
      validation: "",
      showItem: "title",
      default: `${props?.openData?.data?._id}`,
      tag: false,
      label: "Event",
      required: false,
      view: false,
      add: false,
      update: false,
      filter: false,
    },
    {
      type: "text",
      placeholder: "Title",
      name: "title",
      validation: "",
      default: "",
      label: "Title",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "textarea",
      placeholder: "Description",
      name: "description",
      validation: "",
      default: "",
      label: "Description",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "date",
      placeholder: "Date",
      name: "date",
      validation: "",
      default: "",
      label: "Date",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "image",
      placeholder: "Image",
      name: "image",
      validation: "",
      default: "false",
      tag: true,
      label: "Image",
      required: true,
      view: true,
      add: true,
      update: true,
    },
  ];

  const sponsors = [
    {
      type: "select",
      apiType: "API",
      selectApi: "event/select",
      // params: [{ name: "pageSection", value: selectedElement?._id }],
      placeholder: "Event",
      name: "event",
      validation: "",
      showItem: "title",
      default: `${props?.openData?.data?._id}`,
      tag: false,
      label: "Event",
      required: false,
      view: false,
      add: false,
      update: false,
      filter: false,
    },
    {
      type: "text",
      placeholder: "Title",
      name: "title",
      validation: "",
      default: "",
      label: "Title",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "number",
      placeholder: "Sequence",
      name: "sequence",
      validation: "",
      default: "",
      label: "Sequence",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "image",
      placeholder: "Logo",
      name: "logo",
      validation: "",
      default: "false",
      tag: true,
      label: "Logo",
      required: true,
      view: true,
      add: true,
      update: true,
    },
  ];

  const keyfeatures = [
    {
      type: "select",
      apiType: "API",
      selectApi: "event/select",
      // params: [{ name: "pageSection", value: selectedElement?._id }],
      placeholder: "Event",
      name: "event",
      validation: "",
      showItem: "title",
      default: `${props?.openData?.data?._id}`,
      tag: false,
      label: "Event",
      required: false,
      view: false,
      add: false,
      update: false,
      filter: false,
    },
    {
      type: "select",
      placeholder: "Type",
      name: "type",
      validation: "",
      default: "keyfeatures",
      label: "Type",
      showItem: "Type",
      required: true,
      view: true,
      filter: false,
      add: false,
      update: false,
      apiType: "CSV",
      selectApi: "features,keyfeatures",
    },
    {
      type: "number",
      placeholder: "Sequence",
      name: "sequence",
      validation: "",
      default: "",
      label: "Sequence",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Title",
      name: "title",
      validation: "",
      default: "",
      label: "Title",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "textarea",
      placeholder: "Description",
      name: "description",
      validation: "",
      default: "",
      label: "Description",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "image",
      placeholder: "Icon",
      name: "icon",
      validation: "",
      default: "false",
      tag: true,
      label: "Icon",
      required: true,
      view: true,
      add: true,
      update: true,
    },
  ];

  const features = [
    {
      type: "select",
      apiType: "API",
      selectApi: "event/select",
      // params: [{ name: "pageSection", value: selectedElement?._id }],
      placeholder: "Event",
      name: "event",
      validation: "",
      showItem: "title",
      default: `${props?.openData?.data?._id}`,
      tag: false,
      label: "Event",
      required: false,
      view: false,
      add: false,
      update: false,
      filter: false,
    },
    {
      type: "select",
      placeholder: "Type",
      name: "type",
      validation: "",
      default: "features",
      label: "Type",
      showItem: "Type",
      required: true,
      view: true,
      filter: false,
      add: false,
      update: false,
      apiType: "CSV",
      selectApi: "features,keyfeatures",
    },
    {
      type: "number",
      placeholder: "Sequence",
      name: "sequence",
      validation: "",
      default: "",
      label: "Sequence",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Title",
      name: "title",
      validation: "",
      default: "",
      label: "Title",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "textarea",
      placeholder: "Description",
      name: "description",
      validation: "",
      default: "",
      label: "Description",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "image",
      placeholder: "Icon",
      name: "icon",
      validation: "",
      default: "false",
      tag: true,
      label: "Icon",
      required: true,
      view: true,
      add: true,
      update: true,
    },
  ];

  const speakers = [
    {
      type: "select",
      apiType: "API",
      selectApi: "event/select",
      // params: [{ name: "pageSection", value: selectedElement?._id }],
      placeholder: "Event",
      name: "event",
      validation: "",
      showItem: "title",
      default: `${props?.openData?.data?._id}`,
      tag: false,
      label: "Event",
      required: false,
      view: false,
      add: false,
      update: false,
      filter: false,
    },
    {
      type: "text",
      placeholder: "Name",
      name: "name",
      validation: "",
      default: "",
      label: "Name",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Designation",
      name: "designation",
      validation: "",
      default: "",
      label: "Designation",
      tag: true,
      // required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "image",
      placeholder: "Image",
      name: "photo",
      validation: "",
      default: "false",
      tag: true,
      label: "Image",
      // required: true,
      view: true,
      add: true,
      update: true,
    },
  ];

  const counts = [
    {
      type: "select",
      apiType: "API",
      selectApi: "event/select",
      // params: [{ name: "pageSection", value: selectedElement?._id }],
      placeholder: "Event",
      name: "event",
      validation: "",
      showItem: "title",
      default: `${props?.openData?.data?._id}`,
      tag: false,
      label: "Event",
      required: false,
      view: false,
      add: false,
      update: false,
      filter: false,
    },
    {
      type: "text",
      placeholder: "Title",
      name: "title",
      validation: "",
      default: "",
      label: "Title",
      required: true,
      view: true,
      add: true,
      update: true,
    },
    {
      type: "text",
      placeholder: "Count (eg:200+)",
      name: "count",
      validation: "",
      default: "",
      label: "Count (eg:200+)",
      tag: true,
      required: true,
      view: true,
      add: true,
      update: true,
    },
  ];
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;
  console.log("data", data, config);
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
            showContentTab={showContentTab}
          ></TabButtons>
        </ElementContainer>
        <ElementContainer className="column" style={{ display: 0 === activeTab ? "block" : "none" }}>
          <div style={{ fontWeight: "bold" }}>Active</div>
          <ActiveElements onElementClick={handleElementClick} onBackClick={handleBackClick} props event={eventId} onRefreshIframeChange={triggerIframeRefresh} refresh={refreshActiveElements} />
          <div style={{ fontWeight: "bold" }}>Elements List</div>
          <Elements
            onElementClick={handleElementClick}
            onBackClick={handleBackClick}
            props
            event={eventId}
            onRefreshIframeChange={triggerIframeRefresh}
            onSubmitSuccess={() => setRefreshActiveElements(!refreshActiveElements)}
          />
        </ElementContainer>
        <ElementContainer style={{ display: 1 === activeTab ? "block" : "none" }} className="noshadow top">
          {isElementSelected &&
            selectedElements &&
            selectedElements?.title !== "Social Media" &&
            // selectedElements?.title !== "About" &&
            selectedElements?.title !== undefined && (
              <ListTable
                preFilter={{ event: `${eventId}` }}
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
              />
            )}
        </ElementContainer>
      </SideBar>
      <Content className="">
        {data && config ? (
          <iframe
            referrerPolicy="no-referrer"
            sandbox="allow-same-origin allow-scripts allow-storage-access-by-user-activation"
            title="Demo Event"
            src={`${protocol}//${hostname}${port ? `:${port}` : ""}/landing-page/${props?.openData?.data?._id}`}
            key={refreshIframe ? "refreshed" : "not-refreshed"} // Add a unique key to trigger iframe refresh
          ></iframe>
        ) : (
          // <Event config={config} data={data} theme={selectedTheme?.key} desktopScrolling={desktopScrolling}></Event>
          <Loader />
        )}

        {selectedElements.length === 0 && (
          <DragBox>
            <GetIcon icon="circlePlus" />
            Drag Elements Here
          </DragBox>
        )}
      </Content>
    </div>
  );
};
export default Layout(LandingPage);
