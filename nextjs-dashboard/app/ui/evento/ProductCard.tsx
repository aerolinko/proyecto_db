// Versión para Tienda Evento
'use client'
import React, { useState, useEffect } from 'react';

// @ts-ignore
export default function ProductCard({ product, onAddToCart, initialQuantity }) {
    const [quantity, setQuantity] = useState(initialQuantity);

    useEffect(() => {
        setQuantity(initialQuantity);
    }, [initialQuantity]);

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 0) {
            setQuantity(Math.min(value, product.stock));
        } else if (e.target.value === '') {
            setQuantity(0);
        }
    };

    const increment = () => {
        setQuantity((prev: number) => Math.min(prev + 1, product.stock));
    };

    const decrement = () => {
        setQuantity((prev: number) => Math.max(prev - 1, 0));
    };

    const handleAddClick = () => {
        if (quantity > 0 && quantity <= product.stock) {
            onAddToCart(product.id, quantity);
        } else if (quantity === 0 && initialQuantity > 0) {
            onAddToCart(product.id, 0);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Product Info */}
                <div>
                    <h3 className="text-lg font-semibold text-blue-700">{product.name}</h3>
                    <p className="text-gray-500">{product.description}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={decrement} className="px-2 py-1 bg-blue-200 rounded">-</button>
                    <input type="number" value={quantity} onChange={handleQuantityChange} className="w-12 text-center border rounded" />
                    <button onClick={increment} className="px-2 py-1 bg-blue-200 rounded">+</button>
                </div>
                <button onClick={handleAddClick} className="bg-blue-600 text-white px-4 py-2 rounded">Agregar</button>
            </div>
        </div>
    );
}
