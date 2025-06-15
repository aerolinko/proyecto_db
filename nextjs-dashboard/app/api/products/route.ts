'use server'

import { NextResponse } from "next/server";
import { getAllProducts } from "@/db"; // This function queries the database server-side

export async function GET(request: Request) {
    const result = await getAllProducts();
    if (!result) {
        return NextResponse.json({ error: "No hay productos" }, { status: 404 });
    }

    return NextResponse.json({ result, status: 200 });
}