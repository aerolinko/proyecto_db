'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '../../ui/button';
import { Calendar, MapPin, Clock, Plus, Search, Filter, Edit, Trash2, Eye, ArrowLeft } from 'lucide-react';
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
    outline: 'border border-gray-300 text-gray-700',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800'
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

interface Actividad {
  premiacion_id: number;
  nombre: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  tipo: string;
  evento_id: number;
  evento_nombre: string;
  lugar_nombre: string;
}

export default function ActividadesPage() {
  const params = useParams();
  const router = useRouter();
  
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterEvento, setFilterEvento] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedActividad, setSelectedActividad] = useState<Actividad | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    evento_id: ''
  });
  const [eventos, setEventos] = useState<any[]>([]);

  useEffect(() => {
    loadActividades();
    loadEventos();
  }, []);

  const loadActividades = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/actividades');
      const data = await response.json();
      
      if (data.success) {
        setActividades(data.data || []);
      } else {
        toast.error('Error al cargar las actividades');
      }
    } catch (error) {
      console.error('Error cargando actividades:', error);
      toast.error('Error al cargar las actividades');
    } finally {
      setLoading(false);
    }
  };

  const loadEventos = async () => {
    try {
      const response = await fetch('/api/eventos');
      const data = await response.json();
      if (data.success) {
        setEventos(data.data || []);
      } else {
        toast.error('Error al cargar eventos');
      }
    } catch (error) {
      console.error('Error cargando eventos:', error);
      toast.error('Error al cargar eventos');
    }
  };

  const handleCreateActividad = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/eventos/${formData.evento_id}/actividades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          fecha: formData.fecha,
          hora_inicio: formData.hora_inicio,
          hora_fin: formData.hora_fin
        })
      });
      let result = null;
      try {
        result = await response.json();
      } catch (jsonError) {
        toast.error('Respuesta inválida del servidor');
        return;
      }
      if (response.ok && result && result.success) {
        toast.success('Actividad creada exitosamente');
        setShowCreateModal(false);
        setFormData({ nombre: '', fecha: '', hora_inicio: '', hora_fin: '', evento_id: '' });
        loadActividades();
      } else {
        toast.error(result?.error || 'Error al crear actividad');
      }
    } catch (error) {
      console.error('Error creating actividad:', error);
      toast.error('Error al crear actividad');
    }
  };

  const handleUpdateActividad = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedActividad) return;
    
    try {
      const response = await fetch(`/api/actividades/${selectedActividad.premiacion_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          fecha: formData.fecha,
          hora_inicio: formData.hora_inicio,
          hora_fin: formData.hora_fin
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Actividad actualizada exitosamente');
        setShowEditModal(false);
        setSelectedActividad(null);
        setFormData({ nombre: '', fecha: '', hora_inicio: '', hora_fin: '', evento_id: '' });
        loadActividades();
      } else {
        toast.error(result.error || 'Error al actualizar actividad');
      }
    } catch (error) {
      console.error('Error updating actividad:', error);
      toast.error('Error al actualizar actividad');
    }
  };

  const handleDeleteActividad = async (actividadId: number, eventoId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta actividad?')) return;
    try {
      const response = await fetch(`/api/eventos/${eventoId}/actividades/${actividadId}`, {
        method: 'DELETE'
      });
      let result = null;
      try {
        result = await response.json();
      } catch (jsonError) {
        toast.error('Respuesta inválida del servidor');
        return;
      }
      if (response.ok && result && result.success) {
        toast.success('Actividad eliminada exitosamente');
        loadActividades();
      } else {
        toast.error(result?.error || 'Error al eliminar actividad');
      }
    } catch (error) {
      console.error('Error deleting actividad:', error);
      toast.error('Error al eliminar actividad');
    }
  };

  const handleEdit = (actividad: Actividad) => {
    setSelectedActividad(actividad);
    setFormData({
      nombre: actividad.nombre,
      fecha: actividad.fecha,
      hora_inicio: actividad.hora_inicio,
      hora_fin: actividad.hora_fin,
      evento_id: actividad.evento_id.toString()
    });
    setShowEditModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Formato HH:MM
  };

  const getStatusBadge = (fecha: string, horaFin: string) => {
    const now = new Date();
    const actividadDate = new Date(`${fecha}T${horaFin}`);
    
    if (actividadDate < now) {
      return <Badge variant="secondary">Finalizada</Badge>;
    } else if (actividadDate.getDate() === now.getDate()) {
      return <Badge variant="warning">Hoy</Badge>;
    } else {
      return <Badge variant="success">Próxima</Badge>;
    }
  };

  const filteredActividades = actividades.filter(actividad => {
    const matchesSearch = actividad.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         actividad.evento_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         actividad.lugar_nombre.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !filterDate || actividad.fecha === filterDate;
    const matchesEvento = !filterEvento || actividad.evento_id.toString() === filterEvento;
    
    return matchesSearch && matchesDate && matchesEvento;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando actividades...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Actividades</h1>
          <p className="text-gray-600">Administra las actividades (premiaciones) de tus eventos</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nueva Actividad
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Buscar actividades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="evento">Evento</Label>
              <Select value={filterEvento} onValueChange={setFilterEvento}>
                <SelectValue placeholder="Todos los eventos" />
                <SelectItem value="">Todos los eventos</SelectItem>
                {eventos.map(evento => (
                  <SelectItem key={evento.evento_id} value={evento.evento_id.toString()}>
                    {evento.nombre}
                  </SelectItem>
                ))}
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterDate('');
                  setFilterEvento('');
                }}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Actividades */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Actividades ({filteredActividades.length})</CardTitle>
              <CardDescription>
                Lista de todas las actividades (premiaciones) registradas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredActividades.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron actividades</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActividades.map((actividad) => (
                <div key={actividad.premiacion_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{actividad.nombre}</h3>
                        {getStatusBadge(actividad.fecha, actividad.hora_fin)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(actividad.fecha)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(actividad.hora_inicio)} - {formatTime(actividad.hora_fin)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{actividad.evento_nombre} - {actividad.lugar_nombre}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(actividad)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteActividad(actividad.premiacion_id, actividad.evento_id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Crear Actividad */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Crear Nueva Actividad</h2>
            
            <form onSubmit={handleCreateActividad} className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre de la Actividad</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="evento_id">Evento</Label>
                <Select
                  value={formData.evento_id}
                  onValueChange={(value) => {
                    setFormData((prev) => {
                      const eventoSel = eventos.find(ev => ev.evento_id.toString() === value);
                      if (eventoSel && eventoSel.fecha_inicio) {
                        return {
                          ...prev,
                          evento_id: value,
                          fecha: eventoSel.fecha_inicio,
                          hora_inicio: eventoSel.hora_inicio || '',
                          hora_fin: eventoSel.hora_fin || ''
                        };
                      }
                      return { ...prev, evento_id: value };
                    });
                  }}
                >
                  <SelectValue placeholder="Seleccionar evento" />
                  {eventos.map(evento => (
                    <SelectItem key={evento.evento_id} value={evento.evento_id.toString()}>
                      {evento.nombre}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hora_inicio">Hora Inicio</Label>
                  <Input
                    id="hora_inicio"
                    type="time"
                    value={formData.hora_inicio}
                    onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hora_fin">Hora Fin</Label>
                  <Input
                    id="hora_fin"
                    type="time"
                    value={formData.hora_fin}
                    onChange={(e) => setFormData({...formData, hora_fin: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Crear Actividad
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Actividad */}
      {showEditModal && selectedActividad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Editar Actividad</h2>
            
            <form onSubmit={handleUpdateActividad} className="space-y-4">
              <div>
                <Label htmlFor="edit-nombre">Nombre de la Actividad</Label>
                <Input
                  id="edit-nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-fecha">Fecha</Label>
                <Input
                  id="edit-fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-hora_inicio">Hora Inicio</Label>
                  <Input
                    id="edit-hora_inicio"
                    type="time"
                    value={formData.hora_inicio}
                    onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-hora_fin">Hora Fin</Label>
                  <Input
                    id="edit-hora_fin"
                    type="time"
                    value={formData.hora_fin}
                    onChange={(e) => setFormData({...formData, hora_fin: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Actualizar Actividad
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 