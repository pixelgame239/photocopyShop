import { Client } from "@stomp/stompjs";
import { getAccessToken } from "./tokenService";

let stompClient = null;

const WS_URL = import.meta.env.VITE_WS_URL;
export const connectWebSocket = (onMessageReceived, onNotificationReceived, user) => {
  const token = getAccessToken();
  stompClient = new Client({
    brokerURL: WS_URL,

    reconnectDelay: 5000,
    beforeConnect: () => {
      const latestToken = getAccessToken();
      stompClient.connectHeaders = {
      "Authorization": latestToken ? `Bearer ${latestToken}` : "",
      "FullName": user ? user.fullName : ""
    }
    },
    debug: (str) => {
      console.log("STOMP:", str);
    },

    onConnect: () => {
      console.log("✅ Connected to WebSocket");
      if(user && (user.role === "USER" || user.role === "GUEST")){
          stompClient.subscribe("/user/queue/messages", (message) => {
            if (message.body) {
              const parsed = JSON.parse(message.body);
              onMessageReceived(parsed);
          }
        });
      }
      if(user && user.role === "USER"){
        stompClient.subscribe("/user/queue/orders/notifications", (message) => {
          if (message.body) {
            const parsed = JSON.parse(message.body);
            onNotificationReceived(parsed);
          }
        });
      }
        if(user && (user.role === "ADMIN" || user.role === "STAFF")){
          stompClient.subscribe("/topic/support.staff", (message) => {
            if (message.body) {
              const parsed = JSON.parse(message.body);
              onMessageReceived(parsed);
            }
          });
          stompClient.subscribe("/topic/orders/notifications", (message) => {
            if (message.body) {
              const parsed = JSON.parse(message.body);
              onNotificationReceived(parsed);
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