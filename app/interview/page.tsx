"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

// Cut from 12 to 5 high-signal questions only
const questions = [
  {
    key: "idea",
    q: "What are you building?",
    hint: "Describe your idea in plain English. No deck needed — just your raw thought.",
    placeholder: "e.g. An app that helps freelancers track which clients owe them money and sends automatic reminders...",
  },
  {
    key: "user",
    q: "Who exactly is your target user?",
    hint: "Be specific. Not 'everyone' or 'businesses' — describe one real person.",
    placeholder: "e.g. Freelance designers in India who work with 3-10 clients at a time and invoice manually via WhatsApp...",
  },
  {
    key: "problem",
    q: "What problem are you solving — and how do they handle it today?",
    hint: "What's painful about the current solution? Why does that frustrate them?",
    placeholder: "e.g. They use spreadsheets and forget to follow up. Clients delay payments for weeks and they feel awkward chasing...",
  },
  {
    key: "timing",
    q: "Why is now the right time to build this?",
    hint: "What changed recently — in tech, behavior, or the market — that makes this possible or urgent?",
    placeholder: "e.g. UPI made payments instant but follow-up is still manual. More people freelancing post-COVID...",
  },
  {
    key: "success",
    q: "What does success look like in 90 days?",
    hint: "Give a specific number or outcome — not 'growth' or 'users'. What would prove this works?",
    placeholder: "e.g. 50 freelancers using it weekly, 3 of them paying ₹299/month, average payment collection time cut by 50%...",
  },
];

export default function Interview() {
  const router = useRouter();

  const [step, setStep]           = useState(0);
  const [answers, setAnswers]     = useState<Record<string, string>>({});
  const [input, setInput]         = useState("");
  const [animKey, setAnimKey]     = useState(0);
  const [shaking, setShaking]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef               = useRef<HTMLTextAreaElement>(null);

  const current  = questions[step];
  const stepNum  = String(step + 1).padStart(2, "0");
  const progress = ((step + 1) / questions.length) * 100;

  function goNext() {
    if (!input.trim()) {
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      return;
    }
    const updated = { ...answers, [current.key]: input };
    setAnswers(updated);
    setInput("");

    if (step < questions.length - 1) {
      setStep(step + 1);
      setAnimKey((k) => k + 1);
      setTimeout(() => textareaRef.current?.focus(), 50);
    } else {
      // Show loading screen before redirect
      setSubmitting(true);
      sessionStorage.setItem("blueprint-input", JSON.stringify(updated));
      setTimeout(() => router.push("/blueprint"), 1800);
    }
  }

  function goBack() {
    if (step === 0) return;
    const prev = step - 1;
    setInput(answers[questions[prev].key] ?? "");
    setStep(prev);
    setAnimKey((k) => k + 1);
  }

  if (submitting) {
    return (
      <main style={{ minHeight:"100vh", background:"#111", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", fontFamily:"'DM Sans', sans-serif" }}>
        <div style={{ textAlign:"center", maxWidth:"380px", width:"100%" }}>
          <div style={{ width:56, height:56, background:"#fff", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 28px" }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="white"/>
              <path d="M8 14h12M14 8v12" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 style={{ fontFamily:"'Instrument Serif', serif", fontSize:28, fontWeight:400, color:"#fff", marginBottom:10 }}>
            Building your blueprint…
          </h2>
          <p style={{ fontSize:14, color:"#888", lineHeight:1.7, marginBottom:32 }}>
            Analysing your answers. This takes just a moment.
          </p>
          <div style={{ width:"100%", height:2, background:"#333", borderRadius:99, overflow:"hidden", marginBottom:32 }}>
            <div style={{ height:"100%", background:"linear-gradient(90deg,#555,#fff)", borderRadius:99, animation:"barSlide 1.8s ease forwards" }} />
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:14, textAlign:"left" }}>
            {["Understanding your idea","Identifying your market","Designing your blueprint"].map((label, i) => (
              <div key={label} style={{ display:"flex", alignItems:"center", gap:12, fontSize:13, color:"#666", opacity:0, animation:`stepIn 0.4s ease ${i*500}ms forwards` }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:"#555", flexShrink:0, display:"inline-block" }} />
                {label}
              </div>
            ))}
          </div>
        </div>
        <style>{\`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
          @keyframes barSlide { from { width:0% } to { width:100% } }
          @keyframes stepIn { from { opacity:0; transform:translateX(-8px) } to { opacity:1; transform:translateX(0) } }
        \`}</style>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f5f2] flex flex-col font-sans">

      {/* top bar */}
      <div className="bg-white border-b border-[#e8e8e4] px-6 py-3.5 flex items-center justify-between flex-shrink-0">
        <span className="font-serif text-[17px] text-[#111]">Blueprint AI</span>
        <span className="text-[11px] font-medium text-[#888] bg-[#f0ede7] rounded-full px-3 py-1 tracking-wide">
          {stepNum} / {String(questions.length).padStart(2, "0")}
        </span>
      </div>

      {/* progress bar */}
      <div className="w-full h-[3px] bg-[#e8e8e4] flex-shrink-0">
        <div
          className="h-full bg-[#111] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* body */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="bg-white border border-[#e8e8e4] rounded-[24px] p-10 w-full max-w-[580px]">

          {/* question number */}
          <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#aaa] mb-3.5">
            Question {stepNum} of {String(questions.length).padStart(2, "0")}
          </p>

          {/* question text */}
          <h2
            key={`q-${animKey}`}
            className="font-serif italic text-[28px] text-[#111] leading-snug font-normal mb-3 animate-fadeUp"
          >
            {current.q}
          </h2>

          {/* hint */}
          <p
            key={`h-${animKey}`}
            className="text-[13px] text-[#999] leading-relaxed mb-6 animate-fadeUp"
            style={{ animationDelay: "60ms" }}
          >
            {current.hint}
          </p>

          {/* textarea — replaces input */}
          <textarea
            ref={textareaRef}
            rows={4}
            className={`w-full border rounded-xl px-4 py-3.5 text-[15px] text-[#111] bg-[#fafaf8] placeholder-[#bbb] outline-none transition resize-none leading-relaxed focus:border-[#111] focus:ring-2 focus:ring-black/5 focus:bg-white ${
              shaking ? "border-red-400 animate-shake" : "border-[#e0ddd8]"
            }`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={current.placeholder}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                goNext();
              }
            }}
            autoFocus
          />

          <p className="text-[11px] text-[#bbb] mt-2 mb-5">
            Press ⌘ + Enter to continue
          </p>

          {/* footer */}
          <div className="flex items-center justify-between">

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

            <button
              onClick={goNext}
              className="bg-[#111] text-white text-[14px] font-medium rounded-xl px-6 py-3 flex items-center gap-2 hover:opacity-85 hover:scale-[1.02] active:scale-[0.98] transition"
            >
              {step === questions.length - 1 ? "Generate Blueprint" : "Next"}
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
        .animate-shake { animation: shake 0.35s ease; }
      `}</style>
    </main>
  );
}