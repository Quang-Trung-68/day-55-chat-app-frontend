import PusherJS from "pusher-js";

PusherJS.logToConsole = true;

const client = new PusherJS("abc123", {
  cluster: "",
  wsHost: "127.0.0.1",
  wsPort: 6001,
  forceTLS: false,
  disableStats: true,
  enabledTransports: ["ws", "wss"],
});

// client.connection.bind("connected", () => {
//   console.log("✅ Connected!", client.connection.socket_id);
// });

// client.connection.bind("error", (err) => {
//   console.error("❌ Error:", err);
// });

export default client;
