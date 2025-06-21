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

export async function getAllRolesUsuario(id: number) {
    return await sql`SELECT * FROM obtenerRolUsuario(${id})`;
}

export async function saveRolesUsuario(userid:number,ids:string) {
    return await sql`Call insertarusuariorol(${userid},${sql.json(ids)})`;
}

export async function getClientPaymentMethods(id: number,tipo:string) {
    return await sql`select * from buscarmetodosdepagocliente(${tipo},${id});`;
}

export async function getNaturalClient(ced:number) {
    return await sql`SELECT * FROM buscarCliente('natural', ${ced}::integer)
        AS (cliente_id integer, nombre varchar, cedula integer, direccion varchar, totalpuntos integer, rif varchar, apellido varchar);`;
}

export async function getLegalClient(rif:string) {
    return await sql`SELECT * FROM buscarCliente('juridico', ${rif})
        AS (cliente_id integer, razon_social varchar, RIF varchar, direccion varchar, total_puntos integer);`;
}

export async function getUser(nombre:string,pass:string) {
    return await sql`SELECT * FROM obtenerUsuario(${nombre},${pass})`;
}

export async function saveNewCard(cliente_tipo:string,id:number,tipo:string,numero:number,fechaExp:Date|null,banco:string) {
    return await sql`call insertarnuevatarjetacliente(${cliente_tipo},${id},${tipo},${numero},${fechaExp},${banco})`;
}

export async function getUserPermissions(id:number) {
    return await sql`SELECT * FROM obtenerPermisosUsuario(${id})`;
}

export async function getAllProducts() {
    return await sql`SELECT * from obtenerCervezas()`;
}

