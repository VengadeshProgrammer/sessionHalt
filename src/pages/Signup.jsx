import React from 'react'
import { Link } from 'react-router-dom';
import {supabase} from '../supabaseClient'
import { sha256Hash } from '../sha256';
const Signup = () => {
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  function getCanvasFingerprint() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  ctx.textBaseline = "top";
  ctx.font = "14px 'Arial'";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#f60";
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = "#069";
  ctx.fillText("Vengadesh", 2, 15);
  ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
  ctx.fillText("Vengadesh", 4, 17);

  return canvas.toDataURL();
}
function getDeviceInfo() {
  return {
    os: navigator.platform || "unknown",
    browser: navigator.userAgent || "unknown",
    deviceWidth: window.screen.width,
    deviceHeight: window.screen.height,
    devicePixelRatio: window.devicePixelRatio,
    deviceMemory: navigator.deviceMemory || 0,
    deviceColorDepth: window.screen.colorDepth || 0,
    hardwareConcurrency: navigator.hardwareConcurrency || 0
  };
}
async function getHashedFingerprintString() {
  const canvasFP = getCanvasFingerprint();
  const deviceInfo = getDeviceInfo();

  // Convert device info object to string
  const deviceString = Object.values(deviceInfo).join("::");

  // Combine canvas + device info
  let combinedFingerprint = canvasFP + "::" + deviceString;
  let combinedFingerprintHash = await sha256Hash(combinedFingerprint);
  return combinedFingerprintHash;
}

  async function handleOnSignup(e) {
  e.preventDefault();

  if (!username || !email || !password) {
    alert("Please fill in all fields");
    return;
  }

  // 1️⃣ Check if user already exists (by email or username)
  const { data: existingUser, error: checkError } = await supabase
    .from("users")
    .select("id")
    .or(`email.eq.${email},username.eq.${username}`); // check both email & username

  if (checkError) {
    console.error("Error checking existing user:", checkError);
    alert("Something went wrong while checking for existing users.");
    return;
  }

  if (existingUser && existingUser.length > 0) {
    alert("User with this email or username already exists!");
    return;
  }

  // 2️⃣ Hash the password
  const passwordHash = await sha256Hash(password);

  // 3️⃣ Insert new user
  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        email,
        username,
        password_hash: passwordHash,
      },
    ])
    .select("*"); // to get inserted row back

  if (error) {
    console.error("Error creating user:", error);
    alert("Failed to create user.");
    return;
  }

  console.log("User added:", data);
  alert("Signup successful!");
  return true;
}
/* const fingerprintString = getHashedFingerprintString();
  console.log("Hashed fingerprint:", fingerprintString.then((hash) => console.log(hash)));
*/
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-xl shadow-md">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Sign Up
        </h2>
        <form className="space-y-4" onSubmit={handleOnSignup}>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-gray-500 text-sm sm:text-base">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup