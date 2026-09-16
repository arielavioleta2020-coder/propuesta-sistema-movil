# StockMobile — Sistema de Gestión de Inventarios para Pymes

**StockMobile** es una solución tecnológica integral para optimizar la logística y el
control de existencias en pequeñas y medianas empresas (Pymes) de la ciudad de Quito.

El sistema conecta una **interfaz móvil nativa** (React Native + Expo) con un servicio
**Back-End** centralizado (Node.js + Express) y una base de datos relacional **MySQL**
administrada con phpMyAdmin (XAMPP).

---

## 1. Estructura del proyecto

```
Default Project/
├── database/
│   └── stockmobile_db.sql        # Script DDL + DML de la base de datos
├── backend/                      # API RESTful (Node.js + Express)
│   ├── src/
│   │   ├── config/db.js          # Conexión a MySQL (pool)
│   │   ├── controllers/          # Lógica de negocio (auth, productos, movimientos)
│   │   ├── middleware/auth.js    # JWT + RBAC
│   │   ├── routes/               # Rutas HTTP
│   │   ├── app.js                # Configuración de Express
│   │   └── server.js             # Arranque del servidor
│   ├── tests/                    # Pruebas de integración
│   └── .env                      # Variables de entorno
├── mobile/                       # App móvil React Native + Expo
│   ├── App.js                    # Navegación Login / Inicio
│   └── src/
│       ├── config.js             # URL de la API y colores
│       ├── api.js                # Cliente Fetch
│       ├── components/SMLogo.js  # Isotipo «SM»
│       └── screens/              # Login, Inicio (catálogo) y Escáner
├── documentos/
│   └── logo_stockmobile.png      # Logo oficial para el informe
└── README.md
```

## 2. Requerimientos

| Aspecto | Detalle |
|---|---|
| Sistema operativo | Windows 11 / 10 (o Linux/macOS) |
| Node.js | v20 o superior |
| MySQL | MariaDB/MySQL incluido en XAMPP (phpMyAdmin) |
| Teléfono | Android 10 o superior con **Expo Go** |
| IDE (opcional) | Visual Studio Code |

## 3. Configuración de la base de datos

1. Inicie **XAMPP** y active los servicios **Apache** y **MySQL**.
2. Importe el script en phpMyAdmin (`http://localhost/phpmyadmin`) o por consola:

   ```bash
   mysql -u root --default-character-set=utf8mb4 < database/stockmobile_db.sql
   ```

El script crea la base `stockmobile_db` con 8 tablas (`roles`, `usuarios`, `categorias`,
`proveedores`, `bodegas`, `productos`, `movimientos`, `detalle_movimiento`) y datos de
prueba.

### Credenciales de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@stockmobile.ec | Admin123! |
| Bodeguero | cbodega@stockmobile.ec | Bodega123! |

## 4. Back-End (API RESTful)

```bash
cd backend
npm install        # primera vez
npm start          # servidor en http://localhost:3000
npm run dev        # modo desarrollo (reinicio automático)
npm test           # ejecuta las pruebas de integración
```

### Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/productos` | Catálogo completo con JOIN a categorías y proveedores |
| GET | `/api/productos/escaneo/:codigo` | Búsqueda por código de barras (404 si no existe) |
| POST | `/api/productos` | Crear producto (solo admin, JWT) |
| PUT | `/api/productos/:id` | Actualizar producto (solo admin, JWT) |
| DELETE | `/api/productos/:id` | Eliminar producto (solo admin, JWT) |
| POST | `/api/auth/login` | Autenticación (JWT + bcrypt, control por roles RBAC) |
| GET | `/api/auth/me` | Perfil del usuario autenticado |
| POST | `/api/movimientos` | Registrar entrada/salida y actualizar stock (transacción) |
| GET | `/api/categorias` | Consultar categorías (para formularios) |
| GET | `/api/proveedores` | Consultar proveedores (para formularios) |
| GET | `/api/bodegas` | Consultar bodegas (para movimientos) |

Ejemplos:

```bash
curl http://localhost:3000/api/productos
curl http://localhost:3000/api/productos/escaneo/779123456789
curl http://localhost:3000/api/productos/escaneo/12345   # → 404 Not Found
```

**Nota:** Para que el celular acceda a la API, ambas deben estar en la misma red Wi‑Fi.
El servidor escucha en `0.0.0.0` y la app detecta automáticamente la IP de su PC
(campo `API_URL` en `mobile/src/config.js` si necesita ajuste manual).

## 5. App móvil (Front-End)

### Ejecución con doble clic (recomendada)

Abra, en este orden, estos 3 archivos (cada uno abre su propia ventana):

1. **`iniciar_backend.bat`** — enciende el servidor API (`http://localhost:3000`).
2. **`iniciar_emulador.bat`** — enciende el emulador Android **Pixel_7** y espera
   a que el teléfono virtual termine de cargar.
