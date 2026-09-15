// src/Seller/SellerEnquiries.jsx
import { useState, useEffect, useCallback } from "react";
import {
  MessageCircle, RefreshCw, Search, X,
  ChevronDown, Package, Phone, Mail,
  Clock, CheckCircle, XCircle, AlertCircle,
  User, ShoppingBag,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem("sellerToken");

const authFetch = (url, opts = {}) =>
  fetch(`${API}${url}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });

const fmt = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_CFG = {
  New:       { color: "#1d4ed8", bg: "#dbeafe", border: "#bfdbfe", icon: Clock },
  Contacted: { color: "#b45309", bg: "#fef9c3", border: "#fde68a", icon: CheckCircle },
  Closed:    { color: "#15803d", bg: "#dcfce7", border: "#86efac", icon: XCircle },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { color: "#374151", bg: "#f3f4f6", border: "#e5e7eb", icon: AlertCircle };
  const Icon = cfg.icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      borderRadius: 99, padding: "3px 10px",
      fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
    }}>
      <Icon size={10} />
      {status}
    </span>
  );
}

// ── Enquiry Detail Sheet ───────────────────────────────────────────────────
function EnquirySheet({ enquiry, onClose, onStatusChange, updating }) {
  const product = enquiry.product || {};
  const buyer   = enquiry.buyer   || {};
  const variant = enquiry.variant;

  const waLink = buyer.phone
    ? `https://wa.me/${buyer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hi ${buyer.name}, I received your enquiry about "${product.name}". How can I help you?`
      )}`
    : null;

  const mailLink = buyer.email
    ? `mailto:${buyer.email}?subject=${encodeURIComponent(`Re: Enquiry about ${product.name}`)}`
    : null;

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,.55)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      <style>{`
        @keyframes sheetUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes spin     { to   { transform: rotate(360deg)  } }
      `}</style>
      <div style={{
        background: "#f5f7f5",
        borderRadius: "20px 20px 0 0",
        width: "100%", maxWidth: 560,
        maxHeight: "92vh", overflowY: "auto",
        animation: "sheetUp .28s cubic-bezier(.22,.61,.36,1)",
      }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 0" }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: "#d1d5db" }} />
        </div>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 18px 14px",
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a" }}>Enquiry Details</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>#{enquiry.id}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StatusBadge status={enquiry.status} />
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "#fff", border: "1px solid #e5e7eb",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}>
              <X size={14} color="#6b7280" />
            </button>
          </div>
        </div>

        <div style={{ padding: "0 14px 40px", display: "flex", flexDirection: "column", gap: 10 }}>

          {/* ── Buyer Details (full info for seller) ── */}
          <div style={card}>
            <div style={cardTitle}>👤 Buyer Details</div>
            <InfoRow label="Name"  value={buyer.name} />
            <InfoRow label="Phone" value={buyer.phone} />
            {buyer.email && <InfoRow label="Email" value={buyer.email} />}

            {/* Contact buttons */}
            <div style={{ padding: "10px 14px", display: "flex", gap: 8, flexWrap: "wrap" }}>
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "9px 0", background: "#25D366", color: "#fff",
                  borderRadius: 10, fontSize: 12, fontWeight: 700, textDecoration: "none",
                  minWidth: 120,
                }}>
                  <MessageCircle size={14} /> WhatsApp
                </a>
              )}
              {buyer.phone && (
                <a href={`tel:${buyer.phone}`} style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "9px 0", background: "#fff", color: "#374151",
                  border: "1.5px solid #e5e7eb", borderRadius: 10,
                  fontSize: 12, fontWeight: 700, textDecoration: "none",
                  minWidth: 100,
                }}>
                  <Phone size={14} /> Call
                </a>
              )}
              {mailLink && (
                <a href={mailLink} style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "9px 0", background: "#fff", color: "#374151",
                  border: "1.5px solid #e5e7eb", borderRadius: 10,
                  fontSize: 12, fontWeight: 700, textDecoration: "none",
                  minWidth: 100,
                }}>
                  <Mail size={14} /> Email
                </a>
              )}
            </div>
          </div>

          {/* ── Product Details ── */}
          <div style={card}>
            <div style={cardTitle}>📦 Product Enquired</div>
            <div style={{ padding: "12px 14px", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{
                width: 60, height: 60, borderRadius: 10, overflow: "hidden",
                background: "#f3f4f6", border: "1px solid #e5e7eb",
                flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {product.image
                  ? <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <Package size={22} color="#d1d5db" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>
                  {product.name || "—"}
                </div>
                {variant?.label && (
                  <span style={{
                    display: "inline-block", fontSize: 11, fontWeight: 700, color: "#16a34a",
                    background: "#f0fdf4", border: "1px solid #bbf7d0",
                    padding: "2px 8px", borderRadius: 5, marginBottom: 4,
                  }}>
                    {variant.label}
                  </span>
                )}
                {product.price && (
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#16a34a" }}>
                    ₹{Number(variant?.price || product.price).toFixed(2)}
                    {product.unit && (
                      <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400, marginLeft: 4 }}>
                        / {product.unit}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Buyer's Message ── */}
          {enquiry.message && (
            <div style={card}>
              <div style={cardTitle}>💬 Buyer's Message</div>
              <div style={{
                padding: "12px 14px",
                fontSize: 13, color: "#374151", lineHeight: 1.7,
                background: "#fffbeb", borderRadius: 8, margin: "10px 14px",
                border: "1px solid #fde68a",
              }}>
                "{enquiry.message}"
              </div>
            </div>
          )}

          {/* ── Enquiry Info ── */}
          <div style={card}>
            <div style={cardTitle}>📋 Enquiry Info</div>
            <InfoRow label="Received on" value={fmt(enquiry.createdAt)} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 14px", borderBottom: "1px solid #f9f9f9" }}>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>Status</span>
              <StatusBadge status={enquiry.status} />
            </div>
          </div>

          {/* ── Update Status ── */}
          <div style={card}>
            <div style={cardTitle}>🔄 Update Status</div>
            <div style={{ padding: "12px 14px", display: "flex", gap: 8 }}>
              {["New", "Contacted", "Closed"].map(s => {
                const cfg = STATUS_CFG[s];
                const active = enquiry.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => onStatusChange(enquiry.id, s)}
                    disabled={active || updating}
                    style={{
                      flex: 1, padding: "9px 4px", borderRadius: 10,
                      border: `2px solid ${active ? cfg.color : "#e5e7eb"}`,
                      background: active ? cfg.bg : "#fff",
                      color: active ? cfg.color : "#6b7280",
                      fontSize: 12, fontWeight: 700, cursor: active || updating ? "not-allowed" : "pointer",
                      fontFamily: "inherit", opacity: updating && !active ? 0.6 : 1,
                      transition: "all 0.15s",
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Shared styles ──────────────────────────────────────────────────────────
const card = {
  background: "#fff",
  borderRadius: 14,
  border: "1px solid #e5e7eb",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,.04)",
};
const cardTitle = {
  fontSize: 12, fontWeight: 800, color: "#374151",
  padding: "10px 14px", borderBottom: "1px solid #f0f0f0",
  background: "#fafafa",
};
const rowBase = {
  display: "flex", justifyContent: "space-between",
  alignItems: "center", padding: "7px 14px",
  borderBottom: "1px solid #f9f9f9", gap: 10,
};

function InfoRow({ label, value }) {
  if (!value || value === "—") return null;
  return (
    <div style={rowBase}>
      <span style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", textAlign: "right", wordBreak: "break-all", maxWidth: "65%" }}>
        {value}
      </span>
    </div>
  );
}

// ── Enquiry Card (list item) ───────────────────────────────────────────────
function EnquiryCard({ enquiry, onClick }) {
  const product = enquiry.product || {};
  const buyer   = enquiry.buyer   || {};
  const variant = enquiry.variant;

  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 14, overflow: "hidden",
        cursor: "pointer",
        boxShadow: "0 1px 3px rgba(0,0,0,.04)",
        transition: "box-shadow .15s",
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.10)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,.04)"}
    >
      {/* Top row */}
      <div style={{ padding: "12px 14px 10px", display: "flex", gap: 10, alignItems: "flex-start" }}>
        {/* Product thumbnail */}
        <div style={{
          width: 48, height: 48, borderRadius: 10,
          overflow: "hidden", background: "#f3f4f6",
          border: "1px solid #e5e7eb", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {product.image
            ? <img src={product.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <Package size={20} color="#d1d5db" />}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {product.name || "—"}
            </div>
            <StatusBadge status={enquiry.status} />
          </div>

          {variant?.label && (
            <span style={{
              display: "inline-block", marginTop: 3,
              fontSize: 10, fontWeight: 700, color: "#16a34a",
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              padding: "1px 7px", borderRadius: 99,
            }}>
              {variant.label}
            </span>
          )}

          {/* Buyer info preview */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
            <User size={11} color="#9ca3af" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{buyer.name || "—"}</span>
            <span style={{ fontSize: 11, color: "#9ca3af" }}>·</span>
            <Phone size={11} color="#9ca3af" />
            <span style={{ fontSize: 11, color: "#6b7280" }}>{buyer.phone || "—"}</span>
          </div>

          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>
            {fmt(enquiry.createdAt)}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 14px 12px",
        borderTop: "1px solid #f5f5f5",
      }}>
        <div style={{ fontSize: 12, color: "#6b7280" }}>
          {enquiry.message
            ? <span>"{enquiry.message.slice(0, 50)}{enquiry.message.length > 50 ? "…" : ""}"</span>
            : <span style={{ color: "#d1d5db" }}>No message</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#3a7d1e", flexShrink: 0 }}>
          View details
          <ChevronDown size={14} style={{ transform: "rotate(-90deg)" }} />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════
const TABS = [
  { key: "all",       label: "All" },
  { key: "New",       label: "New" },
  { key: "Contacted", label: "Contacted" },
  { key: "Closed",    label: "Closed" },
];

export default function SellerEnquiries() {
  const [enquiries,  setEnquiries]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState("");
  const [tab,        setTab]        = useState("all");
  const [selected,   setSelected]   = useState(null);
  const [error,      setError]      = useState("");
  const [updating,   setUpdating]   = useState(false);

  const fetchEnquiries = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const res  = await authFetch("/api/enquiry/seller");
      const data = await res.json();
      if (data.success) setEnquiries(data.enquiries || []);
      else setError(data.message || "Failed to load enquiries");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchEnquiries(); }, [fetchEnquiries]);

  // ── Update status ──────────────────────────────────────────────────────
  const handleStatusChange = async (id, status) => {
    setUpdating(true);
    try {
      const res  = await authFetch(`/api/enquiry/admin/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
        setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
      }
    } catch { }
    finally { setUpdating(false); }
  };

  // Stats
  const stats = {
    total:     enquiries.length,
    newCount:  enquiries.filter(e => e.status === "New").length,
    contacted: enquiries.filter(e => e.status === "Contacted").length,
    closed:    enquiries.filter(e => e.status === "Closed").length,
  };

  // Filter
  const visible = enquiries.filter(e => {
    const matchTab    = tab === "all" || e.status === tab;
    const matchSearch = !search ||
      e.buyer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.buyer?.phone?.includes(search) ||
      e.product?.name?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const tabCount = (key) => key === "all"
    ? enquiries.length
    : enquiries.filter(e => e.status === key).length;

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      height: "60vh", gap: 12, fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{
        width: 24, height: 24,
        border: "3px solid #e5e7eb", borderTopColor: "#3a7d1e",
        borderRadius: "50%", animation: "spin .7s linear infinite",
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{ fontSize: 13, color: "#9ca3af" }}>Loading enquiries…</span>
    </div>
  );

  // ── Error ────────────────────────────────────────────────────────────────
  if (error && enquiries.length === 0) return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      height: "60vh", gap: 12, padding: "24px 16px", textAlign: "center",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <AlertCircle size={36} color="#dc2626" />
      <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>{error}</div>
      <button onClick={() => fetchEnquiries()} style={{
        background: "#3a7d1e", color: "#fff", border: "none",
        borderRadius: 10, padding: "10px 20px",
        fontSize: 13, fontWeight: 700, cursor: "pointer",
      }}>
        Try Again
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7f5", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg) } }
        @keyframes sheetUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        ::-webkit-scrollbar { display: none }
      `}</style>

      {/* ── Sticky Header ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 50 }}>

        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 10px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#1a1a1a" }}>
              Enquiries
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>
              {stats.total} enquir{stats.total !== 1 ? "ies" : "y"} from buyers
            </p>
          </div>
          <button
            onClick={() => fetchEnquiries(true)}
            disabled={refreshing}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}
          >
            <RefreshCw size={15} color="#3a7d1e" style={{ animation: refreshing ? "spin .7s linear infinite" : "none" }} />
          </button>
        </div>

        {/* Stats strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0" }}>
          {[
            { label: "Total",     value: stats.total,     color: "#374151" },
            { label: "New",       value: stats.newCount,  color: "#1d4ed8" },
            { label: "Contacted", value: stats.contacted, color: "#b45309" },
            { label: "Closed",    value: stats.closed,    color: "#15803d" },
          ].map(({ label, value, color }, i, arr) => (
            <div key={label} style={{
              padding: "10px 4px", textAlign: "center",
              borderRight: i < arr.length - 1 ? "1px solid #f0f0f0" : "none",
            }}>
              <div style={{ fontSize: 15, fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600, marginTop: 1 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ padding: "10px 16px 0", position: "relative" }}>
          <Search size={13} color="#9ca3af" style={{ position: "absolute", left: 27, top: "50%", transform: "translateY(-30%)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by buyer name, phone or product…"
            style={{
              width: "100%", padding: "9px 32px 9px 32px",
              border: "1px solid #e5e7eb", borderRadius: 10,
              fontSize: 12, outline: "none", background: "#f9fafb",
              boxSizing: "border-box", fontFamily: "inherit",
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: 26, top: "50%", transform: "translateY(-30%)", background: "none", border: "none", cursor: "pointer", display: "flex" }}>
              <X size={13} color="#9ca3af" />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "10px 16px", scrollbarWidth: "none" }}>
          {TABS.map(({ key, label }) => {
            const count  = tabCount(key);
            const active = tab === key;
            const cfg    = STATUS_CFG[key] || {};
            return (
              <button key={key} onClick={() => setTab(key)} style={{
                padding: "6px 12px", borderRadius: 99, flexShrink: 0,
                border: active ? `1.5px solid ${cfg.color || "#3a7d1e"}` : "1.5px solid #e5e7eb",
                background: active ? (cfg.color || "#3a7d1e") : "#fff",
                color: active ? "#fff" : "#6b7280",
                fontSize: 11, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit",
              }}>
                {label}
                <span style={{
                  background: active ? "rgba(255,255,255,.25)" : "#f3f4f6",
                  color: active ? "#fff" : "#9ca3af",
                  borderRadius: 99, padding: "0 5px", fontSize: 9, fontWeight: 800,
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── List ── */}
      <div style={{ padding: "12px 16px 40px" }}>
        {visible.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            minHeight: 260, gap: 10, textAlign: "center",
          }}>
            <MessageCircle size={40} color="#e5e7eb" />
            <div style={{ fontSize: 14, fontWeight: 700, color: "#6b7280" }}>
              {search ? "No enquiries match your search" : "No enquiries yet"}
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>
              {search ? "Try a different keyword" : "Buyer enquiries for your products will appear here"}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {visible.map(enq => (
              <EnquiryCard key={enq.id} enquiry={enq} onClick={() => setSelected(enq)} />
            ))}
          </div>
        )}
      </div>

      {/* ── Detail Sheet ── */}
      {selected && (
        <EnquirySheet
          enquiry={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          updating={updating}
        />
      )}
    </div>
  );
}