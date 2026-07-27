"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatCLP, formatDate, MESES } from "@/lib/format"
import { procesarPagoGastoComun } from "@/lib/actions-condo"
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
import { ShoppingCart, CreditCard, CheckCircle2, Printer, ChevronLeft, ArrowRight, Info } from "lucide-react"

type CondoPagarContentProps = {
  initialGC: any[]
}

export function CondoPagarContent({ initialGC }: CondoPagarContentProps) {
  const router = useRouter()
  const [gateway, setGateway] = useState("Webpay")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [receipt, setReceipt] = useState<{ transaccionId: string; fecha: string } | null>(null)

  const total = initialGC.reduce((sum, g) => sum + g.monto, 0)

  const handlePay = async () => {
    setIsSubmitting(true)
    try {
      // Pagar cada uno
      let finalRes: any = null
      for (const gc of initialGC) {
        finalRes = await procesarPagoGastoComun({
          gastoComunId: gc.id,
          departamentoId: gc.departamentoId,
          monto: gc.monto,
          metodoPago: gateway === "Webpay" ? "Webpay Plus" : gateway === "MercadoPago" ? "Mercado Pago" : "Transferencia",
        })
      }
      setReceipt(finalRes)
      toast.success("Gastos comunes pagados con éxito")
    } catch (err: any) {
      toast.error(err.message || "Error al procesar el pago")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (receipt) {
    return (
      <div className="max-w-xl mx-auto space-y-6 py-4 animate-fade-in print:p-0 text-xs">
        <Card className="border-emerald-500/30 bg-white dark:border-emerald-500/20 dark:bg-slate-900 shadow-lg">
          <CardHeader className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-2 animate-bounce" />
            <CardTitle className="text-xl font-bold text-slate-800 dark:text-white">Pago de Gastos Comunes Exitoso</CardTitle>
            <CardDescription className="text-xs">La administración del condominio ha acreditado tu pago</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
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
                <strong className="text-emerald-500 font-bold">Aprobado / Acreditado</strong>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Detalle de Unidades Pagadas</span>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {initialGC.map((gc) => (
                  <div key={gc.id} className="flex justify-between py-2.5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {gc.bloque ? `${gc.bloque} - N° ${gc.numero}` : `Depto ${gc.numero}`}
                      </span>
                      <span className="text-[9px] text-slate-400">Periodo: {MESES[gc.mes - 1]} / {gc.anio}</span>
                    </div>
                    <strong className="text-slate-800 dark:text-slate-200">{formatCLP(gc.monto)}</strong>
                  </div>
                ))}
                <div className="flex justify-between py-3 font-extrabold text-sm border-t border-slate-200 dark:border-slate-700">
                  <span>Total Pagado</span>
                  <span className="text-emerald-500">{formatCLP(total)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2 print:hidden">
              <Button variant="outline" onClick={handlePrint} className="flex-1 text-slate-600 dark:text-slate-300 font-semibold gap-2 border-slate-200 dark:border-slate-800">
                <Printer className="h-4 w-4" /> Imprimir Comprobante
              </Button>
              <Button onClick={() => router.push("/condominio/dashboard")} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                Volver a Mis Departamentos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 py-4 animate-fade-in text-xs">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Pagar Gastos Comunes</h2>
          <p className="text-xs text-slate-500">Revisión del carro y confirmación de pago del condominio</p>
        </div>
      </div>

      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-lg">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-indigo-500" />
            Detalle del Cobro
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {initialGC.map((gc) => (
              <div key={gc.id} className="flex justify-between py-3">
                <div className="flex flex-col gap-0.5">
                  <strong className="text-slate-800 dark:text-slate-200">
                    {gc.bloque ? `${gc.bloque} - N° ${gc.numero}` : `Depto ${gc.numero}`}
                  </strong>
                  <span className="text-[10px] text-slate-400">Periodo G.C: {MESES[gc.mes - 1]} / {gc.anio}</span>
                </div>
                <strong className="text-slate-800 dark:text-slate-200">{formatCLP(gc.monto)}</strong>
              </div>
            ))}

            <div className="flex justify-between py-4 font-black text-sm border-t border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white">
              <span>Total a Pagar</span>
              <span className="text-emerald-500 text-base">{formatCLP(total)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Seleccionar Medio de Pago</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "Webpay", name: "Webpay Plus", desc: "Transbank" },
                { id: "MercadoPago", name: "Mercado Pago", desc: "Crédito / Débito" },
                { id: "Transferencia", name: "Transferencia", desc: "Comprobante de Caja" },
              ].map((gate) => (
                <div
                  key={gate.id}
                  onClick={() => setGateway(gate.id)}
                  className={`border p-3 rounded-xl text-center cursor-pointer transition-all duration-200 ${
                    gateway === gate.id
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-inner"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30 text-slate-650"
                  }`}
                >
                  <CreditCard className="h-5 w-5 mx-auto mb-1.5 opacity-80" />
                  <span className="text-[10px] font-bold block">{gate.name}</span>
                  <span className="text-[8px] text-slate-400 block mt-0.5">{gate.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl text-[10px] bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 text-slate-400 flex items-start gap-2.5 leading-normal">
            <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              El pago se procesará y acreditará en el historial de copropiedad inmediatamente. La arquitectura del sistema está lista para enlazar pasarelas de pago reales compatibles con Chile.
            </div>
          </div>

          <Button
            onClick={handlePay}
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-5 flex items-center justify-center gap-2"
          >
            {isSubmitting ? "Procesando..." : "Confirmar y Pagar Gastos Comunes"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
