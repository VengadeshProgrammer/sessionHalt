import { createClient } from "@supabase/supabase-js";
import { generateSessionId } from "./generateSessionId.js";
import cookie from "cookie";
console.log(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const setSessionCookie = (res, sessionId) => {
  res.setHeader("Set-Cookie", cookie.serialize("sessionId", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 180
  }));
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, username, password, fingerprint } = req.body;

  if (!email || !username || !password || !fingerprint)
    return res.status(400).json({ error: "All fields are required" });

  try {
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const sessionId = generateSessionId();

    const { data: newUser, error } = await supabase
      .from("users")
      .insert([{ email, username, password_hash: password, fingerprints: [fingerprint], session_id: sessionId }])
      .select();

    if (error) return res.status(500).json({ error: error.message });

    setSessionCookie(res, sessionId);
    res.status(200).json({ message: "User authenticated", redirectTo: "/home" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
