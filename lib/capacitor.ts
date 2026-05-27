export function isCapacitor(): boolean {
  return typeof window !== "undefined" && !!(window as any).Capacitor;
}

export async function openUrl(url: string): Promise<void> {
  if (isCapacitor()) {
    const { AppLauncher } = await import("@capacitor/app-launcher");
    await AppLauncher.openUrl({ url });
  } else {
    window.open(url, "_blank");
  }
}
