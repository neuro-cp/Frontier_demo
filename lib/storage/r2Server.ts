import "server-only";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  endpoint: string;
  region: string;
};

function getR2Config(): R2Config {
  const accountId = process.env.R2_ACCOUNT_ID ?? "";
  const endpoint =
    process.env.R2_ENDPOINT ||
    (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "");
  const config = {
    accountId,
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
    bucketName: process.env.R2_BUCKET_NAME ?? "",
    endpoint,
    region: process.env.R2_REGION || "auto",
  };

  if (!config.endpoint || !config.accessKeyId || !config.secretAccessKey || !config.bucketName) {
    throw new Error("R2 document storage is not configured.");
  }

  return config;
}

function createR2Client(config = getR2Config()) {
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: true,
  });
}

export function getDocumentStorageProvider() {
  return process.env.DOCUMENT_STORAGE_PROVIDER?.trim().toLowerCase() || "r2";
}

export function getR2BucketName() {
  return getR2Config().bucketName;
}

export async function uploadR2DocumentObject({
  key,
  file,
}: {
  key: string;
  file: File;
}) {
  const config = getR2Config();
  const client = createR2Client(config);
  await client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type || undefined,
    })
  );
}

export async function createR2DocumentDownloadUrl({ key }: { key: string }) {
  const config = getR2Config();
  const client = createR2Client(config);
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    }),
    { expiresIn: 60 }
  );
}

export async function downloadR2DocumentObject({ key }: { key: string }) {
  const config = getR2Config();
  const client = createR2Client(config);
  const response = await client.send(
    new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    })
  );
  if (!response.Body) throw new Error("R2 object is empty.");
  const bytes = await response.Body.transformToByteArray();
  return new Blob([Buffer.from(bytes)], { type: response.ContentType || "application/octet-stream" });
}

export async function deleteR2DocumentObject({ key }: { key: string }) {
  const config = getR2Config();
  const client = createR2Client(config);
  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    })
  );
}

export async function r2DocumentObjectExists({ key }: { key: string }) {
  const config = getR2Config();
  const client = createR2Client(config);
  try {
    await client.send(
      new HeadObjectCommand({
        Bucket: config.bucketName,
        Key: key,
      })
    );
    return true;
  } catch {
    return false;
  }
}
