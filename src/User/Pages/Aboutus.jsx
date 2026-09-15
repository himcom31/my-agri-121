import { useState, useEffect } from "react";

// Real data from registration documents
const stats = [
  { value: "2024", label: "Founded" },
  { value: "MSME", label: "Registered Enterprise" },
  { value: "GST", label: "Verified Business" },
  { value: "2+", label: "Years of Service" },
];

const docs = [
  {
    icon: "🏛️",
    label: "GST Registration",
    value: "27CCDPG7095N2ZZ",
    sub: "Issued: 23/12/2025",
  },
  {
    icon: "🏭",
    label: "Udyam Registration",
    value: "UDYAM-MH-13-0063481",
    sub: "MSME Micro Enterprise",
  },
  {
    icon: "🏪",
    label: "Shop Act License",
    value: "Maharashtra Bazaar I",
    sub: "Reg. No: 2641900321436376",
  },
];

const values = [
  {
    icon: "🌾",
    title: "Local to Maharashtra",
    desc: "We source and serve the Maharashtra region — Jalna, Karjat, Ambad and beyond. Our roots are local and our commitment is to every household we reach.",
  },
  {
    icon: "✅",
    title: "Verified & Compliant",
    desc: "MSME registered, GST compliant, and Shop Act licensed — Maharashtra Bazaar operates with full legal transparency.",
  },
  {
    icon: "🚀",
    title: "Tech-Powered Commerce",
    desc: "We leverage software services and digital platforms to connect buyers and sellers efficiently across the region.",
  },
  {
    icon: "🤝",
    title: "Trusted by Community",
    desc: "Founded by Rahul Ravsaheb Gawali with a vision to bring organized commerce to local markets across Maharashtra.",
  },
];

function FadeIn({ children, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      style={{
        transition: "opacity 0.6s ease, transform 0.6s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
      }}
    >
      {children}
    </div>
  );
}

