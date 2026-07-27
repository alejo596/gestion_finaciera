"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createAlumno, createApoderado, vincularApoderadoAlumno } from "@/lib/actions-school"
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
import { toast } from "sonner"
import { Plus, Users, GraduationCap, Link2 } from "lucide-react"

type AlumnosContentProps = {
  initialAlumnos: any[]
  cursos: any[]
  colegios: any[]
  apoderados: any[]
}

export function AlumnosContent({
  initialAlumnos,
  cursos,
  colegios,
  apoderados,
}: AlumnosContentProps) {
  const router = useRouter()
  const [alumnos, setAlumnos] = useState(initialAlumnos)
  const [apoderadosList, setApoderadosList] = useState(apoderados)

  // Modals
  const [isStudentOpen, setIsStudentOpen] = useState(false)
  const [isParentOpen, setIsParentOpen] = useState(false)
  const [isLinkOpen, setIsLinkOpen] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Student Form
  const [nombreCompleto, setNombreCompleto] = useState("")
  const [run, setRun] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState("")
  const [colegioId, setColegioId] = useState("")
  const [cursoId, setCursoId] = useState("")

  // Parent Form
  const [parentName, setParentName] = useState("")
  const [parentEmail, setParentEmail] = useState("")

  // Link Form
  const [linkAlumnoId, setLinkAlumnoId] = useState("")
  const [linkApoderadoId, setLinkApoderadoId] = useState("")
  const [linkRelacion, setLinkRelacion] = useState("Padre")

  const handleOpenStudent = () => {
    setNombreCompleto("")
    setRun("")
    setFechaNacimiento("")
    setColegioId(colegios.length > 0 ? String(colegios[0].id) : "")
    setCursoId(cursos.length > 0 ? String(cursos[0].id) : "")
    setIsStudentOpen(true)
  }

  const handleOpenParent = () => {
    setParentName("")
    setParentEmail("")
    setIsParentOpen(true)
  }

  const handleOpenLink = () => {
    setLinkAlumnoId(alumnos.length > 0 ? alumnos[0].id : "")
    setLinkApoderadoId(apoderadosList.length > 0 ? apoderadosList[0].id : "")
    setLinkRelacion("Padre")
    setIsLinkOpen(true)
  }

  // Submit Student
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombreCompleto.trim() || !run.trim() || !colegioId || !cursoId) {
      toast.error("Por favor completa los campos requeridos")
      return
    }

    setIsSubmitting(true)
    try {
      const newAl = await createAlumno({
        nombreCompleto,
        run,
        fechaNacimiento,
        colegioId: Number(colegioId),
        cursoId: Number(cursoId),
      })
      setAlumnos((prev) => [newAl, ...prev])
      toast.success("Alumno registrado con éxito")
      setIsStudentOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Error al crear el alumno")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Submit Parent
  const handleSaveParent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!parentName.trim() || !parentEmail.trim()) {
      toast.error("Por favor completa los campos requeridos")
      return
    }

    setIsSubmitting(true)
    try {
      const newP = await createApoderado({
        name: parentName,
        email: parentEmail,
        role: "apoderado",
      })
      setApoderadosList((prev) => [newP, ...prev])
      toast.success("Apoderado registrado con éxito")
      setIsParentOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Error al crear el apoderado")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Submit Link
  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!linkAlumnoId || !linkApoderadoId || !linkRelacion) {
      toast.error("Por favor completa los campos requeridos")
      return
    }

    setIsSubmitting(true)
    try {
      await vincularApoderadoAlumno({
        apoderadoId: linkApoderadoId,
        alumnoId: linkAlumnoId,
        relacion: linkRelacion,
        responsablePago: true,
      })
      toast.success("Apoderado vinculado con éxito al alumno")
      setIsLinkOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Error al vincular")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
            Alumnos y Apoderados
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Administración de estudiantes, creación de cuentas de apoderados y vinculaciones familiares
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleOpenStudent} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Alumno
          </Button>
          <Button onClick={handleOpenParent} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Apoderado
          </Button>
          <Button onClick={handleOpenLink} className="bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center gap-1.5">
            <Link2 className="h-4 w-4" /> Vincular Familia
          </Button>
        </div>
      </div>

      <Tabs defaultValue="alumnos" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 mb-4 flex w-fit">
          <TabsTrigger value="alumnos" className="px-4 py-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 font-bold text-slate-700 dark:text-slate-200">
            Estudiantes
          </TabsTrigger>
          <TabsTrigger value="apoderados" className="px-4 py-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 font-bold text-slate-700 dark:text-slate-200">
            Cuentas Apoderados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alumnos">
          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-500" />
                Estudiantes Registrados
              </CardTitle>
              <CardDescription className="text-xs">Alumnos asignados a colegios, cursos e historiales</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {alumnos.length === 0 ? (
                <div className="py-16 text-center text-slate-450">No hay alumnos registrados.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                        <TableHead className="text-xs font-semibold pl-6">Nombre Completo</TableHead>
                        <TableHead className="text-xs font-semibold">RUN</TableHead>
                        <TableHead className="text-xs font-semibold">Colegio</TableHead>
                        <TableHead className="text-xs font-semibold">Curso</TableHead>
                        <TableHead className="text-xs font-semibold">Fecha Nacimiento</TableHead>
                        <TableHead className="text-xs font-semibold pr-6">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alumnos.map((a) => (
                        <TableRow key={a.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                          <TableCell className="font-semibold text-xs py-3.5 pl-6 text-slate-850 dark:text-slate-200">{a.nombreCompleto}</TableCell>
                          <TableCell className="text-slate-500 font-mono py-3.5">{a.run}</TableCell>
                          <TableCell className="text-slate-500 py-3.5">{a.colegioNombre}</TableCell>
                          <TableCell className="font-semibold text-indigo-500 py-3.5">{a.cursoNivel} {a.cursoNombre}</TableCell>
                          <TableCell className="text-slate-500 py-3.5">{a.fechaNacimiento ? a.fechaNacimiento : "-"}</TableCell>
                          <TableCell className="pr-6 py-3.5">
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-0 font-bold text-[9px]">{a.activo ? "Activo" : "Inactivo"}</Badge>
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

        <TabsContent value="apoderados">
          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-500" />
                Apoderados y Cuentas de Acceso
              </CardTitle>
              <CardDescription className="text-xs">Cuentas creadas para inicio de sesión en el portal apoderado</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {apoderadosList.length === 0 ? (
                <div className="py-16 text-center text-slate-450">No hay apoderados registrados.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                        <TableHead className="text-xs font-semibold pl-6">Nombre Apoderado</TableHead>
                        <TableHead className="text-xs font-semibold">Correo Electrónico</TableHead>
                        <TableHead className="text-xs font-semibold">ID Usuario</TableHead>
                        <TableHead className="text-xs font-semibold pr-6">Rol Asignado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apoderadosList.map((p) => (
                        <TableRow key={p.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                          <TableCell className="font-semibold text-xs py-3.5 pl-6 text-slate-850 dark:text-slate-200">{p.name}</TableCell>
                          <TableCell className="text-slate-500 py-3.5">{p.email}</TableCell>
                          <TableCell className="text-slate-500 font-mono py-3.5 text-[10px]">{p.id}</TableCell>
                          <TableCell className="pr-6 py-3.5">
                            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-0 font-bold text-[9px] uppercase">{p.role}</Badge>
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
      </Tabs>

      {/* STUDENT DIALOG */}
      <Dialog open={isStudentOpen} onOpenChange={setIsStudentOpen}>
        <DialogContent className="border-slate-200 bg-white text-slate-850 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 text-xs">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">Registrar Alumno</DialogTitle>
            <DialogDescription className="text-slate-450 text-xs">Ingresa los datos personales del estudiante y asígnalo a su curso.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveStudent}>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="al-name" className="font-semibold">Nombre Completo *</Label>
                <Input id="al-name" placeholder="Ej: Pedro Pérez Vargas" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} required className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="al-run" className="font-semibold">RUN / RUN Estudiante *</Label>
                  <Input id="al-run" placeholder="Ej: 23.456.789-K" value={run} onChange={(e) => setRun(e.target.value)} required className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="al-birth" className="font-semibold">Fecha de Nacimiento</Label>
                  <Input id="al-birth" type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="al-col" className="font-semibold">Colegio *</Label>
                  <select id="al-col" value={colegioId} onChange={(e) => setColegioId(e.target.value)} required className="w-full rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                    <option value="">Selecciona</option>
                    {colegios.map((c) => (<option key={c.id} value={c.id}>{c.nombre}</option>))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="al-cur" className="font-semibold">Curso *</Label>
                  <select id="al-cur" value={cursoId} onChange={(e) => setCursoId(e.target.value)} required className="w-full rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                    <option value="">Selecciona</option>
                    {cursos.map((c) => (<option key={c.id} value={c.id}>{c.colegioNombre} — {c.nivel} {c.nombre}</option>))}
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsStudentOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 text-white font-semibold">{isSubmitting ? "Registrando..." : "Registrar Alumno"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* PARENT DIALOG */}
      <Dialog open={isParentOpen} onOpenChange={setIsParentOpen}>
        <DialogContent className="border-slate-200 bg-white text-slate-850 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 text-xs">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">Crear Cuenta de Apoderado</DialogTitle>
            <DialogDescription className="text-slate-455 text-xs">Registra la cuenta básica del apoderado para que pueda entrar con su email.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveParent}>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="p-name" className="font-semibold">Nombre Completo *</Label>
                <Input id="p-name" placeholder="Ej: Juan Pérez Vargas" value={parentName} onChange={(e) => setParentName(e.target.value)} required className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="p-email" className="font-semibold">Correo Electrónico *</Label>
                <Input id="p-email" type="email" placeholder="Ej: juan.perez@email.com" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} required className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsParentOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 text-white font-semibold">{isSubmitting ? "Registrando..." : "Crear Apoderado"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* LINK DIALOG */}
      <Dialog open={isLinkOpen} onOpenChange={setIsLinkOpen}>
        <DialogContent className="border-slate-200 bg-white text-slate-850 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 text-xs">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">Vincular Apoderado con Alumno</DialogTitle>
            <DialogDescription className="text-slate-455 text-xs font-semibold">Crea la relación familiar de pago y consulta entre el tutor y el alumno.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveLink}>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="l-al" className="font-semibold">Alumno *</Label>
                <select id="l-al" value={linkAlumnoId} onChange={(e) => setLinkAlumnoId(e.target.value)} required className="w-full rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                  <option value="">Selecciona</option>
                  {alumnos.map((a) => (<option key={a.id} value={a.id}>{a.nombreCompleto} ({a.run})</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="l-p" className="font-semibold">Apoderado *</Label>
                  <select id="l-p" value={linkApoderadoId} onChange={(e) => setLinkApoderadoId(e.target.value)} required className="w-full rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                    <option value="">Selecciona</option>
                    {apoderadosList.map((p) => (<option key={p.id} value={p.id}>{p.name} ({p.email})</option>))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="l-rel" className="font-semibold">Relación / Parentesco *</Label>
                  <select id="l-rel" value={linkRelacion} onChange={(e) => setLinkRelacion(e.target.value)} required className="w-full rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                    <option value="Padre">Padre</option>
                    <option value="Madre">Madre</option>
                    <option value="Tutor">Tutor Legal</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsLinkOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-amber-600 text-white font-semibold">{isSubmitting ? "Vinculando..." : "Establecer Vínculo"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
