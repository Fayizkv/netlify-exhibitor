import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getData } from "../../../backend/api";
import { CheckCircle, AlertCircle, Calendar, User, Building, CreditCard, RefreshCw } from "lucide-react";
import { Button, DataView, ElementContainer } from "../../core/elements";
import { PageHeader } from "../../core/input/heading";
// Shimmer loading component
const ShimmerCard = ({ size }) =>
  size === "large" ? (
    <div className="bg-bg-white rounded-lg w-[30%] p-5 text-center border border-stroke-soft/20 overflow-hidden md:w-[90%] md:max-w-[400px] md:mb-5 shadow-sm">
      {/* Title and badge area */}
      <div className="border-b border-stroke-soft/10 p-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="h-7 w-20 bg-bg-soft/50 rounded-md animate-pulse" />
          <div className="h-7 w-16 bg-bg-soft/50 rounded-md animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-bg-soft/50 rounded-md w-full animate-pulse" />
          <div className="h-4 bg-bg-soft/50 rounded-md w-3/4 animate-pulse" />
        </div>
      </div>
    </div>
  ) : (
    <div className="bg-bg-white rounded-lg w-[30%] p-5 text-center border border-stroke-soft/20 overflow-hidden md:w-[90%] md:max-w-[400px] md:mb-5 shadow-sm">
      <div className="border-b border-stroke-soft/10 p-3 flex flex-col gap-3">
        <div className="h-7 w-20 bg-bg-soft/50 rounded-md animate-pulse" />
        <div className="h-7 w-16 bg-bg-soft/50 rounded-md animate-pulse" />
      </div>
    </div>
  );

