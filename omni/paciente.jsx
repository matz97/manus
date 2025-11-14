import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  User, 
  Phone, 
  Mail,
  Calendar,
  FileText
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Pacientes() {
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    nome_completo: "",
    email: "",
    telefone: "",
    cpf: "",
    data_nascimento: "",
    endereco: "",
    convenio: "particular",
    observacoes: "",
    status: "ativo"
  });
  const queryClient = useQueryClient();

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list('-created_date'),
  });

  const createPatientMutation = useMutation({
    mutationFn: (data) => base44.entities.Patient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setShowDialog(false);
      setFormData({
        nome_completo: "",
        email: "",
        telefone: "",
        cpf: "",
        data_nascimento: "",
        endereco: "",
        convenio: "particular",
        observacoes: "",
        status: "ativo"
      });
    },
  });

  const patientsFiltrados = patients.filter(p =>
    p.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.telefone?.includes(searchTerm) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name) => {
    return name?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "?";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-500 mt-1">Gerencie o cadastro de pacientes</p>
        </div>
        <Button 
          onClick={() => setShowDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Paciente
        </Button>
      </div>

      <Card className="shadow-lg border-none">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome, telefone ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {patientsFiltrados.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Nenhum paciente encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patientsFiltrados.map((patient) => (
                <Card key={patient.id} className="hover:shadow-lg transition-shadow border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500">
                        <AvatarFallback className="text-white font-semibold text-lg">
                          {getInitials(patient.nome_completo)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-2 truncate">
                          {patient.nome_completo}
                        </h3>
                        <div className="space-y-2 text-sm">
                          {patient.telefone && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span className="truncate">{patient.telefone}</span>
                            </div>
                          )}
                          {patient.email && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="w-4 h-4" />
                              <span className="truncate">{patient.email}</span>
                            </div>
                          )}
                          {patient.data_nascimento && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{format(new Date(patient.data_nascimento), "dd/MM/yyyy")}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {patient.convenio || 'particular'}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              patient.status === 'ativo' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-gray-50 text-gray-700 border-gray-200'
                            }`}
                          >
                            {patient.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Paciente</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input
                value={formData.nome_completo}
                onChange={(e) => setFormData({...formData, nome_completo: e.target.value})}
                placeholder="Nome do paciente"
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone *</Label>
              <Input
                value={formData.telefone}
                onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input
                value={formData.cpf}
                onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                placeholder="000.000.000-00"
              />
            </div>
            <div className="space-y-2">
              <Label>Data de Nascimento</Label>
              <Input
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => setFormData({...formData, data_nascimento: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Convênio</Label>
              <Select
                value={formData.convenio}
                onValueChange={(value) => setFormData({...formData, convenio: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="particular">Particular</SelectItem>
                  <SelectItem value="unimed">Unimed</SelectItem>
                  <SelectItem value="sulamerica">Sulamérica</SelectItem>
                  <SelectItem value="bradesco">Bradesco</SelectItem>
                  <SelectItem value="amil">Amil</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Endereço</Label>
              <Input
                value={formData.endereco}
                onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                placeholder="Endereço completo"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                placeholder="Informações adicionais sobre o paciente"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => createPatientMutation.mutate(formData)}
              disabled={!formData.nome_completo || !formData.telefone}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Cadastrar Paciente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}