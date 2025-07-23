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
  TagIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  presentation: number;
  quantity: number;
  image?: string;
  rating?: number;
  description?: string;
  category?: string;
  provider?: string;
  isOnSale?: boolean;
  originalPrice?: number;
  discount?: number;
}

// Categorías de cerveza
const beerCategories = [
  'Todas',
  'IPA',
  'Stout',
  'Porter',
  'Pilsner',
  'Amber Ale',
  'Weizen',
  'Dubbel',
  'Golden Strong',
  'Barley Wine',
  'Bock',
  'Pale Ale',
  'Saison'
];

// Proveedores
const providers = [
  'Todos',
  'Cervecería Lago Ángel',
  'Benitz',
  'Dos Leones',
  'Mito Brewhouse',
  'Barricas',
  'Aldarra'
];

// Imágenes de cervezas locales
const beerImages = [
  '/cervezas/PILSNER.png',
  '/cervezas/IPA.png',
  '/cervezas/WEIZEN.png',
  '/cervezas/STOUT.png',
  '/cervezas/DUBBEL.png',
  '/cervezas/AMBER.png',
  '/cervezas/PILSNER.png',
  '/cervezas/IPA.png',
  '/cervezas/WEIZEN.png',
  '/cervezas/STOUT.png',
];

const beerDescriptions = [
  'Cerveza artesanal con notas cítricas y amargor equilibrado',
  'Lager suave y refrescante, perfecta para cualquier ocasión',
  'Stout oscura con aromas a café y chocolate',
  'IPA americana con lúpulos aromáticos y cítricos',
  'Cerveza belga con ésteres frutados y especiados',
  'Pale Ale clásica con balance perfecto de malta y lúpulo',
  'Bock fuerte de invierno con maltas tostadas',
  'Porter robusta con notas a caramelo y chocolate',
  'Golden Strong belga con alta graduación alcohólica',
  'Barley Wine envejecida con sabores complejos'
];

