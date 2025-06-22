"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import clsx from "clsx";
import {
    CheckCircleIcon,
    CheckIcon, ClockIcon, Cog6ToothIcon, CubeIcon, DocumentCheckIcon, DocumentDuplicateIcon, LinkIcon,
    MagnifyingGlassIcon,
    PencilIcon, PencilSquareIcon,
    ShoppingBagIcon,
    TrashIcon,
    TruckIcon, UserGroupIcon, XCircleIcon, XMarkIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";

// Define types
type SortDirection = 'asc' | 'desc';

interface Order {
    reposicion_anaquel_id: number;
    fecha: string;
    productos: string;
    estado: string;
}



export default function Orders({
                                   params,
                               }: {
    params: Promise<{ usernameid: number }>
}) {
    const { usernameid } = React.use(params);
    const [filter, setFilter] = useState('');
    const [ordenes, setOrdenes] = useState<Order[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [error, setError] = useState<string | null>(null);
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [sortColumn, setSortColumn] = useState<keyof Order>('reposicion_anaquel_id');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    // Status management state



    async function fetchOrders() {
        try {
            const response = await fetch("/api/ordenes?anaquel=1", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) {
                throw new Error(`¡Error HTTP! Estado: ${response.status}`);
            }

            const data = await response.json();
            console.log(data.result);
            if(!data.result){
                setOrdenes([]);
            }
            else{
                setOrdenes(data.result);
                setError(null);
            }
            // Initialize statuses from fetched orders if they have estado


        } catch (error: any) {
            setError(error.message);
            setOrdenes([]);
        }
    }





    // Fetch orders
    useEffect(() => {
        fetchOrders();
    }, []);

    // Sorting handler
    const handleSort = useCallback((column: keyof Order) => {
        if (sortColumn === column) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    }, [sortColumn]);

    // Filter and sort orders
    const sortedAndFilteredOrdenes = useMemo(() => {
        let currentOrdenes = [...ordenes];

        // Filter
        if (filter) {
            const lowerCaseFilter = filter.toLowerCase();
            currentOrdenes = currentOrdenes.filter(orden =>
                orden.productos.toLowerCase().includes(lowerCaseFilter) ||
                orden.reposicion_anaquel_id.toString().toLowerCase().includes(lowerCaseFilter) ||
                orden.estado.toLowerCase().includes(lowerCaseFilter)
            );
        }

        // Sort
        if (sortColumn) {
            currentOrdenes.sort((a, b) => {
                const aValue = a[sortColumn];
                const bValue = b[sortColumn];

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortDirection === 'desc' ? aValue - bValue : bValue - aValue;
                }
                return 0;
            });
        }

        return currentOrdenes;
    }, [ordenes, filter, sortColumn, sortDirection]);

    // Pagination
    const totalPages = useMemo(() => {
        return Math.ceil(sortedAndFilteredOrdenes.length / itemsPerPage);
    }, [sortedAndFilteredOrdenes.length, itemsPerPage]);

    const paginatedOrdenes = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedAndFilteredOrdenes.slice(startIndex, endIndex);
    }, [sortedAndFilteredOrdenes, currentPage, itemsPerPage]);

    const handlePageChange = useCallback((page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }, [totalPages]);

    const handleFilterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(event.target.value);
        setCurrentPage(1);
    }, []);

    const handleSubmit = async (id:number, cambio:string) => {
        try {
            const response = await fetch("/api/ordenes?anaquel=1", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({id, cambio}),
            });

            if (!response.ok) {
                throw new Error(`¡Error HTTP! Estado: ${response.status}`);
            }
            fetchOrders();
        } catch (error: any) {
            setError(error.message);
        }
    };

    // Render sort arrow
    const renderSortArrow = (column: keyof Order) => {
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
                        placeholder="Buscar por nombre, ID, estado o productos..."
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

                {/* Orders Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                                onClick={() => handleSort('reposicion_anaquel_id')}
                            >
                                ID Orden {renderSortArrow('reposicion_anaquel_id')}
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"

                            >
                                Fecha de emisión
                            </th>

                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                                onClick={() => handleSort('productos')}
                            >
                                Productos {renderSortArrow('productos')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Accion
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedOrdenes.length > 0 ? (
                            paginatedOrdenes.map((orden) => (
                                <tr key={orden.reposicion_anaquel_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {orden.reposicion_anaquel_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {orden.fecha}
                                    </td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">
                                        {orden.productos}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-normal text-sm font-bold flex flex-col items-center text-gray-900`}>
                                        <span className="truncate">{orden.estado}</span>
                                        {(orden.estado == 'Completado' || orden.estado == 'Recibido') && (
                                            <CheckCircleIcon className="w-5 h-5 text-green-400"></CheckCircleIcon>
                                        )}
                                        {(orden.estado == 'En Proceso' || orden.estado == 'Pendiente') && (
                                            <ClockIcon className="w-5 h-5 text-amber-500"></ClockIcon>
                                        )}
                                        {orden.estado == 'En Revisión' && (
                                            <PencilSquareIcon className="w-5 h-5 text-indigo-500 "></PencilSquareIcon>
                                        )}
                                        {(orden.estado == 'Cancelado' || orden.estado == 'Rechazado') && (
                                            <XCircleIcon className="w-5 h-5 text-red-500"></XCircleIcon>
                                        )}

                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center rounded space-x-3">
                                            {(orden.estado == 'Completado' || orden.estado == 'Recibido') && (
                                                <></>
                                            )}
                                            {(orden.estado == 'En Proceso' || orden.estado == 'Pendiente') && (
                                                <div className={`flex`}>
                                                    <button
                                                        onClick={() => handleSubmit(orden.reposicion_anaquel_id,'Recibido')}
                                                        className="inline-flex items-center p-2 flex-col rounded-full text-purple-600 hover:text-purple-900 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"

                                                    >
                                                        <TruckIcon className="h-5 w-5" />
                                                        <span className='text-xs font-semibold'>Entregado</span>

                                                    </button>
                                                    <button
                                                        onClick={() => handleSubmit(orden.reposicion_anaquel_id,'Cancelado')}
                                                        className=" items-center flex-col flex  p-2 rounded-full text-red-600 hover:text-red-900 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"

                                                    >
                                                        <XMarkIcon className="h-5 w-5" />
                                                        <span className='text-xs font-semibold'>Cancelar</span>

                                                    </button>
                                                </div>

                                            )}
                                            {orden.estado == 'En Revisión' && (
                                                <div className={`flex`}>
                                                    <button
                                                        onClick={() => handleSubmit(orden.reposicion_anaquel_id,'Pendiente')}
                                                        className=" p-2 items-center flex-col flex  rounded-full text-green-600 hover:text-green-900 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"

                                                    >
                                                        <CheckIcon className="h-5 w-5" />
                                                        <span className='text-xs font-semibold'>Aprobar</span>

                                                    </button>
                                                    <button
                                                        onClick={() => handleSubmit(orden.reposicion_anaquel_id,'Rechazado')}
                                                        className=" items-center flex-col flex  p-2 rounded-full text-red-600 hover:text-red-900 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"

                                                    >
                                                        <XMarkIcon className="h-5 w-5" />
                                                        <span className='text-xs font-semibold'>Rechazar</span>

                                                    </button>
                                                </div>
                                            )}
                                            {(orden.estado == 'Cancelado' || orden.estado == 'Rechazado') && (
                                                <div></div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No se encontraron ordenes.
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