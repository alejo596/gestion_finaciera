import { requireUser } from "@/lib/session"
import { getAlumnosDeApoderado, getCuotasPendientesAlumno, getComprobantesPagoApoderado, getMetas } from "@/lib/actions-school"
import { getEgresosCurso } from "@/lib/actions-egresos"
import { ColegioDashboardContent } from "./dashboard-content"

import { redirect } from "next/navigation"

export default async function ColegioDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ alumnoId?: string }>
}) {
  const user = await requireUser()
  if (
    user.role !== "webmaster" &&
    user.role !== "admin" &&
    user.role !== "admin_colegio" &&
    user.role !== "admin_curso" &&
    user.role !== "apoderado"
  ) {
    redirect("/dashboard")
  }
  const resolvedParams = await searchParams

  // 1. Obtener todos los alumnos del apoderado
  const pupils = await getAlumnosDeApoderado(user.id)

  // 2. Determinar cuál alumno está seleccionado
  let selectedAlumnoId = resolvedParams.alumnoId || ""
  if (!selectedAlumnoId && pupils.length > 0) {
    selectedAlumnoId = pupils[0].id
  }

  // 3. Cargar información del alumno seleccionado
  let cuotasPendientes: any[] = []
  let comprobantesPagados: any[] = []
  let metasCursoList: any[] = []
  let egresosCursoList: any[] = []

  if (selectedAlumnoId) {
    const selectedPupil = pupils.find((p) => p.id === selectedAlumnoId)
    const cursoId = selectedPupil?.cursoId

    const [pending, paid, allMetas] = await Promise.all([
      getCuotasPendientesAlumno(selectedAlumnoId),
      getComprobantesPagoApoderado(user.id),
      getMetas(),
    ])

    cuotasPendientes = pending
    comprobantesPagados = paid.filter((c) => c.alumnoNombre === selectedPupil?.nombreCompleto)
    
    if (cursoId) {
      metasCursoList = allMetas.filter((m) => m.cursoId === cursoId && m.activa)
      egresosCursoList = await getEgresosCurso(cursoId)
    }
  }

  return (
    <ColegioDashboardContent
      user={user}
      pupils={pupils}
      selectedAlumnoId={selectedAlumnoId}
      pending={cuotasPendientes}
      paid={comprobantesPagados}
      metas={metasCursoList}
      egresos={egresosCursoList}
    />
  )
}
