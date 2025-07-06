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
    password: '0511',
    // connection: { options: '-c search_path=schema_name' }
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

export async function getTasaDolar() {
  return await sql`select * from getTasaDolar()`;
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

export async function getEmpleados(){
    try {
        console.log("=== getEmpleados ===")
        
        // Intentar usar la función SQL primero
        try {
            const result = await sql`SELECT * FROM get_empleados()`
            console.log(`Empleados obtenidos con función SQL: ${result.length} registros`)
            return result
        } catch (functionError) {
            console.warn("Error con función get_empleados(), intentando consulta directa:", functionError)
            
            // Fallback: consulta directa a la tabla
            const directResult = await sql`
                SELECT 
                    empleado_id::TEXT as id,
                    cedula,
                    primer_nombre,
                    primer_apellido,
                    COALESCE(segundo_nombre, '')::VARCHAR as segundo_nombre,
                    COALESCE(segundo_apellido, '')::VARCHAR as segundo_apellido,
                    direccion,
                    fecha_contrato,
                    fk_lugar,
                    CONCAT(primer_nombre, ' ', primer_apellido)::VARCHAR as nombre_completo,
                    TRIM(CONCAT(
                        primer_nombre, ' ', 
                        COALESCE(segundo_nombre, ''), ' ', 
                        primer_apellido, ' ', 
                        COALESCE(segundo_apellido, '')
                    ))::VARCHAR as nombre_completo_full
                FROM empleado
                ORDER BY primer_nombre, primer_apellido
            `
            console.log(`Empleados obtenidos con consulta directa: ${directResult.length} registros`)
            return directResult
        }
    } catch (error) {
        console.error("Error en getEmpleados:", error)
        throw error
    }
}

// Funciones para operaciones CRUD de usuarios con empleados
export async function getAllUsuariosWithEmpleados() {
  try {
    const result = await sql`SELECT * FROM get_all_usuarios_with_empleados()`
    console.log(`Usuarios con empleados obtenidos: ${result.length} registros`)
    return result
  } catch (error) {
    console.error("Error getting all usuarios with empleados:", error)
    throw error
  }
}

export async function getUsuarioWithEmpleadoById(id: string) {
  try {
    const result = await sql`SELECT * FROM get_usuario_with_empleado_by_id(${Number.parseInt(id)})`
    console.log(`Usuario con empleado obtenido por ID: ${result.length} registros`)
    return result
  } catch (error) {
    console.error("Error getting usuario with empleado by id:", error)
    throw error
  }
}

export async function getUsuarioWithEmpleadoByEmail(email: string) {
  try {
    const result = await sql`SELECT * FROM get_usuario_with_empleado_by_email(${email})`
    console.log(`Usuario con empleado obtenido por email: ${result.length} registros`)
    return result
  } catch (error) {
    console.error("Error getting usuario with empleado by email:", error)
    throw error
  }
}

export async function createUsuarioWithEmpleado(email: string, password: string, empleadoId: string) {
  try {
    const result = await sql`SELECT * FROM create_usuario_with_empleado(${email}, ${password}, ${Number.parseInt(empleadoId)})`
    console.log(`Usuario creado con empleado: ${result.length} registros`)
    return result[0]
  } catch (error) {
    console.error("Error creating usuario with empleado:", error)
    throw error
  }
}

export async function updateUsuarioWithEmpleado(id: string, email: string, password?: string, empleadoId?: string) {
  try {
    const result = await sql`SELECT * FROM update_usuario_with_empleado(${Number.parseInt(id)}, ${email}, ${password || null}, ${empleadoId ? Number.parseInt(empleadoId) : null})`
    console.log(`Usuario actualizado con empleado: ${result.length} registros`)
    return result[0]
  } catch (error) {
    console.error("Error updating usuario with empleado:", error)
    throw error
  }
}

export async function deleteUsuarioById(id: string) {
  try {
    const result = await sql`SELECT * FROM delete_usuario_by_id(${Number.parseInt(id)})`
    console.log(`Usuario eliminado: ${result.length} registros`)
    return result[0]
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





export default sql

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


// ===== FUNCIÓ QUE USA STORED PROCEDURE =====
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


export async function getNominaDepartamento(fechaInicio?: string, fechaFin?: string, limite: number = 100) {
  try {
    console.log("=== getNominaDepartamento ===")
    console.log("Parámetros:", { fechaInicio, fechaFin, limite })

    const result = await sql`SELECT * FROM get_nomina_departamento(${fechaInicio || null}, ${fechaFin || null}, ${limite})`
    console.log(`Datos obtenidos: ${result.length} registros`)
    return result
  } catch (error) {
    console.error("Error en getNominaDepartamento:", error)
    throw error
  }
}

export async function getHistorialComprasClienteJuridico(
  clienteJuridicoId?: number,
  fechaInicio?: string, 
  fechaFin?: string, 
  limite: number = 100
) {
  try {
    console.log("=== getHistorialComprasClienteJuridico ===")
    console.log("Parámetros:", { clienteJuridicoId, fechaInicio, fechaFin, limite })

    const result = await sql`SELECT * FROM get_historial_compras_cliente_juridico(${clienteJuridicoId || null}, ${fechaInicio || null}, ${fechaFin || null}, ${limite})`
    console.log(`Datos obtenidos: ${result.length} registros`)
    return result
  } catch (error) {
    console.error("Error en getHistorialComprasClienteJuridico:", error)
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


export async function getClientesJuridicos() {
  try {
    console.log("=== getClientesJuridicos ===")
    
    const result = await sql`SELECT * FROM get_clientes_juridicos()`
    console.log(`Clientes jurídicos obtenidos: ${result.length} registros`)
    return result
  } catch (error) {
    console.error("Error en getClientesJuridicos:", error)
    throw error
  }
}