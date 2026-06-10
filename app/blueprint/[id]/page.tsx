"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Confidence = "High" | "Medium" | "Low";
interface BlueprintScore { value: number; confidence: Confidence; reason: string; }
interface BlueprintSection { number: number; title: string; content: string; }
interface Blueprint { score: BlueprintScore; sections: BlueprintSection[]; }

const SECTION_META: Record<number, { icon: string; accent?: string }> = {
  1:{icon:"🎯"},2:{icon:"👤"},3:{icon:"💡"},4:{icon:"⚔️"},5:{icon:"⏱️"},
  6:{icon:"🛠️"},7:{icon:"✅"},8:{icon:"⚠️",accent:"risk"},
  9:{icon:"🗣️"},10:{icon:"📅"},11:{icon:"🧭",accent:"founder"},
};

function renderContent(content: string, accent?: string) {
  if (accent === "founder") {
    const doNotMatch = content.match(/([\s\S]*?)(Do Not Build This If[:\s]*)([\s\S]*)/i);
    if (doNotMatch) {
      const before = doNotMatch[1].trim();
      const doNotLines = doNotMatch[3].trim().split("\n").filter(Boolean);
      return (
        <>
          {before && <p className="section-para" style={{ marginBottom: "16px" }}>{before}</p>}
          <div className="do-not-box">
            <p className="do-not-label">⛔ Do Not Build This If...</p>
            <ul className="do-not-list">
              {doNotLines.map((l, i) => <li key={i}>{l.replace(/^[-•*\d.]\s*/, "")}</li>)}
            </ul>
          </div>
        </>
      );
    }
    return <div className="founder-quote">{content}</div>;
  }
  const lines = content.split("\n").filter(Boolean);
  const isList = lines.length > 1 && lines.every((l) => /^[-•*\d]/.test(l.trim()));
  if (isList) {
    return (
      <ul className="section-list">
        {lines.map((l, i) => <li key={i}>{l.replace(/^[-•*\d.]\s*/, "")}</li>)}
      </ul>
    );
  }
  return <>{lines.map((l, i) => <p key={i} className="section-para">{l}</p>)}</>;
}

function ScoreCard({ score }: { score: BlueprintScore }) {
  const colors: Record<Confidence, { bg: string; text: string; dot: string }> = {
    High:   { bg: "#dcfce7", text: "#166534", dot: "#16a34a" },
    Medium: { bg: "#fef9c3", text: "#854d0e", dot: "#ca8a04" },
    Low:    { bg: "#fee2e2", text: "#991b1b", dot: "#dc2626" },
  };
  const c = colors[score.confidence] ?? colors.Medium;
  return (
    <div className="score-card">
      <div className="score-left">
        <p className="score-label">Blueprint Score</p>
        <div className="score-number-row">
          <span className="score-number">{score.value}</span>
          <span className="score-denom">/10</span>
        </div>
      </div>
      <div className="score-right">
        <div className="confidence-badge" style={{ background: c.bg, color: c.text }}>
          <span className="confidence-dot" style={{ background: c.dot }} />
          {score.confidence} Confidence
        </div>
        <p className="score-reason">{score.reason}</p>
      </div>
    </div>
  );
}

