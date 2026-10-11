import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { staggerItem } from "../../../shared/utils/motionPresets";

export default function EducationQuiz({
  quizIndex,
  currentQuiz,
  selectedAnswer,
  answered,
  isCorrect,
  onAnswer,
  onNextQuestion,
}) {
  if (!currentQuiz) return null;

  return (
    <motion.div className="eedu-quiz-container" variants={staggerItem}>
      <div className="eedu-quiz-card">
        <p className="eedu-quiz-sublabel">
          MYTH OR FACT · QUESTION {quizIndex + 1}
        </p>
        <h2 className="eedu-quiz-question">{currentQuiz.statement}</h2>

        <div className="eedu-quiz-actions">
          <button
            type="button"
            className={`eedu-quiz-btn-myth ${selectedAnswer === "Myth" ? "picked" : ""}`}
            onClick={() => onAnswer("Myth")}
            disabled={answered}
          >
            Myth ❌
          </button>
          <button
            type="button"
            className={`eedu-quiz-btn-fact ${selectedAnswer === "Fact" ? "picked" : ""}`}
            onClick={() => onAnswer("Fact")}
            disabled={answered}
          >
            Fact ✅
          </button>
        </div>

        {answered && (
          <div className={`eedu-quiz-result ${isCorrect ? "correct" : "incorrect"}`}>
            <div className="eedu-result-badge">
              {isCorrect ? "🎉 Correct!" : "💡 Not quite."}
            </div>
            <p className="eedu-result-explanation">
              {currentQuiz.correctAnswer === "Myth"
                ? `This statement is a myth. ${currentQuiz.explanation}`
                : `This statement is a fact. ${currentQuiz.explanation}`}
            </p>
            <p className="eedu-result-source">
              Verified source · {currentQuiz.source}
            </p>
            <button
              type="button"
              className="eedu-quiz-next-btn"
              onClick={onNextQuestion}
            >
              Next question →
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

EducationQuiz.propTypes = {
  quizIndex: PropTypes.number.isRequired,
  currentQuiz: PropTypes.shape({
    id: PropTypes.number,
    statement: PropTypes.string.isRequired,
    correctAnswer: PropTypes.string.isRequired,
    explanation: PropTypes.string.isRequired,
    source: PropTypes.string.isRequired,
  }),
  selectedAnswer: PropTypes.string.isRequired,
  answered: PropTypes.bool.isRequired,
  isCorrect: PropTypes.bool.isRequired,
  onAnswer: PropTypes.func.isRequired,
  onNextQuestion: PropTypes.func.isRequired,
};
