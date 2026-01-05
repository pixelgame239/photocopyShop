import { useContext, useEffect } from "react";
import { TabContext } from "../context/TabContext";

const ServicesPage = () =>{
    const { setCurrentTab } = useContext(TabContext);
        useEffect(()=>{
            setCurrentTab("services");
    },[])
    return(
        <div></div>
    )
}
export default ServicesPage;