'use server'

import { NextResponse } from "next/server";
import {getUser, getUserPermissions} from "@/db";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";

const filters=[
    {descripcion:'consultar VENTA_TIENDA'},
    {descripcion:'consultar ROL'},
    {descripcion:'consultar USUARIO' },
    {descripcion:'consultar REPORTES'},
    {descripcion:'eliminar VENTA_TIENDA'},
    {descripcion:'eliminar ROL'},
    {descripcion:'eliminar USUARIO' },
    {descripcion:'crear VENTA_TIENDA'},
    {descripcion:'crear ROL'},
    {descripcion:'crear USUARIO' },
    {descripcion:'modificar VENTA_TIENDA'},
    {descripcion:'modificar ROL'},
    {descripcion:'modificar USUARIO' },
    {descripcion:'modificar ROL_PERMISO' },
    {descripcion:'crear ROL_PERMISO' },
    {descripcion:'consultar ROL_PERMISO' },
    {descripcion:'consultar ROL_USUARIO' },
    {descripcion:'consultar ESTADO_REPOSICION_ANAQUEL' },
    {descripcion:'consultar ESTADO_COMPRA_REPOSICION' }]

export async function POST(request: Request) {
    // Parse the incoming JSON payload
    try{
    const { email, password } = await request.json();

    // Dummy authentication; replace with your actual logic
  const result = await getUser(email,password);
  const res = result[0];
    if(res) {

        const response = NextResponse.json({ res }, { status:200 });
        response.cookies.set("user", JSON.stringify(res), {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         maxAge: 60 * 60 * 24,
         path: '/',
        });
        let filteredLinks=filters;
        const permissions = await getUserPermissions(res.usuario_id);
        for (let i = 0; i < 12 ; i++) {
            if (!permissions.some((permission) => permission.descripcion == filters[i].descripcion)){
                filteredLinks=filteredLinks.filter((link) => link.descripcion !== filters[i].descripcion);
            }
        }
        response.cookies.set("permissions", JSON.stringify(filteredLinks), {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24,
            path: '/',
        });

        return response;
    }
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    catch(err){
        console.error('Error during login:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function signOut() {
    (await cookies()).delete('user');
    (await cookies()).delete('permissions');
    console.log("Cookies borradas");
    redirect('/login');
}

