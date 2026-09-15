// pages/admin/EnquiryList.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Eye, RefreshCw, Search, X, ChevronLeft, ChevronRight,
  ChevronDown, MessageSquare, Phone, CheckCircle, Clock,
  AlertCircle, RotateCcw, Store, SlidersHorizontal, Package,
} from "lucide-react";
import EnquiryDetailModal from "./OrderDetailModal";

const API_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("adminToken");
const authHdr = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const ENQUIRY_STATUSES = ["New", "Contacted", "Closed"];
const LIMIT = 20;

// ── Color helpers ─────────────────────────────────────────────────────────────
const statusColor = (s) =>
  ({
    New:       { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd", left: "#3b82f6" },
    Contacted: { bg: "#fef9c3", color: "#854d0e", border: "#fde047", left: "#eab308" },
    Closed:    { bg: "#dcfce7", color: "#166534", border: "#86efac", left: "#22c55e" },
  }[s] || { bg: "#f3f4f6", color: "#374151", border: "#d1d5db", left: "#9ca3af" });

const rowBg = (s) =>
  ({
    New:       "#f5f8ff",
    Contacted: "#fffef5",
    Closed:    "#f5fdf7",
  }[s] || "#fff");

// ── Badges ────────────────────────────────────────────────────────────────────
const StatusBadge = ({ label }) => {
  const c = statusColor(label);
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6,
      border: `1px solid ${c.border}`, background: c.bg, color: c.color,
      whiteSpace: "nowrap", display: "inline-block",
    }}>
      {label === "New" ? "🆕 New" : label === "Contacted" ? "📞 Contacted" : "✅ Closed"}
    </span>
  );
};

function FilterChip({ label, onRemove }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px",
      background: "#f0fdf4", border: "1.5px solid #86efac",
      borderRadius: 20, fontSize: 12, fontWeight: 700, color: "#16a34a",
    }}>
      {label}
      <button onClick={onRemove} style={{
        background: "none", border: "none", cursor: "pointer",
        color: "#16a34a", display: "flex", padding: 0, lineHeight: 1,
      }}>
        <X size={11} />
      </button>
    </span>
  );
}

