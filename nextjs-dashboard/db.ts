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
    connection: { options: '-c search_path=schema_name_2' }
    // Or set it after connecting:
    // await sql`SET search_path TO schema_name`;
});




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
    return await sql`SELECT * FROM obtenerUsuarioCompleto(${nombre},${pass})`;
}

export async function saveNewCard(cliente_tipo:string,id:number,tipo:string,numero:number,fechaExp:Date|null,banco:string) {
    return await sql`call insertarnuevatarjetacliente(${cliente_tipo},${id},${tipo},${numero},${fechaExp},${banco})`;
}

export async function getUserPermissions(id:number) {
    return await sql`SELECT * FROM obtenerPermisosUsuarioCompleto(${id})`;
}

export async function getUserPermissionsSimple(id:number) {
    return await sql`SELECT * FROM obtenerPermisosUsuario(${id})`;
}

export async function debugUserPermissions(id:number) {
    console.log(`=== DEBUG: Verificando permisos para usuario ${id} ===`);
    
    // Verificar si el usuario existe
    const userExists = await sql`SELECT usuario_id FROM usuario WHERE usuario_id = ${id}`;
    console.log('¿Usuario existe?', userExists.length > 0);
    
    // Verificar roles del usuario
    const userRoles = await sql`SELECT r.nombre as rol_nombre, r.rol_id 
                               FROM ROL_USUARIO ru 
                               JOIN ROL r ON ru.fk_rol = r.rol_id 
                               WHERE ru.fk_usuario = ${id}`;
    console.log('Roles del usuario:', userRoles);
    
    // Verificar permisos de cada rol
    for (const role of userRoles) {
        const rolePermissions = await sql`SELECT p.descripcion, p.permiso_id 
                                        FROM ROL_PERMISO rp 
                                        JOIN PERMISO p ON rp.fk_permiso = p.permiso_id 
                                        WHERE rp.fk_rol = ${role.rol_id}`;
        console.log(`Permisos del rol "${role.rol_nombre}":`, rolePermissions);
    }
    
    // Obtener permisos finales
    const finalPermissions = await sql`SELECT * FROM obtenerPermisosUsuario(${id})`;
    console.log('Permisos finales devueltos:', finalPermissions);
    console.log('=== FIN DEBUG ===');
    
    return finalPermissions;
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
        const result = await sql`SELECT * FROM get_empleados()`
        console.log(`Empleados obtenidos: ${result.length} registros`)
        return result
    } catch (error) {
        console.error("Error en getEmpleados:", error)
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
  try {
    console.log("=== getStockAlmacen ===")
    const result = await sql`SELECT * FROM get_stock_almacen()`;
    console.log(`Stock almacén obtenido: ${result.length} registros`);
    return result;
  } catch (error) {
    console.error("Error en getStockAlmacen:", error)
    throw error
  }
}

export async function getStockAnaquel() {
  try {
    console.log("=== getStockAnaquel ===")
    const result = await sql`SELECT * FROM get_stock_anaquel()`;
    console.log(`Stock anaquel obtenido: ${result.length} registros`);
    return result;
  } catch (error) {
    console.error("Error en getStockAnaquel:", error)
    throw error
  }
}

export async function getStockGeneral() {
  try {
    console.log("=== getStockGeneral ===")
    const result = await sql`SELECT * FROM get_stock_general()`;
    console.log(`Stock general obtenido: ${result.length} registros`);
    return result;
  } catch (error) {
    console.error("Error en getStockGeneral:", error)
    throw error
  }
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
  try {
    console.log("=== getClientesNaturalesSinUsuario ===")
    const result = await sql`SELECT * FROM get_clientes_naturales_sin_usuario()`;
    console.log(`Clientes naturales sin usuario obtenidos: ${result.length}`)
    return result
  } catch (error) {
    console.error("Error en getClientesNaturalesSinUsuario:", error)
    throw error
  }
}

