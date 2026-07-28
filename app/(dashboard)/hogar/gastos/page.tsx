import { requireUser } from "@/lib/session"
import { getGastos, getCategorias } from "@/lib/actions"
import { GastosContent } from "@/app/(dashboard)/gastos/gastos-content"
import { redirect } from "next/navigation"

export default async function HogarGastosPage() {
  const user = await requireUser()
  if (user.role !== "webmaster" && user.role !== "admin" && user.role !== "invitado") {
    redirect("/dashboard")
  }
  
  let gastos: any[] = []
  let categorias: any[] = []

  if (user.role === "invitado") {
    // Categorías de prueba (ficticias)
    categorias = [
      { id: 101, nombre: "Sueldos y Aportes", color: "#10b981" },
      { id: 102, nombre: "Vivienda y Servicios", color: "#3b82f6" },
      { id: 103, nombre: "Alimentación", color: "#f59e0b" },
      { id: 104, nombre: "Transporte", color: "#06b6d4" },
      { id: 105, nombre: "Salud y Bienestar", color: "#ef4444" },
      { id: 106, nombre: "Educación", color: "#8b5cf6" },
    ]

    const now = new Date()
    const currentMonthPref = now.toISOString().substring(0, 7) // "YYYY-MM"
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevMonthPref = prevMonth.toISOString().substring(0, 7)

    gastos = [
      { id: 2001, descripcion: "Arriendo Departamento", monto: 480000, fecha: `${currentMonthPref}-02`, fechaInicio: `${currentMonthPref}-02`, categoriaId: 102, metodoPago: "Transferencia", periodicidad: "recurrente" },
      { id: 2002, descripcion: "Compras Supermercado Jumbo", monto: 165000, fecha: `${currentMonthPref}-10`, fechaInicio: `${currentMonthPref}-10`, categoriaId: 103, metodoPago: "Tarjeta de Débito", periodicidad: "único" },
      { id: 2003, descripcion: "Combustible Copec", monto: 50000, fecha: `${currentMonthPref}-12`, fechaInicio: `${currentMonthPref}-12`, categoriaId: 104, metodoPago: "Tarjeta de Crédito", periodicidad: "único" },
      { id: 2004, descripcion: "Gasto Común Condominio", monto: 110000, fecha: `${currentMonthPref}-08`, fechaInicio: `${currentMonthPref}-08`, categoriaId: 102, metodoPago: "Transferencia", periodicidad: "recurrente" },
      { id: 2005, descripcion: "Consulta Médica Pediatra", monto: 35000, fecha: `${currentMonthPref}-14`, fechaInicio: `${currentMonthPref}-14`, categoriaId: 105, metodoPago: "Efectivo", periodicidad: "único" },
      { id: 2006, descripcion: "Arriendo Departamento", monto: 480000, fecha: `${prevMonthPref}-02`, fechaInicio: `${prevMonthPref}-02`, categoriaId: 102, metodoPago: "Transferencia", periodicidad: "recurrente" },
      { id: 2007, descripcion: "Compras Supermercado Jumbo", monto: 150000, fecha: `${prevMonthPref}-10`, fechaInicio: `${prevMonthPref}-10`, categoriaId: 103, metodoPago: "Tarjeta de Débito", periodicidad: "único" },
    ]
  } else {
    const [dbGastos, dbCategorias] = await Promise.all([
      getGastos(),
      getCategorias(),
    ])
    gastos = dbGastos
    categorias = dbCategorias
  }

  return (
    <GastosContent
      initialGastos={gastos}
      initialCategorias={categorias}
    />
  )
}
