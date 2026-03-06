import chatLogo from "../assets/chatLogo.png";
import "../styles/homepage.css";
import { useState } from "react";
import ChatBox from "./ChatBox";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import chatApi from "../api/chat.api";

const BubbleChat = () => {
    const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);
    const { user, setCurrentChatMessages, unreadChat, setUnreadChat, setIncomingMessages } = useContext(UserContext);
    const toggleChatBox = async() => {
        if (user && (user.role === "GUEST" || user.role === "USER")) {
            try {
                const tempName = user.role === "GUEST" ? "Guest_" + user.fullName : user.id + "_" + user.fullName;
                const response = await chatApi.markBoxChatAsRead(tempName);
                const boxChatId = response.data;
                const messages = await chatApi.getBoxChatMessages(boxChatId, tempName);
                setIncomingMessages([]);
                setCurrentChatMessages(messages.data);
                setUnreadChat(false);
            } catch (error) {
                console.error("Error marking box chat as read:", error);
            }
        }
        setIsChatBoxOpen((s) => !s);
    }
    const closeChatBox = () => {
        setIsChatBoxOpen(false);
        setCurrentChatMessages([]);
    }

    return (
        <div>
            {isChatBoxOpen && <ChatBox onClose={closeChatBox} />}
            <div className="bubble-chat" onClick={toggleChatBox}>
                <img src={chatLogo} alt="Chat" />
                {unreadChat && <div className="notification-sign"></div>}
            </div>
        </div>
    );
};

export default BubbleChat;