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
  Stop guessing what to build. Get a{" "}
  <span className="italic">structured product blueprint</span>{" "}
  in minutes.
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
Talk to your AI product strategist
              <ArrowRight className="h-4 w-4" />
            </a>

           

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
<section className="py-12 px-6 border-b border-gray-200 bg-white">
  <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">

    {[
      { number: "50+", label: "Early users tested" },
      { number: "1 min", label: "Average time to blueprint" },
      { number: "Founders", label: "Engineers • Designers • Builders" },
    ].map((stat) => (
      <div key={stat.label}>
        <p className="text-4xl font-serif text-black">{stat.number}</p>
        <p className="mt-2 text-sm text-gray-500">{stat.label}</p>
      </div>
    ))}

  </div>
</section>



{/* TRUSTED BY */}
<section className="py-10 px-6 border-b border-gray-200 bg-white">
  <div className="max-w-4xl mx-auto text-center">

    <p className="text-xs tracking-widest text-gray-400 uppercase">
      Built for founders, engineers & designers
    </p>

    <div className="mt-6 flex items-center justify-center gap-10 flex-wrap">
      {["Solo Founders", "Indie Builders", "Startup Teams", "Product Designers"].map((name) => (
        <span key={name} className="text-sm font-medium text-gray-400">
          {name}
        </span>
      ))}
    </div>

  </div>
</section>








{/* WHY NOW */}
      <section className="py-20 px-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm tracking-wide text-gray-500 uppercase">Why now</p>
          <h2 className="mt-4 text-4xl md:text-5xl font-serif tracking-tight">
            The barrier to starting is low.{" "}
            <span className="italic">
              The barrier to starting right is still high.
            </span>
          </h2>
 
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "More builders than ever",
                desc: "Solo founders are shipping more than ever — but 90% still skip structured product discovery and build the wrong thing first.",
              },
              {
                title: "AI makes it possible",
                desc: "AI now delivers the structured thinking of a $500/hr product consultant in 2 minutes — without needing to know how to prompt perfectly.",
              },
              {
                title: "The cost of building wrong",
                desc: "The average founder wastes 3–6 months building something nobody wanted. Blueprint AI exists to eliminate that first wrong turn.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl bg-[#efede7] p-8">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-4 text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
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
<section className="py-20 px-6 border-b border-gray-200 bg-[#f8f8f7]">

  <div className="max-w-6xl mx-auto">

    <div className="flex items-end justify-between gap-6 flex-wrap">
      <div>
        <p className="text-sm tracking-[0.18em] text-gray-500 uppercase">
          Sample Blueprint Output
        </p>

        <h2 className="mt-3 text-4xl md:text-5xl font-serif tracking-tight text-black">
          What founders receive
        </h2>
      </div>

      <p className="max-w-md text-sm leading-7 text-gray-500">
        Structured startup thinking generated from your interview answers.
        Clear positioning, MVP scope, market direction, and founder guidance.
      </p>
    </div>

    <div className="mt-12 rounded-[32px] border border-gray-300 bg-[#f1efe9] overflow-hidden shadow-sm">

      {/* top bar */}
      <div className="border-b border-gray-300 px-6 py-4 bg-white flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-red-400" />
        <div className="h-3 w-3 rounded-full bg-yellow-400" />
        <div className="h-3 w-3 rounded-full bg-green-400" />

        <p className="ml-4 text-sm text-gray-600">
          Blueprint — FocusFlow
        </p>
      </div>

      {/* content */}
      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Problem */}
        <div className="rounded-2xl border border-gray-300 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                Section 1
              </p>

              <h3 className="mt-2 text-xl font-semibold">
                Problem
              </h3>
            </div>

            <div className="h-10 w-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-sm">
              1
            </div>
          </div>

          <p className="mt-5 text-[15px] leading-7 text-gray-600">
            Remote teams struggle with fragmented async communication,
            unclear updates, and low visibility into blockers across projects.
          </p>
        </div>

        {/* ICP */}
        <div className="rounded-2xl border border-gray-300 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                Section 2
              </p>

              <h3 className="mt-2 text-xl font-semibold">
                Ideal Customer
              </h3>
            </div>

            <div className="h-10 w-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-sm">
              2
            </div>
          </div>

          <p className="mt-5 text-[15px] leading-7 text-gray-600">
            Startup teams with 8–50 employees operating remotely and using
            Slack, Notion, and Linear daily.
          </p>
        </div>

        {/* MVP */}
        <div className="rounded-2xl border border-gray-300 bg-white p-6 lg:col-span-2">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                Section 5
              </p>

              <h3 className="mt-2 text-xl font-semibold">
                MVP Features
              </h3>
            </div>

            <div className="h-10 w-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-sm">
              5
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">

            {[
              "Async video standups with AI summaries",
              "Slack + Notion integrations",
              "Team health dashboard",
              "AI blocker detection",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-gray-200 bg-[#fafafa] px-4 py-4 text-sm text-gray-700"
              >
                {item}
              </div>
            ))}

          </div>
        </div>

        {/* Tech stack */}
        <div className="rounded-2xl border border-gray-300 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                Stack
              </p>

              <h3 className="mt-2 text-xl font-semibold">
                Recommended Stack
              </h3>
            </div>

            <div className="h-10 w-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-sm">
              ⚡
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {[
              "Next.js",
              "Supabase",
              "OpenAI",
              "Stripe",
              "Vercel",
            ].map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-gray-300 px-3 py-1 text-sm bg-[#fafafa]"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Founder advice */}
        <div className="rounded-2xl border border-gray-300 bg-[#fafaf8] p-6">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                Founder Advice
              </p>

              <h3 className="mt-2 text-xl font-semibold">
                Strategic Insight
              </h3>
            </div>

            <div className="h-10 w-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-sm">
              11
            </div>
          </div>

          <p className="mt-5 text-[15px] italic leading-7 text-gray-600">
            Don’t position this as a “meeting replacement tool.”
            Position it as a visibility system for fast-moving remote teams.
          </p>
        </div>

      </div>
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
        {
          q: "How is this different from ChatGPT?",
          a: "Blueprint AI follows a structured founder-thinking framework instead of generating random startup advice. It analyzes your idea like a product strategist — focusing on target users, MVP scope, market timing, and execution clarity."
        },
        {
          q: "Will this generate generic startup ideas?",
          a: "No. The system is designed to avoid vague startup language and push toward specificity, practical execution, and focused target users."
        },
        {
          q: "Can I use this before talking to developers?",
          a: "Yes. The blueprint helps you define your MVP, user flow, core features, and product direction before spending money on development."
        },
        {
          q: "How detailed is the MVP plan?",
          a: "You receive a structured breakdown including the problem, target user, MVP features, screens, user flow, data models, and execution advice."
        },
        {
          q: "Does this help validate startup ideas?",
          a: "Yes. The goal is not just idea generation — it’s helping founders identify whether an idea is focused, differentiated, and realistically executable."
        }
      ].map((faq, index) => (
        <details
          key={index}
          className="group rounded-2xl border border-gray-300 bg-white px-6 py-5 transition-all"
        >

          <summary className="flex cursor-pointer items-center justify-between list-none">

            <span className="text-lg font-medium text-black">
              {faq.q}
            </span>

            <span className="text-2xl text-gray-400 transition-transform duration-300 group-open:rotate-45">
              +
            </span>

          </summary>

          <p className="mt-4 text-gray-600 leading-7 pr-6">
            {faq.a}
          </p>

        </details>
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
             Built by Blueprint AI
          </p>

        </div>

      </section>

    </main>
  );
}