export async function saveVenta(montoTotal:number,id:number,tipo:string,detalle:string,metodos:string) {
    return await sql`CALL insertarVentaTiendaConDetalle(${montoTotal},${id},${tipo},${sql.json(detalle)},${sql.json(metodos)})`;
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

export async function getReportUsuarios(fechaInicio?: string, fechaFin?: string): Promise<any[]> {
  try {
    console.log("=== getReportUsuarios ===")
    console.log("Parámetros:", { fechaInicio, fechaFin })

    let query
    if (fechaInicio && fechaFin) {
      query = sql`
        SELECT 
          u.usuario_id,
          u.nombre_usuario,
          u.fecha_creacion,
          e.primer_nombre,
          e.primer_apellido,
          e.cedula,
          CONCAT(e.primer_nombre, ' ', e.primer_apellido) as nombre_completo
        FROM usuario u
        LEFT JOIN empleado e ON u.fk_empleado = e.empleado_id
        WHERE u.fecha_creacion BETWEEN ${fechaInicio}::date AND ${fechaFin}::date
        ORDER BY u.fecha_creacion DESC
      `
    } else {
      query = sql`
        SELECT 
          u.usuario_id,
          u.nombre_usuario,
          u.fecha_creacion,
          e.primer_nombre,
          e.primer_apellido,
          e.cedula,
          CONCAT(e.primer_nombre, ' ', e.primer_apellido) as nombre_completo
        FROM usuario u
        LEFT JOIN empleado e ON u.fk_empleado = e.empleado_id
        ORDER BY u.fecha_creacion DESC
        LIMIT 1000
      `
    }

    const result = await query
    console.log(`Usuarios encontrados: ${result.length}`)
    return result
  } catch (error) {
    console.error("Error en getReportUsuarios:", error)
    throw error
  }
}

export async function getReportEmpleados(lugarId?: number): Promise<any[]> {
  try {
    console.log("=== getReportEmpleados ===")
    console.log("Parámetros:", { lugarId })

    let query
    if (lugarId) {
      query = sql`
        SELECT 
          e.empleado_id,
          e.cedula,
          e.primer_nombre,
          e.primer_apellido,
          e.segundo_nombre,
          e.segundo_apellido,
          e.direccion,
          e.fecha_contrato,
          l.nombre as lugar_nombre
        FROM empleado e
        LEFT JOIN lugar l ON e.fk_lugar = l.lugar_id
        WHERE e.fk_lugar = ${lugarId}
        ORDER BY e.primer_nombre, e.primer_apellido
      `
    } else {
      query = sql`
        SELECT 
          e.empleado_id,
          e.cedula,
          e.primer_nombre,
          e.primer_apellido,
          e.segundo_nombre,
          e.segundo_apellido,
          e.direccion,
          e.fecha_contrato,
          l.nombre as lugar_nombre
        FROM empleado e
        LEFT JOIN lugar l ON e.fk_lugar = l.lugar_id
        ORDER BY e.primer_nombre, e.primer_apellido
        LIMIT 1000
      `
    }

    const result = await query
    console.log(`Empleados encontrados: ${result.length}`)
    return result
  } catch (error) {
    console.error("Error en getReportEmpleados:", error)
    throw error
  }
}

export async function getReportVentas(fechaInicio?: string, fechaFin?: string): Promise<any[]> {
  try {
    console.log("=== getReportVentas ===")
    console.log("Parámetros:", { fechaInicio, fechaFin })

    let query
    if (fechaInicio && fechaFin) {
      query = sql`
        SELECT 
          v.venta_id,
          v.fecha_venta,
          v.monto_total,
          v.tipo_cliente,
          CASE 
            WHEN v.tipo_cliente = 'natural' THEN CONCAT(cn.nombre, ' ', cn.apellido)
            WHEN v.tipo_cliente = 'juridico' THEN cj.razon_social
            ELSE 'Cliente no identificado'
          END as cliente_nombre
        FROM venta v
        LEFT JOIN cliente_natural cn ON v.fk_cliente_natural = cn.cliente_natural_id
        LEFT JOIN cliente_juridico cj ON v.fk_cliente_juridico = cj.cliente_juridico_id
        WHERE v.fecha_venta BETWEEN ${fechaInicio}::date AND ${fechaFin}::date
        ORDER BY v.fecha_venta DESC
      `
    } else {
      query = sql`
        SELECT 
          v.venta_id,
          v.fecha_venta,
          v.monto_total,
          v.tipo_cliente,
          CASE 
            WHEN v.tipo_cliente = 'natural' THEN CONCAT(cn.nombre, ' ', cn.apellido)
            WHEN v.tipo_cliente = 'juridico' THEN cj.razon_social
            ELSE 'Cliente no identificado'
          END as cliente_nombre
        FROM venta v
        LEFT JOIN cliente_natural cn ON v.fk_cliente_natural = cn.cliente_natural_id
        LEFT JOIN cliente_juridico cj ON v.fk_cliente_juridico = cj.cliente_juridico_id
        ORDER BY v.fecha_venta DESC
        LIMIT 1000
      `
    }

    const result = await query
    console.log(`Ventas encontradas: ${result.length}`)
    return result
  } catch (error) {
    console.error("Error en getReportVentas:", error)
    throw error
  }
}

export async function getReportRoles(): Promise<any[]> {
  try {
    console.log("=== getReportRoles ===")

    const query = sql`
      SELECT 
        r.rol_id,
        r.nombre_rol,
        r.descripcion_rol,
        COUNT(rp.fk_permiso) as total_permisos
      FROM rol r
      LEFT JOIN rol_permiso rp ON r.rol_id = rp.fk_rol
      GROUP BY r.rol_id, r.nombre_rol, r.descripcion_rol
      ORDER BY r.nombre_rol
    `

    const result = await query
    console.log(`Roles encontrados: ${result.length}`)
    return result
  } catch (error) {
    console.error("Error en getReportRoles:", error)
    throw error
  }
}

// Función auxiliar para probar la conexión
export async function testConnection(): Promise<boolean> {
  try {
    console.log("=== Probando conexión a PostgreSQL ===")

    const result = await sql`SELECT NOW() as current_time, version() as pg_version`
    console.log("Conexión exitosa:", result[0])
    return true
  } catch (error) {
    console.error("Error de conexión:", error)
    return false
  }
}

// Función para obtener información de las tablas disponibles
export async function getAvailableTables(): Promise<any[]> {
  try {
    console.log("=== Obteniendo tablas disponibles ===")

    const query = sql`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    const result = await query
    console.log("Tablas disponibles:", result)
    return result
  } catch (error) {
    console.error("Error obteniendo tablas:", error)
    return []
  }
}


export default sql


