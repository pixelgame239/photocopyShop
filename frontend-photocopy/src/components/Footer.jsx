import "../styles/footer.css";

const Footer = () => {
  return (
    <div className="footer-container">
      <div className="logo-container information-area">
        <a
          className="title"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          Photocopy Shop
        </a>
        <div className="information">
          <p>📌 Address: Nam Tu Liem, Ha Noi</p>
          <p>📞Phone number: 0111 111 111</p>
          <div className="social-media">
            <a href="https://zalo.me/" target="_blank" rel="noreferrer">
              <div className="zalo-icon"></div>
            </a>
            <a
              href="mailto:example@gmail.com"
              target="_blank"
              rel="noreferrer"
            >
              <div className="gmail-icon"></div>
            </a>
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
            >
              <div className="facebook-icon"></div>
            </a>
          </div>
        </div>
      </div>
      <div className="map-area">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d59589.94425878166!2d105.76228689999999!3d21.0178157!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313454a1080e72f3%3A0xb08bae358d43e397!2zTmFtIFThu6sgTGnDqm0sIEhhbm9p!5e0!3m2!1sen!2s!4v1768059779990!5m2!1sen!2s"
          title="Google Map"
          style={{ border: 0, width: "400px", height: "180px" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
};

export default Footer;