import { User } from "@/types/user";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL

// api/user/update.ts - Enhanced version
export const updateUserProfile = async (userData: Partial<User>, token: string, refreshUser: () => Promise<void>) => {
    try {
        const updateData = {
            nombre: userData.nombre,
            apellido1: userData.apellido1,
            email: userData.email,
            estadoMx: userData.estadoMx,
            delegacionMunicipio: userData.delegacionMunicipio,
            ciudad: userData.ciudad,
            colonia: userData.colonia,
            cel: userData.cel,
            cp: userData.cp,
            ceNombre: userData.ceNombre,
            ceCel: userData.ceCel, 
            ceTel: userData.ceTel,
            ceParentesco: userData.ceParentesco,
            rfc: userData.rfc,
            curp: userData.curp,
            tipoSangre: userData.tipoSangre
        };
  
        console.log('Update payload:', updateData);
        console.log('Token exists:', !!token);
  
        const response = await fetch(`${API_BASE_URL}/api/user/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });
  
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);
  
        if (!response.ok) {
            throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
        }
  
        await refreshUser();
        return data;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
  };