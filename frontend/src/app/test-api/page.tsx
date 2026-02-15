"use client";

import { useState } from "react";

type Vehicle = {
  id?: number;
  make: string;
  model: string;
  licensePlate: string;
  type: string;
  status: string;
  year: number;
  fuelLevel: string;
  currentOdometer: number;
  lastServiceDate?: string | null;
};

const API_BASE = "http://localhost:8080";

export default function TestApiPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadVehicles = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/vehicles`, {
        method: "GET",
      });

      // If backend returns non-200
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`GET failed: ${res.status} ${res.statusText} - ${text}`);
      }

      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const createVehicle = async () => {
    setError("");
    setLoading(true);

    // Make license plate unique every time (avoids duplicate key error)
    const uniquePlate = `TEST-${Date.now().toString().slice(-6)}`;

    const payload: Vehicle = {
      make: "Honda",
      model: "Civic",
      licensePlate: uniquePlate,
      type: "Car",
      status: "ACTIVE",
      year: 2021,
      fuelLevel: "Full",
      currentOdometer: 5000,
    };

    try {
      const res = await fetch(`${API_BASE}/api/vehicles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`POST failed: ${res.status} ${res.statusText} - ${text}`);
      }

      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e?.message || "Failed to POST");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "system-ui, Arial" }}>
      <h2>Frontend ↔ Backend Test</h2>

      <p style={{ color: "#555" }}>
        Backend: <b>{API_BASE}</b> | Endpoint: <b>/api/vehicles</b>
      </p>

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button
          onClick={loadVehicles}
          style={{ padding: "10px 14px", cursor: "pointer" }}
          disabled={loading}
        >
          {loading ? "Loading..." : "GET /api/vehicles"}
        </button>

        <button
          onClick={createVehicle}
          style={{ padding: "10px 14px", cursor: "pointer" }}
          disabled={loading}
        >
          {loading ? "Posting..." : "POST /api/vehicles (unique plate)"}
        </button>
      </div>

      {error && (
        <p style={{ color: "red", marginTop: 12, whiteSpace: "pre-wrap" }}>
          {error}
        </p>
      )}

      <pre
        style={{
          marginTop: 20,
          background: "#f6f6f6",
          padding: 12,
          borderRadius: 8,
          overflowX: "auto",
        }}
      >
        {data === null ? "null" : JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
