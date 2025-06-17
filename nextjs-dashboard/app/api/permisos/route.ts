'use server'
import { NextResponse } from "next/server";
import {getAllPermisos, saveRole, saveRolePermissions} from "@/db";

export async function GET(request: Request) {
    const result = await getAllPermisos();
    if (!result) {
        return NextResponse.json({ error: "No hay permisos" }, { status: 404 });
    }
    return NextResponse.json({ result, status: 200 });
}

export async function POST(request: Request) {
    // Parse the incoming JSON payload
    try{
        const { selectedRole, selectedChecks } = await request.json();
        // Dummy authentication; replace with your actual logic
       const res = await saveRolePermissions(selectedRole, selectedChecks);
        if(res) {
            return NextResponse.json({ res }, { status: 200 });
        }
        return NextResponse.json({ error: 'Invalid Role Permission Parameters' }, { status: 401 });
    }
    catch(err){
        console.error('Error during creation:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
