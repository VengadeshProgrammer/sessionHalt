import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173", // frontend origin
  credentials: true, // allow cookies
}));
app.use(bodyParser.json());
app.use(cookieParser());

// Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Helper function to set session cookie
const setSessionCookie = (res, sessionId) => {
  res.cookie("sessionId", sessionId, {
    httpOnly: true,    // cannot be accessed by JS
    secure: false,     // set true if using HTTPS
    sameSite: "lax",   // protects against CSRF
    maxAge: 1000 * 60 * 60 * 24 * 180, // 6 months
  });
};

// Signup route
app.post("/signup", async (req, res) => {
  const { email, username, password, fingerprint } = req.body;

  if (!email || !username || !password || !fingerprint) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check if user exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) return res.status(400).json({ error: "User already exists" });
    
    // Generate sessionId
    const sessionId = crypto.randomBytes(32).toString("hex");

    // Insert new user
    const { data: newUser, error } = await supabase
      .from("users")
      .insert([{ email, username, password_hash: passwordHash, fingerprints: [fingerprint], session_id : sessionId }])
      .select();

    if (error) return res.status(500).json({ error: error.message });

    // Store in DB if you want to track sessions

    // Set HTTP-only cookie
    setSessionCookie(res, sessionId);

    res.json({ message: "User created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, password_hash")
      .eq("email", email)
      .single();

    if (error || !user) return res.status(400).json({ error: "User not found" });

    // Compare password

    if(password !== user.password_hash){
      return res.status(401).json({ error: "Invalid password" });
    }
    // Generate sessionId
    const sessionId = uuidv4();

    // Set HTTP-only cookie
    setSessionCookie(res, sessionId);

    res.json({ message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Example protected route
app.get("/profile", (req, res) => {
  const sessionId = req.cookies.sessionId;
  if (!sessionId) return res.status(401).json({ error: "Not authenticated" });

  // Check sessionId in DB if you store it
  res.json({ message: "You are authenticated!", sessionId });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
