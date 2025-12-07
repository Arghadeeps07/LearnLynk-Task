// LearnLynk Tech Test - Task 3: Edge Function create-task

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Service role client → bypasses RLS (required for server functions)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

type CreateTaskPayload = {
  application_id: string;
  task_type: string;
  due_at: string;
};

const VALID_TYPES = ["call", "email", "review"];

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as Partial<CreateTaskPayload>;
    const { application_id, task_type, due_at } = body;

    // ---------------------------
    // VALIDATION
    //-----------------------------

    // application_id check
    if (!application_id || typeof application_id !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid application_id" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // task_type check
    if (!VALID_TYPES.includes(task_type ?? "")) {
      return new Response(
        JSON.stringify({
          error: "task_type must be one of: call, email, review",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // due_at check
    let dueDate: Date;

    try {
      dueDate = new Date(due_at ?? "");
      if (isNaN(dueDate.getTime())) throw new Error();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid due_at timestamp" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (dueDate <= new Date()) {
      return new Response(
        JSON.stringify({ error: "due_at must be a future timestamp" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ---------------------------
    // INSERT INTO DATABASE
    //-----------------------------

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        application_id,
        type: task_type,
        due_at,
      })
      .select("id")
      .single();

    if (error) {
      console.error("DB Insert Error:", error);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // ---------------------------
    // SUCCESS RESPONSE
    //-----------------------------

    return new Response(
      JSON.stringify({ success: true, task_id: data.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
