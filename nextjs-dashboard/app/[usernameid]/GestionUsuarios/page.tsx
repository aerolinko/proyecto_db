"use client"

import React, { useState, useEffect } from "react"
import {PencilIcon, TrashIcon} from "@heroicons/react/24/outline";

interface Empleado {
  id: string
  cedula: number
  primer_nombre: string
  primer_apellido: string
  segundo_nombre?: string
  segundo_apellido?: string
  direccion: string
  fecha_contrato: string
  fk_lugar: number
  nombre_completo: string
  nombre_completo_full: string
}

interface Usuario {
  id: string
  email: string
  fecha_creacion?: string
  empleado_id?: string
  empleado_nombre?: string
  primer_nombre?: string
  primer_apellido?: string
  cedula?: number
  password?: string
}

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingEmpleados, setLoadingEmpleados] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [newUser, setNewUser] = useState({ email: "", password: "", empleadoId: "" })
  const [debugInfo, setDebugInfo] = useState<any>(null)

  // Cargar usuarios y empleados al montar el componente
  useEffect(() => {
    fetchUsuarios()
    fetchEmpleados()
  }, [])

  const fetchEmpleados = async () => {
    try {
      setLoadingEmpleados(true)
      console.log("Cargando empleados...")

      const response = await fetch("/api/empleados", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response empleados:", errorText)
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Empleados cargados:", data.empleados?.length || 0)
      setEmpleados(data.empleados || [])
    } catch (error) {
      console.error("Error cargando empleados:", error)
      // No bloquear la UI si no se pueden cargar empleados
      setEmpleados([])
    } finally {
      setLoadingEmpleados(false)
    }
  }

  const fetchUsuarios = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Iniciando fetch de usuarios...")

      const response = await fetch("/api/usuarios", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Response status:", response.status)
      console.log("Response ok:", response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response:", errorText)

        try {
          const errorJson = JSON.parse(errorText)
          throw new Error(errorJson.error || errorJson.details || `Error ${response.status}`)
        } catch {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }
      }

      const data = await response.json()
      console.log("API Response completa:", data)
      setDebugInfo(data)

      // Asegurar que siempre tenemos un array
      const usuariosArray = data.users || data.usuarios || []
      console.log("Usuarios array:", usuariosArray)

      setUsuarios(Array.isArray(usuariosArray) ? usuariosArray : [])
    } catch (error) {
      console.error("Error completo en fetchUsuarios:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
      setUsuarios([])
    } finally {
      setLoading(false)
    }
  }

  const createUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.empleadoId) {
      alert("Por favor, completa todos los campos incluyendo la selección de empleado")
      return
    }

    try {
      const response = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al crear usuario")
      }

      const data = await response.json()
      setUsuarios((prev) => [...(prev || []), data.user])
      setNewUser({ email: "", password: "", empleadoId: "" })
      alert("Usuario creado exitosamente")
    } catch (error) {
      console.error("Error creating user:", error)
      alert(error instanceof Error ? error.message : "Error al crear usuario")
    }
  }

  const updateUser = async () => {
    if (!editingUser) return

    try {
      const response = await fetch(`/api/usuarios?id=${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: editingUser.email,
          password: editingUser.password,
          empleadoId: editingUser.empleado_id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al actualizar usuario")
      }

      const data = await response.json()
      setUsuarios((prev) => (prev || []).map((user) => (user.id === editingUser.id ? data.user : user)))
      setEditingUser(null)
      alert("Usuario actualizado exitosamente")
    } catch (error) {
      console.error("Error updating user:", error)
      alert(error instanceof Error ? error.message : "Error al actualizar usuario")
    }
  }

  const deleteUser = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      return
    }

    try {
      const response = await fetch(`/api/usuarios?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al eliminar usuario")
      }

      setUsuarios((prev) => (prev || []).filter((user) => user.id !== id))
      alert("Usuario eliminado exitosamente")
    } catch (error) {
      console.error("Error deleting user:", error)
      alert(error instanceof Error ? error.message : "Error al eliminar usuario")
    }
  }

  // Filtrar usuarios basado en el término de búsqueda
  const filteredUsers =
    usuarios?.filter(
      (user) =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.empleado_nombre?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  // Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Cargando usuarios...</p>
          <p className="text-sm text-gray-500 mt-2">Conectando a la base de datos...</p>
        </div>
      </div>
    )
  }

  // Estado de error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error de Base de Datos</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchUsuarios}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestión de Usuarios</h1>

        {/* Información de debug expandida */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            <strong>Debug:</strong> Total usuarios: {usuarios?.length || 0} | Empleados: {empleados?.length || 0}
          </p>
          <p className="text-blue-600 text-sm">
            Estado: {loading ? "Cargando..." : error ? `Error: ${error}` : "Cargado correctamente"}
          </p>
          <p className="text-blue-600 text-sm">
            Empleados: {loadingEmpleados ? "Cargando..." : `${empleados.length} disponibles`}
          </p>
        </div>

        {/* Formulario para crear nuevo usuario */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-green-600">+</span>
            Crear Nuevo Usuario
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="email"
              placeholder="Email (nombre_usuario)"
              value={newUser.email}
              onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={newUser.password}
              onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={newUser.empleadoId}
              onChange={(e) => setNewUser((prev) => ({ ...prev, empleadoId: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loadingEmpleados}
            >
              <option value="">{loadingEmpleados ? "Cargando empleados..." : "Seleccionar empleado"}</option>
              {empleados.map((empleado) => (
                <option key={empleado.id} value={empleado.id}>
                  {empleado.nombre_completo} (Cédula: {empleado.cedula})
                </option>
              ))}
            </select>
            <button
              onClick={createUser}
              disabled={loadingEmpleados}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>+</span>
              Crear
            </button>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Buscar usuarios por email o empleado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Lista de usuarios */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">
              Usuarios ({filteredUsers?.length || 0} {filteredUsers?.length === 1 ? "usuario" : "usuarios"})
            </h2>
          </div>
          <div className="p-6">
            {filteredUsers && filteredUsers.length > 0 ? (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    {editingUser?.id === user.id ? (
                      <div className="flex gap-2 flex-1 flex-wrap">
                        <input
                          type="email"
                          value={editingUser.email}
                          onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, email: e.target.value } : null))}
                          className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          value={editingUser.empleado_id || ""}
                          onChange={(e) =>
                            setEditingUser((prev) => (prev ? { ...prev, empleado_id: e.target.value } : null))
                          }
                          className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Sin empleado asignado</option>
                          {empleados.map((empleado) => (
                            <option key={empleado.id} value={empleado.id}>
                              {empleado.nombre_completo} (Cédula: {empleado.cedula})
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={updateUser}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{user.email}</p>
                          <p className="text-sm text-gray-500">ID: {user.id}</p>
                          {user.empleado_nombre && (
                            <p className="text-sm text-blue-600">
                              👤 Empleado: {user.empleado_nombre}
                              {user.cedula && ` (Cédula: ${user.cedula})`}
                            </p>
                          )}
                          {user.fecha_creacion && (
                            <p className="text-xs text-gray-400">Creado: {user.fecha_creacion}</p>
                          )}
                        </div>
                        <div className="flex gap-2 pr-6">
                          <button
                              onClick={() => setEditingUser(user)}
                              className="inline-flex items-center p-2 rounded-full text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                              onClick={() => deleteUser(user.id)}
                              className="inline-flex items-center p-2 rounded-full text-red-600 hover:text-red-900 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <p className="text-gray-500 text-lg mb-4">
                  {searchTerm
                    ? `No se encontraron usuarios que coincidan con "${searchTerm}"`
                    : "No hay usuarios registrados"}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Mostrar todos
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
