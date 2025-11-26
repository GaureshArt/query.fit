"use client";
import { cn } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useMemo } from "react";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

type DynamicChartProps = {
  chartData: any[];
  config: {
    xAxisKey: string;
    series: { dataKey: string; label: string; stackedId?: string }[];
  };
};

export function DynamicBarChart({ chartData, config }: DynamicChartProps) {
  const chartConfig = useMemo(() => {
    const generatedConfig: ChartConfig = {};

    config.series.forEach((item, index) => {
      generatedConfig[item.dataKey] = {
        label: item.label,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
    });

    return generatedConfig;
  }, [config]);

  return (
    <div className="w-2/3 h-[400px]">
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />

          <XAxis
            dataKey={"Country"}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => {
              return value;
            }}
          />

          <YAxis tickLine={false} axisLine={false} tickMargin={10} />

          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />

          {config.series.map((item) => (
            <Bar
              key={item.dataKey}
              dataKey={"total_sales"}
              stackId={item.stackedId}
              fill={`var(--color-${item.dataKey})`}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  );
}

const lineChart = () => (
  <>
    <div className={cn("bg-yellow-200")}>
      <h1>THis is line chart</h1>
    </div>
  </>
);
const pieChart = () => (
  <>
    <div className={cn("bg-green-200")}>
      <h1>THis is pie chart</h1>
    </div>
  </>
);

export default {
  line: lineChart,
  bar: DynamicBarChart,
  pie: pieChart,
};
