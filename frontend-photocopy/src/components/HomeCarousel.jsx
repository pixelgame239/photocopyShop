import photocopy from "../assets/photocopy.jpg";
import inmau from "../assets/inmau.png";
import anhthe from "../assets/anhthe.jpg";
import hashtag from "../assets/hashtag.jpg";
import tapchi from "../assets/tapchi.jpg";
import thietke from "../assets/thietke.jpg";
import suamayin from "../assets/suamayin.jpg";
import soanthao from "../assets/soanthao.png";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css'; // core Swiper
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import "../styles/homepage.css";
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useState } from "react";

const carouselItems = [
    { image: photocopy, label: "Photocopy, Scan tài liệu" },
    { image: inmau, label: "In màu - trắng đen" },
    { image: anhthe, label: "Chụp ảnh thẻ" },
    { image: hashtag, label: "Làm Hashtag, dán Formex"},
    { image: tapchi, label: "In tạp chí"},
    { image: thietke, label: "Thiết kế"},
    { image: suamayin, label: "Sửa máy in"},
    { image: soanthao, label: "Soạn thảo văn bản"}
]

const HomeCarousel = () => {
    const [carouselIndex, setCarouselIndex] = useState(0);
  return (
    <div>
        <div style={{display:"flex", justifyContent:"center" }}><p style={{fontWeight:"bold", color:"white", background:"rgb(40, 144, 255)", padding:"15px", border:"none", borderRadius:"20px"}}>Dịch vụ tại cửa hàng</p></div>
        <div style={{display:"flex", justifyContent:"center", alignItems:"center"}}>
            <div style={{width:"60%", textAlign:"center"}}>
                <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={30}
                slidesPerView={1}
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000 }}
                loop={true}
                onSlideChange={(swiper) => setCarouselIndex(swiper.realIndex)}
                >
                {carouselItems.map((item, index) => (
                <SwiperSlide key={index}>
                <img className="carousel-image" src={item.image} alt={item.label}/>
                <p className="carousel-name">{item.label}</p>
                </SwiperSlide>
            ))}
                </Swiper>
            </div>
        </div>
    </div>
  );
};

export default HomeCarousel;