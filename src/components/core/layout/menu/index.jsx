import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Nav, SubMenuHead } from "./styels";
import { useDispatch, useSelector } from "react-redux";
import { currentMenu, menuStatus, openedMenu, selectedMenu, selectedSubMenu } from "../../../../store/actions/common";
import { GetIcon } from "../../../../icons";

// import Search from "../../search";
const Menu = (props) => {
  const themeColors = useSelector((state) => state.themeColors);
  const selectedMenuItem = useSelector((state) => state.selectedMenu);
  const [currentMenus] = useState(props.user.menu);
  // const { hoverEnabled } = props;
  const dispatch = useDispatch();
  let lastMenuGroup = null;
  // const [searchValue, setSearchValue] = useState("");
  // const handleChange = (event) => {
  //   const search = event.target.value.toLowerCase(); // Convert to lower case for case-insensitive matching
  //   setSearchValue(search);
  //   let menu = JSON.parse(JSON.stringify(props.user.menu));
  //   const newMenu = menu.filter((menuItem) => {
  //     const labelMatches = menuItem.label.toLowerCase().includes(search);
  //     // Filter submenu labels
  //     const filteredSubmenu = menuItem.submenus.filter((submenuItem) => submenuItem.label.toLowerCase().includes(search));
  //     menuItem.submenus = labelMatches ? menuItem.submenus : filteredSubmenu;

  //     return labelMatches || filteredSubmenu.length > 0;
  //   });

  //   setCurrentMenus(newMenu);
  // };

  // console.log(selectedMenuItem)
  return (
    <>
      <Nav theme={themeColors}>
        {/* {!props.isMobile && <Search title={"Search"} className="menu active" theme={themeColors} placeholder="Search Menu" value={searchValue} onChange={handleChange}></Search>} */}
        {/* Link to the home page */}
        {currentMenus?.map((menuItem, index) => {
          const showMenuGroup = menuItem.menuGroup && menuItem.menuGroup !== lastMenuGroup;
          lastMenuGroup = menuItem.menuGroup;

          return (
            <React.Fragment key={menuItem._id}>
              {showMenuGroup && (
                <SubMenuHead className="hide title text-[12px] font-medium leading-4 tracking-[0.04em] text-left pl-1 pt-1 text-[#868C98] mt-2 hidden sm:block">{menuItem.menuGroup}</SubMenuHead>
              )}
              {menuItem.menuType !== "title" && (
                <div className="menu-item">
                  {menuItem.submenus.length > 0 && (menuItem.showInMenu ?? true) ? (
                    <Link
                      onClick={() => {
                        dispatch(selectedSubMenu(menuItem));
                        dispatch(openedMenu(menuItem._id));
                        if (menuItem.submenus[0]) {
                          dispatch(menuStatus(false));
                          dispatch(openedMenu(menuItem.submenus[0]._id));
                          dispatch(selectedMenu(menuItem.submenus[0]));
                          dispatch(currentMenu(menuItem.submenus[0].label));
                          // hoverEnabled(false);
                        }
                      }}
                      className={`${menuItem._id === selectedMenuItem._id || selectedMenuItem.menu === menuItem._id ? "main active" : "main"}`}
                      to={menuItem.submenus[0]?.path}
                      replace
                    >
                      <GetIcon icon={menuItem.icon} />
                      {props.isMobile ? (
                        <span>{menuItem.label.substring(0, menuItem.label.indexOf(" ") !== -1 ? menuItem.label.indexOf(" ") : menuItem.label.length)}</span>
                      ) : (
                        <span>{menuItem.label}</span>
                      )}
                    </Link>
                  ) : (menuItem.showInMenu ?? true) ? (
                    <Link
                      onClick={() => {
                        dispatch(menuStatus(false));
                        dispatch(selectedSubMenu(null));
                        dispatch(selectedMenu(menuItem));
                        dispatch(currentMenu(menuItem.label));
                        // hoverEnabled(true);
                      }}
                      className={menuItem._id === selectedMenuItem._id ? "main active" : "main"}
                      to={menuItem.path}
                      replace
                    >
                      <GetIcon icon={menuItem.icon} />
                      {props.isMobile ? (
                        <span>{menuItem.label.substring(0, menuItem.label.indexOf(" ") !== -1 ? menuItem.label.indexOf(" ") : menuItem.label.length)}</span>
                      ) : (
                        <span>{menuItem.label}</span>
                      )}
                    </Link>
                  ) : null}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </Nav>
    </>
  );
};

export default Menu;
