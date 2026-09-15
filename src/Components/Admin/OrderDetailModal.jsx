// EnquiryDetailModal.jsx
import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("adminToken");
const authHdr = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const ENQUIRY_STATUSES = ["New", "Contacted", "Closed"];

// ── Status colors ─────────────────────────────────────────────────────────────
const statusStyle = (s) =>
  ({
    New:       { bg: "#dbeafe", color: "#1e40af" },
    Contacted: { bg: "#fef9c3", color: "#854d0e" },
    Closed:    { bg: "#dcfce7", color: "#166534" },
  }[s] || { bg: "#f3f4f6", color: "#374151" });

function Badge({ label }) {
  const s = statusStyle(label);
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 700,
      padding: "4px 12px", borderRadius: 99,
      display: "inline-block", whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

// ── Section Card ──────────────────────────────────────────────────────────────
function Section({ emoji, title, children, accent }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      border: `1px solid ${accent || "#e5e7eb"}`,
      overflow: "hidden",
      marginBottom: 12,
      boxShadow: "0 1px 4px rgba(0,0,0,.04)",
    }}>
      <div style={{
        padding: "12px 16px",
        borderBottom: `1px solid ${accent || "#f0f0f0"}`,
        background: accent ? `${accent}18` : "#fafafa",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontSize: 16 }}>{emoji}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#1a1a1a" }}>{title}</span>
      </div>
      <div style={{ padding: "14px 16px" }}>{children}</div>
    </div>
  );
}

// ── Info Row ──────────────────────────────────────────────────────────────────
function Row({ label, value, bold, color }) {
  if (!value || value === "—" || value === "") return null;
  return (
    <div style={{
      display: "flex", justifyContent: "space-between",
      alignItems: "flex-start", gap: 12,
      padding: "7px 0",
      borderBottom: "1px solid #f5f5f5",
    }}>
      <span style={{ color: "#9ca3af", fontSize: 12, flexShrink: 0, paddingTop: 1 }}>
        {label}
      </span>
      <span style={{
        fontWeight: bold ? 700 : 500,
        color: color || "#1a1a1a",
        fontSize: 13, textAlign: "right",
        wordBreak: "break-word", maxWidth: "65%",
      }}>
        {value}
      </span>
    </div>
  );
}

