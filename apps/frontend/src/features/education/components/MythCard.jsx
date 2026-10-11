import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { staggerItem } from "../../../shared/utils/motionPresets";

export default function MythCard({ item, userFeedback, onFeedback }) {
  return (
    <motion.article className="eedu-card" variants={staggerItem}>
      <div className="eedu-card-top">
        <span className="eedu-category-badge">{item.category}</span>
        <p className="eedu-myth-label">Myth</p>
        <h3 className="eedu-myth-title">{item.myth}</h3>

        <div className="eedu-fact-box">
          <div className="eedu-fact-head">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Fact</span>
          </div>
          <p className="eedu-fact-text">{item.fact}</p>
        </div>

        <p className="eedu-source-text">
          Verified source · {item.source || "ACOG"}
        </p>
      </div>

      <div className="eedu-card-bottom">
        <div className="eedu-divider" />
        <div className="eedu-feedback-row">
          <span className="eedu-feedback-prompt">Was this helpful?</span>
          <div className="eedu-feedback-btns">
            <button
              type="button"
              className={`eedu-fb-btn ${userFeedback === "yes" ? "selected" : ""}`}
              onClick={() => onFeedback(item.id, "yes")}
              title="Helpful"
              aria-label="Helpful"
            >
              👍
            </button>
            <button
              type="button"
              className={`eedu-fb-btn ${userFeedback === "no" ? "selected" : ""}`}
              onClick={() => onFeedback(item.id, "no")}
              title="Not helpful"
              aria-label="Not helpful"
            >
              👎
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

MythCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    category: PropTypes.string.isRequired,
    myth: PropTypes.string.isRequired,
    fact: PropTypes.string.isRequired,
    source: PropTypes.string,
  }).isRequired,
  userFeedback: PropTypes.string,
  onFeedback: PropTypes.func.isRequired,
};
