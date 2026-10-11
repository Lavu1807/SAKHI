import React from "react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PageFrame from "../../shared/components/PageFrame";
import { staggerItem, staggerParent } from "../../shared/utils/motionPresets";
import { sendChatMessage } from "../../shared/utils/api";
import { getAuthToken, getAuthUser } from "../../shared/utils/auth";
import { getSymptomChatContext } from "../symptoms/symptomContext";
import { getMoodChatContext } from "../mood/moodContext";
import { readCycleData } from "../cycle/cycleUtils";

const QUICK_SUGGESTIONS = [
  "What should I eat during my follicular phase?",
  "Why do I get painful cramps?",
  "Is it safe to do intense workouts during my period?",
];
const BOT_ERROR_MESSAGE = "I am having trouble responding right now. Please try again in a moment.";

function createMessage(sender, text) {
  return {
    id: `${sender}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    sender,
    text,
  };
}

function createSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  );
}

export default function Chatbot() {
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const user = getAuthUser();
  const displayName = user?.name || "Maya";
  const userInitial = displayName.charAt(0).toUpperCase();

  const cycleData = readCycleData();
  const currentPhase = cycleData?.currentPhase || "Follicular";
  const moodCtx = getMoodChatContext();
  const latestMood = moodCtx?.latestMood || "Calm";
  const contextLabel = `Context active · ${currentPhase} · ${latestMood.charAt(0).toUpperCase() + latestMood.slice(1)}`;

  const [messages, setMessages] = useState([
    createMessage("bot", `Hi ${displayName}. I'm here to listen, educate, and support — no judgment, no pressure. What would feel helpful today?`),
  ]);
  const sessionIdRef = useRef(createSessionId());
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, [messages, isLoading]);

  function handleNewChat() {
    sessionIdRef.current = createSessionId();
    setMessages([
      createMessage("bot", `Hi ${displayName}. I'm here to listen, educate, and support — no judgment, no pressure. What would feel helpful today?`),
    ]);
    setInputMessage("");
  }

  async function submitMessage(rawMessage) {
    const trimmedMessage = String(rawMessage || "").trim();
    if (!trimmedMessage || isLoading) return;

    setMessages((prev) => [...prev, createMessage("user", trimmedMessage)]);
    setInputMessage("");
    setIsLoading(true);

    const symptomChatContext = getSymptomChatContext();
    const moodChatContext = getMoodChatContext();
    const userContext = { ...(symptomChatContext || {}), ...(moodChatContext || {}) };

    try {
      const response = await sendChatMessage(
        {
          message: trimmedMessage,
          sessionId: sessionIdRef.current,
          userContext: Object.keys(userContext).length > 0 ? userContext : undefined,
        },
        getAuthToken() || undefined,
      );

      const botReply =
        typeof response?.reply === "string" && response.reply.trim().length > 0
          ? response.reply.trim()
          : BOT_ERROR_MESSAGE;

      setMessages((prev) => [...prev, createMessage("bot", botReply)]);
    } catch {
      setMessages((prev) => [...prev, createMessage("bot", BOT_ERROR_MESSAGE)]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSend(event) {
    event.preventDefault();
    await submitMessage(inputMessage);
  }

  return (
    <PageFrame>
      <motion.div className="epage" variants={staggerParent} initial="hidden" animate="show">
        {/* Header */}
        <motion.p className="epage-label" variants={staggerItem}>SAKHI Companion</motion.p>
        <div className="echat-header-row">
          <motion.h1 className="epage-title" style={{ marginBottom: 0 }} variants={staggerItem}>
            A softer conversation
          </motion.h1>
          <motion.button
            type="button"
            className="echat-new-btn"
            onClick={handleNewChat}
            variants={staggerItem}
          >
            New chat
          </motion.button>
        </div>

        {/* Chat Container */}
        <motion.div className="echat-container" variants={staggerItem} style={{ marginTop: 24 }}>
          {/* Bot Header */}
          <div className="echat-bot-header">
            <div className="echat-bot-avatar">
              <SparkleIcon />
            </div>
            <div>
              <p className="echat-bot-name" style={{ margin: 0 }}>
                SAKHI Companion <span className="echat-online-dot" />
              </p>
              <p className="echat-bot-sub" style={{ margin: 0 }}>Here to listen, educate, and support</p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="echat-disclaimer">
            <CheckIcon />
            AI health companion — not a doctor. For emergencies, contact a healthcare provider.
          </div>

          {/* Context Pill */}
          <div className="echat-context-pill">{contextLabel}</div>

          {/* Messages */}
          <div className="echat-messages">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`echat-msg ${message.sender}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                  {message.sender === "bot" && (
                    <div className="echat-msg-avatar bot-av">
                      <SparkleIcon />
                    </div>
                  )}
                  <div className={`echat-bubble ${message.sender === "bot" ? "bot-bubble" : "user-bubble"}`}>
                    {message.text}
                  </div>
                  {message.sender === "user" && (
                    <div className="echat-msg-avatar user-av">{userInitial}</div>
                  )}
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  key="typing"
                  className="echat-msg bot"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="echat-msg-avatar bot-av">
                    <SparkleIcon />
                  </div>
                  <div className="echat-bubble bot-bubble">
                    <div className="echat-typing-dots">
                      <span /><span /><span />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Suggestions */}
          <div className="echat-suggestions">
            {QUICK_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="echat-suggestion-btn"
                onClick={() => submitMessage(suggestion)}
                disabled={isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Composer */}
          <form onSubmit={handleSend} className="echat-composer">
            <input
              type="text"
              className="echat-input"
              placeholder="Ask anything about your cycle..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="echat-send-btn"
              aria-label="Send"
              disabled={isLoading || inputMessage.trim().length === 0}
            >
              {isLoading ? "..." : "→"}
            </button>
          </form>
        </motion.div>

        {/* Footer Disclaimer */}
        <div className="epage-footer-disclaimer">
          <CheckIcon />
          Your health information stays yours. SAKHI is educational, not diagnostic.
        </div>
      </motion.div>
    </PageFrame>
  );
}
