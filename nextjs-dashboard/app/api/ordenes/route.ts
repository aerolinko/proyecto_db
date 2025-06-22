'use server'
import { NextResponse } from "next/server";
import {getOrdenesAlmacen, updateOrdenesAlmacen, getOrdenesAnaquel, updateOrdenesAnaquel} from "@/db";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const params = url.searchParams;
    let result;
    const tipo= params.get('almacen');
    const otroTipo= params.get('anaquel');
    if(tipo){
         result = await getOrdenesAlmacen();
        if (!result) {
            return NextResponse.json({ error: "No hay Cliente_Natural con esa cédula" }, { status: 404 });
        }

    }
    if(otroTipo){
         result = await getOrdenesAnaquel();
        if (!result) {
            return NextResponse.json({ error: "No hay Cliente_Natural con esa cédula" }, { status: 404 });
        }

    }
    return NextResponse.json({ result, status: 200 });
}

export async function POST(request: Request) {
    const url = new URL(request.url);
    const params = url.searchParams;
    let result;
    const tipo= params.get('almacen');
    const otroTipo= params.get('anaquel');
    const { id, cambio } = await request.json();
    if(tipo) {
        result = await updateOrdenesAlmacen(id, cambio);
        if (!result) {
            return NextResponse.json({error: "No hay Cliente_Natural con esa cédula"}, {status: 404});
        }
    }
    if(otroTipo) {
        result = await updateOrdenesAnaquel(id, cambio);
        if (!result) {
            return NextResponse.json({error: "No hay Cliente_Natural con esa cédula"}, {status: 404});
        }
    }
    return NextResponse.json({ result, status: 200 });
}

