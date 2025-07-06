"use client"

import React, { useState, useEffect } from "react"
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CubeIcon
} from "@heroicons/react/24/outline"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

// Registrar los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface VentasPorTienda {
  tipo_tienda: string
  total_ventas: number
  cantidad_ventas: number
}

interface CrecimientoVentas {
  periodo_actual_total: number
  periodo_anterior_total: number
  crecimiento_dolares: number
  crecimiento_porcentual: number
  periodo_actual_inicio: string
  periodo_actual_fin: string
  periodo_anterior_inicio: string
  periodo_anterior_fin: string
}

interface TicketPromedio {
  ticket_promedio_tienda: number
  ticket_promedio_online: number
  ticket_promedio_general: number
  total_ventas_tienda: number
  total_ventas_online: number
}

interface VolumenUnidades {
  unidades_tienda: number
  unidades_online: number
  total_unidades: number
}

interface VentasPorEstilo {
  estilo_cerveza_id: number
  nombre_estilo: string
  unidades_vendidas: number
  total_ventas: number
  porcentaje_ventas: number
}

interface TendenciaVentas {
  fecha: string
  ventas_tienda_fisica: number
  ventas_tienda_online: number
  total_ventas: number
}

interface ResumenCanales {
  tienda_fisica: {
    total_ventas: number
    cantidad_ventas: number
    porcentaje: number
  }
  tienda_online: {
    total_ventas: number
    cantidad_ventas: number
    porcentaje: number
  }
}

interface DatosTendencia {
  tendencia_ventas: TendenciaVentas[]
  resumen_canales: ResumenCanales
  periodo: {
    fecha_inicio: string
    fecha_fin: string
  }
}

interface IndicadoresVentas {
  ventas_por_tienda: VentasPorTienda[]
  crecimiento_ventas: CrecimientoVentas
  ticket_promedio: TicketPromedio
  volumen_unidades: VolumenUnidades
  ventas_por_estilo: VentasPorEstilo[]
  periodo: {
    fecha_inicio: string
    fecha_fin: string
  }
}

