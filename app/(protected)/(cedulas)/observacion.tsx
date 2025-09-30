import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCedula } from '@/context/CedulaContext';
import Colors from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';
import { VolverButton } from '@/components/ui/BackButton';

export default function RegistrarObservacion() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { setCedulaData } = useCedula();

  const [texto, setTexto] = useState('');
  const [categoria, setCategoria] = useState<'General' | 'Público' | 'Condiciones' | 'Seguridad' | ''>('');

  const handleGuardar = () => {
    if (!texto.trim()) {
      Alert.alert('Campo requerido', 'La observación no puede estar vacía.');
      return;
    }

    try {
      setCedulaData((prev) => ({
        ...prev,
        observaciones: {
          texto,
          publico: categoria || 'General',
        },
      }));

      console.log('✅ Observación guardada. Redirigiendo a juego...');
      router.back();
    } catch (error) {
      console.error('❌ Error al guardar observación o redirigir:', error);
      Alert.alert('Error', 'Ocurrió un problema al continuar.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors[colorScheme].background, }} behavior="padding">
      <ScrollView 
        contentContainerStyle={[
          styles.container
        ]} 
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: Colors[colorScheme].text }]}>
          Registrar Observación
        </Text>

        <TextInput
          style={[
            styles.textarea,
            { 
              backgroundColor: Colors[colorScheme].inputBackground,
              color: Colors[colorScheme].text,
              borderColor: Colors[colorScheme].border
            }
          ]}
          placeholder="Observación (máx. 300 caracteres)"
          placeholderTextColor={Colors[colorScheme].textSecondary}
          value={texto}
          onChangeText={(value) => {
            if (value.length <= 300) setTexto(value);
          }}
          multiline
          textAlignVertical="top"
        />

        <Text style={[styles.label, { color: Colors[colorScheme].text }]}>
          Categoría
        </Text>
        <View style={styles.categoryGroup}>
          {['General', 'Público', 'Condiciones', 'Seguridad'].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                { 
                  backgroundColor: Colors[colorScheme].buttonSecondary,
                  borderColor: Colors[colorScheme].border
                },
                categoria === cat && {
                  backgroundColor: Colors[colorScheme].buttonPrimary,
                  borderColor: Colors[colorScheme].tint
                }
              ]}
              onPress={() => setCategoria(cat as typeof categoria)}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: Colors[colorScheme].buttonTextSecondary },
                  categoria === cat && {
                    color: Colors[colorScheme].buttonText
                  }
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[
            styles.submitButton, 
            { backgroundColor: Colors[colorScheme].buttonPrimary }
          ]} 
          onPress={handleGuardar}
        >
          <Text style={[styles.submitText, { color: Colors[colorScheme].buttonText }]}>
            Guardar Observación
          </Text>
        </TouchableOpacity>

        <VolverButton />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    flex: 1
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  textarea: {
    padding: 14,
    borderRadius: 12,
    fontSize: 14,
    marginBottom: 20,
    minHeight: 120,
    borderWidth: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
  },
  submitButton: {
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitText: {
    fontWeight: '600',
    fontSize: 16,
  },
  backButton: {
    padding: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
});