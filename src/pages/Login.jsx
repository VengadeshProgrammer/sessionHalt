import React from 'react'
import { Link } from 'react-router-dom';
import {supabase} from '../supabaseClient'
import { sha256Hash } from '../sha256';
const Login = () => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
  
    async function handleOnLogin(e) {
    e.preventDefault();
      console.log(email,password);
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }
  let passwordHash = await sha256Hash(password);
    // 1️⃣ Check if user already exists (by email or username)
  const { data: existingUser, error: checkError } = await supabase
  .from("users")
  .select("id")
  .eq("email", email)
  .eq("password_hash", passwordHash); // AND logic

  
    if (checkError) {
      console.error("Error checking existing user:", checkError);
      alert("Something went wrong while checking for existing users.");
      return;
    }
  
    if (existingUser && existingUser.length > 0) {
      alert("Logined in successfully!");
      return;
    }
  alert("No account found with this email + password!");
    return true;
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-xl shadow-md">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Log In
        </h2>
        <form className="space-y-4" onSubmit={handleOnLogin}>
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
            Log In
          </button>
        </form>

        <p className="mt-4 text-center text-gray-500 text-sm sm:text-base">
          Don't have an account?{" "}
          <Link to='/' className="text-indigo-600 hover:underline">
            Signup
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login