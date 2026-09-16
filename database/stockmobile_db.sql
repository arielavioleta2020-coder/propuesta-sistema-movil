-- =========================================================
--  STOCKMOBILE - Sistema de Gestión de Inventarios para Pymes
--  Base de datos: stockmobile_db
--  Motor: MySQL / MariaDB (phpMyAdmin - XAMPP)
-- =========================================================

-- 1. ESTRUCTURA DE LA BASE DE DATOS (DDL)
-- =========================================================
CREATE DATABASE IF NOT EXISTS stockmobile_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE stockmobile_db;

-- Tabla: roles
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

-- Tabla: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL,
    CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id) REFERENCES roles(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabla: categorias
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- Tabla: proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ruc_cedula VARCHAR(13) NOT NULL UNIQUE,
    razon_social VARCHAR(150) NOT NULL,
    telefono VARCHAR(15),
    direccion VARCHAR(200)
) ENGINE=InnoDB;

-- Tabla: bodegas
CREATE TABLE IF NOT EXISTS bodegas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_bodega VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(150) NOT NULL
) ENGINE=InnoDB;

-- Tabla: productos
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_barras VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    costo_compra DECIMAL(10, 2) NOT NULL,
    precio_venta DECIMAL(10, 2) NOT NULL,
    stock_actual INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 5,
    categoria_id INT NOT NULL,
    proveedor_id INT NOT NULL,
    CONSTRAINT fk_producto_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_producto_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabla: movimientos
CREATE TABLE IF NOT EXISTS movimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('ENTRADA', 'SALIDA') NOT NULL,
    bodega_id INT NOT NULL,
    usuario_id INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_movimiento_bodega FOREIGN KEY (bodega_id) REFERENCES bodegas(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_movimiento_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Tabla: detalle_movimiento
CREATE TABLE IF NOT EXISTS detalle_movimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movimiento_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    costo_unitario DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_detalle_movimiento FOREIGN KEY (movimiento_id) REFERENCES movimientos(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id) REFERENCES productos(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- 2. INSERCIÓN DE DATOS INICIALES DE PRUEBA (DML)
-- =========================================================

INSERT INTO roles (id, nombre) VALUES
(1, 'Administrador'),
(2, 'Bodeguero');

-- Contraseñas: Admin123! y Bodega123! (hash bcrypt $2b$10$)
INSERT INTO usuarios (id, nombre, email, password_hash, rol_id) VALUES
(1, 'Admin StockMobile', 'admin@stockmobile.ec', '$2b$10$KfQ.9yiflW4tWYHWvSOvwuv.zW0vGgQic928SSmx8gx.OtlDVOW9W', 1),
(2, 'Carlos Bodega', 'cbodega@stockmobile.ec', '$2b$10$UbhJkh0Fa58aPRyX2JyAyO0cZywoTkpp17O27W07mdQpQsQN2BvY6', 2);

INSERT INTO categorias (id, nombre) VALUES
(1, 'Electrónica'),
(2, 'Accesorios'),
(3, 'Computación'),
(4, 'Audio y Video'),
(5, 'Redes');

INSERT INTO proveedores (id, ruc_cedula, razon_social, telefono, direccion) VALUES
(1, '1791234567001', 'TechImport Quito S.A.', '022345678', 'Av. Amazonas N24-12, Quito'),
(2, '1799876543001', 'Distribuidora Global Cía. Ltda.', '022987654', 'Av. De los Granados E10-45, Quito'),
(3, '1794561234001', 'CompuNet Mayorista S.A.', '023456001', 'Av. De la Prensa N45-12, Quito');

INSERT INTO bodegas (id, nombre_bodega, ubicacion) VALUES
(1, 'Bodega Central Quito', 'Sector Norte - El Inca'),
(2, 'Bodega Sucursal Sur', 'Sector Quitumbe');

INSERT INTO productos (id, codigo_barras, nombre, costo_compra, precio_venta, stock_actual, stock_minimo, categoria_id, proveedor_id) VALUES
(1, '779123456789', 'Mouse Inalámbrico Logitech', 10.50, 15.50, 20, 5, 1, 1),
(2, '779987654321', 'Teclado Mecánico RGB', 30.00, 45.00, 3, 5, 1, 1),
(3, '779555444333', 'Audífonos Bluetooth', 15.00, 25.00, 10, 2, 2, 2),
(4, '7791000010001', 'Laptop HP Pavilion 15', 620.00, 699.00, 8, 3, 3, 3),
(5, '7791000020002', 'Monitor LG 24 Pulgadas Full HD', 145.00, 179.00, 12, 4, 3, 1),
(6, '7791000030003', 'Impresora HP LaserJet M111', 190.00, 240.00, 4, 2, 3, 1),
(7, '7791000040004', 'SSD Samsung EVO 1TB', 78.00, 99.00, 15, 5, 3, 3),
(8, '7791000050005', 'Parlante Bluetooth JBL Go 3', 30.00, 45.00, 9, 3, 4, 2),
(9, '7791000060006', 'Webcam Logitech C920 1080p', 28.00, 39.00, 2, 4, 4, 1),
(10, '7791000070007', 'Router TP-Link WiFi 6 AX1500', 35.00, 49.00, 10, 3, 5, 2),
(11, '7791000080008', 'Cable HDMI 2 Metros', 3.50, 6.00, 40, 10, 2, 2),
(12, '7791000090009', 'Cargador USB-C 65W', 12.00, 18.00, 1, 5, 2, 3),
(13, '7791000100010', 'Teclado Inalámbrico Logitech K380', 24.00, 34.00, 6, 3, 1, 1);

INSERT INTO movimientos (id, tipo, bodega_id, usuario_id) VALUES
(1, 'ENTRADA', 1, 1);

INSERT INTO detalle_movimiento (id, movimiento_id, producto_id, cantidad, costo_unitario) VALUES
(1, 1, 1, 20, 10.50);

-- =========================================================
-- 3. CONSULTAS DE VALIDACIÓN
-- =========================================================
-- SELECT p.id, p.codigo_barras, p.nombre, p.precio_venta, p.stock_actual,
--        c.nombre AS categoria, pr.razon_social AS proveedor
-- FROM productos p
-- JOIN categorias c ON c.id = p.categoria_id
-- JOIN proveedores pr ON pr.id = p.proveedor_id;