'use client'

import { useState } from 'react';

export default function DebugPermissions() {
  const [userId, setUserId] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const debugPermissions = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/debug-permissions?userId=${userId}`);
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Error:', error);
      setDebugInfo({ error: 'Error al obtener permisos' });
    } finally {
      setLoading(false);
    }
  };

  const cleanRoles = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/clean-client-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: parseInt(userId) }),
      });
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Error:', error);
      setDebugInfo({ error: 'Error al limpiar roles' });
    } finally {
      setLoading(false);
    }
  };

  const analyzeRoles = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/analyze-roles?userId=${userId}`);
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Error:', error);
      setDebugInfo({ error: 'Error al analizar roles' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Permisos</h1>
      
      <div className="mb-4">
        <input
          type="number"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="ID del usuario"
          className="border p-2 mr-2"
        />
        <button
          onClick={debugPermissions}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          {loading ? 'Cargando...' : 'Debug Permisos'}
        </button>
        <button
          onClick={cleanRoles}
          disabled={loading}
          className="bg-red-500 text-white px-4 py-2 rounded mr-2"
        >
          {loading ? 'Cargando...' : 'Limpiar Roles'}
        </button>
        <button
          onClick={analyzeRoles}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          {loading ? 'Cargando...' : 'Analizar Roles'}
        </button>
      </div>

      {debugInfo && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Resultado:</h2>
          
          {/* Información del usuario */}
          {debugInfo.userInfo && (
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <h3 className="font-semibold text-blue-800">Información del Usuario:</h3>
              <p><strong>Tipo:</strong> {debugInfo.userInfo.tipo_usuario}</p>
              <p><strong>ID:</strong> {debugInfo.userInfo.usuario_id}</p>
              <p><strong>Usuario:</strong> {debugInfo.userInfo.nombre_usuario}</p>
            </div>
          )}
          
          {/* Roles del usuario */}
          {debugInfo.userRoles && debugInfo.userRoles.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 rounded">
              <h3 className="font-semibold text-yellow-800">⚠️ ROLES ASIGNADOS (PROBLEMA):</h3>
              <ul className="list-disc list-inside">
                {debugInfo.userRoles.map((role: any, index: number) => (
                  <li key={index}>
                    <strong>{role.rol_nombre}</strong> (ID: {role.rol_id})
                  </li>
                ))}
              </ul>
              {debugInfo.isClientWithRoles && (
                <p className="text-red-600 font-semibold mt-2">
                  ⚠️ ¡PROBLEMA! Este cliente tiene roles asignados que NO debería tener.
                </p>
              )}
            </div>
          )}
          
          {/* Permisos */}
          {debugInfo.permissions && (
            <div className="mb-4 p-3 bg-green-50 rounded">
              <h3 className="font-semibold text-green-800">Permisos ({debugInfo.count}):</h3>
              <div className="max-h-60 overflow-y-auto">
                <ul className="list-disc list-inside">
                  {debugInfo.permissions.map((perm: any, index: number) => (
                    <li key={index}>{perm.descripcion}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* JSON completo */}
          <details className="mt-4">
            <summary className="cursor-pointer font-semibold">Ver JSON completo</summary>
            <pre className="text-sm overflow-auto mt-2">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
} 