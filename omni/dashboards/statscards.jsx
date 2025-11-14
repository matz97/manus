import React from 'react';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function StatsCards({ title, value, icon: Icon, bgColor, trend, trendColor = "text-green-600" }) {
  return (
    <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow">
      <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 ${bgColor} rounded-full opacity-10`} />
      <CardHeader className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
            <CardTitle className="text-3xl font-bold text-gray-900">
              {value}
            </CardTitle>
          </div>
          <div className={`p-3 rounded-xl ${bgColor} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${bgColor.replace('bg-', 'text-')}`} />
          </div>
        </div>
        {trend && (
          <div className="flex items-center mt-4 text-sm">
            <span className={`${trendColor} font-medium`}>{trend}</span>
          </div>
        )}
      </CardHeader>
    </Card>
  );
}