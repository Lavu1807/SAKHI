import React from "react";
import { motion } from "framer-motion";
import PageFrame from "../../shared/components/PageFrame";
import { staggerItem, staggerParent } from "../../shared/utils/motionPresets";
import { useEducation } from "./hooks/useEducation";
import EducationToolbar from "./components/EducationToolbar";
import EducationCards from "./components/EducationCards";
import EducationQuiz from "./components/EducationQuiz";

export default function Education() {
  const {
    mode,
    setMode,
    searchQuery,
    setSearchQuery,
    filteredMyths,
    feedback,
    handleFeedback,
    quizIndex,
    currentQuiz,
    selectedAnswer,
    answered,
    isCorrect,
    handleQuizAnswer,
    handleNextQuestion,
  } = useEducation();

  return (
    <PageFrame>
      <motion.div
        className="epage eedu-page"
        variants={staggerParent}
        initial="hidden"
        animate="show"
      >
        {/* Header Section */}
        <motion.p className="epage-label" variants={staggerItem}>
          EDUCATION
        </motion.p>
        <motion.h1 className="epage-title" variants={staggerItem}>
          Learn without the noise
        </motion.h1>

        {/* Toolbar & Filter Controls */}
        <EducationToolbar
          mode={mode}
          onModeChange={setMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Cards Mode */}
        {mode === "cards" && (
          <EducationCards
            myths={filteredMyths}
            feedback={feedback}
            onFeedback={handleFeedback}
          />
        )}

        {/* Quiz Mode */}
        {mode === "quiz" && (
          <EducationQuiz
            quizIndex={quizIndex}
            currentQuiz={currentQuiz}
            selectedAnswer={selectedAnswer}
            answered={answered}
            isCorrect={isCorrect}
            onAnswer={handleQuizAnswer}
            onNextQuestion={handleNextQuestion}
          />
        )}
      </motion.div>
    </PageFrame>
  );
}
