import SideNav from '@/app/ui/dashboard/sidenav';
import { cookies } from "next/headers";

export default async function Layout({ children }) {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    const currentUser = userCookie ? JSON.parse(userCookie.value) : null;

    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
            <div className="w-full flex-none md:w-64">
                <SideNav currentUser={currentUser} />
            </div>
            <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
        </div>
    );
}