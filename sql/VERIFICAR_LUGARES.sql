-- =====================================================
-- VERIFICAR LUGARES DISPONIBLES
-- =====================================================

-- Ver todos los lugares disponibles
SELECT '=== TODOS LOS LUGARES ===' as info;
SELECT lugar_id, nombre, tipo FROM lugar ORDER BY lugar_id LIMIT 20;

-- Ver lugares específicos por tipo
SELECT '=== LUGARES POR TIPO ===' as info;
SELECT tipo, COUNT(*) as cantidad FROM lugar GROUP BY tipo;

-- Ver algunos lugares de ejemplo
SELECT '=== EJEMPLOS DE LUGARES ===' as info;
SELECT lugar_id, nombre, tipo FROM lugar WHERE tipo = 'Estado' LIMIT 5;
SELECT lugar_id, nombre, tipo FROM lugar WHERE tipo = 'Municipio' LIMIT 5;
SELECT lugar_id, nombre, tipo FROM lugar WHERE tipo = 'Parroquia' LIMIT 5;

-- Buscar lugares que contengan "Caracas" o "Distrito"
SELECT '=== LUGARES CARACAS/DISTRITO ===' as info;
SELECT lugar_id, nombre, tipo FROM lugar WHERE nombre ILIKE '%caracas%' OR nombre ILIKE '%distrito%' LIMIT 10;

-- Ver el lugar con ID 983 específicamente
SELECT '=== LUGAR ID 983 ===' as info;
SELECT lugar_id, nombre, tipo FROM lugar WHERE lugar_id = 983; 