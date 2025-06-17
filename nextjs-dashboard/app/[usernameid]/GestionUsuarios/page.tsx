"use client";

import React, { useState, useEffect, useCallback } from "react";
import UsuarioCard from "@/app/ui/usuarios/usuarioCard";
import Link from "next/link";
import clsx from "clsx";
import { MagnifyingGlassIcon, UserPlusIcon } from "@heroicons/react/24/outline";

interface Usuario {
  usuario_id: number
  nombre: string
  email: string
  rol_id?: number
  rol_nombre?: string
  activo: boolean
  fecha_creacion: string
}

interface Rol {
  rol_id: number
  nombre: string
  descripcion: string
}

export default function GestionUsuarios({
  params,
}: {
  params: Promise<{ usernameid: number }>
}) {
  const { usernameid } = React.use(params)
  const [filter, setFilter] = useState("")
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [roles, setRoles] = useState<Rol[]>([])
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])

  // Fetch usuarios
  useEffect(() => {
    async function fetchUsuarios() {
      try {
        setLoading(true)
        const response = await fetch("/api/usuarios", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setUsuarios(data.result)
        setFilteredUsuarios(data.result)
      } catch (error) {
        // @ts-ignore
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    async function fetchRoles() {
      try {
        const response = await fetch("/api/roles?roles=1", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setRoles(data.result)
      } catch (error) {
        // @ts-ignore
        setError(error.message)
      }
    }

    fetchUsuarios()
    fetchRoles()
  }, [])

  // Filter usuarios
  useEffect(() => {
    if (filter) {
      setFilteredUsuarios(
        usuarios.filter(
          (usuario) =>
            usuario.nombre.toLowerCase().includes(filter.toLowerCase()) ||
            usuario.email.toLowerCase().includes(filter.toLowerCase()) ||
            (usuario.rol_nombre && usuario.rol_nombre.toLowerCase().includes(filter.toLowerCase())),
        ),
      )
    } else {
      setFilteredUsuarios(usuarios)
    }
  }, [filter, usuarios])

  const handleUserUpdate = useCallback((updatedUser: Usuario) => {
    setUsuarios((prev) => prev.map((user) => (user.usuario_id === updatedUser.usuario_id ? updatedUser : user)))
  }, [])

  const handleUserDelete = useCallback((userId: number) => {
    setUsuarios((prev) => prev.filter((user) => user.usuario_id !== userId))
  }, [])

  const handleBulkAction = useCallback(
    async (action: string) => {
      if (selectedUsers.length === 0) return

      try {
        const response = await fetch("/api/usuarios", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            userIds: selectedUsers,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        // Refresh usuarios list
        window.location.reload()
      } catch (error) {
        // @ts-ignore
        setError(error.message)
      }
    },
    [selectedUsers],
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-6xl">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border-2">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
            <Link
              href={`/${usernameid}/crearUsuario`}
              className={clsx(
                "flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 transition-colors",
              )}
            >
              <UserPlusIcon className="h-5 w-5" />
              <span>Crear Usuario</span>
            </Link>
          </div>

          {/* Search and Bulk Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar usuarios por nombre, email o rol..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 p-3 rounded-lg w-full pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>

            {selectedUsers.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction("activate")}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Activar ({selectedUsers.length})
                </button>
                <button
                  onClick={() => handleBulkAction("deactivate")}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Desactivar ({selectedUsers.length})
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Eliminar ({selectedUsers.length})
                </button>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
          )}

          {/* Users List */}
          {filteredUsuarios.length === 0 ? (
            <div className="text-center py-12">
              <UserPlusIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">
                {filter ? "No se encontraron usuarios con ese filtro." : "No hay usuarios registrados."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Select All Checkbox */}
              <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsuarios.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers(filteredUsuarios.map((u) => u.usuario_id))
                    } else {
                      setSelectedUsers([])
                    }
                  }}
                  className="rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Seleccionar todos ({filteredUsuarios.length} usuarios)
                </label>
              </div>

              {/* Users Grid */}
              <div className="grid gap-4">
                {filteredUsuarios.map((usuario) => (
                  <UsuarioCard
                    key={usuario.usuario_id}
                    usuario={usuario}
                    roles={roles}
                    onUpdate={handleUserUpdate}
                    onDelete={handleUserDelete}
                    isSelected={selectedUsers.includes(usuario.usuario_id)}
                    onSelect={(selected) => {
                      if (selected) {
                        setSelectedUsers((prev) => [...prev, usuario.usuario_id])
                      } else {
                        setSelectedUsers((prev) => prev.filter((id) => id !== usuario.usuario_id))
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
