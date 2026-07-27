import { requireUser } from "@/lib/session"
import { getIngresos, getGastos } from "@/lib/actions"
import { getAlumnosDeApoderado, getColegios, getAlumnos, getPagosReport } from "@/lib/actions-school"
import { LandingDashboardContent } from "./landing-content"

export default async function LandingDashboardPage() {
  const user = await requireUser()
  const userRole = user.role

  // 1. Obtener datos financieros del hogar para el usuario
  const [ingresos, gastos] = await Promise.all([
    getIngresos(),
    getGastos(),
  ])

  // 2. Obtener datos escolares según el rol
  let alumnosApoderado: any[] = []
  let globalMetrics = {
    colegiosCount: 0,
    alumnosCount: 0,
    recaudadoTotal: 0,
  }

  if (userRole === "apoderado") {
    alumnosApoderado = await getAlumnosDeApoderado(user.id)
  } else {
    // Es administrador (global, colegio o curso)
    const [listCol, listAlu, listPagos] = await Promise.all([
      getColegios(),
      getAlumnos(),
      getPagosReport(),
    ])
    
    const recaudadoTotal = listPagos.reduce((sum, p) => sum + p.monto, 0)
    
    globalMetrics = {
      colegiosCount: listCol.length,
      alumnosCount: listAlu.length,
      recaudadoTotal,
    }
  }

  return (
    <LandingDashboardContent
      user={user}
      ingresos={ingresos}
      gastos={gastos}
      alumnosApoderado={alumnosApoderado}
      globalMetrics={globalMetrics}
    />
  )
}
