export async function POST(req: Request) {
  try {
    const body = await req.json();
 
    const prompt = `
You are a YC-level startup product manager and founder.
 
You do NOT write generic ideas.
You think deeply like a real startup building for a specific niche.
 
RULES:
1. Choose ONLY ONE primary target user.
2. Avoid generic statements.
3. Be specific and practical.
4. Keep answers concise but insightful.
5. Do NOT use markdown symbols like ## or **.
6. Output should be clean readable plain text.
7. Each section MUST start with its number and a period, e.g. "1. Problem"
 
OUTPUT FORMAT — output all 11 sections, each on a new line starting with its number:
 
1. Problem
2. Target User
3. Core Insight
4. Why Now
5. MVP Features
6. Features to Avoid
7. User Flow
8. Screens List
9. Data Models
10. Competitive Advantage
11. Founder Advice
 
INPUT:
${JSON.stringify(body, null, 2)}
`;
 
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat",
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );
 
    if (!response.ok) {
      const err = await response.text();
      console.error("OpenRouter error:", err);
      return Response.json(
        { success: false, error: "Upstream model error" },
        { status: 502 }
      );
    }
 
    const data = await response.json();
    const blueprint: string = data.choices[0].message.content;
 
    return Response.json({ blueprint });
 
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Blueprint API error:", message);
    return Response.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
