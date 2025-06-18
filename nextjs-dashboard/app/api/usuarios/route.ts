import type { NextRequest } from "next/server"

async function findUsuarioTable(sql: any) {
  const tablesFound = await sql`
    SELECT schemaname, tablename 
    FROM pg_tables 
    WHERE tablename ILIKE 'usuario'
    ORDER BY schemaname
  `

  if (tablesFound.length === 0) {
    throw new Error("Tabla 'usuario' no encontrada")
  }

  const tableSchema = tablesFound[0].schemaname
  const tableName = tablesFound[0].tablename
  const schemaTable = tableSchema === "public" ? tableName : `${tableSchema}.${tableName}`

  return { tableSchema, tableName, schemaTable }
}

async function findEmpleadoTable(sql: any) {
  const tablesFound = await sql`
    SELECT schemaname, tablename 
    FROM pg_tables 
    WHERE tablename ILIKE 'empleado'
    ORDER BY schemaname
  `

  if (tablesFound.length === 0) {
    throw new Error("Tabla 'empleado' no encontrada")
  }

  const tableSchema = tablesFound[0].schemaname
  const tableName = tablesFound[0].tablename
  const schemaTable = tableSchema === "public" ? tableName : `${tableSchema}.${tableName}`

  return { tableSchema, tableName, schemaTable }
}

export async function GET(request: NextRequest) {
  let sql: any = null

  try {
    console.log("=== INICIO GET /api/usuarios ===")

    const postgres = (await import("postgres")).default
    sql = postgres({
      host: "localhost",
      port: 5432,
      database: "postgres",
      username: "postgres",
      password: "1602",
      max: 5,
      idle_timeout: 10,
      connect_timeout: 5,
    })

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("id")
    const email = searchParams.get("email")

    // Encontrar las tablas
    const { schemaTable: usuarioTable } = await findUsuarioTable(sql)
    const { schemaTable: empleadoTable } = await findEmpleadoTable(sql)

    console.log("Usando tablas:", { usuarioTable, empleadoTable })

    if (userId) {
      console.log("Buscando usuario por ID:", userId)
      const usuarios = await sql`
        SELECT 
          u.usuario_id::text as id, 
          u.nombre_usuario as email, 
          u.fecha_creacion,
          u.fk_empleado::text as empleado_id,
          e.primer_nombre,
          e.primer_apellido,
          e.cedula,
          CONCAT(e.primer_nombre, ' ', e.primer_apellido) as empleado_nombre
        FROM ${sql(usuarioTable)} u
        LEFT JOIN ${sql(empleadoTable)} e ON u.fk_empleado = e.empleado_id
        WHERE u.usuario_id = ${Number.parseInt(userId)}
      `

      if (usuarios.length === 0) {
        return Response.json({ error: "Usuario no encontrado" }, { status: 404 })
      }

      return Response.json({
        message: "Usuario encontrado",
        user: usuarios[0],
      })
    }

    if (email) {
      console.log("Buscando usuario por email:", email)
      const usuarios = await sql`
        SELECT 
          u.usuario_id::text as id, 
          u.nombre_usuario as email, 
          u.fecha_creacion,
          u.fk_empleado::text as empleado_id,
          e.primer_nombre,
          e.primer_apellido,
          e.cedula,
          CONCAT(e.primer_nombre, ' ', e.primer_apellido) as empleado_nombre
        FROM ${sql(usuarioTable)} u
        LEFT JOIN ${sql(empleadoTable)} e ON u.fk_empleado = e.empleado_id
        WHERE u.nombre_usuario = ${email}
      `

      if (usuarios.length === 0) {
        return Response.json({ error: "Usuario no encontrado" }, { status: 404 })
      }

      return Response.json({
        message: "Usuario encontrado",
        user: usuarios[0],
      })
    }

    // Obtener todos los usuarios con información del empleado
    console.log("Obteniendo todos los usuarios con empleados...")
    const usuarios = await sql`
      SELECT 
        u.usuario_id::text as id, 
        u.nombre_usuario as email, 
        u.fecha_creacion,
        u.fk_empleado::text as empleado_id,
        u.fk_cliente_natural, 
        u.fk_cliente_juridico, 
        u.fk_miembro_acaucab,
        e.primer_nombre,
        e.primer_apellido,
        e.cedula,
        CONCAT(e.primer_nombre, ' ', e.primer_apellido) as empleado_nombre
      FROM ${sql(usuarioTable)} u
      LEFT JOIN ${sql(empleadoTable)} e ON u.fk_empleado = e.empleado_id
      ORDER BY u.usuario_id
    `

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
  } finally {
    if (sql) {
      try {
        await sql.end()
      } catch (closeError) {
        console.error("Error cerrando conexión:", closeError)
      }
    }
  }
}

