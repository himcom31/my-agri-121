import { useState, useEffect, useRef } from "react";
import FlashSalePage from "./FlashSalePage";
import { openLoginModal } from "../utils/authEvents";
import { toggleWishlist, fetchWishlist } from "../utils/cartWishlist";
import FlashSaleBanner from "./Flashsalebanner";
import { useNavigate } from "react-router-dom";
const API_BASEA = import.meta.env.VITE_API_URL;

// ─── Responsive Hook ──────────────────────────────────────────────────────────
const useResponsive = () => {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return {
    isMobile: width < 600,
    isTablet: width >= 600 && width < 1024,
    isDesktop: width >= 1024,
    width,
  };
};

// ─── Global Animation Styles ──────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900;1000&display=swap');

    * { box-sizing: border-box; }
    body { font-family: 'Nunito', sans-serif; background: #f0fdf4; }
    ::-webkit-scrollbar { display: none; }
    button { touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
    img { max-width: 100%; }

    /* ── Keyframes ── */
    @keyframes shimmer {
      0% { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    @keyframes shimmerPulse {
      0%,100% { opacity: 1; }
      50% { opacity: 0.55; }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.9); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes floatUp {
      0%   { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
      50%  { transform: translateY(-12px) rotate(3deg); opacity: 1; }
      100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
      50% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(34,197,94,0); }
    }
    @keyframes pulseRing {
      0%   { transform: scale(0.85); opacity: 0.8; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    @keyframes slideLeft {
      from { transform: translateX(60px); opacity: 0; }
      to   { transform: translateX(0); opacity: 1; }
    }
    @keyframes countUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes borderFlow {
      0%   { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }
    @keyframes sparkle {
      0%,100% { transform: scale(0) rotate(0deg); opacity: 0; }
      50%      { transform: scale(1) rotate(180deg); opacity: 1; }
    }
    @keyframes orbit {
      from { transform: rotate(0deg) translateX(18px) rotate(0deg); }
      to   { transform: rotate(360deg) translateX(18px) rotate(-360deg); }
    }
    @keyframes bgShift {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes leafFall {
      0%   { transform: translateY(-20px) rotate(-15deg); opacity: 0; }
      20%  { opacity: 1; }
      100% { transform: translateY(80px) rotate(15deg); opacity: 0; }
    }
    @keyframes waveFlow {
      0%   { d: path("M0,20 Q170,0 340,20 Q510,40 680,20 L680,60 L0,60 Z"); }
      50%  { d: path("M0,20 Q170,40 340,20 Q510,0 680,20 L680,60 L0,60 Z"); }
      100% { d: path("M0,20 Q170,0 340,20 Q510,40 680,20 L680,60 L0,60 Z"); }
    }

    /* ── Skeleton shimmer ── */
    .skeleton {
      background: linear-gradient(90deg, #e8f5e9 25%, #c8e6c9 50%, #e8f5e9 75%);
      background-size: 800px 100%;
      animation: shimmer 1.6s linear infinite;
    }

    /* ── Entrance animations ── */
    .anim-fadeup  { animation: fadeUp 0.55s cubic-bezier(.22,1,.36,1) both; }
    .anim-scalein { animation: scaleIn 0.45s cubic-bezier(.22,1,.36,1) both; }
    .anim-fadein  { animation: fadeIn 0.5s ease both; }

    /* ── Stagger delays ── */
    .d1 { animation-delay: 0.05s; } .d2 { animation-delay: 0.1s; }
    .d3 { animation-delay: 0.15s; } .d4 { animation-delay: 0.2s; }
    .d5 { animation-delay: 0.25s; } .d6 { animation-delay: 0.3s; }
    .d7 { animation-delay: 0.35s; } .d8 { animation-delay: 0.4s; }
    .d9 { animation-delay: 0.45s; } .d10 { animation-delay: 0.5s; }
    .d11 { animation-delay: 0.55s; } .d12 { animation-delay: 0.6s; }

    /* ── Category card hover ── */
    .cat-card {
      transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease, border-color 0.2s ease;
    }
    .cat-card:hover {
      transform: translateY(-8px) scale(1.04);
      box-shadow: 0 20px 50px rgba(34,197,94,0.22);
    }

    /* ── Product card ── */
    .prod-card {
      transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease;
    }
    .prod-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 24px 48px rgba(0,0,0,0.14);
    }

    /* ── Promo card ── */
    .promo-card {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
    }
    .promo-card:hover {
      transform: translateY(-4px) scale(1.015);
      box-shadow: 0 28px 56px rgba(0,0,0,0.22);
    }

    /* ── Stat card ── */
    .stat-item {
      transition: transform 0.25s ease, background 0.25s ease;
    }
    .stat-item:hover {
      transform: scale(1.04);
      background: linear-gradient(135deg, #dcfce7, #bbf7d0) !important;
    }

    /* ── Section accent bar animation ── */
    .accent-bar {
      background: linear-gradient(180deg, #16a34a, #4ade80, #86efac, #4ade80, #16a34a);
      background-size: 100% 300%;
      animation: bgShift 3s ease infinite;
    }

    /* ── Nav dot ── */
    .hero-dot {
      transition: width 0.4s cubic-bezier(.34,1.56,.64,1), background 0.25s ease;
    }

    /* ── Floating particles ── */
    .particle {
      position: absolute;
      pointer-events: none;
      border-radius: 50%;
      animation: floatUp 3s ease-in-out infinite;
    }

    /* ── Reduced motion ── */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
      }
    }
  `}</style>
);

// ─── Icons ────────────────────────────────────────────────────────────────────
const HeartIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24"
    fill={filled ? "#ef4444" : "none"}
    stroke={filled ? "#ef4444" : "#94a3b8"}
    strokeWidth="2" style={{ transition: "all 0.2s ease" }}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const StarIcon = ({ filled }) => (
  <svg width="11" height="11" viewBox="0 0 24 24"
    fill={filled ? "#f59e0b" : "#e2e8f0"}
    stroke={filled ? "#f59e0b" : "#e2e8f0"} strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const StarRating = ({ rating = 4 }) => (
  <span style={{ display: "flex", gap: 1 }}>
    {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} filled={i <= rating} />)}
  </span>
);

// ─── Floating Particles ───────────────────────────────────────────────────────
const FloatingParticles = () => {
  const particles = [
    { size: 6, x: "8%", delay: "0s", dur: "3.2s", color: "rgba(74,222,128,0.5)" },
    { size: 4, x: "18%", delay: "0.8s", dur: "2.8s", color: "rgba(34,197,94,0.35)" },
    { size: 8, x: "32%", delay: "0.3s", dur: "3.6s", color: "rgba(134,239,172,0.4)" },
    { size: 5, x: "55%", delay: "1.2s", dur: "2.5s", color: "rgba(74,222,128,0.45)" },
    { size: 7, x: "70%", delay: "0.5s", dur: "3.9s", color: "rgba(22,163,74,0.3)" },
    { size: 4, x: "82%", delay: "1.6s", dur: "2.9s", color: "rgba(134,239,172,0.5)" },
    { size: 6, x: "92%", delay: "0.9s", dur: "3.3s", color: "rgba(74,222,128,0.4)" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map((p, i) => (
        <div key={i} className="particle" style={{
          width: p.size, height: p.size,
          left: p.x, bottom: 0,
          background: p.color,
          animationDelay: p.delay,
          animationDuration: p.dur,
        }} />
      ))}
    </div>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle, isMobile }) => (
  <div className="anim-fadeup" style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: isMobile ? 18 : 26 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div className="accent-bar" style={{ width: 4, height: 26, borderRadius: 2 }} />
      <div>
        <h2 style={{
          fontSize: isMobile ? 17 : 22, fontWeight: 900, color: "#14532d",
          margin: 0, lineHeight: 1.1, letterSpacing: "-0.3px",
        }}>{title}</h2>
        {subtitle && (
          <p style={{
            fontSize: isMobile ? 11 : 13, color: "#4ade80", margin: "3px 0 0",
            fontWeight: 600, letterSpacing: "0.2px",
          }}>{subtitle}</p>
        )}
      </div>
    </div>
  </div>
);

// ─── Hero Banner ──────────────────────────────────────────────────────────────
const HeroBanner = () => {
  const { isMobile, isTablet } = useResponsive();
  const [slide, setSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const autoRef = useRef(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/banner/list`);
        const data = await res.json();
        if (data.success) setSlides(data.data.filter(b => b.status === "Active"));
      } catch (err) {
        console.error("Banner fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const goTo = (i) => {
    if (i === slide || isTransitioning || slides.length === 0) return;
    setIsTransitioning(true);
    setTimeout(() => { setSlide(i); setIsTransitioning(false); }, 350);
  };

  useEffect(() => {
    if (slides.length === 0) return;
    autoRef.current = setInterval(() => goTo((slide + 1) % slides.length), 4500);
    return () => clearInterval(autoRef.current);
  }, [slide, slides.length]);

  const height = isMobile ? 220 : isTablet ? 360 : 580;

  if (loading) return (
    <div className="skeleton" style={{
      width: "100%", height, borderRadius: isMobile ? 20 : 28,
      marginBottom: isMobile ? 32 : 56,
    }} />
  );

  if (slides.length === 0) return null;

  return (
    <div className="anim-scalein" style={{
      position: "relative", width: "100%", height,
      borderRadius: isMobile ? 20 : 28, overflow: "hidden",
      marginBottom: isMobile ? 32 : 56,
      boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
    }}>
      {/* Image */}
      <img
        key={slide}
        src={slides[slide].bannerImage}
        alt={slides[slide].title}
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover",
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? "scale(1.04)" : "scale(1)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      />

      {/* Gradient overlays */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 45%, transparent 70%)",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to right, rgba(0,0,0,0.15) 0%, transparent 50%)",
      }} />

      {/* Floating particles on banner */}
      <FloatingParticles />

      {/* Progress bar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
        background: "rgba(255,255,255,0.15)",
      }}>
        <div style={{
          height: "100%",
          background: "linear-gradient(to right, #4ade80, #22c55e)",
          width: `${((slide + 1) / slides.length) * 100}%`,
          transition: "width 0.4s ease",
        }} />
      </div>

      {/* Dots */}
      <div style={{
        position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 7, alignItems: "center",
      }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} className="hero-dot" style={{
            width: i === slide ? 28 : 8, height: 8, borderRadius: 4,
            background: i === slide ? "#fff" : "rgba(255,255,255,0.4)",
            border: "none", cursor: "pointer", padding: 0,
          }} />
        ))}
      </div>

      {/* Nav buttons */}
      {[
        { side: "left", action: () => goTo((slide - 1 + slides.length) % slides.length), Icon: ChevronLeft },
        { side: "right", action: () => goTo((slide + 1) % slides.length), Icon: ChevronRight },
      ].map(({ side, action, Icon }) => (
        <button key={side} onClick={action} style={{
          position: "absolute", top: "50%",
          [side]: isMobile ? 10 : 18,
          transform: "translateY(-50%)",
          width: isMobile ? 34 : 44, height: isMobile ? 34 : 44,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(10px) saturate(1.5)",
          WebkitBackdropFilter: "blur(10px) saturate(1.5)",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s ease, transform 0.2s ease",
        }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.32)";
            e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.18)";
            e.currentTarget.style.transform = "translateY(-50%) scale(1)";
          }}>
          <Icon />
        </button>
      ))}
    </div>
  );
};

