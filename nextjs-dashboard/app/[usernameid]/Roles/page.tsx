"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import CartItem from "@/app/ui/venta/CartItem";
import {it} from "zod/dist/types/v4/locales";
import RolChecks from "@/app/ui/roles/rolChecks";

export default function Roles() {
    const [name, setName] = useState('');
    const [permissions, setPermission] = useState<Permiso[]>([]);
    const [error, setError] = useState("");



interface Permiso{
    descripcion: string;
    permiso_id: number;
}


    async function handleSubmit(event: { preventDefault: () => void; }) {
        event.preventDefault();
        setError(""); // Clear previous errors

        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, permissions }),
        });

        if (response.ok) {
            const data = await response.json();
            window.location.href = `/${data.res.usuario_id}/dashboard`;
        } else {
            setError("Credenciales Inválidas. Intente nuevamente.");
        }
    }

        useEffect(() => {
            async function fetchPermissions() {
                try {
                const response = await fetch("/api/permisos", {
                    method: "GET", // Specifies the HTTP method as GET.
                    headers: {"Content-Type": "application/json"} // Sets the request header.
                });
                // Checks if the HTTP response was successful (status code 200-299).
                if (!response.ok) {
                    // Throws an error if the HTTP response indicates a problem.
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setPermission(data.result);
            }
                catch (error) {
                    setError(error.message);
                }
            }
            fetchPermissions();

        },[]);

    return (

        <div className="flex flex-col items-center justify-center min-h-full bg-gradient-to-br from-purple-50 to-indigo-100">
            <div className="bg-white p-10 sm:p-12 rounded-2xl shadow-xl border-2  max-w-full transform transition-all duration-300">
            <h1 className="text-2xl font-bold mb-4">Permisos</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                    type="text"
                    placeholder="Buscar Permiso..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border p-2 rounded"
                />
                {Object.keys(permissions).length === 0 ? (
                    <p className="text-gray-600 text-center text-lg">No hay permisos para añardir.</p>
                ):(
                    <div className="text-gray-600 text-center text-lg grid-flow-row grid rounded-md shadow-lg border-gray-200 border">
                        {permissions.map((item) => (
                            <div key={item.permiso_id}>
                            <RolChecks product={item} />
                            </div>
                        ))}
                    </div>
                )

                }
                {error && <p className="text-red-500">{error}</p>}
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                    Login
                </button>
            </form>
        </div>
        </div>
    );
}