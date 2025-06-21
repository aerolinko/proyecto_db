'use server'

import { NextResponse } from "next/server";
import {getAllRoles, getAllRolesPermisos, saveRole, updateRole, deleteRole, saveRolesUsuario} from "@/db";

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
    const url = new URL(request.url);
    const params = url.searchParams;
    let roladd = params.get('user');

    if(!roladd){
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
    }else {
        try{
            const { selectedUser, selectedRole } = await request.json();
            // Dummy authentication; replace with your actual logic
            const res = await saveRolesUsuario(selectedUser.id,selectedRole);
            if(res) {
                return NextResponse.json({ res }, { status: 200 });
            }
            return NextResponse.json({ error: 'Invalid User-Role Parameters' }, { status: 401 });
        }
        catch(err){
            console.error('Error during creation:', err);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    }

}

export async function PUT(request: Request) {
    // Parse the incoming JSON payload
    try{
        const { rol_id,nuevo_nombre, nueva_descripcion } = await request.json();
        // Dummy authentication; replace with your actual logic
        const res = await updateRole(rol_id,nuevo_nombre,nueva_descripcion);
        if(res) {
            return NextResponse.json({ res }, { status: 200 });
        }
            return NextResponse.json({ error: 'Invalid Role Parameters' }, { status: 401 });
    }
    catch(err){
        console.error('Error during edition:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    // Parse the incoming JSON payload
    try{
        const url = new URL(request.url);
        const params = url.searchParams;
        const id = params.get('rol_id');
        // @ts-ignore
        const res = await deleteRole(id);
        if(res) {
            return NextResponse.json({ res }, { status: 200 });
        }
        return NextResponse.json({ error: 'Invalid Role Parameters' }, { status: 401 });
    }
    catch(err){
        console.error('Error during deletion:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}