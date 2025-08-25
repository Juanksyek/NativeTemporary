import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, ScrollView, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useCedula } from '@/context/CedulaContext';
import Colors from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';
import TeamSelector from '@/components/TeamSelector';
import TimeSelectorToggle from '@/components/TimerToggle';
import CustomTimerInput from '@/components/CustomTimerInput';
import TimeDisplay from '@/components/TimeDisplay';
import { formatTiempo, validateTimeFormat } from '@/utils/timerUtils';
import { VolverButton } from '@/components/ui/BackButton';

export default function RegistroPuntos() {
  const router = useRouter();
  const { cedulaData, setCedulaData, jugadoresLocal, jugadoresVisitante, cronometro } = useCedula();
  // Debug: print jugadoresLocal and jugadoresVisitante
  console.log('jugadoresLocal:', jugadoresLocal);
  console.log('jugadoresVisitante:', jugadoresVisitante);

  const [equipo, setEquipo] = useState<'A' | 'B'>('A');
  const [jugador, setJugador] = useState<number | 'no_registrado' | null>(null);
  const [accion, setAccion] = useState('');
  const [puntosTemporales, setPuntosTemporales] = useState<any[]>([]);
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState('');
  const colorScheme = useColorScheme();


  const calcularPuntos = (equipo: 'A' | 'B') => {
    return cedulaData.marcador
      .filter((p) => p.equipo === equipo)
      .reduce((total, punto) => {
        switch (punto.accion) {
          case 'T':
            return total + 5;
          case 'C':
            return total + 2;
          case 'P':
            return total + 3;
          case 'D':
            return total + 3;
          default:
            return total;
        }
      }, 0);
  };

  const marcadorA =
    calcularPuntos('A') +
    puntosTemporales
      .filter((p) => p.equipo === 'A')
      .reduce((acc, p) => acc + p.puntos, 0);
  const marcadorB =
    calcularPuntos('B') +
    puntosTemporales
      .filter((p) => p.equipo === 'B')
      .reduce((acc, p) => acc + p.puntos, 0);

  const jugadores = equipo === 'A' ? jugadoresLocal : jugadoresVisitante;

  const getPuntos = (accion: string) => {
    switch (accion) {
      case 'T':
        return 5;
      case 'C':
        return 2;
      case 'P':
        return 3;
      case 'D':
        return 3;
      default:
        return 0;
    }
  };

  const handleAgregarPunto = () => {
    let tiempoActual;
    
    if (useCustomTime && customTime) {
      if (!validateTimeFormat(customTime)) {
        Alert.alert('Formato inválido', 'Por favor ingresa el tiempo en formato HH:MM:SS o MM:SS');
        return;
      }
      tiempoActual = customTime;
    } else {
      tiempoActual = formatTiempo(cronometro);
    }

    if (!equipo || !jugador || !accion) {
      Alert.alert('Faltan campos', 'Completa todos los datos del punto.');
      return;
    }

    let nombreJugador: string;
    
    if (jugador === 'no_registrado') {
      nombreJugador = 'No registrado';
    } else {
      const player = jugadores.find(j => j.id === jugador);
      if (!player) {
        Alert.alert('Error', 'Jugador no encontrado');
        return;
      }
      nombreJugador = player.nombre;
    }

    const nuevoPunto = {
      equipo,
      jugador: nombreJugador,
      jugadorId: jugador,     
      accion,
      tiempo: tiempoActual,
      puntos: getPuntos(accion),
      isCustomTime: useCustomTime, // Track if custom time was used
    };

    setPuntosTemporales((prev) => [...prev, nuevoPunto]);

    setJugador(null);  
    setAccion('');
    setCustomTime('');
    setUseCustomTime(false);
  };

  const handleCancelarPunto = (index: number) => {
    setPuntosTemporales((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGuardarMarcador = () => {
    setCedulaData((prev) => ({
      ...prev,
      marcador: [...prev.marcador, ...puntosTemporales],
    }));
    setPuntosTemporales([]);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: Colors[colorScheme].text }]}>Registro de puntos</Text>

        {/* Tipo de Acción */}
        <View style={styles.actionContainer}>
          {[
            { label: 'Tries', puntos: 5, value: 'T' },
            { label: 'Conversión', puntos: 2, value: 'C' },
            { label: 'Penalties', puntos: 3, value: 'P' },
            { label: 'Drops', puntos: 3, value: 'D' },
          ].map(({ label, puntos, value }) => (
            <TouchableOpacity
              key={label}
              style={[
                styles.actionButton,
                { backgroundColor: Colors[colorScheme].cardBackground },
                accion === value && {
                  backgroundColor: Colors[colorScheme].buttonSelected
                }
              ]}
              onPress={() => setAccion(value)}
            >
              <Text style={[
                styles.actionText, 
                { color: Colors[colorScheme].text },
                accion === value && {
                  color: Colors[colorScheme].buttonText
                }
              ]}>
                {label} ({puntos} pts)
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Equipo A / B */}
        <TeamSelector
          equipo={equipo}
          setEquipo={setEquipo}
          equipoLocalNombre={cedulaData.equipoLocal?.nombre}
          equipoVisitanteNombre={cedulaData.equipoVisitante?.nombre}
        />

          <TimeSelectorToggle
            useCustomTime={useCustomTime}
            onToggle={setUseCustomTime}
          />

          {useCustomTime ? (
            <CustomTimerInput
              value={customTime}
              onChange={setCustomTime}
            />
          ) : (
            <TimeDisplay time={formatTiempo(cronometro)} />
          )}

        {/* Jugador */}
        <View style={[styles.select, { backgroundColor: Colors[colorScheme].cardBackground }]}>
          {/* Jugadores registrados */}
          {jugadores.map((j) => (
            <TouchableOpacity
              key={j.id}
              style={[
                {
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors[colorScheme].border,
                  flexDirection: 'row',
                  alignItems: 'center',
                },
                jugador === j.id && { 
                  backgroundColor: Colors[colorScheme].buttonSelected,
                }
              ]}
              onPress={() => setJugador(j.id)}  
            >
              <Text style={[
                styles.playerRow,
                { color: Colors[colorScheme].text },
                jugador === j.id && {
                  color: Colors[colorScheme].buttonText
                }
              ]}>
                {j.nombre}
              </Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            style={[
              {
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: Colors[colorScheme].border,
                flexDirection: 'row',
                alignItems: 'center',
              },
              jugador === 'no_registrado' && { 
                backgroundColor: Colors[colorScheme].buttonSelected,
              }
            ]}
            onPress={() => setJugador('no_registrado')}
          >
            <Text style={[
               styles.playerRow,
              { color: Colors[colorScheme].text },
              jugador === 'no_registrado' && {
                color: Colors[colorScheme].buttonText
              }
            ]}>
              No registrado
            </Text>
          </TouchableOpacity>
          
          {!jugadores.length && (
            <Text style={{ color: Colors[colorScheme].textSecondary }}>
              Sin jugadores escaneados para este equipo
            </Text>
          )}
        </View>

        {/* Agregar Punto */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: Colors[colorScheme].buttonPrimary }]}
          onPress={handleAgregarPunto}
        >
          <Text style={[styles.submitText, { color: Colors[colorScheme].buttonText }]}>Agregar Punto</Text>
        </TouchableOpacity>

        {/* Lista de puntos temporales */}
        {puntosTemporales.length > 0 && (
          <View style={[styles.pendingPointsContainer, { backgroundColor: Colors[colorScheme].cardBackground }]}>
            <Text style={[styles.pendingPointsTitle, { color: Colors[colorScheme].text }]}>Puntos pendientes:</Text>
            {puntosTemporales.map((punto, index) => (
              <View key={index} style={styles.pendingPointRow}>
                <Text style={{ color: Colors[colorScheme].text }}>
                  {punto.jugador} ({punto.accion}) - {punto.puntos} pts - {punto.tiempo}
                  {punto.isCustomTime && ' *'}
                </Text>
                <TouchableOpacity onPress={() => handleCancelarPunto(index)}>
                  <Text style={{ color: Colors[colorScheme].error }}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Marcador visual */}
        <View style={[styles.scoreCard, { backgroundColor: Colors[colorScheme].cardBackground }]}>
          <Text style={[styles.teamScore, { color: Colors[colorScheme].text }]}>{marcadorA}</Text>
          <Text style={[styles.vs, { color: Colors[colorScheme].text }]}>:</Text>
          <Text style={[styles.teamScore, { color: Colors[colorScheme].text }]}>{marcadorB}</Text>
        </View>
        <View style={styles.scoreInfo}>
          <Text style={[styles.teamLabel, { color: Colors[colorScheme].textSecondary }]}>
            {cedulaData.equipoLocal?.nombre || 'Equipo A'}
          </Text>
          <Text style={[styles.fecha, { color: Colors[colorScheme].text }]}>
            Inicio: {cedulaData.horaInicio || '--:--'}
          </Text>
          <Text style={[styles.teamLabel, { color: Colors[colorScheme].textSecondary }]}>
            {cedulaData.equipoVisitante?.nombre || 'Equipo B'}
          </Text>
        </View>

        {/* Guardar */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { 
              backgroundColor: Colors[colorScheme].background,
              borderWidth: 1,
              borderColor: Colors[colorScheme].buttonPrimary
            },
          ]}
          onPress={handleGuardarMarcador}
        >
          <Text style={[styles.submitText, { color: Colors[colorScheme].buttonPrimary }]}>
            Guardar marcador y continuar
          </Text>
        </TouchableOpacity>
        <VolverButton />
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingVertical: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 40, 
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  select: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  playerRow: {
    marginLeft: 10
  },
  timerInput: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 16,
    borderBottomWidth: 1,
    paddingVertical: 6,
    width: 120,
    alignSelf: 'center',
  },
  submitButton: {
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 12,
  },
  submitText: {
    fontWeight: '600',
    fontSize: 16,
  },
  scoreCard: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
  },
  teamScore: {
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 12,
  },
  vs: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 8,
  },
  teamLabel: {
    fontSize: 12,
    maxWidth: '40%',
  },
  fecha: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    minWidth: '22%',
    borderRadius: 12,
    alignItems: 'center',
  },
  actionText: {
    fontWeight: '600',
    fontSize: 11,
    textAlign: 'center',

  },
  pendingPointsContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
  },
  pendingPointsTitle: {
    fontWeight: '600',
    marginBottom: 6,
  },
  pendingPointRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timeSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  timeOptionButton: {
    padding: 12,
    borderRadius: 8,
    minWidth: '48%',
    alignItems: 'center',
  },
  timeOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  customTimeContainer: {
    marginBottom: 20,
  },
  customTimeInput: {
    fontSize: 18,
    padding: 12,
    borderRadius: 8,
    textAlign: 'center',
    borderWidth: 1,
    marginBottom: 5,
  },
  timeFormatHint: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});