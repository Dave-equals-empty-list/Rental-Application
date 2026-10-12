// Base URL of the C# backend. Override with VITE_API_URL in a .env file if the port changes.
export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5120";

export class ApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function apiGet(path, { signal } = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { signal, headers: { Accept: "application/json" } });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    // fetch only throws on network failure: backend not running, wrong port, or CORS
    throw new ApiError("Server unreachable", { code: "OFFLINE" });
  }
  if (!res.ok) throw new ApiError(`Request failed (${res.status})`, { status: res.status });
  return res.json();
}

async function send(method, path, body) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Server unreachable", { code: "OFFLINE" });
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new ApiError(detail || `Request failed (${res.status})`, { status: res.status });
  }
  return res.status === 204 ? null : res.json();
}

export const apiPost = (path, body) => send("POST", path, body);
export const apiPatch = (path, body) => send("PATCH", path, body);
