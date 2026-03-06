import { useState, useEffect, useContext, useRef } from "react";
import { connectWebSocket, sendMessage, disconnectWebSocket } from "../service/websocket";
import { UserContext } from "../context/UserContext";
import { getAccessToken } from "../service/tokenService";
import "../styles/homepage.css";
import chatApi from "../api/chat.api";

const ChatBox = ({ onClose }) => {
  const { user, currentChatMessages, setCurrentChatMessages,  boxChats, 
    setBoxChats, setUnreadChat, incomingMessages, setIncomingMessages } = useContext(UserContext);
  const [selectedBoxChat, setSelectedBoxChat] = useState(null);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const selectedBoxChatRef = useRef(selectedBoxChat);
  useEffect(() => {
    selectedBoxChatRef.current = selectedBoxChat;
  }, [selectedBoxChat]);

  const isAgent = user && (user.role === "ADMIN" || user.role === "STAFF");

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [currentChatMessages, selectedBoxChat]);

  const handleSelectBoxChat = async(boxChat) => {
    if(!boxChat) return;
    setSelectedBoxChat(boxChat);
    console.log("Selected box chat:", boxChat);
    if(boxChat.staffRead === false){
      try {
        await chatApi.markBoxChatAsRead(boxChat.participant);
      } catch (error) {
        console.error("Error marking box chat as read:", error);
      }
    }
    const response = await chatApi.getBoxChatMessages(boxChat.id, boxChat.participant);
    setCurrentChatMessages(response.data);
    console.log("Fetched messages for box chat:", response.data);
    setBoxChats((prev) => prev.map((b) => (b&&b.id === boxChat.id ? { ...b, staffRead: true } : b)));
  };

  useEffect(() => {
    if(isAgent) {
      setUnreadChat(boxChats.some(box => box && !box.staffRead));
    }
    else {
      setUnreadChat(boxChats.some(box => box && !box.userRead));
    }
  }, [boxChats, isAgent]);
const handleSend = () => {
    if (!input.trim()) return;
    const receiver = selectedBoxChat ? selectedBoxChat.participant : "STAFF";
    let senderName = "Guest_Unknown";
    if (user && (user.role === "STAFF" || user.role === "ADMIN")) {
        senderName = "STAFF";
    } else if (user && user.role === "USER") {
        senderName = `${user.id}_${user.fullName}`; 
    } else if (user && user.role==="GUEST") {
        senderName = `Guest_${user.fullName}`;
    }

    const payload = {
      content: input,
      receiver,
      sender: senderName, 
    };

    console.log("Sending message:", payload);
    sendMessage(payload);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };
  useEffect(() => {
    if (incomingMessages && incomingMessages.length > 0) {
      const currentSelected = selectedBoxChatRef.current;
      let messagesToAdd = [];
      incomingMessages.forEach((msg) => {
        if (msg.type === "READ_RECEIPT") {
          if (currentSelected && currentSelected.id === msg.boxChatId) {
            setSelectedBoxChat((prev) => {
              if (!prev) return prev; 
              return {
                ...prev,
                staffRead: msg.readBy === "STAFF" ? true : prev.staffRead,
                userRead: msg.readBy === "USER" ? true : prev.userRead,
              };
            });
          }
        } else {
          const isRelevant = isAgent ? (currentSelected && currentSelected.id === msg.boxChatId) : true;
          if (isRelevant) {
            messagesToAdd.push(msg);
            if (isAgent && msg.sender !== "STAFF" && currentSelected) {
               chatApi.markBoxChatAsRead(currentSelected.participant).catch(e => console.error(e));
            }
          }
        }
      });
     if (messagesToAdd.length > 0) {
        setCurrentChatMessages((prev) => {
          let newMessages = [...prev];
          messagesToAdd.forEach(msg => {
            const isDuplicate = newMessages.some((m) => m.id === msg.id || (m.timestamp === msg.timestamp && m.content === msg.content));
            if (!isDuplicate) {
              newMessages.push(msg);
            }
          });
          return newMessages;
        });
      }
      setIncomingMessages([]);
    }
  }, [incomingMessages, isAgent, setIncomingMessages, setCurrentChatMessages]);

  return (
    <div className="chat-overlay">
      <div className={`chat-box portrait ${isAgent ? "" : "compact"}`}>
        <div className="chat-header">
          <div>Hỗ trợ</div>
          <button className="chat-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="chat-body">
          {isAgent ? (
            <div className="chat-columns">
              <div className="chat-users">
                <div className="users-title">Cuộc trò chuyện</div>
                {boxChats.map((u) => (
                  <div
                    key={u.id}
                    className={`chat-user ${selectedBoxChatRef.current && selectedBoxChatRef.current.id === u.id ? "active" : ""}`}
                    onClick={async () => { await handleSelectBoxChat(u); }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      {u.staffRead === false && <div className="notification-sign"></div>}
                      <div style={{ fontWeight: 700 }}>{u.participant}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="chat-single">
                <div className="messages-list chat-messages">
                  {currentChatMessages.length === 0 && <div className="no-select">Chưa có tin nhắn nào.</div>}
                  {currentChatMessages.map((m, i) => (
                    <div key={i} className={`msg ${m.sender === "STAFF" ? "me" : "them"}`}>
                      {m.content}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {selectedBoxChat ? (
                  <div className="chat-input">
                    <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={`Message ${selectedBoxChat.participant}`} />
                    <button type="button" onClick={handleSend}>Gửi</button>
                  </div>
                ) : (
                  <div className="no-select" style={{ padding: 12, borderTop: '1px solid #eee', textAlign: 'center' }}>Chọn một cuộc trò chuyện để bắt đầu nhắn tin.</div>
                )}
              </div>
            </div>
          ) : (
            <div className="chat-single">
              <div className="messages-list chat-messages">
                {currentChatMessages.length === 0 && <div className="no-select">Chưa có tin nhắn nào.</div>}
                {currentChatMessages.map((m, i) => (
                  <div key={i} className={`msg ${m.sender === "STAFF" ? "them" : "me"}`}>
                    {m.content}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={selectedBoxChat ? `Message ${selectedBoxChat.participant}` : "Gửi tin nhắn"} />
                <button type="button" onClick={handleSend}>Gửi</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBox;