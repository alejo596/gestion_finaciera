"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createCurso } from "@/lib/actions-school"
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
import { toast } from "sonner"
import { Plus, BookOpen } from "lucide-react"

type CursosContentProps = {
  initialCursos: any[]
  colegios: any[]
}

export function CursosContent({ initialCursos, colegios }: CursosContentProps) {
  const router = useRouter()
  const [cursos, setCursos] = useState(initialCursos)
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [colegioId, setColegioId] = useState("")
  const [anio, setAnio] = useState(String(new Date().getFullYear()))
  const [nivel, setNivel] = useState("")
  const [nombre, setNombre] = useState("")
  const [profesorJefe, setProfesorJefe] = useState("")
  const [directiva, setDirectiva] = useState("")

  const handleOpenCreate = () => {
    setColegioId(colegios.length > 0 ? String(colegios[0].id) : "")
    setAnio(String(new Date().getFullYear()))
    setNivel("")
    setNombre("")
    setProfesorJefe("")
    setDirectiva("")
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!colegioId || !nivel.trim() || !nombre.trim()) {
      toast.error("Por favor completa los campos requeridos")
      return
    }

    setIsSubmitting(true)
    try {
      const newCurso = await createCurso({
        colegioId: Number(colegioId),
        anio: Number(anio),
        nivel: nivel.trim(),
        nombre: nombre.trim(),
        profesorJefe: profesorJefe.trim(),
        directiva: directiva.trim(),
      })

      // Refresh list: reload page data
      toast.success("Curso creado con éxito")
      setIsOpen(false)
      router.refresh()
      window.location.reload() // Fuerza la actualización local
    } catch (err: any) {
      toast.error(err.message || "Error al crear el curso")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Gestión de Cursos
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Administra los cursos escolares y sus profesores jefes
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          disabled={colegios.length === 0}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Agregar Curso
        </Button>
      </div>

      {colegios.length === 0 && (
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs">
          ⚠️ Antes de agregar un curso, debes registrar al menos un colegio en el módulo de Colegios.
        </div>
      )}

      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-500" />
            Cursos del Año Académico
          </CardTitle>
          <CardDescription className="text-xs">
            Listado de cursos asociados a cada colegio y directivas
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {cursos.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No hay cursos registrados en la plataforma.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold pl-6">Colegio</TableHead>
                    <TableHead className="text-xs font-semibold">Año</TableHead>
                    <TableHead className="text-xs font-semibold">Nivel / Curso</TableHead>
                    <TableHead className="text-xs font-semibold">Profesor Jefe</TableHead>
                    <TableHead className="text-xs font-semibold">Directiva</TableHead>
                    <TableHead className="text-xs font-semibold pr-6">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cursos.map((c) => (
                    <TableRow
                      key={c.id}
                      className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                    >
                      <TableCell className="font-semibold text-xs py-4 pl-6 text-slate-800 dark:text-slate-200">
                        {c.colegioNombre}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs py-4">
                        {c.anio}
                      </TableCell>
                      <TableCell className="font-semibold text-xs py-4 text-indigo-600 dark:text-indigo-400">
                        {c.nivel} {c.nombre}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs py-4">
                        {c.profesorJefe || <span className="text-slate-400 italic">No asignado</span>}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs py-4 truncate max-w-[200px]">
                        {c.directiva || <span className="text-slate-400 italic">No especificada</span>}
                      </TableCell>
                      <TableCell className="pr-6 py-4">
                        <Badge
                          variant="outline"
                          className="text-[9px] font-bold border-0 bg-emerald-500/10 text-emerald-500"
                        >
                          activo
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="border-slate-200 bg-white text-slate-850 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">Agregar Curso</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Configura un nuevo curso y asígnalo a su colegio correspondiente.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="cur-col" className="font-semibold">Colegio *</Label>
                  <select
                    id="cur-col"
                    value={colegioId}
                    onChange={(e) => setColegioId(e.target.value)}
                    required
                    className="w-full rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                  >
                    <option value="">Selecciona</option>
                    {colegios.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cur-anio" className="font-semibold">Año Académico *</Label>
                  <Input
                    id="cur-anio"
                    type="number"
                    value={anio}
                    onChange={(e) => setAnio(e.target.value)}
                    required
                    className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="cur-nivel" className="font-semibold">Nivel (Ej: 5° Básico) *</Label>
                  <Input
                    id="cur-nivel"
                    placeholder="Ej: 5° Básico"
                    value={nivel}
                    onChange={(e) => setNivel(e.target.value)}
                    required
                    className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cur-nombre" className="font-semibold">Letra / Nombre (Ej: A) *</Label>
                  <Input
                    id="cur-nombre"
                    placeholder="Ej: A"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="cur-prof" className="font-semibold">Profesor Jefe</Label>
                <Input
                  id="cur-prof"
                  placeholder="Ej: Carmen Gloria Valenzuela"
                  value={profesorJefe}
                  onChange={(e) => setProfesorJefe(e.target.value)}
                  className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cur-dir" className="font-semibold">Directiva del Curso (Resumen / Nombres)</Label>
                <Input
                  id="cur-dir"
                  placeholder="Ej: Presidenta: Ana María, Tesorero: Carlos"
                  value={directiva}
                  onChange={(e) => setDirectiva(e.target.value)}
                  className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                {isSubmitting ? "Creando..." : "Crear Curso"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