// ── WhatsApp Button ───────────────────────────────────────────────────────────
function WAButton({ phone, message }) {
  if (!phone) return null;
  const clean = phone.replace(/\D/g, "");
  const num   = clean.startsWith("91") ? clean : `91${clean}`;
  const url   = `https://wa.me/${num}?text=${encodeURIComponent(message || "")}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        width: "100%", padding: "13px",
        background: "linear-gradient(135deg, #25d366, #128c7e)",
        color: "#fff", borderRadius: 14,
        fontSize: 14, fontWeight: 700,
        textDecoration: "none",
        boxShadow: "0 4px 14px rgba(37,211,102,.35)",
        marginBottom: 10,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      WhatsApp karo
    </a>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════════
export default function EnquiryDetailModal({ enquiry: init, onClose, onStatusUpdate }) {
  const [enquiry,   setEnquiry]   = useState(init);
  const [fetching,  setFetching]  = useState(true);
  const [newStatus, setNewStatus] = useState(init?.status || "New");
  const [updating,  setUpdating]  = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // ── Fetch full enquiry ────────────────────────────────────────────────────
  useEffect(() => {
    if (!init?.id) return;
    setFetching(true);
    fetch(`${API_URL}/api/enquiry/admin/${init.id}`, { headers: authHdr() })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.enquiry) {
          setEnquiry(d.enquiry);
          setNewStatus(d.enquiry.status);
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [init?.id]);

  // ── ESC close ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  // ── Status update ─────────────────────────────────────────────────────────
  const handleStatusUpdate = async () => {
    setUpdating(true); setStatusMsg("");
    try {
      const res  = await fetch(`${API_URL}/api/enquiry/admin/${enquiry.id}/status`, {
        method: "PATCH", headers: authHdr(),
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setEnquiry(p => ({ ...p, status: newStatus }));
        setStatusMsg("success");
        onStatusUpdate?.(enquiry.id, newStatus);
      } else {
        setStatusMsg("error:" + (data.message || "Update failed"));
      }
    } catch { setStatusMsg("error:Network error"); }
    finally   { setUpdating(false); }
  };

  const { buyer, product, variant, seller } = enquiry || {};

  // WhatsApp pre-filled message
  const waMessage = product
    ? `Hello! I'm contacting you regarding an enquiry for "${product.name}"${variant ? ` (${variant.label})` : ""} on our platform.`
    : "";

  return (
    <>
      <style>{`
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes slideUp { from{opacity:0;transform:translateY(60px)} to{opacity:1;transform:translateY(0)} }
        .eq-pill { transition: all .15s; }
        .eq-pill:active { transform: scale(.95); }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={e => e.target === e.currentTarget && onClose()}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,.6)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}
      >
        {/* Bottom Sheet */}
        <div style={{
          background: "#f4f6f4",
          borderRadius: "22px 22px 0 0",
          width: "100%", maxWidth: 620,
          maxHeight: "94vh",
          overflowY: "auto",
          animation: "slideUp .3s cubic-bezier(.22,.61,.36,1)",
        }}>

          {/* Drag handle */}
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}>
            <div style={{ width: 40, height: 4, borderRadius: 99, background: "#d1d5db" }} />
          </div>

          {/* Sticky header */}
          <div style={{
            position: "sticky", top: 0, zIndex: 20,
            background: "#f4f6f4",
            padding: "10px 16px 12px",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 10,
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#1a1a1a" }}>
                Enquiry Details
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
                #{enquiry?.id} · {enquiry?.createdAt
                  ? new Date(enquiry.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric",
                    })
                  : ""}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              {enquiry?.status && <Badge label={enquiry.status} />}
              <button
                onClick={onClose}
                style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "#fff", border: "1px solid #e5e7eb",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", fontSize: 16, color: "#6b7280", flexShrink: 0,
                }}
              >✕</button>
            </div>
          </div>

          {/* Loading indicator */}
          {fetching && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, padding: "8px 0 4px", fontSize: 12, color: "#9ca3af",
            }}>
              <div style={{
                width: 13, height: 13,
                border: "2px solid #e5e7eb", borderTopColor: "#16a34a",
                borderRadius: "50%", animation: "spin .7s linear infinite",
              }} />
              Loading details…
            </div>
          )}

          {/* ── Content ── */}
          <div style={{ padding: "4px 14px 48px" }}>

            {/* ══ 1. PRODUCT ══ */}
            <Section emoji="📦" title="Product" accent="#7c3aed">
              <div style={{
                display: "flex", gap: 14, alignItems: "center",
                padding: "6px 0 14px", borderBottom: "1px solid #f0f0f0", marginBottom: 8,
              }}>
                {/* Image */}
                <div style={{
                  width: 68, height: 68, borderRadius: 14,
                  overflow: "hidden", background: "#f3f4f6",
                  flexShrink: 0, border: "1px solid #e5e7eb",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {product?.image
                    ? <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: 28 }}>📦</span>
                  }
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a", marginBottom: 6 }}>
                    {product?.name || "—"}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {variant?.label && (
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: "#7c3aed",
                        background: "#ede9fe", border: "1px solid #ddd6fe",
                        padding: "2px 10px", borderRadius: 99,
                      }}>
                        {variant.label}
                      </span>
                    )}
                    {product?.unit && (
                      <span style={{
                        fontSize: 11, color: "#9ca3af",
                        background: "#f3f4f6", padding: "2px 8px", borderRadius: 99,
                      }}>
                        {product.unit}
                      </span>
                    )}
                  </div>
                </div>
                {/* Price */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#7c3aed" }}>
                    ₹{Number(variant?.price || product?.price || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>per unit</div>
                </div>
              </div>
              <Row label="Product ID" value={`#${product?.id}`} />
            </Section>

            {/* ══ 2. BUYER ══ */}
            <Section emoji="👤" title="Buyer Info" accent="#2563eb">
              <Row label="Name"  value={buyer?.name}  bold />
              <Row label="Phone" value={buyer?.phone} color="#2563eb" bold />
              <Row label="Email" value={buyer?.email} />

              {/* Call / WhatsApp quick actions */}
              <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
                {buyer?.phone && (
                  <a
                    href={`tel:${buyer.phone}`}
                    style={{
                      flex: 1, display: "flex", alignItems: "center",
                      justifyContent: "center", gap: 6,
                      padding: "11px", borderRadius: 12,
                      background: "#eff6ff", border: "1px solid #bfdbfe",
                      color: "#1d4ed8", fontWeight: 700, fontSize: 13,
                      textDecoration: "none",
                    }}
                  >
                    📞 Call
                  </a>
                )}
                {buyer?.phone && (
                  <a
                    href={`https://wa.me/91${buyer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${buyer.name}! Regarding your enquiry for ${product?.name || "our product"}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1, display: "flex", alignItems: "center",
                      justifyContent: "center", gap: 6,
                      padding: "11px", borderRadius: 12,
                      background: "#f0fdf4", border: "1px solid #bbf7d0",
                      color: "#15803d", fontWeight: 700, fontSize: 13,
                      textDecoration: "none",
                    }}
                  >
                    💬 WhatsApp
                  </a>
                )}
              </div>
            </Section>

            {/* ══ 3. MESSAGE ══ */}
            {enquiry?.message && (
              <Section emoji="💬" title="Buyer's Message">
                <div style={{
                  fontSize: 13, color: "#374151", lineHeight: 1.8,
                  background: "#fffbeb", borderRadius: 10, padding: "12px 14px",
                  border: "1px solid #fde68a",
                }}>
                  "{enquiry.message}"
                </div>
              </Section>
            )}

            {/* ══ 4. SELLER ══ */}
            <Section emoji="🏪" title="Seller Details" accent="#16a34a">
              {seller ? (
                <>
                  <Row label="Shop"     value={seller.shopName}  bold color="#166534" />
                  <Row label="Category" value={seller.category} />
                  <Row label="Seller"   value={seller.name} />
                  <Row label="City"     value={seller.city} />
                  <Row label="State"    value={seller.state} />
                  <Row label="Email"    value={seller.email} />
                  <Row label="Mobile"   value={seller.whatsapp} />

                  {/* WhatsApp seller */}
                  <div style={{ marginTop: 14 }}>
                    <WAButton phone={seller.whatsapp} message={waMessage} />
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", padding: "8px 0" }}>
                  No seller linked — direct listing
                </div>
              )}
            </Section>

            {/* ══ 5. UPDATE STATUS ══ */}
            <Section emoji="🔄" title="Update Status" accent="#2563eb">
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: "#9ca3af",
                  marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px",
                }}>
                  Enquiry Status
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {ENQUIRY_STATUSES.map(s => {
                    const active = newStatus === s;
                    const sc     = statusStyle(s);
                    return (
                      <button
                        key={s}
                        className="eq-pill"
                        onClick={() => { setNewStatus(s); setStatusMsg(""); }}
                        style={{
                          padding: "9px 20px", borderRadius: 99,
                          fontSize: 13, fontWeight: 700,
                          cursor: "pointer", border: "none",
                          fontFamily: "inherit",
                          background: active ? sc.color : "#f3f4f6",
                          color: active ? "#fff" : "#6b7280",
                          boxShadow: active ? `0 2px 8px ${sc.color}55` : "none",
                        }}
                      >
                        {s === "New"       ? "🆕 New"       :
                         s === "Contacted" ? "📞 Contacted" :
                         s === "Closed"    ? "✅ Closed"    : s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status banners */}
              {newStatus === "Contacted" && (
                <div style={{
                  marginBottom: 14, background: "#fffbeb",
                  border: "1px solid #fcd34d", borderRadius: 10,
                  padding: "10px 14px", fontSize: 12, color: "#92400e", fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  📞 Buyer se contact ho gaya — follow up karte rehna
                </div>
              )}
              {newStatus === "Closed" && (
                <div style={{
                  marginBottom: 14, background: "#f0fdf4",
                  border: "1px solid #86efac", borderRadius: 10,
                  padding: "10px 14px", fontSize: 12, color: "#166534", fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  ✅ Enquiry close ho gayi — deal done ya no interest
                </div>
              )}

              {/* Feedback */}
              {statusMsg === "success" && (
                <div style={{
                  background: "#f0fdf4", border: "1px solid #86efac",
                  borderRadius: 10, padding: "10px 14px",
                  fontSize: 13, color: "#166534", fontWeight: 600, marginBottom: 12,
                }}>
                  ✓ Status updated successfully
                </div>
              )}
              {statusMsg.startsWith?.("error:") && (
                <div style={{
                  background: "#fef2f2", border: "1px solid #fca5a5",
                  borderRadius: 10, padding: "10px 14px",
                  fontSize: 13, color: "#991b1b", fontWeight: 600, marginBottom: 12,
                }}>
                  ✗ {statusMsg.slice(6)}
                </div>
              )}

              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                style={{
                  width: "100%", padding: "14px",
                  background: updating
                    ? "#9ca3af"
                    : "linear-gradient(135deg, #2563eb, #3b82f6)",
                  color: "#fff", border: "none", borderRadius: 14,
                  fontSize: 15, fontWeight: 700,
                  cursor: updating ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: updating ? "none" : "0 4px 14px rgba(37,99,235,.35)",
                }}
              >
                {updating ? (
                  <>
                    <div style={{
                      width: 15, height: 15,
                      border: "2px solid rgba(255,255,255,.4)",
                      borderTopColor: "#fff", borderRadius: "50%",
                      animation: "spin .7s linear infinite",
                    }} />
                    Updating…
                  </>
                ) : "✓ Save Status"}
              </button>
            </Section>

          </div>
        </div>
      </div>
    </>
  );
}