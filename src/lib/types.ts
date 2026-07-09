export type AgentRole =
  | "copywriter"
  | "designer"
  | "media_buyer"
  | "analyst"
  | "tester"
  | "foreman"
  | "producer";

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
  | "task_assigned"
  | "scope_ready"
  | "reachout_ready"
  | "complete"
  | "error";

export type VideoStatus = "idle" | "producing" | "ready" | "failed";

export interface GtmChannel {
  name: string;
  budgetShare: number;
}

export interface GtmScope {
  icp: string;
  signals: string[];
  audienceCount: number;
  channels: GtmChannel[];
  positioning?: string;
}

export type ReachoutChannel = "meta_ads" | "email" | "linkedin_dm";

export interface ReachoutTouch {
  day: number;
  channel: ReachoutChannel;
  title: string;
  snippet: string;
  status: "live" | "queued";
}

export interface CampaignEvent {
  type: CampaignEventType;
  role?: AgentRole;
  message?: string;
  content?: string;
  model?: string;
  task?: string;
  variant?: AdVariant;
  variants?: AdVariant[];
  scope?: GtmScope;
  reachout?: ReachoutTouch[];
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
  /** FAL-generated vertical ad video URL (when Producer finishes) */
  videoUrl?: string;
  videoStatus?: VideoStatus;
  videoRequestId?: string;
}

export interface CampaignBrief {
  product: string;
  price?: string;
  audience?: string;
}

export type ForgePhase =
  | "brief"
  | "scoping"
  | "scope_ready"
  | "distributing"
  | "ready"
  | "reachout"
  | "launched";

export interface AgentActivity {
  copywriter: boolean;
  designer: boolean;
  media_buyer: boolean;
  analyst: boolean;
  tester: boolean;
  producer: boolean;
}
