-- =====================================================
-- VERIFICAR ESTRUCTURA DE TABLAS
-- =====================================================

-- 1. Verificar estructura de almacen_cerveza
SELECT '=== ESTRUCTURA ALMACEN_CERVEZA ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'almacen_cerveza' 
ORDER BY ordinal_position;

-- 2. Verificar estructura de detalle_venta_online
SELECT '=== ESTRUCTURA DETALLE_VENTA_ONLINE ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'detalle_venta_online' 
ORDER BY ordinal_position;

-- 3. Verificar estructura de cerveza
SELECT '=== ESTRUCTURA CERVEZA ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'cerveza' 
ORDER BY ordinal_position;

-- 4. Verificar estructura de presentacion
SELECT '=== ESTRUCTURA PRESENTACION ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'presentacion' 
ORDER BY ordinal_position;

-- 5. Verificar estructura de tipo_cerveza
SELECT '=== ESTRUCTURA TIPO_CERVEZA ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tipo_cerveza' 
ORDER BY ordinal_position;

-- 6. Verificar estructura de estilo_cerveza
SELECT '=== ESTRUCTURA ESTILO_CERVEZA ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'estilo_cerveza' 
ORDER BY ordinal_position;

-- 7. Ver algunos datos de ejemplo de almacen_cerveza
SELECT '=== DATOS DE EJEMPLO ALMACEN_CERVEZA ===' as info;
SELECT * FROM almacen_cerveza LIMIT 3;

-- 8. Ver algunos datos de ejemplo de cerveza
SELECT '=== DATOS DE EJEMPLO CERVEZA ===' as info;
SELECT * FROM cerveza LIMIT 3;

-- 9. Ver algunos datos de ejemplo de presentacion
SELECT '=== DATOS DE EJEMPLO PRESENTACION ===' as info;
SELECT * FROM presentacion LIMIT 3; 