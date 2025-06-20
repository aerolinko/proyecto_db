'use client'
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import clsx from "clsx";
import {ArrowLeftCircleIcon, PlusIcon} from "@heroicons/react/24/outline";
import RegistrarPago from "@/app/ui/venta/RegistrarPago";


// @ts-ignore
export default function MetodoPago({ cart, setPagando }) {
    const [quantity, setQuantity] = useState();

    // Update internal quantity state if initialQuantity prop changes (e.g., cart is cleared)
    useEffect(() => {

    }, []);

    // State for client selection
    const [selectedClientId, setSelectedClientId] = useState('');
    const [foundClientId, setFoundClientId] = useState('');

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
    const [registrando, setRegistrando] = useState(false);

    // Calculate cart total
    const cartTotal = cart.reduce((sum:any, item:any) => sum + (item.price * item.quantity), 0);
    const totalPaid = paymentMethods.reduce((sum, method:any) => sum + method.cantidad, 0);
    const remainingBalance = cartTotal - totalPaid;
    // Add a new payment method
    const handleAddPayment = () => {
        const amount = parseFloat(newPaymentMethodAmount);
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

        if (totalPaid + amount > cartTotal + 0.01) { // Adding a small tolerance for floating point issues
            setModalMessage("El total excede el monto a pagar. Por favor ajuste la cantidad.");
            setIsModalOpen(true);
            return;
        }


        // @ts-ignore
        setPaymentMethods([...paymentMethods, {
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
            setModalMessage(`No se pudo completar el pago. Total faltante: $${remainingBalance.toFixed(2)}`);
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
            console.log('MANDAR UN MENSAJE DE EXITO Y REDIRECCIONAR CON UN setTimeout');
        }

    };

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
        setNewPaymentMethodType(selectablePaymentMethod[0]);
    }, [selectablePaymentMethod]);

    // Custom Modal Component
    const Modal = ({ message, isOpen, onClose }:{message:string, isOpen:boolean, onClose:any}) => {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                    <p className="text-lg mb-4">{message}</p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
                    >
                        OK
                    </button>
                </div>
            </div>
        );
    };



    return (
        <div className="min-h-full  p-4 font-sans flex items-center justify-center">
            { !registrando ? (
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl space-y-8 md:space-y-0 md:grid md:grid-cols-2 md:gap-8">
                {/* Left Column: Client and Cart */}
                <div className="space-y-[53.5px]">
                    <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">Ventana de Pago</h1>
                    {error && (
                        <div className={`p-4 rounded-lg text-center text-lg font-semibold bg-red-100 text-red-800`}>
                            {error} {/* Displays the actual message text. */}
                        </div>
                    )}

                    {/* Client Selection */}
                    <div className="bg-gray-50 p-6 rounded-lg border-gray-300 border-2 shadow-sm">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Detalles del Cliente</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700 mb-1">
                                    ID
                                </label>
                                <input
                                    type="text"
                                    id="clientIdInput"
                                    value={selectedClientId}
                                    onChange={(e) => setSelectedClientId(e.target.value)}
                                    required
                                    className="mt-1 block w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-md shadow-sm sm:text-sm "
                                    placeholder="Cédula/RIF"
                                    maxLength={12}
                                />
                            </div>
                        </div>
                        <button
                            className={clsx(
                                "bg-blue-600 text-white py-2 px-3 mt-3 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 shadow-md"
                            )}
                            onClick={() => buscarCliente(selectedClientId)}
                                >
                            <p className=" hidden md:block">Buscar Cliente</p>
                        </button>
                    </div>

                    {/* Cart Display */}
                    <div className="bg-gray-50 p-6 border-gray-300 border-2 rounded-lg shadow-sm">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Carrito</h2>
                        <div className="border border-gray-200 rounded-md overflow-hidden shadow-sm">
                            <div className="bg-gray-100 p-3 grid grid-cols-4 gap-2 text-sm font-medium text-gray-600 border-b border-gray-200">
                                <span className="col-span-2">Producto</span>
                                <span className="text-center">Cantidad</span>
                                <span className="text-right">Precio</span>
                            </div>
                            {cart.map((item:any) => (
                                <div key={item.id} className="grid grid-cols-4 gap-2 p-3 text-sm border-b border-gray-200 last:border-b-0">
                                    <span className="col-span-2 text-gray-800">{item.name+' '+item.presentation+'ml'}</span>
                                    <span className="text-center text-gray-600">{item.quantity}</span>
                                    <span className="text-right text-gray-800">${(item.price * 1).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-right text-xl font-bold text-gray-800">
                            Monto Total: ${cartTotal.toFixed(2)}
                        </div>

                    </div>
                    <button
                          className={clsx(
                              'flex relative w-fit mt-4 gap-2 rounded-md bg-gray-200 p-3 font-medium hover:bg-sky-100 hover:text-blue-600 ',
                          )}
                    onClick={() => {setPagando(false)}}>
                        <p className="pl-6 hidden md:block">Regresar</p>
                        <ArrowLeftCircleIcon className="text-inherit absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-900 peer-focus:text-gray-900"> </ArrowLeftCircleIcon>
                    </button>
                </div>

                {/* Right Column: Payment Methods */}
                <div className="space-y-6">
                    {/* Payment Method Input */}
                    <div className="bg-gray-50 border-gray-300 border-2 p-6 rounded-lg shadow-sm">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Métodos de Pago</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700 mb-1">
                                    Métodos registrados
                                </label>

                                <select
                                    id="paymentType"
                                    disabled={!selectedClientId}
                                    value={JSON.stringify(newPaymentMethodType)}
                                    onChange={(e) => setNewPaymentMethodType(JSON.parse(e.target.value))}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                                >{selectablePaymentMethod.map((item:any) => (
                                    <option value={JSON.stringify(item)} key={item.metodo_pago_id+item.tipo}
                                    >
                                        Tarjeta de {item.tipo} ************{item.numero.substring(12,16)}
                                    </option>
                                ))
                                }
                                    <option value={JSON.stringify({tipo:'efectivo'})} key={'cash'}
                                    >
                                        Efectivo
                                    </option>
                                    <option value={JSON.stringify({tipo:'cheque'})} key={'cheque'}
                                    >
                                        Cheque
                                    </option>
                                    <option value={JSON.stringify({tipo:'puntos'})} key={'points'}
                                    >
                                        Puntos
                                    </option>
                                </select>
                                <div className='w-full mt-1'>
                                    <button
                                        disabled={!foundClientId}
                                        className={clsx(
                                            `flex relative float-right rounded-md mb-2 transition duration-200 p-1.5 font-bold ${!foundClientId ? 'bg-gray-300 text-blue-50 cursor-not-allowed' :
                                                                       'hover:bg-sky-100 hover:text-blue-600'}` )}
                                        onClick={() => {setRegistrando(true)}}>
                                        <p className="pl-6 hidden md:block text-xs ">Registrar nueva tarjeta</p>
                                        <PlusIcon className="text-inherit absolute left-2 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-900 peer-focus:text-gray-900"> </PlusIcon>
                                    </button>
                                </div>
                            </div>
                            <div>
                                { newPaymentMethodType!== undefined  && (newPaymentMethodType.tipo == 'cheque') && (

                                    <div>
                                        <label htmlFor="chequeNumber" className="block text-sm font-medium text-gray-700">
                                            Número de Cheque
                                        </label>
                                        <input
                                            type="number"
                                            id="chequeNumber"
                                            value={newPaymentMethodNumeroCheque}
                                            maxLength={10}
                                            onChange={(e) => {
                                                // Only keep numbers and limit to 20 digits
                                                const numbersOnly = e.target.value.replace(/\D/g, '');
                                                setNewPaymentMethodNumeroCheque(numbersOnly.slice(0, 10));
                                            }}
                                            placeholder="e.j. 1234567890"
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                        <label htmlFor="checkAccount" className="block text-sm font-medium text-gray-700">
                                            Numero de cuenta
                                        </label>
                                        <input
                                            type="number"
                                            id="checkAccount"
                                            value={newPaymentMethodNumeroCuenta}
                                            onChange={(e) => {
                                                // Only keep numbers and limit to 20 digits
                                                const numbersOnly = e.target.value.replace(/\D/g, '');
                                                setNewPaymentMethodNumeroCuenta(numbersOnly.slice(0, 20));
                                            }}
                                            placeholder="e.j. 1234567890000000000"
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                        <label htmlFor="checkBank" className="block text-sm font-medium text-gray-700">
                                            Banco emisor
                                        </label>
                                        <input
                                            type="text"
                                            id="checkBank"
                                            value={newPaymentMethodBanco}
                                            onChange={(e) => setNewPaymentMethodBanco(e.target.value)}
                                            placeholder="e.j. Banesco"
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                )}
                                <label htmlFor="paymentAmount" className="block text-sm mt-8 font-medium text-gray-700 mb-1">
                                    Monto
                                </label>
                                <input
                                    type="number"
                                    id="paymentAmount"
                                    value={newPaymentMethodAmount}
                                    onChange={(e) => setNewPaymentMethodAmount(e.target.value)}
                                    placeholder="e.j. 50.00"
                                    min="0.01"
                                    step="0.01"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />

                            </div>
                            <button
                                onClick={handleAddPayment}
                                disabled={!foundClientId}
                                className={`w-full  font-semibold  py-2 px-4  rounded-md  focus:outline-none focus:ring-2  focus:ring-opacity-50 transition duration-200 shadow-sm 
                                ${!foundClientId ? 'bg-gray-300 text-blue-50 cursor-not-allowed' :
                                    'text-white bg-green-600 hover:bg-green-700 focus:ring-green-500'}`}
                            >
                                Añadir Método de Pago
                            </button>
                        </div>
                    </div>

                    {/* Current Payment Methods */}
                    <div className="bg-gray-50 p-6 border-gray-300 border-2 rounded-lg shadow-sm">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Pago</h2>
                        <div className="border border-gray-200 rounded-md overflow-hidden shadow-sm">
                            <div className="bg-gray-100 p-3 grid grid-cols-3 gap-2 text-sm font-medium text-gray-600 border-b border-gray-200">
                                <span>Tipo</span>
                                <span className="text-right">Monto</span>
                                <span className="text-center">Acción</span>
                            </div>
                            {paymentMethods.length === 0 ? (
                                <div className="p-3 text-center text-gray-500 text-sm">No hay métodos de pago aún.</div>
                            ) : (
                                paymentMethods.map((method:any, index) => method.tipo !== 'efectivo' && method.tipo !== 'cheque' && method.tipo !== 'puntos' ? (
                                    <div key={index} className="grid grid-cols-3 gap-2 p-3 text-sm border-b border-gray-200 last:border-b-0">
                                        <span className="text-gray-800">{method.tipo} ****{method.numero_tarjeta.substring(12,16)}</span>
                                        <span className="text-right text-gray-800">${method.cantidad.toFixed(2)}</span>
                                        <span className="text-center">
                      <button
                          onClick={() => handleRemovePayment(index)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm transition duration-200"
                      >
                        Eliminar
                      </button>
                    </span>
                                    </div>
                                ):(<div key={index} className="grid grid-cols-3 gap-2 p-3 text-sm border-b border-gray-200 last:border-b-0">
                                    <span className="text-gray-800">{method.tipo} {method.tipo == 'puntos' &&(`(${method.cantidad})`)} </span>
                                    <span className="text-right text-gray-800">${method.cantidad.toFixed(2)}</span>
                                    <span className="text-center">
                      <button
                          onClick={() => handleRemovePayment(index)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm transition duration-200"
                      >
                        Eliminar
                      </button>
                    </span>
                                </div>))
                            )}
                        </div>
                        <div className="mt-4 text-right text-xl font-bold text-gray-800">
                            Total pagando: ${totalPaid.toFixed(2)}
                        </div>
                        <div className="mt-2 text-right text-xl font-bold" style={{ color: remainingBalance > 0.01 ? '#dc2626' : '#22c55e' }}>
                            Total faltante: ${remainingBalance.toFixed(2)}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        className={`w-full  py-3 px-6 rounded-md text-lg font-semibold  focus:outline-none focus:ring-2  focus:ring-opacity-50 transition duration-200 shadow-md
                        ${!foundClientId ? 'bg-gray-300 text-blue-50 cursor-not-allowed' :
                            'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'}`}
                        disabled={!foundClientId}
                    >
                        Completar Pago
                    </button>
                </div>
                <Modal message={modalMessage} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </div>

                     ):(
        <RegistrarPago setRegistrando={setRegistrando} foundClientId={foundClientId} setFoundClientId={setFoundClientId}
                       setSelectedClientId={setSelectedClientId} setSelectablePaymentMethod={setSelectablePaymentMethod} setPaymentMethods={setPaymentMethods} />
                )
            }
        </div>
    );
};