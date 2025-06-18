'use client' // This directive indicates that this is a client-side component in a Next.js application.

// Import React core and several Hooks for managing state, handling side effects, and optimizing performance.
import React, { useState, useEffect, useMemo, useCallback } from 'react';
// Imports the ProductCard component, likely defined in a separate file within the app's UI directory.
import ProductCard from "@/app/ui/venta/ProductCard";
// Imports the CartItem component, also likely defined in a separate file within the app's UI directory.
import CartItem from "@/app/ui/venta/CartItem";
import MetodoPago from "@/app/ui/venta/MetodoPago";

// Defines the main functional component for the sales page.
export default function Page (){
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
                    id: item.cerveza_presentacion_id, // Uses `cerveza_presentacion_id` as the product ID.
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
                const newCart = [ ...prevCart ];// Creates a shallow copy of the previous cart state.
                newCart.splice(newCart.findIndex(p => p.id === productId),newCart.findIndex(p => p.id === productId)+1); // Deletes the item from the new cart object.
                showMessage('success', `${product.name} eliminado del carrito.`); // Displays a success message.
                return newCart; // Returns the new cart state.
            });
            // Checks if the desired quantity is positive and does not exceed the product's stock.
        } else if (quantity > 0 && quantity <= product.stock) {
            // Updates the cart by adding or updating the item with `productId`.
            setCart(prevCart => {
                const newCart = [ ...prevCart ];
                const existingItem = prevCart.find(p => p.id === productId);
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
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [cart]); // Dependency: `cart` state.

    // Defines the `handleCheckout` function, which simulates the checkout process.
    const handleCheckout = () => {
        setPagando(true);
        // If the cart is empty, displays an error message and stops the checkout process.
        if (Object.keys(cart).length === 0) {
            showMessage('error', 'El carrito está vacío. Agrega algunos productos.');
            return;
        }
        // Displays a success message for the completed purchase, including the total.
        // Simulates reducing product stock on the client-side.
        // IMPORTANT: In a real application, stock updates should be handled on the backend.
        products.forEach((product) => {
            const existingItem = Object.keys(cart); // Gets an array of product IDs currently in the cart.
            // Checks if the current product is in the cart.
            if(existingItem.includes(product.id.toString())){
                // Reduces the product's stock by the quantity in the cart.
                // NOTE: This directly mutates the `product` object within the `products` array.
                // In React, it's generally better to create a new array/object for state updates.
                product.stock = product.stock - cart[product.id].quantity;
            };
        })

        /*setCart([])*/
        setSearchTerm(''); // Clears the cart after checkout.
        // In a real app, you'd send this data to a backend, update stock, etc. // Comment indicating next steps for a production app.
    };


    return (
        // Main container for the page, setting a minimum height, background gradient, and layout.
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex flex-col items-center p-6 font-sans">
        {/* Inner container for the sales application, with styling for background, padding, shadow, and border. */}
        { !pagando ? (
        <div>
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-4xl mb-8 border border-purple-200">
                {/* Main title of the application. */}
                <h1 className="text-4xl font-extrabold text-purple-800 text-center mb-6 pb-4 border-b-2 border-purple-300">
                    PLACEHOLDER NO TIENE NADA DE LOGICA IMPLEMENTADA (looks hella cool tho) {/* Placeholder title. */}
                </h1>
                {/* Message display area, conditionally rendered based on the `message` state. */}
                {message && (
                    <div className={`p-4 rounded-lg mb-4 text-center text-lg font-semibold
                           ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message.text} {/* Displays the actual message text. */}
                    </div>
                )}
                <div className="mb-6 w-full">
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                    {/* Section title for available products. */}
                    <h2 className="text-2xl font-bold text-purple-700 mb-4">Productos Disponibles</h2>
                    {/* Grid container for displaying product cards. */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredProducts.length === 0 ? ( // Use filteredProducts here
                        // Message if no products are available after loading or after filtering.
                        <p className="col-span-full text-center text-gray-600">No hay productos disponibles que coincidan con la búsqueda.</p>
                    ) : (
                        // Map through the `filteredProducts` array and render a `ProductCard` for each.
                        filteredProducts.map(product => (
                            <ProductCard
                                key={product.id} // `key` prop for efficient list rendering in React.
                                product={product} // Passes the entire product object as a prop.
                                onAddToCart={handleAddToCart} // Passes the cart-handling function as a prop.
                                initialQuantity={cart.find((item)=>item.id==product.id) ?.quantity || 0} // Passes the current quantity of this product in the cart.
                            />
                        ))
                    )}
                </div>
                {/* Section for the shopping cart. */}
                <div className="mt-10 pt-6 border-t-2 border-purple-300">
                    {/* Section title for the cart. */}
                        <h2 className="text-2xl font-bold text-purple-700 mb-4">Tu Carrito</h2>
                    {/* Conditionally renders content based on whether the cart is empty. */}
                    {Object.keys(cart).length === 0 ? (
                        <p className="text-gray-600 text-center text-lg">El carrito está vacío.</p> // Message if cart is empty.
                    ) : (
                    // Container for cart items if the cart is not empty.
                    <div className="bg-purple-50 p-6 rounded-lg shadow-inner border border-purple-200">
                        {/* Maps through the values (items) in the `cart` object to render `CartItem` components. */}
                        {cart.map(item => (
                            <CartItem key={item.id} item={item} /> // Renders each `CartItem` with its unique key and item data.
                        ))}
                        {/* Displays the total price of the cart. */}
                        <div className="flex justify-between items-center mt-6 pt-4 border-t-2 border-purple-300">
                            <span className="text-xl font-bold text-purple-800">Total:</span>
                            <span className="text-2xl font-extrabold text-purple-900">${total.toFixed(2)}</span> {/* Displays the calculated total formatted to two decimal places. */}
                        </div>
                    </div>
                    )}
                        {/* Checkout button. */}
                        <button
                            onClick={handleCheckout} // Triggers the checkout function on click.
                            // Dynamic styling for the button based on whether the cart is empty.
                            className={`mt-8 w-full py-4 rounded-xl text-xl font-bold text-white shadow-lg transition-all duration-200 ease-in-out
                            ${Object.keys(cart).length > 0 ? 'bg-green-600 hover:bg-green-700 transform hover:-translate-y-1' : 'bg-gray-400 cursor-not-allowed'}`}
                            // Button is disabled if the cart is empty.
                            disabled={Object.keys(cart).length === 0}
                        >
                            Continuar al Pago{/* Button text. */}
                        </button>
                </div>
            </div>
        </div>
        ):(
            <div>
                <MetodoPago cart={cart} setPagando={setPagando}/>
            </div>
        )}
    </div>
    );
};
