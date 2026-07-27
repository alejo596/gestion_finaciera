"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatCLP, formatDate, MESES } from "@/lib/format"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Printer, Filter, X, Receipt } from "lucide-react"

type CondoPagosReportContentProps = {
  depts: any[]
  report: any[]
  initialFilters: {
    departamentoId?: number
    fechaInicio?: string
    fechaFin?: string
  }
}

export function CondoPagosReportContent({
  depts,
  report,
  initialFilters,
}: CondoPagosReportContentProps) {
  const router = useRouter()

  const [departamentoId, setDepartamentoId] = useState(initialFilters.departamentoId ? String(initialFilters.departamentoId) : "")
  const [fechaInicio, setFechaInicio] = useState(initialFilters.fechaInicio || "")
  const [fechaFin, setFechaFin] = useState(initialFilters.fechaFin || "")

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault()
    const query = new URLSearchParams()
    if (departamentoId) query.set("departamentoId", departamentoId)
    if (fechaInicio) query.set("fechaInicio", fechaInicio)
    if (fechaFin) query.set("fechaFin", fechaFin)

    router.push(`/admin/condominio/pagos?${query.toString()}`)
  }

  const handleClear = () => {
    setDepartamentoId("")
    setFechaInicio("")
    setFechaFin("")
    router.push("/admin/condominio/pagos")
  }

  const handlePrint = () => {
    window.print()
  }

  // Calculations
  const totalRecaudado = report.reduce((sum, p) => sum + p.monto, 0)

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            Reporte de Pagos Condominio
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Control de ingresos recaudados por concepto de Gastos Comunes
          </p>
        </div>

        <Button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5">
          <Printer className="h-4 w-4" /> Imprimir Reporte
        </Button>
      </div>

      {/* FILTERS */}
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm print:hidden">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <CardTitle className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Filter className="h-4 w-4 text-indigo-500" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleFilter} className="grid gap-4 sm:grid-cols-3 items-end">
            <div className="space-y-1">
              <Label htmlFor="rep-dept" className="font-semibold">Departamento</Label>
              <select
                id="rep-dept"
                value={departamentoId}
                onChange={(e) => setDepartamentoId(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                <option value="">Todas las Unidades</option>
                {depts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.bloque ? `${d.bloque} - N° ${d.numero}` : `N° ${d.numero}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="rep-start" className="font-semibold">Fecha Desde</Label>
              <Input
                id="rep-start"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="rep-end" className="font-semibold">Fecha Hasta</Label>
              <Input
                id="rep-end"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <Button type="button" variant="ghost" onClick={handleClear} className="flex items-center gap-1">
                <X className="h-3.5 w-3.5" /> Limpiar Filtros
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                Filtrar Reporte
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* SUMMARY */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/60 shadow-xs">
          <CardHeader className="pb-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Recaudación Total</span>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatCLP(totalRecaudado)}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/60 shadow-xs">
          <CardHeader className="pb-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Transacciones de Pago</span>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-slate-800 dark:text-white">{report.length} transacciones</div>
          </CardContent>
        </Card>
      </div>

      {/* TABLE */}
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm print:shadow-none print:border-0">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Receipt className="h-5 w-5 text-indigo-500" />
            Transacciones Registradas
          </CardTitle>
          <CardDescription className="text-xs">Registro histórico de pagos de gastos comunes aprobados</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {report.length === 0 ? (
            <div className="py-16 text-center text-slate-400">No hay pagos registrados.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold pl-6">Copropietario</TableHead>
                    <TableHead className="text-xs font-semibold">Departamento</TableHead>
                    <TableHead className="text-xs font-semibold">Periodo G.C.</TableHead>
                    <TableHead className="text-xs font-semibold">Fecha Pago</TableHead>
                    <TableHead className="text-xs font-semibold">ID Transacción</TableHead>
                    <TableHead className="text-xs font-semibold">Método</TableHead>
                    <TableHead className="text-right text-xs font-semibold pr-6">Monto Pagado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.map((p) => (
                    <TableRow key={p.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                      <TableCell className="font-semibold text-xs py-3.5 pl-6 text-slate-800 dark:text-slate-200">{p.copropietarioNombre}</TableCell>
                      <TableCell className="font-bold text-xs py-3.5 text-indigo-500">
                        {p.bloque ? `${p.bloque} - N° ${p.numero}` : `N° ${p.numero}`}
                      </TableCell>
                      <TableCell className="text-slate-500 py-3.5">{MESES[p.mesGastoComun - 1]} / {p.anioGastoComun}</TableCell>
                      <TableCell className="text-slate-500 py-3.5">{formatDate(p.fecha)}</TableCell>
                      <TableCell className="text-slate-555 font-mono py-3.5 text-[10px]">{p.transaccionId}</TableCell>
                      <TableCell className="py-3.5">
                        <Badge variant="outline" className="text-[9px] font-semibold border-emerald-500/20 bg-emerald-500/10 text-emerald-500">{p.metodoPago}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-xs py-3.5 text-emerald-500 pr-6">{formatCLP(p.monto)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
