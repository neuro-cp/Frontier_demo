import "server-only";

function readEnabled(name: string, defaultEnabled = true) {
  const raw = process.env[name]?.trim().toLowerCase();
  if (!raw) return defaultEnabled;
  return raw === "true" || raw === "1" || raw === "yes" || raw === "on";
}

export const featureFlags = {
  ai: () => readEnabled("FRONTIER_AI_ENABLED"),
  ocr: () => readEnabled("FRONTIER_OCR_ENABLED"),
  speech: () => readEnabled("FRONTIER_SPEECH_ENABLED"),
  imageAnalysis: () => readEnabled("FRONTIER_IMAGE_ANALYSIS_ENABLED"),
  routing: () => readEnabled("FRONTIER_ROUTING_ENABLED"),
};

export function featureDisabledMessage(feature: string) {
  return `${feature} is temporarily disabled. Try again later or contact support.`;
}
