import { NextRequest, NextResponse } from 'next/server'
import { afiliarClienteDesdeLanding } from '@/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos requeridos
    const requiredFields = [
      'rif', 'cedula', 'primerNombre', 'primerApellido', 
      'direccion', 'codigoTelefono', 'numeroTelefono', 'email', 'password'
    ]
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Campo requerido: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    // Validar longitud de contraseña
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    // Validar formato de RIF
    const rifRegex = /^[VEJPG]-?\d{7,8}-?\d$/
    if (!rifRegex.test(body.rif)) {
      return NextResponse.json(
        { error: 'Formato de RIF inválido. Use formato: V-12345678-9' },
        { status: 400 }
      )
    }

    // Validar cédula (debe ser número de 7-8 dígitos)
    if (body.cedula.toString().length < 7 || body.cedula.toString().length > 8) {
      return NextResponse.json(
        { error: 'La cédula debe tener entre 7 y 8 dígitos' },
        { status: 400 }
      )
    }

    // Validar teléfono (debe ser número válido)
    if (body.numeroTelefono.toString().length < 7) {
      return NextResponse.json(
        { error: 'El número de teléfono debe tener al menos 7 dígitos' },
        { status: 400 }
      )
    }

    console.log('Datos de afiliación recibidos:', {
      ...body,
      password: '[HIDDEN]'
    })

    // Procesar afiliación
    const resultado = await afiliarClienteDesdeLanding({
      rif: body.rif,
      cedula: body.cedula,
      primerNombre: body.primerNombre,
      segundoNombre: body.segundoNombre || '',
      primerApellido: body.primerApellido,
      segundoApellido: body.segundoApellido || '',
      direccion: body.direccion,
      fkLugar: body.fkLugar || 1, // Por defecto
      codigoTelefono: body.codigoTelefono,
      numeroTelefono: body.numeroTelefono,
      email: body.email,
      password: body.password
    })

    console.log('Afiliación exitosa:', {
      clienteId: resultado.cliente?.cliente_id,
      carnet: resultado.carnet?.numero
    })

    return NextResponse.json({
      success: true,
      message: 'Afiliación exitosa',
      data: {
        cliente: resultado.cliente,
        carnet: resultado.carnet
      }
    })

  } catch (error: any) {
    console.error('Error en afiliación:', error)
    
    // Manejar errores específicos de la base de datos
    if (error.message.includes('ya está registrado') || 
        error.message.includes('ya existe') ||
        error.message.includes('Cliente ya existe')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 } // Conflict
      )
    }

    return NextResponse.json(
      { error: error.message || 'Error interno del servidor. Intente nuevamente.' },
      { status: 500 }
    )
  }
} 