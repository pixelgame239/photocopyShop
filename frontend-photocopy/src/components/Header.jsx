import "../styles/header.css";
import logo from "../assets/logo.png";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { TabContext } from "../context/TabContext";

const Header = () =>{
    const {currentTab} = useContext(TabContext);
    const nav = useNavigate();
    const changeTab = (tab) =>{
        nav(`/${tab}`);
    }
    return (
        <div className="header">
            <img src={logo} className="logo-image" alt="Photocopy"></img>
            <div className="header-buttons">
                <button className={`header-button ${currentTab === ''?'active':''}`} onClick={()=>changeTab("")}>Trang chủ</button>
                <button className={`header-button ${currentTab === 'services'?'active':''}`} onClick={()=>changeTab("services")}>Dịch vụ</button>
                <button className={`header-button ${currentTab === 'products'?'active':''}`} onClick={()=>changeTab("products")}>Sản phẩm</button>
                <button className={`header-button ${currentTab === 'contact'?'active':''}`} onClick={()=>changeTab("contact")}>Liên hệ</button>
                <button className="header-login-button" onClick={()=>nav("/login")}>Đăng nhập</button>
                <button className="header-signup-button" onClick={()=>nav("/signup")}>Đăng ký</button>
            </div>
        </div>
    )
}
export default Header;