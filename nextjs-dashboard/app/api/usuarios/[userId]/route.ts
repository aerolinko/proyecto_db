import { NextRequest, NextResponse } from 'next/server';
import { getUsuarioById, getUserPermissions } from '@/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
    }

    // Obtener información del usuario
    const userData = await getUsuarioById(userId);
    
    if (!userData) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Obtener permisos del usuario
    const permisos = await getUserPermissions(parseInt(userId));

    return NextResponse.json({
      success: true,
      data: {
        usuario_id: userData.usuario_id,
        nombre_usuario: userData.email, // En la función se usa email como nombre_usuario
        email: userData.email,
        tipo_entidad: userData.tipo_entidad,
        // Agregar datos según el tipo de entidad
        ...(userData.empleado && {
          nombre: userData.empleado.primer_nombre,
          apellido: userData.empleado.primer_apellido,
          telefono: userData.empleado.telefono,
          direccion: userData.empleado.direccion
        }),
        ...(userData.cliente_natural && {
          nombre: userData.cliente_natural.primer_nombre,
          apellido: userData.cliente_natural.primer_apellido,
          telefono: userData.cliente_natural.telefono,
          direccion: userData.cliente_natural.direccion
        }),
        ...(userData.cliente_juridico && {
          nombre: userData.cliente_juridico.razon_social,
          telefono: userData.cliente_juridico.telefono,
          direccion: userData.cliente_juridico.direccion
        }),
        ...(userData.miembro_acaucab && {
          telefono: userData.miembro_acaucab.telefono,
          direccion: userData.miembro_acaucab.direccion
        }),
        permisos: permisos.map((p: any) => ({
          permiso_id: p.permiso_id,
          descripcion: p.descripcion
        }))
      }
    });

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 