export default function IndicadoresVentas() {
  const [indicadores, setIndicadores] = useState<IndicadoresVentas | null>(null)
  const [datosTendencia, setDatosTendencia] = useState<DatosTendencia | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: ""
  })

  useEffect(() => {
    cargarIndicadores()
    cargarTendenciaVentas()
  }, [])

  const cargarIndicadores = async () => {
    setLoading(true)
    setError(null)
    try {
      let params = new URLSearchParams()
      if (filtros.fechaInicio) params.append("fechaInicio", filtros.fechaInicio)
      if (filtros.fechaFin) params.append("fechaFin", filtros.fechaFin)
      const response = await fetch(`/api/reportes/indicadores-ventas?${params.toString()}`)
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

  const cargarTendenciaVentas = async () => {
    try {
      let params = new URLSearchParams()
      if (filtros.fechaInicio) params.append("fechaInicio", filtros.fechaInicio)
      if (filtros.fechaFin) params.append("fechaFin", filtros.fechaFin)
      const response = await fetch(`/api/reportes/tendencia-ventas?${params.toString()}`)
      const data = await response.json()
      if (data.success) {
        setDatosTendencia(data.data)
      } else {
        console.error("Error al cargar tendencia:", data.error)
      }
    } catch (error) {
      console.error("Error al cargar tendencia de ventas:", error)
    }
  }

  const aplicarFiltros = () => {
    cargarIndicadores()
    cargarTendenciaVentas()
  }
  const limpiarFiltros = () => {
    setFiltros({ fechaInicio: "", fechaFin: "" })
    setTimeout(() => {
      cargarIndicadores()
      cargarTendenciaVentas()
    }, 100)
  }

  const exportarReporte = () => {
    if (!indicadores) return
    const rows = [
      ["Indicador", "Valor"],
      ["Ventas Totales Tienda Física", indicadores.ventas_por_tienda.find(v => v.tipo_tienda === 'Tienda Física')?.total_ventas ?? 0],
      ["Ventas Totales Tienda Online", indicadores.ventas_por_tienda.find(v => v.tipo_tienda === 'Tienda Online')?.total_ventas ?? 0],
      ["Crecimiento Ventas (%)", indicadores.crecimiento_ventas.crecimiento_porcentual],
      ["Crecimiento Ventas ($)", indicadores.crecimiento_ventas.crecimiento_dolares],
      ["Ticket Promedio General", indicadores.ticket_promedio.ticket_promedio_general],
      ["Volumen Total Unidades", indicadores.volumen_unidades.total_unidades],
      ["Período Inicio", indicadores.periodo.fecha_inicio],
      ["Período Fin", indicadores.periodo.fecha_fin]
    ]
    const csvContent = rows.map(row => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `Indicadores_Ventas_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(valor)
  }

  const formatearNumero = (valor: number) => {
    return new Intl.NumberFormat('es-VE').format(valor)
  }

  // Función para crear datos del gráfico de tendencia
  const crearDatosTendencia = () => {
    if (!datosTendencia?.tendencia_ventas) return null

    const fechas = datosTendencia.tendencia_ventas.map(item => {
      const fecha = new Date(item.fecha)
      return fecha.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit' })
    })

    return {
      labels: fechas,
      datasets: [
        {
          label: 'Tienda Física',
          data: datosTendencia.tendencia_ventas.map(item => item.ventas_tienda_fisica),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Tienda Online',
          data: datosTendencia.tendencia_ventas.map(item => item.ventas_tienda_online),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Total',
          data: datosTendencia.tendencia_ventas.map(item => item.total_ventas),
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          fill: false,
          tension: 0.4
        }
      ]
    }
  }

  // Función para crear datos del gráfico de canales
  const crearDatosCanales = () => {
    if (!datosTendencia?.resumen_canales) return null

    return {
      labels: ['Tienda Física', 'Tienda Online'],
      datasets: [
        {
          data: [
            datosTendencia.resumen_canales.tienda_fisica.total_ventas,
            datosTendencia.resumen_canales.tienda_online.total_ventas
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)'
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(59, 130, 246)'
          ],
          borderWidth: 2
        }
      ]
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard de Indicadores de Ventas</h2>
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

      {/* Tarjetas de métricas principales */}
      {indicadores && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Ventas Totales */}
          <div className="bg-white p-6 rounded-lg shadow flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-4">
              <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Ventas Totales</p>
              <p className="text-2xl font-bold text-green-600">
                {formatearMoneda(indicadores.ventas_por_tienda.reduce((sum, v) => sum + v.total_ventas, 0))}
              </p>
              <p className="text-sm text-gray-500">
                {indicadores.ventas_por_tienda.reduce((sum, v) => sum + v.cantidad_ventas, 0)} ventas
              </p>
            </div>
          </div>
          {/* Crecimiento de Ventas */}
          <div className="bg-white p-6 rounded-lg shadow flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-4">
              <ArrowTrendingUpIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Crecimiento</p>
              <p className="text-2xl font-bold text-blue-600">
                {indicadores.crecimiento_ventas.crecimiento_porcentual}%
              </p>
              <p className="text-sm text-gray-500">
                {formatearMoneda(indicadores.crecimiento_ventas.crecimiento_dolares)}
              </p>
            </div>
          </div>
          {/* Ticket Promedio */}
          <div className="bg-white p-6 rounded-lg shadow flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg mr-4">
              <ShoppingCartIcon className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Ticket Promedio</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatearMoneda(indicadores.ticket_promedio.ticket_promedio_general)}
              </p>
              <p className="text-sm text-gray-500">Por venta</p>
            </div>
          </div>
          {/* Volumen de Unidades */}
          <div className="bg-white p-6 rounded-lg shadow flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg mr-4">
              <CubeIcon className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Unidades Vendidas</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatearNumero(indicadores.volumen_unidades.total_unidades)}
              </p>
              <p className="text-sm text-gray-500">Botellas/Latas</p>
            </div>
          </div>
        </div>
      )}

      {/* Desglose por tipo de tienda */}
      {indicadores && (
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="w-6 h-6 text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Desglose por Tipo de Tienda</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tienda Física */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-800">Tienda Física</h4>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Ventas:</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {formatearMoneda(indicadores.ventas_por_tienda.find(v => v.tipo_tienda === 'Tienda Física')?.total_ventas ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cantidad Ventas:</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {indicadores.ventas_por_tienda.find(v => v.tipo_tienda === 'Tienda Física')?.cantidad_ventas ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ticket Promedio:</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {formatearMoneda(indicadores.ticket_promedio.ticket_promedio_tienda)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Unidades Vendidas:</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {formatearNumero(indicadores.volumen_unidades.unidades_tienda)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tienda Online */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-blue-800">Tienda Online</h4>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CurrencyDollarIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-blue-600">Total Ventas:</span>
                  <span className="text-sm font-semibold text-blue-800">
                    {formatearMoneda(indicadores.ventas_por_tienda.find(v => v.tipo_tienda === 'Tienda Online')?.total_ventas ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-600">Cantidad Ventas:</span>
                  <span className="text-sm font-semibold text-blue-800">
                    {indicadores.ventas_por_tienda.find(v => v.tipo_tienda === 'Tienda Online')?.cantidad_ventas ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-600">Ticket Promedio:</span>
                  <span className="text-sm font-semibold text-blue-800">
                    {formatearMoneda(indicadores.ticket_promedio.ticket_promedio_online)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-600">Unidades Vendidas:</span>
                  <span className="text-sm font-semibold text-blue-800">
                    {formatearNumero(indicadores.volumen_unidades.unidades_online)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráficos */}
      {datosTendencia && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Gráfico de Tendencia de Ventas */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <ArrowTrendingUpIcon className="w-6 h-6 text-gray-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Tendencia de Ventas</h3>
            </div>
            {crearDatosTendencia() ? (
              <div className="h-80">
                <Line
                  data={crearDatosTendencia()!}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: false,
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.dataset.label}: ${formatearMoneda(context.parsed.y)}`
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return formatearMoneda(Number(value))
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No hay datos de tendencia disponibles</p>
            )}
          </div>

          {/* Gráfico de Ventas por Canal */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <ChartBarIcon className="w-6 h-6 text-gray-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Ventas por Canal de Distribución</h3>
            </div>
            {crearDatosCanales() ? (
              <div className="h-80 flex items-center justify-center">
                <div className="w-64 h-64">
                  <Doughnut
                    data={crearDatosCanales()!}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom' as const,
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
                              const porcentaje = ((context.parsed / total) * 100).toFixed(1)
                              return `${context.label}: ${formatearMoneda(context.parsed)} (${porcentaje}%)`
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No hay datos de canales disponibles</p>
            )}
            
            {/* Resumen de canales */}
            {datosTendencia.resumen_canales && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatearMoneda(datosTendencia.resumen_canales.tienda_fisica.total_ventas)}
                  </div>
                  <div className="text-sm text-gray-600">Tienda Física</div>
                  <div className="text-xs text-gray-500">
                    {datosTendencia.resumen_canales.tienda_fisica.porcentaje}% del total
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatearMoneda(datosTendencia.resumen_canales.tienda_online.total_ventas)}
                  </div>
                  <div className="text-sm text-gray-600">Tienda Online</div>
                  <div className="text-xs text-gray-500">
                    {datosTendencia.resumen_canales.tienda_online.porcentaje}% del total
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabla de ventas por estilo de cerveza */}
      {indicadores && (
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="w-6 h-6 text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Ventas por Estilo de Cerveza</h3>
          </div>
          {indicadores.ventas_por_estilo.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay datos de ventas por estilo de cerveza</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estilo de Cerveza
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unidades Vendidas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Ventas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % del Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {indicadores.ventas_por_estilo.map((estilo, index) => (
                    <tr key={estilo.estilo_cerveza_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {estilo.nombre_estilo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatearNumero(estilo.unidades_vendidas)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatearMoneda(estilo.total_ventas)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {estilo.porcentaje_ventas}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {indicadores && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Resumen Ejecutivo</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              • <strong>Ventas Totales:</strong> Se generaron {formatearMoneda(indicadores.ventas_por_tienda.reduce((sum, v) => sum + v.total_ventas, 0))}
              en {indicadores.ventas_por_tienda.reduce((sum, v) => sum + v.cantidad_ventas, 0)} transacciones durante el período analizado.
            </p>
            <p>
              • <strong>Crecimiento:</strong> Las ventas {indicadores.crecimiento_ventas.crecimiento_porcentual >= 0 ? 'crecieron' : 'disminuyeron'}
              un {Math.abs(indicadores.crecimiento_ventas.crecimiento_porcentual)}% ({formatearMoneda(Math.abs(indicadores.crecimiento_ventas.crecimiento_dolares))})
              comparado con el período anterior.
            </p>
            <p>
              • <strong>Ticket Promedio:</strong> El valor promedio por venta fue de {formatearMoneda(indicadores.ticket_promedio.ticket_promedio_general)},
              con {indicadores.ticket_promedio.total_ventas_tienda} ventas en tienda física y {indicadores.ticket_promedio.total_ventas_online} ventas online.
            </p>
            <p>
              • <strong>Volumen:</strong> Se vendieron {formatearNumero(indicadores.volumen_unidades.total_unidades)} unidades de cerveza
              ({formatearNumero(indicadores.volumen_unidades.unidades_tienda)} en tienda física, {formatearNumero(indicadores.volumen_unidades.unidades_online)} online).
            </p>
            {indicadores.ventas_por_estilo.length > 0 && (
              <p>
                • <strong>Estilos Destacados:</strong> El estilo más vendido fue "{indicadores.ventas_por_estilo[0]?.nombre_estilo}"
                con {indicadores.ventas_por_estilo[0]?.porcentaje_ventas}% del total de ventas.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 