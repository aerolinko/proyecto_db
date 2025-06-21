'use client'
import React, { useState, useEffect } from 'react';

export default function ProductCard({ product, onAddToCart, initialQuantity }: ProductCardProps) {
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
        setQuantity((prev) => Math.min(prev + 1, product.stock));
    };

    const decrement = () => {
        setQuantity((prev) => Math.max(prev - 1, 0));
    };

    const handleAddClick = () => {
        if (quantity > 0 && quantity <= product.stock) {
            onAddToCart(product.id, quantity);
        } else if (quantity === 0 && initialQuantity > 0) {
            onAddToCart(product.id, 0);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Product Info */}
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                    <p className="text-amber-600 font-medium">{product.presentation} ml</p>
                    <p className="text-gray-700 mt-1">
                        <span className="font-semibold">${product.price.toFixed(2)}</span>
                    </p>
                    <div className={`mt-2 text-sm font-medium ${product.stock <= 20 ? 'text-red-500' : 'text-green-600'}`}>
                        {product.stock} disponibles
                    </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={decrement}
                            className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                            aria-label={`Decrease quantity of ${product.name}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                        </button>

                        <input
                            type="number"
                            value={quantity === 0 && initialQuantity === 0 ? '' : quantity}
                            onChange={handleQuantityChange}
                            min="0"
                            max={product.stock}
                            className="w-16 text-center border border-gray-300 rounded-lg py-1 px-2 font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            aria-label={`Quantity of ${product.name}`}
                        />

                        <button
                            onClick={increment}
                            className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                            aria-label={`Increase quantity of ${product.name}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>

                    <button
                        onClick={handleAddClick}
                        disabled={quantity === 0 && initialQuantity === 0}
                        className={`w-full px-4 py-2 rounded-lg font-semibold text-white transition-colors duration-200 ${
                            (quantity > 0 && quantity <= product.stock) || (quantity === 0 && initialQuantity > 0)
                                ? 'bg-purple-600 hover:bg-purple-700'
                                : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {initialQuantity > 0 && quantity > 0
                            ? 'Actualizar'
                            : quantity === 0 && initialQuantity > 0
                                ? 'Eliminar'
                                : 'Agregar al carrito'}
                    </button>
                </div>
            </div>
        </div>
    );
};