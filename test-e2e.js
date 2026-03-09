import PusherJS from "pusher-js";

async function run() {
  console.log("Starting test...");
  try {
    const loginData = { email: "trungsu23@gmail.com", password: "123" };
    // Login
    const res = await fetch("http://127.0.0.1:3000/api/auth/login", {
      method: "POST", headers: {"Content-Type": "application/json"},
      body: JSON.stringify(loginData)
    });
    if (!res.ok) {
      console.log("Login failed", await res.text());
      return;
    }
    const auth = await res.json();
    const token = auth.data.access_token;
    console.log("Logged in!", auth.data.user.id);
    const userId = auth.data.user.id;

    const otherUserId = userId === 1 ? 2 : 1;
    const convRes = await fetch("http://127.0.0.1:3000/api/conversations", {
      method: "POST", headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
      body: JSON.stringify({ name: "test", type: "dm", user_ids: [otherUserId] })
    });
    const conv = await convRes.json();
    if (!conv.data) {
       console.log("Conv failed", conv); return;
    }
    const convId = conv.data.id;
    console.log("Conversation ID:", convId);

    // Set up PusherJS
    PusherJS.logToConsole = true;
    const client = new PusherJS("app-key", {
      cluster: "mt1",
      wsHost: "127.0.0.1",
      wsPort: 6001,
      forceTLS: false,
      disableStats: true,
      enabledTransports: ["ws", "wss"],
    });

    const channelName = `conversation-${convId}`;
    client.connection.bind("connected", async () => {
      console.log("Connected to Pusher!");
      const channel = client.subscribe(channelName);
      
      channel.bind("created", (msg) => {
        console.log("RECEIVED EVENT VIA WEBSOCKET:", msg);
        setTimeout(() => process.exit(0), 500);
      });

      // Send a message
      console.log("Sending HTTP message...");
      const msgRes = await fetch(`http://127.0.0.1:3000/api/conversations/${convId}/messages`, {
        method: "POST", headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
        body: JSON.stringify({ content: "test websocket" })
      });
      console.log("HTTP Message response:", await msgRes.json());
    });
  } catch (err) {
    console.error(err);
  }
}
run();
