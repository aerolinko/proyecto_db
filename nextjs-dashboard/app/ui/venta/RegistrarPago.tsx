'use client'
import React, { useState, useEffect } from 'react';
import { ArrowLeftCircleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

export default function RegistrarPago({
                                          foundClientId,
                                          setRegistrando,
                                          setFoundClientId,
                                          setSelectablePaymentMethod,
                                          setPaymentMethods,
                                          setSelectedClientId
                                      }) {
    const [newTarjeta, setNewTarjeta] = useState<any>();
    const [error, setError] = useState('');
    const [numero, setNumero] = useState('');
    const [fechaExp, setFechaExp] = useState('');
    const [banco, setBanco] = useState('');
    const [tipo, setTipo] = useState('');

    const formatCardNumber = (input: string) => {
        const digitsOnly = input.replace(/\D/g, '');
        return digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatCardNumber(e.target.value);
        setNumero(formattedValue);
    };

    const handleSubmit = async () => {
        const response = await fetch(`/api/metodopago?id=${foundClientId.cliente_id}&tipo=${foundClientId.tipo}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newTarjeta }),
        });

        if (response.ok) {
            setFoundClientId('');
            setSelectedClientId('');
            setSelectablePaymentMethod([]);
            setPaymentMethods([]);
            setRegistrando(false);
        }
    };

    useEffect(() => {
        setNewTarjeta({
            numero: numero.split(' ').join(''),
            banco: banco,
            tipo: tipo,
            fechaExp: fechaExp ? fechaExp : null,
        });
    }, [fechaExp, banco, tipo, numero]);

    return (
        <div className="bg-gray-50 p-6 font-sans flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                    <h1 className="text-2xl font-bold text-center">Registrar Nueva Tarjeta</h1>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mx-6 mt-4 rounded">
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {/* Form Content */}
                <div className="p-6 space-y-6">
                    {/* Card Type Selection */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">Tipo de Tarjeta</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                                tipo === 'debito' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'
                            }`}>
                                <input
                                    type="radio"
                                    name="cardType"
                                    value="debito"
                                    checked={tipo === 'debito'}
                                    onChange={(e) => setTipo(e.target.value)}
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="font-medium">Débito</span>
                            </label>

                            <label className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                                tipo === 'credito' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'
                            }`}>
                                <input
                                    type="radio"
                                    name="cardType"
                                    value="credito"
                                    checked={tipo === 'credito'}
                                    onChange={(e) => setTipo(e.target.value)}
                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="font-medium">Crédito</span>
                            </label>
                        </div>
                    </div>

                    {/* Card Number */}
                    <div>
                        <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-1">
                            Número de Tarjeta
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="numero"
                                value={numero}
                                required
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0000 0000 0000 0000"
                                onChange={handleChange}
                                maxLength={19}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Expiration Date (Conditional) */}
                    {tipo === 'credito' && (
                        <div>
                            <label htmlFor="fechaExp" className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha de Expiración
                            </label>
                            <input
                                type="date"
                                id="fechaExp"
                                value={fechaExp}
                                required
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onChange={(e) => setFechaExp(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Bank Name */}
                    <div>
                        <label htmlFor="banco" className="block text-sm font-medium text-gray-700 mb-1">
                            Banco Emisor
                        </label>
                        <input
                            type="text"
                            id="banco"
                            value={banco}
                            required
                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ej: Banesco"
                            onChange={(e) => setBanco(e.target.value)}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                            onClick={handleSubmit}
                            disabled={(!banco || !fechaExp || numero.length < 19) && (!banco || numero.length < 19 || tipo !== 'debito')}
                            className={clsx(
                                "px-6 py-3 rounded-lg font-semibold text-white transition-colors duration-200 flex-1",
                                (!banco || !fechaExp || numero.length < 19) && (!banco || numero.length < 19 || tipo !== 'debito')
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                            )}
                        >
                            Registrar Método
                        </button>

                        <button
                            onClick={() => setRegistrando(false)}
                            className="flex items-center justify-center gap-2 px-6 py-3 border bg-gray-200 p-3 font-medium hover:bg-sky-100 hover:text-blue-600 rounded-lg text-gray-700  transition-colors duration-200 flex-1"
                        >
                            <ArrowLeftCircleIcon className="h-5 w-5" />
                            <span>Regresar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};