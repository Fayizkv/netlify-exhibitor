import React, { useEffect, useRef, useState } from "react";
import { Container, HeaderMenu, Logo, Status, Title } from "./styels";
import ProfileBar from "../profile";
import { logo } from "../../../../images";
import { GetIcon } from "../../../../icons";
import { avathar } from "../../../../images";
import SearchMenu from "./SearchMenu";
import { getData } from "../../../../backend/api";
// import { TimezoneSelector } from "../../timezone";
const Header = (props) => {
  const [isProfileBarOpen, setIsProfileBarOpen] = useState(false);
  const profileRef = useRef(null);
  const { user } = props;
  const [eventLogo, setEventLogo] = useState(logo);
  const [exhibitorLogo, setExhibitorLogo] = useState(null);
  const [exhibitorInfo, setExhibitorInfo] = useState({
    firstName: "",
    boothNumber: "",
    categoryName: "",
  });

  // Helper function to construct full URL for images
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    if (path.startsWith("blob:")) return path;
    // For relative paths, construct the full URL using CDN
    const CDN_BASE_URL = import.meta.env.VITE_CDN || "https://event-manager.syd1.cdn.digitaloceanspaces.com/";
    const cleanPath = path.replace(/^\/+/, "");
    return `${CDN_BASE_URL}${cleanPath}`;
  };

  // Load dynamic logo from localStorage on mount
  useEffect(() => {
    const storedLogo = localStorage.getItem("exhibitor:event:logo");
    if (storedLogo) {
      setEventLogo(storedLogo);
    }
  }, []);

  // Fetch exhibitor information
  useEffect(() => {
    const loadExhibitorInfo = async () => {
      try {
        console.log("Loading exhibitor info, user object:", user);
        
        // Try localStorage first (most reliable source for logged-in user data)
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log("Parsed user from localStorage:", parsedUser);
            
            // Check various possible structures - the user data might be nested
            let userObj = parsedUser;
            
            // Try different paths: parsedUser.user, parsedUser.data, or parsedUser itself
            if (parsedUser.user && (parsedUser.user.firstName || parsedUser.user.boothNumber || parsedUser.user.exhibitorCategory)) {
              userObj = parsedUser.user;
            } else if (parsedUser.data && (parsedUser.data.firstName || parsedUser.data.boothNumber || parsedUser.data.exhibitorCategory)) {
              userObj = parsedUser.data;
            } else if (parsedUser.firstName || parsedUser.boothNumber || parsedUser.exhibitorCategory) {
              userObj = parsedUser;
            }
            
            if (userObj && (userObj.firstName || userObj.boothNumber || userObj.exhibitorCategory)) {
              const info = {
                firstName: userObj.firstName || userObj.formData?.companyProfile?.companyName || "",
                boothNumber: userObj.boothNumber || userObj.boothLocation || "",
                categoryName: userObj.exhibitorCategory?.categoryName || userObj.formData?.companyProfile?.category || userObj.categoryName || "",
              };
              
              // Get exhibitor logo
              const logoPath = userObj.logo || userObj.formData?.companyProfile?.logo || "";
              if (logoPath) {
                const logoUrl = getImageUrl(logoPath);
                setExhibitorLogo(logoUrl);
              }
              
              console.log("Extracted exhibitor info from localStorage:", info, "from userObj:", userObj);
              
              if (info.firstName || info.boothNumber || info.categoryName) {
                console.log("Setting exhibitor info from localStorage:", info);
                setExhibitorInfo(info);
                return; // If we got data from localStorage, don't fetch from API
              }
            }
          } catch (error) {
            console.log("Error parsing user data from localStorage:", error);
          }
        }

        // Try to get data directly from user prop (user might already be the ticket-registration data)
        const userData = user?.user || user;
        
        if (userData && (userData.firstName || userData.boothNumber || userData.exhibitorCategory)) {
          const info = {
            firstName: userData.firstName || userData.formData?.companyProfile?.companyName || "",
            boothNumber: userData.boothNumber || userData.boothLocation || "",
            categoryName: userData.exhibitorCategory?.categoryName || userData.formData?.companyProfile?.category || userData.categoryName || "",
          };
          
          // Get exhibitor logo
          const logoPath = userData.logo || userData.formData?.companyProfile?.logo || "";
          if (logoPath) {
            const logoUrl = getImageUrl(logoPath);
            setExhibitorLogo(logoUrl);
          }
          
          if (info.firstName || info.boothNumber || info.categoryName) {
            console.log("Setting exhibitor info from user prop:", info);
            setExhibitorInfo(info);
            return; // If we got data from user object, don't fetch from API
          }
        }

        // If we still don't have data, try fetching from API
        const exhibitorId = user?.userId || user?.user?._id || user?._id || user?.user?.userId;
        console.log("Attempting to fetch from API with exhibitorId:", exhibitorId);
        
        if (exhibitorId) {
          await fetchExhibitorDataFromAPI(exhibitorId);
        }
      } catch (error) {
        console.log("Error loading exhibitor info:", error);
      }
    };

    const fetchExhibitorDataFromAPI = async (exhibitorId) => {
      try {
        // Try fetching from exhibitor endpoint first (this endpoint populates exhibitorCategory)
        let response = null;
        try {
          response = await getData({ id: exhibitorId }, "ticket-registration/exhibitor");
        } catch (err) {
          console.log("Error with exhibitor endpoint:", err);
        }

        // If exhibitor endpoint fails, try regular ticket-registration endpoint
        if (!response || response.status !== 200 || !response.data?.success) {
          try {
            response = await getData({ _id: exhibitorId }, "ticket-registration");
          } catch (err) {
            console.log("Error with _id parameter:", err);
          }
        }

        if (response && response.status === 200 && response.data?.success) {
          const exhibitorData = response.data.response || response.data.data;
          const exhibitor = Array.isArray(exhibitorData) ? exhibitorData[0] : exhibitorData;
          
          if (exhibitor) {
            let categoryName = exhibitor.exhibitorCategory?.categoryName || exhibitor.formData?.companyProfile?.category || exhibitor.categoryName || "";
            
            // If exhibitorCategory is just an ID (string), fetch the category details
            if (!categoryName && exhibitor.exhibitorCategory) {
              const categoryId = typeof exhibitor.exhibitorCategory === "string" 
                ? exhibitor.exhibitorCategory 
                : exhibitor.exhibitorCategory._id;
              
              if (categoryId) {
                try {
                  const categoryResponse = await getData({ id: categoryId }, "exhibitor-category");
                  if (categoryResponse.status === 200 && categoryResponse.data?.success) {
                    const category = categoryResponse.data.response;
                    categoryName = category?.categoryName || "";
                  }
                } catch (categoryErr) {
                  console.log("Error fetching exhibitor category:", categoryErr);
                }
              }
            }
            
            const info = {
              firstName: exhibitor.firstName || exhibitor.formData?.companyProfile?.companyName || "",
              boothNumber: exhibitor.boothNumber || exhibitor.boothLocation || "",
              categoryName: categoryName,
            };
            
            // Get exhibitor logo
            const logoPath = exhibitor.logo || exhibitor.formData?.companyProfile?.logo || "";
            if (logoPath) {
              const logoUrl = getImageUrl(logoPath);
              setExhibitorLogo(logoUrl);
            }
            
            console.log("Setting exhibitor info from API:", info);
            setExhibitorInfo(info);
          }
        }

        // Also try to fetch from company-profile
        try {
          const profileResponse = await getData({ exhibitor: exhibitorId }, "company-profile");
          if (profileResponse.status === 200 && profileResponse.data?.success) {
            const profileData = profileResponse.data.response || profileResponse.data.data;
            const profile = Array.isArray(profileData) ? profileData[0] : profileData;
            
            if (profile) {
              setExhibitorInfo((prev) => ({
                firstName: prev.firstName || profile.companyName || "",
                boothNumber: prev.boothNumber || profile.boothLocation || "",
                categoryName: prev.categoryName || profile.category || "",
              }));
              
              // Get exhibitor logo from company profile
              if (profile.logo) {
                const logoUrl = getImageUrl(profile.logo);
                setExhibitorLogo(logoUrl);
              }
            }
          }
        } catch (profileError) {
          console.log("Error fetching company-profile:", profileError);
        }
      } catch (error) {
        console.log("Error fetching exhibitor data from API:", error);
      }
    };

    // Always try to load, even if user is not yet available
    loadExhibitorInfo();
  }, [user]);

  // Function to handle clicks outside of the Profile component
  const handleClickOutside = (event) => {
    if (profileRef.current && !profileRef.current.contains(event.target)) {
      setIsProfileBarOpen(false);
    }
  };

  // Add a click event listener when the component mounts
  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Toggle the ProfileBar when clicking the Profile
  const handleProfileClick = () => {
    setIsProfileBarOpen(!isProfileBarOpen);
  };
  // const navigate = useNavigate();
  return (
    <Container className={isProfileBarOpen ? "profile-open" : ""}>
      {/* <Title
        className="navicon"
        onClick={() => {
          dispatch(menuStatus(!menuCurrentStatus));
        }}
      >
        <GetIcon icon={"menu"} />
      </MNav> */}

      <Status>
        {/* <MNav>
          <GetIcon icon={selectedMenuItem.icon} />
        </MNav> */}
        <Title>
          <Logo src={exhibitorLogo || eventLogo} alt="logo" />
        </Title>

        {/* Brand Info Section */}
        {(exhibitorInfo.firstName || exhibitorInfo.boothNumber || exhibitorInfo.categoryName) && (
          <div className="brand-info flex-1 flex flex-col items-start justify-center pl-11">
            {exhibitorInfo.firstName && (
              <h1 className="company-name text-2xl font-bold text-black leading-tight m-0 p-0">
                {exhibitorInfo.firstName}
              </h1>
            )}
            {(exhibitorInfo.boothNumber || exhibitorInfo.categoryName) && (
              <div className="company-meta flex items-center gap-3 text-sm text-gray-600 mt-1">
                {exhibitorInfo.boothNumber && (
                  <span>{exhibitorInfo.boothNumber}</span>
                )}
                {exhibitorInfo.boothNumber && exhibitorInfo.categoryName && (
                  <span className="divider w-px h-3 bg-gray-300"></span>
                )}
                {exhibitorInfo.categoryName && (
                  <span>{exhibitorInfo.categoryName}</span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex-1 flex justify-end pr-4 gap-4">
          {/* <TimezoneSelector compact /> */}
          <SearchMenu />
        </div>

        <HeaderMenu
          ref={profileRef}
          onClick={() => {
            handleProfileClick();
          }}
        >
          <div className="flex items-center gap-2 p-2 rounded-md">
            <img className="w-6 h-6 rounded-full" src={user.photo?.length > 5 ? `${import.meta.env.VITE_CDN}${user.photo}` : avathar} alt="profile" />
            <i className="hidden md:block">{user?.fullName ?? user?.username}</i>
          </div>
          <GetIcon icon={"down-small"}></GetIcon>
          {isProfileBarOpen && (
            <div className="ProfileBar" onClick={(e) => e.stopPropagation()}>
              <ProfileBar close={() => setIsProfileBarOpen(false)} setLoaderBox={props.setLoaderBox} setMessage={props.setMessage} user={user}></ProfileBar>
            </div>
          )}
        </HeaderMenu>
      </Status>
    </Container>
  );
};

export default Header;
