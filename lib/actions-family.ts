"use server"

import { db } from "@/lib/db"
import { familias, user, invitaciones, account } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { getUserId } from "@/lib/session"
import { auth } from "@/lib/auth"
import * as crypto from "crypto"
import { headers } from "next/headers"
import { hashPassword } from "better-auth/crypto"

// Genera una clave temporal legible pero segura
function generateTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let pass = "Temp-"
  for (let i = 0; i < 6; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pass + "!"
}

// 1. Obtener Familias con sus Administradores y Miembros
export async function getFamiliasConAdmins() {
  const allFamilias = await db.select().from(familias)
  const allUsers = await db.select().from(user)

  return allFamilias.map((fam) => {
    const members = allUsers.filter((u) => u.familyId === fam.id)
    const admins = members.filter((u) => u.role === "admin" || u.role === "webmaster")
    return {
      ...fam,
      admins: admins.map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        status: a.status,
        tempPasswordExpiresAt: (a as any).tempPasswordExpiresAt,
      })),
      integrantesCount: members.length,
    }
  })
}

// 2. Crear Familia con Administrador General
export async function crearFamiliaConAdministrador(data: {
  nombreFamilia: string
  emailFamilia: string
  nombreAdmin: string
  emailAdmin: string
}) {
  await getUserId()

  // Validaciones básicas
  if (!data.nombreFamilia.trim() || !data.emailFamilia.trim() || !data.nombreAdmin.trim() || !data.emailAdmin.trim()) {
    throw new Error("Todos los campos de la familia y el administrador son requeridos.")
  }

  // 1. Crear Familia
  const familyId = crypto.randomUUID()
  await db.insert(familias).values({
    id: familyId,
    nombre: data.nombreFamilia.trim(),
    email: data.emailFamilia.trim().toLowerCase(),
    estado: "activo",
  })

  // 2. Crear contraseña temporal y expiración
  const tempPassword = generateTempPassword()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

  // 3. Crear el usuario administrador general
  const userResult = await auth.api.signUpEmail({
    body: {
      email: data.emailAdmin.trim().toLowerCase(),
      password: tempPassword,
      name: data.nombreAdmin.trim(),
      role: "admin", // Administrador General
    }
  })

  if (!userResult || !userResult.user) {
    throw new Error("No se pudo crear el usuario administrador.")
  }

  const newUserId = userResult.user.id

  // 4. Actualizar campos adicionales de familia y estado en Drizzle
  await db.update(user)
    .set({
      familyId: familyId,
      status: "cambio_obligatorio",
      tempPasswordExpiresAt: expiresAt,
    })
    .where(eq(user.id, newUserId))

  // 5. Crear registro de invitación
  const token = crypto.randomBytes(32).toString("hex")
  await db.insert(invitaciones).values({
    id: token,
    userId: newUserId,
    email: data.emailAdmin.trim().toLowerCase(),
    tempPassword: tempPassword,
    expiresAt: expiresAt,
  })

  // 6. Simular el envío del correo (se muestra en consola y logs del servidor)
  const invitationLink = `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/sign-in?invite=${token}`
  console.log(`
    ============================================================
    [CORREO DE INVITACIÓN ENVIADO]
    Para: ${data.emailAdmin}
    Familia: ${data.nombreFamilia}
    Rol: Administrador General
    Clave Temporal: ${tempPassword} (Válida por 24 horas)
    Enlace de Activación: ${invitationLink}
    ============================================================
  `)

  revalidatePath("/admin/familias")
  return {
    success: true,
    familyId,
    userId: newUserId,
    tempPassword,
    invitationLink,
  }
}

// 3. Reenviar Invitación (Regenerar Clave Temporal)
export async function reenviarInvitacion(userId: string) {
  await getUserId()

  // Buscar usuario
  const [targetUser] = await db.select().from(user).where(eq(user.id, userId))
  if (!targetUser) {
    throw new Error("Usuario no encontrado.")
  }

  // Generar nueva clave temporal
  const tempPassword = generateTempPassword()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

  // Hashear clave
  const hashedPassword = await hashPassword(tempPassword)

  // Actualizar la contraseña en la tabla account
  await db.update(account)
    .set({ password: hashedPassword })
    .where(and(eq(account.userId, userId), eq(account.providerId, "email")))

  // Invalida invitaciones anteriores para este usuario
  await db.delete(invitaciones).where(eq(invitaciones.userId, userId))

  // Crear nueva invitación
  const token = crypto.randomBytes(32).toString("hex")
  await db.insert(invitaciones).values({
    id: token,
    userId: userId,
    email: targetUser.email,
    tempPassword: tempPassword,
    expiresAt: expiresAt,
  })

  // Actualizar la expiración y estado en el usuario
  await db.update(user)
    .set({
      status: "cambio_obligatorio",
      tempPasswordExpiresAt: expiresAt,
    })
    .where(eq(user.id, userId))

  const invitationLink = `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/sign-in?invite=${token}`
  console.log(`
    ============================================================
    [RE-ENVÍO DE CORREO DE INVITACIÓN]
    Para: ${targetUser.email}
    Clave Temporal: ${tempPassword} (Válida por 24 horas)
    Enlace de Activación: ${invitationLink}
    ============================================================
  `)

  revalidatePath("/admin/familias")
  return {
    success: true,
    tempPassword,
    invitationLink,
  }
}

// 4. Actualizar Contraseña Obligatoria
export async function actualizarContraseñaObligatoria(data: {
  currentPassword: string
  newPassword: string
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    throw new Error("No estás autenticado.")
  }

  const userId = session.user.id
  const userEmail = session.user.email

  // Cambiar la contraseña mediante better-auth
  await auth.api.changePassword({
    body: {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      revokeOtherSessions: true,
    },
    headers: await headers(),
  })

  // Actualizar estado del usuario a activo y limpiar expiración
  await db.update(user)
    .set({
      status: "activo",
      tempPasswordExpiresAt: null,
    })
    .where(eq(user.id, userId))

  // Marcar la invitación correspondiente como usada
  await db.update(invitaciones)
    .set({ usedAt: new Date() })
    .where(and(eq(invitaciones.userId, userId), eq(invitaciones.email, userEmail)))

  return { success: true }
}
