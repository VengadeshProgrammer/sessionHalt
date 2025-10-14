async function logoutUser() {
    alert("⚠️ Possible canvas.toDataURL() tampering detected!, Don't try to hack!");
  const res = await fetch("/api/logout", {
      method: "POST",
      credentials: "include", // ✅ sends the cookie (sessionId)
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    return data;
}