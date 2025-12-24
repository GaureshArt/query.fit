import QuerySvg from "@/public/setting-svgs/query-svg"
import AiProviderSvg from "@/public/setting-svgs/ai-provider-svg"
import DatabaseSvg from "@/public/setting-svgs/database-svg"
export const SETTINGS_SUB_NAV = [
  {
    id: 1,
    name: "AI Providers",
    link: "/settings/ai-providers",
    description:
      "Manage API keys, default models, temperature, and fallback providers for query generation.",
    logo:AiProviderSvg
  },
  {
    id: 2,
    name: "Database Safety",
    link: "/settings/database",
    description:
      "Configure guardrails to prevent unsafe SQL like destructive queries and enforce read-only rules."
      ,
      logo:DatabaseSvg
  },
  {
    id: 3,
    name: "Query Generation",
    link: "/settings/query",
    description:
      "Control how queries are generated, retried, explained, and validated before execution.",
      logo:QuerySvg
  }
];
