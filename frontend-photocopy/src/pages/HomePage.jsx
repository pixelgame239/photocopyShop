import { useContext, useEffect } from "react";
import { TabContext } from "../context/TabContext";
import HomeBanner from "../components/HomeBanner";
import HighlightSession from "../components/HighlightSession";
import HomeCarousel from "../components/HomeCarousel";

const HomePage = () =>{
    const { setCurrentTab } = useContext(TabContext);
    useEffect(()=>{
        setCurrentTab("");
    },[])
    return <div>
        <HomeBanner></HomeBanner>
        <HighlightSession></HighlightSession>
        <HomeCarousel></HomeCarousel>
    </div>
}
export default HomePage;