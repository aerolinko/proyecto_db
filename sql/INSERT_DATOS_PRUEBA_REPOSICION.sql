-- ===== DATOS DE PRUEBA PARA REPOSICIÓN DE ANAQUELES =====

-- 1. Insertar reposiciones de anaqueles
INSERT INTO REPOSICION_ANAQUEL (fecha) VALUES
('2025-06-20'),
('2025-06-21'),
('2025-06-22'),
('2025-06-23'),
('2025-06-24');

-- 2. Insertar detalles de reposición (productos con stock bajo)
INSERT INTO DETALLE_REPOSICION_ANAQUEL (cantidad, precio_unitario, fk_almacen_cerveza, fk_reposicion_anaquel, fk_anaquel_cerveza) VALUES
(50, 3.00, 1, 1, 1),  -- Pilsner Clásica Dorada (stock: 15)
(30, 4.50, 2, 2, 2),  -- IPA del Pacífico Amarga (stock: 8)
(40, 3.50, 3, 3, 3),  -- Weizen Blanca Tradicional (stock: 12)
(25, 5.00, 4, 4, 4),  -- Stout Irlandesa Cremosa (stock: 3)
(35, 4.00, 5, 5, 5);  -- Dubbel Belga de Abadía (stock: 18)

-- 3. Insertar estados de reposición
INSERT INTO ESTADO_REPOSICION_ANAQUEL (fecha_inicio, fecha_fin, fk_estado, fk_reposicion_anaquel) VALUES
('2025-06-20', NULL, 2, 1),  -- Pendiente
('2025-06-21', NULL, 2, 2),  -- Pendiente
('2025-06-22', NULL, 2, 3),  -- Pendiente
('2025-06-23', NULL, 2, 4),  -- Pendiente
('2025-06-24', NULL, 2, 5);  -- Pendiente

-- 4. Actualizar stock de anaqueles para simular productos con stock bajo
UPDATE ANAQUEL_CERVEZA SET cantidad = 15 WHERE anaquel_cerveza_id = 1;  -- Pilsner
UPDATE ANAQUEL_CERVEZA SET cantidad = 8 WHERE anaquel_cerveza_id = 2;   -- IPA
UPDATE ANAQUEL_CERVEZA SET cantidad = 12 WHERE anaquel_cerveza_id = 3;  -- Weizen
UPDATE ANAQUEL_CERVEZA SET cantidad = 3 WHERE anaquel_cerveza_id = 4;   -- Stout
UPDATE ANAQUEL_CERVEZA SET cantidad = 18 WHERE anaquel_cerveza_id = 5;  -- Dubbel

-- ===== VERIFICACIÓN DE DATOS =====

-- Verificar las reposiciones creadas
SELECT 
    ra.reposicion_anaquel_id,
    ra.fecha,
    c.nombre as producto,
    ac.cantidad as stock_actual,
    dra.cantidad as cantidad_solicitada,
    es.nombre as estado
FROM reposicion_anaquel ra
LEFT JOIN detalle_reposicion_anaquel dra ON ra.reposicion_anaquel_id = dra.fk_reposicion_anaquel
LEFT JOIN anaquel_cerveza ac ON dra.fk_anaquel_cerveza = ac.anaquel_cerveza_id
LEFT JOIN cerveza_presentacion cp ON ac.fk_cerveza_presentacion = cp.cerveza_presentacion_id
LEFT JOIN cerveza c ON cp.fk_cerveza = c.cerveza_id
LEFT JOIN estado_reposicion_anaquel era ON ra.reposicion_anaquel_id = era.fk_reposicion_anaquel
LEFT JOIN estado es ON era.fk_estado = es.estado_id
ORDER BY ra.fecha DESC;

-- ===== PRUEBA DEL STORED PROCEDURE =====

-- Probar el reporte sin filtros
SELECT * FROM get_reposicion_anaqueles();

-- Probar el reporte con filtros de fecha
SELECT * FROM get_reposicion_anaqueles('2025-06-20', '2025-06-25', 10);

-- Probar solo reposiciones de alta prioridad
SELECT * FROM get_reposicion_anaqueles() WHERE prioridad = 'ALTA'; 