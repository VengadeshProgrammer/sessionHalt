import { createClient } from "@supabase/supabase-js";
import cookie from "cookie";
console.log("ENV:", process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    if (req.method !== "POST")
      return res.status(405).json({ error: "Method not allowed" });

    const cookies = cookie.parse(req.headers.cookie || "");
    const sessionId = cookies.sessionId;

    let body = {};
    try {
      body = JSON.parse(req.body);
    } catch {
      return res.status(400).json({ error: "Invalid JSON body" });
    }

    const { fingerprint } = body;
    if (!sessionId || !fingerprint)
      return res.status(400).json({ error: "All fields are required" });

    const { data: user, error } = await supabase
      .from("users")
      .select("id, fingerprints")
      .eq("session_id", sessionId)
      .single();

    if (error || !user)
      return res.status(401).json({ error: "Invalid session" });

    if (!user.fingerprints.includes(fingerprint))
      return res.status(401).json({ error: "Fingerprint mismatch" });

    res.status(200).json({ message: "User authenticated", redirectTo: "/home" });
  } catch (err) {
    console.error("API ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
