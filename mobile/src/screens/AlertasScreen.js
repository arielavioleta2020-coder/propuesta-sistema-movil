import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { obtenerProductos } from '../api';
import { COLORES } from '../config';

export default function AlertasScreen() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const datos = await obtenerProductos();
      setProductos(datos.filter((p) => p.stock_actual <= p.stock_minimo));
    } catch {
      // sin conexión
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <View style={styles.flex}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Alertas de Stock</Text>
        <Text style={styles.subtitulo}>
          Productos con existencias en o por debajo del stock mínimo
        </Text>
        {!cargando ? (
          <View style={styles.contador}>
            <Text style={styles.contadorTexto}>
              {productos.length} producto(s) requieren reposición
            </Text>
          </View>
        ) : null}
      </View>

      {cargando ? (
        <ActivityIndicator color={COLORES.azul} style={styles.carga} />
      ) : (
        <FlatList
          data={productos}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={() => {
                setRefrescando(true);
                cargar();
              }}
              colors={[COLORES.azul]}
            />
          }
          ListEmptyComponent={
            <View style={styles.vacio}>
              <Text style={styles.vacioTitulo}>✓ Todo en orden</Text>
              <Text style={styles.vacioTexto}>
                Ningún producto está por debajo del stock mínimo.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemNombre}>{item.nombre}</Text>
                <Text style={styles.itemSub}>
                  {item.categoria} · {item.codigo_barras}
                </Text>
                <Text style={styles.itemProv}>{item.proveedor}</Text>
              </View>
              <View style={styles.itemDerecha}>
                <Text style={styles.itemStock}>{item.stock_actual} uds</Text>
                <Text style={styles.itemMinimo}>mín: {item.stock_minimo}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  encabezado: { paddingHorizontal: 16, paddingTop: 16 },
  titulo: { fontSize: 20, fontWeight: '900', color: COLORES.texto },
  subtitulo: { fontSize: 12.5, color: COLORES.gris, marginTop: 4 },
  contador: {
    backgroundColor: COLORES.rojoFondo,
    borderColor: COLORES.rojo,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  contadorTexto: { color: COLORES.rojo, fontWeight: '800', fontSize: 13.5 },
  carga: { marginTop: 30 },
  lista: { padding: 16 },
  item: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: COLORES.rojo,
  },
  itemInfo: { flex: 1, paddingRight: 10 },
  itemNombre: { fontSize: 14.5, fontWeight: '800', color: COLORES.texto },
  itemSub: { fontSize: 12, color: COLORES.gris, marginTop: 3 },
  itemProv: { fontSize: 11.5, color: COLORES.azul, marginTop: 4, fontWeight: '600' },
  itemDerecha: { alignItems: 'flex-end', justifyContent: 'center' },
  itemStock: { fontSize: 16, fontWeight: '900', color: COLORES.rojo },
  itemMinimo: { fontSize: 11.5, color: COLORES.gris, marginTop: 4 },
  vacio: { alignItems: 'center', padding: 40 },
  vacioTitulo: { color: COLORES.verde, fontSize: 16, fontWeight: '800' },
  vacioTexto: { color: COLORES.gris, fontSize: 13, marginTop: 8, textAlign: 'center' },
});