const PricingTable = ({
  pricingTableId = "prctbl_1RAQrVSINHYwNSZta3NGAsWv",
  publishableKey = "pk_test_51RAFfoSINHYwNSZtfwv0Q01cuPg7TcGiDwJ6Xpv9v2FZOonwrVgYGrfX1GiSeyG6f5S2AsIlUBb3uk4kGR1eeG1g00wMOQVnUy",
  email = "", // Add customerData prop with default empty objec
  size = "large",
}) => {
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [stripeError, setStripeError] = useState(null);

  // Step 1: Check customer status with payments/stripe-customer
  const { data: stripeCustomerData, isLoading: isStripeCustomerLoading } = useQuery({
    queryKey: ["stripeCustomer"],
    queryFn: async () => {
      const response = await getData({}, "payments/stripe-customer");
      console.log("Stripe customer data:", response.data.data);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  // Mutation to fetch management URL when button is clicked
  const fetchManagementUrlMutation = useMutation({
    mutationFn: async () => {
      const response = await getData({}, "payments/manage-subscription");
      return response.data.data;
    },
    onSuccess: (data) => {
      console.log("Manage subscription data:", data);
      if (data.manageSubscriptionUrl) {
        // Redirect to the management URL
        window.location.href = data.manageSubscriptionUrl;
      }
    },
  });

  // Handle manage subscription button click
  const handleManageSubscription = () => {
    fetchManagementUrlMutation.mutate();
  };

  useEffect(() => {
    // Load Stripe.js script
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/pricing-table.js";
    script.async = true;
    script.onload = () => {
      setStripeLoaded(true);
      // Inject custom styles after Stripe loads
      injectCustomStyles();
    };
    script.onerror = () => setStripeError("Failed to load Stripe.js");
    document.body.appendChild(script);

    return () => {
      // Clean up script when component unmounts
      document.body.removeChild(script);
    };
  }, []);

  const injectCustomStyles = () => {
    const style = document.createElement("style");
    style.textContent = `
      stripe-pricing-table {
        --stripe-pricing-table-background: #ffffff;
        --stripe-pricing-table-border-radius: 12px;
        --stripe-pricing-table-border-color: #e5e7eb;
        --stripe-pricing-table-border-width: 1px;
        --stripe-pricing-table-box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        
        /* Header styles */
        --stripe-pricing-table-header-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        --stripe-pricing-table-header-font-size: 24px;
        --stripe-pricing-table-header-font-weight: 600;
        --stripe-pricing-table-header-color: #111827;
        
        /* Price styles */
        --stripe-pricing-table-price-font-size: 48px;
        --stripe-pricing-table-price-font-weight: 700;
        --stripe-pricing-table-price-color: #111827;
        
        /* Feature list styles */
        --stripe-pricing-table-feature-font-size: 14px;
        --stripe-pricing-table-feature-color: #4b5563;
        --stripe-pricing-table-feature-check-color: #10b981;
        
        /* Button styles */
        --stripe-pricing-table-button-background: #2563eb;
        --stripe-pricing-table-button-color: #ffffff;
        --stripe-pricing-table-button-border-radius: 8px;
        --stripe-pricing-table-button-font-weight: 500;
        --stripe-pricing-table-button-hover-background: #1d4ed8;
        
        /* Selected plan styles */
        --stripe-pricing-table-selected-border-color: #2563eb;
        --stripe-pricing-table-selected-border-width: 2px;
        --stripe-pricing-table-selected-box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
      }
    `;
    document.head.appendChild(style);
  };

  // Handle plan selection

  if (stripeError) {
    return (
      <div className="w-full flex justify-center p-5 items-center flex-col">
        <div className="text-2xl font-semibold text-state-error">Error loading Stripe pricing table</div>
        <div className="text-base text-text-sub mt-2">{stripeError}</div>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-primary-base text-text-white rounded hover:bg-primary-dark transition-colors">
          Retry
        </button>
      </div>
    );
  }

  if (!stripeLoaded || isStripeCustomerLoading) {
    return size === "large" ? (
      <div className="w-full">
        <div className="w-full flex justify-center p-5 items-center flex-col">
          <div className="h-8 w-64 bg-bg-soft rounded animate-pulse mb-3" />
          <div className="h-5 w-96 bg-bg-soft rounded animate-pulse" />
        </div>
        <div className="flex justify-center gap-5 px-10 py-4 md:flex-col md:items-center">
          <ShimmerCard size="large" />
          <ShimmerCard size="large" />
          <ShimmerCard size="large" />
        </div>
      </div>
    ) : (
      <div className="w-full">
        <div className="w-full flex justify-center flex-col">
          <div className="h-8 w-full mt-5 bg-bg-soft rounded animate-pulse mb-3" />
          <div className="h-5 w-full bg-bg-soft rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // Determine what to show based on subscription status
  const showPricingTable = stripeCustomerData?.showPricingTable || false;
  // const subscriptionStatus = stripeCustomerData?.subscriptionStatus || "new";
  const heading = stripeCustomerData?.heading || "Choose Your Plan";
  const description = stripeCustomerData?.description || "Select a subscription plan that fits your needs";
  const isTrial = stripeCustomerData?.isTrial || false;
  const trialEndsOn = stripeCustomerData?.trialEndsOn;
  const activeExpiresOn = stripeCustomerData?.activeExpiresOn;
  const cancelledOn = stripeCustomerData?.cancelledOn;
  const franchiseName = stripeCustomerData?.franchiseName || "";
  const userName = stripeCustomerData?.user || "";
  const userEmail = stripeCustomerData?.userEmail || email;

  // Show pricing table for large size
  if (showPricingTable && size === "large") {
    return (
      <PricingTableContainer>
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-text-main mb-2">{heading}</h1>
          <p className="text-sm text-text-sub">{description}</p>
        </div>
        <stripe-pricing-table
          pricing-table-id={pricingTableId}
          publishable-key={publishableKey}
          client-reference-id={stripeCustomerData?.id || "user_123"}
          customer-email={email || "customer@example.com"}
          customer-name={stripeCustomerData?.name || ""}
          customer-company={stripeCustomerData?.companyName || ""}
          customer-id={stripeCustomerData?.customerId || ""}
        />
      </PricingTableContainer>
    );
  }

  // Show Subscribe Now for small size when pricing table is true
  if (showPricingTable && size === "small") {
    return (
      <ElementContainer className="column">
        <PageHeader title="Subscription Details"></PageHeader>
        <DataView title="Status" value="No Active Plan" icon={<AlertCircle />} />
        <Button icon="proceed" align="right" value="Subscribe Now" ClickEvent={() => (window.location.href = "/purchase-plan")} />
      </ElementContainer>
    );
  }

  // Show subscription management for both sizes when pricing table is false
  if (!showPricingTable) {
    if (size === "large") {
      return (
        <PricingTableContainer>
          <div className="w-full max-w-4xl mx-auto">
            {/* Subscription Status Card */}
            <div className="bg-bg-white rounded-lg shadow-sm border border-stroke-soft/10 overflow-hidden">
              {/* Header with status indicator */}
              <div className={`p-6 ${isTrial ? "bg-state-information/5 border-b border-state-information/10" : "bg-state-success/5 border-b border-state-success/10"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {isTrial ? (
                      <div className="bg-state-information/10 p-2 rounded-full mr-4">
                        <AlertCircle className="h-6 w-6 text-state-information" />
                      </div>
                    ) : (
                      <div className="bg-state-success/10 p-2 rounded-full mr-4">
                        <CheckCircle className="h-6 w-6 text-state-success" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-semibold text-text-main">{heading}</h2>
                      <p className="text-text-sub mt-1 text-sm">{description}</p>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <button
                      onClick={handleManageSubscription}
                      disabled={fetchManagementUrlMutation.isPending}
                      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-text-white bg-primary-base hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-base/20 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {fetchManagementUrlMutation.isPending ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Manage Subscription
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Subscription Details */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* User Information */}
                  <div className="bg-bg-soft/5 rounded-lg p-4 border border-stroke-soft/10">
                    <h3 className="text-base font-medium text-text-main mb-4 flex items-center">
                      <User className="h-4 w-4 mr-2 text-icon-sub" />
                      Account Information
                    </h3>
                    <div className="space-y-3">
                      {franchiseName && (
                        <div className="flex items-start">
                          <Building className="h-4 w-4 text-icon-sub mr-3 mt-0.5" />
                          <div>
                            <p className="text-xs text-text-sub">Franchise</p>
                            <p className="text-sm font-medium text-text-main">{franchiseName}</p>
                          </div>
                        </div>
                      )}
                      {userName && (
                        <div className="flex items-start">
                          <User className="h-4 w-4 text-icon-sub mr-3 mt-0.5" />
                          <div>
                            <p className="text-xs text-text-sub">Name</p>
                            <p className="text-sm font-medium text-text-main">{userName}</p>
                          </div>
                        </div>
                      )}
                      {userEmail && (
                        <div className="flex items-start">
                          <svg className="h-4 w-4 text-icon-sub mr-3 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <div>
                            <p className="text-xs text-text-sub">Email</p>
                            <p className="text-sm font-medium text-text-main">{userEmail}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subscription Information */}
                  <div className="bg-bg-soft/5 rounded-lg p-4 border border-stroke-soft/10">
                    <h3 className="text-base font-medium text-text-main mb-4 flex items-center">
                      <CreditCard className="h-4 w-4 mr-2 text-icon-sub" />
                      Subscription Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div
                          className={`h-4 w-4 rounded-full mr-3 mt-0.5 flex items-center justify-center ${isTrial ? "bg-state-information/10 text-state-information" : "bg-state-success/10 text-state-success"}`}
                        >
                          {isTrial ? <AlertCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                        </div>
                        <div>
                          <p className="text-xs text-text-sub">Status</p>
                          <p className="text-sm font-medium text-text-main">{isTrial ? "Trial" : "Active"}</p>
                        </div>
                      </div>

                      {isTrial && trialEndsOn && (
                        <div className="flex items-start">
                          <Calendar className="h-4 w-4 text-icon-sub mr-3 mt-0.5" />
                          <div>
                            <p className="text-xs text-text-sub">Trial Ends</p>
                            <p className="text-sm font-medium text-text-main">{new Date(trialEndsOn).toLocaleDateString()}</p>
                          </div>
                        </div>
                      )}

                      {activeExpiresOn && !isTrial && (
                        <div className="flex items-start">
                          <Calendar className="h-4 w-4 text-icon-sub mr-3 mt-0.5" />
                          <div>
                            <p className="text-xs text-text-sub">Renewal Date</p>
                            <p className="text-sm font-medium text-text-main">{new Date(activeExpiresOn).toLocaleDateString()}</p>
                          </div>
                        </div>
                      )}

                      {cancelledOn && (
                        <div className="flex items-start">
                          <Calendar className="h-4 w-4 text-icon-sub mr-3 mt-0.5" />
                          <div>
                            <p className="text-xs text-text-sub">Cancelled On</p>
                            <p className="text-sm font-medium text-text-main">{new Date(cancelledOn).toLocaleDateString()}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile Manage Subscription Button */}
                <div className="mt-6 md:hidden">
                  <button
                    onClick={handleManageSubscription}
                    disabled={fetchManagementUrlMutation.isPending}
                    className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-text-white bg-primary-base hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-base/20 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {fetchManagementUrlMutation.isPending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Manage Subscription
                      </>
                    )}
                  </button>
                </div>

                {fetchManagementUrlMutation.isError && (
                  <div className="mt-4 p-3 bg-state-error/5 text-state-error rounded-lg flex items-start border border-state-error/10">
                    <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Failed to load subscription management</p>
                      <p className="text-xs mt-1">Please try again or contact support.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </PricingTableContainer>
      );
    }

    // Small size subscription management
    return (
      <ElementContainer className="column">
        <PageHeader title="Subscription Details"></PageHeader>
        <DataView title="Status" value={isTrial ? "Trial" : "Active"} icon={<CheckCircle />} />
        <DataView
          title="Start Date"
          value={
            stripeCustomerData?.startDate
              ? new Date(stripeCustomerData.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
              : new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
          }
          icon={<Calendar />}
        />
        <DataView
          title="Renewal Date"
          value={
            activeExpiresOn
              ? new Date(activeExpiresOn).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
              : isTrial
                ? new Date(trialEndsOn).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                : "Not Available"
          }
          icon={<Calendar />}
        />
        <DataView title="Billing Cycle" value={stripeCustomerData?.billingCycle || "Monthly"} icon={<RefreshCw />} />
        <Button icon="swap" align="right" value="Manage Subscription" ClickEvent={handleManageSubscription} />
      </ElementContainer>
    );
  }

  // Default fallback (should not reach here)
  return null;
};

const PricingTableContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;

  stripe-pricing-table {
    width: 100%;
    min-height: 600px;
    --stripe-pricing-table-background: var(--bg-white);
    --stripe-pricing-table-border-radius: 8px;
    --stripe-pricing-table-border-color: var(--stroke-soft);
    --stripe-pricing-table-border-width: 1px;
    --stripe-pricing-table-box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

    /* Header styles */
    --stripe-pricing-table-header-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    --stripe-pricing-table-header-font-size: 20px;
    --stripe-pricing-table-header-font-weight: 600;
    --stripe-pricing-table-header-color: var(--text-main);

    /* Price styles */
    --stripe-pricing-table-price-font-size: 36px;
    --stripe-pricing-table-price-font-weight: 600;
    --stripe-pricing-table-price-color: var(--text-main);

    /* Feature list styles */
    --stripe-pricing-table-feature-font-size: 14px;
    --stripe-pricing-table-feature-color: var(--text-sub);
    --stripe-pricing-table-feature-check-color: var(--state-success);

    /* Button styles */
    --stripe-pricing-table-button-background: var(--primary-base);
    --stripe-pricing-table-button-color: var(--text-white);
    --stripe-pricing-table-button-border-radius: 6px;
    --stripe-pricing-table-button-font-weight: 500;
    --stripe-pricing-table-button-hover-background: var(--primary-dark);

    /* Selected plan styles */
    --stripe-pricing-table-selected-border-color: var(--primary-base);
    --stripe-pricing-table-selected-border-width: 2px;
    --stripe-pricing-table-selected-box-shadow: 0 0 0 2px var(--primary-light);
  }
`;

export default PricingTable;
