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
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-10 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">

          <div className="flex justify-center mb-6">
            <div className="h-14 w-14 rounded-2xl bg-black text-white flex items-center justify-center text-xl font-bold">
              AI
            </div>
          </div>

          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-6">
            <div className="bg-black h-full w-2/3 animate-pulse rounded-full" />
          </div>

          <div className="text-center">

            {stage === "thinking" && (
              <>
                <h2 className="text-2xl font-semibold text-black">
                  Thinking like a founder
                </h2>

                <p className="text-gray-500 mt-3 leading-7">
                  Understanding your users, pain points,
                  and startup opportunity.
                </p>
              </>
            )}

            {stage === "generating" && (
              <>
                <h2 className="text-2xl font-semibold text-black">
                  Generating Blueprint
                </h2>

                <p className="text-gray-500 mt-3 leading-7">
                  Designing your MVP, market strategy,
                  and product structure.
                </p>
              </>
            )}

            {stage === "finalizing" && (
              <>
                <h2 className="text-2xl font-semibold text-black">
                  Finalizing Output
                </h2>

                <p className="text-gray-500 mt-3 leading-7">
                  Structuring everything into a readable
                  startup blueprint.
                </p>
              </>
            )}

            {stage === "error" && (
              <>
                <h2 className="text-2xl font-semibold text-red-500">
                  Something went wrong
                </h2>

                <p className="text-gray-500 mt-3">
                  Please try again.
                </p>
              </>
            )}

          </div>
        </div>
      </main>
    );
  }

  // ---------- FORMAT BLUEPRINT ----------

  const sections = blueprint
    .split(/\d+\.\s/)
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