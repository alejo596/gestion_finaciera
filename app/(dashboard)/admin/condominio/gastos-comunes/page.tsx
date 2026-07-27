import { requireUser } from "@/lib/session"
import { getGastosComunes, getGastosCondominio } from "@/lib/actions-condo"
import { GastosComunesContent } from "./gc-content"
import { redirect } from "next/navigation"

export default async function AdminGastosComunesPage() {
  const user = await requireUser()
  if (user.role !== "webmaster" && user.role !== "admin_condominio") {
    redirect("/dashboard")
  }

  const [gcList, expList] = await Promise.all([
    getGastosComunes(),
    getGastosCondominio(),
  ])

  return (
    <GastosComunesContent
      initialGastosComunes={gcList}
      initialEgresosCondo={expList}
    />
  )
}
