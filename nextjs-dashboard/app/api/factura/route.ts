'use server'

import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { cart, paymentMethods, foundClientId, ventaId } = await request.json();
        
        console.log('Datos recibidos:', { cart, paymentMethods, foundClientId, ventaId });
        
        // Debug: Ver la estructura exacta del cliente
        console.log('🔍 Estructura del cliente:', JSON.stringify(foundClientId, null, 2));
        
        // Función para obtener el nombre completo del cliente según el tipo
        const getClienteNombre = (cliente: any) => {
            console.log('🔍 Procesando cliente para nombre:', cliente);
            console.log('🔍 Tipo de cliente:', cliente.tipo);
            console.log('🔍 Campos disponibles:', Object.keys(cliente));
            console.log('🔍 primer_nombre:', cliente.primer_nombre);
            console.log('🔍 primer_apellido:', cliente.primer_apellido);
            console.log('🔍 segundo_nombre:', cliente.segundo_nombre);
            console.log('🔍 segundo_apellido:', cliente.segundo_apellido);
            console.log('🔍 nombre (alias):', cliente.nombre);
            console.log('🔍 apellido (alias):', cliente.apellido);
            console.log('🔍 razon_social:', cliente.razon_social);
            
            if (cliente.tipo === 'natural') {
                // Para cliente natural: primer_nombre + segundo_nombre + primer_apellido + segundo_apellido (si existen)
                const primerNombre = cliente.primer_nombre || cliente.nombre || '';
                const segundoNombre = cliente.segundo_nombre || '';
                const primerApellido = cliente.primer_apellido || cliente.apellido || '';
                const segundoApellido = cliente.segundo_apellido || '';
                
                const nombreCompleto = [
                    primerNombre,
                    segundoNombre,
                    primerApellido,
                    segundoApellido
                ].filter(nombre => nombre).join(' ');
                
                console.log('🔍 Nombre completo natural:', nombreCompleto);
                return nombreCompleto.trim() || 'Cliente Natural';
            } else {
                // Para cliente jurídico: razon_social
                console.log('🔍 Nombre jurídico:', cliente.razon_social);
                return cliente.razon_social || 'Cliente Jurídico';
            }
        };

        // Función para obtener el documento del cliente
        const getClienteDocumento = (cliente: any) => {
            console.log('🔍 Procesando cliente para documento:', cliente);
            
            if (cliente.tipo === 'natural') {
                const documento = cliente.cedula || cliente.RIF || 'N/A';
                console.log('🔍 Documento natural:', documento);
                return documento;
            } else {
                const documento = cliente.RIF || 'N/A';
                console.log('🔍 Documento jurídico:', documento);
                return documento;
            }
        };
        
        // Preparar los datos para la factura
        const facturaData = {
            factura: {
                numero: ventaId || Math.floor(Math.random() * 1000000),
                fecha: new Date().toLocaleDateString('es-ES'),
                hora: new Date().toLocaleTimeString('es-ES')
            },
            cliente: {
                nombre: getClienteNombre(foundClientId),
                tipo_documento: foundClientId.tipo === 'natural' ? 'Cédula' : 'RIF',
                documento: getClienteDocumento(foundClientId)
            },
            productos: cart.map((item: any) => ({
                nombre: item.name,
                presentacion: item.presentation || 'N/A',
                cantidad: item.quantity,
                precio: item.price.toFixed(2),
                subtotal: (item.price * item.quantity).toFixed(2)
            })),
            metodos_pago: paymentMethods.map((method: any) => ({
                tipo: method.tipo.charAt(0).toUpperCase() + method.tipo.slice(1),
                cantidad: method.cantidad.toFixed(2),
                banco: method.banco || null,
                numero_cuenta: method.numero_cuenta || null,
                numero_cheque: method.numero_cheque || null,
                numero_tarjeta: method.numero_tarjeta || null
            })),
            total: cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0).toFixed(2)
        };
        
        console.log('🔍 Datos del cliente finales:', facturaData.cliente);
        console.log('Datos reales para jsreport:', JSON.stringify(facturaData, null, 2));

        // Llamar a jsreport para generar el PDF
        const jsreportUrl = 'http://localhost:5488/api/report';
        
        // Intentar primero con shortid, si falla usar el nombre
        const jsreportBody = {
            template: {
                name: 'Factura ACAUCAB'  // Volver al nombre original de tu plantilla
            },
            data: facturaData,
            options: {
                preview: false
            }
        };

        console.log('🔍 Nombre de la plantilla:', jsreportBody.template.name);
        console.log('URL jsreport:', jsreportUrl);
        console.log('Body jsreport:', JSON.stringify(jsreportBody, null, 2));

        const jsreportResponse = await fetch(jsreportUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from('admin:password').toString('base64')
            },
            body: JSON.stringify(jsreportBody)
        });

        console.log('Status jsreport:', jsreportResponse.status);
        console.log('Headers jsreport:', Object.fromEntries(jsreportResponse.headers.entries()));

        if (!jsreportResponse.ok) {
            const errorText = await jsreportResponse.text();
            console.error('Error response from jsreport:', errorText);
            throw new Error(`Error en jsreport: ${jsreportResponse.status} - ${errorText}`);
        }

        // Log exitoso
        console.log('✅ PDF generado exitosamente');
        console.log('📄 Tamaño del PDF:', jsreportResponse.headers.get('content-length'), 'bytes');

        const pdfBuffer = await jsreportResponse.arrayBuffer();
        
        // Devolver el PDF como respuesta
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="factura-${facturaData.factura.numero}.pdf"`
            }
        });

    } catch (error: any) {
        console.error('Error generando factura:', error);
        return NextResponse.json({ error: 'Error generando factura: ' + error.message }, { status: 500 });
    }
} 