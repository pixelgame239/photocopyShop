import "../styles/header.css";
import logo from "../assets/logo.png";
import { useContext, useState } from "react";
import { TabContext } from "../context/TabContext";
import { UserContext } from "../context/UserContext";
import { userApi } from "../api/user.api";
import { clearAccessToken } from "../service/tokenService";
import { generateGuestName } from "../service/guestService";
import { useNavigate } from "react-router-dom";

const Header = () =>{
    const {currentTab} = useContext(TabContext);
    const { user, setUser } = useContext(UserContext);
    const nav = useNavigate();
    const changeTab = (tab) =>{
        nav(`/${tab}`);
    }
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };
    const handleLogout = async () => {
        try {
            const response = await userApi.logout();
            console.log("Logout response:", response);
            clearAccessToken();
            setUser({
                role: "GUEST",
                fullName: generateGuestName(),
            });
            nav("/");
        } catch (error) {
            console.error("Logout error:", error);
            alert("Lỗi không xác định. Vui lòng thử lại sau.");
        }
    };
    return (
        <div className="header">
            <img src={logo} className="logo-image" alt="Photocopy"></img>
            <div className="header-buttons">
                <button className={`header-button ${currentTab === ''?'active':''}`} onClick={()=>changeTab("")}>Trang chủ</button>
                <button className={`header-button ${currentTab === 'services'?'active':''}`} onClick={()=>changeTab("services")}>Dịch vụ</button>
                <button className={`header-button ${currentTab === 'products'?'active':''}`} onClick={()=>changeTab("products")}>Sản phẩm</button>
                <button className={`header-button ${currentTab === 'contact'?'active':''}`} onClick={()=>changeTab("contact")}>Liên hệ</button>

                {user && user.role !== "GUEST" && (
                    <button className={`header-button ${currentTab === 'orders'?'active':''}`} onClick={()=>changeTab("orders")}>Đơn hàng</button>
                )}

                {user && user.role !== "GUEST" ? (
                    <>
                    {user.role !== "ADMIN" && user.role !== "STAFF" && (
                        <button className="header-cart-button" onClick={()=>nav("/cart")}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M240-80q-33 0-56.5-23.5T160-160v-480q0-33 23.5-56.5T240-720h80q0-66 47-113t113-47q66 0 113 47t47 113h80q33 0 56.5 23.5T800-640v480q0 33-23.5 56.5T720-80H240Zm160-640h160q0-33-23.5-56.5T480-800q-33 0-56.5 23.5T400-720Zm228.5 188.5Q640-543 640-560v-80h-80v80q0 17 11.5 28.5T600-520q17 0 28.5-11.5Zm-240 0Q400-543 400-560v-80h-80v80q0 17 11.5 28.5T360-520q17 0 28.5-11.5Z"/></svg>                    
                            {user && user.cartItemCount > 0 && <span className="cart-badge">{user.cartItemCount}</span>}
                        </button>
                    )}
                     
                     <button className="header-notification-button" onClick={()=>nav("/notifications")} aria-label="Notifications">
                         <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M12 2C10.895 2 10 2.895 10 4V5.07C7.163 6.165 5 8.993 5 12V17L3 19V20H21V19L19 17V12C19 8.993 16.837 6.165 14 5.07V4C14 2.895 13.105 2 12 2ZM12 22C13.105 22 14 21.105 14 20H10c0 1.105.895 2 2 2Z"/></svg>
                         <span className="notification-sign"></span>
                     </button>

                     <button className="header-profile-button" onClick={toggleDropdown}><svg xmlns="http://www.w3.org/2000/svg" height="50px" viewBox="0 -960 960 960" width="50px" fill="#000000"><path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm146.5-204.5Q340-521 340-580t40.5-99.5Q421-720 480-720t99.5 40.5Q620-639 620-580t-40.5 99.5Q539-440 480-440t-99.5-40.5ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/></svg></button>
                    {isDropdownOpen && (
                        <div className="header-profile-dropdown">
                            {user.role === "ADMIN" && <button className="header-profile-dropdown-button" onClick={()=>nav("/admin")}>Quản lý</button>}
                            {user.role !== "ADMIN" && user.role !== "STAFF" && (
                                <button className="header-profile-dropdown-button" onClick={()=>nav("/profile")}>Hồ sơ</button>
                            )}
                               <button className="header-profile-dropdown-button logout" onClick={handleLogout}>Đăng xuất</button>
                       </div>
                    )}
                    </>
                ) : (
                    <>
                        <button className="header-login-button" onClick={()=>nav("/login")}>Đăng nhập</button>
                        <button className="header-signup-button" onClick={()=>nav("/signup")}>Đăng ký</button>
                    </>
                )}
            </div>
        </div>
    )
}
export default Header;