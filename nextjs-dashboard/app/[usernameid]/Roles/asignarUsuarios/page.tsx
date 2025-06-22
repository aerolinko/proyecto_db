"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import RolChecks from "@/app/ui/roles/rolChecks";
import Link from "next/link";
import clsx from "clsx";
import {ArrowLeftCircleIcon, MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import {saveRolePermissions} from "@/db";
import UserChecks from "@/app/ui/users/userChecks";

export default function Roles({
                                  params,
                              }: {
    params: Promise<{ usernameid: number }>
}) {
    const { usernameid } = React.use(params)
    const [filter, setFilter] = useState('');
    const [roles, setRoles] = useState<any[]>([]);
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [selectedRole, setSelectedRole] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>();
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [filteredRole, setFilteredRole] = useState<Rol[]>([])
    const [dropdownOpen, setDropdownOpen] = useState(false);

interface Rol{
    descripcion: string;
    rol_id: number;
}
        useEffect(() => {
            async function fetchUsuarios() {
                try {
                const response = await fetch("/api/usuarios", {
                    method: "GET", // Specifies the HTTP method as GET.
                    headers: {"Content-Type": "application/json"} // Sets the request header.
                });
                // Checks if the HTTP response was successful (status code 200-299).
                if (!response.ok) {

                    // Throws an error if the HTTP response indicates a problem.
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setUsuarios(data.users);
                    setSelectedUser(data.users[0]);
            }
                catch (error) {
                    // @ts-ignore
                    setError('1',error.message);
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
                    setFilteredRole(data.result);

                }
                catch (error) {
                    // @ts-ignore
                    setError('2',error.message);
                }
            }
            fetchRoles();
            fetchUsuarios();
        },[]);

    useEffect(() => {
        if(selectedUser){
        // @ts-ignore
            async function fetchRolesUsuario(selectedUser) {
            try {
                const response = await fetch("/api/usuarios?roles="+selectedUser.id, {
                    method: "GET", // Specifies the HTTP method as GET.
                    headers: {"Content-Type": "application/json"} // Sets the request header.
                });
                // Checks if the HTTP response was successful (status code 200-299).
                if (!response.ok) {
                    // Throws an error if the HTTP response indicates a problem.
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setSelectedRole(data.roles);
            }
            catch (error) {
                // @ts-ignore
                setError(error.message);
            }
        }
        fetchRolesUsuario(selectedUser);
        }

    }, [selectedUser]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const response = await fetch("/api/roles?user=1", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ selectedUser, selectedRole }),
        });
        if (response.ok) {
            setMensaje("Asignación realizada correctamente");
            setTimeout(() => { setMensaje(""); }, 2000);
        } else {
            setError("Error en la asignación");
        }
    }

    useEffect(() => {
        console.log(filteredRole);
        if(filter){
            setFilteredRole(roles.filter(role => (role.nombre.toUpperCase()).includes(filter.toUpperCase())));
            console.log(filteredRole);
        }
        else setFilteredRole(roles);

    }, [filter]);

   return (

       <div className="flex flex-col items-center justify-center max-h-screen min-h-full bg-gradient-to-br from-purple-50 to-indigo-100">
           <div className="w-6/12">

           <div className="bg-white p-10 sm:p-12 rounded-2xl max-h-screen shadow-xl border-2  min-w-96  transform transition-all duration-300">
           <h1 className="text-2xl font-bold mb-3">Usuario</h1>
           <form className="flex flex-col gap-3  ">
               {/* /////////// */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setDropdownOpen((prev) => !prev)}
                        className="w-full border px-4 py-2 bg-white text-left rounded shadow"
                    >
                        {usuarios.find((r) => r.id === selectedUser.id)?.email || "Selecciona un rol"}
                    </button>

                    {dropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full max-h-40 overflow-y-auto border bg-white rounded shadow">
                            {usuarios.map((usuario) => (
                                <div
                                    key={usuario.id}
                                    onClick={() => {
                                        setSelectedUser(usuario);
                                        setDropdownOpen(false);
                                    }}
                                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                                >
                                    {usuario.email}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/* /////////// */}
                <h1 className="text-2xl font-bold ">Roles</h1>
                {error && <p className="text-red-500">{error}</p>}
                {mensaje && <p className="text-green-500">{mensaje}</p>}
                <button disabled={usuarios.length === 0}  onClick={handleSubmit} className={`bg-gray-200  hover:text-blue-600 font-medium  p-3 rounded 
                ${((usuarios.length !== 0) && 'hover:bg-sky-100') || 
                ((usuarios.length == 0) && 'text-gray-50 hover:text-gray-50 hover:bg-gray-200 cursor-not-allowed')}`}>
                    Asignar
                </button>
                <div className="relative">
                <input
                    type="text"
                    placeholder="Buscar Rol..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border p-2 rounded w-full pl-10"

                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-900 peer-focus:text-gray-900" />
                </div>
                { usuarios.length === 0 ? (
                  <p className="text-gray-600 text-center text-lg">No hay roles para añadir.</p>
               ):(
                   <div className="text-gray-600 text-center overflow-y-scroll h-[420] text-lg grid-flow-row grid w-full scroll-m-0r rounded-md shadow-lg border-gray-200 border">
                       {filteredRole.map((item) => (
                           <div key={item.rol_id}>
                               <UserChecks rol={item} selectedUser={selectedUser} setSelectedRole={setSelectedRole} selectedRole={selectedRole} />
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