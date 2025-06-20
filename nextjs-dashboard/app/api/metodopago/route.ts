import {saveNewCard, saveRolePermissions} from "@/db";
import {NextResponse} from "next/server";

export async function POST(request: Request) {
    // Parse the incoming JSON payload
    try{
        const url = new URL(request.url);
        const params = url.searchParams;
        const tipo= params.get('tipo');
        const id= parseInt(params.get('id'));
        const { newTarjeta } = await request.json();
        if(tipo=='natural'){
            const res = await saveNewCard('natural',id,newTarjeta.tipo,newTarjeta.numero,newTarjeta.fechaExp,newTarjeta.banco);
            if(res) {
                return NextResponse.json({ res }, { status: 200 });
            }
            return NextResponse.json({ error: 'Tarjeta Invalida' }, { status: 401 });
        }
        else{
            const res = await saveNewCard('juridico',id,newTarjeta.tipo,newTarjeta.numero,newTarjeta.fechaExp,newTarjeta.banco);
            if(res) {
                return NextResponse.json({ res }, { status: 200 });
            }
            return NextResponse.json({ error: 'Tarjeta Invalida' }, { status: 401 });
        }
    }
    catch(err){
        console.error('Error en creacion de tarjeta', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}