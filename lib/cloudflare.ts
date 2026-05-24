import { S3Client } from "@aws-sdk/client-s3";

export function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY!,
      secretAccessKey: process.env.R2_SECRET_KEY!,
    },
  });
}

export async function createCloudflareStreamUploadUrl() {
  const accountId = process.env.CF_ACCOUNT_ID;
  const token = process.env.CF_STREAM_TOKEN;

  if (!accountId || !token) {
    throw new Error("Cloudflare Stream credentials are not configured");
  }

  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ maxDurationSeconds: 14400 }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.errors?.[0]?.message ?? "Unable to create Stream upload URL");
  }

  return data.result;
}
