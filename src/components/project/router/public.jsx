import { Route } from "react-router-dom";
import EventsLanding from "../pages/landing/eventsLanding";
import EventDetailLanding from "../pages/landing/eventDetailLanding";
import Idcard from "../pages/landing/idcard";
import React from "react";
import Luckydraw from "../pages/landing/luckydraw";
import Token from "../pages/landing/token";
import Campaign from "../pages/landing/campaign";
import Embed from "../pages/landing/event/register/embed";
import FormEmbed from "../pages/landing/event/form/embed";
import Signup from "../../public/signup";
import PaymentSuccess from "../pages/landing/single/PaymentSuccess";
import PaymentCancelled from "../pages/landing/single/PaymentCancelled";
import CampaignInstasnap from "../pages/landing/campaignInstasnap";
const CustomPublicRoute = () => [
  <Route key="events" path="/events" element={<EventsLanding></EventsLanding>} />,
  <Route key="embed" path="/embed/:slug" element={<Embed></Embed>} />,
  <Route key="form-embed" path="/form/:slug" element={<FormEmbed></FormEmbed>} />,
  <Route key="lucky-draw" path="/lucky-draw" element={<Luckydraw></Luckydraw>} />,
  <Route key="event-details" path="/events/:slug" element={<EventDetailLanding />} />,
  <Route key="id-card" path="/my-id-card/:event/:slug" element={<Idcard />} />, // Add the custom redirect route here
  <Route key="campaign" path="/campaign/:slug" element={<Campaign />} />,
  <Route key="sign-up" path="/sign-up" element={<Signup />} />,
  <Route key="purchase-plan" path="/purchase-plan" element={<Signup hideMenu={true} hideHeader={true} />} />,
  <Route key="get-tokent" path="/get-token" element={<Token />} />, // Add the custom redirect route here
  <Route key="payment-success" path="/payment-success" element={<PaymentSuccess />} />,
  <Route key="payment-cancelled" path="/payment-cancel" element={<PaymentCancelled />} />,
  <Route key="campaign-instasnap" path="/campaign/:type/:eventId" element={<CampaignInstasnap />} />,
];
export default CustomPublicRoute;
