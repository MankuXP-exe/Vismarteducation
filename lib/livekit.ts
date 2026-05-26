type TokenOptions = {
  roomName: string;
  identity: string;
  name?: string;
  role: "teacher" | "student";
};

export async function createLiveKitToken(_options: TokenOptions) {
  throw new Error("LiveKit has been replaced by MediaMTX streaming");
}
