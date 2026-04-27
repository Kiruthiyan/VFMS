"use client";

import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  async function loginUser() {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "kiruthiyan7@gmail.com",
          password: "123456",
        }),
      });

      // Simple handling if login works
      const data = await response.json();
      console.log(data);
      if (data.token) {
        localStorage.setItem("token", data.token);

        // --- STEP 5: Secure API call Example ---
        const token = localStorage.getItem("token");
        fetch(`${API_URL}/api/user`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        }).then(res => res.json()).then(user => console.log("User data:", user));

        alert("Login request sent and token saved!");
      } else {
        alert("Login failed or no token received.");
      }
    } catch (error) {
      console.error(error);
      alert("Error connecting to backend API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-lg shadow-xl text-center">
        <h1 className="text-2xl font-bold text-white mb-6">VFMS Test Login</h1>
        {/* --- STEP 4: Button connect --- */}
        <button
          onClick={loginUser}
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-2 px-6 rounded transition-colors"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}
