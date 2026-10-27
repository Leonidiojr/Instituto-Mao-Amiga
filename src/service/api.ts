// No celular ou no emulador, "localhost" é o próprio aparelho.
// Defina EXPO_PUBLIC_API_URL no arquivo .env.local com o IP do computador
// que roda a API (ex.: http://192.168.0.10:8080). No emulador Android
// também funciona http://10.0.2.2:8080.
export const SERVIDOR_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';
const API_URL = `${SERVIDOR_URL}/api/v1`;

export async function get<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Erro HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}
