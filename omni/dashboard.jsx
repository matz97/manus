import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageSquare, 
  Users, 
  Calendar, 
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Activity
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import StatsCards from "../components/dashboard/StatsCards";
import RecentConversations from "../components/dashboard/RecentConversations";
import TeamPerformance from "../components/dashboard/TeamPerformance";
import ChannelDistribution from "../components/dashboard/ChannelDistribution";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const { data: conversas = [] } = useQuery({
    queryKey: ['conversas'],
    queryFn: () => base44.entities.Conversation.list('-created_date'),
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list('-created_date'),
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list('-created_date'),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const conversasAguardando = conversas.filter(c => c.status === 'aguardando').length;
  const conversasEmAtendimento = conversas.filter(c => c.status === 'em_atendimento').length;
  const conversasResolvidas = conversas.filter(c => c.status === 'resolvido').length;
  
  const appointmentsHoje = appointments.filter(a => {
    const today = new Date().toISOString().split('T')[0];
    return a.data_hora?.startsWith(today);
  }).length;

  const tempoMedioResposta = conversas.length > 0
    ? Math.round(conversas.reduce((sum, c) => sum + (c.tempo_primeira_resposta || 0), 0) / conversas.length)
    : 0;

  const isGerente = user?.cargo === "gerente";

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Visão geral do sistema omnichannel
          </p>
        </div>
        <Badge className="bg-blue-600 text-white px-4 py-2">
          {format(new Date(), "dd 'de' MMMM, yyyy", { locale: ptBR })}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCards 
          title="Aguardando Atendimento" 
          value={conversasAguardando}
          icon={MessageSquare}
          bgColor="bg-orange-500"
          trend={conversasAguardando > 0 ? "Requer atenção" : "Tudo em dia"}
          trendColor={conversasAguardando > 0 ? "text-orange-600" : "text-green-600"}
        />
        <StatsCards 
          title="Em Atendimento" 
          value={conversasEmAtendimento}
          icon={Activity}
          bgColor="bg-blue-500"
          trend={`${conversasResolvidas} resolvidas hoje`}
        />
        <StatsCards 
          title="Consultas Hoje" 
          value={appointmentsHoje}
          icon={Calendar}
          bgColor="bg-green-500"
          trend="Agenda do dia"
        />
        <StatsCards 
          title="Tempo Médio de Resposta" 
          value={`${tempoMedioResposta}min`}
          icon={Clock}
          bgColor="bg-purple-500"
          trend={tempoMedioResposta < 5 ? "Excelente" : tempoMedioResposta < 10 ? "Bom" : "Melhorar"}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentConversations conversas={conversas.slice(0, 10)} />
        </div>
        <div className="space-y-6">
          <ChannelDistribution conversas={conversas} />
          {isGerente && <TeamPerformance users={users.filter(u => u.cargo === 'atendente')} />}
        </div>
      </div>
    </div>
  );
}