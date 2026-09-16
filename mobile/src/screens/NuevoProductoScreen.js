import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { obtenerCategorias, obtenerProveedores, crearProducto } from '../api';
import { COLORES } from '../config';

const INICIAL = {
  codigo_barras: '',
  nombre: '',
  costo_compra: '',
  precio_venta: '',
  stock_actual: '0',
  stock_minimo: '5',
};

export default function NuevoProductoScreen({ usuario }) {
  const esAdmin = usuario?.rol_id === 1;
  const [datos, setDatos] = useState(INICIAL);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [categoriaId, setCategoriaId] = useState(null);
  const [proveedorId, setProveedorId] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  useEffect(() => {
    if (!esAdmin) return;
    (async () => {
      try {
        const [cats, provs] = await Promise.all([
          obtenerCategorias(),
          obtenerProveedores(),
        ]);
        setCategorias(cats);
        setProveedores(provs);
        if (cats[0]) setCategoriaId(cats[0].id);
        if (provs[0]) setProveedorId(provs[0].id);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [esAdmin]);

  function campo(clave, valor) {
    setDatos((prev) => ({ ...prev, [clave]: valor }));
  }

  async function guardar() {
    if (!datos.codigo_barras.trim() || !datos.nombre.trim()) {
      setError('El código de barras y el nombre son obligatorios');
      return;
    }
    if (!datos.costo_compra || !datos.precio_venta) {
      setError('Ingrese el costo de compra y el precio de venta');
      return;
    }
    if (!categoriaId || !proveedorId) {
      setError('Seleccione categoría y proveedor');
      return;
    }
    setEnviando(true);
    setError('');
    setExito('');
    try {
      await crearProducto({
        codigo_barras: datos.codigo_barras.trim(),
        nombre: datos.nombre.trim(),
        costo_compra: Number(datos.costo_compra),
        precio_venta: Number(datos.precio_venta),
        stock_actual: parseInt(datos.stock_actual, 10) || 0,
        stock_minimo: parseInt(datos.stock_minimo, 10) || 0,
        categoria_id: categoriaId,
        proveedor_id: proveedorId,
      });
      setExito(`Producto "${datos.nombre.trim()}" registrado correctamente.`);
      setDatos(INICIAL);
    } catch (e) {
      setError(
        e.status === 409
          ? 'Ese código de barras ya está registrado'
          : e.message
      );
    } finally {
      setEnviando(false);
    }
  }

  if (!esAdmin) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.restriccion}>
          Solo el usuario con rol de Administrador puede registrar productos.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Text style={styles.titulo}>Nuevo Producto</Text>
      <Text style={styles.subtitulo}>Registro de producto en el catálogo</Text>

      <View style={styles.tarjeta}>
        <Text style={styles.etiqueta}>Código de barras *</Text>
        <TextInput
          style={styles.input}
          value={datos.codigo_barras}
          onChangeText={(v) => campo('codigo_barras', v)}
          placeholder="Ej. 7791000110011"
          placeholderTextColor="#9AA5B1"
          keyboardType="number-pad"
        />

        <Text style={styles.etiqueta}>Nombre del producto *</Text>
        <TextInput
          style={styles.input}
          value={datos.nombre}
          onChangeText={(v) => campo('nombre', v)}
          placeholder="Ej. Laptop Lenovo IdeaPad"
          placeholderTextColor="#9AA5B1"
        />

        <View style={styles.fila}>
          <View style={styles.columna}>
            <Text style={styles.etiqueta}>Costo ($) *</Text>
            <TextInput
              style={styles.input}
              value={datos.costo_compra}
              onChangeText={(v) => campo('costo_compra', v)}
              placeholder="0.00"
              placeholderTextColor="#9AA5B1"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.columna}>
            <Text style={styles.etiqueta}>Precio ($) *</Text>
            <TextInput
              style={styles.input}
              value={datos.precio_venta}
              onChangeText={(v) => campo('precio_venta', v)}
              placeholder="0.00"
              placeholderTextColor="#9AA5B1"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.fila}>
          <View style={styles.columna}>
            <Text style={styles.etiqueta}>Stock inicial</Text>
            <TextInput
              style={styles.input}
              value={datos.stock_actual}
              onChangeText={(v) => campo('stock_actual', v)}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.columna}>
            <Text style={styles.etiqueta}>Stock mínimo</Text>
            <TextInput
              style={styles.input}
              value={datos.stock_minimo}
              onChangeText={(v) => campo('stock_minimo', v)}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <Text style={styles.etiqueta}>Categoría</Text>
        <View style={styles.chips}>
          {categorias.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.chip, categoriaId === c.id && styles.chipActivo]}
              onPress={() => setCategoriaId(c.id)}
            >
              <Text style={[styles.chipTexto, categoriaId === c.id && styles.chipTextoActivo]}>
                {c.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.etiqueta}>Proveedor</Text>
        <View style={styles.chips}>
          {proveedores.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.chip, proveedorId === p.id && styles.chipActivo]}
              onPress={() => setProveedorId(p.id)}
            >
              <Text style={[styles.chipTexto, proveedorId === p.id && styles.chipTextoActivo]}>
                {p.razon_social}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {exito ? <Text style={styles.exito}>{exito}</Text> : null}

        <TouchableOpacity
          style={[styles.boton, enviando && styles.botonInactivo]}
          onPress={guardar}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.botonTexto}>Guardar Producto</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { padding: 16, paddingBottom: 30 },
  centrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  restriccion: {
    fontSize: 15,
    color: COLORES.rojo,
    textAlign: 'center',
    fontWeight: '700',
  },
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
  input: {
    borderWidth: 1.5,
    borderColor: COLORES.borde,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORES.texto,
  },
  fila: { flexDirection: 'row' },
  columna: { flex: 1, marginRight: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
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
  exito: { color: COLORES.verde, fontSize: 13, marginTop: 14, textAlign: 'center', fontWeight: '700' },
  boton: {
    backgroundColor: COLORES.azul,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
  },
  botonInactivo: { opacity: 0.7 },
  botonTexto: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});