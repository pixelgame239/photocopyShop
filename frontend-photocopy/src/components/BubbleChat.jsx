import chatLogo from "../assets/chatLogo.png";
import "../styles/homepage.css";
import { useState } from "react";
import ChatBox from "./ChatBox";

const BubbleChat = () => {
    const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);
    const toggleChatBox = () => setIsChatBoxOpen((s) => !s);

    return (
        <div>
            {isChatBoxOpen && <ChatBox onClose={toggleChatBox} />}
            <div className="bubble-chat" onClick={toggleChatBox}>
                <img src={chatLogo} alt="Call" />
            </div>
        </div>
    );
};

export default BubbleChat;