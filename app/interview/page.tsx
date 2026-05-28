"use client";
 
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
 
const questions = [
  { key: "idea",             q: "What are you building?" },
  { key: "user",             q: "Who is your target user?" },
  { key: "problem",          q: "What problem are you solving?" },
  { key: "current_solution", q: "How do users solve this today?" },
  { key: "pain_points",      q: "What is frustrating about current solution?" },
  { key: "timing",           q: "Why now?" },
  { key: "core_action",      q: "What is the core action?" },
  { key: "data",             q: "What data is stored?" },
  { key: "platform",         q: "Mobile, web, or both?" },
  { key: "competitors",      q: "Competitors?" },
  { key: "exclusions",       q: "What NOT to include?" },
  { key: "success",          q: "What is success?" },
];
 
export default function Interview() {
  const router = useRouter();
 
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [input, setInput]     = useState("");
  const [animKey, setAnimKey] = useState(0);
  const inputRef              = useRef<HTMLInputElement>(null);
 
  const current  = questions[step];
  const stepNum  = String(step + 1).padStart(2, "0");
  const progress = ((step + 1) / questions.length) * 100;
 
  function goNext() {
    if (!input.trim()) {
      inputRef.current?.classList.add("shake");
      setTimeout(() => inputRef.current?.classList.remove("shake"), 400);
      return;
    }
    const updated = { ...answers, [current.key]: input };
    setAnswers(updated);
    setInput("");
 
    if (step < questions.length - 1) {
      setStep(step + 1);
      setAnimKey((k) => k + 1);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      sessionStorage.setItem("blueprint-input", JSON.stringify(updated));
      router.push("/blueprint");
    }
  }
 
  function goBack() {
    if (step === 0) return;
    const prev = step - 1;
    setInput(answers[questions[prev].key] ?? "");
    setStep(prev);
    setAnimKey((k) => k + 1);
  }
 
  return (
    <main className="min-h-screen bg-[#f6f5f2] flex flex-col font-sans">
 
      {/* ── top bar ── */}
      <div className="bg-white border-b border-[#e8e8e4] px-6 py-3.5 flex items-center justify-between flex-shrink-0">
        <span className="font-serif text-[17px] text-[#111]">Blueprint AI</span>
        <span className="text-[11px] font-medium text-[#888] bg-[#f0ede7] rounded-full px-3 py-1 tracking-wide">
          Interview
        </span>
      </div>
 
      {/* ── progress bar ── */}
      <div className="w-full h-[3px] bg-[#e8e8e4] flex-shrink-0">
        <div
          className="h-full bg-[#111] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
 
      {/* ── body ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="bg-white border border-[#e8e8e4] rounded-[24px] p-10 w-full max-w-[540px]">
 
          {/* question number */}
          <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#aaa] mb-3.5">
            Question {stepNum} / {String(questions.length).padStart(2, "0")}
          </p>
 
          {/* question text */}
          <h2
            key={animKey}
            className="font-serif italic text-[30px] text-[#111] leading-snug font-normal mb-8 animate-fadeUp"
          >
            {current.q}
          </h2>
 
          {/* input */}
          <input
            ref={inputRef}
            className="w-full border border-[#e0ddd8] rounded-xl px-4 py-3.5 text-[15px] text-[#111] bg-[#fafaf8] placeholder-[#bbb] outline-none transition focus:border-[#111] focus:ring-2 focus:ring-black/5 focus:bg-white"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your answer…"
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); goNext(); }
            }}
          />
 
          {/* footer */}
          <div className="flex items-center justify-between mt-5">
 
            {/* back */}
            <button
              onClick={goBack}
              className="text-[13px] font-medium text-[#aaa] hover:text-[#555] transition"
              style={{ visibility: step === 0 ? "hidden" : "visible" }}
            >
              ← Back
            </button>
 
            {/* dots */}
            <div className="flex items-center gap-[5px]">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className="h-[5px] rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? 16 : 5,
                    borderRadius: i === step ? 3 : "50%",
                    background: i === step ? "#111" : i < step ? "#888" : "#ddd",
                  }}
                />
              ))}
            </div>
 
            {/* next */}
            <button
              onClick={goNext}
              className="bg-[#111] text-white text-[14px] font-medium rounded-xl px-6 py-3 flex items-center gap-2 hover:opacity-85 hover:scale-[1.02] active:scale-[0.98] transition"
            >
              {step === questions.length - 1 ? "Finish" : "Next"}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
 
          </div>
        </div>
      </div>
 
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        .font-serif { font-family: 'Instrument Serif', serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp { animation: fadeUp 0.3s ease both; }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%,60%  { transform: translateX(-6px); }
          40%,80%  { transform: translateX(6px); }
        }
        .shake { border-color: #dc2626 !important; animation: shake 0.35s ease; }
      `}</style>
    </main>
  );
}
