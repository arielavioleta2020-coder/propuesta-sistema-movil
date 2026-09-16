import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  escanearProducto,
  obtenerBodegas,
  registrarMovimiento,
} from '../api';
import { COLORES } from '../config';

export default function MovimientosScreen({ usuario }) {
  const [tipo, setTipo] = useState('ENTRADA');
  const [codigo, setCodigo] = useState('');
  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState('');
  const [bodegas, setBodegas] = useState([]);
  const [bodegaId, setBodegaId] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const lista = await obtenerBodegas();
        setBodegas(lista);
        if (lista[0]) setBodegaId(lista[0].id);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  async function resolverProducto() {
    const valor = codigo.trim();
    if (!valor) {
      Alert.alert('Aviso', 'Ingrese un código de barras');
      return;
    }
    setBuscando(true);
    setError('');
    setExito(null);
    setProducto(null);
    try {
      const p = await escanearProducto(valor);
      setProducto(p);
    } catch (e) {
      setError(e.status === 404 ? `El código ${valor} no existe en el inventario.` : e.message);
    } finally {
      setBuscando(false);
    }
  }

  async function guardar() {
    const n = parseInt(cantidad, 10);
    if (!producto) {
      setError('Primero busque un producto por su código de barras');
      return;
    }
    if (!n || n <= 0) {
      setError('Ingrese una cantidad mayor a cero');
      return;
    }
    if (!bodegaId) {
      setError('Seleccione una bodega');
      return;
    }
    setEnviando(true);
    setError('');
    try {
      await registrarMovimiento({
        tipo,
        bodega_id: bodegaId,
        usuario_id: usuario.id,
        items: [
          {
            producto_id: producto.id,
            cantidad: n,
            costo_unitario: Number(producto.costo_compra),
          },
        ],
      });
      const nuevoStock = tipo === 'ENTRADA'
        ? producto.stock_actual + n
        : producto.stock_actual - n;
      setExito({
        tipo,
        nombre: producto.nombre,
        cantidad: n,
        nuevoStock,
      });
      setProducto(null);
      setCodigo('');
      setCantidad('');
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Text style={styles.titulo}>Registrar Movimiento</Text>
      <Text style={styles.subtitulo}>
        Entradas y salidas de stock · actualiza el inventario al instante
      </Text>

      <View style={styles.tarjeta}>
        <Text style={styles.etiqueta}>Tipo de movimiento</Text>
        <View style={styles.filaTipos}>
          {['ENTRADA', 'SALIDA'].map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.tipo,
                tipo === t && (t === 'ENTRADA' ? styles.tipoVerde : styles.tipoRojo),
              ]}
              onPress={() => {
                setTipo(t);
                setExito(null);
                setError('');
              }}
            >
              <Text
                style={[styles.tipoTexto, tipo === t && styles.tipoTextoActivo]}
              >
                {t === 'ENTRADA' ? '+ Entrada' : '− Salida'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.etiqueta}>Código de barras del producto</Text>
        <View style={styles.filaBuscar}>
          <TextInput
            style={[styles.input, styles.inputFlex]}
            value={codigo}
            onChangeText={setCodigo}
            placeholder="Ej. 7791000010001"
            placeholderTextColor="#9AA5B1"
            keyboardType="number-pad"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.botonSecundario} onPress={resolverProducto}>
            {buscando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.botonSecundarioTexto}>Buscar</Text>
            )}
          </TouchableOpacity>
        </View>

        {producto ? (
          <View style={styles.productoBox}>
            <Text style={styles.productoNombre}>{producto.nombre}</Text>
            <Text style={styles.productoDetalle}>
              Stock actual: {producto.stock_actual} unidades · Precio: $
              {producto.precio_venta}
            </Text>
          </View>
        ) : null}

        <Text style={styles.etiqueta}>Cantidad</Text>
        <TextInput
          style={styles.input}
          value={cantidad}
          onChangeText={setCantidad}
          placeholder="0"
          placeholderTextColor="#9AA5B1"
          keyboardType="number-pad"
        />

        <Text style={styles.etiqueta}>Bodega</Text>
        <View style={styles.filaTipos}>
          {bodegas.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={[styles.chip, bodegaId === b.id && styles.chipActivo]}
              onPress={() => setBodegaId(b.id)}
            >
              <Text
                style={[styles.chipTexto, bodegaId === b.id && styles.chipTextoActivo]}
              >
                {b.nombre_bodega}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.boton, enviando && styles.botonInactivo]}
          onPress={guardar}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.botonTexto}>
              {tipo === 'ENTRADA' ? 'Registrar Entrada' : 'Registrar Salida'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {exito ? (
        <View style={styles.exito}>
          <Text style={styles.exitoTitulo}>✓ Movimiento registrado</Text>
          <Text style={styles.exitoTexto}>
            {exito.tipo === 'ENTRADA' ? 'Ingresaron' : 'Salieron'} {exito.cantidad}{' '}
            unidad(es) de {exito.nombre}.
          </Text>
          <Text style={styles.exitoStock}>
            Nuevo stock: {exito.nuevoStock} unidades
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { padding: 16, paddingBottom: 30 },
  titulo: { fontSize: 20, fontWeight: '900', color: COLORES.texto },
  subtitulo: { fontSize: 12.5, color: COLORES.gris, marginTop: 4, marginBottom: 14 },
  tarjeta: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16 },
  etiqueta: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORES.texto,
    marginTop: 14,
    marginBottom: 8,
  },
  filaTipos: { flexDirection: 'row', flexWrap: 'wrap' },
  tipo: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORES.borde,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  tipoVerde: { backgroundColor: COLORES.verde, borderColor: COLORES.verde },
  tipoRojo: { backgroundColor: COLORES.rojo, borderColor: COLORES.rojo },
  tipoTexto: { color: COLORES.texto, fontWeight: '800', fontSize: 14 },
  tipoTextoActivo: { color: '#FFFFFF' },
  filaBuscar: { flexDirection: 'row' },
  inputFlex: { flex: 1, marginRight: 8 },
  input: {
    borderWidth: 1.5,
    borderColor: COLORES.borde,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORES.texto,
  },
  botonSecundario: {
    backgroundColor: COLORES.azulClaro,
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  botonSecundarioTexto: { color: '#FFFFFF', fontWeight: '800' },
  productoBox: {
    backgroundColor: '#EAF1FB',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  productoNombre: { fontSize: 14, fontWeight: '800', color: COLORES.azul },
  productoDetalle: { fontSize: 12.5, color: COLORES.texto, marginTop: 4 },
  chip: {
    borderWidth: 1.5,
    borderColor: COLORES.borde,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActivo: { backgroundColor: COLORES.azul, borderColor: COLORES.azul },
  chipTexto: { color: COLORES.texto, fontSize: 12.5, fontWeight: '700' },
  chipTextoActivo: { color: '#FFFFFF' },
  error: { color: COLORES.rojo, fontSize: 13, marginTop: 14, textAlign: 'center' },
  boton: {
    backgroundColor: COLORES.azul,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
  },
  botonInactivo: { opacity: 0.7 },
  botonTexto: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  exito: {
    backgroundColor: COLORES.verdeFondo,
    borderColor: COLORES.verde,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
  },
  exitoTitulo: { color: COLORES.verde, fontSize: 15, fontWeight: '800' },
  exitoTexto: { color: COLORES.texto, fontSize: 13, marginTop: 6 },
  exitoStock: { color: COLORES.verde, fontSize: 15, fontWeight: '800', marginTop: 6 },
});