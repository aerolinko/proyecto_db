import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import UserNavs from "@/app/ui/users/userNavs";

export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ usernameid: number }>
}) {
    const { usernameid } = await params;
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    const permissionCookies = cookieStore.get('permissions');

    if (!userCookie || !permissionCookies) {
        redirect('/');
    }

    const currentUser = JSON.parse(userCookie.value);
    const currentPermissions = JSON.parse(permissionCookies.value);

    return (
        <div className="flex flex-col items-center justify-center min-h-full bg-gradient-to-b from-gray-50 to-gray-100 p-4">
            <div className="w-full max-w-6xl mx-auto">
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
                        Bienvenido, {currentUser.primer_nombre}!
                    </h1>
                    <p className="text-gray-600 text-center">
                        Selecciona una de las siguientes opciones disponibles
                    </p>
                </div>

                <UserNavs permissions={currentPermissions} />
            </div>
        </div>
    );
}