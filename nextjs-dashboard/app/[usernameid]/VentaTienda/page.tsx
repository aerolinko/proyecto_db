'use client'
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ProductCard from "@/app/ui/venta/ProductCard";
import CartItem from "@/app/ui/venta/CartItem";

export default function Page (){
    let allProducts:any[]=[];
    const [products, setProducts] = useState(allProducts);
    const [cart, setCart] = useState<Record<string, any>>({}); // Using a record for easy access by productId
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch("/api/products", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                const transformedProducts = data.result.map((item: any) => ({
                    id: item.cerveza_presentacion_id, // Ensure id is a string for consistency
                    name: item.nombre,
                    // IMPORTANT: Adding placeholder price and stock as your API only returns 'nombre' and 'cerveza_presentacion_id'.
                    // In a real application, these should come from your backend.
                    price: parseFloat((Math.random() * (10 - 1) + 1).toFixed(2)), // Random price between 1.00 and 10.00
                    stock: Math.floor(Math.random() * 50) + 10 // Random stock between 10 and 60
                }));
                setProducts(transformedProducts); // Update the products state
            } catch (err: any) {
                console.error("Error fetching products:", err);
 // Set error message
            }
        }

        fetchProducts();
    }, []);

    const showMessage = useCallback((type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        const timer = setTimeout(() => {
            setMessage(null);
        }, 3000); // Message disappears after 3 seconds
        return () => clearTimeout(timer);
    }, []);

    // Function to add or update an item in the cart
    const handleAddToCart = useCallback((productId: number, quantity: number) => {
        const product = products.find(p => p.id === productId);
        if (!product) {
            showMessage('error', 'Producto no encontrado.');
            return;
        }

        if (quantity === 0) {
            setCart(prevCart => {
                const newCart = { ...prevCart };
                delete newCart[productId];
                showMessage('success', `${product.name} eliminado del carrito.`);
                return newCart;
            });
        } else if (quantity > 0 && quantity <= product.stock) {
            setCart(prevCart => {
                const existingItem = prevCart[productId];
                const newCart = {
                    ...prevCart,
                    [productId]: { product, quantity }
                };
                showMessage('success', `${product.name} (x${quantity}) ${existingItem ? 'actualizado' : 'agregado'} al carrito.`);
                return newCart;
            });
        } else {
            showMessage('error', `Cantidad inválida o excede el stock para ${product.name}.`);
        }
    }, [products, showMessage]);

    // Calculate total price of items in the cart
    const total = useMemo(() => {
        return Object.values(cart).reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    }, [cart]);

    // Simulate checkout process
    const handleCheckout = () => {

        if (Object.keys(cart).length === 0) {
            showMessage('error', 'El carrito está vacío. Agrega algunos productos.');
            return;
        }
        showMessage('success', `¡Compra realizada con éxito! Total: $${total.toFixed(2)}. Carrito vaciado.`);
        products.forEach((product) => {
            const existingItem = Object.keys(cart);
            if(existingItem.includes(product.id.toString())){
                product.stock = product.stock - cart[product.id].quantity;
            };
        })

        setCart({}); // Clear the cart after checkout
        // In a real app, you'd send this data to a backend, update stock, etc.
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex flex-col items-center p-6 font-sans">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-4xl mb-8 border border-purple-200">
                <h1 className="text-4xl font-extrabold text-purple-800 text-center mb-6 pb-4 border-b-2 border-purple-300">
                    PLACEHOLDER NO TIENE NADA DE LOGICA IMPLEMENTADA (looks hella cool tho)
                </h1>

                {/* Message display area */}
                {message && (
                    <div className={`p-4 rounded-lg mb-4 text-center text-lg font-semibold
                        ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message.text}
                    </div>
                )}

                <h2 className="text-2xl font-bold text-purple-700 mb-4">Productos Disponibles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {products.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={handleAddToCart}
                            initialQuantity={cart[product.id]?.quantity || 0}
                        />
                    ))}
                </div>

                <div className="mt-10 pt-6 border-t-2 border-purple-300">
                    <h2 className="text-2xl font-bold text-purple-700 mb-4">Tu Carrito</h2>
                    {Object.keys(cart).length === 0 ? (
                        <p className="text-gray-600 text-center text-lg">El carrito está vacío.</p>
                    ) : (
                        <div className="bg-purple-50 p-6 rounded-lg shadow-inner border border-purple-200">
                            {Object.values(cart).map(item => (
                                <CartItem key={item.product.id} item={item} />
                            ))}
                            <div className="flex justify-between items-center mt-6 pt-4 border-t-2 border-purple-300">
                                <span className="text-xl font-bold text-purple-800">Total:</span>
                                <span className="text-2xl font-extrabold text-purple-900">${total.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleCheckout}
                        className={`mt-8 w-full py-4 rounded-xl text-xl font-bold text-white shadow-lg transition-all duration-200 ease-in-out
                        ${Object.keys(cart).length > 0 ? 'bg-green-600 hover:bg-green-700 transform hover:-translate-y-1' : 'bg-gray-400 cursor-not-allowed'}`}
                        disabled={Object.keys(cart).length === 0}
                    >
                        Pagar
                    </button>
                </div>
            </div>
        </div>
    );
};
