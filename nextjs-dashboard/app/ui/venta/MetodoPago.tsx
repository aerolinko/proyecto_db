'use client'
import React, { useState, useEffect } from 'react';
import {ArrowLeftCircleIcon, PlusIcon} from "@heroicons/react/24/outline";
import RegistrarPago from "@/app/ui/venta/RegistrarPago";
import {redirect} from "next/navigation";
import {red} from "next/dist/lib/picocolors";


// @ts-ignore
export default function MetodoPago({ cart, setPagando, setProducts, usernameid, setCart }) {
    const [tasa, setTasa] = useState(0);
    // Update internal quantity state if initialQuantity prop changes (e.g., cart is cleared)
    useEffect(() => {
        async function fetchTasa() {
            try {
                // Makes a GET request to the `/api/products` endpoint.
                const response = await fetch("/api/ventas", {
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
                setTasa(data.res[0].tasa);
            } catch (err: any) {
                // Catches any errors that occur during the fetch operation.
                console.error("Error fetching products:", err); // Logs the error to the console for debugging.
                // Set error message // This line is an incomplete comment, likely intended to set an error state.
            }
        }
        fetchTasa();
    }, []);

    // State for client selection
    const [selectedClientId, setSelectedClientId] = useState('');
    const [foundClientId, setFoundClientId] = useState<any>('');
    const [ventaClientId, setVentaClientId] = useState<any>(''); // Nuevo estado para guardar el cliente de la venta
    const [ventaCart, setVentaCart] = useState<any[]>([]); // Nuevo estado para guardar el carrito de la venta
    const [ventaPaymentMethods, setVentaPaymentMethods] = useState<any[]>([]); // Nuevo estado para guardar los métodos de pago de la venta

    // State for payment methods
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectablePaymentMethod, setSelectablePaymentMethod] = useState([]);
    const [newPaymentMethodType, setNewPaymentMethodType] = useState<any>([]);
    const [newPaymentMethodAmount, setNewPaymentMethodAmount] = useState('');
    const [newPaymentMethodBanco, setNewPaymentMethodBanco] = useState('');
    const [newPaymentMethodNumeroCheque, setNewPaymentMethodNumeroCheque] = useState('');
    const [newPaymentMethodNumeroCuenta, setNewPaymentMethodNumeroCuenta] = useState('');

    const [error, setError] = useState('');
    // State for custom modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [showFacturaButton, setShowFacturaButton] = useState(false);
    const [registrando, setRegistrando] = useState(false);
    console.log(newPaymentMethodType)
    // Calculate cart total
    const cartTotal = cart.reduce((sum:any, item:any) => sum + (item.price * item.quantity), 0);
    const totalPaid = paymentMethods.reduce((sum, method:any) => sum + method.cantidad, 0);
    const remainingBalance = cartTotal - totalPaid;
    // Add a new payment method
    const handleAddPayment = () => {
        let filteredpayments = paymentMethods;

        // @ts-ignore
        if(filteredpayments.some((element)=>element.tipo=='puntos') && newPaymentMethodType.tipo=='puntos'){
            filteredpayments = filteredpayments.filter((element:any)=>element.tipo!=='puntos');
        }

        if ((newPaymentMethodType.tipo == 'efectivo' || newPaymentMethodType.tipo == 'dolares') && (parseFloat(newPaymentMethodAmount) % 1 != 0)) {
            setModalMessage("Por favor solo valores enteros para pagos en efectivo o divisas.");
            setIsModalOpen(true);
            return;
        }
        const totalPaidcheck = filteredpayments.reduce((sum, method:any) => sum + method.cantidad, 0);

        let amount = parseFloat(newPaymentMethodAmount);
        const numero_cuenta = newPaymentMethodNumeroCuenta;
        const numero_cheque = newPaymentMethodNumeroCheque;
        const banco = newPaymentMethodBanco;
        if (!foundClientId) {
            setModalMessage("Por favor especifique el cliente.");
            setIsModalOpen(true);
            return;
        }

        if (isNaN(amount) || amount <= 0) {
            setModalMessage("Por favor introduzca un valor postivo válido.");
            setIsModalOpen(true);
            return;
        }

        if ((totalPaidcheck + amount > cartTotal) ||( newPaymentMethodType.tipo=='dolares' && (totalPaidcheck + amount*tasa > cartTotal))) { // Adding a small tolerance for floating point issues
            setModalMessage("El total excede el monto a pagar. Por favor ajuste la cantidad.");
            setIsModalOpen(true);
            return;
        }

        if(newPaymentMethodType.tipo == 'dolares'){
            amount = amount * tasa;
        }

        // @ts-ignore
        setPaymentMethods([...filteredpayments, {
            tipo: newPaymentMethodType.tipo,
            id: newPaymentMethodType.metodo_pago_id ? newPaymentMethodType.metodo_pago_id : null,
            cantidad: amount,
            numero_tarjeta: newPaymentMethodType.numero ? newPaymentMethodType.numero : null,
            banco: banco ? banco : null,
            numero_cuenta: numero_cuenta ? numero_cuenta : null,
            numero_cheque: numero_cheque ? numero_cheque : null,
        }]);

        setNewPaymentMethodAmount('');
        setNewPaymentMethodBanco('')
        setNewPaymentMethodNumeroCheque('')
        setNewPaymentMethodNumeroCuenta('')// Clear amount field after adding
    };
    // Remove a payment method
    const handleRemovePayment = (index:number) => {
        const updatedPayments = paymentMethods.filter((_, i) => i !== index);
        setPaymentMethods(updatedPayments);
    };

    // Handle form submission (placeholder for actual transaction logic)
    const handleSubmit = async () => {
        if (remainingBalance > 0.01) { // Check if remaining balance is negligible
            setModalMessage(`No se pudo completar el pago. Total faltante: ${remainingBalance.toFixed(2)}Bs.`);
            setIsModalOpen(true);
            return;
        }
        console.log('metodos de pago',paymentMethods);
        console.log('carrito',cart);
        console.log('cliente encontrado',foundClientId);

        const response = await fetch("/api/ventas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({paymentMethods, cart, foundClientId}),
        })

        if (response.ok) {
            const data = await response.json();
            setVentaClientId(foundClientId); // Guardar el cliente antes de limpiarlo
            setVentaCart([...cart]); // Guardar el carrito antes de limpiarlo
            setVentaPaymentMethods([...paymentMethods]); // Guardar los métodos de pago antes de limpiarlos
            setFoundClientId('');
            setCart([]); // Limpiar el carrito
            setPaymentMethods([]); // Limpiar los métodos de pago
            setShowFacturaButton(true); // Activar el botón de factura
            setIsModalOpen(true)
            setModalMessage('Compra realizada con éxito!')
            
            // Guardar el ID de la venta para generar la factura
            const ventaId = data.res.ventaId;
            
            // El modal permanecerá abierto hasta que el usuario haga clic en "OK"
        }

    };

    // Función para generar y abrir la factura en nueva pestaña
    const handleGenerarFactura = async () => {
        try {
            console.log('🔄 Iniciando generación de factura...');
            console.log('📦 Datos del carrito guardado:', ventaCart);
            console.log('📦 Tamaño del carrito guardado:', ventaCart.length);
            console.log('💳 Métodos de pago guardados:', ventaPaymentMethods);
            console.log('💳 Tamaño de métodos de pago guardados:', ventaPaymentMethods.length);
            console.log('👤 Cliente de la venta:', ventaClientId);
            console.log('👤 Tipo de ventaClientId:', typeof ventaClientId);
            
            // Validar que el cliente existe
            if (!ventaClientId || typeof ventaClientId === 'string' || Object.keys(ventaClientId).length === 0) {
                console.error('❌ No hay cliente de la venta o el cliente está vacío');
                alert('Error: No hay cliente de la venta. Por favor, completa una venta antes de generar la factura.');
                return;
            }
            
            // Validar que hay productos en el carrito
            if (!ventaCart || ventaCart.length === 0) {
                console.error('❌ No hay productos en el carrito guardado');
                alert('Error: No hay productos en el carrito guardado.');
                return;
            }
            
            // Validar que hay métodos de pago
            if (!ventaPaymentMethods || ventaPaymentMethods.length === 0) {
                console.error('❌ No hay métodos de pago guardados');
                alert('Error: No hay métodos de pago guardados.');
                return;
            }
            
            const requestData = {
                cart: ventaCart, // Usar el carrito guardado
                paymentMethods: ventaPaymentMethods, // Usar los métodos de pago guardados
                foundClientId: ventaClientId, // Usar el cliente guardado de la venta
                ventaId: null // Se generará automáticamente
            };
            
            console.log('📤 Enviando datos a la API:', requestData);
            
            const response = await fetch("/api/factura", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData),
            });

            console.log('📥 Respuesta de la API:', response.status, response.statusText);

            if (response.ok) {
                console.log('✅ API respondió correctamente');
                const blob = await response.blob();
                console.log('📄 Blob generado:', blob.size, 'bytes');
                
                // Crear URL del blob y abrir en nueva pestaña
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
                
                // Limpiar la URL después de un tiempo
                setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                }, 1000);
                
                console.log('✅ PDF abierto en nueva pestaña exitosamente');
            } else {
                console.error('❌ Error en la API:', response.status);
                const errorText = await response.text();
                console.error('❌ Detalles del error:', errorText);
                alert(`Error generando factura: ${response.status} - ${errorText}`);
            }
        } catch (error) {
            console.error('❌ Error general:', error);
            alert(`Error general: ${error}`);
        }
    };

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




    const buscarCliente = async (cliente:string) => {
        setPaymentMethods([]);
    let response
    let tipo;
        if(isNaN(parseInt(cliente))){
            response = await fetch("/api/clientes?RIF=" + cliente, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            tipo = 'juridico';
        } else {
             response = await fetch("/api/clientes?cedula=" + parseInt(cliente), {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            tipo = 'natural';
        }
        const res=await response.json();
        if (res.result && res.result.length > 0) {
            setFoundClientId({...res.result[0],
            tipo:tipo});
            setError('');
            const paymentMethodsSearch = await fetch("/api/clientes?ID=" + res.result[0].cliente_id +'&tipo=' + tipo, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if(paymentMethodsSearch.ok){
                const res=await paymentMethodsSearch.json();
                setSelectablePaymentMethod(res.result);
            }
        }
        else
        {
            setError('No existe el cliente.');
            setFoundClientId('');
        }
    };
    useEffect(()=>{
    },[paymentMethods]);

    useEffect(()=>{
        if(selectablePaymentMethod.length==0){
            setNewPaymentMethodType({tipo:'efectivo'});
        }
        else{
            setNewPaymentMethodType(selectablePaymentMethod[0]);
        }
    }, [selectablePaymentMethod]);

    // Custom Modal Component
    const Modal = ({ message, isOpen, onClose }:{message:string, isOpen:boolean, onClose:any}) => {
        if (!isOpen) return null;
        
        const handleClose = async () => {
            onClose();
            if (showFacturaButton) {
                // Si es una venta exitosa, redirigir después de cerrar el modal
                setTimeout(async () => {
                    setPagando(false);
                    await fetchProducts();
                    redirect(`/${usernameid}/VentaTienda`);
                }, 300);
            }
        };
        
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center mx-4">
                    <p className="text-lg mb-4">{message}</p>
                    <div className="flex flex-col gap-2">
                        {showFacturaButton && (
                            <button
                                onClick={handleGenerarFactura}
                                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200 font-medium"
                            >
                                Ver Factura
                            </button>
                        )}
                        <button
                            onClick={handleClose}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 font-medium"
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        );
    };



    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans flex items-center justify-center">
            {!registrando ? (
                <div className="bg-white rounded-xl shadow-lg w-full max-w-6xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                        <h1 className="text-2xl md:text-3xl font-bold text-center">Ventana de Pago</h1>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-4 mt-4 rounded">
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    <div className="md:flex">
                        {/* Left Column - Client and Cart */}
                        <div className="p-6 md:w-1/2 border-b md:border-b-0 md:border-r border-gray-200">
                            {/* Client Section */}
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Detalles del Cliente
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="clientIdInput" className="block text-sm font-medium text-gray-700 mb-1">
                                            Cédula/RIF
                                        </label>
                                        <input
                                            type="text"
                                            id="clientIdInput"
                                            value={selectedClientId}
                                            onChange={(e) => setSelectedClientId(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Ej: V123456789"
                                            maxLength={12}
                                        />
                                    </div>

                                    {foundClientId && (
                                        <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                                            <p className="text-green-800 font-medium">
                                                Puntos disponibles: <span className="font-bold">{foundClientId.totalpuntos}pts</span>
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => buscarCliente(selectedClientId)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-sm transition duration-200 flex items-center justify-center"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Buscar Cliente
                                    </button>
                                </div>
                            </div>

                            {/* Cart Section */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Carrito
                                </h2>

                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 grid grid-cols-4 gap-2 p-3 text-sm font-medium text-gray-600 border-b border-gray-200">
                                        <span className="col-span-2">Producto</span>
                                        <span className="text-center">Cantidad</span>
                                        <span className="text-right">Precio</span>
                                    </div>

                                    <div className="max-h-64 overflow-y-auto">
                                        {cart.map((item: any) => (
                                            <div key={item.id} className="grid grid-cols-4 gap-2 p-3 text-sm border-b border-gray-200 hover:bg-gray-50 transition duration-150">
                                                <span className="col-span-2 text-gray-800 truncate">{item.name} {item.presentation}ml</span>
                                                <span className="text-center text-gray-600">{item.quantity}</span>
                                                <span className="text-right text-gray-800">{(item.price * 1).toFixed(2)}Bs.</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-3 bg-gray-50 border-t border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-bold text-gray-800">Total:</span>
                                            <span className="text-xl font-extrabold text-blue-600">{cartTotal.toFixed(2)}Bs.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Back Button */}
                            <button
                                onClick={() => setPagando(false)}
                                className='flex relative w-fit mt-4 gap-2 rounded-md bg-gray-200 p-3 font-medium hover:bg-sky-100 hover:text-blue-600 '
                            >
                                <ArrowLeftCircleIcon className="h-5 w-5 mr-1" />
                                <span>Regresar</span>
                            </button>
                        </div>

                        {/* Right Column - Payment Methods */}
                        <div className="p-6 md:w-1/2">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Métodos de Pago
                            </h2>

                            {/* Payment Method Selection */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                                <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700 mb-2">
                                    Seleccionar método de pago
                                </label>

                                <div className="flex items-center space-x-2 mb-3">
                                    <select
                                        id="paymentType"
                                        disabled={!selectedClientId}
                                        value={JSON.stringify(newPaymentMethodType)}
                                        onChange={(e) => setNewPaymentMethodType(JSON.parse(e.target.value))}
                                        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                    >
                                        {selectablePaymentMethod.map((item: any) => (
                                            <option value={JSON.stringify(item)} key={item.metodo_pago_id + item.tipo}>
                                                Tarjeta de {item.tipo} ****{item.numero.substring(12, 16)}
                                            </option>
                                        ))}
                                        <option value={JSON.stringify({ tipo: 'efectivo' })} key={'cash'}>
                                            Efectivo
                                        </option>
                                        <option value={JSON.stringify({ tipo: 'dolares' })} key={'dollar'}>
                                            Divisas ($)
                                        </option>
                                        <option value={JSON.stringify({ tipo: 'cheque' })} key={'cheque'}>
                                            Cheque
                                        </option>
                                        <option value={JSON.stringify({ tipo: 'puntos' })} key={'points'}>
                                            Puntos
                                        </option>
                                    </select>

                                    <button
                                        disabled={!foundClientId}
                                        onClick={() => setRegistrando(true)}
                                        className={`p-2 rounded-md transition duration-200 ${!foundClientId
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                        }`}
                                        title="Registrar nueva tarjeta"
                                    >
                                        <PlusIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Payment Method Details */}
                                {newPaymentMethodType !== undefined && newPaymentMethodType.tipo == 'cheque' && (
                                    <div className="space-y-3 mt-3">
                                        <div>
                                            <label htmlFor="chequeNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                                Número de Cheque
                                            </label>
                                            <input
                                                type="text"
                                                id="chequeNumber"
                                                value={newPaymentMethodNumeroCheque}
                                                maxLength={10}
                                                onChange={(e) => {
                                                    const numbersOnly = e.target.value.replace(/\D/g, '');
                                                    setNewPaymentMethodNumeroCheque(numbersOnly.slice(0, 10));
                                                }}
                                                placeholder="Ej: 1234567890"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="checkAccount" className="block text-sm font-medium text-gray-700 mb-1">
                                                Número de cuenta
                                            </label>
                                            <input
                                                type="text"
                                                id="checkAccount"
                                                value={newPaymentMethodNumeroCuenta}
                                                onChange={(e) => {
                                                    const numbersOnly = e.target.value.replace(/\D/g, '');
                                                    setNewPaymentMethodNumeroCuenta(numbersOnly.slice(0, 20));
                                                }}
                                                placeholder="Ej: 1234567890000000000"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="checkBank" className="block text-sm font-medium text-gray-700 mb-1">
                                                Banco emisor
                                            </label>
                                            <input
                                                type="text"
                                                id="checkBank"
                                                value={newPaymentMethodBanco}
                                                onChange={(e) => setNewPaymentMethodBanco(e.target.value)}
                                                placeholder="Ej: Banesco"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                )}
                                {newPaymentMethodType !== undefined && newPaymentMethodType.tipo == 'dolares' && (
                                    <div className="bg-gray-200 rounded-md p-1.5 w-fit">
                                        <span className="text-green-700">1$ --{'>'} {tasa}Bs.</span>
                                    </div>
                                )}

                                <div className="mt-4">
                                    <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-1">
                                        Monto a pagar
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            {newPaymentMethodType.tipo=='dolares' && (
                                            <span className="text-gray-500">$ </span>
                                            )}
                                            {newPaymentMethodType.tipo!=='dolares' && (
                                                <span className="text-gray-500">Bs. </span>
                                            )}
                                        </div>
                                        <input
                                            type="number"
                                            id="paymentAmount"
                                            value={newPaymentMethodAmount}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (newPaymentMethodType && newPaymentMethodType.tipo === 'puntos' && parseFloat(value) > foundClientId.totalpuntos) {
                                                    setNewPaymentMethodAmount(foundClientId.totalpuntos);
                                                } else {
                                                    setNewPaymentMethodAmount(value);
                                                }
                                            }}
                                            placeholder="0.00"
                                            min="0.01"
                                            step="0.01"
                                            className="block w-full pl-9 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddPayment}
                                    disabled={!foundClientId}
                                    className={`w-full mt-4 py-2 px-4 rounded-md font-medium transition duration-200 shadow-sm ${!foundClientId
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700 text-white'
                                    }`}
                                >
                                    Añadir método de pago
                                </button>
                            </div>

                            {/* Current Payments */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                                <h3 className="text-lg font-medium text-gray-800 mb-3">Pagos registrados</h3>

                                <div className="border border-gray-200 rounded-md overflow-hidden">
                                    <div className="bg-gray-100 grid grid-cols-3 gap-2 p-2 text-sm font-medium text-gray-600">
                                        <span>Tipo</span>
                                        <span className="text-right">Monto</span>
                                        <span className="text-center">Acción</span>
                                    </div>

                                    {paymentMethods.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-gray-500">
                                            No se han añadido métodos de pago
                                        </div>
                                    ) : (
                                        <div className="max-h-48 overflow-y-auto">
                                            {paymentMethods.map((method: any, index) => (
                                                <div key={index} className="grid grid-cols-3 gap-2 p-2 text-sm border-t border-gray-200 hover:bg-gray-50">
                        <span className="text-gray-800 truncate">
                          {method.tipo === 'efectivo' && 'Efectivo'}
                            {method.tipo === 'cheque' && 'Cheque'}
                            {method.tipo === 'dolares' && 'Divisas ($)'}
                            {method.tipo === 'puntos' && `Puntos (${method.cantidad})`}
                            {method.tipo !== 'efectivo' && method.tipo !== 'cheque' && method.tipo !== 'dolares' && method.tipo !== 'puntos' &&
                                `${method.tipo} ****${method.numero_tarjeta?.substring(12, 16) || ''}`
                            }
                        </span>
                                                    <span className="text-right text-gray-800">{method.cantidad.toFixed(2)}Bs.</span>
                                                    <span className="text-center">
                          <button
                              onClick={() => handleRemovePayment(index)}
                              className="text-red-500 hover:text-red-700 transition duration-200"
                          >
                            Eliminar
                          </button>
                        </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between text-gray-700">
                                        <span>Total pagando:</span>
                                        <span className="font-medium">{totalPaid.toFixed(2)}Bs.</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total faltante:</span>
                                        <span className={`font-bold ${remainingBalance > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
                    {remainingBalance.toFixed(2)}Bs.
                  </span>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={!foundClientId}
                                className={`w-full py-3 px-6 rounded-md text-lg font-semibold transition duration-200 shadow-md ${!foundClientId
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                            >
                                Completar Pago
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <RegistrarPago
                    setRegistrando={setRegistrando}
                    foundClientId={foundClientId}
                    setFoundClientId={setFoundClientId}
                    setSelectedClientId={setSelectedClientId}
                    setSelectablePaymentMethod={setSelectablePaymentMethod}
                    setPaymentMethods={setPaymentMethods}
                />
            )}

            {/* Modal */}
            {isModalOpen && (
                <Modal
                    message={modalMessage}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};