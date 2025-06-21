"use client"

import { useState, useEffect } from "react"

interface ReportParameters {
  reportType: string
  fechaInicio?: string
  fechaFin?: string
  lugarId?: number
  clienteId?: number
}

interface Lugar {
  lugar_id: number
  nombre: string
  tipo?: string
}

interface ReportData {
  success: boolean
  reportTitle: string
  columns: string[]
  data: any[]
  totalRecords: number
  generatedAt: string
  parameters: any
}

const reportTypes = [
  {
    value: "productos-mayor-demanda",
    label: "Productos con Mayor Demanda",
    description: "Lista los productos de cerveza con mayor volumen de ventas",
    parameters: ["fechaInicio", "fechaFin"]
  },
  {
    value: "reposicion-anaqueles",
    label: "Reposición de Anaqueles",
    description: "Órdenes automáticas cuando el stock desciende a 20 unidades",
    parameters: ["fechaInicio", "fechaFin"]
  },
  {
    value: "cuotas-afiliacion-pendientes",
    label: "Cuotas de Afiliación Pendientes",
    description: "Miembros proveedores con cuotas mensuales pendientes",
    parameters: []
  },
  {
    value: "nomina-departamento",
    label: "Nómina por Departamento",
    description: "Costo total de nómina por departamento y cargo",
    parameters: ["fechaInicio", "fechaFin"]
  },
  {
    value: "historial-compras-cliente-juridico",
    label: "Historial de Compras Cliente Jurídico",
    description: "Resumen detallado de compras por razón social",
    parameters: ["clienteId", "fechaInicio", "fechaFin"]
  }
]