export async function getMiembrosAcaucabSinUsuario() {
  try {
    console.log("=== getMiembrosAcaucabSinUsuario ===")
    const result = await sql`SELECT * FROM get_miembros_acaucab_sin_usuario()`;
    console.log(`Miembros ACAUCAB sin usuario obtenidos: ${result.length}`)
    return result
  } catch (error) {
    console.error("Error en getMiembrosAcaucabSinUsuario:", error)
    throw error
  }
}

// Funciones para obtener TODAS las entidades (para debugging)
export async function getAllClientesNaturales() {
  try {
    console.log("=== getAllClientesNaturales ===")
    const result = await sql`SELECT * FROM get_all_clientes_naturales()`;
    console.log(`Todos los clientes naturales obtenidos: ${result.length}`)
    return result
  } catch (error) {
    console.error("Error en getAllClientesNaturales:", error)
    throw error
  }
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
    
    // Usar el stored procedure para obtener datos del usuario
    const result = await sql`SELECT * FROM get_usuario_by_id_complete(${userIdNum})`;
    
    console.log(`Usuario encontrado: ${result.length} registros`)
    
    if (result.length === 0) {
      return null;
    }
    
    const user = result[0];
    
    // Obtener permisos del usuario (nombre correcto de la función)
    const permisosResult = await sql`SELECT * FROM obtenerPermisosUsuarioCompleto(${userIdNum})`;
    const permisos = permisosResult.map((p: any) => ({
      permiso_id: p.permiso_id,
      descripcion: p.descripcion
    }));
    
    // Construir el objeto de respuesta según el tipo de entidad
    const response: any = {
      usuario_id: user.usuario_id,
      email: user.nombre_usuario,
      tipo_entidad: user.tipo_entidad,
      permisos: permisos
    };
    
    // Agregar datos según el tipo de entidad
    if (user.tipo_entidad === 'empleado' && user.empleado_id) {
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
    } else if (user.tipo_entidad === 'cliente_natural' && user.cn_cliente_id) {
      response.cliente_natural = {
        id: user.cn_cliente_id,
        primer_nombre: user.cn_primer_nombre,
        segundo_nombre: user.cn_segundo_nombre,
        primer_apellido: user.cn_primer_apellido,
        segundo_apellido: user.cn_segundo_apellido,
        telefono: '', // Los teléfonos están en tabla separada TELEFONO
        direccion: user.cn_direccion,
        puntos: user.cn_total_puntos
      };
    } else if (user.tipo_entidad === 'cliente_juridico' && user.cj_cliente_id) {
      response.cliente_juridico = {
        id: user.cj_cliente_id,
        razon_social: user.cj_razon_social,
        telefono: '', // Los teléfonos están en tabla separada TELEFONO
        direccion: user.cj_direccion,
        puntos: user.cj_total_puntos
      };
    } else if (user.tipo_entidad === 'miembro_acaucab' && user.ma_miembro_id) {
      response.miembro_acaucab = {
        id: user.ma_miembro_id,
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
    
    const result = await sql`SELECT * FROM get_ventas_online_by_user_id(${userIdNum})`;
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
    const result = await sql`SELECT * FROM get_detalles_venta_online(${ventaOnlineId})`;
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

    const result = await sql`SELECT create_venta_online(${userIdNum}, ${Math.round(total) * 100}, ${direccion})`;
    const ventaId = result[0]?.create_venta_online;
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
    await sql`SELECT create_detalle_venta_online(${ventaOnlineId}, ${almacenCervezaId}, ${precioUnitario * 100}, ${cantidad})`;
    console.log("Detalle de venta creado");
  } catch (error) {
    console.error("Error en createDetalleVentaOnline:", error)
    throw error
  }
}

export async function createEstadoVentaOnline(ventaOnlineId: number) {
  try {
    console.log("=== createEstadoVentaOnline ===")
    await sql`SELECT create_estado_venta_online(${ventaOnlineId})`;
    console.log("Estado de venta creado");
  } catch (error) {
    console.error("Error en createEstadoVentaOnline:", error)
    throw error
  }
}

export async function findAlmacenCervezaByProductName(productName: string) {
  try {
    console.log("=== findAlmacenCervezaByProductName ===")
    const result = await sql`SELECT find_almacen_cerveza_by_product_name(${productName})`;
    const almacenId = result[0]?.find_almacen_cerveza_by_product_name;
    console.log("Almacen cerveza encontrado:", almacenId);
    return almacenId;
  } catch (error) {
    console.error("Error en findAlmacenCervezaByProductName:", error)
    throw error
  }
}

// ===== FUNCIONES PARA INDICADORES DE CLIENTES =====

// Obtener número de clientes nuevos vs recurrentes en un período
export async function getClientesNuevosVsRecurrentes(fechaInicio?: string, fechaFin?: string) {
  try {
    console.log("=== getClientesNuevosVsRecurrentes ===")
    console.log("Parámetros:", { fechaInicio, fechaFin })

    const result = await sql`SELECT * FROM get_clientes_nuevos_vs_recurrentes(${fechaInicio || null}, ${fechaFin || null})`;
    console.log(`Indicadores de clientes nuevos vs recurrentes obtenidos:`, result[0]);
    return result[0];
  } catch (error) {
    console.error("Error en getClientesNuevosVsRecurrentes:", error);
    throw error;
  }
}

// Obtener tasa de retención de clientes en un período
export async function getTasaRetencionClientes(fechaInicio?: string, fechaFin?: string) {
  try {
    console.log("=== getTasaRetencionClientes ===")
    console.log("Parámetros:", { fechaInicio, fechaFin })

    const result = await sql`SELECT * FROM get_tasa_retencion_clientes(${fechaInicio || null}, ${fechaFin || null})`;
    console.log(`Tasa de retención de clientes obtenida:`, result[0]);
    return result[0];
  } catch (error) {
    console.error("Error en getTasaRetencionClientes:", error);
    throw error;
  }
}

// Obtener todos los indicadores de clientes en una sola función
export async function getIndicadoresClientes(fechaInicio?: string, fechaFin?: string) {
  try {
    console.log("=== getIndicadoresClientes ===")
    console.log("Parámetros:", { fechaInicio, fechaFin })

    const [clientesNuevosVsRecurrentes, tasaRetencion] = await Promise.all([
      getClientesNuevosVsRecurrentes(fechaInicio, fechaFin),
      getTasaRetencionClientes(fechaInicio, fechaFin)
    ]);

    const indicadores = {
      clientes_nuevos_vs_recurrentes: clientesNuevosVsRecurrentes,
      tasa_retencion: tasaRetencion,
      periodo: {
        fecha_inicio: fechaInicio || 'Últimos 30 días',
        fecha_fin: fechaFin || 'Hoy'
      }
    };

    console.log("Indicadores de clientes completos:", indicadores);
    return indicadores;
  } catch (error) {
    console.error("Error en getIndicadoresClientes:", error);
    throw error;
  }
}

// ===== FUNCIONES PARA GESTIÓN DE EVENTOS =====

// Obtener todos los eventos con información completa
export async function getAllEventos() {
  try {
    console.log("=== getAllEventos ===")
    const result = await sql`SELECT * FROM obtenerEventosCompletos()`;
    console.log(`Eventos obtenidos: ${result.length} registros`);
    return result;
  } catch (error) {
    console.error("Error en getAllEventos:", error);
    throw error;
  }
}
// ===== FUNCIONES PARA INDICADORES DE VENTAS =====
export async function getIndicadoresVentas(fechaInicio?: string, fechaFin?: string) {
  try {
    const result = fechaInicio || fechaFin
      ? await sql`SELECT obtener_indicadores_ventas(${fechaInicio || null}, ${fechaFin || null}) as resultado`
      : await sql`SELECT obtener_indicadores_ventas() as resultado`;
    return result[0]?.resultado;
  } catch (error) {
    console.error("Error en getIndicadoresVentas:", error);
    throw error;
  }
}

// Obtener un evento específico por ID
export async function getEventoById(eventoId: number) {
  try {
    console.log("=== getEventoById ===")
    const result = await sql`
      SELECT 
        e.*,
        te.nombre as tipo_evento_nombre,
        l.nombre as lugar_nombre
      FROM EVENTO e
      LEFT JOIN TIPO_EVENTO te ON e.fk_tipo_evento = te.tipo_evento_id
      LEFT JOIN LUGAR l ON e.fk_lugar = l.lugar_id
      WHERE e.evento_id = ${eventoId}
    `;
    console.log(`Evento obtenido: ${result.length} registros`);
    return result[0];
  } catch (error) {
    console.error("Error en getEventoById:", error);
    throw error;
  }
}

// Crear un nuevo evento
export async function createEvento(eventoData: {
  nombre: string;
  capacidad: number;
  direccion: string;
  entrada_paga: boolean;
  fecha_inicio: string;
  fecha_fin: string;
  estacionamiento: boolean;
  numero_entradas: number;
  precio_entradas?: number;
  fk_tipo_evento: number;
  fk_lugar: number;
}) {
  try {
    console.log("=== createEvento ===")
    const result = await sql`SELECT crearEvento(
      ${eventoData.nombre},
      ${eventoData.capacidad},
      ${eventoData.direccion},
      ${eventoData.entrada_paga},
      ${eventoData.fecha_inicio},
      ${eventoData.fecha_fin},
      ${eventoData.estacionamiento},
      ${eventoData.numero_entradas},
      ${eventoData.precio_entradas || null},
      ${eventoData.fk_tipo_evento},
      ${eventoData.fk_lugar}
    )`;
    const eventoId = result[0]?.crearevento;
    console.log("Evento creado con ID:", eventoId);
    return eventoId;
  } catch (error) {
    console.error("Error en createEvento:", error);
    throw error;
  }
}

// Actualizar un evento existente
export async function updateEvento(eventoId: number, eventoData: {
  nombre: string;
  capacidad: number;
  direccion: string;
  entrada_paga: boolean;
  fecha_inicio: string;
  fecha_fin: string;
  estacionamiento: boolean;
  numero_entradas: number;
  precio_entradas?: number;
  fk_tipo_evento: number;
  fk_lugar: number;
}) {
  try {
    console.log("=== updateEvento ===")
    const result = await sql`SELECT actualizarEvento(
      ${eventoId},
      ${eventoData.nombre},
      ${eventoData.capacidad},
      ${eventoData.direccion},
      ${eventoData.entrada_paga},
      ${eventoData.fecha_inicio},
      ${eventoData.fecha_fin},
      ${eventoData.estacionamiento},
      ${eventoData.numero_entradas},
      ${eventoData.precio_entradas || null},
      ${eventoData.fk_tipo_evento},
      ${eventoData.fk_lugar}
    )`;
    console.log("Evento actualizado:", result[0]?.actualizarevento);
    return result[0]?.actualizarevento;
  } catch (error) {
    console.error("Error en updateEvento:", error);
    throw error;
  }
}

// Eliminar un evento
export async function deleteEvento(eventoId: number) {
  try {
    console.log("=== deleteEvento ===")
    const result = await sql`SELECT eliminarEvento(${eventoId})`;
    console.log("Evento eliminado:", result[0]?.eliminarevento);
    return result[0]?.eliminarevento;
  } catch (error) {
    console.error("Error en deleteEvento:", error);
    throw error;
  }
}

// Obtener proveedores de un evento
export async function getProveedoresEvento(eventoId: number) {
  try {
    console.log("=== getProveedoresEvento ===")
    const result = await sql`SELECT * FROM obtenerProveedoresEvento(${eventoId})`;
    console.log(`Proveedores obtenidos: ${result.length} registros`);
    return result;
  } catch (error) {
    console.error("Error en getProveedoresEvento:", error);
    throw error;
  }
}

// Obtener productos de un evento
export async function getProductosEvento(eventoId: number) {
  try {
    console.log("=== getProductosEvento ===")
    const result = await sql`SELECT * FROM obtenerProductosEvento(${eventoId})`;
    console.log(`Productos obtenidos: ${result.length} registros`);
    return result;
  } catch (error) {
    console.error("Error en getProductosEvento:", error);
    throw error;
  }
}

// Obtener catálogo completo de cervezas de un evento
export async function getCatalogoCervezasEvento(eventoId: number) {
  try {
    console.log("=== getCatalogoCervezasEvento ===")
    const result = await sql`SELECT * FROM obtenerCatalogoCervezasEvento(${eventoId})`;
    console.log(`Catálogo de cervezas obtenido: ${result.length} registros`);
    return result;
  } catch (error) {
    console.error("Error en getCatalogoCervezasEvento:", error);
    throw error;
  }
}

// Agregar proveedor a evento
export async function agregarProveedorEvento(eventoId: number, miembroId: number, cervezaPresentacionId: number, cantidad: number) {
  try {
    console.log("=== agregarProveedorEvento ===")
    const result = await sql`SELECT agregarProveedorEvento(${eventoId}, ${miembroId}, ${cervezaPresentacionId}, ${cantidad})`;
    const registroId = result[0]?.agregarproveedorevento;
    console.log("Proveedor agregado con ID:", registroId);
    return registroId;
  } catch (error) {
    console.error("Error en agregarProveedorEvento:", error);
    throw error;
  }
}

// Remover proveedor de evento
export async function removerProveedorEvento(eventoMiembroAcaucabId: number) {
  try {
    console.log("=== removerProveedorEvento ===")
    const result = await sql`SELECT removerProveedorEvento(${eventoMiembroAcaucabId})`;
    console.log("Proveedor removido:", result[0]?.removerproveedorevento);
    return result[0]?.removerproveedorevento;
  } catch (error) {
    console.error("Error en removerProveedorEvento:", error);
    throw error;
  }
}

// Obtener empleados de un evento
export async function getEmpleadosEvento(eventoId: number) {
  try {
    console.log("=== getEmpleadosEvento ===")
    const result = await sql`SELECT * FROM obtenerEmpleadosEvento(${eventoId})`;
    console.log(`Empleados obtenidos: ${result.length} registros`);
    return result;
  } catch (error) {
    console.error("Error en getEmpleadosEvento:", error);
    throw error;
  }
}

// Asignar empleado a evento
export async function asignarEmpleadoEvento(eventoId: number, empleadoId: number) {
  try {
    console.log("=== asignarEmpleadoEvento ===")
    const result = await sql`SELECT asignarEmpleadoEvento(${eventoId}, ${empleadoId})`;
    const registroId = result[0]?.asignarempleadoevento;
    console.log("Empleado asignado con ID:", registroId);
    return registroId;
  } catch (error) {
    console.error("Error en asignarEmpleadoEvento:", error);
    throw error;
  }
}

// Remover empleado de evento
export async function removerEmpleadoEvento(eventoEmpleadoId: number) {
  try {
    console.log("=== removerEmpleadoEvento ===")
    const result = await sql`SELECT removerEmpleadoEvento(${eventoEmpleadoId})`;
    console.log("Empleado removido:", result[0]?.removerempleadoevento);
    return result[0]?.removerempleadoevento;
  } catch (error) {
    console.error("Error en removerEmpleadoEvento:", error);
    throw error;
  }
}

// Obtener ventas de un evento
export async function getVentasEvento(eventoId: number) {
  try {
    console.log("=== getVentasEvento ===")
    const result = await sql`SELECT * FROM obtenerVentasEvento(${eventoId})`;
    console.log(`Ventas obtenidas: ${result.length} registros`);
    return result;
  } catch (error) {
    console.error("Error en getVentasEvento:", error);
    throw error;
  }
}

// Obtener estadísticas de un evento
export async function getEstadisticasEvento(eventoId: number) {
  try {
    console.log("=== getEstadisticasEvento ===")
    const result = await sql`SELECT * FROM obtenerEstadisticasEvento(${eventoId})`;
    console.log(`Estadísticas obtenidas: ${result.length} registros`);
    return result[0];
  } catch (error) {
    console.error("Error en getEstadisticasEvento:", error);
    throw error;
  }
}

// Buscar eventos
export async function buscarEventos(busqueda: string) {
  try {
    console.log("=== buscarEventos ===")
    const result = await sql`SELECT * FROM buscarEventos(${busqueda})`;
    console.log(`Eventos encontrados: ${result.length} registros`);
    return result;
  } catch (error) {
    console.error("Error en buscarEventos:", error);
    throw error;
  }
}

// Obtener eventos por fechas
export async function getEventosPorFechas(fechaInicio: string, fechaFin: string) {
  try {
    console.log("=== getEventosPorFechas ===")
    const result = await sql`SELECT * FROM obtenerEventosPorFechas(${fechaInicio}, ${fechaFin})`;
    console.log(`Eventos encontrados: ${result.length} registros`);
    return result;
  } catch (error) {
    console.error("Error en getEventosPorFechas:", error);
    throw error;
  }
}

// Obtener todos los tipos de evento
export async function getTiposEvento() {
  try {
    console.log("=== getTiposEvento ===")
    const result = await sql`SELECT * FROM TIPO_EVENTO ORDER BY nombre`;
    console.log(`Tipos de evento obtenidos: ${result.length} registros`);
    return result;
  } catch (error) {
    console.error("Error en getTiposEvento:", error);
    throw error;
  }
}

// Obtener todos los lugares
export async function getLugares() {
  try {
    console.log("=== getLugares ===")
    const result = await sql`SELECT * FROM LUGAR ORDER BY nombre`;
    console.log(`Lugares obtenidos: ${result.length} registros`);
    return result;
  } catch (error) {
    console.error("Error en getLugares:", error);
    throw error;
  }
}

// Obtener todos los miembros ACAUCAB (proveedores)
export async function getMiembrosAcaucab() {
  try {
    console.log("=== getMiembrosAcaucab ===")
    const result = await sql`SELECT * FROM MIEMBRO_ACAUCAB ORDER BY denominacion_comercial`;
    console.log(`Miembros ACAUCAB obtenidos: ${result.length} registros`);
    return result;
  } catch (error) {
    console.error("Error en getMiembrosAcaucab:", error);
    throw error;
  }
}

// Obtener cervezas por proveedor
export async function getCervezasPorProveedor(miembroId: number) {
  try {
    console.log("=== getCervezasPorProveedor ===")
    const result = await sql`
      SELECT 
        cp.cerveza_presentacion_id,
        c.nombre as cerveza_nombre,
        p.material as presentacion_material,
        p.cap_volumen as presentacion_capacidad
      FROM CERVEZA_PRESENTACION cp
      JOIN CERVEZA c ON cp.fk_cerveza = c.cerveza_id
      JOIN PRESENTACION p ON cp.fk_presentacion = p.presentacion_id
      WHERE cp.fk_miembro_acaucab = ${miembroId}
      ORDER BY c.nombre
    `;
    console.log(`Cervezas obtenidas: ${result.length} registros`);
    return result;
  } catch (error) {
    console.error("Error en getCervezasPorProveedor:", error);
    throw error;
  }
}

export async function cleanClientRoles(userId: number) {
    console.log(`=== LIMPIANDO ROLES DE CLIENTE ===`);
    console.log(`Usuario ID: ${userId}`);
    
    // Verificar si es cliente
    const userInfo = await sql`
        SELECT 
            CASE 
                WHEN fk_cliente_natural IS NOT NULL THEN 'cliente_natural'
                WHEN fk_cliente_juridico IS NOT NULL THEN 'cliente_juridico'
                WHEN fk_miembro_acaucab IS NOT NULL THEN 'miembro_acaucab'
                ELSE 'no_cliente'
            END as tipo
        FROM usuario 
        WHERE usuario_id = ${userId}
    `;
    
    if (userInfo[0]?.tipo === 'no_cliente') {
        throw new Error('El usuario no es un cliente');
    }
    
    console.log(`Tipo de usuario: ${userInfo[0]?.tipo}`);
    
    // Eliminar todos los roles del cliente
    const deletedRoles = await sql`
        DELETE FROM ROL_USUARIO 
        WHERE fk_usuario = ${userId}
        RETURNING rol_usuario_id
    `;
    
    console.log(`Roles eliminados: ${deletedRoles.length}`);
    console.log('=== FIN LIMPIEZA ===');
    
    return deletedRoles;
}

export async function analyzeUserRoles(userId: number) {
    console.log(`=== ANALIZANDO ROLES DEL USUARIO ${userId} ===`);
    
    // Obtener roles del usuario con sus permisos
    const userRolesWithPermissions = await sql`
        SELECT 
            r.rol_id,
            r.nombre as rol_nombre,
            r.descripcion as rol_descripcion,
            p.permiso_id,
            p.descripcion as permiso_descripcion
        FROM ROL_USUARIO ru
        JOIN ROL r ON ru.fk_rol = r.rol_id
        JOIN ROL_PERMISO rp ON r.rol_id = rp.fk_rol
        JOIN PERMISO p ON rp.fk_permiso = p.permiso_id
        WHERE ru.fk_usuario = ${userId}
        ORDER BY r.nombre, p.descripcion
    `;
    
    // Agrupar por rol
    const rolesAnalysis: { [rol_nombre: string]: { rol_id: number, rol_descripcion: string, permisos: { permiso_id: number, descripcion: string }[] } } = {};
    userRolesWithPermissions.forEach((row: any) => {
        if (!rolesAnalysis[row.rol_nombre]) {
            rolesAnalysis[row.rol_nombre] = {
                rol_id: row.rol_id,
                rol_descripcion: row.rol_descripcion,
                permisos: []
            };
        }
        rolesAnalysis[row.rol_nombre].permisos.push({
            permiso_id: row.permiso_id,
            descripcion: row.permiso_descripcion
        });
    });
    
    console.log('Análisis de roles:', rolesAnalysis);
    console.log('=== FIN ANÁLISIS ===');
    
    return {
        totalRoles: Object.keys(rolesAnalysis).length,
        totalPermissions: userRolesWithPermissions.length,
        rolesAnalysis: rolesAnalysis
    };
}

// Exportar sql para uso directo en otros archivos
export { sql };
export async function getVentasTotalesPorTienda(fechaInicio?: string, fechaFin?: string) {
  return await sql`SELECT * FROM obtener_ventas_totales_por_tienda(${fechaInicio || null}, ${fechaFin || null})`;
}

export async function getCrecimientoVentas(fechaInicio?: string, fechaFin?: string) {
  return await sql`SELECT * FROM obtener_crecimiento_ventas(${fechaInicio || null}, ${fechaFin || null})`;
}

export async function getTicketPromedio(fechaInicio?: string, fechaFin?: string) {
  return await sql`SELECT * FROM obtener_ticket_promedio(${fechaInicio || null}, ${fechaFin || null})`;
}

export async function getVolumenUnidadesVendidas(fechaInicio?: string, fechaFin?: string) {
  return await sql`SELECT * FROM obtener_volumen_unidades_vendidas(${fechaInicio || null}, ${fechaFin || null})`;
}

export async function getVentasPorEstiloCerveza(fechaInicio?: string, fechaFin?: string) {
  try {
    console.log("=== getVentasPorEstiloCerveza ===")
    console.log("Parámetros:", { fechaInicio, fechaFin })

    let result
    if (fechaInicio && fechaFin) {
      result = await sql`SELECT obtener_ventas_por_estilo_cerveza(${fechaInicio}, ${fechaFin}) as resultado`
    } else {
      result = await sql`SELECT obtener_ventas_por_estilo_cerveza() as resultado`
    }

    console.log(`Ventas por estilo de cerveza obtenidas: ${result.length} registros`)
    return result[0]?.resultado || []
  } catch (error) {
    console.error("Error en getVentasPorEstiloCerveza:", error)
    throw error
  }
}

export async function getTendenciaVentas(fechaInicio?: string, fechaFin?: string) {
  try {
    console.log("=== getTendenciaVentas ===")
    console.log("Parámetros:", { fechaInicio, fechaFin })

    let result
    if (fechaInicio && fechaFin) {
      result = await sql`SELECT obtener_tendencia_ventas(${fechaInicio}, ${fechaFin}) as resultado`
    } else {
      result = await sql`SELECT obtener_tendencia_ventas() as resultado`
    }

    console.log(`Tendencia de ventas obtenida: ${result.length} registros`)
    return result[0]?.resultado || {}
  } catch (error) {
    console.error("Error en getTendenciaVentas:", error)
    throw error
  }
}
