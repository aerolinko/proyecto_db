import { getAllLugares } from 'db';
import { getAllLugaresUserCesar } from 'db';
export default async function LugaresPage() {
    const lugar = await getAllLugares();
    const personas = await getAllLugaresUserCesar();
    return (
        <div>
            <h1>Lista de Lugares</h1>
            <ul>
                {personas.map((persona) => (
                    <li key={persona.cliente_id}>{persona.cliente_id} {persona.primer_nombre} {persona.primer_apellido} {persona.cedula}</li>
                ))}
            </ul>
            <ul>
                {lugar.map((lugar) => (
                    <li key={lugar.lugar_id}>{lugar.lugar_id} {lugar.nombre} {lugar.fk_lugar}</li>
                ))}
            </ul>
        </div>
    );
}
