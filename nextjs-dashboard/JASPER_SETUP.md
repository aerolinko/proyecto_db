# Configuración de JasperReports para Reportes

Este documento explica cómo configurar y usar JasperReports Server para generar reportes PDF, Excel y CSV en tu aplicación Next.js.

## 🚀 Configuración Rápida

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Iniciar JasperReports Server

```bash
# Iniciar el servidor JasperReports con Docker
npm run jasper:start

# O usar el comando completo que incluye subida de plantillas
npm run jasper:setup
```

### 3. Acceder al Servidor

- **URL**: http://localhost:8080/jasperserver
- **Usuario**: admin
- **Contraseña**: admin123

## 📋 Requisitos Previos

- Docker y Docker Compose instalados
- Node.js 18+ y npm
- Puerto 8080 disponible

## 🔧 Configuración Detallada

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# JasperReports Server
JASPER_SERVER_URL=http://localhost:8080
JASPER_USERNAME=admin
JASPER_PASSWORD=admin123

# Base de datos (ya configurada)
DATABASE_URL=postgresql://postgres:root@localhost:5432/base_prueba
```

### Comandos Disponibles

```bash
# Iniciar JasperReports Server
npm run jasper:start

# Detener JasperReports Server
npm run jasper:stop

# Subir plantillas de reportes
npm run jasper:upload

# Configuración completa (iniciar + subir plantillas)
npm run jasper:setup
```

## 📊 Tipos de Reportes Disponibles

### 1. Reporte de Usuarios
- **Tipo**: `usuarios`
- **Parámetros**: `fechaInicio`, `fechaFin` (opcionales)
- **Formato**: PDF, Excel, CSV

### 2. Reporte de Empleados
- **Tipo**: `empleados`
- **Parámetros**: `lugarId` (opcional)
- **Formato**: PDF, Excel, CSV

### 3. Reporte de Ventas
- **Tipo**: `ventas`
- **Parámetros**: `fechaInicio`, `fechaFin` (opcionales)
- **Formato**: PDF, Excel, CSV

### 4. Reporte de Roles
- **Tipo**: `roles`
- **Parámetros**: Ninguno
- **Formato**: PDF, Excel, CSV

### 5. Reporte de Productos
- **Tipo**: `productos`
- **Parámetros**: Ninguno
- **Formato**: PDF, Excel, CSV

### 6. Reporte de Lugares
- **Tipo**: `lugares`
- **Parámetros**: Ninguno
- **Formato**: PDF, Excel, CSV

## 🔌 Uso en el Código

### API Endpoint

```typescript
// POST /api/jasper-reports
const response = await fetch('/api/jasper-reports', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reportType: 'usuarios',
    parameters: {
      fechaInicio: '2024-01-01',
      fechaFin: '2024-12-31'
    },
    format: 'pdf' // 'pdf', 'xlsx', 'csv'
  })
})
```

### Componente React

```tsx
import JasperReportGenerator from '@/ui/reports/JasperReportGenerator'

<JasperReportGenerator
  reportType="usuarios"
  parameters={{
    fechaInicio: '2024-01-01',
    fechaFin: '2024-12-31'
  }}
  onGenerate={(success, error) => {
    if (success) {
      console.log('Reporte generado exitosamente')
    } else {
      console.error('Error:', error)
    }
  }}
/>
```

## 📁 Estructura de Archivos

```
nextjs-dashboard/
├── jasper-reports/           # Plantillas JasperReports (.jrxml)
│   ├── usuarios.jrxml
│   ├── ventas.jrxml
│   └── ...
├── scripts/
│   └── upload-templates.js   # Script para subir plantillas
├── lib/
│   └── jasperService.ts      # Servicio de JasperReports
├── app/api/jasper-reports/
│   └── route.ts              # API endpoint
├── app/ui/reports/
│   └── JasperReportGenerator.tsx  # Componente React
├── docker-compose.yml        # Configuración Docker
└── JASPER_SETUP.md          # Este archivo
```

## 🛠️ Personalización de Plantillas

### Crear Nueva Plantilla

1. Crea un archivo `.jrxml` en `jasper-reports/`
2. Usa JasperSoft Studio para diseñar la plantilla
3. Sube la plantilla con: `npm run jasper:upload`

### Ejemplo de Plantilla Básica

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jasperReport xmlns="http://jasperreports.sourceforge.net/jasperreports"
              name="MiReporte" pageWidth="595" pageHeight="842">
    
    <parameter name="reportTitle" class="java.lang.String"/>
    <field name="campo1" class="java.lang.String"/>
    
    <title>
        <band height="50">
            <textField>
                <textFieldExpression>$P{reportTitle}</textFieldExpression>
            </textField>
        </band>
    </title>
    
    <detail>
        <band height="20">
            <textField>
                <textFieldExpression>$F{campo1}</textFieldExpression>
            </textField>
        </band>
    </detail>
</jasperReport>
```

## 🔍 Solución de Problemas

### JasperReports Server no inicia

```bash
# Verificar logs
docker-compose logs jasperserver

# Reiniciar servicios
docker-compose down
docker-compose up -d
```

### Error de conexión

1. Verificar que el puerto 8080 esté libre
2. Comprobar que Docker esté ejecutándose
3. Revisar las variables de entorno

### Plantillas no se suben

```bash
# Verificar conexión
curl http://localhost:8080/jasperserver/rest_v2/serverInfo

# Subir manualmente
npm run jasper:upload
```

### Reporte no se genera

1. Verificar que la plantilla existe en JasperReports Server
2. Comprobar los parámetros enviados
3. Revisar logs del servidor: `docker-compose logs jasperserver`

## 📚 Recursos Adicionales

- [Documentación JasperReports](https://community.jaspersoft.com/documentation)
- [JasperSoft Studio](https://community.jaspersoft.com/project/jaspersoft-studio)
- [Docker Compose](https://docs.docker.com/compose/)

## 🤝 Contribución

Para agregar nuevos tipos de reportes:

1. Crear la plantilla `.jrxml`
2. Agregar la función en `db.ts`
3. Actualizar el switch en `api/jasper-reports/route.ts`
4. Subir la plantilla con `npm run jasper:upload` 