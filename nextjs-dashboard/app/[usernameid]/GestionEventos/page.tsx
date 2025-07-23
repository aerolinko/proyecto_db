'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Función para verificar permisos
const checkPermissions = (currentUser: any) => {
  const canCreate = currentUser?.permisos?.some((p: any) => 
    (p.descripcion || '').toLowerCase().replace(/[_\s]/g, '').includes('crearevento')
  );
  const canEdit = currentUser?.permisos?.some((p: any) => 
    (p.descripcion || '').toLowerCase().replace(/[_\s]/g, '').includes('modificarevento')
  );
  const canDelete = currentUser?.permisos?.some((p: any) => 
    (p.descripcion || '').toLowerCase().replace(/[_\s]/g, '').includes('eliminarevento')
  );
  const canView = currentUser?.permisos?.some((p: any) => 
    (p.descripcion || '').toLowerCase().replace(/[_\s]/g, '').includes('consultarevento')
  );
  
  return { canCreate, canEdit, canDelete, canView };
};

interface Evento {
  evento_id: number;
  nombre: string;
  capacidad: number;
  direccion: string;
  entrada_paga: boolean;
  fecha_inicio: string;
  fecha_fin: string;
  estacionamiento: boolean;
  numero_entradas: number;
  precio_entradas: number;
  tipo_evento_nombre: string;
  lugar_nombre: string;
  lugar_tipo: string;
  total_productos_catalogo: number;
  total_empleados_asignados: number;
  total_ventas_evento: number;
  estado_evento: string;
}

interface TipoEvento {
  tipo_evento_id: number;
  nombre: string;
}

interface Lugar {
  lugar_id: number;
  nombre: string;
}

interface CervezaEvento {
  evento_miembro_acaucab_id: number;
  cerveza_nombre: string;
  presentacion_material: string;
  presentacion_capacidad: number;
  proveedor_nombre: string;
  cantidad_disponible: number;
}

interface CatalogoCompleto {
  evento_miembro_acaucab_id: number;
  evento_id: number;
  evento_nombre: string;
  evento_fecha_inicio: string;
  evento_fecha_fin: string;
  evento_lugar: string;
  evento_tipo: string;
  cerveza_id: number;
  cerveza_nombre: string;
  cerveza_densidad_inicial: number;
  cerveza_densidad_final: number;
  cerveza_ibus: number;
  cerveza_alcohol: number;
  presentacion_id: number;
  presentacion_material: string;
  presentacion_capacidad: number;
  proveedor_id: number;
  proveedor_nombre: string;
  proveedor_rif: string;
  proveedor_razon_social: string;
  proveedor_direccion: string;
  proveedor_pagina_web: string;
  cantidad_disponible: number;
  tipo_cerveza_nombre: string;
  estilo_cerveza_nombre: string;
}

interface EmpleadoEvento {
  evento_empleado_id: number;
  empleado_id: number;
  primer_nombre: string;
  primer_apellido: string;
  segundo_nombre: string;
  segundo_apellido: string;
  cedula: number;
  direccion: string;
}

interface ProveedorEvento {
  miembro_id: number;
  razon_social: string;
  denominacion_comercial: string;
  direccion: string;
  pagina_web: string;
  total_cervezas: number;
}

