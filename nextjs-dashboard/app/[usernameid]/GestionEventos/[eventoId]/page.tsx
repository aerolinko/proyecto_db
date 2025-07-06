'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Badge } from '@/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { Calendar, MapPin, Users, Beer, ArrowLeft, Plus, Trash2, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

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

interface Proveedor {
  miembro_id: number;
  razon_social: string;
  denominacion_comercial: string;
  direccion: string;
  pagina_web: string;
  total_productos: number;
}

interface Producto {
  evento_miembro_acaucab_id: number;
  cerveza_presentacion_id: number;
  nombre_cerveza: string;
  presentacion: string;
  material: string;
  cap_volumen: number;
  cantidad_disponible: number;
  miembro_acaucab_nombre: string;
  miembro_acaucab_rif: string;
  precio_estimado: number;
  stock_actual: number;
}

interface Empleado {
  evento_empleado_id: number;
  empleado_id: number;
  cedula: number;
  nombre_completo: string;
  direccion: string;
  fecha_contrato: string;
  cargo_actual: string;
  departamento_actual: string;
  salario_actual: number;
  telefono: string;
  email: string;
}

interface Estadisticas {
  total_ventas: number;
  total_ingresos: number;
  total_entradas_vendidas: number;
  ingresos_entradas: number;
  productos_mas_vendidos: string;
  clientes_asistentes: number;
  empleados_asignados: number;
  miembros_participantes: number;
  promedio_venta_por_cliente: number;
  fecha_primera_venta: string;
  fecha_ultima_venta: string;
}

interface Cliente {
  evento_cliente_id: number;
  cliente_id: number;
  tipo_cliente: string;
  nombre_completo: string;
  identificacion: string;
  direccion: string;
  total_puntos: number;
  total_compras_evento: number;
  monto_total_compras: number;
  telefono: string;
  email: string;
}

interface Venta {
  venta_evento_id: number;
  fecha_venta: string;
  total_venta: number;
  cliente_nombre: string;
  cliente_tipo: string;
  productos_vendidos: string;
  entradas_vendidas: number;
  ingresos_productos: number;
  ingresos_entradas: number;
}

interface MiembroAcaucab {
  miembro_id: number;
  razon_social: string;
  denominacion_comercial: string;
  direccion: string;
  pagina_web: string;
}

interface CervezaPresentacion {
  cerveza_presentacion_id: number;
  cerveza_nombre: string;
  presentacion_material: string;
  presentacion_capacidad: number;
}

export default function DetalleEvento() {
  const params = useParams();
  const router = useRouter();
  const eventoId = parseInt(params.eventoId as string);

  const [evento, setEvento] = useState<Evento | null>(null);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [miembrosAcaucab, setMiembrosAcaucab] = useState<MiembroAcaucab[]>([]);
  const [cervezasProveedor, setCervezasProveedor] = useState<CervezaPresentacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProveedor, setShowAddProveedor] = useState(false);
  const [formData, setFormData] = useState({
    miembro_id: '',
    cerveza_presentacion_id: '',
    cantidad: ''
  });

  useEffect(() => {
    if (eventoId) {
      loadEventoData();
    }
  }, [eventoId]);

  const loadEventoData = async () => {
    try {
      setLoading(true);
      const [eventoRes, catalogoRes, empleadosRes, estadisticasRes, clientesRes, ventasRes] = await Promise.all([
        fetch(`/api/eventos/${eventoId}`),
        fetch(`/api/eventos/${eventoId}/catalogo`),
        fetch(`/api/eventos/${eventoId}/empleados`),
        fetch(`/api/eventos/${eventoId}/estadisticas`),
        fetch(`/api/eventos/${eventoId}/clientes`),
        fetch(`/api/eventos/${eventoId}/ventas`)
      ]);

      const eventoData = await eventoRes.json();
      const catalogoData = await catalogoRes.json();
      const empleadosData = await empleadosRes.json();
      const estadisticasData = await estadisticasRes.json();
      const clientesData = await clientesRes.json();
      const ventasData = await ventasRes.json();

      if (eventoData.success) setEvento(eventoData.data);
      if (catalogoData.success) setProductos(catalogoData.data);
      if (empleadosData.success) setEmpleados(empleadosData.data);
      if (estadisticasData.success) setEstadisticas(estadisticasData.data);
      if (clientesData.success) setClientes(clientesData.data);
      if (ventasData.success) setVentas(ventasData.data);
      
      console.log('Datos cargados:', {
        evento: eventoData.data,
        catalogo: catalogoData.data,
        empleados: empleadosData.data,
        estadisticas: estadisticasData.data,
        clientes: clientesData.data,
        ventas: ventasData.data
      });
    } catch (error) {
      console.error('Error cargando datos del evento:', error);
      toast.error('Error al cargar los datos del evento');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProveedor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/eventos/${eventoId}/proveedores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          miembro_id: parseInt(formData.miembro_id),
          cerveza_presentacion_id: parseInt(formData.cerveza_presentacion_id),
          cantidad: parseInt(formData.cantidad)
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Proveedor agregado exitosamente');
        setShowAddProveedor(false);
        setFormData({ miembro_id: '', cerveza_presentacion_id: '', cantidad: '' });
        loadEventoData();
      } else {
        toast.error(result.error || 'Error al agregar proveedor');
      }
    } catch (error) {
      console.error('Error agregando proveedor:', error);
      toast.error('Error al agregar proveedor');
    }
  };

  const handleRemoveProveedor = async (eventoMiembroAcaucabId: number) => {
    if (!confirm('¿Estás seguro de que quieres remover este proveedor?')) return;
    
    try {
      const response = await fetch(`/api/eventos/${eventoId}/proveedores/${eventoMiembroAcaucabId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Proveedor removido exitosamente');
        loadEventoData();
      } else {
        toast.error(result.error || 'Error al remover proveedor');
      }
    } catch (error) {
      console.error('Error removiendo proveedor:', error);
      toast.error('Error al remover proveedor');
    }
  };

  const handleMiembroChange = async (miembroId: string) => {
    if (!miembroId) {
      setCervezasProveedor([]);
      return;
    }

    try {
      const response = await fetch(`/api/eventos/miembros/${miembroId}/cervezas`);
      const result = await response.json();
      
      if (result.success) {
        setCervezasProveedor(result.data);
      }
    } catch (error) {
      console.error('Error cargando cervezas:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES'
    }).format(amount);
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
          <Button variant="outline" onClick={() => router.back()}>
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

          <div className="mt-4 flex flex-wrap gap-2">
            {evento.entrada_paga && (
              <Badge variant="secondary">
                Entrada Paga: {formatCurrency(evento.precio_entradas || 0)}
              </Badge>
            )}
            {evento.estacionamiento && (
              <Badge variant="outline">Estacionamiento</Badge>
            )}
            <Badge variant="default">
              {evento.numero_entradas} entradas disponibles
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      {estadisticas && (
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas del Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{estadisticas.total_proveedores}</div>
                <div className="text-sm text-muted-foreground">Proveedores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{estadisticas.total_productos}</div>
                <div className="text-sm text-muted-foreground">Productos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{estadisticas.total_ventas}</div>
                <div className="text-sm text-muted-foreground">Ventas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(estadisticas.ingresos_totales)}
                </div>
                <div className="text-sm text-muted-foreground">Ingresos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="proveedores" className="space-y-4">
        <TabsList>
          <TabsTrigger value="proveedores">Proveedores</TabsTrigger>
          <TabsTrigger value="productos">Productos</TabsTrigger>
          <TabsTrigger value="empleados">Empleados</TabsTrigger>
        </TabsList>

        <TabsContent value="proveedores" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Proveedores del Evento</h3>
            <Button onClick={() => setShowAddProveedor(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Proveedor
            </Button>
          </div>

          {showAddProveedor && (
            <Card>
              <CardHeader>
                <CardTitle>Agregar Proveedor</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProveedor} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="miembro">Proveedor</Label>
                      <Select
                        value={formData.miembro_id}
                        onValueChange={(value) => {
                          setFormData({...formData, miembro_id: value});
                          handleMiembroChange(value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar proveedor" />
                        </SelectTrigger>
                        <SelectContent>
                          {miembrosAcaucab.map((miembro) => (
                            <SelectItem key={miembro.miembro_id} value={miembro.miembro_id.toString()}>
                              {miembro.denominacion_comercial}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="cerveza">Cerveza</Label>
                      <Select
                        value={formData.cerveza_presentacion_id}
                        onValueChange={(value) => setFormData({...formData, cerveza_presentacion_id: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar cerveza" />
                        </SelectTrigger>
                        <SelectContent>
                          {cervezasProveedor.map((cerveza) => (
                            <SelectItem key={cerveza.cerveza_presentacion_id} value={cerveza.cerveza_presentacion_id.toString()}>
                              {cerveza.cerveza_nombre} ({cerveza.presentacion_capacidad}ml {cerveza.presentacion_material})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="cantidad">Cantidad</Label>
                      <Input
                        id="cantidad"
                        type="number"
                        value={formData.cantidad}
                        onChange={(e) => setFormData({...formData, cantidad: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddProveedor(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">
                      Agregar Proveedor
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proveedores.map((proveedor) => (
              <Card key={proveedor.miembro_id}>
                <CardHeader>
                  <CardTitle className="text-lg">{proveedor.denominacion_comercial}</CardTitle>
                  <CardDescription>{proveedor.razon_social}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <MapPin className="mr-2 h-4 w-4" />
                      {proveedor.direccion}
                    </div>
                    <div className="flex items-center text-sm">
                      <Beer className="mr-2 h-4 w-4" />
                      {proveedor.total_productos} productos
                    </div>
                    <Badge variant="outline">
                      <a href={proveedor.pagina_web} target="_blank" rel="noopener noreferrer">
                        Ver sitio web
                      </a>
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="productos" className="space-y-4">
          <h3 className="text-lg font-semibold">Productos del Evento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productos.map((producto) => (
              <Card key={producto.evento_miembro_acaucab_id}>
                <CardHeader>
                  <CardTitle className="text-lg">{producto.cerveza_nombre}</CardTitle>
                  <CardDescription>{producto.proveedor_nombre}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Beer className="mr-2 h-4 w-4" />
                      {producto.presentacion_capacidad}ml {producto.presentacion_material}
                    </div>
                    <div className="flex items-center text-sm">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      {producto.cantidad_disponible} unidades disponibles
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveProveedor(producto.evento_miembro_acaucab_id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="empleados" className="space-y-4">
          <h3 className="text-lg font-semibold">Empleados Asignados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {empleados.map((empleado) => (
              <Card key={empleado.evento_empleado_id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {empleado.primer_nombre} {empleado.primer_apellido}
                  </CardTitle>
                  <CardDescription>Cédula: {empleado.cedula}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Users className="mr-2 h-4 w-4" />
                      {empleado.segundo_nombre} {empleado.segundo_apellido}
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="mr-2 h-4 w-4" />
                      {empleado.direccion}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 