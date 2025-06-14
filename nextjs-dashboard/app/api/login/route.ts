'use server'

import { NextResponse } from "next/server";
import { getUser } from "@/db";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";


export async function POST(request: Request) {
    // Parse the incoming JSON payload
    try{
    const { email, password } = await request.json();

    // Dummy authentication; replace with your actual logic
  const result = await getUser(email,password);
  const res = result[0];

    if(res) {

        const response = NextResponse.json({ res }, { status:200 });
        response.cookies.set("user", JSON.stringify(res), {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         maxAge: 60 * 60 * 24,
         path: '/',
        });
        return response;
    }
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    catch(err){
        console.error('Error during login:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function signOut() {
    (await cookies()).delete('user');
    console.log("Cookie borrada");
    redirect('/login');
}

