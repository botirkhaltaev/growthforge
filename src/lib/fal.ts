import { fal } from "@fal-ai/client";

let configured = false;

export const FAL_VIDEO_MODEL = "google/gemini-omni-flash";

export function getFal() {
  const key = process.env.FAL_KEY;
  if (!key) {
    throw new Error("FAL_KEY is not configured");
  }
  if (!configured) {
    fal.config({ credentials: key });
    configured = true;
  }
  return fal;
}

export type FalVideoOutput = {
  video?: {
    url?: string;
    content_type?: string;
    file_name?: string;
    file_size?: number;
  };
};
