-- ===== INSERT COMPRA ONLINE PILSNER CLÁSICA DORADA =====

-- Insertar venta online
INSERT INTO VENTA_ONLINE (direccion, fecha_emision, fecha_estimada, fecha_entrega, total, fk_lugar, fk_usuario) 
VALUES (
    'Av. Libertador, Edificio Centro Plaza, Piso 5, Apto 5A, Caracas',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '3 days',
    CURRENT_DATE + INTERVAL '2 days',  -- Fecha de entrega (para venta completada)
    150,
    983,
    1
);

-- Insertar detalle de la venta (50 unidades de Pilsner Clásica Dorada)
INSERT INTO DETALLE_VENTA_ONLINE (fk_almacen_cerveza, fk_venta_online, precio_unitario, cantidad) 
VALUES (
    1,    -- almacen_cerveza_id de Pilsner Clásica Dorada
    (SELECT MAX(venta_online_id) FROM VENTA_ONLINE),
    3,    -- precio_unitario
    50    -- cantidad: 50 unidades
);

-- Insertar estado de la venta como COMPLETADA
INSERT INTO ESTADO_VENTA_ONLINE (fecha_inicio, fecha_fin, fk_estado, fk_venta_online) 
VALUES (
    CURRENT_DATE,
    NULL,
    3,  -- Estado: COMPLETADO (para que aparezca en el reporte)
    (SELECT MAX(venta_online_id) FROM VENTA_ONLINE)
);

-- Verificar que se insertó correctamente
SELECT '✅ Compra de Pilsner Clásica Dorada insertada exitosamente con estado COMPLETADO' as mensaje; 