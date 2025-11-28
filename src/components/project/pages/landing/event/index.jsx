import { useEffect, useState } from "react";
import About from "./about";
import Banner from "./banner";
import CountDown from "./countdown";
import Counts from "./counts";
import Footer from "./footer";
import Menu from "./menu";
import NewsAndUpdates from "./newsandupdates";
import Speakers from "./speakers";
import Testimonials from "./testimonial";
import Register from "./register";
import Features from "./features";
import { getData } from "../../../../../backend/api";
import KeyFeatures from "./keyFeatures";
import Faq from "./faq";
import Video from "./video";
import FontLoader from "../../../../core/functions/fontLoader";
import Gallery from "./gallery";
import MyEvents from "./myevents";
import Sponsors from "./sponsors";
import { SingleTicket } from "./singleticket";
const Event = ({ data, config, theme, desktopScrolling, additionalMenus = [], setLoaderBox }) => {
  const [registering, setRegistering] = useState(false);
  const [sections, setSections] = useState([...config, ...(data.event.footer === true ? [{ sequence: 8, title: "", showInMenu: false, type: "footer", theme: data.event.footerTheme }] : [])]);
  const [sectionLoaded, setSectionLoaded] = useState(false);
  useEffect(() => {
    const getSections = async () => {
      setSectionLoaded(true);
      const response = await getData({ event: data.event._id }, "event/landing-page");
      setSections([...response.data, ...(data.event.footer === true ? [{ sequence: "--", title: "", showInMenu: false, type: "footer", theme: data.event.footerTheme }] : [])]);
    };
    if (!sectionLoaded) {
      getSections();
    }
  }, [data, sectionLoaded]);
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const getSectionConfig = (_id) => {
    return config.find((section) => section._id === _id);
  };
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("--token")) ?? null);
  return (
    <div style={{ width: "100%" }} className="landing">
      <FontLoader fontName={"Sora"} />
      {data.event.header && (
        <Menu
          theme
          event={data.event}
          additionalMenus={additionalMenus}
          registserHandler={() => {
            setRegistering(true);
          }}
          setLoaderBox={setLoaderBox}
          user={user}
          menuItems={sections
            .filter((section) => section.showInMenu)
            .map((section, index) => {
              return {
                title: section.menuTitle,
                icon: section.type,
                onClick: () => scrollToSection(`section-${section.sequence}`),
              };
            })}
        ></Menu>
      )}

      {sections.map((section, index) => {
        const sectionConfig = getSectionConfig(section._id);
        switch (section.type) {
          case "banner":
            return <Banner key={index} id={`section-${section.sequence}`} event={data.event} theme={theme}></Banner>;
          case "singleform":
            return <SingleTicket key={index} event={data.event} ticket={section.ticket} setLoaderBox={setLoaderBox}></SingleTicket>;
          case "counts":
            return <Counts key={index} counts={section.counts} event={data.event} id={`section-${section.sequence}`} theme={theme}></Counts>;
          case "about":
            return (
              <About
                key={index}
                sectionTheme={section.theme ?? "theme4"}
                image={section.image}
                event={data.event}
                title={section.title}
                description={section.description}
                id={`section-${section.sequence}`}
                theme={theme}
                config={sectionConfig}
              ></About>
            );
          case "events":
            return (
              <MyEvents
                key={index}
                sectionTheme={section.theme ?? "theme4"}
                items={section.items}
                image={section.image}
                event={data.event}
                title={section.title}
                description={section.description}
                id={`section-${section.sequence}`}
                theme={theme}
                config={sectionConfig}
                user={user}
                setLoaderBox={setLoaderBox}
              ></MyEvents>
            );
          case "speakers":
            return <Speakers key={index} config={sectionConfig} event={data.event} speakers={section.items} id={`section-${section.sequence}`} theme={theme}></Speakers>;
          case "gallery":
            return <Gallery key={index} config={sectionConfig} event={data.event} items={section.items} id={`section-${section.sequence}`} theme={theme}></Gallery>;
          case "features":
            return (
              <Features
                sectionTheme={section.theme ?? "theme4"}
                key={index}
                config={sectionConfig}
                event={data.event}
                title={section.title}
                description={section.description}
                items={section.items}
                id={`section-${section.sequence}`}
                theme={theme}
              ></Features>
            );
          case "keyfeatures":
            return (
              <KeyFeatures
                key={index}
                config={sectionConfig}
                event={data.event}
                title={section.title}
                description={section.description}
                items={section.items}
                id={`section-${section.sequence}`}
                theme={theme}
              ></KeyFeatures>
            );
          case "countdown":
            return <CountDown key={index} event={data.event} config={sectionConfig} targetDate={section.items} id={`section-${section.sequence}`} theme={theme}></CountDown>;
          case "newsupdates":
            return <NewsAndUpdates key={index} config={sectionConfig} event={data.event} id={`section-${section.sequence}`} desktopScrolling={desktopScrolling} theme={theme}></NewsAndUpdates>;
          case "testimonial":
            return <Testimonials key={index} config={sectionConfig} event={data.event} id={`section-${section.sequence}`} theme={theme}></Testimonials>;
          case "faq":
            return <Faq key={index} config={sectionConfig} event={data.event} id={`section-${section.sequence}`} theme={theme} desktopScrolling={desktopScrolling}></Faq>;
          case "video":
            return <Video key={index} config={sectionConfig} event={data.event} id={`section-${section.sequence}`} theme={theme} desktopScrolling={desktopScrolling}></Video>;
          case "footer":
            return <Footer additionalMenus={additionalMenus} key={index} event={data.event} id={`section-${section.sequence}`} theme={data?.event?.footerTheme}></Footer>;
          case "sponsors":
            return (
              <Sponsors
                sectionTheme={section.theme ?? "marquee"}
                title={section.title}
                description={section.description}
                items={section.items}
                key={index}
                event={data.event}
                config={sectionConfig}
                id={`section-${section.sequence}`}
                theme={theme}
              ></Sponsors>
            );
          default:
            return null;
        }
      })}
      {registering && (
        <Register
          setLoaderBox={setLoaderBox}
          registserHandler={() => {
            setRegistering(false);
            document.body.style.overflow = "";
            setUser(JSON.parse(localStorage.getItem("--token")) ?? null);
          }}
          event={data.event}
        />
      )}
    </div>
  );
};
export default Event;
