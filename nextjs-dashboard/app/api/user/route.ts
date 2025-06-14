'use server'

import { NextResponse } from "next/server";
import { getUserPermissions } from "@/db"; // This function queries the database server-side

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId:any = searchParams.get("id");

    if (!userId) {
        return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const user = await getUserPermissions(userId);
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
}