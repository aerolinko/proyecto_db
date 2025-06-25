'use server'

import { NextResponse } from "next/server";
import {saveVenta, getTasaDolar} from "@/db";

export async function POST(request: Request) {
    // Parse the incoming JSON payload
    try{
        const {paymentMethods, cart, foundClientId} = await request.json();
        // Dummy authentication; replace with your actual logic
        const montoTotal = cart.reduce((sum:any, item:any) => sum + (item.price * item.quantity), 0);
        console.log(JSON.stringify(cart));
        // @ts-ignore
        const convertedPayments = paymentMethods.map((element )=> {
            console.log(element);
            if(element.tipo == 'dolares'){
                element.tipo = 'efectivo';
            }
        })
        console.log(convertedPayments);

        const res = await saveVenta(montoTotal,foundClientId.cliente_id,foundClientId.tipo,cart,paymentMethods);

        if(res) {

            return NextResponse.json({ res }, { status: 200 });
        }
        return NextResponse.json({ error: 'Venta Fallida' }, { status: 401 });
    }
    catch(err){
        console.error('Error during buy:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


export async function GET(request: Request) {
    // Parse the incoming JSON payload
    try{
        const res = await getTasaDolar();
        if(res) {

            return NextResponse.json({ res }, { status: 200 });
        }
        return NextResponse.json({ error: 'Obtener tasa fallida' }, { status: 401 });
    }
    catch(err){
        console.error('Error during buy:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}