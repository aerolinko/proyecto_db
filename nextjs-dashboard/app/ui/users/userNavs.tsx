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

const Links= [
  {path:'/VentaTienda',nombre:'Manejo de caja', icon: ShoppingBagIcon, id:301},
  {path:'/Roles',nombre:'Manejo de roles', icon: Cog6ToothIcon, id:162},
  {path:'/GestionUsuarios',nombre:'Manejo de usuarios', icon: UserGroupIcon, id:229 },
  {path:'/Reportes',nombre:'Manejo de reportes', icon: DocumentDuplicateIcon, id:0}]

// @ts-ignore
export default function UserNavs({ permissions }) {
  const pathname = usePathname();
  let i=0
  let filteredLinks=Links;
  for (let i=0; i<4; i++) {
    if(!permissions.some((permission:{permiso_id:number}) => permission.permiso_id == Links[i].id)) {
      filteredLinks = filteredLinks.filter((link) => link.id !== Links[i].id);
    }
  }



  return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 p-6 max-w-7xl mx-auto">
        {filteredLinks.map((link) => {
          // Ensure the icon component exists in our map or is directly provided
          const LinkIcon = link.icon;

          if (!LinkIcon) {
            console.warn(`Icon for link "${link.nombre}" not found.`);
            return null; // Don't render if icon is missing
          }

          return (
              <Link
                  key={link.nombre}
                  href={link.path}
                  className={clsx( // Apply clsx here once
                      // --- START: Card CSS Classes ---
                      'flex flex-col items-center justify-center', // Stacks icon and text vertically, centers them
                      'p-4 rounded-xl', // More padding, larger rounded corners
                      'bg-white border border-gray-200', // White background, subtle border
                      'shadow-md hover:shadow-lg transition-all duration-200 ease-in-out', // Shadow for depth, smooth hover effect
                      'text-gray-800 text-center font-medium', // Default text color, center text
                      'w-full h-36', // Fixed size for cards (w-full fills grid cell, h-36 is fixed height)
                      'hover:scale-105 transform', // Subtle grow on hover
                      // --- END: Card CSS Classes ---
                      {
                        // Conditional Active State Styles:
                        // IMPORTANT: The comparison should be 'pathname === link.path' not 'link.nombre'
                        // Also incorporates the 'isMounted' check for hydration safety.
                        'bg-gradient-to-br from-blue-600 to-blue-800 text-white border-blue-700 shadow-xl':pathname === link.path,
                        'hover:scale-105 hover:shadow-xl hover:from-blue-700 hover:to-blue-900': pathname === link.path,
                      },
                  )}
              >
                <LinkIcon className="w-6" />
                <p className="hidden md:block">{link.nombre}</p>
              </Link>
          );
        })}
      </div>
  );
}