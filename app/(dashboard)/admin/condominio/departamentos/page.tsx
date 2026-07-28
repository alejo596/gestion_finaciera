import { requireUser } from "@/lib/session"
import { getDepartamentos, getCopropietarios } from "@/lib/actions-condo"
import { DeptsContent } from "./depts-content"
import { redirect } from "next/navigation"

export default async function AdminDepartamentosPage() {
  const user = await requireUser()
  if (
    user.role !== "webmaster" &&
    user.role !== "admin_condominio" &&
    user.role !== "invitado"
  ) {
    redirect("/dashboard")
  }

  const isGuest = user.role === "invitado"
  let deptsList: any[] = []
  let copropietariosList: any[] = []

  if (isGuest) {
    deptsList = [
      { id: 401, numero: "1203", bloque: "Torre A", copropietarioId: user.id, copropietarioNombre: "Usuario Invitado", prorrateo: "0.025" },
      { id: 402, numero: "102", bloque: "Torre B", copropietarioId: 998, copropietarioNombre: "Juan Pérez", prorrateo: "0.018" },
      { id: 403, numero: "1404", bloque: "Torre A", copropietarioId: 999, copropietarioNombre: "María Silva", prorrateo: "0.030" },
    ]
    copropietariosList = [
      { id: user.id, name: "Usuario Invitado", email: user.email },
      { id: 998, name: "Juan Pérez", email: "juan@example.com" },
      { id: 999, name: "María Silva", email: "maria@example.com" },
    ]
  } else {
    const [dbDeptsList, dbCopropietariosList] = await Promise.all([
      getDepartamentos(),
      getCopropietarios(),
    ])
    deptsList = dbDeptsList
    copropietariosList = dbCopropietariosList
  }

  return (
    <DeptsContent
      initialDepts={deptsList}
      copropietarios={copropietariosList}
    />
  )
}
