"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

type Stage = "thinking" | "generating" | "finalizing" | "done" | "error";
type Confidence = "High" | "Medium" | "Low";
type Complexity = "Low" | "Medium" | "High";
type ChannelType = "Inbound" | "Outbound" | "Community" | "Paid" | "Partnership";
type EffortLevel = "Low" | "Medium" | "High";

interface BlueprintScore {
  value: number;
  confidence: Confidence;
  reason: string;
}

interface BuildEstimateItem {
  feature: string;
  soloTime: string;
  complexity: Complexity;
  note: string;
}

interface BuildEstimate {
  soloTimeline: string;
  teamTimeline: string;
  confidence: Confidence;
  summary: string;
  breakdown: BuildEstimateItem[];
  hiddenComplexity: string;
  fastestPath: string;
  recommendedStack: string[];
}

interface GtmPlaybookStep {
  step: number;
  action: string;
  who: string;
  where: string;
  what: string;
  signal: string;
}

interface GtmChannel {
  name: string;
  type: ChannelType;
  description: string;
  timeToFirstResult: string;
  effort: EffortLevel;
}

interface GtmStrategy {
  pricingModel: {
    recommendation: string;
    model: string;
    reasoning: string;
  };
  first100Playbook: GtmPlaybookStep[];
  fastestChannel: {
    channel: string;
    why: string;
  };
  channels: GtmChannel[];
  northStarMetric: {
    metric: string;
    target: string;
    why: string;
  };
  gtmRisks: string[];
}

interface BlueprintSection {
  number: number;
  title: string;
  content: string;
}

interface Blueprint {
  score: BlueprintScore;
  buildEstimate?: BuildEstimate;
  gtmStrategy?: GtmStrategy;
  sections: BlueprintSection[];
}

const SECTION_META: Record<number, { icon: string; accent?: string }> = {
  1:  { icon: "🎯" },
  2:  { icon: "👤" },
  3:  { icon: "💡" },
  4:  { icon: "⚔️" },
  5:  { icon: "⏱️" },
  6:  { icon: "🛠️" },
  7:  { icon: "✅" },
  8:  { icon: "⚠️", accent: "risk" },
  9:  { icon: "🗣️" },
  10: { icon: "📅" },
  11: { icon: "🧭", accent: "founder" },
};

function parseBlueprint(raw: string): Blueprint | null {
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean) as Blueprint;
  } catch {
    return null;
  }
}

function tryExtractPartialScore(raw: string): BlueprintScore | null {
  const clean = raw.replace(/```json|```/g, "");
  const match = clean.match(/"score"\s*:\s*\{[^}]*"value"\s*:\s*([\d.]+)[^}]*"confidence"\s*:\s*"(High|Medium|Low)"/);
  if (!match) return null;
  const reasonMatch = clean.match(/"reason"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  return {
    value: parseFloat(match[1]),
    confidence: match[2] as Confidence,
    reason: reasonMatch ? reasonMatch[1].replace(/\\"/g, '"') : "",
  };
}

const KNOWN_SECTION_TITLES = [
  "Startup Summary", "Ideal Customer Profile", "Problem Analysis",
  "Why Existing Solutions Fail", "Market Timing", "MVP Scope",
  "Validation Plan", "Biggest Risks", "Customer Interview Questions",
  "30-Day Execution Plan", "Founder Recommendation", "Competitor Landscape",
];

interface StreamProgress {
  hasScore: boolean;
  hasBuildEstimate: boolean;
  hasGtmStrategy: boolean;
  sectionsSeen: number;
}

function analyzeStreamProgress(raw: string): StreamProgress {
  const clean = raw.replace(/```json|```/g, "");
  let sectionsSeen = 0;
  for (const title of KNOWN_SECTION_TITLES) {
    if (clean.includes(`"${title}"`)) sectionsSeen++;
  }
  return {
    hasScore: /"score"\s*:\s*\{[^}]*"confidence"/.test(clean),
    hasBuildEstimate: clean.includes('"recommendedStack"'),
    hasGtmStrategy: clean.includes('"gtmRisks"'),
    sectionsSeen,
  };
}

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

const ROTATING_MESSAGES = [
  "Reading your idea closely...",
  "Checking who actually has this problem...",
  "Sizing up the competition...",
  "Running the numbers on build time...",
  "Mapping your first 100 users...",
  "Stress-testing your differentiation...",
  "Writing the honest verdict...",
];

function useRotatingMessage(active: boolean, intervalMs = 2600) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % ROTATING_MESSAGES.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [active]);
  return ROTATING_MESSAGES[index];
}

const CHECKLIST_ITEMS = [
  { key: "score", label: "Score & verdict" },
  { key: "buildEstimate", label: "Build time estimate" },
  { key: "gtmStrategy", label: "Go-to-market strategy" },
  { key: "sections", label: "12-section deep dive" },
];

