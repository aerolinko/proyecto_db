"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import clsx from "clsx";
import { MagnifyingGlassIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

// Define types
type SortDirection = 'asc' | 'desc';

interface Order {
    compra_reposicion_id: number;
    denominacion_comercial: string;
    productos: string;
    estado?: string;
}

interface OrderStatus {
    orderId: number;
    status: string;
}

interface StatusOption {
    value: string;
    label: string;
}

export default function Orders({ params }: { params: { usernameid: number } }) {
    const { usernameid } = React.use(params);
    const [filter, setFilter] = useState('');
    const [ordenes, setOrdenes] = useState<Order[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [error, setError] = useState<string | null>(null);
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [sortColumn, setSortColumn] = useState<keyof Order>('compra_reposicion_id');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    // Status management state
    const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>([]);
    const [statusOptions, setStatusOptions] = useState<StatusOption[]>([
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
    ]);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch orders
    useEffect(() => {
        async function fetchOrders() {
            try {
                const response = await fetch("/api/ordenes?almacen=1", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });

                if (!response.ok) {
                    throw new Error(`¡Error HTTP! Estado: ${response.status}`);
                }

                const data = await response.json();
                console.log(data.result);
                setOrdenes(data.result);
                setError(null);

                // Initialize statuses from fetched orders if they have estado
                const initialStatuses = data.result
                    .filter((order: Order) => order.estado)
                    .map((order: Order) => ({
                        orderId: order.compra_reposicion_id,
                        status: order.estado as string
                    }));
                setSelectedStatuses(initialStatuses);
            } catch (error: any) {
                setError(error.message);
                setOrdenes([]);
            }
        }
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
                orden.denominacion_comercial.toLowerCase().includes(lowerCaseFilter) ||
                orden.productos.toLowerCase().includes(lowerCaseFilter) ||
                orden.compra_reposicion_id.toString().toLowerCase().includes(lowerCaseFilter)
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
                    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
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

    // Status management
    const handleStatusChange = useCallback((orderId: number, newStatus: string) => {
        setSelectedStatuses(prev => {
            const filtered = prev.filter(item => item.orderId !== orderId);
            return newStatus ? [...filtered, { orderId, status: newStatus }] : filtered;
        });
    }, []);

    const getCurrentStatus = useCallback((orderId: number) => {
        const statusObj = selectedStatuses.find(item => item.orderId === orderId);
        return statusObj ? statusObj.status : '';
    }, [selectedStatuses]);

    // Save status changes
    const saveStatusChanges = useCallback(async () => {
        if (selectedStatuses.length === 0) return;

        setIsSaving(true);
        try {
            const response = await fetch('/api/update-order-statuses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ statusUpdates: selectedStatuses })
            });

            if (!response.ok) {
                throw new Error(`Error saving statuses: ${response.statusText}`);
            }

            setMensaje('Status changes saved successfully');
            setTimeout(() => setMensaje(null), 2000);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsSaving(false);
        }
    }, [selectedStatuses]);

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

                {/* Orders Table */}
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
                                onClick={() => handleSort('denominacion_comercial')}
                            >
                                Nombre del Proveedor {renderSortArrow('denominacion_comercial')}
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
                                            <select
                                                className='border border-gray-300 rounded-md shadow-sm'
                                                value={getCurrentStatus(orden.compra_reposicion_id)}
                                                onChange={(e) => handleStatusChange(orden.compra_reposicion_id, e.target.value)}
                                            >
                                                <option value="">Select status...</option>
                                                {statusOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
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

                {/* Save Status Changes Button */}
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={saveStatusChanges}
                        disabled={selectedStatuses.length === 0 || isSaving}
                        className={clsx(
                            "bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors",
                            { "opacity-50 cursor-not-allowed": selectedStatuses.length === 0 || isSaving }
                        )}
                    >
                        {isSaving ? 'Guardando...' : 'Guardar Cambios de Estado'}
                    </button>
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