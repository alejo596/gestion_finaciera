import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export type SessionUser = {
  id: string
  name: string
  email: string
  role: string
  familyId: string | null
  status: string
}

// Devuelve la sesión actual o null.
export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

// Devuelve el usuario autenticado o redirige a /sign-in.
export async function requireUser(allowTemp = false): Promise<SessionUser> {
  const session = await getSession()
  if (!session?.user) redirect("/sign-in")
  const u = session.user as any
  
  if (u.status === "cambio_obligatorio") {
    if (u.tempPasswordExpiresAt) {
      const expires = new Date(u.tempPasswordExpiresAt)
      if (expires < new Date()) {
        redirect("/sign-in?error=expired")
      }
    }
    if (!allowTemp) {
      redirect("/change-password")
    }
  }
  
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role ?? "apoderado",
    familyId: u.familyId ?? null,
    status: u.status ?? "activo",
  }
}

// Devuelve solo el id del usuario autenticado (para server actions).
export async function getUserId(): Promise<string> {
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}
