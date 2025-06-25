# Solución Completa para el Problema de Empleados

## 🔍 Diagnóstico del Problema

El problema es que **hay empleados en la base de datos pero no aparecen en el dropdown** de la aplicación. Esto indica un problema con la función SQL `get_empleados()` o con la conexión a la base de datos.

## 🛠️ Solución Paso a Paso

### Paso 1: Ejecutar el Script de Diagnóstico

1. **Abre tu cliente PostgreSQL** (pgAdmin, DBeaver, o línea de comandos)
2. **Conéctate a tu base de datos**
3. **Ejecuta el archivo**: `sql/diagnostico_completo_empleados.sql`

Este script te mostrará:
- ✅ Si la tabla `empleado` existe y tiene datos
- ✅ Si las funciones SQL están definidas correctamente
- ✅ Si hay errores en las funciones
- ✅ Cuántos empleados están disponibles

### Paso 2: Ejecutar las Correcciones

1. **Ejecuta el archivo**: `sql/corregir_funcion_get_empleados.sql`
   - Esto recreará la función `get_empleados()` con mejor manejo de errores
   - Creará funciones alternativas para testing

2. **Ejecuta el archivo**: `sql/corregir_update_usuario.sql`
   - Esto corregirá la función `update_usuario_with_empleado` que tenía ambigüedad

### Paso 3: Probar el Endpoint de Diagnóstico

1. **Asegúrate de que el servidor Next.js esté corriendo**:
   ```bash
   cd nextjs-dashboard
   npm run dev
   ```

2. **Visita el endpoint de diagnóstico**:
   ```
   http://localhost:3000/api/empleados/test
   ```

3. **Revisa la respuesta JSON** para ver qué está funcionando y qué no

### Paso 4: Probar el Endpoint Principal

1. **Visita el endpoint principal**:
   ```
   http://localhost:3000/api/empleados
   ```

2. **Deberías ver una respuesta como**:
   ```json
   {
     "message": "Empleados obtenidos exitosamente",
     "empleados": [...],
     "count": 5
   }
   ```

### Paso 5: Verificar en la Aplicación

1. **Ve a la página de Gestión de Usuarios**
2. **En el formulario de crear usuario**, el dropdown debería mostrar empleados
3. **Si aún no aparecen**, revisa la consola del navegador (F12)

## 🔧 Mejoras Implementadas

### 1. Función `getEmpleados()` Mejorada
- **Fallback automático**: Si la función SQL falla, usa consulta directa
- **Mejor logging**: Más información para diagnosticar problemas
- **Manejo de errores robusto**

### 2. Funciones SQL Alternativas
- `get_empleados_simple()`: Versión simplificada para testing
- `get_empleados_disponibles()`: Solo empleados sin usuarios asignados
- `get_empleados()`: Versión mejorada con logging

### 3. Endpoint de Diagnóstico
- `/api/empleados/test`: Prueba todas las funciones y consultas
- Información detallada sobre errores
- Comparación entre diferentes métodos

## 🚨 Posibles Causas del Problema

### 1. **Schema Incorrecto**
```sql
-- Verificar schema actual
SELECT current_schema();
SHOW search_path;
```

### 2. **Función SQL con Error**
```sql
-- Verificar si la función existe
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'get_empleados';
```

### 3. **Permisos Insuficientes**
```sql
-- Verificar permisos
SELECT privilege_type FROM information_schema.table_privileges 
WHERE table_name = 'empleado' AND grantee = current_user;
```

### 4. **Datos en Schema Incorrecto**
```sql
-- Verificar en qué schema están los datos
SELECT schemaname, tablename 
FROM pg_tables 
WHERE tablename = 'empleado';
```

## 📋 Checklist de Verificación

- [ ] Script de diagnóstico ejecutado
- [ ] Funciones SQL corregidas
- [ ] Endpoint `/api/empleados/test` funciona
- [ ] Endpoint `/api/empleados` devuelve datos
- [ ] Dropdown en la aplicación muestra empleados
- [ ] No hay errores en la consola del navegador
- [ ] No hay errores en los logs del servidor

## 🆘 Si el Problema Persiste

### 1. Revisar Logs del Servidor
```bash
# En la terminal donde corre npm run dev
# Buscar mensajes relacionados con:
# - "getEmpleados"
# - "/api/empleados"
# - "Error en getEmpleados"
```

### 2. Verificar Conexión a la Base de Datos
```typescript
// En db.ts, verificar la configuración:
const sql = postgres({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    username: 'postgres',
    password: '1602',
    connection: { options: '-c search_path=schema_name' }
});
```

### 3. Probar Consulta Directa
```sql
-- Ejecutar directamente en PostgreSQL
SELECT 
    empleado_id::TEXT as id,
    cedula,
    primer_nombre,
    primer_apellido,
    CONCAT(primer_nombre, ' ', primer_apellido) as nombre_completo
FROM empleado
ORDER BY primer_nombre, primer_apellido;
```

## 📁 Archivos Modificados/Creados

1. `sql/diagnostico_completo_empleados.sql` - Diagnóstico completo
2. `sql/corregir_funcion_get_empleados.sql` - Funciones mejoradas
3. `sql/corregir_update_usuario.sql` - Corrección de ambigüedad
4. `nextjs-dashboard/app/api/empleados/test/route.ts` - Endpoint de diagnóstico
5. `nextjs-dashboard/db.ts` - Función getEmpleados mejorada
6. `nextjs-dashboard/app/api/empleados/route.ts` - Logging mejorado

## ✅ Resultado Esperado

Después de seguir estos pasos, deberías ver:
- Empleados disponibles en el dropdown de crear usuario
- No errores en la consola del navegador
- Respuestas exitosas en los endpoints
- Logs informativos en el servidor 