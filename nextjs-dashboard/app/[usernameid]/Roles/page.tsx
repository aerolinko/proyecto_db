"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
// NOTA: Se ha eliminado el import de "next/link" para resolver los errores de compilación en este entorno.
// Se usará una etiqueta <a> estándar para los enlaces.
import clsx from "clsx";
import { MagnifyingGlassIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

// Define un tipo para tus datos de rol para una mejor seguridad de tipos
interface Role {
    rol_id: string;
    nombre: string;
    descripcion: string;
}

// Define un tipo para la dirección de ordenación
type SortDirection = 'asc' | 'desc';

export default function Roles({
                                  params,
                              }: {
    // Los params de ruta son directamente accesibles, no como una Promise
    params: { usernameid: number }
}) {
    const { usernameid } = React.use(params);

    const [filter, setFilter] = useState(''); // Estado para la entrada de búsqueda
    const [roles, setRoles] = useState<Role[]>([]); // Estado para almacenar los datos de los roles
    const [currentPage, setCurrentPage] = useState(1); // Página actual para la paginación
    const [itemsPerPage] = useState(5); // Número de elementos por página
    const [error, setError] = useState<string | null>(null); // Estado para manejar errores de la API
    const [mensaje, setMensaje] = useState<string | null>(null);

    // Estados para la ordenación
    const [sortColumn, setSortColumn] = useState<keyof Role>('rol_id'); // Columna de ordenación por defecto
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc'); // Dirección de ordenación por defecto

    // En una aplicación real, obtendrías los roles aquí de una API
    useEffect(() => {
        async function fetchRoles() {
            try {
                const response = await fetch("/api/roles?roles=1", {
                    method: "GET", // Especifica el metodo HTTP como GET.
                    headers: { "Content-Type": "application/json" } // Establece el encabezado de la solicitud.
                });
                // Comprueba si la respuesta HTTP fue exitosa (código de estado 200-299).
                if (!response.ok) {
                    // Lanza un error si la respuesta HTTP indica un problema.
                    throw new Error(`¡Error HTTP! Estado: ${response.status}`);
                }
                const data = await response.json();
                setRoles(data.result);
                setError(null); // Limpiar errores si la carga fue exitosa
            } catch (error: any) {
                setError(error.message);
                setRoles([]); // Si hay un error, limpiar los roles
            }
        }
        fetchRoles();
    }, []);

    // Función para manejar la ordenación por columna
    const handleSort = useCallback((column: keyof Role) => {
        if (sortColumn === column) {
            // Si se hace clic en la misma columna, alternar la dirección
            setSortDirection(prevDirection => (prevDirection === 'asc' ? 'desc' : 'asc'));
        } else {
            // Si se hace clic en una nueva columna, establecerla como columna de ordenación y ordenar ascendente
            setSortColumn(column);
            setSortDirection('asc');
        }
    }, [sortColumn]);


    // Roles filtrados y ordenados
    const sortedAndFilteredRoles = useMemo(() => {
        let currentRoles = [...roles]; // Crear una copia para no mutar el estado original

        // 1. Filtrar
        if (filter) {
            const lowerCaseFilter = filter.toLowerCase();
            currentRoles = currentRoles.filter(role =>
                role.nombre.toLowerCase().includes(lowerCaseFilter) ||
                role.descripcion.toLowerCase().includes(lowerCaseFilter) ||
                role.rol_id.toString().toLowerCase().includes(lowerCaseFilter) // También permite filtrar por ID
            );
        }

        // 2. Ordenar
        if (sortColumn) {
            currentRoles.sort((a, b) => {
                const aValue = a[sortColumn];
                const bValue = b[sortColumn];

                // Manejo básico de tipos para comparación (asume strings o números simples)
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
                // Si son números (aunque rol_id sea string, si en un futuro hubieran números, esto serviría)
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
                }
                // Fallback para otros tipos o si no se pueden comparar directamente
                return 0;
            });
        }

        return currentRoles;
    }, [roles, filter, sortColumn, sortDirection]);

    // Calcular el total de páginas para la paginación
    const totalPages = useMemo(() => {
        return Math.ceil(sortedAndFilteredRoles.length / itemsPerPage);
    }, [sortedAndFilteredRoles.length, itemsPerPage]);

    // Obtener roles para la página actual
    const paginatedRoles = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedAndFilteredRoles.slice(startIndex, endIndex);
    }, [sortedAndFilteredRoles, currentPage, itemsPerPage]);

    // Manejar cambios de página
    const handlePageChange = useCallback((page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }, [totalPages]);

    // Manejar el cambio de la entrada de filtro y reiniciar la página a 1
    const handleFilterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(event.target.value);
        setCurrentPage(1); // Reiniciar a la primera página al cambiar el filtro
    }, []);

    // Manejar la edición de un rol
    const handleEdit = useCallback((role: Role) => {
        // Usa window.location.href directamente para la navegación
        // Codifica los parámetros para manejar caracteres especiales
        const encodedNombre = encodeURIComponent(role.nombre);
        const encodedDescripcion = encodeURIComponent(role.descripcion);
        window.location.href = `/${usernameid}/Roles/${role.rol_id}?nombre=${encodedNombre}&descripcion=${encodedDescripcion}`;
    }, [usernameid]);

    // Manejar la eliminación de un rol
    const handleDelete = useCallback(async (roleId: string) => {
        // En una aplicación real, harías una llamada DELETE a tu API aquí
        console.log(`Eliminando rol con ID: ${roleId}`);
        try {
            const response = await fetch(`/api/roles?rol_id=${roleId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) {
                throw new Error(`Error al eliminar el rol: ${response.statusText}`);
            }

            // Si la eliminación es exitosa en el backend, actualiza el estado local
            setRoles(prevRoles => {
                const newRoles = prevRoles.filter(role => role.rol_id !== roleId);
                // Ajustar la página actual si la última página queda vacía
                const newTotalPages = Math.ceil(newRoles.length / itemsPerPage);
                if (currentPage > newTotalPages && newTotalPages > 0) {
                    setCurrentPage(newTotalPages);
                } else if (newTotalPages === 0) {
                    setCurrentPage(1); // Si no quedan roles, ir a la página 1
                }
                return newRoles;
            });
            setError(null)
            setMensaje('Rol eliminado exitosamente');
            setTimeout(()=> setMensaje(null),2000)// Limpiar errores si la eliminación fue exitosa
        } catch (error: any) {
            console.error("Error eliminando rol:", error);
            setError(error.message);
        }
    }, [currentPage, itemsPerPage]);


    // Función auxiliar para renderizar el icono de ordenación
    const renderSortArrow = (column: keyof Role) => {
        if (sortColumn === column) {
            return sortDirection === 'asc' ? ' ↑' : ' ↓';
        }
        return '';
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl bg-white p-6 sm:p-8 rounded-2xl shadow-xl border-2 transform transition-all duration-300">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Gestión de Roles</h1>

                {/* Search Input */}
                <div className="relative mb-6 rounded-md shadow-sm">
                    <label htmlFor="search" className="sr-only">Buscar roles</label>
                    <input
                        id="search"
                        type="text"
                        placeholder="Buscar roles por ID, nombre o descripción..."
                        value={filter}
                        onChange={handleFilterChange}
                        className="block w-full rounded-md border border-gray-300 py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500 text-base outline-none transition-colors"
                    />
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-500" />
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                )}

                {mensaje && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                        <span className="block sm:inline"> {mensaje}</span>
                    </div>
                )}

                {/* Roles Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                                onClick={() => handleSort('rol_id')}
                            >
                                ID Rol {renderSortArrow('rol_id')}
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                                onClick={() => handleSort('nombre')}
                            >
                                Nombre del Rol {renderSortArrow('nombre')}
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                                onClick={() => handleSort('descripcion')}
                            >
                                Descripción {renderSortArrow('descripcion')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedRoles.length > 0 ? (
                            paginatedRoles.map((role) => (
                                <tr key={role.rol_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {role.rol_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {role.nombre}
                                    </td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">
                                        {role.descripcion}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => handleEdit(role)}
                                                className="inline-flex items-center p-2 rounded-full text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                                                aria-label={`Editar ${role.nombre}`}
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(role.rol_id)}
                                                className="inline-flex items-center p-2 rounded-full text-red-600 hover:text-red-900 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                                                aria-label={`Eliminar ${role.nombre}`}
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No se encontraron roles.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <nav
                    className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6 rounded-b-lg"
                    aria-label="Paginación"
                >
                    <div className="hidden sm:block">
                        <p className="text-sm text-gray-700">
                            Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                            <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedAndFilteredRoles.length)}</span> de{' '}
                            <span className="font-medium">{sortedAndFilteredRoles.length}</span> resultados
                        </p>
                    </div>
                    <div className="flex flex-1 justify-between sm:justify-end">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={clsx(
                                "relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors",
                                { "cursor-not-allowed opacity-50": currentPage === 1 }
                            )}
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={clsx(
                                "relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors",
                                { "cursor-not-allowed opacity-50": currentPage === totalPages || totalPages === 0 }
                            )}
                        >
                            Siguiente
                        </button>
                    </div>
                </nav>
                <div className='flex flex-row justify-center space-x-20 mt-6'>
                    <a href={`/${usernameid}/Roles/asignarPermisos`}
                       className={clsx(
                           'flex place-self-center w-fit gap-2 rounded-md bg-gray-200 py-3 px-5 font-medium hover:bg-sky-100 hover:text-blue-600 transition-colors duration-200',
                       )}>
                        <p className="hidden md:block">Asignar Permisos</p>
                    </a>
                    <a href={`/${usernameid}/Roles/crearRol`}
                       className={clsx(
                           'flex place-self-center w-fit  gap-2 rounded-md bg-gray-200 py-3 px-5 font-medium hover:bg-sky-100 hover:text-blue-600 transition-colors duration-200',
                       )}>
                        <p className="hidden md:block">Crear Rol</p>
                    </a>
                </div>
            </div>
        </div>
    );
}
