import { View, Text, FlatList, Image, StyleSheet, Pressable } from 'react-native';
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import Colors from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';

type SuspensionInfo = {
  tarjetasRojas: number;
  isSuspendido: boolean;
  convocatoriasRestantes?: number;
};

interface Player {
  id: string; 
  nombre: string;
  apellido1: string;
  foto?: string;
  estatus?: string;
}

export default function TeamPlayersScreen() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [suspById, setSuspById] = useState<Record<string, SuspensionInfo>>({});
  const [bubbleFor, setBubbleFor] = useState<string | null>(null); // para mostrar/ocultar “bubble” por jugador
  const { user, token } = useContext(AuthContext);
  const colorScheme = useColorScheme();

  // 1) Traer jugadores por club
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const url = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/app-native-api/jugadores/equipo?id=${user?.clubId}`;
        const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

        const contentType = response.headers.get('content-type');
        if (!response.ok || !contentType?.includes('application/json')) {
          const text = await response.text();
          console.warn('Respuesta no válida:', text);
          return;
        }

        const data = await response.json();
        const lista: Player[] = data.jugadores || [];
        setPlayers(lista);
      } catch (error) {
        console.error('Error de red:', error);
      }
    };

    if (user?.clubId && token) fetchPlayers();
  }, [user?.clubId, token]);

  // 2) Para cada jugador, consultar la suspensión
  useEffect(() => {
    const fetchSusp = async () => {
      if (!players.length) return;
      try {
        const results = await Promise.all(
          players.map(async (p) => {
            try {
              const suspUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/app-native-api/jugadores/${p.id}/suspension`;
              const res = await fetch(suspUrl, { headers: { Authorization: `Bearer ${token}` } });
              if (!res.ok) throw new Error('fail');
              const j = await res.json();
              return [p.id, {
                tarjetasRojas: Number(j.tarjetasRojas ?? 0),
                isSuspendido: !!j.isSuspendido,
                convocatoriasRestantes: Number(j.convocatoriasRestantes ?? 0),
              }] as const;
            } catch {
              // Si falla, regresamos 0/false para no romper UI
              return [p.id, { tarjetasRojas: 0, isSuspendido: false, convocatoriasRestantes: 0 }] as const;
            }
          })
        );

        const map: Record<string, SuspensionInfo> = {};
        results.forEach(([id, info]) => { map[id] = info; });
        setSuspById(map);
      } catch (e) {
        console.error('Error obteniendo suspensiones:', e);
      }
    };

    fetchSusp();
  }, [players, token]);

  const Pill = ({ info, playerId }: { info?: SuspensionInfo; playerId: string }) => {
    const rojas = info?.tarjetasRojas ?? 0;
    const suspendido = !!info?.isSuspendido;
    const rest = info?.convocatoriasRestantes ?? 0;

    const bg = rojas > 0 ? '#fef2f2' : '#f3f4f6';
    const fg = rojas > 0 ? '#b91c1c' : '#6b7280';
    const border = rojas > 0 ? '#fecaca' : '#e5e7eb';

    return (
      <View style={{ marginLeft: 8 }}>
        <Pressable
          onPress={() => setBubbleFor((cur) => (cur === playerId ? null : playerId))}
          style={{ borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: bg, borderWidth: 1, borderColor: border, flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <Text style={{ color: fg, fontSize: 12 }}>🔴 {rojas}</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <Text style={[styles.title, { color: Colors[colorScheme].text }]}>
        Jugadores de {user?.club}
      </Text>

      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => {
          const susp = suspById[item.id];
          return (
            <View style={[styles.card, { backgroundColor: Colors[colorScheme].buttonSecondary }]}>
              <Image source={{ uri: item.foto }} style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.name, { color: Colors[colorScheme].text }]}>
                    {item.nombre} {item.apellido1}
                  </Text>
                  <Pill info={susp} playerId={item.id} />
                </View>

                <Text style={[styles.status, { color: Colors[colorScheme].textSecondary }]}>
                  {item.estatus || 'Sin estatus'}
                </Text>

                {/* línea sutil extra si está suspendido */}
                {susp?.isSuspendido ? (
                  <Text style={{ marginTop: 4, fontSize: 12, color: '#b91c1c' }}>
                    Suspendido — convocatorias restantes: {susp.convocatoriasRestantes ?? 0}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    fontSize: 13,
    marginTop: 4,
  },
  bubble: {
    position: 'absolute',
    top: -32,
    left: 0,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#111827',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  bubbleText: {
    color: 'white',
    fontSize: 12,
  },
});
