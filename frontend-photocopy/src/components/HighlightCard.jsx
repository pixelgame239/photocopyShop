import "../styles/homepage.css";

const HighlightCard = ({ cardData }) =>{
    return(
        <div className="highlight-card">
            <div className="highlight-card-image">{cardData.image}</div>
            <p className="highlight-card-content">{cardData.content}</p>
        </div>
    )
}
export default HighlightCard;