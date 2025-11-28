import React, { useEffect, useState, useCallback, useMemo } from "react";
import { BrowserRouter, Link, Outlet, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useUser } from "../../contexts/UserContext";

import Switch from "./switch";
import Page404 from "../project/pages/page404";
import { Container, MainContainer, SideBar } from "../core/layout/styels";
import { RowContainer } from "../styles/containers/styles";
import Header from "../core/layout/header";
import Footer from "../core/layout/footer";
import Menu from "../core/layout/menu";
import InternetStatusPopup from "../core/InternetStatusPopup";
import { GetIcon } from "../../icons";
import { currentMenu, menuStatus, selectedMenu } from "../../store/actions/common";
import { MobileSubMenu, SubMenuHead, SubMenuOpen } from "../core/layout/menu/styels";
import CustomPrivateRoute from "../project/router/private";
import CustomPublicRoute from "../project/router/public";
import Public404 from "../public/public404";
import Signup from "../public/signup";
import EnhancedChatAssistant from "../core/assistant/EnhancedChatAssistant";

// New component to handle the redirect logic for the home page.
const HomeRedirect = ({ userData }) => {
  // Find the first valid menu item with a path. This is safer than just taking the first item.
  const firstPath = userData?.menu?.find((item) => item.path)?.path;
  // If a valid path is found, redirect the user to that page.
  // `replace` is used to avoid adding an extra entry to the browser's history.
  if (firstPath) {
    return <Navigate to={firstPath} replace />;
  }
  // As you suggested, if no path is found, we can show a loading page.
  return <Switch page="login" />;
};

const buildRoutes = (items, userData) => {
  const withLayout = [];
  const withoutLayout = [];

  const processItems = (menuItems) => {
    if (!menuItems) return;

    for (const item of menuItems) {
      const role = item.privilege ?? item.menuRoles?.[0] ?? item.subMenuRoles?.[0];
      if (!role) continue;

      withLayout.push(
        <Route
          key={item._id}
          path={item.path}
          element={
            <Switch
              setKey={item._id}
              user={userData}
              addPrivilege={role.add ?? false}
              delPrivilege={role.delete ?? false}
              updatePrivilege={role.update ?? false}
              exportPrivilege={role.export ?? false}
              clonePrivilege={role.clone ?? false}
              hideMenu={role.hideMenu ?? false}
              hideHeader={role.hideHeader ?? false}
              userType={role.userType}
              page={item.element}
              itemOpenInSlug={item.itemOpenInSlug}
              isSlug={false}
              itemPages={item.itemPages ?? []}
            />
          }
        />
      );

      if (item.itemOpenInSlug) {
        withoutLayout.push(
          <Route
            key={`${item._id}-slug`}
            path={`${item.path}/:slug/:mainTab?/:subTab?/:inlineTab?`}
            element={
              <Switch
                setKey={`${item._id}-slug`}
                user={userData}
                addPrivilege={role.add ?? false}
                delPrivilege={role.delete ?? false}
                updatePrivilege={role.update ?? false}
                exportPrivilege={role.export ?? false}
                clonePrivilege={role.clone ?? false}
                hideMenu={role.hideMenu ?? false}
                hideHeader={role.hideHeader ?? false}
                userType={role.userType}
                page={item.element}
                itemOpenInSlug={item.itemOpenInSlug}
                isSlug={true}
                itemPages={item.itemPages ?? []}
              />
            }
          />
        );
      }

      if (item.submenus && item.submenus.length > 0) {
        processItems(item.submenus);
      }
    }
  };

  processItems(items);
  return { withLayout, withoutLayout };
};

