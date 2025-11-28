import { useState } from "react";
import Menu from "./menu";
import Register from "./register";
import EventList from "./eventlist";
import Footer from "./footer";

const Events = ({ data, config, theme, additionalMenus, setLoaderBox }) => {
  const [registering, setRegistering] = useState(false);
  const [sections] = useState([...config, { sequence: 8, title: "", showInMenu: false, type: "footer" }]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    console.log("ss", element);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const [user, setUser] = useState(JSON.parse(localStorage.getItem("--token")) ?? null);
  return (
    <div style={{ width: "100%" }} className="landing">
      <Menu
        theme
        event={{ ...data.event, mobBanner: data.event.subPageBanner, banner: data.event.subPageBanner, bannerType: "normal" }}
        registserHandler={() => {
          setRegistering(true);
        }}
        additionalMenus={additionalMenus}
        title={user ? <span>Hello {user.fullName}</span> : `"Participate in the Biggest Cultural Activities"`}
        description={user ? "You can manage your events here!" : "All the events you can participate!"}
        user={user}
        menuItems={sections
          .filter((section) => section.showInMenu)
          .map((section, index) => ({
            title: section.menuTitle,
            icon: section.type,
            onClick: () => scrollToSection(`section-${section.sequence}`),
          }))}
      ></Menu>
      <EventList setLoaderBox={setLoaderBox} event={data.event} theme="theme1" items={config}></EventList>
      <Footer additionalMenus={additionalMenus} key={0} event={data.event} id={`section-${0}`} theme={theme}></Footer>
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
export default Events;
