import { useContext, useEffect } from "react";
import { TabContext } from "../context/TabContext";
import HomeBanner from "../components/HomeBanner";

const HomePage = () =>{
    const { setCurrentTab } = useContext(TabContext);
    useEffect(()=>{
        setCurrentTab("");
    },[])
    return <div>
        <HomeBanner></HomeBanner>
    </div>
}
export default HomePage;