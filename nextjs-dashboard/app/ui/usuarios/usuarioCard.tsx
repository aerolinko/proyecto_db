"use client"

import { useState, useCallback } from "react"
import {
  UserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline"

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

interface UsuarioCardProps {
  usuario: Usuario
  roles: Rol[]
  onUpdate: (usuario: Usuario) => void
  onDelete: (userId: number) => void
  isSelected: boolean
  onSelect: (selected: boolean) => void
}

export default function UsuarioCard({ usuario, roles, onUpdate, onDelete, isSelected, onSelect }: UsuarioCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    nombre: usuario.nombre,
    email: usuario.email,
    rol_id: usuario.rol_id || "",
    activo: usuario.activo,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSave = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/usuarios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuario.usuario_id,
          ...editData,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      onUpdate(data.result)
      setIsEditing(false)
    } catch (error) {
      // @ts-ignore
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [editData, usuario.usuario_id, onUpdate])

  const handleDelete = useCallback(async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) return

    try {
      setLoading(true)
      const response = await fetch(`/api/usuarios?id=${usuario.usuario_id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      onDelete(usuario.usuario_id)
    } catch (error) {
      // @ts-ignore
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [usuario.usuario_id, onDelete])

  const toggleActive = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/usuarios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: usuario.usuario_id,
          activo: !usuario.activo,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      onUpdate(data.result)
    } catch (error) {
      // @ts-ignore
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [usuario.usuario_id, usuario.activo, onUpdate])

  return (
    <div
      className={`bg-white border-2 rounded-xl p-6 transition-all duration-200 ${
        isSelected ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
      } ${loading ? "opacity-50" : ""}`}
    >
      {/* Header with checkbox and status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="rounded"
          />
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              usuario.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {usuario.activo ? <CheckCircleIcon className="h-4 w-4" /> : <XCircleIcon className="h-4 w-4" />}
            {usuario.activo ? "Activo" : "Inactivo"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            disabled={loading}
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={toggleActive}
            className={`p-2 rounded-lg transition-colors ${
              usuario.activo
                ? "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                : "text-green-600 hover:text-green-700 hover:bg-green-50"
            }`}
            disabled={loading}
          >
            {usuario.activo ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            disabled={loading}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">{error}</div>
      )}

      {isEditing ? (
        /* Edit Mode */
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={editData.nombre}
              onChange={(e) => setEditData((prev) => ({ ...prev, nombre: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={editData.email}
              onChange={(e) => setEditData((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              value={editData.rol_id}
              onChange={(e) =>
                setEditData((prev) => ({ ...prev, rol_id: Number.parseInt(e.target.value) || "" }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Sin rol asignado</option>
              {roles.map((rol) => (
                <option key={rol.rol_id} value={rol.rol_id}>
                  {rol.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={() => {
                setIsEditing(false)
                setEditData({
                  nombre: usuario.nombre,
                  email: usuario.email,
                  rol_id: usuario.rol_id || "",
                  activo: usuario.activo,
                })
                setError("")
              }}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        /* View Mode */
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <UserIcon className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-semibold text-gray-900">{usuario.nombre}</p>
              <p className="text-sm text-gray-500">ID: {usuario.usuario_id}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <EnvelopeIcon className="h-5 w-5 text-gray-500" />
            <p className="text-gray-700">{usuario.email}</p>
          </div>

          {usuario.rol_nombre && (
            <div className="flex items-center gap-3">
              <ShieldCheckIcon className="h-5 w-5 text-gray-500" />
              <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm font-medium">
                {usuario.rol_nombre}
              </span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <CalendarIcon className="h-5 w-5 text-gray-500" />
            <p className="text-sm text-gray-600">
              Creado: {new Date(usuario.fecha_creacion).toLocaleDateString("es-ES")}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
