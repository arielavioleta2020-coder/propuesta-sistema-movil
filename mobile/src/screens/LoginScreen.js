import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import SMLogo from '../components/SMLogo';
import { login, setToken } from '../api';
import { COLORES } from '../config';

export default function LoginScreen({ alIngresar }) {
  const [email, setEmail] = useState('admin@stockmobile.ec');
  const [password, setPassword] = useState('Admin123!');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  async function manejarIngreso() {
    if (!email.trim() || !password) {
      setError('Ingrese su correo y contraseña');
      return;
    }
    setError('');
    setCargando(true);
    try {
      const respuesta = await login(email.trim(), password);
      setToken(respuesta.token);
      alIngresar(respuesta);
    } catch (e) {
      setError(e.message === 'Error en la solicitud al servidor'
        ? 'No se pudo conectar con el servidor. Verifique que el Back-End esté activo.'
        : e.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.contenedor}>
        <View style={styles.logo}>
          <SMLogo size={88} />
          <Text style={styles.titulo}>StockMobile</Text>
          <Text style={styles.eslogan}>Gestión de Inventarios Pymes</Text>
        </View>

        <View style={styles.tarjeta}>
          <Text style={styles.etiqueta}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="admin@stockmobile.ec"
            placeholderTextColor="#9AA5B1"
          />

          <Text style={styles.etiqueta}>Contraseña</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#9AA5B1"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.boton, cargando && styles.botonInactivo]}
            onPress={manejarIngreso}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.botonTexto}>Ingresar</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.ayuda}>
          Cuenta de demostración:{'\n'}
          admin@stockmobile.ec / Admin123!{'\n'}
          cbodega@stockmobile.ec / Bodega123!
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORES.azul },
  contenedor: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: COLORES.fondo,
  },
  logo: { alignItems: 'center', marginBottom: 28 },
  titulo: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORES.azul,
    marginTop: 14,
  },
  eslogan: {
    fontSize: 14,
    color: COLORES.gris,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  etiqueta: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.texto,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORES.borde,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
    color: COLORES.texto,
  },
  error: {
    color: COLORES.rojo,
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
  boton: {
    backgroundColor: COLORES.azul,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 18,
  },
  botonInactivo: { opacity: 0.7 },
  botonTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  ayuda: {
    textAlign: 'center',
    color: COLORES.gris,
    fontSize: 12,
    marginTop: 22,
    lineHeight: 19,
  },
});