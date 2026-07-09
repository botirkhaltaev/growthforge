export type AgentRole =
  | "copywriter"
  | "designer"
  | "media_buyer"
  | "analyst"
  | "tester"
  | "foreman";

export type CampaignEventType =
  | "system"
  | "agent_created"
  | "vm_spawned"
  | "agent_active"
  | "agent_idle"
  | "subagent_output"
  | "tester"
  | "variant_ready"
  | "iteration"
  | "complete"
  | "error";

export interface CampaignEvent {
  type: CampaignEventType;
  role?: AgentRole;
  message?: string;
  content?: string;
  model?: string;
  variant?: AdVariant;
  variants?: AdVariant[];
  iteration?: number;
  confidence?: number;
}

export interface AdVariant {
  id: string;
  label: "A" | "B" | "C";
  headline: string;
  body: string;
  cta: string;
  brand: string;
  price: string;
  /** CSS gradient used as creative visual (demo) */
  gradient: string;
  /** Accent emoji / icon for the creative */
  visualEmoji: string;
  visualCaption: string;
  ctr: number;
  cvr: number;
  roas: number;
  revenueForecast: number;
  verdict: "fail" | "close" | "pass";
  iterationNote: string;
}

export interface CampaignBrief {
  product: string;
  price?: string;
  audience?: string;
}

export type ForgePhase = "brief" | "forging" | "ready" | "deployed";

export interface AgentActivity {
  copywriter: boolean;
  designer: boolean;
  media_buyer: boolean;
  analyst: boolean;
  tester: boolean;
}
