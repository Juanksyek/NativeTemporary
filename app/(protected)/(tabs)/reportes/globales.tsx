import { StyleSheet, View, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';
import Layout from '@/constants/Layout';
import StatsCard, { StatItem } from '@/components/StatsCard';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { fetchPlayerSummary, fetchTeamSummary } from '@/api/user/stats';
import { LoadingIndicator } from '@/components/ui/Indicators';

interface TarjetasStats {
  amarillas: number;
  rojas: number;
}

interface PlayerStatsResponse {
  id: number;
  nombreCompleto: string;
  equipoNombre: string;
  totalPartidos: number;
  tries: number;
  conversiones: number;
  lesiones: number;
  tarjetas: TarjetasStats;
  victorias: number;
  empates: number;
  derrotas: number;
}

interface TeamStatsResponse {
  equipoId: number;
  equipoNombre: string;
  totalPartidos: number;
  victorias: number;
  empates: number;
  derrotas: number;
  totalAFavor: number;
  totalEnContra: number;
}

export default function GlobalesScreen() {
    const colorScheme = useColorScheme();
    const { user } = useContext(AuthContext);
    const [playerStats, setPlayerStats] = useState<StatItem[]>([]);
    const [teamStats, setTeamStats] = useState<StatItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTeamStats, setShowTeamStats] = useState(false);

    useEffect(() => {
        if (user?.rol === "capitan") {
            setShowTeamStats(true);
        } else {
            setShowTeamStats(false);
        }
    }, [user?.tipoRegistro_2]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                
                const playerData = await fetchPlayerSummary(user?.id ?? undefined) as PlayerStatsResponse;
                
                const formattedPlayerStats: StatItem[] = [
                    { label: 'Partidos', value: playerData.totalPartidos || 0 },
                    { label: 'Tries', value: playerData.tries || 0 },
                    { label: 'Conversiones', value: playerData.conversiones || 0 },
                    { label: 'Tarjetas Amarillas', value: playerData.tarjetas?.amarillas || 0 },
                    { label: 'Tarjetas Rojas', value: playerData.tarjetas?.rojas || 0 },
                    { label: 'Lesiones', value: playerData.lesiones || 0 },
                    { label: 'Victorias', value: playerData.victorias || 0 },
                    { label: 'Empates', value: playerData.empates || 0 },
                    { label: 'Derrotas', value: playerData.derrotas || 0 },
                ];
                setPlayerStats(formattedPlayerStats);

                if (showTeamStats) {
                    const teamData = await fetchTeamSummary(user?.id ?? undefined) as TeamStatsResponse;
                    const formattedTeamStats: StatItem[] = [
                        { label: 'Partidos', value: teamData.totalPartidos || 0 },
                        { label: 'Victorias', value: teamData.victorias || 0 },
                        { label: 'Empates', value: teamData.empates || 0 },
                        { label: 'Derrotas', value: teamData.derrotas || 0 },
                        { label: 'Puntos a favor', value: teamData.totalAFavor || 0 },
                        { label: 'Puntos en contra', value: teamData.totalEnContra || 0 },
                    ];
                    setTeamStats(formattedTeamStats);
                }

            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchStats();
        }
    }, [user?.id, showTeamStats]);

    if (loading) {
        return (
            <LoadingIndicator/>
        );
    }

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}
            edges={['right', 'left']}
        >
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {playerStats.length > 0 && (
                    <StatsCard
                        title={`Estadísticas de ${user?.nombre || 'Jugador'}`}
                        stats={playerStats}
                    />
                )}

                {showTeamStats && teamStats.length > 0 && (
                    <StatsCard
                        title={`Estadísticas de ${teamStats.find(s => s.label === 'equipoNombre')?.value || 'Equipo'}`}
                        stats={teamStats}
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: Layout.spacing.l,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});