export default function CatalogoCervezas({ params }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtros
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedProvider, setSelectedProvider] = useState('Todos');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [showOnlyOnSale, setShowOnlyOnSale] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // name, price, rating

  // Extraer el userId de la ruta actual
  let userId = '';
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    userId = pathname.split('/')[1];
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  // Guardar carrito en localStorage
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem(`tienda-cart-${userId}`, JSON.stringify(cart));
    } else {
      localStorage.removeItem(`tienda-cart-${userId}`);
    }
  }, [cart, userId]);

  // Cargar carrito desde localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(`tienda-cart-${userId}`);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        const validCart = parsedCart.filter((cartItem: Product) => 
          products.some(product => product.id === cartItem.id)
        );
        setCart(validCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, [products, userId]);

  const showMessage = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    const timer = setTimeout(() => {
      setMessage(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      
      if (data.result) {
        const transformedProducts = data.result.map((item: any, index: number) => {
          const category = getBeerCategory(item.nombre);
          const provider = getBeerProvider(item.nombre);
          const isOnSale = Math.random() > 0.7; // 30% de probabilidad de estar en oferta
          const originalPrice = isOnSale ? parseFloat(item.precio_unitario) * 1.2 : parseFloat(item.precio_unitario);
          const discount = isOnSale ? 20 : 0;
          
          return {
            id: item.anaquel_cerveza_id,
            name: item.nombre,
            price: parseFloat(item.precio_unitario),
            stock: item.cantidad,
            presentation: item.cap_volumen,
            quantity: 0,
            image: getBeerImage(item.nombre),
            rating: Math.floor(Math.random() * 2) + 4,
            description: beerDescriptions[index % beerDescriptions.length],
            category,
            provider,
            isOnSale,
            originalPrice,
            discount
          };
        });
        setProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para determinar la categoría de la cerveza
  const getBeerCategory = (beerName: string): string => {
    const name = beerName.toLowerCase();
    
    if (name.includes('ipa') || name.includes('pale ale')) return 'IPA';
    if (name.includes('stout')) return 'Stout';
    if (name.includes('porter')) return 'Porter';
    if (name.includes('pilsner') || name.includes('clásica')) return 'Pilsner';
    if (name.includes('amber')) return 'Amber Ale';
    if (name.includes('weizen') || name.includes('blanca')) return 'Weizen';
    if (name.includes('dubbel') || name.includes('abadía')) return 'Dubbel';
    if (name.includes('golden')) return 'Golden Strong';
    if (name.includes('barley')) return 'Barley Wine';
    if (name.includes('bock')) return 'Bock';
    if (name.includes('saison')) return 'Saison';
    
    return 'Pale Ale'; // Categoría por defecto
  };

  // Función para determinar el proveedor
  const getBeerProvider = (beerName: string): string => {
    const name = beerName.toLowerCase();
    
    if (name.includes('lago ángel') || name.includes('demonio')) return 'Cervecería Lago Ángel';
    if (name.includes('benitz')) return 'Benitz';
    if (name.includes('dos leones')) return 'Dos Leones';
    if (name.includes('mito') || name.includes('candileja')) return 'Mito Brewhouse';
    if (name.includes('barricas')) return 'Barricas';
    if (name.includes('aldarra') || name.includes('mantuana')) return 'Aldarra';
    
    return 'Otros';
  };

  // Función para asignar la imagen correcta según el nombre de la cerveza
  const getBeerImage = (beerName: string) => {
    const name = beerName.toLowerCase();
    
    if (name.includes('pilsner clásica dorada')) return '/cervezas/PILSNER.png';
    if (name.includes('ipa del pacífico amarga')) return '/cervezas/IPA.png';
    if (name.includes('weizen blanca tradicional')) return '/cervezas/WEIZEN.png';
    if (name.includes('stout irlandesa cremosa')) return '/cervezas/STOUT.png';
    if (name.includes('dubbel belga de abadía')) return '/cervezas/DUBBEL.png';
    if (name.includes('amber ale americana')) return '/cervezas/AMBER.png';
    if (name.includes('bock fuerte de invierno')) return '/cervezas/BOCK.png';
    if (name.includes('porter oscura robusta')) return '/cervezas/PORTER.png';
    if (name.includes('golden strong belga clara')) return '/cervezas/GOLDEN.png';
    if (name.includes('barley wine envejecida')) return '/cervezas/BARLEY.png';
    if (name.includes('destilo')) return '/cervezas/DESTILO.png';
    if (name.includes('dos leones latin american pale ale')) return '/cervezas/DOS LEONES.png';
    if (name.includes('benitz pale ale')) return '/cervezas/BENITZ.png';
    if (name.includes('mito brewhouse candileja de abadía')) return '/cervezas/MITO.png';
    if (name.includes('cervecería lago ángel o demonio')) return '/cervezas/LAGO ANGEL.png';
    if (name.includes('barricas saison belga')) return '/cervezas/BARRICAS.png';
    if (name.includes('aldarra mantuana')) return '/cervezas/ALDARRA.png';
    
    // Fallback por tipo de cerveza
    if (name.includes('pilsner') || name.includes('clásica') || name.includes('dorada')) return '/cervezas/PILSNER.png';
    if (name.includes('ipa') || name.includes('amarga') || name.includes('pale')) return '/cervezas/IPA.png';
    if (name.includes('weizen') || name.includes('blanca') || name.includes('trigo')) return '/cervezas/WEIZEN.png';
    if (name.includes('stout') || name.includes('irlandesa') || name.includes('cremosa')) return '/cervezas/STOUT.png';
    if (name.includes('dubbel') || name.includes('belga') || name.includes('abadía')) return '/cervezas/DUBBEL.png';
    if (name.includes('amber') || name.includes('americana')) return '/cervezas/AMBER.png';
    if (name.includes('bock')) return '/cervezas/BOCK.png';
    if (name.includes('porter')) return '/cervezas/PORTER.png';
    if (name.includes('golden')) return '/cervezas/GOLDEN.png';
    if (name.includes('barley')) return '/cervezas/BARLEY.png';
    
    return '/cervezas/PILSNER.png';
  };

  const handleAddToCart = useCallback((productId: number, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) {
      showMessage('error', 'Producto no encontrado.');
      return;
    }

    if (quantity === 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== productId));
      showMessage('success', `${product.name} eliminado del carrito.`);
    } else if (quantity > 0 && quantity <= product.stock) {
      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === productId);
        if (!existingItem) {
          showMessage('success', `${product.name} (x${quantity}) agregado al carrito.`);
          return [...prevCart, { ...product, quantity }];
        } else {
          showMessage('success', `${product.name} (x${quantity}) actualizado en el carrito.`);
          return prevCart.map(item => 
            item.id === productId ? { ...item, quantity } : item
          );
        }
      });
    } else {
      showMessage('error', `Cantidad inválida o excede el stock para ${product.name}.`);
    }
  }, [products, showMessage]);

  // Filtrado y ordenamiento de productos
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Filtro por búsqueda
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.category?.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.provider?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // Filtro por categoría
    if (selectedCategory !== 'Todas') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filtro por proveedor
    if (selectedProvider !== 'Todos') {
      filtered = filtered.filter(product => product.provider === selectedProvider);
    }

    // Filtro por rango de precio
    filtered = filtered.filter(product => 
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    // Filtro por ofertas
    if (showOnlyOnSale) {
      filtered = filtered.filter(product => product.isOnSale);
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, selectedProvider, priceRange, showOnlyOnSale, sortBy]);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem(`tienda-cart-${userId}`);
    showMessage('success', 'Carrito limpiado exitosamente.');
  }, [userId, showMessage]);

  const clearFilters = useCallback(() => {
    setSelectedCategory('Todas');
    setSelectedProvider('Todos');
    setPriceRange({ min: 0, max: 1000 });
    setShowOnlyOnSale(false);
    setSortBy('name');
    setSearchTerm('');
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      i < rating ? (
        <StarIconSolid key={i} className="w-3 h-3 text-yellow-400" />
      ) : (
        <StarIcon key={i} className="w-3 h-3 text-gray-300" />
      )
    ));
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
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 border border-blue-200">
          {/* Header Section */}
          <div className="bg-blue-700 p-6 text-white relative">
            <h1 className="text-3xl font-bold text-center">Tienda Online - Catálogo de Cervezas</h1>
            
            {/* Carrito flotante */}
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative p-3 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-30 transition-all duration-200"
              >
                <ShoppingCartIcon className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Dropdown del carrito */}
              {showCart && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Tu Carrito</h3>
                    {cart.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Tu carrito está vacío</p>
                    ) : (
                      <>
                        <div className="max-h-64 overflow-y-auto space-y-3">
                          {cart.map((item) => (
                            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                              <div className="flex items-center space-x-3">
                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                                <div>
                                  <p className="font-medium text-sm text-gray-800">{item.name}</p>
                                  <p className="text-gray-500 text-xs">{item.presentation}ml</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handleAddToCart(item.id, Math.max(item.quantity - 1, 0))}
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    <MinusIcon className="w-3 h-3" />
                                  </button>
                                  <span className="text-sm font-medium">{item.quantity}</span>
                                  <button
                                    onClick={() => handleAddToCart(item.id, Math.min(item.quantity + 1, item.stock))}
                                    className="p-1 hover:bg-gray-100 rounded"
                                    disabled={item.quantity >= item.stock}
                                  >
                                    <PlusIcon className="w-3 h-3" />
                                  </button>
                                </div>
                                <p className="font-medium text-blue-800 text-sm">Bs. {(item.price * item.quantity).toFixed(2)}</p>
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
                              href={`/${userId}/tienda-online/checkout`}
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
                  placeholder="Buscar cervezas, categorías o proveedores..."
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
                  {/* Categoría */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {beerCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Proveedor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor</label>
                    <select
                      value={selectedProvider}
                      onChange={(e) => setSelectedProvider(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {providers.map(provider => (
                        <option key={provider} value={provider}>{provider}</option>
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
                      <option value="rating">Mejor Valoración</option>
                    </select>
                  </div>
                </div>

                {/* Ofertas Checkbox */}
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
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="px-6 pt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Mostrando {filteredAndSortedProducts.length} de {products.length} productos
              </p>
              <div className="flex gap-2 text-sm">
                {selectedCategory !== 'Todas' && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Categoría: {selectedCategory}</span>
                )}
                {selectedProvider !== 'Todos' && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Proveedor: {selectedProvider}</span>
                )}
                {showOnlyOnSale && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded">Solo ofertas</span>
                )}
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-4">Cervezas Disponibles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto p-2">
              {filteredAndSortedProducts.length === 0 ? (
                <p className="col-span-full text-center text-gray-600 py-8">
                  No hay productos disponibles que coincidan con los filtros aplicados.
                </p>
              ) : (
                filteredAndSortedProducts.map((product) => {
                  const cartItem = cart.find(item => item.id === product.id);
                  const currentQuantity = cartItem?.quantity || 0;
                  
                  return (
                    <div key={product.id} className="bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 relative">
                      {/* Sale Badge */}
                      {product.isOnSale && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold z-10">
                          -{product.discount}%
                        </div>
                      )}

                      {/* Product Image */}
                      <div className="relative mb-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-80 object-cover rounded-md"
                        />
                        <div className="absolute top-1 right-1 bg-blue-600 text-white px-1 py-0.5 rounded text-xs font-medium">
                          {product.presentation}ml
                        </div>
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">Agotado</span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-bold text-gray-800 truncate">{product.name}</h3>
                          <div className="flex items-center">
                            {renderStars(product.rating || 4)}
                          </div>
                        </div>
                        
                        {/* Category and Provider */}
                        <div className="flex gap-1 mb-1">
                          <span className="bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded">{product.category}</span>
                          <span className="bg-green-100 text-green-800 text-xs px-1 py-0.5 rounded">{product.provider}</span>
                        </div>
                        
                        <p className="text-gray-600 text-xs mb-1 line-clamp-2">
                          {product.description}
                        </p>
                        
                         {/* Price Mejorado */}
                         <div className="flex items-center gap-2">
                           {(() => {
                             // Si el precio no es válido, mostrar 50
                             let price = (typeof product.price === 'number' && !isNaN(product.price)) ? product.price : 50;
                             let originalPrice = (typeof product.originalPrice === 'number' && !isNaN(product.originalPrice)) ? product.originalPrice : null;
                             if (product.isOnSale && originalPrice) {
                               return <>
                                 <span className="text-gray-400 text-xs line-through">Bs. {originalPrice.toFixed(2)}</span>
                                 <span className="font-semibold text-sm text-red-600">Bs. {price.toFixed(2)}</span>
                               </>;
                             } else {
                               return <span className="font-semibold text-sm text-gray-700">Bs. {price.toFixed(2)}</span>;
                             }
                           })()}
                         </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAddToCart(product.id, Math.max(currentQuantity - 1, 0))}
                            className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors duration-200"
                            disabled={currentQuantity === 0}
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>

                          <input
                            type="number"
                            min={0}
                            max={product.stock}
                            value={currentQuantity}
                            onChange={e => {
                              let val = Number(e.target.value);
                              if (isNaN(val)) val = 0;
                              if (val < 0) val = 0;
                              if (val > product.stock) val = product.stock;
                              handleAddToCart(product.id, val);
                            }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            className="w-16 text-center font-medium text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                            disabled={product.stock === 0}
                          />

                          <button
                            onClick={() => handleAddToCart(product.id, Math.min(currentQuantity + 1, product.stock))}
                            className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors duration-200"
                            disabled={currentQuantity >= product.stock || product.stock === 0}
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleAddToCart(product.id, currentQuantity === 0 ? 1 : currentQuantity)}
                          disabled={product.stock === 0}
                          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                            product.stock === 0
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {product.stock === 0 ? 'Agotado' : currentQuantity === 0 ? 'Agregar al Carrito' : 'Actualizar Cantidad'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 