import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Alert, Linking, Share, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';
import Layout from '@/constants/Layout';
import { ChevronRight } from 'lucide-react-native';
import Button from '@/components/Button';
import { AuthContext } from '@/context/AuthContext';
import { useContext, useState } from 'react';
import Toast from 'react-native-toast-message';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { user, logOut, token } = useContext(AuthContext);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleEditProfile = () => {
    router.push('/(protected)/(tabs)/perfil/edit');
  };

  const handleDownloadID = async () => {
    if (!user?.id || !token) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo obtener la información del usuario',
      });
      return;
    }

    setIsDownloading(true);
    
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/credencial/${user.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Convertir la respuesta a blob para manejar el PDF
      const pdfBlob = await response.blob();
      
      // Crear un nombre único para el archivo
      const fileName = `credencial_${user.id}_${Date.now()}.pdf`;
      const directory = (FileSystem as any).cacheDirectory || (FileSystem as any).documentDirectory;
      if (!directory) {
        throw new Error('No se encontró un directorio válido para guardar el archivo');
      }
      const fileUri = `${directory}${fileName}`;
      
      // Convertir blob a base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64data = reader.result as string;
          const base64 = base64data.split(',')[1]; // Remover el prefijo data:application/pdf;base64,
          
          // Escribir el archivo
          await FileSystem.writeAsStringAsync(fileUri, base64, {
            encoding: "base64",
          });

          // Mostrar vista previa del PDF
          await previewPDF(fileUri);

          Toast.show({
            type: 'success',
            text1: '¡Éxito!',
            text2: 'Credencial consultada correctamente',
          });
          
        } catch (fileError) {
          console.error('Error saving file:', fileError);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'No se pudo guardar el archivo',
          });
        }
      };
      
      reader.readAsDataURL(pdfBlob);
      
    } catch (error) {
      console.error('Error downloading credential:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo descargar la credencial. Inténtalo de nuevo.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const previewPDF = async (fileUri: string) => {
    try {
      // Verificar si el archivo existe
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('El archivo no existe');
      }

      // Verificar si sharing está disponible
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        // Si sharing no está disponible, intentar abrir con intent launcher en Android
        if (Platform.OS === 'android') {
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: fileUri,
            type: 'application/pdf',
          });
        } else {
          // En iOS, usar Linking como fallback
          await Linking.openURL(fileUri);
        }
        return;
      }

      // Mostrar el PDF usando expo-sharing con vista previa
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Vista previa de tu credencial',
        UTI: 'com.adobe.pdf',
      });

    } catch (error) {
      console.error('Error previewing PDF:', error);
      Toast.show({
        type: 'error',
        text1: 'Error en vista previa',
        text2: 'Intentando abrir con aplicación por defecto...',
      });
      // Si falla la vista previa, intentar abrir con la app por defecto
      await openPDF(fileUri);
    }
  };

  const openPDF = async (fileUri: string) => {
    try {
      if (Platform.OS === 'android') {
        // En Android, usar IntentLauncher para evitar FileUriExposedException
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: fileUri,
          type: 'application/pdf',
        });
      } else {
        // En iOS, usar Linking
        await Linking.openURL(fileUri);
      }
    } catch (error) {
      console.error('Error opening PDF:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo abrir el archivo. Verifica que tengas una app para PDFs instalada.',
      });
    }
  };

  const sharePDF = async (fileUri: string) => {
    try {
      // Verificar si sharing está disponible
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'La función de compartir no está disponible en este dispositivo',
        });
        return;
      }

      // Usar expo-sharing para compartir de forma segura
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartir Credencial',
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      console.error('Error sharing PDF:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo compartir el archivo',
      });
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}
      edges={['top', 'right', 'left']}
    >
      <ScrollView style={styles.scrollView}>
        <View style={[styles.profileCard, { backgroundColor: Colors[colorScheme].cardBackground }]}>
          <View style={styles.profileImageContainer}>
            <Image
              source={user?.foto ? { uri: user.foto } : require('@/assets/images/LogoSnake.png')}
              style={styles.profileImage}
            />
          </View>

          <Text style={[styles.name, { color: Colors[colorScheme].text }]}>
            {user?.nombre} {user?.apellido1}
          </Text>
          <Text style={[styles.email, { color: Colors[colorScheme].textSecondary }]}>
            {user?.email}
          </Text>
        </View>

        <View style={[styles.idSection, { backgroundColor: Colors[colorScheme].cardBackground }]}>
          <Text style={[styles.idTitle, { color: Colors[colorScheme].text }]}>
            Tu ID único: {user?.id}
          </Text>
        </View>

        <View style={[styles.teamSection, { backgroundColor: Colors[colorScheme].cardBackground }]}>
          <View style={styles.teamHeader}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>
              Mi Equipo
            </Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => router.push('/(protected)/perfil/TeamPlayerScreen')}
            >
              <Text style={[styles.seeAllText, { color: Colors[colorScheme].tint }]}>
                See All
              </Text>
              <ChevronRight size={20} color={Colors[colorScheme].tint} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.teamName, { color: Colors[colorScheme].textSecondary }]}>
            {user?.club}
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={isDownloading ? "Descargando..." : "Descargar ID"}
            onPress={handleDownloadID}
            style={styles.downloadButton}
            disabled={isDownloading}
          />
          <Button
            title="Editar Perfil"
            onPress={handleEditProfile}
            variant="secondary"
          />
          <Button
            title="Cerrar Sesión"
            onPress={logOut}
            variant="secondary"
            style={{ marginTop: 16 }}
          />
        </View>

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
  logo: {
    width: 36,
    height: 36,
  },
  headerText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: Layout.spacing.xs,
  },
  profileCard: {
    alignItems: 'center',
    padding: Layout.spacing.l,
    marginHorizontal: Layout.spacing.l,
    borderRadius: Layout.borderRadius.large,
    marginBottom: Layout.spacing.l,
    marginTop: Layout.spacing.l
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: Layout.spacing.m,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: Layout.spacing.xs,
  },
  email: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  idSection: {
    padding: Layout.spacing.l,
    marginHorizontal: Layout.spacing.l,
    borderRadius: Layout.borderRadius.large,
    marginBottom: Layout.spacing.l,
  },
  idTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  teamSection: {
    padding: Layout.spacing.l,
    marginHorizontal: Layout.spacing.l,
    borderRadius: Layout.borderRadius.large,
    marginBottom: Layout.spacing.l,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.s,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginRight: Layout.spacing.xs,
  },
  teamName: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  buttonContainer: {
    padding: Layout.spacing.l,
  },
  downloadButton: {
    marginBottom: Layout.spacing.m,
  },
});