function LoadingScreen({
  stage,
  partialScore,
  progress,
}: {
  stage: Stage;
  partialScore: BlueprintScore | null;
  progress: StreamProgress;
}) {
  const rotatingMessage = useRotatingMessage(stage === "generating");

  const [smoothPct, setSmoothPct] = useState(6);
  const targetPct =
    stage === "error" ? 0 :
    stage === "thinking" ? 8 :
    stage === "finalizing" || stage === "done" ? 100 :
    Math.min(
      92,
      10 +
        (progress.hasScore ? 12 : 0) +
        (progress.hasBuildEstimate ? 16 : 0) +
        (progress.hasGtmStrategy ? 16 : 0) +
        progress.sectionsSeen * 4
    );

  useEffect(() => {
    const id = setInterval(() => {
      setSmoothPct((p) => {
        if (p < targetPct) return Math.min(targetPct, p + Math.max(0.3, (targetPct - p) * 0.08));
        if (stage === "generating" && p < 92) return p + 0.05;
        return p;
      });
    }, 80);
    return () => clearInterval(id);
  }, [targetPct, stage]);

  const checklistState = (key: string) => {
    if (key === "score") return progress.hasScore;
    if (key === "buildEstimate") return progress.hasBuildEstimate;
    if (key === "gtmStrategy") return progress.hasGtmStrategy;
    if (key === "sections") return progress.sectionsSeen >= KNOWN_SECTION_TITLES.length;
    return false;
  };

  return (
    <main className="loading-root">
      <div className="loading-card">
        <div className="node-diagram-wrap">
          <svg viewBox="0 0 200 200" fill="none" className="node-diagram" aria-hidden="true">
            <circle cx="100" cy="100" r="74" stroke="#e3e2dd" strokeWidth="1" strokeDasharray="2 5" className={stage !== "error" ? "node-orbit" : ""} />
            <path d="M100 26v32M174 100h-32M100 174v-32M26 100h32M148.3 51.7l-22.6 22.6M148.3 148.3l-22.6-22.6M51.7 148.3l22.6-22.6M51.7 51.7l22.6 22.6" stroke="#e3e2dd" strokeWidth="1" className="node-flow-dash" />
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const angle = (i / 6) * 2 * Math.PI - Math.PI / 2;
              const cx = 100 + 64 * Math.cos(angle);
              const cy = 100 + 64 * Math.sin(angle);
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="6"
                  fill="#fff"
                  stroke="#111"
                  strokeWidth="1"
                  className={stage !== "error" ? "node-pulse" : ""}
                  style={{ animationDelay: `${i * -0.45}s` }}
                />
              );
            })}
            <rect x="84" y="84" width="32" height="32" rx="9" fill="#111" />
            <path d="M93 100h14M100 93v14" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {partialScore && stage !== "error" && (
          <div className="partial-score-peek">
            <span className="partial-score-value">{partialScore.value}</span>
            <span className="partial-score-denom">/10</span>
            <span className="partial-score-label">score forming</span>
          </div>
        )}

        <div className="loading-text">
          <h2
            key={stage}
            className="loading-title"
            style={{ color: stage === "error" ? "#dc2626" : undefined }}
          >
            {stage === "error" ? "Something went wrong" : "Building your blueprint"}
          </h2>
          <p key={rotatingMessage} className="loading-desc loading-desc-rotating">
            {stage === "error" ? "Please go back and try again." : rotatingMessage}
          </p>
        </div>

        {stage !== "error" && (
          <>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${smoothPct}%` }} />
            </div>

            <ul className="checklist">
              {CHECKLIST_ITEMS.map((item, i) => {
                const checked = checklistState(item.key);
                const isNext = !checked && (i === 0 || checklistState(CHECKLIST_ITEMS[i - 1].key));
                return (
                  <li key={item.key} className={checked ? "checklist-item checked" : isNext ? "checklist-item active" : "checklist-item"}>
                    <span className="checklist-icon">
                      {checked ? (
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8.5l3.2 3.2L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <span className="checklist-dot" />
                      )}
                    </span>
                    {item.label}
                    {i < CHECKLIST_ITEMS.length - 1 && (
                      <svg className="checklist-connector" width="2" height="14" viewBox="0 0 2 14">
                        <path d="M1 0v14" stroke={checked ? "#3e7f5c" : "#e3e2dd"} strokeWidth="1.5" className={checked ? "" : "checklist-connector-dash"} />
                      </svg>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {stage === "error" && <a href="/interview" className="retry-btn">← Back to interview</a>}
      </div>
      <style>{`
        .loading-root { min-height:100vh; background:#f8f8f7; display:flex; align-items:center; justify-content:center; padding:24px; font-family:'DM Sans',sans-serif; }
        .loading-card { background:#fff; border:1px solid #e8e8e5; border-radius:20px; padding:40px 40px 44px; width:100%; max-width:420px; text-align:center; animation:cardIn 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes cardIn { from{opacity:0;transform:translateY(14px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        .node-diagram-wrap { width:128px; height:128px; margin:0 auto 18px; }
        .node-diagram { width:100%; height:100%; }
        .node-orbit { transform-origin:100px 100px; animation:orbitSpin 16s linear infinite; }
        @keyframes orbitSpin { to{transform:rotate(360deg)} }
        .node-flow-dash { stroke-dasharray:2 5; animation:flowDash 1.6s linear infinite; }
        @keyframes flowDash { to{stroke-dashoffset:-14} }
        .node-pulse { animation:nodePulse 2.7s ease-in-out infinite; transform-origin:center; }
        @keyframes nodePulse { 0%,100%{fill:#fff; stroke:#cecece} 35%{fill:#111; stroke:#111} 55%{fill:#111; stroke:#111} 85%{fill:#fff; stroke:#cecece} }
        .partial-score-peek { display:flex; align-items:baseline; justify-content:center; gap:4px; margin-bottom:20px; animation:popIn 0.45s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes popIn { from{opacity:0;transform:scale(0.85) translateY(4px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .partial-score-value { font-family:'Instrument Serif',serif; font-size:38px; color:#111; line-height:1; }
        .partial-score-denom { font-size:15px; color:#bbb; }
        .partial-score-label { font-size:11px; color:#aaa; margin-left:8px; }
        .loading-text { min-height:70px; }
        .loading-title { font-size:19px; font-weight:600; color:#111; margin-bottom:8px; animation:fadeUpText 0.4s ease both; }
        .loading-desc { font-size:13.5px; color:#888; line-height:1.6; }
        .loading-desc-rotating { animation:fadeUpText 0.4s ease both; }
        @keyframes fadeUpText { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        .progress-track { width:100%; height:4px; background:#efefed; border-radius:99px; overflow:hidden; margin:22px 0 18px; position:relative; }
        .progress-fill { height:100%; background:#111; border-radius:99px; transition:width 0.4s cubic-bezier(0.4,0,0.2,1); position:relative; }
        .progress-fill::after { content:''; position:absolute; top:0; right:0; bottom:0; width:24px; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.35)); animation:shimmer 1.3s ease-in-out infinite; }
        @keyframes shimmer { 0%,100%{opacity:0.3} 50%{opacity:1} }
        .checklist { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:0; text-align:left; }
        .checklist-item { position:relative; display:flex; align-items:center; gap:10px; font-size:13px; color:#bbb; transition:color 0.3s ease; padding:5px 0; }
        .checklist-item.checked { color:#444; }
        .checklist-item.active { color:#666; }
        .checklist-icon { width:18px; height:18px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:background 0.3s ease, color 0.3s ease; background:#f0efec; color:transparent; z-index:1; position:relative; }
        .checklist-item.checked .checklist-icon { background:#111; color:#fff; animation:checkPop 0.35s cubic-bezier(0.16,1,0.3,1) both; }
        .checklist-item.active .checklist-icon { background:#fff; border:1.5px solid #111; }
        @keyframes checkPop { from{transform:scale(0.6)} to{transform:scale(1)} }
        .checklist-dot { width:5px; height:5px; border-radius:50%; background:#ddd; }
        .checklist-item.active .checklist-dot { background:#111; animation:dotPulse 1.4s ease-in-out infinite; }
        .checklist-connector { position:absolute; left:8px; top:23px; z-index:0; }
        .checklist-connector-dash { stroke-dasharray:2 3; animation:connectorFlow 1s linear infinite; }
        @keyframes connectorFlow { to{stroke-dashoffset:-5} }
        @keyframes dotPulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
        .retry-btn { display:inline-block; margin-top:8px; font-size:13px; font-weight:500; color:#111; text-decoration:none; border:1px solid #e0e0dd; border-radius:99px; padding:8px 20px; }
      `}</style>
    </main>
  );
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

function BuildEstimateCard({ estimate }: { estimate: BuildEstimate }) {
  const complexityColors: Record<Complexity, { bg: string; text: string }> = {
    Low:    { bg: "#dcfce7", text: "#166534" },
    Medium: { bg: "#fef9c3", text: "#854d0e" },
    High:   { bg: "#fee2e2", text: "#991b1b" },
  };
  return (
    <div className="build-card">
      <div className="build-header">
        <p className="build-label">⚡ Build Time Estimate</p>
        <div className="build-timelines">
          <div className="build-timeline-item">
            <span className="build-timeline-value">{estimate.soloTimeline}</span>
            <span className="build-timeline-label">Solo developer</span>
          </div>
          <div className="build-timeline-divider" />
          <div className="build-timeline-item">
            <span className="build-timeline-value">{estimate.teamTimeline}</span>
            <span className="build-timeline-label">2 developers</span>
          </div>
        </div>
      </div>
      <p className="build-summary">{estimate.summary}</p>
      <div className="build-breakdown">
        {estimate.breakdown.map((item, i) => {
          const c = complexityColors[item.complexity] ?? complexityColors.Medium;
          return (
            <div key={i} className="build-row">
              <div className="build-row-top">
                <span className="build-row-feature">{item.feature}</span>
                <div className="build-row-right">
                  <span className="complexity-pill" style={{ background: c.bg, color: c.text }}>{item.complexity}</span>
                  <span className="build-row-time">{item.soloTime}</span>
                </div>
              </div>
              <p className="build-row-note">{item.note}</p>
            </div>
          );
        })}
      </div>
      {estimate.hiddenComplexity && (
        <div className="build-warning">
          <p className="build-warning-label">⚠️ Hidden complexity</p>
          <p className="build-warning-text">{estimate.hiddenComplexity}</p>
        </div>
      )}
      {estimate.fastestPath && (
        <div className="build-fastpath">
          <p className="build-fastpath-label">🚀 Fastest path to signal</p>
          <p className="build-fastpath-text">{estimate.fastestPath}</p>
        </div>
      )}
      {estimate.recommendedStack?.length > 0 && (
        <div className="build-stack">
          <p className="build-stack-label">Recommended stack</p>
          <div className="build-stack-pills">
            {estimate.recommendedStack.map((t, i) => <span key={i} className="stack-pill">{t}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

function GtmCard({ gtm }: { gtm: GtmStrategy }) {
  const effortColors: Record<EffortLevel, { bg: string; text: string }> = {
    Low:    { bg: "#dcfce7", text: "#166534" },
    Medium: { bg: "#fef9c3", text: "#854d0e" },
    High:   { bg: "#fee2e2", text: "#991b1b" },
  };
  const channelTypeColors: Record<ChannelType, { bg: string; text: string }> = {
    Inbound:     { bg: "#eff6ff", text: "#1d4ed8" },
    Outbound:    { bg: "#faf5ff", text: "#7e22ce" },
    Community:   { bg: "#fff7ed", text: "#c2410c" },
    Paid:        { bg: "#fef9c3", text: "#854d0e" },
    Partnership: { bg: "#f0fdf4", text: "#166534" },
  };

  return (
    <div className="gtm-card">
      <p className="gtm-card-label">🚀 Go-To-Market Strategy</p>

      <div className="gtm-section">
        <p className="gtm-section-title">💰 Pricing</p>
        <div className="gtm-pricing-box">
          <div className="gtm-pricing-top">
            <span className="gtm-pricing-value">{gtm.pricingModel.recommendation}</span>
            <span className="gtm-pricing-model">{gtm.pricingModel.model}</span>
          </div>
          <p className="gtm-pricing-reason">{gtm.pricingModel.reasoning}</p>
        </div>
      </div>

      <div className="gtm-section">
        <p className="gtm-section-title">⚡ Fastest path to first paying customer</p>
        <div className="gtm-fastest-box">
          <p className="gtm-fastest-channel">{gtm.fastestChannel.channel}</p>
          <p className="gtm-fastest-why">{gtm.fastestChannel.why}</p>
        </div>
      </div>

      <div className="gtm-section">
        <p className="gtm-section-title">📋 First 100 users — step by step</p>
        <div className="gtm-playbook">
          {gtm.first100Playbook.map((step) => (
            <div key={step.step} className="gtm-step">
              <div className="gtm-step-header">
                <span className="gtm-step-num">Step {step.step}</span>
                <span className="gtm-step-action">{step.action}</span>
              </div>
              <div className="gtm-step-grid">
                <div className="gtm-step-item">
                  <span className="gtm-step-item-label">Who</span>
                  <span className="gtm-step-item-value">{step.who}</span>
                </div>
                <div className="gtm-step-item">
                  <span className="gtm-step-item-label">Where</span>
                  <span className="gtm-step-item-value">{step.where}</span>
                </div>
                <div className="gtm-step-item">
                  <span className="gtm-step-item-label">What to say</span>
                  <span className="gtm-step-item-value">{step.what}</span>
                </div>
                <div className="gtm-step-item">
                  <span className="gtm-step-item-label">Signal</span>
                  <span className="gtm-step-item-value gtm-step-signal">{step.signal}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="gtm-section">
        <p className="gtm-section-title">📡 Channels</p>
        <div className="gtm-channels">
          {gtm.channels.map((ch, i) => {
            const tc = channelTypeColors[ch.type] ?? channelTypeColors.Inbound;
            const ec = effortColors[ch.effort] ?? effortColors.Medium;
            return (
              <div key={i} className="gtm-channel-row">
                <div className="gtm-channel-top">
                  <span className="gtm-channel-name">{ch.name}</span>
                  <div className="gtm-channel-badges">
                    <span className="gtm-badge" style={{ background: tc.bg, color: tc.text }}>{ch.type}</span>
                    <span className="gtm-badge" style={{ background: ec.bg, color: ec.text }}>{ch.effort} effort</span>
                    <span className="gtm-channel-time">{ch.timeToFirstResult}</span>
                  </div>
                </div>
                <p className="gtm-channel-desc">{ch.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="gtm-section">
        <p className="gtm-section-title">🎯 North star metric</p>
        <div className="gtm-metric-box">
          <div className="gtm-metric-top">
            <span className="gtm-metric-name">{gtm.northStarMetric.metric}</span>
            <span className="gtm-metric-target">{gtm.northStarMetric.target}</span>
          </div>
          <p className="gtm-metric-why">{gtm.northStarMetric.why}</p>
        </div>
      </div>

      {gtm.gtmRisks?.length > 0 && (
        <div className="gtm-section">
          <p className="gtm-section-title">⚠️ GTM risks</p>
          <ul className="gtm-risks">
            {gtm.gtmRisks.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}
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

  function addText(text: string, fontSize: number, color: [number, number, number], bold = false, xOffset = 0) {
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    const lines = doc.splitTextToSize(text, contentWidth - xOffset);
    const lineH = fontSize * 0.45;
    checkPageBreak(lines.length * lineH + 2);
    doc.text(lines, margin + xOffset, y);
    y += lines.length * lineH + 2;
  }

  doc.setFillColor(17, 17, 17);
  doc.rect(0, 0, 210, 30, "F");
  doc.setFontSize(20); doc.setTextColor(255,255,255); doc.setFont("helvetica","bold");
  doc.text("Blueprint AI", margin, 17);
  doc.setFontSize(9); doc.setFont("helvetica","normal"); doc.setTextColor(180,180,180);
  doc.text("AI-generated startup blueprint  ·  blueprintai.com", margin, 24);
  y = 40;

  const scoreRGB: [number,number,number] = blueprint.score.confidence === "High" ? [22,101,52] : blueprint.score.confidence === "Low" ? [153,27,27] : [133,77,14];
  const scoreBgRGB: [number,number,number] = blueprint.score.confidence === "High" ? [240,253,244] : blueprint.score.confidence === "Low" ? [254,242,242] : [254,252,232];
  doc.setFillColor(...scoreBgRGB);
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, "F");
  doc.setFillColor(...scoreRGB);
  doc.roundedRect(margin, y, 3, 34, 1, 1, "F");
  doc.setFontSize(30); doc.setTextColor(17,17,17); doc.setFont("helvetica","bold");
  doc.text(`${blueprint.score.value}`, margin + 8, y + 20);
  doc.setFontSize(14); doc.setTextColor(150,150,150);
  doc.text("/10", margin + 22, y + 20);
  doc.setFontSize(10); doc.setTextColor(...scoreRGB); doc.setFont("helvetica","bold");
  doc.text(`${blueprint.score.confidence} Confidence`, margin + 42, y + 10);
  doc.setFontSize(8.5); doc.setTextColor(80,80,80); doc.setFont("helvetica","normal");
  const reasonLines = doc.splitTextToSize(blueprint.score.reason, contentWidth - 44);
  doc.text(reasonLines, margin + 42, y + 17);
  y += 42;

  if (blueprint.buildEstimate) {
    const be = blueprint.buildEstimate;
    checkPageBreak(20);
    doc.setFontSize(11); doc.setTextColor(17,17,17); doc.setFont("helvetica","bold");
    doc.text("Build Time Estimate", margin, y); y += 6;
    doc.setFontSize(9); doc.setTextColor(80,80,80); doc.setFont("helvetica","normal");
    doc.text(`Solo: ${be.soloTimeline}    |    2 devs: ${be.teamTimeline}`, margin, y); y += 6;
    addText(be.summary, 9, [85,85,85]);
    for (const item of be.breakdown) {
      checkPageBreak(14);
      doc.setFontSize(9); doc.setTextColor(34,34,34); doc.setFont("helvetica","bold");
      doc.text(`${item.feature} — ${item.soloTime} (${item.complexity})`, margin, y); y += 4.5;
      doc.setFont("helvetica","normal"); doc.setTextColor(120,120,120);
      const nl = doc.splitTextToSize(item.note, contentWidth);
      doc.text(nl, margin, y); y += nl.length * 4 + 3;
    }
    if (be.hiddenComplexity) {
      checkPageBreak(12);
      doc.setFontSize(9); doc.setTextColor(220,38,38); doc.setFont("helvetica","bold");
      doc.text("Hidden complexity:", margin, y); y += 4.5;
      addText(be.hiddenComplexity, 9, [85,85,85]);
    }
    if (be.fastestPath) {
      checkPageBreak(12);
      doc.setFontSize(9); doc.setTextColor(22,163,74); doc.setFont("helvetica","bold");
      doc.text("Fastest path to signal:", margin, y); y += 4.5;
      addText(be.fastestPath, 9, [85,85,85]);
    }
    if (be.recommendedStack?.length) {
      checkPageBreak(10);
      doc.setFontSize(9); doc.setTextColor(120,120,120); doc.setFont("helvetica","normal");
      doc.text(`Stack: ${be.recommendedStack.join(", ")}`, margin, y); y += 6;
    }
    y += 6;
    doc.setDrawColor(230,230,228); doc.line(margin, y, margin + contentWidth, y); y += 8;
  }

  if (blueprint.gtmStrategy) {
    const gtm = blueprint.gtmStrategy;
    checkPageBreak(20);
    doc.setFontSize(11); doc.setTextColor(17,17,17); doc.setFont("helvetica","bold");
    doc.text("Go-To-Market Strategy", margin, y); y += 8;
    doc.setFontSize(9); doc.setTextColor(17,17,17); doc.setFont("helvetica","bold");
    doc.text(`Pricing: ${gtm.pricingModel.recommendation} — ${gtm.pricingModel.model}`, margin, y); y += 5;
    addText(gtm.pricingModel.reasoning, 9, [85,85,85]);
    y += 2;
    doc.setFontSize(9); doc.setTextColor(17,17,17); doc.setFont("helvetica","bold");
    doc.text(`Fastest channel: ${gtm.fastestChannel.channel}`, margin, y); y += 5;
    addText(gtm.fastestChannel.why, 9, [85,85,85]);
    y += 2;
    doc.setFontSize(9); doc.setTextColor(17,17,17); doc.setFont("helvetica","bold");
    doc.text("First 100 Users Playbook", margin, y); y += 5;
    for (const step of gtm.first100Playbook) {
      checkPageBreak(20);
      doc.setFontSize(8.5); doc.setTextColor(34,34,34); doc.setFont("helvetica","bold");
      doc.text(`Step ${step.step}: ${step.action}`, margin, y); y += 4.5;
      doc.setFont("helvetica","normal"); doc.setTextColor(100,100,100);
      const stepLines = doc.splitTextToSize(`Who: ${step.who} | Where: ${step.where}`, contentWidth - 4);
      doc.text(stepLines, margin + 4, y); y += stepLines.length * 3.8 + 1;
      const whatLines = doc.splitTextToSize(`What: ${step.what}`, contentWidth - 4);
      doc.text(whatLines, margin + 4, y); y += whatLines.length * 3.8 + 1;
      const sigLines = doc.splitTextToSize(`Signal: ${step.signal}`, contentWidth - 4);
      doc.text(sigLines, margin + 4, y); y += sigLines.length * 3.8 + 3;
    }
    y += 2;
    doc.setFontSize(9); doc.setTextColor(17,17,17); doc.setFont("helvetica","bold");
    doc.text("Channels", margin, y); y += 5;
    for (const ch of gtm.channels) {
      checkPageBreak(14);
      doc.setFontSize(8.5); doc.setTextColor(34,34,34); doc.setFont("helvetica","bold");
      doc.text(`${ch.name} (${ch.type} · ${ch.effort} effort · ${ch.timeToFirstResult})`, margin, y); y += 4.5;
      doc.setFont("helvetica","normal"); doc.setTextColor(100,100,100);
      const chLines = doc.splitTextToSize(ch.description, contentWidth - 4);
      doc.text(chLines, margin + 4, y); y += chLines.length * 3.8 + 3;
    }
    y += 2;
    doc.setFontSize(9); doc.setTextColor(17,17,17); doc.setFont("helvetica","bold");
    doc.text(`North Star: ${gtm.northStarMetric.metric} — ${gtm.northStarMetric.target}`, margin, y); y += 5;
    addText(gtm.northStarMetric.why, 9, [85,85,85]);
    y += 2;
    if (gtm.gtmRisks?.length) {
      doc.setFontSize(9); doc.setTextColor(17,17,17); doc.setFont("helvetica","bold");
      doc.text("GTM Risks", margin, y); y += 5;
      for (const risk of gtm.gtmRisks) {
        checkPageBreak(8);
        doc.setFontSize(8.5); doc.setTextColor(68,68,68); doc.setFont("helvetica","normal");
        doc.text("•", margin + 2, y);
        const rl = doc.splitTextToSize(risk, contentWidth - 8);
        doc.text(rl, margin + 7, y); y += rl.length * 4 + 2;
      }
    }
    y += 6;
    doc.setDrawColor(230,230,228); doc.line(margin, y, margin + contentWidth, y); y += 8;
  }

  for (const section of blueprint.sections) {
    checkPageBreak(24);
    doc.setFillColor(17,17,17);
    doc.roundedRect(margin, y, 18, 7, 2, 2, "F");
    doc.setFontSize(7); doc.setTextColor(255,255,255); doc.setFont("helvetica","bold");
    doc.text(`  ${section.number}`, margin + 1, y + 5);
    doc.setFontSize(12); doc.setTextColor(17,17,17); doc.setFont("helvetica","bold");
    const titleLines = doc.splitTextToSize(section.title, contentWidth - 24);
    doc.text(titleLines, margin + 22, y + 5.5);
    y += 12;
    doc.setDrawColor(230,230,228); doc.line(margin, y, margin + contentWidth, y); y += 5;
    const contentLines = section.content.split("\n").filter(Boolean);
    const isList = contentLines.length > 1 && contentLines.every(l => /^[-•*\d]/.test(l.trim()));
    if (isList) {
      for (const line of contentLines) {
        checkPageBreak(8);
        doc.setFontSize(8.5); doc.setTextColor(68,68,68); doc.setFont("helvetica","normal");
        doc.text("•", margin + 2, y);
        const wrapped = doc.splitTextToSize(line.replace(/^[-•*\d.]\s*/,""), contentWidth - 8);
        doc.text(wrapped, margin + 7, y); y += wrapped.length * 4.2 + 1.5;
      }
    } else {
      addText(section.content, 9, [68,68,68]);
    }
    y += 8;
  }

  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFillColor(245,245,243); doc.rect(0,284,210,13,"F");
    doc.setFontSize(7.5); doc.setTextColor(160,160,160); doc.setFont("helvetica","normal");
    doc.text("Generated by Blueprint AI · Not financial or legal advice", margin, 291);
    doc.text(`Page ${i} of ${total}`, pageWidth - margin, 291, { align: "right" });
  }

  doc.save("blueprint.pdf");
}

// ─── BUILD THIS FOR ME MODAL ──────────────────────────────────────────────────
// Only ever opened for signed-in users now (gated upstream), so there is no
// guest-email path here anymore — it always has a real email/image to send.
type BuildModalStep = "pricing" | "yes_maybe" | "no_feedback" | "done";

function BuildThisModal({
  blueprintId,
  userEmail,
  userImageUrl,
  onClose,
}: {
  blueprintId: string | null;
  userEmail: string | null;
  userImageUrl: string | null;
  onClose: () => void;
}) {
  const [step, setStep] = useState<BuildModalStep>("pricing");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(response: "yes" | "maybe" | "no", fb?: string) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/build-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blueprint_id: blueprintId,
          response,
          feedback: fb ?? null,
          email: userEmail,
          image_url: userImageUrl,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Something went wrong");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
      setSaving(false);
      return false;
    }
    setSaving(false);
    return true;
  }

  function handleResponse(r: "yes" | "maybe" | "no") {
    if (r === "no") {
      setStep("no_feedback");
    } else {
      save(r).then((ok) => { if (ok) setStep("yes_maybe"); });
    }
  }

  async function submitFeedback() {
    const ok = await save("no", feedback);
    if (ok) setStep("done");
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box build-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="build-modal-close" onClick={onClose} aria-label="Close">×</button>

        {/* ── Pricing step ── */}
        {step === "pricing" && (
          <>
            <p className="build-modal-eyebrow">Early access</p>
            <h2 className="build-modal-title">Get this built for you</h2>
            <p className="build-modal-sub">
              We'll turn your blueprint into a working MVP — code files, GitHub repo, and deployment guide.
            </p>
            <div className="build-modal-price-card">
              <div className="build-modal-price-row">
                <span className="build-modal-price">₹20</span>
                <span className="build-modal-price-note">one-time</span>
              </div>
              <ul className="build-modal-perks">
                <li>✓ Full source code for your MVP</li>
                <li>✓ Private GitHub repo delivered to you</li>
                <li>✓ Step-by-step deployment guide</li>
              </ul>
            </div>
            <p className="build-modal-question">Are you interested?</p>
            <div className="build-modal-actions">
              <button className="build-btn-yes" onClick={() => handleResponse("yes")} disabled={saving}>Yes</button>
              <button className="build-btn-maybe" onClick={() => handleResponse("maybe")} disabled={saving}>Maybe</button>
              <button className="build-btn-no" onClick={() => handleResponse("no")} disabled={saving}>No</button>
            </div>
            {error && <p className="build-modal-error">{error}</p>}
          </>
        )}

        {/* ── Yes / Maybe confirmed ── */}
        {step === "yes_maybe" && (
          <div className="build-modal-confirm">
            <div className="build-modal-confirm-icon">🚀</div>
            <h2 className="build-modal-title">You're on the list 🎉</h2>
            <p className="build-modal-sub">
              We're launching this in the next few days. You'll be the first to know — we'll reach out on your registered email, the moment it's live.
            </p>
            <button className="build-modal-link-btn" onClick={onClose}>Back to blueprint</button>
          </div>
        )}

        {/* ── No → feedback ── */}
        {step === "no_feedback" && (
          <>
            <h2 className="build-modal-title">Got it — what would you need instead?</h2>
            <p className="build-modal-sub">Your feedback helps us build something actually useful.</p>
            <textarea
              rows={4}
              placeholder="e.g. I'd want it cheaper, or I'd prefer to build it myself with more guidance…"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="build-modal-textarea"
            />
            <button
              className="build-btn-yes"
              style={{ width: "100%" }}
              onClick={submitFeedback}
              disabled={saving || !feedback.trim()}
            >
              {saving ? "Saving…" : "Send feedback"}
            </button>
            {error && <p className="build-modal-error">{error}</p>}
          </>
        )}

        {/* ── Done (after no + feedback) ── */}
        {step === "done" && (
          <div className="build-modal-confirm">
            <div className="build-modal-confirm-icon">🙏</div>
            <h2 className="build-modal-title">Thanks for the feedback</h2>
            <p className="build-modal-sub">We read every response. This helps us build something you'd actually use.</p>
            <button className="build-modal-link-btn" onClick={onClose}>Back to blueprint</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function BlueprintPage() {
  const [loading, setLoading]               = useState(true);
  const [stage, setStage]                   = useState<Stage>("thinking");
  const [blueprint, setBlueprint]           = useState<Blueprint | null>(null);
  const [partialScore, setPartialScore]     = useState<BlueprintScore | null>(null);
  const [streamProgress, setStreamProgress] = useState<StreamProgress>({
    hasScore: false, hasBuildEstimate: false, hasGtmStrategy: false, sectionsSeen: 0,
  });
  const [saved, setSaved]                   = useState(false);
  const [blueprintId, setBlueprintId]       = useState<string | null>(null);
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [pdfLoading, setPdfLoading]         = useState(false);
  const saveAttempted                       = useRef(false);
  const { isSignedIn, isLoaded }            = useAuth();
  const { user }                            = useUser();

  // Pulled once Clerk has loaded the signed-in user; used for the Build
  // modal and sent straight to /api/build-interest so we never have to
  // ask a signed-in person to type their own email.
  const userEmail    = user?.primaryEmailAddress?.emailAddress ?? null;
  const userImageUrl = user?.imageUrl ?? null;

  useEffect(() => {
    if (!isLoaded || !blueprint || saved || saveAttempted.current) return;
    if (isSignedIn) { saveAttempted.current = true; autoSave(blueprint); }
  }, [blueprint, isSignedIn, isLoaded, saved]);

  async function autoSave(bp: Blueprint) {
    try {
      const answers = sessionStorage.getItem("blueprint-input");
      const res = await fetch("/api/save-blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, blueprint: bp, score: bp?.score?.value }),
      });
      if (res.ok) {
        const data = await res.json();
        setSaved(true);
        // capture the id so the Build modal can reference this blueprint
        if (data.id) setBlueprintId(data.id);
      }
    } catch { /* silent */ }
  }

  useEffect(() => {
    const raw = sessionStorage.getItem("blueprint-input");
    if (!raw) { setStage("error"); setLoading(false); return; }

    const cached = sessionStorage.getItem("blueprint-output");
    if (cached) {
      const parsed = parseBlueprint(cached);
      if (parsed) { setBlueprint(parsed); setStage("done"); setLoading(false); return; }
    }

    async function generateBlueprint() {
      try {
        setStage("thinking");
        await new Promise((r) => setTimeout(r, 600));
        setStage("generating");

        const res = await fetch("/api/blueprint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: raw,
        });

        if (!res.ok || !res.body) { setStage("error"); setLoading(false); return; }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        let sseBuffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          sseBuffer += decoder.decode(value, { stream: true });
          const lines = sseBuffer.split("\n");
          sseBuffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload);
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                accumulated += delta;
                const partial = tryExtractPartialScore(accumulated);
                if (partial) setPartialScore(partial);
                setStreamProgress(analyzeStreamProgress(accumulated));
              }
            } catch { /* incomplete chunk — expected */ }
          }
        }

        setStage("finalizing");
        const parsed = parseBlueprint(accumulated);
        if (!parsed) { setStage("error"); setLoading(false); return; }

        const clean = accumulated.replace(/```json|```/g, "").trim();
        sessionStorage.setItem("blueprint-output", clean);
        setBlueprint(parsed);
        setStage("done");
      } catch (err) {
        console.error("Streaming blueprint error:", err);
        setStage("error");
      } finally {
        setLoading(false);
      }
    }

    generateBlueprint();
  }, []);

  function handleCopy() {
    if (!blueprint) return;
    let text = "";
    if (blueprint.buildEstimate) {
      const be = blueprint.buildEstimate;
      text += `BUILD TIME ESTIMATE\nSolo: ${be.soloTimeline} | 2 devs: ${be.teamTimeline}\n${be.summary}\n`;
      text += be.breakdown.map(b => `- ${b.feature}: ${b.soloTime} (${b.complexity}) — ${b.note}`).join("\n");
      text += `\nHidden complexity: ${be.hiddenComplexity}\nFastest path: ${be.fastestPath}\nStack: ${be.recommendedStack.join(", ")}\n\n`;
    }
    if (blueprint.gtmStrategy) {
      const gtm = blueprint.gtmStrategy;
      text += `GO-TO-MARKET STRATEGY\n`;
      text += `Pricing: ${gtm.pricingModel.recommendation} — ${gtm.pricingModel.model}\n${gtm.pricingModel.reasoning}\n`;
      text += `Fastest channel: ${gtm.fastestChannel.channel}\n${gtm.fastestChannel.why}\n`;
      text += `\nFirst 100 Users:\n`;
      gtm.first100Playbook.forEach(s => {
        text += `Step ${s.step}: ${s.action}\n  Who: ${s.who}\n  Where: ${s.where}\n  What: ${s.what}\n  Signal: ${s.signal}\n`;
      });
      text += `\nNorth Star: ${gtm.northStarMetric.metric} — ${gtm.northStarMetric.target}\n${gtm.northStarMetric.why}\n\n`;
    }
    text += blueprint.sections.map((s) => `${s.number}. ${s.title}\n${s.content}`).join("\n\n");
    navigator.clipboard.writeText(text).catch(() => {});
  }

  function handleRegenerate() {
    sessionStorage.removeItem("blueprint-output");
    window.location.reload();
  }

  async function handleDownloadPDF() {
    if (!blueprint || pdfLoading) return;
    // Require sign-in before downloading — guests get sent to sign in,
    // then back to this same blueprint via the redirect_url param.
    if (!isSignedIn) {
      window.location.href = "/sign-in?redirect_url=/blueprint";
      return;
    }
    setPdfLoading(true);
    try { await generatePDF(blueprint); }
    finally { setPdfLoading(false); }
  }

  function handleBuildThisForMe() {
    // Require sign-in before opening the Build modal at all — no guest
    // email path anymore, just a straight redirect like Save/PDF.
    if (!isSignedIn) {
      window.location.href = "/sign-in?redirect_url=/blueprint";
      return;
    }
    setShowBuildModal(true);
  }

  if (loading || stage !== "done") return <LoadingScreen stage={stage} partialScore={partialScore} progress={streamProgress} />;
  if (!blueprint) return <LoadingScreen stage="error" partialScore={null} progress={streamProgress} />;

  return (
    <main className="bp-root">
      {/* ── Hero / header ── */}
      <div className="bp-hero">
        <div className="bp-hero-inner">
          <div className="status-badge">
            <span className="status-dot" />
            {saved ? "Blueprint saved to your dashboard" : "AI-generated startup blueprint"}
          </div>
          <h1 className="bp-hero-title">Your product blueprint</h1>
          <p className="bp-hero-sub">Score · Build estimate · GTM strategy · 12-section analysis</p>
          <div className="bp-hero-actions">
            <button className="action-btn" onClick={handleCopy}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              Copy blueprint
            </button>
            <button className="action-btn" onClick={handleRegenerate}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              Regenerate
            </button>
            <button className="action-btn" onClick={handleDownloadPDF} disabled={pdfLoading}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              {pdfLoading ? "Generating..." : "Download PDF"}
            </button>
            <a href="/interview" className="action-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New blueprint
            </a>
            {saved ? (
              <a href="/dashboard" className="action-btn save-btn">View in Dashboard →</a>
            ) : !isSignedIn ? (
              <a href="/sign-in?redirect_url=/blueprint" className="action-btn save-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Save blueprint
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="bp-meta-bar">
        <span className="meta-pill">{blueprint.sections.length} sections</span>
        <div className="meta-divider" />
        <span className="meta-text">Score · Build Estimate · GTM · ICP · MVP · Risks · 30-Day Plan</span>
      </div>

      {/* ── Score + special cards ── */}
      <div className="bp-score-wrap">
        <ScoreCard score={blueprint.score} />
        {blueprint.buildEstimate && <BuildEstimateCard estimate={blueprint.buildEstimate} />}
        {blueprint.gtmStrategy && <GtmCard gtm={blueprint.gtmStrategy} />}
      </div>

      {/* ── Sections ── */}
      <div className="bp-sections">
        {blueprint.sections.map((section, i) => (
          <SectionCard key={section.number} section={section} delay={i * 60} />
        ))}
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          BUILD THIS FOR ME — separate section below all blueprint content
      ──────────────────────────────────────────────────────────────────── */}
      <div className="build-this-section">
        <div className="build-this-inner">
          <div className="build-this-text">
            <p className="build-this-eyebrow">Skip the build</p>
            <h2 className="build-this-title">Want this built for you?</h2>
            <p className="build-this-sub">
              We can turn this blueprint into a working MVP — code, repo, and deployment guide —
              so you can launch without writing a line.
            </p>
          </div>
          <button
            className="build-this-btn"
            disabled={!!isSignedIn && !saved}
            onClick={handleBuildThisForMe}
          >
            {isSignedIn && !saved ? "Preparing…" : "Build this for me"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
      {/* ───────────────────────────────────────────────────────────────── */}

      <div className="bp-footer">
        <p>Generated by Blueprint AI · Not financial or legal advice</p>
        <a href="/interview">Start a new blueprint →</a>
      </div>

      {/* Build-this-for-me modal — only ever reached by signed-in users */}
      {showBuildModal && (
        <BuildThisModal
          blueprintId={blueprintId}
          userEmail={userEmail}
          userImageUrl={userImageUrl}
          onClose={() => setShowBuildModal(false)}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        * { box-sizing: border-box; }
        .bp-root { min-height:100vh; background:#f8f8f7; font-family:'DM Sans',sans-serif; color:#111; }
        .bp-hero { background:#fff; border-bottom:1px solid #e8e8e5; padding:56px 24px 40px; }
        .bp-hero-inner { max-width:720px; margin:0 auto; }
        .status-badge { display:inline-flex; align-items:center; gap:7px; font-size:12px; font-weight:500; color:#166534; background:#dcfce7; border-radius:99px; padding:5px 14px; margin-bottom:20px; }
        .status-dot { width:6px; height:6px; border-radius:50%; background:#16a34a; }
        .bp-hero-title { font-family:'Instrument Serif',serif; font-size:clamp(32px,5vw,48px); font-weight:400; line-height:1.12; letter-spacing:-0.5px; color:#111; margin-bottom:16px; }
        .bp-hero-sub { font-size:16px; color:#666; line-height:1.75; max-width:560px; margin-bottom:28px; }
        .bp-hero-actions { display:flex; flex-wrap:wrap; gap:10px; }
        .action-btn { display:inline-flex; align-items:center; gap:7px; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; color:#444; background:#fff; border:1px solid #e0e0dd; border-radius:99px; padding:8px 16px; cursor:pointer; text-decoration:none; transition:background 0.15s,border-color 0.15s; }
        .action-btn:hover { background:#f4f4f2; border-color:#ccc; }
        .action-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .save-btn { background:#111; color:#fff; border-color:#111; }
        .save-btn:hover { background:#333; border-color:#333; }
        .bp-meta-bar { display:flex; align-items:center; gap:12px; max-width:720px; margin:24px auto 0; padding:0 24px; }
        .meta-pill { font-size:12px; font-weight:500; color:#555; background:#efefed; border-radius:99px; padding:4px 12px; }
        .meta-divider { width:1px; height:14px; background:#ddd; }
        .meta-text { font-size:12px; color:#aaa; }
        .bp-score-wrap { max-width:720px; margin:16px auto 0; padding:0 24px; display:flex; flex-direction:column; gap:12px; }
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
        .build-card { background:#fff; border:1px solid #e8e8e5; border-radius:16px; padding:24px 28px; }
        .build-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; margin-bottom:16px; }
        .build-label { font-size:11px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:#aaa; }
        .build-timelines { display:flex; align-items:center; gap:20px; }
        .build-timeline-item { display:flex; flex-direction:column; align-items:flex-start; }
        .build-timeline-value { font-family:'Instrument Serif',serif; font-size:24px; color:#111; line-height:1.2; }
        .build-timeline-label { font-size:11px; color:#999; margin-top:2px; }
        .build-timeline-divider { width:1px; height:32px; background:#e8e8e5; }
        .build-summary { font-size:14px; color:#555; line-height:1.7; margin-bottom:18px; padding-bottom:18px; border-bottom:1px solid #f0f0ee; }
        .build-breakdown { display:flex; flex-direction:column; gap:10px; margin-bottom:18px; }
        .build-row { padding:12px 14px; background:#f8f8f7; border-radius:10px; }
        .build-row-top { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:4px; }
        .build-row-feature { font-size:13.5px; font-weight:500; color:#222; }
        .build-row-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
        .complexity-pill { font-size:10.5px; font-weight:600; border-radius:99px; padding:2px 9px; }
        .build-row-time { font-size:13px; font-weight:600; color:#111; min-width:50px; text-align:right; }
        .build-row-note { font-size:12.5px; color:#888; line-height:1.6; }
        .build-warning,.build-fastpath { border-radius:12px; padding:14px 16px; margin-bottom:12px; }
        .build-warning { background:#fff8f8; border:1px solid #fecaca; }
        .build-fastpath { background:#f0fdf4; border:1px solid #bbf7d0; }
        .build-warning-label,.build-fastpath-label { font-size:12.5px; font-weight:600; margin-bottom:4px; }
        .build-warning-label { color:#dc2626; }
        .build-fastpath-label { color:#16a34a; }
        .build-warning-text,.build-fastpath-text { font-size:13px; color:#555; line-height:1.65; }
        .build-stack-label { font-size:11px; font-weight:500; letter-spacing:0.06em; text-transform:uppercase; color:#aaa; margin-bottom:8px; }
        .build-stack-pills { display:flex; flex-wrap:wrap; gap:6px; }
        .stack-pill { font-size:12px; font-weight:500; color:#444; background:#efefed; border-radius:99px; padding:4px 12px; }
        .gtm-card { background:#fff; border:1px solid #e8e8e5; border-radius:16px; padding:24px 28px; }
        .gtm-card-label { font-size:11px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:#aaa; margin-bottom:20px; }
        .gtm-section { margin-bottom:24px; padding-bottom:24px; border-bottom:1px solid #f0f0ee; }
        .gtm-section:last-child { margin-bottom:0; padding-bottom:0; border-bottom:none; }
        .gtm-section-title { font-size:13px; font-weight:600; color:#111; margin-bottom:12px; }
        .gtm-pricing-box { background:#f8f8f7; border-radius:12px; padding:16px 18px; }
        .gtm-pricing-top { display:flex; align-items:baseline; gap:12px; margin-bottom:8px; flex-wrap:wrap; }
        .gtm-pricing-value { font-family:'Instrument Serif',serif; font-size:22px; color:#111; }
        .gtm-pricing-model { font-size:12px; font-weight:500; color:#888; background:#efefed; border-radius:99px; padding:3px 10px; }
        .gtm-pricing-reason { font-size:13px; color:#666; line-height:1.65; }
        .gtm-fastest-box { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:14px 16px; }
        .gtm-fastest-channel { font-size:14px; font-weight:600; color:#166534; margin-bottom:6px; }
        .gtm-fastest-why { font-size:13px; color:#555; line-height:1.65; }
        .gtm-playbook { display:flex; flex-direction:column; gap:10px; }
        .gtm-step { background:#f8f8f7; border-radius:12px; padding:14px 16px; }
        .gtm-step-header { display:flex; align-items:flex-start; gap:10px; margin-bottom:10px; }
        .gtm-step-num { font-size:10.5px; font-weight:700; color:#fff; background:#111; border-radius:99px; padding:2px 9px; flex-shrink:0; margin-top:1px; }
        .gtm-step-action { font-size:13.5px; font-weight:500; color:#111; line-height:1.4; }
        .gtm-step-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .gtm-step-item { display:flex; flex-direction:column; gap:2px; }
        .gtm-step-item-label { font-size:10px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:#bbb; }
        .gtm-step-item-value { font-size:12.5px; color:#555; line-height:1.5; }
        .gtm-step-signal { color:#166534; font-weight:500; }
        .gtm-channels { display:flex; flex-direction:column; gap:10px; }
        .gtm-channel-row { background:#f8f8f7; border-radius:10px; padding:12px 14px; }
        .gtm-channel-top { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:6px; flex-wrap:wrap; }
        .gtm-channel-name { font-size:13.5px; font-weight:500; color:#222; }
        .gtm-channel-badges { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
        .gtm-badge { font-size:10.5px; font-weight:600; border-radius:99px; padding:2px 9px; }
        .gtm-channel-time { font-size:11px; color:#999; }
        .gtm-channel-desc { font-size:12.5px; color:#888; line-height:1.6; }
        .gtm-metric-box { background:#f8f8f7; border-radius:12px; padding:14px 16px; }
        .gtm-metric-top { display:flex; align-items:baseline; gap:12px; margin-bottom:6px; flex-wrap:wrap; }
        .gtm-metric-name { font-size:14px; font-weight:600; color:#111; }
        .gtm-metric-target { font-size:12px; font-weight:500; color:#555; background:#efefed; border-radius:99px; padding:3px 10px; }
        .gtm-metric-why { font-size:13px; color:#666; line-height:1.65; }
        .gtm-risks { padding-left:18px; margin:0; display:flex; flex-direction:column; gap:6px; }
        .gtm-risks li { font-size:13px; color:#555; line-height:1.6; }
        .bp-sections { max-width:720px; margin:0 auto; padding:16px 24px 0; display:flex; flex-direction:column; gap:12px; }
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

        /* ── Build This For Me section ── */
        .build-this-section { max-width:720px; margin:32px auto 0; padding:0 24px 48px; }
        .build-this-inner { background:#111; border-radius:20px; padding:36px 40px; display:flex; align-items:center; justify-content:space-between; gap:24px; flex-wrap:wrap; }
        .build-this-text { flex:1; min-width:220px; }
        .build-this-eyebrow { font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#888; margin-bottom:8px; }
        .build-this-title { font-family:'Instrument Serif',serif; font-size:26px; font-weight:400; color:#fff; line-height:1.2; margin-bottom:10px; }
        .build-this-sub { font-size:14px; color:#888; line-height:1.7; max-width:380px; }
        .build-this-btn { display:inline-flex; align-items:center; gap:8px; background:#fff; color:#111; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; border:none; border-radius:99px; padding:13px 24px; cursor:pointer; white-space:nowrap; transition:background 0.15s,transform 0.1s; flex-shrink:0; }
        .build-this-btn:hover { background:#f0f0ee; transform:translateY(-1px); }
        .build-this-btn:active { transform:translateY(0); }
        .build-this-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; }

        /* ── Build modal ── */
        .build-modal-box { max-width:400px; text-align:left; }
        .build-modal-close { position:absolute; top:16px; right:18px; background:none; border:none; font-size:22px; color:#aaa; cursor:pointer; line-height:1; padding:4px; }
        .build-modal-close:hover { color:#555; }
        .build-modal-eyebrow { font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#6366f1; margin-bottom:8px; }
        .build-modal-title { font-size:20px; font-weight:700; color:#111; margin-bottom:8px; }
        .build-modal-sub { font-size:14px; color:#666; line-height:1.65; margin-bottom:20px; }
        .build-modal-price-card { background:#f5f5ff; border:1px solid #e0e0ff; border-radius:14px; padding:18px 20px; margin-bottom:20px; }
        .build-modal-price-row { display:flex; align-items:baseline; gap:8px; margin-bottom:10px; }
        .build-modal-price { font-family:'Instrument Serif',serif; font-size:36px; color:#111; line-height:1; }
        .build-modal-price-note { font-size:13px; color:#999; }
        .build-modal-perks { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:6px; }
        .build-modal-perks li { font-size:13px; color:#444; }
        .build-modal-question { font-size:13px; font-weight:600; color:#111; text-align:center; margin-bottom:12px; }
        .build-modal-actions { display:flex; gap:10px; }
        .build-btn-yes { flex:1; background:#111; color:#fff; border:none; border-radius:10px; padding:11px; font-size:14px; font-weight:600; cursor:pointer; transition:background 0.15s; }
        .build-btn-yes:hover:not(:disabled) { background:#333; }
        .build-btn-yes:disabled { opacity:0.5; cursor:not-allowed; }
        .build-btn-maybe,.build-btn-no { flex:1; background:#f4f4f2; color:#444; border:1px solid #e0e0dd; border-radius:10px; padding:11px; font-size:14px; font-weight:500; cursor:pointer; transition:background 0.15s; }
        .build-btn-maybe:hover:not(:disabled),.build-btn-no:hover:not(:disabled) { background:#eaeae8; }
        .build-btn-maybe:disabled,.build-btn-no:disabled { opacity:0.5; cursor:not-allowed; }
        .build-modal-input { width:100%; border:1px solid #e0e0dd; border-radius:10px; padding:11px 14px; font-size:14px; font-family:'DM Sans',sans-serif; outline:none; margin-bottom:14px; }
        .build-modal-input:focus { border-color:#999; }
        .build-modal-textarea { width:100%; border:1px solid #e0e0dd; border-radius:10px; padding:11px 14px; font-size:14px; font-family:'DM Sans',sans-serif; outline:none; resize:none; margin-bottom:14px; }
        .build-modal-textarea:focus { border-color:#999; }
        .build-modal-confirm { text-align:center; padding:12px 0; }
        .build-modal-confirm-icon { font-size:40px; margin-bottom:14px; }
        .build-modal-link-btn { background:none; border:none; font-size:13px; color:#999; cursor:pointer; margin-top:16px; text-decoration:underline; }
        .build-modal-link-btn:hover { color:#555; }
        .build-modal-error { font-size:13px; color:#dc2626; text-align:center; margin-top:10px; }

        .bp-footer { max-width:720px; margin:0 auto; padding:24px 24px 48px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; border-top:1px solid #e8e8e5; }
        .bp-footer p { font-size:12px; color:#bbb; }
        .bp-footer a { font-size:13px; font-weight:500; color:#111; text-decoration:none; }
        .bp-footer a:hover { text-decoration:underline; }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:100; padding:24px; }
        .modal-box { position:relative; background:#fff; border-radius:20px; padding:32px; width:100%; text-align:center; }
        .modal-title { font-size:20px; font-weight:600; color:#111; margin-bottom:8px; }
        .modal-sub { font-size:14px; color:#666; line-height:1.6; margin-bottom:24px; }
        .modal-actions { display:flex; flex-direction:column; gap:10px; }
        .modal-btn-primary { display:block; background:#111; color:#fff; border-radius:99px; padding:12px; font-size:14px; font-weight:500; text-decoration:none; transition:background 0.15s; }
        .modal-btn-primary:hover { background:#333; }
        .modal-btn-secondary { background:none; border:1px solid #e0e0dd; border-radius:99px; padding:12px; font-size:14px; color:#666; cursor:pointer; transition:background 0.15s; }
        .modal-btn-secondary:hover { background:#f4f4f2; }
        @media (max-width:600px) {
          .bp-hero { padding:40px 20px 32px; }
          .section-card { padding:22px 18px 20px; }
          .bp-sections { padding:16px 16px 0; }
          .build-this-section { padding:0 16px 40px; }
          .build-this-inner { flex-direction:column; align-items:flex-start; padding:28px 24px; }
          .score-card { flex-direction:column; gap:16px; }
          .build-card,.gtm-card { padding:20px 18px; }
          .build-header { flex-direction:column; align-items:flex-start; }
          .gtm-step-grid { grid-template-columns:1fr; }
          .build-modal-actions { flex-direction:column; }
        }
      `}</style>
    </main>
  );
}