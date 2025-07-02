"use client"

import React, { useState, useEffect } from "react"
import { 
  ChartBarIcon, 
  UsersIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline"

interface IndicadoresClientes {
  clientes_nuevos_vs_recurrentes: {
    total_clientes_periodo: number
    clientes_nuevos: number
    clientes_recurrentes: number
  }
  tasa_retencion: {
    clientes_periodo_anterior: number
    clientes_periodo_actual: number
    clientes_retornados: number
    tasa_retencion: number
  }
  periodo: {
    fecha_inicio: string
    fecha_fin: string
  }
}

export default function IndicadoresClientes() {
  const [indicadores, setIndicadores] = useState<IndicadoresClientes | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: ""
  })

  // Cargar indicadores al montar el componente
  useEffect(() => {
    cargarIndicadores()
  }, [])

  const cargarIndicadores = async () => {
    setLoading(true)
    setError(null)

    try {
      let params = new URLSearchParams()
      if (filtros.fechaInicio) params.append("fechaInicio", filtros.fechaInicio)
      if (filtros.fechaFin) params.append("fechaFin", filtros.fechaFin)

      const response = await fetch(`/api/reportes/indicadores-clientes?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success) {
        setIndicadores(data.data)
      } else {
        throw new Error(data.error || "Error al obtener indicadores")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido")
      setIndicadores(null)
    } finally {
      setLoading(false)
    }
  }

  const aplicarFiltros = () => {
    cargarIndicadores()
  }

  const limpiarFiltros = () => {
    setFiltros({ fechaInicio: "", fechaFin: "" })
    setTimeout(() => cargarIndicadores(), 100)
  }

  const exportarReporte = () => {
    if (!indicadores) return

    const csvContent = convertToCSV(indicadores)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `Indicadores_Clientes_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const convertToCSV = (data: IndicadoresClientes): string => {
    const rows = [
      ["Indicador", "Valor"],
      ["Total Clientes Período", data.clientes_nuevos_vs_recurrentes.total_clientes_periodo],
      ["Clientes Nuevos", data.clientes_nuevos_vs_recurrentes.clientes_nuevos],
      ["Clientes Recurrentes", data.clientes_nuevos_vs_recurrentes.clientes_recurrentes],
      ["Tasa de Retención (%)", data.tasa_retencion.tasa_retencion],
      ["Clientes Período Anterior", data.tasa_retencion.clientes_periodo_anterior],
      ["Clientes Período Actual", data.tasa_retencion.clientes_periodo_actual],
      ["Clientes Retornados", data.tasa_retencion.clientes_retornados],
      ["Período Inicio", data.periodo.fecha_inicio],
      ["Período Fin", data.periodo.fecha_fin]
    ]
    
    return rows.map(row => row.join(",")).join("\n")
  }

  const calcularPorcentajeNuevos = () => {
    if (!indicadores || indicadores.clientes_nuevos_vs_recurrentes.total_clientes_periodo === 0) return 0
    return Math.round((indicadores.clientes_nuevos_vs_recurrentes.clientes_nuevos / indicadores.clientes_nuevos_vs_recurrentes.total_clientes_periodo) * 100)
  }

  const calcularPorcentajeRecurrentes = () => {
    if (!indicadores || indicadores.clientes_nuevos_vs_recurrentes.total_clientes_periodo === 0) return 0
    return Math.round((indicadores.clientes_nuevos_vs_recurrentes.clientes_recurrentes / indicadores.clientes_nuevos_vs_recurrentes.total_clientes_periodo) * 100)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard de Indicadores de Clientes</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={exportarReporte}
            disabled={!indicadores}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center space-x-4 mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold">Filtros de Período</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Inicio
            </label>
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Fin
            </label>
            <input
              type="date"
              value={filtros.fechaFin}
              onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              onClick={aplicarFiltros}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Cargando..." : "Aplicar"}
            </button>
            <button
              onClick={limpiarFiltros}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando indicadores...</span>
        </div>
      )}

      {/* Indicadores */}
      {indicadores && !loading && (
        <div className="space-y-6">
          {/* Información del período */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Período de análisis: {indicadores.periodo.fecha_inicio} - {indicadores.periodo.fecha_fin}
              </span>
            </div>
          </div>

          {/* Tarjetas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Clientes */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UsersIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {indicadores.clientes_nuevos_vs_recurrentes.total_clientes_periodo}
                  </p>
                </div>
              </div>
            </div>

            {/* Clientes Nuevos */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UsersIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Clientes Nuevos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {indicadores.clientes_nuevos_vs_recurrentes.clientes_nuevos}
                  </p>
                  <p className="text-sm text-green-600">
                    {calcularPorcentajeNuevos()}% del total
                  </p>
                </div>
              </div>
            </div>

            {/* Clientes Recurrentes */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <UsersIcon className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Clientes Recurrentes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {indicadores.clientes_nuevos_vs_recurrentes.clientes_recurrentes}
                  </p>
                  <p className="text-sm text-orange-600">
                    {calcularPorcentajeRecurrentes()}% del total
                  </p>
                </div>
              </div>
            </div>

            {/* Tasa de Retención */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ArrowTrendingUpIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tasa de Retención</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {indicadores.tasa_retencion.tasa_retencion}%
                  </p>
                  <p className="text-sm text-purple-600">
                    {indicadores.tasa_retencion.clientes_retornados} de {indicadores.tasa_retencion.clientes_periodo_anterior}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos y detalles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribución de clientes */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Distribución de Clientes</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Clientes Nuevos</span>
                    <span>{calcularPorcentajeNuevos()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${calcularPorcentajeNuevos()}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Clientes Recurrentes</span>
                    <span>{calcularPorcentajeRecurrentes()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full" 
                      style={{ width: `${calcularPorcentajeRecurrentes()}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalles de retención */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Detalles de Retención</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Clientes período anterior:</span>
                  <span className="font-medium">{indicadores.tasa_retencion.clientes_periodo_anterior}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Clientes período actual:</span>
                  <span className="font-medium">{indicadores.tasa_retencion.clientes_periodo_actual}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Clientes retornados:</span>
                  <span className="font-medium text-green-600">{indicadores.tasa_retencion.clientes_retornados}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tasa de retención:</span>
                  <span className="font-medium text-purple-600">{indicadores.tasa_retencion.tasa_retencion}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen ejecutivo */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Resumen Ejecutivo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Clientes Nuevos vs Recurrentes</h4>
                <p className="text-gray-600 text-sm">
                  En el período analizado, se registraron {indicadores.clientes_nuevos_vs_recurrentes.total_clientes_periodo} clientes en total. 
                  De estos, {indicadores.clientes_nuevos_vs_recurrentes.clientes_nuevos} son nuevos ({calcularPorcentajeNuevos()}%) 
                  y {indicadores.clientes_nuevos_vs_recurrentes.clientes_recurrentes} son recurrentes ({calcularPorcentajeRecurrentes()}%).
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tasa de Retención</h4>
                <p className="text-gray-600 text-sm">
                  La tasa de retención de clientes es del {indicadores.tasa_retencion.tasa_retencion}%. 
                  Esto significa que de los {indicadores.tasa_retencion.clientes_periodo_anterior} clientes que compraron 
                  en el período anterior, {indicadores.tasa_retencion.clientes_retornados} volvieron a comprar en el período actual.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 