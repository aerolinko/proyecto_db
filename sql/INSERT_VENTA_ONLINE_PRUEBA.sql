-- ===== INSERT PARA VENTA ONLINE DE 5 UNIDADES DE PILSNER CLÁSICA DORADA =====

-- 1. Insertar la venta online
INSERT INTO VENTA_ONLINE (direccion, fecha_emision, fecha_estimada, fecha_entrega, total, fk_lugar, fk_usuario) VALUES
('Av. Libertador, Edificio Centro Plaza, Piso 8, Apto 8C, Caracas', '2025-01-15', '2025-01-20', NULL, 15, 983, 1);

-- 2. Insertar el detalle de la venta (5 unidades de Pilsner Clásica Dorada)
INSERT INTO DETALLE_VENTA_ONLINE (fk_almacen_cerveza, fk_venta_online, precio_unitario, cantidad) VALUES
(1, (SELECT MAX(venta_online_id) FROM VENTA_ONLINE), 3, 5);

-- 3. Insertar el estado de la venta (pendiente de entrega)
INSERT INTO ESTADO_VENTA_ONLINE (fecha_inicio, fecha_fin, fk_estado, fk_venta_online) VALUES
('2025-01-15', NULL, 2, (SELECT MAX(venta_online_id) FROM VENTA_ONLINE));

-- 4. Insertar el pago (efectivo)
INSERT INTO METODO_PAGO_EFECTIVO (denominacion, fk_cliente_natural, fk_cliente_juridico, fk_miembro_acaucab) VALUES
(15, 1, NULL, NULL);

-- 5. Insertar el registro de pago
INSERT INTO PAGO (monto, fecha, fk_venta_online, fk_venta_tienda, fk_compra_reposicion, fk_venta_evento, fk_membresia, fk_metodo_pago_efectivo, fk_metodo_pago_cheque, fk_metodo_pago_debito, fk_metodo_pago_credito, fk_metodo_pago_punto) VALUES
(15, '2025-01-15', (SELECT MAX(venta_online_id) FROM VENTA_ONLINE), NULL, NULL, NULL, NULL, (SELECT MAX(metodo_pago_id) FROM METODO_PAGO_EFECTIVO), NULL, NULL, NULL, NULL);

-- 6. Insertar puntos de adquisición para el cliente
INSERT INTO PUNTO_VENTA_COMPRA (fk_venta_tienda, fk_venta_online, fk_cliente_natural, fk_cliente_juridico, fk_metodo_pago_punto, cantidad, fecha, tipo) VALUES
(NULL, (SELECT MAX(venta_online_id) FROM VENTA_ONLINE), 1, NULL, NULL, 15, '2025-01-15', 'adquisicion');

-- ===== VERIFICACIÓN DE LA VENTA =====

-- Consulta para verificar que la venta se insertó correctamente
SELECT 
    vo.venta_online_id,
    vo.fecha_emision,
    vo.total,
    vo.direccion,
    c.nombre as cerveza,
    dvo.cantidad,
    dvo.precio_unitario,
    (dvo.cantidad * dvo.precio_unitario) as subtotal,
    u.nombre_usuario as cliente
FROM VENTA_ONLINE vo
JOIN DETALLE_VENTA_ONLINE dvo ON vo.venta_online_id = dvo.fk_venta_online
JOIN ALMACEN_CERVEZA ac ON dvo.fk_almacen_cerveza = ac.almacen_cerveza_id
JOIN CERVEZA_PRESENTACION cp ON ac.fk_cerveza_presentacion = cp.cerveza_presentacion_id
JOIN CERVEZA c ON cp.fk_cerveza = c.cerveza_id
JOIN USUARIO u ON vo.fk_usuario = u.usuario_id
WHERE vo.venta_online_id = (SELECT MAX(venta_online_id) FROM VENTA_ONLINE);

-- ===== ACTUALIZACIÓN DE STOCK =====

-- Actualizar el stock en almacén (reducir 5 unidades)
UPDATE ALMACEN_CERVEZA 
SET cantidad = cantidad - 5 
WHERE almacen_cerveza_id = 1;

-- Verificar el stock actualizado
SELECT 
    ac.almacen_cerveza_id,
    c.nombre as cerveza,
    ac.cantidad as stock_actual,
    ac.precio_unitario
FROM ALMACEN_CERVEZA ac
JOIN CERVEZA_PRESENTACION cp ON ac.fk_cerveza_presentacion = cp.cerveza_presentacion_id
JOIN CERVEZA c ON cp.fk_cerveza = c.cerveza_id
WHERE ac.almacen_cerveza_id = 1; 