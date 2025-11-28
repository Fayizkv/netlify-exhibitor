import { Route } from "react-router-dom";
import Idcard from "../pages/landing/idcard";
import ProfileSettings from "../../core/settings";
import Signup from "../../public/signup";
import CampaignInstasnap from "../pages/landing/campaignInstasnap";
const CustomPrivateRoute = () => [
  <Route key="id-card" path="/my-id-card/:event/:slug" element={<Idcard key="id-card" />} />, // Add the custom redirect route here
  <Route key="profile" path="/profile-settings" element={<ProfileSettings key="profile" />} />,
  <Route key="sign-up" path="/sign-up" element={<Signup key="sign-up" hideMenu={true} hideHeader={true} />} />,
  <Route key="campaign-instasnap-private" path="/campaign/:type/:eventId" element={<CampaignInstasnap key="campaign-instasnap-private" />} />,
];
export default CustomPrivateRoute;
