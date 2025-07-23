"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCartIcon, 
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  CreditCardIcon,
  TrashIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  UserIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Evento {
  evento_id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  direccion: string;
  capacidad: number;
  precio_entradas: number;
  entrada_paga: boolean;
  tipo_evento_nombre: string;
  lugar_nombre: string;
  estado_evento: string;
  total_actividades: number;
  image?: string;
  rating?: number;
  description?: string;
  isOnSale?: boolean;
  originalPrice?: number;
  discount?: number;
}

interface Actividad {
  premiacion_id: number;
  nombre: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  tipo: string;
  evento_id: number;
  evento_nombre: string;
  lugar_nombre: string;
  precio?: number;
  cupos_disponibles?: number;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  type: 'evento' | 'actividad';
  image?: string;
  details?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<{eventos: Evento[]}>({ eventos: [] });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Formulario de pago y perfil
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
  });
  // ESTADO PARA MÉTODOS DE PAGO IGUAL A TIENDA ONLINE
  const [selectedPaymentType, setSelectedPaymentType] = useState<'tarjeta_credito' | 'tarjeta_debito'>('tarjeta_credito');
  const [cardData, setCardData] = useState({ numero: '', banco: '', fecha_exp: '' });
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  const [orderComplete, setOrderComplete] = useState(false);
  const [ventaId, setVentaId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Extraer el userId de la ruta actual
  let userId = '';
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    userId = pathname.split('/')[1];
  }

  useEffect(() => {
    loadCart();
    // Obtener datos del usuario autenticado
    async function fetchUserProfile() {
      if (!userId) return;
      try {
        const res = await fetch(`/api/usuarios/current?userId=${userId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setFormData(prev => ({
            ...prev,
            nombre: data.data.nombre || '',
            apellido: data.data.apellido || '',
            telefono: data.data.telefono || '',
            email: data.data.email || '',
            direccion: data.data.direccion || '',
          }));
        }
      } catch (err) {
        // No hacer nada, dejar campos vacíos
      }
    }
    fetchUserProfile();
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem(`tienda-eventos-cart-${userId}`);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error('Error loading cart:', error);
        showMessage('error', 'Error al cargar el carrito');
      }
    } else {
      showMessage('error', 'No hay productos en el carrito');
      setTimeout(() => {
        router.push(`/${userId}/tienda-eventos`);
      }, 2000);
    }
    setLoading(false);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    const timer = setTimeout(() => {
      setMessage(null);
    }, 5000);
    return () => clearTimeout(timer);
  };

  const removeFromCart = (type: 'eventos' | 'actividades', id: number) => {
    const newCart = {
      ...cart,
      [type]: cart[type].filter(item => 
        type === 'eventos' ? item.evento_id !== id : item.premiacion_id !== id
      )
    };
    setCart(newCart);
    localStorage.setItem(`tienda-eventos-cart-${userId}`, JSON.stringify(newCart));
  };

  const clearCart = () => {
    setCart({ eventos: [] });
    localStorage.removeItem(`tienda-eventos-cart-${userId}`);
    showMessage('success', 'Carrito limpiado');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // FUNCIONES DE FORMATO Y CAMBIO DE TARJETA IGUAL A TIENDA ONLINE
  const formatCardNumber = (input: string) => {
    const digitsOnly = input.replace(/\D/g, '');
    return digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
  };
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardData(prev => ({ ...prev, numero: formattedValue }));
  };
  const removePaymentMethod = (idx: number) => {
    setPaymentMethods(paymentMethods.filter((_, i) => i !== idx));
  };
  const addPaymentMethod = () => {
    if (selectedPaymentType === 'tarjeta_credito' || selectedPaymentType === 'tarjeta_debito') {
      if (!cardData.numero || !cardData.banco || (selectedPaymentType === 'tarjeta_credito' && !cardData.fecha_exp)) {
        showMessage('error', 'Por favor complete todos los campos de la tarjeta');
        return;
      }
      const newMethod = {
        tipo: selectedPaymentType === 'tarjeta_credito' ? 'credito' : 'debito',
        numero: cardData.numero.replace(/\s/g, ''),
        banco: cardData.banco,
        monto: total,
        fecha_exp: selectedPaymentType === 'tarjeta_credito' ? cardData.fecha_exp : undefined
      };
      setPaymentMethods([...paymentMethods, newMethod]);
      setCardData({ numero: '', banco: '', fecha_exp: '' });
    }
  };

  // Al enviar el formulario, mapear los datos del cliente a los campos correctos
  const buildClientePayload = () => ({
    primer_nombre: formData.nombre || 'NOMBRE',
    primer_apellido: formData.apellido || 'APELLIDO',
    cedula: formData.cedula || '0',
    direccion: formData.direccion || 'NO ESPECIFICADA',
    RIF: formData.RIF || 'GENERICA',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    if (!cart.eventos || cart.eventos.length === 0) {
      showMessage('error', 'No hay eventos en el carrito');
      setIsProcessing(false);
      return;
    }
    if (!formData.direccion || formData.direccion.trim() === '') {
      showMessage('error', 'Por favor, ingresa tu dirección de entrega.');
      setIsProcessing(false);
      return;
    }
    if (paymentMethods.length === 0) {
      showMessage('error', 'Debes agregar al menos un método de pago.');
      setIsProcessing(false);
      return;
    }
    try {
      const response = await fetch('/api/tienda-eventos/registrar-venta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: buildClientePayload(),
          evento: {
            evento_id: cart.eventos[0]?.evento_id,
            precio_unitario: cart.eventos[0]?.precio_entradas,
            cantidad: 1
          },
          total: total,
          pagos: Array.isArray(paymentMethods) ? paymentMethods : [paymentMethods]
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setVentaId(data.venta_evento_id);
        setOrderComplete(true);
        localStorage.removeItem(`tienda-eventos-cart-${userId}`);
        showMessage('success', '¡Pago registrado exitosamente!');
      } else {
        showMessage('error', data.error || 'Error al registrar la venta. Inténtalo de nuevo.');
      }
    } catch (error) {
      showMessage('error', 'Error al procesar el pago. Inténtalo de nuevo.');
    }
    setIsProcessing(false);
  };

  const totalEventos = (cart.eventos ?? []).reduce((sum, evento) => sum + evento.precio_entradas, 0);
  const totalActividades = (cart.actividades ?? []).reduce((sum, actividad) => sum + (actividad.precio || 0), 0);
  const total = totalEventos + totalActividades;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando checkout...</p>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Pago Completado!</h2>
          <p className="text-gray-600 mb-6">
            Tu compra ha sido procesada exitosamente. Pronto recibirás un correo de confirmación.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              <strong>Número de Orden:</strong> #{ventaId}
            </p>
            <p className="text-sm text-gray-500">
              <strong>Total:</strong> Bs. {total.toFixed(2)}
            </p>
          </div>
          <Link
            href={`/${userId}/tienda-eventos`}
            className="mt-6 inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a la Tienda de Eventos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${userId}/tienda-eventos`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Volver a Eventos
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Finalizar Compra</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Información del Cliente */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <UserIcon className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold">Información del Cliente</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={formData.nombre}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={formData.telefono}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de Entrega *</label>
                <textarea
                  value={formData.direccion}
                  onChange={e => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                  placeholder="Ingresa tu dirección completa de entrega"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.direccion ? 'Dirección cargada desde tu perfil. Puedes modificarla si es necesario.' : 'Por favor, ingresa tu dirección de entrega.'}
                </p>
              </div>
            </div>
          </div>
          {/* Método de Pago */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <CreditCardIcon className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold">Método de Pago</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Seleccionar Método de Pago
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${selectedPaymentType === 'tarjeta_credito' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}>
                    <input
                      type="radio"
                      name="paymentType"
                      value="tarjeta_credito"
                      checked={selectedPaymentType === 'tarjeta_credito'}
                      onChange={e => setSelectedPaymentType(e.target.value as any)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium">Tarjeta Crédito</span>
                  </label>
                  <label className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${selectedPaymentType === 'tarjeta_debito' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}>
                    <input
                      type="radio"
                      name="paymentType"
                      value="tarjeta_debito"
                      checked={selectedPaymentType === 'tarjeta_debito'}
                      onChange={e => setSelectedPaymentType(e.target.value as any)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium">Tarjeta Débito</span>
                  </label>
                </div>
              </div>
              {(selectedPaymentType === 'tarjeta_credito' || selectedPaymentType === 'tarjeta_debito') && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Tarjeta
                    </label>
                    <input
                      type="text"
                      value={cardData.numero}
                      onChange={handleCardNumberChange}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {selectedPaymentType === 'tarjeta_credito' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Expiración
                      </label>
                      <input
                        type="date"
                        value={cardData.fecha_exp}
                        onChange={e => setCardData(prev => ({ ...prev, fecha_exp: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Banco Emisor
                    </label>
                    <input
                      type="text"
                      value={cardData.banco}
                      onChange={e => setCardData(prev => ({ ...prev, banco: e.target.value }))}
                      placeholder="Ej: Banesco"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={addPaymentMethod}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirmar Método de Pago
              </button>
            </div>
            {paymentMethods.length > 0 && (
              <div className="mt-4">
                <h3 className="text-md font-semibold mb-2">Métodos de Pago Agregados</h3>
                <ul className="space-y-2">
                  {paymentMethods.map((pm, idx) => (
                    <li key={idx} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                      <span>{pm.tipo === 'credito' ? 'Tarjeta Crédito' : 'Tarjeta Débito'} •••• {pm.numero.slice(-4)} - {pm.banco}</span>
                      <button onClick={() => removePaymentMethod(idx)} className="text-red-500 ml-2">Eliminar</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        {/* Resumen de la Orden */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Resumen de la Orden</h2>
          <div className="space-y-4">
            {cart.eventos.map((evento) => (
              <div key={evento.evento_id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-medium text-gray-800">{evento.nombre}</p>
                    <p className="text-gray-500 text-sm">{evento.tipo_evento_nombre}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-blue-800">Bs. {(evento.precio_entradas != null ? Number(evento.precio_entradas).toFixed(2) : '0.00')}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-lg font-bold text-blue-800 pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span>Bs. {total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isProcessing || paymentMethods.length === 0}
            className={`w-full mt-6 py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
              isProcessing || paymentMethods.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isProcessing ? 'Procesando...' : 'Completar Compra'}
          </button>
        </div>
      </div>
    </div>
  );
} 