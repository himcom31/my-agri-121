import { useState } from "react";

const sections = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    content: `By accessing or using Maharashtra Bazaar's website, mobile application, or any of our services, you confirm that you have read, understood, and agree to be bound by these Terms & Conditions. If you do not agree, please discontinue use of our platform immediately.

These terms apply to all visitors, users, and customers of Maharashtra Bazaar. We reserve the right to update these terms at any time, and continued use of the platform constitutes acceptance of any revised terms.`,
  },
  {
    id: "about",
    title: "About Maharashtra Bazaar",
    content: `Maharashtra Bazaar (MAHARASHTRA BAZAAR I APPS) is an online software services and e-commerce platform operated by Rahul Ravsaheb Gavli under Proprietorship, registered under MSME (Udyam Registration No. UDYAM-MH-13-0063481) and GST (GSTIN: 27CCDPG7095N2ZZ).

Our mission is to support local vendors, farmers, and small businesses across Maharashtra by connecting them with customers seeking quality products and services delivered to their doorstep. Maharashtra Bazaar operates as an e-commerce marketplace facilitating transactions between buyers and registered sellers.`,
  },
  {
    id: "eligibility",
    title: "Eligibility & Account",
    content: `To use Maharashtra Bazaar, you must be at least 18 years of age or have parental/guardian consent. By creating an account, you represent that all information provided is accurate, current, and complete.

You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. Maharashtra Bazaar shall not be liable for any losses arising from unauthorized account access due to your failure to safeguard login information.`,
  },
  {
    id: "orders",
    title: "Orders & Payments",
    content: `All orders placed on Maharashtra Bazaar are subject to availability and confirmation. We reserve the right to cancel or refuse any order at our discretion, including cases of suspected fraud, inaccurate product information, or pricing errors.

Payments must be made through our supported payment methods including UPI, credit/debit cards, net banking, and cash on delivery (where available). Prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.`,
  },
  {
    id: "delivery",
    title: "Delivery Policy",
    content: `Maharashtra Bazaar strives to deliver your orders within the estimated timeframe shown at checkout. Delivery timelines may vary based on your location, product availability, and external factors such as weather or public holidays.

We currently serve select areas across Maharashtra, with primary operations in the Jalna and Ambad districts. Delivery charges, if applicable, will be clearly displayed before order confirmation. Risk of loss and title for products pass to you upon delivery.`,
  },
  {
    id: "returns",
    title: "Returns & Refunds",
    content: `We want you to be satisfied with every purchase. If you receive a damaged, defective, or incorrect item, please report it within 24 hours of delivery through our app or customer support.

Perishable items (fresh produce, dairy, etc.) are not eligible for return unless they arrive in a damaged or spoiled condition. Refunds, where approved, will be processed to the original payment method within 5–7 business days.`,
  },
  {
    id: "prohibited",
    title: "Prohibited Activities",
    content: `Users must not engage in any activity that disrupts, damages, or impairs the platform. This includes but is not limited to: placing fraudulent orders, scraping or harvesting data without authorization, impersonating other users or Maharashtra Bazaar staff, uploading malicious content, or attempting to gain unauthorized access to our systems.

Violation of these prohibitions may result in immediate account suspension and legal action where applicable under Indian law.`,
  },
  {
    id: "ip",
    title: "Intellectual Property",
    content: `All content on the Maharashtra Bazaar platform — including logos, text, images, graphics, and software — is the exclusive property of Maharashtra Bazaar I Apps or its licensors and is protected under applicable intellectual property laws of India.

You may not reproduce, distribute, modify, or create derivative works from any content on our platform without prior written permission from Maharashtra Bazaar.`,
  },
  {
    id: "privacy",
    title: "Privacy & Data",
    content: `Your privacy matters to us. Maharashtra Bazaar collects and processes personal data in accordance with our Privacy Policy and the Information Technology Act, 2000. By using our platform, you consent to the collection and use of your data as described therein.

We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    content: `To the maximum extent permitted by law, Maharashtra Bazaar shall not be liable for any indirect, incidental, special, or consequential damages arising out of your use of or inability to use our platform or services.

Our total liability for any claim arising in connection with these terms shall not exceed the amount paid by you for the specific order giving rise to the claim.`,
  },
  {
    id: "governing",
    title: "Governing Law",
    content: `These Terms & Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts located in Jalna, Maharashtra.

If any provision of these terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.`,
  },
  {
    id: "contact",
    title: "Contact Us",
    content: `If you have any questions, concerns, or feedback regarding these Terms & Conditions, please reach out to us:

Email: rahul.gawali1414@gmail.com
Phone: +91 75071 92415
Address: Gawali Niwas, Kajat Bhaigav Road, Karjat, Ambad, Jalna – 431204, Maharashtra, India
Support Hours: Monday – Saturday, 9:00 AM – 8:00 PM IST
GSTIN: 27CCDPG7095N2ZZ
Udyam No: UDYAM-MH-13-0063481
Shop & Establishment Act No: 2641900321436376`,
  },
];

export default function TermsAndConditions() {
  const [activeId, setActiveId] = useState("acceptance");

  const handleScroll = (id) => {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const heroGradient = {
    background: "linear-gradient(135deg, #b84a00 0%, #E8690A 45%, #f4a22a 100%)",
    position: "relative",
    overflow: "hidden",
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Hind:wght@400;500;600&display=swap');
        .mb-font { font-family: 'Hind', sans-serif; }
        .mb-display { font-family: 'Baloo 2', cursive; }

        .hero-overlay::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 10% 80%, rgba(0,0,0,0.08) 0%, transparent 50%);
          pointer-events: none;
        }

        .mb-pill {
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.35);
          backdrop-filter: blur(4px);
        }

        .watermark {
          position: absolute;
          font-family: 'Baloo 2', cursive;
          font-weight: 900;
          color: rgba(255,255,255,0.07);
          line-height: 1;
          user-select: none;
          pointer-events: none;
        }

        .trust-strip {
          background: #1a1a2e;
          display: flex;
          flex-wrap: wrap;
        }
        .trust-item {
          flex: 1; min-width: 140px;
          display: flex; align-items: center; gap: 10px;
          padding: 13px 18px;
          border-right: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.78);
          font-size: 12px;
          font-family: 'Hind', sans-serif;
        }
        .trust-item:last-child { border-right: none; }
        .trust-item strong { color: #fff; display: block; font-size: 13px; }

        .sidebar-btn-active {
          background: #FFF4EB;
          color: #E8690A;
          font-weight: 700;
        }
        .sidebar-btn-inactive { color: #6b7280; }
        .sidebar-btn-inactive:hover {
          background: #FFF4EB;
          color: #E8690A;
        }

        .legal-strip {
          background: #fff;
          border: 1px solid #ece8e1;
          border-radius: 12px;
          padding: 13px 18px;
          display: flex; flex-wrap: wrap; gap: 8px 20px;
          align-items: center;
          margin-bottom: 20px;
        }
        .legal-chip {
          font-size: 12px; color: #6b6b6b;
          font-family: 'Hind', sans-serif;
          display: flex; align-items: center; gap: 4px;
        }
        .legal-chip strong { color: #1e1e1e; }

        .section-card {
          background: #fff;
          border-radius: 16px;
          border: 1.5px solid #ece8e1;
          overflow: hidden;
          transition: box-shadow 0.2s;
        }
        .section-card:hover { box-shadow: 0 6px 24px rgba(232,105,10,0.09); }
      `}</style>

      {/* ── HERO ── */}
      <div className="w-full py-16 px-6 hero-overlay mb-display" style={heroGradient}>
        <span className="watermark" style={{ left: "24px", top: "50%", transform: "translateY(-50%)", fontSize: "8rem" }}>MB</span>
        <span className="watermark" style={{ right: "20px", bottom: "-16px", fontSize: "6rem" }}>☸</span>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Pill */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 mb-pill">
            <span>🛒</span>
            <span className="text-xs font-semibold tracking-wide text-white" style={{ fontFamily: "'Hind', sans-serif" }}>
              Maharashtra Bazaar &nbsp;·&nbsp; UDYAM-MH-13-0063481
            </span>
          </div>

          <h1 className="text-white mb-4" style={{ fontFamily: "'Baloo 2', cursive", fontSize: "clamp(2.1rem,5vw,3.5rem)", fontWeight: 800, lineHeight: 1.12 }}>
            Terms &amp;{" "}
            <span style={{ color: "#fde68a" }}>Conditions</span>
          </h1>
          <p className="max-w-lg mx-auto leading-relaxed mb-8" style={{ fontFamily: "'Hind', sans-serif", fontSize: "1rem", color: "rgba(255,255,255,0.87)" }}>
            Please read these terms carefully before using our platform. By continuing, you agree to the following.
          </p>

          <div className="flex flex-wrap justify-center gap-5 mb-font" style={{ color: "rgba(255,255,255,0.72)", fontSize: "12.5px" }}>
            <span>📅 Effective: 15 August 2026</span>
            <span className="opacity-40">|</span>
            <span>📅 Last Updated: 2026</span>
            <span className="opacity-40">|</span>
            <span>📄 Version 1.0</span>
            <span className="opacity-40">|</span>
            <span>🏛️ GSTIN: 27CCDPG7095N2ZZ</span>
          </div>
        </div>
      </div>

      {/* ── TRUST STRIP ── */}
      <div className="trust-strip">
        {[
          { icon: "⚖️", title: "IT Act 2000", sub: "Governed by Indian law" },
          { icon: "🏛️", title: "MSME Registered", sub: "Udyam-MH-13-0063481" },
          { icon: "🔒", title: "Secure Platform", sub: "SSL/TLS encrypted" },
          { icon: "🤝", title: "Fair Trade", sub: "Transparent policies" },
        ].map((t) => (
          <div className="trust-item" key={t.title}>
            <span style={{ fontSize: "18px" }}>{t.icon}</span>
            <div><strong>{t.title}</strong>{t.sub}</div>
          </div>
        ))}
      </div>

      {/* ── BODY ── */}
      <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col lg:flex-row gap-8">

        {/* ── SIDEBAR ── */}
        <aside className="lg:w-60 shrink-0">
          <div className="lg:sticky lg:top-6 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            {/* Sidebar header */}
            <div className="px-4 py-3" style={{ background: "linear-gradient(135deg, #b84a00 0%, #E8690A 60%, #f4a22a 100%)" }}>
              <p className="text-xs font-bold tracking-widest uppercase text-white" style={{ fontFamily: "'Hind', sans-serif" }}>
                Table of Contents
              </p>
            </div>
            {/* Links */}
            <div className="bg-white p-2">
              {sections.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => handleScroll(s.id)}
                  className={`w-full text-left rounded-lg px-3 py-2 mb-0.5 text-xs leading-snug transition-colors ${
                    activeId === s.id ? "sidebar-btn-active" : "sidebar-btn-inactive"
                  }`}
                  style={{ fontFamily: "'Hind', sans-serif" }}
                >
                  {i + 1}. {s.title}
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar contact */}
          <div className="mt-4 rounded-xl p-4" style={{ background: "#FFF4EB", border: "1px solid #fbd7b5" }}>
            <p style={{ fontFamily: "'Hind', sans-serif", fontSize: "12px", color: "#7c4010", lineHeight: 1.65 }}>
              <strong style={{ display: "block", marginBottom: "4px", fontSize: "12.5px" }}>Need help?</strong>
              <a href="mailto:rahul.gawali1414@gmail.com" style={{ color: "#E8690A", fontWeight: 600, textDecoration: "none" }}>rahul.gawali1414@gmail.com</a><br />
              <a href="tel:+917507192415" style={{ color: "#E8690A", fontWeight: 600, textDecoration: "none" }}>+91 75071 92415</a><br />
              Mon–Sat, 9:00–20:00
            </p>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="flex-1 min-w-0">

          {/* Legal strip */}
          <div className="legal-strip">
            <div className="legal-chip">🏢 <strong>MAHARASHTRA BAZAAR I APPS</strong></div>
            <div className="legal-chip">👤 <strong>Rahul Ravsaheb Gavli</strong></div>
            <div className="legal-chip">📍 Karjat, Ambad, Jalna – 431204, MH</div>
            <div className="legal-chip">📋 Shop Act: <strong>2641900321436376</strong></div>
          </div>

          {/* Warning banner */}
          <div className="rounded-2xl p-4 mb-6 flex gap-3" style={{ backgroundColor: "#fff8f0", border: "1px solid #fbd7b5" }}>
            <span style={{ fontSize: "20px", flexShrink: 0, marginTop: "2px" }}>⚠️</span>
            <p style={{ fontFamily: "'Hind', sans-serif", fontSize: "13.5px", lineHeight: 1.7, color: "#7c4010" }}>
              These Terms &amp; Conditions govern your use of Maharashtra Bazaar's platform. By placing an order or creating an account, you legally agree to these terms. Questions? Email{" "}
              <strong>rahul.gawali1414@gmail.com</strong>
            </p>
          </div>

          {/* ── SECTIONS ── */}
          <div className="space-y-4">
            {sections.map((section, index) => (
              <div
                key={section.id}
                id={section.id}
                className="section-card scroll-mt-6"
              >
                {/* Card header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
                    style={{ background: "linear-gradient(135deg, #E8690A, #f4a22a)", fontFamily: "'Baloo 2', cursive" }}
                  >
                    {index + 1}
                  </span>
                  <h2 style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 700, fontSize: "1.05rem", color: "#1a1a2e" }}>
                    {section.title}
                  </h2>
                </div>

                {/* Card body */}
                <div className="px-5 py-4">
                  {section.content.split("\n\n").map((para, i) => (
                    <p
                      key={i}
                      className="mb-3 last:mb-0 whitespace-pre-line"
                      style={{ fontFamily: "'Hind', sans-serif", fontSize: "14px", color: "#555", lineHeight: 1.78 }}
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── FOOTER CTA ── */}
          <div
            className="mt-10 rounded-2xl p-8 text-center hero-overlay"
            style={heroGradient}
          >
            <span className="watermark" style={{ right: "20px", bottom: "-10px", fontSize: "5rem" }}>MB</span>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 mb-pill">
                <span>🧡</span>
                <span className="text-xs font-semibold tracking-wide text-white" style={{ fontFamily: "'Hind', sans-serif" }}>
                  Maharashtra Bazaar Promise
                </span>
              </div>

              <h3 style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: "1.7rem", color: "#fff", marginBottom: "8px" }}>
                You're in{" "}
                <span style={{ color: "#fde68a" }}>good hands</span>
              </h3>
              <p style={{ fontFamily: "'Hind', sans-serif", fontSize: "14px", color: "rgba(255,255,255,0.87)", maxWidth: "440px", margin: "0 auto 22px", lineHeight: 1.7 }}>
                By using Maharashtra Bazaar, you trust us with your needs. We promise to uphold quality, transparency, and fairness in everything we do — rooted in Maharashtra's values.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href="mailto:rahul.gawali1414@gmail.com"
                  className="bg-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors hover:bg-yellow-50"
                  style={{ fontFamily: "'Hind', sans-serif", color: "#E8690A" }}
                >
                  📧 rahul.gawali1414@gmail.com
                </a>
                <a
                  href="tel:+917507192415"
                  className="border text-white font-semibold text-sm px-5 py-2.5 rounded-xl"
                  style={{ fontFamily: "'Hind', sans-serif", borderColor: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}
                >
                  📞 +91 75071 92415
                </a>
                <a
                  href="#"
                  className="font-semibold text-sm px-5 py-2.5 rounded-xl text-white"
                  style={{ fontFamily: "'Hind', sans-serif", background: "#138808" }}
                >
                  🛒 Maharashtra Bazaar
                </a>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}