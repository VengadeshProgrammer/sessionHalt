export async function autoAuth(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const cookies = cookie.parse(req.headers.cookie || "");
    const sessionId = cookies.sessionId;

    let body = {};
    try { body = JSON.parse(req.body); } 
    catch { return res.status(400).json({ error: "Invalid JSON body" }); }

    const { fingerprint } = body;

    if (!sessionId || !fingerprint) return res.status(400).json({ error: "All fields required" });

    // Ensure env vars exist
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error("Missing Supabase env vars!");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    const { data: user, error } = await supabase
      .from("users")
      .select("id, fingerprints")
      .eq("session_id", sessionId)
      .single();

    if (error || !user) return res.status(401).json({ error: "Invalid session" });

    if (!user.fingerprints || !user.fingerprints.includes(fingerprint)) {
      return res.status(401).json({ error: "Fingerprint mismatch" });
    }

    return res.status(200).json({ message: "User authenticated", redirectTo: "/home" });
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Server error" }); // always JSON
  }
}
