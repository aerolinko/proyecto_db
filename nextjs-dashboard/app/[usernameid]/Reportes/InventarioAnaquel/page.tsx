"use client";
import React, { useEffect, useState } from 'react';
import { Squares2X2Icon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function InventarioAnaquel() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  let userId = '';
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    userId = pathname.split('/')[1];
  }

  useEffect(() => {
    fetch('/api/reportes/stock-anaquel')
      .then(res => res.json())
      .then(data => {
        if (data.success) setStock(data.stock);
        else setError(data.error || 'Error desconocido');
        setLoading(false);
      })
      .catch(err => {
        setError('Error de red');
        setLoading(false);
      });
  }, []);

  const total = stock.reduce((acc, item) => acc + (item.cantidad || 0), 0);

  if (loading) return <div className="text-center py-8">Cargando inventario de anaquel...</div>;
  if (error) return <div className="text-center text-red-500 py-8">Error: {error}</div>;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6 justify-between">
        <Link href={`/${userId}/Reportes/InventarioResumen`} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
          <ArrowLeftIcon className="w-5 h-5" />
          Volver a Inventario
        </Link>
        <div className="flex items-center gap-3 justify-center flex-1">
          <Squares2X2Icon className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Inventario de Anaquel</h1>
        </div>
        <div className="w-32" />
      </div>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-blue-600 text-white sticky top-0 z-10">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">Cerveza</th>
              <th className="py-3 px-4 text-left font-semibold">Material</th>
              <th className="py-3 px-4 text-left font-semibold">Volumen (ml)</th>
              <th className="py-3 px-4 text-right font-semibold">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {stock.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-6 text-gray-500">No hay stock registrado.</td></tr>
            ) : (
              stock.map((item, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50 hover:bg-blue-50' : 'hover:bg-blue-50'}>
                  <td className="py-2 px-4 text-gray-900 font-medium">{item.nombre_cerveza}</td>
                  <td className="py-2 px-4">{item.material}</td>
                  <td className="py-2 px-4">{item.cap_volumen}</td>
                  <td className="py-2 px-4 text-right font-semibold">{item.cantidad}</td>
                </tr>
              ))
            )}
          </tbody>
          {stock.length > 0 && (
            <tfoot>
              <tr className="bg-blue-100">
                <td colSpan={3} className="py-2 px-4 text-right font-bold">Total</td>
                <td className="py-2 px-4 text-right font-bold">{total}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
} 