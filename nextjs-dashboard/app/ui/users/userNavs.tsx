'use client'

import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  ShoppingBagIcon, // Example: Add another icon for a new link
  Cog6ToothIcon, InformationCircleIcon,  // Example: Another icon
} from '@heroicons/react/24/outline';
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import clsx from 'clsx'

export default function UserNavs({ permissions }) {
  const pathname = usePathname();

  return (
      <>
        {permissions.map((link:{permiso_id: number; descripcion: string}) => {
          // Ensure the icon component exists in our map or is directly provided
          const LinkIcon = InformationCircleIcon;

          if (!LinkIcon) {
            console.warn(`Icon for link "${link.descripcion}" not found.`);
            return null; // Don't render if icon is missing
          }

          return (
              <Link
                  key={link.permiso_id}
                  href={link.descripcion}
                  className={clsx( // Apply clsx here once
                      'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
                      {
                        'bg-sky-100 text-blue-600': pathname === link.descripcion,
                      },
                  )}
              >
                <LinkIcon className="w-6" />
                <p className="hidden md:block">{link.descripcion}</p>
              </Link>
          );
        })}
      </>
  );
}