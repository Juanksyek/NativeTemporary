import { TournamentMatch } from '@/types/convocatiorias';
import { Player } from '@/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PLAYERS_STORAGE_KEY = '@players_data';
const CACHE_DURATION = 24 * 60 * 60 * 1000; 

export class matchService {
    MATCH = "match";

    async getMatch() {
        const match = await AsyncStorage.getItem(this.MATCH);
        if (!match) {
            return null;
        }
        return JSON.parse(match) as TournamentMatch;
    }

    async setMatch(match: TournamentMatch) {
        await AsyncStorage.setItem(this.MATCH, JSON.stringify(match));
    }

}



export const savePlayersToStorage = async (players: Player[]) => {
  try {
    const dataToStore = {
      players,
      timestamp: Date.now()
    };
    await AsyncStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(dataToStore));
    console.log('✅ Jugadores guardados en AsyncStorage');
  } catch (error) {
    console.error('❌ Error guardando jugadores en AsyncStorage:', error);
  }
};

export const getPlayersFromStorage = async (): Promise<{ players: Player[], timestamp: number } | null> => {
  try {
    const storedData = await AsyncStorage.getItem(PLAYERS_STORAGE_KEY);
    if (!storedData) return null;

    const parsedData = JSON.parse(storedData);
    return {
      players: parsedData.players,
      timestamp: parsedData.timestamp
    };
  } catch (error) {
    console.error('❌ Error obteniendo jugadores de AsyncStorage:', error);
    return null;
  }
};

export const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION;
};