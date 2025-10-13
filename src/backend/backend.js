import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { generateSessionId } from "../generateSessionId.js";
import { redirect } from "react-router-dom";

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
console.log(email, username, password, fingerprint);
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
    
   const sessionId = generateSessionId();


    // Insert new user
    const { data: newUser, error } = await supabase
      .from("users")
      .insert([{ email, username, password_hash: password, fingerprints: [fingerprint], session_id : sessionId }])
      .select();

    if (error) return res.status(500).json({ error: error.message });

    // Store in DB if you want to track sessions

    // Set HTTP-only cookie
    setSessionCookie(res, sessionId);
    res.json({ message: "User authenticated", redirectTo: "/home" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { email, password, fingerprint } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });
  else if (!fingerprint)
    return res.status(400).json({ error: "Fingerprint is required" });

  try {
    // Find the user by email
    const { data: user, error } = await supabase
      .from("users")
      .select("id, password_hash, session_id")
      .eq("email", email)
      .single();

    if (error || !user)
      return res.status(401).json({ error: "Invalid email or password" });

    // Since password is already hashed on client, compare directly
    if (password !== user.password_hash) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Step 1: Get current fingerprints
const { data: userData, error: fetchError } = await supabase
  .from("users")
  .select("fingerprints, session_id")
  .eq("id", user.id)
  .single();

if (fetchError) throw fetchError;

// Step 2: Only append if fingerprint not found
const fingerprints = userData.fingerprints || [];
const sessionId = userData.session_id;
if (!fingerprints.includes(fingerprint)) {
  const newFingerprints = [...fingerprints, fingerprint];

  const { error: updateError } = await supabase
    .from("users")
    .update({ fingerprints: newFingerprints })
    .eq("id", user.id);

  if (updateError) console.error("Error updating fingerprints:", updateError);
}
    // Set HTTP-only cookie
    setSessionCookie(res, sessionId);

    // Send the same sessionId back to client for reference
    res.json({ message: "User authenticated", redirectTo: "/home" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.post("/autoauth", async (req, res) => {
  const sessionId = req.cookies.sessionId;
  const { fingerprint } = req.body;
  if (!sessionId) {
    console.log("No sessionId cookie found", sessionId);
    return res.status(400).json({ error: "No session found" });
  }
  try {
    // Find user by sessionId
    const { data: user, error } = await supabase
      .from("users")
      .select("id, fingerprints")
      .eq("session_id", sessionId)
      .single();
    if (error || !user) {
      return res.status(401).json({ error: "Invalid session" });
    }
    // Check if fingerprint exists in user's fingerprints array
    if (!user.fingerprints || !user.fingerprints.includes(fingerprint) && sessionId) {
      return res.status(401).json({ error: "Fingerprint mismatch" });
    }
    res.json({ message: "User authenticated", redirectTo: "/home" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Logout route
app.post("/logout", async (req, res) => {
  const sessionId = req.cookies.sessionId;
  if (!sessionId) return res.status(400).json({ error: "No session found" });
  try {
    // Clear cookie
    res.clearCookie("sessionId");
    res.json({ message: "Logged out", redirectTo: "/login" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
