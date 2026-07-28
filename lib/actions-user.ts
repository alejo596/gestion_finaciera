"use server"

import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getUserId } from "@/lib/session"

import { auth } from "@/lib/auth"

export async function getAllUsers() {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(user.name)
}

export async function updateUserRole(userId: string, newRole: string) {
  const currentUserId = await getUserId()
  if (currentUserId === userId) {
    throw new Error("No puedes cambiar tu propio rol de administrador/webmaster para evitar quedarte sin acceso.")
  }

  const validRoles = ["webmaster", "admin", "admin_colegio", "admin_curso", "apoderado", "admin_condominio", "copropietario", "invitado"]
  if (!validRoles.includes(newRole)) {
    throw new Error("Rol inválido especificado")
  }

  const [updatedUser] = await db
    .update(user)
    .set({ role: newRole })
    .where(eq(user.id, userId))
    .returning()

  revalidatePath("/admin/usuarios")
  return updatedUser
}

export async function createSystemUser(data: {
  name: string
  email: string
  password?: string
  role: string
}) {
  if (!data.name.trim() || !data.email.trim()) {
    throw new Error("Nombre y correo son requeridos")
  }

  const validRoles = ["webmaster", "admin", "admin_colegio", "admin_curso", "apoderado", "admin_condominio", "copropietario", "invitado"]
  if (!validRoles.includes(data.role)) {
    throw new Error("Rol inválido especificado")
  }

  // Crea el usuario con better-auth
  const newUser = await auth.api.signUpEmail({
    body: {
      email: data.email.trim().toLowerCase(),
      password: data.password || "Password123!",
      name: data.name.trim(),
      role: data.role,
    }
  })

  revalidatePath("/admin/usuarios")
  return newUser
}

export async function deleteSystemUser(userId: string) {
  const currentUserId = await getUserId()
  if (currentUserId === userId) {
    throw new Error("No puedes eliminar tu propio usuario administrador.")
  }

  await db.delete(user).where(eq(user.id, userId))
  revalidatePath("/admin/usuarios")
}
