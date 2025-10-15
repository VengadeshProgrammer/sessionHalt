import { createClient } from "@supabase/supabase-js";
import cookie from "cookie";

// Initialize Supabase client using server-side env vars
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// DEBUG: Check if env vars are available
console.log("Supabase ENV:", { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  try {
    console.log("Incoming request method:", req.method);

    if (req.method !== "POST") {
      console.log("Method not allowed");
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Parse cookies
    const cookies = cookie.parse(req.headers.cookie || "");
    const sessionId = cookies.sessionId;
    console.log("Parsed cookies:", cookies);

    // Parse body
    let body = {};
    try {
      body = JSON.parse(req.body);
    } catch (err) {
      console.log("Invalid JSON body:", req.body);
      return res.status(400).json({ error: "Invalid JSON body" });
    }

    const { fingerprint } = body;
    console.log("SessionID:", sessionId, "Fingerprint:", fingerprint);

    if (!sessionId || !fingerprint) {
      console.log("Missing sessionId or fingerprint");
      return res.status(400).json({ error: "All fields are required" });
    }

    // Fetch user from Supabase
    const { data: user, error } = await supabase
      .from("users")
      .select("id, fingerprints")
      .eq("session_id", sessionId)
      .single();

    console.log("Supabase query result:", { user, error });

    if (error || !user) {
      console.log("Invalid session");
      return res.status(401).json({ error: "Invalid session" });
    }

    if (!user.fingerprints || !user.fingerprints.includes(fingerprint)) {
      console.log("Fingerprint mismatch:", user.fingerprints);
      return res.status(401).json({ error: "Fingerprint mismatch" });
    }

    console.log("User authenticated:", user.id);
    return res.status(200).json({ message: "User authenticated", redirectTo: "/home" });
  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
