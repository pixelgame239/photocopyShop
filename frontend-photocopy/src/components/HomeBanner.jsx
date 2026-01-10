import "../styles/homepage.css";
import zaloLogo from "../assets/zaloLogo.png";
import gmailLogo from "../assets/gmailLogo.png";
import bannerImg from "../assets/bannerImg.png";

const HomeBanner = () =>{
    const openZalo = () =>{
        window.open("https://zalo.me/", "_blank");
    }
    const sendMail = ()=>{
        const email = "example@gmail.com";
        const subject = encodeURIComponent("Liên hệ dịch vụ");
        window.location.href = `mailto:${email}?subject=${subject}`;
    }
    return(
        <div className="home-banner">
            <div className="banner-content">
                <h1> Cửa hàng Photocopy</h1>
                <p>Cung cấp các dịch vụ về văn phòng, in ấn,...</p>
                <p>Địa chỉ: Nam Từ Liêm, Hà Nội</p>
                <div style={{display:"flex"}}>
                    <button onClick={openZalo}>Liên hệ qua<img src={zaloLogo} alt="Zalo"></img></button>
                    <button onClick={sendMail}>Liên hệ qua<img src={gmailLogo} alt="Gmail" ></img></button>
                </div>
            </div>
            <div className="banner-img">
                <img src={bannerImg} style={{height:"100%"}}></img>
            </div>
        </div>
    )
}
export default HomeBanner;