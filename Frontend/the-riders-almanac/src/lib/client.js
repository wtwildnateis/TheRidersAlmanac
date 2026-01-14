const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

function getToken() {
  return ( localStorage.getItem("authToken") ||
   localStorage.getItem("token") || ""
);
}

export async function apiFetch(path, { method = "GET", headers = {}, body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...headers,
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  return res;
}