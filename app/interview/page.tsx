"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const questions = [
  { key: "idea", q: "What are you building?" },
  { key: "user", q: "Who is your target user?" },
  { key: "problem", q: "What problem are you solving?" },
  { key: "current_solution", q: "How do users solve this today?" },
  { key: "pain_points", q: "What is frustrating about current solution?" },
  { key: "timing", q: "Why now?" },
  { key: "core_action", q: "What is the core action?" },
  { key: "data", q: "What data is stored?" },
  { key: "platform", q: "Mobile, web, or both?" },
  { key: "competitors", q: "Competitors?" },
  { key: "exclusions", q: "What NOT to include?" },
  { key: "success", q: "What is success?" }
];

export default function Interview() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [input, setInput] = useState("");

  const currentQuestion = questions[step];

  function next() {
    if (!input.trim()) return;

    const updated = {
      ...answers,
      [currentQuestion.key]: input
    };

    setAnswers(updated);
    setInput("");

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // ✅ SAVE FINAL DATA
      sessionStorage.setItem(
        "blueprint-input",
        JSON.stringify(updated)
      );

      // 🚀 MOVE TO BLUEPRINT PAGE
      router.push("/blueprint");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-xl w-full">

        {/* Progress */}
        <p className="text-sm text-gray-500 mb-4">
          Question {step + 1} / {questions.length}
        </p>

        {/* Question */}
        <h2 className="text-2xl font-semibold mb-6">
          {currentQuestion.q}
        </h2>

        {/* Input */}
        <input
          className="w-full border border-gray-300 rounded-lg px-4 py-3"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your answer..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              next();
            }
          }}
        />

        {/* Button */}
        <button
          onClick={next}
          className="mt-4 w-full bg-black text-white py-3 rounded-lg"
        >
          {step === questions.length - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </main>
  );
}