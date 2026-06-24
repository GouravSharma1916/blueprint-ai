// app/api/build-interest/route.ts
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { blueprint_id, response, feedback, email, image_url } = body;

    if (!blueprint_id || !response) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Try to get logged-in user
    const { userId } = await auth();

    // Guest users must provide an email
    if (!userId && !email) {
      return Response.json({ error: "Email required for guests" }, { status: 400 });
    }

    // For signed-in users, prefer the email/image the client sent (from Clerk's
    // useUser() hook). If for some reason the client didn't send one, fall back
    // to fetching it server-side from Clerk directly so we never save it empty.
    let resolvedEmail = email ?? null;
    let resolvedImageUrl = image_url ?? null;

    if (userId && (!resolvedEmail || !resolvedImageUrl)) {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        if (!resolvedEmail) {
          resolvedEmail = user.emailAddresses?.[0]?.emailAddress ?? null;
        }
        if (!resolvedImageUrl) {
          resolvedImageUrl = user.imageUrl ?? null;
        }
      } catch (e) {
        console.error("Clerk user lookup failed:", e);
        // not fatal — we still save the response even without email/image
      }
    }

    const { error } = await supabase.from("build_interest").insert({
      clerk_user_id: userId ?? null,
      blueprint_id,
      response,            // "yes" | "maybe" | "no"
      feedback: feedback ?? null,
      guest_email: userId ? null : email,
      email: resolvedEmail,
      image_url: resolvedImageUrl,
    });

    if (error) {
      console.error("Supabase insert error:", error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Build interest error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}