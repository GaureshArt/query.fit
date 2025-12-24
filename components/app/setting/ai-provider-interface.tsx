"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import PlusSvg from "@/components/shared/plus-svg";

type Provider = "openai" | "gemini" | "anthropic";

type ProviderConfig = {
  provider: Provider;
  apiKey: string;
  temperature: number;
};

const STORAGE_KEY = "queryfit-ai-provider";

const DEFAULT_CONFIG: ProviderConfig = {
  provider: "openai",
  apiKey: "",
  temperature: 0.3,
};

export default function AIProviderInterface() {
  const { open: isSidebarOpen } = useSidebar();
  const [config, setConfig] = useState<ProviderConfig>(DEFAULT_CONFIG);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) setConfig(JSON.parse(stored));
  }, []);

  const saveConfig = () => {
    if (!config.apiKey.trim()) {
      toast.error("API key is required");
      return;
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    toast.success("AI provider settings saved");
  };

  return (
    <div className={cn("relative max-w-xl space-y-6 w-full ", isSidebarOpen && "mr-70","px-4 py-4 border border-dashed border-zinc-400")}>
        <PlusSvg/>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">AI Provider</h1>
        <p className="text-sm text-muted-foreground">
          Configure the model provider used for query generation.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Provider</Label>
        <Select
          value={config.provider}
          onValueChange={(provider: Provider) =>
            setConfig((prev) => ({ ...prev, provider }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="gemini">Gemini</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>API Key</Label>
        <div className="relative">
          <Input
            type={showKey ? "text" : "password"}
            placeholder="sk-***************"
            value={config.apiKey}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, apiKey: e.target.value }))
            }
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showKey ? "Hide API key" : "Show API key"}
          >
            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex justify-between">
          Temperature
          <span className="text-muted-foreground">
            {config.temperature.toFixed(2)}
          </span>
        </Label>
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={[config.temperature]}
          onValueChange={([temperature]) =>
            setConfig((prev) => ({ ...prev, temperature }))
          }
        />
      </div>

      <Button onClick={saveConfig} className="w-full">
        Save Settings
      </Button>
    </div>
  );
}
