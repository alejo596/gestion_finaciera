import { requireUser } from "@/lib/session"
import { getAllUsers } from "@/lib/actions-user"
import { getColegios, getCursos } from "@/lib/actions-school"
import { UsersPermissionsContent } from "./users-permissions-content"
import { redirect } from "next/navigation"

export default async function AdminUsuariosPage() {
  const user = await requireUser()
  
  // Solo el Webmaster puede gestionar los usuarios y otorgar roles de visualización
  if (user.role !== "webmaster") {
    redirect("/dashboard")
  }

  const [usersList, colegiosList, cursosList] = await Promise.all([
    getAllUsers(),
    getColegios(),
    getCursos(),
  ])

  return (
    <UsersPermissionsContent
      initialUsers={usersList}
      colegios={colegiosList}
      cursos={cursosList}
    />
  )
}
