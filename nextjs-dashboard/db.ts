import postgres from 'postgres';





const sql = postgres({
    host: 'localhost',
    port: 5432,
    database: 'base_prueba',
    username: 'postgres',
    password: 'root',
});

/*

const sql = postgres({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    username: 'postgres',
    password: '1602',
    connection: { options: '-c search_path=schema_name' }
    // Or set it after connecting:
    // await sql`SET search_path TO schema_name`;
});
*/

export async function getAllLugares() {
    return await sql`SELECT * FROM LUGAR`;
}

export async function getAllPermisos(){
    return await sql`SELECT * FROM obtenerPermisos()`;
}

export async function saveRole(name: string, description: string) {
    return await sql`CALL guardarRol(${name}, ${description})`;
}

export async function saveRolePermissions(rol: number, descriptions: string[]) {
    return await sql`CALL insertarRolPermisos(${rol},${descriptions});`;
}

export async function updateRole(rol_id:number,name: string, description: string) {
    return await sql`CALL editarRol(${rol_id},${name},${description})`;
}

export async function deleteRole(rol_id:number) {
    return await sql`CALL eliminarRol(${rol_id})`;
}

export async function getAllRoles() {
    return await sql`SELECT * FROM obtenerRoles()`;
}

export async function getAllRolesPermisos(rol: number) {
    return await sql`SELECT * FROM obtenerRolPermisos(${rol})`;
}

export async function getNaturalClientPaymentMethods(id: number) {
    return await sql`select * from buscarClienteNaturalMetodosDePago(${id});`;
}

export async function getNaturalClient(ced:number) {
    return await sql`SELECT * FROM buscarClienteNatural(${ced})`;
}

export async function getUser(nombre:string,pass:string) {
    return await sql`SELECT * FROM obtenerUsuario(${nombre},${pass})`;
}

export async function getUserPermissions(id:number) {
    return await sql`SELECT * FROM obtenerPermisosUsuario(${id})`;
}

export async function getAllProducts() {
    return await sql`SELECT * from obtenerCervezas()`;
}

/*
///para usuarios
export async function getAllUsuarios() {
    try {
        const result = await sql`
      SELECT usuario_id::text as id, nombre_usuario as email
      FROM USUARIO
      ORDER BY usuario_id
    `
        return result
    } catch (error) {
        console.error("Error getting all usuarios:", error)
        throw error
    }
}

export async function getUsuarioById(id: string) {
    try {
        const result = await sql`
      SELECT usuario_id::text as id, nombre_usuario as email 
      FROM USUARIO 
      WHERE usuario_id = ${Number.parseInt(id)}
    `
        return result
    } catch (error) {
        console.error("Error getting usuario by id:", error)
        throw error
    }
}

export async function getUsuarioByEmail(email: string) {
    try {
        const result = await sql`
      SELECT usuario_id::text as id, nombre_usuario as email 
      FROM USUARIO 
      WHERE nombre_usuario = ${email}
    `
        return result
    } catch (error) {
        console.error("Error getting usuario by email:", error)
        throw error
    }
}

export async function createUsuario(email: string, password: string) {
    try {
        const result = await sql`
      INSERT INTO USUARIO (nombre_usuario, hash_contrasena) 
      VALUES (${email}, ${password}) 
      RETURNING usuario_id::text as id, nombre_usuario as email
    `
        return result
    } catch (error) {
        console.error("Error creating usuario:", error)
        throw error
    }
}

export async function updateUsuario(id: string, email: string, password?: string) {
    try {
        let result
        if (password) {
            result = await sql`
        UPDATE USUARIO 
        SET nombre_usuario = ${email}, hash_contrasena = ${password}
        WHERE usuario_id = ${Number.parseInt(id)}
        RETURNING usuario_id::text as id, nombre_usuario as email
      `
        } else {
            result = await sql`
        UPDATE USUARIO 
        SET nombre_usuario = ${email}
        WHERE usuario_id = ${Number.parseInt(id)}
        RETURNING usuario_id::text as id, nombre_usuario as email
      `
        }
        return result
    } catch (error) {
        console.error("Error updating usuario:", error)
        throw error
    }
}

export async function deleteUsuario(id: string) {
    try {
        const result = await sql`
      DELETE FROM USUARIO 
      WHERE usuario_id = ${Number.parseInt(id)} 
      RETURNING usuario_id::text as id, nombre_usuario as email
    `
        return result
    } catch (error) {
        console.error("Error deleting usuario:", error)
        throw error
    }
}
 */

export async function getEmpleados(){
    return await sql`
      SELECT 
        empleado_id::text as id,
        cedula,
        primer_nombre,
        primer_apellido,
        segundo_nombre,
        segundo_apellido,
        direccion,
        fecha_contrato,
        fk_lugar,
        CONCAT(primer_nombre, ' ', primer_apellido) as nombre_completo,
        CONCAT(primer_nombre, ' ', COALESCE(segundo_nombre, ''), ' ', primer_apellido, ' ', COALESCE(segundo_apellido, '')) as nombre_completo_full
      FROM empleado
      ORDER BY primer_nombre, primer_apellido
    `
}

