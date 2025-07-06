import IndicadoresVentas from '@/app/ui/dashboard/IndicadoresVentas';

export default function IndicadoresVentasPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Indicadores de Ventas</h1>
        <p className="text-gray-600 mt-2">
          Análisis completo de las ventas de la empresa, incluyendo métricas por tienda, crecimiento, ticket promedio y más.
        </p>
      </div>
      
      <IndicadoresVentas />
    </div>
  );
} 