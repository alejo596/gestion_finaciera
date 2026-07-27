import { requireUser } from "@/lib/session"
import { getAllUsers } from "@/lib/actions-user"
import { UsersPermissionsContent } from "./users-permissions-content"
import { redirect } from "next/navigation"

export default async function AdminUsuariosPage() {
  const user = await requireUser()
  
  // Solo el Webmaster puede gestionar los usuarios y otorgar roles de visualización
  if (user.role !== "webmaster") {
    redirect("/dashboard")
  }

  const usersList = await getAllUsers()

  return (
    <UsersPermissionsContent
      initialUsers={usersList}
    />
  )
}
