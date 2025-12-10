import { cn } from "@/lib/utils";

import z from "zod";
import GenerativeUi, { IGenerativeUi } from "@/utils/agent/ui";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { chartConfigSchema } from "@/utils/agent/model-schema";
export interface IChartBlockProps {
  chartConfig: z.infer<typeof chartConfigSchema>;
  chartData: [];
}
export default function ChartBlock({
  chartConfig,
  chartData,
}: IChartBlockProps) {
  const ChartComponent = chartConfig.type
    ? GenerativeUi[chartConfig.type]
    : null;

  const [isChartPanelOpen, setIsChartPanelOpen] = useState<boolean>(false);
  useEffect(() => {
    setIsChartPanelOpen(true);
  }, [chartData]);
  if (!chartData) return <></>;
  return (
    <>
      <Collapsible
        open={isChartPanelOpen}
        onOpenChange={setIsChartPanelOpen}
        className="border-b border-zinc-100 rounded-md"
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex justify-between h-8 px-4 text-xs font-semibold bg-zinc-50 border border-zinc-600 rounded-lg hover:bg-zinc-100"
          >
            <span className="flex items-center gap-2">
              <BarChart3 className="w-3 h-3" /> Chart Result
            </span>
            {isChartPanelOpen ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronUp className="w-3 h-3" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className=" bg-white p-4 flex items-center justify-center border-t">
          <div className="text-zinc-400 text-sm w-full ">
            {ChartComponent && (
              <ChartComponent chartData={chartData} config={chartConfig} />
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}
