import { requireUser } from "@/lib/session"
import { getFamiliasConAdmins } from "@/lib/actions-family"
import { FamiliasContent } from "./familias-content"
import { redirect } from "next/navigation"

export default async function AdminFamiliasPage() {
  const user = await requireUser()
  if (user.role !== "webmaster" && user.role !== "invitado") {
    redirect("/dashboard")
  }

  const list = await getFamiliasConAdmins()

  return (
    <FamiliasContent
      initialFamilias={list}
    />
  )
}
