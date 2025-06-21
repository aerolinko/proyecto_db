'use client'

import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  ShoppingBagIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link'
import clsx from 'clsx'

export default function UserNavs({ permissions }) {
  const Links = [
    { path: `VentaTienda`, nombre: 'Manejo de caja', icon: ShoppingBagIcon, id: 'consultar VENTA_TIENDA' },
    { path: `Roles`, nombre: 'Manejo de roles', icon: Cog6ToothIcon, id: 'consultar ROL' },
    { path: `GestionUsuarios`, nombre: 'Manejo de usuarios', icon: UserGroupIcon, id: 'consultar USUARIO' },
    { path: `Reportes`, nombre: 'Manejo de reportes', icon: DocumentDuplicateIcon, id: 'consultar REPORTES' }
  ];

  let filteredLinks = Links.filter(link =>
      permissions.some(permission => permission.descripcion === link.id)
  );

  return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredLinks.map((link) => {
          const LinkIcon = link.icon;

          return (
              <Link
                  key={link.nombre}
                  href={link.path}
                  className={clsx(
                      'group relative flex flex-col items-center justify-center',
                      'p-6 rounded-xl transition-all duration-300',
                      'bg-white border border-gray-200 shadow-sm',
                      'hover:shadow-lg hover:border-blue-500 hover:bg-blue-50',
                      'h-full min-h-[180px]'
                  )}
              >
                <div className={clsx(
                    'absolute top-4 right-4 w-2 h-2 rounded-full',
                    'bg-blue-500 opacity-0 group-hover:opacity-100',
                    'transition-opacity duration-300'
                )} />

                <div className="flex flex-col items-center justify-center gap-3">
                  <div className={clsx(
                      'p-3 rounded-full bg-blue-100 text-blue-600',
                      'group-hover:bg-blue-600 group-hover:text-white',
                      'transition-colors duration-300'
                  )}>
                    <LinkIcon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {link.nombre}
                  </h3>

                  <p className="text-sm text-gray-500 group-hover:text-blue-500 transition-colors">
                    Click para acceder
                  </p>
                </div>
              </Link>
          );
        })}
      </div>
  );
}