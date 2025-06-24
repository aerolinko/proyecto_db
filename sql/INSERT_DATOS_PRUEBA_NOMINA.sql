-- =====================================================
-- DATOS DE PRUEBA PARA REPORTE DE NÓMINA POR DEPARTAMENTO
-- =====================================================

-- Insertar departamentos de prueba
INSERT INTO DEPARTAMENTO (nombre, fk_acaucab) VALUES
('Recursos Humanos', 1),
('Contabilidad', 1),
('Ventas', 1),
('Producción', 1),
('Logística', 1);

-- Insertar cargos de prueba
INSERT INTO CARGO (nombre) VALUES
('Gerente'),
('Supervisor'),
('Analista'),
('Asistente'),
('Operador'),
('Vendedor'),
('Contador'),
('Auxiliar');

-- Insertar empleados de prueba
INSERT INTO EMPLEADO (cedula, primer_nombre, primer_apellido, direccion, segundo_nombre, segundo_apellido, fecha_contrato, fk_lugar) VALUES
(12345678, 'María', 'González', 'Av. Principal, Res. Los Rosales, Apto 5A, Caracas', 'Carmen', 'López', '2023-01-15', 983),
(23456789, 'Carlos', 'Rodríguez', 'Calle 15, Sector Centro, Casa 23, Valencia', 'Alberto', 'Mendoza', '2023-02-20', 661),
(34567890, 'Ana', 'Pérez', 'Av. Bolívar, Edificio Plaza Mayor, Piso 8, Oficina 801, Maracay', 'Isabel', 'García', '2023-03-10', 662),
(45678901, 'Luis', 'Martínez', 'Calle Comercial, Local 12, Barquisimeto', 'Fernando', 'Herrera', '2023-04-05', 663),
(56789012, 'Carmen', 'López', 'Av. Libertador, Res. El Bosque, Apto 3B, Caracas', 'Elena', 'Torres', '2023-05-12', 983),
(67890123, 'Roberto', 'García', 'Calle 8, Sector Norte, Casa 45, Valencia', 'José', 'Silva', '2023-06-18', 661),
(78901234, 'Patricia', 'Herrera', 'Av. Principal, Edificio Centro, Piso 5, Oficina 502, Maracay', 'Rosa', 'Vargas', '2023-07-25', 662),
(89012345, 'Miguel', 'Torres', 'Calle Industrial, Galpón 7, Barquisimeto', 'Antonio', 'Rojas', '2023-08-30', 663),
(90123456, 'Sofia', 'Silva', 'Av. Bolívar, Res. Las Acacias, Apto 7C, Caracas', 'Lucía', 'Morales', '2023-09-14', 983),
(01234567, 'Diego', 'Vargas', 'Calle 22, Sector Este, Casa 67, Valencia', 'Manuel', 'Castro', '2023-10-22', 661);

-- Insertar asignaciones de empleados a departamentos y cargos
INSERT INTO DEPARTAMENTO_EMPLEADO (fecha_inicio, fecha_fin, salario, fk_departamento, fk_empleado, fk_cargo) VALUES
-- Recursos Humanos
('2023-01-15', NULL, 3500000, 1, 1, 1), -- María González - Gerente RRHH
('2023-06-18', NULL, 2800000, 1, 6, 2), -- Roberto García - Supervisor RRHH
('2023-09-14', NULL, 2200000, 1, 9, 3), -- Sofia Silva - Analista RRHH

-- Contabilidad
('2023-02-20', NULL, 3200000, 2, 2, 1), -- Carlos Rodríguez - Gerente Contabilidad
('2023-07-25', NULL, 2500000, 2, 7, 7), -- Patricia Herrera - Contador
('2023-10-22', NULL, 1800000, 2, 10, 8), -- Diego Vargas - Auxiliar Contabilidad

-- Ventas
('2023-03-10', NULL, 3000000, 3, 3, 1), -- Ana Pérez - Gerente Ventas
('2023-04-05', NULL, 2400000, 3, 4, 6), -- Luis Martínez - Vendedor
('2023-05-12', NULL, 2000000, 3, 5, 6), -- Carmen López - Vendedor

-- Producción
('2023-08-30', NULL, 2600000, 4, 8, 2), -- Miguel Torres - Supervisor Producción

-- Logística
('2023-11-01', NULL, 2100000, 5, 11, 5); -- Nuevo empleado - Operador Logística

