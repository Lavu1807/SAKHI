import React from "react";
import PropTypes from "prop-types";

export default function PageFrame({ children, className = "page-shell" }) {
  return <main className={className}>{children}</main>;
}

PageFrame.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
