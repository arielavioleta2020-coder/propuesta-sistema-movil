import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { COLORES } from '../config';

export default function ScannerScreen({ visible, alEscaneado, alCerrar }) {
  const [permiso, pedirPermiso] = useCameraPermissions();
  const procesado = useRef(false);
  const [reenviar, setReenviar] = useState(0);

  useEffect(() => {
    if (visible) {
      procesado.current = false;
    }
  }, [visible, reenviar]);

  const manejarEscaneo = useCallback(
    ({ data }) => {
      if (procesado.current) return;
      procesado.current = true;
      alEscaneado(data);
    },
    [alEscaneado]
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={alCerrar}>
      <View style={styles.flex}>
        {!permiso ? (
          <View style={styles.mensaje}>
            <Text style={styles.mensajeTexto}>Cargando cámara…</Text>
          </View>
        ) : !permiso.granted ? (
          <View style={styles.mensaje}>
            <Text style={styles.mensajeTexto}>
              Necesitamos acceso a la cámara para escanear códigos de barras.
            </Text>
            <TouchableOpacity
              style={[styles.boton, styles.botonAzul]}
              onPress={pedirPermiso}
            >
              <Text style={styles.botonTexto}>Permitir acceso</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'itf14', 'qr'],
            }}
            onBarcodeScanned={manejarEscaneo}
          />
        )}

        <View style={styles.overlay}>
          <View style={styles.guia}>
            <Text style={styles.guiaTitulo}>Escanear código de barras</Text>
            <Text style={styles.guiaSub}>
              Apunte la cámara hacia el código del producto
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.boton, styles.botonCerrar]}
            onPress={() => {
              procesado.current = false;
              alCerrar();
            }}
          >
            <Text style={styles.botonTexto}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORES.texto },
  mensaje: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  mensajeTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 18,
  },
  guia: {
    backgroundColor: 'rgba(13, 71, 161, 0.92)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  guiaTitulo: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  guiaSub: { color: '#DCE7F8', fontSize: 12, marginTop: 4 },
  overlay: {
    position: 'absolute',
    top: 54,
    bottom: 40,
    left: 0,
    right: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boton: {
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 34,
    alignItems: 'center',
  },
  botonAzul: { backgroundColor: COLORES.azul },
  botonCerrar: { backgroundColor: 'rgba(0,0,0,0.55)' },
  botonTexto: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});