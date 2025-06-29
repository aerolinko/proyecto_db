"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import RolChecks from "@/app/ui/roles/rolChecks";
import Link from "next/link";
import clsx from "clsx";
import {ArrowLeftCircleIcon, MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import {saveRolePermissions} from "@/db";

export default function Roles({
                                  params,
                              }: {
    params: Promise<{ usernameid: number }>
}) {
    const { usernameid } = React.use(params)
    const [filter, setFilter] = useState('');
    const [permissions, setPermission] = useState<Permiso[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [selectedRole, setSelectedRole] = useState<any>();
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [selectedChecks, setSelectedChecks] = useState<string[]>([]);
    const [filteredPermissions, setFilteredPermissions] = useState<Permiso[]>([])
    const [dropdownOpen, setDropdownOpen] = useState(false);

interface Permiso{
    descripcion: string;
    permiso_id: number;
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
                setFilteredPermissions(data.result);
            }
                catch (error) {
                    // @ts-ignore
                    setError(error.message);
                }
            }

            async function fetchRoles() {
                try {
                    const response = await fetch("/api/roles?roles=1", {
                        method: "GET", // Specifies the HTTP method as GET.
                        headers: {"Content-Type": "application/json"} // Sets the request header.
                    });
                    // Checks if the HTTP response was successful (status code 200-299).
                    if (!response.ok) {
                        // Throws an error if the HTTP response indicates a problem.
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    setRoles(data.result);
                    setSelectedRole(data.result[0].rol_id);
                }
                catch (error) {
                    // @ts-ignore
                    setError(error.message);
                }
            }
            fetchRoles();
            fetchPermissions();
        },[]);

    useEffect(() => {
        console.log('tester:',selectedChecks);
    }, [selectedChecks]);


    useEffect(() => {
        if(filter){
        setFilteredPermissions(permissions.filter(role => role.descripcion.includes(filter.toUpperCase())));
        }
        else setFilteredPermissions(permissions);

    }, [filter]);

    useEffect(() => {
            if(selectedRole){
            // @ts-ignore
                async function fetchRolePermissions(selectedRole) {
                try     {
                    const response = await fetch(`/api/roles?permisos-rol=${selectedRole}`, {
                        method: "GET", // Specifies the HTTP method as GET.
                        headers: {"Content-Type": "application/json"} // Sets the request header.
                    });
                    // Checks if the HTTP response was successful (status code 200-299).
                    if (!response.ok) {
                        // Throws an error if the HTTP response indicates a problem.
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    // @ts-ignore
                    setSelectedChecks(data.result.map((item)=>{
                        return item.descripcion;
                    }));
                }
                catch (error) {
                    // @ts-ignore
                    setError(error.message);
                }
            }
        fetchRolePermissions(selectedRole);
        }
        console.log("Currently selected checks for role:", selectedRole);
    }, [selectedRole]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const response = await fetch("/api/permisos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ selectedRole, selectedChecks }),
        });

        if (response.ok) {
            setMensaje("Asignación realizada correctamente");
            setTimeout(() => { setMensaje(""); }, 2000);
        } else {
            setError("Credenciales Inválidas. Intente nuevamente.");
        }
    }

    const handleSelectChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRole(event.target.value);
    }, []);
    return (

        <div className="flex flex-col items-center justify-center max-h-screen min-h-full bg-gradient-to-br from-purple-50 to-indigo-100">
            <div className="w-6/12">

            <div className="bg-white p-10 sm:p-12 rounded-2xl max-h-screen shadow-xl border-2  min-w-96  transform transition-all duration-300">
            <h1 className="text-2xl font-bold mb-3">Rol</h1>
            <form className="flex flex-col gap-3  ">
                {/* /////////// */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setDropdownOpen((prev) => !prev)}
                        className="w-full border px-4 py-2 bg-white text-left rounded shadow"
                    >
                        {roles.find((r) => r.rol_id === selectedRole)?.nombre || "Selecciona un rol"}
                    </button>

                    {dropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto border bg-white rounded shadow">
                            {roles.map((role) => (
                                <div
                                    key={role.rol_id}
                                    onClick={() => {
                                        setSelectedRole(role.rol_id);
                                        setDropdownOpen(false);
                                    }}
                                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                                >
                                    {role.nombre}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/* /////////// */}
                <h1 className="text-2xl font-bold ">Permisos</h1>
                {error && <p className="text-red-500">{error}</p>}
                {mensaje && <p className="text-green-500">{mensaje}</p>}
                <button disabled={selectedChecks.length == 0}  onClick={handleSubmit} className={`bg-gray-200  hover:text-blue-600 font-medium  p-3 rounded 
                ${((selectedChecks.length !== 0) && 'hover:bg-sky-100') || 
                ((selectedChecks.length == 0) && 'text-gray-50 hover:text-gray-50 hover:bg-gray-200 cursor-not-allowed')}`}>
                    Asignar
                </button>
                <div className="relative">
                <input
                    type="text"
                    placeholder="Buscar Permiso..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border p-2 rounded w-full pl-10"

                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-900 peer-focus:text-gray-900" />
                </div>
                {Object.keys(filteredPermissions).length === 0 ? (
                    <p className="text-gray-600 text-center text-lg">No hay permisos para añadir.</p>
                ):(
                    <div className="text-gray-600 text-center overflow-y-scroll h-[420] text-lg grid-flow-row grid w-full scroll-m-0r rounded-md shadow-lg border-gray-200 border">
                        {filteredPermissions.map((item) => (
                            <div key={item.permiso_id}>
                            <RolChecks permiso={item} selectedChecks={selectedChecks} setSelectedChecks={setSelectedChecks} />
                            </div>
                        ))}
                    </div>
                )

                }
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
        </div>
    );
}