import { requireUser } from "@/lib/session"
import { getComprobantesPagoApoderado } from "@/lib/actions-school"
import { formatCLP, formatDate } from "@/lib/format"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Receipt, Info } from "lucide-react"

export default async function ComprobantesPage() {
  const user = await requireUser()
  const comprobantes = await getComprobantesPagoApoderado(user.id)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Historial de Comprobantes
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Respaldos oficiales de tus transacciones y pagos de cuotas escolares
        </p>
      </div>

      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Receipt className="h-5 w-5 text-indigo-500" />
            Transacciones Registradas
          </CardTitle>
          <CardDescription className="text-xs">
            Lista de pagos de cuotas aprobadas en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {comprobantes.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Aún no has registrado ningún pago en la plataforma.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold pl-6">Alumno</TableHead>
                    <TableHead className="text-xs font-semibold">Colegio / Curso</TableHead>
                    <TableHead className="text-xs font-semibold">Concepto / Cuota</TableHead>
                    <TableHead className="text-xs font-semibold">Fecha Pago</TableHead>
                    <TableHead className="text-xs font-semibold">ID Transacción</TableHead>
                    <TableHead className="text-xs font-semibold">Método</TableHead>
                    <TableHead className="text-right text-xs font-semibold pr-6">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comprobantes.map((c) => (
                    <TableRow
                      key={c.id}
                      className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                    >
                      <TableCell className="font-semibold text-xs py-4 pl-6 text-slate-800 dark:text-slate-200">
                        {c.alumnoNombre}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs py-4">
                        <div className="flex flex-col">
                          <span>{c.colegioNombre}</span>
                          <span className="text-[10px] text-indigo-500 font-semibold">{c.cursoNivel} {c.cursoNombre}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-xs py-4 text-slate-700 dark:text-slate-350">
                        {c.cuotaNombre}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs py-4">
                        {formatDate(c.fecha)}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs py-4 font-mono">
                        {c.transaccionId}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant="outline"
                          className="text-[9px] font-semibold border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                        >
                          {c.metodoPago}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-xs py-4 text-emerald-500 pr-6">
                        {formatCLP(c.monto)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="p-4 rounded-xl text-xs bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 text-slate-400 flex items-start gap-3">
        <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
        <p className="leading-normal">
          Todos los comprobantes listados arriba cuentan con validez contable simulada. Los datos y referencias de transacción representan la firma digital autorizada de tu colegio para el año académico correspondiente.
        </p>
      </div>
    </div>
  )
}
