"use client";
import React from "react";

type Evento = {
  evento_id: number;
  evento_nombre: string;
  evento_fecha_inicio: string;
};

interface SelectEventoProps {
  eventos: Evento[];
  onSelect: (eventoId: number) => void;
}

export default function SelectEvento({ eventos, onSelect }: SelectEventoProps) {
  return (
    <div className="mb-6">
      <label className="block text-lg font-bold mb-2 text-blue-800">Selecciona un evento</label>
      <select
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        onChange={e => onSelect(Number(e.target.value))}
        defaultValue=""
      >
        <option value="" disabled>-- Selecciona un evento --</option>
        {eventos.map(ev => (
          <option key={ev.evento_id} value={ev.evento_id}>
            {ev.evento_nombre} ({ev.evento_fecha_inicio})
          </option>
        ))}
      </select>
    </div>
  );
}