export default function AboutUs() {
  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#1a1a1a" }}>

      {/* ── HERO ── */}
      <section
        style={{
          background: "linear-gradient(135deg, #ff6b00 0%, #cc4400 50%, #992200 100%)",
          color: "#fff",
          padding: "80px 24px 60px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />

        <FadeIn delay={100}>
          <div
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: 30,
              padding: "6px 18px",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1,
              marginBottom: 20,
            }}
          >
            Est. 2024 · Karjat, Jalna, Maharashtra
          </div>
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 48px)",
              fontWeight: 800,
              margin: "0 auto 16px",
              maxWidth: 600,
              lineHeight: 1.2,
            }}
          >
            Maharashtra Bazaar
          </h1>
          <p
            style={{
              fontSize: 17,
              color: "rgba(255,255,255,0.85)",
              maxWidth: 520,
              margin: "0 auto 24px",
              lineHeight: 1.7,
            }}
          >
            A registered MSME bringing organized digital commerce to Maharashtra — locally rooted, legally verified, community-driven.
          </p>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.2)",
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <span>🏭</span> MSME Micro Enterprise · Software Services & Trading
          </div>
        </FadeIn>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: "#fff", borderBottom: "1px solid #f0f0f0" }}>
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            padding: "32px 24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 8,
          }}
        >
          {stats.map((s, i) => (
            <FadeIn key={i} delay={200 + i * 80}>
              <div style={{ textAlign: "center", padding: "16px 8px" }}>
                <p style={{ fontSize: 26, fontWeight: 800, color: "#cc4400", margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: "#888", marginTop: 4, fontWeight: 500 }}>{s.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── ABOUT OWNER ── */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "56px 24px" }}>
        <FadeIn delay={300}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 32,
            }}
          >
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#cc4400", marginBottom: 8, letterSpacing: 0.5 }}>Our Story</p>
              <h2 style={{ fontSize: "clamp(22px, 3.5vw, 32px)", fontWeight: 800, margin: "0 0 20px", lineHeight: 1.3, color: "#111" }}>
                Built in Maharashtra,<br />for Maharashtra
              </h2>
              <p style={{ color: "#555", lineHeight: 1.8, marginBottom: 14, fontSize: 15 }}>
                Maharashtra Bazaar was founded by <strong>Rahul Ravsaheb Gawali</strong> in June 2024 with a vision to bring structured, digital commerce to local markets across the Jalna and Marathwada region of Maharashtra.
              </p>
              <p style={{ color: "#555", lineHeight: 1.8, marginBottom: 14, fontSize: 15 }}>
                Operating under the registered entity <strong>Nisarag Agrotech Ropatika and Irrigation Drips</strong>, Maharashtra Bazaar I serves as the digital marketplace unit — connecting vendors, buyers, and communities through technology.
              </p>
              <p style={{ color: "#555", lineHeight: 1.8, fontSize: 15 }}>
                From our base in Karjat, Ambad (Jalna), we've built a platform that is fully compliant — GST registered, MSME certified, and Shop Act licensed — ensuring every transaction is backed by legal and institutional credibility.
              </p>
            </div>

            {/* Timeline */}
            <div
              style={{
                background: "#fff8f5",
                border: "1px solid #fde0d0",
                borderRadius: 14,
                padding: 28,
              }}
            >
              <p style={{ fontSize: 12, fontWeight: 700, color: "#cc4400", marginBottom: 16 }}>Journey</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { year: "Jun 2024", text: "Business incorporated — Nisarag Agrotech & Maharashtra Bazaar I" },
                  { year: "Aug 2024", text: "Udyam MSME Registration obtained (UDYAM-MH-13-0063481)" },
                  { year: "Dec 2025", text: "GST Registration issued (27CCDPG7095N2ZZ)" },
                  { year: "Aug 2026", text: "Shop Act compliance cleared — business commencement officially started" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div
                      style={{
                        minWidth: 90,
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#fff",
                        background: "#cc4400",
                        borderRadius: 6,
                        padding: "4px 8px",
                        textAlign: "center",
                        marginTop: 1,
                      }}
                    >
                      {item.year}
                    </div>
                    <p style={{ fontSize: 14, color: "#444", margin: 0, lineHeight: 1.6 }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── VALUES ── */}
      <section style={{ background: "#fff", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "56px 24px" }}>
          <FadeIn delay={200}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#cc4400", marginBottom: 8, letterSpacing: 0.5 }}>What We Stand For</p>
            <h2 style={{ fontSize: "clamp(22px, 3.5vw, 30px)", fontWeight: 800, marginBottom: 32, color: "#111" }}>Our Values</h2>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {values.map((v, i) => (
              <FadeIn key={i} delay={300 + i * 80}>
                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    padding: "20px",
                    borderRadius: 12,
                    border: "1px solid #f0f0f0",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    background: "#fff",
                    cursor: "default",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "#fde0d0";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(204,68,0,0.08)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "#f0f0f0";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ fontSize: 26 }}>{v.icon}</div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: 14, margin: "0 0 6px", color: "#111" }}>{v.title}</h3>
                    <p style={{ fontSize: 13, color: "#666", margin: 0, lineHeight: 1.65 }}>{v.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEGAL CREDENTIALS ── */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "56px 24px" }}>
        <FadeIn delay={200}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#cc4400", marginBottom: 8, letterSpacing: 0.5 }}>Legal & Compliance</p>
          <h2 style={{ fontSize: "clamp(22px, 3.5vw, 30px)", fontWeight: 800, marginBottom: 28, color: "#111" }}>Verified Credentials</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {docs.map((d, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  background: "#fff",
                  border: "1px solid #f0ece8",
                  borderLeft: "4px solid #cc4400",
                  borderRadius: 10,
                  padding: "16px 20px",
                }}
              >
                <span style={{ fontSize: 24 }}>{d.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, color: "#999", fontWeight: 600, margin: "0 0 2px" }}>{d.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: "0 0 2px", fontFamily: "monospace" }}>{d.value}</p>
                  <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>{d.sub}</p>
                </div>
                <span style={{ fontSize: 18 }}>✅</span>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ── CONTACT / ADDRESS ── */}
      <section style={{ background: "#fff8f5", borderTop: "1px solid #fde0d0" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "56px 24px" }}>
          <FadeIn delay={200}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#cc4400", marginBottom: 8, letterSpacing: 0.5 }}>Find Us</p>
            <h2 style={{ fontSize: "clamp(22px, 3.5vw, 30px)", fontWeight: 800, marginBottom: 28, color: "#111" }}>Contact & Address</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 16,
              }}
            >
              {/* Address */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #fde0d0",
                  borderRadius: 14,
                  padding: 24,
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>📍</div>
                <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 8px", color: "#111" }}>Maharashtra Bazaar I</p>
                <p style={{ fontSize: 13, color: "#666", lineHeight: 1.8, margin: 0 }}>
                  Gawali Niwas, Karjat Bhaigav Road<br />
                  Karjat, Ambad<br />
                  District Jalna, Maharashtra<br />
                  Pin Code — 431204
                </p>
              </div>

              {/* Contact */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #fde0d0",
                  borderRadius: 14,
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 4 }}>📞</div>
                <div>
                  <p style={{ fontSize: 11, color: "#aaa", fontWeight: 600, margin: "0 0 2px" }}>Phone / WhatsApp</p>
                  <a
                    href="tel:+917507192415"
                    style={{ fontSize: 15, fontWeight: 700, color: "#cc4400", textDecoration: "none" }}
                  >
                    +91 75071 92415
                  </a>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "#aaa", fontWeight: 600, margin: "0 0 2px" }}>Email</p>
                  <a
                    href="mailto:rahul.gawali1414@gmail.com"
                    style={{ fontSize: 14, fontWeight: 600, color: "#cc4400", textDecoration: "none" }}
                  >
                    rahul.gawali1414@gmail.com
                  </a>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: "#aaa", fontWeight: 600, margin: "0 0 2px" }}>Business Hours</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#333", margin: 0 }}>
                    9:00 AM – 8:00 PM, Mon – Sat
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section
        style={{
          background: "linear-gradient(135deg, #cc4400, #992200)",
          color: "#fff",
          textAlign: "center",
          padding: "52px 24px",
        }}
      >
        <FadeIn delay={100}>
          <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, margin: "0 0 10px" }}>
            Shop Local. Support Maharashtra. 🧡
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, margin: "0 auto", maxWidth: 440 }}>
            Backed by MSME, GST & Shop Act — Maharashtra Bazaar is your trusted local marketplace.
          </p>
        </FadeIn>
      </section>

    </div>
  );
}