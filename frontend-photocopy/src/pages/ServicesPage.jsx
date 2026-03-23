import { useContext, useEffect, useState } from "react";
import { TabContext } from "../context/TabContext";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import "../styles/servicespage.css";
import ordersApi from "../api/orders.api";

const ServicesPage = () =>{
    const { setCurrentTab } = useContext(TabContext);
    useEffect(()=>{
        setCurrentTab("services");
    },[setCurrentTab])

    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);
    const [orderType, setOrderType] = useState("PICKUP");
    const [paymentOption, setPaymentOption] = useState("CASH");
    const [address, setAddress] = useState(user && user.address ? user.address : "");
    const [isSending, setIsSending] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!description.trim()){
            setError("Vui lòng mô tả yêu cầu.");
            return;
        }
        if(orderType === "DELIVERY" && !address.trim()){
            setError("Vui lòng nhập địa chỉ nhận hàng.");
            return;
        }
        setIsSending(true);
        setError(null);
        try{
            const formData = new FormData();
            formData.append("serviceDescription", description);
            formData.append("orderType", orderType);
            formData.append("paymentOption", paymentOption);
            formData.append("totalAmount", 0);
            formData.append("discount", 0);
            if(orderType === "DELIVERY") {
                formData.append("address", address);
            }else{
                formData.append("address", "Nhận tại cửa hàng");
            }
            if(file) formData.append("serviceFile", file);
            await ordersApi.createServiceOrder(formData);
            setShowModal(true);
            setDescription("");
            setFile(null);
            setOrderType("PICKUP");
            setPaymentOption("CASH");
            setAddress(user && user.address ? user.address : "");
        }catch(err){
            console.error(err);
            setError("Không thể gửi yêu cầu. Vui lòng thử lại sau.");
        }finally{
            setIsSending(false);
        }
    }

    const formatBytes = (bytes) => {
        if (!bytes) return "";
        const sizes = ["B","KB","MB","GB","TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    };

    return (
        <div className="services-container">
            <div className="services-header">
                <h1>Dịch vụ</h1>
                <p className="services-lead">Bạn có yêu cầu liên quan đến in ấn, văn phòng, thiết kế, hoặc máy in? Hãy gửi yêu cầu cho chúng tôi ở form bên dưới.</p>
            </div>

            {user && user.role === "USER" ? (
                <form className="services-form" onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="form-group">
                        <label className="form-label">Mô tả yêu cầu</label>
                        <textarea
                            className="form-textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Hãy ghi rõ yêu cầu của bạn vào đây, ghi càng cụ thể càng tốt"
                            rows={6}
                        />
                        <small className="form-helper">Hãy kiểm tra lại thông tin trước khi gửi.</small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Hình thức xử lý</label>
                        <div className="radio-group">
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="orderType"
                                    value="PICKUP"
                                    checked={orderType === "PICKUP"}
                                    onChange={() => setOrderType("PICKUP")}
                                />
                                Trực tiếp tại cửa hàng
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="orderType"
                                    value="DELIVERY"
                                    checked={orderType === "DELIVERY"}
                                    onChange={() => setOrderType("DELIVERY")}
                                />
                                Đến tận nơi
                            </label>
                        </div>
                    </div>

                    {orderType === "DELIVERY" && (
                        <div className="form-group">
                            <label className="form-label">Địa chỉ nhận hàng</label>
                            <input
                                type="text"
                                className="form-input"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Nhập địa chỉ nhận hàng"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Phương thức thanh toán</label>
                        <div className="radio-group">
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="paymentOption"
                                    value="CASH"
                                    checked={paymentOption === "CASH"}
                                    onChange={() => setPaymentOption("CASH")}
                                />
                                Tiền mặt
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="paymentOption"
                                    value="BANK_TRANSFER"
                                    checked={paymentOption === "BANK_TRANSFER"}
                                    onChange={() => setPaymentOption("BANK_TRANSFER")}
                                />
                                Chuyển khoản
                            </label>
                        </div>
                    </div>

                    <div className="form-group file-group">
                        <label className="file-button">
                            <input type="file" onChange={handleFileChange} className="file-input" />
                            <span>Đính kèm file</span>
                        </label>
                        <div className="file-meta">{file ? `${file.name} • ${formatBytes(file.size)}` : "Chưa có file được chọn"}</div>
                        {file && <button type="button" className="remove-file" onClick={() => setFile(null)}>Xóa</button>}
                    </div>

                    {error && <div className="form-error">{error}</div>}

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={isSending}>{isSending ? "Đang gửi..." : "Gửi yêu cầu"}</button>
                    </div>
                </form>
            ) : (
                <div className="guest-cta">
                    <p>Vui lòng đăng nhập để gửi yêu cầu dịch vụ.</p>
                    <button className="btn" onClick={() => navigate("/login")}>Đăng nhập</button>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="modal-icon">✓</div>
                        <h2>Yêu cầu đã được tạo</h2>
                        <p>Yêu cầu của bạn đã được gửi thành công. Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.</p>
                        <div className="modal-actions">
                            <button className="btn" onClick={() => setShowModal(false)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
export default ServicesPage;