export default function ReportesPage({ params }: { params: { username: string } }) {
  const [parameters, setParameters] = useState<ReportParameters>({
    reportType: "productos-mayor-demanda",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [lugares, setLugares] = useState<Lugar[]>([])
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    fetchLugares()
  }, [])

  const fetchLugares = async () => {
    try {
      console.log("Cargando lugares...")
      const response = await fetch("/api/reportes")
      const data = await response.json()

      console.log("Respuesta lugares:", data)

      if (data.success) {
        setLugares(data.lugares || [])
        console.log("Lugares cargados:", data.lugares?.length || 0)
      } else {
        console.error("Error cargando lugares:", data.error)
      }
    } catch (error) {
      console.error("Error cargando lugares:", error)
    }
  }

  const handleGenerateReport = async () => {
    console.log("=== INICIO handleGenerateReport ===")
    console.log("Parámetros actuales:", parameters)
    
    if (!parameters.reportType) {
      setError("Por favor selecciona un tipo de reporte")
      return
    }

    // Validar parámetros según el tipo de reporte seleccionado
    const selectedReportType = reportTypes.find(rt => rt.value === parameters.reportType)
    console.log("Tipo de reporte seleccionado:", selectedReportType)
    
    if (!selectedReportType) {
      console.error("Tipo de reporte no encontrado en reportTypes:", parameters.reportType)
      setError("Tipo de reporte no válido")
      return
    }

    // Validar fechas si son requeridas
    if (selectedReportType.parameters.includes("fechaInicio") && (!parameters.fechaInicio || !parameters.fechaFin)) {
      setError("Por favor selecciona el rango de fechas")
      return
    }

    // Validar clienteId si es requerido
    if (selectedReportType.parameters.includes("clienteId") && !parameters.clienteId) {
      setError("Por favor ingresa el ID del cliente jurídico")
      return
    }

    setIsGenerating(true)
    setError(null)
    setReportData(null)
    setDebugInfo(null)

    try {
      console.log("Generando reporte con parámetros:", parameters)
      console.log("URL del endpoint: /api/jasper-reports")

      const requestBody = {
        reportType: parameters.reportType,
        parameters,
      }
      console.log("Cuerpo de la petición:", JSON.stringify(requestBody, null, 2))

      const response = await fetch("/api/jasper-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("Respuesta recibida, status:", response.status)
      const data = await response.json()
      console.log("Respuesta del servidor:", data)

      setDebugInfo(data)

      if (data.success) {
        setReportData(data)
        console.log("Reporte generado exitosamente:", data.totalRecords, "registros")
      } else {
        throw new Error(data.error || "Error generando reporte")
      }
    } catch (error) {
      console.error("Error en handleGenerateReport:", error)
      setError(`Error generando el reporte: ${(error as Error).message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadCSV = () => {
    if (!reportData) return

    const csvContent = [
      reportData.columns.join(","),
      ...reportData.data.map((row) =>
        reportData.columns
          .map((col) => {
            const value = row[col] || ""
            return `"${String(value).replace(/"/g, '""')}"`
          })
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${parameters.reportType}_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const formatColumnName = (columnName: string) => {
    return columnName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const formatCellValue = (value: any) => {
    if (value === null || value === undefined) return "-"
    if (typeof value === "boolean") return value ? "Sí" : "No"
    if (typeof value === "object" && value instanceof Date) {
      return value.toLocaleDateString()
    }
    if (typeof value === "string" && value.includes("T") && value.includes("Z")) {
      // Probablemente es una fecha ISO
      try {
        return new Date(value).toLocaleDateString()
      } catch {
        return value
      }
    }
    return String(value)
  }

  // Obtener el objeto del tipo de reporte seleccionado
  const selectedReportType = reportTypes.find(rt => rt.value === parameters.reportType) || reportTypes[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Reportes</h1>
          <p className="text-gray-600 mt-2">
            Usuario: <span className="font-medium">{params.username}</span>
          </p>
          <p className="text-gray-500 text-sm">Genera y descarga reportes detallados del sistema</p>
        </div>

        {/* Debug Info */}
        {debugInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">🔍 Información de Debug</h3>
            <div className="text-sm text-blue-800">
              <p>
                <strong>Estado:</strong> {debugInfo.success ? "Exitoso" : "Error"}
              </p>
              <p>
                <strong>Registros:</strong> {debugInfo.totalRecords || 0}
              </p>
              <p>
                <strong>Columnas:</strong> {debugInfo.columns?.join(", ") || "N/A"}
              </p>
              {debugInfo.error && (
                <p>
                  <strong>Error:</strong> {debugInfo.error}
                </p>
              )}
              {debugInfo.details && (
                <p>
                  <strong>Detalles:</strong> {debugInfo.details}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Formulario de selección de reporte y parámetros */}
        <form
          className="bg-white border rounded-lg p-6 mb-8 flex flex-col gap-4"
          onSubmit={e => { e.preventDefault(); handleGenerateReport(); }}
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <label className="font-medium">Tipo de reporte:</label>
            <select
              className="border rounded px-3 py-2"
              value={parameters.reportType}
              onChange={e => setParameters({ ...parameters, reportType: e.target.value })}
            >
              {reportTypes.map(rt => (
                <option key={rt.value} value={rt.value}>{rt.label}</option>
              ))}
            </select>
            <span className="text-gray-500 text-sm">{selectedReportType.description}</span>
          </div>

          {/* Campos dinámicos según el tipo de reporte */}
          {selectedReportType.parameters.includes("fechaInicio") && (
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <label className="font-medium">Fecha inicio:</label>
              <input
                type="date"
                className="border rounded px-3 py-2"
                value={parameters.fechaInicio || ""}
                onChange={e => setParameters({ ...parameters, fechaInicio: e.target.value })}
              />
              <label className="font-medium">Fecha fin:</label>
              <input
                type="date"
                className="border rounded px-3 py-2"
                value={parameters.fechaFin || ""}
                onChange={e => setParameters({ ...parameters, fechaFin: e.target.value })}
              />
            </div>
          )}

          {selectedReportType.parameters.includes("clienteId") && (
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <label className="font-medium">ID Cliente Jurídico:</label>
              <input
                type="number"
                className="border rounded px-3 py-2"
                value={parameters.clienteId || ""}
                onChange={e => setParameters({ ...parameters, clienteId: Number(e.target.value) })}
                min={1}
              />
              <span className="text-gray-500 text-xs">(ID numérico de la razón social)</span>
            </div>
          )}

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
            disabled={isGenerating}
          >
            {isGenerating ? "Generando..." : "Generar Reporte"}
          </button>
          {error && <div className="text-red-600 font-medium">{error}</div>}
        </form>

        {/* Resultados del reporte */}
        {reportData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{reportData.reportTitle}</h3>
                <p className="text-gray-600">{reportData.totalRecords} registros encontrados</p>
                <p className="text-sm text-gray-500">Generado el {new Date(reportData.generatedAt).toLocaleString()}</p>
              </div>
              <button
                onClick={downloadCSV}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                📥 Descargar CSV
              </button>
            </div>

            {/* Tabla de datos */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    {reportData.columns.map((column, index) => (
                      <th key={index} className="border border-gray-300 px-4 py-3 text-left font-medium text-gray-900">
                        {formatColumnName(column)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.slice(0, 20).map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {reportData.columns.map((column, colIndex) => (
                        <td key={colIndex} className="border border-gray-300 px-4 py-3 text-gray-700">
                          {formatCellValue(row[column])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {reportData.data.length > 20 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-blue-800 text-sm">
                    📋 Mostrando los primeros 20 registros de {reportData.totalRecords}. Descarga el archivo CSV para
                    ver todos los datos.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información del sistema */}
        <div className="mt-6 bg-gray-100 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">ℹ️ Información del Sistema</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>Base de datos:</strong> PostgreSQL (Datos reales)
            </p>
            <p>
              <strong>Reportes disponibles:</strong> Usuarios, Empleados, Ventas, Roles, Productos, Lugares
            </p>
            <p>
              <strong>Formatos de exportación:</strong> CSV
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
