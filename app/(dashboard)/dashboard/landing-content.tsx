"use client"

import * as React from "react"
import Link from "next/link"
import { formatCLP } from "@/lib/format"
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
  Wallet,
  School,
  ArrowRight,
  TrendingUp,
  User,
  Users,
  ChevronRight,
  ShieldCheck,
  Receipt,
  BookOpen,
  Key,
  Plus,
} from "lucide-react"

type LandingDashboardContentProps = {
  user: { name: string; email: string; role: string }
  ingresos: any[]
  gastos: any[]
  alumnosApoderado: any[]
  globalMetrics: {
    colegiosCount: number
    alumnosCount: number
    recaudadoTotal: number
  }
}

export function LandingDashboardContent({
  user,
  ingresos,
  gastos,
  alumnosApoderado,
  globalMetrics,
}: LandingDashboardContentProps) {
  const userRole = user.role

  // Calculations for Hogar
  const totalIngresos = ingresos.reduce((sum, i) => sum + i.monto, 0)
  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0)
  const balanceHogar = totalIngresos - totalGastos

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-indigo-700 p-6 md:p-8 text-white shadow-lg">
        {/* Decorative blur balls */}
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 h-28 w-28 rounded-full bg-indigo-500/20 blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <Badge className="bg-white/20 text-white border-0 py-0.5 px-2 text-[10px] font-semibold tracking-wider uppercase">
            {userRole === "admin" ? "Administrador del Sistema" : `Portal ${userRole.replace("_", " ")}`}
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight">
            ¡Hola, {user.name.split(" ")[0]}!
          </h2>
          <p className="text-sm text-emerald-100 max-w-xl">
            Te damos la bienvenida a tu portal financiero integral. Administra las cuentas de tu hogar y el control escolar escolar desde una sola cuenta.
          </p>
        </div>
      </div>

      <div className={`grid gap-6 ${userRole === "webmaster" ? "lg:grid-cols-3 md:grid-cols-2" : "md:grid-cols-2"}`}>
        {/* PORTAL 1: FINANZAS DEL HOGAR */}
        <Card className="border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10 shadow-inner">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-800 dark:text-white">Finanzas del Hogar</CardTitle>
                <CardDescription className="text-xs">Control de ingresos, gastos y presupuestos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                  Balance del Mes
                </span>
                <span className={`text-2xl font-black ${balanceHogar >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                  {formatCLP(balanceHogar)}
                </span>
                <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-slate-500">
                  <span>Ingresos: <strong className="text-emerald-500">{formatCLP(totalIngresos)}</strong></span>
                  <span>Gastos: <strong className="text-rose-500">{formatCLP(totalGastos)}</strong></span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Visualiza el flujo de caja, categoriza tus egresos mensuales y mantén el termómetro de tu presupuesto de alimentación bajo control.
              </p>

              {/* Quick Actions for Household finances */}
              {(userRole === "webmaster" || userRole === "admin" || userRole === "invitado") && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <Button
                    render={<Link href="/hogar/dashboard?add=income" />}
                    variant="outline"
                    className="flex items-center justify-center gap-1.5 border-emerald-500/20 bg-emerald-50/50 hover:bg-emerald-100/50 text-emerald-600 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 dark:text-emerald-400 text-xs font-bold transition-all py-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" /> + Ingreso
                  </Button>
                  <Button
                    render={<Link href="/hogar/dashboard?add=expense" />}
                    variant="outline"
                    className="flex items-center justify-center gap-1.5 border-rose-500/20 bg-rose-50/50 hover:bg-rose-100/50 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 dark:text-rose-400 text-xs font-bold transition-all py-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" /> + Gasto
                  </Button>
                </div>
              )}
            </div>
            <Button render={<Link href="/hogar/dashboard" />} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold mt-4 gap-2">
              Entrar a Finanzas Hogar <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* PORTAL 2: PORTAL ESCOLAR */}
        {userRole === "apoderado" ? (
          /* PORTAL ESCOLAR PARA APODERADOS */
          <Card className="border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 shadow-inner">
                  <School className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800 dark:text-white">Portal Escolar</CardTitle>
                  <CardDescription className="text-xs">Administración de cuotas de tus alumnos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border border-slate-100 dark:border-slate-800/80 rounded-xl p-3 bg-slate-50 dark:bg-slate-950/40 space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                    Tus Alumnos Vinculados ({alumnosApoderado.length})
                  </span>
                  {alumnosApoderado.length === 0 ? (
                    <p className="text-xs text-slate-400 py-2">No tienes alumnos vinculados. Contáctate con el administrador.</p>
                  ) : (
                    <div className="space-y-2">
                      {alumnosApoderado.map((al) => (
                        <div key={al.id} className="flex justify-between items-center text-xs p-1">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{al.nombreCompleto}</span>
                            <span className="text-[10px] text-slate-400">{al.colegioNombre} — {al.cursoNivel} {al.cursoNombre}</span>
                          </div>
                          <Badge variant="outline" className="text-[9px] font-bold border-indigo-500/20 bg-indigo-500/10 text-indigo-500">
                            {al.relacion}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  Consulta el saldo adeudado de cuotas ordinarias o extraordinarias, apoya las metas de recaudación y realiza pagos mediante carro de compras.
                </p>
              </div>
              <Button render={<Link href="/colegio/dashboard" />} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold mt-4 gap-2">
                Entrar a Portal Escolar <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* PORTAL ESCOLAR PARA ADMINISTRADORES */
          <Card className="border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-500/10 shadow-inner">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800 dark:text-white">Panel de Administración</CardTitle>
                  <CardDescription className="text-xs">Gestión y control de colegios y cuotas escolares</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-xl text-center">
                    <School className="h-4 w-4 text-indigo-400 mx-auto mb-1" />
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Colegios</span>
                    <strong className="text-sm font-bold text-slate-800 dark:text-white">{globalMetrics.colegiosCount}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-xl text-center">
                    <Users className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Alumnos</span>
                    <strong className="text-sm font-bold text-slate-800 dark:text-white">{globalMetrics.alumnosCount}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-xl text-center">
                    <Receipt className="h-4 w-4 text-amber-400 mx-auto mb-1" />
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Recaudado</span>
                    <strong className="text-xs font-bold text-slate-800 dark:text-white truncate block">
                      {formatCLP(globalMetrics.recaudadoTotal)}
                    </strong>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  Crea colegios y cursos, vincula apoderados con alumnos, crea cuotas y metas para paseos de curso, y emite reportes financieros completos.
                </p>
              </div>
              <Button render={<Link href="/admin/pagos" />} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold mt-4 gap-2">
                Gestionar Plataforma <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* PORTAL 3: WEBMASTER USER MANAGEMENT */}
        {userRole === "webmaster" && (
          <Card className="border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between col-span-1 md:col-span-2 lg:col-span-1">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-500/10 shadow-inner">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800 dark:text-white">Seguridad y Usuarios</CardTitle>
                  <CardDescription className="text-xs">Control de accesos y asignación de roles del sistema</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                    Roles Disponibles
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="outline" className="text-[8px] bg-slate-100 dark:bg-slate-800">Webmaster</Badge>
                    <Badge variant="outline" className="text-[8px] bg-slate-100 dark:bg-slate-800">Admin General</Badge>
                    <Badge variant="outline" className="text-[8px] bg-slate-100 dark:bg-slate-800">Admin Colegio</Badge>
                    <Badge variant="outline" className="text-[8px] bg-slate-100 dark:bg-slate-800">Admin Curso</Badge>
                    <Badge variant="outline" className="text-[8px] bg-slate-100 dark:bg-slate-800">Apoderado</Badge>
                    <Badge variant="outline" className="text-[8px] bg-slate-100 dark:bg-slate-800">Admin Condominio</Badge>
                    <Badge variant="outline" className="text-[8px] bg-slate-100 dark:bg-slate-800">Copropietario</Badge>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  Audita los usuarios registrados, cambia sus privilegios y activa la visualización de los portales correspondientes a sus funciones.
                </p>
              </div>
              <Button render={<Link href="/admin/usuarios" />} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold mt-4 gap-2">
                Gestionar Usuarios <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
