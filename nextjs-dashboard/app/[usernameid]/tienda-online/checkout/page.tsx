"use client";

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftIcon,
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
  UserIcon,
  StarIcon,
  MinusIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  presentation: number;
  image?: string;
}

interface UserProfile {
  id: number;
  email: string;
  tipo_entidad: string;
  empleado?: {
    id: number;
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    telefono: string;
    direccion: string;
    puntos: number;
  };
  cliente_natural?: {
    id: number;
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    telefono: string;
    direccion: string;
    puntos: number;
  };
  cliente_juridico?: {
    id: number;
    razon_social: string;
    telefono: string;
    direccion: string;
    puntos: number;
  };
  miembro_acaucab?: {
    id: number;
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    telefono: string;
    direccion: string;
    puntos: number;
  };
}

interface PaymentMethod {
  tipo: 'tarjeta_credito' | 'tarjeta_debito' | 'puntos';
  cantidad: number;
  numero_tarjeta?: string;
  banco?: string;
  fecha_exp?: string;
}

export default function Checkout({ params }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentType, setSelectedPaymentType] = useState<'tarjeta_credito' | 'tarjeta_debito' | 'puntos'>('tarjeta_credito');
  const [cardData, setCardData] = useState({
    numero: '',
    banco: '',
    fecha_exp: ''
  });
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [direccion, setDireccion] = useState('');

  // Extraer el userId de la ruta actual
  let userId = '';
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    userId = pathname.split('/')[1];
  }

  // Cargar perfil del usuario
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`/api/usuarios?id=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data.user);
          
          // Cargar la dirección del usuario
          const userContact = getUserContactFromProfile(data.user);
          setDireccion(userContact.direccion || '');
        } else {
          console.error('Error fetching user profile:', response.status);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  // Cargar carrito desde localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(`tienda-cart-${userId}`);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, [userId]);

  // Si no hay items en el carrito, redirigir al catálogo
  useEffect(() => {
    if (cartItems.length === 0 && !isProcessing && !loading) {
      window.location.href = `/${userId}/tienda-online/catalogo`;
    }
  }, [cartItems, userId, isProcessing, loading]);

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = 5.00;
  const tax = subtotal * 0.16; // 16% IVA
  const total = subtotal + shipping + tax;

  // Obtener puntos del usuario
  const getUserPoints = () => {
    if (!userProfile) return 0;
    
    const entity = userProfile.empleado || userProfile.cliente_natural || 
                   userProfile.cliente_juridico || userProfile.miembro_acaucab;
    
    if (!entity) return 0;
    
    // Solo CLIENTE_NATURAL y CLIENTE_JURIDICO tienen total_puntos
    if (userProfile.cliente_natural || userProfile.cliente_juridico) {
      return entity.total_puntos || 0;
    }
    
    return 0;
  };

  const userPoints = getUserPoints();
  const maxPointsToUse = Math.min(userPoints, Math.floor(total * 10)); // 1 punto = $0.10

  const formatCardNumber = (input: string) => {
    const digitsOnly = input.replace(/\D/g, '');
    return digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardData(prev => ({ ...prev, numero: formattedValue }));
  };

  const addPaymentMethod = () => {
    if (selectedPaymentType === 'tarjeta_credito' || selectedPaymentType === 'tarjeta_debito') {
      if (!cardData.numero || !cardData.banco || (selectedPaymentType === 'tarjeta_credito' && !cardData.fecha_exp)) {
        alert('Por favor complete todos los campos de la tarjeta');
        return;
      }
      
      const newMethod: PaymentMethod = {
        tipo: selectedPaymentType,
        cantidad: total - (usePoints ? pointsToUse * 0.1 : 0),
        numero_tarjeta: cardData.numero.replace(/\s/g, ''),
        banco: cardData.banco,
        fecha_exp: cardData.fecha_exp
      };
      
      setPaymentMethods([newMethod]);
    } else if (selectedPaymentType === 'puntos') {
      setPaymentMethods([{
        tipo: 'puntos',
        cantidad: pointsToUse * 0.1
      }]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // Validar que tenemos una dirección
      if (!direccion || direccion.trim() === '') {
        alert('Por favor, ingresa tu dirección de entrega.');
        setIsProcessing(false);
        return;
      }

      // Guardar la venta online en la base de datos
      const ventaResponse = await fetch('/api/ventas-online', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          cart: cartItems,
          paymentMethods: paymentMethods,
          total: total - (usePoints ? pointsToUse * 0.1 : 0),
          direccion: direccion.trim()
        }),
      });

      if (!ventaResponse.ok) {
        const errorData = await ventaResponse.json();
        throw new Error(`Error al guardar la venta: ${errorData.error || 'Error desconocido'}`);
      }

      const ventaData = await ventaResponse.json();
      const ventaId = ventaData.ventaId;

      // Generar factura
      const facturaResponse = await fetch('/api/factura', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart: cartItems,
          paymentMethods: paymentMethods,
          foundClientId: userProfile,
          ventaId: ventaId
        }),
      });

      if (facturaResponse.ok) {
        // Descargar la factura
        const blob = await facturaResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `factura-${ventaId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      // Simular procesamiento de orden
      setTimeout(() => {
        setIsProcessing(false);
        setOrderComplete(true);
        // Limpiar el carrito después de completar la orden
        localStorage.removeItem(`tienda-cart-${userId}`);
      }, 2000);
    } catch (error) {
      console.error('Error processing order:', error);
      setIsProcessing(false);
      alert('Error al procesar la orden. Por favor, inténtalo de nuevo.');
    }
  };

  const getUserName = () => {
    if (!userProfile) return 'Usuario';
    
    // Verificar si el usuario tiene datos de entidad
    const entity = userProfile.empleado || userProfile.cliente_natural || 
                   userProfile.cliente_juridico || userProfile.miembro_acaucab;
    
    if (!entity) {
      return userProfile.email || 'Usuario';
    }
    
    // Para cliente jurídico: usar razón social
    if (userProfile.cliente_juridico && entity.razon_social) {
      return entity.razon_social;
    } 
    // Para miembro ACAUCAB: usar razón social
    else if (userProfile.miembro_acaucab && entity.razon_social) {
      return entity.razon_social;
    }
    // Para cliente natural, empleado o miembro ACAUCAB: usar nombres
    else if (entity.primer_nombre || entity.primer_apellido) {
      const names = [
        entity.primer_nombre,
        entity.segundo_nombre,
        entity.primer_apellido,
        entity.segundo_apellido
      ].filter(name => name);
      return names.join(' ') || 'Usuario';
    }
    
    return userProfile.email || 'Usuario';
  };

  const getUserContact = () => {
    if (!userProfile) return { telefono: '', direccion: '' };
    
    const entity = userProfile.empleado || userProfile.cliente_natural || 
                   userProfile.cliente_juridico || userProfile.miembro_acaucab;
    
    if (!entity) {
      return { telefono: '', direccion: '' };
    }
    
    const contact = {
      telefono: entity.telefono || '',
      direccion: entity.direccion || ''
    };
    
    return contact;
  };

  // Función auxiliar para obtener contacto del perfil
  const getUserContactFromProfile = (profile: UserProfile | null) => {
    if (!profile) return { telefono: '', direccion: '' };
    
    const entity = profile.empleado || profile.cliente_natural || 
                   profile.cliente_juridico || profile.miembro_acaucab;
    
    if (!entity) {
      return { telefono: '', direccion: '' };
    }
    
    return {
      telefono: entity.telefono || '',
      direccion: entity.direccion || ''
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Orden Completada!</h2>
          <p className="text-gray-600 mb-6">
            Tu pedido ha sido procesado exitosamente. La factura se ha descargado automáticamente.
          </p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              <strong>Número de Orden:</strong> #ORD-{Date.now().toString().slice(-6)}
            </p>
            <p className="text-sm text-gray-500">
              <strong>Total:</strong> ${total.toFixed(2)}
            </p>
          </div>
          <Link
            href={`/${userId}/tienda-online/catalogo`}
            className="mt-6 inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continuar Comprando
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
            href={`/${userId}/tienda-online/catalogo`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Volver al Catálogo
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={userProfile ? getUserName() : 'Cargando...'}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={userProfile?.email || 'Cargando...'}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={userProfile ? getUserContact().telefono : 'Cargando...'}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección de Entrega *
                </label>
                <textarea
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ingresa tu dirección completa de entrega"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {userProfile && getUserContact().direccion ? 
                    'Dirección cargada desde tu perfil. Puedes modificarla si es necesario.' : 
                    'Por favor, ingresa tu dirección de entrega.'
                  }
                </p>
              </div>

              {/* Puntos del Usuario */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-800">Puntos Disponibles</h3>
                    <p className="text-blue-600">{userProfile ? userPoints : 'Cargando...'} puntos</p>
                  </div>
                  <div className="flex items-center">
                    <StarIcon className="w-5 h-5 text-yellow-500 mr-1" />
                    <span className="text-sm text-gray-600">1 punto = $0.10</span>
                  </div>
                </div>
                
                {userProfile && userPoints > 0 && (
                  <div className="mt-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={usePoints}
                        onChange={(e) => setUsePoints(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Usar puntos para descuento</span>
                    </label>
                    
                    {usePoints && (
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Puntos a usar (máx: {maxPointsToUse})
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={maxPointsToUse}
                          value={pointsToUse}
                          onChange={(e) => setPointsToUse(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                )}
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
              {/* Tipo de Pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Seleccionar Método de Pago
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPaymentType === 'tarjeta_credito' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentType"
                      value="tarjeta_credito"
                      checked={selectedPaymentType === 'tarjeta_credito'}
                      onChange={(e) => setSelectedPaymentType(e.target.value as any)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium">Tarjeta Crédito</span>
                  </label>

                  <label className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPaymentType === 'tarjeta_debito' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentType"
                      value="tarjeta_debito"
                      checked={selectedPaymentType === 'tarjeta_debito'}
                      onChange={(e) => setSelectedPaymentType(e.target.value as any)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium">Tarjeta Débito</span>
                  </label>

                  {userProfile && userPoints > 0 && (
                    <label className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentType === 'puntos' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'
                    }`}>
                      <input
                        type="radio"
                        name="paymentType"
                        value="puntos"
                        checked={selectedPaymentType === 'puntos'}
                        onChange={(e) => setSelectedPaymentType(e.target.value as any)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium">Puntos</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Campos de Tarjeta */}
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
                        onChange={(e) => setCardData(prev => ({ ...prev, fecha_exp: e.target.value }))}
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
                      onChange={(e) => setCardData(prev => ({ ...prev, banco: e.target.value }))}
                      placeholder="Ej: Banesco"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Campos de Puntos */}
              {selectedPaymentType === 'puntos' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Puntos a usar (máx: {maxPointsToUse})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={maxPointsToUse}
                    value={pointsToUse}
                    onChange={(e) => setPointsToUse(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <button
                onClick={addPaymentMethod}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirmar Método de Pago
              </button>
            </div>
          </div>
        </div>

        {/* Resumen de la Orden */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Resumen de la Orden</h2>
          
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-gray-500 text-sm">{item.presentation}ml</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                  <p className="font-medium text-blue-800">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Envío:</span>
                <span className="font-medium">${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">IVA (16%):</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              {usePoints && pointsToUse > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento por puntos:</span>
                  <span className="font-medium">-${(pointsToUse * 0.1).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-blue-800 pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span>${(total - (usePoints ? pointsToUse * 0.1 : 0)).toFixed(2)}</span>
              </div>
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