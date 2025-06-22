import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import {CalendarIcon, Cog8ToothIcon, DocumentTextIcon, MapPinIcon, UserIcon} from "@heroicons/react/24/outline";
export default async function Page() {

    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    if (!userCookie) {
        redirect('/');
    }
    const currentUser = JSON.parse(userCookie.value);
    return (
        <div className="flex flex-col items-center justify-center min-h-full" >
            {/* Optional: User Navigation component - commented out as it's an external dependency not provided */}
            {/* <UserNavs /> */}

            <div className="bg-gray-200 p-10 sm:p-12 rounded-2xl shadow-xl border-2 w-full max-w-2xl transform transition-all duration-300 hover:scale-105">
                <h1 className="text-4xl font-extrabold text-purple-800 mb-8 pb-4 border-b-2 border-purple-900 text-center">
                    Mi Perfil
                </h1>

                {/* Main profile details in two columns on medium screens and up */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 text-lg">
                    {/* User's Full Name */}
                    <div className="flex flex-col space-y-2 pb-4 border-b border-purple-600">
                        <div className="flex items-center space-x-4">
                            {/* SVG icon for person */}
                            <UserIcon className={'w-8 h-8 text-purple-700'}/>
                            <p className="text-gray-800">
                                <span className="font-semibold text-purple-700">Nombres:</span> {currentUser.primer_nombre} {currentUser.segundo_nombre || ''}
                            </p>
                        </div>
                    </div>

                    {/* User's Last Name */}
                    <div className="flex flex-col space-y-2 pb-4 border-b border-purple-600">
                        <div className="flex items-center space-x-4">
                            {/* Reusing person icon for consistency with name fields */}
                            <UserIcon className={'w-8 h-8 text-purple-700'}></UserIcon>
                            <p className="text-gray-800">
                                <span className="font-semibold text-purple-700">Apellidos:</span> {currentUser.primer_apellido} {currentUser.segundo_apellido || ''}
                            </p>
                        </div>
                    </div>

                    {/* User's ID */}
                    <div className="flex flex-col space-y-2 pb-4 border-b border-purple-600">
                        <div className="flex items-center space-x-4">
                            {/* SVG icon for email */}
                            <DocumentTextIcon className={'w-8 h-8 text-purple-700'}></DocumentTextIcon>
                            <p className="text-gray-800">
                                <span className="font-semibold text-purple-700">Cédula:</span> {currentUser.cedula}
                            </p>
                        </div>
                    </div>

                    {/* User's Role */}
                    <div className="flex flex-col space-y-2 pb-4 border-b border-purple-600">
                        <div className="flex items-center space-x-4">
                            {/* SVG icon for ID */}

                            <Cog8ToothIcon className={'w-8 h-8 text-purple-700'}></Cog8ToothIcon>

                            <p className="text-gray-800">
                                <span className="font-semibold text-purple-700">Cargo:</span> {currentUser.nombre}
                            </p>
                        </div>
                    </div>
                    {/* "Contacto y Ubicación" heading spans both columns */}
                    <h2 className="text-2x1 font-bold text-purple-700 mt-4 mb-2 pb-2 border-b-2 border-purple-900 md:col-span-2">
                        Contacto y Ubicación
                    </h2>

                    {/* Contract Date */}
                    {currentUser.nombre_usuario && (
                        <div className="flex flex-col space-y-2 pb-4 border-b border-purple-600 col-span-2">
                            <div className="flex items-center space-x-4">
                                {/* SVG icon for phone */}
                                <CalendarIcon className={'w-8 h-8 text-purple-700'}></CalendarIcon>
                                <p className="text-gray-800">
                                    <span className="font-semibold text-purple-700 truncate">Fecha de Contrato:</span> {currentUser.fecha_contrato}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Address */}
                    {currentUser.direccion && (
                        <div className="flex flex-col space-y-2 pb-4 border-b border-purple-600 col-span-2"> {/* This makes it span both columns */}
                            <div className="flex items-center space-x-4">
                                {/* SVG icon for location */}
                                <MapPinIcon className={'w-8 h-8 text-purple-700'} />
                                <p className="text-gray-800">
                                    <span className="font-semibold text-purple-700">Dirección:</span> {currentUser.direccion}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}