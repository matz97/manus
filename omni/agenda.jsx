import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Plus, Clock, User } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusColors = {
  agendado: "bg-blue-100 text-blue-800",
  confirmado: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
  realizado: "bg-purple-100 text-purple-800",
  faltou: "bg-orange-100 text-orange-800"
};

export default function Agenda() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    patient_name: "",
    especialidade: "clinico_geral",
    medico: "",
    data_hora: "",
    duracao: 30,
    tipo_consulta: "primeira_vez",
    convenio: "particular",
    observacoes: ""
  });
  const queryClient = useQueryClient();

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => base44.entities.Appointment.list('data_hora'),
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.list('nome_completo'),
  });

  const createAppointmentMutation = useMutation({
    mutationFn: (data) => base44.entities.Appointment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setShowDialog(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      patient_name: "",
      especialidade: "clinico_geral",
      medico: "",
      data_hora: "",
      duracao: 30,
      tipo_consulta: "primeira_vez",
      convenio: "particular",
      observacoes: ""
    });
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const appointmentsForDate = (date) => {
    return appointments.filter(apt => {
      if (!apt.data_hora) return false;
      const aptDate = new Date(apt.data_hora);
      return isSameDay(aptDate, date);
    });
  };

  const appointmentsForSelectedDate = appointmentsForDate(selectedDate);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda Médica</h1>
          <p className="text-gray-500 mt-1">Gerencie consultas e agendamentos</p>
        </div>
        <Button 
          onClick={() => setShowDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-lg border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
              {days.map((day, idx) => {
                const dayAppointments = appointmentsForDate(day);
                const isSelected = isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);
                
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      aspect-square p-2 rounded-lg border transition-all
                      ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 
                        isTodayDate ? 'bg-blue-50 border-blue-300 text-blue-700' :
                        'hover:bg-gray-50 border-gray-200'}
                    `}
                  >
                    <div className="text-sm font-medium">{format(day, 'd')}</div>
                    {dayAppointments.length > 0 && (
                      <div className={`text-xs mt-1 ${isSelected ? 'text-white' : 'text-blue-600'}`}>
                        {dayAppointments.length} {dayAppointments.length === 1 ? 'consulta' : 'consultas'}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-lg">
              {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointmentsForSelectedDate.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Nenhuma consulta agendada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointmentsForSelectedDate.map((apt) => (
                  <div key={apt.id} className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-sm">
                          {format(new Date(apt.data_hora), "HH:mm")}
                        </span>
                      </div>
                      <Badge className={`${statusColors[apt.status]} text-xs`}>
                        {apt.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <p className="font-medium text-sm">{apt.patient_name}</p>
                    </div>
                    <p className="text-xs text-gray-500 capitalize">
                      {apt.especialidade?.replace(/_/g, ' ')} • {apt.medico || 'Médico não especificado'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Paciente *</Label>
              <Select
                value={formData.patient_name}
                onValueChange={(value) => setFormData({...formData, patient_name: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.nome_completo}>
                      {p.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Especialidade *</Label>
              <Select
                value={formData.especialidade}
                onValueChange={(value) => setFormData({...formData, especialidade: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardiologia">Cardiologia</SelectItem>
                  <SelectItem value="dermatologia">Dermatologia</SelectItem>
                  <SelectItem value="ortopedia">Ortopedia</SelectItem>
                  <SelectItem value="pediatria">Pediatria</SelectItem>
                  <SelectItem value="ginecologia">Ginecologia</SelectItem>
                  <SelectItem value="oftalmologia">Oftalmologia</SelectItem>
                  <SelectItem value="neurologia">Neurologia</SelectItem>
                  <SelectItem value="clinico_geral">Clínico Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Médico</Label>
              <Input
                value={formData.medico}
                onChange={(e) => setFormData({...formData, medico: e.target.value})}
                placeholder="Nome do médico"
              />
            </div>
            <div className="space-y-2">
              <Label>Data e Hora *</Label>
              <Input
                type="datetime-local"
                value={formData.data_hora}
                onChange={(e) => setFormData({...formData, data_hora: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Duração (minutos)</Label>
              <Input
                type="number"
                value={formData.duracao}
                onChange={(e) => setFormData({...formData, duracao: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Consulta</Label>
              <Select
                value={formData.tipo_consulta}
                onValueChange={(value) => setFormData({...formData, tipo_consulta: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primeira_vez">Primeira Vez</SelectItem>
                  <SelectItem value="retorno">Retorno</SelectItem>
                  <SelectItem value="exame">Exame</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Observações</Label>
              <Input
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                placeholder="Informações adicionais"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => createAppointmentMutation.mutate(formData)}
              disabled={!formData.patient_name || !formData.data_hora}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Agendar Consulta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}