import { requireUser } from "@/lib/session"
import { getDepartamentos, getCopropietarios } from "@/lib/actions-condo"
import { DeptsContent } from "./depts-content"
import { redirect } from "next/navigation"

export default async function AdminDepartamentosPage() {
  const user = await requireUser()
  if (user.role !== "webmaster" && user.role !== "admin_condominio") {
    redirect("/dashboard")
  }

  const [deptsList, copropietariosList] = await Promise.all([
    getDepartamentos(),
    getCopropietarios(),
  ])

  return (
    <DeptsContent
      initialDepts={deptsList}
      copropietarios={copropietariosList}
    />
  )
}
