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

export async function getAllLugaresUserCesar() {
    return await sql`SELECT * FROM LUGAR l,CLIENTE_NATURAL c where l.lugar_id=c.fk_lugar`;
}

export async function getUser(nombre:string,pass:string) {
    return await sql`SELECT * FROM CLIENTE_NATURAL c,USUARIO u where u.nombre_usuario=${nombre} AND
    u.hash_contrasena=${pass} AND c.cliente_id=u.fk_cliente_natural`;
}

export async function getUserPermissions(id:number) {
    return await sql`SELECT p.descripcion,p.permiso_id FROM USUARIO u, ROL_USUARIO ru, ROL r, ROL_PERMISO rp, PERMISO p  where 
    ru.fk_usuario=${id} AND r.rol_id=ru.fk_rol AND rp.fk_rol=r.rol_id AND rp.fk_permiso=p.permiso_id`;
}

export default sql;
