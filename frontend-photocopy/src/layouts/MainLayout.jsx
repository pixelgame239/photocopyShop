import { Outlet } from "react-router-dom"
import Header from "../components/Header"
import Footer from "../components/Footer"
import BubbleChat from "../components/BubbleChat"
import ChatBox from "../components/BubbleChat"

const MainLayout = () =>{
    return(
        <div>
            <Header></Header>
            <main>
                <Outlet></Outlet>
            </main>
            <BubbleChat></BubbleChat>
            <Footer></Footer>
        </div>
    )
}
export default MainLayout;