import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-black flex items-center justify-center px-6">
      <div className="max-w-3xl text-center">
        
        <h1 className="text-6xl font-bold leading-tight">
          Turn Your Idea Into a Startup Blueprint in Minutes
        </h1>

        <p className="mt-6 text-lg text-gray-600">
          Have an idea? We interview you and generate a complete product blueprint — features, structure, and execution plan.
        </p>

        <div className="mt-8">
          <a
            href="/interview"
            className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-white transition duration-200 hover:scale-105"
          >
            Start Your Blueprint
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          No signup required • 2-minute interview • Instant output
        </p>

        <div className="mt-10 text-sm text-gray-400">
          Idea → Interview → AI Analysis → Product Blueprint
        </div>

      </div>
    </main>
  );
}