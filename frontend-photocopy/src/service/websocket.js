import { Client } from "@stomp/stompjs";
import { getAccessToken } from "./tokenService";

let stompClient = null;

export const connectWebSocket = (onMessageReceived, user) => {
  const token = getAccessToken();
  stompClient = new Client({
    brokerURL: "ws://localhost:8080/ws",

    reconnectDelay: 5000,

    connectHeaders: {
      "Authorization": token ? `Bearer ${token}` : "",
      "FullName": user ? user.fullName : ""
    },

    debug: (str) => {
      console.log("STOMP:", str);
    },

    onConnect: () => {
      console.log("✅ Connected to WebSocket");

      stompClient.subscribe("/user/queue/messages", (message) => {
        if (message.body) {
          const parsed = JSON.parse(message.body);
          onMessageReceived(parsed);
        }
      });
        if(user && (user.role === "ADMIN" || user.role === "STAFF")){
          stompClient.subscribe("/topic/support.staff", (message) => {
            if (message.body) {
              const parsed = JSON.parse(message.body);
              onMessageReceived(parsed);
            }
          });
        }
    },

    onStompError: (frame) => {
      console.error("Broker error:", frame.headers["message"]);
    },

    onWebSocketError: (error) => {
      console.error("WebSocket error:", error);
    },
  });

  stompClient.activate();
};

export const sendMessage = (payload) => {
  if (!stompClient || !stompClient.connected) {
    console.warn("WebSocket not connected");
    return;
  }

  stompClient.publish({
    destination: "/app/support.send",
    body: JSON.stringify(payload),
  });
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
};