import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import TeamCard from "@/components/qr-capitan/TeamCard";
import FilterBar from "@/components/qr-capitan/FilterBar";
import PlayerList from "@/components/qr-capitan/PlayerList";
import GenerateQRButton from "@/components/qr-capitan/GenerateQRButton";
import SearchBar from "@/components/qr-capitan/SearchBar";
import PaginationControls from "@/components/qr-capitan/PaginationControls";
import PlayerCounter from "@/components/qr-capitan/PlayerCounter";
import { RootStackParamList } from "@/types/navigation";
import { Player } from "@/types/user";
import Colors from "@/constants/Colors";
import useColorScheme from "@/hooks/useColorScheme";

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "SeleccionarJugadores"
>;

const SeleccionarJugadores = () => {
  const playersPerPage = 10;
  const totalPlayers = 50;
  const totalPages = Math.ceil(totalPlayers / playersPerPage);
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [page, setPage] = useState(1);
  const colorScheme = useColorScheme();
  const navigation = useNavigation<NavigationProp>();

  const handleTogglePlayer = (player: Player) => {
    setSelectedPlayers((prev) => {
      const exists = prev.some((p) => p.id === player.id);
      if (exists) {
        return prev.filter((p) => p.id !== player.id);
      } else {
        if (prev.length >= 11) {
          Alert.alert("Límite alcanzado", "Solo puedes seleccionar 11 jugadores.");
          return prev;
        }
        return [...prev, player];
      }
    });
  };

  const handleGenerateQR = () => {
    if (selectedPlayers.length === 0) {
      Alert.alert("Sin jugadores", "Selecciona al menos un jugador para continuar.");
      return;
    }

    navigation.navigate("ConfirmGenerateQR", {
      jugadoresSeleccionados: selectedPlayers,
    });
  };

  return (
    <View style={[styles.container, {backgroundColor: Colors[colorScheme].background}]}>
      <ScrollView >
        <TeamCard />
        <FilterBar active={activeFilter} onChange={setActiveFilter} />
        <SearchBar value={searchTerm} onChangeText={setSearchTerm} />
        <PlayerList
          filter={searchTerm}
          page={page}
          onUpdateSelection={handleTogglePlayer}
          selected={selectedPlayers}
        />
        {!searchTerm && (
          <PaginationControls
            page={page}
            totalPages={totalPages}
            onNext={() => setPage((prev) => prev + 1)}
            onPrevious={() => setPage((prev) => Math.max(prev - 1, 1))}
          />
        )}
        <PlayerCounter selected={selectedPlayers.length} total={11} />
        <GenerateQRButton onPress={handleGenerateQR} />
      </ScrollView>
    </View>
  );
};

export default SeleccionarJugadores;

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingBottom: 40
  },
});