3. **`iniciar_movil.bat`** — abre Expo y, cuando aparezca el menú, presione la
   letra **`a`** para instalar y abrir la app automáticamente en el emulador.

### Ejecución manual (opcional)

```bash
cd mobile
npm install        # primera vez
npx expo start     # luego presione la tecla "a" (emulador Android)
```

### Tipos de dispositivo

| Dispositivo | Cómo se abre | Nota |
|---|---|---|
| **Emulador Android** (recomendado si el celular es antiguo) | Presione la tecla `a` en Expo, o `npm run android` | Expo Go se instala solo en el emulador |
| Celular físico | Escanee el QR de la terminal con **Expo Go** | Requiere Android 7+ y Expo Go actualizado |
| Navegador (solo consulta) | Presione la tecla `w` en Expo | El escáner de cámara no aplica en web |

> **Nota:** el emulador y el PC comparten red; la app obtiene la IP de la API
> automáticamente (`mobile/src/config.js`). Si no conecta, asegúrese de que el
> servidor esté activo en `http://192.168.1.4:3000/api/productos`.

### Módulos de la interfaz

La app se organiza con una **cabecera** (logo «SM», nombre y rol) y una **barra
inferior con 4 pestañas**:

1. **Inventario** — módulo de búsqueda y escáner (ingreso manual o cámara del
   dispositivo), visor de alertas (tarjeta verde si existe / roja si no) y
   **catálogo activo** sincronizado con la API en tiempo real.
2. **Movimientos** — registro de **entradas y salidas** de stock mediante
   transacción; actualiza las existencias al instante y avisa si no hay stock
   suficiente.
3. **Alertas** — lista de productos cuyo stock está en o por debajo del
   **stock mínimo** (reposición).
4. **Nuevo** — registro de productos (**solo Administrador**: código, nombre,
   costo, precio, stock y clasificación por categoría y proveedor).

## 6. Manual de usuario

1. **Acceso al aplicativo:** ejecute `iniciar_backend.bat`, `iniciar_emulador.bat`
   y `iniciar_movil.bat` (presione `a` en la ventana de Expo). La app StockMobile
   se abrirá en el emulador de Android.
2. **Inicio de sesión:** ingrese el correo y la contraseña de la cuenta de
   demostración y pulse **Ingresar**.
3. **Consulta del catálogo:** en la pantalla de inicio observe la sección
   **Lista de Inventario** con los productos y su stock actual en tiempo real.
4. **Búsqueda / escaneo de producto:**
   - Ingrese el código de barras del ítem (por ejemplo `779123456789`) y pulse
     **Escanear / Buscar**, o
   - Pulse **Escanear / Buscar** sin texto para abrir la cámara y escanear el
     código del producto.
5. **Confirmación de alerta:** verifique la tarjeta informativa **verde** con el
   nombre y stock del producto consultado, o la alerta **roja** de validación si el
   ítem no está registrado.
6. **Consultar producto:** toque *Consultar producto* en cualquier ítem del
   catálogo para buscarlo directamente por su código.
7. **Registrar movimiento:** pestaña **Movimientos** → elija *Entrada* o *Salida*
   → digite el código del producto y pulse **Buscar** → indique la cantidad y la
   bodega → pulse **Registrar**. Verá una tarjeta verde con el nuevo stock.
8. **Ver alertas:** pestaña **Alertas** → muestra los productos con existencias
   bajas para reposición.
9. **Registrar producto (solo Administrador):** pestaña **Nuevo** → complete el
   formulario y pulse **Guardar Producto**.
10. **Cerrar sesión:** pulse el botón **Salir** de la cabecera.

## 7. Pruebas realizadas

| Prueba | Resultado |
|---|---|
| Pruebas unitarias / API: respuestas JSON ante peticiones válidas | ✅ |
| `GET /api/productos` devuelve el catálogo (JOIN categorías) | ✅ 200 |
| `GET /api/productos/escaneo/779123456789` busca por código | ✅ 200 |
| `GET /api/productos/escaneo/12345` (no registrado) | ✅ 404 |
| Login correcto (admin@stockmobile.ec) devuelve JWT con rol | ✅ 200 |
| Login con credenciales inválidas | ✅ 401 |
| Endpoints CRUD protegidos exigen token | ✅ 401 |
| Alta de producto desde la API (`POST /api/productos`) | ✅ 201 |
| Movimiento de ENTRADA actualiza stock (10 → 15) | ✅ 201 |
| Salida con stock insuficiente es rechazada | ✅ 400 |
| Consulta de categorías, proveedores y bodegas | ✅ 200 |
| Pruebas de integración: app móvil ↔ API ↔ MySQL (phpMyAdmin) | ✅ |

## 8. Entregables

- **Repositorio de código fuente:** [propuesta-sistema-movil](https://github.com/arielavioleta2020-coder/propuesta-sistema-movil)
- **Link del aplicativo / demostración local:** `http://localhost:3000` (servidor
  Node.js activo) y app móvil vía Expo Go.
- **Manual de usuario:** sección 6 de este documento.