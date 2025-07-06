'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/ui/cashboard/card';
import { Button } from '@/app/ui/button';
import { CalendarIcon, TrendingUpIcon, ShoppingCartIcon, PackageIcon, BeerIcon, BarChart3Icon } from 'lucide-react';

interface IndicadorVentas {
  tipo_tienda?: string;
  total_ventas?: number;
  cantidad_ventas?: number;
  ticket_promedio?: number;
  porcentaje_total?: number;
  periodo_actual?: string;
  periodo_anterior?: string;
  ventas_actuales?: number;
  ventas_anteriores?: number;
  crecimiento_absoluto?: number;
  crecimiento_porcentual?: number;
  venta_minima?: number;
  venta_maxima?: number;
  mediana?: number;
  total_unidades?: number;
  total_ingresos?: number;
  precio_promedio_unitario?: number;
  cantidad_productos_diferentes?: number;
  top_productos?: any[];
  estilo_cerveza_id?: number;
  nombre_estilo?: string;
  total_unidades_vendidas?: number;
  porcentaje_participacion?: number;
  ranking?: number;
  indicador?: string;
  valor?: number;
  descripcion?: string;
  unidad?: string;
}

export default function IndicadoresVentas() {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [periodo, setPeriodo] = useState('mes');
  const [indicadores, setIndicadores] = useState<IndicadorVentas[]>([]);
  const [loading, setLoading] = useState(false);
  const [tipoIndicador, setTipoIndicador] = useState('resumen-general');

  const cargarIndicadores = async (tipo: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        tipo: tipo,
        ...(fechaInicio && { fechaInicio }),
        ...(fechaFin && { fechaFin }),
        ...(periodo && { periodo }),
      });

      const response = await fetch(`/api/indicadores-ventas?${params}`);
      const data = await response.json();

      if (response.ok) {
        setIndicadores(data.data);
      } else {
        console.error('Error al cargar indicadores:', data.error);
      }
    } catch (error) {
      console.error('Error al cargar indicadores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarIndicadores(tipoIndicador);
  }, [tipoIndicador, fechaInicio, fechaFin, periodo]);

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2
    }).format(valor);
  };

  const formatearNumero = (valor: number) => {
    return new Intl.NumberFormat('es-VE').format(valor);
  };

  const renderIndicador = () => {
    switch (tipoIndicador) {
      case 'ventas-totales':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            {indicadores.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCartIcon className="h-5 w-5" />
                    {item.tipo_tienda}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Ventas:</span>
                      <span className="font-bold">{formatearMoneda(item.total_ventas || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cantidad Ventas:</span>
                      <span className="font-bold">{formatearNumero(item.cantidad_ventas || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ticket Promedio:</span>
                      <span className="font-bold">{formatearMoneda(item.ticket_promedio || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Porcentaje:</span>
                      <span className="font-bold">{item.porcentaje_total?.toFixed(2)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'crecimiento':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            {indicadores.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUpIcon className="h-5 w-5" />
                    {item.tipo_tienda}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      <div>Período Actual: {item.periodo_actual}</div>
                      <div>Período Anterior: {item.periodo_anterior}</div>
                    </div>
                    <div className="flex justify-between">
                      <span>Ventas Actuales:</span>
                      <span className="font-bold">{formatearMoneda(item.ventas_actuales || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ventas Anteriores:</span>
                      <span className="font-bold">{formatearMoneda(item.ventas_anteriores || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Crecimiento:</span>
                      <span className={`font-bold ${(item.crecimiento_porcentual || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.crecimiento_porcentual?.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'ticket-promedio':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            {indicadores.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3Icon className="h-5 w-5" />
                    {item.tipo_tienda}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Ticket Promedio:</span>
                      <span className="font-bold text-lg">{formatearMoneda(item.ticket_promedio || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cantidad Ventas:</span>
                      <span className="font-bold">{formatearNumero(item.cantidad_ventas || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Venta Mínima:</span>
                      <span className="font-bold">{formatearMoneda(item.venta_minima || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Venta Máxima:</span>
                      <span className="font-bold">{formatearMoneda(item.venta_maxima || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mediana:</span>
                      <span className="font-bold">{formatearMoneda(item.mediana || 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'volumen-unidades':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            {indicadores.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PackageIcon className="h-5 w-5" />
                    {item.tipo_tienda}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Unidades:</span>
                      <span className="font-bold text-lg">{formatearNumero(item.total_unidades || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Ingresos:</span>
                      <span className="font-bold">{formatearMoneda(item.total_ingresos || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Precio Promedio:</span>
                      <span className="font-bold">{formatearMoneda(item.precio_promedio_unitario || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Productos Diferentes:</span>
                      <span className="font-bold">{formatearNumero(item.cantidad_productos_diferentes || 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'estilos-cerveza':
        return (
          <div className="space-y-4">
            {indicadores.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BeerIcon className="h-5 w-5" />
                    #{item.ranking} - {item.nombre_estilo}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatearNumero(item.total_unidades_vendidas || 0)}</div>
                      <div className="text-sm text-gray-600">Unidades Vendidas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatearMoneda(item.total_ingresos || 0)}</div>
                      <div className="text-sm text-gray-600">Total Ingresos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatearMoneda(item.precio_promedio_unitario || 0)}</div>
                      <div className="text-sm text-gray-600">Precio Promedio</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{item.porcentaje_participacion?.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">Participación</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'resumen-general':
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {indicadores.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-sm">{item.indicador}</CardTitle>
                  <CardDescription>{item.descripcion}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {item.unidad === 'Bs.' ? formatearMoneda(item.valor || 0) : formatearNumero(item.valor || 0)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      default:
        return <div>Selecciona un tipo de indicador</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Indicadores de Ventas</h2>
        
        {/* Controles */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Tipo de Indicador</label>
            <select
              value={tipoIndicador}
              onChange={(e) => setTipoIndicador(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="resumen-general">Resumen General</option>
              <option value="ventas-totales">Ventas Totales por Tienda</option>
              <option value="crecimiento">Crecimiento de Ventas</option>
              <option value="ticket-promedio">Ticket Promedio</option>
              <option value="volumen-unidades">Volumen de Unidades</option>
              <option value="estilos-cerveza">Ventas por Estilo de Cerveza</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Fecha Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="border rounded-md px-3 py-2"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Fecha Fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="border rounded-md px-3 py-2"
            />
          </div>

          {tipoIndicador === 'crecimiento' && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Período</label>
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="mes">Mes</option>
                <option value="trimestre">Trimestre</option>
                <option value="año">Año</option>
              </select>
            </div>
          )}

          <Button
            onClick={() => cargarIndicadores(tipoIndicador)}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            {loading ? 'Cargando...' : 'Actualizar'}
          </Button>
        </div>
      </div>

      {/* Contenido */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Cargando indicadores...</div>
          </div>
        ) : (
          renderIndicador()
        )}
      </div>
    </div>
  );
} 