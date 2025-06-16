'use server'

import { NextResponse } from "next/server";
import { getAllRoles, getAllRolesPermisos, getUser, saveRole} from "@/db";

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
        // @ts-ignore
        result = await getAllRolesPermisos(parseInt(params.get('permisos-rol')));
        if (!result) {
            return NextResponse.json({ error: "No hay permisos para ese rol" }, { status: 404 });
        }
    }

    return NextResponse.json({ result, status: 200 });
}

export async function POST(request: Request) {
    // Parse the incoming JSON payload
    try{
        const { nombre, descripcion } = await request.json();
        // Dummy authentication; replace with your actual logic
        const res = await saveRole(nombre,descripcion);
        if(res) {
            return NextResponse.json({ res }, { status: 200 });
        }
        return NextResponse.json({ error: 'Invalid Role Parameters' }, { status: 401 });
    }
    catch(err){
        console.error('Error during creation:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}