'use server'
import { NextResponse } from "next/server";
import {getAllPermisos} from "@/db";

export async function GET(request: Request) {
    const result = await getAllPermisos();
    if (!result) {
        return NextResponse.json({ error: "No hay permisos" }, { status: 404 });
    }
    return NextResponse.json({ result, status: 200 });
}
