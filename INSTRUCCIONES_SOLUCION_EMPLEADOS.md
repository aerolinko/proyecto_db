# Solución para el problema de empleados no apareciendo

## Problema identificado:
1. **Error en la función `update_usuario_with_empleado`**: Hay ambigüedad con la columna `empleado_id`
2. **Posible falta de datos**: La tabla `empleado` podría estar vacía
3. **Posible problema con la función `get_empleados()`**: Podría no estar funcionando correctamente

## Pasos para solucionar:

### Paso 1: Ejecutar el script de diagnóstico y corrección
1. Abre tu cliente PostgreSQL (pgAdmin, DBeaver, o línea de comandos)
2. Conéctate a tu base de datos
3. Ejecuta el archivo `sql/solucionar_problema_empleados.sql`

### Paso 2: Verificar que el script se ejecutó correctamente
Después de ejecutar el script, deberías ver:
- El número total de empleados en la tabla
- Confirmación de que la función `get_empleados()` existe
- Resultados de la función `get_empleados()`
- Lista de empleados disponibles

### Paso 3: Probar el endpoint manualmente
1. Asegúrate de que el servidor Next.js esté corriendo (`npm run dev`)
2. Abre tu navegador y ve a: `http://localhost:3000/api/empleados`
3. Deberías ver una respuesta JSON con los empleados

### Paso 4: Verificar en la aplicación
1. Ve a la página de Gestión de Usuarios
2. En el formulario de crear usuario, el dropdown de empleados debería mostrar opciones
3. Si aún no aparecen, revisa la consola del navegador (F12) para ver errores

## Si el problema persiste:

### Verificar logs del servidor:
1. Abre la terminal donde está corriendo `npm run dev`
2. Busca mensajes de error relacionados con `/api/empleados`
3. Los logs mejorados mostrarán más detalles sobre cualquier error

### Verificar la base de datos directamente:
```sql
-- Verificar si hay empleados
SELECT COUNT(*) FROM empleado;

-- Verificar la función
SELECT * FROM get_empleados() LIMIT 5;

-- Verificar empleados sin usuarios asignados
SELECT 
    e.empleado_id,
    e.cedula,
    e.primer_nombre,
    e.primer_apellido,
    CONCAT(e.primer_nombre, ' ', e.primer_apellido) as nombre_completo
FROM empleado e
LEFT JOIN usuario u ON e.empleado_id = u.fk_empleado
WHERE u.fk_empleado IS NULL
ORDER BY e.primer_nombre, e.primer_apellido;
```

## Archivos creados/modificados:
1. `sql/solucionar_problema_empleados.sql` - Script principal de corrección
2. `sql/corregir_update_usuario.sql` - Corrección específica para la función de actualización
3. `sql/insertar_empleados_prueba.sql` - Inserción de empleados de prueba
4. `sql/verificar_empleados.sql` - Script de diagnóstico
5. `nextjs-dashboard/app/api/empleados/route.ts` - Mejorado el logging de errores

## Notas importantes:
- El script solo insertará empleados de prueba si la tabla está completamente vacía
- La función `update_usuario_with_empleado` ha sido corregida para resolver la ambigüedad
- Los logs mejorados te ayudarán a identificar cualquier problema futuro 