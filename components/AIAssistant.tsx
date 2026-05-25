"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles, Loader2 } from "lucide-react";
import { getDailyTip } from "@/lib/ai-assistant";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  source?: string;
}

const SUGGESTIONS = [
  "How to increase XP?",
  "Where are my notes?",
  "How to join live class?",
  "Explain badges",
];

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: getDailyTip(), source: "tip" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setShowSuggestions(false);

    try {
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const reply: ChatMessage = {
        role: "assistant",
        content: data.reply || "I'm here to help!",
        source: data.source,
      };
      setMessages((prev) => [...prev, reply]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble. Try again!", source: "error" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#5c35d9] text-white shadow-xl shadow-purple-500/30 transition-all hover:bg-[#4a28c7]"
      >
        <Bot size={26} />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 flex w-[360px] flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl"
            style={{ maxHeight: "calc(100vh - 160px)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-2xl bg-[#5c35d9] px-4 py-3 text-white">
              <div className="flex items-center gap-2.5">
                <Sparkles size={18} className="text-yellow-300" />
                <div>
                  <p className="text-sm font-semibold">Vi Smart Assistant</p>
                  <p className="text-[10px] text-white/70">AI-powered help</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#5c35d9] text-white rounded-br-md"
                        : "bg-gray-100 text-gray-800 rounded-bl-md"
                    }`}
                  >
                    {msg.content}
                    {msg.source === "faq" && (
                      <span className="mt-1 block text-[10px] opacity-50">📖 Knowledge Base</span>
                    )}
                    {msg.source === "tip" && (
                      <span className="mt-1 block text-[10px] opacity-50">💡 Daily Tip</span>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3">
                    <Loader2 size={14} className="animate-spin text-gray-400" />
                    <span className="text-sm text-gray-400">Thinking...</span>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            {showSuggestions && messages.length <= 1 && (
              <div className="px-4 pb-2">
                <p className="mb-2 text-xs text-gray-400">Try asking:</p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-gray-100 p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-purple-300 focus:bg-white"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5c35d9] text-white transition-all hover:bg-[#4a28c7] disabled:opacity-40"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </form>
              <p className="mt-1.5 text-[10px] text-gray-400 text-center">
                Powered by DeepSeek AI • Free for common questions
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
