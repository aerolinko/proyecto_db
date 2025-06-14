'use client'
import React from "react";

// Product interface for type safety
interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
}

// Cart Item interface
interface CartItem {
    product: Product;
    quantity: number;
}

interface CartItemProps {
    item: CartItem;
}

// @ts-ignore
export default function CartItem({ item }){
    return (
        <div className="flex justify-between items-center py-3 border-b border-purple-100 last:border-b-0">
            <span className="text-gray-700 font-medium">{item.product.name} x {item.quantity}</span>
            <span className="text-purple-700 font-semibold">${(item.product.price * item.quantity).toFixed(2)}</span>
        </div>
    );
};