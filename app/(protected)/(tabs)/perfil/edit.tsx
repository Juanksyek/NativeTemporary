import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, KeyboardAvoidingView, Platform, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';
import Layout from '@/constants/Layout';
import ProfileHeader from '@/components/ProfileHeader';
import FormInput from '@/components/FormInput';
import SelectInput from '@/components/SelectInput';
import Button from '@/components/Button';
import { User } from '@/types/user';
import { AuthContext } from '@/context/AuthContext';
import Toast from 'react-native-toast-message';
import { updateUserProfile } from '@/api/user/update';
import { estados, parentescoOptions, TIPO_SANGRE_OPTIONS } from '@/utils/register';


type UserField = keyof User;

export default function EditProfileScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { user, token, refreshUser } = useContext(AuthContext);
  const [userData, setUserData] = useState<User | null>(user); 

  if (!user) return null;

  if (user && userData === null) {
    setUserData(user);
  }

  if (userData === null) return null;
  
  const handleChange = (field: UserField, value: string) => {
    setUserData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: value,
      };
    });
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  const handleSave = async () => {
    if (!userData || !token) {
      console.log('Missing userData or token');
      return;
    }    
    
    try {
      console.log('Starting update with:', userData);
      await updateUserProfile(userData, token, refreshUser);

      Toast.show({
        type: 'success',
        text1: '¡Éxito!',
        text2: 'Perfil actualizado correctamente',
      });
      
      setTimeout(() => {
        router.back();
      }, 1500);
      
    } catch (error: any) {
      console.error('Save error:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Ocurrió un error al guardar los cambios',
      });
    }
  };

  const handleDeleteProfile = () => {
    Alert.alert(
      'Eliminar Perfil',
      '¿Estás seguro de que quieres eliminar tu perfil? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Linking.openURL('https://fmru-next-js.vercel.app/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}
      edges={['top', 'right', 'left']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <ProfileHeader
            name={userData.nombre}
            email={userData.email}
            imageUrl={userData.foto || ''}
            showCheckmark
          />
          
          <View
            style={styles.formSection}
          >
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>
              Información
            </Text>
            
            <FormInput
              label="Nombre"
              value={userData.nombre}
              onChangeText={(text) => handleChange('nombre', text)}
              placeholder="Nombre completo"
              isRequired
            />

            <FormInput
              label="Apellido"
              value={userData.apellido1}
              onChangeText={(text) => handleChange('apellido1', text)}
              placeholder="Apellido"
              isRequired
            />
            
            <FormInput
              label="Correo Electrónico"
              value={userData.email}
              onChangeText={(text) => handleChange('email', text)}
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              isRequired
            />

            <FormInput
              label="CURP"
              value={userData.curp}
              onChangeText={(text) => handleChange('curp', text)}
              placeholder="CURP"
              isRequired
            />

            <FormInput
              label="RFC"
              value={userData.rfc}
              onChangeText={(text) => handleChange('rfc', text)}
              placeholder="RFC"
            />


            <SelectInput
              label="Tipo de sangre"
              value={userData.tipoSangre}
              onSelect={(value) => handleChange('tipoSangre', value)}
              options={TIPO_SANGRE_OPTIONS}
              isRequired
            />
          </View>
          
          <View
            style={styles.formSection}
          >
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>
              Dirección
            </Text>
            
            <SelectInput
              label="Estado"
              value={userData.estadoMx}
              onSelect={(value) => handleChange('estadoMx', value)}
              options={estados}
              isRequired
            />
            
            <FormInput
              label="Alcaldía o Municipio"
              value={userData.delegacionMunicipio}
              onChangeText={(text) => handleChange('delegacionMunicipio', text)}
              placeholder="Alcaldía o Municipio"
              isRequired
            />
            
            <FormInput
              label="Ciudad"
              value={userData.ciudad}
              onChangeText={(text) => handleChange('ciudad', text)}
              placeholder="Ciudad"
              isRequired
            />
            
            <FormInput
              label="Colonia"
              value={userData.colonia}
              onChangeText={(text) => handleChange('colonia', text)}
              placeholder="Colonia"
              isRequired
            />
            
            <View style={styles.rowContainer}>
              <FormInput
                label="Número"
                value={userData.cel}
                onChangeText={(text) => handleChange('cel', text)}
                placeholder="Número"
                keyboardType="numeric"
                isRequired
                containerStyle={styles.halfInput}
              />
              
              <FormInput
                label="Código postal"
                value={userData.cp}
                onChangeText={(text) => handleChange('cp', text)}
                placeholder="Código postal"
                keyboardType="numeric"
                isRequired
                containerStyle={styles.halfInput}
              />
            </View>
          </View>
          
          <View
            style={styles.formSection}
          >
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>
              Contacto de Emergencia
            </Text>
            
            <FormInput
              label="Nombre"
              value={userData.ceNombre}
              onChangeText={(text) => handleChange('ceNombre', text)}
              placeholder="Nombre completo"
              isRequired
            />
            
            <FormInput
              label="Celular"
              value={userData.ceCel}
              onChangeText={(text) => handleChange('ceCel', text)}
              placeholder="Número de celular"
              keyboardType="phone-pad"
              isRequired
            />
            
            <FormInput
              label="Teléfono"
              value={userData.ceTel}
              onChangeText={(text) => handleChange('ceTel', text)}
              placeholder="Número de teléfono"
              keyboardType="phone-pad"
            />
            
            <SelectInput
              label="Parentesco"
              value={userData.ceParentesco}
              onSelect={(value) => handleChange('ceParentesco', value)}
              options={parentescoOptions}
              isRequired
            />
          </View>

          <View
            style={styles.deleteSection}
          >
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>
              Zona de Peligro
            </Text>
            
            <Button
              title="Quiero eliminar mi perfil"
              onPress={handleDeleteProfile}
              variant="secondary"
              style={styles.deleteButton}
            />
          </View>

          
          <View
            style={styles.buttonContainer}
          >
            <Button
              title="Cancelar"
              onPress={handleCancel}
              variant="secondary"
              style={styles.cancelButton}
            />
            
            <Button
              title="Guardar"
              onPress={handleSave}
              style={styles.saveButton}
            />
          </View>
        </ScrollView>
        <Toast />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  contentContainer: {
    padding: Layout.spacing.l,
    paddingBottom: Layout.spacing.xxl,
  },
  formSection: {
    marginBottom: Layout.spacing.l,
  },
  deleteSection: {
    marginBottom: Layout.spacing.l,
    paddingTop: Layout.spacing.m,
    borderTopWidth: 1,
    borderTopColor: '#ff444440',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: Layout.spacing.m,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Layout.spacing.l,
  },
  deleteButton: {
    marginBottom: Layout.spacing.m,
    backgroundColor: '#ff4444',
    borderColor: '#ff4444',
  },
  cancelButton: {
    flex: 1,
    marginRight: Layout.spacing.s,
  },
  saveButton: {
    flex: 1,
    marginLeft: Layout.spacing.s,
  },
});