export async function autoAuth(fingerprint) {
    const res = await fetch("/api/signup", {
      method: "POST",
      credentials: "include", // ✅ sends the cookie (sessionId)
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fingerprint }), // send fingerprint only
    });
    const data = await res.json();
   return data;
}