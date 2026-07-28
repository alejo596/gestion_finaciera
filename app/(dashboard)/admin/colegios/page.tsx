import { requireUser } from "@/lib/session"
import { getColegios } from "@/lib/actions-school"
import { ColegiosContent } from "./colegios-content"
import { redirect } from "next/navigation"

export default async function AdminColegiosPage() {
  const user = await requireUser()
  if (
    user.role !== "webmaster" &&
    user.role !== "admin" &&
    user.role !== "admin_colegio" &&
    user.role !== "invitado"
  ) {
    redirect("/dashboard")
  }

  let list: any[] = []
  if (user.role === "invitado") {
    list = [
      { id: 10, nombre: "Colegio Saint George", direccion: "Av. Las Condes 12345", comuna: "Las Condes", telefono: "+56222003300" }
    ]
  } else {
    list = await getColegios()
  }

  return (
    <ColegiosContent
      initialColegios={list}
    />
  )
}
