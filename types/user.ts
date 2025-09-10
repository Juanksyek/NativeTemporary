export interface Address {
  state: string;
  municipality: string;
  city: string;
  neighborhood: string;
  number: string;
  postalCode: string;
}

export interface EmergencyContact {
  name: string;
  mobile: string;
  phone: string;
  relationship: string;
}

export interface User {
  id?: number;
  nivel?: number | null;
  usuario?: string | null;
  foto?: string | null;
  token?: string | null;
  tipoRegistro_1?: number;
  tipoRegistro_2?: number;
  tipoRegistro_3?: number;
  tipoRegistro_4?: number;
  tipoRegistro_5?: number;
  tipoRegistro_6?: number;
  clubId?: number | null;
  nombre: string;
  apellido1: string;
  apellido2: string;
  fechaNacimiento: Date;
  edad?: number | null;
  sexo: string;
  tel: string;
  cel: string;
  email: string;
  nacionalidad: string;
  curp: string;
  escolaridad: string;
  tipoSangre: string;
  alergiasEnfermedadesDesc: string;
  estadoMx: string;
  ciudad: string;
  delegacionMunicipio: string;
  colonia: string;
  cp: string;
  calle: string;
  ceNombre: string;
  ceApellido1: string;
  ceApellido2: string;
  ceTel: string;
  ceCel: string;
  ceParentesco: string;
  cartaLiberacion: string;
  terminos: string;
  privacidad: string;
  extranjero: string;
  pasaporte?: string | null;
  fechaIngreso?: Date | null;
  fechaActualizacion?: Date | null;
  estado?: number | null;
  reinicia?: number | null;
  intentos?: number | null;
  invitacion?: number | null;
  afiliacionPaga?: number | null;
  afiliacionAprobada?: number | null;
  montoPago?: number | null;
  fechaPago?: Date | null;
  tipoPago?: string | null;
  contrasenia: string;
  repetir_contrasenia?: string;
  verificado?: boolean;
  token_verificacion?: string;
  fecha_expiracion_token?: Date;
  resetToken?: string;
  resetTokenExpiration?: Date;
  club?: string;
  equipoUniversitario?: string;
  equipoEstatal?: string;
  rol?: 'usuario' | 'capitan' | 'admin' | 'arbitro';
  createdAt?: Date;
  updatedAt?: Date;
  rfc?: string;
}

export interface Player {
  id: string;
  name: string;
  clubId: string;
  club: string;
  foto?: string;
}

export interface ClubMemberFormatted {
  _id: string;
  apellido1: string;
  apellido2: string;
  club: string;
  clubId: number;
  foto: string;
  id: number;
  nombre: string;
};
