import { NextRequest, NextResponse } from 'next/server';
import { debugUserPermissions } from '@/db';
import sql from '@/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 });
    }

    console.log(`=== DEBUG PERMISOS API ===`);
    console.log(`Usuario ID: ${userId}`);
    
    // Verificar tipo de usuario
    const userInfo = await sql`
      SELECT 
        u.usuario_id,
        u.nombre_usuario,
        CASE 
          WHEN u.fk_cliente_natural IS NOT NULL THEN 'cliente_natural'
          WHEN u.fk_cliente_juridico IS NOT NULL THEN 'cliente_juridico'
          WHEN u.fk_miembro_acaucab IS NOT NULL THEN 'miembro_acaucab'
          WHEN u.fk_empleado IS NOT NULL THEN 'empleado'
          ELSE 'sin_tipo'
        END as tipo_usuario,
        u.fk_cliente_natural,
        u.fk_cliente_juridico,
        u.fk_miembro_acaucab,
        u.fk_empleado
      FROM usuario u 
      WHERE u.usuario_id = ${parseInt(userId)}
    `;
    
    console.log('Información del usuario:', userInfo[0]);
    
    // Verificar si tiene roles asignados (clientes NO deberían tener roles)
    const userRoles = await sql`
      SELECT r.nombre as rol_nombre, r.rol_id, ru.rol_usuario_id
      FROM ROL_USUARIO ru 
      JOIN ROL r ON ru.fk_rol = r.rol_id 
      WHERE ru.fk_usuario = ${parseInt(userId)}
    `;
    
    console.log('Roles asignados al usuario:', userRoles);
    
    const permissions = await debugUserPermissions(parseInt(userId));

    return NextResponse.json({
      success: true,
      userId: parseInt(userId),
      userInfo: userInfo[0],
      userRoles: userRoles,
      permissions: permissions,
      count: permissions.length,
      isClientWithRoles: userInfo[0]?.tipo_usuario?.includes('cliente') && userRoles.length > 0
    });

  } catch (error) {
    console.error('Error debuggeando permisos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 