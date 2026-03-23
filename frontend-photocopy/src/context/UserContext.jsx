import {  createContext, useState, useEffect, useRef } from "react";
import { setAccessToken, clearAccessToken } from "../service/tokenService";
import { userApi } from "../api/user.api";
import { generateGuestName } from "../service/guestService";
import chatApi from "../api/chat.api";
import { toast } from "react-toastify";
import { connectWebSocket, disconnectWebSocket } from "../service/websocket";
import ordersApi from "../api/orders.api";

export const UserContext = createContext();

export const UserProvider = ({children}) =>{
    const [user, setUser] = useState(null);
    const [unreadChat, setUnreadChat] = useState(false);
    const [boxChats, setBoxChats] = useState([]);
    const [currentChatMessages, setCurrentChatMessages] = useState([]);
    const [incomingMessages, setIncomingMessages] = useState([]);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [unreadOrder, setUnreadOrder] = useState(false);
    const [currentOrders, setCurrentOrders] = useState([]);
    const boxChatsRef = useRef(boxChats);
    useEffect(() => {
        boxChatsRef.current = boxChats;
    }, [boxChats]);
    const fetchStaffBoxChat = async () => {
            try {
                const response = await chatApi.getStaffBoxChat();
                const boxChats = response.data;
                const hasUnread = boxChats.some(chat => chat && chat.staffRead === false);
                setUnreadChat(hasUnread);
                setBoxChats(boxChats);
                console.log("Fetched staff box chats:", boxChats);
            } catch (error) {
                console.error("Error:", error);
            }
        };
    const fetchUserBoxChat = async () => {
            try {
                const response = await chatApi.getUserBoxChat(user.fullName);
                console.log("Fetched user box chat status:", response);
                setUnreadChat(response.data);
            } catch (error) {
                console.error("Error:", error);
            }
        };
    useEffect(() =>{
        const initUser = async () =>{
            try {
                const response = await userApi.refreshToken();
                console.log("User data from refresh:", response);
                if (response.data && response.data.accessToken) {
                    setAccessToken(response.data.accessToken);
                    setUser(response.data.userData);
                    setCartItemCount(response.data.userData.cartItemCount || 0);
                } else {
                    if (!localStorage.getItem("userData")) {
                        localStorage.setItem("userData", JSON.stringify({
                            role: "GUEST",
                            fullName: generateGuestName(),
                        }));
                    }
                    setUser(JSON.parse(localStorage.getItem("userData")));
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                if (!localStorage.getItem("userData")) {
                    localStorage.setItem("userData", JSON.stringify({
                        role: "GUEST",
                        fullName: generateGuestName(),
                    }));
                }                
                setUser(JSON.parse(localStorage.getItem("userData")));
            }
        };
        initUser();
        console.log("After setting user:", user);
    }, []);
    useEffect(() => {
        if(!user) return;
        if (user && (user.role === "STAFF" || user.role === "ADMIN")) {
            fetchStaffBoxChat();
        } else if (user && (user.role === "USER" || user.role === "GUEST")) {
            fetchUserBoxChat();
        }
        if(user && user.role !== "GUEST"){
            try {
                const response = ordersApi.getOrdersStatus();
                setUnreadOrder(response.data);
            } catch (error) {
                console.error("Error fetching orders status:", error);
            }
        }
    }, [user?.role, user?.fullName]);
    useEffect(() => {
        if(user && user.role && user.fullName){
            const isAgent = user.role === "STAFF" || user.role === "ADMIN";
            connectWebSocket((msg) => {
                if (msg.type === "READ_RECEIPT") {
                    setBoxChats((prev) => prev.map((box) => {
                        if (box && box.id === msg.boxChatId) {
                            if (isAgent) {
                                return { ...box, staffRead: true };
                            } else {
                                return { ...box, userRead: true };
                            }
                        }
                        return box;
                    }));
                }
                else{
                    if (isAgent) {
                        const existingBoxIdx = boxChatsRef.current.findIndex(box => box && box.id === msg.boxChatId);                            
                        setBoxChats((prev) =>{
                                if(existingBoxIdx !== -1){
                                    const targetIdx = prev.findIndex(box => box && box.id === msg.boxChatId);
                                    if(targetIdx === -1) return prev;
                                    let updatedBoxes = [...prev];
                                    const targetBox = updatedBoxes[targetIdx];
                                    updatedBoxes.splice(targetIdx, 1);
                                    updatedBoxes.unshift({ ...targetBox, staffRead: msg.sender === "STAFF" ? true : false,
                                    userRead: msg.sender === "STAFF" ? false : true });
                                    return updatedBoxes;
                            }
                            else{
                                fetchStaffBoxChat();
                            }
                        });
                        if(msg.sender !== "STAFF"){
                            setUnreadChat(true);
                        }
                    }
                    else{
                        if(msg.sender === "STAFF"){
                            setUnreadChat(true);
                        }
                    }
                }
                setIncomingMessages((prev) => [...prev, msg]);
            }, 
            (notification) => {
                setUnreadOrder(true);
                if(notification.type === "NEW_ORDER"){
                    const newOrder = {
                        id: notification.orderId,
                        fullName: notification.fullName,
                        orderDate: notification.orderDate,
                        status: notification.status,
                        totalAmount: notification.totalAmount,
                        discount: notification.discount,
                        address: notification.address,
                        orderType: notification.orderType,
                        paymentOption: notification.paymentOption,
                        productOrders: notification.productOrders,
                        serviceOrder: notification.serviceOrder
                    };
                    setCurrentOrders((prev) => [newOrder, ...prev]);
                } else{
                    if(notification.orderId){
                        setCurrentOrders((prev) => prev.map((o) => o.id === notification.orderId ? { ...o, 
                            status: notification.status || o.status, 
                            totalAmount: notification.totalAmount || o.totalAmount,
                            discount: notification.discount || o.discount
                        } : o));
                    }
                }
                toast.info(`${notification.title}: ${notification.message}`,{
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            },
            user);
            return () => {disconnectWebSocket()};
        }
    },[user?.role, user?.fullName]);
    return (
        <UserContext.Provider value={{ user, setUser, unreadChat, setUnreadChat, boxChats, setBoxChats, currentChatMessages, setCurrentChatMessages, fetchStaffBoxChat, fetchUserBoxChat, 
            incomingMessages, setIncomingMessages, setCartItemCount, cartItemCount, unreadOrder, setUnreadOrder, currentOrders, setCurrentOrders
         }}>
            {children}
        </UserContext.Provider>
    )
}