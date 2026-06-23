"use client";

export type ImageNormalizationStatus =
  | "not_applicable"
  | "kept_original"
  | "normalized"
  | "unsupported";

export type NormalizedImageResult = {
  file: File;
  originalFileName: string;
  originalMimeType: string;
  originalSizeBytes: number;
  normalizedFileName: string;
  normalizedMimeType: string;
  normalizedSizeBytes: number;
  normalizationStatus: ImageNormalizationStatus;
};

const supportedInputTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const textHeavyNamePattern = /screenshot|screen shot|note|sticky|scan|text|receipt|invoice|quote/i;
const photoNamePattern = /photo|jobsite|job site|camera|img_|dsc|jpeg|jpg/i;

function extensionForMime(mimeType: string) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

function baseName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "") || "image";
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

async function decodeImage(file: File) {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const element = new Image();
        element.onload = () => resolve(element);
        element.onerror = reject;
        element.src = url;
      });
      return image;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

function drawToCanvas(image: ImageBitmap | HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image normalization is unavailable in this browser.");
  context.drawImage(image, 0, 0);
  if ("close" in image) image.close();
  return canvas;
}

function looksTextHeavy(file: File) {
  if (textHeavyNamePattern.test(file.name)) return true;
  if (photoNamePattern.test(file.name)) return false;
  return file.type === "image/png";
}

function chooseSmallest(candidates: File[]) {
  return candidates.reduce((best, candidate) =>
    candidate.size < best.size ? candidate : best
  );
}

function buildOutputFile(blob: Blob, originalName: string, mimeType: string) {
  const name = `${baseName(originalName)}-normalized.${extensionForMime(mimeType)}`;
  return new File([blob], name, { type: mimeType });
}

export function isSupportedImageUpload(file: File) {
  return supportedInputTypes.has(file.type.toLowerCase());
}

export async function normalizeImageForAi(file: File): Promise<NormalizedImageResult> {
  const originalFileName = file.name;
  const originalMimeType = file.type || "application/octet-stream";
  const originalSizeBytes = file.size;

  if (!originalMimeType.startsWith("image/")) {
    return {
      file,
      originalFileName,
      originalMimeType,
      originalSizeBytes,
      normalizedFileName: file.name,
      normalizedMimeType: originalMimeType,
      normalizedSizeBytes: originalSizeBytes,
      normalizationStatus: "not_applicable",
    };
  }

  if (!isSupportedImageUpload(file)) {
    throw new Error("Unsupported image format. Use JPG, PNG, or WebP. HEIC/HEIF conversion is not available in this browser.");
  }

  let canvas: HTMLCanvasElement;
  try {
    canvas = drawToCanvas(await decodeImage(file));
  } catch {
    if (originalMimeType === "image/heic" || originalMimeType === "image/heif") {
      throw new Error("HEIC/HEIF conversion is not available in this browser. Export the image as JPG, PNG, or WebP.");
    }
    throw new Error("Unable to read this image for normalization.");
  }

  const candidates: File[] = [];
  const textHeavy = looksTextHeavy(file);

  const jpegBlob = await canvasToBlob(canvas, "image/jpeg", 0.82);
  if (jpegBlob) candidates.push(buildOutputFile(jpegBlob, file.name, "image/jpeg"));

  const webpBlob = await canvasToBlob(canvas, "image/webp", 0.82);
  if (webpBlob) candidates.push(buildOutputFile(webpBlob, file.name, "image/webp"));

  if (textHeavy) {
    const pngBlob = await canvasToBlob(canvas, "image/png");
    if (pngBlob) candidates.push(buildOutputFile(pngBlob, file.name, "image/png"));
  }

  if (["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(originalMimeType)) {
    candidates.push(file);
  }

  const selected = chooseSmallest(candidates);
  const keptOriginal = selected === file;

  return {
    file: selected,
    originalFileName,
    originalMimeType,
    originalSizeBytes,
    normalizedFileName: selected.name,
    normalizedMimeType: selected.type || originalMimeType,
    normalizedSizeBytes: selected.size,
    normalizationStatus: keptOriginal ? "kept_original" : "normalized",
  };
}

