import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Clock, Star } from "lucide-react";

export default function Relatorios() {
  const { data: conversas = [] } = useQuery({
    queryKey: ['conversas'],
    queryFn: () => base44.entities.Conversation.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const atendentes = users.filter(u => u.cargo === 'atendente');
  
  const totalConversas = conversas.length;
  const conversasResolvidas = conversas.filter(c => c.status === 'resolvido').length;
  const taxaResolucao = totalConversas > 0 ? ((conversasResolvidas / totalConversas) * 100).toFixed(1) : 0;
  
  const tempoMedioResposta = conversas.length > 0
    ? (conversas.reduce((sum, c) => sum + (c.tempo_primeira_resposta || 0), 0) / conversas.length).toFixed(1)
    : 0;

  const satisfacaoMedia = conversas.filter(c => c.satisfacao).length > 0
    ? (conversas.reduce((sum, c) => sum + (c.satisfacao || 0), 0) / conversas.filter(c => c.satisfacao).length).toFixed(1)
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-500 mt-1">Análise de desempenho e métricas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Taxa de Resolução
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{taxaResolucao}%</p>
                <p className="text-sm text-gray-500 mt-1">{conversasResolvidas} de {totalConversas}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500 bg-opacity-10">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Tempo Médio de Resposta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{tempoMedioResposta}</p>
                <p className="text-sm text-gray-500 mt-1">minutos</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500 bg-opacity-10">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Atendentes Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{atendentes.length}</p>
                <p className="text-sm text-gray-500 mt-1">membros da equipe</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500 bg-opacity-10">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              Satisfação Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{satisfacaoMedia}</p>
                <p className="text-sm text-gray-500 mt-1">de 5.0 estrelas</p>
              </div>
              <div className="p-3 rounded-xl bg-yellow-500 bg-opacity-10">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Desempenho por Atendente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {atendentes.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nenhum dado disponível</p>
            ) : (
              atendentes.map((atendente) => (
                <div key={atendente.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{atendente.full_name}</p>
                    <p className="text-sm text-gray-500">{atendente.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{atendente.total_atendimentos || 0}</p>
                    <p className="text-xs text-gray-500">atendimentos</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}