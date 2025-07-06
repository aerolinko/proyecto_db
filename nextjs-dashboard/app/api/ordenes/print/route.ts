import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { orderId } = await request.json();
        
        console.log('🔄 Iniciando impresión de orden:', orderId);
        
        // Llamar a jsreport para generar el PDF usando el template de órdenes online
        const jsreportUrl = 'http://localhost:5488/api/report';
        
        const reportData = {
            template: {
                shortid: 'orden-online'
            },
            data: {
                factura: {
                    numero: orderId,
                    fecha: new Date().toLocaleDateString('es-ES'),
                    hora: new Date().toLocaleTimeString('es-ES')
                },
                estado: 'EN_PROCESO', // Por defecto, se puede modificar según el estado real
                cliente: {
                    nombre: 'Cliente Online',
                    documento: 'email@ejemplo.com',
                    telefono: 'N/A'
                },
                productos: [
                    {
                        nombre: 'Cerveza Ejemplo',
                        presentacion: '330',
                        cantidad: 1,
                        precio: '5.50',
                        subtotal: '5.50'
                    }
                ],
                metodos_pago: [
                    {
                        tipo: 'Online'
                    }
                ],
                total: '5.50',
                direccion_entrega: 'Dirección de ejemplo'
            },
            options: {
                preview: false
            }
        };

        console.log('📤 Enviando datos a jsreport:', reportData);

        const response = await fetch(jsreportUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reportData),
        });

        if (!response.ok) {
            console.error('❌ Error en jsreport:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('❌ Detalles del error:', errorText);
            return NextResponse.json(
                { error: `Error generando PDF: ${response.status}` },
                { status: 500 }
            );
        }

        const pdfBuffer = await response.arrayBuffer();
        console.log('✅ PDF generado exitosamente:', pdfBuffer.byteLength, 'bytes');

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="orden-${orderId}.pdf"`
            }
        });

    } catch (error) {
        console.error('❌ Error general:', error);
        return NextResponse.json(
            { error: `Error interno del servidor: ${error}` },
            { status: 500 }
        );
    }
} 