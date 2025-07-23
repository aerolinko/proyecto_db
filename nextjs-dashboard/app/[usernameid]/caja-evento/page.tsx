import { cookies } from "next/headers";
import { getUserPermissionsSimple } from "@/db";
import CatalogoEventoClient from "./CatalogoEventoClient";

export default async function CatalogoEvento() {
  const cookieStore = cookies();
  const userCookie = cookieStore.get('user');
  const userData = userCookie ? JSON.parse(userCookie.value) : null;
  let permisos = [];
  if (userData && userData.usuario_id) {
    try {
      permisos = (await getUserPermissionsSimple(userData.usuario_id)).map((p: any) => p.descripcion);
    } catch {}
  }
  return <CatalogoEventoClient permisos={permisos} />;
}
