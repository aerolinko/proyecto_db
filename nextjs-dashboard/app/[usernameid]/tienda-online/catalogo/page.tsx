"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ShoppingCartIcon, 
  PlusIcon, 
  MinusIcon,
  MagnifyingGlassIcon,
  StarIcon
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
}

// Imágenes de cervezas locales
const beerImages = [
  '/cervezas/PILSNER.png',
  '/cervezas/IPA.png',
  '/cervezas/WEIZEN.png',
  '/cervezas/STOUT.png',
  '/cervezas/DUBBEL.png',
  '/cervezas/AMBER.png',
  '/cervezas/PILSNER.png', // Repetir para más productos si es necesario
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
        // Verificar que los productos del carrito aún existen en la lista actual
        const validCart = parsedCart.filter((cartItem: Product) => 
          products.some(product => product.id === cartItem.id)
        );
        setCart(validCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, [products, userId]); // Dependencia en products para asegurar que se cargue después de obtener los productos

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
        const transformedProducts = data.result.map((item: any, index: number) => ({
          id: item.anaquel_cerveza_id,
          name: item.nombre,
          price: parseFloat(item.precio_unitario),
          stock: item.cantidad,
          presentation: item.cap_volumen,
          quantity: 0,
          image: getBeerImage(item.nombre),
          rating: Math.floor(Math.random() * 2) + 4, // Rating aleatorio entre 4-5
          description: beerDescriptions[index % beerDescriptions.length]
        }));
        setProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para asignar la imagen correcta según el nombre de la cerveza
  const getBeerImage = (beerName: string) => {
    const name = beerName.toLowerCase();
    
    // Asignación específica por nombre de cerveza
    if (name.includes('pilsner clásica dorada')) {
      return '/cervezas/PILSNER.png';
    } else if (name.includes('ipa del pacífico amarga')) {
      return '/cervezas/IPA.png';
    } else if (name.includes('weizen blanca tradicional')) {
      return '/cervezas/WEIZEN.png';
    } else if (name.includes('stout irlandesa cremosa')) {
      return '/cervezas/STOUT.png';
    } else if (name.includes('dubbel belga de abadía')) {
      return '/cervezas/DUBBEL.png';
    } else if (name.includes('amber ale americana')) {
      return '/cervezas/AMBER.png';
    } else if (name.includes('bock fuerte de invierno')) {
      return '/cervezas/BOCK.png';
    } else if (name.includes('porter oscura robusta')) {
      return '/cervezas/PORTER.png';
    } else if (name.includes('golden strong belga clara')) {
      return '/cervezas/GOLDEN.png';
    } else if (name.includes('barley wine envejecida')) {
      return '/cervezas/BARLEY.png';
    } else if (name.includes('destilo')) {
      return '/cervezas/DESTILO.png';
    } else if (name.includes('dos leones latin american pale ale')) {
      return '/cervezas/DOS LEONES.png';
    } else if (name.includes('benitz pale ale')) {
      return '/cervezas/BENITZ.png';
    } else if (name.includes('mito brewhouse candileja de abadía')) {
      return '/cervezas/MITO.png';
    } else if (name.includes('cervecería lago ángel o demonio')) {
      return '/cervezas/LAGO ANGEL.png';
    } else if (name.includes('barricas saison belga')) {
      return '/cervezas/BARRICAS.png';
    } else if (name.includes('aldarra mantuana')) {
      return '/cervezas/ALDARRA.png';
    } else {
      // Fallback por tipo de cerveza si no coincide el nombre exacto
      if (name.includes('pilsner') || name.includes('clásica') || name.includes('dorada')) {
        return '/cervezas/PILSNER.png';
      } else if (name.includes('ipa') || name.includes('amarga') || name.includes('pale')) {
        return '/cervezas/IPA.png';
      } else if (name.includes('weizen') || name.includes('blanca') || name.includes('trigo')) {
        return '/cervezas/WEIZEN.png';
      } else if (name.includes('stout') || name.includes('irlandesa') || name.includes('cremosa')) {
        return '/cervezas/STOUT.png';
      } else if (name.includes('dubbel') || name.includes('belga') || name.includes('abadía')) {
        return '/cervezas/DUBBEL.png';
      } else if (name.includes('amber') || name.includes('americana')) {
        return '/cervezas/AMBER.png';
      } else if (name.includes('bock')) {
        return '/cervezas/BOCK.png';
      } else if (name.includes('porter')) {
        return '/cervezas/PORTER.png';
      } else if (name.includes('golden')) {
        return '/cervezas/GOLDEN.png';
      } else if (name.includes('barley')) {
        return '/cervezas/BARLEY.png';
      } else {
        // Imagen por defecto
        return '/cervezas/PILSNER.png';
      }
    }
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

  const filteredProducts = useMemo(() => {
    if (!searchTerm) {
      return products;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [products, searchTerm]);

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
      <div className="max-w-6xl mx-auto">
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
                                <p className="font-medium text-blue-800 text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center mb-4">
                            <span className="font-semibold text-gray-800">Total:</span>
                            <span className="font-bold text-lg text-blue-800">${total.toFixed(2)}</span>
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

          {/* Search Bar */}
          <div className="px-6 pt-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cervezas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
              />
            </div>
          </div>

          {/* Products Section */}
          <div className="p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-4">Cervezas Disponibles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto p-2">
              {filteredProducts.length === 0 ? (
                <p className="col-span-full text-center text-gray-600 py-8">
                  No hay productos disponibles que coincidan con la búsqueda.
                </p>
              ) : (
                filteredProducts.map((product) => {
                  const cartItem = cart.find(item => item.id === product.id);
                  const currentQuantity = cartItem?.quantity || 0;
                  
                  return (
                    <div key={product.id} className="bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
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
                        <p className="text-gray-600 text-xs mb-1 line-clamp-2">
                          {product.description}
                        </p>
                        <p className="text-gray-700 mt-1">
                          <span className="font-semibold text-sm">${product.price.toFixed(2)}</span>
                        </p>
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

                          <span className="w-12 text-center font-medium text-base">
                            {currentQuantity}
                          </span>

                          <button
                            onClick={() => handleAddToCart(product.id, Math.min(currentQuantity + 1, product.stock))}
                            className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors duration-200"
                            disabled={currentQuantity >= product.stock || product.stock === 0}
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleAddToCart(product.id, currentQuantity === 0 ? 1 : 0)}
                          disabled={product.stock === 0}
                          className={`w-full px-4 py-3 rounded text-base font-semibold text-white transition-colors duration-200 ${
                            product.stock > 0
                              ? 'bg-blue-600 hover:bg-blue-700'
                              : 'bg-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {currentQuantity > 0 ? 'Eliminar del Carrito' : 'Agregar al Carrito'}
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