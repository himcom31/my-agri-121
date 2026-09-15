// src/Components/Orderhistorytab.jsx
// This file now renders Enquiry History instead of Order History.

import { useState, useEffect, useCallback } from "react";
import { MessageCircle, Mail, Phone } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("userToken");
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const apiFetchMyEnquiries = () =>
  fetch(`${API_URL}/api/enquiry/my`, { headers: authHeaders() }).then(r => r.json());

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    " " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
  );
};

const statusColor = (s) => {
  const map = {
    New:       { bg: "#dbeafe", color: "#1e40af" },
    Contacted: { bg: "#fef3c7", color: "#92400e" },
    Closed:    { bg: "#dcfce7", color: "#166534" },
  };
  return map[s] || { bg: "#f1f5f9", color: "#475569" };
};

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
};

const Spin = ({ size = 18 }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
    style={{ animation: "eqSpin 0.7s linear infinite", display: "block" }}
  >
    <path d="M12 2a10 10 0 0110 10" />
  </svg>
);

// ─── Enquiry Card ─────────────────────────────────────────────────────────────
const EnquiryCard = ({ enquiry }) => {
  const isMobile = useIsMobile();
  const sc = statusColor(enquiry.status);
  const product = enquiry.product || {};
  const seller  = enquiry.seller;
  const variant = enquiry.variant;

  const waLink = seller?.whatsapp
    ? `https://wa.me/${seller.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hi, following up on my enquiry about "${product.name}"`
      )}`
    : null;

  const mailLink = seller?.email
    ? `mailto:${seller.email}?subject=${encodeURIComponent(`Enquiry about ${product.name}`)}`
    : null;

  return (
    <div style={{
      background: "#fff", borderRadius: 14,
      padding: isMobile ? "14px 16px" : "16px 20px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1px solid #f0f0f0",
      animation: "eqFadeIn 0.3s ease",
      transition: "box-shadow 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.08)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)"}
    >
      <div style={{ display: "flex", gap: 12 }}>
        {/* Product Image */}
        <div style={{
          width: isMobile ? 54 : 64, height: isMobile ? 54 : 64,
          borderRadius: 10, overflow: "hidden", background: "#f9fafb",
          flexShrink: 0, border: "1px solid #f0f0f0",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {product.image
            ? <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ fontSize: 22 }}>📦</span>}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Product name + status */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <div style={{
              fontSize: isMobile ? 13 : 14, fontWeight: 700, color: "#111",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {product.name || "Product"}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
              background: sc.bg, color: sc.color, flexShrink: 0,
            }}>
              {enquiry.status}
            </span>
          </div>

          {/* Variant badge */}
          {variant?.label && (
            <span style={{
              display: "inline-block", marginTop: 4,
              fontSize: 11, fontWeight: 700, color: "#16a34a",
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              padding: "2px 8px", borderRadius: 5,
            }}>
              {variant.label}
            </span>
          )}

          {/* Price */}
          {(variant?.price || product.price) && (
            <div style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", marginTop: 4 }}>
              ₹{Number(variant?.price || product.price).toFixed(2)}
              {product.unit && (
                <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400, marginLeft: 4 }}>
                  / {product.unit}
                </span>
              )}
            </div>
          )}

          {/* Date */}
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 5 }}>
            Sent on{" "}
            <span style={{ color: "#6b7280", fontWeight: 600 }}>{fmtDate(enquiry.createdAt)}</span>
          </div>

          {/* User message */}
          {enquiry.message && (
            <div style={{
              fontSize: 12, color: "#374151", marginTop: 6, lineHeight: 1.5,
              background: "#f9fafb", padding: "7px 10px", borderRadius: 7,
              borderLeft: "3px solid #e5e7eb",
            }}>
              "{enquiry.message}"
            </div>
          )}
        </div>
      </div>

      {/* Seller contact row */}
      {seller && (
        <div style={{
          marginTop: 12, paddingTop: 12, borderTop: "1px solid #f3f4f6",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 8,
        }}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            Seller:{" "}
            <strong style={{ color: "#111" }}>{seller.shopName || seller.name}</strong>
            {seller.city && (
              <span style={{ color: "#9ca3af", marginLeft: 4 }}>· {seller.city}</span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 12px", background: "#25D366", color: "#fff",
                borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none",
              }}>
                <MessageCircle size={13} /> WhatsApp
              </a>
            )}
            {mailLink && (
              <a href={mailLink} style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 12px", background: "#fff", color: "#374151",
                border: "1.5px solid #e5e7eb", borderRadius: 8,
                fontSize: 12, fontWeight: 700, textDecoration: "none",
              }}>
                <Mail size={13} /> Email
              </a>
            )}
            {seller.whatsapp && (
              <span style={{
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 12, color: "#9ca3af",
              }}>
                <Phone size={12} /> {seller.whatsapp}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
export default function OrderHistoryTab() {
  const isMobile = useIsMobile();
  const [enquiries, setEnquiries] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [error,     setError]     = useState("");

  const loadEnquiries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetchMyEnquiries();
      if (data?.success === false) throw new Error(data.message || "Failed");
      setEnquiries(data?.enquiries || []);
    } catch {
      setError("Failed to load enquiry history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEnquiries(); }, [loadEnquiries]);

  const TABS = ["All", "New", "Contacted", "Closed"];
  const tabCounts = TABS.reduce((acc, tab) => {
    acc[tab] = tab === "All"
      ? enquiries.length
      : enquiries.filter(e => e.status === tab).length;
    return acc;
  }, {});

  const visible = activeTab === "All"
    ? enquiries
    : enquiries.filter(e => e.status === activeTab);

  return (
    <>
      <style>{`
        @keyframes eqFadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes eqPulse  { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes eqSpin   { to { transform:rotate(360deg); } }
        ::-webkit-scrollbar { display:none; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: "#111", margin: 0 }}>
          Enquiry History
        </h1>
        {!loading && (
          <span style={{
            fontSize: 13, fontWeight: 700, color: "#16a34a",
            background: "#dcfce7", padding: "3px 11px", borderRadius: 20,
          }}>
            {enquiries.length} Total
          </span>
        )}
      </div>

      {/* Status filter tabs */}
      <div style={{
        display: "flex", gap: 0,
        borderBottom: "2px solid #e5e7eb",
        marginBottom: 18, overflowX: "auto",
        scrollbarWidth: "none", WebkitOverflowScrolling: "touch",
      }}>
        {TABS.map(tab => {
          const active = activeTab === tab;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: isMobile ? "9px 12px" : "10px 16px",
              border: "none", background: "none", cursor: "pointer",
              fontSize: isMobile ? 12 : 13,
              fontWeight: active ? 700 : 500,
              color: active ? "#16a34a" : "#6b7280",
              borderBottom: active ? "2.5px solid #16a34a" : "2.5px solid transparent",
              marginBottom: -2, whiteSpace: "nowrap",
              fontFamily: "inherit", transition: "color 0.15s", flexShrink: 0,
            }}>
              {tab} ({tabCounts[tab] || 0})
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              background: "#fff", borderRadius: 14,
              padding: isMobile ? "14px 16px" : "16px 20px",
              display: "flex", gap: 12, border: "1px solid #f0f0f0",
            }}>
              <div style={{ width: 64, height: 64, borderRadius: 10, background: "#f0f0f0", flexShrink: 0, animation: "eqPulse 1.4s ease-in-out infinite" }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ height: 14, width: "50%", background: "#f0f0f0", borderRadius: 4, animation: "eqPulse 1.4s ease-in-out infinite" }} />
                <div style={{ height: 11, width: "30%", background: "#f0f0f0", borderRadius: 4, animation: "eqPulse 1.4s ease-in-out infinite" }} />
                <div style={{ height: 11, width: "60%", background: "#f0f0f0", borderRadius: 4, animation: "eqPulse 1.4s ease-in-out infinite" }} />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 24px", gap: 10, textAlign: "center" }}>
          <div style={{ fontSize: 32 }}>⚠️</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#dc2626" }}>{error}</div>
          <button onClick={loadEnquiries} style={{
            marginTop: 6, padding: "8px 18px", background: "#16a34a", color: "#fff",
            border: "none", borderRadius: 9, fontSize: 13, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            Retry
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 24px", gap: 14, textAlign: "center" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%", background: "#f3f4f6",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <MessageCircle size={30} color="#9ca3af" />
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#374151" }}>
            No {activeTab === "All" ? "" : activeTab} enquiries
          </div>
          <div style={{ fontSize: 13, color: "#9ca3af" }}>
            Enquiries you send to sellers will appear here.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {visible.map(enq => <EnquiryCard key={enq.id} enquiry={enq} />)}
        </div>
      )}
    </>
  );
}