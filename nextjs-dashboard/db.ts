import postgres from 'postgres';
const sql = postgres({
    host: 'localhost',
    port: 5432,
    database: 'base_prueba',
    username: 'postgres',
    password: 'root',
});

export async function getAllLugares() {
    return await sql`SELECT * FROM LUGAR`;
}

export async function getAllPermisos() {
    return await sql`SELECT * FROM PERMISO where descripcion LIKE 'consultar%'`;
}

export async function saveRole(name: string, description: string) {
    return await sql`INSERT INTO ROL (nombre,descripcion) VALUES (${name},${description})`;
}

export async function updateRole(rol_id:number,name: string, description: string) {
    return await sql`UPDATE ROL SET descripcion=${description}, nombre=${name} where rol_id=${rol_id}`;
}

export async function deleteRole(rol_id:number) {
    return await sql`DELETE FROM ROL WHERE rol_id=${rol_id}`;
}

export async function getAllRoles() {
    return await sql`SELECT * FROM ROL`;
}

export async function getAllRolesPermisos(rol: number) {
    return await sql`SELECT * FROM PERMISO,ROL_PERMISO WHERE fk_rol=${rol} AND fk_permiso = permiso_id`;
}

export async function getAllLugaresUserCesar() {
    return await sql`SELECT * FROM LUGAR l,CLIENTE_NATURAL c where l.lugar_id=c.fk_lugar`;
}

export async function getUser(nombre:string,pass:string) {
    return await sql`SELECT e.cedula,e.primer_nombre,e.segundo_nombre,e.segundo_apellido,e.primer_apellido,
                            e.direccion, TO_CHAR(e.fecha_contrato, 'DD-MM-YYYY') as fecha_contrato, u.usuario_id, u.nombre_usuario, c.nombre
                     FROM DEPARTAMENTO_EMPLEADO de, CARGO c, EMPLEADO e,USUARIO u where u.nombre_usuario=${nombre} AND
                         u.hash_contrasena=${pass} AND e.empleado_id=u.fk_empleado AND e.empleado_id = de.fk_empleado AND  de.fk_cargo = c.cargo_id`;
}

export async function getUserPermissions(id:number) {
    return await sql`SELECT p.descripcion,p.permiso_id FROM ROL_USUARIO ru, ROL r, ROL_PERMISO rp, PERMISO p  where 
    ru.fk_usuario=${id} AND r.rol_id=ru.fk_rol AND rp.fk_rol=r.rol_id AND rp.fk_permiso=p.permiso_id`;
}

export async function getAllProducts() {
    return await sql`SELECT pc.cerveza_presentacion_id,c.nombre, p.cap_volumen,
                            CASE
                                WHEN ac.anaquel_cerveza_id IN(dvt.fk_anaquel_cerveza) then SUM(ac.cantidad-dvt.cantidad)
                                ELSE SUM(ac.cantidad)
                                END AS cantidad
                     FROM CERVEZA_PRESENTACION pc,CERVEZA c,PRESENTACION p, anaquel_cerveza ac, detalle_venta_tienda dvt
                     where pc.fk_cerveza=c.cerveza_id AND p.presentacion_id=pc.fk_presentacion AND pc.cerveza_presentacion_id=ac.fk_cerveza_presentacion
                     group by pc.cerveza_presentacion_id, c.nombre, p.cap_volumen, ac.anaquel_cerveza_id, dvt.fk_anaquel_cerveza`;
}

export default sql;
