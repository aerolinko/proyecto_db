'use server'
import { NextResponse } from "next/server";
import {getNaturalClient, getLegalClient , getClientPaymentMethods} from "@/db";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const params = url.searchParams;
    let result;
    const ced= params.get('cedula');
    const rif= params.get('RIF');
    const id= params.get('ID');
    const tipo= params.get('tipo');
    if(ced){
        result = await getNaturalClient(parseInt(ced));
        if (!result) {
            return NextResponse.json({ error: "No hay Cliente_Natural con esa cédula" }, { status: 404 });
        }
    }else {
        if(rif){
            result = await getLegalClient(rif);
            if (!result) {
                return NextResponse.json({ error: "No hay Cliente_Juridico con ese RIF" }, { status: 404 });
            }
        }
        else{
            if (id) {
                result = await getClientPaymentMethods(parseInt(id),tipo);
                if (!result) {
                    return NextResponse.json({ error: "No hay Cliente" }, { status: 404 });
                }
            }
            else {
                return NextResponse.json({error: 'No existe el cliente', status: 418});
            }
        }
    }
    return NextResponse.json({ result, status: 200 });
}
