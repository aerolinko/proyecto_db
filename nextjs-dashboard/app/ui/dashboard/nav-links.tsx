'use client'

import {
  HomeIcon,
  UserIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  EyeIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import clsx from 'clsx'

// @ts-ignore
export default function NavLinks({currentUser}) {
  // Verificar permisos del usuario
  const hasAdminPermission = currentUser?.rol?.nombre === 'Administrador' || 
                            currentUser?.permisos?.some((p: any) => 
                              (p.descripcion || '')
                                .toLowerCase()
                                .replace(/[_\s]/g, '')
                                .includes('modificarventaonline')
                            );
  
  const hasConsultPermission = currentUser?.permisos?.some((p: any) => 
    (p.descripcion || '')
      .toLowerCase()
      .replace(/[_\s]/g, '')
      .includes('consultarventaonline')
  );

  const hasEventPermission = currentUser?.permisos?.some((p: any) => {
    const descripcion = (p.descripcion || '').toLowerCase().replace(/[_\s]/g, '');
    return descripcion.includes('consultarevento') || 
           descripcion.includes('crearevento') || 
           descripcion.includes('modificarevento');
  });

  const links = [
    { name: 'Menú Principal', href: `/${currentUser.usuario_id}/dashboard`, icon: HomeIcon },
    { name: 'Tienda Online', href: `/${currentUser.usuario_id}/tienda-online/catalogo`, icon: ShoppingBagIcon },
    { name: 'Órdenes', href: `/${currentUser.usuario_id}/ordenes`, icon: ClipboardDocumentListIcon },
    // Mostrar consultar órdenes para usuarios con permiso de consulta
    ...(hasConsultPermission ? [{ name: 'Consultar Órdenes', href: `/${currentUser.usuario_id}/consultar-ordenes`, icon: EyeIcon }] : []),
    // Solo mostrar administración de órdenes para administradores
    ...(hasAdminPermission ? [{ name: 'Admin Órdenes', href: `/${currentUser.usuario_id}/admin-ordenes`, icon: CogIcon }] : []),
    // Mostrar gestión de eventos para usuarios con permisos de eventos
    ...(hasEventPermission ? [{ name: 'Gestión Eventos', href: `/${currentUser.usuario_id}/GestionEventos`, icon: CalendarIcon }] : []),
    { name: 'Perfil', href: `/${currentUser.usuario_id}/profile`, icon: UserIcon },
  ];
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
                'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
                {
                  'bg-sky-100 text-blue-600': pathname === link.href,
                },
            )}
          >
            {LinkIcon && <LinkIcon className="w-6" />}
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
