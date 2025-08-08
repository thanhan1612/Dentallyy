"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface LineData {
  month: string;
  value: number;
}

interface LineConfig {
  data: LineData[];
  name: string;
  color: string;
}

interface LineChartProps {
  lines: LineConfig[];
  format?: "percent" | "number" | "default";
  legend?: boolean;
  axisLine?: boolean;
  yAxis?: boolean;
}

export function LineChartComponent({ lines, format = "default" , legend = true , axisLine = true, yAxis = true }: LineChartProps) {
  const formatValue = (value: number) => {
    if (format === "percent") {
      return `${value}%`;
    }
    if (format === "number") {
      return `${value / 1000000} tr`;
    }
    return value;
  };

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="month"
            type="category"
            axisLine={axisLine}
            tickMargin={10}
            allowDuplicatedCategory={false}
          />
          {yAxis && <YAxis tickFormatter={(value) => formatValue(value).toString()} />}
          <Tooltip formatter={formatValue} />
          {legend && <Legend />}
          {lines.map((line, index) => (
            <Line
              key={index}
              type="monotone"
              data={line.data}
              dataKey="value"
              stroke={line.color}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name={line.name}
              connectNulls={true}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
