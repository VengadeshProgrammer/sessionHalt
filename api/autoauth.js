export default async function handler(req, res) {
  if (req.method !== "POST") 
    return res.status(405).json({ error: "Method not allowed" });

  const cookies = cookie.parse(req.headers.cookie || "");
  const sessionId = cookies.sessionId;

  let body = {};
  try {
    body = JSON.parse(req.body);
  } catch (err) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const { fingerprint } = body;

  if (!sessionId) return res.status(400).json({ error: "No session found" });
  if (!fingerprint) return res.status(400).json({ error: "All fields are required" });

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
