"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"

export default function LandingPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [email, setEmail] = useState("")
    const [showAfiliacionModal, setShowAfiliacionModal] = useState(false)
    const [formData, setFormData] = useState({
        rif: "",
        cedula: "",
        primerNombre: "",
        segundoNombre: "",
        primerApellido: "",
        segundoApellido: "",
        direccion: "",
        codigoTelefono: "58",
        numeroTelefono: "",
        email: "",
        password: "",
        confirmPassword: ""
    })
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState("")

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Newsletter signup:", email)
        setEmail("")
        alert("¡Gracias por suscribirte a nuestro DiarioDeUnaCerveza!")
    }

    const handleAfiliacionSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage("")

        // Validaciones básicas
        if (formData.password !== formData.confirmPassword) {
            setMessage("Las contraseñas no coinciden")
            setIsLoading(false)
            return
        }

        if (!formData.rif || !formData.cedula || !formData.primerNombre || !formData.primerApellido) {
            setMessage("Por favor complete todos los campos obligatorios")
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch('/api/afiliacion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    rif: formData.rif,
                    cedula: parseInt(formData.cedula),
                    primerNombre: formData.primerNombre,
                    segundoNombre: formData.segundoNombre,
                    primerApellido: formData.primerApellido,
                    segundoApellido: formData.segundoApellido,
                    direccion: formData.direccion,
                    fkLugar: 1, // Por defecto
                    codigoTelefono: parseInt(formData.codigoTelefono),
                    numeroTelefono: parseInt(formData.numeroTelefono),
                    email: formData.email,
                    password: formData.password
                }),
            })

            const result = await response.json()

            if (response.ok) {
                setMessage("¡Afiliación exitosa! Su carnet digital ha sido generado.")
                // Limpiar formulario
                setFormData({
                    rif: "",
                    cedula: "",
                    primerNombre: "",
                    segundoNombre: "",
                    primerApellido: "",
                    segundoApellido: "",
                    direccion: "",
                    codigoTelefono: "58",
                    numeroTelefono: "",
                    email: "",
                    password: "",
                    confirmPassword: ""
                })
                // Cerrar modal después de 3 segundos
                setTimeout(() => {
                    setShowAfiliacionModal(false)
                    setMessage("")
                }, 3000)
            } else {
                const errorMessage = result.error || "Error en la afiliación"
                setMessage(errorMessage)
                
                // Si es un error de cliente existente, no cerrar el modal
                if (response.status === 409) {
                    // Mantener el modal abierto para que el usuario pueda corregir los datos
                    console.log("Cliente ya existe, manteniendo modal abierto")
                }
            }
        } catch (error) {
            console.error("Error:", error)
            setMessage("Error de conexión. Intente nuevamente.")
        }

        setIsLoading(false)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-blue-500">ACAUCAB</h1>
                            <span className="ml-2 text-sm text-gray-600 hidden sm:block">Asociación de Cerveceros Artesanales</span>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex space-x-8">
                            <a href="#inicio" className="text-gray-700 hover:text-blue-500 transition-colors">
                                Inicio
                            </a>
                            <a href="#nosotros" className="text-gray-700 hover:text-blue-500 transition-colors">
                                Nosotros
                            </a>
                            <a href="#cervezas" className="text-gray-700 hover:text-blue-500 transition-colors">
                                Cervezas
                            </a>
                            <a href="#eventos" className="text-gray-700 hover:text-blue-500 transition-colors">
                                Eventos
                            </a>
                            <a href="#contacto" className="text-gray-700 hover:text-blue-500 transition-colors">
                                Contacto
                            </a>
                        </nav>

                        <div className="hidden md:flex items-center space-x-4">
                            <Link href="/login">
                                <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                                    Iniciar Sesión
                                </button>
                            </Link>
                            <button 
                                onClick={() => setShowAfiliacionModal(true)}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                            >
                                Afiliarse
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <div className="w-6 h-6 flex flex-col justify-center items-center">
                                <span
                                    className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? "rotate-45 translate-y-1" : "-translate-y-0.5"}`}
                                ></span>
                                <span
                                    className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMenuOpen ? "opacity-0" : "opacity-100"}`}
                                ></span>
                                <span
                                    className={`bg-gray-600 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? "-rotate-45 -translate-y-1" : "translate-y-0.5"}`}
                                ></span>
                            </div>
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    {isMenuOpen && (
                        <div className="md:hidden py-4 border-t border-gray-200">
                            <nav className="flex flex-col space-y-4">
                                <a href="#inicio" className="text-gray-700 hover:text-blue-500 transition-colors">
                                    Inicio
                                </a>
                                <a href="#nosotros" className="text-gray-700 hover:text-blue-500 transition-colors">
                                    Nosotros
                                </a>
                                <a href="#cervezas" className="text-gray-700 hover:text-blue-500 transition-colors">
                                    Cervezas
                                </a>
                                <a href="#eventos" className="text-gray-700 hover:text-blue-500 transition-colors">
                                    Eventos
                                </a>
                                <a href="#contacto" className="text-gray-700 hover:text-blue-500 transition-colors">
                                    Contacto
                                </a>
                                <div className="flex flex-col space-y-2 pt-4">
                                    <Link href="/login">
                                        <button className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                                            Iniciar Sesión
                                        </button>
                                    </Link>
                                    <button 
                                        onClick={() => setShowAfiliacionModal(true)}
                                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                    >
                                        Afiliarse
                                    </button>
                                </div>
                            </nav>
                        </div>
                    )}
                </div>
            </header>

            {/* Hero Section */}
            <section id="inicio" className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center rounded-full border border-blue-200 bg-white px-3 py-1 text-sm font-medium text-blue-700 mb-4">
                            🍺 Desde 2012 - Cerveza Artesanal Venezolana
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                            Asociación de Cerveceros
                            <span className="text-blue-500"> Artesanales de la UCAB</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                            Somos la única organización mayorista que opera en el mercado venezolano, distribuyendo cerveza artesanal
                            con excelencia en precio, calidad y variedad para hoteles, restaurantes y comercios afiliados.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button 
                                onClick={() => setShowAfiliacionModal(true)}
                                className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Afiliarse Ahora
                                <span className="ml-2">→</span>
                            </button>
                            <button className="px-8 py-3 text-lg font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                Ver Catálogo
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="nosotros" className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Sobre ACAUCAB</h2>
                            <p className="text-lg text-gray-600 mb-6">
                                Fundada en octubre de 2012 con 54 miembros fundadores, ACAUCAB es una asociación sin fines de lucro
                                creada para la difusión de la cultura cervecera artesanal y casera en Venezuela.
                            </p>
                            <p className="text-lg text-gray-600 mb-8">
                                Nuestra misión es la distribución de cerveza artesanal con excelencia, ofreciendo a nuestros clientes la
                                más amplia variedad al mejor precio, mientras apoyamos a los cerveceros artesanales locales.
                            </p>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-500 mb-2">54+</div>
                                    <div className="text-gray-600">Miembros Fundadores</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-500 mb-2">12+</div>
                                    <div className="text-gray-600">Años de Experiencia</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-500 mb-2">30+</div>
                                    <div className="text-gray-600">Etiquetas Disponibles</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-500 mb-2">100%</div>
                                    <div className="text-gray-600">Artesanal</div>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="aspect-square bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl"></div>
                            <div className="absolute inset-4 bg-white rounded-xl shadow-xl flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">🍺</div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Cerveza Artesanal</h3>
                                    <p className="text-gray-600">Natural, Honesta, Independiente, Innovadora y Deliciosa</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Beer Types Section */}
            <section id="cervezas" className="py-20 bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Tipos de Cerveza Artesanal</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Descubre la amplia variedad de estilos de cerveza artesanal que ofrecemos a través de nuestros miembros
                            cerveceros
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Beer Type 1 */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <span className="text-2xl">🍺</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ales</h3>
                            <p className="text-gray-600 mb-4">Fermentación alta con levadura Saccharomyces Cerevisiae</p>
                            <ul className="space-y-2">
                                <li className="flex items-center text-sm text-gray-600">
                                    <span className="text-blue-500 mr-2">•</span>
                                    American Pale Ale
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <span className="text-blue-500 mr-2">•</span>
                                    American IPA
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <span className="text-blue-500 mr-2">•</span>
                                    Stout y Porter
                                </li>
                            </ul>
                        </div>

                        {/* Beer Type 2 */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <span className="text-2xl">🍻</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Lagers</h3>
                            <p className="text-gray-600 mb-4">Fermentación baja con temperaturas controladas</p>
                            <ul className="space-y-2">
                                <li className="flex items-center text-sm text-gray-600">
                                    <span className="text-blue-500 mr-2">•</span>
                                    Pilsner
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <span className="text-blue-500 mr-2">•</span>
                                    Vienna Lager
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <span className="text-blue-500 mr-2">•</span>
                                    Bock
                                </li>
                            </ul>
                        </div>

                        {/* Beer Type 3 */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <span className="text-2xl">🍺</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Cervezas Belgas</h3>
                            <p className="text-gray-600 mb-4">Tradición monástica con sabores complejos</p>
                            <ul className="space-y-2">
                                <li className="flex items-center text-sm text-gray-600">
                                    <span className="text-blue-500 mr-2">•</span>
                                    Belgian Dubbel
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <span className="text-blue-500 mr-2">•</span>
                                    Golden Strong Ale
                                </li>
                                <li className="flex items-center text-sm text-gray-600">
                                    <span className="text-blue-500 mr-2">•</span>
                                    Specialty Ale
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Venezuelan Craft Beers */}
                    <div className="mt-16">
                        <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Cervezas Artesanales Venezolanas</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-2">Destilo</h4>
                                <p className="text-sm text-gray-600">
                                    Primera cerveza ultra Premium tipo Ale hecha en Venezuela. Amber Ale según la Ley de Baviera de 1516.
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-2">Benitz Pale Ale</h4>
                                <p className="text-sm text-gray-600">
                                    100% artesanal, balance perfecto entre maltas dulces y lúpulos suaves. American Pale Ale.
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-2">Mito Candileja</h4>
                                <p className="text-sm text-gray-600">
                                    Inspirada en técnicas monásticas, cuerpo denso y color ámbar. Belgian Dubbel.
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-2">Lago Ángel o Demonio</h4>
                                <p className="text-sm text-gray-600">
                                    Dorada con espuma blanca y fina, intensidad de aromas. Belgian Golden Strong Ale.
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-2">Barricas Saison</h4>
                                <p className="text-sm text-gray-600">
                                    Cerveza de temporada, afrutada con reminiscencias a especias. Belgian Specialty Ale.
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-2">Aldarra Mantuana</h4>
                                <p className="text-sm text-gray-600">
                                    Mezcla de cereales y lúpulos americanos, aroma a frutas tropicales. Blonde Ale.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Events Section */}
            <section id="eventos" className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Eventos ACAUCAB</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Participamos y organizamos eventos para promover la cultura cervecera artesanal en Venezuela
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">UBirra 2024</h3>
                            <p className="text-lg text-gray-600 mb-6">
                                Nuestro evento insignia donde más de 30 productores de cerveza participaron en la Plaza Mickey, Caracas.
                                Los asistentes pudieron degustar 30 tipos diferentes de bebidas artesanales.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <span className="text-blue-500 mr-3">📅</span>
                                    <span className="text-gray-700">Julio 2024 - Viernes y Sábado</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-blue-500 mr-3">📍</span>
                                    <span className="text-gray-700">Plaza Mickey, Caracas</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-blue-500 mr-3">🍺</span>
                                    <span className="text-gray-700">30+ Productores participantes</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-blue-500 mr-3">🎓</span>
                                    <span className="text-gray-700">Talleres y ponencias educativas</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-8">
                            <div className="text-center">
                                <div className="text-6xl mb-4">🎉</div>
                                <h4 className="text-xl font-semibold text-gray-900 mb-2">Próximos Eventos</h4>
                                <p className="text-gray-600 mb-4">
                                    Mantente al día con nuestros próximos eventos y actividades cerveceras
                                </p>
                                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                    Ver Calendario
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter Section - DiarioDeUnaCerveza */}
            <section className="py-20 bg-blue-500">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">DiarioDeUnaCerveza</h2>
                        <p className="text-xl text-blue-100 mb-8">
                            Suscríbete a nuestro DiarioDeUnaCerveza y recibe cada 30 días las mejores ofertas y novedades del mundo
                            cervecero artesanal venezolano
                        </p>

                        <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Tu correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="flex-1 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                type="submit"
                                className="px-6 py-2 bg-white text-blue-500 rounded-md hover:bg-gray-100 transition-colors whitespace-nowrap font-medium"
                            >
                                Suscribirse
                            </button>
                        </form>
                        <p className="text-sm text-blue-100 mt-4">
                            Ofertas válidas por 10 días • Distribución gratuita • Versión digital disponible
                        </p>
                    </div>
                </div>
            </section>

            {/* Sustainability Section */}
            <section className="py-20 bg-green-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Compromiso con la Sostenibilidad</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            ACAUCAB está comprometida con los Objetivos de Desarrollo Sostenible (ODS) para promover prácticas
                            responsables en la industria cervecera
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-lg p-6 text-center border border-green-200">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">♻️</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">ODS 12</h3>
                            <h4 className="text-md font-medium text-gray-700 mb-2">Producción Responsable</h4>
                            <p className="text-sm text-gray-600">Ingredientes locales y orgánicos, reduciendo la huella de carbono</p>
                        </div>

                        <div className="bg-white rounded-lg p-6 text-center border border-blue-200">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">💧</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">ODS 6</h3>
                            <h4 className="text-md font-medium text-gray-700 mb-2">Agua Limpia</h4>
                            <p className="text-sm text-gray-600">Sistemas de reciclaje y tratamiento de agua eficientes</p>
                        </div>

                        <div className="bg-white rounded-lg p-6 text-center border border-purple-200">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">👥</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">ODS 8</h3>
                            <h4 className="text-md font-medium text-gray-700 mb-2">Trabajo Decente</h4>
                            <p className="text-sm text-gray-600">Empleos justos y seguros, desarrollo económico local</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contacto" className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Contáctanos</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            ¿Interesado en afiliarte a ACAUCAB o conocer más sobre nuestros productos? Estamos aquí para ayudarte a
                            formar parte de la comunidad cervecera artesanal
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Contact Card 1 */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📧</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Email</h3>
                            <p className="text-gray-600">comprasacaucab@acaucab.com</p>
                            <p className="text-gray-600">info@acaucab.com</p>
                        </div>

                        {/* Contact Card 2 */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🛒</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Ventas</h3>
                            <p className="text-gray-600">Hoteles y Restaurantes</p>
                            <p className="text-gray-600">Comercios Mayoristas</p>
                        </div>

                        {/* Contact Card 3 */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🏢</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Afiliación</h3>
                            <p className="text-gray-600">Cerveceros Artesanales</p>
                            <p className="text-gray-600">Distribuidores</p>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">¿Eres cervecero artesanal?</h4>
                            <p className="text-gray-600 mb-4">
                                Únete a nuestra red de más de 54 miembros y lleva tu cerveza artesanal a toda Venezuela
                            </p>
                            <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                Solicitar Afiliación
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-2xl font-bold mb-4">ACAUCAB</h3>
                            <p className="text-gray-400 mb-4">
                                Asociación de Cerveceros Artesanales de la UCAB. Promoviendo la cultura cervecera artesanal en Venezuela
                                desde 2012.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Productos</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Ales Artesanales
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Lagers Premium
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Cervezas Belgas
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Servicios</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Distribución Mayorista
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Eventos Cerveceros
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Capacitación
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Términos de Afiliación
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Política de Calidad
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Sostenibilidad
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>
                            &copy; {new Date().getFullYear()} ACAUCAB - Asociación de Cerveceros Artesanales de la UCAB. Todos los
                            derechos reservados.
                        </p>
                        <p className="mt-2 text-sm">
                            Cerveza artesanal venezolana • Natural • Honesta • Independiente • Innovadora • Deliciosa
                        </p>
                    </div>
                </div>
            </footer>

            {/* Modal de Afiliación */}
            {showAfiliacionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Afiliación a ACAUCAB</h2>
                                <button
                                    onClick={() => setShowAfiliacionModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {message && (
                                <div className={`p-4 mb-4 rounded-md ${message.includes('exitoso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleAfiliacionSubmit} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            RIF * <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="rif"
                                            value={formData.rif}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="V-12345678-9"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Cédula * <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="cedula"
                                            value={formData.cedula}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="12345678"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Primer Nombre * <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="primerNombre"
                                            value={formData.primerNombre}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Juan"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Segundo Nombre
                                        </label>
                                        <input
                                            type="text"
                                            name="segundoNombre"
                                            value={formData.segundoNombre}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Carlos"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Primer Apellido * <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="primerApellido"
                                            value={formData.primerApellido}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Pérez"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Segundo Apellido
                                        </label>
                                        <input
                                            type="text"
                                            name="segundoApellido"
                                            value={formData.segundoApellido}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="García"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Dirección * <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Av. Principal #123, Caracas"
                                        required
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Código de País
                                        </label>
                                        <input
                                            type="text"
                                            name="codigoTelefono"
                                            value={formData.codigoTelefono}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="58"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Número de Teléfono * <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="numeroTelefono"
                                            value={formData.numeroTelefono}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="4121234567"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email * <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="juan@email.com"
                                        required
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Contraseña * <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Mínimo 8 caracteres"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirmar Contraseña * <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Repita la contraseña"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-md">
                                    <h4 className="font-medium text-blue-900 mb-2">Beneficios de la Afiliación:</h4>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Acceso a catálogo completo de cervezas artesanales</li>
                                        <li>• Precios mayoristas especiales</li>
                                        <li>• Carnet digital con código QR</li>
                                        <li>• Sistema de puntos y recompensas</li>
                                        <li>• Membresía por 1 año</li>
                                    </ul>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAfiliacionModal(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    {message && message.includes('ya existe') && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData({
                                                    rif: "",
                                                    cedula: "",
                                                    primerNombre: "",
                                                    segundoNombre: "",
                                                    primerApellido: "",
                                                    segundoApellido: "",
                                                    direccion: "",
                                                    codigoTelefono: "58",
                                                    numeroTelefono: "",
                                                    email: "",
                                                    password: "",
                                                    confirmPassword: ""
                                                })
                                                setMessage("")
                                            }}
                                            className="px-4 py-2 text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                                        >
                                            Limpiar Formulario
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                                    >
                                        {isLoading ? "Procesando..." : "Afiliarse"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
