import "server-only"

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getServerEnvironment } from "@/lib/env"

export class StorageNotConfiguredError extends Error {
  constructor() {
    super("Media storage is not configured (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET_NAME / R2_PUBLIC_URL missing).")
    this.name = "StorageNotConfiguredError"
  }
}

function requireR2Config() {
  const environment = getServerEnvironment()
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL } = environment

  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
    throw new StorageNotConfiguredError()
  }

  return { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL }
}

function client(config: ReturnType<typeof requireR2Config>) {
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.R2_ACCESS_KEY_ID,
      secretAccessKey: config.R2_SECRET_ACCESS_KEY,
    },
  })
}

export async function uploadMedia(buffer: Buffer, key: string, contentType: string): Promise<void> {
  const config = requireR2Config()
  await client(config).send(new PutObjectCommand({
    Bucket: config.R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }))
}

export async function deleteMedia(key: string): Promise<void> {
  const config = requireR2Config()
  await client(config).send(new DeleteObjectCommand({ Bucket: config.R2_BUCKET_NAME, Key: key }))
}

export function getMediaUrl(key: string): string {
  const { R2_PUBLIC_URL } = requireR2Config()
  return `${R2_PUBLIC_URL}/${key}`
}
