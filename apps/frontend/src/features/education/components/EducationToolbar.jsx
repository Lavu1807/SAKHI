import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { staggerItem } from "../../../shared/utils/motionPresets";

export default function EducationToolbar({
  mode,
  onModeChange,
  searchQuery,
  onSearchChange,
}) {
  return (
    <motion.div className="eedu-controls-row" variants={staggerItem}>
      <div className="eedu-toggle-group">
        <button
          type="button"
          className={`eedu-toggle-btn ${mode === "cards" ? "active" : ""}`}
          onClick={() => onModeChange("cards")}
        >
          Cards
        </button>
        <button
          type="button"
          className={`eedu-toggle-btn ${mode === "quiz" ? "active" : ""}`}
          onClick={() => onModeChange("quiz")}
        >
          Quiz mode
        </button>
      </div>

      <div className="eedu-search-wrap">
        <svg
          className="eedu-search-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="eedu-search-input"
          placeholder="Search a topic"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </motion.div>
  );
}

EducationToolbar.propTypes = {
  mode: PropTypes.oneOf(["cards", "quiz"]).isRequired,
  onModeChange: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
};
