// Formato de moneda chilena (CLP): sin decimales, separador de miles con punto.
const clpFormatter = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
})

export function formatCLP(value: number): string {
  return clpFormatter.format(value ?? 0)
}

// Formato compacto para tarjetas: $1.2M, $850K, etc.
export function formatCLPCompact(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `$${Math.round(value / 1_000)}K`
  return `$${value}`
}

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

export function formatDate(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value + "T00:00:00") : value
  return dateFormatter.format(d)
}

export const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

export function nombreMes(mes: number): string {
  return MESES[mes - 1] ?? ""
}

// Devuelve el rango de fechas [inicio, fin) de un mes dado, en formato ISO date.
export function rangoMes(anio: number, mes: number): { inicio: string; fin: string } {
  const inicio = `${anio}-${String(mes).padStart(2, "0")}-01`
  const finDate = new Date(anio, mes, 1) // mes es 1-based, Date usa 0-based => siguiente mes
  const fin = `${finDate.getFullYear()}-${String(finDate.getMonth() + 1).padStart(2, "0")}-01`
  return { inicio, fin }
}
