import { useState, useContext } from "react";
import "../styles/homepage.css";
import { UserContext } from "../context/UserContext";

const ChatBox = ({ onClose }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const { user } = useContext(UserContext);
  const role = user?.role || "GUEST";
  const isStaff = role === "ADMIN" || role === "STAFF";
  const [messages, setMessages] = useState([
    { from: "them", text: "Hello! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie" },
  ];

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { from: "me", text: input }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "them", text: "Thanks — we'll get back to you." }]);
    }, 700);
  };

  return (
    <div className="chat-overlay">
      <div className={`chat-box ${isStaff ? "landscape" : "portrait"}`}>
        <div className="chat-header">
          <div>Support Chat</div>
          <button className="chat-close" onClick={onClose} aria-label="Close chat">×</button>
        </div>
        <div className="chat-body">
          {(role === "ADMIN" || role === "STAFF") ? (
            <div className="chat-columns">
              <div className="chat-users">
                <div className="users-title">Users</div>
                {users.map((u) => (
                  <div
                    key={u.id}
                    className={`chat-user ${selectedUser?.id === u.id ? "active" : ""}`}
                    onClick={() => setSelectedUser(u)}
                  >
                    {u.name}
                  </div>
                ))}
              </div>

              <div className="chat-messages">
                <div className="messages-list">
                  {selectedUser ? (
                    messages.map((m, i) => (
                      <div key={i} className={`msg ${m.from === "me" ? "me" : "them"}`}>
                        {m.text}
                      </div>
                    ))
                  ) : (
                    <div className="no-select">Select a user to start a conversation</div>
                  )}
                </div>
                <div className="chat-input">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={selectedUser ? `Message ${selectedUser.name}` : "Select a user"}
                    disabled={!selectedUser}
                  />
                  <button onClick={sendMessage} disabled={!selectedUser}>Send</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="chat-single">
              <div className="messages-list">
                {messages.map((m, i) => (
                  <div key={i} className={`msg ${m.from === "me" ? "me" : "them"}`}>
                    {m.text}
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message" />
                <button onClick={sendMessage}>Send</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
