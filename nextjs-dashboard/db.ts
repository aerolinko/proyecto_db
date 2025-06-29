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
        AS (cliente_id integer, primer_nombre varchar, segundo_nombre varchar, cedula integer, direccion varchar, total_puntos integer, rif varchar, primer_apellido varchar, segundo_apellido varchar);`;
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
    const result = await sql`CALL insertarVentaTiendaConDetalle(${montoTotal},${id},${tipo},${sql.json(detalle)},${sql.json(metodos)})`;
    
    // Obtener el ID de la venta recién creada
    const ventaId = await sql`
        SELECT venta_tienda_id 
        FROM venta_tienda 
        WHERE fk_cliente_natual = ${id} OR fk_cliente_juridico = ${id}
        ORDER BY fecha DESC, venta_tienda_id DESC 
        LIMIT 1
    `;
    
    return ventaId[0]?.venta_tienda_id;
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
    console.log("=== getAllUsuariosWithEmpleados ===")
    const result = await sql`SELECT * FROM get_all_usuarios_complete()`
    console.log(`Usuarios obtenidos: ${result.length}`)
    return result
  } catch (error) {
    console.error("Error en getAllUsuariosWithEmpleados:", error)
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
    console.log("RESULTADO CLIENTES JURIDICOS:", result);
    return result;
  } catch (error) {
    console.error("Error en getClientesJuridicos:", error)
    throw error
  }
}

// Funciones para obtener entidades sin usuarios asignados
export async function getClientesNaturalesSinUsuario() {
    return await sql`SELECT * FROM get_clientes_naturales_sin_usuario()`;
}

export async function getMiembrosAcaucabSinUsuario() {
    return await sql`SELECT * FROM get_miembros_acaucab_sin_usuario()`;
}

// Funciones para obtener TODAS las entidades (para debugging)
export async function getAllClientesNaturales() {
    return await sql`SELECT * FROM get_all_clientes_naturales()`;
}

export async function getAllMiembrosAcaucab() {
    return await sql`SELECT * FROM get_all_miembros_acaucab()`;
}

// Nuevas funciones para crear usuarios con diferentes tipos de entidades
export async function createUsuarioWithEntidad(
  email: string, 
  password: string, 
  tipoEntidad: 'empleado' | 'cliente_natural' | 'cliente_juridico' | 'miembro_acaucab',
  entidadId: string
) {
  try {
    console.log(`Creando usuario con ${tipoEntidad}:`, { email, tipoEntidad, entidadId })
    
    let result
    switch (tipoEntidad) {
      case 'empleado':
        if (!entidadId || isNaN(Number(entidadId))) {
          throw new Error("El ID de la entidad no es válido para empleado");
        }
        result = await sql`SELECT * FROM create_usuario_with_empleado(${email}, ${password}, ${Number(entidadId)})`
        break
      case 'cliente_natural':
        if (!entidadId || isNaN(Number(entidadId))) {
          throw new Error("El ID de la entidad no es válido para cliente_natural");
        }
        result = await sql`SELECT * FROM create_usuario_with_cliente_natural(${email}, ${password}, ${Number(entidadId)})`
        break
      case 'cliente_juridico':
        if (!entidadId || isNaN(Number(entidadId))) {
          throw new Error("El ID de la entidad no es válido para cliente_juridico");
        }
        result = await sql`SELECT * FROM create_usuario_with_cliente_juridico(${email}, ${password}, ${Number(entidadId)})`
        break
      case 'miembro_acaucab':
        if (!entidadId || isNaN(Number(entidadId))) {
          throw new Error("El ID de la entidad no es válido para miembro_acaucab");
        }
        result = await sql`SELECT * FROM create_usuario_with_miembro_acaucab(${email}, ${password}, ${Number(entidadId)})`
        break
      default:
        throw new Error(`Tipo de entidad no válido: ${tipoEntidad}`)
    }
    
    console.log(`Usuario creado con ${tipoEntidad}: ${result.length} registros`)
    return result[0]
  } catch (error) {
    console.error(`Error creating usuario with ${tipoEntidad}:`, error)
    throw error
  }
}

export async function updateUsuarioWithEntidad(
  id: string, 
  email: string, 
  password?: string, 
  tipoEntidad?: 'empleado' | 'cliente_natural' | 'cliente_juridico' | 'miembro_acaucab',
  entidadId?: string
) {
  try {
    console.log(`Actualizando usuario:`, { id, email, tipoEntidad, entidadId })
    
    // Usar la función unificada que no permite cambiar la entidad
    const result = await sql`SELECT * FROM update_usuario_with_entidad(${Number.parseInt(id)}, ${email}, ${password || null})`
    
    console.log(`Usuario actualizado: ${result.length} registros`)
    return result[0]
  } catch (error) {
    console.error("Error updating usuario:", error)
    throw error
  }
}

// Obtener todos los usuarios con información completa de todas las entidades
export async function getAllUsuariosComplete() {
  try {
    console.log("=== getAllUsuariosComplete ===")
    const result = await sql`SELECT * FROM get_all_usuarios_complete()`
    console.log(`Usuarios completos obtenidos: ${result.length}`)
    return result
  } catch (error) {
    console.error("Error en getAllUsuariosComplete:", error)
    throw error
  }
}

// Obtener un usuario específico por ID con cualquier tipo de entidad
export async function getUsuarioById(id: string) {
  try {
    console.log("=== getUsuarioById ===")
    console.log("ID recibido:", id)
    
    const userIdNum = parseInt(id);
    if (isNaN(userIdNum)) {
      throw new Error(`ID de usuario inválido: ${id}`);
    }
    
    const result = await sql`
      SELECT 
        u.usuario_id,
        u.nombre_usuario,
        u.fk_cliente_natural,
        u.fk_cliente_juridico,
        u.fk_miembro_acaucab,
        u.fk_empleado,
        -- Datos de empleado (solo columnas que existen)
        e.empleado_id,
        e.primer_nombre as emp_primer_nombre,
        e.segundo_nombre as emp_segundo_nombre,
        e.primer_apellido as emp_primer_apellido,
        e.segundo_apellido as emp_segundo_apellido,
        e.direccion as emp_direccion,
        -- Datos de cliente natural
        cn.cliente_id as cn_cliente_id,
        cn.primer_nombre as cn_primer_nombre,
        cn.segundo_nombre as cn_segundo_nombre,
        cn.primer_apellido as cn_primer_apellido,
        cn.segundo_apellido as cn_segundo_apellido,
        cn.direccion as cn_direccion,
        cn.total_puntos as cn_puntos,
        -- Datos de cliente jurídico
        cj.cliente_id as cj_cliente_id,
        cj.razon_social,
        cj.direccion as cj_direccion,
        cj.total_puntos as cj_puntos,
        -- Datos de miembro ACAUCAB
        ma.miembro_id,
        ma.razon_social as ma_razon_social,
        ma.direccion as ma_direccion
      FROM usuario u
      LEFT JOIN empleado e ON u.fk_empleado = e.empleado_id
      LEFT JOIN cliente_natural cn ON u.fk_cliente_natural = cn.cliente_id
      LEFT JOIN cliente_juridico cj ON u.fk_cliente_juridico = cj.cliente_id
      LEFT JOIN miembro_acaucab ma ON u.fk_miembro_acaucab = ma.miembro_id
      WHERE u.usuario_id = ${userIdNum}
    `;
    
    console.log(`Usuario encontrado: ${result.length} registros`)
    
    if (result.length === 0) {
      return null;
    }
    
    const user = result[0];
    
    // Determinar el tipo de entidad basándome en las claves foráneas
    let tipoEntidad = '';
    if (user.fk_empleado) {
      tipoEntidad = 'empleado';
    } else if (user.fk_cliente_natural) {
      tipoEntidad = 'cliente_natural';
    } else if (user.fk_cliente_juridico) {
      tipoEntidad = 'cliente_juridico';
    } else if (user.fk_miembro_acaucab) {
      tipoEntidad = 'miembro_acaucab';
    }
    
    // Construir el objeto de respuesta según el tipo de entidad
    const response: any = {
      id: user.usuario_id,
      email: user.nombre_usuario,
      tipo_entidad: tipoEntidad
    };
    
    // Agregar datos según el tipo de entidad
    if (tipoEntidad === 'empleado' && user.empleado_id) {
      response.empleado = {
        id: user.empleado_id,
        primer_nombre: user.emp_primer_nombre,
        segundo_nombre: user.emp_segundo_nombre,
        primer_apellido: user.emp_primer_apellido,
        segundo_apellido: user.emp_segundo_apellido,
        telefono: '', // Los teléfonos están en tabla separada TELEFONO
        direccion: user.emp_direccion,
        puntos: 0 // Los empleados no tienen puntos
      };
    } else if (tipoEntidad === 'cliente_natural' && user.cn_cliente_id) {
      response.cliente_natural = {
        id: user.cn_cliente_id,
        primer_nombre: user.cn_primer_nombre,
        segundo_nombre: user.cn_segundo_nombre,
        primer_apellido: user.cn_primer_apellido,
        segundo_apellido: user.cn_segundo_apellido,
        telefono: '', // Los teléfonos están en tabla separada TELEFONO
        direccion: user.cn_direccion,
        puntos: user.cn_puntos
      };
    } else if (tipoEntidad === 'cliente_juridico' && user.cj_cliente_id) {
      response.cliente_juridico = {
        id: user.cj_cliente_id,
        razon_social: user.razon_social,
        telefono: '', // Los teléfonos están en tabla separada TELEFONO
        direccion: user.cj_direccion,
        puntos: user.cj_puntos
      };
    } else if (tipoEntidad === 'miembro_acaucab' && user.miembro_id) {
      response.miembro_acaucab = {
        id: user.miembro_id,
        primer_nombre: '', // Los miembros ACAUCAB no tienen nombres individuales
        segundo_nombre: '',
        primer_apellido: '',
        segundo_apellido: '',
        telefono: '', // Los teléfonos están en tabla separada TELEFONO
        direccion: user.ma_direccion,
        puntos: 0 // Los miembros ACAUCAB no tienen puntos
      };
    }
    
    console.log("Usuario procesado:", response);
    return response;
  } catch (error) {
    console.error("Error en getUsuarioById:", error)
    throw error
  }
}

// Funciones para ventas online
export async function getVentasOnlineByUserId(userId: string) {
  try {
    console.log("=== getVentasOnlineByUserId ===")
    console.log("userId recibido:", userId)
    
    // Convertir userId a número
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      throw new Error(`userId inválido: ${userId}`);
    }
    
    const result = await sql`
      SELECT 
        vo.venta_online_id,
        vo.fecha_emision,
        vo.fecha_estimada,
        vo.fecha_entrega,
        vo.total,
        vo.direccion,
        COALESCE(e.nombre, 'Pendiente') as estado
      FROM VENTA_ONLINE vo
      LEFT JOIN ESTADO_VENTA_ONLINE evo ON vo.venta_online_id = evo.fk_venta_online
      LEFT JOIN ESTADO e ON evo.fk_estado = e.estado_id
      WHERE vo.fk_usuario = ${userIdNum}
      ORDER BY vo.fecha_emision DESC
    `;
    console.log(`Ventas online encontradas: ${result.length}`)
    return result
  } catch (error) {
    console.error("Error en getVentasOnlineByUserId:", error)
    throw error
  }
}

export async function getDetallesVentaOnline(ventaOnlineId: number) {
  try {
    console.log("=== getDetallesVentaOnline ===")
    const result = await sql`
      SELECT 
        dvo.detalle_venta_online_id,
        c.nombre as nombre_cerveza,
        CONCAT(p.cap_volumen, 'ml ', p.material) as presentacion,
        dvo.precio_unitario,
        dvo.cantidad,
        (dvo.precio_unitario * dvo.cantidad) as subtotal
      FROM DETALLE_VENTA_ONLINE dvo
      JOIN ALMACEN_CERVEZA ac ON dvo.fk_almacen_cerveza = ac.almacen_cerveza_id
      JOIN CERVEZA_PRESENTACION cp ON ac.fk_cerveza_presentacion = cp.cerveza_presentacion_id
      JOIN CERVEZA c ON cp.fk_cerveza = c.cerveza_id
      JOIN PRESENTACION p ON cp.fk_presentacion = p.presentacion_id
      WHERE dvo.fk_venta_online = ${ventaOnlineId}
    `;
    console.log(`Detalles encontrados: ${result.length}`)
    return result
  } catch (error) {
    console.error("Error en getDetallesVentaOnline:", error)
    throw error
  }
}

export async function createVentaOnline(userId: string, total: number, direccion: string) {
  try {
    console.log("=== createVentaOnline ===")
    console.log("Parámetros recibidos:", { userId, total, direccion })
    
    // Convertir userId a número
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      throw new Error(`userId inválido: ${userId}`);
    }
    
    // Obtener el lugar por defecto
    const lugarResult = await sql`SELECT lugar_id FROM LUGAR LIMIT 1`;
    const lugarId = lugarResult[0]?.lugar_id || 1;
    console.log("Lugar ID obtenido:", lugarId);

    // Calcular fecha estimada de entrega (3 días después)
    const fechaEstimada = new Date();
    fechaEstimada.setDate(fechaEstimada.getDate() + 3);
    const fechaEstimadaStr = fechaEstimada.toISOString().split('T')[0];
    console.log("Fecha estimada:", fechaEstimadaStr);

    console.log("Ejecutando INSERT con valores:", {
      direccion,
      fechaEstimada: fechaEstimadaStr,
      total: total * 100,
      lugarId,
      userIdNum
    });

    const result = await sql`
      INSERT INTO VENTA_ONLINE (
        direccion, 
        fecha_emision, 
        fecha_estimada, 
        total, 
        fk_lugar, 
        fk_usuario
      ) VALUES (
        ${direccion},
        CURRENT_DATE,
        ${fechaEstimadaStr},
        ${total * 100}, -- Convertir a centavos
        ${lugarId},
        ${userIdNum}
      ) RETURNING venta_online_id
    `;
    
    const ventaId = result[0]?.venta_online_id;
    console.log("Venta creada con ID:", ventaId);
    return ventaId;
  } catch (error) {
    console.error("Error en createVentaOnline:", error)
    throw error
  }
}

export async function createDetalleVentaOnline(ventaOnlineId: number, almacenCervezaId: number, precioUnitario: number, cantidad: number) {
  try {
    console.log("=== createDetalleVentaOnline ===")
    const result = await sql`
      INSERT INTO DETALLE_VENTA_ONLINE (
        fk_almacen_cerveza,
        fk_venta_online,
        precio_unitario,
        cantidad
      ) VALUES (
        ${almacenCervezaId},
        ${ventaOnlineId},
        ${precioUnitario * 100}, -- Convertir a centavos
        ${cantidad}
      )
    `;
    console.log("Detalle de venta creado");
    return result;
  } catch (error) {
    console.error("Error en createDetalleVentaOnline:", error)
    throw error
  }
}

export async function createEstadoVentaOnline(ventaOnlineId: number) {
  try {
    console.log("=== createEstadoVentaOnline ===")
    
    // Buscar estado "Pendiente"
    const estadoResult = await sql`SELECT estado_id FROM ESTADO WHERE nombre = 'Pendiente' LIMIT 1`;
    const estadoId = estadoResult[0]?.estado_id || 1;

    const result = await sql`
      INSERT INTO ESTADO_VENTA_ONLINE (
        fecha_inicio,
        fk_estado,
        fk_venta_online
      ) VALUES (
        CURRENT_DATE,
        ${estadoId},
        ${ventaOnlineId}
      )
    `;
    console.log("Estado de venta creado");
    return result;
  } catch (error) {
    console.error("Error en createEstadoVentaOnline:", error)
    throw error
  }
}

export async function findAlmacenCervezaByProductName(productName: string) {
  try {
    console.log("=== findAlmacenCervezaByProductName ===")
    const result = await sql`
      SELECT ac.almacen_cerveza_id
      FROM ALMACEN_CERVEZA ac
      JOIN CERVEZA_PRESENTACION cp ON ac.fk_cerveza_presentacion = cp.cerveza_presentacion_id
      JOIN CERVEZA c ON cp.fk_cerveza = c.cerveza_id
      WHERE c.nombre ILIKE ${'%' + productName.split(' ')[0] + '%'}
      LIMIT 1
    `;
    console.log("Almacen cerveza encontrado:", result[0]?.almacen_cerveza_id);
    return result[0]?.almacen_cerveza_id;
  } catch (error) {
    console.error("Error en findAlmacenCervezaByProductName:", error)
    throw error
  }
}