import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { DOCUMENT_STORAGE_BUCKET } from "@/lib/storage/documents";
import {
  createR2DocumentDownloadUrl,
  deleteR2DocumentObject,
  downloadR2DocumentObject,
  getDocumentStorageProvider,
  uploadR2DocumentObject,
  r2DocumentObjectExists,
} from "@/lib/storage/r2Server";

export type DocumentStorageProviderName = "r2" | "supabase";

export type DocumentStorageProvider = {
  name: DocumentStorageProviderName;
  upload(input: { key: string; file: File }): Promise<void>;
  download(input: { key: string }): Promise<Blob>;
  delete(input: { key: string }): Promise<void>;
  getSignedUrl(input: { key: string; expiresIn?: number }): Promise<string>;
  exists(input: { key: string }): Promise<boolean>;
};

function createR2Provider(): DocumentStorageProvider {
  return {
    name: "r2",
    upload: uploadR2DocumentObject,
    download: downloadR2DocumentObject,
    delete: deleteR2DocumentObject,
    getSignedUrl: createR2DocumentDownloadUrl,
    exists: r2DocumentObjectExists,
  };
}

function createSupabaseProvider({
  serviceClient,
  bucket = DOCUMENT_STORAGE_BUCKET,
}: {
  serviceClient: SupabaseClient;
  bucket?: string | null;
}): DocumentStorageProvider {
  const storageBucket = bucket || DOCUMENT_STORAGE_BUCKET;

  return {
    name: "supabase",
    async upload({ key, file }) {
      const { error } = await serviceClient.storage
        .from(storageBucket)
        .upload(key, file, { contentType: file.type || undefined, upsert: false });
      if (error) throw new Error(error.message || "Unable to upload document.");
    },
    async download({ key }) {
      const { data, error } = await serviceClient.storage.from(storageBucket).download(key);
      if (error || !data) throw new Error(error?.message || "Unable to download document.");
      return data;
    },
    async delete({ key }) {
      const { error } = await serviceClient.storage.from(storageBucket).remove([key]);
      if (error) throw new Error(error.message || "Unable to delete document file.");
    },
    async getSignedUrl({ key, expiresIn = 60 }) {
      const { data, error } = await serviceClient.storage
        .from(storageBucket)
        .createSignedUrl(key, expiresIn);
      if (error || !data) throw new Error(error?.message || "Unable to create download link.");
      return data.signedUrl;
    },
    async exists({ key }) {
      const { error } = await serviceClient.storage.from(storageBucket).download(key);
      return !error;
    },
  };
}

export function getDefaultDocumentStorageProviderName(): DocumentStorageProviderName {
  return getDocumentStorageProvider() === "supabase" ? "supabase" : "r2";
}

export function getStoredDocumentStorageProviderName(
  bucket?: string | null
): DocumentStorageProviderName {
  if (bucket === "r2") return "r2";
  if (!bucket || bucket === DOCUMENT_STORAGE_BUCKET) return "supabase";
  return getDefaultDocumentStorageProviderName();
}

export function createDefaultDocumentStorageProvider({
  serviceClient,
}: {
  serviceClient: SupabaseClient;
}) {
  const providerName = getDefaultDocumentStorageProviderName();
  return providerName === "r2"
    ? createR2Provider()
    : createSupabaseProvider({ serviceClient, bucket: DOCUMENT_STORAGE_BUCKET });
}

export function createStoredDocumentStorageProvider({
  serviceClient,
  bucket,
}: {
  serviceClient: SupabaseClient;
  bucket?: string | null;
}) {
  const providerName = getStoredDocumentStorageProviderName(bucket);
  return providerName === "r2"
    ? createR2Provider()
    : createSupabaseProvider({ serviceClient, bucket: bucket || DOCUMENT_STORAGE_BUCKET });
}
