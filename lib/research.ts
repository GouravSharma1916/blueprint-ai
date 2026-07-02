export interface ResearchResult {
  title: string;
  content: string;
  url: string;
}

export interface IdeaResearch {
  competitors: ResearchResult[];
  reddit: ResearchResult[];
  failures: ResearchResult[];
  marketSize: ResearchResult[];
}

async function tavilySearch(query: string, maxResults = 4): Promise<ResearchResult[]> {
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        max_results: maxResults,
        search_depth: "basic",
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results ?? []).map((r: any) => ({
      title: r.title ?? "",
      content: (r.content ?? "").slice(0, 300),
      url: r.url ?? "",
    }));
  } catch {
    return [];
  }
}

export async function researchIdea(
  idea: string,
  problem: string
): Promise<IdeaResearch> {
  const [competitors, reddit, failures, marketSize] = await Promise.all([
    tavilySearch(`${idea} alternatives competitors pricing`),
    tavilySearch(`${problem} site:reddit.com`),
    tavilySearch(`${idea} startup failed shut down pivoted`),
    tavilySearch(`${idea} market size TAM SAM 2024 2025`),
  ]);
  return { competitors, reddit, failures, marketSize };
}

export function formatResearchForPrompt(research: IdeaResearch): string {
  function section(label: string, results: ResearchResult[]) {
    if (!results.length) return `${label}:\nNo results found.\n`;
    return (
      `${label}:\n` +
      results.map(r => `- ${r.title}: ${r.content} (${r.url})`).join("\n")
    );
  }
  return [
    section("COMPETITORS & ALTERNATIVES", research.competitors),
    section("MARKET SIZE DATA", research.marketSize),
    section("REDDIT SENTIMENT (real user pain)", research.reddit),
    section("PAST FAILURES IN THIS SPACE", research.failures),
  ].join("\n\n");
}

export function extractSources(research: IdeaResearch) {
  const all = [
    ...research.competitors.map(r => ({ ...r, category: "Competitor" as const })),
    ...research.marketSize.map(r => ({ ...r, category: "Market size" as const })),
    ...research.reddit.map(r => ({ ...r, category: "Reddit" as const })),
    ...research.failures.map(r => ({ ...r, category: "Past failure" as const })),
  ];
  return all.filter((r, i, arr) => arr.findIndex(x => x.url === r.url) === i);
}