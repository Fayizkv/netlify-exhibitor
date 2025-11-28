import { useState, useEffect } from "react";
import { useUser } from "../../../../contexts/UserContext";
import { RowContainer } from "../../../styles/containers/styles";
import { GetIcon } from "../../../../icons";
import ListTable from "../../../core/list/list";
import { noimage } from "../../../../images";
import { Button } from "../../../core/elements";

// Utility function for logging
const logAction = (action, details = {}) => {
  console.log(`[Product Catalog] ${action}:`, {
    timestamp: new Date().toISOString(),
    ...details,
  });
};

export default function ProductCatalog(props) {
  const { exhibitorData } = props;
  const user = useUser();

  const [currentExhibitorId, setCurrentExhibitorId] = useState(null);
  const [currentEventId, setCurrentEventId] = useState(null);

  // Get current exhibitor ID and event ID
  useEffect(() => {
    logAction("useEffect triggered for ID extraction", {
      props: props,
      user: user,
      exhibitorData: exhibitorData,
    });

    const getCurrentExhibitorId = () => {
      // First, try to get from props.user.user._id (from props structure)
      if (props?.user?.user?._id) {
        logAction("Retrieved exhibitor ID from props.user.user._id", { exhibitorId: props.user.user._id });
        return props.user.user._id;
      }

      // Try to get from props.user.userId
      if (props?.user?.userId) {
        logAction("Retrieved exhibitor ID from props.user.userId", { exhibitorId: props.user.userId });
        return props.user.userId;
      }

      // Try to get from exhibitorData (the exhibitor we're managing)
      if (exhibitorData?._id) {
        logAction("Retrieved exhibitor ID from exhibitorData._id", { exhibitorId: exhibitorData._id });
        return exhibitorData._id;
      }

      // Try to get from user context as fallback
      if (user?._id) {
        logAction("Retrieved exhibitor ID from user context (fallback)", { exhibitorId: user._id });
        return user._id;
      }

      // Try to get from localStorage as last fallback
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.userId) {
            logAction("Retrieved exhibitor ID from localStorage (fallback)", { exhibitorId: userData.userId });
            return userData.userId;
          }
        } catch (error) {
          logAction("Error parsing user data from localStorage", { error: error.message });
        }
      }

      logAction("No valid exhibitor ID found", { props: props, user: user, exhibitorData: exhibitorData });
      return null;
    };

    const getCurrentEventId = () => {
      logAction("Getting current event ID", {
        props: props,
        exhibitorData: exhibitorData,
        exhibitorDataEvent: exhibitorData?.event,
      });

      // First, try to get from props.user.user.event._id (from props structure)
      if (props?.user?.user?.event?._id) {
        logAction("Retrieved event ID from props.user.user.event._id", { eventId: props.user.user.event._id });
        return props.user.user.event._id;
      }

      // Try to get event ID from exhibitorData.event._id (populated event object)
      if (exhibitorData?.event?._id) {
        logAction("Retrieved event ID from exhibitorData.event._id", { eventId: exhibitorData.event._id });
        return exhibitorData.event._id;
      }

      // Try to get from exhibitorData.event (if it's just the ID string)
      if (exhibitorData?.event && typeof exhibitorData.event === "string") {
        logAction("Retrieved event ID from exhibitorData.event (string)", { eventId: exhibitorData.event });
        return exhibitorData.event;
      }

      logAction("No valid event ID found", { props: props, exhibitorData: exhibitorData });
      return null;
    };

    const exhibitorId = getCurrentExhibitorId();
    const eventId = getCurrentEventId();

    logAction("Setting IDs", { exhibitorId: exhibitorId, eventId: eventId });

    setCurrentExhibitorId(exhibitorId);
    setCurrentEventId(eventId);
  }, [props, user, exhibitorData]);

  // Custom render function for product image at the top - matches design with 16:9 aspect ratio
  // Handles both single image (string) and multiple images (array)
  const renderProductImage = (value, data, attribute) => {
    // Get product image - prefer productImage, fallback to productLogo
    const productImage = data?.productImage || data?.productLogo || "";
    
    // Handle multiple images (array) - use first image for card display
    let imageToDisplay = productImage;
    if (Array.isArray(productImage) && productImage.length > 0) {
      imageToDisplay = productImage[0];
    }
    
    // Build image URL - handle both cases: with and without CDN prefix
    let imageUrl = noimage;
    if (imageToDisplay) {
      if (imageToDisplay.startsWith("http://") || imageToDisplay.startsWith("https://") || imageToDisplay.startsWith("blob:")) {
        // Already a full URL
        imageUrl = imageToDisplay;
      } else if (imageToDisplay.startsWith("/")) {
        // Path starting with /, add CDN
        imageUrl = `${import.meta.env.VITE_CDN}${imageToDisplay}`;
      } else {
        // Relative path, add CDN
        imageUrl = `${import.meta.env.VITE_CDN}${imageToDisplay}`;
      }
    }
    
    return (
      <div className="w-full product-card-image-wrapper">
        <div className="relative aspect-[16/10] overflow-hidden product-card-image-container">
          <img
            src={imageUrl}
            alt="Product"
            className="w-full h-full object-cover product-card-image"
            onError={(e) => {
              e.target.src = noimage;
            }}
          />
        </div>
      </div>
    );
  };

  // Custom render function for product name - styled as heading
  const renderProductName = (value, data, attribute) => {
    return (
      <div className="flex-1 min-w-0">
        {/* <h2 className="text-2xl font-bold text-text-main mb-3">{value || "PRODUCT"}</h2> */}
        <span className="font-semibold text-text-main">{value || "Product"}</span>
      </div>
    );
  };

  // Custom render function for product link - styled as external link with icon
  const renderProductLink = (value, data, attribute) => {
    const productLink = value || data?.productLink || "";
    
    if (!productLink) {
      return null;
    }
    
    return (
      <div className="product-card-link-wrapper w-full">
        <a 
          href={productLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-text-sub hover:text-text-main transition-colors group"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-sm font-medium">View Product</span>
          <GetIcon 
            icon="link" 
            className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" 
          />
        </a>
      </div>
    );
  };

  // Custom render function for brochure download button - full width button matching design
  const renderBrochure = (value, data, attribute) => {
    // Get brochure URL from data
    const brochureUrl = data?.BrochureUrl || value || "";
    
    // Handle download
    const handleDownload = (e) => {
      e.stopPropagation();
      if (!brochureUrl) return;
      
      // Build full URL
      let fullUrl = "";
      if (brochureUrl.startsWith("http://") || brochureUrl.startsWith("https://") || brochureUrl.startsWith("blob:")) {
        fullUrl = brochureUrl;
      } else {
        fullUrl = `${import.meta.env.VITE_CDN}${brochureUrl}`;
      }
      
      // Create download link
      const link = document.createElement("a");
      link.href = fullUrl;
      link.target = "_blank";
      link.download = brochureUrl.split("/").pop() || "brochure";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    
    if (!brochureUrl) {
      return null;
    }
    
    return (
      <div className="product-card-brochure-button w-full">
        <Button
          value="Download Brochure"
          icon="download"
          type="secondary"
          align="left"
          ClickEvent={handleDownload}
        />
      </div>
    );
  };

  // Define attributes for ListTable
  const attributes = [
    {
      type: "hidden",
      name: "productImageDisplay",
      label: "",
      required: false,
      tag: true, // Display in list cards
      view: true, // Keep view true; we'll hide in popup via CSS
      add: false,
      update: false,
      customClass: "full",
      itemLabel: "", // Hide label in triple column view
      render: renderProductImage, // Custom render to show image at top
    },
    {
      type: "text",
      name: "productName",
      label: "Product Name",
      required: true,
      tag: true, // Must be true to display in list view
      view: true,
      add: true,
      update: true,
      customClass: "full",
      render: renderProductName, // Custom render for product name only
    },
    {
      type: "textarea",
      name: "productDescription",
      label: "Description",
      required: false,
      tag: true,
      view: true,
      add: true,
      update: true,
      customClass: "full",
    },
    {
      type: "text",
      name: "productLink",
      label: "Product Link",
      placeholder: "Enter product URL (e.g., https://example.com/product)",
      validation: "url",
      required: false,
      tag: true,
      view: true,
      add: true,
      update: true,
      customClass: "full",
      render: renderProductLink, // Custom render to show external link with icon
    },
    // {
    //   type: "image",
    //   name: "productLogo",
    //   label: "Product Logo",
    //   required: false,
    //   tag: false, // Don't display in card view, only in form
    //   view: true,
    //   add: true,
    //   update: true,
    //   customClass: "half",
    //   accept: "image/*",
    //   maxSize: 5 * 1024 * 1024, // 5MB
    //   footnote: "PNG, JPG, GIF up to 5MB",
    // },
    {
      type: "image",
      name: "productImage",
      label: "Product Images",
      required: true,
      tag: false, // Don't display in card view, only in form (image shown via productImageDisplay)
      view: true,
      add: true,
      update: true,
      customClass: "full",
      accept: "image/*",
      maxSize: 5 * 1024 * 1024, // 5MB per image
      multiple: true, // Enable multiple image upload
      maxFiles: 8, // Maximum number of images allowed
      footnote: "PNG, JPG, GIF up to 5MB each. Upload up to 8 images.",
    },
    {
      type: "file",
      name: "BrochureUrl",
      label: "Brochure",
      required: true,
      tag: true,
      view: true,
      add: true,
      update: true,
      customClass: "full",
      accept: "application/pdf",
      allowedFileTypes: ["application/pdf"],
      maxSize: 10 * 1024 * 1024, // 10MB
      footnote: "PDF up to 10MB",
      render: renderBrochure, // Custom render to show download button
    },
  ];

  // Show loading or error state if no exhibitor ID
  if (!currentExhibitorId) {
    return (
      <RowContainer className="data-layout">
        <div className="flex flex-col w-full h-full items-center justify-center">
          <div className="text-center">
            <GetIcon icon="package" className="w-16 h-16 text-text-disabled mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text-main mb-2">Unable to load product catalog</h3>
            <p className="text-text-sub">Please ensure you are logged in as an exhibitor and have selected an event.</p>
          </div>
        </div>
      </RowContainer>
    );
  }

  // Build preFilter for ListTable
  const preFilter = {
    exhibitor: currentExhibitorId,
    ...(currentEventId && { event: currentEventId }),
    skip: 0,
    limit: 100,
  };

  // Build parents for ListTable
  const parents = {
    exhibitor: currentExhibitorId,
    ...(currentEventId && { event: currentEventId }),
  };

  return (
    <RowContainer className="data-layout">
      {/* CSS to style product cards to match the provided inspiration */}
      <style>{`
        /* Hide refresh and search buttons in product catalogue page */
        .data-layout .flex.left > button:has(svg[viewBox="0 0 512 512"]),
        .data-layout .ButtonPanel .flex.left > button:has(svg[viewBox="0 0 512 512"]) {
          display: none !important;
        }
        .data-layout .flex.left > div:has(input[name="search-1"]),
        .data-layout .flex.left > div:has(> div > svg[data-icon="search"]) {
          display: none !important;
        }
        .data-layout input[type="text"][name="search-1"][placeholder="Search"] {
          display: none !important;
        }
        
        /* Keep header container for the dot menu while visually hiding the default title */
        .triple > div > div > div:first-child > div:first-child {
          display: flex !important;
          justify-content: flex-end;
          align-items: flex-start;
          padding: 0.75rem 0.75rem 0;
          min-height: 32px;
        }
        .triple > div > div > div:first-child > div:first-child h4 {
          width: 0;
          height: 0;
          opacity: 0;
          margin: 0;
          pointer-events: none;
        }
        .triple .dotmenu {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          z-index: 2;
        }
        .triple .dotmenu button {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.18);
          backdrop-filter: blur(8px);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .triple .dotmenu button:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.22);
        }
        
        /* Hide image in popup view */
        .popup-data .product-card-image-wrapper {
          display: none !important;
        }
        
        /* Card shell styling */
        .triple > div {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
        }
        
        /* Image treatment - align to left and emulate gradient overlay */
        .product-card-image-wrapper {
          margin: 0;
          padding: 0;
          display: block;
        }
        .product-card-image-container {
          width: 100% !important;
          margin: 0;
          border-radius: 0;
          box-shadow: none;
          background: transparent;
          position: relative;
        }
        .product-card-image {
          border-radius: 0;
          transform-origin: center;
        }
        .product-card-image-container::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(15,23,42,0) 30%, rgba(15,23,42,0.6) 100%);
          pointer-events: none;
        }
        
        /* Content area */
        .triple > div > div > div:nth-child(2) {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        /* Product name styling - text-2xl, font-bold, mb-3 */
        .triple h2 {
          margin: 0 0 0.75rem 0;
          padding: 0;
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1.2;
          color: #0f172a;
        }
        
        /* Description text styling - leading-relaxed, slate-600 */
        .triple .text-text-sub,
        .triple .data-item {
          line-height: 1.625;
          color: #475569;
          font-size: 0.875rem;
        }
        
        /* Product link wrapper - inline-flex with gap, aligned with other content */
        .product-card-link-wrapper {
          margin-top: 0;
          width: 100%;
          display: flex;
          align-items: flex-start;
        }
        .product-card-link-wrapper a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.875rem 1.25rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.95rem;
          background: transparent;
          color: #4c1d95;
          border: 1px solid rgba(76, 29, 149, 0.2);
          box-shadow: none;
          transition: border-color 0.2s ease, color 0.2s ease;
        }
        .product-card-link-wrapper a:hover {
          text-decoration: none;
          border-color: rgba(76, 29, 149, 0.45);
          color: #5b21b6;
        }
        
        /* Brochure button - secondary styling */
        .product-card-brochure-button {
          width: 100%;
          margin-top: 0;
        }
        .product-card-brochure-button .custom {
          width: 100%;
          justify-content: center;
          padding: 0.875rem 1.25rem;
          border-radius: 12px;
          font-weight: 600;
          border: 1px solid rgba(148, 163, 184, 0.6);
          background: transparent;
          color: #475569;
          transition: border-color 0.2s ease, color 0.2s ease;
        }
        .product-card-brochure-button .custom:hover {
          border-color: rgba(71, 85, 105, 0.9);
          color: #0f172a;
        }
        
        /* Hide labels in triple column view for cleaner look */
        .triple .custom .title {
          display: none;
        }
        
        /* Ensure proper spacing between card elements */
        .triple > div > div > div:nth-child(2) > div {
          margin-bottom: 0;
        }
        
        /* Style the description area specifically */
        .triple > div > div > div:nth-child(2) > div:nth-child(3) {
          margin-bottom: 0;
        }
      `}</style>
      {/* ListTable for Products */}
      <ListTable
        key={`products-${currentExhibitorId}-${currentEventId}`}
        api="product"
        itemTitle={{
          name: "productName",
          type: "text",
        }}
        shortName="Product Catalogue"
        formMode="single"
        preFilter={preFilter}
        parents={parents}
        viewMode="list"
        displayColumn="triple"
        attributes={attributes}
        showSearch={false}
        icon=""
        {...props}
        addPrivilege={true}
        addLabel={{ label: "Add Product", icon: "add" }}
        delPrivilege={true}
        updatePrivilege={true}
        dotMenu={true}
        showEditInDotMenu={true}
        showDeleteInDotMenu={true}
      />
    </RowContainer>
  );
}
