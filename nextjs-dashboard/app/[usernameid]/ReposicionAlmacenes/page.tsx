"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
// NOTA: Se ha eliminado el import de "next/link" para resolver los errores de compilación en este entorno.
// Se usará una etiqueta <a> estándar para los enlaces.
import clsx from "clsx";
import { MagnifyingGlassIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

// Define un tipo para tus datos de rol para una mejor seguridad de tipos
// Define un tipo para la dirección de ordenación
type SortDirection = 'asc' | 'desc';

export default function Roles({
                                  params
                              }:{
    // Los params de ruta son directamente accesibles, no como una Promise
    params: { usernameid: number }
}) {
    // @ts-ignore
    const { usernameid } = React.use(params);
    const [filter, setFilter] = useState(''); // Estado para la entrada de búsqueda
    const [ordenes, setOrdenes] = useState<any[]>([]); // Estado para almacenar los datos de los roles
    const [currentPage, setCurrentPage] = useState(1); // Página actual para la paginación
    const [itemsPerPage] = useState(5); // Número de elementos por página
    const [error, setError] = useState<string | null>(null); // Estado para manejar errores de la API
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [permissions, setPermissions] = useState([]);
    // Estados para la ordenación
    const [sortColumn, setSortColumn] = useState<keyof Role>('rol_id'); // Columna de ordenación por defecto
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc'); // Dirección de ordenación por defecto

    // En una aplicación real, obtendrías los roles aquí de una API
    useEffect(() => {
        async function fetchRoles() {
            try {
                const response = await fetch("/api/ordenes?almacen=1", {
                    method: "GET", // Especifica el metodo HTTP como GET.
                    headers: { "Content-Type": "application/json" } // Establece el encabezado de la solicitud.
                });
                // Comprueba si la respuesta HTTP fue exitosa (código de estado 200-299).
                if (!response.ok) {
                    // Lanza un error si la respuesta HTTP indica un problema.
                    throw new Error(`¡Error HTTP! Estado: ${response.status}`);
                }
                const data = await response.json();
                console.log(data.result);
                setOrdenes(data.result);
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
    const sortedAndFilteredOrdenes = useMemo(() => {
        let currentOrdenes = [...ordenes]; // Crear una copia para no mutar el estado original

        // 1. Filtrar
        if (filter) {
            const lowerCaseFilter = filter.toLowerCase();
            currentOrdenes = currentOrdenes.filter(orden =>
                orden.denominacion_comercial.toLowerCase().includes(lowerCaseFilter) ||
                orden.productos.toLowerCase().includes(lowerCaseFilter) ||
                orden.compra_reposicion_id.toString().toLowerCase().includes(lowerCaseFilter) // También permite filtrar por ID
            );
        }

        // 2. Ordenar
        if (sortColumn) {
            currentOrdenes.sort((a, b) => {
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

        return currentOrdenes;
    }, [ordenes, filter, sortColumn, sortDirection]);

    // Calcular el total de páginas para la paginación
    const totalPages = useMemo(() => {
        return Math.ceil(sortedAndFilteredOrdenes.length / itemsPerPage);
    }, [sortedAndFilteredOrdenes.length, itemsPerPage]);

    // Obtener roles para la página actual
    const paginatedOrdenes = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedAndFilteredOrdenes.slice(startIndex, endIndex);
    }, [sortedAndFilteredOrdenes, currentPage, itemsPerPage]);

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
        <div className="flex flex-col items-center justify-center min-h-full bg-gradient-to-br from-purple-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl bg-white p-6 sm:p-8 rounded-2xl shadow-xl border-2 transform transition-all duration-300">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Historial de Ordenes</h1>

                {/* Search Input */}
                <div className="relative mb-6 rounded-md shadow-sm">
                    <label htmlFor="search" className="sr-only">Buscar roles</label>
                    <input
                        id="search"
                        type="text"
                        placeholder="Buscar por nombre, ID o productos..."
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
                                onClick={() => handleSort('compra_reposicion_id')}
                            >
                                ID Orden {renderSortArrow('compra_reposicion_id')}
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                                onClick={() => handleSort('orden.denominacion_comercial')}
                            >
                                Nombre del Proveedor {renderSortArrow('orden.denominacion_comercial')}
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                                onClick={() => handleSort('productos')}
                            >
                                Productos {renderSortArrow('productos')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedOrdenes.length > 0 ? (
                            paginatedOrdenes.map((orden) => (
                                <tr key={orden.compra_reposicion_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {orden.compra_reposicion_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {orden.denominacion_comercial}
                                    </td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">
                                        {orden.productos}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center rounded space-x-3">
                                            <select className='border border-gray-300 rounded-md shadow-sm'>
                                                <option>
                                                    awadd
                                                </option>
                                                <option>
                                                    aaa
                                                </option>
                                                <option>
                                                    addd
                                                </option>
                                                <option>
                                                    awff
                                                </option>
                                            </select>
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
                            <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedAndFilteredOrdenes.length)}</span> de{' '}
                            <span className="font-medium">{sortedAndFilteredOrdenes.length}</span> resultados
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
            </div>
        </div>
    );
}
