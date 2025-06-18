'use client'
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import clsx from "clsx";
import {ArrowLeftCircleIcon} from "@heroicons/react/24/outline";


// @ts-ignore
export default function MetodoPago({ cart, setPagando }) {
    const [quantity, setQuantity] = useState();

    // Update internal quantity state if initialQuantity prop changes (e.g., cart is cleared)
    useEffect(() => {

    }, []);

    // State for client selection
    const [selectedClientId, setSelectedClientId] = useState('');


    // State for payment methods
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [newPaymentMethodType, setNewPaymentMethodType] = useState('Cash');
    const [newPaymentMethodAmount, setNewPaymentMethodAmount] = useState('');

    // State for custom modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    // Calculate cart total
    const cartTotal = cart.reduce((sum:any, item:any) => sum + (item.price * item.quantity), 0);
    const totalPaid = paymentMethods.reduce((sum, method:any) => sum + method.amount, 0);
    const remainingBalance = cartTotal - totalPaid;

    // Add a new payment method
    const handleAddPayment = () => {
        const amount = parseFloat(newPaymentMethodAmount);
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
            type: newPaymentMethodType,
            amount: amount
        }]);

        setNewPaymentMethodAmount(''); // Clear amount field after adding
    };
    // Remove a payment method
    const handleRemovePayment = (index:number) => {
        const updatedPayments = paymentMethods.filter((_, i) => i !== index);
        setPaymentMethods(updatedPayments);
    };

    // Handle form submission (placeholder for actual transaction logic)
    const handleSubmit = () => {
        if (remainingBalance > 0.01) { // Check if remaining balance is negligible
            setModalMessage(`No se pudo completar el pago. Total faltante: $${remainingBalance.toFixed(2)}`);
            setIsModalOpen(true);
            return;
        }
    };

    const buscarCliente = (cliente:string) => {

        if(isNaN(parseInt(cliente))){
            console.log('es juridico');
        } else {
            console.log('es natural');
        }

    };


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
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl space-y-8 md:space-y-0 md:grid md:grid-cols-2 md:gap-8">
                {/* Left Column: Client and Cart */}
                <div className="space-y-[53.5px]">
                    <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">Ventana de Pago</h1>

                    {/* Client Selection */}
                    <div className="bg-gray-50 p-6 rounded-lg border-gray-300 border-2 shadow-sm">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Detalles del Cliente</h2>
                        <div className="space-y-4">
                            <div>
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
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Añadir Método de Pago</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo
                                </label>
                                <select
                                    id="paymentType"
                                    value={newPaymentMethodType}
                                    onChange={(e) => setNewPaymentMethodType(e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                                >
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Cheque">Cheque</option>
                                    <option value="Crédito">Crédito</option>
                                    <option value="Débito">Débito</option>
                                    <option value="Punto">Puntos</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-1">
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
                                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200 shadow-sm"
                            >
                                Añadir Método de Pago
                            </button>
                        </div>
                    </div>

                    {/* Current Payment Methods */}
                    <div className="bg-gray-50 p-6 border-gray-300 border-2 rounded-lg shadow-sm">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Métodos de pago</h2>
                        <div className="border border-gray-200 rounded-md overflow-hidden shadow-sm">
                            <div className="bg-gray-100 p-3 grid grid-cols-3 gap-2 text-sm font-medium text-gray-600 border-b border-gray-200">
                                <span>Tipo</span>
                                <span className="text-right">Monto</span>
                                <span className="text-center">Acción</span>
                            </div>
                            {paymentMethods.length === 0 ? (
                                <div className="p-3 text-center text-gray-500 text-sm">No hay métodos de pago aún.</div>
                            ) : (
                                paymentMethods.map((method:any, index) => (
                                    <div key={index} className="grid grid-cols-3 gap-2 p-3 text-sm border-b border-gray-200 last:border-b-0">
                                        <span className="text-gray-800">{method.type}</span>
                                        <span className="text-right text-gray-800">${method.amount.toFixed(2)}</span>
                                        <span className="text-center">
                      <button
                          onClick={() => handleRemovePayment(index)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm transition duration-200"
                      >
                        Eliminar
                      </button>
                    </span>
                                    </div>
                                ))
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
                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-md text-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 shadow-md"
                    >
                        Completar Pago
                    </button>
                </div>
            </div>
            <Modal message={modalMessage} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};