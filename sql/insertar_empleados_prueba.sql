-- Script para insertar empleados de prueba
-- Solo inserta si no existen empleados

-- Verificar si hay empleados
DO $$
DECLARE
    empleado_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO empleado_count FROM empleado;
    
    -- Solo insertar si no hay empleados
    IF empleado_count = 0 THEN
        -- Insertar empleados de prueba
        INSERT INTO empleado (cedula, primer_nombre, primer_apellido, segundo_nombre, segundo_apellido, direccion, fecha_contrato, fk_lugar) VALUES
        (12345678, 'Juan', 'Pérez', 'Carlos', 'González', 'Av. Principal 123, Caracas', '2023-01-15', 1),
        (23456789, 'María', 'García', 'Isabel', 'Rodríguez', 'Calle Comercial 456, Valencia', '2023-02-20', 1),
        (34567890, 'Carlos', 'López', 'Alberto', 'Martínez', 'Urbanización Los Rosales 789, Maracay', '2023-03-10', 1),
        (45678901, 'Ana', 'Hernández', 'María', 'Fernández', 'Plaza Bolívar 321, Barquisimeto', '2023-04-05', 1),
        (56789012, 'Luis', 'González', 'Miguel', 'Sánchez', 'Avenida Libertador 654, Mérida', '2023-05-12', 1);
        
        RAISE NOTICE 'Se insertaron 5 empleados de prueba';
    ELSE
        RAISE NOTICE 'Ya existen % empleados en la base de datos', empleado_count;
    END IF;
END $$;

-- Mostrar empleados disponibles
SELECT 
    empleado_id,
    cedula,
    primer_nombre,
    primer_apellido,
    CONCAT(primer_nombre, ' ', primer_apellido) as nombre_completo,
    fecha_contrato
FROM empleado
ORDER BY primer_nombre, primer_apellido; 