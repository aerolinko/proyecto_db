"use server"

import { NextResponse } from "next/server"

// Simulamos funciones de base de datos - reemplaza con tus funciones reales
async function getAllUsuarios() {
  // Esta función debería obtener todos los usuarios de tu base de datos
  // Ejemplo de datos que debería retornar:
  return [
    {
      usuario_id: 1,
      nombre: "Juan Pérez",
      email: "juan@example.com",
      rol_id: 1,
      rol_nombre: "Administrador",
      activo: true,
      fecha_creacion: "2024-01-15T10:30:00Z",
    },
    {
      usuario_id: 2,
      nombre: "María García",
      email: "maria@example.com",
      rol_id: 2,
      rol_nombre: "Usuario",
      activo: true,
      fecha_creacion: "2024-02-20T14:15:00Z",
    },
    {
      usuario_id: 3,
      nombre: "Carlos López",
      email: "carlos@example.com",
      rol_id: null,
      rol_nombre: null,
      activo: false,
      fecha_creacion: "2024-03-10T09:45:00Z",
    },
  ]
}

async function createUsuario(nombre: string, email: string, rol_id?: number) {
  // Crear usuario en la base de datos
  console.log("Creating user:", { nombre, email, rol_id })
  return {
    usuario_id: Date.now(), // En producción, esto sería generado por la DB
    nombre,
    email,
    rol_id,
    activo: true,
    fecha_creacion: new Date().toISOString(),
  }
}

async function updateUsuario(usuario_id: number, data: any) {
  // Actualizar usuario en la base de datos
  console.log("Updating user:", usuario_id, data)
  return {
    usuario_id,
    ...data,
    fecha_actualizacion: new Date().toISOString(),
  }
}

async function deleteUsuario(usuario_id: number) {
  // Eliminar usuario de la base de datos
  console.log("Deleting user:", usuario_id)
  return { success: true }
}

async function bulkUpdateUsuarios(userIds: number[], action: string) {
  // Actualización masiva de usuarios
  console.log("Bulk update:", userIds, action)
  return { success: true, affected: userIds.length }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const params = url.searchParams
    const userId = params.get("id")

    if (userId) {
      // Obtener usuario específico
      const usuarios = await getAllUsuarios()
      const usuario = usuarios.find((u) => u.usuario_id === Number.parseInt(userId))

      if (!usuario) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
      }

      return NextResponse.json({ result: usuario, status: 200 })
    } else {
      // Obtener todos los usuarios
      const result = await getAllUsuarios()

      if (!result || result.length === 0) {
        return NextResponse.json({ result: [], status: 200 })
      }

      return NextResponse.json({ result, status: 200 })
    }
  } catch (error) {
    console.error("Error in GET /api/usuarios:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { nombre, email, rol_id } = await request.json()

    // Validaciones básicas
    if (!nombre || !email) {
      return NextResponse.json({ error: "Nombre y email son requeridos" }, { status: 400 })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Formato de email inválido" }, { status: 400 })
    }

    const result = await createUsuario(nombre, email, rol_id)

    if (result) {
      return NextResponse.json({ result, status: 201 })
    }

    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 })
  } catch (error) {
    console.error("Error in POST /api/usuarios:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { usuario_id, ...updateData } = data

    if (!usuario_id) {
      return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 })
    }

    // Validar email si se está actualizando
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(updateData.email)) {
        return NextResponse.json({ error: "Formato de email inválido" }, { status: 400 })
      }
    }

    const result = await updateUsuario(usuario_id, updateData)

    if (result) {
      return NextResponse.json({ result, status: 200 })
    }

    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 })
  } catch (error) {
    console.error("Error in PUT /api/usuarios:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("id")

    if (!userId) {
      return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 })
    }

    const result = await deleteUsuario(Number.parseInt(userId))

    if (result.success) {
      return NextResponse.json({ message: "Usuario eliminado correctamente", status: 200 })
    }

    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 })
  } catch (error) {
    console.error("Error in DELETE /api/usuarios:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { action, userIds } = await request.json()

    if (!action || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: "Acción y IDs de usuarios requeridos" }, { status: 400 })
    }

    const result = await bulkUpdateUsuarios(userIds, action)

    if (result.success) {
      return NextResponse.json({
        message: `Acción '${action}' aplicada a ${result.affected} usuarios`,
        status: 200,
      })
    }

    return NextResponse.json({ error: "Error en actualización masiva" }, { status: 500 })
  } catch (error) {
    console.error("Error in PATCH /api/usuarios:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
