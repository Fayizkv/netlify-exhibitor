import { Container } from "../../../../../core/elements/styles";
import ListTable from "../../../../../core/list/list";

const ContentPage = ({ selectedElements, props, form }) => {
  console.log({ form });
  return (
    <Container className="noshadow">
      {selectedElements && selectedElements?.title !== "Social Media" && selectedElements?.title !== "About" && selectedElements?.title !== undefined && (
        <ListTable
          // popupMode="medium"
          // popupMenu={"vertical-menu"}
          parentReference={props?.openData?.data?._id}
          // actions={actions}
          api={form.api}
          itemTitle={{
            name: form.itemTitle,
            type: "text",
            collection: "",
          }}
          shortName={form.shortName}
          formMode={`double`}
          attributes={form.attributes}
          {...props}
        />
      )}
      {selectedElements && selectedElements?.title === "About" && <></>}
    </Container>
  );
};
export default ContentPage;
