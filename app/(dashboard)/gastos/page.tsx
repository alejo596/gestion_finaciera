import { requireUser } from "@/lib/session"
import { getGastos, getCategorias } from "@/lib/actions"
import { GastosContent } from "./gastos-content"

export default async function GastosPage() {
  const user = await requireUser()
  
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
