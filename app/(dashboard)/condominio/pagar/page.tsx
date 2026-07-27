import { requireUser } from "@/lib/session"
import { db } from "@/lib/db"
import { gastosComunes, departamentos } from "@/lib/db/schema"
import { eq, inArray } from "drizzle-orm"
import { CondoPagarContent } from "./condo-pagar-content"

import { redirect } from "next/navigation"

export default async function CondoPagarPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>
}) {
  const user = await requireUser()
  if (user.role !== "webmaster" && user.role !== "copropietario") {
    redirect("/dashboard")
  }
  const resolvedParams = await searchParams

  const idsString = resolvedParams.ids || ""
  if (!idsString) {
    return (
      <div className="py-8 text-center text-xs text-slate-400">
        Carro de compras de gastos comunes vacío.
      </div>
    )
  }

  const gcIds = idsString.split(",").map(Number).filter(Boolean)

  // Fetch pending common expenses details
  const selectedGC = await db
    .select({
      id: gastosComunes.id,
      mes: gastosComunes.mes,
      anio: gastosComunes.anio,
      monto: gastosComunes.monto,
      fechaVencimiento: gastosComunes.fechaVencimiento,
      departamentoId: gastosComunes.departamentoId,
      numero: departamentos.numero,
      bloque: departamentos.bloque,
    })
    .from(gastosComunes)
    .innerJoin(departamentos, eq(gastosComunes.departamentoId, departamentos.id))
    .where(inArray(gastosComunes.id, gcIds))

  return (
    <CondoPagarContent
      initialGC={selectedGC}
    />
  )
}
