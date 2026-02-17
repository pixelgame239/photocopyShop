import HighlightCard from "./HighlightCard";
import "../styles/homepage.css";

const HighlightSession = () =>{
        const cardData = [{
            image:<svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px" fill="#ffffff"><path d="M160-560h640-640Zm80 440v-160H80v-240q0-51 35-85.5t85-34.5h560q51 0 85.5 34.5T880-520v30q-18-10-38-17t-42-10v-3q0-17-11.5-28.5T760-560H200q-17 0-28.5 11.5T160-520v160h80v-80h340q-16 17-29 37t-21 43H320v160h204q7 22 17 42t24 38H240Zm478-33L604-266l57-56 57 56 141-141 57 56-198 198Zm-78-487v-120H320v120h-80v-200h480v200h-80Z"/></svg>,
            content:"Cửa hàng cung cấp đa dạng dịch vụ liên quan đến công việc văn phòng, giáo dục,..."
        },{
            image:<svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px" fill="#ffffff"><path d="M80-120q-33 0-56.5-23.5T0-200v-560q0-33 23.5-56.5T80-840h800q33 0 56.5 23.5T960-760v560q0 33-23.5 56.5T880-120H80Zm556-80h244v-560H80v560h4q42-75 116-117.5T360-360q86 0 160 42.5T636-200ZM360-400q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Zm400 160 80-80-60-80h-66q-6-18-10-38.5t-4-41.5q0-21 4-40.5t10-39.5h66l60-80-80-80q-54 42-87 106.5T640-480q0 69 33 133.5T760-240Zm-578 40h356q-34-38-80.5-59T360-280q-51 0-97 21t-81 59Zm178-280q-17 0-28.5-11.5T320-520q0-17 11.5-28.5T360-560q17 0 28.5 11.5T400-520q0 17-11.5 28.5T360-480Zm120 0Z"/></svg>,
            content:"Đa dạng phương thức liên hệ qua: Website, số điện thoại, Zalo, Gmail"
        },{
            image:<svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px" fill="#FFFFFF"><path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z"/></svg>,
            content: "Địa điểm gần với các trường Đại học như Đại học FPT, Đại học Quốc gia Hà Nội,..."
        }
    ];
    return(
        <div className="highlight-session">
            {cardData.map((data, index) => <HighlightCard key={index} cardData={data}></HighlightCard>)}
        </div>
    )
}
export default HighlightSession;