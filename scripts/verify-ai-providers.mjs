import fs from "node:fs";
import path from "node:path";

const envPath = path.resolve(process.cwd(), ".env.local");
const requiredNames = [
  "OPENROUTER_API_KEY",
  "OPENAI_API_KEY",
  "AI_PROVIDER",
  "AI_MODEL_TEXT",
  "AI_MODEL_VISION",
  "AI_FALLBACK_PROVIDER",
  "AI_MODEL_FALLBACK",
];

function parseEnvFile(filePath) {
  const found = new Map();
  const duplicates = new Set();
  if (!fs.existsSync(filePath)) return { found, duplicates };

  for (const rawLine of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const [, name, rawValue] = match;
    if (found.has(name)) duplicates.add(name);
    const value = rawValue.replace(/^["']|["']$/g, "").trim();
    found.set(name, value);
  }
  return { found, duplicates };
}

function hasValue(found, name) {
  return Boolean(found.get(name));
}

async function callOpenRouter({ apiKey, model }) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost",
      "X-Title": "Frontier AI Verification",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: "Reply with exactly OK. No punctuation. No markdown.",
        },
      ],
      temperature: 0,
      max_tokens: 2,
    }),
  });
  if (!response.ok) return false;
  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() === "OK";
}

async function callOpenAI({ apiKey, model }) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: "Reply with exactly OK. No punctuation. No markdown.",
        },
      ],
      temperature: 0,
      max_tokens: 2,
    }),
  });
  if (!response.ok) return false;
  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() === "OK";
}

async function main() {
  const { found, duplicates } = parseEnvFile(envPath);
  console.log("AI env names:");
  for (const name of requiredNames) {
    console.log(`${name}: ${hasValue(found, name) ? "FOUND" : "MISSING"}`);
  }
  for (const name of duplicates) {
    if (requiredNames.includes(name)) console.log(`${name}: DUPLICATE`);
  }

  const primary = (found.get("AI_PROVIDER") || "").toLowerCase();
  const fallback = (found.get("AI_FALLBACK_PROVIDER") || "").toLowerCase();
  const results = [];
  const directResults = [];

  if (hasValue(found, "OPENROUTER_API_KEY") && hasValue(found, "AI_MODEL_TEXT")) {
    directResults.push([
      "OpenRouter",
      await callOpenRouter({
        apiKey: found.get("OPENROUTER_API_KEY"),
        model: found.get("AI_MODEL_TEXT"),
      }).catch(() => false),
    ]);
  } else {
    directResults.push(["OpenRouter", false]);
  }

  if (hasValue(found, "OPENAI_API_KEY") && hasValue(found, "AI_MODEL_FALLBACK")) {
    directResults.push([
      "OpenAI",
      await callOpenAI({
        apiKey: found.get("OPENAI_API_KEY"),
        model: found.get("AI_MODEL_FALLBACK"),
      }).catch(() => false),
    ]);
  } else {
    directResults.push(["OpenAI", false]);
  }

  if (primary === "openrouter") {
    const ok =
      hasValue(found, "OPENROUTER_API_KEY") &&
      hasValue(found, "AI_MODEL_TEXT") &&
      (await callOpenRouter({
        apiKey: found.get("OPENROUTER_API_KEY"),
        model: found.get("AI_MODEL_TEXT"),
      }).catch(() => false));
    results.push(["OpenRouter", ok]);
  } else if (primary === "openai") {
    const ok =
      hasValue(found, "OPENAI_API_KEY") &&
      hasValue(found, "AI_MODEL_TEXT") &&
      (await callOpenAI({
        apiKey: found.get("OPENAI_API_KEY"),
        model: found.get("AI_MODEL_TEXT"),
      }).catch(() => false));
    results.push(["OpenAI", ok]);
  } else {
    results.push(["Primary provider", false]);
  }

  if (fallback === "openai" && hasValue(found, "OPENAI_API_KEY")) {
    const ok =
      hasValue(found, "AI_MODEL_FALLBACK") &&
      (await callOpenAI({
        apiKey: found.get("OPENAI_API_KEY"),
        model: found.get("AI_MODEL_FALLBACK"),
      }).catch(() => false));
    results.push(["OpenAI fallback", ok]);
  } else if (fallback === "openrouter" && hasValue(found, "OPENROUTER_API_KEY")) {
    const ok =
      hasValue(found, "AI_MODEL_FALLBACK") &&
      (await callOpenRouter({
        apiKey: found.get("OPENROUTER_API_KEY"),
        model: found.get("AI_MODEL_FALLBACK"),
      }).catch(() => false));
    results.push(["OpenRouter fallback", ok]);
  }

  console.log("Direct provider checks:");
  for (const [name, ok] of directResults) {
    console.log(`${name}: ${ok ? "PASS" : "FAIL"}`);
  }

  console.log("AI provider checks:");
  for (const [name, ok] of results) console.log(`${name}: ${ok ? "PASS" : "FAIL"}`);

  if (!results.length || results.some(([, ok]) => !ok)) {
    process.exitCode = 1;
  }
}

main();
