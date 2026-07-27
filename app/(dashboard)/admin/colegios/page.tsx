import { requireUser } from "@/lib/session"
import { getColegios } from "@/lib/actions-school"
import { ColegiosContent } from "./colegios-content"
import { redirect } from "next/navigation"

export default async function AdminColegiosPage() {
  const user = await requireUser()
  if (user.role !== "webmaster" && user.role !== "admin" && user.role !== "admin_colegio") {
    redirect("/dashboard")
  }

  const list = await getColegios()

  return (
    <ColegiosContent
      initialColegios={list}
    />
  )
}
