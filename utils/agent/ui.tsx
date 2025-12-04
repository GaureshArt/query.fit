"use client";
import { cn } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

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
    <div className="w-full max-h-[400px]">
      <ChartContainer config={chartConfig} className="min-h-[100px] w-full">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />

          <XAxis
            dataKey={config.xAxisKey}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tick={false}
        
          />

          <YAxis tickLine={false} axisLine={false} tickMargin={10} />

          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />

          {config.series.map((item) => (
            <Bar
              key={item.dataKey}
              dataKey={item.dataKey}
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

const DynamiclineChart = ({ config, chartData }: DynamicChartProps) => {
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
    <>
      <div
        className={cn(
          "border border-zinc-700 rounded-md px-4 py-2 w-full overflow-x-scroll"
        )}
      >
        <ChartContainer config={chartConfig} className="w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={config.xAxisKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis />
            <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
            {config.series.map((item) => (
              <Line
                key={item.label}
                dataKey={item.dataKey}
                type="natural"
                stroke="black"
                strokeWidth={2}
                dot={{
                  fill: "black",
                }}
                activeDot={{
                  r: 6,
                }}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </div>
    </>
  );
};

export function DynamicPieChart({ chartData, config }: DynamicChartProps) {
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

  const valueKey = config.series[0].dataKey;
  return (
    <div className="w-[350px] h-[350px] mx-auto">
      <ChartContainer
        config={chartConfig}
        className="aspect-square max-h-[300px] mx-auto "
      >
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />

          <Pie
            data={chartData}
            dataKey={valueKey}
            nameKey={config.xAxisKey}
            cx="50%"
            cy="50%"
            color="red"
            outerRadius="80%"
          >
            <LabelList
              dataKey={config.xAxisKey}
              position="outside"
              className="fill-red-400"
              fontSize={12}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  );
}

export default {
  line: DynamiclineChart,
  bar: DynamicBarChart,
  pie: DynamicPieChart,
};
