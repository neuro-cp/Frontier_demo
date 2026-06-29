import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createStoredDocumentStorageProvider } from "@/lib/storage/documentStorageProviderServer";

export async function downloadStoredDocumentObject({
  serviceClient,
  bucket,
  path,
}: {
  serviceClient: SupabaseClient;
  bucket?: string | null;
  path: string;
}) {
  const provider = createStoredDocumentStorageProvider({ serviceClient, bucket });
  return provider.download({ key: path });
}
