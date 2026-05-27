import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f5f2] text-[#1a1a1a]">

      {/* HERO */}
      <section className="px-6 pt-20 pb-16 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center">

          <div className="inline-flex items-center rounded-full border border-gray-300 px-4 py-1 text-xs tracking-wide text-gray-600 bg-white">
            AI-POWERED PRODUCT PLANNING
          </div>

          <h1 className="mt-8 text-5xl md:text-7xl font-serif leading-tight tracking-tight">
            Turn your idea into a{" "}
            <span className="italic">startup blueprint</span>{" "}
            in minutes
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We interview you about your idea and generate a complete
            product blueprint — features, structure, and execution plan.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">

            <a
              href="/interview"
              className="inline-flex items-center gap-2 rounded-xl border border-black bg-black px-6 py-3 text-white transition hover:scale-105"
            >
              Start your blueprint
              <ArrowRight className="h-4 w-4" />
            </a>

            <button className="rounded-xl border border-gray-300 bg-white px-6 py-3 hover:bg-gray-50 transition">
              See a sample
            </button>

          </div>

          <p className="mt-6 text-sm text-gray-500">
            No signup required ・ 2-minute interview ・ Instant output
          </p>

        </div>
      </section>

      {/* PROCESS */}
      <section className="border-b border-gray-200 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-4 text-sm text-gray-500 flex-wrap px-6">
          <span>Your idea</span>
          <span>→</span>
          <span>AI interview</span>
          <span>→</span>
          <span>Analysis</span>
          <span>→</span>
          <span>Blueprint</span>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3">

          <div className="py-10 text-center border-b md:border-b-0 md:border-r border-gray-200">
            <h2 className="text-5xl font-serif">2,400+</h2>
            <p className="mt-2 text-gray-500">blueprints generated</p>
          </div>

          <div className="py-10 text-center border-b md:border-b-0 md:border-r border-gray-200">
            <h2 className="text-5xl font-serif">~2 min</h2>
            <p className="mt-2 text-gray-500">average interview time</p>
          </div>

          <div className="py-10 text-center">
            <h2 className="text-5xl font-serif">94%</h2>
            <p className="mt-2 text-gray-500">found it useful</p>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 border-b border-gray-200">
        <div className="max-w-6xl mx-auto">

          <p className="text-sm tracking-wide text-gray-500 uppercase">
            How it works
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">

            {[
              {
                number: "01",
                title: "Describe your idea",
                desc: "Tell us what problem you want to solve. No deck or doc needed — just your thoughts."
              },
              {
                number: "02",
                title: "Answer a few questions",
                desc: "Our AI interviews you to understand your target user, market, and vision."
              },
              {
                number: "03",
                title: "Get your blueprint",
                desc: "Receive a structured plan with features, tech stack, market analysis, and next steps."
              }
            ].map((item) => (
              <div
                key={item.number}
                className="rounded-3xl bg-[#efede7] p-8"
              >
                <div className="text-5xl font-serif text-gray-500">
                  {item.number}
                </div>

                <h3 className="mt-6 text-xl font-medium">
                  {item.title}
                </h3>

                <p className="mt-4 text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* SAMPLE OUTPUT */}
      <section className="py-20 px-6 border-b border-gray-200">

        <div className="max-w-6xl mx-auto">

          <p className="text-sm tracking-wide text-gray-500 uppercase">
            Sample Blueprint Output
          </p>

          <div className="mt-10 rounded-3xl border border-gray-300 bg-[#f1efe9] overflow-hidden">

            <div className="border-b border-gray-300 px-6 py-4 bg-white flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />

              <p className="ml-4 text-sm text-gray-600">
                Blueprint — FocusFlow: async team standup tool
              </p>
            </div>

            <div className="p-6 space-y-6">

              <div className="rounded-2xl border border-gray-300 bg-white p-6">
                <h4 className="text-sm uppercase tracking-wide text-gray-500">
                  Core Features
                </h4>

                <ul className="mt-4 space-y-3 text-gray-700">
                  <li>• Async video standups with AI summaries</li>
                  <li>• Slack + Notion integration</li>
                  <li>• Team pulse dashboard</li>
                  <li>• AI-generated blocker detection</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="rounded-2xl border border-gray-300 bg-white p-6">
                  <h4 className="text-sm uppercase tracking-wide text-gray-500">
                    Tech Stack
                  </h4>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      "Next.js",
                      "Supabase",
                      "OpenAI",
                      "Stripe",
                      "Vercel"
                    ].map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-gray-300 px-3 py-1 text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-300 bg-white p-6">
                  <h4 className="text-sm uppercase tracking-wide text-gray-500">
                    Market Score
                  </h4>

                  <div className="mt-4 space-y-4">

                    {[
                      ["Demand", "82%"],
                      ["Feasibility", "75%"],
                      ["Competition", "60%"]
                    ].map(([label, value]) => (
                      <div key={label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{label}</span>
                          <span>{value}</span>
                        </div>

                        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className="h-full bg-black rounded-full"
                            style={{ width: value }}
                          />
                        </div>
                      </div>
                    ))}

                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-6 border-b border-gray-200">

        <div className="max-w-6xl mx-auto">

          <p className="text-sm tracking-wide text-gray-500 uppercase">
            What founders say
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">

            {[
              "Went from a vague concept to a real execution plan in minutes.",
              "The market scoring was surprisingly accurate.",
              "I use this before every side project now.",
              "The week-one plan alone was worth it."
            ].map((quote, index) => (
              <div
                key={index}
                className="rounded-3xl bg-[#efede7] p-8"
              >
                <p className="text-lg leading-relaxed text-gray-700">
                  "{quote}"
                </p>

                <div className="mt-6 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white border border-gray-300" />

                  <div>
                    <p className="font-medium">Founder</p>
                    <p className="text-sm text-gray-500">
                      Startup builder
                    </p>
                  </div>
                </div>

              </div>
            ))}

          </div>
        </div>

      </section>

      {/* FAQ */}
      <section className="py-20 px-6 border-b border-gray-200">

        <div className="max-w-4xl mx-auto">

          <p className="text-sm tracking-wide text-gray-500 uppercase">
            Common Questions
          </p>

          <div className="mt-10 space-y-4">

            {[
              "What do I need to prepare before starting?",
              "How long does the interview take?",
              "Is my idea kept private?",
              "Can I generate a blueprint for an existing project?"
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-gray-300 bg-white px-6 py-5 flex items-center justify-between"
              >
                <span>{item}</span>
                <span>+</span>
              </div>
            ))}

          </div>
        </div>

      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">

        <div className="max-w-3xl mx-auto">

          <h2 className="text-5xl font-serif">
            Ready to blueprint your idea?
          </h2>

          <p className="mt-6 text-lg text-gray-600">
            Takes 2 minutes. No account needed.
            Walk away with a full execution plan.
          </p>

          <a
            href="/interview"
            className="mt-10 inline-flex items-center gap-2 rounded-2xl border border-black bg-black px-8 py-4 text-white transition hover:scale-105"
          >
            Start your blueprint
            <ArrowRight className="h-4 w-4" />
          </a>

          <p className="mt-6 text-sm text-gray-400">
             Built by Krishna AI
          </p>

        </div>

      </section>

    </main>
  );
}