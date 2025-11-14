import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Send, 
  Search,
  Filter,
  MessageSquare,
  Clock,
  CheckCircle2,
  User
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusColors = {
  aguardando: "bg-orange-100 text-orange-800 border-orange-200",
  em_atendimento: "bg-blue-100 text-blue-800 border-blue-200",
  resolvido: "bg-green-100 text-green-800 border-green-200",
  pendente: "bg-yellow-100 text-yellow-800 border-yellow-200"
};

const canalIcons = {
  whatsapp: "💬",
  instagram: "📷",
  facebook: "👥",
  email: "📧",
  chat: "💬",
  telefone: "📞"
};

export default function Atendimentos() {
  const [selectedConversa, setSelectedConversa] = useState(null);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
    const urlParams = new URLSearchParams(window.location.search);
    const conversaId = urlParams.get('conversa');
    if (conversaId) {
      loadConversa(conversaId);
    }
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const loadConversa = async (id) => {
    try {
      const conversas = await base44.entities.Conversation.list();
      const conversa = conversas.find(c => c.id === id);
      if (conversa) {
        setSelectedConversa(conversa);
      }
    } catch (error) {
      console.error("Erro ao carregar conversa:", error);
    }
  };

  const { data: conversas = [] } = useQuery({
    queryKey: ['conversas'],
    queryFn: () => base44.entities.Conversation.list('-created_date'),
  });

  const { data: mensagens = [] } = useQuery({
    queryKey: ['mensagens', selectedConversa?.id],
    queryFn: () => selectedConversa ? base44.entities.Message.filter({ conversation_id: selectedConversa.id }, 'created_date') : [],
    enabled: !!selectedConversa,
  });

  const enviarMensagemMutation = useMutation({
    mutationFn: (data) => base44.entities.Message.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mensagens'] });
      queryClient.invalidateQueries({ queryKey: ['conversas'] });
      setNovaMensagem("");
    },
  });

  const atualizarConversaMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Conversation.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversas'] });
    },
  });

  const handleEnviarMensagem = () => {
    if (!novaMensagem.trim() || !selectedConversa) return;

    enviarMensagemMutation.mutate({
      conversation_id: selectedConversa.id,
      remetente: "atendente",
      remetente_nome: user?.full_name || "Atendente",
      conteudo: novaMensagem,
      tipo: "texto"
    });

    if (selectedConversa.status === 'aguardando') {
      atualizarConversaMutation.mutate({
        id: selectedConversa.id,
        data: {
          status: 'em_atendimento',
          atendente_id: user?.id,
          atendente_nome: user?.full_name
        }
      });
    }
  };

  const handleMudarStatus = (novoStatus) => {
    if (!selectedConversa) return;
    
    atualizarConversaMutation.mutate({
      id: selectedConversa.id,
      data: { status: novoStatus }
    });
    
    setSelectedConversa({ ...selectedConversa, status: novoStatus });
  };

  const conversasFiltradas = conversas.filter(conv => {
    const matchStatus = filtroStatus === "todos" || conv.status === filtroStatus;
    const matchSearch = !searchTerm || 
      conv.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.assunto?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getInitials = (name) => {
    return name?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "?";
  };

  return (
    <div className="h-[calc(100vh-73px)] flex">
      <div className="w-full md:w-96 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as conversas</SelectItem>
              <SelectItem value="aguardando">Aguardando</SelectItem>
              <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
              <SelectItem value="resolvido">Resolvidas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversasFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
              <MessageSquare className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-center">Nenhuma conversa encontrada</p>
            </div>
          ) : (
            conversasFiltradas.map((conversa) => (
              <div
                key={conversa.id}
                onClick={() => setSelectedConversa(conversa)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-blue-50 ${
                  selectedConversa?.id === conversa.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500">
                    <AvatarFallback className="text-white font-semibold">
                      {getInitials(conversa.patient_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900 truncate">{conversa.patient_name}</p>
                      <span className="text-lg">{canalIcons[conversa.canal]}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mb-2">
                      {conversa.ultima_mensagem || conversa.assunto || "Nova conversa"}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`${statusColors[conversa.status]} text-xs border`}>
                        {conversa.status?.replace(/_/g, ' ')}
                      </Badge>
                      {conversa.created_date && (
                        <span className="text-xs text-gray-400">
                          {format(new Date(conversa.created_date), "HH:mm")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-50 to-white">
        {selectedConversa ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500">
                    <AvatarFallback className="text-white font-semibold">
                      {getInitials(selectedConversa.patient_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedConversa.patient_name}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <span>{canalIcons[selectedConversa.canal]}</span>
                      {selectedConversa.canal}
                    </p>
                  </div>
                </div>
                <Select value={selectedConversa.status} onValueChange={handleMudarStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aguardando">Aguardando</SelectItem>
                    <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
                    <SelectItem value="resolvido">Resolvido</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {mensagens.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                    <p>Nenhuma mensagem ainda</p>
                    <p className="text-sm mt-1">Envie a primeira mensagem para iniciar</p>
                  </div>
                </div>
              ) : (
                mensagens.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.remetente === 'atendente' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${msg.remetente === 'atendente' ? 'order-2' : 'order-1'}`}>
                      <div className={`rounded-2xl px-4 py-3 ${
                        msg.remetente === 'atendente' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}>
                        {msg.remetente !== 'atendente' && (
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            {msg.remetente_nome || 'Paciente'}
                          </p>
                        )}
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.conteudo}</p>
                      </div>
                      <p className={`text-xs text-gray-400 mt-1 ${
                        msg.remetente === 'atendente' ? 'text-right' : 'text-left'
                      }`}>
                        {format(new Date(msg.created_date), "HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-3">
                <Textarea
                  placeholder="Digite sua mensagem..."
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleEnviarMensagem();
                    }
                  }}
                  className="resize-none"
                  rows={2}
                />
                <Button 
                  onClick={handleEnviarMensagem}
                  disabled={!novaMensagem.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <MessageSquare className="w-24 h-24 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Selecione uma conversa</p>
              <p className="text-sm mt-2">Escolha uma conversa da lista para começar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}