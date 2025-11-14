import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Star } from "lucide-react";

export default function TeamPerformance({ users }) {
  const getInitials = (name) => {
    return name?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "?";
  };

  return (
    <Card className="shadow-lg border-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Equipe
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Nenhum atendente cadastrado</p>
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500">
                    <AvatarFallback className="text-white font-semibold text-sm">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{user.full_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`text-xs ${
                        user.status_atendimento === 'disponivel' ? 'bg-green-50 text-green-700 border-green-200' :
                        user.status_atendimento === 'ocupado' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {user.status_atendimento || 'offline'}
                      </Badge>
                      {user.avaliacao_media && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {user.avaliacao_media.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-600">{user.atendimentos_ativos || 0}</p>
                  <p className="text-xs text-gray-500">atendimentos</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}