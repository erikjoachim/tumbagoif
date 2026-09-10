export type HealthResponse = {
  status: string;
};

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`API request failed (${response.status})`);
  }

  return (await response.json()) as T;
}