export async function POST(request: NextRequest) {
  let sql: any = null

  try {
    console.log("=== INICIO POST /api/usuarios ===")

    const { email, password, empleadoId } = await request.json()
    console.log("Datos recibidos:", {
      email,
      password: password ? "[OCULTO]" : "undefined",
      empleadoId,
    })

    if (!email || !password) {
      return Response.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    if (!empleadoId) {
      return Response.json({ error: "Debe seleccionar un empleado" }, { status: 400 })
    }

    const postgres = (await import("postgres")).default
    sql = postgres({
      host: "localhost",
      port: 5432,
      database: "postgres",
      username: "postgres",
      password: "1602",
      max: 5,
      idle_timeout: 10,
      connect_timeout: 5,
    })

    // Encontrar las tablas
    const { schemaTable: usuarioTable } = await findUsuarioTable(sql)
    const { schemaTable: empleadoTable } = await findEmpleadoTable(sql)

    // Verificar que el empleado existe
    const empleadoExiste = await sql`
      SELECT empleado_id FROM ${sql(empleadoTable)} 
      WHERE empleado_id = ${Number.parseInt(empleadoId)}
    `

    if (empleadoExiste.length === 0) {
      return Response.json({ error: "El empleado seleccionado no existe" }, { status: 400 })
    }

    // Verificar si el email ya existe
    const usuariosExistentes = await sql`
      SELECT usuario_id FROM ${sql(usuarioTable)} WHERE nombre_usuario = ${email}
    `

    if (usuariosExistentes.length > 0) {
      return Response.json({ error: "El email ya está registrado" }, { status: 400 })
    }

    // Crear nuevo usuario con empleado
    const nuevoUsuario = await sql`
      INSERT INTO ${sql(usuarioTable)} (nombre_usuario, hash_contrasena, fecha_creacion, fk_empleado) 
      VALUES (${email}, ${password}, CURRENT_DATE, ${Number.parseInt(empleadoId)}) 
      RETURNING usuario_id::text as id, nombre_usuario as email, fecha_creacion, fk_empleado::text as empleado_id
    `

    // Obtener información completa del usuario creado con empleado
    const usuarioCompleto = await sql`
      SELECT 
        u.usuario_id::text as id, 
        u.nombre_usuario as email, 
        u.fecha_creacion,
        u.fk_empleado::text as empleado_id,
        e.primer_nombre,
        e.primer_apellido,
        CONCAT(e.primer_nombre, ' ', e.primer_apellido) as empleado_nombre
      FROM ${sql(usuarioTable)} u
      LEFT JOIN ${sql(empleadoTable)} e ON u.fk_empleado = e.empleado_id
      WHERE u.usuario_id = ${nuevoUsuario[0].id}
    `

    return Response.json(
      {
        message: "Usuario creado exitosamente",
        user: usuarioCompleto[0],
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error in POST:", error)
    return Response.json(
      {
        error: "Error al crear usuario",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  } finally {
    if (sql) {
      try {
        await sql.end()
      } catch (closeError) {
        console.error("Error cerrando conexión:", closeError)
      }
    }
  }
}

export async function PUT(request: NextRequest) {
  let sql: any = null

  try {
    console.log("=== INICIO PUT /api/usuarios ===")

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("id")
    const { email, password, empleadoId } = await request.json()

    console.log("Datos recibidos:", {
      userId,
      email,
      password: password ? "[OCULTO]" : "undefined",
      empleadoId,
    })

    if (!userId) {
      return Response.json({ error: "ID de usuario requerido" }, { status: 400 })
    }

    const postgres = (await import("postgres")).default
    sql = postgres({
      host: "localhost",
      port: 5432,
      database: "postgres",
      username: "postgres",
      password: "1602",
      max: 5,
      idle_timeout: 10,
      connect_timeout: 5,
    })

    // Encontrar las tablas
    const { schemaTable: usuarioTable } = await findUsuarioTable(sql)
    const { schemaTable: empleadoTable } = await findEmpleadoTable(sql)

    // Verificar si el usuario existe
    const usuariosExistentes = await sql`
      SELECT usuario_id, nombre_usuario 
      FROM ${sql(usuarioTable)}
      WHERE usuario_id = ${Number.parseInt(userId)}
    `

    if (usuariosExistentes.length === 0) {
      return Response.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Si se proporciona empleadoId, verificar que existe
    if (empleadoId) {
      const empleadoExiste = await sql`
        SELECT empleado_id FROM ${sql(empleadoTable)} 
        WHERE empleado_id = ${Number.parseInt(empleadoId)}
      `

      if (empleadoExiste.length === 0) {
        return Response.json({ error: "El empleado seleccionado no existe" }, { status: 400 })
      }
    }

    // Actualizar usuario
    let usuarioActualizado
    if (password && empleadoId) {
      usuarioActualizado = await sql`
        UPDATE ${sql(usuarioTable)}
        SET nombre_usuario = ${email}, hash_contrasena = ${password}, fk_empleado = ${Number.parseInt(empleadoId)}
        WHERE usuario_id = ${Number.parseInt(userId)}
        RETURNING usuario_id::text as id, nombre_usuario as email, fecha_creacion, fk_empleado::text as empleado_id
      `
    } else if (password) {
      usuarioActualizado = await sql`
        UPDATE ${sql(usuarioTable)}
        SET nombre_usuario = ${email}, hash_contrasena = ${password}
        WHERE usuario_id = ${Number.parseInt(userId)}
        RETURNING usuario_id::text as id, nombre_usuario as email, fecha_creacion, fk_empleado::text as empleado_id
      `
    } else if (empleadoId) {
      usuarioActualizado = await sql`
        UPDATE ${sql(usuarioTable)}
        SET nombre_usuario = ${email}, fk_empleado = ${Number.parseInt(empleadoId)}
        WHERE usuario_id = ${Number.parseInt(userId)}
        RETURNING usuario_id::text as id, nombre_usuario as email, fecha_creacion, fk_empleado::text as empleado_id
      `
    } else {
      usuarioActualizado = await sql`
        UPDATE ${sql(usuarioTable)}
        SET nombre_usuario = ${email}
        WHERE usuario_id = ${Number.parseInt(userId)}
        RETURNING usuario_id::text as id, nombre_usuario as email, fecha_creacion, fk_empleado::text as empleado_id
      `
    }

    // Obtener información completa del usuario actualizado
    const usuarioCompleto = await sql`
      SELECT 
        u.usuario_id::text as id, 
        u.nombre_usuario as email, 
        u.fecha_creacion,
        u.fk_empleado::text as empleado_id,
        e.primer_nombre,
        e.primer_apellido,
        CONCAT(e.primer_nombre, ' ', e.primer_apellido) as empleado_nombre
      FROM ${sql(usuarioTable)} u
      LEFT JOIN ${sql(empleadoTable)} e ON u.fk_empleado = e.empleado_id
      WHERE u.usuario_id = ${Number.parseInt(userId)}
    `

    return Response.json({
      message: "Usuario actualizado exitosamente",
      user: usuarioCompleto[0],
    })
  } catch (error) {
    console.error("Error in PUT:", error)
    return Response.json(
      {
        error: "Error al actualizar usuario",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  } finally {
    if (sql) {
      try {
        await sql.end()
      } catch (closeError) {
        console.error("Error cerrando conexión:", closeError)
      }
    }
  }
}

export async function DELETE(request: NextRequest) {
  let sql: any = null

  try {
    console.log("=== INICIO DELETE /api/usuarios ===")

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("id")

    console.log("ID de usuario a eliminar:", userId)

    if (!userId) {
      return Response.json({ error: "ID de usuario requerido" }, { status: 400 })
    }

    const postgres = (await import("postgres")).default
    sql = postgres({
      host: "localhost",
      port: 5432,
      database: "postgres",
      username: "postgres",
      password: "1602",
      max: 5,
      idle_timeout: 10,
      connect_timeout: 5,
    })

    // Encontrar la tabla usuario
    const { schemaTable } = await findUsuarioTable(sql)
    console.log("Usando tabla:", schemaTable)

    // Verificar si el usuario existe
    console.log("Verificando si el usuario existe...")
    const usuariosExistentes = await sql`
      SELECT usuario_id, nombre_usuario 
      FROM ${sql(schemaTable)}
      WHERE usuario_id = ${Number.parseInt(userId)}
    `

    console.log("Usuarios encontrados:", usuariosExistentes.length)

    if (usuariosExistentes.length === 0) {
      return Response.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    console.log("Usuario a eliminar:", usuariosExistentes[0])

    // Eliminar usuario
    console.log("Eliminando usuario...")
    const usuarioEliminado = await sql`
      DELETE FROM ${sql(schemaTable)}
      WHERE usuario_id = ${Number.parseInt(userId)} 
      RETURNING usuario_id::text as id, nombre_usuario as email
    `

    console.log("Usuario eliminado:", usuarioEliminado)

    return Response.json({
      message: "Usuario eliminado exitosamente",
      deletedUser: usuarioEliminado[0],
    })
  } catch (error) {
    console.error("=== ERROR EN DELETE ===")
    console.error("Error:", error)
    console.error("Stack:", error instanceof Error ? error.stack : "No stack")

    return Response.json(
      {
        error: "Error al eliminar usuario",
        details: error instanceof Error ? error.message : String(error),
        type: error instanceof Error ? error.constructor.name : typeof error,
      },
      { status: 500 },
    )
  } finally {
    if (sql) {
      try {
        await sql.end()
      } catch (closeError) {
        console.error("Error cerrando conexión:", closeError)
      }
    }
  }
}
