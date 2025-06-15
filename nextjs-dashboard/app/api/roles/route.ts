'use server'

import { NextResponse } from "next/server";
import {getAllPermisos, getAllProducts, getAllRoles, getAllRolesPermisos} from "@/db"; // This function queries the database server-side

export async function GET(request: Request) {
    const url = new URL(request.url);
    const params = url.searchParams;
    let result;
    if(params.get('roles')){
     result = await getAllRoles();
    if (!result) {
        return NextResponse.json({ error: "No hay roles" }, { status: 404 });
        }
    }
    else{
        result = await getAllRolesPermisos(parseInt(params.get('permisos-rol')));
        if (!result) {
            return NextResponse.json({ error: "No hay permisos para ese rol" }, { status: 404 });
        }
    }

    return NextResponse.json({ result, status: 200 });
}