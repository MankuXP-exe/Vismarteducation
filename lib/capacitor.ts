export function isCapacitor(): boolean {
  return typeof window !== "undefined" && !!(window as any).Capacitor;
}

export async function openUrl(url: string): Promise<void> {
  if (isCapacitor()) {
    const { Browser } = await import("@capacitor/browser");
    await Browser.open({ url });
  } else {
    window.open(url, "_blank");
  }
}