-- Insertar beneficios de prueba
INSERT INTO BENEFICIO (nombre, descripcion) VALUES
('Bono de Productividad', 'Bono mensual por cumplimiento de metas'),
('Vale de Alimentación', 'Vale diario para alimentación'),
('Seguro Médico', 'Cobertura médica familiar'),
('Bono de Antigüedad', 'Bono anual por años de servicio'),
('Vale de Transporte', 'Vale mensual para transporte público');

-- Insertar beneficios asignados a empleados
INSERT INTO BENEFICIO_EMPLEADO (monto, fk_beneficio, fk_empleado) VALUES
-- María González (Gerente RRHH)
(500000, 1, 1), -- Bono Productividad
(300000, 2, 1), -- Vale Alimentación
(800000, 3, 1), -- Seguro Médico

-- Carlos Rodríguez (Gerente Contabilidad)
(450000, 1, 2), -- Bono Productividad
(300000, 2, 2), -- Vale Alimentación
(800000, 3, 2), -- Seguro Médico

-- Ana Pérez (Gerente Ventas)
(600000, 1, 3), -- Bono Productividad (mayor por ventas)
(300000, 2, 3), -- Vale Alimentación
(800000, 3, 3), -- Seguro Médico

-- Luis Martínez (Vendedor)
(400000, 1, 4), -- Bono Productividad
(250000, 2, 4), -- Vale Alimentación
(600000, 3, 4), -- Seguro Médico

-- Carmen López (Vendedor)
(350000, 1, 5), -- Bono Productividad
(250000, 2, 5), -- Vale Alimentación
(600000, 3, 5), -- Seguro Médico

-- Roberto García (Supervisor RRHH)
(300000, 1, 6), -- Bono Productividad
(250000, 2, 6), -- Vale Alimentación
(700000, 3, 6), -- Seguro Médico

-- Patricia Herrera (Contador)
(250000, 1, 7), -- Bono Productividad
(250000, 2, 7), -- Vale Alimentación
(700000, 3, 7), -- Seguro Médico

-- Miguel Torres (Supervisor Producción)
(350000, 1, 8), -- Bono Productividad
(250000, 2, 8), -- Vale Alimentación
(700000, 3, 8), -- Seguro Médico

-- Sofia Silva (Analista RRHH)
(200000, 1, 9), -- Bono Productividad
(200000, 2, 9), -- Vale Alimentación
(500000, 3, 9), -- Seguro Médico

-- Diego Vargas (Auxiliar Contabilidad)
(150000, 1, 10), -- Bono Productividad
(200000, 2, 10), -- Vale Alimentación
(500000, 3, 10); -- Seguro Médico

-- =====================================================
-- CONSULTAS DE VERIFICACIÓN:
-- =====================================================

-- Verificar datos insertados
SELECT 'DEPARTAMENTOS' as tabla, COUNT(*) as total FROM DEPARTAMENTO WHERE departamento_id >= 1;
SELECT 'CARGOS' as tabla, COUNT(*) as total FROM CARGO WHERE cargo_id >= 1;
SELECT 'EMPLEADOS' as tabla, COUNT(*) as total FROM EMPLEADO WHERE empleado_id >= 1;
SELECT 'ASIGNACIONES' as tabla, COUNT(*) as total FROM DEPARTAMENTO_EMPLEADO WHERE departamento_empleado_id >= 1;
SELECT 'BENEFICIOS' as tabla, COUNT(*) as total FROM BENEFICIO WHERE beneficio_id >= 1;
SELECT 'BENEFICIOS EMPLEADOS' as tabla, COUNT(*) as total FROM BENEFICIO_EMPLEADO WHERE beneficio_empleado_id >= 1;

-- Ejemplo de consulta del reporte
SELECT 
  d.nombre as departamento,
  c.nombre as cargo,
  CONCAT(e.primer_nombre, ' ', e.primer_apellido) as empleado,
  de.salario as salario_base,
  COALESCE(SUM(be.monto), 0) as total_beneficios,
  de.salario + COALESCE(SUM(be.monto), 0) as costo_total
FROM DEPARTAMENTO d
INNER JOIN DEPARTAMENTO_EMPLEADO de ON d.departamento_id = de.fk_departamento
INNER JOIN EMPLEADO e ON de.fk_empleado = e.empleado_id
INNER JOIN CARGO c ON de.fk_cargo = c.cargo_id
LEFT JOIN BENEFICIO_EMPLEADO be ON e.empleado_id = be.fk_empleado
WHERE de.fecha_fin IS NULL OR de.fecha_fin >= CURRENT_DATE
GROUP BY d.nombre, c.nombre, e.primer_nombre, e.primer_apellido, de.salario
ORDER BY d.nombre, c.nombre, e.primer_apellido; 