const AppLayout = () => {
  const userData = useUser();
  const menuStatus1 = useSelector((state) => state.menuStatus);
  const selectedMenuItem = useSelector((state) => state.selectedMenu);
  const selectedSubMenuItem = useSelector((state) => state.selectedSubMenu);
  const dispatch = useDispatch();
  const themeColors = useSelector((state) => state.themeColors);
  const [isMobile, setIsMobile] = useState(window.matchMedia("(max-width: 600px)").matches);

  const updateIsMobile = useCallback(() => {
    setIsMobile(window.matchMedia("(max-width: 600px)").matches);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 600px)");
    mediaQuery.addEventListener("change", updateIsMobile);
    updateIsMobile();
    return () => {
      mediaQuery.removeEventListener("change", updateIsMobile);
    };
  }, [updateIsMobile]);

  if (!userData?.user) {
    return null;
  }

  return (
    <>
      {!(selectedMenuItem.hideHeader ?? false) && <Header isMobile={isMobile} user={userData.user}></Header>}
      <MainContainer>
        {isMobile ? (
          <Menu isMobile={isMobile} user={userData} menu={userData.menu}></Menu>
        ) : (
          !(selectedMenuItem.hideMenu ?? false) && (
            <SideBar
              theme={themeColors}
              className={`${menuStatus1 && "active"} ${selectedSubMenuItem?.submenus?.length > 0 ? "submenu" : ""} ${selectedSubMenuItem?.submenus?.length > 0 ? "" : "sticky"}`}
            >
              <div className="menus">
                <Menu subMenu={selectedSubMenuItem?.submenus?.length > 0 ? true : false} isMobile={isMobile} user={userData}></Menu>
                <Footer></Footer>
              </div>
            </SideBar>
          )
        )}

        {selectedSubMenuItem?.submenus?.length > 0 &&
          (isMobile ? (
            <MobileSubMenu>
              <SubMenuOpen theme={themeColors}>
                {selectedSubMenuItem.submenus.map((submenu) => (
                  <Link
                    key={submenu._id}
                    onClick={() => {
                      dispatch(menuStatus(false));
                      dispatch(selectedMenu(submenu));
                      dispatch(currentMenu(submenu.label));
                    }}
                    className={submenu._id === selectedMenuItem._id ? "main active" : "main"}
                    to={submenu.path}
                    replace
                  >
                    <GetIcon icon={submenu.icon} /> <span>{submenu.label}</span>
                  </Link>
                ))}
              </SubMenuOpen>
            </MobileSubMenu>
          ) : (
            <SubMenuOpen theme={themeColors}>
              {(() => {
                let lastSubMenuGroup = null;
                return selectedSubMenuItem.submenus.map((submenu) => {
                  const showMenuGroup = submenu.menuGroup && submenu.menuGroup !== lastSubMenuGroup;
                  lastSubMenuGroup = submenu.menuGroup;

                  return (
                    <React.Fragment key={submenu._id}>
                      {showMenuGroup && <SubMenuHead className="hide">{submenu.menuGroup}</SubMenuHead>}
                      <Link
                        onClick={() => {
                          dispatch(menuStatus(false));
                          dispatch(selectedMenu(submenu));
                          dispatch(currentMenu(submenu.label));
                        }}
                        className={submenu._id === selectedMenuItem._id ? "main active" : "main"}
                        to={submenu.path}
                        replace
                      >
                        <GetIcon icon={submenu.icon} /> <span>{submenu.label}</span>
                      </Link>
                    </React.Fragment>
                  );
                });
              })()}
            </SubMenuOpen>
          ))}
        <RowContainer className={`content ${selectedSubMenuItem?.submenus?.length > 0 ? "has-menu" : ""} ${selectedMenuItem.hideMenu && "hidemenu"}`}>
          <Container className="nopadding" theme={themeColors}>
            <Outlet />
          </Container>
        </RowContainer>
        <InternetStatusPopup />
      </MainContainer>
    </>
  );
};

const PageRouter = () => {
  const userData = useUser();
  const { withLayout, withoutLayout } = useMemo(() => buildRoutes(userData?.menu, userData), [userData?.menu, userData]);

  if (!userData.token) {
    return (
      <BrowserRouter basename="/exhibitor">
        <Routes>
          <Route path="/" element={<Switch page="login" />} />
          {CustomPublicRoute()}
          <Route path="*" element={<Public404 />} />
        </Routes>
      </BrowserRouter>
    );
  }

  if (userData.user.hasActiveSubscription === false) {
    return (
      <BrowserRouter basename="/exhibitor">
        <Signup />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter basename="/exhibitor">
      <>
        <Routes>
          {withoutLayout}

          <Route path="/" element={<AppLayout />}>
            <Route index element={<HomeRedirect userData={userData} />} />

            {withLayout}

            {CustomPrivateRoute()}
            <Route path="*" element={<Page404 />} />
          </Route>
        </Routes>
        {/* Route-aware chat so session pages get session-mode assistant */}
        <RouteAwareChat />
      </>
    </BrowserRouter>
  );
};

const RouteAwareChat = () => {
  const location = useLocation();
  const path = location.pathname || "";
  // Match /event/:id/configure/sessions - only show AI assistant on session pages
  const match = path.match(/\/event\/([^/]+)\/configure\/sessions/);
  // if (match) {
  //   const eventId = match[1];
  //   return <EnhancedChatAssistant mode="session" context={{ eventId }} />;
  // }
  // Don't render the assistant on other pages
  return null;
};

export default React.memo(PageRouter);
