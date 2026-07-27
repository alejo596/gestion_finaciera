import { requireUser } from "@/lib/session"
import { getIngresos } from "@/lib/actions"
import { IngresosContent } from "./ingresos-content"

export default async function IngresosPage() {
  const user = await requireUser()
  const ingresos = await getIngresos()

  return (
    <IngresosContent
      initialIngresos={ingresos}
    />
  )
}
