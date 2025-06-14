'use client'
import React, { useState, useEffect, useMemo, useCallback } from 'react';

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

// --- Mock Database (In-memory for demonstration) ---
const mockProducts: Product[] = [
    { id: '1', name: 'Manzanas (kg)', price: 2.50, stock: 100 },
    { id: '2', name: 'Leche (1L)', price: 1.80, stock: 50 },
    { id: '3', name: 'Pan Integral', price: 3.20, stock: 30 },
    { id: '4', name: 'Huevos (docena)', price: 4.00, stock: 25 },
    { id: '5', name: 'Cereal (caja)', price: 5.75, stock: 40 },
    { id: '6', name: 'Agua Embotellada (6pk)', price: 3.00, stock: 80 },
    { id: '7', name: 'Arroz (kg)', price: 1.20, stock: 120 },
    { id: '8', name: 'Aceite de Oliva (L)', price: 8.90, stock: 20 },
];

/**
 * ProductCard Component
 * Displays individual product details, quantity picker, and an "Add to Cart" button.
 */
interface ProductCardProps {
    product: Product;
    onAddToCart: (productId: string, quantity: number) => void;
    initialQuantity: number; // For pre-filling the quantity if already in cart
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, initialQuantity }) => {
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
        setQuantity(prev => Math.min(prev + 1, product.stock)); // Don't exceed stock
    };

    const decrement = () => {
        setQuantity(prev => Math.max(prev - 1, 0)); // Don't go below zero
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
                <p className="text-gray-600">Precio: ${product.price.toFixed(2)}</p>
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

/**
 * CartItem Component
 * Displays an item within the shopping cart summary.
 */
interface CartItemProps {
    item: CartItem;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
    return (
        <div className="flex justify-between items-center py-3 border-b border-purple-100 last:border-b-0">
            <span className="text-gray-700 font-medium">{item.product.name} x {item.quantity}</span>
            <span className="text-purple-700 font-semibold">${(item.product.price * item.quantity).toFixed(2)}</span>
        </div>
    );
};

/**
 * App (Main Component)
 * Manages product list, cart, and overall checkout logic.
 */
const App: React.FC = () => {
    const [products] = useState<Product[]>(mockProducts);
    const [cart, setCart] = useState<Record<string, CartItem>>({}); // Using a record for easy access by productId
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const showMessage = useCallback((type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        const timer = setTimeout(() => {
            setMessage(null);
        }, 3000); // Message disappears after 3 seconds
        return () => clearTimeout(timer);
    }, []);

    // Function to add or update an item in the cart
    const handleAddToCart = useCallback((productId: string, quantity: number) => {
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

export default App;
