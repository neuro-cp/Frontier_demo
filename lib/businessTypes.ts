import { defaultBusinessTypes } from "@/lib/workspaceOptions";

const junkValues = new Set([
  "other",
  "none",
  "n/a",
  "na",
  "test",
  "asdf",
  "unknown",
  "business",
  "company",
]);

export function normalizeBusinessTypeSuggestion(value: string) {
  return value
    .trim()
    .replace(/[^\w\s&/-]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function displayBusinessTypeSuggestion(value: string) {
  return normalizeBusinessTypeSuggestion(value)
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function validateBusinessTypeSuggestion(value: string) {
  const normalized = normalizeBusinessTypeSuggestion(value);
  if (normalized.length < 2) return "Business type is too short.";
  if (normalized.length > 80) return "Business type is too long.";
  if (junkValues.has(normalized)) return "Enter a real trade or business type.";
  if (!/[a-z]/.test(normalized)) return "Business type must include letters.";
  return null;
}

export function mergeBusinessTypes(approved: string[]) {
  const seen = new Set<string>();
  const merged = [...defaultBusinessTypes.filter((item) => item !== "Other"), ...approved]
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => {
      const key = normalizeBusinessTypeSuggestion(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.localeCompare(b));

  return [...merged, "Other"];
}
