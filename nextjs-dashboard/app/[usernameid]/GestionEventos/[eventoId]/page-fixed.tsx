'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '../../../ui/button';
import { Calendar, MapPin, Users, Beer, ArrowLeft, Plus, Trash2, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'sonner';

// Componentes simples
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-gray-600 ${className}`}>
    {children}
  </p>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const Input = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
  />
);

const Label = ({ children, htmlFor, className = '' }: { children: React.ReactNode; htmlFor?: string; className?: string }) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
    {children}
  </label>
);

const Badge = ({ children, variant = 'default', className = '' }: { children: React.ReactNode; variant?: string; className?: string }) => {
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-700'
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant as keyof typeof variantClasses] || variantClasses.default} ${className}`}>
      {children}
    </span>
  );
};

const Select = ({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange: (value: string) => void }) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {children}
  </select>
);

const SelectTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const SelectValue = ({ placeholder }: { placeholder: string }) => <option value="">{placeholder}</option>;
const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const SelectItem = ({ children, value }: { children: React.ReactNode; value: string }) => (
  <option value={value}>{children}</option>
);

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
  precio_entradas: number | null;
  tipo_evento_nombre: string;
  lugar_nombre: string;
}

interface Actividad {
  premiacion_id: number;
  nombre: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  tipo: string;
  premiacion_evento_id: number;
}

export default function DetalleEvento() {
  const params = useParams();
  const router = useRouter();
  const eventoId = parseInt(params.eventoId as string);

  const [evento, setEvento] = useState<Evento | null>(null);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddActividad, setShowAddActividad] = useState(false);
  const [activeTab, setActiveTab] = useState('actividades');
  const [actividadFormData, setActividadFormData] = useState({
    nombre: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: ''
  });

  useEffect(() => {
    if (eventoId) {
      loadEventoData();
    }
  }, [eventoId]);

  const loadEventoData = async () => {
    try {
      setLoading(true);
      const [eventoRes, actividadesRes] = await Promise.all([
        fetch(`/api/eventos/${eventoId}`),
        fetch(`/api/eventos/${eventoId}/actividades`)
      ]);

      const eventoData = await eventoRes.json();
      const actividadesData = await actividadesRes.json();

      if (eventoData.success) setEvento(eventoData.data);
      if (actividadesData.success) setActividades(actividadesData.data);
      
    } catch (error) {
      console.error('Error cargando datos del evento:', error);
      toast.error('Error al cargar los datos del evento');
    } finally {
      setLoading(false);
    }
  };

  const handleAddActividad = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/eventos/${eventoId}/actividades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actividadFormData)
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Actividad creada exitosamente');
        setShowAddActividad(false);
        setActividadFormData({ nombre: '', fecha: '', hora_inicio: '', hora_fin: '' });
        loadEventoData();
      } else {
        toast.error(result.error || 'Error al crear actividad');
      }
    } catch (error) {
      console.error('Error creating actividad:', error);
      toast.error('Error al crear actividad');
    }
  };

  const handleDeleteActividad = async (actividadId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta actividad?')) return;
    
    try {
      const response = await fetch(`/api/eventos/${eventoId}/actividades/${actividadId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Actividad eliminada exitosamente');
        loadEventoData();
      } else {
        toast.error(result.error || 'Error al eliminar actividad');
      }
    } catch (error) {
      console.error('Error deleting actividad:', error);
      toast.error('Error al eliminar actividad');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Formato HH:MM
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando evento...</div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Evento no encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={() => router.back()} className="bg-gray-500 hover:bg-gray-600">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{evento.nombre}</h1>
            <p className="text-muted-foreground">{evento.tipo_evento_nombre}</p>
          </div>
        </div>
      </div>

      {/* Información del Evento */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Fechas</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(evento.fecha_inicio)} - {formatDate(evento.fecha_fin)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Ubicación</p>
                <p className="text-sm text-muted-foreground">{evento.lugar_nombre}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Capacidad</p>
                <p className="text-sm text-muted-foreground">{evento.capacidad} personas</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Beer className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Entradas</p>
                <p className="text-sm text-muted-foreground">
                  {evento.entrada_paga ? `$${evento.precio_entradas}` : 'Gratis'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('actividades')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'actividades' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Actividades
          </button>
        </div>

        {activeTab === 'actividades' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Actividades del Evento</h3>
              <Button onClick={() => setShowAddActividad(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Actividad
              </Button>
            </div>

            {showAddActividad && (
              <Card>
                <CardHeader>
                  <CardTitle>Agregar Nueva Actividad</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddActividad} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nombre">Nombre de la Actividad</Label>
                        <Input
                          id="nombre"
                          type="text"
                          value={actividadFormData.nombre}
                          onChange={(e) => setActividadFormData({...actividadFormData, nombre: e.target.value})}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="fecha">Fecha</Label>
                        <Input
                          id="fecha"
                          type="date"
                          value={actividadFormData.fecha}
                          onChange={(e) => setActividadFormData({...actividadFormData, fecha: e.target.value})}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="hora_inicio">Hora de Inicio</Label>
                        <Input
                          id="hora_inicio"
                          type="time"
                          value={actividadFormData.hora_inicio}
                          onChange={(e) => setActividadFormData({...actividadFormData, hora_inicio: e.target.value})}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="hora_fin">Hora de Fin</Label>
                        <Input
                          id="hora_fin"
                          type="time"
                          value={actividadFormData.hora_fin}
                          onChange={(e) => setActividadFormData({...actividadFormData, hora_fin: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        onClick={() => setShowAddActividad(false)}
                        className="bg-gray-500 hover:bg-gray-600"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">
                        Crear Actividad
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {actividades.map((actividad) => (
                <Card key={actividad.premiacion_id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{actividad.nombre}</CardTitle>
                    <CardDescription>Actividad del evento</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4" />
                        {formatDate(actividad.fecha)}
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4" />
                        {formatTime(actividad.hora_inicio)} - {formatTime(actividad.hora_fin)}
                      </div>
                      <Button
                        onClick={() => handleDeleteActividad(actividad.premiacion_id)}
                        className="bg-red-500 hover:bg-red-600 text-sm px-3 py-1"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {actividades.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Calendar className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No hay actividades programadas
                </h3>
                <p className="text-gray-500">
                  Agrega actividades para organizar el evento
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 