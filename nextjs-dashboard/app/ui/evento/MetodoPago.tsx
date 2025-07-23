// Versión para Tienda Evento
'use client'
import React, { useState, useEffect } from 'react';
import RegistrarPago from "@/app/ui/evento/RegistrarPago";

// @ts-ignore
export default function MetodoPago({ cart, setPagando, setProducts, usernameid, setCart }) {
    const [tasa, setTasa] = useState(0);
    useEffect(() => {
        async function fetchTasa() {
            try {
                const response = await fetch("/api/eventos", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setTasa(data.res[0].tasa);
            } catch (err) {
                console.error("Error fetching tasa:", err);
            }
        }
        fetchTasa();
    }, []);

    // State for client selection
    const [selectedClientId, setSelectedClientId] = useState('');
    const [foundClientId, setFoundClientId] = useState<any>('');

    // ...continúa la lógica igual que en venta, pero adaptada a eventos si es necesario...

    return (
        <div>
            <h2 className="text-xl font-bold text-blue-700 mb-4">Método de Pago Evento</h2>
            {/* Aquí iría el formulario y lógica de pago, similar a venta */}
            <RegistrarPago foundClientId={foundClientId} setRegistrando={() => {}} setFoundClientId={setFoundClientId} setSelectablePaymentMethod={() => {}} setPaymentMethods={() => {}} setSelectedClientId={setSelectedClientId} />
        </div>
    );
}
