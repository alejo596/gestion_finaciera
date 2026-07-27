import { requireUser } from "@/lib/session"
import { getGastos, getCategorias } from "@/lib/actions"
import { GastosContent } from "@/app/(dashboard)/gastos/gastos-content"

import { redirect } from "next/navigation"

export default async function HogarGastosPage() {
  const user = await requireUser()
  if (user.role !== "webmaster" && user.role !== "admin") {
    redirect("/dashboard")
  }
  
  const [gastos, categorias] = await Promise.all([
    getGastos(),
    getCategorias(),
  ])

  return (
    <GastosContent
      initialGastos={gastos}
      initialCategorias={categorias}
    />
  )
}
