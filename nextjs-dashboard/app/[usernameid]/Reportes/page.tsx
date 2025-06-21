"use client"

import { useState, useEffect } from "react"

interface ReportParameters {
  reportType: string
  fechaInicio?: string
  fechaFin?: string
  lugarId?: number
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
  { value: "usuarios", label: "Usuarios", description: "Reporte de usuarios registrados" },
  { value: "empleados", label: "Empleados", description: "Reporte de empleados por lugar" },
  { value: "ventas", label: "Ventas", description: "Reporte de ventas por período" },
  { value: "roles", label: "Roles", description: "Reporte de roles del sistema" },
  { value: "productos", label: "Productos", description: "Reporte de productos disponibles" },
  { value: "lugares", label: "Lugares", description: "Reporte de lugares registrados" },
]

export default function ReportesPage({ params }: { params: { username: string } }) {
  const [parameters, setParameters] = useState<ReportParameters>({
    reportType: "usuarios",
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
    if (!parameters.reportType) {
      setError("Por favor selecciona un tipo de reporte")
      return
    }

    // Validar fechas si son requeridas
    const needsDateRange = ["usuarios", "ventas"].includes(parameters.reportType)
    if (needsDateRange && (!parameters.fechaInicio || !parameters.fechaFin)) {
      setError("Por favor selecciona el rango de fechas")
      return
    }

    setIsGenerating(true)
    setError(null)
    setReportData(null)
    setDebugInfo(null)

    try {
      console.log("Generando reporte con parámetros:", parameters)

      const response = await fetch("/api/reportes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportType: parameters.reportType,
          parameters,
        }),
      })

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
      console.error("Error:", error)
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

  const needsDateRange = ["usuarios", "ventas"].includes(parameters.reportType)
  const needsLocation = parameters.reportType === "empleados"

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

        {/* Formulario de generación */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">📊 Generador de Reportes</h2>

          <div className="space-y-6">
            {/* Selección de tipo de reporte */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tipo de Reporte</label>
              <select
                value={parameters.reportType}
                onChange={(e) => setParameters({ ...parameters, reportType: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {reportTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Parámetros de fecha */}
            {needsDateRange && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">📅 Fecha Inicio</label>
                  <input
                    type="date"
                    value={parameters.fechaInicio || ""}
                    onChange={(e) => setParameters({ ...parameters, fechaInicio: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">📅 Fecha Fin</label>
                  <input
                    type="date"
                    value={parameters.fechaFin || ""}
                    onChange={(e) => setParameters({ ...parameters, fechaFin: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Selección de lugar */}
            {needsLocation && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">📍 Lugar (Opcional)</label>
                <select
                  value={parameters.lugarId?.toString() || ""}
                  onChange={(e) =>
                    setParameters({
                      ...parameters,
                      lugarId: e.target.value ? Number.parseInt(e.target.value) : undefined,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los lugares</option>
                  {lugares.map((lugar) => (
                    <option key={lugar.lugar_id} value={lugar.lugar_id.toString()}>
                      {lugar.nombre} {lugar.tipo && `(${lugar.tipo})`}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">{lugares.length} lugares disponibles</p>
              </div>
            )}

            {/* Botón generar */}
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating || !parameters.reportType}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Generando Reporte...
                </>
              ) : (
                <>📊 Generar Reporte</>
              )}
            </button>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center gap-2">
                  <span className="text-red-500">⚠️</span>
                  <p className="text-red-700 font-medium">Error</p>
                </div>
                <p className="text-red-600 mt-1">{error}</p>
              </div>
            )}
          </div>
        </div>

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
