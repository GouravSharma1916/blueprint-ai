"use client";
 
import { useEffect, useState } from "react";
 
// ─── types ───────────────────────────────────────────────────────────────────
 
type Stage = "thinking" | "generating" | "finalizing" | "done" | "error";
 
interface BlueprintSection {
  index: number;
  title: string;
  content: string;
}
 
// ─── section metadata ─────────────────────────────────────────────────────────
 
const SECTION_META: Record<number, { icon: string; accent?: string }> = {
  1:  { icon: "🎯" },
  2:  { icon: "👤" },
  3:  { icon: "💡" },
  4:  { icon: "⏱️" },
  5:  { icon: "🛠️", accent: "feature" },
  6:  { icon: "🚫" },
  7:  { icon: "🔄" },
  8:  { icon: "📱" },
  9:  { icon: "🗄️" },
  10: { icon: "⚡", accent: "advantage" },
  11: { icon: "🧭", accent: "founder" },
};
 
const STAGE_COPY: Record<string, { title: string; desc: string }> = {
  thinking: {
    title: "Thinking like a founder",
    desc: "Understanding your users, pain points, and startup opportunity.",
  },
  generating: {
    title: "Generating blueprint",
    desc: "Designing your MVP, market strategy, and product structure.",
  },
  finalizing: {
    title: "Finalizing output",
    desc: "Structuring everything into a readable startup blueprint.",
  },
  error: {
    title: "Something went wrong",
    desc: "Please try again.",
  },
};
 
const STAGE_PROGRESS: Record<string, number> = {
  thinking: 20,
  generating: 60,
  finalizing: 90,
  done: 100,
  error: 0,
};
 
// ─── helpers ──────────────────────────────────────────────────────────────────
 
function parseSections(raw: string): BlueprintSection[] {
  // Split on numbered list markers like "1. ", "2. " etc.
  const parts = raw.split(/(?=\d{1,2}\.\s)/).filter(Boolean);
 
  return parts.map((part, i) => {
    const match = part.match(/^(\d{1,2})\.\s+(.+?)(?:\n|$)([\s\S]*)/);
    if (!match) return { index: i + 1, title: `Section ${i + 1}`, content: part.trim() };
    return {
      index: parseInt(match[1], 10),
      title: match[2].trim(),
      content: match[3].trim(),
    };
  });
}
 
function renderContent(content: string, accent?: string) {
  if (accent === "founder") {
    return (
      <div className="founder-quote">
        {content}
      </div>
    );
  }
 
  // Detect bullet-style lines (lines starting with - or •)
  const lines = content.split("\n").filter(Boolean);
  const isList = lines.every((l) => /^[-•*]/.test(l.trim()));
 
  if (isList) {
    return (
      <ul className="section-list">
        {lines.map((l, i) => (
          <li key={i}>{l.replace(/^[-•*]\s*/, "")}</li>
        ))}
      </ul>
    );
  }
 
  // Plain paragraphs
  return (
    <>
      {lines.map((l, i) => (
        <p key={i} className="section-para">
          {l}
        </p>
      ))}
    </>
  );
}
 
// ─── loading screen ───────────────────────────────────────────────────────────
 
function LoadingScreen({ stage }: { stage: Stage }) {
  const copy = STAGE_COPY[stage] ?? STAGE_COPY.thinking;
  const progress = STAGE_PROGRESS[stage] ?? 0;
 
  return (
    <main className="loading-root">
      <div className="loading-card">
        <div className="loading-logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="currentColor" />
            <path d="M8 14h12M14 8v12" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
 
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
 
        <div className="loading-text">
          <h2
            className="loading-title"
            style={{ color: stage === "error" ? "var(--c-red)" : undefined }}
          >
            {copy.title}
          </h2>
          <p className="loading-desc">{copy.desc}</p>
        </div>
 
        <div className="loading-dots">
          <span className="dot" style={{ animationDelay: "0ms" }} />
          <span className="dot" style={{ animationDelay: "160ms" }} />
          <span className="dot" style={{ animationDelay: "320ms" }} />
        </div>
      </div>
 
      <style>{`
        .loading-root {
          min-height: 100vh;
          background: #f8f8f7;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          font-family: 'DM Sans', sans-serif;
        }
        .loading-card {
          background: #fff;
          border: 1px solid #e8e8e5;
          border-radius: 20px;
          padding: 48px 40px;
          width: 100%;
          max-width: 400px;
          text-align: center;
        }
        .loading-logo {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: #111;
          color: #111;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 28px;
        }
        .progress-track {
          width: 100%;
          height: 3px;
          background: #efefed;
          border-radius: 99px;
          overflow: hidden;
          margin-bottom: 28px;
        }
        .progress-fill {
          height: 100%;
          background: #111;
          border-radius: 99px;
          transition: width 0.6s ease;
        }
        .loading-title {
          font-size: 20px;
          font-weight: 600;
          color: #111;
          margin-bottom: 10px;
          letter-spacing: -0.3px;
        }
        .loading-desc {
          font-size: 14px;
          color: #888;
          line-height: 1.7;
        }
        .loading-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 28px;
        }
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ccc;
          animation: blink 1.2s ease-in-out infinite;
        }
        @keyframes blink {
          0%, 80%, 100% { opacity: 0.3; }
          40% { opacity: 1; }
        }
        :root { --c-red: #dc2626; }
      `}</style>
    </main>
  );
}
 
