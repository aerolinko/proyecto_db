# 📅 Sistema de Actividades Simplificado

## 🎯 ¿Qué son las Actividades?

Las **actividades** en tu sistema son **PREMIACIONES** con tipo "actividad" en la base de datos. Son eventos específicos que se realizan dentro de los eventos principales.

## 🚀 Configuración Rápida

### **1. Ejecutar Script SQL**
```bash
# Conectar a tu base de datos PostgreSQL
psql -d tu_base_de_datos -U tu_usuario

# Ejecutar funciones simplificadas
\i sql/FUNCIONES_ACTIVIDADES_SIMPLIFICADO.sql
```

### **2. Verificar Funciones**
```sql
-- Verificar que las funciones existen
SELECT routine_name FROM information_schema.routines WHERE routine_name LIKE '%actividad%';
```

## 🎯 ¿Dónde Ver Mis Actividades?

### **Página Principal**: `/admin/Actividades`
- **Aparece en**: Menú lateral como "Actividades" con ícono de reloj
- **Muestra**: Todas las premiaciones con tipo "actividad"
- **Funcionalidades**: Ver, crear, editar, eliminar, filtrar

## 📋 Funcionalidades Disponibles

### **✅ Ver Actividades**
- Lista todas las premiaciones con tipo "actividad"
- Muestra nombre, fecha, hora, evento y lugar
- Estados visuales: Próxima, Hoy, Finalizada

### **✅ Crear Actividades**
- Botón "Nueva Actividad" en la página principal
- Formulario simple con campos esenciales
- Se guarda como premiación con tipo "actividad"

### **✅ Editar Actividades**
- Botón de edición en cada actividad
- Modal para modificar datos
- Actualiza la premiación existente

### **✅ Eliminar Actividades**
- Botón de eliminación con confirmación
- Elimina la premiación de la base de datos

### **✅ Filtrar y Buscar**
- Búsqueda por nombre, evento o lugar
- Filtro por fecha específica
- Filtro por evento específico
- Botón para limpiar filtros

## 🔧 Estructura de Datos

### **Tabla PREMIACION** (donde se guardan las actividades)
```sql
premiacion_id serial,
nombre varchar(50) NOT NULL,        -- Nombre de la actividad
fecha DATE NOT NULL,                -- Fecha de la actividad
hora_inicio time NOT NULL,          -- Hora de inicio
hora_fin time NOT NULL,             -- Hora de fin
tipo varchar(50) NOT NULL           -- Siempre 'actividad'
```

### **Tabla PREMIACION_EVENTO** (relación con eventos)
```sql
premiacion_evento_id serial,
fk_evento integer NOT NULL,         -- ID del evento
fk_premiacion integer NOT NULL      -- ID de la premiación (actividad)
```

## 📊 Funciones SQL Disponibles

```sql
-- Obtener todas las actividades
SELECT * FROM obtener_todas_actividades();

-- Obtener actividades de un evento
SELECT * FROM obtener_actividades_evento(1);

-- Crear nueva actividad
SELECT crear_actividad(1, 'Degustación', '2024-01-15', '14:00', '16:00');

-- Actualizar actividad
SELECT actualizar_actividad(1, 'Nuevo nombre', '2024-01-15', '15:00', '17:00');

-- Eliminar actividad
SELECT eliminar_actividad(1);
```

## 🌐 Endpoints API

### **Obtener Actividades**
```http
GET /api/actividades
```

### **Crear Actividad**
```http
POST /api/eventos/{eventoId}/actividades
{
  "nombre": "Degustación de cervezas",
  "fecha": "2024-01-15",
  "hora_inicio": "14:00",
  "hora_fin": "16:00"
}
```

### **Actualizar Actividad**
```http
PUT /api/actividades/{id}
{
  "nombre": "Nuevo nombre",
  "fecha": "2024-01-15",
  "hora_inicio": "15:00",
  "hora_fin": "17:00"
}
```

### **Eliminar Actividad**
```http
DELETE /api/actividades/{id}
```

## 🎨 Interfaz Simplificada

### **Página Principal**
- **Header**: Título y botón "Nueva Actividad"
- **Filtros**: Búsqueda, fecha, evento, limpiar
- **Lista**: Actividades en formato de tarjetas
- **Acciones**: Editar y eliminar en cada actividad

### **Modales**
- **Crear**: Formulario simple con campos esenciales
- **Editar**: Mismo formulario con datos precargados

## 🔍 Verificación de Funcionamiento

### **1. Verificar Funciones SQL**
```sql
SELECT routine_name FROM information_schema.routines WHERE routine_name LIKE '%actividad%';
```

### **2. Verificar Datos**
```sql
-- Ver premiaciones con tipo 'actividad'
SELECT * FROM premiacion WHERE tipo = 'actividad';

-- Ver relación con eventos
SELECT p.nombre, e.nombre as evento_nombre 
FROM premiacion p 
JOIN premiacion_evento pe ON p.premiacion_id = pe.fk_premiacion 
JOIN evento e ON pe.fk_evento = e.evento_id 
WHERE p.tipo = 'actividad';
```

### **3. Probar Funciones**
```sql
-- Obtener todas las actividades
SELECT * FROM obtener_todas_actividades();

-- Crear actividad de prueba
SELECT crear_actividad(1, 'Prueba', '2024-01-15', '14:00', '16:00');
```

## 🎉 Resultado Final

**¡Sistema simplificado y funcional!**

- ✅ **Sin vistas complejas** - Solo una vista simple
- ✅ **Funciona con PREMIACIONES** - Tu estructura real de datos
- ✅ **Interfaz limpia** - Sin confusión
- ✅ **Funciones SQL básicas** - Solo lo necesario
- ✅ **CRUD completo** - Crear, leer, actualizar, eliminar

**Acceso directo**: `/admin/Actividades` 🎯

---

**¡Ya puedes ver y gestionar todas tus actividades (premiaciones) de forma simple y directa!** 