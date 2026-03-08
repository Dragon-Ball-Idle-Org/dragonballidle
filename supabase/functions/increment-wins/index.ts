import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, apikey, x-client-info",
};
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }
  if (req.method !== "POST") {
    return Response.json(
      {
        error: "method not allowed",
      },
      {
        status: 405,
        headers: CORS_HEADERS,
      },
    );
  }
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (token !== ANON_KEY) {
    return Response.json(
      {
        error: "unauthorized",
      },
      {
        status: 401,
        headers: CORS_HEADERS,
      },
    );
  }
  try {
    const { date } = await req.json();
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return Response.json(
        {
          error: "invalid date",
        },
        {
          status: 400,
          headers: CORS_HEADERS,
        },
      );
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    );
    const { data, error } = await supabase.rpc("increment_wins", {
      date,
    });
    if (error) throw error;
    return Response.json(
      {
        date,
        wins_count: data,
      },
      {
        headers: CORS_HEADERS,
      },
    );
  } catch (err) {
    console.error("[increment-wins]", err);
    return Response.json(
      {
        error: "internal error",
      },
      {
        status: 500,
        headers: CORS_HEADERS,
      },
    );
  }
});
