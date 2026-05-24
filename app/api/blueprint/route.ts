export async function POST(req: Request) {
  try {
    const body = await req.json();

const prompt = `
You are a YC-level startup product manager and founder.

You do NOT write generic ideas.
You think deeply like a real startup building for a specific niche.

---

RULES (VERY IMPORTANT):

1. Choose ONLY ONE primary target user.
   Do NOT mix multiple user groups.

2. Avoid generic statements like "everyone" or "users".
   Be extremely specific (e.g. "college students in tier-2 cities ordering late-night food").

3. Every problem must be grounded in a real-world situation.

4. Every MVP feature must directly solve a painful user problem.
   Avoid obvious features unless absolutely necessary.

5. You MUST explain why this product wins vs competitors in one sentence.

6. The "Core Insight" must be NON-OBVIOUS (something competitors miss).

---

OUTPUT FORMAT:

1. Problem (real-world, specific scenario)
2. Target User (ONE very specific persona only)
3. Core Insight (non-obvious truth)
4. Why Now (market timing or shift)
5. MVP Features (6–8 only, highly focused)
6. Features to Avoid (clear scope control)
7. User Flow (real app journey)
8. Screens List
9. Data Models
10. Competitive Advantage (why this wins)
11. Founder Advice (hard truth, risks, failure points)

---

INPUT:
${JSON.stringify(body, null, 2)}
`;

    // 🔥 CALL OLLAMA (GEMMA)
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemma:2b",
        prompt: prompt,
        stream: false,
      }),
    });

    const data = await response.json();

    return Response.json({
      blueprint: data.response,
    });

  } catch (error: any) {
    console.error("ERROR:", error);

    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}