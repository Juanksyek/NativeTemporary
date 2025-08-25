import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Flag, Repeat, Pencil, Bandage } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCedula } from '@/context/CedulaContext';
import Colors from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';
import Stopwatch from '@/components/stopWatch';

export default function JuegoScreen() {
  // Log player names for debugging
  const { cedulaData } = useCedula();
  const playerNames = cedulaData.marcador.map(p => p.jugador);
  console.log('Jugadores en marcador:', playerNames);
  const router = useRouter();
  // Log player names for debugging
  if (cedulaData && cedulaData.marcador) {
    const playerNames = cedulaData.marcador.map(p => p.jugador);
    console.log('Jugadores en marcador:', playerNames);
  }
  const colorScheme = useColorScheme();
  
  const calcularPuntos = (equipo: 'A' | 'B') => {
    return cedulaData.marcador
      .filter(p => p.equipo === equipo)
      .reduce((total, punto) => {
        switch (punto.accion) {
          case 'T': return total + 5;
          case 'C': return total + 2;
          case 'P': return total + 3;
          case 'D': return total + 3;
          default: return total;
        }
      }, 0);
  };

  const puntosA = calcularPuntos('A');
  const puntosB = calcularPuntos('B');

  const marcadorA = cedulaData.marcador.filter(p => p.equipo === 'A');
  const marcadorB = cedulaData.marcador.filter(p => p.equipo === 'B');

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <ScrollView style={styles.scrollView}>

      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <Text style={[styles.title, { color: Colors[colorScheme].text }]}>Cédula del partido</Text>

      {/* Encabezado del partido */}
      <View style={[styles.matchCard, { backgroundColor: Colors[colorScheme].cardBackground }]}>
        <View style={styles.matchHeader}>
          <Text style={[styles.badge, { backgroundColor: Colors[colorScheme].buttonPrimary, color: Colors[colorScheme].buttonText }]}>
            {cedulaData.torneo || (cedulaData.tipoPartido === 'torneo' ? 'Torneo' : 'Amistoso')}
          </Text>
          <Text style={[styles.badge, { backgroundColor: Colors[colorScheme].buttonPrimary, color: Colors[colorScheme].buttonText }]}>
            Inicio: {cedulaData.horaInicio || '--:--'}
          </Text>
        </View>

        <View style={styles.scoreSection}>
          <Image
            style={styles.teamLogo}
            source={cedulaData.equipoLocal?.logo ? { uri: cedulaData.equipoLocal.logo } : require('@/assets/images/FMRUU.png')}
          />
          <Text style={[styles.score, { color: Colors[colorScheme].text }]}>{puntosA} : {puntosB}</Text>
          <Image
            style={styles.teamLogo}
            source={cedulaData.equipoVisitante?.logo ? { uri: cedulaData.equipoVisitante.logo } : require('@/assets/images/FMRUU.png')}
          />
        </View>

        <View style={styles.teamNames}>
          <Text style={[styles.teamName, { color: Colors[colorScheme].text }]}>{cedulaData.equipoLocal?.nombre || 'Equipo A'}</Text>
          <Text style={[styles.teamName, { color: Colors[colorScheme].text }]}>{cedulaData.equipoVisitante?.nombre || 'Equipo B'}</Text>
        </View>
      </View>

      {/* Tabla de puntos */}
      <View style={[styles.statsTable, { backgroundColor: Colors[colorScheme].cardBackground }]}>
        <View style={[styles.statsHeader, { backgroundColor: Colors[colorScheme].buttonPrimary }]}>
          {['#', 'Jugador', 'Acción', 'Tiempo'].map((h, i) => (
            <Text key={i} style={[styles.statsCell, { color: Colors[colorScheme].buttonText }]}>{h}</Text>
          ))}
        </View>

        <ScrollView style={styles.statsScroll} nestedScrollEnabled={true}>
          {[...marcadorA, ...marcadorB].map((punto, index) => (
            <View key={index} style={[styles.statsRow, { borderBottomColor: Colors[colorScheme].border }]}>
              <Text style={[styles.statsCell, { color: Colors[colorScheme].text }]}>{index + 1}</Text>
              <Text style={[styles.statsCell, { color: Colors[colorScheme].text }]}>{punto.jugador}</Text>
              <Text style={[styles.statsCell, { color: Colors[colorScheme].text }]}>{punto.accion}</Text>
              <Text style={[styles.statsCell, { color: Colors[colorScheme].text }]}>{punto.tiempo}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Cronómetro */}
      <Stopwatch />

      {/* Botones */}
      <TouchableOpacity
        style={[styles.mainButton, { backgroundColor: Colors[colorScheme].buttonPrimary }]}
        onPress={() => router.push('/(protected)/(cedulas)/puntos')}
      >
        <Text style={[styles.mainButtonText, { color: Colors[colorScheme].buttonText }]}>Agregar punto</Text>
      </TouchableOpacity>

      <View style={styles.actionGrid}>
        {[
          { label: 'Tarjetas', icon: <Flag size={28} color={Colors[colorScheme].text} />, route: '/(protected)/(cedulas)/tarjeta' },
          { label: 'Cambios', icon: <Repeat size={28} color={Colors[colorScheme].text} />, route: '/(protected)/(cedulas)/cambio' },
          { label: 'Observaciones', icon: <Pencil size={28} color={Colors[colorScheme].text} />, route: '/(protected)/(cedulas)/observacion' },
          { label: 'Lesiones', icon: <Bandage size={28} color={Colors[colorScheme].text} />, route: '/(protected)/(cedulas)/lesion' }
        ].map(({ label, icon, route }, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.iconButton, { backgroundColor: Colors[colorScheme].cardBackground }]}
            onPress={() => router.push(route)}
          >
            {icon}
            <Text style={[styles.iconLabel, { color: Colors[colorScheme].text }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.digitalSignButton, { backgroundColor: Colors[colorScheme].cardBackground }]}
        onPress={() => router.push('/(protected)/(cedulas)/firmas')}
      >
        <Text style={[styles.secondaryText, { color: Colors[colorScheme].text }]}>Firmas Digitales</Text>
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  matchCard: {
    backgroundColor: '#eee',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: '#ccc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
  },
  scoreSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 6,
  },
  teamLogo: {
    width: 50,
    height: 50,
  },
  score: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  teamNames: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  teamName: {
    fontSize: 14,
    width: '45%',
    textAlign: 'center',
  },
  statsTable: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 6
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
  },
  statsCell: {
    width: 40,
    textAlign: 'center',
    fontSize: 13,
    flex: 1,
    padding: 5
  },
  mainButton: {
    backgroundColor: '#1B9D3B',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 16
  },
  mainButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: '#E6EFE6',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    alignItems: 'center',
    marginBottom: 8,
  },
  secondaryText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  digitalSignButton: {
    backgroundColor: '#D8F0D8',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16
  },
  iconButton: {
    backgroundColor: '#E6EFE6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    width: '22%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#111',
    textAlign: 'center',
    fontWeight: '500',
  },
  cronometroContainer: {
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cronometroTiempo: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  cronoButtonGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  cronoButton: {
    backgroundColor: '#1B9D3B',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  cronoButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statsScroll: {
    maxHeight: 220, 
  },
});