import { ClubMemberFormatted, Player } from "@/types/user";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL

export const fetchClubPlayers = async (clubId: number, token: string): Promise<Player[]> => {
    try {
        if (!clubId || !token) {
            console.warn("❌ Falta clubId o token");
            return [];
        }

        if (!API_BASE_URL) {
            console.error("❌ EXPO_PUBLIC_API_BASE_URL no definido");
            return [];
        }

        const url = `${API_BASE_URL}/api/app-native-api/jugadores/equipo?id=${clubId}`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log(data, "response from fetch function");

        if (!Array.isArray(data.jugadores)) {
            console.warn("⚠️ Estructura inesperada:", data);
            return [];
        }

        const jugadoresFormateados = data.jugadores.map((jugador: ClubMemberFormatted) => ({
            id: jugador.id.toString(),
            name: `${jugador.nombre || ""} ${jugador.apellido1 || ""} ${jugador.apellido2 || ""}`.trim(),
            clubId: jugador.clubId?.toString() || "",
            club: jugador.club || "Sin club",
            foto: jugador.foto || "",
        }));

        return jugadoresFormateados;

    } catch (err: any) {
        console.error("Error cargando jugadores:", err.message);
        return [];
    }
};