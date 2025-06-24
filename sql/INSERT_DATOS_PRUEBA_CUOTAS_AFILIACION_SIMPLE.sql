-- =====================================================
-- DATOS DE PRUEBA SIMPLES PARA CUOTAS DE AFILIACIÓN
-- =====================================================

-- Limpiar datos de prueba anteriores (opcional)
-- DELETE FROM pago WHERE pago_id >= 11;
-- DELETE FROM membresia WHERE membresia_id >= 6;
-- DELETE FROM usuario WHERE usuario_id >= 11;
-- DELETE FROM miembro_acaucab WHERE miembro_id >= 21;

-- Insertar miembros ACAUCAB de prueba
INSERT INTO MIEMBRO_ACAUCAB (razon_social, denominacion_comercial, RIF, direccion, direccion_fiscal, pagina_web, fk_lugar, fk_lugar_fiscal) VALUES
('Cervecería Test 1 C.A.', 'Test Brew 1', 'J-20001000-1', 'Av. Test 1, Caracas', 'Av. Test 1, Caracas', 'www.test1.com', 983, 983),
('Cervecería Test 2 C.A.', 'Test Brew 2', 'J-20001000-2', 'Av. Test 2, Valencia', 'Av. Test 2, Valencia', 'www.test2.com', 661, 661),
('Cervecería Test 3 C.A.', 'Test Brew 3', 'J-20001000-3', 'Av. Test 3, Maracay', 'Av. Test 3, Maracay', 'www.test3.com', 393, 393);

-- Insertar usuarios para los miembros
INSERT INTO USUARIO (fecha_creacion, nombre_usuario, hash_contrasena, fk_miembro_acaucab) VALUES
('2024-01-01', 'test1_user', 'password123', 21),
('2024-02-01', 'test2_user', 'password123', 22),
('2024-03-01', 'test3_user', 'password123', 23);

-- Insertar membresías VENCIDAS (sin pagos)
INSERT INTO MEMBRESIA (fecha_adquisicion, fecha_vencimiento, monto, fk_usuario) VALUES
('2024-01-01', '2024-02-01', 100, 11), -- Vencida desde febrero
('2024-02-01', '2024-03-01', 150, 12), -- Vencida desde marzo
('2024-03-01', '2024-04-01', 200, 13); -- Vencida desde abril

-- Insertar personal de contacto
INSERT INTO PERSONAL_CONTACTO (primer_nombre, primer_apellido, fk_miembro_acaucab) VALUES
('Juan', 'Pérez', 21),
('María', 'García', 22),
('Carlos', 'López', 23);

-- Insertar teléfonos
INSERT INTO TELEFONO (codigo, numero, fk_miembro_acaucab) VALUES
(212, 5550101, 21),
(274, 5550202, 22),
(261, 5550303, 23);

-- Insertar correos electrónicos
INSERT INTO CORREO_ELECTRONICO (usuario, dominio, fk_miembro_acaucab) VALUES
('contacto', '@test1.com', 21),
('contacto', '@test2.com', 22),
('contacto', '@test3.com', 23);

-- =====================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- =====================================================

-- Verificar que los datos se insertaron correctamente
SELECT 'DATOS INSERTADOS:' as info;

SELECT 'Miembros ACAUCAB:' as tabla, COUNT(*) as total FROM miembro_acaucab WHERE miembro_id >= 21;
SELECT 'Usuarios:' as tabla, COUNT(*) as total FROM usuario WHERE usuario_id >= 11;
SELECT 'Membresías:' as tabla, COUNT(*) as total FROM membresia WHERE membresia_id >= 6;

-- Mostrar las membresías vencidas
SELECT 
  'MEMBRESÍAS VENCIDAS:' as info,
  m.membresia_id,
  ma.razon_social,
  m.fecha_vencimiento,
  m.monto,
  CASE 
    WHEN m.fecha_vencimiento < CURRENT_DATE THEN 'VENCIDA'
    ELSE 'VIGENTE'
  END as estado
FROM membresia m
JOIN usuario u ON m.fk_usuario = u.usuario_id
JOIN miembro_acaucab ma ON u.fk_miembro_acaucab = ma.miembro_id
WHERE m.membresia_id >= 6;

-- Probar la consulta del reporte
SELECT 
  'REPORTE DE PRUEBA:' as info,
  ma.miembro_id,
  ma.razon_social,
  ma.rif,
  u.fecha_creacion as fecha_afiliacion,
  mem.monto as cuota_mensual,
  CASE 
    WHEN mem.fecha_vencimiento >= CURRENT_DATE THEN 'ACTIVO'
    ELSE 'VENCIDO'
  END as estado_afiliacion,
  MAX(p.fecha) as ultimo_pago_fecha,
  EXTRACT(MONTH FROM AGE(CURRENT_DATE, COALESCE(MAX(p.fecha), u.fecha_creacion))) as meses_pendientes,
  mem.monto * EXTRACT(MONTH FROM AGE(CURRENT_DATE, COALESCE(MAX(p.fecha), u.fecha_creacion))) as monto_pendiente
FROM miembro_acaucab ma
LEFT JOIN usuario u ON ma.miembro_id = u.fk_miembro_acaucab
LEFT JOIN membresia mem ON u.usuario_id = mem.fk_usuario
LEFT JOIN pago p ON mem.membresia_id = p.fk_membresia
WHERE ma.miembro_id >= 21
GROUP BY 
  ma.miembro_id, ma.razon_social, ma.rif, 
  u.fecha_creacion, mem.fecha_vencimiento, mem.monto
HAVING EXTRACT(MONTH FROM AGE(CURRENT_DATE, COALESCE(MAX(p.fecha), u.fecha_creacion))) > 0
ORDER BY monto_pendiente DESC; 