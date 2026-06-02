export async function POST(req: Request) {
  try {
    const body = await req.json();

    const prompt = `
You are a YC partner, startup strategist, and experienced product founder.

Your job is NOT to encourage every idea.
Your job is to evaluate whether this startup idea deserves the founder's time.

Think like a YC partner reviewing a batch application:
- Be direct, specific, and brutally honest
- Identify real opportunities AND real risks
- Never give generic startup advice
- Every insight must be specific to the founder's actual answers
- If the idea is weak, say so clearly and explain why
- If the idea is strong, say so clearly and explain why

CRITICAL RULES:
- Never use phrases like "leverage synergies", "disrupt the market", "game-changer"
- No filler encouragement like "great idea!" or "you're on the right track"
- Every section must contain specific, actionable insights
- Reference the founder's actual answers throughout
- Output ONLY valid JSON, nothing else — no markdown, no backticks, no preamble

OUTPUT: Return exactly this JSON structure and nothing else:

{
  "score": {
    "value": 7.8,
    "confidence": "Medium",
    "reason": "2-3 sentence honest summary explaining this score based on the specific idea"
  },
  "sections": [
    {
      "number": 1,
      "title": "Startup Summary",
      "content": "3-4 sentence crisp summary of the idea, who it is for, and what makes it different from existing solutions"
    },
    {
      "number": 2,
      "title": "Ideal Customer Profile",
      "content": "Describe one specific person. Their job title, their daily frustration, how often they face this problem, and why they would pay for this today"
    },
    {
      "number": 3,
      "title": "Problem Analysis",
      "content": "How painful is this problem really? Who has it? How often? What do they currently do instead? Is this a painkiller or a vitamin?"
    },
    {
      "number": 4,
      "title": "Why Existing Solutions Fail",
      "content": "Name 2-3 real alternatives the target user uses today. Explain specifically why each one fails this customer in their specific situation"
    },
    {
      "number": 5,
      "title": "Market Timing",
      "content": "Why is NOW the right time to build this? What changed in the last 2-3 years — technically, behaviorally, or economically — that makes this possible or urgent?"
    },
    {
      "number": 6,
      "title": "MVP Scope",
      "content": "What is the single smallest version that proves the core value? List exactly 3-5 features. State clearly what to cut from v1 and why."
    },
    {
      "number": 7,
      "title": "Validation Plan",
      "content": "3 specific actions to validate this idea before writing a single line of code. Include where to find users, what to ask them, and what proof of demand looks like"
    },
    {
      "number": 8,
      "title": "Biggest Risks",
      "content": "Top 3 risks that could kill this startup. Be specific: include one market risk, one execution risk, and one assumption that could be completely wrong"
    },
    {
      "number": 9,
      "title": "Customer Interview Questions",
      "content": "5 specific questions to ask target users this week. Questions that would reveal whether the problem is real, frequent, and worth paying to solve"
    },
    {
      "number": 10,
      "title": "30-Day Execution Plan",
      "content": "Week 1: validation actions. Week 2: prototype goal. Week 3: first user target. Week 4: iterate based on feedback. Be specific to this idea, not generic."
    },
    {
      "number": 11,
      "title": "Founder Recommendation",
      "content": "Honest final advice. Include a Do Not Build This If section with 3 specific deal-breaker conditions. End with one clear next action the founder should take tomorrow morning."
    }
  ]
}

FOUNDER'S INTERVIEW ANSWERS:
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
          temperature: 0.7,
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
    const raw: string = data.choices[0].message.content;

    // Strip markdown fences if model adds them
    const clean = raw.replace(/```json|```/g, "").trim();

    // Validate it parses correctly before returning
    try {
      JSON.parse(clean);
    } catch {
      console.error("Model returned invalid JSON:", clean);
      return Response.json(
        { success: false, error: "Invalid blueprint format" },
        { status: 500 }
      );
    }

    return Response.json({ blueprint: clean });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Blueprint API error:", message);
    return Response.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}