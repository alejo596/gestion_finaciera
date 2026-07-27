"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createColegio, updateColegio } from "@/lib/actions-school"
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
import { Plus, Edit, School, Info } from "lucide-react"

type ColegiosContentProps = {
  initialColegios: any[]
}

export function ColegiosContent({ initialColegios }: ColegiosContentProps) {
  const router = useRouter()
  const [colegios, setColegios] = useState(initialColegios)
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form states
  const [selectedColegio, setSelectedColegio] = useState<any | null>(null)
  const [nombre, setNombre] = useState("")
  const [rut, setRut] = useState("")
  const [direccion, setDireccion] = useState("")
  const [comuna, setComuna] = useState("")
  const [region, setRegion] = useState("")
  const [contacto, setContacto] = useState("")
  const [estado, setEstado] = useState("activo")

  const handleOpenCreate = () => {
    setSelectedColegio(null)
    setNombre("")
    setRut("")
    setDireccion("")
    setComuna("")
    setRegion("")
    setContacto("")
    setEstado("activo")
    setIsOpen(true)
  }

  const handleOpenEdit = (col: any) => {
    setSelectedColegio(col)
    setNombre(col.nombre)
    setRut(col.rut)
    setDireccion(col.direccion || "")
    setComuna(col.comuna || "")
    setRegion(col.region || "")
    setContacto(col.contacto || "")
    setEstado(col.estado)
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !rut.trim()) {
      toast.error("Nombre y RUT son obligatorios")
      return
    }

    setIsSubmitting(true)
    try {
      if (selectedColegio) {
        // Editar
        const updated = await updateColegio(selectedColegio.id, {
          nombre,
          rut,
          direccion,
          comuna,
          region,
          contacto,
          estado,
        })
        setColegios((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
        toast.success("Colegio actualizado correctamente")
      } else {
        // Crear
        const newCol = await createColegio({
          nombre,
          rut,
          direccion,
          comuna,
          region,
          contacto,
          estado,
        })
        setColegios((prev) => [newCol, ...prev])
        toast.success("Colegio creado con éxito")
      }
      setIsOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Error al guardar el colegio")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Gestión de Colegios
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Administra los establecimientos educacionales de la plataforma
          </p>
        </div>

        <Button
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Agregar Colegio
        </Button>
      </div>

      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <School className="h-5 w-5 text-indigo-500" />
            Colegios Registrados
          </CardTitle>
          <CardDescription className="text-xs">
            Listado completo de colegios, ubicación e información de contacto
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {colegios.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No hay colegios registrados en la plataforma.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold pl-6">Nombre</TableHead>
                    <TableHead className="text-xs font-semibold">RUT</TableHead>
                    <TableHead className="text-xs font-semibold">Ubicación</TableHead>
                    <TableHead className="text-xs font-semibold">Contacto</TableHead>
                    <TableHead className="text-xs font-semibold">Estado</TableHead>
                    <TableHead className="w-12 pr-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colegios.map((col) => (
                    <TableRow
                      key={col.id}
                      className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                    >
                      <TableCell className="font-semibold text-xs py-4 pl-6 text-slate-800 dark:text-slate-200">
                        {col.nombre}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs py-4">
                        {col.rut}
                      </TableCell>
                      <TableCell className="text-slate-555 text-xs py-4">
                        {col.direccion ? (
                          <span>
                            {col.direccion}, {col.comuna}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No especificada</span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs py-4">
                        {col.contacto || <span className="text-slate-400 italic">No especificado</span>}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-bold border-0 ${
                            col.estado === "activo"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-slate-500/10 text-slate-500"
                          }`}
                        >
                          {col.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6 py-4">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenEdit(col)}
                          className="text-slate-400 hover:text-indigo-500 transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
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

      {/* Create / Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="border-slate-200 bg-white text-slate-850 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-bold text-lg">
              {selectedColegio ? "Editar Colegio" : "Registrar Colegio"}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Ingresa los datos del establecimiento educacional para su administración.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="col-name" className="font-semibold">Nombre del Colegio *</Label>
                  <Input
                    id="col-name"
                    placeholder="Ej: Colegio San Agustín"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="col-rut" className="font-semibold">RUT *</Label>
                  <Input
                    id="col-rut"
                    placeholder="Ej: 72.123.456-7"
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                    required
                    className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="col-dir" className="font-semibold">Dirección</Label>
                <Input
                  id="col-dir"
                  placeholder="Ej: Av. Las Condes 1234"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="col-comuna" className="font-semibold">Comuna</Label>
                  <Input
                    id="col-comuna"
                    placeholder="Ej: Providencia"
                    value={comuna}
                    onChange={(e) => setComuna(e.target.value)}
                    className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="col-region" className="font-semibold">Región</Label>
                  <Input
                    id="col-region"
                    placeholder="Ej: Metropolitana"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="col-contact" className="font-semibold">Contacto / Teléfono / Correo</Label>
                  <Input
                    id="col-contact"
                    placeholder="Ej: contacto@sanjose.cl"
                    value={contacto}
                    onChange={(e) => setContacto(e.target.value)}
                    className="bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
                {selectedColegio && (
                  <div className="space-y-1">
                    <Label htmlFor="col-state" className="font-semibold">Estado</Label>
                    <select
                      id="col-state"
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
