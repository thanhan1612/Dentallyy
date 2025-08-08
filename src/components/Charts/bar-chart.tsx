"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface BarChartProps {
  bars: {
    data: { label: string; value: number }[];
    name: string;
    color: string;
  }[];
  format?: "percent" | "number" | "default" | 'time';
  legend?: boolean;
  axisLine?: boolean;
  yAxis?: boolean;
}

export function BarChartComponent({ bars, format = "default" , legend = true , axisLine = true, yAxis = true }: BarChartProps) {
  // Transform data to match the format needed for the chart
  const chartData = bars[0]?.data.map((item, index) => {
    const dataPoint: any = { label: item.label };
    bars.forEach((bar) => {
      dataPoint[bar?.name] = bar?.data[index]?.value;
    });
    return dataPoint;
  });

  const chartConfig = bars?.reduce((acc, bar) => {
    acc[bar?.name] = {
      label: bar?.name,
      color: bar?.color,
    };
    return acc;
  }, {} as ChartConfig);

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={axisLine}
              tickFormatter={(value) => {
                if (format === 'time') {
                  return value.slice(0, 5);
                }
                return value.slice(0, 4);
              }}
            />
            {yAxis && <YAxis />}
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            {legend && <Legend />}
            {bars?.map((bar, index) => (
              <Bar 
                key={index} 
                dataKey={bar?.name} 
                fill={bar?.color} 
                radius={[4, 4, 0, 0]} 
              />
            ))}
          </BarChart>
        </ChartContainer>
      </ResponsiveContainer>
    </div>
  );
}
