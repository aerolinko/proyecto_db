"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ShoppingCartIcon, 
  PlusIcon, 
  MinusIcon,
  MagnifyingGlassIcon,
  StarIcon,
  FunnelIcon,
  XMarkIcon,
  TagIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
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

// Tipos de eventos
const eventTypes = [
  'Todos',
  'Festival de Cerveza',
  'Exposición',
  'Feria',
  'Conferencia',
  'Taller',
  'Degustación',
  'Concurso'
];

// Estados de eventos
const eventStates = [
  'Todos',
  'PENDIENTE',
  'EN CURSO',
  'FINALIZADO'
];

// Imágenes de eventos
const eventImages = [
  '/eventos/festival.jpg',
  '/eventos/expo.jpg',
  '/eventos/feria.jpg',
  '/eventos/conferencia.jpg',
  '/eventos/taller.jpg',
  '/eventos/degustacion.jpg',
  '/eventos/concurso.jpg'
];

const eventDescriptions = [
  'Festival de cerveza artesanal con las mejores cervecerías del país',
  'Exposición de productos y servicios relacionados con la cerveza artesanal',
  'Feria gastronómica con degustaciones y actividades especiales',
  'Conferencia sobre tendencias en la industria cervecera',
  'Taller de elaboración de cerveza artesanal para principiantes',
  'Degustación guiada de diferentes estilos de cerveza',
  'Concurso de cervezas artesanales con premios especiales'
];

