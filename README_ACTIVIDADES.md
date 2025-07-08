# 📅 Sistema de Gestión de Actividades

## 🎯 ¿Dónde Ver Todas Mis Actividades?

### **Opción 1: Página Principal de Actividades**
1. **Navegar a**: `/admin/Actividades` (aparece en el menú lateral)
2. **Acceso directo**: Busca "Actividades" en el menú de navegación
3. **Funcionalidades**:
   - ✅ Ver todas las actividades
   - ✅ Crear nuevas actividades
   - ✅ Editar actividades existentes
   - ✅ Eliminar actividades
   - ✅ Filtrar por fecha, evento y búsqueda
   - ✅ Vista simple y completa

### **Opción 2: Desde Gestión de Eventos**
1. **Navegar a**: `/admin/GestionEventos`
2. **Seleccionar evento**: Hacer clic en cualquier evento
3. **Pestaña "Actividades"**: Ver actividades específicas del evento
4. **Crear actividad**: Usar el formulario para agregar actividades al evento

### **Opción 3: Botón "Nueva Actividad" en Gestión de Eventos**
1. **Navegar a**: `/admin/GestionEventos`
2. **Botón "Nueva Actividad"**: En la parte superior de la página
3. **Modal**: Seleccionar evento y crear actividad

## 🚀 Configuración Inicial

### **Paso 1: Ejecutar Scripts SQL**
```bash
# Conectar a tu base de datos PostgreSQL
psql -d tu_base_de_datos -U tu_usuario

# Ejecutar el script de funciones
\i sql/CREAR_FUNCIONES_ACTIVIDADES.sql

# Verificar que las funciones se crearon
SELECT routine_name FROM information_schema.routines WHERE routine_name LIKE '%actividad%';
```

### **Paso 2: Verificar Permisos**
- El enlace "Actividades" aparece automáticamente si tienes permisos de eventos
- Si no aparece, verifica que tu usuario tenga permisos de eventos o actividades

## 📋 Funcionalidades Disponibles

### **En la Página de Actividades (`/admin/Actividades`)**

#### **Vista Simple**
- Lista básica de actividades
- Información esencial: nombre, fecha, hora, evento, lugar
- Acciones rápidas: editar, eliminar

#### **Vista Completa**
- Información detallada de actividades
- Capacidad del evento, tipo de evento
- Más opciones de filtrado

#### **Filtros Disponibles**
- **Por fecha**: Seleccionar fecha específica
- **Por evento**: Filtrar por evento específico
- **Búsqueda**: Buscar por nombre de actividad, evento o lugar

#### **Acciones**
- **Crear**: Botón "Nueva Actividad" con modal
- **Editar**: Botón de edición en cada fila
- **Eliminar**: Botón de eliminación con confirmación

### **En Gestión de Eventos**

#### **Pestaña Actividades**
- Ver actividades específicas del evento
- Crear actividades directamente para el evento
- Eliminar actividades del evento

#### **Botón Nueva Actividad**
- Modal para crear actividad
- Selección de evento
- Formulario completo

## 🔧 Estructura de Datos

### **Tabla PREMIACION**
```sql
premiacion_id serial,
nombre varchar(50) NOT NULL,
fecha DATE NOT NULL,
hora_inicio time NOT NULL,
hora_fin time NOT NULL,
tipo varchar(50) NOT NULL
```

### **Tabla PREMIACION_EVENTO**
```sql
premiacion_evento_id serial,
fk_evento integer NOT NULL,
fk_premiacion integer NOT NULL
```

## 📊 Funciones SQL Disponibles

### **Funciones Principales**
```sql
-- Crear actividad
SELECT crear_actividad(1, 'Degustación', '2024-01-15', '14:00', '16:00');

-- Obtener actividades de un evento
SELECT * FROM obtener_actividades_evento(1);

-- Obtener todas las actividades
SELECT * FROM obtener_todas_actividades();

-- Actualizar actividad
SELECT actualizar_actividad(1, 'Nuevo nombre', '2024-01-15', '15:00', '17:00');

-- Eliminar actividad
SELECT eliminar_actividad(1);
```

### **Vistas Útiles**
```sql
-- Ver todas las actividades con información completa
SELECT * FROM vista_actividades_completas;

-- Ver actividades de hoy
SELECT * FROM vista_actividades_hoy;
```

## 🌐 Endpoints API

### **Obtener Actividades**
```http
GET /api/actividades
GET /api/actividades/completas
GET /api/eventos/{eventoId}/actividades
```

### **Crear Actividad**
```http
POST /api/actividades
POST /api/eventos/{eventoId}/actividades

{
  "nombre": "Degustación de cervezas",
  "fecha": "2024-01-15",
  "hora_inicio": "14:00",
  "hora_fin": "16:00",
  "evento_id": 1
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

## 🎨 Interfaz de Usuario

### **Componentes UI**
- **Cards**: Contenedores para información
- **Badges**: Estados de actividades (Hoy, Próxima, Finalizada)
- **Modals**: Formularios de creación y edición
- **Filtros**: Búsqueda y filtrado avanzado
- **Tablas**: Lista de actividades con acciones

### **Estados de Actividades**
- 🟢 **Próxima**: Actividad futura
- 🟡 **Hoy**: Actividad del día actual
- 🔴 **Finalizada**: Actividad pasada

## 🔍 Solución de Problemas

### **El enlace "Actividades" no aparece**
1. Verificar que tienes permisos de eventos
2. Verificar que las funciones SQL están creadas
3. Revisar la consola del navegador para errores

### **Error al cargar actividades**
1. Verificar conexión a la base de datos
2. Ejecutar el script SQL de funciones
3. Verificar que las tablas existen

### **Error al crear actividad**
1. Verificar que el evento existe
2. Verificar formato de fecha y hora
3. Revisar logs del servidor

## 📞 Soporte

Si tienes problemas:
1. Verificar que ejecutaste los scripts SQL
2. Revisar la consola del navegador
3. Verificar los logs del servidor
4. Confirmar que las funciones SQL están creadas

---

**¡Ya puedes ver todas tus actividades en `/admin/Actividades`!** 🎉 