// Funciones para encontrar tablas dinámicamente
export async function findUsuarioTable() {
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

export async function findEmpleadoTable() {
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

// Funciones para operaciones CRUD de usuarios con empleados
export async function getAllUsuariosWithEmpleados() {
  try {
    const { schemaTable: usuarioTable } = await findUsuarioTable()
    const { schemaTable: empleadoTable } = await findEmpleadoTable()

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

    return usuarios
  } catch (error) {
    console.error("Error getting all usuarios with empleados:", error)
    throw error
  }
}

export async function getUsuarioWithEmpleadoById(id: string) {
  try {
    const { schemaTable: usuarioTable } = await findUsuarioTable()
    const { schemaTable: empleadoTable } = await findEmpleadoTable()

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
            WHERE u.usuario_id = ${Number.parseInt(id)}
        `

    return usuarios
  } catch (error) {
    console.error("Error getting usuario with empleado by id:", error)
    throw error
  }
}

export async function getUsuarioWithEmpleadoByEmail(email: string) {
  try {
    const { schemaTable: usuarioTable } = await findUsuarioTable()
    const { schemaTable: empleadoTable } = await findEmpleadoTable()

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

    return usuarios
  } catch (error) {
    console.error("Error getting usuario with empleado by email:", error)
    throw error
  }
}

export async function createUsuarioWithEmpleado(email: string, password: string, empleadoId: string) {
  try {
    const { schemaTable: usuarioTable } = await findUsuarioTable()
    const { schemaTable: empleadoTable } = await findEmpleadoTable()

    // Verificar que el empleado existe
    const empleadoExiste = await sql`
            SELECT empleado_id FROM ${sql(empleadoTable)} 
            WHERE empleado_id = ${Number.parseInt(empleadoId)}
        `

    if (empleadoExiste.length === 0) {
      throw new Error("El empleado seleccionado no existe")
    }

    // Verificar si el email ya existe
    const usuariosExistentes = await sql`
            SELECT usuario_id FROM ${sql(usuarioTable)} WHERE nombre_usuario = ${email}
        `

    if (usuariosExistentes.length > 0) {
      throw new Error("El email ya está registrado")
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

    return usuarioCompleto[0]
  } catch (error) {
    console.error("Error creating usuario with empleado:", error)
    throw error
  }
}

export async function updateUsuarioWithEmpleado(id: string, email: string, password?: string, empleadoId?: string) {
  try {
    const { schemaTable: usuarioTable } = await findUsuarioTable()
    const { schemaTable: empleadoTable } = await findEmpleadoTable()

    // Verificar si el usuario existe
    const usuariosExistentes = await sql`
            SELECT usuario_id, nombre_usuario 
            FROM ${sql(usuarioTable)}
            WHERE usuario_id = ${Number.parseInt(id)}
        `

    if (usuariosExistentes.length === 0) {
      throw new Error("Usuario no encontrado")
    }

    // Si se proporciona empleadoId, verificar que existe
    if (empleadoId) {
      const empleadoExiste = await sql`
                SELECT empleado_id FROM ${sql(empleadoTable)} 
                WHERE empleado_id = ${Number.parseInt(empleadoId)}
            `

      if (empleadoExiste.length === 0) {
        throw new Error("El empleado seleccionado no existe")
      }
    }

    // Actualizar usuario
    let usuarioActualizado
    if (password && empleadoId) {
      usuarioActualizado = await sql`
                UPDATE ${sql(usuarioTable)}
                SET nombre_usuario = ${email}, hash_contrasena = ${password}, fk_empleado = ${Number.parseInt(empleadoId)}
                WHERE usuario_id = ${Number.parseInt(id)}
                RETURNING usuario_id::text as id, nombre_usuario as email, fecha_creacion, fk_empleado::text as empleado_id
            `
    } else if (password) {
      usuarioActualizado = await sql`
                UPDATE ${sql(usuarioTable)}
                SET nombre_usuario = ${email}, hash_contrasena = ${password}
                WHERE usuario_id = ${Number.parseInt(id)}
                RETURNING usuario_id::text as id, nombre_usuario as email, fecha_creacion, fk_empleado::text as empleado_id
            `
    } else if (empleadoId) {
      usuarioActualizado = await sql`
                UPDATE ${sql(usuarioTable)}
                SET nombre_usuario = ${email}, fk_empleado = ${Number.parseInt(empleadoId)}
                WHERE usuario_id = ${Number.parseInt(id)}
                RETURNING usuario_id::text as id, nombre_usuario as email, fecha_creacion, fk_empleado::text as empleado_id
            `
    } else {
      usuarioActualizado = await sql`
                UPDATE ${sql(usuarioTable)}
                SET nombre_usuario = ${email}
                WHERE usuario_id = ${Number.parseInt(id)}
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
            WHERE u.usuario_id = ${Number.parseInt(id)}
        `

    return usuarioCompleto[0]
  } catch (error) {
    console.error("Error updating usuario with empleado:", error)
    throw error
  }
}

export async function deleteUsuarioById(id: string) {
  try {
    const { schemaTable } = await findUsuarioTable()

    // Verificar si el usuario existe
    const usuariosExistentes = await sql`
            SELECT usuario_id, nombre_usuario 
            FROM ${sql(schemaTable)}
            WHERE usuario_id = ${Number.parseInt(id)}
        `

    if (usuariosExistentes.length === 0) {
      throw new Error("Usuario no encontrado")
    }

    // Eliminar usuario
    const usuarioEliminado = await sql`
            DELETE FROM ${sql(schemaTable)}
            WHERE usuario_id = ${Number.parseInt(id)} 
            RETURNING usuario_id::text as id, nombre_usuario as email
        `

    return usuarioEliminado[0]
  } catch (error) {
    console.error("Error deleting usuario:", error)
    throw error
  }
}

export default sql


