"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BrainCircuit, TrendingUp, AlertTriangle } from "lucide-react"

export function DashboardAiInsights() {
  const [activeTab, setActiveTab] = useState("predictions")

  const insights = {
    predictions: [
      {
        title: "Dự Đoán Lượng Bệnh Nhân",
        description: "Dự kiến tăng 20% lượng bệnh nhân trong tháng tới dựa trên dữ liệu lịch sử và xu hướng mùa.",
        icon: TrendingUp,
      },
      {
        title: "Tối Ưu Hóa Lịch Trình",
        description: "Nên tăng cường nhân viên vào thứ 2 và thứ 5 để đáp ứng nhu cầu cao điểm.",
        icon: BrainCircuit,
      },
    ],
    alerts: [
      {
        title: "Vật Tư Sắp Hết",
        description: "Composite A2 sẽ hết trong 7 ngày nữa dựa trên tốc độ sử dụng hiện tại.",
        icon: AlertTriangle,
      },
      {
        title: "Lịch Hẹn Xung Đột",
        description: "Phát hiện 2 lịch hẹn có khả năng xung đột vào ngày 02/04/2025.",
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
