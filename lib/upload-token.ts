import crypto from "crypto";

export type UploadTokenPayload = {
  exp: number;
  teacherId: string;
  batchId: string;
  subjectId: string;
  chapterId: string;
};

function base64url(input: string) {
  return Buffer.from(input).toString("base64url");
}

function getApiSecret(): string {
  return process.env.VPS_API_SECRET || process.env.API_SECRET || "random_secret_key_123";
}

export function createUploadToken(payload: UploadTokenPayload) {
  const body = base64url(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", getApiSecret())
    .update(body)
    .digest("base64url");

  return `${body}.${signature}`;
}
