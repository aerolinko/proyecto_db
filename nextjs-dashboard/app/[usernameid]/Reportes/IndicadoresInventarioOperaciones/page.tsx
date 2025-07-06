"use client"

import React, { useState, useEffect } from "react"
import { 
  CubeIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline"

interface VentasEmpleado {
  empleado_id: number
  nombre_completo: string
  total_ventas: number
  cantidad_ventas: number
  promedio_venta: number
}

interface IndicadoresInventarioOperaciones {
  rotacion_inventario: {
    rotacion_inventario: number
    costo_productos_vendidos: number
    valor_promedio_inventario: number
  }
  tasa_ruptura_stock: {
    tasa_ruptura_stock: number
    productos_sin_stock: number
    total_productos: number
  }
  ventas_por_empleado: VentasEmpleado[]
  periodo: {
    fecha_inicio: string
    fecha_fin: string
  }
}

export default function IndicadoresInventarioOperaciones() {
  const [indicadores, setIndicadores] = useState<IndicadoresInventarioOperaciones | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: ""
  })

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

      const response = await fetch(`/api/reportes/indicadores-inventario-operaciones?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setIndicadores(data.data)
      } else {
        throw new Error(data.error || "Error al obtener indicadores")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const aplicarFiltros = () => cargarIndicadores()
  const limpiarFiltros = () => {
    setFiltros({ fechaInicio: "", fechaFin: "" })
    setTimeout(() => cargarIndicadores(), 100)
  }

  const exportarReporte = () => {
    if (!indicadores) return
    const csvContent = `Indicador,Valor\nRotación de Inventario,${indicadores.rotacion_inventario.rotacion_inventario}\nTasa de Ruptura de Stock,${indicadores.tasa_ruptura_stock.tasa_ruptura_stock}%\nEmpleados Activos,${indicadores.ventas_por_empleado.length}`
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `Indicadores_Inventario_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard de Indicadores de Inventario y Operaciones</h2>
        <button
          onClick={exportarReporte}
          disabled={!indicadores}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
          Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center space-x-4 mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold">Filtros de Período</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin</label>
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando indicadores...</span>
        </div>
      )}

      {indicadores && !loading && (
        <div className="space-y-6">
          {/* Información del período */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Período: {indicadores.periodo.fecha_inicio} - {indicadores.periodo.fecha_fin}
              </span>
            </div>
          </div>

          {/* Tarjetas principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Rotación de Inventario */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CubeIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rotación de Inventario</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {indicadores.rotacion_inventario.rotacion_inventario}
                  </p>
                  <p className="text-sm text-gray-500">Veces por período</p>
                </div>
              </div>
            </div>

            {/* Tasa de Ruptura de Stock */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tasa de Ruptura de Stock</p>
                  <p className="text-2xl font-bold text-red-600">
                    {indicadores.tasa_ruptura_stock.tasa_ruptura_stock}%
                  </p>
                  <p className="text-sm text-gray-500">
                    {indicadores.tasa_ruptura_stock.productos_sin_stock} de {indicadores.tasa_ruptura_stock.total_productos} productos
                  </p>
                </div>
              </div>
            </div>

            {/* Total Empleados */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <UserGroupIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Empleados Activos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {indicadores.ventas_por_empleado.length}
                  </p>
                  <p className="text-sm text-purple-600">Con ventas registradas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de ventas por empleado */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Ventas por Empleado</h3>
            {indicadores.ventas_por_empleado.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empleado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Ventas</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad Ventas</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Promedio por Venta</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {indicadores.ventas_por_empleado.map((empleado) => (
                      <tr key={empleado.empleado_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {empleado.nombre_completo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${empleado.total_ventas.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {empleado.cantidad_ventas}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${empleado.promedio_venta.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay datos de ventas por empleado disponibles</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 