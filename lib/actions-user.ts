"use server"

import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getUserId } from "@/lib/session"

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

  const validRoles = ["webmaster", "admin", "admin_colegio", "admin_curso", "apoderado", "admin_condominio", "copropietario"]
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
