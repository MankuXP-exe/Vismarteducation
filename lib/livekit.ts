import { AccessToken } from "livekit-server-sdk";

type TokenOptions = {
  roomName: string;
  identity: string;
  name?: string;
  role: "teacher" | "student";
};

export async function createLiveKitToken({ roomName, identity, name, role }: TokenOptions) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("LiveKit API credentials are not configured");
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity,
    name,
    ttl: "4h",
    metadata: JSON.stringify({ role }),
  });

  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: role === "teacher",
    canSubscribe: true,
    canPublishData: true,
  });

  return token.toJwt();
}
