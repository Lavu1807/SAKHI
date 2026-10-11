import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { staggerParent } from "../../../shared/utils/motionPresets";
import MythCard from "./MythCard";

export default function EducationCards({ myths, feedback, onFeedback }) {
  if (!myths.length) {
    return (
      <div className="eedu-empty" style={{ textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
        <p>No education topics found matching your search.</p>
      </div>
    );
  }

  return (
    <motion.div className="eedu-cards-grid" variants={staggerParent}>
      {myths.map((item) => (
        <MythCard
          key={item.id}
          item={item}
          userFeedback={feedback[item.id]}
          onFeedback={onFeedback}
        />
      ))}
    </motion.div>
  );
}

EducationCards.propTypes = {
  myths: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      category: PropTypes.string.isRequired,
      myth: PropTypes.string.isRequired,
      fact: PropTypes.string.isRequired,
      source: PropTypes.string,
    }),
  ).isRequired,
  feedback: PropTypes.objectOf(PropTypes.string).isRequired,
  onFeedback: PropTypes.func.isRequired,
};
