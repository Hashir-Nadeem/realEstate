const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

if (!res.ok) {
  const errorText = await res.text()
  console.error("API ERROR:", errorText)
  throw new Error(errorText)
}

  return res.json();
}
