"use client";

import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon,
  MapPinIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import AdminProtection from '../../ui/admin/AdminProtection';

interface Order {
  venta_online_id: number;
  fecha_emision: string;
  fecha_estimada: string;
  fecha_entrega?: string;
  total: number;
  direccion: string;
  estado: string;
  usuario_id: number;
  cliente_info: {
    nombre: string;
    telefono?: string;
    email: string;
  };
  productos: OrderItem[];
}

interface OrderItem {
  detalle_venta_online_id: number;
  nombre_cerveza: string;
  presentacion: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
}

// Estados de las órdenes
const ORDER_STATES = {
  'EN_PROCESO': 'En proceso',
  'LISTO_ENTREGA': 'Listo para entrega',
  'ENTREGADO': 'Entregado',
  'CANCELADO': 'Cancelado'
};

// Colores para cada estado
const STATE_COLORS = {
  'EN_PROCESO': 'bg-yellow-100 text-yellow-800',
  'LISTO_ENTREGA': 'bg-blue-100 text-blue-800',
  'ENTREGADO': 'bg-green-100 text-green-800',
  'CANCELADO': 'bg-red-100 text-red-800'
};

// Iconos para cada estado
const STATE_ICONS = {
  'EN_PROCESO': <ClockIcon className="w-5 h-5 text-yellow-500" />,
  'LISTO_ENTREGA': <TruckIcon className="w-5 h-5 text-blue-500" />,
  'ENTREGADO': <CheckCircleSolid className="w-5 h-5 text-green-500" />,
  'CANCELADO': <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
};

export default function AdminOrdenes({ params }: { params: any }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Extraer el userId de la ruta actual
  let userId = '';
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    userId = pathname.split('/')[1];
  }

  // Obtener información del usuario actual
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`/api/usuarios/${userId}`);
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData.user);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    if (userId) {
      fetchCurrentUser();
    }
  }, [userId]);

  // Cargar todas las órdenes
  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const response = await fetch('/api/admin/ordenes');
        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders || []);
        } else {
          console.error('Error fetching orders:', response.status);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllOrders();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AdminProtection currentUser={currentUser}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 border border-blue-200">
            {/* Header Section */}
            <div className="bg-blue-700 p-6 text-white">
              <h1 className="text-3xl font-bold text-center">Órdenes de Venta Online</h1>
              <p className="text-center mt-2 text-blue-100">
                Todas las órdenes de la tienda online
              </p>
            </div>

            {/* Orders Section */}
            <div className="p-6">
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <CheckCircleIcon className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No hay órdenes registradas
                  </h3>
                  <p className="text-gray-500">
                    Las órdenes aparecerán aquí cuando los clientes realicen compras
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <div key={`order-${order.venta_online_id}-${index}`} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Order Info */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-800">
                              Orden #{order.venta_online_id}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATE_COLORS[order.estado as keyof typeof STATE_COLORS]}`}>
                              <div className="flex items-center gap-1">
                                {STATE_ICONS[order.estado as keyof typeof STATE_ICONS]}
                                {ORDER_STATES[order.estado as keyof typeof ORDER_STATES]}
                              </div>
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4" />
                              <span>Fecha: {formatDate(order.fecha_emision)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CurrencyDollarIcon className="w-4 h-4" />
                              <span>Total: Bs. {order.total.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-4 h-4" />
                              <span>Cliente: {order.cliente_info.nombre}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPinIcon className="w-4 h-4" />
                              <span className="truncate">Dir: {order.direccion}</span>
                            </div>
                          </div>

                          {/* Products Summary */}
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Productos:</h4>
                            <div className="space-y-1">
                              {order.productos.map((product, idx) => (
                                <div key={idx} className="text-sm text-gray-600">
                                  • {product.nombre_cerveza} - {product.presentacion} x{product.cantidad} = Bs. {product.subtotal.toFixed(2)}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminProtection>
  );
} 