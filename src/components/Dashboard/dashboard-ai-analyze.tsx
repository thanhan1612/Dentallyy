"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrainCircuit, TrendingUp, AlertTriangle } from "lucide-react"
interface DashboardAiInsightsProps {
  data?: {
    summary: {
      PatientGrowth: string;
      OptimiseSchedule: string;
      LowStock: string;
      ConflictingSchedule: string;
    };
  };
  isLoading?: boolean;
}

export function DashboardAiInsights({data,isLoading}:DashboardAiInsightsProps) {
  const [activeTab, setActiveTab] = useState("predictions")

  const insights = {
    predictions: [
      {
        title: "",
        description: `${data?.summary.PatientGrowth}`,
        icon: TrendingUp,
      },
      {
        title: "Tối Ưu Hóa Lịch Trình",
        description: `${data?.summary.OptimiseSchedule}`,
        icon: BrainCircuit,
      },
    ],
    alerts: [
      {
        title: "Vật Tư Sắp Hết",
        description: `${data?.summary.LowStock}`,
        icon: AlertTriangle,
      },
      {
        title: "Lịch Hẹn Xung Đột",
        description: `${data?.summary.ConflictingSchedule}`,
        icon: AlertTriangle,
      },
    ],
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="predictions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="predictions">Dự Đoán & Đề Xuất</TabsTrigger>
          <TabsTrigger value="alerts">Cảnh Báo</TabsTrigger>
        </TabsList>
        <TabsContent value="predictions" className="space-y-4 pt-4">
          {insights.predictions.map((insight, index) => (
            <Card key={index}>
              <CardContent className="flex items-start gap-4 p-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <insight.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{insight.title}</h3>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="alerts" className="space-y-4 pt-4">
          {insights.alerts.map((alert, index) => (
            <Card key={index}>
              <CardContent className="flex items-start gap-4 p-4">
                <div className="rounded-full bg-destructive/10 p-2">
                  <alert.icon className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-medium">{alert.title}</h3>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
      <Button className="w-full">
        <BrainCircuit className="mr-2 h-4 w-4" />
        Xem Phân Tích Chi Tiết
      </Button>
    </div>
  )
}
