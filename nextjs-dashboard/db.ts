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
    
    // Usar el stored procedure
    const result = await sql`SELECT * FROM get_usuario_by_id_complete(${userIdNum})`;
    
    console.log(`Usuario encontrado: ${result.length} registros`)
    
    if (result.length === 0) {
      return null;
    }
    
    const user = result[0];
    
    // Construir el objeto de respuesta según el tipo de entidad
    const response: any = {
      id: user.usuario_id,
      email: user.nombre_usuario,
      tipo_entidad: user.tipo_entidad
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

    const result = await sql`SELECT create_venta_online(${userIdNum}, ${total * 100}, ${direccion})`;
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