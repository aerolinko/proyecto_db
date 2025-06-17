import postgres from 'postgres';


const sql = postgres({
    host: 'localhost',
    port: 5432,
    database: 'base_prueba',
    username: 'postgres',
    password: 'root',
});


/*const sql = postgres({
    host: 'labs-dbservices01.ucab.edu.ve',
    port: 5432,
    database: 'joropeza',
    username: 'joropeza',
    password: '30330791',
}); */


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

export async function getAllLugaresUserCesar() {
    return await sql`SELECT * FROM LUGAR l,CLIENTE_NATURAL c where l.lugar_id=c.fk_lugar`;
}

export async function getUser(nombre:string,pass:string) {
    return await sql`SELECT * FROM obtenerUsuario(${nombre},${pass})`;
}

export async function getUserPermissions(id:number) {
    return await sql`SELECT * FROM obtenerPermisosUsuario(${id})`;
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
