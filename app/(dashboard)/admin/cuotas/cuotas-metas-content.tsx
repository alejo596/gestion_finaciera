"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createCuota, createMetaCurso } from "@/lib/actions-school"
import { getEgresosCurso, createEgresoCurso, getAlumnosPagadosCuota } from "@/lib/actions-egresos"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Plus, DollarSign, TrendingUp, Users, ArrowDownRight, Eye, FileText } from "lucide-react"

type CuotasMetasContentProps = {
  initialCuotas: any[]
  cursos: any[]
  initialMetas: any[]
}

const TIPOS_CUOTAS = [
  { id: "mensual", name: "Cuota Mensual" },
  { id: "extraordinaria", name: "Cuota Extraordinaria" },
  { id: "paseo", name: "Paseo de Curso" },
  { id: "actividad", name: "Actividad / Evento" },
  { id: "celebracion", name: "Celebración" },
  { id: "graduacion", name: "Graduación" },
  { id: "voluntario", name: "Aporte Voluntario" },
]

export function CuotasMetasContent({
  initialCuotas,
  cursos,
  initialMetas,
}: CuotasMetasContentProps) {
  const router = useRouter()
  const [cuotas, setCuotas] = useState(initialCuotas)
  const [metas, setMetas] = useState(initialMetas)

  const [isCuotaOpen, setIsCuotaOpen] = useState(false)
  const [isMetaOpen, setIsMetaOpen] = useState(false)
  const [isEgresoOpen, setIsEgresoOpen] = useState(false)
  const [isStudentsOpen, setIsStudentsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Paid students list dialog states
  const [selectedCuota, setSelectedCuota] = useState<any>(null)
  const [paidStudents, setPaidStudents] = useState<any[]>([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)

  // Cuota Form
  const [cuotaNombre, setCuotaNombre] = useState("")
  const [cuotaDesc, setCuotaDesc] = useState("")
  const [cuotaCursoId, setCuotaCursoId] = useState("")
  const [cuotaMonto, setCuotaMonto] = useState("")
  const [cuotaVencimiento, setCuotaVencimiento] = useState("")
  const [cuotaTipo, setCuotaTipo] = useState("mensual")

  // Meta Form
  const [metaCursoId, setMetaCursoId] = useState("")
  const [metaNombre, setMetaNombre] = useState("")
  const [metaDesc, setMetaDesc] = useState("")
  const [metaObjetivo, setMetaObjetivo] = useState("")

  // Egresos (Curso) States
  const [selectedEgresoCursoId, setSelectedEgresoCursoId] = useState(cursos.length > 0 ? String(cursos[0].id) : "")
  const [egresosList, setEgresosList] = useState<any[]>([])
  const [isLoadingEgresos, setIsLoadingEgresos] = useState(false)

  // New Egreso Form
  const [egresoDesc, setEgresoDesc] = useState("")
  const [egresoMonto, setEgresoMonto] = useState("")
  const [egresoFecha, setEgresoFecha] = useState(new Date().toISOString().substring(0, 10))
  const [egresoObs, setEgresoObs] = useState("")

  // Fetch course egresos when selected curso changes
  useEffect(() => {
    if (selectedEgresoCursoId) {
      setIsLoadingEgresos(true)
      getEgresosCurso(Number(selectedEgresoCursoId))
        .then((data) => setEgresosList(data))
        .catch(() => toast.error("Error al cargar egresos del curso"))
        .finally(() => setIsLoadingEgresos(false))
    }
  }, [selectedEgresoCursoId])

  const handleOpenCuota = () => {
    setCuotaNombre("")
    setCuotaDesc("")
    setCuotaCursoId(cursos.length > 0 ? String(cursos[0].id) : "")
    setCuotaMonto("")
    setCuotaVencimiento(new Date().toISOString().substring(0, 10))
    setCuotaTipo("mensual")
    setIsCuotaOpen(true)
  }

  const handleOpenMeta = () => {
    setMetaCursoId(cursos.length > 0 ? String(cursos[0].id) : "")
    setMetaNombre("")
    setMetaDesc("")
    setMetaObjetivo("")
    setIsMetaOpen(true)
  }

  const handleOpenEgreso = () => {
    setEgresoDesc("")
    setEgresoMonto("")
    setEgresoFecha(new Date().toISOString().substring(0, 10))
    setEgresoObs("")
    setIsEgresoOpen(true)
  }

  const handleShowPaidStudents = async (cuota: any) => {
    setSelectedCuota(cuota)
    setIsLoadingStudents(true)
    setIsStudentsOpen(true)
    try {
      const data = await getAlumnosPagadosCuota(cuota.id)
      setPaidStudents(data)
    } catch (err) {
      toast.error("Error al obtener alumnos pagados")
    } finally {
      setIsLoadingStudents(false)
    }
  }

  const handleSaveCuota = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cuotaNombre.trim() || !cuotaCursoId || !cuotaMonto || !cuotaVencimiento) {
      toast.error("Por favor completa los campos requeridos")
      return
    }

    setIsSubmitting(true)
    try {
      await createCuota({
        nombre: cuotaNombre,
        descripcion: cuotaDesc,
        cursoId: Number(cuotaCursoId),
        anio: new Date().getFullYear(),
        monto: Number(cuotaMonto),
        fechaVencimiento: cuotaVencimiento,
        tipo: cuotaTipo,
      })
      
      toast.success("Cuota creada con éxito")
      setIsCuotaOpen(false)
      router.refresh()
      window.location.reload()
    } catch (err: any) {
      toast.error(err.message || "Error al crear la cuota")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveMeta = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!metaCursoId || !metaNombre.trim() || !metaObjetivo) {
      toast.error("Por favor completa los campos requeridos")
      return
    }

    setIsSubmitting(true)
    try {
      await createMetaCurso({
        cursoId: Number(metaCursoId),
        nombre: metaNombre,
        descripcion: metaDesc,
        objetivo: Number(metaObjetivo),
      })
      
      toast.success("Meta económica creada con éxito")
      setIsMetaOpen(false)
      router.refresh()
      window.location.reload()
    } catch (err: any) {
      toast.error(err.message || "Error al crear la meta")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveEgreso = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEgresoCursoId || !egresoDesc.trim() || !egresoMonto || !egresoFecha) {
      toast.error("Por favor completa los campos requeridos")
      return
    }

    setIsSubmitting(true)
    try {
      const newEg = await createEgresoCurso({
        cursoId: Number(selectedEgresoCursoId),
        descripcion: egresoDesc.trim(),
        monto: Number(egresoMonto),
        fecha: egresoFecha,
        observaciones: egresoObs,
      })
      setEgresosList((prev) => [newEg, ...prev])
      toast.success("Egreso registrado correctamente")
      setIsEgresoOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Error al registrar el egreso")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            Cobros, Metas y Egresos del Curso
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Administra las cuotas, fondos acumulados e inversiones del curso escolar
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleOpenCuota} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Crear Cuota
          </Button>
          <Button onClick={handleOpenMeta} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Nueva Meta
          </Button>
        </div>
      </div>

      <Tabs defaultValue="cuotas" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 mb-4 flex w-fit">
          <TabsTrigger value="cuotas" className="px-4 py-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 font-bold text-slate-700 dark:text-slate-200">
            Cuotas Emitidas
          </TabsTrigger>
          <TabsTrigger value="metas" className="px-4 py-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 font-bold text-slate-700 dark:text-slate-200">
            Metas de Recaudación
          </TabsTrigger>
          <TabsTrigger value="egresos" className="px-4 py-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 font-bold text-slate-700 dark:text-slate-200">
            Inversión y Egresos Curso
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cuotas">
          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-indigo-500" />
                Cuotas Emitidas
              </CardTitle>
              <CardDescription className="text-xs">Detalle de cuotas escolares y consulta de alumnos pagados</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {cuotas.length === 0 ? (
                <div className="py-16 text-center text-slate-400">No hay cuotas emitidas en la plataforma.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                        <TableHead className="text-xs font-semibold pl-6">Nombre de Cuota</TableHead>
                        <TableHead className="text-xs font-semibold">Tipo</TableHead>
                        <TableHead className="text-xs font-semibold">Colegio / Curso</TableHead>
                        <TableHead className="text-xs font-semibold">Vencimiento</TableHead>
                        <TableHead className="text-right text-xs font-semibold">Monto</TableHead>
                        <TableHead className="text-center text-xs font-semibold pr-6">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cuotas.map((c) => (
                        <TableRow key={c.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                          <TableCell className="font-semibold text-xs py-3.5 pl-6 text-slate-850 dark:text-slate-200">{c.nombre}</TableCell>
                          <TableCell className="py-3.5">
                            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-0 font-bold text-[9px] uppercase">{c.tipo}</Badge>
                          </TableCell>
                          <TableCell className="text-slate-500 py-3.5">
                            <div className="flex flex-col">
                              <span>{c.colegioNombre}</span>
                              <span className="text-[9px] text-indigo-400 font-bold">{c.cursoNivel} {c.cursoNombre}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-500 py-3.5">{formatDate(c.fechaVencimiento)}</TableCell>
                          <TableCell className="text-right font-bold text-xs py-3.5 text-slate-850 dark:text-slate-200">{formatCLP(c.monto)}</TableCell>
                          <TableCell className="text-center pr-6 py-3.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShowPaidStudents(c)}
                              className="text-indigo-600 hover:text-indigo-500 hover:bg-indigo-50/50 text-[10px] font-bold flex items-center gap-1 mx-auto"
                            >
                              <Users className="h-3.5 w-3.5" /> Ver Pagados
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metas">
          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Avance de Metas Colectivas
              </CardTitle>
              <CardDescription className="text-xs">Presupuestos y fondos reunidos en conjunto por el curso</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {metas.length === 0 ? (
                <div className="py-16 text-center text-slate-400">No hay metas activas.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                        <TableHead className="text-xs font-semibold pl-6">Nombre Meta</TableHead>
                        <TableHead className="text-xs font-semibold">Curso</TableHead>
                        <TableHead className="text-xs font-semibold">Progreso de Recaudación</TableHead>
                        <TableHead className="text-xs font-semibold">Recaudado</TableHead>
                        <TableHead className="text-right text-xs font-semibold pr-6">Objetivo Meta</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metas.map((m) => {
                        const percent = m.objetivo > 0 ? Math.round((m.recaudado / m.objetivo) * 100) : 0
                        return (
                          <TableRow key={m.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                            <TableCell className="font-semibold text-xs py-4 pl-6 text-slate-850 dark:text-slate-200">{m.nombre}</TableCell>
                            <TableCell className="text-slate-500 py-4">
                              <span className="font-semibold text-indigo-500">{m.cursoNivel} {m.cursoNombre}</span>
                            </TableCell>
                            <TableCell className="py-4 w-[200px]">
                              <div className="flex flex-col gap-1 pr-4">
                                <Progress value={Math.min(percent, 100)} className="h-2" indicatorClassName="bg-emerald-500" />
                                <span className="text-[9px] text-slate-400 font-bold">{percent}% Recaudado</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-emerald-500 font-extrabold py-4">{formatCLP(m.recaudado)}</TableCell>
                            <TableCell className="text-right font-bold text-xs py-4 text-slate-850 dark:text-slate-200 pr-6">{formatCLP(m.objetivo)}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="egresos">
          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <ArrowDownRight className="h-5 w-5 text-rose-500" />
                  Egresos y Rendición del Curso
                </CardTitle>
                <CardDescription className="text-xs">Registra y visualiza los gastos asociados a las metas y paseos del curso</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="cur-sel" className="font-semibold whitespace-nowrap">Curso:</Label>
                <select
                  id="cur-sel"
                  value={selectedEgresoCursoId}
                  onChange={(e) => setSelectedEgresoCursoId(e.target.value)}
                  className="rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 min-w-[150px]"
                >
                  {cursos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.colegioNombre} — {c.nivel} {c.nombre}
                    </option>
                  ))}
                </select>
                <Button onClick={handleOpenEgreso} className="bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-1 text-[10px]">
                  <Plus className="h-3 w-3" /> Registrar Inversión
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingEgresos ? (
                <div className="py-12 text-center text-slate-400">Cargando egresos del curso...</div>
              ) : egresosList.length === 0 ? (
                <div className="py-16 text-center text-slate-450">No hay egresos registrados para este curso.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                        <TableHead className="text-xs font-semibold pl-6">Descripción</TableHead>
                        <TableHead className="text-xs font-semibold">Fecha</TableHead>
                        <TableHead className="text-xs font-semibold">Comprobante Subido</TableHead>
                        <TableHead className="text-xs font-semibold">Observaciones</TableHead>
                        <TableHead className="text-right text-xs font-semibold pr-6">Monto Invertido</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {egresosList.map((eg) => (
                        <TableRow key={eg.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                          <TableCell className="font-semibold text-xs py-3.5 pl-6 text-slate-850 dark:text-slate-200">{eg.descripcion}</TableCell>
                          <TableCell className="text-slate-500 py-3.5">{formatDate(eg.fecha)}</TableCell>
                          <TableCell className="py-3.5">
                            {eg.comprobanteUrl ? (
                              <Badge
                                variant="outline"
                                onClick={() => toast.info(`Simulación: Abriendo archivo ${eg.comprobanteUrl}`)}
                                className="cursor-pointer text-[9px] font-bold border-indigo-500/20 bg-indigo-500/10 text-indigo-500 flex items-center gap-1 w-fit"
                              >
                                <FileText className="h-3 w-3" /> Factura/Boleta
                              </Badge>
                            ) : (
                              <span className="text-slate-400 italic">Sin archivo</span>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-500 py-3.5">{eg.observaciones || "-"}</TableCell>
                          <TableCell className="text-right font-bold text-xs py-3.5 text-rose-500 pr-6">{formatCLP(eg.monto)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CUOTA DIALOG */}
      <Dialog open={isCuotaOpen} onOpenChange={setIsCuotaOpen}>
        <DialogContent className="border-slate-200 bg-white text-slate-850 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 text-xs">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">Emitir Cuota</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">Crea una obligación de pago para todo el alumnado de un curso determinado.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCuota}>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="c-name" className="font-semibold">Nombre de la Cuota *</Label>
                <Input id="c-name" placeholder="Ej: Cuota Centro de Padres Julio" value={cuotaNombre} onChange={(e) => setCuotaNombre(e.target.value)} required className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="c-cur" className="font-semibold">Curso Destinatario *</Label>
                  <select id="c-cur" value={cuotaCursoId} onChange={(e) => setCuotaCursoId(e.target.value)} required className="w-full rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                    <option value="">Selecciona</option>
                    {cursos.map((c) => (<option key={c.id} value={c.id}>{c.colegioNombre} — {c.nivel} {c.nombre}</option>))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="c-tipo" className="font-semibold">Tipo de Cuota *</Label>
                  <select id="c-tipo" value={cuotaTipo} onChange={(e) => setCuotaTipo(e.target.value)} required className="w-full rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                    {TIPOS_CUOTAS.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="c-monto" className="font-semibold">Monto (CLP) *</Label>
                  <Input id="c-monto" type="number" placeholder="Ej: 15000" value={cuotaMonto} onChange={(e) => setCuotaMonto(e.target.value)} required className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="c-venc" className="font-semibold">Fecha Vencimiento *</Label>
                  <Input id="c-venc" type="date" value={cuotaVencimiento} onChange={(e) => setCuotaVencimiento(e.target.value)} required className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsCuotaOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white font-semibold">{isSubmitting ? "Guardando..." : "Emitir Cuota"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* META DIALOG */}
      <Dialog open={isMetaOpen} onOpenChange={setIsMetaOpen}>
        <DialogContent className="border-slate-200 bg-white text-slate-850 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 text-xs">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">Establecer Meta Colectiva</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">Crea un fondo de ahorro para actividades especiales del curso.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveMeta}>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="m-name" className="font-semibold">Nombre de la Actividad / Meta *</Label>
                <Input id="m-name" placeholder="Ej: Paseo Fin de Año 2026" value={metaNombre} onChange={(e) => setMetaNombre(e.target.value)} required className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="m-cur" className="font-semibold">Curso Asociado *</Label>
                  <select id="m-cur" value={metaCursoId} onChange={(e) => setMetaCursoId(e.target.value)} required className="w-full rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                    <option value="">Selecciona</option>
                    {cursos.map((c) => (<option key={c.id} value={c.id}>{c.colegioNombre} — {c.nivel} {c.nombre}</option>))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="m-obj" className="font-semibold">Objetivo Económico (CLP) *</Label>
                  <Input id="m-obj" type="number" placeholder="Ej: 1500000" value={metaObjetivo} onChange={(e) => setMetaObjetivo(e.target.value)} required className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsMetaOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 text-white font-semibold">{isSubmitting ? "Creando..." : "Crear Meta"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EGRESO DIALOG */}
      <Dialog open={isEgresoOpen} onOpenChange={setIsEgresoOpen}>
        <DialogContent className="border-slate-200 bg-white text-slate-850 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 text-xs">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">Registrar Inversión / Egreso del Curso</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">Añade facturas o egresos de fondos del curso.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEgreso}>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="e-desc" className="font-semibold">Descripción del Gasto *</Label>
                <Input id="e-desc" placeholder="Ej: Reserva de Cabañas Camping, Compra de Bebidas para Fiesta" value={egresoDesc} onChange={(e) => setEgresoDesc(e.target.value)} required className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="e-monto" className="font-semibold">Monto Gastado (CLP) *</Label>
                  <Input id="e-monto" type="number" placeholder="Ej: 450000" value={egresoMonto} onChange={(e) => setEgresoMonto(e.target.value)} required className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="e-fecha" className="font-semibold">Fecha Gasto *</Label>
                  <Input id="e-fecha" type="date" value={egresoFecha} onChange={(e) => setEgresoFecha(e.target.value)} required className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800" />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="e-obs" className="font-semibold">Observaciones / Nro Documento</Label>
                <Input id="e-obs" placeholder="Ej: Factura N° 1940 - camping el bosque" value={egresoObs} onChange={(e) => setEgresoObs(e.target.value)} className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsEgresoOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-rose-600 text-white font-semibold">{isSubmitting ? "Registrando..." : "Registrar Egreso"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* STUDENTS PAID DIALOG */}
      <Dialog open={isStudentsOpen} onOpenChange={setIsStudentsOpen}>
        <DialogContent className="border-slate-200 bg-white text-slate-850 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 text-xs max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">Alumnos que han Pagado</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Lista de transacciones autorizadas para la cuota: <strong className="text-slate-700 dark:text-slate-200">{selectedCuota?.nombre}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoadingStudents ? (
              <div className="py-8 text-center text-slate-400">Cargando transacciones...</div>
            ) : paidStudents.length === 0 ? (
              <div className="py-8 text-center text-slate-450 italic">Ningún alumno ha registrado el pago de esta cuota aún.</div>
            ) : (
              <div className="overflow-x-auto max-h-[300px] border border-slate-100 dark:border-slate-800 rounded-xl">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-950 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold pl-4">Alumno</TableHead>
                      <TableHead className="text-xs font-semibold">Apoderado</TableHead>
                      <TableHead className="text-xs font-semibold">Fecha Pago</TableHead>
                      <TableHead className="text-right text-xs font-semibold pr-4">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paidStudents.map((st) => (
                      <TableRow key={st.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10">
                        <TableCell className="font-bold text-xs py-2.5 pl-4 text-slate-800 dark:text-slate-200">{st.nombreCompleto}</TableCell>
                        <TableCell className="text-slate-500 py-2.5">{st.apoderadoNombre}</TableCell>
                        <TableCell className="text-slate-500 py-2.5">{formatDate(st.fechaPago)}</TableCell>
                        <TableCell className="text-right font-bold text-emerald-500 py-2.5 pr-4">{formatCLP(st.monto)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsStudentsOpen(false)} className="bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 font-semibold">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
