import postgres from 'postgres';




/*
const sql = postgres({
    host: 'localhost',
    port: 5432,
    database: 'base_prueba',
    username: 'postgres',
    password: 'root',
});

*/

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
    return await sql`SELECT * FROM buscarCliente('natural', ${ced})
        AS (cliente_id integer, nombre varchar, cedula integer, direccion varchar, totalpuntos integer, rif varchar, apellido varchar);`;
}

export async function getLegalClient(rif:string) {
    return await sql`SELECT * FROM buscarCliente('juridico', ${rif}::varchar)
        AS (cliente_id integer, razon_social varchar, RIF varchar, direccion varchar, totalpuntos integer);`;
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

export async function getOrdenesAlmacen() {
  return await sql`SELECT * from obtenerordenesalmacen()`;
}

export async function updateOrdenesAlmacen(id:number,cambio:string) {
  return await sql`call cambiarEstadoCompraRep(${cambio},${id})`;
}

export async function getOrdenesAnaquel() {
  return await sql`SELECT * from obtenerordenesanaquel()`;
}

export async function updateOrdenesAnaquel(id:number,cambio:string) {
  return await sql`call cambiarEstadoRepAnaquel(${cambio},${id})`;
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

// ===== NUEVAS FUNCIONES DE REPORTES ESPECÍFICOS =====

// 1. Productos con Mayor Demanda en Tienda Online
export async function getReportProductosMayorDemanda(fechaInicio?: string, fechaFin?: string): Promise<any[]> {
  try {
    console.log("=== getReportProductosMayorDemanda ===")
    console.log("Parámetros:", { fechaInicio, fechaFin })

    let query
    if (fechaInicio && fechaFin) {
      query = sql`
        SELECT 
          c.cerveza_id as producto_id,
          c.nombre as producto_nombre,
          ROUND(AVG(dvo.precio_unitario), 2) as precio_promedio,
          COALESCE(SUM(ac.cantidad), 0) + COALESCE(SUM(almc.cantidad), 0) as stock_actual,
          COUNT(DISTINCT vo.venta_online_id) as total_ventas,
          SUM(dvo.cantidad) as unidades_vendidas,
          SUM(dvo.cantidad * dvo.precio_unitario) as ingresos_totales
        FROM cerveza c
        JOIN cerveza_presentacion cp ON c.cerveza_id = cp.fk_cerveza
        LEFT JOIN anaquel_cerveza ac ON cp.cerveza_presentacion_id = ac.fk_cerveza_presentacion
        LEFT JOIN almacen_cerveza almc ON cp.cerveza_presentacion_id = almc.fk_cerveza_presentacion
        JOIN detalle_venta_online dvo ON almc.almacen_cerveza_id = dvo.fk_almacen_cerveza
        JOIN venta_online vo ON dvo.fk_venta_online = vo.venta_online_id
        JOIN estado_venta_online evo ON vo.venta_online_id = evo.fk_venta_online
        WHERE vo.fecha_emision BETWEEN ${fechaInicio} AND ${fechaFin}
        AND evo.fk_estado = 3  -- SOLO VENTAS COMPLETADAS
        AND evo.fecha_fin IS NULL  -- Estado actual
        GROUP BY c.cerveza_id, c.nombre
        ORDER BY unidades_vendidas DESC, ingresos_totales DESC
        LIMIT 50;
      `
    } else {
      query = sql`
        SELECT 
          c.cerveza_id as producto_id,
          c.nombre as producto_nombre,
          ROUND(AVG(dvo.precio_unitario), 2) as precio_promedio,
          COALESCE(SUM(ac.cantidad), 0) + COALESCE(SUM(almc.cantidad), 0) as stock_actual,
          COUNT(DISTINCT vo.venta_online_id) as total_ventas,
          SUM(dvo.cantidad) as unidades_vendidas,
          SUM(dvo.cantidad * dvo.precio_unitario) as ingresos_totales
        FROM cerveza c
        JOIN cerveza_presentacion cp ON c.cerveza_id = cp.fk_cerveza
        LEFT JOIN anaquel_cerveza ac ON cp.cerveza_presentacion_id = ac.fk_cerveza_presentacion
        LEFT JOIN almacen_cerveza almc ON cp.cerveza_presentacion_id = almc.fk_cerveza_presentacion
        JOIN detalle_venta_online dvo ON almc.almacen_cerveza_id = dvo.fk_almacen_cerveza
        JOIN venta_online vo ON dvo.fk_venta_online = vo.venta_online_id
        JOIN estado_venta_online evo ON vo.venta_online_id = evo.fk_venta_online
        WHERE evo.fk_estado = 3  -- SOLO VENTAS COMPLETADAS
        AND evo.fecha_fin IS NULL  -- Estado actual
        GROUP BY c.cerveza_id, c.nombre
        ORDER BY unidades_vendidas DESC, ingresos_totales DESC
        LIMIT 50;
      `
    }

    const result = await query
    console.log(`Productos con mayor demanda encontrados: ${result.length}`)
    return result
  } catch (error) {
    console.error("Error en getReportProductosMayorDemanda:", error)
    throw error
  }
}

// 2. Reposición de Anaqueles Generadas
export async function getReportReposicionAnaqueles(fechaInicio?: string, fechaFin?: string): Promise<any[]> {
  try {
    console.log("=== getReportReposicionAnaqueles ===")
    console.log("Parámetros:", { fechaInicio, fechaFin })

    let query
    if (fechaInicio && fechaFin) {
      query = sql`SELECT * FROM get_report_reposicion_anaqueles(${fechaInicio}, ${fechaFin})`
    } else {
      query = sql`SELECT * FROM get_report_reposicion_anaqueles(NULL, NULL)`
    }

    const result = await query
    console.log(`Reposiciones de anaqueles encontradas: ${result.length}`)
    return result
  } catch (error) {
    console.error("Error en getReportReposicionAnaqueles:", error)
    throw error
  }
}

// 3. Cuotas de Afiliación Pendientes de Pago
export async function getCuotasAfiliacionPendientes() {
  try {
    console.log("=== getCuotasAfiliacionPendientes ===")

    const query = sql`
      SELECT 
        ma.miembro_id,
        ma.razon_social,
        u.fecha_creacion as fecha_afiliacion,
        mem.monto as cuota_mensual,
        mem.fecha_vencimiento,
        CASE 
          WHEN mem.fecha_vencimiento >= CURRENT_DATE THEN 'ACTIVO'
          ELSE 'VENCIDO'
        END as estado_afiliacion,
        MAX(p.fecha) as ultimo_pago_fecha,
        MAX(p.monto) as ultimo_pago_monto,
        GREATEST(0, EXTRACT(MONTH FROM AGE(CURRENT_DATE, COALESCE(MAX(p.fecha), u.fecha_creacion)))) as meses_pendientes,
        mem.monto * GREATEST(0, EXTRACT(MONTH FROM AGE(CURRENT_DATE, COALESCE(MAX(p.fecha), u.fecha_creacion)))) as monto_pendiente,
        CONCAT(pc.primer_nombre, ' ', pc.primer_apellido) as contacto_nombre,
        CONCAT(t.codigo, '-', t.numero) as contacto_telefono,
        CONCAT(ce.usuario, ce.dominio) as contacto_email,
        ma.rif,
        ma.direccion
      FROM miembro_acaucab ma
      LEFT JOIN usuario u ON ma.miembro_id = u.fk_miembro_acaucab
      LEFT JOIN membresia mem ON u.usuario_id = mem.fk_usuario
      LEFT JOIN pago p ON mem.membresia_id = p.fk_membresia
      LEFT JOIN personal_contacto pc ON ma.miembro_id = pc.fk_miembro_acaucab
      LEFT JOIN telefono t ON ma.miembro_id = t.fk_miembro_acaucab
      LEFT JOIN correo_electronico ce ON ma.miembro_id = ce.fk_miembro_acaucab
      WHERE ma.miembro_id IS NOT NULL
      GROUP BY 
        ma.miembro_id, ma.razon_social, ma.rif, ma.direccion, 
        u.fecha_creacion, mem.fecha_vencimiento, mem.monto, pc.primer_nombre, pc.primer_apellido,
        t.codigo, t.numero, ce.usuario, ce.dominio
      HAVING GREATEST(0, EXTRACT(MONTH FROM AGE(CURRENT_DATE, COALESCE(MAX(p.fecha), u.fecha_creacion)))) >= 1
      ORDER BY meses_pendientes DESC, monto_pendiente DESC
    `

    const result = await query
    console.log(`Miembros ACAUCAB con cuotas vencidas: ${result.length}`)
    return result
  } catch (error) {
    console.error("Error en getCuotasAfiliacionPendientes:", error)
    throw error
  }
}

// ===== FUNCIÓN QUE USA STORED PROCEDURE =====
export async function getCuotasAfiliacionPendientesSP() {
  try {
    console.log("=== getCuotasAfiliacionPendientesSP ===")

    const query = sql`SELECT * FROM get_cuotas_afiliacion_pendientes(NULL, NULL, 1000)`
    const result = await query

    console.log(`Miembros ACAUCAB encontrados: ${result.length}`)
    return result
  } catch (error) {
    console.error("Error en getCuotasAfiliacionPendientesSP:", error)
    throw error
  }
}

// ===== FUNCIÓN PARA PRODUCTOS MÁS VENDIDOS =====
export async function getProductosMasVendidos(fechaInicio?: string, fechaFin?: string, limite: number = 10) {
  try {
    console.log("=== getProductosMasVendidos ===")
    console.log("Parámetros:", { fechaInicio, fechaFin, limite })

    let query
    if (fechaInicio && fechaFin) {
      query = sql`
        SELECT 
          c.cerveza_id as producto_id,
          c.nombre as nombre_producto,
          p.cap_volumen as presentacion_ml,
          p.material as tipo_presentacion,
          COUNT(DISTINCT vo.venta_online_id) as total_ventas,
          SUM(dvo.cantidad) as unidades_vendidas,
          ROUND(AVG(dvo.precio_unitario), 2) as precio_promedio,
          SUM(dvo.cantidad * dvo.precio_unitario) as ingresos_totales,
          ROUND(SUM(dvo.cantidad * dvo.precio_unitario) / SUM(dvo.cantidad), 2) as precio_promedio_ponderado,
          COUNT(DISTINCT vo.fk_usuario) as clientes_unicos,
          MIN(vo.fecha_emision) as primera_venta,
          MAX(vo.fecha_emision) as ultima_venta
        FROM cerveza c
        JOIN cerveza_presentacion cp ON c.cerveza_id = cp.fk_cerveza
        JOIN presentacion p ON cp.fk_presentacion = p.presentacion_id
        JOIN almacen_cerveza ac ON cp.cerveza_presentacion_id = ac.fk_cerveza_presentacion
        JOIN detalle_venta_online dvo ON ac.almacen_cerveza_id = dvo.fk_almacen_cerveza
        JOIN venta_online vo ON dvo.fk_venta_online = vo.venta_online_id
        WHERE vo.fecha_emision BETWEEN ${fechaInicio}::date AND ${fechaFin}::date
        GROUP BY c.cerveza_id, c.nombre, p.cap_volumen, p.material
        ORDER BY unidades_vendidas DESC, ingresos_totales DESC
        LIMIT ${limite}
      `
    } else {
      query = sql`
        SELECT 
          c.cerveza_id as producto_id,
          c.nombre as nombre_producto,
          p.cap_volumen as presentacion_ml,
          p.material as tipo_presentacion,
          COUNT(DISTINCT vo.venta_online_id) as total_ventas,
          SUM(dvo.cantidad) as unidades_vendidas,
          ROUND(AVG(dvo.precio_unitario), 2) as precio_promedio,
          SUM(dvo.cantidad * dvo.precio_unitario) as ingresos_totales,
          ROUND(SUM(dvo.cantidad * dvo.precio_unitario) / SUM(dvo.cantidad), 2) as precio_promedio_ponderado,
          COUNT(DISTINCT vo.fk_usuario) as clientes_unicos,
          MIN(vo.fecha_emision) as primera_venta,
          MAX(vo.fecha_emision) as ultima_venta
        FROM cerveza c
        JOIN cerveza_presentacion cp ON c.cerveza_id = cp.fk_cerveza
        JOIN presentacion p ON cp.fk_presentacion = p.presentacion_id
        JOIN almacen_cerveza ac ON cp.cerveza_presentacion_id = ac.fk_cerveza_presentacion
        JOIN detalle_venta_online dvo ON ac.almacen_cerveza_id = dvo.fk_almacen_cerveza
        JOIN venta_online vo ON dvo.fk_venta_online = vo.venta_online_id
        GROUP BY c.cerveza_id, c.nombre, p.cap_volumen, p.material
        ORDER BY unidades_vendidas DESC, ingresos_totales DESC
        LIMIT ${limite}
      `
    }

    const result = await query
    console.log(`Productos más vendidos encontrados: ${result.length}`)
    return result
  } catch (error) {
    console.error("Error en getProductosMasVendidos:", error)
    throw error
  }
}

// ===== FUNCIÓN QUE USA STORED PROCEDURE =====
export async function getProductosMasVendidosSP(fechaInicio?: string, fechaFin?: string, limite: number = 10) {
  try {
    console.log("=== getProductosMasVendidosSP ===")
    console.log("Parámetros:", { fechaInicio, fechaFin, limite })

    const query = sql`SELECT * FROM get_productos_mas_vendidos(${fechaInicio || null}, ${fechaFin || null}, ${limite})`
    const result = await query

    console.log(`Productos más vendidos encontrados: ${result.length}`)
    return result
  } catch (error) {
    console.error("Error en getProductosMasVendidosSP:", error)
    throw error
  }
}

// ===== FUNCIÓN DE PRUEBA SIMPLE PARA MIEMBROS ACAUCAB =====
export async function testMiembrosAcaucabSimple() {
  try {
    console.log("=== testMiembrosAcaucabSimple ===")
    
    // Consulta muy simple para verificar datos básicos
    const result = await sql`
      SELECT 
        ma.miembro_id,
        ma.razon_social,
        ma.rif,
        u.usuario_id,
        u.nombre_usuario,
        mem.membresia_id,
        mem.monto,
        mem.fecha_vencimiento,
        CURRENT_DATE as fecha_actual
      FROM miembro_acaucab ma
      LEFT JOIN usuario u ON ma.miembro_id = u.fk_miembro_acaucab
      LEFT JOIN membresia mem ON u.usuario_id = mem.fk_usuario
      ORDER BY ma.miembro_id
      LIMIT 20
    `
    
    console.log(`Datos básicos encontrados: ${result.length}`)
    console.log("Datos:", result)
    return result
  } catch (error) {
    console.error("Error en testMiembrosAcaucabSimple:", error)
    throw error
  }
}

// ===== FUNCIÓN DE PRUEBA CON HAVING =====
export async function testCuotasAfiliacionConHaving() {
  try {
    console.log("=== testCuotasAfiliacionConHaving ===")
    
    const result = await sql`
      SELECT 
        ma.miembro_id,
        ma.razon_social,
        u.fecha_creacion,
        MAX(p.fecha) as ultimo_pago,
        EXTRACT(MONTH FROM AGE(CURRENT_DATE, COALESCE(MAX(p.fecha), u.fecha_creacion))) as meses_pendientes
      FROM miembro_acaucab ma
      LEFT JOIN usuario u ON ma.miembro_id = u.fk_miembro_acaucab
      LEFT JOIN membresia mem ON u.usuario_id = mem.fk_usuario
      LEFT JOIN pago p ON mem.membresia_id = p.fk_membresia
      WHERE ma.miembro_id >= 21
      GROUP BY ma.miembro_id, ma.razon_social, u.fecha_creacion
      HAVING EXTRACT(MONTH FROM AGE(CURRENT_DATE, COALESCE(MAX(p.fecha), u.fecha_creacion))) > 0
      ORDER BY meses_pendientes DESC
    `
    
    console.log(`Datos con HAVING encontrados: ${result.length}`)
    console.log("Datos:", result)
    return result
  } catch (error) {
    console.error("Error en testCuotasAfiliacionConHaving:", error)
    throw error
  }
}

// ===== FUNCIONES PARA REPORTE DE NÓMINA POR DEPARTAMENTO =====

export async function getNominaDepartamento(fechaInicio?: string, fechaFin?: string, limite: number = 100) {
  try {
    console.log("=== getNominaDepartamento ===")
    console.log("Parámetros:", { fechaInicio, fechaFin, limite })

    let whereClause = ""
    if (fechaInicio && fechaFin) {
      whereClause = `WHERE (de.fecha_inicio >= '${fechaInicio}' AND de.fecha_inicio <= '${fechaFin}')`
    } else {
      whereClause = `WHERE (de.fecha_fin IS NULL OR de.fecha_fin >= CURRENT_DATE)`
    }

    const query = sql`
      SELECT 
        d.departamento_id,
        d.nombre as nombre_departamento,
        c.cargo_id,
        c.nombre as nombre_cargo,
        e.empleado_id,
        e.cedula,
        CONCAT(
          e.primer_nombre, ' ',
          COALESCE(e.segundo_nombre, ''), ' ',
          e.primer_apellido, ' ',
          COALESCE(e.segundo_apellido, '')
        ) as nombre_completo,
        e.fecha_contrato,
        de.salario as salario_base,
        COALESCE(SUM(be.monto), 0) as total_beneficios,
        de.salario + COALESCE(SUM(be.monto), 0) as costo_total,
        de.fecha_inicio as fecha_inicio_cargo,
        de.fecha_fin as fecha_fin_cargo,
        CASE 
          WHEN de.fecha_fin IS NULL OR de.fecha_fin >= CURRENT_DATE THEN 'ACTIVO'
          ELSE 'INACTIVO'
        END as estado_empleado
      FROM DEPARTAMENTO d
      INNER JOIN DEPARTAMENTO_EMPLEADO de ON d.departamento_id = de.fk_departamento
      INNER JOIN EMPLEADO e ON de.fk_empleado = e.empleado_id
      INNER JOIN CARGO c ON de.fk_cargo = c.cargo_id
      LEFT JOIN BENEFICIO_EMPLEADO be ON e.empleado_id = be.fk_empleado
      ${sql.unsafe(whereClause)}
      GROUP BY 
        d.departamento_id,
        d.nombre,
        c.cargo_id,
        c.nombre,
        e.empleado_id,
        e.cedula,
        e.primer_nombre,
        e.segundo_nombre,
        e.primer_apellido,
        e.segundo_apellido,
        e.fecha_contrato,
        de.salario,
        de.fecha_inicio,
        de.fecha_fin
      ORDER BY 
        d.nombre,
        c.nombre,
        e.primer_apellido,
        e.primer_nombre
      LIMIT ${limite}
    `

    const result = await query
    console.log(`Datos obtenidos: ${result.length} registros`)
    return result
  } catch (error) {
    console.error("Error en getNominaDepartamento:", error)
    throw error
  }
}

export async function getNominaDepartamentoResumen(fechaInicio?: string, fechaFin?: string, limite: number = 100) {
  try {
    console.log("=== getNominaDepartamentoResumen ===")
    console.log("Parámetros:", { fechaInicio, fechaFin, limite })

    let whereClause = ""
    if (fechaInicio && fechaFin) {
      whereClause = `WHERE (de.fecha_inicio >= '${fechaInicio}' AND de.fecha_inicio <= '${fechaFin}')`
    } else {
      whereClause = `WHERE (de.fecha_fin IS NULL OR de.fecha_fin >= CURRENT_DATE)`
    }

    const query = sql`
      SELECT 
        d.departamento_id,
        d.nombre as nombre_departamento,
        c.cargo_id,
        c.nombre as nombre_cargo,
        COUNT(DISTINCT e.empleado_id) as cantidad_empleados,
        ROUND(AVG(de.salario)) as salario_promedio,
        SUM(de.salario) as salario_total,
        COALESCE(SUM(be.monto), 0) as beneficios_total,
        SUM(de.salario) + COALESCE(SUM(be.monto), 0) as costo_total,
        ROUND((SUM(de.salario) + COALESCE(SUM(be.monto), 0)) / COUNT(DISTINCT e.empleado_id)) as costo_promedio_por_empleado
      FROM DEPARTAMENTO d
      INNER JOIN DEPARTAMENTO_EMPLEADO de ON d.departamento_id = de.fk_departamento
      INNER JOIN EMPLEADO e ON de.fk_empleado = e.empleado_id
      INNER JOIN CARGO c ON de.fk_cargo = c.cargo_id
      LEFT JOIN BENEFICIO_EMPLEADO be ON e.empleado_id = be.fk_empleado
      ${sql.unsafe(whereClause)}
      GROUP BY 
        d.departamento_id,
        d.nombre,
        c.cargo_id,
        c.nombre
      ORDER BY 
        d.nombre,
        c.nombre,
        costo_total DESC
      LIMIT ${limite}
    `

    const result = await query
    console.log(`Datos obtenidos: ${result.length} registros`)
    return result
  } catch (error) {
    console.error("Error en getNominaDepartamentoResumen:", error)
    throw error
  }
}

// Función alternativa sin stored procedure (consulta directa)
export async function getNominaDepartamentoDirecto(fechaInicio?: string, fechaFin?: string, limite: number = 100) {
  try {
    console.log("=== getNominaDepartamentoDirecto ===")
    console.log("Parámetros:", { fechaInicio, fechaFin, limite })

    let whereClause = ""
    if (fechaInicio && fechaFin) {
      whereClause = `WHERE (de.fecha_inicio >= '${fechaInicio}' AND de.fecha_inicio <= '${fechaFin}')`
    }

    const query = sql`
      SELECT 
        d.departamento_id,
        d.nombre as nombre_departamento,
        c.cargo_id,
        c.nombre as nombre_cargo,
        e.empleado_id,
        e.cedula,
        CONCAT(
          e.primer_nombre, ' ',
          COALESCE(e.segundo_nombre, ''), ' ',
          e.primer_apellido, ' ',
          COALESCE(e.segundo_apellido, '')
        ) as nombre_completo,
        e.fecha_contrato,
        de.salario as salario_base,
        COALESCE(SUM(be.monto), 0) as total_beneficios,
        de.salario + COALESCE(SUM(be.monto), 0) as costo_total,
        de.fecha_inicio as fecha_inicio_cargo,
        de.fecha_fin as fecha_fin_cargo,
        CASE 
          WHEN de.fecha_fin IS NULL OR de.fecha_fin >= CURRENT_DATE THEN 'ACTIVO'
          ELSE 'INACTIVO'
        END as estado_empleado
      FROM DEPARTAMENTO d
      INNER JOIN DEPARTAMENTO_EMPLEADO de ON d.departamento_id = de.fk_departamento
      INNER JOIN EMPLEADO e ON de.fk_empleado = e.empleado_id
      INNER JOIN CARGO c ON de.fk_cargo = c.cargo_id
      LEFT JOIN BENEFICIO_EMPLEADO be ON e.empleado_id = be.fk_empleado
      ${sql.unsafe(whereClause)}
      GROUP BY 
        d.departamento_id,
        d.nombre,
        c.cargo_id,
        c.nombre,
        e.empleado_id,
        e.cedula,
        e.primer_nombre,
        e.segundo_nombre,
        e.primer_apellido,
        e.segundo_apellido,
        e.fecha_contrato,
        de.salario,
        de.fecha_inicio,
        de.fecha_fin
      ORDER BY 
        d.nombre,
        c.nombre,
        e.primer_apellido,
        e.primer_nombre
      LIMIT ${limite}
    `

    const result = await query
    console.log(`Datos obtenidos: ${result.length} registros`)
    return result
  } catch (error) {
    console.error("Error en getNominaDepartamentoDirecto:", error)
    throw error
  }
}

// ===== FUNCIONES PARA REPORTE DE HISTORIAL DE COMPRAS ONLINE POR CLIENTE JURÍDICO =====

export async function getHistorialComprasClienteJuridico(
  clienteJuridicoId?: number,
  fechaInicio?: string, 
  fechaFin?: string, 
  limite: number = 100
) {
  try {
    console.log("=== getHistorialComprasClienteJuridico ===")
    console.log("Parámetros:", { clienteJuridicoId, fechaInicio, fechaFin, limite })

    let whereClause = "WHERE u.fk_cliente_juridico IS NOT NULL"
    
    if (clienteJuridicoId) {
      whereClause += ` AND u.fk_cliente_juridico = ${clienteJuridicoId}`
    }
    
    if (fechaInicio && fechaFin) {
      whereClause += ` AND vo.fecha_emision >= '${fechaInicio}' AND vo.fecha_emision <= '${fechaFin}'`
    }

    const query = sql`
      SELECT 
        cj.cliente_id,
        cj.razon_social,
        cj.denominacion_comercial,
        cj.rif,
        cj.direccion,
        cj.capital,
        cj.pagina_web,
        vo.venta_online_id,
        vo.fecha_emision,
        vo.fecha_estimada,
        vo.fecha_entrega,
        vo.total as total_venta,
        vo.direccion as direccion_entrega,
        c.nombre as nombre_cerveza,
        tc.nombre as tipo_cerveza,
        ec.nombre as estilo_cerveza,
        p.material as presentacion,
        p.cap_volumen as capacidad_ml,
        dvo.precio_unitario,
        dvo.cantidad,
        (dvo.precio_unitario * dvo.cantidad) as subtotal_producto,
        evo.fk_estado,
        CASE 
          WHEN evo.fk_estado = 1 THEN 'PENDIENTE'
          WHEN evo.fk_estado = 2 THEN 'CONFIRMADO'
          WHEN evo.fk_estado = 3 THEN 'EN PREPARACIÓN'
          WHEN evo.fk_estado = 4 THEN 'ENVIADO'
          WHEN evo.fk_estado = 5 THEN 'ENTREGADO'
          WHEN evo.fk_estado = 6 THEN 'CANCELADO'
          ELSE 'DESCONOCIDO'
        END as estado_venta,
        l.nombre as lugar_entrega
      FROM CLIENTE_JURIDICO cj
      INNER JOIN USUARIO u ON cj.cliente_id = u.fk_cliente_juridico
      INNER JOIN VENTA_ONLINE vo ON u.usuario_id = vo.fk_usuario
      INNER JOIN DETALLE_VENTA_ONLINE dvo ON vo.venta_online_id = dvo.fk_venta_online
      INNER JOIN ALMACEN_CERVEZA ac ON dvo.fk_almacen_cerveza = ac.almacen_cerveza_id
      INNER JOIN CERVEZA_PRESENTACION cp ON ac.fk_cerveza_presentacion = cp.cerveza_presentacion_id
      INNER JOIN CERVEZA c ON cp.fk_cerveza = c.cerveza_id
      INNER JOIN TIPO_CERVEZA tc ON c.fk_tipo_cerveza = tc.tipo_cerveza_id
      INNER JOIN ESTILO_CERVEZA ec ON c.fk_estilo_cerveza = ec.estilo_cerveza_id
      INNER JOIN PRESENTACION p ON cp.fk_presentacion = p.presentacion_id
      INNER JOIN LUGAR l ON vo.fk_lugar = l.lugar_id
      LEFT JOIN ESTADO_VENTA_ONLINE evo ON vo.venta_online_id = evo.fk_venta_online 
        AND (evo.fecha_fin IS NULL OR evo.fecha_fin >= CURRENT_DATE)
      ${sql.unsafe(whereClause)}
      ORDER BY 
        cj.razon_social,
        vo.fecha_emision DESC,
        vo.venta_online_id,
        c.nombre
      LIMIT ${limite}
    `

    const result = await query
    console.log(`Datos obtenidos: ${result.length} registros`)
    return result
  } catch (error) {
    console.error("Error en getHistorialComprasClienteJuridico:", error)
    throw error
  }
}

export async function getResumenComprasClienteJuridico(
  clienteJuridicoId?: number,
  fechaInicio?: string, 
  fechaFin?: string, 
  limite: number = 100
) {
  try {
    console.log("=== getResumenComprasClienteJuridico ===")
    console.log("Parámetros:", { clienteJuridicoId, fechaInicio, fechaFin, limite })

    let whereClause = "WHERE u.fk_cliente_juridico IS NOT NULL"
    
    if (clienteJuridicoId) {
      whereClause += ` AND u.fk_cliente_juridico = ${clienteJuridicoId}`
    }
    
    if (fechaInicio && fechaFin) {
      whereClause += ` AND vo.fecha_emision >= '${fechaInicio}' AND vo.fecha_emision <= '${fechaFin}'`
    }

    const query = sql`
      SELECT 
        cj.cliente_id,
        cj.razon_social,
        cj.denominacion_comercial,
        cj.rif,
        cj.capital,
        COUNT(DISTINCT vo.venta_online_id) as total_compras,
        COUNT(dvo.detalle_venta_online_id) as total_productos_comprados,
        SUM(dvo.cantidad) as unidades_totales,
        SUM(dvo.precio_unitario * dvo.cantidad) as monto_total_compras,
        AVG(vo.total) as ticket_promedio,
        MIN(vo.fecha_emision) as primera_compra,
        MAX(vo.fecha_emision) as ultima_compra,
        COUNT(DISTINCT c.cerveza_id) as variedades_compradas,
        STRING_AGG(DISTINCT c.nombre, ', ' ORDER BY c.nombre) as productos_comprados
      FROM CLIENTE_JURIDICO cj
      INNER JOIN USUARIO u ON cj.cliente_id = u.fk_cliente_juridico
      INNER JOIN VENTA_ONLINE vo ON u.usuario_id = vo.fk_usuario
      INNER JOIN DETALLE_VENTA_ONLINE dvo ON vo.venta_online_id = dvo.fk_venta_online
      INNER JOIN ALMACEN_CERVEZA ac ON dvo.fk_almacen_cerveza = ac.almacen_cerveza_id
      INNER JOIN CERVEZA_PRESENTACION cp ON ac.fk_cerveza_presentacion = cp.cerveza_presentacion_id
      INNER JOIN CERVEZA c ON cp.fk_cerveza = c.cerveza_id
      ${sql.unsafe(whereClause)}
      GROUP BY 
        cj.cliente_id,
        cj.razon_social,
        cj.denominacion_comercial,
        cj.rif,
        cj.capital
      ORDER BY 
        monto_total_compras DESC,
        cj.razon_social
      LIMIT ${limite}
    `

    const result = await query
    console.log(`Datos obtenidos: ${result.length} registros`)
    return result
  } catch (error) {
    console.error("Error en getResumenComprasClienteJuridico:", error)
    throw error
  }
}

export async function getClientesJuridicos() {
  try {
    console.log("=== getClientesJuridicos ===")
    
    const query = sql`
      SELECT 
        cj.cliente_id,
        cj.razon_social,
        cj.denominacion_comercial,
        cj.rif,
        cj.capital,
        COUNT(DISTINCT vo.venta_online_id) as total_compras,
        SUM(vo.total) as monto_total_compras
      FROM CLIENTE_JURIDICO cj
      LEFT JOIN USUARIO u ON cj.cliente_id = u.fk_cliente_juridico
      LEFT JOIN VENTA_ONLINE vo ON u.usuario_id = vo.fk_usuario
      GROUP BY 
        cj.cliente_id,
        cj.razon_social,
        cj.denominacion_comercial,
        cj.rif,
        cj.capital
      ORDER BY 
        cj.razon_social
    `

    const result = await query
    console.log(`Clientes jurídicos obtenidos: ${result.length} registros`)
    return result
  } catch (error) {
    console.error("Error en getClientesJuridicos:", error)
    throw error
  }
}

export async function getHistorialComprasClienteJuridicoSimple(
  clienteJuridicoId?: number,
  fechaInicio?: string, 
  fechaFin?: string, 
  limite: number = 100
) {
  try {
    console.log("=== getHistorialComprasClienteJuridicoSimple ===")
    console.log("Parámetros:", { clienteJuridicoId, fechaInicio, fechaFin, limite })

    let whereClause = "WHERE u.fk_cliente_juridico IS NOT NULL"
    
    if (clienteJuridicoId) {
      whereClause += ` AND u.fk_cliente_juridico = ${clienteJuridicoId}`
    }
    
    if (fechaInicio && fechaFin) {
      whereClause += ` AND vo.fecha_emision >= '${fechaInicio}' AND vo.fecha_emision <= '${fechaFin}'`
    }

    const query = sql`
      SELECT 
        cj.cliente_id,
        cj.razon_social,
        cj.denominacion_comercial,
        cj.rif,
        cj.capital,
        cj.pagina_web,
        vo.venta_online_id,
        vo.fecha_emision,
        vo.fecha_estimada,
        vo.fecha_entrega,
        vo.total as total_venta,
        vo.direccion as direccion_entrega,
        'Sin detalle' as nombre_cerveza,
        'Sin detalle' as tipo_cerveza,
        'Sin detalle' as estilo_cerveza,
        'Sin detalle' as presentacion,
        0 as capacidad_ml,
        0 as precio_unitario,
        0 as cantidad,
        0 as subtotal_producto,
        NULL as fk_estado,
        'PENDIENTE' as estado_venta,
        'Sin lugar' as lugar_entrega
      FROM CLIENTE_JURIDICO cj
      INNER JOIN USUARIO u ON cj.cliente_id = u.fk_cliente_juridico
      INNER JOIN VENTA_ONLINE vo ON u.usuario_id = vo.fk_usuario
      ${sql.unsafe(whereClause)}
      ORDER BY 
        cj.razon_social,
        vo.fecha_emision DESC,
        vo.venta_online_id
      LIMIT ${limite}
    `

    const result = await query
    console.log(`Datos obtenidos: ${result.length} registros`)
    return result
  } catch (error) {
    console.error("Error en getHistorialComprasClienteJuridicoSimple:", error)
    throw error
  }
}

export async function getResumenComprasClienteJuridicoSimple(
  clienteJuridicoId?: number,
  fechaInicio?: string, 
  fechaFin?: string, 
  limite: number = 100
) {
  try {
    console.log("=== getResumenComprasClienteJuridicoSimple ===")
    console.log("Parámetros:", { clienteJuridicoId, fechaInicio, fechaFin, limite })

    let whereClause = "WHERE u.fk_cliente_juridico IS NOT NULL"
    
    if (clienteJuridicoId) {
      whereClause += ` AND u.fk_cliente_juridico = ${clienteJuridicoId}`
    }
    
    if (fechaInicio && fechaFin) {
      whereClause += ` AND vo.fecha_emision >= '${fechaInicio}' AND vo.fecha_emision <= '${fechaFin}'`
    }

    const query = sql`
      SELECT 
        cj.cliente_id,
        cj.razon_social,
        cj.denominacion_comercial,
        cj.rif,
        cj.capital,
        COUNT(DISTINCT vo.venta_online_id) as total_compras,
        0 as total_productos_comprados,
        0 as unidades_totales,
        SUM(vo.total) as monto_total_compras,
        AVG(vo.total) as ticket_promedio,
        MIN(vo.fecha_emision) as primera_compra,
        MAX(vo.fecha_emision) as ultima_compra,
        0 as variedades_compradas,
        'Sin detalle' as productos_comprados
      FROM CLIENTE_JURIDICO cj
      INNER JOIN USUARIO u ON cj.cliente_id = u.fk_cliente_juridico
      INNER JOIN VENTA_ONLINE vo ON u.usuario_id = vo.fk_usuario
      ${sql.unsafe(whereClause)}
      GROUP BY 
        cj.cliente_id,
        cj.razon_social,
        cj.denominacion_comercial,
        cj.rif,
        cj.capital
      ORDER BY 
        monto_total_compras DESC,
        cj.razon_social
      LIMIT ${limite}
    `

    const result = await query
    console.log(`Datos obtenidos: ${result.length} registros`)
    return result
  } catch (error) {
    console.error("Error en getResumenComprasClienteJuridicoSimple:", error)
    throw error
  }
}

export async function getStockAlmacen() {
  return await sql`SELECT * FROM get_stock_almacen()`;
}

export async function getStockAnaquel() {
  return await sql`SELECT * FROM get_stock_anaquel()`;
}

export async function getStockGeneral() {
  return await sql`SELECT * FROM get_stock_general()`;
}

// ===== FUNCIÓN QUE USA STORED PROCEDURE PARA REPOSICIÓN DE ANAQUELES =====
export async function getReposicionAnaquelesSP(fechaInicio?: string, fechaFin?: string, limite: number = 100) {
  try {
    console.log("=== getReposicionAnaquelesSP ===")
    console.log("Parámetros:", { fechaInicio, fechaFin, limite })

    const query = sql`SELECT * FROM get_reposicion_anaqueles(${fechaInicio || null}, ${fechaFin || null}, ${limite})`
    const result = await query

    console.log(`Reposiciones de anaqueles encontradas: ${result.length}`)
    return result
  } catch (error) {
    console.error("Error en getReposicionAnaquelesSP:", error)
    throw error
  }
}

// ===== FUNCIÓN PARA VERIFICAR MIEMBROS ACAUCAB Y SUS USUARIOS =====
export async function verificarMiembrosAcaucab() {
  try {
    console.log("=== verificarMiembrosAcaucab ===")
    
    // Consulta para ver todos los miembros ACAUCAB y si tienen usuarios
    const result = await sql`
      SELECT 
        ma.miembro_id,
        ma.razon_social,
        ma.rif,
        ma.direccion,
        u.usuario_id,
        u.nombre_usuario,
        u.fecha_creacion,
        mem.membresia_id,
        mem.fecha_adquisicion,
        mem.fecha_vencimiento,
        mem.monto,
        CASE 
          WHEN u.usuario_id IS NOT NULL THEN 'CON USUARIO'
          ELSE 'SIN USUARIO'
        END as estado_usuario,
        CASE 
          WHEN mem.membresia_id IS NOT NULL THEN 'CON MEMBRESÍA'
          ELSE 'SIN MEMBRESÍA'
        END as estado_membresia
      FROM miembro_acaucab ma
      LEFT JOIN usuario u ON ma.miembro_id = u.fk_miembro_acaucab
      LEFT JOIN membresia mem ON u.usuario_id = mem.fk_usuario
      ORDER BY ma.miembro_id
    `
    
    console.log(`Miembros ACAUCAB encontrados: ${result.length}`)
    console.log("Datos:", result)
    return result
  } catch (error) {
    console.error("Error en verificarMiembrosAcaucab:", error)
    throw error
  }
}

// ===== FUNCIÓN PARA ASIGNAR FECHAS DE AFILIACIÓN A MIEMBROS SIN USUARIO =====
export async function asignarFechasAfiliacion() {
  try {
    console.log("=== asignarFechasAfiliacion ===")
    
    // Primero, verificar cuántos miembros no tienen usuario
    const miembrosSinUsuario = await sql`
      SELECT 
        ma.miembro_id,
        ma.razon_social,
        ma.rif
      FROM miembro_acaucab ma
      LEFT JOIN usuario u ON ma.miembro_id = u.fk_miembro_acaucab
      WHERE u.usuario_id IS NULL
      ORDER BY ma.miembro_id
    `
    
    console.log(`Miembros sin usuario encontrados: ${miembrosSinUsuario.length}`)
    
    if (miembrosSinUsuario.length === 0) {
      console.log("Todos los miembros ya tienen usuarios asociados")
      return { message: "Todos los miembros ya tienen usuarios asociados", count: 0 }
    }
    
    // Crear usuarios para los miembros que no los tienen
    let usuariosCreados = 0
    for (const miembro of miembrosSinUsuario) {
      try {
        // Crear usuario con fecha de afiliación
        const fechaAfiliacion = new Date()
        fechaAfiliacion.setFullYear(2024) // Establecer año 2024
        fechaAfiliacion.setMonth(Math.floor(Math.random() * 12)) // Mes aleatorio
        fechaAfiliacion.setDate(Math.floor(Math.random() * 28) + 1) // Día aleatorio
        
        const usuario = await sql`
          INSERT INTO usuario (fecha_creacion, nombre_usuario, hash_contrasena, fk_miembro_acaucab)
          VALUES (${fechaAfiliacion.toISOString().split('T')[0]}, ${`miembro_${miembro.miembro_id}`}, 'password123', ${miembro.miembro_id})
          RETURNING usuario_id, fecha_creacion
        `
        
        // Crear membresía para el usuario
        const fechaVencimiento = new Date(fechaAfiliacion)
        fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + 1)
        
        await sql`
          INSERT INTO membresia (fecha_adquisicion, fecha_vencimiento, monto, fk_usuario)
          VALUES (${fechaAfiliacion.toISOString().split('T')[0]}, ${fechaVencimiento.toISOString().split('T')[0]}, 100, ${usuario[0].usuario_id})
        `
        
        usuariosCreados++
        console.log(`Usuario creado para miembro ${miembro.miembro_id}: ${miembro.razon_social}`)
      } catch (error) {
        console.error(`Error creando usuario para miembro ${miembro.miembro_id}:`, error)
      }
    }
    
    console.log(`Total de usuarios creados: ${usuariosCreados}`)
    return { message: `Se crearon ${usuariosCreados} usuarios`, count: usuariosCreados }
  } catch (error) {
    console.error("Error en asignarFechasAfiliacion:", error)
    throw error
  }
}

// ===== FUNCIÓN DE PRUEBA MUY SIMPLE =====
export async function testDatosBasicos() {
  try {
    console.log("=== testDatosBasicos ===")
    
    // Verificar cuántos registros hay en cada tabla
    const miembros = await sql`SELECT COUNT(*) as total FROM miembro_acaucab`
    const usuarios = await sql`SELECT COUNT(*) as total FROM usuario WHERE fk_miembro_acaucab IS NOT NULL`
    const membresias = await sql`SELECT COUNT(*) as total FROM membresia`
    const pagos = await sql`SELECT COUNT(*) as total FROM pago`
    
    // Ver algunos datos de ejemplo
    const ejemploMiembros = await sql`
      SELECT miembro_id, razon_social, rif 
      FROM miembro_acaucab 
      ORDER BY miembro_id 
      LIMIT 5
    `
    
    const ejemploUsuarios = await sql`
      SELECT usuario_id, nombre_usuario, fecha_creacion, fk_miembro_acaucab 
      FROM usuario 
      WHERE fk_miembro_acaucab IS NOT NULL 
      ORDER BY usuario_id 
      LIMIT 5
    `
    
    const ejemploMembresias = await sql`
      SELECT membresia_id, fecha_adquisicion, fecha_vencimiento, monto, fk_usuario 
      FROM membresia 
      ORDER BY membresia_id 
      LIMIT 5
    `
    
    const resultado = {
      conteos: {
        miembros: miembros[0].total,
        usuarios: usuarios[0].total,
        membresias: membresias[0].total,
        pagos: pagos[0].total
      },
      ejemploMiembros,
      ejemploUsuarios,
      ejemploMembresias
    }
    
    console.log("Resultado:", resultado)
    return resultado
  } catch (error) {
    console.error("Error en testDatosBasicos:", error)
    throw error
  }
}

// ===== FUNCIÓN DE PRUEBA PARA REPORTE DE CUOTAS =====
export async function testReporteCuotas() {
  try {
    console.log("=== testReporteCuotas ===")
    
    // Paso 1: Verificar si hay miembros con usuarios y membresías
    const miembrosConDatos = await sql`
      SELECT 
        ma.miembro_id,
        ma.razon_social,
        ma.rif,
        u.usuario_id,
        u.fecha_creacion,
        mem.membresia_id,
        mem.monto,
        mem.fecha_vencimiento
      FROM miembro_acaucab ma
      INNER JOIN usuario u ON ma.miembro_id = u.fk_miembro_acaucab
      INNER JOIN membresia mem ON u.usuario_id = mem.fk_usuario
      ORDER BY ma.miembro_id
      LIMIT 10
    `
    
    console.log(`Miembros con datos completos: ${miembrosConDatos.length}`)
    console.log("Datos:", miembrosConDatos)
    
    // Paso 2: Probar la consulta del reporte sin GROUP BY
    const reporteSimple = await sql`
      SELECT 
        ma.miembro_id,
        ma.razon_social,
        ma.rif,
        u.fecha_creacion as fecha_afiliacion,
        mem.monto as cuota_mensual,
        mem.fecha_vencimiento,
        CASE 
          WHEN mem.fecha_vencimiento >= CURRENT_DATE THEN 'ACTIVO'
          ELSE 'VENCIDO'
        END as estado_afiliacion
      FROM miembro_acaucab ma
      INNER JOIN usuario u ON ma.miembro_id = u.fk_miembro_acaucab
      INNER JOIN membresia mem ON u.usuario_id = mem.fk_usuario
      ORDER BY ma.miembro_id
      LIMIT 10
    `
    
    console.log(`Reporte simple: ${reporteSimple.length} registros`)
    console.log("Reporte simple:", reporteSimple)
    
    return {
      miembrosConDatos,
      reporteSimple,
      totalMiembrosConDatos: miembrosConDatos.length,
      totalReporteSimple: reporteSimple.length
    }
  } catch (error) {
    console.error("Error en testReporteCuotas:", error)
    throw error
  }
}

// ===== FUNCIÓN DE DIAGNÓSTICO DETALLADO =====
export async function diagnosticoDetallado() {
  try {
    console.log("=== diagnosticoDetallado ===")
    
    // 1. Contar registros en cada tabla
    const conteos = await sql`
      SELECT 
        (SELECT COUNT(*) FROM miembro_acaucab) as total_miembros,
        (SELECT COUNT(*) FROM usuario WHERE fk_miembro_acaucab IS NOT NULL) as usuarios_miembros,
        (SELECT COUNT(*) FROM membresia) as total_membresias,
        (SELECT COUNT(*) FROM pago) as total_pagos
    `
    
    // 2. Ver algunos miembros ACAUCAB
    const miembros = await sql`
      SELECT miembro_id, razon_social, rif, direccion
      FROM miembro_acaucab 
      ORDER BY miembro_id 
      LIMIT 10
    `
    
    // 3. Ver usuarios que pertenecen a miembros
    const usuarios = await sql`
      SELECT usuario_id, nombre_usuario, fecha_creacion, fk_miembro_acaucab
      FROM usuario 
      WHERE fk_miembro_acaucab IS NOT NULL
      ORDER BY usuario_id 
      LIMIT 10
    `
    
    // 4. Ver membresías
    const membresias = await sql`
      SELECT membresia_id, fecha_adquisicion, fecha_vencimiento, monto, fk_usuario
      FROM membresia 
      ORDER BY membresia_id 
      LIMIT 10
    `
    
    // 5. Ver la relación completa
    const relacionCompleta = await sql`
      SELECT 
        ma.miembro_id,
        ma.razon_social,
        u.usuario_id,
        u.nombre_usuario,
        mem.membresia_id,
        mem.monto,
        mem.fecha_vencimiento
      FROM miembro_acaucab ma
      LEFT JOIN usuario u ON ma.miembro_id = u.fk_miembro_acaucab
      LEFT JOIN membresia mem ON u.usuario_id = mem.fk_usuario
      ORDER BY ma.miembro_id
      LIMIT 15
    `
    
    const resultado = {
      conteos: conteos[0],
      miembros,
      usuarios,
      membresias,
      relacionCompleta,
      totalMiembros: miembros.length,
      totalUsuarios: usuarios.length,
      totalMembresias: membresias.length,
      totalRelacionCompleta: relacionCompleta.length
    }
    
    console.log("Diagnóstico completo:", resultado)
    return resultado
  } catch (error) {
    console.error("Error en diagnosticoDetallado:", error)
    throw error
  }
}

// ===== FUNCIÓN SIMPLE PARA ESTADO DE AFILIACIÓN =====
export async function getEstadoAfiliacionSimple() {
  try {
    console.log("=== getEstadoAfiliacionSimple ===")

    const query = sql`
      SELECT 
        ma.miembro_id,
        ma.razon_social,
        ma.rif,
        u.fecha_creacion as fecha_afiliacion,
        mem.monto as cuota_mensual,
        mem.fecha_vencimiento,
        CASE 
          WHEN mem.fecha_vencimiento >= CURRENT_DATE THEN 'ACTIVO'
          ELSE 'VENCIDO'
        END as estado_afiliacion,
        CURRENT_DATE as fecha_actual
      FROM miembro_acaucab ma
      LEFT JOIN usuario u ON ma.miembro_id = u.fk_miembro_acaucab
      LEFT JOIN membresia mem ON u.usuario_id = mem.fk_usuario
      ORDER BY ma.miembro_id
    `

    const result = await query
    console.log(`Miembros ACAUCAB con estado de afiliación: ${result.length}`)
    return result
  } catch (error) {
    console.error("Error en getEstadoAfiliacionSimple:", error)
    throw error
  }
}

// ===== FUNCIÓN PARA VER DATOS DE PAGOS =====
export async function verDatosPagos() {
  try {
    console.log("=== verDatosPagos ===")

    // 1. Ver la estructura de la tabla PAGO
    const estructuraPago = await sql`
      SELECT 
        pago_id,
        fecha,
        monto,
        fk_membresia
      FROM pago 
      ORDER BY pago_id 
      LIMIT 10
    `

    // 2. Ver la relación completa: Miembro -> Usuario -> Membresía -> Pago
    const relacionCompleta = await sql`
      SELECT 
        ma.miembro_id,
        ma.razon_social,
        u.usuario_id,
        mem.membresia_id,
        mem.monto as cuota_membresia,
        mem.fecha_vencimiento,
        p.pago_id,
        p.fecha as fecha_pago,
        p.monto as monto_pago,
        CASE 
          WHEN p.pago_id IS NOT NULL THEN 'HA PAGADO'
          ELSE 'NO HA PAGADO'
        END as estado_pago
      FROM miembro_acaucab ma
      LEFT JOIN usuario u ON ma.miembro_id = u.fk_miembro_acaucab
      LEFT JOIN membresia mem ON u.usuario_id = mem.fk_usuario
      LEFT JOIN pago p ON mem.membresia_id = p.fk_membresia
      ORDER BY ma.miembro_id, p.fecha DESC
      LIMIT 20
    `

    // 3. Ver el último pago de cada miembro (usando MAX)
    const ultimoPagoPorMiembro = await sql`
      SELECT 
        ma.miembro_id,
        ma.razon_social,
        MAX(p.fecha) as ultimo_pago_fecha,
        MAX(p.monto) as ultimo_pago_monto,
        COUNT(p.pago_id) as total_pagos,
        CASE 
          WHEN MAX(p.fecha) IS NOT NULL THEN 'HA PAGADO'
          ELSE 'NO HA PAGADO'
        END as estado_pago
      FROM miembro_acaucab ma
      LEFT JOIN usuario u ON ma.miembro_id = u.fk_miembro_acaucab
      LEFT JOIN membresia mem ON u.usuario_id = mem.fk_usuario
      LEFT JOIN pago p ON mem.membresia_id = p.fk_membresia
      GROUP BY ma.miembro_id, ma.razon_social
      ORDER BY ma.miembro_id
      LIMIT 15
    `

    const resultado = {
      estructuraPago,
      relacionCompleta,
      ultimoPagoPorMiembro,
      totalPagos: estructuraPago.length,
      totalRelaciones: relacionCompleta.length,
      totalMiembrosConPagos: ultimoPagoPorMiembro.length
    }

    console.log("Datos de pagos:", resultado)
    return resultado
  } catch (error) {
    console.error("Error en verDatosPagos:", error)
    throw error
  }
}

// ===== FUNCIÓN PARA VERIFICAR CONTACTOS FALTANTES =====
export async function verificarContactosFaltantes() {
  try {
    console.log("=== verificarContactosFaltantes ===")
    
    // Verificar miembros sin personal de contacto
    const miembrosSinContacto = await sql`
      SELECT 
        ma.miembro_id,
        ma.razon_social,
        ma.rif,
        CASE 
          WHEN pc.personal_contacto_id IS NULL THEN 'SIN CONTACTO'
          ELSE 'CON CONTACTO'
        END as estado_contacto,
        CASE 
          WHEN ce.correo_electronico_id IS NULL THEN 'SIN EMAIL'
          ELSE 'CON EMAIL'
        END as estado_email
      FROM miembro_acaucab ma
      LEFT JOIN personal_contacto pc ON ma.miembro_id = pc.fk_miembro_acaucab
      LEFT JOIN correo_electronico ce ON ma.miembro_id = ce.fk_miembro_acaucab
      WHERE pc.personal_contacto_id IS NULL OR ce.correo_electronico_id IS NULL
      ORDER BY ma.miembro_id
    `
    
    console.log(`Miembros con contactos faltantes: ${miembrosSinContacto.length}`)
    return miembrosSinContacto
  } catch (error) {
    console.error("Error en verificarContactosFaltantes:", error)
    throw error
  }
}

// ===== FUNCIÓN PARA GENERAR INSERTS DE CONTACTOS =====
export async function generarInsertsContactos() {
  try {
    console.log("=== generarInsertsContactos ===")
    
    // Obtener miembros que necesitan contactos
    const miembrosNecesitanContacto = await sql`
      SELECT 
        ma.miembro_id,
        ma.razon_social,
        ma.rif,
        pc.personal_contacto_id,
        ce.correo_electronico_id
      FROM miembro_acaucab ma
      LEFT JOIN personal_contacto pc ON ma.miembro_id = pc.fk_miembro_acaucab
      LEFT JOIN correo_electronico ce ON ma.miembro_id = ce.fk_miembro_acaucab
      WHERE pc.personal_contacto_id IS NULL OR ce.correo_electronico_id IS NULL
      ORDER BY ma.miembro_id
    `
    
    const inserts = []
    
    for (const miembro of miembrosNecesitanContacto) {
      // Generar datos de contacto basados en el nombre de la empresa
      const nombreEmpresa = miembro.razon_social.toLowerCase()
      let nombreContacto = 'Contacto'
      let apellidoContacto = 'General'
      
      // Extraer nombre de contacto del nombre de la empresa
      if (nombreEmpresa.includes('cervecería') || nombreEmpresa.includes('cerveceria')) {
        nombreContacto = 'Gerente'
        apellidoContacto = 'Comercial'
      } else if (nombreEmpresa.includes('distribuidora') || nombreEmpresa.includes('distribuciones')) {
        nombreContacto = 'Director'
        apellidoContacto = 'Ventas'
      } else if (nombreEmpresa.includes('comercializadora') || nombreEmpresa.includes('comercial')) {
        nombreContacto = 'Administrador'
        apellidoContacto = 'General'
      } else if (nombreEmpresa.includes('importadora')) {
        nombreContacto = 'Coordinador'
        apellidoContacto = 'Importaciones'
      } else {
        nombreContacto = 'Representante'
        apellidoContacto = 'Legal'
      }
      
      // Generar email basado en el nombre de la empresa
      const nombreEmail = nombreEmpresa.replace(/[^a-z0-9]/g, '').substring(0, 10)
      const dominio = nombreEmpresa.includes('www.') ? nombreEmpresa.split('www.')[1] : 'empresa.com'
      
      // INSERT para personal de contacto (si no existe)
      if (!miembro.personal_contacto_id) {
        inserts.push({
          tipo: 'personal_contacto',
          miembro_id: miembro.miembro_id,
          sql: `INSERT INTO personal_contacto (primer_nombre, primer_apellido, fk_miembro_acaucab) VALUES ('${nombreContacto}', '${apellidoContacto}', ${miembro.miembro_id});`
        })
      }
      
      // INSERT para correo electrónico (si no existe)
      if (!miembro.correo_electronico_id) {
        inserts.push({
          tipo: 'correo_electronico',
          miembro_id: miembro.miembro_id,
          sql: `INSERT INTO correo_electronico (usuario, dominio, fk_miembro_acaucab) VALUES ('${nombreEmail}', '@${dominio}', ${miembro.miembro_id});`
        })
      }
    }
    
    console.log(`Inserts generados: ${inserts.length}`)
    return {
      miembrosNecesitanContacto,
      inserts,
      totalInserts: inserts.length
    }
  } catch (error) {
    console.error("Error en generarInsertsContactos:", error)
    throw error
  }
}

// ===== FUNCIÓN PARA GENERAR ARCHIVO SQL DE CONTACTOS =====
export async function generarArchivoSQLContactos() {
  try {
    console.log("=== generarArchivoSQLContactos ===")
    
    const resultado = await generarInsertsContactos()
    
    let sqlContent = `-- =====================================================
-- INSERTS PARA PERSONAL DE CONTACTO Y CORREOS ELECTRÓNICOS
-- Miembros ACAUCAB que necesitan datos de contacto
-- =====================================================

-- Fecha de generación: ${new Date().toISOString().split('T')[0]}
-- Total de INSERTs generados: ${resultado.totalInserts}

`

    // Agrupar por tipo
    const personalContacto = resultado.inserts.filter(i => i.tipo === 'personal_contacto')
    const correosElectronicos = resultado.inserts.filter(i => i.tipo === 'correo_electronico')
    
    if (personalContacto.length > 0) {
      sqlContent += `-- =====================================================
-- INSERTS PARA PERSONAL DE CONTACTO
-- =====================================================

`
      personalContacto.forEach(insert => {
        sqlContent += `${insert.sql}\n`
      })
    }
    
    if (correosElectronicos.length > 0) {
      sqlContent += `-- =====================================================
-- INSERTS PARA CORREOS ELECTRÓNICOS
-- =====================================================

`
      correosElectronicos.forEach(insert => {
        sqlContent += `${insert.sql}\n`
      })
    }
    
    sqlContent += `-- =====================================================
-- VERIFICACIÓN POST-INSERT
-- =====================================================

-- Verificar que todos los miembros tengan contactos
SELECT 
  ma.miembro_id,
  ma.razon_social,
  CASE 
    WHEN pc.personal_contacto_id IS NOT NULL THEN 'CON CONTACTO'
    ELSE 'SIN CONTACTO'
  END as estado_contacto,
  CASE 
    WHEN ce.correo_electronico_id IS NOT NULL THEN 'CON EMAIL'
    ELSE 'SIN EMAIL'
  END as estado_email
FROM miembro_acaucab ma
LEFT JOIN personal_contacto pc ON ma.miembro_id = pc.fk_miembro_acaucab
LEFT JOIN correo_electronico ce ON ma.miembro_id = ce.fk_miembro_acaucab
ORDER BY ma.miembro_id;

-- Contar miembros con contactos completos
SELECT 
  COUNT(*) as total_miembros,
  COUNT(pc.personal_contacto_id) as con_contacto,
  COUNT(ce.correo_electronico_id) as con_email,
  COUNT(CASE WHEN pc.personal_contacto_id IS NOT NULL AND ce.correo_electronico_id IS NOT NULL THEN 1 END) as completos
FROM miembro_acaucab ma
LEFT JOIN personal_contacto pc ON ma.miembro_id = pc.fk_miembro_acaucab
LEFT JOIN correo_electronico ce ON ma.miembro_id = ce.fk_miembro_acaucab;
`
    
    return {
      sqlContent,
      estadisticas: {
        totalInserts: resultado.totalInserts,
        personalContacto: personalContacto.length,
        correosElectronicos: correosElectronicos.length
      }
    }
  } catch (error) {
    console.error("Error en generarArchivoSQLContactos:", error)
    throw error
  }
}