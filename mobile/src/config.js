import Constants from 'expo-constants';

const host =
  Constants.expoConfig?.hostUri?.split(':')[0] ??
  '192.168.1.4';

export const API_URL = `http://${host}:3000/api`;

export const COLORES = {
  azul: '#0D47A1',
  azulClaro: '#1565C0',
  fondo: '#F0F4FA',
  verde: '#2E7D32',
  verdeFondo: '#E8F5E9',
  rojo: '#B71C1C',
  rojoFondo: '#FFEBEE',
  texto: '#1A1A2E',
  gris: '#6B7280',
  borde: '#DDE4EE',
  dorado: '#FFC107',
};