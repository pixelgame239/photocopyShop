import '../styles/contactpage.css';
import zaloLogo from '../assets/zaloLogo.png';
import gmailLogo from '../assets/gmailLogo.png';

const services = [
  {
    id: 'design',
    title: 'Thiết kế',
    phone: '0901234567',
    email: 'thietke@photocopyshop.com',
    zalo: '0901234567',
  },
  {
    id: 'repair',
    title: 'Sửa máy in',
    phone: '0902345678',
    email: 'suamayin@photocopyshop.com',
    zalo: '0902345678',
  },
  {
    id: 'photocopy-other',
    title: 'Photocopy & Dịch vụ khác',
    phone: '0903456789',
    email: 'photocopy@photocopyshop.com',
    zalo: '0903456789',
  },
];

const ContactPage = () => {
  return (
    <div className="contact-page">
      <h1>Liên hệ</h1>
      <p className="contact-intro">Chọn dịch vụ và liên hệ với chúng tôi qua điện thoại, email hoặc Zalo.</p>

      <div className="services-grid">
        {services.map((svc) => (
          <div key={svc.id} className="service-card">
            <h2 className="service-title">{svc.title}</h2>
            <div className="contact-buttons">
              <a className="btn phone" href={`tel:${svc.phone}`} aria-label={`Gọi ${svc.title}`}>
                <span className="btn-icon">📞</span>
                <span className="btn-text">Gọi</span>
              </a>
              <a className="btn mail" href={`mailto:${svc.email}`} aria-label={`Gửi email ${svc.title}`}>
                <img src={gmailLogo} alt="Gmail" className="btn-logo" />
                <span className="btn-text">Email</span>
              </a>
              <a
                className="btn zalo"
                href={`https://zalo.me/${svc.zalo}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Nhắn Zalo ${svc.title}`}
              >
                <img src={zaloLogo} alt="Zalo" className="btn-logo" />
                <span className="btn-text">Zalo</span>
              </a>
            </div>

            <div className="contact-info">
              <div>SĐT: {formatPhone(svc.phone)}</div>
              <div>Email: {svc.email}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="map-embed">
        <h2>Địa điểm của chúng tôi</h2>
        <div className="map-container">
          <iframe
            title="Google Maps - Photocopy Shop"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.5726484704014!2d105.51599477423869!3d21.00976098843278!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31345beffa9943f5%3A0x4f8fa7a9b2a5d1a5!2zxJDhu6ljIEzDom0gUGhvdG9jb3B5IEluIE3DoHU!5e0!3m2!1svi!2s!4v1773909672831!5m2!1svi!2s"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
};

function formatPhone(p) {
  if (!p) return '';
  const clean = p.replace(/\D/g, '');
  if (clean.length === 10) return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
  return p;
}

export default ContactPage;