import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL

interface LoginResponse {
  token: string;
  id?: number;
}

export const login = async (email: string, password: string, expoPushToken?: string | undefined): Promise<LoginResponse> => {
  const url = `${API_BASE_URL}/api/auth/login`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, contrasenia: password, expoPushToken }),
  });

  const contentType = response.headers.get("content-type");
  const rawText = await response.text();

  if (!response.ok) {
    const mensaje = contentType?.includes("application/json")
      ? JSON.parse(rawText).mensaje || JSON.parse(rawText).error || "Error desconocido"
      : "Error inesperado del servidor";
    throw new Error(mensaje);
  }

  const data = contentType?.includes("application/json") ? JSON.parse(rawText) : null;

  if (!data || !data.token) {
    throw new Error("Respuesta inválida del servidor");
  }

  return {
    token: data.token,
    id: data.id
  };
};

export const fetchUserData = async (id: string) => {
  try {
    if (!id) return;

    const url = `${API_BASE_URL}/api/app-native-api/usuario/me?id=${id}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${await AsyncStorage.getItem("admin-token")}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch user data');

    const userData = await response.json();

    return userData
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};