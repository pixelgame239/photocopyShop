import { useContext, useEffect } from "react";
import { TabContext } from "../context/TabContext";

const HomePage = () =>{
    const { setCurrentTab } = useContext(TabContext);
    useEffect(()=>{
        setCurrentTab("");
    },[])
    return <div>

    </div>
}
export default HomePage;