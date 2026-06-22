import "server-only";

import { runOcrWorker } from "@/lib/ocr/workerClient";

export type OcrProviderMode =
  | "mock"
  | "manual"
  | "worker"
  | "future_openai"
  | "future_google_document_ai";

export type OcrProviderName = OcrProviderMode | "ocrmypdf-tesseract";

export type OcrInput = {
  documentId: string;
  workspaceId: string;
  fileName: string;
  mimeType?: string | null;
  storagePath?: string | null;
  notes?: string | null;
  documentType?: string | null;
  file?: Blob | ArrayBuffer | Uint8Array;
};

export type OcrStructuredData = {
  documentType: "receipt" | "invoice" | "estimate" | "contract" | "unknown";
  vendor?: string;
  customer?: string;
  total?: string;
  date?: string;
  summary?: string;
  fields: Record<string, string>;
};

export type OcrExtractionResult = {
  provider: OcrProviderName;
  text: string;
  structuredData: OcrStructuredData;
  confidence: number;
};

export interface OcrProvider {
  mode: OcrProviderMode;
  extractTextFromDocument(input: OcrInput): Promise<string>;
  extractStructuredData(input: OcrInput, text: string): Promise<OcrStructuredData>;
}

function normalizeDocumentType(value?: string | null): OcrStructuredData["documentType"] {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized.includes("receipt")) return "receipt";
  if (normalized.includes("invoice")) return "invoice";
  if (normalized.includes("estimate") || normalized.includes("quote")) return "estimate";
  if (normalized.includes("contract")) return "contract";
  return "unknown";
}

function createMockProvider(): OcrProvider {
  return {
    mode: "mock",
    async extractTextFromDocument(input) {
      return [
        `Mock OCR extraction for ${input.fileName || "uploaded document"}.`,
        input.notes ? `Notes: ${input.notes}` : "",
        input.storagePath ? `Storage path: ${input.storagePath}` : "",
        "Review extracted information before using it.",
      ]
        .filter(Boolean)
        .join("\n");
    },
    async extractStructuredData(input, text) {
      const documentType = normalizeDocumentType(input.documentType);
      return {
        documentType,
        summary: text.split("\n")[0] ?? "Mock OCR extraction ready for review.",
        fields: {
          fileName: input.fileName || "",
          mimeType: input.mimeType || "",
          storagePath: input.storagePath || "",
        },
      };
    },
  };
}

function createManualProvider(): OcrProvider {
  return {
    mode: "manual",
    async extractTextFromDocument(input) {
      return input.notes?.trim() || "Manual OCR placeholder. Add reviewed text before using this document.";
    },
    async extractStructuredData(input, text) {
      return {
        documentType: normalizeDocumentType(input.documentType),
        summary: text.slice(0, 180),
        fields: {
          fileName: input.fileName || "",
        },
      };
    },
  };
}

export function getOcrProviderMode(): OcrProviderMode {
  const configured = process.env.FRONTIER_OCR_PROVIDER as OcrProviderMode | undefined;
  if (
    configured === "mock" ||
    configured === "manual" ||
    configured === "worker" ||
    configured === "future_openai" ||
    configured === "future_google_document_ai"
  ) {
    return configured;
  }

  if (process.env.OCR_WORKER_URL?.trim() && process.env.OCR_SHARED_SECRET?.trim()) {
    return "worker";
  }

  return "mock";
}

export function createOcrProvider(): OcrProvider {
  const mode = getOcrProviderMode();

  if (mode === "manual") return createManualProvider();

  if (mode === "future_openai" || mode === "future_google_document_ai") {
    if (mode === "future_openai" && process.env.OPENAI_API_KEY) {
      return createMockProvider();
    }

    if (mode === "future_google_document_ai" && process.env.GOOGLE_DOCUMENT_AI_PROCESSOR) {
      return createMockProvider();
    }
  }

  return createMockProvider();
}

export async function runOcrExtraction(input: OcrInput): Promise<OcrExtractionResult> {
  const mode = getOcrProviderMode();

  if (mode === "worker") {
    if (!input.file) throw new Error("The stored PDF could not be loaded for OCR.");

    const result = await runOcrWorker({
      file: input.file,
      fileName: input.fileName,
      contentType: input.mimeType || "application/pdf",
    });

    if (!result.ok) throw new Error(result.error.message);

    const structuredData: OcrStructuredData = {
      documentType: normalizeDocumentType(input.documentType),
      summary: result.data.text.split("\n").find(Boolean)?.slice(0, 180) || "OCR completed.",
      fields: {
        fileName: input.fileName || "",
        mimeType: input.mimeType || "",
        storagePath: input.storagePath || "",
      },
    };

    return {
      provider: result.data.provider,
      text: result.data.text,
      structuredData,
      confidence: 0.7,
    };
  }

  const provider = createOcrProvider();
  const text = await provider.extractTextFromDocument(input);
  const structuredData = await provider.extractStructuredData(input, text);

  return {
    provider: provider.mode,
    text,
    structuredData,
    confidence: provider.mode === "mock" ? 0.35 : 0.2,
  };
}
