import { useEffect, useMemo, useState } from "react";
import { getMyths, sendMythFeedback } from "../../../shared/utils/api";
import { INITIAL_FEATURED_MYTHS, QUIZ_QUESTIONS } from "../data/educationConstants";

export function useEducation() {
  const [mode, setMode] = useState("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [myths, setMyths] = useState(INITIAL_FEATURED_MYTHS);
  const [feedback, setFeedback] = useState({});

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  // Fetch myths from API on mount
  useEffect(() => {
    let active = true;
    getMyths("All")
      .then((res) => {
        if (!active) return;
        if (Array.isArray(res?.myths) && res.myths.length > 0) {
          const featuredIds = new Set([101, 102, 103]);
          const other = res.myths.filter((m) => !featuredIds.has(m.id));
          setMyths([
            ...INITIAL_FEATURED_MYTHS.slice(0, 3),
            ...other,
          ]);
        }
      })
      .catch(() => {
        // Keeps initial featured myths
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredMyths = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return myths;
    return myths.filter(
      (m) =>
        m.myth.toLowerCase().includes(q) ||
        m.fact.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q),
    );
  }, [myths, searchQuery]);

  const handleFeedback = (id, type) => {
    setFeedback((prev) => ({
      ...prev,
      [id]: prev[id] === type ? null : type,
    }));
    sendMythFeedback({ mythId: id, feedbackType: type }).catch(() => {});
  };

  const currentQuiz = QUIZ_QUESTIONS[quizIndex % QUIZ_QUESTIONS.length];
  const isCorrect = selectedAnswer === currentQuiz.correctAnswer;

  const handleQuizAnswer = (answer) => {
    if (answered) return;
    setSelectedAnswer(answer);
    setAnswered(true);
    if (answer === currentQuiz.correctAnswer) {
      setScore((s) => s + 1);
    }
  };

  const handleNextQuestion = () => {
    setQuizIndex((idx) => (idx + 1) % QUIZ_QUESTIONS.length);
    setSelectedAnswer("");
    setAnswered(false);
  };

  return {
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
    score,
    handleQuizAnswer,
    handleNextQuestion,
  };
}
