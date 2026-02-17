import {  createContext, useState, useEffect } from "react";
import { setAccessToken, clearAccessToken } from "../service/tokenService";
import { userApi } from "../api/user.api";
import { generateGuestName } from "../service/guestService";

export const UserContext = createContext();

export const UserProvider = ({children}) =>{
    const [user, setUser] = useState(null);
    useEffect(() =>{
        const initUser = async () =>{
            try {
                const response = await userApi.refreshToken();
                console.log("User data from refresh:", response);
                if (response.data && response.data.accessToken) {
                    setAccessToken(response.data.accessToken);
                    setUser(response.data.userData);
                } else {
                    setUser({
                        role: "GUEST",
                        fullName: generateGuestName(),
                    });
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setUser({
                    role: "GUEST",
                    fullName: generateGuestName(),
                });
            }
        };
        initUser();
        console.log("After setting user:", user);
    }, []);
    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    )
}