import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Activity,
  Bell,
  Search,
  ChevronDown,
  LogOut
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigationItemsGerente = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Atendimentos",
    url: createPageUrl("Atendimentos"),
    icon: MessageSquare,
    badge: true,
  },
  {
    title: "Pacientes",
    url: createPageUrl("Pacientes"),
    icon: Users,
  },
  {
    title: "Agenda",
    url: createPageUrl("Agenda"),
    icon: Calendar,
  },
  {
    title: "Relatórios",
    url: createPageUrl("Relatorios"),
    icon: BarChart3,
  },
  {
    title: "Configurações",
    url: createPageUrl("Configuracoes"),
    icon: Settings,
  },
];

const navigationItemsAtendente = [
  {
    title: "Meus Atendimentos",
    url: createPageUrl("Atendimentos"),
    icon: MessageSquare,
    badge: true,
  },
  {
    title: "Pacientes",
    url: createPageUrl("Pacientes"),
    icon: Users,
  },
  {
    title: "Agenda",
    url: createPageUrl("Agenda"),
    icon: Calendar,
  },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [conversasPendentes, setConversasPendentes] = useState(0);

  useEffect(() => {
    loadUser();
    loadConversasPendentes();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const loadConversasPendentes = async () => {
    try {
      const conversas = await base44.entities.Conversation.filter({
        status: "aguardando"
      });
      setConversasPendentes(conversas.length);
    } catch (error) {
      console.error("Erro ao carregar conversas:", error);
    }
  };

  const isGerente = user?.cargo === "gerente";
  const navigationItems = isGerente ? navigationItemsGerente : navigationItemsAtendente;

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <Sidebar className="border-r border-gray-200 bg-white">
          <SidebarHeader className="border-b border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">MedConnect</h2>
                <p className="text-xs text-gray-500">Sistema Omnichannel</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                Navegação
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl mb-1 ${
                          location.pathname === item.url ? 'bg-blue-50 text-blue-700 shadow-sm' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium flex-1">{item.title}</span>
                          {item.badge && conversasPendentes > 0 && (
                            <Badge className="bg-red-500 text-white">
                              {conversasPendentes}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {user && (
              <SidebarGroup className="mt-4">
                <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                  Estatísticas Rápidas
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-4 py-3 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Atendimentos Hoje</span>
                      <span className="font-bold text-blue-600">{user.atendimentos_ativos || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tempo Médio</span>
                      <span className="font-bold text-green-600">{user.tempo_medio_resposta || 0}min</span>
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-200 p-4">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 w-full hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <Avatar className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600">
                      <AvatarFallback className="text-white font-semibold">
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{user.full_name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.cargo || user.role}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="lg:hidden hover:bg-gray-100 p-2 rounded-lg transition-colors" />
                <div className="hidden md:flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-500 hover:text-blue-600 cursor-pointer transition-colors" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                {user && (
                  <Badge variant="outline" className="hidden md:flex">
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      user.status_atendimento === 'disponivel' ? 'bg-green-500' :
                      user.status_atendimento === 'ocupado' ? 'bg-yellow-500' :
                      user.status_atendimento === 'ausente' ? 'bg-orange-500' : 'bg-gray-400'
                    }`} />
                    {user.status_atendimento || 'disponivel'}
                  </Badge>
                )}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}