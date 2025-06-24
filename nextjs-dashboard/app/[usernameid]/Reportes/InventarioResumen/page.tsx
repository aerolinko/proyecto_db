"use client";
import React from 'react';
import Link from 'next/link';
import { ArchiveBoxIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

const opciones = [
  {
    nombre: 'Almacén',
    descripcion: 'Stock actual en almacén',
    href: 'InventarioAlmacen',
    icon: ArchiveBoxIcon,
  },
  {
    nombre: 'Anaquel',
    descripcion: 'Stock actual en anaqueles',
    href: 'InventarioAnaquel',
    icon: Squares2X2Icon,
  },
];

export default function InventarioResumen({ params }) {
  // Extraer el userId de la ruta actual
  let userId = '';
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    userId = pathname.split('/')[1];
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Inventario</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {opciones.map((op) => {
          const Icon = op.icon;
          return (
            <Link
              key={op.nombre}
              href={`/${userId}/Reportes/${op.href}`}
              className="group flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300 bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-500 hover:bg-blue-50 h-full min-h-[180px]"
            >
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 mb-4">
                <Icon className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors mb-2">{op.nombre}</h3>
              <p className="text-sm text-gray-500 group-hover:text-blue-500 transition-colors text-center">{op.descripcion}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
} 