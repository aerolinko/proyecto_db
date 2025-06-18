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



export default sql;
