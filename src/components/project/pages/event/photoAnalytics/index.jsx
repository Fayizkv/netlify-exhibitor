import React from "react";
import withLayout from "../../../../core/layout";
import { ElementContainer } from "../../../../core/elements";
import { DashBox } from "../../../../core/dashboard/dashbox";
import HighlightCards from "../../../../core/dashboard/highlitecard";

const PhotoAnalytics = (props) => {
  const eventId = props?.openData?.data?._id;

  return (
    <ElementContainer className="dashboard">
      <DashBox key={1} className="full noborder">
        <HighlightCards dataType="API" parents={{ event: eventId }} dataItem="dashboard/insta" title="Photo Usage Analytics" description="See your Photo Usage Analytics here."></HighlightCards>
      </DashBox>
    </ElementContainer>
  );
};

export default withLayout(PhotoAnalytics);
