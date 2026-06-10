import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // single blueprint by id
    if (id) {
      const { data, error } = await supabase
        .from("blueprints")
        .select("id, score, created_at, answers, blueprint")
        .eq("clerk_user_id", userId)
        .eq("id", id)
        .single();

      if (error) return Response.json({ error: error.message }, { status: 500 });
      return Response.json({ blueprint: data });
    }

    // all blueprints for dashboard
    const { data, error } = await supabase
      .from("blueprints")
      .select("id, score, created_at, answers, blueprint")
      .eq("clerk_user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ blueprints: data });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}