import React from "react";
import ListItems from "./items";
import ListItem from "./item";
const ListTable = (props) => {
  const { isSlug = false } = props;
  return isSlug ? <ListItem {...props} /> : <ListItems {...props} />;
};
export default ListTable;
