-- =====================================================
-- INSERTAR ACTIVIDADES DE PRUEBA EN PREMIACION
-- =====================================================

-- 1. Verificar eventos disponibles
SELECT evento_id, nombre, fecha_inicio FROM evento ORDER BY fecha_inicio;

-- 2. Insertar actividades de prueba (ajustar evento_id según tus datos)
-- Descomentar y ajustar los IDs según tus eventos reales

/*
-- Actividad 1: Degustación de cervezas
INSERT INTO premiacion (nombre, fecha, hora_inicio, hora_fin, tipo)
VALUES ('Degustación de cervezas artesanales', '2024-01-15', '14:00', '16:00', 'actividad');

-- Actividad 2: Concurso de homebrewers
INSERT INTO premiacion (nombre, fecha, hora_inicio, hora_fin, tipo)
VALUES ('Concurso de homebrewers', '2024-01-16', '10:00', '12:00', 'actividad');

-- Actividad 3: Taller de cata
INSERT INTO premiacion (nombre, fecha, hora_inicio, hora_fin, tipo)
VALUES ('Taller de cata de cervezas', '2024-01-17', '15:00', '17:00', 'actividad');

-- Actividad 4: Presentación de nuevos productos
INSERT INTO premiacion (nombre, fecha, hora_inicio, hora_fin, tipo)
VALUES ('Presentación de nuevos productos', '2024-01-18', '11:00', '13:00', 'actividad');

-- Actividad 5: Networking cervecero
INSERT INTO premiacion (nombre, fecha, hora_inicio, hora_fin, tipo)
VALUES ('Networking cervecero', '2024-01-19', '16:00', '18:00', 'actividad');
*/

-- 3. Verificar que se insertaron las actividades
SELECT 
    premiacion_id,
    nombre,
    fecha,
    hora_inicio,
    hora_fin,
    tipo
FROM premiacion 
WHERE tipo = 'actividad'
ORDER BY fecha, hora_inicio;

-- 4. Relacionar actividades con eventos (ajustar IDs)
-- Descomentar y ajustar según tus datos reales

/*
-- Obtener el primer evento disponible
SELECT evento_id, nombre FROM evento LIMIT 1;

-- Relacionar actividades con el primer evento
INSERT INTO premiacion_evento (fk_evento, fk_premiacion)
SELECT 
    (SELECT evento_id FROM evento LIMIT 1) as fk_evento,
    premiacion_id as fk_premiacion
FROM premiacion 
WHERE tipo = 'actividad';
*/

-- 5. Verificar la relación creada
SELECT 
    p.premiacion_id,
    p.nombre as actividad_nombre,
    p.fecha,
    p.hora_inicio,
    p.hora_fin,
    e.evento_id,
    e.nombre as evento_nombre
FROM premiacion p
LEFT JOIN premiacion_evento pe ON p.premiacion_id = pe.fk_premiacion
LEFT JOIN evento e ON pe.fk_evento = e.evento_id
WHERE p.tipo = 'actividad'
ORDER BY p.fecha, p.hora_inicio; 