"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatCLP, formatDate } from "@/lib/format"
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

type PagosReportContentProps = {
  colegios: any[]
  cursos: any[]
  report: any[]
  initialFilters: {
    colegioId?: number
    cursoId?: number
    fechaInicio?: string
    fechaFin?: string
  }
}

export function PagosReportContent({
  colegios,
  cursos,
  report,
  initialFilters,
}: PagosReportContentProps) {
  const router = useRouter()

  // Filter states
  const [colegioId, setColegioId] = useState(initialFilters.colegioId ? String(initialFilters.colegioId) : "")
  const [cursoId, setCursoId] = useState(initialFilters.cursoId ? String(initialFilters.cursoId) : "")
  const [fechaInicio, setFechaInicio] = useState(initialFilters.fechaInicio || "")
  const [fechaFin, setFechaFin] = useState(initialFilters.fechaFin || "")

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault()
    const query = new URLSearchParams()
    if (colegioId) query.set("colegioId", colegioId)
    if (cursoId) query.set("cursoId", cursoId)
    if (fechaInicio) query.set("fechaInicio", fechaInicio)
    if (fechaFin) query.set("fechaFin", fechaFin)

    router.push(`/admin/pagos?${query.toString()}`)
  }

  const handleClear = () => {
    setColegioId("")
    setCursoId("")
    setFechaInicio("")
    setFechaFin("")
    router.push("/admin/pagos")
  }

  const handlePrint = () => {
    window.print()
  }

  // Calculations
  const totalRecaudado = report.reduce((sum, p) => sum + p.monto, 0)
  const promedioPago = report.length > 0 ? Math.round(totalRecaudado / report.length) : 0

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            Transacciones y Reportes
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Filtra transacciones de cuotas escolares y genera informes descargables
          </p>
        </div>

        <Button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5">
          <Printer className="h-4 w-4" /> Imprimir Reporte
        </Button>
      </div>

      {/* FILTER CARD */}
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm print:hidden">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <CardTitle className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Filter className="h-4 w-4 text-indigo-500" />
            Filtros del Reporte
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleFilter} className="grid gap-4 sm:grid-cols-4 items-end">
            <div className="space-y-1">
              <Label htmlFor="rep-col" className="font-semibold">Colegio</Label>
              <select
                id="rep-col"
                value={colegioId}
                onChange={(e) => setColegioId(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                <option value="">Todos los Colegios</option>
                {colegios.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="rep-cur" className="font-semibold">Curso</Label>
              <select
                id="rep-cur"
                value={cursoId}
                onChange={(e) => setCursoId(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                <option value="">Todos los Cursos</option>
                {cursos
                  .filter((c) => !colegioId || String(c.colegioId) === colegioId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.colegioNombre} — {c.nivel} {c.nombre}
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

            <div className="sm:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <Button type="button" variant="ghost" onClick={handleClear} className="flex items-center gap-1">
                <X className="h-3.5 w-3.5" /> Limpiar Filtros
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1">
                Generar Reporte
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* METRICS ROW */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/60 shadow-xs">
          <CardHeader className="pb-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Recaudación Reporte</span>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatCLP(totalRecaudado)}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/60 shadow-xs">
          <CardHeader className="pb-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Cantidad de Transacciones</span>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-slate-800 dark:text-white">{report.length} pagos</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/60 shadow-xs">
          <CardHeader className="pb-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Ticket Promedio Pago</span>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-indigo-500">{formatCLP(promedioPago)}</div>
          </CardContent>
        </Card>
      </div>

      {/* PAYMENTS TABLE CARD */}
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm print:shadow-none print:border-0">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Receipt className="h-5 w-5 text-indigo-500" />
            Transacciones Coincidentes
          </CardTitle>
          <CardDescription className="text-xs">Registro histórico contable de pagos autorizados</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {report.length === 0 ? (
            <div className="py-16 text-center text-slate-450">No hay transacciones que coincidan con los filtros aplicados.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold pl-6">Alumno</TableHead>
                    <TableHead className="text-xs font-semibold">Apoderado Responsable</TableHead>
                    <TableHead className="text-xs font-semibold">Colegio / Curso</TableHead>
                    <TableHead className="text-xs font-semibold">Cuota Concepto</TableHead>
                    <TableHead className="text-xs font-semibold">Fecha Pago</TableHead>
                    <TableHead className="text-xs font-semibold">ID Transacción</TableHead>
                    <TableHead className="text-xs font-semibold">Pasarela / Método</TableHead>
                    <TableHead className="text-right text-xs font-semibold pr-6">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.map((p) => (
                    <TableRow key={p.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                      <TableCell className="font-semibold text-xs py-3.5 pl-6 text-slate-800 dark:text-slate-200">{p.alumnoNombre}</TableCell>
                      <TableCell className="text-slate-500 py-3.5">{p.apoderadoNombre}</TableCell>
                      <TableCell className="text-slate-500 py-3.5">
                        <div className="flex flex-col">
                          <span>{p.colegioNombre}</span>
                          <span className="text-[9px] text-indigo-500 font-bold">{p.cursoNivel} {p.cursoNombre}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-xs py-3.5 text-slate-700 dark:text-slate-350">{p.cuotaNombre}</TableCell>
                      <TableCell className="text-slate-500 py-3.5">{formatDate(p.fecha)}</TableCell>
                      <TableCell className="text-slate-500 font-mono py-3.5 text-[10px]">{p.transaccionId}</TableCell>
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
