# 🔧 Solucionar Problema: No Aparecen las Actividades

## 🎯 El Problema

Las actividades no aparecen porque:
1. **No hay datos** en la tabla PREMIACION con tipo 'actividad'
2. **Las funciones SQL** no están creadas en tu base de datos
3. **El SELECT** no encuentra registros

## 🚀 Solución Paso a Paso

### **Paso 1: Verificar qué datos tienes**

**Ejecutar en tu base de datos:**
```bash
psql -d tu_base_de_datos -U tu_usuario
```

**Luego ejecutar:**
```sql
-- Verificar estructura de PREMIACION
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'premiacion' ORDER BY ordinal_position;

-- Verificar cuántos registros hay
SELECT COUNT(*) as total FROM premiacion;

-- Verificar tipos de premiación
SELECT tipo, COUNT(*) as cantidad FROM premiacion GROUP BY tipo;

-- Verificar si hay actividades
SELECT * FROM premiacion WHERE tipo = 'actividad';
```

### **Paso 2: Verificar desde la aplicación**

**Acceder a la URL de debug:**
```
http://localhost:3000/api/debug-premiaciones
```

**Esto te mostrará:**
- Estructura de la tabla
- Total de registros
- Tipos de premiación
- Todas las premiaciones
- Actividades específicas

### **Paso 3: Insertar datos de prueba**

**Si no hay actividades, ejecutar:**
```sql
-- Ver eventos disponibles
SELECT evento_id, nombre FROM evento LIMIT 5;

-- Insertar actividades de prueba
INSERT INTO premiacion (nombre, fecha, hora_inicio, hora_fin, tipo)
VALUES ('Degustación de cervezas', '2024-01-15', '14:00', '16:00', 'actividad');

INSERT INTO premiacion (nombre, fecha, hora_inicio, hora_fin, tipo)
VALUES ('Concurso de homebrewers', '2024-01-16', '10:00', '12:00', 'actividad');

-- Relacionar con un evento (ajustar evento_id)
INSERT INTO premiacion_evento (fk_evento, fk_premiacion)
SELECT 
    (SELECT evento_id FROM evento LIMIT 1) as fk_evento,
    premiacion_id as fk_premiacion
FROM premiacion 
WHERE tipo = 'actividad';
```

### **Paso 4: Verificar que funcionó**

**Ejecutar:**
```sql
-- Verificar actividades creadas
SELECT 
    p.premiacion_id,
    p.nombre,
    p.fecha,
    p.hora_inicio,
    p.hora_fin,
    e.nombre as evento_nombre
FROM premiacion p
LEFT JOIN premiacion_evento pe ON p.premiacion_id = pe.fk_premiacion
LEFT JOIN evento e ON pe.fk_evento = e.evento_id
WHERE p.tipo = 'actividad'
ORDER BY p.fecha;
```

### **Paso 5: Probar la aplicación**

**Acceder a:**
```
http://localhost:3000/admin/Actividades
```

**O verificar el endpoint:**
```
http://localhost:3000/api/actividades
```

## 🔍 Diagnóstico Rápido

### **Si no hay datos:**
```sql
-- Insertar una actividad de prueba
INSERT INTO premiacion (nombre, fecha, hora_inicio, hora_fin, tipo)
VALUES ('Prueba', '2024-01-15', '14:00', '16:00', 'actividad');
```

### **Si hay datos pero no aparecen:**
```sql
-- Verificar el SELECT que usa la aplicación
SELECT 
    p.premiacion_id,
    p.nombre,
    p.fecha,
    p.hora_inicio,
    p.hora_fin,
    p.tipo,
    e.evento_id,
    e.nombre as evento_nombre,
    l.nombre as lugar_nombre
FROM premiacion p
LEFT JOIN premiacion_evento pe ON p.premiacion_id = pe.fk_premiacion
LEFT JOIN evento e ON pe.fk_evento = e.evento_id
LEFT JOIN lugar l ON e.fk_lugar = l.lugar_id
WHERE p.tipo = 'actividad'
ORDER BY p.fecha DESC, p.hora_inicio;
```

## 📋 Scripts Útiles

### **1. Verificar datos completos:**
```sql
\i sql/VERIFICAR_PREMIACIONES.sql
```

### **2. Insertar datos de prueba:**
```sql
\i sql/INSERTAR_ACTIVIDADES_PRUEBA.sql
```

### **3. Crear funciones SQL (opcional):**
```sql
\i sql/FUNCIONES_ACTIVIDADES_SIMPLIFICADO.sql
```

## 🎯 Resultado Esperado

**Después de seguir estos pasos deberías ver:**

1. **En la base de datos:**
   - Registros en PREMIACION con tipo 'actividad'
   - Relaciones en PREMIACION_EVENTO

2. **En la aplicación:**
   - Actividades listadas en `/admin/Actividades`
   - Endpoint `/api/actividades` devuelve datos

3. **En el debug:**
   - `/api/debug-premiaciones` muestra información completa

## 🚨 Posibles Problemas

### **Problema 1: No hay eventos**
```sql
-- Verificar si hay eventos
SELECT COUNT(*) FROM evento;

-- Si no hay eventos, crear uno de prueba
INSERT INTO evento (nombre, capacidad, direccion, entrada_paga, fecha_inicio, fecha_fin, estacionamiento, numero_entradas, precio_entradas, fk_tipo_evento, fk_lugar)
VALUES ('Evento Prueba', 100, 'Dirección Prueba', false, '2024-01-15', '2024-01-16', false, 100, 0, 1, 1);
```

### **Problema 2: Error de conexión**
- Verificar que la base de datos esté funcionando
- Verificar las credenciales en `db.ts`

### **Problema 3: Error de sintaxis SQL**
- Verificar que las tablas existan
- Verificar que los nombres de columnas sean correctos

## 🎉 ¡Listo!

Una vez que tengas datos en la tabla PREMIACION con tipo 'actividad', la aplicación debería funcionar correctamente.

**Acceso directo:** `/admin/Actividades` 