// Versión para Tienda Evento
'use client'
import React from "react";

// @ts-ignore
export default function CartItem({ item }){
    return (
        <div className="flex justify-between p-6 items-center py-3 border-b border-blue-100 last:border-b-0">
            <span className="text-gray-700 font-medium">{item.name} {item.presentation}ml x {item.quantity}</span>
            <span className="text-blue-700 font-semibold">{(item.price * item.quantity).toFixed(2)}Bs.</span>
        </div>
    );
};
