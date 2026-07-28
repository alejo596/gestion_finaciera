"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "@/lib/auth-client"
import { useTheme } from "next-themes"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import {
  LayoutDashboard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Utensils,
  Sun,
  Moon,
  LogOut,
  ChevronUp,
  School,
  BookOpen,
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Receipt,
  ShoppingCart,
  Building,
  Key,
} from "lucide-react"

type SidebarLayoutProps = {
  children: React.ReactNode
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { data: session, isPending } = useSession()

  const handleLogout = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Sesión cerrada")
            router.push("/sign-in")
            router.refresh()
          },
        },
      })
    } catch (error) {
      toast.error("Error al cerrar sesión")
    }
  }

  const user = session?.user
  const userRole = (user as any)?.role ?? "apoderado"

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "US"

  React.useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in")
    }
  }, [session, isPending, router])

  if (isPending) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-slate-400">Cargando aplicación...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  // --- MAPPING DE ROLES Y PERMISOS DE MENÚ ---
  const isWebmaster = userRole === "webmaster"
  const isInvitado = userRole === "invitado"
  
  // 1. Mostrar Finanzas del Hogar (solo Webmaster o Admin General)
  const showHogar = isWebmaster || userRole === "admin" || isInvitado

  // 2. Mostrar Portal Escolar Apoderado (Webmaster, Apoderado o Admin Curso)
  const showPortalEscolar = isWebmaster || userRole === "apoderado" || userRole === "admin_curso" || isInvitado

  // 3. Mostrar Administración Escolar (Webmaster, Admin Colegio o Admin Curso)
  const showAdminEscolar = isWebmaster || userRole === "admin_colegio" || userRole === "admin_curso" || isInvitado

  // 4. Mostrar Portal Condominio Residente (Webmaster, Copropietario)
  const showPortalCondo = isWebmaster || userRole === "copropietario" || isInvitado

  // 5. Mostrar Administración de Condominios (Webmaster, Admin Condominio)
  const showAdminCondo = isWebmaster || userRole === "admin_condominio" || isInvitado

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {/* Sidebar */}
        <Sidebar className="border-r border-slate-200 dark:border-slate-800">
          <SidebarHeader className="border-b border-slate-200 p-4 dark:border-slate-800">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Wallet className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-none text-slate-900 dark:text-white">Finances & Condos</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Portal Multifuncional</span>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent className="p-2 space-y-4">
            {/* PANEL GENERAL */}
            <SidebarGroup className="p-0">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/dashboard" />}
                    isActive={pathname === "/dashboard"}
                    className={`w-full justify-start gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-900 ${
                      pathname === "/dashboard"
                        ? "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white font-bold"
                        : "text-slate-650 dark:text-slate-400"
                    }`}
                  >
                    <LayoutDashboard className="h-4 w-4 text-emerald-500" />
                    <span>Panel de Inicio</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            {/* SECCIÓN: FINANZAS DEL HOGAR */}
            {showHogar && (
              <SidebarGroup className="p-0">
                <SidebarGroupLabel className="px-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Finanzas del Hogar
                </SidebarGroupLabel>
                <SidebarMenu>
                  {[
                    { title: "Resumen Hogar", href: "/hogar/dashboard", icon: TrendingUp, color: "text-indigo-500" },
                    { title: "Ingresos", href: "/hogar/ingresos", icon: ArrowUpRight, color: "text-emerald-500" },
                    { title: "Gastos", href: "/hogar/gastos", icon: ArrowDownRight, color: "text-rose-500" },
                    { title: "Alimentación", href: "/hogar/alimentacion", icon: Utensils, color: "text-amber-500" },
                  ].map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          render={<Link href={item.href} />}
                          isActive={isActive}
                          className={`w-full justify-start gap-3 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-900 ${
                            isActive
                              ? "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white font-bold"
                              : "text-slate-650 dark:text-slate-400"
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${item.color}`} />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroup>
            )}

            {/* SECCIÓN: PORTAL ESCOLAR APODERADO */}
            {showPortalEscolar && (
              <SidebarGroup className="p-0">
                <SidebarGroupLabel className="px-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Portal Escolar
                </SidebarGroupLabel>
                <SidebarMenu>
                  {[
                    { title: "Mis Alumnos / Cuotas", href: "/colegio/dashboard", icon: GraduationCap, color: "text-sky-500" },
                    { title: "Carro de Pago", href: "/colegio/pagar", icon: ShoppingCart, color: "text-emerald-500" },
                    { title: "Comprobantes", href: "/colegio/comprobantes", icon: Receipt, color: "text-slate-500" },
                  ].map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          render={<Link href={item.href} />}
                          isActive={isActive}
                          className={`w-full justify-start gap-3 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-900 ${
                            isActive
                              ? "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white font-bold"
                              : "text-slate-650 dark:text-slate-400"
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${item.color}`} />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroup>
            )}

            {/* SECCIÓN: ADMINISTRACIÓN ESCOLAR */}
            {showAdminEscolar && (
              <SidebarGroup className="p-0">
                <SidebarGroupLabel className="px-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Admin Escolar
                </SidebarGroupLabel>
                <SidebarMenu>
                  {[
                    { title: "Colegios", href: "/admin/colegios", icon: School, color: "text-indigo-400", hideForCurso: true },
                    { title: "Cursos", href: "/admin/cursos", icon: BookOpen, color: "text-blue-400", hideForCurso: true },
                    { title: "Alumnos / Apoderados", href: "/admin/alumnos", icon: Users, color: "text-teal-400", hideForCurso: true },
                    { title: "Cuotas, Metas y Egresos", href: "/admin/cuotas", icon: DollarSign, color: "text-emerald-400", hideForCurso: false },
                    { title: "Transacciones / Reportes", href: "/admin/pagos", icon: Receipt, color: "text-amber-400", hideForCurso: true },
                  ]
                    .filter((item) => !item.hideForCurso || isWebmaster || userRole === "admin_colegio")
                    .map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            render={<Link href={item.href} />}
                            isActive={isActive}
                            className={`w-full justify-start gap-3 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-900 ${
                              isActive
                                ? "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white font-bold"
                                : "text-slate-650 dark:text-slate-400"
                            }`}
                          >
                            <Icon className={`h-4 w-4 ${item.color}`} />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                </SidebarMenu>
              </SidebarGroup>
            )}

            {/* SECCIÓN: PORTAL CONDOMINIO RESIDENTE */}
            {showPortalCondo && (
              <SidebarGroup className="p-0">
                <SidebarGroupLabel className="px-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Condominio Residente
                </SidebarGroupLabel>
                <SidebarMenu>
                  {[
                    { title: "Mis Departamentos", href: "/condominio/dashboard", icon: Building, color: "text-amber-500" },
                  ].map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          render={<Link href={item.href} />}
                          isActive={isActive}
                          className={`w-full justify-start gap-3 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-900 ${
                            isActive
                              ? "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white font-bold"
                              : "text-slate-650 dark:text-slate-400"
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${item.color}`} />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroup>
            )}

            {/* SECCIÓN: ADMINISTRACIÓN CONDOMINIO */}
            {showAdminCondo && (
              <SidebarGroup className="p-0">
                <SidebarGroupLabel className="px-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Admin Condominio
                </SidebarGroupLabel>
                <SidebarMenu>
                  {[
                    { title: "Departamentos", href: "/admin/condominio/departamentos", icon: Building, color: "text-indigo-400" },
                    { title: "Gastos Comunes", href: "/admin/condominio/gastos-comunes", icon: DollarSign, color: "text-emerald-400" },
                    { title: "Reportes Pagos", href: "/admin/condominio/pagos", icon: Receipt, color: "text-amber-400" },
                  ].map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          render={<Link href={item.href} />}
                          isActive={isActive}
                          className={`w-full justify-start gap-3 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-900 ${
                            isActive
                              ? "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white font-bold"
                              : "text-slate-650 dark:text-slate-400"
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${item.color}`} />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroup>
            )}

            {/* SECCIÓN: WEBMASTER */}
            {isWebmaster && (
              <SidebarGroup className="p-0">
                <SidebarGroupLabel className="px-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Seguridad Webmaster
                </SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      render={<Link href="/admin/usuarios" />}
                      isActive={pathname === "/admin/usuarios"}
                      className={`w-full justify-start gap-3 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-900 ${
                        pathname === "/admin/usuarios"
                          ? "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white font-bold"
                          : "text-slate-650 dark:text-slate-400"
                      }`}
                    >
                      <Key className="h-4 w-4 text-rose-500" />
                      <span>Usuarios y Permisos</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 p-4 dark:border-slate-800">
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center justify-between gap-2">
                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  title="Cambiar tema"
                >
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>

                {/* User Info & Logout */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-3 text-left outline-none">
                    <Avatar className="h-8 w-8 ring-1 ring-slate-200 dark:ring-slate-800">
                      <AvatarImage src={user?.image ?? ""} alt={user?.name} />
                      <AvatarFallback className="bg-emerald-600 text-xs font-semibold text-white">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden max-w-[120px]">
                      <span className="truncate text-xs font-bold leading-tight text-slate-800 dark:text-slate-200">
                        {user?.name}
                      </span>
                      <span className="truncate text-[10px] capitalize text-slate-550 dark:text-slate-400">
                        {userRole === "webmaster" ? "Webmaster" : userRole.replace("_", " ")}
                      </span>
                    </div>
                    <ChevronUp className="h-4 w-4 text-slate-500 ml-auto" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 border-slate-200 bg-white text-slate-850 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 text-xs">
                    <div className="flex items-center gap-2 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.image ?? ""} alt={user?.name} />
                        <AvatarFallback className="bg-emerald-600 text-xs font-semibold text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-xs font-bold leading-tight">{user?.name}</span>
                        <span className="truncate text-[10px] text-slate-500">{user?.email}</span>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-650 focus:bg-red-50 dark:text-red-400 dark:focus:bg-red-950/30"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header Mobile */}
          <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 md:hidden">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-emerald-600" />
                <span className="font-bold text-sm">Finances & Condos</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </header>

          <main className="relative flex-1 overflow-y-auto p-4 md:p-8">
            {/* Background blurs */}
            <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[80px] pointer-events-none z-0" />
            <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-rose-500/5 dark:bg-rose-500/2 blur-[100px] pointer-events-none z-0" />
            <div className="relative z-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
