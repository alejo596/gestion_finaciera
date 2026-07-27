import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export type SessionUser = {
  id: string
  name: string
  email: string
  role: string
}

// Devuelve la sesión actual o null.
export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

// Devuelve el usuario autenticado o redirige a /sign-in.
export async function requireUser(): Promise<SessionUser> {
  const session = await getSession()
  if (!session?.user) redirect("/sign-in")
  const u = session.user as { id: string; name: string; email: string; role?: string }
  return { id: u.id, name: u.name, email: u.email, role: u.role ?? "apoderado" }
}

// Devuelve solo el id del usuario autenticado (para server actions).
export async function getUserId(): Promise<string> {
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}
