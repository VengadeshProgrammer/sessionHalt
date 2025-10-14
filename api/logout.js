import cookie from "cookie";

export function logout(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const cookies = cookie.parse(req.headers.cookie || "");
  const sessionId = cookies.sessionId;

  if (!sessionId) return res.status(400).json({ error: "No session found" });

  // Clear the cookie
  res.setHeader("Set-Cookie", cookie.serialize("sessionId", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0
  }));

  res.status(200).json({ message: "Logged out", redirectTo: "/login" });
}
