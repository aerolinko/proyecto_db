'use server'
import { NextResponse } from "next/server";
import { getNaturalClient } from "@/db";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const params = url.searchParams;
    let result;
    const ced= params.get('cedula')
    if(ced){
        result = await getNaturalClient(parseInt(ced));
        if (!result) {
            return NextResponse.json({ error: "No hay Cliente_Natural con esa cédula" }, { status: 404 });
        }
    }else {
        return NextResponse.json({ error:'No existe el cliente_natural', status: 418 });
    }
    return NextResponse.json({ result, status: 200 });
}