// ── Dropdown ──────────────────────────────────────────────────────────────────
function Dropdown({ label, options, value, onChange, icon: Icon }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(p => !p)} style={{
        display: "flex", alignItems: "center", gap: 6, padding: "9px 13px",
        border: value ? "1.5px solid #16a34a" : "1.5px solid #e5e7eb",
        borderRadius: 10, background: value ? "#f0fdf4" : "#fff",
        cursor: "pointer", fontFamily: "inherit", fontSize: 13,
        fontWeight: 600, color: value ? "#16a34a" : "#374151", whiteSpace: "nowrap",
      }}>
        {Icon && <Icon size={14} />}
        {value || label}
        <ChevronDown size={13} style={{ opacity: 0.5 }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 300,
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,0.13)", minWidth: 160, overflow: "hidden",
        }}>
          <div onClick={() => { onChange(""); setOpen(false); }} style={{
            padding: "10px 15px", cursor: "pointer", fontSize: 13,
            color: "#9ca3af", borderBottom: "1px solid #f3f4f6",
          }}>All</div>
          {options.map(opt => (
            <div key={opt} onClick={() => { onChange(opt); setOpen(false); }} style={{
              padding: "10px 15px", cursor: "pointer", fontSize: 13,
              fontWeight: value === opt ? 700 : 400,
              color: value === opt ? "#16a34a" : "#374151",
              background: value === opt ? "#f0fdf4" : "transparent",
            }}>{opt}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Mobile Enquiry Card ───────────────────────────────────────────────────────
function EnquiryCard({ enquiry, onView }) {
  const sc = statusColor(enquiry.status);
  return (
    <div style={{
      background: "#fff", borderRadius: 14, overflow: "hidden",
      boxShadow: "0 1px 6px rgba(0,0,0,.06)", marginBottom: 10,
      display: "flex", borderLeft: `4px solid ${sc.left}`,
    }}>
      <div style={{ flex: 1, padding: "14px 14px 12px" }}>

        {/* Row 1: buyer name + product */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 14, fontWeight: 800, color: "#111827", lineHeight: 1.2,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180,
            }}>
              {enquiry.buyer?.name || "—"}
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
              {enquiry.buyer?.phone}
            </div>
          </div>
          {/* Product image */}
          <div style={{
            width: 40, height: 40, borderRadius: 10, overflow: "hidden",
            background: "#f3f4f6", border: "1px solid #e5e7eb", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {enquiry.product?.image
              ? <img src={enquiry.product.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <Package size={16} color="#9ca3af" />
            }
          </div>
        </div>

        {/* Row 2: product name + shop */}
        <div style={{ marginTop: 8 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: "#374151",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200,
          }}>
            📦 {enquiry.product?.name || "—"}
            {enquiry.variant?.label && (
              <span style={{ color: "#7c3aed", marginLeft: 4 }}>· {enquiry.variant.label}</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            <Store size={11} color="#16a34a" />
            <span style={{
              fontSize: 11, fontWeight: 700, color: "#166534",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 130,
            }}>
              {enquiry.seller?.shopName || enquiry.seller?.name || "No Seller"}
            </span>
            <span style={{ color: "#e5e7eb" }}>·</span>
            <span style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>
              {new Date(enquiry.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
            </span>
          </div>
        </div>

        {/* Row 3: status badge */}
        <div style={{ marginTop: 9 }}>
          <StatusBadge label={enquiry.status} />
        </div>
      </div>

      {/* View button */}
      <button onClick={() => onView(enquiry)} style={{
        width: 52, flexShrink: 0, background: "#f0fdf4",
        border: "none", borderLeft: "1px solid #dcfce7",
        cursor: "pointer", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 4,
        color: "#16a34a", fontFamily: "inherit",
      }}>
        <Eye size={16} />
        <span style={{ fontSize: 10, fontWeight: 700 }}>View</span>
      </button>
    </div>
  );
}

// ── Table styles ──────────────────────────────────────────────────────────────
const TH = {
  padding: "11px 14px", fontSize: 11, fontWeight: 700, color: "#9ca3af",
  textAlign: "left", whiteSpace: "nowrap", textTransform: "uppercase",
  letterSpacing: "0.5px", borderBottom: "2px solid #f0f0f0",
  background: "#fafafa", userSelect: "none",
};
const TD = {
  padding: "13px 14px", fontSize: 13, color: "#374151",
  borderBottom: "1px solid #f5f5f5", verticalAlign: "middle",
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function EnquiryList() {
  const [enquiries,       setEnquiries]       = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState("");
  const [total,           setTotal]           = useState(0);
  const [page,            setPage]            = useState(1);
  const [pages,           setPages]           = useState(1);

  const [search,          setSearch]          = useState("");
  const [searchInput,     setSearchInput]     = useState("");
  const [statusFilter,    setStatusFilter]    = useState("");
  const [showFilters,     setShowFilters]     = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchEnquiries = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (search)       params.set("search", search.trim());
      if (statusFilter) params.set("status", statusFilter);

      const res  = await fetch(`${API_URL}/api/enquiry/admin/all?${params}`, { headers: authHdr() });
      const data = await res.json();
      if (data.success) {
        setEnquiries(data.enquiries || []);
        setTotal(data.total  || 0);
        setPages(data.pages  || 1);
      } else {
        setError(data.message || "Failed to load enquiries");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchEnquiries(); }, [fetchEnquiries]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const commitSearch  = () => { setSearch(searchInput); setPage(1); };
  const clearSearch   = () => { setSearchInput(""); setSearch(""); setPage(1); };
  const resetFilters  = () => {
    setSearch(""); setSearchInput(""); setStatusFilter(""); setPage(1);
  };
  const handleStatusUpdate = (id, newStatus) => {
    setEnquiries(prev =>
      prev.map(e => e.id === id ? { ...e, status: newStatus } : e)
    );
    if (selectedEnquiry?.id === id) {
      setSelectedEnquiry(prev => ({ ...prev, status: newStatus }));
    }
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const newCount       = enquiries.filter(e => e.status === "New").length;
  const contactedCount = enquiries.filter(e => e.status === "Contacted").length;
  const closedCount    = enquiries.filter(e => e.status === "Closed").length;
  const activeFilters  = [statusFilter].filter(Boolean).length;
  const hasAnyFilter   = !!(search || activeFilters);

  return (
    <div style={{ minHeight: "100vh", background: "#f2f4f2", fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:4px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .enq-row td { transition: background 0.1s; }
        .enq-row:hover td { filter: brightness(0.965); }
        .show-desktop { display: block !important; }
        .show-mobile  { display: none  !important; }
        @media (max-width: 700px) {
          .show-desktop { display: none  !important; }
          .show-mobile  { display: block !important; }
          .stat-grid    { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 14px 40px" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#111827" }}>Enquiries</h1>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#9ca3af" }}>
              {total} total enquiries
            </p>
          </div>
          <button onClick={fetchEnquiries} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "9px 16px",
            background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 10,
            cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#374151",
          }}>
            <RefreshCw size={14} />
            <span className="show-desktop">Refresh</span>
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="stat-grid" style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16,
        }}>
          {[
            { label: "Total",     value: total,         icon: MessageSquare, color: "#1a2332" },
            { label: "New",       value: newCount,      icon: Clock,         color: "#1e40af" },
            { label: "Contacted", value: contactedCount, icon: Phone,        color: "#d97706" },
            { label: "Closed",    value: closedCount,   icon: CheckCircle,   color: "#16a34a" },
          ].map((s, i) => (
            <div key={i} style={{
              background: "#fff", borderRadius: 12, padding: "13px 14px",
              boxShadow: "0 1px 6px rgba(0,0,0,.05)",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9, background: "#f0fdf4",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <s.icon size={16} color={s.color} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>{s.label}</p>
                <p style={{ margin: 0, fontSize: 17, fontWeight: 900, color: s.color }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter Bar ── */}
        <div style={{
          background: "#fff", borderRadius: 14, padding: "12px 14px",
          boxShadow: "0 1px 6px rgba(0,0,0,.05)", marginBottom: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>

            {/* Search */}
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={14} style={{
                position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#9ca3af",
              }} />
              <input
                type="text"
                placeholder="Search buyer, phone, product, shop…"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") commitSearch(); }}
                style={{
                  width: "100%", paddingLeft: 34, paddingRight: searchInput ? 34 : 12,
                  paddingTop: 10, paddingBottom: 10,
                  border: search ? "1.5px solid #16a34a" : "1.5px solid #e5e7eb",
                  borderRadius: 10, fontSize: 13, fontFamily: "inherit",
                  color: "#374151", outline: "none",
                  background: search ? "#f0fdf4" : "#fff",
                }}
              />
              {searchInput && (
                <button onClick={clearSearch} style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#9ca3af",
                  display: "flex", padding: 0,
                }}>
                  <X size={13} />
                </button>
              )}
            </div>

            <button onClick={commitSearch} style={{
              display: "flex", alignItems: "center", gap: 5, padding: "10px 16px",
              background: "#16a34a", border: "none", borderRadius: 10,
              cursor: "pointer", fontFamily: "inherit", fontSize: 13,
              fontWeight: 700, color: "#fff", whiteSpace: "nowrap",
            }}>
              <Search size={14} /> Search
            </button>

            {/* Status filter — always visible */}
            <Dropdown
              label="Status"
              options={ENQUIRY_STATUSES}
              value={statusFilter}
              onChange={v => { setStatusFilter(v); setPage(1); }}
              icon={MessageSquare}
            />

            {/* Advanced toggle */}
            <button onClick={() => setShowFilters(p => !p)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "9px 13px",
              border: `1.5px solid ${showFilters ? "#16a34a" : "#e5e7eb"}`,
              borderRadius: 10, background: showFilters ? "#f0fdf4" : "#fff",
              cursor: "pointer", fontFamily: "inherit", fontSize: 13,
              fontWeight: 600, color: showFilters ? "#16a34a" : "#374151",
            }}>
              <SlidersHorizontal size={14} />
              <span className="show-desktop">Filters</span>
            </button>

            {hasAnyFilter && (
              <button onClick={resetFilters} style={{
                display: "flex", alignItems: "center", gap: 5, padding: "9px 13px",
                border: "1.5px solid #fee2e2", borderRadius: 10, background: "#fef2f2",
                cursor: "pointer", fontFamily: "inherit", fontSize: 13,
                fontWeight: 600, color: "#ef4444", whiteSpace: "nowrap",
              }}>
                <RotateCcw size={13} />
                <span className="show-desktop">Clear</span>
              </button>
            )}
          </div>

          {/* Quick status filter pills — in expanded panel */}
          {showFilters && (
            <div style={{
              marginTop: 12, paddingTop: 12, borderTop: "1px solid #f3f4f6",
              display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center",
            }}>
              <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>Quick filter:</span>
              {ENQUIRY_STATUSES.map(s => {
                const sc = statusColor(s);
                const active = statusFilter === s;
                return (
                  <button key={s} onClick={() => { setStatusFilter(active ? "" : s); setPage(1); }} style={{
                    padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 700,
                    border: `1.5px solid ${active ? sc.color : sc.border}`,
                    background: active ? sc.color : sc.bg,
                    color: active ? "#fff" : sc.color,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>
                    {s === "New" ? "🆕 " : s === "Contacted" ? "📞 " : "✅ "}{s}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Active Filter Chips ── */}
        {hasAnyFilter && (
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
            {search       && <FilterChip label={`"${search}"`} onRemove={clearSearch} />}
            {statusFilter && <FilterChip label={statusFilter}  onRemove={() => { setStatusFilter(""); setPage(1); }} />}
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
            background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10,
            marginBottom: 12, fontSize: 13, color: "#ef4444",
          }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {/* ══ MOBILE CARDS ══ */}
        <div className="show-mobile">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 14, marginBottom: 10,
                padding: 14, border: "1px solid #e5e7eb", borderLeft: "4px solid #e5e7eb",
              }}>
                {[70, 100, 55].map((w, j) => (
                  <div key={j} style={{
                    height: 12, background: "#f3f4f6", borderRadius: 4,
                    width: `${w}%`, marginBottom: 9,
                    animation: "pulse 1.4s ease-in-out infinite",
                  }} />
                ))}
              </div>
            ))
          ) : enquiries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "56px 0", color: "#9ca3af" }}>
              <MessageSquare size={40} style={{ opacity: 0.25, margin: "0 auto 12px" }} />
              <p style={{ margin: "0 0 14px", fontSize: 14 }}>No enquiries found</p>
              {hasAnyFilter && (
                <button onClick={resetFilters} style={{
                  padding: "9px 20px", background: "#f0fdf4",
                  border: "1.5px solid #86efac", borderRadius: 10, cursor: "pointer",
                  fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#16a34a",
                }}>Clear filters</button>
              )}
            </div>
          ) : (
            enquiries.map(e => <EnquiryCard key={e.id} enquiry={e} onView={setSelectedEnquiry} />)
          )}

          {/* Mobile pagination */}
          {pages > 1 && !loading && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 8 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
                padding: "10px 18px", border: "1.5px solid #e5e7eb", borderRadius: 10,
                background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 13, fontWeight: 700, color: "#374151", opacity: page === 1 ? 0.4 : 1,
              }}>
                <ChevronLeft size={15} /> Prev
              </button>
              <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 700 }}>{page} / {pages}</span>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} style={{
                padding: "10px 18px", border: "1.5px solid #e5e7eb", borderRadius: 10,
                background: "#fff", cursor: page === pages ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 13, fontWeight: 700, color: "#374151", opacity: page === pages ? 0.4 : 1,
              }}>
                Next <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>

        {/* ══ DESKTOP TABLE ══ */}
        <div className="show-desktop">
          <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,.05)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
                <thead>
                  <tr>
                    {["Date", "Product", "Buyer", "Seller / Shop", "Status", "Action"].map((col, i) => (
                      <th key={i} style={TH}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} style={TD}>
                            <div style={{
                              height: 13, background: "#f3f4f6", borderRadius: 4,
                              width: j === 5 ? "40%" : "70%",
                              animation: "pulse 1.4s ease-in-out infinite",
                            }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : enquiries.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ ...TD, textAlign: "center", padding: "56px 0", color: "#9ca3af" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                          <MessageSquare size={36} style={{ opacity: 0.25 }} />
                          <p style={{ margin: 0, fontSize: 14 }}>No enquiries found</p>
                          {hasAnyFilter && (
                            <button onClick={resetFilters} style={{
                              marginTop: 4, padding: "8px 18px", background: "#f0fdf4",
                              border: "1.5px solid #86efac", borderRadius: 9, cursor: "pointer",
                              fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "#16a34a",
                            }}>Clear filters</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    enquiries.map(enq => {
                      const sc  = statusColor(enq.status);
                      const bg  = rowBg(enq.status);
                      const tdS = { ...TD, background: bg };
                      return (
                        <tr key={enq.id} className="enq-row">

                          {/* Date */}
                          <td style={{ ...tdS, borderLeft: `3px solid ${sc.left}` }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>
                              {new Date(enq.createdAt).toLocaleDateString("en-IN", {
                                day: "2-digit", month: "short", year: "numeric",
                              })}
                            </div>
                            <div style={{ fontSize: 11, color: "#9ca3af" }}>
                              {new Date(enq.createdAt).toLocaleTimeString("en-IN", {
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </div>
                          </td>

                          {/* Product */}
                          <td style={tdS}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{
                                width: 38, height: 38, borderRadius: 10, overflow: "hidden",
                                background: "#f3f4f6", border: "1px solid #e5e7eb", flexShrink: 0,
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}>
                                {enq.product?.image
                                  ? <img src={enq.product.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                  : <Package size={15} color="#9ca3af" />
                                }
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{
                                  fontWeight: 700, fontSize: 13, color: "#111827",
                                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160,
                                }}>
                                  {enq.product?.name || "—"}
                                </div>
                                {enq.variant?.label && (
                                  <span style={{
                                    fontSize: 10, fontWeight: 700, color: "#7c3aed",
                                    background: "#ede9fe", padding: "1px 7px", borderRadius: 99,
                                  }}>
                                    {enq.variant.label}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Buyer */}
                          <td style={tdS}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>
                              {enq.buyer?.name || "—"}
                            </div>
                            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                              📞 {enq.buyer?.phone || "—"}
                            </div>
                          </td>

                          {/* Seller */}
                          <td style={tdS}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{
                                width: 30, height: 30, borderRadius: 8, background: "#f0fdf4",
                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                              }}>
                                <Store size={14} color="#16a34a" />
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, fontSize: 12, color: "#166534" }}>
                                  {enq.seller?.shopName || enq.seller?.name || "No Seller"}
                                </div>
                                {enq.seller?.shopName && enq.seller?.name && (
                                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{enq.seller.name}</div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td style={tdS}>
                            <StatusBadge label={enq.status} />
                          </td>

                          {/* Action */}
                          <td style={tdS}>
                            <button onClick={() => setSelectedEnquiry(enq)} style={{
                              display: "flex", alignItems: "center", gap: 5, padding: "7px 14px",
                              background: "#f0fdf4", border: "1.5px solid #86efac",
                              borderRadius: 8, cursor: "pointer", fontFamily: "inherit",
                              fontSize: 12, fontWeight: 700, color: "#16a34a",
                            }}>
                              <Eye size={13} /> View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Desktop pagination */}
            {pages > 1 && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 20px", borderTop: "1px solid #f3f4f6", flexWrap: "wrap", gap: 10,
              }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>
                  {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} enquiries
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
                    padding: "7px 10px", border: "1.5px solid #e5e7eb", borderRadius: 8,
                    background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", opacity: page === 1 ? 0.4 : 1,
                  }}>
                    <ChevronLeft size={15} />
                  </button>
                  {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                    let p = i + 1;
                    if (pages > 5 && page > 3) p = page - 2 + i;
                    if (p > pages) return null;
                    return (
                      <button key={p} onClick={() => setPage(p)} style={{
                        width: 34, height: 34,
                        border: `1.5px solid ${page === p ? "#16a34a" : "#e5e7eb"}`,
                        borderRadius: 8, background: page === p ? "#16a34a" : "#fff",
                        color: page === p ? "#fff" : "#374151",
                        fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                      }}>{p}</button>
                    );
                  })}
                  <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} style={{
                    padding: "7px 10px", border: "1.5px solid #e5e7eb", borderRadius: 8,
                    background: "#fff", cursor: page === pages ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", opacity: page === pages ? 0.4 : 1,
                  }}>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selectedEnquiry && (
        <EnquiryDetailModal
          enquiry={selectedEnquiry}
          onClose={() => setSelectedEnquiry(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}