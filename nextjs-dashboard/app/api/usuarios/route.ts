import type { NextRequest } from "next/server"
import { 
  getUsuarioWithEmpleadoById, 
  getUsuarioWithEmpleadoByEmail, 
  createUsuarioWithEntidad, 
  updateUsuarioWithEntidad, 
  deleteUsuarioById, 
  getAllRolesUsuario, 
  getAllUsuariosComplete,
  getClientesNaturalesSinUsuario,
  getClientesJuridicos,
  getMiembrosAcaucabSinUsuario,
  getEmpleados,
  getAllClientesNaturales
} from "@/db"

export async function GET(request: NextRequest) {
  try {
    console.log("=== INICIO GET /api/usuarios ===")

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("id")
    const email = searchParams.get("email")
    const role = searchParams.get("roles")
    const tipoEntidad = searchParams.get("tipoEntidad")

    if (userId) {
      console.log("Buscando usuario por ID:", userId)
      const usuarios = await getUsuarioWithEmpleadoById(userId)

      if (usuarios.length === 0) {
        return Response.json({ error: "Usuario no encontrado" }, { status: 404 })
      }

      return Response.json({
        message: "Usuario encontrado",
        user: usuarios[0],
      })
    }

    if (role) {
      console.log("Buscando usuario roles de usurio:", role)
      // @ts-ignore
      const rolesU = await getAllRolesUsuario(role)

      return Response.json({
        message: "Usuario encontrado",
        roles: rolesU,
      })
    }

    if (email) {
      console.log("Buscando usuario por email:", email)
      const usuarios = await getUsuarioWithEmpleadoByEmail(email)

      if (usuarios.length === 0) {
        return Response.json({ error: "Usuario no encontrado" }, { status: 404 })
      }

      return Response.json({
        message: "Usuario encontrado",
        user: usuarios[0],
      })
    }

    // Obtener entidades sin usuarios asignados
    if (tipoEntidad) {
      console.log("Obteniendo entidades sin usuarios:", tipoEntidad)
      let entidades
      
      switch (tipoEntidad) {
        case 'empleados':
          entidades = await getEmpleados()
          break
        case 'clientes_naturales':
          entidades = await getClientesNaturalesSinUsuario()
          break
        case 'clientes_juridicos':
        case 'all_clientes_juridicos':
          entidades = await getClientesJuridicos()
          break
        case 'miembros_acaucab':
          entidades = await getMiembrosAcaucabSinUsuario()
          break
        case 'all_clientes_naturales':
          entidades = await getAllClientesNaturales()
          break
        default:
          return Response.json({ error: "Tipo de entidad no válido" }, { status: 400 })
      }

      return Response.json({
        message: `${tipoEntidad} obtenidos exitosamente`,
        entidades: entidades,
        count: entidades.length,
      })
    }

    // Obtener todos los usuarios con información del empleado
    console.log("Obteniendo todos los usuarios con empleados...")
    const usuarios = await getAllUsuariosComplete()

    console.log("Usuarios obtenidos:", usuarios.length)

    return Response.json({
      message: "Usuarios obtenidos exitosamente",
      users: usuarios,
      count: usuarios.length,
    })
  } catch (error) {
    console.error("=== ERROR GENERAL ===")
    console.error("Error:", error)

    return Response.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : String(error),
        type: error instanceof Error ? error.constructor.name : typeof error,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== INICIO POST /api/usuarios ===")

    const { email, password, tipoEntidad, entidadId } = await request.json()
    console.log("Datos recibidos:", {
      email,
      password: password ? "[OCULTO]" : "undefined",
      tipoEntidad,
      entidadId,
    })

    if (!email || !password) {
      return Response.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    if (!tipoEntidad || !entidadId) {
      return Response.json({ error: "Debe seleccionar un tipo de entidad y la entidad correspondiente" }, { status: 400 })
    }

    // Convierte entidadId a número si corresponde
    let entidadIdFinal: any = entidadId;
    if (
      tipoEntidad === "empleado" ||
      tipoEntidad === "cliente_natural" ||
      tipoEntidad === "cliente_juridico" ||
      tipoEntidad === "miembro_acaucab"
    ) {
      entidadIdFinal = Number(entidadId);
      if (isNaN(entidadIdFinal)) {
        return Response.json({ error: "El ID de la entidad no es válido (no es un número)" }, { status: 400 });
      }
    }

    const usuarioCompleto = await createUsuarioWithEntidad(email, password, tipoEntidad, entidadIdFinal);

    return Response.json(
      {
        message: "Usuario creado exitosamente",
        user: usuarioCompleto,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error in POST:", error)

    // Manejar errores específicos de la base de datos
    if (error instanceof Error) {
      if (error.message === "El empleado seleccionado no existe") {
        return Response.json({ error: error.message }, { status: 400 })
      }
      if (error.message === "El cliente natural seleccionado no existe") {
        return Response.json({ error: error.message }, { status: 400 })
      }
      if (error.message === "El cliente jurídico seleccionado no existe") {
        return Response.json({ error: error.message }, { status: 400 })
      }
      if (error.message === "El miembro ACAUCAB seleccionado no existe") {
        return Response.json({ error: error.message }, { status: 400 })
      }
      if (error.message === "El email ya está registrado") {
        return Response.json({ error: error.message }, { status: 400 })
      }
      if (error.message.includes("ya tiene un usuario asignado")) {
        return Response.json({ error: error.message }, { status: 400 })
      }
    }

    return Response.json(
      {
        error: "Error al crear usuario",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("=== INICIO PUT /api/usuarios ===")

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("id")
    const { email, password } = await request.json()

    console.log("Datos recibidos:", {
      userId,
      email,
      password: password ? "[OCULTO]" : "undefined",
    })

    if (!userId) {
      return Response.json({ error: "ID de usuario requerido" }, { status: 400 })
    }

    const usuarioCompleto = await updateUsuarioWithEntidad(userId, email, password)

    return Response.json({
      message: "Usuario actualizado exitosamente",
      user: usuarioCompleto,
    })
  } catch (error) {
    console.error("Error in PUT:", error)

    // Manejar errores específicos de la base de datos
    if (error instanceof Error) {
      if (error.message === "Usuario no encontrado") {
        return Response.json({ error: error.message }, { status: 404 })
      }
      if (error.message.includes("seleccionado no existe")) {
        return Response.json({ error: error.message }, { status: 400 })
      }
    }

    return Response.json(
      {
        error: "Error al actualizar usuario",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("=== INICIO DELETE /api/usuarios ===")

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("id")

    console.log("ID de usuario a eliminar:", userId)

    if (!userId) {
      return Response.json({ error: "ID de usuario requerido" }, { status: 400 })
    }

    const usuarioEliminado = await deleteUsuarioById(userId)

    return Response.json({
      message: "Usuario eliminado exitosamente",
      deletedUser: usuarioEliminado,
    })
  } catch (error) {
    console.error("=== ERROR EN DELETE ===")
    console.error("Error:", error)

    // Manejar errores específicos de la base de datos
    if (error instanceof Error && error.message === "Usuario no encontrado") {
      return Response.json({ error: error.message }, { status: 404 })
    }

    return Response.json(
      {
        error: "Error al eliminar usuario",
        details: error instanceof Error ? error.message : String(error),
        type: error instanceof Error ? error.constructor.name : typeof error,
      },
      { status: 500 },
    )
  }
}
