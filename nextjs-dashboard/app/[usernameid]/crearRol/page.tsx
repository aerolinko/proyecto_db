"use client";

import Table from "@/app/ui/customers/table";
import { useState } from "react";

export default function CrearRol() {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [lastnombre, setLastNombre] = useState("");
    const [lastdescripcion, setLastDescripcion] = useState("");

    async function handleSubmit(event: { preventDefault: () => void; }) {
        event.preventDefault();
        setError(""); // Clear previous errors

        const response = await fetch("/api/roles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, descripcion }),
        });

        if (response.ok) {
            setLastNombre(nombre);
            setLastDescripcion(descripcion);
            setDescripcion("");
            setNombre("");
            setMensaje("Rol creado exitosamente");
            setTimeout(() => { setMensaje(""); }, 2000);
        } else {
            setError("Error Registrando el Rol.");
        }
    }

    return (

        <div className="flex flex-col items-center justify-center min-h-full bg-gradient-to-br from-purple-50 to-indigo-100">
            <div className="bg-white p-10 sm:p-12 rounded-2xl shadow-xl border-2  max-w-2xl w-dvw transform transition-all duration-300 ">
            <h1 className="text-2xl font-bold mb-4">Crear Nuevo Rol</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                    type="text"
                    placeholder="Nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    maxLength={50}
                    className="border p-2 rounded shadow-md flex"
                />
                <textarea
                    placeholder="Descripción del Nuevo Rol"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    required
                    rows={3}
                    maxLength={255}
                    className="border p-2 rounded-md shadow-md resize-y"
                ></textarea>
                {error && <p className="text-red-500">{error}</p>}
                {mensaje &&
                    <div className="bg-purple-50 p-4 rounded-lg shadow-inner border border-purple-200">
                        <div className="text-md font-bold text-purple-800">
                            {mensaje}
                            <div className="mt-2 pt-3 border-t-2 border-purple-300">
                            <p className="text-md font-bold text-purple-800">
                                Nombre: {lastnombre}
                            </p>
                            <p className="text-md font-bold text-purple-800">
                                Descripcion: {lastdescripcion}
                            </p>
                            </div>
                        </div>
                    </div>}
                <button type="submit" className="bg-gray-200 hover:bg-sky-100 hover:text-blue-600 font-medium text-lg p-3 rounded">
                    Crear
                </button>
            </form>
        </div>
        </div>
    );
}