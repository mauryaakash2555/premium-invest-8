"use client";

export default function Page() {
  return (
    <div>
      <section style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '100px', background: 'linear-gradient(180deg, #000 0%, #0a0a0a 100%)' }}>
        <div className="section-container" style={{ textAlign: 'center' }}>
          <h1 className="golden-gradient" style={{ fontSize: 'clamp(28px, 4vw, 56px)', marginBottom: '24px' }}>Portfolio Management</h1>
          <p style={{ fontSize: '18px', color: '#C0A062', maxWidth: '700px', margin: '0 auto' }}>
            Premium financial services tailored to your needs
          </p>
        </div>
      </section>

      <section className="section-container">
        <div className="glass-effect" style={{ padding: '60px 40px', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: '#CCCCCC', lineHeight: 1.8 }}>
            Content for Portfolio Management page. Contact us for more information.
          </p>
          <a href="https://wa.me/918850977259" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ marginTop: '30px', display: 'inline-block' }}>
            Contact Us on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
