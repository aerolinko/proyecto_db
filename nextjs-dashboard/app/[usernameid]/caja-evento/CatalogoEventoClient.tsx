"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ProductCard from "@/app/ui/evento/ProductCard";
import SelectEvento from "@/app/ui/evento/SelectEvento";

export default function CatalogoEventoClient({ permisos }: { permisos: string[] }) {
  if (!permisos.includes('consultar EVENTO MIEMBRO ACAUCAB')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600 font-bold">Acceso denegado: No tiene permiso para ver esta sección.</div>
      </div>
    );
  }

  const [eventos, setEventos] = useState([]);
  const [eventoId, setEventoId] = useState("");
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Cargar lista de eventos al inicio
  useEffect(() => {
    async function fetchEventos() {
      setLoading(true);
      try {
        const res = await fetch("/api/eventos-disponibles");
        const data = await res.json();
        setEventos(data.result || []);
      } catch {
        setEventos([]);
      } finally {
        setLoading(false);
      }
    }
    fetchEventos();
  }, []);

  // Cargar catálogo del evento seleccionado
  useEffect(() => {
    if (!eventoId) return;
    setLoading(true);
    async function fetchCatalogo() {
      try {
        const response = await fetch(`/api/catalogo-evento?evento_id=${eventoId}`);
        const data = await response.json();
        if (data.result) {
          const productos = data.result.map((item: any) => ({
            id: item.evento_miembro_acaucab_id,
            name: item.cerveza_nombre,
            price: item.precio_unitario || 0,
            stock: item.cantidad_disponible,
            presentation: item.presentacion_capacidad,
            quantity: 0,
            description: `${item.tipo_cerveza_nombre || ''} ${item.estilo_cerveza_nombre || ''}`.trim(),
          }));
          setProducts(productos);
        } else {
          setProducts([]);
        }
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalogo();
  }, [eventoId]);

  const handleAddToCart = useCallback((productId: any, quantity: number) => {
    const product = products.find((p: any) => p.id === productId);
    if (!product) return;
    if (quantity === 0) {
      setCart((prev: any) => prev.filter((item: any) => item.id !== productId));
    } else if (quantity > 0 && quantity <= product.stock) {
      setCart((prev: any) => {
        const exists = prev.find((item: any) => item.id === productId);
        if (!exists) return [...prev, { ...product, quantity }];
        return prev.map((item: any) => item.id === productId ? { ...item, quantity } : item);
      });
    }
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const term = searchTerm.toLowerCase();
    return products.filter((p: any) => p.name.toLowerCase().includes(term));
  }, [products, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 border border-blue-200">
          <div className="bg-blue-700 p-6 text-white relative">
            <h1 className="text-3xl font-bold text-center">Caja Evento</h1>
          </div>
          <div className="px-6 pt-4">
            <SelectEvento eventos={eventos} onSelect={setEventoId} />
            {eventoId && (
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 mb-4"
              />
            )}
          </div>
          {loading ? (
            <div className="p-8 text-center">Cargando...</div>
          ) : eventoId && (
            <div className="p-6">
              <h2 className="text-xl font-bold text-blue-800 mb-4">Productos Disponibles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[600px] overflow-y-auto p-2">
                {filteredProducts.length === 0 ? (
                  <p className="col-span-full text-center text-gray-600 py-8">
                    No hay productos disponibles que coincidan con la búsqueda.
                  </p>
                ) : (
                  filteredProducts.map((product: any) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      initialQuantity={cart.find((item: any) => item.id === product.id)?.quantity || 0}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 