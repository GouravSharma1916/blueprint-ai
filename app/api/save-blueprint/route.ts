import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { answers, blueprint, score } = body;

    let parsedAnswers = null;
    if (answers) {
      try {
        parsedAnswers = JSON.parse(answers);
      } catch {
        parsedAnswers = answers;
      }
    }

    // ✅ Added .select() to return the inserted row's id
    const { data, error } = await supabase
      .from("blueprints")
      .insert({
        clerk_user_id: userId,
        answers: parsedAnswers,
        blueprint: blueprint,
        score: score,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }

    // ✅ Return the id so frontend can link to /blueprint/[id]
    return Response.json({ success: true, id: data.id });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Save blueprint error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}