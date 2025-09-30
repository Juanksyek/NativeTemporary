import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { fetchMatchReports } from '@/api/user/tournaments';
import { CedulaResponse } from '@/types/cedulas';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';
import MatchCard from '@/components/MatchCard';
import { MatchStatsCard } from '@/components/TeamStats';
import { ErrorIndicator, LoadingIndicator } from '@/components/ui/Indicators';

export default function MatchReportScreen() {
  const colorScheme = useColorScheme();

  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const [matchData, setMatchData] = useState<CedulaResponse>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchMatchReports(matchId);
        setMatchData(result);
        
        console.log(result.resultados[0])
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (matchId) {
      loadData();
    }
  }, [matchId]);

  if (loading) {
    return (
      <LoadingIndicator/>
    );
  }

  if (error) {
    return (
      <ErrorIndicator error={error}/>
    );
  }


  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}
      edges={['top', 'right', 'left']}
    >
      <ScrollView style={styles.scrollView}>
        <View>
          
          {matchData?.resultados?.[0] && (
            <View>
              <MatchCard match={{
                ...matchData.resultados[0].datosPartido,
                estatus: "finalizado",
                equipoGanador: matchData.resultados[0].equipoGanador,
                resultadoResumen: matchData.resultados[0].resultadoResumen
              }}  />
              
              <MatchStatsCard matchData={matchData.resultados[0]} />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  matchId: {
    fontSize: 18,
    marginBottom: 10,
  },
  matchInfo: {
    fontSize: 16,
    marginBottom: 8,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});