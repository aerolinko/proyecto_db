import SideNav from '@/app/ui/dashboard/sidenav';
import { cookies } from "next/headers";
import { getUserPermissionsSimple } from "@/db";

export default async function Layout({ children, params }) {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    const userData = userCookie ? JSON.parse(userCookie.value) : null;
    
    // Obtener permisos actualizados de la base de datos
    let currentUser = userData;
    if (userData && userData.usuario_id) {
        try {
            const permisos = await getUserPermissionsSimple(userData.usuario_id);
            currentUser = {
                ...userData,
                permisos: permisos.map((p: any) => ({
                    permiso_id: p.permiso_id,
                    descripcion: p.descripcion
                }))
            };
        } catch (error) {
            console.error('Error obteniendo permisos:', error);
        }
    }

    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
            <div className="w-full flex-none md:w-64">
                <SideNav currentUser={currentUser} />
            </div>
            <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
        </div>
    );
}