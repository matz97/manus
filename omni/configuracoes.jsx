import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Configuracoes() {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    atalho: "",
    conteudo: "",
    categoria: "saudacao"
  });
  const queryClient = useQueryClient();

  const { data: quickReplies = [] } = useQuery({
    queryKey: ['quickReplies'],
    queryFn: () => base44.entities.QuickReply.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.QuickReply.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quickReplies'] });
      setShowDialog(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.QuickReply.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quickReplies'] });
    },
  });

  const resetForm = () => {
    setFormData({
      titulo: "",
      atalho: "",
      conteudo: "",
      categoria: "saudacao"
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-500 mt-1">Gerencie respostas rápidas e configurações</p>
        </div>
      </div>

      <Card className="shadow-lg border-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Respostas Rápidas
            </CardTitle>
            <Button onClick={() => setShowDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Resposta
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {quickReplies.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma resposta rápida cadastrada</p>
              <p className="text-sm mt-2">Crie respostas para agilizar o atendimento</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quickReplies.map((reply) => (
                <div key={reply.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{reply.titulo}</h3>
                        {reply.atalho && (
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded text-blue-600">
                            {reply.atalho}
                          </code>
                        )}
                        <span className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 capitalize">
                          {reply.categoria}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{reply.conteudo}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(reply.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Resposta Rápida</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                placeholder="Ex: Horário de Atendimento"
              />
            </div>
            <div className="space-y-2">
              <Label>Atalho (opcional)</Label>
              <Input
                value={formData.atalho}
                onChange={(e) => setFormData({...formData, atalho: e.target.value})}
                placeholder="Ex: /horario"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData({...formData, categoria: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saudacao">Saudação</SelectItem>
                  <SelectItem value="horario">Horário</SelectItem>
                  <SelectItem value="agendamento">Agendamento</SelectItem>
                  <SelectItem value="documentos">Documentos</SelectItem>
                  <SelectItem value="convenio">Convênio</SelectItem>
                  <SelectItem value="localizacao">Localização</SelectItem>
                  <SelectItem value="despedida">Despedida</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                value={formData.conteudo}
                onChange={(e) => setFormData({...formData, conteudo: e.target.value})}
                placeholder="Digite a mensagem da resposta rápida..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => createMutation.mutate(formData)}
              disabled={!formData.titulo || !formData.conteudo}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}