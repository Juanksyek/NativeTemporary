import { fetchConvocatorias, fetchConvocatoriasPasadas, fetchConvocatoriasArbitro } from '@/api/user/tournaments';
import { getAdminToken } from '@/services/helpers';
import { TournamentMatch } from '@/types/convocatiorias';
import { useState, useEffect, useCallback, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '@/context/AuthContext';

interface ResponseObject {
    convocado: boolean;
    torneos: TournamentMatch[];
    amistosos: TournamentMatch[];
    nextMatch?: TournamentMatch | null;
    pastMatches?: TournamentMatch[] | null;
}

interface ExtendedResponseObject extends ResponseObject {
    filteredTournaments: TournamentMatch[];
}

const NEXT_MATCH_STORAGE_KEY = 'next_match_data';

export const useConvocatorias = (clubId?: number) => {
    const [convocatorias, setConvocatorias] = useState<ExtendedResponseObject>({
        convocado: false,
        torneos: [],
        amistosos: [],
        nextMatch: null,
        filteredTournaments: []
    });
    const [pastMatches, setPastMatches] = useState<TournamentMatch[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isOffline, setIsOffline] = useState<boolean>(false);
    const { user } = useContext(AuthContext);

    
    const getNearestMatch = (matches: TournamentMatch[]): TournamentMatch | null => {
        if (!matches.length) return null;
    
        const now = new Date();
        const nowTime = now.getTime();
    
        const upcomingMatches = matches.filter(match => {
            const matchDate = new Date(`${match.fecha}T${match.horario.split('-')[0]}`);
            const horasActuales = matchDate.getHours();
            return matchDate.setHours(horasActuales + 6) >= nowTime && match.estatus === "programado";
        });
    
        if (!upcomingMatches.length) return null;
    
        return upcomingMatches.reduce((nearest, current) => {
            const nearestDate = new Date(`${nearest.fecha}T${nearest.horario.split('-')[0]}`);
            const currentDate = new Date(`${current.fecha}T${current.horario.split('-')[0]}`);
            
            const nearestDiff = Math.abs(nearestDate.getTime() - nowTime);
            const currentDiff = Math.abs(currentDate.getTime() - nowTime);
            
            return currentDiff < nearestDiff ? current : nearest;
        });
    };

    const getUniqueTournaments = (matches: TournamentMatch[]): TournamentMatch[] => {
        const uniqueNames = new Set<string>();
        return matches.filter(match => {
            if (!match.torneo || uniqueNames.has(match.torneo)) {
                return false;
            }
            uniqueNames.add(match.torneo);
            return true;
        });
    };

    // Save next match to AsyncStorage
    const saveNextMatch = async (match: TournamentMatch | null) => {
        try {
            if (match) {
                await AsyncStorage.setItem(NEXT_MATCH_STORAGE_KEY, JSON.stringify(match));
            } else {
                await AsyncStorage.removeItem(NEXT_MATCH_STORAGE_KEY);
            }
        } catch (error) {
            console.error('Failed to save next match:', error);
        }
    };

    // Load next match from AsyncStorage
    const loadNextMatch = async (): Promise<TournamentMatch | null> => {
        try {
            const savedMatch = await AsyncStorage.getItem(NEXT_MATCH_STORAGE_KEY);
            return savedMatch ? JSON.parse(savedMatch) : null;
        } catch (error) {
            console.error('Failed to load next match:', error);
            return null;
        }
    };

    const fetchData = useCallback(async () => {
      if (clubId === undefined) {
          setConvocatorias({
              convocado: false,
              torneos: [],
              amistosos: [],
              nextMatch: null,
              filteredTournaments: []
          });
          setLoading(false);
          return;
      }
  
      try {
          setLoading(true);
          const savedMatch = await loadNextMatch();
          
          try {
              const token = await getAdminToken();
              if (!token) {
                  throw new Error('No admin token found');
              }

              const pastMatches = await fetchConvocatoriasPasadas(clubId, token);
              setPastMatches(pastMatches.partidosTorneo);
              
              let data;
              if (user?.tipoRegistro_3 === 1) {
                  data = await fetchConvocatoriasArbitro(clubId, token);
              } else {
                  data = await fetchConvocatorias(clubId, token);
              }
              
              const allMatches = [...(data.torneos || []), ...(data.amistosos || [])];
              const nearestMatch = getNearestMatch(allMatches);
  
              if (nearestMatch) {
                  await saveNextMatch(nearestMatch);
              } else {
                  await AsyncStorage.removeItem(NEXT_MATCH_STORAGE_KEY);
              }
  
              const allTournaments = [...(data.torneos || []), ...(data.amistosos || [])];
              const filteredTournaments = getUniqueTournaments(allTournaments);
  
              setConvocatorias({
                  convocado: data.convocado,
                  torneos: data.torneos || [],
                  amistosos: data.amistosos || [],
                  nextMatch: nearestMatch,
                  filteredTournaments: filteredTournaments
              });
              setError(null);
              setIsOffline(false);
          } catch (fetchError) {
              setIsOffline(true);
              console.log('Network error, using saved data:', savedMatch);
              
              if (savedMatch) {
                  setConvocatorias(prev => ({
                      ...prev,
                      nextMatch: savedMatch,
                      torneos: prev.torneos.length ? prev.torneos : [],
                      amistosos: prev.amistosos.length ? prev.amistosos : []
                  }));
              } else {
                  throw fetchError;
              }
          }
      } catch (error) {
          console.error('Fetch data error:', error);
          setError(error instanceof Error ? error.message : 'Unknown error occurred');
          setConvocatorias({
              convocado: false,
              torneos: [],
              amistosos: [],
              nextMatch: null,
              filteredTournaments: []
          });
      } finally {
          setLoading(false);
      }
  }, [clubId, user?.tipoRegistro_3]); // Added user.tipoRegistro_3 to dependency array

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refetch = useCallback(() => {
        return fetchData();
    }, [fetchData]);

    return { data: convocatorias, loading, error, refetch, isOffline, pastMatches };
};