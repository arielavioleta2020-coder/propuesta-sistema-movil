import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import SMLogo from '../components/SMLogo';
import HomeScreen from './HomeScreen';
import MovimientosScreen from './MovimientosScreen';
import NuevoProductoScreen from './NuevoProductoScreen';
import AlertasScreen from './AlertasScreen';
import { COLORES } from '../config';

const TABS = [
  { clave: 'inventario', etiqueta: 'Inventario' },
  { clave: 'movimientos', etiqueta: 'Movimientos' },
  { clave: 'alertas', etiqueta: 'Alertas' },
  { clave: 'producto', etiqueta: 'Nuevo' },
];

export default function PanelPrincipal({ usuario, alSalir }) {
  const [tab, setTab] = useState('inventario');
  const [productoEditando, setProductoEditando] = useState(null);

  function abrirEdicion(producto) {
    setProductoEditando(producto);
    setTab('producto');
  }

  function abrirNuevo() {
    setProductoEditando(null);
    setTab('producto');
  }

  function renderPantalla() {
    switch (tab) {
      case 'movimientos':
        return <MovimientosScreen usuario={usuario} />;
      case 'alertas':
        return <AlertasScreen />;
      case 'producto':
        return (
          <NuevoProductoScreen
            usuario={usuario}
            producto={productoEditando}
            alGuardar={() => {
              setProductoEditando(null);
              setTab('inventario');
            }}
          />
        );
      default:
        return <HomeScreen usuario={usuario} alEditar={abrirEdicion} />;
    }
  }

  return (
    <SafeAreaView style={styles.flex}>
      {/* 1. Cabecera e identidad visual */}
      <View style={styles.cabecera}>
        <SMLogo size={48} />
        <View style={styles.cabeceraTexto}>
          <Text style={styles.titulo}>StockMobile</Text>
          <Text style={styles.rol}>
            {usuario?.rol} · {usuario?.nombre}
          </Text>
        </View>
        <TouchableOpacity onPress={alSalir} style={styles.botonSalir}>
          <Text style={styles.botonSalirTexto}>Salir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contenido}>{renderPantalla()}</View>

      {/* Barra de navegación inferior */}
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.clave}
            style={styles.tab}
            onPress={() => (t.clave === 'producto' ? abrirNuevo() : setTab(t.clave))}
          >
            <View
              style={[styles.tabIndicador, tab === t.clave && styles.tabIndicadorActivo]}
            />
            <Text style={[styles.tabTexto, tab === t.clave && styles.tabTextoActivo]}>
              {t.etiqueta}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORES.fondo },
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORES.azul,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cabeceraTexto: { flex: 1, marginLeft: 12 },
  titulo: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  rol: { color: '#C7DBF6', fontSize: 11.5, marginTop: 3 },
  botonSalir: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  botonSalirTexto: { color: '#FFFFFF', fontSize: 12.5, fontWeight: '700' },
  contenido: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORES.borde,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  tabIndicador: {
    height: 3,
    width: 26,
    borderRadius: 2,
    backgroundColor: 'transparent',
    marginBottom: 6,
  },
  tabIndicadorActivo: { backgroundColor: COLORES.azul },
  tabTexto: { fontSize: 12, fontWeight: '700', color: COLORES.gris },
  tabTextoActivo: { color: COLORES.azul },
});
