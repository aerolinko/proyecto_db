'use client' // This directive indicates that this is a client-side component in a Next.js application.

// Import React core and several Hooks for managing state, handling side effects, and optimizing performance.
import React, { useState, useEffect, useMemo, useCallback } from 'react';
// Imports the ProductCard component, likely defined in a separate file within the app's UI directory.
import ProductCard from "@/app/ui/venta/ProductCard";
// Imports the CartItem component, also likely defined in a separate file within the app's UI directory.
import CartItem from "@/app/ui/venta/CartItem";
import MetodoPago from "@/app/ui/venta/MetodoPago";

// Defines the main functional component for the sales page.
export default function Page ({
                                  params
                              }:{
    // Los params de ruta son directamente accesibles, no como una Promise
    params: { usernameid: number }
}){
    // @ts-ignore
    const { usernameid } = React.use(params);
    console.log(usernameid);
    // Declares a local variable `allProducts` initialized as an empty array.
    // This variable is not used after initialization, as `products` state directly receives API data.
    let allProducts:any[]=[];
    // `useState` hook to manage the list of products displayed on the page.
    // `products` holds the current array of products, `setProducts` is the function to update it.
    const [products, setProducts] = useState(allProducts);
    const [pagando, setPagando] = useState(false);
    // `useState` hook to manage the shopping cart.
    // `cart` is an object where keys are product IDs and values are objects containing product details and quantity.
    const [cart, setCart] = useState<Record<string, any>>([]); // Using a record for easy access by productId
    // `useState` hook to manage temporary success or error messages displayed to the user.
    // `message` stores the current message (type and text), `setMessage` updates it.
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    // `useEffect` hook to perform side effects, specifically fetching products when the component mounts.
    // The empty dependency array `[]` ensures this function runs only once after the initial render.
    useEffect(() => {
        // Defines an asynchronous function to fetch products from the API.
        async function fetchProducts() {
            try {
                // Makes a GET request to the `/api/products` endpoint.
                const response = await fetch("/api/products", {
                    method: "GET", // Specifies the HTTP method as GET.
                    headers: { "Content-Type": "application/json" } // Sets the request header.
                });
                // Checks if the HTTP response was successful (status code 200-299).
                if (!response.ok) {
                    // Throws an error if the HTTP response indicates a problem.
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Parses the JSON body of the response.
                const data = await response.json();

                // Transforms the fetched data (`data.result`) into a format suitable for the application.
                // It maps each item to an object with `id`, `name`, and randomly generated `price` and `stock`.
                const transformedProducts = data.result.map((item: any) => ({
                    id: item.anaquel_cerveza_id, // Uses `cerveza_presentacion_id` as the product ID.
                    name: item.nombre, // Uses `nombre` as the product name.
                    // IMPORTANT: Adding placeholder price and stock as your API only returns 'nombre' and 'cerveza_presentacion_id'.
                    // In a real application, these should come from your backend.
                    price: parseFloat(item.precio_unitario.toFixed(2)), // Generates a random price between 1 and 10.
                    stock: item.cantidad, // Generates a random stock quantity between 10 and 60.
                    presentation: item.cap_volumen,
                    quantity: 0
                }));
                setProducts(transformedProducts); // Updates the `products` state with the transformed data, triggering a re-render.
            } catch (err: any) {
                // Catches any errors that occur during the fetch operation.
                console.error("Error fetching products:", err); // Logs the error to the console for debugging.
                // Set error message // This line is an incomplete comment, likely intended to set an error state.
            }
        }

        fetchProducts(); // Calls the `fetchProducts` function when the component mounts.
    }, []);
    // Empty dependency array means this effect runs only once after the initial render.
    // `useCallback` hook to memoize the `showMessage` function.
    // This prevents the function from being recreated on every render, which can improve performance
    // if it's passed as a prop to child components.
    const showMessage = useCallback((type: 'success' | 'error', text: string) => {
        setMessage({ type, text }); // Sets the message state.
        // Sets a timeout to clear the message after 3 seconds.
        const timer = setTimeout(() => {
            setMessage(null);
        }, 3000); // Message disappears after 3 seconds
        // Returns a cleanup function that clears the timeout if the component unmounts or the effect re-runs.
        return () => clearTimeout(timer);
    }, []); // Empty dependency array as this function doesn't depend on any props or state within its closure.
    // `useCallback` hook to memoize the `handleAddToCart` function.
    // This function handles adding a product to the cart or updating its quantity.

    const handleAddToCart = useCallback((productId: number, quantity: number) => {
        // Finds the product in the `products` array using its `productId`.
        const product = products.find(p => p.id === productId);
        // If the product is not found, displays an error message and exits the function.
        if (!product) {
            showMessage('error', 'Producto no encontrado.');
            return;
        }
        // Checks if the desired quantity is 0.
        if (quantity === 0) {
            // Updates the cart by removing the item with `productId`.
            setCart(prevCart => {
                // @ts-ignore
                const newCart = [ ...prevCart ];// Creates a shallow copy of the previous cart state.
                newCart.splice(newCart.findIndex(p => p.id === productId),newCart.findIndex(p => p.id === productId)+1); // Deletes the item from the new cart object.
                showMessage('success', `${product.name} eliminado del carrito.`); // Displays a success message.
                return newCart; // Returns the new cart state.
            });
            // Checks if the desired quantity is positive and does not exceed the product's stock.
        } else if (quantity > 0 && quantity <= product.stock) {
            // Updates the cart by adding or updating the item with `productId`.
            setCart(prevCart => {
                // @ts-ignore
                const newCart = [ ...prevCart ];
                const existingItem = prevCart.find((p:any) => p.id === productId);
                if(!existingItem) {
                    product.quantity=quantity;// Checks if the item already exists in the cart.
                     newCart.push(product);
                }
                else {
                    let i = newCart.findIndex(p => p.id === productId);
                    newCart[i].quantity = quantity;
                }
                // Displays appropriate message based on whether the item was new or updated.
                showMessage('success', `${product.name} (x${quantity}) ${existingItem ? 'actualizado' : 'agregado'} al carrito.`);
                return newCart; // Returns the new cart state.
            });
        } else {
            // If the quantity is invalid (e.g., negative or exceeding stock), displays an error message.
            showMessage('error', `Cantidad inválida o excede el stock para ${product.name}.`);
        }
    }, [products, showMessage]); // Dependencies: `products` (to find product details) and `showMessage` (to display messages).

    // `useMemo` hook to calculate and memoize the filtered list of products.
    // This re-calculates only when `products` or `searchTerm` changes.
    const filteredProducts = useMemo(() => {
        if (!searchTerm) {
            return products; // If no search term, return all products.
        }
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return products.filter(product =>
            product.name.toLowerCase().includes(lowerCaseSearchTerm)
        );
    }, [products, searchTerm]);

    // `useMemo` hook to memoize the calculation of the total cart price.
    // This calculation will only re-run if the `cart` state changes, optimizing performance.
    const total = useMemo(() => {
        // Iterates over the values (individual cart items) in the `cart` object.
        // `reduce` sums up the total price by multiplying each item's price by its quantity.
        console.log('carrito: ',cart);
        return cart.reduce((sum:number, item:any) => sum + item.price * item.quantity, 0);
    }, [cart]); // Dependency: `cart` state.

    // Defines the `handleCheckout` function, which simulates the checkout process.
    const handleCheckout = () => {
        setPagando(true);
        setSearchTerm(''); // Clears the cart after checkout.
        // In a real app, you'd send this data to a backend, update stock, etc. // Comment indicating next steps for a production app.
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 font-sans">
            {!pagando ? (
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 border border-purple-200">
                        {/* Header Section */}
                        <div className="bg-purple-700 p-6 text-white">
                            <h1 className="text-3xl font-bold text-center">Registro de Ventas</h1>
                        </div>

                        {/* Message Display */}
                        {message && (
                            <div className={`p-4 mx-4 mt-4 rounded-lg text-center font-semibold
                                ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {message.text}
                            </div>
                        )}

                        {/* Search Bar */}
                        <div className="px-6 pt-4">
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Products Section */}
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-purple-800 mb-4">Productos Disponibles</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-2">
                                {filteredProducts.length === 0 ? (
                                    <p className="col-span-full text-center text-gray-600 py-8">
                                        No hay productos disponibles que coincidan con la búsqueda.
                                    </p>
                                ) : (
                                    filteredProducts.map(product => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            onAddToCart={handleAddToCart}
                                            initialQuantity={cart.find((item: any) => item.id == product.id)?.quantity || 0}
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Cart Section */}
                        <div className="p-6 border-t border-purple-200">
                            <h2 className="text-xl font-bold text-purple-800 mb-4">Tu Carrito</h2>
                            {cart.length === 0 ? (
                                <p className="text-gray-600 text-center py-4">El carrito está vacío.</p>
                            ) : (
                                <>
                                    <div className="bg-purple-50 rounded-lg shadow-inner max-h-[200px] overflow-y-auto">
                                        {cart.map((item: any) => (
                                            <CartItem key={item.id} item={item} />
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-purple-300">
                                        <span className="text-lg font-bold text-purple-800">Total:</span>
                                        <span className="text-xl font-extrabold text-purple-900">{total.toFixed(2)}Bs.</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Checkout Button */}
                        <div className="p-6 border-t border-purple-200">
                            <button
                                onClick={handleCheckout}
                                className={`w-full py-3 rounded-lg text-lg font-bold text-white transition-all duration-200
                                    ${cart.length > 0
                                    ? 'bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg'
                                    : 'bg-gray-400 cursor-not-allowed'}`}
                                disabled={cart.length === 0}
                            >
                                Continuar al Pago
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <MetodoPago cart={cart} setPagando={setPagando} usernameid={usernameid} setProducts={setProducts} setCart={setCart} />
            )}
        </div>
    );
}
