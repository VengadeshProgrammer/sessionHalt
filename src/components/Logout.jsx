import React from 'react'

const Logout = () => {
    async function logoutUser() {
  const res = await fetch("http://localhost:5000/logout", {
      method: "POST",
      credentials: "include", // ✅ sends the cookie (sessionId)
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    console.log(data.message);
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