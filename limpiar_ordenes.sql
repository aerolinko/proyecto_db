-- Script para limpiar todas las órdenes existentes
-- Primero mostrar las órdenes que existen
SELECT 'Órdenes existentes:' as info;
SELECT venta_online_id, fecha_emision, total, direccion FROM VENTA_ONLINE ORDER BY fecha_emision DESC;

-- Eliminar detalles de ventas online
DELETE FROM DETALLE_VENTA_ONLINE;

-- Eliminar estados de ventas online
DELETE FROM ESTADO_VENTA_ONLINE;

-- Eliminar ventas online
DELETE FROM VENTA_ONLINE;

-- Verificar que se eliminaron
SELECT 'Órdenes después de limpiar:' as info;
SELECT COUNT(*) as total_ventas FROM VENTA_ONLINE;
SELECT COUNT(*) as total_detalles FROM DETALLE_VENTA_ONLINE;
SELECT COUNT(*) as total_estados FROM ESTADO_VENTA_ONLINE; 