// ─── section card ─────────────────────────────────────────────────────────────
 
function SectionCard({ section, delay }: { section: BlueprintSection; delay: number }) {
  const meta = SECTION_META[section.index] ?? { icon: "📄" };
  const isFounder = meta.accent === "founder";
 
  return (
    <div
      className={`section-card ${isFounder ? "section-card--founder" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="section-header">
        <div className="section-header-left">
          <p className="section-label">Section {section.index}</p>
          <h2 className="section-title">{section.title}</h2>
        </div>
        <div className="section-badge">
          <span>{section.index}</span>
        </div>
      </div>
 
      <div className="section-body">
        {renderContent(section.content, meta.accent)}
      </div>
    </div>
  );
}
 
// ─── main page ────────────────────────────────────────────────────────────────
 
export default function BlueprintPage() {
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<Stage>("thinking");
  const [sections, setSections] = useState<BlueprintSection[]>([]);
  const [rawBlueprint, setRawBlueprint] = useState("");
 
  useEffect(() => {
    const raw = sessionStorage.getItem("blueprint-input");
 
    if (!raw) {
      setSections([{ index: 1, title: "No data", content: "No interview data found. Please complete the interview first." }]);
      setLoading(false);
      setStage("done");
      return;
    }
 
    const cached = sessionStorage.getItem("blueprint-output");
    if (cached) {
      setRawBlueprint(cached);
      setSections(parseSections(cached));
      setLoading(false);
      setStage("done");
      return;
    }
 
    async function generateBlueprint() {
      try {
        setStage("thinking");
        await new Promise((r) => setTimeout(r, 900));
 
        setStage("generating");
 
        const res = await fetch("/api/blueprint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: raw,
        });
 
        const data = await res.json();
        setStage("finalizing");
        await new Promise((r) => setTimeout(r, 600));
 
        const bp: string = data.blueprint;
        sessionStorage.setItem("blueprint-output", bp);
        setRawBlueprint(bp);
        setSections(parseSections(bp));
        setStage("done");
      } catch {
        setStage("error");
      } finally {
        setLoading(false);
      }
    }
 
    generateBlueprint();
  }, []);
 
  function handleCopy() {
    if (rawBlueprint) {
      navigator.clipboard.writeText(rawBlueprint).catch(() => {});
    }
  }
 
  function handleRegenerate() {
    sessionStorage.removeItem("blueprint-output");
    window.location.reload();
  }
 
  if (loading || stage !== "done") {
    return <LoadingScreen stage={stage} />;
  }
 
  return (
    <main className="bp-root">
 
      {/* ── HERO ── */}
      <div className="bp-hero">
        <div className="bp-hero-inner">
          <div className="status-badge">
            <span className="status-dot" />
            AI generated startup blueprint
          </div>
 
          <h1 className="bp-hero-title">Your AI product blueprint</h1>
          <p className="bp-hero-sub">
            Structured product thinking for startup founders. Designed to help
            you understand your users, define your MVP, and build faster.
          </p>
 
          <div className="bp-hero-actions">
            <button className="action-btn" onClick={handleCopy}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              Copy blueprint
            </button>
            <button className="action-btn" onClick={handleRegenerate}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              Regenerate
            </button>
            <a href="/interview" className="action-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New blueprint
            </a>
          </div>
        </div>
      </div>
 
      {/* ── SECTION COUNT BAR ── */}
      <div className="bp-meta-bar">
        <span className="meta-pill">{sections.length} sections</span>
        <div className="meta-divider" />
        <span className="meta-text">Problem · MVP · Go-to-market · Founder advice</span>
      </div>
 
      {/* ── SECTIONS ── */}
      <div className="bp-sections">
        {sections.map((section, i) => (
          <SectionCard key={section.index} section={section} delay={i * 60} />
        ))}
      </div>
 
      {/* ── FOOTER ── */}
      <div className="bp-footer">
        <p>Generated by AI · Not financial or legal advice</p>
        <a href="/interview">Start a new blueprint →</a>
      </div>
 
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
 
        * { box-sizing: border-box; }
 
        .bp-root {
          min-height: 100vh;
          background: #f8f8f7;
          font-family: 'DM Sans', sans-serif;
          color: #111;
        }
 
        /* ── hero ── */
        .bp-hero {
          background: #fff;
          border-bottom: 1px solid #e8e8e5;
          padding: 56px 24px 40px;
        }
        .bp-hero-inner {
          max-width: 720px;
          margin: 0 auto;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 500;
          color: #166534;
          background: #dcfce7;
          border-radius: 99px;
          padding: 5px 14px;
          margin-bottom: 20px;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #16a34a;
        }
        .bp-hero-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 400;
          line-height: 1.12;
          letter-spacing: -0.5px;
          color: #111;
          margin-bottom: 16px;
        }
        .bp-hero-sub {
          font-size: 16px;
          color: #666;
          line-height: 1.75;
          max-width: 560px;
          margin-bottom: 28px;
        }
        .bp-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #444;
          background: #fff;
          border: 1px solid #e0e0dd;
          border-radius: 99px;
          padding: 8px 16px;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s, border-color 0.15s;
        }
        .action-btn:hover {
          background: #f4f4f2;
          border-color: #ccc;
        }
 
        /* ── meta bar ── */
        .bp-meta-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          max-width: 720px;
          margin: 24px auto 0;
          padding: 0 24px;
        }
        .meta-pill {
          font-size: 12px;
          font-weight: 500;
          color: #555;
          background: #efefed;
          border-radius: 99px;
          padding: 4px 12px;
        }
        .meta-divider {
          width: 1px;
          height: 14px;
          background: #ddd;
        }
        .meta-text {
          font-size: 12px;
          color: #aaa;
        }
 
        /* ── sections ── */
        .bp-sections {
          max-width: 720px;
          margin: 0 auto;
          padding: 24px 24px 48px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
 
        /* ── section card ── */
        .section-card {
          background: #fff;
          border: 1px solid #e8e8e5;
          border-radius: 16px;
          padding: 28px 28px 24px;
          animation: fadeUp 0.4s ease both;
          transition: box-shadow 0.2s;
        }
        .section-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        .section-card--founder {
          border-color: #d4d0c8;
          background: #fafaf8;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
 
        .section-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }
        .section-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #aaa;
          margin-bottom: 5px;
        }
        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: #111;
          letter-spacing: -0.2px;
        }
        .section-badge {
          min-width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #f4f4f2;
          border: 1px solid #e8e8e5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          color: #666;
          flex-shrink: 0;
        }
 
        /* ── section body ── */
        .section-body {
          font-size: 15px;
          color: #444;
          line-height: 1.75;
        }
        .section-para {
          margin-bottom: 10px;
        }
        .section-para:last-child {
          margin-bottom: 0;
        }
        .section-list {
          padding-left: 20px;
          margin: 0;
        }
        .section-list li {
          margin-bottom: 8px;
          line-height: 1.65;
        }
        .section-list li:last-child {
          margin-bottom: 0;
        }
 
        /* ── founder quote ── */
        .founder-quote {
          font-size: 15px;
          color: #555;
          line-height: 1.8;
          padding: 16px 20px;
          border-left: 2px solid #d0cfc9;
          background: #f4f4f2;
          border-radius: 0 8px 8px 0;
          font-style: italic;
        }
 
        /* ── footer ── */
        .bp-footer {
          max-width: 720px;
          margin: 0 auto;
          padding: 0 24px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          border-top: 1px solid #e8e8e5;
          padding-top: 24px;
        }
        .bp-footer p {
          font-size: 12px;
          color: #bbb;
        }
        .bp-footer a {
          font-size: 13px;
          font-weight: 500;
          color: #111;
          text-decoration: none;
        }
        .bp-footer a:hover {
          text-decoration: underline;
        }
 
        @media (max-width: 600px) {
          .bp-hero { padding: 40px 20px 32px; }
          .section-card { padding: 22px 18px 20px; }
          .bp-sections { padding: 20px 16px 40px; }
        }
      `}</style>
    </main>
  );
}
