import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const canalIcons = {
  whatsapp: "💬",
  instagram: "📷",
  facebook: "👥",
  email: "📧",
  chat: "💬",
  telefone: "📞"
};

const statusColors = {
  aguardando: "bg-orange-100 text-orange-800 border-orange-200",
  em_atendimento: "bg-blue-100 text-blue-800 border-blue-200",
  resolvido: "bg-green-100 text-green-800 border-green-200",
  pendente: "bg-yellow-100 text-yellow-800 border-yellow-200"
};

export default function RecentConversations({ conversas }) {
  const getInitials = (name) => {
    return name?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "?";
  };

  return (
    <Card className="shadow-lg border-none">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Conversas Recentes
          </CardTitle>
          <Link to={createPageUrl("Atendimentos")} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Ver todas →
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {conversas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhuma conversa ainda</p>
            </div>
          ) : (
            conversas.map((conversa) => (
              <Link
                key={conversa.id}
                to={`${createPageUrl("Atendimentos")}?conversa=${conversa.id}`}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-blue-50 transition-all border border-gray-100 hover:border-blue-200 hover:shadow-md"
              >
                <Avatar className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500">
                  <AvatarFallback className="text-white font-semibold">
                    {getInitials(conversa.patient_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 truncate">{conversa.patient_name}</p>
                    <span className="text-lg">{canalIcons[conversa.canal]}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{conversa.ultima_mensagem || conversa.assunto || "Nova conversa"}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="outline" className={`${statusColors[conversa.status]} border text-xs`}>
                    {conversa.status?.replace(/_/g, ' ')}
                  </Badge>
                  {conversa.created_date && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(conversa.created_date), "HH:mm", { locale: ptBR })}
                    </span>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}