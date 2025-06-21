'use server'
import { NextResponse } from "next/server";
import {getOrdenesAlmacen} from "@/db";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const params = url.searchParams;
    let result = await getOrdenesAlmacen();
    const tipo= params.get('almecen');
    if(tipo){
        if (!result) {
            return NextResponse.json({ error: "No hay Cliente_Natural con esa cédula" }, { status: 404 });
        }
    }else {

    }
    return NextResponse.json({ result, status: 200 });
}

