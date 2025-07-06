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
  FunnelIcon,
  XMarkIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  CogIcon
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

export default function AdminOrdenes({ params }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('TODOS');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
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

  // Cargar todas las órdenes (para administradores)
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

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Actualizar estado de la orden
  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/ordenes/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Actualizar la orden en el estado local
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.venta_online_id === orderId 
              ? { ...order, estado: newStatus }
              : order
          )
        );
        showMessage('success', `Estado de la orden #${orderId} actualizado a "${ORDER_STATES[newStatus as keyof typeof ORDER_STATES]}"`);
      } else {
        showMessage('error', 'Error al actualizar el estado de la orden');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showMessage('error', 'Error al actualizar el estado de la orden');
    }
  };

  // Filtrar órdenes
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.venta_online_id.toString().includes(searchTerm) ||
      order.cliente_info.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.cliente_info.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.estado.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'TODOS' || order.estado === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('TODOS');
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
            <h1 className="text-3xl font-bold text-center">Administración de Órdenes Online</h1>
            <p className="text-center mt-2 text-blue-100">
              Gestión y seguimiento de todas las compras de la tienda online
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-4 mx-4 mt-4 rounded-lg text-center font-semibold
              ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}

          {/* Search and Filters Bar */}
          <div className="px-6 pt-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por número de orden, cliente o estado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
                />
              </div>

              {/* Filters Button */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FunnelIcon className="w-5 h-5" />
                  Filtros
                </button>

                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                  Limpiar
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Estado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="TODOS">Todos los estados</option>
                      {Object.entries(ORDER_STATES).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="px-6 pt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Mostrando {filteredOrders.length} de {orders.length} órdenes
              </p>
              <div className="flex gap-2 text-sm">
                {selectedStatus !== 'TODOS' && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Estado: {ORDER_STATES[selectedStatus as keyof typeof ORDER_STATES]}
                  </span>
                )}
              </div>
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
                  {searchTerm || selectedStatus !== 'TODOS' ? 'No se encontraron órdenes' : 'No hay órdenes registradas'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm || selectedStatus !== 'TODOS' 
                    ? 'Intenta con otros filtros de búsqueda' 
                    : 'Las órdenes aparecerán aquí cuando los clientes realicen compras'
                  }
                </p>
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

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderDetails(true);
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            <EyeIcon className="w-4 h-4" />
                            Ver Detalles
                          </button>

                          {/* Status Update Buttons */}
                          {order.estado === 'EN_PROCESO' && (
                            <button
                              onClick={() => updateOrderStatus(order.venta_online_id, 'LISTO_ENTREGA')}
                              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                            >
                              <TruckIcon className="w-4 h-4" />
                              Listo para Entrega
                            </button>
                          )}

                          {order.estado === 'LISTO_ENTREGA' && (
                            <button
                              onClick={() => updateOrderStatus(order.venta_online_id, 'ENTREGADO')}
                              className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                              Marcar como Entregado
                            </button>
                          )}

                          {order.estado !== 'ENTREGADO' && order.estado !== 'CANCELADO' && (
                            <button
                              onClick={() => updateOrderStatus(order.venta_online_id, 'CANCELADO')}
                              className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                            >
                              <ExclamationTriangleIcon className="w-4 h-4" />
                              Cancelar Orden
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Detalles de la Orden #{selectedOrder.venta_online_id}
                  </h2>
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Order Status */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-600">Estado actual:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATE_COLORS[selectedOrder.estado as keyof typeof STATE_COLORS]}`}>
                      <div className="flex items-center gap-1">
                        {STATE_ICONS[selectedOrder.estado as keyof typeof STATE_ICONS]}
                        {ORDER_STATES[selectedOrder.estado as keyof typeof ORDER_STATES]}
                      </div>
                    </span>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Información del Cliente</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-gray-500" />
                        <span><strong>Nombre:</strong> {selectedOrder.cliente_info.nombre}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 text-gray-500">📧</span>
                        <span><strong>Email:</strong> {selectedOrder.cliente_info.email}</span>
                      </div>
                      {selectedOrder.cliente_info.telefono && (
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="w-4 h-4 text-gray-500" />
                          <span><strong>Teléfono:</strong> {selectedOrder.cliente_info.telefono}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4 text-gray-500" />
                        <span><strong>Dirección:</strong> {selectedOrder.direccion}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Información de la Orden</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                        <span><strong>Fecha de emisión:</strong> {formatDate(selectedOrder.fecha_emision)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                        <span><strong>Fecha estimada:</strong> {formatDate(selectedOrder.fecha_estimada)}</span>
                      </div>
                      {selectedOrder.fecha_entrega && (
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-gray-500" />
                          <span><strong>Fecha de entrega:</strong> {formatDate(selectedOrder.fecha_entrega)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <CurrencyDollarIcon className="w-4 h-4 text-gray-500" />
                        <span><strong>Total:</strong> Bs. {selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Productos</h3>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Producto</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Presentación</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Precio Unit.</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Cantidad</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedOrder.productos.map((product, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm text-gray-800">{product.nombre_cerveza}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{product.presentacion}</td>
                            <td className="px-4 py-3 text-sm text-gray-800 text-right">Bs. {product.precio_unitario.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-gray-800 text-center">{product.cantidad}</td>
                            <td className="px-4 py-3 text-sm text-gray-800 text-right">Bs. {product.subtotal.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminProtection>
  );
} 