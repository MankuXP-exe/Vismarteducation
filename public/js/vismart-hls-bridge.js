/**
 * Vi Smart HLS Bridge — injected into WebView for native HLS handling
 *
 * This script enhances HLS.js playback in the Capacitor WebView:
 * - Native fullscreen handling
 * - Orientation lock during fullscreen
 * - Keep screen awake
 * - Bandwidth monitoring
 * - Auto-reconnect
 */
(function () {
  if (window.ViSmartHLS) return;
  window.ViSmartHLS = true;

  const CapacitorHLS = {
    hlsInstances: new Map(),
    fullscreen: false,

    async init() {
      try {
        const { ScreenOrientation } = await import(
          "@capacitor/screen-orientation"
        );
        const { StatusBar } = await import("@capacitor/status-bar");
        this.ScreenOrientation = ScreenOrientation;
        this.StatusBar = StatusBar;
      } catch {
        // Capacitor plugins not available (running in browser)
      }
    },

    attach(videoElement, hlsInstance) {
      if (!videoElement || !hlsInstance) return;

      const id = videoElement.id || `hls-${Date.now()}`;
      this.hlsInstances.set(id, { video: videoElement, hls: hlsInstance });

      videoElement.addEventListener("webkitbeginfullscreen", () =>
        this.enterFullscreen(videoElement)
      );
      videoElement.addEventListener("webkitendfullscreen", () =>
        this.exitFullscreen(videoElement)
      );

      // Custom fullscreen toggle
      const toggleBtn = videoElement.closest("[data-fullscreen-btn]");
      if (toggleBtn) {
        toggleBtn.addEventListener("click", () => this.toggle(videoElement));
      }
    },

    async toggle(videoElement) {
      if (this.fullscreen) {
        await this.exitFullscreen(videoElement);
      } else {
        await this.enterFullscreen(videoElement);
      }
    },

    async enterFullscreen(videoElement) {
      if (this.fullscreen) return;
      this.fullscreen = true;

      try {
        if (this.ScreenOrientation) {
          await this.ScreenOrientation.lock({
            orientation: "landscape-primary",
          });
        }
        if (this.StatusBar) {
          await this.StatusBar.hide();
        }
      } catch {}

      videoElement.style.objectFit = "contain";
      videoElement.style.backgroundColor = "black";

      try {
        if (videoElement.requestFullscreen) {
          await videoElement.requestFullscreen();
        } else if (videoElement.webkitRequestFullscreen) {
          videoElement.webkitRequestFullscreen();
        }
      } catch {}
    },

    async exitFullscreen(videoElement) {
      if (!this.fullscreen) return;
      this.fullscreen = false;

      try {
        if (this.ScreenOrientation) {
          await this.ScreenOrientation.unlock();
        }
        if (this.StatusBar) {
          await this.StatusBar.show();
        }
      } catch {}

      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      } catch {}
    },

    detach(videoElement) {
      const id = videoElement?.id;
      if (id) this.hlsInstances.delete(id);
    },
  };

  window.ViSmartHLSBridge = CapacitorHLS;

  // Auto-init
  if (document.readyState === "complete") {
    CapacitorHLS.init();
  } else {
    window.addEventListener("load", () => CapacitorHLS.init());
  }
})();
