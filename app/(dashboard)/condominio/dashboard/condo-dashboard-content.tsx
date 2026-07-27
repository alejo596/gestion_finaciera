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
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { Building, ShoppingCart, Receipt, ArrowDownRight, CheckCircle2, ChevronRight } from "lucide-react"

type CondoDashboardContentProps = {
  user: any
  depts: any[]
  pending: any[]
  paid: any[]
  buildingEgresos: any[]
}

export function CondoDashboardContent({
  user,
  depts,
  pending,
  paid,
  buildingEgresos,
}: CondoDashboardContentProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const totalPendientes = pending.reduce((sum, p) => sum + p.monto, 0)
  const totalPagados = paid.reduce((sum, p) => sum + p.monto, 0)

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((x) => x !== id))
    } else {
      setSelectedIds((prev) => [...prev, id])
    }
  }

  const handleGoToPay = () => {
    if (selectedIds.length === 0) {
      toast.error("Selecciona al menos un gasto común para pagar")
      return
    }
    const idsString = selectedIds.join(",")
    router.push(`/condominio/pagar?ids=${idsString}`)
  }

  return (
    <div className="space-y-8 animate-fade-in text-xs">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            Portal de Copropietario
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Administra tus departamentos, revisa cobros y audita la contabilidad del condominio
          </p>
        </div>
      </div>

      {depts.length === 0 ? (
        <Card className="border-dashed border-slate-300 dark:border-slate-800 p-12 text-center">
          <Building className="h-12 w-12 text-slate-350 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Sin unidades habitacionales asociadas</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            No tienes departamentos registrados bajo tu cuenta. Contáctate con el administrador del condominio.
          </p>
        </Card>
      ) : (
        <>
          {/* Quick stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/60 shadow-xs">
              <CardHeader className="pb-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Unidades Asociadas</span>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-black text-slate-800 dark:text-white">
                  {depts.map((d) => `${d.bloque ? d.bloque : ""} N° ${d.numero}`).join(", ")}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/60 shadow-xs">
              <CardHeader className="pb-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Monto Pendiente</span>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-black text-rose-500">{formatCLP(totalPendientes)}</div>
                <p className="text-[10px] text-slate-400 mt-1">{pending.length} recibos pendientes</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900/60 shadow-xs">
              <CardHeader className="pb-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Historial Pagado</span>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatCLP(totalPagados)}</div>
                <p className="text-[10px] text-slate-400 mt-1">{paid.length} recibos pagados con éxito</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Column 1: Pending common expenses */}
            <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/85 flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-indigo-500" />
                    Gastos Comunes Pendientes
                  </CardTitle>
                  <CardDescription className="text-xs">Selecciona para proceder con el pago</CardDescription>
                </div>
                {selectedIds.length > 0 && (
                  <Badge className="bg-indigo-600 text-white font-bold">{selectedIds.length} seleccionada(s)</Badge>
                )}
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col justify-between">
                {pending.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 flex-1 flex flex-col justify-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    ¡Tus departamentos están al día con sus gastos comunes!
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto">
                      {pending.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => toggleSelect(p.id)}
                          className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                            selectedIds.includes(p.id)
                              ? "bg-indigo-50/50 dark:bg-indigo-950/20"
                              : "hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(p.id)}
                              onChange={() => {}} // handled by click
                              className="h-4 w-4 rounded-sm text-indigo-600 border-slate-300 dark:border-slate-700"
                            />
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {p.bloque ? `${p.bloque} - Depto ${p.numero}` : `Depto ${p.numero}`}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Periodo: {MESES[p.mes - 1]} / {p.anio} — Vence: {formatDate(p.fechaVencimiento)}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <strong className="text-xs text-slate-850 dark:text-slate-200">{formatCLP(p.monto)}</strong>
                            <span className="text-[9px] font-bold uppercase text-rose-500">Pendiente</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/55 dark:bg-slate-950/20">
                      <Button
                        onClick={handleGoToPay}
                        disabled={selectedIds.length === 0}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2"
                      >
                        Pagar Gastos Comunes ({formatCLP(pending.filter((p) => selectedIds.includes(p.id)).reduce((sum, p) => sum + p.monto, 0))})
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Column 2: Condo General Expenses (Audit) */}
            <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/85">
                <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <ArrowDownRight className="h-5 w-5 text-rose-500" />
                  ¿En qué se gasta el dinero del edificio?
                </CardTitle>
                <CardDescription className="text-xs">Gastos e inversiones de la administración en conserjería y servicios comunes</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col justify-start">
                {buildingEgresos.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-12">No hay egresos registrados por la administración.</p>
                ) : (
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                    {buildingEgresos.slice(0, 5).map((eg) => (
                      <div key={eg.id} className="space-y-1.5 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-950/20">
                        <div className="flex justify-between items-center text-[11px] font-bold">
                          <span className="text-slate-700 dark:text-slate-200">{eg.descripcion}</span>
                          <span className="text-rose-500">{formatCLP(eg.monto)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-slate-400">
                          <span>Categoría: <strong>{eg.categoria}</strong></span>
                          <span>Fecha: {formatDate(eg.fecha)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* History */}
          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Receipt className="h-5 w-5 text-indigo-500" />
                Historial de Pagos de Gastos Comunes
              </CardTitle>
              <CardDescription className="text-xs">Registro contable de cuotas aprobadas en la administración</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {paid.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No hay comprobantes de pago registrados para tus departamentos.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                        <TableHead className="text-xs font-semibold pl-6">Departamento</TableHead>
                        <TableHead className="text-xs font-semibold">Periodo Gasto Común</TableHead>
                        <TableHead className="text-xs font-semibold">Fecha Pago</TableHead>
                        <TableHead className="text-xs font-semibold">ID Transacción</TableHead>
                        <TableHead className="text-xs font-semibold">Método</TableHead>
                        <TableHead className="text-right text-xs font-semibold pr-6">Monto Pagado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paid.map((comp) => (
                        <TableRow key={comp.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                          <TableCell className="font-extrabold text-xs py-3 pl-6 text-indigo-500">
                            {comp.bloque ? `${comp.bloque} - N° ${comp.numero}` : `N° ${comp.numero}`}
                          </TableCell>
                          <TableCell className="text-slate-500 text-xs py-3">{MESES[comp.mes - 1]} / {comp.anio}</TableCell>
                          <TableCell className="text-slate-500 text-xs py-3">{formatDate(comp.fecha)}</TableCell>
                          <TableCell className="text-slate-555 font-mono text-xs py-3 text-[10px]">{comp.transaccionId}</TableCell>
                          <TableCell className="py-3">
                            <Badge variant="outline" className="text-[9px] font-semibold border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">{comp.metodoPago}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-bold text-xs py-3 text-emerald-500 pr-6">{formatCLP(comp.monto)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
