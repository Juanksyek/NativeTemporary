// hooks/usePlayers.ts
import { getPlayersFromStorage } from '@/services/teamSave';
import { Player } from '@/types/user';
import { useState, useEffect } from 'react';

export const usePlayers = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const cachedData = await getPlayersFromStorage();
        if (cachedData) {
          setPlayers(cachedData.players);
        }
      } catch (error) {
        console.error('Error loading players from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlayers();
  }, []);

  const refreshPlayers = async () => {
    setIsLoading(true);
    try {
      const cachedData = await getPlayersFromStorage();
      if (cachedData) {
        setPlayers(cachedData.players);
      }
    } catch (error) {
      console.error('Error refreshing players:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    players,
    isLoading,
    refreshPlayers
  };
};