function SectionCard({ section, delay }: { section: BlueprintSection; delay: number }) {
  const meta = SECTION_META[section.number] ?? { icon: "📄" };
  return (
    <div
      className={`section-card ${meta.accent === "founder" ? "section-card--founder" : ""} ${meta.accent === "risk" ? "section-card--risk" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="section-header">
        <div className="section-header-left">
          <p className="section-label"><span className="section-icon">{meta.icon}</span>Section {section.number}</p>
          <h2 className="section-title">{section.title}</h2>
        </div>
        <div className="section-badge">{section.number}</div>
      </div>
      <div className="section-body">{renderContent(section.content, meta.accent)}</div>
    </div>
  );
}

// ── shared PDF generator ──────────────────────────────────────────────────────
async function generatePDF(blueprint: Blueprint) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  function checkPageBreak(needed: number) {
    if (y + needed > 272) { doc.addPage(); y = 20; }
  }

  function addText(
    text: string,
    fontSize: number,
    color: [number, number, number],
    bold = false,
    xOffset = 0
  ) {
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    const lines = doc.splitTextToSize(text, contentWidth - xOffset);
    const lineH = fontSize * 0.45;
    checkPageBreak(lines.length * lineH + 2);
    doc.text(lines, margin + xOffset, y);
    y += lines.length * lineH + 2;
  }

  // ── HEADER ──
  doc.setFillColor(17, 17, 17);
  doc.rect(0, 0, 210, 30, "F");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Blueprint AI", margin, 17);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 180);
  doc.text("AI-generated startup blueprint  ·  blueprintai.com", margin, 24);
  y = 40;

  // ── SCORE CARD ──
  const scoreRGB: [number, number, number] =
    blueprint.score.confidence === "High" ? [22, 101, 52] :
    blueprint.score.confidence === "Low"  ? [153, 27, 27] :
    [133, 77, 14];
  const scoreBgRGB: [number, number, number] =
    blueprint.score.confidence === "High" ? [240, 253, 244] :
    blueprint.score.confidence === "Low"  ? [254, 242, 242] :
    [254, 252, 232];

  doc.setFillColor(...scoreBgRGB);
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, "F");
  doc.setFillColor(...scoreRGB);
  doc.roundedRect(margin, y, 3, 34, 1, 1, "F");

  doc.setFontSize(30);
  doc.setTextColor(17, 17, 17);
  doc.setFont("helvetica", "bold");
  doc.text(`${blueprint.score.value}`, margin + 8, y + 20);
  doc.setFontSize(14);
  doc.setTextColor(150, 150, 150);
  doc.text("/10", margin + 22, y + 20);

  doc.setFontSize(10);
  doc.setTextColor(...scoreRGB);
  doc.setFont("helvetica", "bold");
  doc.text(`${blueprint.score.confidence} Confidence`, margin + 42, y + 10);

  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "normal");
  const reasonLines = doc.splitTextToSize(blueprint.score.reason, contentWidth - 44);
  doc.text(reasonLines, margin + 42, y + 17);
  y += 42;

  // ── SECTIONS ──
  for (const section of blueprint.sections) {
    checkPageBreak(24);

    doc.setFillColor(17, 17, 17);
    doc.roundedRect(margin, y, 18, 7, 2, 2, "F");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(`  ${section.number}`, margin + 1, y + 5);

    doc.setFontSize(12);
    doc.setTextColor(17, 17, 17);
    doc.setFont("helvetica", "bold");
    const titleLines = doc.splitTextToSize(section.title, contentWidth - 24);
    doc.text(titleLines, margin + 22, y + 5.5);
    y += 12;

    doc.setDrawColor(230, 230, 228);
    doc.line(margin, y, margin + contentWidth, y);
    y += 5;

    const contentLines = section.content.split("\n").filter(Boolean);
    const isList = contentLines.length > 1 && contentLines.every(l => /^[-•*\d]/.test(l.trim()));

    if (isList) {
      for (const line of contentLines) {
        const clean = line.replace(/^[-•*\d.]\s*/, "");
        checkPageBreak(8);
        doc.setFontSize(8.5);
        doc.setTextColor(68, 68, 68);
        doc.setFont("helvetica", "normal");
        doc.text("•", margin + 2, y);
        const wrapped = doc.splitTextToSize(clean, contentWidth - 8);
        doc.text(wrapped, margin + 7, y);
        y += wrapped.length * 4.2 + 1.5;
      }
    } else {
      addText(section.content, 9, [68, 68, 68], false, 0);
    }
    y += 8;
  }

  // ── FOOTER ──
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFillColor(245, 245, 243);
    doc.rect(0, 284, 210, 13, "F");
    doc.setFontSize(7.5);
    doc.setTextColor(160, 160, 160);
    doc.setFont("helvetica", "normal");
    doc.text("Generated by Blueprint AI · Not financial or legal advice", margin, 291);
    doc.text(`Page ${i} of ${total}`, pageWidth - margin, 291, { align: "right" });
  }

  doc.save("blueprint.pdf");
}

export default function SavedBlueprintPage() {
  const { id } = useParams();
  const [blueprint, setBlueprint]   = useState<Blueprint | null>(null);
  const [loading, setLoading]       = useState(true);
  const [notFound, setNotFound]     = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/get-blueprints?id=${id}`);
        const data = await res.json();
        if (!data.blueprint) { setNotFound(true); return; }
        setBlueprint(data.blueprint.blueprint);
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    }
    if (id) load();
  }, [id]);

  function handleCopy() {
    if (!blueprint) return;
    navigator.clipboard.writeText(
      blueprint.sections.map((s) => `${s.number}. ${s.title}\n${s.content}`).join("\n\n")
    ).catch(() => {});
  }

  async function handleDownloadPDF() {
    if (!blueprint || pdfLoading) return;
    setPdfLoading(true);
    try { await generatePDF(blueprint); }
    finally { setPdfLoading(false); }
  }

  if (loading) return (
    <main style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f8f8f7", fontFamily:"DM Sans,sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:28, height:28, border:"2px solid #e0e0dd", borderTopColor:"#111", borderRadius:"50%", animation:"spin 0.7s linear infinite", margin:"0 auto 16px" }} />
        <p style={{ color:"#888", fontSize:14 }}>Loading blueprint...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );

  if (notFound || !blueprint) return (
    <main style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#f8f8f7", fontFamily:"DM Sans,sans-serif", gap:16 }}>
      <p style={{ color:"#888", fontSize:15 }}>Blueprint not found.</p>
      <Link href="/dashboard" style={{ fontSize:13, color:"#111", textDecoration:"none", border:"1px solid #e0e0dd", borderRadius:99, padding:"8px 20px" }}>← Back to dashboard</Link>
    </main>
  );

  return (
    <main className="bp-root">

      <nav className="bp-nav">
        <div className="bp-nav-inner">
          <Link href="/" className="bp-nav-logo">Blueprint AI</Link>
          <div className="bp-nav-right">
            <Link href="/dashboard" className="bp-nav-link">← Dashboard</Link>
            <Link href="/interview" className="bp-nav-btn">+ New blueprint</Link>
          </div>
        </div>
      </nav>

      <div className="bp-hero">
        <div className="bp-hero-inner">
          <div className="status-badge"><span className="status-dot" />Saved blueprint</div>
          <h1 className="bp-hero-title">Your product blueprint</h1>
          <p className="bp-hero-sub">Structured founder thinking — problem, customers, MVP, validation, risks, and a 30-day execution plan.</p>
          <div className="bp-hero-actions">

            <button className="action-btn" onClick={handleCopy}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              Copy blueprint
            </button>

            <button className="action-btn" onClick={handleDownloadPDF} disabled={pdfLoading}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              {pdfLoading ? "Generating..." : "Download PDF"}
            </button>

            <Link href="/dashboard" className="action-btn">← Back to dashboard</Link>
            <Link href="/interview" className="action-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New blueprint
            </Link>

          </div>
        </div>
      </div>

      <div className="bp-meta-bar">
        <span className="meta-pill">{blueprint.sections.length} sections</span>
        <div className="meta-divider" />
        <span className="meta-text">Problem · ICP · MVP · Validation · Risks · 30-Day Plan</span>
      </div>

      <div className="bp-score-wrap"><ScoreCard score={blueprint.score} /></div>

      <div className="bp-sections">
        {blueprint.sections.map((section, i) => (
          <SectionCard key={section.number} section={section} delay={i * 60} />
        ))}
      </div>

      <div className="bp-footer">
        <p>Generated by Blueprint AI · Not financial or legal advice</p>
        <Link href="/interview">Start a new blueprint →</Link>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        * { box-sizing: border-box; }
        .bp-root { min-height:100vh; background:#f8f8f7; font-family:'DM Sans',sans-serif; color:#111; }
        .bp-nav { background:#fff; border-bottom:1px solid #e8e8e5; padding:0 24px; height:60px; display:flex; align-items:center; }
        .bp-nav-inner { max-width:720px; width:100%; margin:0 auto; display:flex; align-items:center; justify-content:space-between; }
        .bp-nav-logo { font-size:16px; font-weight:600; color:#111; text-decoration:none; }
        .bp-nav-right { display:flex; align-items:center; gap:12px; }
        .bp-nav-link { font-size:13px; color:#666; text-decoration:none; transition:color 0.15s; }
        .bp-nav-link:hover { color:#111; }
        .bp-nav-btn { font-size:13px; font-weight:500; color:#fff; background:#111; border-radius:99px; padding:7px 16px; text-decoration:none; transition:background 0.15s; }
        .bp-nav-btn:hover { background:#333; }
        .bp-hero { background:#fff; border-bottom:1px solid #e8e8e5; padding:48px 24px 36px; }
        .bp-hero-inner { max-width:720px; margin:0 auto; }
        .status-badge { display:inline-flex; align-items:center; gap:7px; font-size:12px; font-weight:500; color:#166534; background:#dcfce7; border-radius:99px; padding:5px 14px; margin-bottom:20px; }
        .status-dot { width:6px; height:6px; border-radius:50%; background:#16a34a; }
        .bp-hero-title { font-family:'Instrument Serif',serif; font-size:clamp(32px,5vw,48px); font-weight:400; line-height:1.12; letter-spacing:-0.5px; color:#111; margin-bottom:16px; }
        .bp-hero-sub { font-size:16px; color:#666; line-height:1.75; max-width:560px; margin-bottom:28px; }
        .bp-hero-actions { display:flex; flex-wrap:wrap; gap:10px; }
        .action-btn { display:inline-flex; align-items:center; gap:7px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; color:#444; background:#fff; border:1px solid #e0e0dd; border-radius:99px; padding:8px 16px; cursor:pointer; text-decoration:none; transition:background 0.15s,border-color 0.15s; }
        .action-btn:hover { background:#f4f4f2; border-color:#ccc; }
        .action-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .bp-meta-bar { display:flex; align-items:center; gap:12px; max-width:720px; margin:24px auto 0; padding:0 24px; }
        .meta-pill { font-size:12px; font-weight:500; color:#555; background:#efefed; border-radius:99px; padding:4px 12px; }
        .meta-divider { width:1px; height:14px; background:#ddd; }
        .meta-text { font-size:12px; color:#aaa; }
        .bp-score-wrap { max-width:720px; margin:16px auto 0; padding:0 24px; }
        .score-card { background:#fff; border:1px solid #e8e8e5; border-radius:16px; padding:24px 28px; display:flex; gap:24px; align-items:flex-start; flex-wrap:wrap; }
        .score-left { flex-shrink:0; }
        .score-label { font-size:11px; font-weight:500; letter-spacing:0.06em; text-transform:uppercase; color:#aaa; margin-bottom:6px; }
        .score-number-row { display:flex; align-items:flex-end; gap:4px; }
        .score-number { font-family:'Instrument Serif',serif; font-size:56px; line-height:1; color:#111; }
        .score-denom { font-size:22px; color:#bbb; margin-bottom:6px; }
        .score-right { flex:1; min-width:200px; }
        .confidence-badge { display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:500; border-radius:99px; padding:5px 12px; margin-bottom:12px; }
        .confidence-dot { width:6px; height:6px; border-radius:50%; }
        .score-reason { font-size:14px; color:#555; line-height:1.7; }
        .bp-sections { max-width:720px; margin:0 auto; padding:16px 24px 48px; display:flex; flex-direction:column; gap:12px; }
        .section-card { background:#fff; border:1px solid #e8e8e5; border-radius:16px; padding:28px 28px 24px; animation:fadeUp 0.4s ease both; transition:box-shadow 0.2s; }
        .section-card:hover { box-shadow:0 4px 20px rgba(0,0,0,0.05); }
        .section-card--founder { border-color:#d4d0c8; background:#fafaf8; }
        .section-card--risk { border-color:#fecaca; background:#fff8f8; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .section-header { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:18px; }
        .section-header-left { flex:1; }
        .section-label { font-size:11px; font-weight:500; letter-spacing:0.06em; text-transform:uppercase; color:#aaa; margin-bottom:5px; }
        .section-icon { margin-right:6px; }
        .section-title { font-size:20px; font-weight:600; color:#111; letter-spacing:-0.2px; }
        .section-badge { min-width:36px; height:36px; border-radius:10px; background:#f4f4f2; border:1px solid #e8e8e5; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:600; color:#666; flex-shrink:0; }
        .section-body { font-size:15px; color:#444; line-height:1.75; }
        .section-para { margin-bottom:10px; }
        .section-para:last-child { margin-bottom:0; }
        .section-list { padding-left:20px; margin:0; }
        .section-list li { margin-bottom:8px; line-height:1.65; }
        .section-list li:last-child { margin-bottom:0; }
        .founder-quote { font-size:15px; color:#555; line-height:1.8; padding:16px 20px; border-left:2px solid #d0cfc9; background:#f4f4f2; border-radius:0 8px 8px 0; font-style:italic; }
        .do-not-box { margin-top:16px; background:#fff3f3; border:1px solid #fecaca; border-radius:12px; padding:16px 20px; }
        .do-not-label { font-size:13px; font-weight:600; color:#dc2626; margin-bottom:10px; }
        .do-not-list { padding-left:18px; margin:0; }
        .do-not-list li { font-size:14px; color:#555; margin-bottom:6px; line-height:1.6; }
        .do-not-list li:last-child { margin-bottom:0; }
        .bp-footer { max-width:720px; margin:0 auto; padding:24px 24px 48px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; border-top:1px solid #e8e8e5; }
        .bp-footer p { font-size:12px; color:#bbb; }
        .bp-footer a { font-size:13px; font-weight:500; color:#111; text-decoration:none; }
        .bp-footer a:hover { text-decoration:underline; }
        @media (max-width:600px) {
          .bp-hero { padding:32px 16px 28px; }
          .section-card { padding:22px 18px 20px; }
          .bp-sections { padding:16px 16px 40px; }
          .score-card { flex-direction:column; gap:16px; }
          .bp-nav-right { gap:8px; }
        }
      `}</style>
    </main>
  );
}