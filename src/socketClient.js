import PusherJS from "pusher-js";

const client = new PusherJS(import.meta.env.VITE_SOKETI_APP_KEY || "abc123", {
  cluster: import.meta.env.VITE_SOKETI_CLUSTER || "",
  wsHost: import.meta.env.VITE_SOKETI_WS_HOST || "127.0.0.1",
  wsPort: parseInt(import.meta.env.VITE_SOKETI_WS_PORT) || 6001,
  forceTLS: import.meta.env.VITE_SOKETI_FORCE_TLS === "true",
  disableStats: true,
  enabledTransports: ["ws", "wss"],
});

export default client;
