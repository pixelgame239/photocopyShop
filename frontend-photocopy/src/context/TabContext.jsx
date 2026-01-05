import { createContext, useState } from "react";

export const TabContext = createContext();

export const TabProvider = ({children}) =>{
    const [currentTab, setCurrentTab] = useState("");
    return (
        <TabContext.Provider value={{ currentTab, setCurrentTab }}>
            {children}
        </TabContext.Provider>
    )
}