export default function GestionEventos() {
  const params = useParams();
  const router = useRouter();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showCatalogo, setShowCatalogo] = useState(false);
  const [cervezasEvento, setCervezasEvento] = useState<CervezaEvento[]>([]);
  const [eventoCatalogo, setEventoCatalogo] = useState<Evento | null>(null);
  const [loadingCatalogo, setLoadingCatalogo] = useState(false);
  const [catalogoCompleto, setCatalogoCompleto] = useState<CatalogoCompleto[]>([]);
  const [empleados, setEmpleados] = useState<EmpleadoEvento[]>([]);
  const [proveedores, setProveedores] = useState<ProveedorEvento[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'cervezas' | 'empleados' | 'proveedores' | 'catalogo'>('cervezas');
  const [loadingModal, setLoadingModal] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [showActividadForm, setShowActividadForm] = useState(false);
  const [actividadFormData, setActividadFormData] = useState({
    nombre: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    evento_id: ''
  });
  const [formData, setFormData] = useState({
    nombre: '',
    capacidad: '',
    direccion: '',
    entrada_paga: false,
    fecha_inicio: '',
    fecha_fin: '',
    estacionamiento: false,
    numero_entradas: '',
    precio_entradas: '',
    fk_tipo_evento: '',
    fk_lugar: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadUserAndData();
  }, []);

  const loadUserAndData = async () => {
    try {
      // Cargar información del usuario usando el parámetro de la URL
      const userResponse = await fetch(`/api/usuarios/current?userId=${params.usernameid}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setCurrentUser(userData.data);
      }
      
      // Cargar datos de eventos
      await loadData();
    } catch (error) {
      console.error('Error cargando usuario:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Iniciando carga de datos...');
      
      const [eventosRes, tiposRes, lugaresRes] = await Promise.all([
        fetch('/api/eventos'),
        fetch('/api/eventos/tipos'),
        fetch('/api/eventos/lugares')
      ]);

      console.log('Respuestas recibidas:', { eventosRes: eventosRes.status, tiposRes: tiposRes.status, lugaresRes: lugaresRes.status });

      const eventosData = await eventosRes.json();
      const tiposData = await tiposRes.json();
      const lugaresData = await lugaresRes.json();

      console.log('Datos parseados:', { eventosData, tiposData, lugaresData });

      if (eventosData.success) {
        console.log('Eventos cargados:', eventosData.data);
        setEventos(eventosData.data || []);
      } else {
        console.error('Error en respuesta de eventos:', eventosData.error);
        setEventos([]);
      }
      
      if (tiposData.success) {
        setTiposEvento(tiposData.data || []);
      } else {
        console.error('Error en respuesta de tipos:', tiposData.error);
        setTiposEvento([]);
      }
      
      if (lugaresData.success) {
        setLugares(lugaresData.data || []);
      } else {
        console.error('Error en respuesta de lugares:', lugaresData.error);
        setLugares([]);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      setEventos([]);
      setTiposEvento([]);
      setLugares([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { canCreate, canEdit } = checkPermissions(currentUser);
    
    if (editingEvento && !canEdit) {
      alert('No tienes permisos para editar eventos');
      return;
    }
    
    if (!editingEvento && !canCreate) {
      alert('No tienes permisos para crear eventos');
      return;
    }
    
    try {
      const url = editingEvento 
        ? `/api/eventos/${editingEvento.evento_id}`
        : '/api/eventos';
      
      const method = editingEvento ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          capacidad: parseInt(formData.capacidad),
          numero_entradas: parseInt(formData.numero_entradas),
          precio_entradas: formData.precio_entradas ? parseInt(formData.precio_entradas) : null,
          fk_tipo_evento: parseInt(formData.fk_tipo_evento),
          fk_lugar: parseInt(formData.fk_lugar)
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(editingEvento ? 'Evento actualizado' : 'Evento creado');
        setShowForm(false);
        setEditingEvento(null);
        resetForm();
        loadData();
      } else {
        alert(result.error || 'Error al guardar evento');
      }
    } catch (error) {
      console.error('Error guardando evento:', error);
      alert('Error al guardar evento');
    }
  };

  const handleDelete = async (eventoId: number) => {
    const { canDelete } = checkPermissions(currentUser);
    
    if (!canDelete) {
      alert('No tienes permisos para eliminar eventos');
      return;
    }
    
    if (!confirm('¿Estás seguro de que quieres eliminar este evento?')) return;
    
    try {
      const response = await fetch(`/api/eventos/${eventoId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Evento eliminado');
        loadData();
      } else {
        alert(result.error || 'Error al eliminar evento');
      }
    } catch (error) {
      console.error('Error eliminando evento:', error);
      alert('Error al eliminar evento');
    }
  };

  const handleEdit = (evento: Evento) => {
    const { canEdit } = checkPermissions(currentUser);
    
    if (!canEdit) {
      alert('No tienes permisos para editar eventos');
      return;
    }
    
    setEditingEvento(evento);
    setFormData({
      nombre: evento.nombre,
      capacidad: evento.capacidad.toString(),
      direccion: evento.direccion,
      entrada_paga: evento.entrada_paga,
      fecha_inicio: evento.fecha_inicio,
      fecha_fin: evento.fecha_fin,
      estacionamiento: evento.estacionamiento,
      numero_entradas: evento.numero_entradas.toString(),
      precio_entradas: evento.precio_entradas?.toString() || '',
      fk_tipo_evento: '', // Se llenará cuando se carguen los tipos
      fk_lugar: '' // Se llenará cuando se carguen los lugares
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      capacidad: '',
      direccion: '',
      entrada_paga: false,
      fecha_inicio: '',
      fecha_fin: '',
      estacionamiento: false,
      numero_entradas: '',
      precio_entradas: '',
      fk_tipo_evento: '',
      fk_lugar: ''
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleVerCervezas = async (evento: Evento) => {
    setSelectedEvento(evento);
    setModalType('cervezas');
    setLoadingModal(true);
    setShowModal(true);

    try {
      const response = await fetch(`/api/eventos/${evento.evento_id}/productos`);
      const data = await response.json();
      
      if (data.success) {
        setCervezasEvento(data.data);
      } else {
        console.error('Error fetching cervezas:', data.error);
        setCervezasEvento([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setCervezasEvento([]);
    } finally {
      setLoadingModal(false);
    }
  };

  const handleVerCatalogo = async (evento: Evento) => {
    setSelectedEvento(evento);
    setModalType('catalogo');
    setLoadingModal(true);
    setShowModal(true);

    try {
      const response = await fetch(`/api/eventos/${evento.evento_id}/catalogo`);
      const data = await response.json();
      console.log('CATALOGO COMPLETO JSON:', data.data);
      if (data.success) {
        setCatalogoCompleto(data.data);
      } else {
        console.error('Error fetching catálogo:', data.error);
        setCatalogoCompleto([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setCatalogoCompleto([]);
    } finally {
      setLoadingModal(false);
    }
  };

  const handleVerEmpleados = async (evento: Evento) => {
    setSelectedEvento(evento);
    setModalType('empleados');
    setLoadingModal(true);
    setShowModal(true);

    try {
      const response = await fetch(`/api/eventos/${evento.evento_id}/empleados`);
      const data = await response.json();
      
      if (data.success) {
        setEmpleados(data.data);
      } else {
        console.error('Error fetching empleados:', data.error);
        setEmpleados([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setEmpleados([]);
    } finally {
      setLoadingModal(false);
    }
  };

  const handleVerProveedores = async (evento: Evento) => {
    setSelectedEvento(evento);
    setModalType('proveedores');
    setLoadingModal(true);
    setShowModal(true);

    try {
      const response = await fetch(`/api/eventos/${evento.evento_id}/proveedores`);
      const data = await response.json();
      
      if (data.success) {
        setProveedores(data.data);
      } else {
        console.error('Error fetching proveedores:', data.error);
        setProveedores([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setProveedores([]);
    } finally {
      setLoadingModal(false);
    }
  };

  const handleDebug = async () => {
    try {
      const response = await fetch('/api/debug-eventos');
      const result = await response.json();
      
      if (result.success) {
        console.log('=== DEBUG EVENTOS ===');
        console.log('Conexión:', result.data.conexion ? '✅ OK' : '❌ ERROR');
        console.log('Tablas encontradas:', result.data.tablas_encontradas);
        console.log('Total eventos:', result.data.total_eventos);
        console.log('Total EVENTO_MIEMBRO_ACAUCAB:', result.data.total_evento_miembro_acaucab);
        console.log('Funciones encontradas:', result.data.funciones_encontradas);
        console.log('Productos test:', result.data.productos_test);
        console.log('Catálogo test:', result.data.catalogo_test);
        console.log('Diagnóstico:', result.data.diagnostico);
        
        const resumen = `
🔍 DIAGNÓSTICO EVENTOS:

${result.data.diagnostico.join('\n')}

📊 RESUMEN:
• Eventos: ${result.data.total_eventos}
• EVENTO_MIEMBRO_ACAUCAB: ${result.data.total_evento_miembro_acaucab}
• Funciones SQL: ${result.data.funciones_encontradas.join(', ') || 'Ninguna'}
• Productos test: ${result.data.productos_test || 0}
• Catálogo test: ${result.data.catalogo_test || 0}

${result.data.total_evento_miembro_acaucab === 0 ? '💡 SUGERENCIA: Usa el botón "Configurar Datos de Prueba" para crear datos de ejemplo' : ''}
        `;
        
        alert(resumen);
      } else {
        alert('Error en debug: ' + result.error);
      }
    } catch (error) {
      console.error('Error en debug:', error);
      alert('Error al ejecutar debug');
    }
  };

  const handleSetupTestData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/setup-test-data', {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        const resumen = `
✅ DATOS DE PRUEBA CONFIGURADOS EXITOSAMENTE:

Eventos: ${result.data.eventos}
Productos en catálogo: ${result.data.catalogo}
Empleados asignados: ${result.data.empleados_asignados}
Eventos creados: ${result.data.eventos_creados}

🔄 Los datos se han configurado correctamente. ¡PRUEBA EL CATÁLOGO AHORA!
        `;
        
        alert(resumen);
        await loadData(); // Recargar datos
      } else {
        alert('❌ Error configurando datos de prueba: ' + result.error);
      }
    } catch (error) {
      console.error('Error configurando datos de prueba:', error);
      alert('❌ Error configurando datos de prueba');
    } finally {
      setLoading(false);
    }
  };

  const getBeerImage = (beerName: string) => {
    const name = beerName.toLowerCase();
    
    if (name.includes('pilsner') || name.includes('clásica') || name.includes('dorada')) return '/cervezas/PILSNER.png';
    if (name.includes('ipa') || name.includes('amarga') || name.includes('pale')) return '/cervezas/IPA.png';
    if (name.includes('weizen') || name.includes('blanca') || name.includes('trigo')) return '/cervezas/WEIZEN.png';
    if (name.includes('stout') || name.includes('irlandesa') || name.includes('cremosa')) return '/cervezas/STOUT.png';
    if (name.includes('dubbel') || name.includes('belga') || name.includes('abadía')) return '/cervezas/DUBBEL.png';
    if (name.includes('amber') || name.includes('americana')) return '/cervezas/AMBER.png';
    if (name.includes('bock')) return '/cervezas/BOCK.png';
    if (name.includes('porter')) return '/cervezas/PORTER.png';
    if (name.includes('golden')) return '/cervezas/GOLDEN.png';
    if (name.includes('barley')) return '/cervezas/BARLEY.png';
    if (name.includes('destilo')) return '/cervezas/DESTILO.png';
    if (name.includes('dos leones')) return '/cervezas/DOS LEONES.png';
    if (name.includes('benitz')) return '/cervezas/BENITZ.png';
    if (name.includes('mito') || name.includes('candileja')) return '/cervezas/MITO.png';
    if (name.includes('lago ángel') || name.includes('demonio')) return '/cervezas/LAGO ANGEL.png';
    if (name.includes('barricas')) return '/cervezas/BARRICAS.png';
    if (name.includes('aldarra') || name.includes('mantuana')) return '/cervezas/ALDARRA.png';
    
    return '/cervezas/PILSNER.png';
  };

  const handleCreateActividad = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/eventos/${actividadFormData.evento_id}/actividades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: actividadFormData.nombre,
          fecha: actividadFormData.fecha,
          hora_inicio: actividadFormData.hora_inicio,
          hora_fin: actividadFormData.hora_fin
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Actividad creada exitosamente');
        setShowActividadForm(false);
        setActividadFormData({ nombre: '', fecha: '', hora_inicio: '', hora_fin: '', evento_id: '' });
      } else {
        alert('Error al crear actividad: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating actividad:', error);
      alert('Error al crear actividad');
    }
  };

  // Asegurar que eventos sea siempre un array
  const eventosArray = Array.isArray(eventos) ? eventos : [];
  
  const filteredEventos = eventosArray.filter(evento =>
    evento.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evento.tipo_evento_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evento.lugar_nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  const { canCreate, canEdit, canDelete, canView } = checkPermissions(currentUser);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header con diseño moderno */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-blue-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                🍺 Gestión de Eventos
              </h1>
              <p className="text-lg text-gray-600">
                {canView && !canCreate && !canEdit && !canDelete 
                  ? 'Consulta los eventos de cerveza artesanal' 
                  : 'Administra los eventos de cerveza artesanal'
                }
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              {canCreate && (
                <button 
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold text-lg"
                >
                  ✨ Nuevo Evento
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Barra de búsqueda moderna */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-blue-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-400 text-xl">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Buscar eventos por nombre, tipo o lugar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg transition-all duration-300"
            />
          </div>
        </div>

        {/* Formulario Modal con diseño moderno */}
        {showForm && (canCreate || canEdit) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {editingEvento ? '✏️ Editar Evento' : '✨ Crear Nuevo Evento'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingEvento(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                        🏷️ Nombre del Evento
                      </label>
                      <input
                        id="nombre"
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="capacidad" className="block text-sm font-semibold text-gray-700 mb-2">
                        👥 Capacidad
                      </label>
                      <input
                        id="capacidad"
                        type="number"
                        value={formData.capacidad}
                        onChange={(e) => setFormData({...formData, capacidad: e.target.value})}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="direccion" className="block text-sm font-semibold text-gray-700 mb-2">
                        📍 Dirección
                      </label>
                      <input
                        id="direccion"
                        type="text"
                        value={formData.direccion}
                        onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="fecha_inicio" className="block text-sm font-semibold text-gray-700 mb-2">
                        📅 Fecha de Inicio
                      </label>
                      <input
                        id="fecha_inicio"
                        type="date"
                        value={formData.fecha_inicio}
                        onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="fecha_fin" className="block text-sm font-semibold text-gray-700 mb-2">
                        📅 Fecha de Fin
                      </label>
                      <input
                        id="fecha_fin"
                        type="date"
                        value={formData.fecha_fin}
                        onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="tipo_evento" className="block text-sm font-semibold text-gray-700 mb-2">
                        🎭 Tipo de Evento
                      </label>
                      <select
                        value={formData.fk_tipo_evento}
                        onChange={(e) => setFormData({...formData, fk_tipo_evento: e.target.value})}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300"
                        required
                      >
                        <option value="">Seleccionar tipo</option>
                        {tiposEvento.map((tipo) => (
                          <option key={tipo.tipo_evento_id} value={tipo.tipo_evento_id}>
                            {tipo.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="lugar" className="block text-sm font-semibold text-gray-700 mb-2">
                        🏢 Lugar
                      </label>
                      <select
                        value={formData.fk_lugar}
                        onChange={(e) => setFormData({...formData, fk_lugar: e.target.value})}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300"
                        required
                      >
                        <option value="">Seleccionar lugar</option>
                        {lugares.map((lugar) => (
                          <option key={lugar.lugar_id} value={lugar.lugar_id}>
                            {lugar.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="numero_entradas" className="block text-sm font-semibold text-gray-700 mb-2">
                        🎫 Número de Entradas
                      </label>
                      <input
                        id="numero_entradas"
                        type="number"
                        value={formData.numero_entradas}
                        onChange={(e) => setFormData({...formData, numero_entradas: e.target.value})}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="precio_entradas" className="block text-sm font-semibold text-gray-700 mb-2">
                        💰 Precio de Entradas
                      </label>
                      <input
                        id="precio_entradas"
                        type="number"
                        value={formData.precio_entradas}
                        onChange={(e) => setFormData({...formData, precio_entradas: e.target.value})}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-8">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="entrada_paga"
                        checked={formData.entrada_paga}
                        onChange={(e) => setFormData({...formData, entrada_paga: e.target.checked})}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="entrada_paga" className="text-lg font-medium text-gray-700">💰 Entrada Paga</label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="estacionamiento"
                        checked={formData.estacionamiento}
                        onChange={(e) => setFormData({...formData, estacionamiento: e.target.checked})}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="estacionamiento" className="text-lg font-medium text-gray-700">🚗 Estacionamiento</label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      className="px-8 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold text-gray-700"
                      onClick={() => {
                        setShowForm(false);
                        setEditingEvento(null);
                        resetForm();
                      }}
                    >
                      ❌ Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
                    >
                      {editingEvento ? '💾 Actualizar' : '✨ Crear'} Evento
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal del Catálogo de Cervezas */}
        {showModal && selectedEvento && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">
                      {modalType === 'catalogo' ? '👁️ Catálogo Completo' : 
                       modalType === 'empleados' ? '👨‍💼 Empleados Asignados' :
                       modalType === 'proveedores' ? '🏭 Miembros ACAUCAB' : '🍺 Catálogo de Cervezas'}
                    </h3>
                    <p className="text-lg text-gray-600">
                      {selectedEvento.nombre} - {selectedEvento.tipo_evento_nombre}
                    </p>
                    <p className="text-sm text-gray-500">
                      📅 {formatDate(selectedEvento.fecha_inicio)} - {formatDate(selectedEvento.fecha_fin)} | 📍 {selectedEvento.lugar_nombre}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedEvento(null);
                      setCervezasEvento([]);
                      setCatalogoCompleto([]);
                      setEmpleados([]);
                      setProveedores([]);
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {loadingModal ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando datos...</p>
                  </div>
                ) : (
                  <>
                    {/* Contenido para catálogo de cervezas */}
                    {modalType === 'cervezas' && (
                      cervezasEvento.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="text-6xl mb-4">🍺</div>
                          <h4 className="text-2xl font-bold text-gray-800 mb-2">
                            No hay cervezas disponibles
                          </h4>
                          <p className="text-gray-600">
                            Este evento aún no tiene cervezas asignadas
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {cervezasEvento.map((cerveza) => (
                            <div key={cerveza.evento_miembro_acaucab_id} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-200 overflow-hidden">
                              <div className="relative">
                                <img
                                  src={getBeerImage(cerveza.cerveza_nombre)}
                                  alt={cerveza.cerveza_nombre}
                                  className="w-full h-64 object-cover"
                                />
                                <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-lg text-sm font-semibold">
                                  {cerveza.presentacion_capacidad}ml
                                </div>
                              </div>
                              
                              <div className="p-6">
                                <h4 className="text-2xl font-bold text-gray-800 mb-3">
                                  {cerveza.cerveza_nombre}
                                </h4>
                                
                                {/* Información del proveedor */}
                                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                                  <h5 className="font-semibold text-blue-800 mb-2 flex items-center">
                                    🏭 {cerveza.proveedor_nombre}
                                  </h5>
                                  <p className="text-sm text-blue-700 mb-1">
                                    <span className="font-medium">Presentación:</span> {cerveza.presentacion_material} {cerveza.presentacion_capacidad}ml
                                  </p>
                                </div>
                                
                                {/* Stock y disponibilidad */}
                                <div className="flex items-center justify-between bg-green-50 rounded-lg p-4">
                                  <div className="flex items-center text-green-700">
                                    <span className="text-2xl mr-3">📦</span>
                                    <div>
                                      <span className="font-bold text-xl">{cerveza.cantidad_disponible}</span>
                                      <span className="text-sm ml-1">unidades disponibles</span>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                                    ✅ Disponible
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )}

                    {/* Contenido para catálogo completo */}
                    {modalType === 'catalogo' && (
                      catalogoCompleto.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="text-6xl mb-4">👁️</div>
                          <h4 className="text-2xl font-bold text-gray-800 mb-2">
                            No hay datos del catálogo completo
                          </h4>
                          <p className="text-gray-600">
                            Este evento aún no tiene información detallada del catálogo
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {catalogoCompleto.map((item) => (
                            <div key={item.evento_miembro_acaucab_id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="text-xl font-bold text-gray-800 mb-3">
                                    {item.cerveza_nombre}
                                  </h4>
                                  <div className="space-y-2">
                                    <p><span className="font-semibold">Presentación:</span> {item.presentacion_material} {item.presentacion_capacidad}ml</p>
                                    <p><span className="font-semibold">Cantidad:</span> {item.cantidad_disponible} unidades</p>
                                  </div>
                                </div>
                                <div>
                                  <h5 className="font-semibold text-blue-800 mb-2">🏭 Proveedor</h5>
                                  <p className="text-sm text-gray-700 mb-1">{item.proveedor_nombre}</p>
                                  <p className="text-sm text-gray-600">RIF: {item.proveedor_rif}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )}

                    {/* Contenido para empleados */}
                    {modalType === 'empleados' && (
                      empleados.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="text-6xl mb-4">👨‍💼</div>
                          <h4 className="text-2xl font-bold text-gray-800 mb-2">
                            No hay empleados asignados
                          </h4>
                          <p className="text-gray-600">
                            Este evento aún no tiene empleados asignados
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {empleados.map((empleado) => (
                            <div key={empleado.evento_empleado_id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border border-purple-200">
                              <div className="text-center">
                                <div className="text-4xl mb-3">👨‍💼</div>
                                <h4 className="text-lg font-bold text-gray-800 mb-2">
                                  {empleado.primer_nombre} {empleado.segundo_nombre} {empleado.primer_apellido} {empleado.segundo_apellido}
                                </h4>
                                <p className="text-sm text-gray-600 mb-3">Cédula: {empleado.cedula}</p>
                                <div className="space-y-1 text-sm">
                                  {/* Eliminado: cargo_actual, departamento_actual, salario_actual */}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )}

                    {/* Contenido para proveedores */}
                    {modalType === 'proveedores' && (
                      proveedores.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="text-6xl mb-4">🏭</div>
                          <h4 className="text-2xl font-bold text-gray-800 mb-2">
                            No hay miembros ACAUCAB asignados
                          </h4>
                          <p className="text-gray-600">
                            Este evento aún no tiene miembros ACAUCAB asignados
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {proveedores.map((proveedor) => (
                            <div key={proveedor.miembro_id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                              <div className="flex flex-col h-full justify-between">
                                <div>
                                  <h4 className="text-xl font-bold text-gray-800 mb-2">
                                    🏭 {proveedor.razon_social}
                                  </h4>
                                  <p className="text-sm text-gray-600 mb-1">
                                    <span className="font-semibold">Denominación comercial:</span> {proveedor.denominacion_comercial}
                                  </p>
                                  <p className="text-sm text-gray-600 mb-1">
                                    <span className="font-semibold">Dirección:</span> {proveedor.direccion}
                                  </p>
                                  <p className="text-sm text-blue-700 mb-1">
                                    <span className="font-semibold">Web:</span> <a href={proveedor.pagina_web} target="_blank" rel="noopener noreferrer" className="underline">{proveedor.pagina_web}</a>
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal para crear actividades */}
        {showActividadForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    🎯 Crear Nueva Actividad
                  </h3>
                  <button
                    onClick={() => {
                      setShowActividadForm(false);
                      setActividadFormData({ nombre: '', fecha: '', hora_inicio: '', hora_fin: '', evento_id: '' });
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleCreateActividad} className="space-y-6">
                  <div>
                    <label htmlFor="evento_id" className="block text-sm font-semibold text-gray-700 mb-2">
                      🍺 Seleccionar Evento
                    </label>
                    <select
                      id="evento_id"
                      value={actividadFormData.evento_id}
                      onChange={(e) => setActividadFormData({...actividadFormData, evento_id: e.target.value})}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-300"
                      required
                    >
                      <option value="">Seleccionar evento</option>
                      {eventos.map((evento) => (
                        <option key={evento.evento_id} value={evento.evento_id}>
                          {evento.nombre} - {evento.tipo_evento_nombre} ({formatDate(evento.fecha_inicio)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="actividad_nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                      🎯 Nombre de la Actividad
                    </label>
                    <input
                      id="actividad_nombre"
                      type="text"
                      value={actividadFormData.nombre}
                      onChange={(e) => setActividadFormData({...actividadFormData, nombre: e.target.value})}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-300"
                      placeholder="Ej: Degustación de cervezas, Concurso de homebrewers..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="actividad_fecha" className="block text-sm font-semibold text-gray-700 mb-2">
                        📅 Fecha
                      </label>
                      <input
                        id="actividad_fecha"
                        type="date"
                        value={actividadFormData.fecha}
                        onChange={(e) => setActividadFormData({...actividadFormData, fecha: e.target.value})}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-300"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="actividad_hora_inicio" className="block text-sm font-semibold text-gray-700 mb-2">
                        ⏰ Hora de Inicio
                      </label>
                      <input
                        id="actividad_hora_inicio"
                        type="time"
                        value={actividadFormData.hora_inicio}
                        onChange={(e) => setActividadFormData({...actividadFormData, hora_inicio: e.target.value})}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-300"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="actividad_hora_fin" className="block text-sm font-semibold text-gray-700 mb-2">
                        ⏰ Hora de Fin
                      </label>
                      <input
                        id="actividad_hora_fin"
                        type="time"
                        value={actividadFormData.hora_fin}
                        onChange={(e) => setActividadFormData({...actividadFormData, hora_fin: e.target.value})}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowActividadForm(false);
                        setActividadFormData({ nombre: '', fecha: '', hora_inicio: '', hora_fin: '', evento_id: '' });
                      }}
                      className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300 font-semibold"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
                    >
                      🎯 Crear Actividad
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Grid de eventos con diseño minimalista */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEventos.map((evento) => (
            <div key={evento.evento_id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden">
              {/* Header minimalista */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 border-b border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{evento.nombre}</h3>
                    <p className="text-sm text-gray-500">{evento.tipo_evento_nombre}</p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      onClick={() => handleVerCatalogo(evento)}
                      title="Ver catálogo"
                    >
                      🔍
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200"
                      onClick={() => handleVerCervezas(evento)}
                      title="Ver cervezas"
                    >
                      🍺
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                      onClick={() => handleVerProveedores(evento)}
                      title="Ver miembros ACAUCAB"
                    >
                      🏭
                    </button>
                  </div>
                </div>
                
                {/* Fechas */}
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <span className="mr-2">📅</span>
                  <span>{formatDate(evento.fecha_inicio)} - {formatDate(evento.fecha_fin)}</span>
                </div>
                
                {/* Lugar */}
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📍</span>
                  <span>{evento.lugar_nombre}</span>
                </div>
              </div>
              
              {/* Contenido minimalista */}
              <div className="p-4">
                {/* Métricas simples */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-800">{evento.capacidad}</div>
                    <div className="text-xs text-gray-500">Capacidad</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-800">{evento.total_productos_catalogo}</div>
                    <div className="text-xs text-gray-500">Productos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-800">{evento.total_empleados_asignados}</div>
                    <div className="text-xs text-gray-500">Empleados</div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex space-x-2">
                  {canEdit && (
                    <button
                      className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                      onClick={() => handleEdit(evento)}
                    >
                      ✏️ Editar
                    </button>
                  )}
                  {canDelete && (
                    <button
                      className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                      onClick={() => handleDelete(evento.evento_id)}
                    >
                      🗑️ Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje cuando no hay eventos */}
        {filteredEventos.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-blue-200">
            <div className="text-6xl mb-4">🍺</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {searchTerm ? 'No se encontraron eventos' : 'No hay eventos registrados'}
            </h3>
            <p className="text-gray-600 text-lg">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda' 
                : '¡Crea tu primer evento de cerveza artesanal!'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 