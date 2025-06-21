'use client'
import React, { useState, useEffect } from 'react';
import clsx from "clsx";
import {ArrowLeftCircleIcon } from "@heroicons/react/24/outline";
import postgres from "postgres";


// @ts-ignore
export default function RegistrarPago({ foundClientId, setRegistrando, setFoundClientId, setSelectablePaymentMethod, setPaymentMethods, setSelectedClientId } ) {
    // Update internal quantity state if initialQuantity prop changes (e.g., cart is cleared)
    useEffect(() => {

    }, []);

    // State for payment methods
    const [newTarjeta, setNewTarjeta] = useState<any>();
    const [error, setError] = useState('');
    // State for custom modal

        const [numero, setNumero] = useState('');
        const [fechaExp, setFechaExp] = useState('');
        const [banco, setBanco] = useState('');
        const [tipo, setTipo] = useState('');

        const formatCardNumber = (input) => {
            // Remove all non-digit characters
            const digitsOnly = input.replace(/\D/g, '');

            // Add a space after every 4 digits
            const formatted = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');

            return formatted;
        };

        const handleChange = (e) => {
            const input = e.target.value;
            const formattedValue = formatCardNumber(input);
            setNumero(formattedValue);
        };

    // Handle form submission (placeholder for actual transaction logic)
    const handleSubmit = async () => {

        console.log(newTarjeta);
        const response = await fetch(`/api/metodopago?id=${foundClientId.cliente_id}&tipo=${foundClientId.tipo}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newTarjeta }),
        });
        if (response.ok) {
            console.log(response);
            setFoundClientId('');
            setSelectedClientId('');
            setSelectablePaymentMethod([]),
            setPaymentMethods([]);
            setRegistrando(false);
        }

    };

    useEffect(()=>{
        setNewTarjeta({
            numero: numero.split(' ').join(''),
            banco: banco,
            tipo: tipo,
            fechaExp: fechaExp ? fechaExp : null,
        });
    },[fechaExp, banco, tipo, numero]);

    return (
        <div className="min-h-full  p-4 font-sans flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl space-y-8 md:space-y-0  md:gap-8">
                {/* Left Column: Client and Cart */}
                <div className="space-y-[53.5px]">
                    <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">Registrar nueva tarjeta</h1>
                    {error && (
                        <div className={`p-4 rounded-lg text-center text-lg font-semibold bg-red-100 text-red-800`}>
                            {error} {/* Displays the actual message text. */}
                        </div>
                    )}

                    {/* Client Selection */}
                    <div className="bg-gray-50 p-6 rounded-lg border-gray-300 border-2 shadow-sm">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Datos de la tarjeta</h2>
                        <div className="space-y-4">

                                <fieldset className="border p-4 rounded">
                                    <legend className="px-2 font-medium">Tipo de tarjeta</legend>


                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                id="debito"
                                                name="contact"
                                                value="debito"
                                                checked={tipo === 'debito'}
                                                onChange={(e) => setTipo(e.target.value)}
                                                className="mr-2"
                                            />
                                            <label htmlFor="debito">Débito</label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                id="credito"
                                                name="contact"
                                                value="credito"
                                                checked={tipo === 'credito'}
                                                onChange={(e) => setTipo(e.target.value)}
                                                className="mr-2"
                                            />
                                            <label htmlFor="credito">Crédito</label>
                                        </div>

                                </fieldset>
                                <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700 mb-1">
                                    Número
                                </label>
                                <input
                                    type="text"
                                    id="numero"
                                    value={numero}
                                    required
                                    className="mt-1 block w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-md shadow-sm sm:text-sm "
                                    placeholder="e.j. 0000 0000 0000 0000"
                                    onChange={handleChange}
                                    maxLength={19}
                                />
                                { tipo=='credito' && (
                                    <div>
                                <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha Exp
                                </label>
                                <input
                                    type="date"
                                    id="fechaExp"
                                    value={fechaExp}
                                    required
                                    className="mt-1 block w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-md shadow-sm sm:text-sm "
                                    placeholder="e.j. 10/10/2025"
                                    onChange={(e) => setFechaExp(e.target.value)}
                                />
                                    </div>
                                )}
                                <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700 mb-1">
                                    Banco
                                </label>
                                <input
                                    type="text"
                                    id="banco"
                                    value={banco}
                                    required
                                    className="mt-1 block w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-md shadow-sm sm:text-sm "
                                    placeholder="e.j. Banesco"
                                    onChange={(e) => setBanco(e.target.value)}
                                />
                                <button
                                    className={
                                        ` py-2 px-3 mt-3 rounded-md font-semibold w-full focus:outline-none focus:ring-2  focus:ring-opacity-50 transition duration-200 shadow-md ${((!banco || !fechaExp || numero.length<19)) && ((!banco  || numero.length<19 || tipo!=='debito')) ? ('bg-gray-300 text-blue-50 cursor-not-allowed') : ('hover:bg-blue-700 bg-blue-600 text-white focus:ring-blue-500')}`
                                    }
                                    disabled={((!banco || !fechaExp || numero.length<19 )) && ((!banco  || numero.length<19 || tipo!=='debito'))}
                                    onClick={() => {
                                        handleSubmit()
                                    }}
                                >
                                    <p className=" hidden md:block">Registrar Método</p>
                                </button>

                        </div>

                    </div>

                    {/* Cart Display */}

                    <button
                        className={clsx(
                            'flex relative w-fit mt-4 gap-2 rounded-md bg-gray-200 p-3 font-medium hover:bg-sky-100 hover:text-blue-600 ',
                        )}
                        onClick={() => {
                            setRegistrando(false)
                        }}>
                        <p className="pl-6 hidden md:block">Regresar</p>
                        <ArrowLeftCircleIcon
                            className="text-inherit absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-900 peer-focus:text-gray-900"> </ArrowLeftCircleIcon>
                    </button>
                </div>

                {/* Right Column: Payment Methods */}

            </div>
        </div>
    );
};