"use client"

import React, { useState, useEffect } from "react"
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  FunnelIcon
} from "@heroicons/react/24/outline"

interface Reporte {
  id: string
  titulo: string
  descripcion: string
  icono: string
  color: string
  filtros: string[]
}

interface FiltrosReporte {
  fechaInicio?: string
  fechaFin?: string
  limite?: number
}

export default function Reportes() {
  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null)
  const [datosReporte, setDatosReporte] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosReporte>({})
  const [searchTerm, setSearchTerm] = useState("")

  // Agrego este useEffect para autocargar el reporte de productos más vendidos
  useEffect(() => {
    if (
      reporteSeleccionado &&
      reporteSeleccionado.id === "1" && // Productos Más Vendidos
      datosReporte.length === 0 &&
      !loading
    ) {
      generarReporte(reporteSeleccionado);
    }
  }, [reporteSeleccionado]);

  // Solo un reporte: Productos más vendidos
  const reportesDisponibles: Reporte[] = [
    {
      id: "1",
      titulo: "Productos Más Vendidos",
      descripcion: "Lista de productos más vendidos en ventas online con estadísticas detalladas",
      icono: "📈",
      color: "blue",
      filtros: ["fechaInicio", "fechaFin", "limite"]
    },
    {
      id: "2",
      titulo: "Reposición de Anaqueles",
      descripcion: "Órdenes automáticas cuando el stock desciende a 20 unidades, con pasillo y zona",
      icono: "📦",
      color: "orange",
      filtros: ["fechaInicio", "fechaFin", "limite"]
    },
    {
      id: "3",
      titulo: "Cuotas de Afiliación Pendientes",
      descripcion: "Miembros ACAUCAB que aún no han cancelado su cuota mensual",
      icono: "💸",
      color: "green",
      filtros: []
    },
    {
      id: "4",
      titulo: "Nómina por Departamento/Cargo",
      descripcion: "Costo total de nómina incluyendo salarios y beneficios por departamento y cargo",
      icono: "💰",
      color: "purple",
      filtros: ["fechaInicio", "fechaFin", "limite"]
    },
    {
      id: "5",
      titulo: "Historial de Compras por Cliente Jurídico",
      descripcion: "Resumen detallado de todas las compras online realizadas por razón social específica",
      icono: "🏢",
      color: "indigo",
      filtros: ["fechaInicio", "fechaFin", "limite"]
    }
  ]

  const generarReporte = async (reporte: Reporte) => {
    setLoading(true)
    setError(null)
    setReporteSeleccionado(reporte)

    try {
      let params = new URLSearchParams()

      // Agregar filtros según el tipo de reporte
      if (reporte.id === "3") {
        // Para Cuotas de Afiliación, no enviar ningún filtro
        // params se mantiene vacío
      } else {
        // Para otros reportes, enviar todos los filtros
        if (filtros.fechaInicio) params.append("fechaInicio", filtros.fechaInicio)
        if (filtros.fechaFin) params.append("fechaFin", filtros.fechaFin)
        if (filtros.limite) params.append("limite", filtros.limite.toString())
      }

      // Determinar la URL de la API JSON según el tipo de reporte
      let apiUrl = ""
      switch (reporte.id) {
        case "1":
          apiUrl = `/api/reportes/productos-mas-vendidos-json?${params.toString()}`
          break
        case "2":
          apiUrl = `/api/reportes/reposicion-anaqueles-json?${params.toString()}`
          break
        case "3":
          apiUrl = `/api/reportes/cuotas-afiliacion-json?${params.toString()}`
          break
        case "4":
          apiUrl = `/api/reportes/nomina-departamento-json?${params.toString()}`
          break
        case "5":
          apiUrl = `/api/reportes/historial-compras-json?${params.toString()}`
          break
        default:
          throw new Error("Tipo de reporte no válido")
      }

      if (!apiUrl) return;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      let reporteData = []
      if (data.reporte) {
        reporteData = data.reporte
      } else if (data.data) {
        reporteData = data.data
      } else if (data.datos) {
        reporteData = data.datos
      } else if (Array.isArray(data)) {
        reporteData = data
      }
      setDatosReporte(reporteData)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido")
      setDatosReporte([])
    } finally {
      setLoading(false)
    }
  }

  const exportarReporte = () => {
    if (!datosReporte.length) return

    const csvContent = convertToCSV(datosReporte)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${reporteSeleccionado?.titulo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const convertToCSV = (data: any[]): string => {
    if (!data.length) return ""
    
    const headers = Object.keys(data[0])
    const csvRows = [headers.join(",")]
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header]
        return typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value
      })
      csvRows.push(values.join(","))
    }
    
    return csvRows.join("\n")
  }

  const limpiarFiltros = () => {
    setFiltros({})
    setSearchTerm("")
  }

  const reportesFiltrados = reportesDisponibles.filter(reporte =>
    reporte.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reporte.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const descargarPDF = async () => {
    if (!reporteSeleccionado) return

    let params = new URLSearchParams()
    if (filtros.fechaInicio) params.append("fechaInicio", filtros.fechaInicio)
    if (filtros.fechaFin) params.append("fechaFin", filtros.fechaFin)
    if (filtros.limite) params.append("limite", filtros.limite.toString())

    let apiUrl = ""
    switch (reporteSeleccionado.id) {
      case "1":
        apiUrl = `/api/reportes/productos-mas-vendidos?${params.toString()}`
        break
      case "2":
        apiUrl = `/api/reportes/reposicion-anaqueles?${params.toString()}`
        break
      case "3":
        apiUrl = `/api/reportes/cuotas-afiliacion?${params.toString()}`
        break
      case "4":
        apiUrl = `/api/reportes/nomina-departamento?${params.toString()}`
        break
      case "5":
        apiUrl = `/api/reportes/historial-compras?${params.toString()}`
        break
      default:
        return
    }

    const res = await fetch(apiUrl)
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    window.open(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Generando reporte...</p>
          <p className="text-sm text-gray-500 mt-2">Procesando datos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error al Generar Reporte</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => setError(null)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Sistema de Reportes</h1>

        {!reporteSeleccionado ? (
          <>
            {/* Barra de búsqueda */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar reportes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Grid de reportes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportesFiltrados.map((reporte) => (
                <div
                  key={reporte.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500"
                  onClick={() => generarReporte(reporte)}
                >
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">{reporte.icono}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{reporte.titulo}</h3>
                      <p className="text-sm text-gray-600">{reporte.descripcion}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <ChartBarIcon className="h-4 w-4 mr-1" />
                      <span>Generar Reporte</span>
                    </div>
                    <div className="flex space-x-1">
                      {reporte.filtros.map((filtro) => (
                        <span
                          key={filtro}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                        >
                          {filtro}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Enlace a Indicadores de Clientes */}
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-green-500">
                <a href="./Reportes/IndicadoresClientes" className="block">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">👥</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Indicadores de Clientes</h3>
                      <p className="text-sm text-gray-600">Dashboard con métricas de clientes nuevos vs recurrentes y tasa de retención</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <ChartBarIcon className="h-4 w-4 mr-1" />
                      <span>Ver Dashboard</span>
                    </div>
                    <div className="flex space-x-1">
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Dashboard
                      </span>
                    </div>
                  </div>
                </a>
              </div>

              {/* Enlace a Indicadores de Inventario y Operaciones */}
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500">
                <a href="./Reportes/IndicadoresInventarioOperaciones" className="block">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">📦</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Indicadores de Inventario y Operaciones</h3>
                      <p className="text-sm text-gray-600">Rotación de inventario, tasa de ruptura de stock y ventas por empleado</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <ChartBarIcon className="h-4 w-4 mr-1" />
                      <span>Ver Dashboard</span>
                    </div>
                    <div className="flex space-x-1">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Dashboard
                      </span>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            {reportesFiltrados.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-500 text-lg mb-4">
                  {searchTerm
                    ? `No se encontraron reportes que coincidan con "${searchTerm}"`
                    : "No hay reportes disponibles"}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Mostrar todos
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Header del reporte */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    onClick={() => setReporteSeleccionado(null)}
                    className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ← Volver
                  </button>
                  <span className="text-3xl mr-3">{reporteSeleccionado.icono}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{reporteSeleccionado.titulo}</h2>
                    <p className="text-gray-600">{reporteSeleccionado.descripcion}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={exportarReporte}
                    disabled={!datosReporte.length}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </button>
                  {/* Botón para exportar PDF para todos los reportes */}
                  <button
                    onClick={descargarPDF}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Filtros del reporte */}
            {reporteSeleccionado.filtros.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FunnelIcon className="h-5 w-5 mr-2" />
                  Filtros
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reporteSeleccionado.filtros.includes("fechaInicio") && (
                    <input
                      type="date"
                      placeholder="Fecha inicio"
                      value={filtros.fechaInicio || ""}
                      onChange={(e) => setFiltros(prev => ({ ...prev, fechaInicio: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  {reporteSeleccionado.filtros.includes("fechaFin") && (
                    <input
                      type="date"
                      placeholder="Fecha fin"
                      value={filtros.fechaFin || ""}
                      onChange={(e) => setFiltros(prev => ({ ...prev, fechaFin: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  {reporteSeleccionado.filtros.includes("limite") && (
                    <input
                      type="number"
                      placeholder="Límite de productos (ej: 10)"
                      value={filtros.limite || ""}
                      onChange={(e) => setFiltros(prev => ({ ...prev, limite: e.target.value ? Number(e.target.value) : undefined }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={limpiarFiltros}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Limpiar filtros
                  </button>
                  <button
                    onClick={() => generarReporte(reporteSeleccionado)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Aplicar Filtros
                  </button>
                </div>
              </div>
            )}

            {/* Resultados del reporte */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Resultados ({datosReporte.length} registros)
                </h3>
              </div>
              <div className="p-6">
                {datosReporte.length > 0 ? (
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <div className="min-w-max">
                      <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {Object.keys(datosReporte[0])
                              .filter(header => header !== 'precio_promedio' && header !== 'precio_promedio_ponderado')
                              .map((header) => (
                                <th
                                  key={header}
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                >
                                  {header === 'precio'
                                    ? 'Precio'
                                    : header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {datosReporte.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              {Object.entries(row)
                                .filter(([header]) => header !== 'precio_promedio' && header !== 'precio_promedio_ponderado')
                                .map(([header, value], cellIndex) => (
                                  <td
                                    key={cellIndex}
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                  >
                                    {header === 'precio' && value !== null && value !== undefined && !isNaN(Number(value))
                                      ? `$ ${Number(value).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                      : ['ingresos_totales', 'monto_pendiente', 'cuota_mensual', 'ultimo_pago_monto'].includes(header) && value !== null && value !== undefined && !isNaN(Number(value))
                                        ? `$ ${Number(value).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                        : typeof value === "number"
                                          ? value.toLocaleString()
                                          : (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}T/))
                                            ? new Date(value).toLocaleDateString('es-VE')
                                            : String(value || '')}
                                  </td>
                                ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📊</div>
                    <p className="text-gray-500 text-lg mb-4">
                      No se encontraron datos para este reporte
                    </p>
                    <p className="text-sm text-gray-400">
                      Intenta ajustar los filtros o verificar la conexión a la base de datos
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 