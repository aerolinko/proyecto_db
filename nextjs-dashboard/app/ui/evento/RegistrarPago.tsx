// Versión para Tienda Evento
'use client'
import React, { useState } from 'react';

export default function RegistrarPago({ foundClientId, setRegistrando, setFoundClientId, setSelectablePaymentMethod, setPaymentMethods, setSelectedClientId }) {
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
        // Aquí iría la lógica de registrar pago para evento
        setFoundClientId('');
        setSelectedClientId('');
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-blue-700 mb-2">Registrar Pago Evento</h3>
            {/* Formulario de pago adaptado para eventos */}
            <input type="text" value={numero} onChange={handleChange} placeholder="Número de tarjeta" className="border p-2 rounded mb-2" />
            <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">Registrar</button>
            {error && <div className="text-red-500">{error}</div>}
        </div>
    );
}
