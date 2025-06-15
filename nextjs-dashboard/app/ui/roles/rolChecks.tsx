'use client'
import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Product interface for type safet

// @ts-ignore
export default function RolChecks({ product/*, onAddToCart, initialQuantity*/ }){
/*const [quantity, setQuantity] = useState(initialQuantity);

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

const handleAddClick = () => {
    // Only add if quantity is valid and within stock
    if (quantity > 0 && quantity <= product.stock) {
        onAddToCart(product.id, quantity);
    } else if (quantity === 0 && initialQuantity > 0) {
        // Allow removing item by setting quantity to 0 and clicking Add
        onAddToCart(product.id, 0);
    }
};
*/
    const checks = ['crear','consultar','editar','eliminar'];
return (
    <div className="bg-white p-6 flex border-0 flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 ">
        <div className="flex-grow text-center sm:text-left">
            <h3 className="text-xl font-semibold text-gray-800">{product.descripcion}</h3>
        </div>
        <div className="flex items-center space-x-2">
            {[...Array(4)].map((_, index) => (
                <div key={index} className="flex-grow items-center space-x-2">
                <p className="text-sm text-gray-800">{checks[index]}</p>
                    <input className={"rounded"}
                type="checkbox"
                //value={quantity === 0 && initialQuantity === 0 ? '' : quantity} // Display empty if initial 0 and current 0
                //onChange={handleQuantityChange}

                    />
                </div>
            ))}

        </div>
    </div>
);
};