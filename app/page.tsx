"use client";
import { ArrowRight } from "lucide-react";
import { useAuth, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useRef } from "react";

// ---------- Scroll-reveal hook ----------
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function Navbar() {
  const { isSignedIn } = useAuth();
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-[#f6f5f2]/90 backdrop-blur-sm px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Blueprint AI
        </Link>
        <div className="flex items-center gap-4">
          {!isSignedIn ? (
            <>
              <Link href="/sign-in" className="text-sm text-gray-600 hover:text-black transition">
                Login
              </Link>
              <Link href="/sign-up" className="inline-flex items-center rounded-xl border border-black bg-black px-4 py-2 text-sm text-white transition hover:scale-105">
                Sign up
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-black transition">
                Dashboard
              </Link>
              <UserButton />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function Home() {
  useScrollReveal();

  return (
    <>
      {/* ── Global animation styles ── */}
      <style>{`
        /* ---------- Hero stagger (fade-up on load) ---------- */
        .hero-item {
          opacity: 0;
          transform: translateY(24px);
          animation: fadeUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-item:nth-child(1) { animation-delay: 0.05s; }
        .hero-item:nth-child(2) { animation-delay: 0.18s; }
        .hero-item:nth-child(3) { animation-delay: 0.31s; }
        .hero-item:nth-child(4) { animation-delay: 0.44s; }
        .hero-item:nth-child(5) { animation-delay: 0.57s; }

        /* ---------- Scroll reveal ---------- */
        .reveal {
          opacity: 0;
          transform: translateY(36px);
          transition: opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }

        /* stagger children inside a reveal-group */
        .reveal-group > * {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .reveal-group.revealed > *:nth-child(1) { opacity:1; transform:none; transition-delay: 0.05s; }
        .reveal-group.revealed > *:nth-child(2) { opacity:1; transform:none; transition-delay: 0.15s; }
        .reveal-group.revealed > *:nth-child(3) { opacity:1; transform:none; transition-delay: 0.25s; }
        .reveal-group.revealed > *:nth-child(4) { opacity:1; transform:none; transition-delay: 0.35s; }
        .reveal-group.revealed > *:nth-child(5) { opacity:1; transform:none; transition-delay: 0.45s; }
        .reveal-group.revealed > *:nth-child(6) { opacity:1; transform:none; transition-delay: 0.55s; }

        /* ---------- Hover lift cards ---------- */
        .card-lift {
          transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
                      box-shadow 0.25s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .card-lift:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 12px 36px -8px rgba(0,0,0,0.12);
        }

        /* ---------- Reduced motion ---------- */
        @media (prefers-reduced-motion: reduce) {
          .hero-item, .reveal, .reveal-group > * { animation: none; transition: none; opacity: 1; transform: none; }
        }
      `}</style>

      <main className="min-h-screen bg-[#f6f5f2] text-[#1a1a1a]">

        <Navbar />

        {/* ── HERO ── */}
        <section className="px-6 pt-20 pb-16 border-b border-gray-200">
          <div className="max-w-4xl mx-auto text-center">
            <div className="hero-item inline-flex items-center rounded-full border border-gray-300 px-4 py-1 text-xs tracking-wide text-gray-600 bg-white">
              AI-POWERED PRODUCT PLANNING
            </div>
            <h1 className="hero-item mt-8 text-5xl md:text-7xl font-serif leading-tight tracking-tight">
              Stop guessing what to build. Get a{" "}
              <span className="italic">structured product blueprint</span>{" "}
              in minutes.
            </h1>
            <p className="hero-item mt-6 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Whether you&apos;re a solo founder, product manager, or builder — we interview you about your idea and generate a complete blueprint: target users, MVP scope, risks, and execution plan.
            </p>
            <div className="hero-item mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/interview" className="inline-flex items-center gap-2 rounded-xl border border-black bg-black px-6 py-3 text-white transition hover:scale-105">
                Talk to your AI product strategist
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <p className="hero-item mt-6 text-sm text-gray-500">
              No signup required ・ 2-minute interview ・ Instant output
            </p>
          </div>
        </section>

        {/* ── PROCESS ── */}
        <section className="border-b border-gray-200 py-6">
          <div className="reveal max-w-4xl mx-auto flex items-center justify-center gap-4 text-sm text-gray-500 flex-wrap px-6">
            <span>Your idea</span><span>→</span>
            <span>Structured interview</span><span>→</span>
            <span>Honest analysis</span><span>→</span>
            <span>Scored blueprint</span>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="py-12 px-6 border-b border-gray-200 bg-[#f6f5f2]">
          <div className="reveal-group reveal max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
            {[
              { number: "50+", label: "Early users tested" },
              { number: "1 min", label: "Average time to blueprint" },
              { number: "4+ countries", label: "Global reach" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-serif text-black">{stat.number}</p>
                <p className="mt-2 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── TRUSTED BY ── */}
        <section className="py-10 px-6 border-b border-gray-200 bg-[#f6f5f2]">
          <div className="reveal max-w-4xl mx-auto text-center">
            <p className="text-xs tracking-widest text-gray-400 uppercase">Used By</p>
            <div className="mt-6 flex items-center justify-center gap-10 flex-wrap">
              {["Solo Founders", "Product Managers", "Startup Teams", "Indie Builders", "Product Designers"].map((name) => (
                <span key={name} className="text-sm font-medium text-gray-500">{name}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── NOT CHATGPT ── */}
        <section className="py-16 px-6 border-b border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="reveal">
              <p className="text-sm tracking-wide text-gray-500 uppercase">Why not just use ChatGPT?</p>
              <h2 className="mt-4 text-4xl md:text-5xl font-serif tracking-tight">
                ChatGPT will tell you your idea is great.{" "}
                <span className="italic">We might not.</span>
              </h2>
              <p className="mt-6 text-gray-600 leading-relaxed max-w-2xl">
                You can paste your idea into any AI and get a list of features back. Blueprint AI does something different — it interviews you with a structured set of questions, scores your idea out of 10, and tells you honestly where it could fail and why.
              </p>
            </div>
            <div className="reveal-group reveal mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: "🎯", title: "Structured interview, not a chat prompt", desc: "Instead of a blank box, Blueprint AI guides you through a focused set of questions designed to surface what matters — your real user, the actual problem, and whether the timing is right." },
                { icon: "📊", title: "Your idea gets a score", desc: "Every blueprint includes an honest score out of 10 with a confidence level and the specific reasoning behind it — so you know exactly where your idea stands and why." },
                { icon: "⚠️", title: "It tells you what could kill it", desc: "Blueprint AI surfaces the top risks — market risk, execution risk, and the core assumption that could be completely wrong — before you spend months building the wrong thing." },
              ].map((item) => (
                <div key={item.title} className="card-lift rounded-3xl bg-[#efede7] p-8">
                  <div className="text-3xl">{item.icon}</div>
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-4 text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHY NOW ── */}
        <section className="py-20 px-6 border-b border-gray-200">
          <div className="max-w-4xl mx-auto">
            <div className="reveal">
              <p className="text-sm tracking-wide text-gray-500 uppercase">Why now</p>
              <h2 className="mt-4 text-4xl md:text-5xl font-serif tracking-tight">
                The barrier to starting is low.{" "}
                <span className="italic">The barrier to starting right is still high.</span>
              </h2>
            </div>
            <div className="reveal-group reveal mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "More builders than ever", desc: "Solo founders and product teams are shipping faster than ever — but most still skip structured product thinking and build the wrong thing first." },
                { title: "Structured thinking, on demand", desc: "AI now delivers the kind of structured product thinking that used to require hours of workshops or expensive consultants — in minutes, not meetings." },
                { title: "The cost of building wrong", desc: "The average founder wastes 3–6 months building something nobody wanted. Blueprint AI exists to eliminate that first wrong turn." },
              ].map((item) => (
                <div key={item.title} className="card-lift rounded-3xl bg-[#efede7] p-8">
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-4 text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-20 px-6 border-b border-gray-200">
          <div className="max-w-6xl mx-auto">
            <div className="reveal">
              <p className="text-sm tracking-wide text-gray-500 uppercase">How it works</p>
            </div>
            <div className="reveal-group reveal mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { number: "01", title: "Describe your idea", desc: "Tell us what problem you want to solve. No deck or doc needed — just your thoughts." },
                { number: "02", title: "Answer structured questions", desc: "Blueprint AI interviews you with a focused framework — target user, market timing, competition, and your unique angle." },
                { number: "03", title: "Get your scored blueprint", desc: "Receive a structured plan with an honest score, top risks, MVP features, market analysis, and your next steps." },
              ].map((item) => (
                <div key={item.number} className="card-lift rounded-3xl bg-[#efede7] p-8">
                  <div className="text-5xl font-serif text-gray-500">{item.number}</div>
                  <h3 className="mt-6 text-xl font-medium">{item.title}</h3>
                  <p className="mt-4 text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SAMPLE OUTPUT ── */}
        <section className="py-20 px-6 border-b border-gray-200 bg-[#f8f8f7]">
          <div className="max-w-6xl mx-auto">
            <div className="reveal flex items-end justify-between gap-6 flex-wrap">
              <div>
                <p className="text-sm tracking-[0.18em] text-gray-500 uppercase">Sample Blueprint Output</p>
                <h2 className="mt-3 text-4xl md:text-5xl font-serif tracking-tight text-black">What you receive</h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-gray-500">
                A structured, honest evaluation of your idea — with a score, top risks, MVP scope, and a clear execution plan.
              </p>
            </div>
            <div className="reveal mt-12 rounded-[32px] border border-gray-300 bg-[#f1efe9] overflow-hidden shadow-sm">
              <div className="border-b border-gray-300 px-6 py-4 bg-white flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <p className="ml-4 text-sm text-gray-600">Blueprint — FocusFlow</p>
              </div>
              <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-lift rounded-2xl border border-gray-300 bg-[#1a1a1a] p-6 lg:col-span-2">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">Idea Score</p>
                      <div className="mt-2 flex items-baseline gap-3">
                        <span className="text-5xl font-serif text-white">7.8</span>
                        <span className="text-gray-400 text-lg">/10</span>
                        <span className="ml-2 rounded-full bg-yellow-900 text-yellow-300 text-xs px-3 py-1">Medium Confidence</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-md italic">
                      &quot;Strong problem, clear target user, but the async video market is crowded. Differentiation needs to be sharper before building. Validate positioning with 10 real users first.&quot;
                    </p>
                  </div>
                </div>
                <div className="card-lift rounded-2xl border border-gray-300 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">Section 1</p>
                      <h3 className="mt-2 text-xl font-semibold">Problem</h3>
                    </div>
                    <div className="h-10 w-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-sm">1</div>
                  </div>
                  <p className="mt-5 text-[15px] leading-7 text-gray-600">Remote teams struggle with fragmented async communication, unclear updates, and low visibility into blockers across projects.</p>
                </div>
                <div className="card-lift rounded-2xl border border-gray-300 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">Section 2</p>
                      <h3 className="mt-2 text-xl font-semibold">Ideal Customer</h3>
                    </div>
                    <div className="h-10 w-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-sm">2</div>
                  </div>
                  <p className="mt-5 text-[15px] leading-7 text-gray-600">Startup teams with 8–50 employees operating remotely and using Slack, Notion, and Linear daily.</p>
                </div>
                <div className="card-lift rounded-2xl border border-gray-300 bg-white p-6 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">Section 8</p>
                      <h3 className="mt-2 text-xl font-semibold">Biggest Risks</h3>
                    </div>
                    <div className="h-10 w-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-sm">⚠️</div>
                  </div>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: "Market risk", text: "Loom and Slack already own async video. Differentiation must be specific." },
                      { label: "Execution risk", text: "AI summaries are technically complex. Shipping an unreliable v1 kills trust early." },
                      { label: "Core assumption", text: "Teams may not want another tool — they may want existing tools to work better." },
                    ].map((risk) => (
                      <div key={risk.label} className="card-lift rounded-xl border border-gray-200 bg-[#fafafa] px-4 py-4">
                        <p className="text-xs uppercase tracking-wide text-gray-400">{risk.label}</p>
                        <p className="mt-2 text-sm text-gray-700 leading-relaxed">{risk.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card-lift rounded-2xl border border-gray-300 bg-white p-6 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">Section 5</p>
                      <h3 className="mt-2 text-xl font-semibold">MVP Features</h3>
                    </div>
                    <div className="h-10 w-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-sm">5</div>
                  </div>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {["Async video standups with AI summaries", "Slack + Notion integrations", "Team health dashboard", "AI blocker detection"].map((item) => (
                      <div key={item} className="card-lift rounded-xl border border-gray-200 bg-[#fafafa] px-4 py-4 text-sm text-gray-700">{item}</div>
                    ))}
                  </div>
                </div>
                <div className="card-lift rounded-2xl border border-gray-300 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">Stack</p>
                      <h3 className="mt-2 text-xl font-semibold">Recommended Stack</h3>
                    </div>
                    <div className="h-10 w-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-sm">⚡</div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {["Next.js", "Supabase", "OpenAI", "Stripe", "Vercel"].map((tech) => (
                      <span key={tech} className="rounded-full border border-gray-300 px-3 py-1 text-sm bg-[#fafafa]">{tech}</span>
                    ))}
                  </div>
                </div>
                <div className="card-lift rounded-2xl border border-gray-300 bg-[#fafaf8] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">Founder Advice</p>
                      <h3 className="mt-2 text-xl font-semibold">Strategic Insight</h3>
                    </div>
                    <div className="h-10 w-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-sm">11</div>
                  </div>
                  <p className="mt-5 text-[15px] italic leading-7 text-gray-600">
                    Don&apos;t position this as a &quot;meeting replacement tool.&quot; Position it as a visibility system for fast-moving remote teams.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-20 px-6 border-b border-gray-200">
          <div className="max-w-4xl mx-auto">
            <div className="reveal">
              <p className="text-sm tracking-wide text-gray-500 uppercase">What early users say</p>
              <h2 className="mt-4 text-4xl font-serif">Real feedback</h2>
            </div>
            <div className="reveal-group reveal mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { quote: "The landing page is clean and the messaging is easy to understand. The concept is genuinely useful for new founders.", name: "Nomita Patwal", role: "Developer & AI Enthusiast, India" },
                { quote: "UX feedback: the idea is strong, but showing the full workflow from blueprint → build → launch would make it much more powerful.", name: "Cielo Dahy", role: "AI Intern, Buenos Aires, Argentina" },
                { quote: "Looks super cool. Great idea for first-time founders. UI improvements could make it even more polished.", name: "Arsh Parekh", role: "Princeton University, United States" },
                { quote: "It's working well and has a clear use case. Just needs more visibility and user feedback loops.", name: "Tanvi Bansal", role: "Technical Business Analyst, India" },
                { quote: "This is pretty useful for new founders. I can see this becoming valuable if you refine it further.", name: "Arya SK", role: "University of Cambridge, United Kingdom" },
                { quote: "Really amazing idea! It helps structure thoughts before building, which is exactly what many students need.", name: "Gopisaroja G", role: "Computer Science Student, India" },
              ].map((t) => (
                <div key={t.name} className="card-lift rounded-3xl border border-gray-200 bg-white p-8">
                  <p className="text-gray-700 leading-relaxed italic">&quot;{t.quote}&quot;</p>
                  <div className="mt-6">
                    <p className="font-medium text-black">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section className="py-20 px-6 border-b border-gray-200 bg-[#f8f8f7]">
          <div className="reveal max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm tracking-wide text-gray-500 uppercase">About</p>
              <h2 className="mt-4 text-4xl font-serif">Built for builders<br />who think before they ship</h2>
              <p className="mt-6 text-gray-600 leading-relaxed">Blueprint AI helps turn raw ideas into structured product thinking. It interviews you, understands your concept, scores your idea honestly, and generates a clear execution blueprint — so you start building with clarity, not assumptions.</p>
              <p className="mt-4 text-gray-600 leading-relaxed">Designed for founders, product managers, engineers, designers, and indie builders who want honest structured thinking before writing a single line of code.</p>
            </div>
            <div className="card-lift rounded-3xl border border-gray-200 bg-white p-8">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">👨‍💻</div>
                <div>
                  <p className="font-semibold text-black">Gaurav Sharma</p>
                  <p className="text-sm text-gray-500">Builder, Blueprint AI</p>
                </div>
              </div>
              <p className="mt-6 text-gray-600 leading-relaxed italic">&quot;I&apos;ve been building apps alone and realized most founders, engineers, product managers, designers don&apos;t fail in code — they fail before writing code. Blueprint AI is my attempt to fix that first step: thinking clearly before building anything.&quot;</p>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 px-6 border-b border-gray-200">
          <div className="max-w-4xl mx-auto">
            <div className="reveal">
              <p className="text-sm tracking-wide text-gray-500 uppercase">Common Questions</p>
            </div>
            <div className="reveal mt-6 space-y-4">
              {[
                { q: "How is this different from ChatGPT?", a: "Blueprint AI scores your idea out of 10, identifies the top risks that could kill it, and gives you an honest evaluation — not encouragement. ChatGPT will tell you your idea is great. Blueprint AI will tell you if it isn't. It also follows a structured interview format, not a blank prompt — so every output covers the same critical areas: problem clarity, target user, market timing, MVP scope, and execution risks." },
                { q: "Is this only for startup founders?", a: "No. Blueprint AI works for anyone building a product — solo founders, product managers inside companies, design teams scoping new features, or engineers who want to validate an idea before pitching it internally. The core problem is the same: building without structured thinking first." },
                { q: "Will this generate generic advice?", a: "No. The system is designed to avoid vague advice and push toward specificity. Every section references your actual answers — your target user, your market, your competition. Generic output is a sign the input was too vague; the interview pushes you to be specific." },
                { q: "Can I use this before talking to developers?", a: "Yes — that's exactly when to use it. The blueprint helps you define your MVP, user flow, core features, and product direction before spending money on development." },
                { q: "How detailed is the output?", a: "You receive a full structured breakdown: idea score with reasoning, problem analysis, ideal customer profile, MVP features, biggest risks, a 30-day execution plan, customer interview questions, and a final honest recommendation." },
                { q: "Does this help validate ideas?", a: "Yes. The goal isn't just to generate a plan — it's to tell you whether your idea is focused, differentiated, and realistically executable. If it isn't, Blueprint AI will tell you that clearly." },
              ].map((faq, index) => (
                <details key={index} className="group rounded-2xl border border-gray-300 bg-white px-6 py-5 transition-all">
                  <summary className="flex cursor-pointer items-center justify-between list-none">
                    <span className="text-lg font-medium text-black">{faq.q}</span>
                    <span className="text-2xl text-gray-400 transition-transform duration-300 group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 text-gray-600 leading-7 pr-6">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 px-6 text-center">
          <div className="reveal max-w-3xl mx-auto">
            <h2 className="text-5xl font-serif">Ready to find out if your idea holds up?</h2>
            <p className="mt-6 text-lg text-gray-600">Takes 2 minutes. No account needed. Walk away with an honest score and a full execution plan.</p>
            <a href="/interview" className="mt-10 inline-flex items-center gap-2 rounded-2xl border border-black bg-black px-8 py-4 text-white transition hover:scale-105">
              Start your blueprint
              <ArrowRight className="h-4 w-4" />
            </a>
            <p className="mt-6 text-sm text-gray-400">Built by Blueprint AI</p>
          </div>
        </section>

      </main>
    </>
  );
}