import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import UserNavs from "@/app/ui/users/userNavs";


export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ usernameid: number }>
}){
    const { usernameid } = await params;
    const cookieStore = await cookies();
    const userCookie =  cookieStore.get('user');
    const permissionCookies = cookieStore.get('permissions');
    if (!userCookie || !permissionCookies) {
        redirect('/');
    }
    const currentUser = JSON.parse(userCookie.value);
    const currentPermissions = JSON.parse(permissionCookies.value);

    return (
        <div className="flex flex-col items-center justify-center min-h-full">
            <h1 className="text-2xl font-bold mb-4">Opciones disponibles para {currentUser.primer_nombre}</h1>
            <UserNavs permissions={currentPermissions} />
        </div>
    );
}