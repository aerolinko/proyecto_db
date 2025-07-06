"use client";

import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ShoppingBagIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

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

export default function Ordenes({ params }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasConsultPermission, setHasConsultPermission] = useState(false);

  // Extraer el userId de la ruta actual
  let userId = '';
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    userId = pathname.split('/')[1];
  }

  // Obtener información del usuario actual y cargar órdenes según permisos
  useEffect(() => {
    const fetchCurrentUserAndOrders = async () => {
      try {
        const response = await fetch(`/api/usuarios/current?userId=${userId}`);
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData.data);
          const permisos = userData.data?.permisos || [];
          // Verificar si tiene el permiso de consultar VENTA_ONLINE (robusto)
          const hasPerm = permisos.some((p: any) =>
            (p.descripcion || '')
              .toLowerCase()
              .replace(/[_\s]/g, '')
              .includes('consultarventaonline')
          );
          setHasConsultPermission(hasPerm);
          
          // Siempre consulta solo las órdenes del usuario actual
          const ordersResponse = await fetch(`/api/ventas-online?userId=${userId}`);
          if (ordersResponse.ok) {
            const data = await ordersResponse.json();
            setOrders(data.orders || []);
          } else {
            setOrders([]);
          }
        }
      } catch (error) {
        console.error('Error fetching user or orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchCurrentUserAndOrders();
    }
  }, [userId]);

  const filteredOrders = orders.filter(order => 
    order.venta_online_id.toString().includes(searchTerm) ||
    order.fecha_emision.includes(searchTerm) ||
    order.estado.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Debug: Verificar órdenes
  console.log('Orders:', orders);
  console.log('Filtered Orders:', filteredOrders);
  console.log('Has consult permission:', hasConsultPermission);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'entregado':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'en camino':
        return <TruckIcon className="w-5 h-5 text-blue-500" />;
      case 'pendiente':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'cancelado':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'entregado':
        return 'bg-green-100 text-green-800';
      case 'en camino':
        return 'bg-blue-100 text-blue-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 border border-blue-200">
          {/* Header Section */}
          <div className="bg-blue-700 p-6 text-white">
            <h1 className="text-3xl font-bold text-center">
              Mis Órdenes Online
            </h1>
            <p className="text-center mt-2 text-blue-100">
              Historial de todas tus compras realizadas en la tienda online
            </p>
          </div>

          {/* Search Bar */}
          <div className="px-6 pt-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por número de orden, fecha o estado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
              />
            </div>
          </div>

          {/* Orders Section */}
          <div className="p-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <ShoppingBagIcon className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {searchTerm ? 'No se encontraron órdenes' : 'No tienes órdenes aún'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm 
                    ? 'Intenta con otros términos de búsqueda' 
                    : 'Realiza tu primera compra en la tienda online'
                  }
                </p>
                {!searchTerm && (
                  <Link
                    href={`/${userId}/tienda-online/catalogo`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ir a la Tienda Online
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order, index) => (
                  <div key={`order-${order.venta_online_id}-${index}`} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-800">
                            Orden #{order.venta_online_id}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.estado)}`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(order.estado)}
                              {order.estado}
                            </div>
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            <span>Fecha: {formatDate(order.fecha_emision)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CurrencyDollarIcon className="w-4 h-4" />
                            <span>Total: ${order.total.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TruckIcon className="w-4 h-4" />
                            <span>Entrega: {formatDate(order.fecha_estimada)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">
                            <strong>Dirección:</strong> {order.direccion}
                          </p>
                          {hasConsultPermission && order.cliente_info && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                              <UserIcon className="w-4 h-4" />
                              <span><strong>Cliente:</strong> {order.cliente_info.nombre}</span>
                              {order.cliente_info.telefono && (
                                <span>• <strong>Tel:</strong> {order.cliente_info.telefono}</span>
                              )}
                              <span>• <strong>Email:</strong> {order.cliente_info.email}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <EyeIcon className="w-4 h-4" />
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Detalles de la Orden #{selectedOrder.venta_online_id}
                </h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Información de la Orden</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Número:</strong> #{selectedOrder.venta_online_id}</p>
                      <p><strong>Fecha de Emisión:</strong> {formatDate(selectedOrder.fecha_emision)}</p>
                      <p><strong>Fecha Estimada de Entrega:</strong> {formatDate(selectedOrder.fecha_estimada)}</p>
                      {selectedOrder.fecha_entrega && (
                        <p><strong>Fecha de Entrega:</strong> {formatDate(selectedOrder.fecha_entrega)}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Estado y Dirección</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span><strong>Estado:</strong></span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.estado)}`}>
                          {selectedOrder.estado}
                        </span>
                      </div>
                      <p><strong>Dirección de Entrega:</strong></p>
                      <p className="text-gray-700">{selectedOrder.direccion}</p>
                      {hasConsultPermission && selectedOrder.cliente_info && (
                        <div className="mt-2">
                          <p><strong>Cliente:</strong> {selectedOrder.cliente_info.nombre}</p>
                          {selectedOrder.cliente_info.telefono && (
                            <p><strong>Teléfono:</strong> {selectedOrder.cliente_info.telefono}</p>
                          )}
                          <p><strong>Email:</strong> {selectedOrder.cliente_info.email}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Products List */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">Productos</h3>
                <div className="space-y-3">
                  {selectedOrder.productos.map((item, index) => (
                    <div key={`${item.detalle_venta_online_id}-${item.nombre_cerveza}-${index}`} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{item.nombre_cerveza}</h4>
                        <p className="text-sm text-gray-600">{item.presentacion}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
                        <p className="font-medium text-gray-800">${item.subtotal.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 