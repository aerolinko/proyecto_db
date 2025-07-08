"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCartIcon, 
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  CreditCardIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

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
  // Múltiples tarjetas
  const [tarjetas, setTarjetas] = useState<Array<{
    tipo: 'debito' | 'credito',
    numero: string,
    banco: string,
    fecha_exp?: string,
    monto: number
  }>>([{ tipo: 'debito', numero: '', banco: '', monto: 0 }]);

  // Extraer el userId de la ruta actual
  let userId = '';
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    userId = pathname.split('/')[1];
  }

  useEffect(() => {
    loadCart();
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

  const handleAddTarjeta = () => {
    setTarjetas([...tarjetas, { tipo: 'debito', numero: '', banco: '', monto: 0 }]);
  };
  const handleRemoveTarjeta = (idx: number) => {
    setTarjetas(tarjetas.filter((_, i) => i !== idx));
  };
  const handleTarjetaChange = (idx: number, field: string, value: any) => {
    setTarjetas(tarjetas.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.eventos.length === 0) {
      showMessage('error', 'No hay eventos en el carrito');
      return;
    }
    // Validar campos requeridos
    const requiredFields = ['nombre', 'apellido', 'cedula', 'telefono', 'email', 'direccion', 'ciudad'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        showMessage('error', `El campo ${field} es requerido`);
        return;
      }
    }
    // Validar tarjetas
    if (tarjetas.length === 0 || tarjetas.some(t => !t.numero || !t.banco || t.monto <= 0)) {
      showMessage('error', 'Debes ingresar los datos de todas las tarjetas y montos.');
      return;
    }
    // Sumar montos
    const totalPagos = tarjetas.reduce((sum, t) => sum + Number(t.monto), 0);
    if (totalPagos !== total) {
      showMessage('error', 'La suma de los montos de las tarjetas debe ser igual al total a pagar.');
      return;
    }
    try {
      const response = await fetch('/api/tienda-eventos/registrar-venta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: formData,
          evento: {
            evento_id: cart.eventos[0].evento_id,
            precio_unitario: cart.eventos[0].precio_entradas,
            cantidad: 1
          },
          total: total,
          pagos: tarjetas
        })
      });
      if (response.ok) {
        showMessage('success', '¡Compra realizada con éxito! Recibirás un email de confirmación.');
        setTimeout(() => {
          clearCart();
          router.push(`/${userId}/tienda-eventos`);
        }, 3000);
      } else {
        showMessage('error', 'Error al registrar la venta. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      showMessage('error', 'Error al procesar el pago. Inténtalo de nuevo.');
    }
  };

  const totalEventos = cart.eventos.reduce((sum, evento) => sum + evento.precio_entradas, 0);
  const totalActividades = cart.actividades.reduce((sum, actividad) => sum + (actividad.precio || 0), 0);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finalizar Compra</h1>
          <p className="text-gray-600 mt-2">Completa tu información para finalizar la compra</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-4 mb-6 rounded-lg text-center font-semibold
            ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de Pago */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Información de Pago</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información Personal */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo *</label>
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Dirección */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Dirección de Envío</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
                      <input
                        type="text"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad *</label>
                        <input
                          type="text"
                          name="ciudad"
                          value={formData.ciudad}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal</label>
                        <input
                          type="text"
                          name="codigoPostal"
                          value={formData.codigoPostal}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Método de Pago */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Método de Pago</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar método</label>
                      <select
                        name="metodoPago"
                        value={formData.metodoPago}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                        <option value="transferencia">Transferencia Bancaria</option>
                        <option value="efectivo">Pago en Efectivo</option>
                      </select>
                    </div>

                    {formData.metodoPago === 'tarjeta' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Número de Tarjeta *</label>
                          <input
                            type="text"
                            name="numeroTarjeta"
                            value={formData.numeroTarjeta}
                            onChange={handleInputChange}
                            placeholder="1234 5678 9012 3456"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Vencimiento *</label>
                            <input
                              type="text"
                              name="fechaVencimiento"
                              value={formData.fechaVencimiento}
                              onChange={handleInputChange}
                              placeholder="MM/AA"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                            <input
                              type="text"
                              name="cvv"
                              value={formData.cvv}
                              onChange={handleInputChange}
                              placeholder="123"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre en Tarjeta *</label>
                            <input
                              type="text"
                              name="nombreTarjeta"
                              value={formData.nombreTarjeta}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botón de Pago */}
                <div className="pt-6">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Confirmar Compra - Bs. {total.toFixed(2)}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Resumen del Carrito */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Resumen del Pedido</h2>
              
              {cart.eventos.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay productos en el carrito</p>
              ) : (
                <>
                  {/* Eventos */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Eventos</h3>
                    <div className="space-y-3">
                      {cart.eventos.map((evento) => (
                        <div key={evento.evento_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <img src={evento.image} alt={evento.nombre} className="w-12 h-12 rounded object-cover" />
                            <div>
                              <p className="font-medium text-sm text-gray-800">{evento.nombre}</p>
                              <p className="text-gray-500 text-xs">{evento.tipo_evento_nombre}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <button
                              onClick={() => removeFromCart('eventos', evento.evento_id)}
                              className="text-red-500 hover:text-red-700 text-sm mb-1"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                            <p className="font-medium text-blue-800 text-sm">Bs. {evento.precio_entradas.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold text-gray-900">
                      <span>Total:</span>
                      <span>Bs. {total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Botón Limpiar Carrito */}
                  <div className="mt-4">
                    <button
                      onClick={clearCart}
                      className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Limpiar Carrito
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 