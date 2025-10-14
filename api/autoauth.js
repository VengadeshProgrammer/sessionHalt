import { createClient } from "@supabase/supabase-js";
import cookie from "cookie";
  
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const cookies = cookie.parse(req.headers.cookie || "");
  const sessionId = cookies.sessionId;
  const { fingerprint } = req.body;

  if (!sessionId) return res.status(400).json({ error: "No session found" });

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, fingerprints")
      .eq("session_id", sessionId)
      .single();

    if (error || !user) return res.status(401).json({ error: "Invalid session" });

    if (!user.fingerprints || !user.fingerprints.includes(fingerprint)) {
      return res.status(401).json({ error: "Fingerprint mismatch" });
    }

    res.status(200).json({ message: "User authenticated", redirectTo: "/home" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
