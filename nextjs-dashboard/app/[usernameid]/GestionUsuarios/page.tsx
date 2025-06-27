"use client"

import React, { useState, useEffect } from "react"
import {PencilIcon, TrashIcon} from "@heroicons/react/24/outline";
import Cookies from "js-cookie";

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

interface ClienteNatural {
  id: string
  cedula: number
  primer_nombre: string
  primer_apellido: string
  segundo_nombre?: string
  segundo_apellido?: string
  direccion: string
  rif: string
  total_puntos: number
  nombre_completo: string
  nombre_completo_full: string
}

interface ClienteJuridico {
  id: string
  rif: string
  razon_social: string
  denominacion_comercial: string
  capital: number
  direccion: string
  total_puntos: number
  nombre_completo: string
  nombre_completo_full: string
}

interface MiembroAcaucab {
  id: string
  rif: string
  razon_social: string
  denominacion_comercial: string
  direccion: string
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
  entidad_asociada?: string
  fk_cliente_natural?: number
  fk_cliente_juridico?: number
  fk_miembro_acaucab?: number
}

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [clientesNaturales, setClientesNaturales] = useState<ClienteNatural[]>([])
  const [clientesJuridicos, setClientesJuridicos] = useState<ClienteJuridico[]>([])
  const [miembrosAcaucab, setMiembrosAcaucab] = useState<MiembroAcaucab[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingEntidades, setLoadingEntidades] = useState(true)
  const [permissions, setPermissions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingUser, setEditingUser] = useState<Usuario | null>(null)
  const [newUser, setNewUser] = useState({ 
    email: "", 
    password: "", 
    tipoEntidad: "empleado" as 'empleado' | 'cliente_natural' | 'cliente_juridico' | 'miembro_acaucab',
    entidadId: "" 
  })
  const [debugMode, setDebugMode] = useState(false)
  const [debugData, setDebugData] = useState<any>({})

  // Cargar usuarios y entidades al montar el componente
  useEffect(() => {
    fetchUsuarios()
    fetchEntidades()
    const permissionsCookie = Cookies.get("permissions");
    if (permissionsCookie != null) {
      setPermissions(JSON.parse(permissionsCookie));
    }
  }, [])

  const fetchEntidades = async () => {
    try {
      setLoadingEntidades(true)

      // Obtener empleados
      const empleadosResponse = await fetch("/api/usuarios?tipoEntidad=empleados", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      if (empleadosResponse.ok) {
        const empleadosData = await empleadosResponse.json()
        setEmpleados(empleadosData.entidades || [])
      }

      // Obtener clientes naturales
      const clientesNaturalesResponse = await fetch("/api/usuarios?tipoEntidad=clientes_naturales", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      if (clientesNaturalesResponse.ok) {
        const clientesNaturalesData = await clientesNaturalesResponse.json()
        setClientesNaturales(clientesNaturalesData.entidades || [])
      }

      // Obtener clientes jurídicos
      const clientesJuridicosResponse = await fetch("/api/usuarios?tipoEntidad=clientes_juridicos", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      if (clientesJuridicosResponse.ok) {
        const clientesJuridicosData = await clientesJuridicosResponse.json();
        // Mapea para asegurar que cada entidad tiene el campo id correcto
        const clientesJuridicosConId = (clientesJuridicosData.entidades || []).map((c: any) => ({
          ...c,
          id: c.cliente_id ? String(c.cliente_id) : c.id
        }));
        setClientesJuridicos(clientesJuridicosConId);
      }

      // Obtener miembros ACAUCAB
      const miembrosAcaucabResponse = await fetch("/api/usuarios?tipoEntidad=miembros_acaucab", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      if (miembrosAcaucabResponse.ok) {
        const miembrosAcaucabData = await miembrosAcaucabResponse.json()
        setMiembrosAcaucab(miembrosAcaucabData.entidades || [])
      }
    } catch (error) {
      console.error("Error cargando entidades:", error)
    } finally {
      setLoadingEntidades(false)
    }
  }

  const fetchDebugData = async () => {
    try {
      const [clientesNaturales, clientesJuridicos, miembrosAcaucab] = await Promise.all([
        fetch("/api/usuarios?tipoEntidad=all_clientes_naturales").then(r => r.json()),
        fetch("/api/usuarios?tipoEntidad=all_clientes_juridicos").then(r => r.json()),
        fetch("/api/usuarios?tipoEntidad=all_miembros_acaucab").then(r => r.json())
      ])

      setDebugData({
        clientesNaturales: clientesNaturales.entidades || [],
        clientesJuridicos: clientesJuridicos.entidades || [],
        miembrosAcaucab: miembrosAcaucab.entidades || []
      })
    } catch (error) {
      console.error("Error cargando datos de debugging:", error)
    }
  }

  const fetchUsuarios = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/usuarios", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()

        try {
          const errorJson = JSON.parse(errorText)
          throw new Error(errorJson.error || errorJson.details || `Error ${response.status}`)
        } catch {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }
      }

      const data = await response.json()

      // Asegurar que siempre tenemos un array
      const usuariosArray = data.users || data.usuarios || []

      setUsuarios(Array.isArray(usuariosArray) ? usuariosArray : [])
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido")
      setUsuarios([])
    } finally {
      setLoading(false)
    }
  }

  const createUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.entidadId) {
      alert("Por favor, completa todos los campos incluyendo la selección de entidad")
      return
    }

    // Agrega este log para depuración
    console.log('Valor de entidadId:', newUser.entidadId, 'Tipo:', typeof newUser.entidadId);

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
      setNewUser({ email: "", password: "", tipoEntidad: "empleado", entidadId: "" })
      alert("Usuario creado exitosamente")
      
      // Recargar entidades para actualizar las listas
      fetchEntidades()
    } catch (error) {
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
          // No enviar tipoEntidad ni entidadId ya que no se pueden cambiar
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
      
      // Recargar entidades para actualizar las listas
      fetchEntidades()
    } catch (error) {
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
      
      // Recargar entidades para actualizar las listas
      fetchEntidades()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al eliminar usuario")
    }
  }

  // Obtener las entidades disponibles según el tipo seleccionado
  const getEntidadesDisponibles = () => {
    switch (newUser.tipoEntidad) {
      case 'empleado':
        return empleados
      case 'cliente_natural':
        return clientesNaturales
      case 'cliente_juridico':
        return clientesJuridicos
      case 'miembro_acaucab':
        return miembrosAcaucab
      default:
        return []
    }
  }

  const getEntidadDisplayName = (entidad: any) => {
    const baseName = (() => {
      switch (newUser.tipoEntidad) {
        case 'empleado':
          return `${entidad.nombre_completo} (Cédula: ${entidad.cedula})`
        case 'cliente_natural':
          return `${entidad.nombre_completo} (Cédula: ${entidad.cedula})`
        case 'cliente_juridico':
          return `${entidad.razon_social} (RIF: ${entidad.rif})`
        case 'miembro_acaucab':
          return `${entidad.razon_social} (RIF: ${entidad.rif})`
        default:
          return entidad.nombre_completo || entidad.razon_social || 'Sin nombre'
      }
    })()
    
    // Agregar indicador si tiene usuario (solo para debugging o información)
    if (entidad.tiene_usuario) {
      return `${baseName} ✅ (Ya tiene usuario)`
    }
    
    return baseName
  }

  // Filtrar usuarios basado en el término de búsqueda
  const filteredUsers =
    usuarios?.filter(
      (user) =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.empleado_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.entidad_asociada?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.primer_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.primer_apellido?.toLowerCase().includes(searchTerm.toLowerCase()),
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

        {/* Botón de debugging temporal */}
        <div className="mb-4">
          <button
            onClick={() => {
              setDebugMode(!debugMode)
              if (!debugMode) {
                fetchDebugData()
              }
            }}
            className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
          >
            {debugMode ? "Ocultar Debug" : "Mostrar Debug - Ver todas las entidades"}
          </button>
        </div>

        {/* Sección de debugging */}
        {debugMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">Debug - Todas las entidades</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-yellow-700 mb-2">Clientes Naturales ({debugData.clientesNaturales?.length || 0})</h4>
                <div className="text-sm space-y-1 max-h-40 overflow-y-auto">
                  {debugData.clientesNaturales?.map((cliente: any) => (
                    <div key={cliente.id} className={`p-1 rounded ${cliente.tiene_usuario ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {cliente.nombre_completo} - {cliente.tiene_usuario ? 'Con usuario' : 'Sin usuario'}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-yellow-700 mb-2">Clientes Jurídicos ({debugData.clientesJuridicos?.length || 0})</h4>
                <div className="text-sm space-y-1 max-h-40 overflow-y-auto">
                  {debugData.clientesJuridicos?.map((cliente: any) => (
                    <div key={cliente.id} className={`p-1 rounded ${cliente.tiene_usuario ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {cliente.razon_social} - {cliente.tiene_usuario ? 'Con usuario' : 'Sin usuario'}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-yellow-700 mb-2">Miembros ACAUCAB ({debugData.miembrosAcaucab?.length || 0})</h4>
                <div className="text-sm space-y-1 max-h-40 overflow-y-auto">
                  {debugData.miembrosAcaucab?.map((miembro: any) => (
                    <div key={miembro.id} className={`p-1 rounded ${miembro.tiene_usuario ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {miembro.razon_social} - {miembro.tiene_usuario ? 'Con usuario' : 'Sin usuario'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulario para crear nuevo usuario */}
        {permissions.some((element) => element.descripcion.includes('crear USUARIO')) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-green-600">+</span>
            Crear Nuevo Usuario
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              value={newUser.tipoEntidad}
              onChange={(e) => setNewUser((prev) => ({ 
                ...prev, 
                tipoEntidad: e.target.value as 'empleado' | 'cliente_natural' | 'cliente_juridico' | 'miembro_acaucab',
                entidadId: "" // Reset entidadId when changing tipoEntidad
              }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="empleado">Empleado</option>
              <option value="cliente_natural">Cliente Natural</option>
              <option value="cliente_juridico">Cliente Jurídico</option>
              <option value="miembro_acaucab">Miembro ACAUCAB</option>
            </select>
            <select
              value={newUser.entidadId}
              onChange={(e) => setNewUser((prev) => ({ ...prev, entidadId: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loadingEntidades}
            >
              <option value="">{loadingEntidades ? "Cargando entidades..." : "Seleccionar entidad"}</option>
              {getEntidadesDisponibles().map((entidad) => (
                <option key={entidad.id} value={entidad.id}>
                  {getEntidadDisplayName(entidad)}
                </option>
              ))}
            </select>
            <button
              onClick={createUser}
              disabled={loadingEntidades}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>+</span>
              Crear
            </button>
          </div>
        </div>
        )}
        {/* Barra de búsqueda */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Buscar usuarios por email, empleado o entidad..."
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
                          placeholder="Email"
                        />
                        <input
                          type="password"
                          value={editingUser.password || ""}
                          onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, password: e.target.value } : null))}
                          className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nueva contraseña (dejar vacío para mantener la actual)"
                        />
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
                          {user.entidad_asociada && (
                            <p className="text-sm text-blue-600">
                              👤 {user.entidad_asociada}
                            </p>
                          )}
                          {user.fecha_creacion && (
                            <p className="text-xs text-gray-400">Creado: {user.fecha_creacion}</p>
                          )}
                        </div>
                        <div className="flex gap-2 pr-6">
                          {permissions.some((element) => element.descripcion.includes('modificar USUARIO')) && (
                          <button
                              onClick={() => setEditingUser(user)}
                              className="inline-flex items-center p-2 rounded-full text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                              )}
                          {permissions.some((element) => element.descripcion.includes('eliminar USUARIO')) && (
                          <button
                              onClick={() => deleteUser(user.id)}
                              className="inline-flex items-center p-2 rounded-full text-red-600 hover:text-red-900 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                          )}
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
