import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/LoginScreen';
import PanelPrincipal from './src/screens/PanelPrincipal';
import { setToken } from './src/api';
import { COLORES } from './src/config';

const TOKEN_KEY = '@stockmobile/token';
const USUARIO_KEY = '@stockmobile/usuario';

export default function App() {
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        const datosUsuario = await AsyncStorage.getItem(USUARIO_KEY);
        if (token && datosUsuario) {
          setToken(token);
          setUsuario(JSON.parse(datosUsuario));
        }
      } catch {
        // Sin sesión guardada
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  async function alIngresar(respuesta) {
    setToken(respuesta.token);
    setUsuario(respuesta.usuario);
    await AsyncStorage.setItem(TOKEN_KEY, respuesta.token);
    await AsyncStorage.setItem(USUARIO_KEY, JSON.stringify(respuesta.usuario));
  }

  async function alSalir() {
    setToken(null);
    setUsuario(null);
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USUARIO_KEY);
  }

  if (cargando) {
    return (
      <View style={styles.carga}>
        <ActivityIndicator size="large" color={COLORES.azul} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      {usuario ? (
        <PanelPrincipal usuario={usuario} alSalir={alSalir} />
      ) : (
        <LoginScreen alIngresar={alIngresar} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  carga: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORES.fondo,
  },
});