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
    user.role !== "apoderado" &&
    user.role !== "invitado"
  ) {
    redirect("/dashboard")
  }
  const resolvedParams = await searchParams

  const isGuest = user.role === "invitado"

  let pupils: any[] = []
  let selectedAlumnoId = ""
  let cuotasPendientes: any[] = []
  let comprobantesPagados: any[] = []
  let metasCursoList: any[] = []
  let egresosCursoList: any[] = []

  if (isGuest) {
    pupils = [
      {
        id: "12345678-9",
        nombreCompleto: "Sofía González",
        run: "12345678-9",
        colegioNombre: "Colegio Saint George",
        cursoNivel: "6° Básico",
        cursoNombre: "B",
        relacion: "Hijo/a",
        cursoId: 50,
        colegioId: 10,
      }
    ]
    selectedAlumnoId = resolvedParams.alumnoId || "12345678-9"

    cuotasPendientes = [
      { id: 901, nombre: "Cuota Incorporación Centro Padres", monto: 15000, fechaVencimiento: "2026-03-31" },
      { id: 902, nombre: "Cuota Mensual Paseo Fin de Año", monto: 20000, fechaVencimiento: "2026-08-31" },
    ]

    comprobantesPagados = [
      { id: 801, cuotaNombre: "Matrícula Anual", fecha: "2026-03-01", transaccionId: "TX-12839281203", metodoPago: "Webpay", monto: 45000 }
    ]

    metasCursoList = [
      { id: 701, nombre: "Fondo Paseo de Curso Valparaíso", objetivo: 1500000, recaudado: 950000, descripcion: "Recaudación para costear el bus y almuerzo de los alumnos" }
    ]

    egresosCursoList = [
      { id: 601, descripcion: "Reserva de bus para paseo", monto: 250000, fecha: "2026-05-15", comprobanteUrl: "boleta_bus.pdf" }
    ]
  } else {
    // 1. Obtener todos los alumnos del apoderado
    pupils = await getAlumnosDeApoderado(user.id)

    // 2. Determinar cuál alumno está seleccionado
    selectedAlumnoId = resolvedParams.alumnoId || ""
    if (!selectedAlumnoId && pupils.length > 0) {
      selectedAlumnoId = pupils[0].id
    }

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
