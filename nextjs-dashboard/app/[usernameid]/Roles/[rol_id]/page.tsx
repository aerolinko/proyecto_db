"use client";

import React, { useState, useEffect } from "react";
import clsx from "clsx";
import {ArrowLeftCircleIcon} from "@heroicons/react/24/outline";
import Link from "next/link";
import {usePathname} from "next/navigation";


export default function CrearRol({
                                     params,
                                 }: {
                                     params: Promise<{ usernameid:number ,rol_id:number }>
                                 }
) {
    const { usernameid,rol_id } = React.use(params)
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [nuevo_nombre, setNuevoNombre] = useState("");
    const [nueva_descripcion, setNuevaDescripcion] = useState("");
    const [lastnombre, setLastNombre] = useState("");
    const [lastdescripcion, setLastDescripcion] = useState("");

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            const initialNombreFromUrl = searchParams.get('nombre');
            const initialDescripcionFromUrl = searchParams.get('descripcion');
            setNuevoNombre(initialNombreFromUrl);
            setNuevaDescripcion(initialDescripcionFromUrl);
        }
    }, []);
    console.log(nuevo_nombre);
    console.log(nueva_descripcion);
    async function handleSubmit(event: { preventDefault: () => void; }) {
        event.preventDefault();
        setError(""); // Clear previous errors

        const response = await fetch(`/api/roles`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rol_id, nuevo_nombre, nueva_descripcion }),
        });

        if (response.ok) {
            setLastNombre(nuevo_nombre);
            setLastDescripcion(nueva_descripcion);
            setNuevoNombre("");
            setNuevaDescripcion("");
            setMensaje("Rol editado exitosamente");
            setTimeout(() => {
                window.location.href=`/${usernameid}/Roles`
                }, 2000);


        } else {
            setError("Error Registrando el Rol.");
        }
    }

    return (

        <div className="flex flex-col items-center justify-center min-h-full bg-gradient-to-br from-purple-50 to-indigo-100">
            <div className="bg-white p-10 sm:p-12 rounded-2xl shadow-xl border-2  max-w-2xl w-dvw transform transition-all duration-300 ">
            <h1 className="text-2xl font-bold mb-4">Editar Rol</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {nuevo_nombre && nueva_descripcion &&
                    <div className="flex flex-col gap-3">
                <input
                    type="text"
                    placeholder="Nombre"
                    value={nuevo_nombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    required
                    maxLength={50}
                    className="border p-2 rounded shadow-md flex"
                />
                <textarea
                    placeholder="Descripción del Nuevo Rol"
                    value={nueva_descripcion}
                    onChange={(e) => setNuevaDescripcion(e.target.value)}
                    required
                    rows={3}
                    maxLength={255}
                    className="border p-2 rounded-md shadow-md resize-y"
                ></textarea>
                    </div>
                }
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
                    Confirmar
                </button>
            </form>
                <Link href={`/${usernameid}/Roles`}
                      className={clsx(
                          'flex relative w-fit mt-4 gap-2 rounded-md bg-gray-200 p-3 font-medium hover:bg-sky-100 hover:text-blue-600 ',
                      )}>
                    <p className="pl-6 hidden md:block">Regresar</p>
                    <ArrowLeftCircleIcon className="text-inherit absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-900 peer-focus:text-gray-900"> </ArrowLeftCircleIcon>
                </Link>
        </div>
        </div>
    );
}