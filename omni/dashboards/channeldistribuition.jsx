import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const canalColors = {
  whatsapp: "bg-green-500",
  instagram: "bg-pink-500",
  facebook: "bg-blue-600",
  email: "bg-purple-500",
  chat: "bg-cyan-500",
  telefone: "bg-orange-500"
};

const canalLabels = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
  email: "E-mail",
  chat: "Chat Web",
  telefone: "Telefone"
};

export default function ChannelDistribution({ conversas }) {
  const distribution = conversas.reduce((acc, conv) => {
    acc[conv.canal] = (acc[conv.canal] || 0) + 1;
    return acc;
  }, {});

  const total = conversas.length || 1;
  const sortedChannels = Object.entries(distribution)
    .sort(([, a], [, b]) => b - a);

  return (
    <Card className="shadow-lg border-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Canais de Atendimento
        </CardTitle>
      </CardHeader>
      <CardContent>
        {conversas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Sem dados de canais</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedChannels.map(([canal, count]) => {
              const percentage = ((count / total) * 100).toFixed(0);
              return (
                <div key={canal}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {canalLabels[canal] || canal}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${canalColors[canal] || 'bg-gray-400'} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}