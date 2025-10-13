import React from 'react'
import { useNavigate } from 'react-router-dom';
const Logout = () => {
  const navigate = useNavigate();
    async function logoutUser() {
  const res = await fetch("http://localhost:5000/logout", {
      method: "POST",
      credentials: "include", // ✅ sends the cookie (sessionId)
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    console.log(data);
    if (data.redirectTo) {
  navigate(data.redirectTo); // ✅ Redirect handled by React Router
  }
    }
    return (
    <div>
        <button onClick={logoutUser} className="hover:cursor-pointer hover:bg-gray-700 p-2 rounded-md">
            Logout
        </button>
    </div>
    );
}

export default Logout