"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatCLP, formatDate } from "@/lib/format"
import { procesarPagoCuotas } from "@/lib/actions-school"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  ShoppingCart,
  CreditCard,
  CheckCircle2,
  Printer,
  ChevronLeft,
  ArrowRight,
  Info,
} from "lucide-react"

type PagarContentProps = {
  alumno: {
    id: string
    nombreCompleto: string
    run: string
    colegioNombre: string
    cursoNivel: string
    cursoNombre: string
  }
  initialCuotas: any[]
}

export function PagarContent({ alumno, initialCuotas }: PagarContentProps) {
  const router = useRouter()
  const [gateway, setGateway] = useState("Webpay")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [receipt, setReceipt] = useState<{ transaccionId: string; fecha: string } | null>(null)

  const total = initialCuotas.reduce((sum, c) => sum + c.monto, 0)

  const handlePay = async () => {
    setIsSubmitting(true)
    const cuotaIds = initialCuotas.map((c) => c.id)

    try {
      const res = await procesarPagoCuotas({
        alumnoId: alumno.id,
        cuotaIds,
        metodoPago: gateway === "Webpay" ? "Webpay Plus" : gateway === "MercadoPago" ? "Mercado Pago" : "Transferencia",
      })
      setReceipt(res)
      toast.success("Pago procesado y registrado con éxito")
    } catch (err: any) {
      toast.error(err.message || "Error al procesar el pago")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // STEP 2: Receipt display
  if (receipt) {
    return (
      <div className="max-w-xl mx-auto space-y-6 py-4 animate-fade-in print:p-0">
        <Card className="border-emerald-500/30 bg-white dark:border-emerald-500/20 dark:bg-slate-900 shadow-lg">
          <CardHeader className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-2 animate-bounce" />
            <CardTitle className="text-xl font-bold text-slate-800 dark:text-white">Pago Exitoso</CardTitle>
            <CardDescription className="text-xs">Tu transacción ha sido validada y registrada correctamente</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">ID Transacción</span>
                <strong className="text-slate-700 dark:text-slate-200 font-mono text-[11px] uppercase">{receipt.transaccionId}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Fecha y Hora</span>
                <strong className="text-slate-700 dark:text-slate-200">{formatDate(receipt.fecha)}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Método de Pago</span>
                <Badge variant="outline" className="text-[9px] font-bold mt-0.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
                  {gateway === "Webpay" ? "Webpay Plus" : gateway === "MercadoPago" ? "Mercado Pago" : "Transferencia"}
                </Badge>
              </div>
              <div>
                <span className="text-slate-400 block">Estado del Pago</span>
                <strong className="text-emerald-500 font-bold">Aprobado</strong>
              </div>
            </div>

            {/* Student Details */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800/80 text-xs space-y-1">
              <div>
                <span className="text-slate-400">Alumno:</span> <strong className="text-slate-700 dark:text-slate-200">{alumno.nombreCompleto}</strong>
              </div>
              <div>
                <span className="text-slate-400">RUN:</span> <strong className="text-slate-700 dark:text-slate-200">{alumno.run}</strong>
              </div>
              <div>
                <span className="text-slate-400">Colegio:</span> <strong className="text-slate-700 dark:text-slate-200">{alumno.colegioNombre}</strong>
              </div>
              <div>
                <span className="text-slate-400">Curso:</span> <strong className="text-slate-700 dark:text-slate-200">{alumno.cursoNivel} {alumno.cursoNombre}</strong>
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-3">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Detalle del Pago</span>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {initialCuotas.map((c) => (
                  <div key={c.id} className="flex justify-between py-2.5">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{c.nombre}</span>
                    <strong className="text-slate-800 dark:text-slate-200">{formatCLP(c.monto)}</strong>
                  </div>
                ))}
                <div className="flex justify-between py-3 font-extrabold text-sm border-t border-slate-200 dark:border-slate-700">
                  <span>Total Pagado</span>
                  <span className="text-emerald-500">{formatCLP(total)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 print:hidden">
              <Button variant="outline" onClick={handlePrint} className="flex-1 text-slate-600 dark:text-slate-300 font-semibold gap-2 border-slate-200 dark:border-slate-800">
                <Printer className="h-4 w-4" /> Imprimir Recibo
              </Button>
              <Button onClick={() => router.push("/colegio/dashboard")} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                Volver al Panel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // STEP 1: Shopping Cart checkout review
  return (
    <div className="max-w-xl mx-auto space-y-6 py-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Revisar Pago</h2>
          <p className="text-xs text-slate-500">Confirmación y carro de cuotas escolares</p>
        </div>
      </div>

      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-lg">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-indigo-500" />
            Detalle del Pedido
          </CardTitle>
          <CardDescription className="text-xs">
            Curso: {alumno.cursoNivel} {alumno.cursoNombre} — {alumno.nombreCompleto}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Cart items list */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {initialCuotas.map((c) => (
              <div key={c.id} className="flex justify-between py-3">
                <div className="flex flex-col gap-0.5">
                  <strong className="text-slate-800 dark:text-slate-200">{c.nombre}</strong>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">{c.tipo}</span>
                </div>
                <strong className="text-slate-800 dark:text-slate-200">{formatCLP(c.monto)}</strong>
              </div>
            ))}

            <div className="flex justify-between py-4 font-black text-sm border-t border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white">
              <span>Total a Pagar</span>
              <span className="text-emerald-500 text-base">{formatCLP(total)}</span>
            </div>
          </div>

          {/* Payment gateway select */}
          <div className="space-y-3">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Seleccionar Pasarela de Pago</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "Webpay", name: "Webpay Plus", desc: "Transbank" },
                { id: "MercadoPago", name: "Mercado Pago", desc: "Débito / Crédito" },
                { id: "Transferencia", name: "Transferencia", desc: "Banco Estado / Chile" },
              ].map((gate) => (
                <div
                  key={gate.id}
                  onClick={() => setGateway(gate.id)}
                  className={`border p-3 rounded-xl text-center cursor-pointer transition-all duration-200 ${
                    gateway === gate.id
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-inner"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30 text-slate-600 dark:text-slate-450"
                  }`}
                >
                  <CreditCard className="h-5 w-5 mx-auto mb-1.5 opacity-80" />
                  <span className="text-[10px] font-bold block">{gate.name}</span>
                  <span className="text-[8px] text-slate-400 block mt-0.5">{gate.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* API Info alert */}
          <div className="p-3.5 rounded-xl text-[10px] bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 text-slate-400 flex items-start gap-2.5 leading-normal">
            <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              Esta transacción simula un entorno seguro. La arquitectura del sistema está preparada para integrar pasarelas de pago reales mediante API de producción (Webpay de Transbank, Mercado Pago) sin alterar la base de datos principal.
            </div>
          </div>

          {/* Submit button */}
          <Button
            onClick={handlePay}
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-5 flex items-center justify-center gap-2"
          >
            {isSubmitting ? "Procesando..." : "Confirmar y Realizar Pago"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
