import { SidebarLayout } from "@/components/sidebar-layout"
import { requireUser } from "@/lib/session"

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Asegura que el usuario esté autenticado antes de cargar el layout
  await requireUser()

  return <SidebarLayout>{children}</SidebarLayout>
}
