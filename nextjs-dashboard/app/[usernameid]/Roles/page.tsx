"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import RolChecks from "@/app/ui/roles/rolChecks";
import Link from "next/link";
import clsx from "clsx";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline";

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
    const [selectedChecks, setSelectedChecks] = useState<string[]>([]);
    const [filteredPermissions, setFilteredPermissions] = useState<Permiso[]>([])

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
        console.log(selectedChecks);
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

    const handleSelectChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRole(event.target.value);
    }, []);

    return (

        <div className="flex flex-col items-center justify-center min-h-full bg-gradient-to-br from-purple-50 to-indigo-100">
            <div className="w-6/12">

            <div className="bg-white p-10 sm:p-12 rounded-2xl shadow-xl border-2 max-w-full min-w-96  transform transition-all duration-300">
            <h1 className="text-2xl font-bold mb-3">Roles</h1>
            <form className="flex flex-col gap-3">
                <select name="selectRole" value={selectedRole} onChange={handleSelectChange} className="rounded">
                    {Object.values(roles).map((role) => (
                        <option key={role.rol_id} value={role.rol_id}>{role.nombre}</option>
                    ))}
                </select>
                <Link href={`/${usernameid}/crearRol`}
                      className={clsx(
                          'flex items-center justify-center gap-2 rounded-md bg-gray-200 p-3 font-medium hover:bg-sky-100 hover:text-blue-600 ',
                      )}>
                    <p className="hidden md:block">Crear Rol</p>

                </Link>
                <h1 className="text-2xl font-bold mt-3 ">Permisos</h1>
                {error && <p className="text-red-500">{error}</p>}
                <button type="submit" className="bg-gray-200 hover:bg-sky-100 hover:text-blue-600 font-medium  p-3 rounded">
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
                    <div className="text-gray-600 text-center text-lg grid-flow-row grid w-full rounded-md shadow-lg border-gray-200 border">
                        {filteredPermissions.map((item) => (
                            <div key={item.permiso_id}>
                            <RolChecks product={item} selectedChecks={selectedChecks} setSelectedChecks={setSelectedChecks} />
                            </div>
                        ))}
                    </div>
                )

                }
            </form>
        </div>
            </div>
        </div>
    );
}