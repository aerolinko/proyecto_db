'use client'
import React from "react";

// @ts-ignore
export default function CartItem({ item }){
    return (
        <div className="flex justify-between items-center py-3 border-b border-purple-100 last:border-b-0">
            <span className="text-gray-700 font-medium">{item.name} {item.presentation}ml x {item.quantity}</span>
            <span className="text-purple-700 font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    );
};