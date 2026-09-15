import { useState } from "react";

const sections = [
  {
    id: "information",
    icon: "🗂️",
    title: "Information We Collect",
    content: [
      {
        subtitle: "Personal Information",
        text: "When you create an account or place an order on Maharashtra Bazaar, we collect your name, email address, phone number, and delivery address to process and fulfill your orders accurately.",
      },
      {
        subtitle: "Usage Data",
        text: "We automatically collect information about how you interact with our platform — including pages visited, items viewed, search queries, and device/browser details — to improve your shopping experience.",
      },
      {
        subtitle: "Payment Information",
        text: "Payment transactions are processed through secure, encrypted third-party gateways. Maharashtra Bazaar does not store your full card details on our servers.",
      },
    ],
  },
  {
    id: "usage",
    icon: "⚙️",
    title: "How We Use Your Information",
    content: [
      {
        subtitle: "Order Processing",
        text: "Your personal data is used to confirm, process, and deliver your orders and to communicate purchase updates to you promptly.",
      },
      {
        subtitle: "Personalization",
        text: "We use your browsing and purchase history to recommend products and offers that match your preferences and local needs across Maharashtra.",
      },
      {
        subtitle: "Service Improvement",
        text: "Aggregate usage data helps us improve our platform, add new features, and ensure a smooth, reliable experience for all customers.",
      },
    ],
  },
  {
    id: "sharing",
    icon: "🤝",
    title: "Information Sharing",
    content: [
      {
        subtitle: "Delivery Partners",
        text: "We share your name, address, and contact number with our delivery partners solely to fulfill your orders. They are not permitted to use this data for any other purpose.",
      },
      {
        subtitle: "No Third-Party Selling",
        text: "Maharashtra Bazaar does not sell, rent, or trade your personal information to any third-party marketers or advertisers — ever.",
      },
      {
        subtitle: "Legal Obligations",
        text: "We may disclose your information if required by Indian law, court order, or to protect the rights and safety of Maharashtra Bazaar, our users, or the public.",
      },
    ],
  },
  {
    id: "security",
    icon: "🔒",
    title: "Data Security",
    content: [
      {
        subtitle: "Encryption",
        text: "All data transmitted between your device and our servers is protected using industry-standard SSL/TLS encryption to prevent unauthorized access.",
      },
      {
        subtitle: "Access Control",
        text: "Only authorized Maharashtra Bazaar personnel have access to your personal data, and only to the extent necessary to perform their duties.",
      },
      {
        subtitle: "Breach Response",
        text: "In the unlikely event of a data breach, we will notify affected users promptly and take immediate steps to mitigate any harm in accordance with the Information Technology Act, 2000.",
      },
    ],
  },
  {
    id: "rights",
    icon: "✋",
    title: "Your Rights",
    content: [
      {
        subtitle: "Access & Correction",
        text: "You have the right to access the personal information we hold about you and to request corrections if any details are inaccurate or incomplete.",
      },
      {
        subtitle: "Deletion",
        text: "You may request deletion of your account and associated data at any time by contacting us at rahul.gawali1414@gmail.com or calling +91 75071 92415.",
      },
      {
        subtitle: "Opt-Out",
        text: "You can opt out of promotional emails and notifications at any time via your account settings or by clicking the unsubscribe link in any marketing email.",
      },
    ],
  },
  {
    id: "cookies",
    icon: "🍪",
    title: "Cookies & Tracking",
    content: [
      {
        subtitle: "Essential Cookies",
        text: "We use essential cookies to keep you logged in and remember your cart. These are required for the platform to function correctly.",
      },
      {
        subtitle: "Analytics Cookies",
        text: "Analytics cookies help us understand how users navigate our site so we can improve performance and usability. You may disable these in your browser settings.",
      },
      {
        subtitle: "Marketing Cookies",
        text: "We may use marketing cookies to show you relevant offers. You can manage your cookie preferences at any time through the cookie settings panel in your account.",
      },
    ],
  },
  {
    id: "children",
    icon: "👶",
    title: "Children's Privacy",
    content: [
      {
        subtitle: "Age Restriction",
        text: "Maharashtra Bazaar is not directed at children under the age of 13. We do not knowingly collect personal information from minors.",
      },
      {
        subtitle: "Parental Action",
        text: "If you believe your child has provided us with personal data, please contact us immediately at rahul.gawali1414@gmail.com and we will delete it from our systems without delay.",
      },
    ],
  },
  {
    id: "updates",
    icon: "📋",
    title: "Policy Updates",
    content: [
      {
        subtitle: "Changes",
        text: "We may update this Privacy Policy from time to time to reflect changes in our practices or applicable Indian laws. The updated policy will be posted on this page with a revised effective date.",
      },
      {
        subtitle: "Notification",
        text: "For significant changes, we will notify registered users via email or a prominent notice on our platform before the changes take effect.",
      },
    ],
  },
];

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState(null);

  return (
    <div className="min-h-screen bg-[#FAFAF7] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Hind:wght@400;500;600&display=swap');

        * { box-sizing: border-box; }
        body { margin: 0; }

        .hero-bg {
          background: linear-gradient(135deg, #b84a00 0%, #E8690A 45%, #f4a22a 100%);
          position: relative;
          overflow: hidden;
        }
        .hero-bg::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 10% 80%, rgba(0,0,0,0.08) 0%, transparent 50%);
        }
        .ashoka-wm {
          position: absolute;
          right: 32px; top: 50%; transform: translateY(-50%);
          font-size: 9rem;
          opacity: 0.07;
          line-height: 1;
          user-select: none;
          pointer-events: none;
        }

        /* Trust strip */
        .trust-strip {
          background: #1a1a2e;
          display: flex;
          flex-wrap: wrap;
        }
        .trust-item {
          flex: 1; min-width: 140px;
          display: flex; align-items: center; gap: 10px;
          padding: 14px 20px;
          border-right: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.8);
          font-size: 12px;
          font-family: 'Hind', sans-serif;
        }
        .trust-item:last-child { border-right: none; }
        .trust-item strong { color: #fff; display: block; font-size: 13px; }

        /* Accordion */
        .section-card {
          transition: box-shadow 0.25s ease, transform 0.2s ease;
          cursor: pointer;
        }
        .section-card:hover {
          box-shadow: 0 8px 32px rgba(232,105,10,0.12);
          transform: translateY(-2px);
        }
        .section-card.active {
          border-color: #E8690A !important;
          box-shadow: 0 8px 32px rgba(232,105,10,0.18);
        }
        .content-reveal {
          animation: slideDown 0.3s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Badge */
        .badge {
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.35);
          color: #ffffff;
          font-family: 'Hind', sans-serif;
          font-weight: 600;
          font-size: 11px;
          letter-spacing: 1px;
        }

        /* Divider */
        .divider {
          background: linear-gradient(to right, #E8690A, #f4a22a, transparent);
        }

        /* TOC links */
        .toc-link {
          transition: color 0.2s, background 0.2s, padding-left 0.2s;
          text-decoration: none;
          color: #7c4010;
          font-family: 'Hind', sans-serif;
          font-size: 13.5px;
          display: flex; align-items: center; gap: 8px;
          padding: 7px 10px;
          border-radius: 8px;
        }
        .toc-link:hover {
          background: #FFF4EB;
          color: #E8690A;
          padding-left: 14px;
        }

        /* Contact box */
        .contact-box {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          position: relative;
          overflow: hidden;
        }
        .contact-wm {
          position: absolute;
          right: 24px; top: 50%; transform: translateY(-50%);
          font-size: 5rem;
          color: rgba(255,255,255,0.06);
          line-height: 1;
          user-select: none;
          pointer-events: none;
          font-family: 'Baloo 2', cursive;
          font-weight: 800;
        }

        /* Legal strip */
        .legal-strip {
          background: #fff;
          border: 1px solid #ece8e1;
          border-radius: 12px;
          padding: 14px 20px;
          display: flex; flex-wrap: wrap; gap: 10px 22px;
          align-items: center;
        }
        .legal-chip {
          font-size: 12px; color: #6b6b6b;
          font-family: 'Hind', sans-serif;
          display: flex; align-items: center; gap: 5px;
        }
        .legal-chip strong { color: #1e1e1e; }
      `}</style>

      {/* ── HERO ── */}
      <div className="hero-bg relative px-6 py-16 md:py-24">
        <div className="ashoka-wm">☸</div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="badge inline-block px-4 py-1.5 rounded-full mb-6">
            🛒 Maharashtra Bazaar &nbsp;·&nbsp; UDYAM-MH-13-0063481
          </span>
          <h1
            className="mb-4"
            style={{
              fontFamily: "'Baloo 2', cursive",
              fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
              fontWeight: 800,
              lineHeight: 1.12,
              color: "#ffffff",
            }}
          >
            Privacy{" "}
            <span style={{ color: "#fde68a" }}>Policy</span>
          </h1>
          <p
            className="max-w-xl mb-8"
            style={{
              fontFamily: "'Hind', sans-serif",
              fontSize: "1.02rem",
              lineHeight: 1.75,
              color: "rgba(255,255,255,0.88)",
            }}
          >
            Maharashtra Bazaar is committed to protecting your personal data. We are
            transparent about how we collect, use, and safeguard your information
            under Indian law.
          </p>
          <div
            className="flex flex-wrap gap-x-5 gap-y-2 text-sm"
            style={{ fontFamily: "'Hind', sans-serif", color: "rgba(255,255,255,0.72)" }}
          >
            <span>📅 Effective: 15 August 2026</span>
            <span className="opacity-40">|</span>
            <span>📅 Last Updated: 2026</span>
            <span className="opacity-40">|</span>
            <span>📍 Jalna, Maharashtra, India</span>
            <span className="opacity-40">|</span>
            <span>🏛️ GSTIN: 27CCDPG7095N2ZZ</span>
          </div>
        </div>
      </div>

      {/* ── TRUST STRIP ── */}
      <div className="trust-strip">
        {[
          { icon: "🔒", title: "SSL Encrypted", sub: "All data transmissions secured" },
          { icon: "🏛️", title: "IT Act 2000 Compliant", sub: "Indian data protection laws" },
          { icon: "🤝", title: "No Data Selling", sub: "Your info stays private" },
          { icon: "⚡", title: "48hr Response", sub: "Privacy queries answered fast" },
        ].map((t) => (
          <div className="trust-item" key={t.title}>
            <span style={{ fontSize: "18px" }}>{t.icon}</span>
            <div>
              <strong>{t.title}</strong>
              {t.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── SIDEBAR ── */}
          <aside className="lg:w-56 shrink-0">
            <div className="sticky top-8">
              <p
                className="text-xs uppercase tracking-widest text-gray-400 mb-3"
                style={{ fontFamily: "'Hind', sans-serif", fontWeight: 600 }}
              >
                Contents
              </p>
              <nav className="flex flex-col gap-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="toc-link"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveSection(activeSection === s.id ? null : s.id);
                      document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    <span>{s.icon}</span> {s.title}
                  </a>
                ))}
              </nav>

              {/* Sidebar contact box */}
              <div
                className="mt-8 p-4 rounded-xl"
                style={{
                  background: "#FFF4EB",
                  border: "1px solid #fbd7b5",
                }}
              >
                <p
                  style={{
                    fontFamily: "'Hind', sans-serif",
                    fontSize: "12.5px",
                    color: "#7c4010",
                    lineHeight: 1.65,
                  }}
                >
                  Questions? Contact us at<br />
                  <a
                    href="mailto:rahul.gawali1414@gmail.com"
                    style={{ fontWeight: 600, color: "#E8690A", textDecoration: "none" }}
                  >
                    rahul.gawali1414@gmail.com
                  </a>
                  <br />
                  <a
                    href="tel:+917507192415"
                    style={{ fontWeight: 600, color: "#E8690A", textDecoration: "none" }}
                  >
                    +91 75071 92415
                  </a>
                  <br />
                  Mon–Sat, 9:00–20:00
                </p>
              </div>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 flex flex-col gap-4">

            {/* Legal Registration Strip */}
            <div className="legal-strip">
              <div className="legal-chip">🏢 <strong>MAHARASHTRA BAZAAR I APPS</strong></div>
              <div className="legal-chip">👤 <strong>Rahul Ravsaheb Gavli</strong> (Proprietor)</div>
              <div className="legal-chip">📍 Karjat, Ambad, Jalna – 431204, MH</div>
              <div className="legal-chip">📋 Shop Act: <strong>2641900321436376</strong></div>
            </div>

            {/* Intro Paragraph */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <p
                className="text-gray-600"
                style={{ fontFamily: "'Hind', sans-serif", fontSize: "0.97rem", lineHeight: 1.8 }}
              >
                This Privacy Policy explains how{" "}
                <strong style={{ color: "#E8690A" }}>Maharashtra Bazaar I Apps</strong>{" "}
                ("we", "our", or "us"), operated by{" "}
                <strong style={{ color: "#E8690A" }}>Rahul Ravsaheb Gavli</strong>{" "}
                under Proprietorship (GSTIN: 27CCDPG7095N2ZZ, Udyam: UDYAM-MH-13-0063481),
                collects, uses, shares, and protects information from users ("you") of our
                website and mobile application. By using Maharashtra Bazaar, you agree to
                the practices described in this policy. This policy applies to all services
                offered by Maharashtra Bazaar in India and is governed by the Information
                Technology Act, 2000.
              </p>
            </div>

            {/* ── ACCORDION SECTIONS ── */}
            {sections.map((section, idx) => (
              <div
                key={section.id}
                id={section.id}
                className={`section-card bg-white rounded-2xl border overflow-hidden ${
                  activeSection === section.id
                    ? "active border-[#E8690A]"
                    : "border-gray-100"
                }`}
                onClick={() =>
                  setActiveSection(activeSection === section.id ? null : section.id)
                }
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ background: "#FFF4EB" }}
                    >
                      {section.icon}
                    </span>
                    <h2
                      style={{
                        fontFamily: "'Baloo 2', cursive",
                        fontSize: "1.08rem",
                        fontWeight: 700,
                        color: "#1a1a2e",
                      }}
                    >
                      {idx + 1}. {section.title}
                    </h2>
                  </div>
                  <span
                    style={{
                      color: "#E8690A",
                      fontSize: "22px",
                      fontWeight: 300,
                      display: "inline-block",
                      transition: "transform 0.25s",
                      transform:
                        activeSection === section.id ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                  >
                    +
                  </span>
                </div>

                {/* Expanded Body */}
                {activeSection === section.id && (
                  <div className="content-reveal px-6 pb-6">
                    <div className="divider h-px mb-5" />
                    <div className="flex flex-col gap-4">
                      {section.content.map((item, i) => (
                        <div key={i}>
                          <h3
                            style={{
                              fontFamily: "'Hind', sans-serif",
                              fontWeight: 600,
                              fontSize: "11.5px",
                              textTransform: "uppercase",
                              letterSpacing: "0.7px",
                              color: "#E8690A",
                              marginBottom: "4px",
                            }}
                          >
                            {item.subtitle}
                          </h3>
                          <p
                            style={{
                              fontFamily: "'Hind', sans-serif",
                              fontSize: "0.935rem",
                              lineHeight: 1.78,
                              color: "#555",
                            }}
                          >
                            {item.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* ── CONTACT / CTA BOX ── */}
            <div className="contact-box rounded-2xl p-8 text-white mt-2">
              <div className="contact-wm">MB</div>
              <div className="relative z-10">
                <span
                  className="badge inline-block px-4 py-1.5 rounded-full mb-4"
                  style={{ fontSize: "11px", letterSpacing: "1px" }}
                >
                  📬 GET IN TOUCH
                </span>
                <h2
                  style={{
                    fontFamily: "'Baloo 2', cursive",
                    fontSize: "1.65rem",
                    fontWeight: 800,
                    lineHeight: 1.2,
                    marginBottom: "8px",
                  }}
                >
                  Have questions or{" "}
                  <span style={{ color: "#fde68a" }}>concerns?</span>
                </h2>
                <p
                  style={{
                    fontFamily: "'Hind', sans-serif",
                    fontSize: "0.95rem",
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.85)",
                    maxWidth: "460px",
                    marginBottom: "22px",
                  }}
                >
                  Our team is here to help with any privacy-related queries.
                  Reach out and we'll respond within 2 business days
                  (Mon–Sat, 9:00–20:00).
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="mailto:rahul.gawali1414@gmail.com"
                    className="bg-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-yellow-50 transition-colors"
                    style={{ fontFamily: "'Hind', sans-serif", color: "#E8690A" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    📧 rahul.gawali1414@gmail.com
                  </a>
                  <a
                    href="tel:+917507192415"
                    className="border px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                    style={{
                      fontFamily: "'Hind', sans-serif",
                      color: "#fff",
                      borderColor: "rgba(255,255,255,0.3)",
                      background: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(4px)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    📞 +91 75071 92415
                  </a>
                  <a
                    href="#"
                    className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                    style={{
                      fontFamily: "'Hind', sans-serif",
                      color: "#fff",
                      background: "#138808",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    🛒 Maharashtra Bazaar
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}