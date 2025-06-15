import {cookies} from "next/headers";
import {redirect} from "next/navigation";
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
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <p className="text-gray-800">
                                <span className="font-semibold text-purple-700">Nombres:</span> {currentUser.primer_nombre} {currentUser.segundo_nombre || ''}
                            </p>
                        </div>
                    </div>

                    {/* User's Last Name */}
                    <div className="flex flex-col space-y-2 pb-4 border-b border-purple-600">
                        <div className="flex items-center space-x-4">
                            {/* Reusing person icon for consistency with name fields */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <p className="text-gray-800">
                                <span className="font-semibold text-purple-700">Apellidos:</span> {currentUser.primer_apellido} {currentUser.segundo_apellido || ''}
                            </p>
                        </div>
                    </div>

                    {/* User's ID */}
                    <div className="flex flex-col space-y-2 pb-4 border-b border-purple-600">
                        <div className="flex items-center space-x-4">
                            {/* SVG icon for email */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6h.01M10 10h.01M10 14h.01M10 18h.01M14 6h.01M14 10h.01M14 14h.01M14 18h.01M18 6h.01M18 10h.01M18 14h.01M18 18h.01M6 6h.01M6 10h.01M6 14h.01M6 18h.01" />
                            </svg>
                            <p className="text-gray-800">
                                <span className="font-semibold text-purple-700">Cédula:</span> {currentUser.cedula}
                            </p>
                        </div>
                    </div>

                    {/* User's Role */}
                    <div className="flex flex-col space-y-2 pb-4 border-b border-purple-600">
                        <div className="flex items-center space-x-4">
                            {/* SVG icon for ID */}

                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>

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
                        <div className="flex flex-col space-y-2 pb-4 border-b border-purple-600">
                            <div className="flex items-center space-x-4">
                                {/* SVG icon for phone */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-gray-800">
                                    <span className="font-semibold text-purple-700">Contratación:</span> {currentUser.fecha_contrato}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Address */}
                    {currentUser.direccion && (
                        <div className="flex flex-col space-y-2 pb-4 border-b border-purple-600 md:col-span-2"> {/* This makes it span both columns */}
                            <div className="flex items-center space-x-4">
                                {/* SVG icon for location */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
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