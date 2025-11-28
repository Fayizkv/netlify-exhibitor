import React from "react";
import { CloseButton } from "./styles";
import { GetIcon } from "../../../icons";
import CustomTooltip from "../tooltip";

function InfoBoxItem({ info, customClass = "" }) {
  // Check if info has content - handle both JSX and string
  const hasContent = React.isValidElement(info) || (typeof info === "string" && info?.length > 0);

  // Don't render if no content
  if (!hasContent) {
    return null;
  }

  return (
    <CloseButton className={customClass}>
      <CustomTooltip content={info} variant="default" size="large" place="right">
        <GetIcon icon="info" />
      </CustomTooltip>
    </CloseButton>
  );
}

export default InfoBoxItem;