// ─── Category Emojis ──────────────────────────────────────────────────────────
const categoryEmojis = ["🥦","🐟","🍎","🥩","🧀","🍞","🌶️","🫒","🥚","🥕","🧅","🌽","🫐","🍋","🥜","🌿"];

// ─── Feature Categories ───────────────────────────────────────────────────────
const FeatureCategories = ({ categories, loading, products }) => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();
  const [hovered, setHovered] = useState(null);

  const getCount = (catId) =>
    products.filter(p => {
      const cid = typeof p.category === "object" ? p.category?.id : p.category;
      return cid === catId;
    }).length;

  const handleCategoryClick = (catId) => navigate(`/user/product?categories=${catId}`);

  const cols = isMobile ? 3 : isTablet ? 4 : 6;

  const buildRows = (items, perRow) => {
    const rows = [];
    for (let i = 0; i < items.length; i += perRow) rows.push(items.slice(i, i + perRow));
    return rows;
  };

  const rows = buildRows(categories, cols);

  return (
    <section id="feature-categories" style={{ marginBottom: isMobile ? 44 : 68, scrollMarginTop: 80 }}>
      <SectionHeader title="Shop by Category" subtitle="Fresh picks, every day" isMobile={isMobile} />

      {loading ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: isMobile ? 10 : 16,
        }}>
          {[...Array(cols * 2)].map((_, i) => (
            <div key={i} className="skeleton" style={{
              height: isMobile ? 110 : 170, borderRadius: 18,
            }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 10 : 16 }}>
          {rows.map((row, rowIdx) => {
            const isShortRow = row.length < cols;
            return (
              <div key={rowIdx} style={{
                display: "flex", gap: isMobile ? 10 : 16,
                justifyContent: isShortRow ? "center" : "flex-start",
              }}>
                {row.map((cat, i) => {
                  const globalIdx = rowIdx * cols + i;
                  const img = cat.thumbnail || cat.image;
                  const isHov = hovered === `${rowIdx}-${i}`;
                  const animClass = `anim-fadeup d${Math.min(globalIdx + 1, 12)}`;

                  return (
                    <div
                      key={cat.id || i}
                      className={`cat-card ${animClass}`}
                      onMouseEnter={() => setHovered(`${rowIdx}-${i}`)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => handleCategoryClick(cat.id)}
                      style={{
                        flex: `0 0 calc((100% - ${(cols - 1) * (isMobile ? 10 : 16)}px) / ${cols})`,
                        display: "flex", flexDirection: "column", alignItems: "center",
                        padding: isMobile ? "12px 8px 12px" : "20px 12px 16px",
                        background: isHov
                          ? "linear-gradient(145deg, #f0fdf4, #dcfce7)"
                          : "#fff",
                        borderRadius: isMobile ? 16 : 22,
                        border: isHov ? "2px solid #22c55e" : "2px solid #f0fdf4",
                        cursor: "pointer",
                        position: "relative", overflow: "hidden",
                        boxShadow: isHov
                          ? "0 20px 50px rgba(34,197,94,0.22)"
                          : "0 2px 16px rgba(0,0,0,0.06)",
                      }}
                    >
                      {/* Pulse ring on hover */}
                      {isHov && (
                        <div style={{
                          position: "absolute", top: 10, right: 10,
                          width: 8, height: 8, borderRadius: "50%",
                          background: "#22c55e",
                          animation: "pulse 1.5s ease-in-out infinite",
                        }} />
                      )}

                      {/* Background circle decoration */}
                      <div style={{
                        position: "absolute", top: -20, right: -20, width: 70, height: 70,
                        borderRadius: "50%",
                        background: isHov ? "rgba(34,197,94,0.1)" : "rgba(34,197,94,0.05)",
                        transition: "background 0.3s ease",
                      }} />
                      <div style={{
                        position: "absolute", bottom: -15, left: -15, width: 50, height: 50,
                        borderRadius: "50%",
                        background: isHov ? "rgba(74,222,128,0.12)" : "transparent",
                        transition: "background 0.3s ease",
                      }} />

                      {/* Image / Emoji */}
                      <div style={{
                        width: "100%", height: isMobile ? 68 : 124,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginBottom: isMobile ? 8 : 12, overflow: "hidden",
                        transform: isHov ? "scale(1.08) translateY(-2px)" : "scale(1)",
                        transition: "transform 0.35s cubic-bezier(.34,1.56,.64,1)",
                      }}>
                        {img
                          ? <img src={img} alt={cat.name}
                              style={{ width: "100%", height: "100%", objectFit: "contain" }}
                              onError={e => { e.target.style.display = "none"; }} />
                          : <div style={{
                              fontSize: isMobile ? 32 : 52, lineHeight: 1,
                              filter: isHov ? "drop-shadow(0 4px 8px rgba(0,0,0,0.2))" : "none",
                              transition: "filter 0.25s ease",
                            }}>
                              {categoryEmojis[globalIdx % categoryEmojis.length]}
                            </div>
                        }
                      </div>

                      {/* Name */}
                      <div style={{
                        fontSize: isMobile ? 10 : 13, fontWeight: 800,
                        color: isHov ? "#14532d" : "#1e293b",
                        textAlign: "center", marginBottom: 4, lineHeight: 1.3,
                        overflow: "hidden", display: "-webkit-box",
                        WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                        transition: "color 0.2s ease",
                      }}>{cat.name}</div>

                      {/* Count badge */}
                      <div style={{
                        fontSize: isMobile ? 9 : 11, fontWeight: 700,
                        color: isHov ? "#15803d" : "#22c55e",
                        background: isHov ? "#dcfce7" : "#f0fdf4",
                        padding: "3px 9px", borderRadius: 20, marginTop: 2,
                        border: `1px solid ${isHov ? "#86efac" : "#bbf7d0"}`,
                        transition: "all 0.2s ease",
                      }}>{getCount(cat.id)} items</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

// ─── Promo Banners ────────────────────────────────────────────────────────────
const PromoBanners = () => {
  const { isMobile, isTablet } = useResponsive();
  const [ads, setAds] = useState([]);
  const scrollRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const isUserInteracting = useRef(false);
  const resumeTimer = useRef(null);

  useEffect(() => {
    fetch(`${API_BASEA}/api/ad/`)
      .then(r => r.json())
      .then(data => setAds((data.ads || []).filter(a => a.isActive)))
      .catch(() => {});
  }, []);

  const fallbacks = [
    {
      bg: "linear-gradient(135deg,#064e3b,#059669,#34d399)",
      emoji: "🥬", label: "Fresh Greens", sub: "Farm to table daily", badge: "20% OFF",
      accent: "#6ee7b7",
    },
    {
      bg: "linear-gradient(135deg,#7c2d12,#c2410c,#fb923c)",
      emoji: "🛒", label: "Mega Sale", sub: "Limited time deals", badge: "SAVE 50%",
      accent: "#fed7aa",
    },
    {
      bg: "linear-gradient(135deg,#831843,#be185d,#f472b6)",
      emoji: "🍅", label: "Daily Fresh", sub: "Order before 10 AM", badge: "FREE DELIVERY",
      accent: "#fbcfe8",
    },
  ];

  const items = ads.length > 0 ? ads : fallbacks;

  useEffect(() => {
    if (!isMobile || items.length <= 1) return;
    const t = setInterval(() => {
      if (isUserInteracting.current) return;
      const el = scrollRef.current;
      if (!el) return;
      const cardW = el.scrollWidth / items.length;
      const next = (Math.round(el.scrollLeft / cardW) + 1) % items.length;
      el.scrollTo({ left: next * cardW, behavior: "smooth" });
    }, 3400);
    return () => clearInterval(t);
  }, [isMobile, items.length]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const cardW = el.scrollWidth / items.length;
    const raw = el.scrollLeft / cardW;
    setScrollProgress(raw);
    setActiveIndex(Math.max(0, Math.min(items.length - 1, Math.round(raw))));
  };

  const renderCard = (item, i, height) => {
    if (item.image) return (
      <div key={item.id || i} className="promo-card" style={{
        borderRadius: 20, overflow: "hidden",
        position: "relative", height, width: "100%",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      }}>
        <img src={item.image} alt={item.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top,rgba(0,0,0,0.6),transparent)",
        }} />
        {item.title && (
          <div style={{
            position: "absolute", bottom: 16, left: 16, right: 16,
            fontSize: 15, fontWeight: 800, color: "#fff",
          }}>{item.title}</div>
        )}
      </div>
    );

    return (
      <div key={i} className="promo-card" style={{
        background: item.bg, borderRadius: 20,
        padding: isMobile ? "20px 18px" : "28px 24px",
        height, width: "100%",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        position: "relative", overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", right: -30, top: -30,
          width: 160, height: 160, borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
        }} />
        <div style={{
          position: "absolute", right: -10, bottom: -20,
          width: 100, height: 100, borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
        }} />

        {/* Emoji — large background */}
        <div style={{
          position: "absolute", right: 14, bottom: 14,
          fontSize: isMobile ? 60 : 88, opacity: 0.2, lineHeight: 1,
          animation: "floatUp 4s ease-in-out infinite",
          filter: "blur(0px)",
        }}>{item.emoji}</div>

        <div>
          {/* Sparkle badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 30, padding: "4px 12px 4px 8px",
            marginBottom: 12,
          }}>
            <span style={{ fontSize: 13 }}>✨</span>
            <span style={{
              fontSize: isMobile ? 11 : 12, fontWeight: 800, color: "#fff",
              letterSpacing: "0.5px",
            }}>{item.badge}</span>
          </div>

          <div style={{
            fontSize: isMobile ? 20 : 26, fontWeight: 900, color: "#fff",
            lineHeight: 1.15, marginBottom: 6, letterSpacing: "-0.5px",
          }}>{item.label}</div>

          {item.sub && (
            <div style={{
              fontSize: isMobile ? 11 : 13, color: "rgba(255,255,255,0.75)",
              fontWeight: 600,
            }}>{item.sub}</div>
          )}
        </div>

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.95)",
          color: "#14532d", fontWeight: 800,
          fontSize: isMobile ? 12 : 14,
          padding: "8px 16px", borderRadius: 12,
          alignSelf: "flex-start",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          transition: "transform 0.2s ease",
        }}>
          Shop Now <span style={{ fontSize: 14 }}>→</span>
        </div>
      </div>
    );
  };

  if (isMobile) {
    const height = 190;
    const sidePad = 24;
    return (
      <section style={{ marginBottom: 44 }}>
        <SectionHeader title="Special Offers" subtitle="Deals you'll love" isMobile={isMobile} />
        <div
          ref={scrollRef} onScroll={handleScroll}
          onTouchStart={() => { isUserInteracting.current = true; }}
          onTouchEnd={() => {
            clearTimeout(resumeTimer.current);
            resumeTimer.current = setTimeout(() => { isUserInteracting.current = false; }, 3500);
          }}
          style={{
            display: "flex", gap: 14, overflowX: "auto",
            scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch",
            padding: `4px ${sidePad}px 8px`, scrollbarWidth: "none",
          }}
        >
          {items.map((item, i) => {
            const dist = Math.min(Math.abs(scrollProgress - i), 1);
            return (
              <div key={item.id || i} style={{
                flex: `0 0 calc(100% - ${sidePad * 2}px)`,
                scrollSnapAlign: "center",
                transform: `scale(${1 - dist * 0.06}) translateY(${dist * 5}px)`,
                opacity: 1 - dist * 0.3,
                transition: "transform 0.35s cubic-bezier(.34,1.15,.64,1), opacity 0.35s ease",
              }}>
                {renderCard(item, i, height)}
              </div>
            );
          })}
        </div>
        {items.length > 1 && (
          <div style={{
            display: "flex", justifyContent: "center", gap: 6, marginTop: 14,
          }}>
            {items.map((_, i) => (
              <div key={i} style={{
                width: i === activeIndex ? 24 : 7, height: 7, borderRadius: 4,
                background: i === activeIndex
                  ? "linear-gradient(to right,#16a34a,#4ade80)"
                  : "#bbf7d0",
                transition: "width 0.35s cubic-bezier(.34,1.56,.64,1), background 0.25s ease",
              }} />
            ))}
          </div>
        )}
      </section>
    );
  }

  const cols = isTablet ? "1fr 1fr" : `repeat(${Math.min(items.length, 3)}, 1fr)`;
  return (
    <section style={{ marginBottom: 68 }}>
      <SectionHeader title="Special Offers" subtitle="Deals you'll love" isMobile={isMobile} />
      <div style={{ display: "grid", gridTemplateColumns: cols, gap: 20 }}
           className="anim-fadeup">
        {items.slice(0, 3).map((item, i) => renderCard(item, i, 240))}
      </div>
    </section>
  );
};

// ─── Stats Bar ────────────────────────────────────────────────────────────────
const StatsBar = () => {
  const { isMobile } = useResponsive();
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const stats = [
    { emoji: "👥", stat: "50K+", label: "Happy Customers", color: "#22c55e" },
    { emoji: "⚡", stat: "24 × 7  open", label: "Trusted Platform", color: "#f59e0b" },
    { emoji: "🔒", stat: "100%", label: "Secure Payments", color: "#3b82f6" },
  ];

  return (
    <div ref={ref} style={{
      display: "grid", gridTemplateColumns: "repeat(3,1fr)",
      borderRadius: isMobile ? 20 : 28,
      overflow: "hidden",
      marginBottom: isMobile ? 44 : 68,
      background: "linear-gradient(135deg, #f0fdf4, #dcfce7, #f0fdf4)",
      border: "2px solid #bbf7d0",
      boxShadow: "0 8px 40px rgba(34,197,94,0.12)",
    }}>
      {stats.map((item, i) => (
        <div
          key={i}
          className="stat-item"
          style={{
            padding: isMobile ? "20px 10px" : "34px 28px",
            borderRight: i < 2 ? "2px solid #bbf7d0" : "none",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            textAlign: "center", gap: isMobile ? 5 : 8,
            position: "relative", overflow: "hidden",
            cursor: "default",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: `opacity 0.5s ease ${i * 0.15}s, transform 0.5s cubic-bezier(.22,1,.36,1) ${i * 0.15}s`,
          }}
        >
          {/* Subtle background circle */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: 90, height: 90, borderRadius: "50%",
            background: `radial-gradient(circle, ${item.color}12, transparent)`,
          }} />

          {/* Emoji with floating */}
          <span style={{
            fontSize: isMobile ? 26 : 40,
            animation: `floatUp ${3 + i * 0.5}s ease-in-out ${i * 0.3}s infinite`,
          }}>{item.emoji}</span>

          <div style={{
            fontSize: isMobile ? 20 : 30, fontWeight: 900,
            color: item.color, lineHeight: 1,
            animation: visible ? `countUp 0.6s ease ${i * 0.2 + 0.2}s both` : "none",
            textShadow: `0 2px 12px ${item.color}40`,
          }}>{item.stat}</div>

          <div style={{
            fontSize: isMobile ? 10 : 13, color: "#4b5563",
            fontWeight: 700, lineHeight: 1.3,
          }}>{item.label}</div>

          {/* Pulse ring */}
          {visible && (
            <div style={{
              position: "absolute", width: 24, height: 24, borderRadius: "50%",
              border: `2px solid ${item.color}`,
              animation: `pulseRing 2s ease-out ${i * 0.3}s infinite`,
              opacity: 0,
            }} />
          )}
        </div>
      ))}
    </div>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { isMobile } = useResponsive();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [prodLoading, setProdLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(null);
  const [flashSaleId, setFlashSaleId] = useState(null);

  useEffect(() => {
    if (window.location.hash === "#feature-categories") {
      setTimeout(() => {
        const el = document.getElementById("feature-categories");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, []);

  useEffect(() => {
    fetch(`${API_BASEA}/api/Category/all`)
      .then(r => r.json())
      .then(data => {
        setCategories(Array.isArray(data) ? data : data.categories || data.data || []);
        setCatLoading(false);
      })
      .catch(() => { setCatLoading(false); setError("Could not load categories."); });

    const fetchAllProducts = async () => {
      try {
        let all = [], p = 1, totalPages = 1;
        do {
          const res = await fetch(`${API_BASEA}/api/Products/allFree?page=${p}&limit=100`);
          const data = await res.json();
          const batch = Array.isArray(data) ? data : data.products || data.data || [];
          all = [...all, ...batch];
          totalPages = data.totalPages || 1;
          p++;
        } while (p <= totalPages);
        setProducts(all);
      } catch (err) {
        console.error(err);
      } finally {
        setProdLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  const handleFlashSaleClick = (id) => {
    setFlashSaleId(id);
    setPage("flash");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setPage(null);
    setFlashSaleId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <GlobalStyles />

      {page === "flash" && (
        <FlashSalePage flashSaleId={flashSaleId} onBack={handleBack} />
      )}

      {page === null && (
        <div style={{
          maxWidth: 1440, margin: "0 auto",
          padding: isMobile ? "14px 12px 0" : "24px 24px 0",
          background: "transparent",
        }}>
          {/* Error */}
          {error && (
            <div style={{
              background: "linear-gradient(135deg,#fef9c3,#fef08a)",
              border: "1.5px solid #fde047",
              borderRadius: 14, padding: "12px 16px", marginBottom: 20,
              fontSize: 13, color: "#713f12", fontWeight: 600,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              ⚠️ {error}
            </div>
          )}

          <HeroBanner />
          <FeatureCategories categories={categories} loading={catLoading} products={products} />
          <PromoBanners />
          <StatsBar />
        </div>
      )}
    </>
  );
}
