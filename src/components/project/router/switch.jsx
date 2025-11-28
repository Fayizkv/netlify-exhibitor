import React, { lazy, Suspense } from "react";

// Lazy load all components
// const Signup = lazy(() => import("../../public/signup"));
const Landing = lazy(() => import("../pages/landing/landing"));
const Dashboard = lazy(() => import("../pages/dashboard"));
const LandingPageConfig = lazy(() => import("../pages/landingPageConfig"));
const CompanyProfile = lazy(() => import("../pages/companyProfile/companyProfile"));
const TeamManagement = lazy(() => import("../pages/teamManagement"));
const TicketsPasses = lazy(() => import("../pages/ticketManagement"));
const LeadManagement = lazy(() => import("../pages/leadManagement"));
const ProductCatalog = lazy(() => import("../pages/productCatalog"));
const Resources = lazy(() => import("../pages/resources"));
const Faq = lazy(() => import("../pages/faq"));

const RenderPage = (page, key, privileges) => {
  const renderComponent = (Component) => (
    <Suspense>
      <Component key={key} {...privileges} />
    </Suspense>
  );
  // console.log(page);

  switch (page) {
    case "login":
      return renderComponent(Landing);
    case "demo-landing":
      return renderComponent(Demo);
    case "admin":
        return renderComponent(Admin);
    case "dashboard":
          return renderComponent(Dashboard);
    case "company-profile":
          return renderComponent(CompanyProfile);
    case "team-management":
          return renderComponent(TeamManagement);
    case "tickets-passes":
          return renderComponent(TicketsPasses);
    case "lead-management":
          return renderComponent(LeadManagement);
    case "product-catalog":
          return renderComponent(ProductCatalog);
    case "resources":
          return renderComponent(Resources);
    case "faq":
          return renderComponent(Faq);
    // case "projects":
    //   return renderComponent(Projects);
    // case "menu":
    //   return renderComponent(Menu);
    // case "purchase-plan":
    //   return renderComponent(Signup);
    // case "franchise":
    //   return renderComponent(Franchise);
    //   return renderComponent(UserType);

    // case "faq":
    //   return renderComponent(Faq);

    // case "collection":
    //   return renderComponent(Collection);
    // case "gallery":
    //   return renderComponent(Gallery);
    // case "news":
    //   return renderComponent(News);
    // case "speakers":
    //   return renderComponent(Speakers);
    // case "registration":
    //   return renderComponent(Registration);
    // case "testimonial":
    //   return renderComponent(Testimonial);
    // case "event":
    //   return renderComponent(Event);
    // case "event-user":
    //   return renderComponent(EventUser);
    // case "count":
    //   return renderComponent(CountDate);
    // case "deconquista":
    //   return renderComponent(Deconquista);
    // case "leadersNote":
    //   return renderComponent(LeadersNote);
    // case "paid-reg":
    //   return renderComponent(PaidReg);
    // case "attendance":
    //   return renderComponent(Attendance);
    // case "page-section":
    //   return renderComponent(PageSection);
    // case "section-theme":
    //   return renderComponent(SectionTheme);
    // case "franchise-package":
    //   return renderComponent(Fpackage);
    // case "package":
    //   return renderComponent(Packages);
    // case "settings":
    //   return renderComponent(Settings);
    // case "whitelistedDomains":
    //   return renderComponent(WhitelistedDomains);
    // case "ticket":
    //   return renderComponent(Ticket);
    // case "ticket-form-data":
    //   return renderComponent(TicketFormData);
    // case "ticketRegistration":
    //   return renderComponent(TicketRegistration);
    case "landingPageConfig":
      return renderComponent(LandingPageConfig);
    // case "elements":
    //   return renderComponent(Elements);
    // case "certification-data":
    //   return renderComponent(CertificationData);
    // case "authentication":
    //   return renderComponent(Authentication);
    // case "event-admin":
    //   return renderComponent(Event);
    // case "demo":
    //   return renderComponent(Demo);
    // case "country":
    //   return renderComponent(Country);
    // case "currency":
    //   return renderComponent(Currency);
    // case "ticket-admin-portal":
    // case "ticket-admin":
    //   return renderComponent(TicketAdmin);
    // case "menu-item":
    //   return renderComponent(MenuItem);
    // case "model":
    //   return renderComponent(Model);
    // case "layout":
    //   return renderComponent(LayoutComponent);
    // case "sortFilter":
    //   return renderComponent(SortFilter);
    // case "exhibitor":
    //   return renderComponent(Exhibitor);
    // case "exhibitor-category":
    //   return renderComponent(ExhibitorCategory);
    // // case "registrations-lead":
    // //   return renderComponent(RegistrationsLead);
    // case "formBuilder":
    //   return renderComponent(FormBuilder);
    // case "badge-certificate":
    //   return renderComponent(BadgeCertificate);
    // case "session-type":
    //   return renderComponent(SessionType);
    // case "event-category":
    //   return renderComponent(EventCategory);
    // case "partners-spotlight":
    //   return renderComponent(PartnersSpotlight);
    // case "addon-product-category":
    //   return renderComponent(AddonProductCategory);
    // case "payment-method":
    //   return renderComponent(PaymentMethod);
    // case "template":
    //   return renderComponent(Template);
    // case "participant-category":
    //   return renderComponent(ParticipantCategory);
    // case "speaker-category":
    //   return renderComponent(SpeakerCategory);
    // case "graph-type":
    //   return renderComponent(GraphType);
    // case "add-on":
    //   return renderComponent(AddOn);
    // case "event-module":
    //   return renderComponent(EventModule);
    // case "add-on-price":
    //   return renderComponent(AddOnPrice);
    // case "eventAdmin":
    //   return renderComponent(EventAdmin);
    // case "ticketAdmin":
    //   return renderComponent(EventTicketAdmin);
    // case "badge-template":
    //   return renderComponent(BadgeTemplate);
    // case "item-pages":
    //   return renderComponent(ItemPages);
    // case "subscription-plan":
    //   return renderComponent(SubscriptionPlan);
    // case "subscription-coupon":
    //   return renderComponent(SubscriptionCoupon);
    // case "subscription-plan-module":
    //   return renderComponent(SubscriptionPlanModule);
    // case "subscribed-franchise":
    //   return renderComponent(SubscribedFranchise);
    // case "billing-address":
    //   return renderComponent(BillingAddress);
    // case "subscribed-franchise-module":
    //   return renderComponent(SubscribedFranchiseModule);
    // case "tax":
    //   return renderComponent(Tax);
    // case "prompt":
    //   return renderComponent(Prompt);
    // case "stage":
    //   return renderComponent(Stage);
    // case "day":
    //   return renderComponent(Day);
    // case "ticket-registration":
    //   return renderComponent(Attendee);
    // case "organisation-setting":
    //   return renderComponent(OrganisationSetting);
    // case "team-member":
    //   return renderComponent(TeamMember);
    // case "analytics":
    //   return renderComponent(Analytics);
    // case "subscription-orders":
    //   return renderComponent(SubscriptionOrders);
    // case "listing-page":
    //   return renderComponent(ListingPages);
    // case "website-settings":
    //   return renderComponent(WebsiteSettings);
    // case "activity-log":
    //   return renderComponent(ActivityLog);
    // case "template-collection":
    //   return renderComponent(TemplateCollection);
    // case "templateAutomationCollection":
    //   return renderComponent(adminAutomation);
    // case "modules":
    //   return renderComponent(Modules);
    // case "module-pages":
    //   return renderComponent(ModulePages);
    // case "statistics":
    //   return renderComponent(Statistics);
    // case "feedback":
    //   return renderComponent(Feedback);
    default:
      return <Page404 />;
  }
};

export default RenderPage;
