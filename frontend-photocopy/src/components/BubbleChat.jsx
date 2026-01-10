import chatLogo from "../assets/chatLogo.png";
import "../styles/homepage.css";

const BubbleChat= ()=>{
    return(
        <div className="bubble-chat">
            <img src={chatLogo} alt="Call"></img>
        </div>
    )
}
export default BubbleChat;