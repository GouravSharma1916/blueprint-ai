"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function BlueprintPage() {
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState("thinking");
  const [blueprint, setBlueprint] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("blueprint-input");

    if (!raw) {
      setBlueprint("No interview data found.");
      setLoading(false);
      return;
    }

    const cached = sessionStorage.getItem("blueprint-output");

    if (cached) {
      setBlueprint(cached);
      setLoading(false);
      setStage("done");
      return;
    }

    async function generateBlueprint() {
      try {
        setStage("thinking");

        await new Promise((r) => setTimeout(r, 800));

        setStage("generating");

        const res = await fetch("/api/blueprint", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: raw,
        });

        const data = await res.json();

        setStage("finalizing");

        await new Promise((r) => setTimeout(r, 500));

        sessionStorage.setItem(
          "blueprint-output",
          data.blueprint
        );

        setBlueprint(data.blueprint);
        setStage("done");
      } catch (err) {
        setBlueprint("Error generating blueprint.");
        setStage("error");
      } finally {
        setLoading(false);
      }
    }

    generateBlueprint();
  }, []);





// ---------- LOADING UI ----------

if (loading || stage !== "done") {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black flex items-center justify-center px-6">

      {/* BACKGROUND GLOW */}

      <div className="absolute inset-0 overflow-hidden">

        <div className="absolute top-[-120px] left-[-120px] w-[320px] h-[320px] bg-white/10 blur-3xl rounded-full animate-pulse" />

        <div className="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] bg-white/5 blur-3xl rounded-full animate-pulse" />

      </div>

      {/* MAIN CARD */}

      <div className="relative z-10 max-w-xl w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-[0_0_80px_rgba(255,255,255,0.05)]">

        {/* TOP BADGE */}

        <div className="flex items-center justify-center mb-8">

          <div className="relative">

            <div className="absolute inset-0 rounded-full bg-white/20 blur-xl animate-pulse" />

            <div className="relative h-20 w-20 rounded-full border border-white/20 bg-white/10 flex items-center justify-center">

              {stage === "thinking" && (
                <div className="h-4 w-4 rounded-full bg-white animate-ping" />
              )}

              {stage === "generating" && (
<div className="h-8 w-8 border-2 border-white rounded-xl rotate-12 animate-[spin_4s_linear_infinite]" />
              )}

              {stage === "finalizing" && (
                <div className="text-white text-3xl font-bold">
                  ✓
                </div>
              )}

              {stage === "error" && (
                <div className="text-red-400 text-3xl font-bold">
                  !
                </div>
              )}

            </div>

          </div>

        </div>

        {/* PROGRESS */}

        <div className="mb-8">

          <div className="flex justify-between text-sm text-gray-400 mb-3">
            <span>AI Processing</span>

            <span>
{stage === "thinking" && "18%"}
{stage === "generating" && "67%"}
{stage === "finalizing" && "92%"}
              {stage === "error" && "Failed"}
            </span>
          </div>

          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">

            <div
              className={`
                h-full rounded-full transition-all duration-700
                bg-white
                ${stage === "thinking" ? "w-1/4" : ""}
                ${stage === "generating" ? "w-[70%]" : ""}
                ${stage === "finalizing" ? "w-[95%]" : ""}
                ${stage === "error" ? "w-full bg-red-400" : ""}
              `}
            />

          </div>

        </div>

        {/* CONTENT */}

<div className="text-center transition-all duration-500">


          {stage === "thinking" && (
            <>
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-4">
                Discovery Phase
              </p>

              <h2 className="text-4xl font-bold text-white leading-tight">
                Understanding Your Startup
              </h2>

              <p className="text-gray-400 mt-5 leading-8 text-lg">
                Studying your market opportunity,
                founder intent, user pain points,
                and competitive positioning.
              </p>
            </>
          )}

          {stage === "generating" && (
            <>
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-4">
                Architecture Phase
              </p>

              <h2 className="text-4xl font-bold text-white leading-tight">
                Designing Product Systems
              </h2>

              <p className="text-gray-400 mt-5 leading-8 text-lg">
                Structuring your MVP roadmap,
                monetization strategy,
                and product experience.
              </p>
            </>
          )}

          {stage === "finalizing" && (
            <>
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-4">
                Strategy Phase
              </p>

              <h2 className="text-4xl font-bold text-white leading-tight">
                Preparing Execution Blueprint
              </h2>

              <p className="text-gray-400 mt-5 leading-8 text-lg">
                Transforming startup intelligence
                into a clear execution-ready
                product blueprint.
              </p>
            </>
          )}

          {stage === "error" && (
            <>
              <h2 className="text-4xl font-bold text-red-400">
                Something went wrong
              </h2>

              <p className="text-gray-400 mt-5 text-lg">
                Please try again.
              </p>
            </>
          )}

        </div>

        {/* AI THINKING BOX */}

        {stage !== "error" && (
          <div className="mt-10 border border-white/10 rounded-2xl bg-white/[0.03] p-5">

            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-4">
              AI Analysis
            </p>

            <div className="space-y-3 text-sm">

              <div className="flex items-center gap-3 text-gray-300">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                Market opportunity identified
              </div>

              <div className="flex items-center gap-3 text-gray-300">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                User pain points mapped
              </div>

              <div className="flex items-center gap-3 text-gray-300">
                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />

                {stage === "thinking" &&
                  "Analyzing startup signals..."}

                {stage === "generating" &&
                  "Generating MVP architecture..."}

                {stage === "finalizing" &&
                  "Finalizing execution strategy..."}
              </div>

            </div>

          </div>
        )}

      </div>

    </main>
  );
}



  // ---------- FORMAT BLUEPRINT ----------

const sections = blueprint
  .split(/\n(?=\d+\.\s)/)
  .filter(Boolean);


  // ---------- FINAL UI ----------

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">

      <div className="max-w-4xl mx-auto">

        {/* HERO SECTION */}

        <div className="mb-12">

          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-600 mb-6 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            AI Generated Startup Blueprint
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-black leading-tight">
            Your AI Product Blueprint
          </h1>

          <p className="text-gray-500 text-lg mt-5 max-w-2xl leading-8">
            Structured product thinking for startup founders.
            Designed to help you understand your users,
            define your MVP, and build faster.
          </p>

        </div>

        {/* SECTIONS */}

        <div className="space-y-6">

          {sections.map((section, index) => {
            const lines = section.trim().split("\n");

            const title = lines[0];

            const content = lines
              .slice(1)
              .join("\n")
              .trim();

            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-2xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_18px_rgba(0,0,0,0.06)] transition-all duration-300"
              >

                {/* HEADER */}

                <div className="flex items-start justify-between gap-4 mb-6">

                  <div>
                    <p className="text-sm text-gray-400 mb-2">
                      Section {index + 1}
                    </p>

                    <h2 className="text-2xl font-semibold text-black">
                      {title}
                    </h2>
                  </div>

                  <div className="min-w-[42px] h-[42px] rounded-xl bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                    {index + 1}
                  </div>

                </div>

                {/* CONTENT */}

                <div className="prose prose-gray max-w-none prose-p:leading-8 prose-p:text-gray-700 prose-headings:text-black prose-strong:text-black prose-li:leading-8">

                  <ReactMarkdown>
                    {content}
                  </ReactMarkdown>

                </div>

              </div>
            );
          })}

        </div>

      </div>
    </main>
  );
}