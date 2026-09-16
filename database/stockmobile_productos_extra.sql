-- =========================================================
--  STOCKMOBILE - Productos adicionales para demostración
--  Aplicar sobre la base ya existente (no recrea tablas)
-- =========================================================
USE stockmobile_db;

INSERT IGNORE INTO categorias (id, nombre) VALUES
(3, 'Computación'),
(4, 'Audio y Video'),
(5, 'Redes');

INSERT IGNORE INTO proveedores (id, ruc_cedula, razon_social, telefono, direccion) VALUES
(3, '1794561234001', 'CompuNet Mayorista S.A.', '023456001', 'Av. De la Prensa N45-12, Quito');

INSERT IGNORE INTO productos (id, codigo_barras, nombre, costo_compra, precio_venta, stock_actual, stock_minimo, categoria_id, proveedor_id) VALUES
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
