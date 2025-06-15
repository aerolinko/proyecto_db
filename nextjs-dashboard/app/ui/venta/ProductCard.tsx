'use client'
import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Product interface for type safety
interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    presentation: string;
}

interface ProductCardProps {
    product: Product;
    onAddToCart: (productId: string, quantity: number) => void;
    initialQuantity: number; // For pre-filling the quantity if already in cart
}

// @ts-ignore
export default function ProductCard({ product, onAddToCart, initialQuantity }){
    const [quantity, setQuantity] = useState(initialQuantity);

    // Update internal quantity state if initialQuantity prop changes (e.g., cart is cleared)
    useEffect(() => {
        setQuantity(initialQuantity);
    }, [initialQuantity]);

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 0) {
            setQuantity(value);
        } else if (e.target.value === '') {
            setQuantity(0); // Allow clearing the input
        }
    };

    const increment = () => {
        setQuantity((prev: number) => Math.min(prev + 1, product.stock)); // Don't exceed stock
    };

    const decrement = () => {
        setQuantity((prev: number) => Math.max(prev - 1, 0)); // Don't go below zero
    };

    const handleAddClick = () => {
        // Only add if quantity is valid and within stock
        if (quantity > 0 && quantity <= product.stock) {
            onAddToCart(product.id, quantity);
        } else if (quantity === 0 && initialQuantity > 0) {
            // Allow removing item by setting quantity to 0 and clicking Add
            onAddToCart(product.id, 0);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 border border-gray-200">
            <div className="flex-grow text-center sm:text-left">
                <h3 className="text-xl font-semibold text-gray-800">{product.name}</h3>
                <h3 className="text-amber-700 text-m font-semibold text-gray-800">{product.presentation} mml</h3>
                <p className="text-gray-600">Precio: </p>
                <p className={`text-sm ${product.stock < 10 ? 'text-red-600' : 'text-gray-500'}`}>
                    Stock: {product.stock} unidades
                </p>
            </div>
            <div className="flex items-center space-x-2">
                <button
                    onClick={decrement}
                    className="p-2 bg-purple-200 text-purple-800 rounded-full hover:bg-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-150 ease-in-out"
                    aria-label={`Decrease quantity of ${product.name}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    </svg>
                </button>
                <input
                    type="number"
                    value={quantity === 0 && initialQuantity === 0 ? '' : quantity} // Display empty if initial 0 and current 0
                    onChange={handleQuantityChange}
                    min="0"
                    max={product.stock}
                    className="w-16 text-center border rounded-md py-1 px-2 text-lg font-medium focus:ring-purple-500 focus:border-purple-500"
                    aria-label={`Quantity of ${product.name}`}
                />
                <button
                    onClick={increment}
                    className="p-2 bg-purple-200 text-purple-800 rounded-full hover:bg-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-150 ease-in-out"
                    aria-label={`Increase quantity of ${product.name}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>
            <button
                onClick={handleAddClick}
                disabled={quantity === 0 && initialQuantity === 0} // Disable if quantity is 0 and not already in cart
                className={`px-5 py-2 rounded-lg font-bold text-white shadow-md transition-all duration-200 ease-in-out
                ${(quantity > 0 && quantity <= product.stock) || (quantity === 0 && initialQuantity > 0)
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-gray-400 cursor-not-allowed'}`}
            >
                {initialQuantity > 0 && quantity > 0 ? 'Actualizar' : (quantity === 0 && initialQuantity > 0 ? 'Eliminar' : 'Agregar')}
            </button>
        </div>
    );
};