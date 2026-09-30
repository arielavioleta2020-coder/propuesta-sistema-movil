import { API_URL } from './config';

let _token = null;

export function setToken(token) {
  _token = token;
}

async function peticion(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(_token ? { Authorization: `Bearer ${_token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(data?.error || 'Error en la solicitud al servidor');
    error.status = res.status;
    throw error;
  }
  return data;
}

export const login = (email, password) =>
  peticion('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const obtenerProductos = () => peticion('/productos');

export const escanearProducto = (codigo) =>
  peticion(`/productos/escaneo/${encodeURIComponent(codigo)}`);

export const obtenerCategorias = () => peticion('/categorias');

export const obtenerProveedores = () => peticion('/proveedores');

export const obtenerBodegas = () => peticion('/bodegas');

export const crearProducto = (datos) =>
  peticion('/productos', {
    method: 'POST',
    body: JSON.stringify(datos),
  });

export const actualizarProducto = (id, datos) =>
  peticion(`/productos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  });

export const eliminarProducto = (id) =>
  peticion(`/productos/${id}`, { method: 'DELETE' });

export const registrarMovimiento = ({ tipo, bodega_id, usuario_id, items }) =>
  peticion('/movimientos', {
    method: 'POST',
    body: JSON.stringify({ tipo, bodega_id, usuario_id, items }),
  });
