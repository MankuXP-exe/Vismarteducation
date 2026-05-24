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

export function createUploadToken(payload: UploadTokenPayload) {
  const body = base64url(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", process.env.VPS_API_SECRET!)
    .update(body)
    .digest("base64url");

  return `${body}.${signature}`;
}
