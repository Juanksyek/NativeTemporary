import React, { useContext, useState, useCallback, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  ScrollView, 
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';
import Layout from '@/constants/Layout';
import MatchCard from '@/components/MatchCard';
import { AuthContext } from '@/context/AuthContext';
import MatchTabs from '@/components/MatchTabs';
import { useConvocatorias } from '@/hooks/useFetchMatches';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { user } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const { data, refetch, loading, error, isOffline, pastMatches } = useConvocatorias(user?.clubId ?? undefined);
  const nextMatch = data.nextMatch;

  console.log(pastMatches)
  useEffect(() => {
    if (!loading) {
      setInitialLoad(false);
    }
  }, [loading]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
      if (isOffline) {
        Alert.alert(
          "Modo sin conexión",
          "Estás viendo información guardada. Conéctate a internet para obtener datos actualizados.",
          [{ text: "OK" }]
        );
      }
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  }, [refetch, isOffline]);

  // Show loading state only on initial load
  if (initialLoad && loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        </View>
      </SafeAreaView>
    );
  }

  if (error && !nextMatch && !data.torneos.length && !data.amistosos.length) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: Colors[colorScheme].text }]}>
            Error al cargar los partidos
          </Text>
          <Text style={[styles.errorSubtext, { color: Colors[colorScheme].textSecondary }]}>
            {error}
          </Text>
          <Text 
            style={[styles.retryText, { color: Colors[colorScheme].tint }]}
            onPress={refetch}
          >
            Reintentar
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}
      edges={['top', 'right', 'left']}
    >
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors[colorScheme].tint]}
            tintColor={Colors[colorScheme].tint} 
            progressBackgroundColor={Colors[colorScheme].background}
          />
        }
      >
        {/* Offline indicator banner */}
        {isOffline && (
          <View style={[styles.offlineBanner, { backgroundColor: Colors[colorScheme].warning }]}>
            <Text style={styles.offlineText}>Modo sin conexión - Datos guardados</Text>
          </View>
        )}

        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <Image
              source={{ uri: user?.foto || "" }}
              style={styles.profileImage}
            />
          </View>
        </View>
       
        <Text style={[styles.greeting, { color: Colors[colorScheme].text }]}>
          ¡Hola, {user?.nombre}!
        </Text>
        <Text style={[styles.subtitle, { color: Colors[colorScheme].textSecondary }]}>
          {isOffline ? "Datos guardados - Conéctate para actualizar" : "Listo para tu próximo partido?"}
        </Text>
        
        {nextMatch ? (
          <View style={styles.nextMatchContainer}>
            <MatchCard 
              match={nextMatch} 
              variant="large" 
            />
          </View>
        ) : (
          !loading && (
            <View style={styles.noMatchesContainer}>
              <Text style={[styles.noMatchesText, { color: Colors[colorScheme].textSecondary }]}>
                No hay partidos próximos
              </Text>
            </View>
          )
        )}
        
        <MatchTabs 
          upcomingMatches={data.torneos}
          pastMatches={pastMatches}
        />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.l,
    paddingVertical: Layout.spacing.m,
  },
  profileContainer: {
    width: 60,
    height: 60,
    borderRadius: 50,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    paddingHorizontal: Layout.spacing.l,
    textAlign: "center"
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    paddingHorizontal: Layout.spacing.l,
    marginBottom: Layout.spacing.l,
    textAlign: "center"
  },
  nextMatchContainer: {
    paddingHorizontal: Layout.spacing.l,
    marginBottom: Layout.spacing.l,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryText: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 10,
  },
  offlineBanner: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: Colors.light.warning,
  },
  offlineText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noMatchesContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noMatchesText: {
    fontSize: 16,
  },
});