export default function TiendaEventos({ params }) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [cart, setCart] = useState<{eventos: Evento[], actividades: Actividad[]}>({ eventos: [], actividades: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'eventos' | 'actividades'>('eventos');
  
  // Filtros
  const [selectedType, setSelectedType] = useState('Todos');
  const [selectedState, setSelectedState] = useState('Todos');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [showOnlyOnSale, setShowOnlyOnSale] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // name, price, date, rating

  // Extraer el userId de la ruta actual
  let userId = '';
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    userId = pathname.split('/')[1];
  }

  useEffect(() => {
    fetchEventos();
    fetchActividades();
  }, []);

  // Guardar carrito en localStorage
  useEffect(() => {
    if (cart.eventos.length > 0 || cart.actividades.length > 0) {
      localStorage.setItem(`tienda-eventos-cart-${userId}`, JSON.stringify(cart));
    } else {
      localStorage.removeItem(`tienda-eventos-cart-${userId}`);
    }
  }, [cart, userId]);

  // Cargar carrito desde localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(`tienda-eventos-cart-${userId}`);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, [userId]);

  const showMessage = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    const timer = setTimeout(() => {
      setMessage(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const fetchEventos = async () => {
    try {
      const response = await fetch('/api/eventos');
      const data = await response.json();
      
      if (data.success) {
        const transformedEventos = data.data.map((item: any, index: number) => {
          const isOnSale = Math.random() > 0.7; // 30% de probabilidad de estar en oferta
          const originalPrice = isOnSale ? item.precio_entradas * 1.2 : item.precio_entradas;
          const discount = isOnSale ? 20 : 0;
          
          return {
            ...item,
            image: getEventImage(item.tipo_evento_nombre),
            rating: Math.floor(Math.random() * 2) + 4,
            description: eventDescriptions[index % eventDescriptions.length],
            isOnSale,
            originalPrice,
            discount,
            total_actividades: item.total_actividades || 0
          };
        });
        setEventos(transformedEventos);
      }
    } catch (error) {
      console.error('Error fetching eventos:', error);
    }
  };

  const fetchActividades = async () => {
    try {
      const response = await fetch('/api/actividades');
      const data = await response.json();
      
      if (data.success) {
        const transformedActividades = data.data.map((item: any) => ({
          ...item,
          precio: Math.floor(Math.random() * 5000) + 1000, // Precio aleatorio entre 1000-6000
          cupos_disponibles: Math.floor(Math.random() * 50) + 10 // Cupos aleatorios entre 10-60
        }));
        setActividades(transformedActividades);
      }
    } catch (error) {
      console.error('Error fetching actividades:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventImage = (eventType: string) => {
    const type = eventType.toLowerCase();
    if (type.includes('festival')) return eventImages[0];
    if (type.includes('expo')) return eventImages[1];
    if (type.includes('feria')) return eventImages[2];
    if (type.includes('conferencia')) return eventImages[3];
    if (type.includes('taller')) return eventImages[4];
    if (type.includes('degustación') || type.includes('degustacion')) return eventImages[5];
    if (type.includes('concurso')) return eventImages[6];
    return eventImages[0]; // Default
  };

  const handleAddEventoToCart = (evento: Evento) => {
    setCart(prev => ({
      ...prev,
      eventos: [...prev.eventos, evento]
    }));
    showMessage('success', 'Evento agregado al carrito');
  };

  const handleAddActividadToCart = (actividad: Actividad) => {
    setCart(prev => ({
      ...prev,
      actividades: [...prev.actividades, actividad]
    }));
    showMessage('success', 'Actividad agregada al carrito');
  };

  const removeFromCart = (type: 'eventos' | 'actividades', id: number) => {
    setCart(prev => ({
      ...prev,
      [type]: prev[type].filter(item => 
        type === 'eventos' ? item.evento_id !== id : item.premiacion_id !== id
      )
    }));
  };

  const clearCart = () => {
    setCart({ eventos: [], actividades: [] });
    showMessage('success', 'Carrito limpiado');
  };

  const clearFilters = () => {
    setSelectedType('Todos');
    setSelectedState('Todos');
    setPriceRange({ min: 0, max: 100000 });
    setShowOnlyOnSale(false);
    setSortBy('name');
    setSearchTerm('');
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`w-3 h-3 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Filtrar y ordenar eventos
  const filteredAndSortedEventos = useMemo(() => {
    let filtered = eventos.filter(evento => {
      const matchesSearch = evento.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           evento.tipo_evento_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           evento.lugar_nombre.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedType === 'Todos' || evento.tipo_evento_nombre === selectedType;
      const matchesState = selectedState === 'Todos' || evento.estado_evento === selectedState;
      const matchesPrice = evento.precio_entradas >= priceRange.min && evento.precio_entradas <= priceRange.max;
      const matchesSale = !showOnlyOnSale || evento.isOnSale;
      
      return matchesSearch && matchesType && matchesState && matchesPrice && matchesSale;
    });

    // Ordenar
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'price':
        filtered.sort((a, b) => a.precio_entradas - b.precio_entradas);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.precio_entradas - a.precio_entradas);
        break;
      case 'date':
        filtered.sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime());
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    return filtered;
  }, [eventos, searchTerm, selectedType, selectedState, priceRange, showOnlyOnSale, sortBy]);

  const totalEventos = cart.eventos.reduce((sum, evento) => sum + evento.precio_entradas, 0);
  const total = totalEventos;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tienda de Eventos</h1>
                <p className="text-gray-600">Descubre y reserva eventos increíbles</p>
              </div>
              
              {/* Carrito */}
              <div className="relative">
                <button
                  onClick={() => setShowCart(!showCart)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  <span>Carrito ({cart.eventos.length})</span>
                </button>

                {/* Dropdown del carrito */}
                {showCart && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800">Tu Carrito</h3>
                      {cart.eventos.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Tu carrito está vacío</p>
                      ) : (
                        <>
                          <div className="max-h-64 overflow-y-auto space-y-3">
                            {/* Eventos en carrito */}
                            {cart.eventos.map((evento) => (
                              <div key={evento.evento_id} className="flex items-center justify-between py-2 border-b border-gray-200">
                                <div className="flex items-center space-x-3">
                                  {/* <img src={evento.image} alt={evento.nombre} className="w-12 h-12 rounded object-cover" /> */}
                                  <div>
                                    <p className="font-medium text-sm text-gray-800">{evento.nombre}</p>
                                    <p className="text-gray-500 text-xs">Evento</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <button
                                    onClick={() => removeFromCart('eventos', evento.evento_id)}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                  >
                                    Eliminar
                                  </button>
                                  <p className="font-medium text-blue-800 text-sm">Bs. {evento.precio_entradas != null ? Number(evento.precio_entradas).toFixed(2) : "0.00"}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                              <span className="font-semibold text-gray-800">Total:</span>
                              <span className="font-bold text-lg text-blue-800">Bs. {total.toFixed(2)}</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={clearCart}
                                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-center"
                              >
                                Limpiar Carrito
                              </button>
                              <Link
                                href={`/${userId}/tienda-eventos/checkout`}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                              >
                                Proceder al Pago
                              </Link>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-4 mx-4 mb-4 rounded-lg text-center font-semibold
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
                  placeholder="Buscar eventos, tipos o lugares..."
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Tipo de Evento (solo para eventos) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Evento</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {eventTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Estado de Evento (solo para eventos) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {eventStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  {/* Rango de Precio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Precio: Bs. {priceRange.min} - Bs. {priceRange.max}</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                        className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                        className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </div>

                  {/* Ordenamiento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="name">Nombre A-Z</option>
                      <option value="price">Precio: Menor a Mayor</option>
                      <option value="price-desc">Precio: Mayor a Menor</option>
                      <option value="date">Fecha</option>
                      {selectedType !== 'Todos' && <option value="rating">Mejor Valoración</option>}
                    </select>
                  </div>
                </div>

                {/* Ofertas Checkbox (solo para eventos) */}
                {selectedType !== 'Todos' && (
                  <div className="mt-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showOnlyOnSale}
                        onChange={(e) => setShowOnlyOnSale(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <TagIcon className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-gray-700">Solo ofertas</span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="px-6 pt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Mostrando {filteredAndSortedEventos.length} de {eventos.length} eventos
              </p>
              <div className="flex gap-2 text-sm">
                {selectedType !== 'Todos' && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Tipo: {selectedType}</span>
                )}
                {selectedState !== 'Todos' && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Estado: {selectedState}</span>
                )}
                {showOnlyOnSale && selectedType !== 'Todos' && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded">Solo ofertas</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-blue-800 mb-4">Eventos Disponibles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto p-2">
            {filteredAndSortedEventos.length === 0 ? (
              <p className="col-span-full text-center text-gray-600 py-8">
                No hay eventos disponibles que coincidan con los filtros aplicados.
              </p>
            ) : (
              filteredAndSortedEventos.map((evento) => (
                <div key={evento.evento_id} className="bg-gradient-to-br from-yellow-50 to-blue-50 p-3 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-blue-200 relative scale-100 hover:scale-[1.03]">
                  {/* Event Image */}
                  <div className="relative mb-3">
                    {/* Imagen eliminada */}
                    <div className="absolute top-1 right-1 bg-blue-600 text-white px-1 py-0.5 rounded text-xs font-medium">
                      {evento.total_actividades} actividades
                    </div>
                    {evento.estado_evento === 'FINALIZADO' && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center">
                        <span className="text-white font-semibold text-xs">Finalizado</span>
                      </div>
                    )}
                  </div>
                  {/* Event Info */}
                  <div className="mb-3">
                    {/* Destacado si precio es 50 */}
                    {(!evento.precio_entradas || isNaN(evento.precio_entradas) || evento.precio_entradas <= 0) && (
                      <div className="mb-2 flex items-center gap-2">
                        <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs font-bold animate-pulse">¡Precio especial!</span>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">Bs. 50</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-bold text-gray-800 truncate">{evento.nombre}</h3>
                      <div className="flex items-center">
                        {renderStars(evento.rating || 4)}
                      </div>
                    </div>
                    {/* Type and State */}
                    <div className="flex gap-1 mb-1">
                      <span className="bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded">{evento.tipo_evento_nombre}</span>
                      <span className={`text-xs px-1 py-0.5 rounded ${
                        evento.estado_evento === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                        evento.estado_evento === 'EN CURSO' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {evento.estado_evento}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs mb-1 line-clamp-2">
                      {evento.description}
                    </p>
                    {/* Event Details */}
                    <div className="space-y-1 mb-2">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <CalendarIcon className="w-3 h-3" />
                        <span>{new Date(evento.fecha_inicio).toLocaleDateString('es-ES')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <MapPinIcon className="w-3 h-3" />
                        <span>{evento.lugar_nombre}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <UsersIcon className="w-3 h-3" />
                        <span>Capacidad: {evento.capacidad}</span>
                      </div>
                    </div>
                    {/* Price Mejorado */}
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-700">
                        Bs. {typeof evento.precio_entradas === 'number' && !isNaN(evento.precio_entradas) && evento.precio_entradas > 0
                          ? Number(evento.precio_entradas).toFixed(2)
                          : '50.00'}
                      </span>
                    </div>
                  </div>
                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddEventoToCart(evento)}
                    disabled={evento.estado_evento === 'FINALIZADO'}
                    className={`w-full py-2 px-4 rounded-lg font-bold shadow-md transition-all duration-200 ${
                      evento.estado_evento === 'FINALIZADO'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-500 text-white hover:from-blue-700 hover:to-indigo-600 scale-105'
                    }`}
                  >
                    {evento.estado_evento === 'FINALIZADO' ? 'Evento Finalizado' : 'Agregar al Carrito'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}