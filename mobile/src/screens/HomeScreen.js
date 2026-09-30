import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import ScannerScreen from './ScannerScreen';
import { obtenerProductos, escanearProducto, eliminarProducto } from '../api';
import { COLORES } from '../config';

export default function HomeScreen({ usuario, alEditar }) {
  const esAdmin = usuario?.rol_id === 1;
  const [codigo, setCodigo] = useState('');
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [productos, setProductos] = useState([]);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [escannerAbierto, setEscannerAbierto] = useState(false);

  const cargarCatalogo = useCallback(async () => {
    try {
      const datos = await obtenerProductos();
      setProductos(datos);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setCargandoCatalogo(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    cargarCatalogo();
  }, [cargarCatalogo]);

  async function buscar(cod) {
    const valor = (cod ?? codigo).trim();
    if (!valor) {
      Alert.alert('Aviso', 'Ingrese o escanee un código de barras');
      return;
    }
    setCargandoBusqueda(true);
    setResultado(null);
    try {
      const producto = await escanearProducto(valor);
      setResultado({ ok: true, producto });
    } catch (e) {
      setResultado({
        ok: false,
        mensaje: e.status === 404
          ? `El código ${valor} no está registrado en la base de datos.`
          : e.message,
      });
    } finally {
      setCargandoBusqueda(false);
    }
  }

  function manejarEscaneado(data) {
    setEscannerAbierto(false);
    setCodigo(data);
    setTimeout(() => buscar(data), 350);
  }

  function accionPrincipal() {
    if (codigo.trim()) {
      buscar();
    } else {
      setEscannerAbierto(true);
    }
  }

  function limpiarResultado() {
    setResultado(null);
    setCodigo('');
  }

  function confirmarEliminacion(producto) {
    Alert.alert(
      'Eliminar producto',
      `¿Desea eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarProducto(producto.id);
              if (resultado?.producto?.id === producto.id) limpiarResultado();
              setCargandoCatalogo(true);
              await cargarCatalogo();
            } catch (e) {
              Alert.alert('No se pudo eliminar', e.message);
            }
          },
        },
      ]
    );
  }

  return (
    <>
      <FlatList
        data={productos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <View>
            {/* 2. Módulo de búsqueda y escáner */}
            <View style={styles.tarjeta}>
              <Text style={styles.etiqueta}>
                Código de barras (ingreso manual o escáner)
              </Text>
              <TextInput
                style={styles.input}
                value={codigo}
                onChangeText={setCodigo}
                placeholder="Ej. 779123456789"
                placeholderTextColor="#9AA5B1"
                keyboardType="number-pad"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[styles.botonBuscar, cargandoBusqueda && styles.botonInactivo]}
                onPress={accionPrincipal}
                disabled={cargandoBusqueda}
              >
                {cargandoBusqueda ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.botonBuscarTexto}>Escanear / Buscar</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* 3. Visor de alertas y resultados */}
            {resultado ? (
              <View
                style={[
                  styles.alerta,
                  resultado.ok ? styles.alertaVerde : styles.alertaRoja,
                ]}
              >
                {resultado.ok ? (
                  <>
                    <Text style={[styles.alertaTitulo, styles.textoVerde]}>
                      ✓ Producto encontrado
                    </Text>
                    <Text style={styles.alertaNombre}>
                      {resultado.producto.nombre}
                    </Text>
                    <Text style={styles.alertaDetalle}>
                      Código: {resultado.producto.codigo_barras}
                    </Text>
                    <Text style={styles.alertaDetalle}>
                      Categoría: {resultado.producto.categoria} · Proveedor:{' '}
                      {resultado.producto.proveedor}
                    </Text>
                    <Text style={styles.alertaDetalle}>
                      Precio: ${resultado.producto.precio_venta}
                    </Text>
                    <Text
                      style={[
                        styles.alertaStock,
                        resultado.producto.stock_actual <=
                          resultado.producto.stock_minimo
                          ? styles.textoRojo
                          : styles.textoVerde,
                      ]}
                    >
                      Stock actual: {resultado.producto.stock_actual} unidades
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={[styles.alertaTitulo, styles.textoRojo]}>
                      ✕ Producto no encontrado
                    </Text>
                    <Text style={styles.alertaNombre}>{resultado.mensaje}</Text>
                  </>
                )}
                <TouchableOpacity onPress={limpiarResultado}>
                  <Text style={styles.limpiar}>Limpiar resultado</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* 4. Catálogo activo de inventario */}
            <Text style={styles.catalogoTitulo}>Lista de Inventario</Text>
            {cargandoCatalogo ? (
              <ActivityIndicator color={COLORES.azul} style={styles.carga} />
            ) : null}
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={() => {
              setRefrescando(true);
              cargarCatalogo();
            }}
            colors={[COLORES.azul]}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemNombre}>{item.nombre}</Text>
              <Text style={styles.itemSub}>
                {item.categoria} · {item.codigo_barras}
              </Text>
              <TouchableOpacity onPress={() => buscar(item.codigo_barras)}>
                <Text style={styles.consultar}>Consultar producto</Text>
              </TouchableOpacity>
              {esAdmin ? (
                <View style={styles.acciones}>
                  <TouchableOpacity onPress={() => alEditar(item)}>
                    <Text style={styles.editar}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmarEliminacion(item)}>
                    <Text style={styles.eliminar}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
            <View style={styles.itemDerecha}>
              <Text style={styles.itemPrecio}>${item.precio_venta}</Text>
              <View
                style={[
                  styles.stockBadge,
                  item.stock_actual <= item.stock_minimo
                    ? styles.stockBajo
                    : styles.stockOk,
                ]}
              >
                <Text
                  style={[
                    styles.stockTexto,
                    item.stock_actual <= item.stock_minimo
                      ? styles.textoRojo
                      : styles.textoVerde,
                  ]}
                >
                  {item.stock_actual} uds
                </Text>
              </View>
              {item.stock_actual <= item.stock_minimo ? (
                <Text style={styles.alertaMinimo}>
                  Stock mínimo: {item.stock_minimo}
                </Text>
              ) : null}
            </View>
          </View>
        )}
      />

      <ScannerScreen
        visible={escannerAbierto}
        alEscaneado={manejarEscaneado}
        alCerrar={() => setEscannerAbierto(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  lista: { padding: 16, paddingBottom: 30 },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  etiqueta: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.texto,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORES.borde,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORES.texto,
  },
  botonBuscar: {
    backgroundColor: COLORES.azul,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  botonInactivo: { opacity: 0.7 },
  botonBuscarTexto: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  alerta: { borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1.5 },
  alertaVerde: { backgroundColor: COLORES.verdeFondo, borderColor: COLORES.verde },
  alertaRoja: { backgroundColor: COLORES.rojoFondo, borderColor: COLORES.rojo },
  alertaTitulo: { fontSize: 15, fontWeight: '800', marginBottom: 6 },
  textoVerde: { color: COLORES.verde },
  textoRojo: { color: COLORES.rojo },
  alertaNombre: { fontSize: 13, color: COLORES.texto, marginBottom: 6 },
  alertaDetalle: { fontSize: 12.5, color: COLORES.texto, marginBottom: 2 },
  alertaStock: { fontSize: 15, fontWeight: '800', marginTop: 6 },
  limpiar: {
    color: COLORES.azul,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  catalogoTitulo: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORES.texto,
    marginTop: 6,
    marginBottom: 10,
  },
  carga: { marginVertical: 16 },
  item: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: COLORES.azul,
  },
  itemInfo: { flex: 1, paddingRight: 10 },
  itemNombre: { fontSize: 14.5, fontWeight: '800', color: COLORES.texto },
  itemSub: { fontSize: 12, color: COLORES.gris, marginTop: 3, marginBottom: 6 },
  consultar: { fontSize: 12, color: COLORES.azul, fontWeight: '700' },
  acciones: { flexDirection: 'row', marginTop: 9 },
  editar: { fontSize: 12, color: COLORES.azul, fontWeight: '800', marginRight: 16 },
  eliminar: { fontSize: 12, color: COLORES.rojo, fontWeight: '800' },
  itemDerecha: { alignItems: 'flex-end' },
  itemPrecio: { fontSize: 17, fontWeight: '900', color: COLORES.azul },
  stockBadge: {
    marginTop: 6,
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 9,
  },
  stockOk: { backgroundColor: COLORES.verdeFondo },
  stockBajo: { backgroundColor: COLORES.rojoFondo },
  stockTexto: { fontSize: 12.5, fontWeight: '800' },
  alertaMinimo: {
    fontSize: 10.5,
    color: COLORES.gris,
    marginTop: 4,
    textAlign: 'right',
  },
});
