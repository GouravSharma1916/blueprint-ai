"use client";

import { useEffect, useState } from "react";
import { useAuth, UserButton } from "@clerk/nextjs";
import Link from "next/link";

interface BlueprintScore {
  value: number;
  confidence: "High" | "Medium" | "Low";
  reason: string;
}

interface BlueprintSection {
  number: number;
  title: string;
  content: string;
}

interface Blueprint {
  score: BlueprintScore;
  sections: BlueprintSection[];
}

interface SavedBlueprint {
  id: string;
  score: number;
  blueprint: Blueprint;
  answers: Record<string, string>;
  created_at: string;
}

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const [blueprints, setBlueprints] = useState<SavedBlueprint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      window.location.href = "/sign-in";
      return;
    }
    fetch("/api/get-blueprints")
      .then((r) => r.json())
      .then((data) => {
        setBlueprints(data.blueprints || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isLoaded, isSignedIn]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  }

  function confidenceColor(c: string) {
    if (c === "High") return { bg: "#dcfce7", text: "#166534", dot: "#16a34a" };
    if (c === "Low")  return { bg: "#fee2e2", text: "#991b1b", dot: "#dc2626" };
    return { bg: "#fef9c3", text: "#854d0e", dot: "#ca8a04" };
  }

  if (!isLoaded || loading) {
    return (
      <main className="dash-loading">
        <div className="dash-spinner" />
        <p>Loading your blueprints...</p>
        <style>{`
          .dash-loading { min-height:100vh; background:#f8f8f7; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; font-family:'DM Sans',sans-serif; color:#888; font-size:14px; }
          .dash-spinner { width:28px; height:28px; border:2px solid #e0e0dd; border-top-color:#111; border-radius:50%; animation:spin 0.7s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </main>
    );
  }

  return (
    <main className="dash-root">

      {/* NAVBAR */}
      <nav className="dash-nav">
        <div className="dash-nav-inner">
          <Link href="/" className="dash-logo">Blueprint AI</Link>
          <div className="dash-nav-right">
            <Link href="/interview" className="dash-new-btn">+ New blueprint</Link>
            <UserButton />
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <div className="dash-header">
        <div className="dash-header-inner">
          <h1 className="dash-title">Your Blueprints</h1>
          <p className="dash-sub">
            {blueprints.length === 0
              ? "No blueprints saved yet."
              : `${blueprints.length} blueprint${blueprints.length > 1 ? "s" : ""} saved`}
          </p>
        </div>
      </div>

      {/* EMPTY STATE */}
      {blueprints.length === 0 && (
        <div className="dash-empty">
          <div className="dash-empty-icon">📄</div>
          <h2>No blueprints yet</h2>
          <p>Run an interview and save your first blueprint.</p>
          <Link href="/interview" className="dash-empty-btn">Start an interview →</Link>
        </div>
      )}

      {/* BLUEPRINT CARDS */}
      <div className="dash-grid">
        {blueprints.map((bp) => {
          const conf = bp.blueprint?.score?.confidence ?? "Medium";
          const colors = confidenceColor(conf);
          const summary = bp.blueprint?.sections?.[0]?.content ?? "";

          return (
            <div
              key={bp.id}
              className="dash-card"
              onClick={() => window.location.href = `/blueprint/${bp.id}`}
            >
              <div className="dash-card-inner">
                <div className="dash-card-left">
                  <div className="dash-score-row">
                    <span className="dash-score">{bp.blueprint?.score?.value ?? bp.score}</span>
                    <span className="dash-score-denom">/10</span>
                    <div className="dash-conf-badge" style={{ background: colors.bg, color: colors.text }}>
                      <span className="dash-conf-dot" style={{ background: colors.dot }} />
                      {conf}
                    </div>
                  </div>
                  <p className="dash-card-summary">
                    {summary.slice(0, 140)}{summary.length > 140 ? "..." : ""}
                  </p>
                  <p className="dash-card-date">{formatDate(bp.created_at)}</p>
                </div>
                <div className="dash-card-arrow">→</div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        * { box-sizing: border-box; }
        .dash-root { min-height:100vh; background:#f8f8f7; font-family:'DM Sans',sans-serif; color:#111; }

        .dash-nav { background:#fff; border-bottom:1px solid #e8e8e5; padding:0 24px; height:60px; display:flex; align-items:center; }
        .dash-nav-inner { max-width:800px; width:100%; margin:0 auto; display:flex; align-items:center; justify-content:space-between; }
        .dash-logo { font-size:16px; font-weight:600; color:#111; text-decoration:none; }
        .dash-nav-right { display:flex; align-items:center; gap:16px; }
        .dash-new-btn { font-size:13px; font-weight:500; color:#fff; background:#111; border-radius:99px; padding:7px 16px; text-decoration:none; transition:background 0.15s; }
        .dash-new-btn:hover { background:#333; }

        .dash-header { background:#fff; border-bottom:1px solid #e8e8e5; padding:40px 24px 32px; }
        .dash-header-inner { max-width:800px; margin:0 auto; }
        .dash-title { font-family:'Instrument Serif',serif; font-size:36px; font-weight:400; color:#111; margin-bottom:6px; }
        .dash-sub { font-size:14px; color:#888; }

        .dash-empty { max-width:800px; margin:80px auto; text-align:center; padding:0 24px; }
        .dash-empty-icon { font-size:40px; margin-bottom:16px; }
        .dash-empty h2 { font-size:22px; font-weight:600; color:#111; margin-bottom:8px; }
        .dash-empty p { font-size:14px; color:#888; margin-bottom:24px; }
        .dash-empty-btn { display:inline-block; font-size:13px; font-weight:500; color:#fff; background:#111; border-radius:99px; padding:10px 24px; text-decoration:none; }

        .dash-grid { max-width:800px; margin:24px auto; padding:0 24px 48px; display:flex; flex-direction:column; gap:12px; }

        .dash-card { background:#fff; border:1px solid #e8e8e5; border-radius:16px; overflow:hidden; cursor:pointer; transition:box-shadow 0.2s, border-color 0.2s; }
        .dash-card:hover { box-shadow:0 4px 20px rgba(0,0,0,0.08); border-color:#d0cfc9; }
        .dash-card-inner { padding:24px; display:flex; align-items:flex-start; justify-content:space-between; gap:16px; }
        .dash-card-left { flex:1; }

        .dash-score-row { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
        .dash-score { font-family:'Instrument Serif',serif; font-size:36px; line-height:1; color:#111; }
        .dash-score-denom { font-size:16px; color:#bbb; margin-top:4px; }
        .dash-conf-badge { display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:500; border-radius:99px; padding:4px 10px; }
        .dash-conf-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }

        .dash-card-summary { font-size:14px; color:#555; line-height:1.65; margin-bottom:8px; }
        .dash-card-date { font-size:12px; color:#aaa; }
        .dash-card-arrow { font-size:18px; color:#ccc; padding-top:6px; flex-shrink:0; transition:color 0.2s; }
        .dash-card:hover .dash-card-arrow { color:#111; }

        @media (max-width:600px) {
          .dash-header { padding:28px 16px 24px; }
          .dash-grid { padding:0 16px 40px; }
          .dash-card-inner { padding:18px; }
        }
      `}</style>
    </main>
  );
}