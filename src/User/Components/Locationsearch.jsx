// src/components/LocationSearch.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL;

// ─── Icons ────────────────────────────────────────────────────
const SearchIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const LocationIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);
const PincodeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);
const AddressIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);
const BackIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
);
const CartIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
);

// ─── Skeleton Card ────────────────────────────────────────────
const SkeletonCard = () => (
    <div style={{
        background: "#fff", borderRadius: 16,
        overflow: "hidden", border: "1px solid #e8f5e1",
    }}>
        <div style={{
            height: 140,
            background: "linear-gradient(90deg,#e8f5e9 25%,#c8e6c9 50%,#e8f5e9 75%)",
            backgroundSize: "800px 100%",
            animation: "shimmer 1.6s linear infinite",
        }} />
        <div style={{ padding: "12px 14px" }}>
            {[80, 60, 40].map((w, i) => (
                <div key={i} style={{
                    height: 10, borderRadius: 5, marginBottom: 8,
                    width: `${w}%`,
                    background: "linear-gradient(90deg,#e8f5e9 25%,#c8e6c9 50%,#e8f5e9 75%)",
                    backgroundSize: "800px 100%",
                    animation: "shimmer 1.6s linear infinite",
                }} />
            ))}
        </div>
    </div>
);

// ─── Product Card ─────────────────────────────────────────────
const ProductCard = ({ product, isMobile, onAddCart }) => {
    const [hovered, setHovered] = useState(false);
    const navigate = useNavigate();
    const discount = product.buyingPrice && product.sellingPrice &&
        Number(product.buyingPrice) > Number(product.sellingPrice)
        ? Math.round(((Number(product.buyingPrice) - Number(product.sellingPrice)) / Number(product.buyingPrice)) * 100)
        : null;

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => navigate(`/user/product/${product.id}`)}
            style={{
                background: "#fff", borderRadius: 16, overflow: "hidden",
                border: hovered ? "1.5px solid #22c55e" : "1.5px solid #e8f5e1",
                cursor: "pointer", transition: "all 0.25s ease",
                transform: hovered ? "translateY(-4px)" : "none",
                boxShadow: hovered ? "0 16px 40px rgba(34,197,94,0.14)" : "0 2px 8px rgba(0,0,0,0.05)",
            }}
        >
            <div style={{ position: "relative", height: isMobile ? 120 : 150 }}>
                <img
                    src={product.thumbnail}
                    alt={product.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={e => { e.target.src = "https://via.placeholder.com/150x150/f0fdf4/22c55e?text=No+Image"; }}
                />
                {discount && (
                    <div style={{
                        position: "absolute", top: 8, left: 8,
                        background: "#ef4444", color: "#fff",
                        fontSize: 10, fontWeight: 800, padding: "3px 7px", borderRadius: 6,
                    }}>{discount}% OFF</div>
                )}
            </div>

            <div style={{ padding: isMobile ? "10px 10px 12px" : "12px 14px 14px" }}>
                <div style={{
                    fontSize: isMobile ? 12 : 13, fontWeight: 700,
                    color: "#1a1a1a", marginBottom: 4, lineHeight: 1.35,
                    overflow: "hidden", display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                }}>{product.name}</div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                    {product.district && (
                        <span style={{
                            fontSize: 9, fontWeight: 700, color: "#15803d",
                            background: "#f0fdf4", border: "1px solid #bbf7d0",
                            borderRadius: 5, padding: "2px 6px",
                        }}>📍 {product.district}</span>
                    )}
                    {product.pincode && (
                        <span style={{
                            fontSize: 9, fontWeight: 700, color: "#1d4ed8",
                            background: "#eff6ff", border: "1px solid #bfdbfe",
                            borderRadius: 5, padding: "2px 6px",
                        }}>🔑 {product.pincode}</span>
                    )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <span style={{ fontSize: isMobile ? 14 : 16, fontWeight: 900, color: "#16a34a" }}>
                        ₹{Number(product.sellingPrice).toLocaleString("en-IN")}
                    </span>
                    {product.buyingPrice && Number(product.buyingPrice) > Number(product.sellingPrice) && (
                        <span style={{ fontSize: 11, color: "#94a3b8", textDecoration: "line-through" }}>
                            ₹{Number(product.buyingPrice).toLocaleString("en-IN")}
                        </span>
                    )}
                </div>

                <button
                    onClick={e => { e.stopPropagation(); onAddCart(product); }}
                    style={{
                        width: "100%",
                        background: "linear-gradient(135deg,#2d5a1b,#16a34a)",
                        color: "#fff", border: "none", borderRadius: 10,
                        padding: isMobile ? "8px" : "9px",
                        fontSize: isMobile ? 11 : 12, fontWeight: 800,
                        cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                        transition: "opacity 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                    <CartIcon /> Add to Cart
                </button>
            </div>
        </div>
    );
};

// ─── Category Group Card ──────────────────────────────────────
const CategoryGroupCard = ({ category, count, isMobile, onClick }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onClick}
            style={{
                background: hovered ? "linear-gradient(135deg,#f0fdf4,#dcfce7)" : "#fff",
                borderRadius: 16, padding: isMobile ? "14px 12px" : "18px 16px",
                border: hovered ? "1.5px solid #22c55e" : "1.5px solid #e8f5e1",
                cursor: "pointer", transition: "all 0.25s ease",
                transform: hovered ? "translateY(-3px)" : "none",
                boxShadow: hovered ? "0 12px 30px rgba(34,197,94,0.15)" : "0 2px 8px rgba(0,0,0,0.05)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}
        >
            <div>
                <div style={{ fontSize: isMobile ? 13 : 15, fontWeight: 800, color: "#14532d", marginBottom: 4 }}>
                    {category}
                </div>
                <div style={{ fontSize: isMobile ? 11 : 12, fontWeight: 600, color: "#16a34a" }}>
                    {count} product{count !== 1 ? "s" : ""} available
                </div>
            </div>
            <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: hovered ? "#16a34a" : "#f0fdf4",
                border: "1.5px solid #bbf7d0",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
            }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={hovered ? "#fff" : "#16a34a"} strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6" />
                </svg>
            </div>
        </div>
    );
};

// ── Highlight matched text ─────────────────────────────────────
const Highlight = ({ text, query, color }) => {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <span>{text}</span>;
    return (
        <span>
            {text.slice(0, idx)}
            <strong style={{ color }}>{text.slice(idx, idx + query.length)}</strong>
            {text.slice(idx + query.length)}
        </span>
    );
};

// ══════════════════════════════════════════════════════════════
// LOCATION SEARCH SECTION
// ══════════════════════════════════════════════════════════════
export function LocationSearchSection({ isMobile }) {
    const navigate = useNavigate();

    const [activeType, setActiveType] = useState(null);
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [sugLoading, setSugLoading] = useState(false);

    const inputRef = useRef();
    const wrapperRef = useRef();
    const debounceRef = useRef();

    const searchTypes = [
        {
            key: "district", label: "By District", icon: <LocationIcon />,
            placeholder: "Enter district name…",
            color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0",
            typeLabel: "District",
        },
        {
            key: "pincode", label: "By Pincode", icon: <PincodeIcon />,
            placeholder: "Enter 6-digit pincode…",
            color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe",
            typeLabel: "Pincode",
        },
        {
            key: "address", label: "By Area", icon: <AddressIcon />,
            placeholder: "Enter area / village / locality…",
            color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe",
            typeLabel: "Area",
        },
    ];

    const active = searchTypes.find(s => s.key === activeType);

    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleTypeClick = (key) => {
        setActiveType(key);
        setQuery("");
        setSuggestions([]);
        setShowDropdown(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleQueryChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        setShowDropdown(false);
        clearTimeout(debounceRef.current);

        if (!val.trim()) {
            setSuggestions([]);
            return;
        }

        setSugLoading(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(
                    `${API_BASE}/api/Products/location-suggestions?type=${activeType}&q=${encodeURIComponent(val.trim())}`
                );
                const data = await res.json();
                const list = data.suggestions || [];
                setSuggestions(list);
                setShowDropdown(list.length > 0);
            } catch {
                setSuggestions([]);
            } finally {
                setSugLoading(false);
            }
        }, 300);
    };

    const handleSearch = () => {
        if (!query.trim()) return;
        setShowDropdown(false);
        navigate(`/user/location-products?type=${activeType}&q=${encodeURIComponent(query.trim())}`);
    };

    const handleSuggestionClick = (val) => {
        setQuery(val);
        setSuggestions([]);
        setShowDropdown(false);
        navigate(`/user/location-products?type=${activeType}&q=${encodeURIComponent(val)}`);
    };

    const handleClear = () => {
        setQuery("");
        setSuggestions([]);
        setShowDropdown(false);
        inputRef.current?.focus();
    };

    return (
        <section style={{ marginBottom: isMobile ? 44 : 68, position: "relative", zIndex: 10 }}>
            {/* ── Section Header ── */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: isMobile ? 18 : 26 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                        width: 4, height: 26, borderRadius: 2,
                        background: "linear-gradient(180deg,#16a34a,#4ade80,#86efac,#4ade80,#16a34a)",
                        backgroundSize: "100% 300%",
                        animation: "bgShift 3s ease infinite",
                    }} />
                    <div>
                        <h2 style={{
                            fontSize: isMobile ? 17 : 22, fontWeight: 900, color: "#14532d",
                            margin: 0, lineHeight: 1.1, letterSpacing: "-0.3px",
                        }}>Shop Near You</h2>
                        <p style={{
                            fontSize: isMobile ? 11 : 13, color: "#4ade80",
                            margin: "3px 0 0", fontWeight: 600,
                        }}>Find local products from your area</p>
                    </div>
                </div>
            </div>

            {/* ── Main Card ── */}
            <div style={{
                background: "#fff", border: "1.5px solid #e8f5e1",
                borderRadius: isMobile ? 18 : 22,
                padding: isMobile ? "16px" : "24px",
                boxShadow: "0 4px 24px rgba(34,197,94,0.08)",
                position: "relative",
                zIndex: 10,
            }}>
                {/* 3 type buttons */}
                <div style={{
                    display: "grid", gridTemplateColumns: "repeat(3,1fr)",
                    gap: isMobile ? 8 : 12,
                    marginBottom: activeType ? 16 : 0,
                }}>
                    {searchTypes.map(t => {
                        const isActive = activeType === t.key;
                        return (
                            <button
                                key={t.key}
                                onClick={() => handleTypeClick(t.key)}
                                style={{
                                    display: "flex", flexDirection: "column",
                                    alignItems: "center", justifyContent: "center",
                                    gap: 6, padding: isMobile ? "12px 6px" : "16px 10px",
                                    background: isActive ? t.bg : "#fafafa",
                                    border: `1.5px solid ${isActive ? t.color : "#e5e7eb"}`,
                                    borderRadius: 14, cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    color: isActive ? t.color : "#6b7280",
                                    boxShadow: isActive ? `0 4px 16px ${t.color}22` : "none",
                                }}
                            >
                                <div style={{
                                    width: isMobile ? 32 : 38, height: isMobile ? 32 : 38,
                                    borderRadius: 10,
                                    background: isActive ? t.color : "#f3f4f6",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: isActive ? "#fff" : "#9ca3af",
                                    transition: "all 0.2s ease",
                                }}>
                                    {t.icon}
                                </div>
                                <span style={{
                                    fontSize: isMobile ? 10 : 12, fontWeight: 700,
                                    textAlign: "center", lineHeight: 1.2,
                                }}>
                                    {t.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Search bar + dropdown */}
                {activeType && active && (
                    <div style={{ animation: "fadeUp 0.25s ease both" }}>
                        <div ref={wrapperRef} style={{ position: "relative" }}>
                            {/* Input row */}
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <div style={{
                                    flex: 1, display: "flex", alignItems: "center",
                                    gap: 10, padding: "0 14px",
                                    background: active.bg,
                                    border: `1.5px solid ${showDropdown ? active.color : active.border}`,
                                    borderRadius: showDropdown ? "12px 12px 0 0" : 12,
                                    height: isMobile ? 46 : 50,
                                    transition: "border-radius 0.15s ease, border-color 0.2s ease",
                                }}>
                                    <span style={{ color: active.color, flexShrink: 0 }}>{active.icon}</span>
                                    <input
                                        ref={inputRef}
                                        value={query}
                                        onChange={handleQueryChange}
                                        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                                        onKeyDown={e => {
                                            if (e.key === "Enter") { setShowDropdown(false); handleSearch(); }
                                            if (e.key === "Escape") { setShowDropdown(false); }
                                        }}
                                        placeholder={active.placeholder}
                                        maxLength={activeType === "pincode" ? 6 : 100}
                                        type={activeType === "pincode" ? "number" : "text"}
                                        style={{
                                            flex: 1, border: "none", background: "transparent",
                                            fontSize: isMobile ? 13 : 14, color: "#1a1a1a",
                                            outline: "none", fontFamily: "inherit",
                                        }}
                                    />
                                    {sugLoading && (
                                        <div style={{
                                            width: 15, height: 15, borderRadius: "50%",
                                            border: "2px solid #e5e7eb",
                                            borderTopColor: active.color,
                                            animation: "spin 0.6s linear infinite",
                                            flexShrink: 0,
                                        }} />
                                    )}
                                    {query && !sugLoading && (
                                        <button onClick={handleClear} style={{
                                            background: "none", border: "none", cursor: "pointer",
                                            color: "#9ca3af", padding: 0, fontSize: 20, lineHeight: 1,
                                            flexShrink: 0, display: "flex", alignItems: "center",
                                        }}>×</button>
                                    )}
                                </div>

                                {/* Search button */}
                                <button
                                    onClick={handleSearch}
                                    disabled={!query.trim()}
                                    style={{
                                        height: isMobile ? 46 : 50,
                                        padding: "0 16px",
                                        background: query.trim()
                                            ? "linear-gradient(135deg,#2d5a1b,#16a34a)"
                                            : "#e5e7eb",
                                        color: query.trim() ? "#fff" : "#9ca3af",
                                        border: "none", borderRadius: 12,
                                        fontSize: 13, fontWeight: 800,
                                        cursor: query.trim() ? "pointer" : "not-allowed",
                                        display: "flex", alignItems: "center", gap: 6,
                                        flexShrink: 0, transition: "all 0.2s ease",
                                        boxShadow: query.trim() ? "0 4px 16px rgba(22,163,74,0.3)" : "none",
                                    }}
                                >
                                    <SearchIcon />
                                    {!isMobile && "Search"}
                                </button>
                            </div>

                            {/* ── Suggestions Dropdown ── */}
                            {showDropdown && suggestions.length > 0 && (
                                <div style={{
                                    position: "absolute", top: "100%", left: 0,
                                    right: isMobile ? 0 : 62,
                                    background: "#fff",
                                    border: `1.5px solid ${active.color}`,
                                    borderTop: "none",
                                    borderRadius: "0 0 14px 14px",
                                    boxShadow: "0 16px 40px rgba(0,0,0,0.18)",
                                    zIndex: 9999,
                                    overflow: "hidden",
                                    maxHeight: 280,
                                    overflowY: "auto",
                                }}>
                                    <div style={{
                                        padding: "7px 14px",
                                        fontSize: 10, fontWeight: 800,
                                        color: active.color,
                                        background: active.bg,
                                        borderBottom: `1px solid ${active.border}`,
                                        letterSpacing: "0.4px",
                                        textTransform: "uppercase",
                                    }}>
                                        {active.typeLabel} Suggestions
                                    </div>

                                    {suggestions.map((s, i) => (
                                        <div
                                            key={i}
                                            onMouseDown={() => handleSuggestionClick(s)}
                                            style={{
                                                padding: isMobile ? "10px 14px" : "11px 16px",
                                                display: "flex", alignItems: "center", gap: 10,
                                                cursor: "pointer", fontSize: isMobile ? 12 : 13,
                                                color: "#1a1a1a",
                                                borderBottom: i < suggestions.length - 1
                                                    ? `1px solid ${active.bg}`
                                                    : "none",
                                                transition: "background 0.15s ease",
                                                background: "#fff",
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = active.bg}
                                            onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                                        >
                                            <div style={{
                                                width: 28, height: 28, borderRadius: 8,
                                                background: active.bg,
                                                border: `1px solid ${active.border}`,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                color: active.color, flexShrink: 0,
                                            }}>
                                                {active.icon}
                                            </div>
                                            <span style={{ flex: 1 }}>
                                                <Highlight text={s} query={query} color={active.color} />
                                            </span>
                                            <span style={{
                                                fontSize: 9, fontWeight: 800,
                                                color: active.color,
                                                background: active.bg,
                                                border: `1px solid ${active.border}`,
                                                borderRadius: 5, padding: "2px 7px",
                                                flexShrink: 0,
                                            }}>
                                                {active.typeLabel}
                                            </span>
                                        </div>
                                    ))}

                                    <div style={{
                                        padding: "7px 14px",
                                        fontSize: 10, color: "#9ca3af", fontWeight: 600,
                                        background: "#fafafa",
                                        borderTop: `1px solid ${active.bg}`,
                                        display: "flex", alignItems: "center", gap: 5,
                                    }}>
                                        <span>⏎</span> Enter dabao ya suggestion pe click karo
                                    </div>
                                </div>
                            )}
                        </div>

                        {activeType === "pincode" && query.length > 0 && query.length < 6 && (
                            <div style={{
                                fontSize: 11, color: "#f59e0b", marginTop: 8, fontWeight: 600,
                                display: "flex", alignItems: "center", gap: 4,
                            }}>
                                The pincode must be 6 digits long.
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bgShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
      `}</style>
        </section>
    );
}

// ══════════════════════════════════════════════════════════════
// LOCATION PRODUCTS PAGE  (/user/location-products)
// ══════════════════════════════════════════════════════════════
export default function LocationProductsPage() {
    const navigate = useNavigate();
    const params = new URLSearchParams(window.location.search);
    const searchType = params.get("type");
    const searchQuery = params.get("q") || "";

    const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
    useEffect(() => {
        const h = () => setIsMobile(window.innerWidth < 600);
        window.addEventListener("resize", h);
        return () => window.removeEventListener("resize", h);
    }, []);

    // ── FIX 1: categories state yahan declare karo ──
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [catLoading, setCatLoading] = useState(true);

    // Re-search state
    const [reQuery, setReQuery] = useState(searchQuery);
    const [reType, setReType] = useState(searchType);
    const [reSuggestions, setReSuggestions] = useState([]);
    const [reShowDrop, setReShowDrop] = useState(false);
    const [reSugLoading, setReSugLoading] = useState(false);
    const reInputRef = useRef();
    const reWrapperRef = useRef();
    const reDebounceRef = useRef();

    const searchTypes = [
        { key: "district", label: "District", icon: <LocationIcon />, color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", placeholder: "Enter district…" },
        { key: "pincode", label: "Pincode", icon: <PincodeIcon />, color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", placeholder: "Enter pincode…" },
        { key: "address", label: "Area", icon: <AddressIcon />, color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", placeholder: "Enter area…" },
    ];
    const activeSearchType = searchTypes.find(s => s.key === reType);

    // ── FIX 2: Categories fetch — FeatureCategories jaisi same API ──
    useEffect(() => {
        setCatLoading(true);
        fetch(`${API_BASE}/api/Category/all`)
            .then(r => r.json())
            .then(data => {
                const cats = Array.isArray(data) ? data : data.categories || data.data || [];
                setCategories(cats);
            })
            .catch(() => {})
            .finally(() => setCatLoading(false));
    }, []);

    // ── Products fetch ──
    useEffect(() => {
        if (!searchQuery) return;
        setLoading(true);
        fetch(`${API_BASE}/api/Products/allFree?page=1&limit=500`)
            .then(r => r.json())
            .then(data => {
                const all = Array.isArray(data) ? data : data.products || data.data || [];
                const q = searchQuery.toLowerCase().trim();
                const filtered = all.filter(p => {
                    if (searchType === "district") return p.district?.toLowerCase().includes(q);
                    if (searchType === "pincode") return p.pincode?.toString() === q;
                    if (searchType === "address") return (
                        p.address?.toLowerCase().includes(q) ||
                        p.village?.toLowerCase().includes(q)
                    );
                    return false;
                });
                setProducts(filtered);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [searchQuery, searchType]);

    // ── FIX 3: Category ID helper — sab formats handle karta hai ──
    const getProductCatId = (p) =>
        String(p.category_id || p.category?.id || (typeof p.category === "string" ? p.category : "") || "");

    // ── FIX 4: Grouping sirf tab karo jab dono ready hoon ──
    const buildCategoryGroups = () => {
        if (loading || catLoading || categories.length === 0) return [];

        const groups = {};

        // Real categories se match karo
        categories.forEach(cat => {
            const matched = products.filter(p => getProductCatId(p) === String(cat.id));
            if (matched.length > 0) {
                groups[cat.name] = matched;
            }
        });

        // Jo kisi category se match nahi hue
        const categorisedIds = new Set(
            categories.flatMap(cat =>
                products
                    .filter(p => getProductCatId(p) === String(cat.id))
                    .map(p => p.id)
            )
        );
        const uncategorised = products.filter(p => !categorisedIds.has(p.id));
        if (uncategorised.length > 0) {
            groups["Uncategorised"] = uncategorised;
        }

        return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
    };

    const categoryList = buildCategoryGroups();

    // ── Navigate to ProductsPage with location + category filters ──
    const handleCategoryNavigation = (catName) => {
        navigate(
            `/user/product?location_type=${searchType}&location_q=${encodeURIComponent(searchQuery)}&cat_name=${encodeURIComponent(catName)}`
        );
    };

    // Close dropdown outside click
    useEffect(() => {
        const h = (e) => {
            if (reWrapperRef.current && !reWrapperRef.current.contains(e.target))
                setReShowDrop(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    // Suggestion fetch on results page
    const handleReQueryChange = (e) => {
        const val = e.target.value;
        setReQuery(val);
        setReShowDrop(false);
        clearTimeout(reDebounceRef.current);
        if (!val.trim()) { setReSuggestions([]); return; }
        setReSugLoading(true);
        reDebounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(
                    `${API_BASE}/api/Products/location-suggestions?type=${reType}&q=${encodeURIComponent(val.trim())}`
                );
                const data = await res.json();
                const list = data.suggestions || [];
                setReSuggestions(list);
                setReShowDrop(list.length > 0);
            } catch {
                setReSuggestions([]);
            } finally {
                setReSugLoading(false);
            }
        }, 300);
    };

    const handleReSearch = () => {
        if (!reQuery.trim()) return;
        setReShowDrop(false);
        navigate(`/user/location-products?type=${reType}&q=${encodeURIComponent(reQuery.trim())}`);
    };

    const handleReSuggestionClick = (val) => {
        setReQuery(val);
        setReSuggestions([]);
        setReShowDrop(false);
        navigate(`/user/location-products?type=${reType}&q=${encodeURIComponent(val)}`);
    };

    const typeLabel = { district: "District", pincode: "Pincode", address: "Area" }[searchType] || "";

    const handleAddCart = (product) => {
        console.log("Add to cart:", product.id);
    };

    // Loading state — dono fetch complete hone tak skeleton dikhao
    const isLoading = loading || catLoading;

    return (
        <>
            <style>{`
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
      `}</style>

            <div style={{
                maxWidth: 1200, margin: "0 auto",
                padding: isMobile ? "14px 12px 80px" : "24px 24px 60px",
                fontFamily: "'Nunito', sans-serif", minHeight: "100vh",
            }}>

                {/* ── Top bar ── */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: "#f0fdf4", border: "1.5px solid #bbf7d0",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", color: "#16a34a", flexShrink: 0,
                        }}
                    >
                        <BackIcon />
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontSize: isMobile ? 15 : 19, fontWeight: 900, color: "#14532d",
                            lineHeight: 1.2, overflow: "hidden",
                            textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                            {typeLabel}: "{searchQuery}"
                        </div>
                        <div style={{ fontSize: isMobile ? 11 : 12, color: "#16a34a", fontWeight: 600, marginTop: 2 }}>
                            {isLoading
                                ? "Searching…"
                                : `${products.length} product${products.length !== 1 ? "s" : ""} · ${categoryList.length} categories`}
                        </div>
                    </div>
                </div>

                {/* ── Re-search bar ── */}
                <div style={{
                    background: "#fff", border: "1.5px solid #e8f5e1",
                    borderRadius: 16, padding: isMobile ? "12px" : "16px",
                    marginBottom: 20,
                    boxShadow: "0 2px 12px rgba(34,197,94,0.06)",
                }}>
                    {/* Type toggle chips */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                        {searchTypes.map(t => (
                            <button
                                key={t.key}
                                onClick={() => { setReType(t.key); setReQuery(""); setReSuggestions([]); setReShowDrop(false); }}
                                style={{
                                    display: "flex", alignItems: "center", gap: 5,
                                    padding: "6px 12px", borderRadius: 8,
                                    border: `1.5px solid ${reType === t.key ? t.color : "#e5e7eb"}`,
                                    background: reType === t.key ? t.bg : "#fafafa",
                                    color: reType === t.key ? t.color : "#6b7280",
                                    fontSize: 11, fontWeight: 700, cursor: "pointer",
                                    transition: "all 0.15s ease",
                                }}
                            >
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Input + button */}
                    <div ref={reWrapperRef} style={{ position: "relative" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                            <div style={{
                                flex: 1, display: "flex", alignItems: "center", gap: 10,
                                padding: "0 14px",
                                background: activeSearchType?.bg || "#f0fdf4",
                                border: `1.5px solid ${reShowDrop ? activeSearchType?.color : activeSearchType?.border || "#bbf7d0"}`,
                                borderRadius: reShowDrop ? "12px 12px 0 0" : 12,
                                height: isMobile ? 44 : 48,
                                transition: "border-radius 0.15s ease, border-color 0.2s ease",
                            }}>
                                <span style={{ color: activeSearchType?.color, flexShrink: 0 }}>
                                    {activeSearchType?.icon}
                                </span>
                                <input
                                    ref={reInputRef}
                                    value={reQuery}
                                    onChange={handleReQueryChange}
                                    onFocus={() => reSuggestions.length > 0 && setReShowDrop(true)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") { setReShowDrop(false); handleReSearch(); }
                                        if (e.key === "Escape") setReShowDrop(false);
                                    }}
                                    placeholder={activeSearchType?.placeholder || "Search…"}
                                    style={{
                                        flex: 1, border: "none", background: "transparent",
                                        fontSize: isMobile ? 13 : 14, color: "#1a1a1a",
                                        outline: "none", fontFamily: "inherit",
                                    }}
                                />
                                {reSugLoading && (
                                    <div style={{
                                        width: 14, height: 14, borderRadius: "50%",
                                        border: "2px solid #e5e7eb",
                                        borderTopColor: activeSearchType?.color,
                                        animation: "spin 0.6s linear infinite", flexShrink: 0,
                                    }} />
                                )}
                                {reQuery && !reSugLoading && (
                                    <button onClick={() => { setReQuery(""); setReSuggestions([]); setReShowDrop(false); }}
                                        style={{
                                            background: "none", border: "none", cursor: "pointer",
                                            color: "#9ca3af", padding: 0, fontSize: 20, lineHeight: 1,
                                            flexShrink: 0,
                                        }}>×</button>
                                )}
                            </div>
                            <button
                                onClick={handleReSearch}
                                disabled={!reQuery.trim()}
                                style={{
                                    height: isMobile ? 44 : 48, padding: "0 14px",
                                    background: reQuery.trim()
                                        ? "linear-gradient(135deg,#2d5a1b,#16a34a)" : "#e5e7eb",
                                    color: reQuery.trim() ? "#fff" : "#9ca3af",
                                    border: "none", borderRadius: 12,
                                    fontSize: 13, fontWeight: 800,
                                    cursor: reQuery.trim() ? "pointer" : "not-allowed",
                                    display: "flex", alignItems: "center", gap: 6,
                                    flexShrink: 0, transition: "all 0.2s ease",
                                    boxShadow: reQuery.trim() ? "0 4px 12px rgba(22,163,74,0.28)" : "none",
                                }}
                            >
                                <SearchIcon />
                                {!isMobile && "Search"}
                            </button>
                        </div>

                        {/* Suggestions dropdown */}
                        {reShowDrop && reSuggestions.length > 0 && (
                            <div style={{
                                position: "absolute", top: "100%", left: 0,
                                right: isMobile ? 0 : 62,
                                background: "#fff",
                                border: `1.5px solid ${activeSearchType?.color}`,
                                borderTop: "none",
                                borderRadius: "0 0 14px 14px",
                                boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
                                zIndex: 999, overflow: "hidden",
                            }}>
                                <div style={{
                                    padding: "7px 14px", fontSize: 10, fontWeight: 800,
                                    color: activeSearchType?.color,
                                    background: activeSearchType?.bg,
                                    borderBottom: `1px solid ${activeSearchType?.border}`,
                                    textTransform: "uppercase", letterSpacing: "0.4px",
                                }}>
                                    {activeSearchType?.label} Suggestions
                                </div>
                                {reSuggestions.map((s, i) => (
                                    <div
                                        key={i}
                                        onMouseDown={() => handleReSuggestionClick(s)}
                                        style={{
                                            padding: isMobile ? "10px 14px" : "11px 16px",
                                            display: "flex", alignItems: "center", gap: 10,
                                            cursor: "pointer", fontSize: isMobile ? 12 : 13,
                                            color: "#1a1a1a",
                                            borderBottom: i < reSuggestions.length - 1
                                                ? `1px solid ${activeSearchType?.bg}` : "none",
                                            background: "#fff", transition: "background 0.15s ease",
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = activeSearchType?.bg}
                                        onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                                    >
                                        <div style={{
                                            width: 26, height: 26, borderRadius: 7,
                                            background: activeSearchType?.bg,
                                            border: `1px solid ${activeSearchType?.border}`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            color: activeSearchType?.color, flexShrink: 0,
                                        }}>
                                            {activeSearchType?.icon}
                                        </div>
                                        <span style={{ flex: 1 }}>
                                            <Highlight text={s} query={reQuery} color={activeSearchType?.color} />
                                        </span>
                                        <span style={{
                                            fontSize: 9, fontWeight: 800,
                                            color: activeSearchType?.color,
                                            background: activeSearchType?.bg,
                                            border: `1px solid ${activeSearchType?.border}`,
                                            borderRadius: 5, padding: "2px 7px", flexShrink: 0,
                                        }}>{activeSearchType?.label}</span>
                                    </div>
                                ))}
                                <div style={{
                                    padding: "7px 14px", fontSize: 10, color: "#9ca3af",
                                    fontWeight: 600, background: "#fafafa",
                                    borderTop: `1px solid ${activeSearchType?.bg}`,
                                }}>
                                    ⏎ Enter dabao ya suggestion pe click karo
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Loading skeletons ── */}
                {isLoading && (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, 1fr)`,
                        gap: isMobile ? 10 : 14,
                    }}>
                        {[...Array(isMobile ? 4 : 8)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                )}

                {/* ── Empty state ── */}
                {!isLoading && products.length === 0 && (
                    <div style={{
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        padding: "60px 20px", textAlign: "center",
                    }}>
                        <div style={{ fontSize: 52, marginBottom: 16 }}>📭</div>
                        <div style={{ fontSize: 17, fontWeight: 800, color: "#14532d", marginBottom: 6 }}>
                            Koi product nahi mila
                        </div>
                        <div style={{ fontSize: 13, color: "#6b7280", maxWidth: 280, lineHeight: 1.6 }}>
                            "{searchQuery}" ke liye is area mein abhi koi product listed nahi hai.
                        </div>
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                marginTop: 20,
                                background: "linear-gradient(135deg,#2d5a1b,#16a34a)",
                                color: "#fff", border: "none", borderRadius: 12,
                                padding: "11px 24px", fontSize: 13, fontWeight: 800,
                                cursor: "pointer",
                            }}
                        >← Wapas Jaayein</button>
                    </div>
                )}

                {/* ── Category list view ── */}
                {!isLoading && products.length > 0 && (
                    <div style={{ animation: "fadeUp 0.3s ease both" }}>
                        {/* Stats chips */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                            <span style={{
                                fontSize: 12, fontWeight: 700, background: "#f0fdf4",
                                color: "#15803d", border: "1px solid #bbf7d0",
                                borderRadius: 8, padding: "5px 12px",
                            }}>📦 {products.length} products</span>
                            <span style={{
                                fontSize: 12, fontWeight: 700, background: "#eff6ff",
                                color: "#1d4ed8", border: "1px solid #bfdbfe",
                                borderRadius: 8, padding: "5px 12px",
                            }}>🗂 {categoryList.length} categories</span>
                            <span style={{
                                fontSize: 12, fontWeight: 700, background: "#f5f3ff",
                                color: "#7c3aed", border: "1px solid #ddd6fe",
                                borderRadius: 8, padding: "5px 12px",
                            }}>📍 {searchQuery}</span>
                        </div>

                        {categoryList.length === 0 ? (
                            // Agar categories match nahi hui to seedha products dikhao
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, 1fr)`,
                                gap: isMobile ? 10 : 14,
                            }}>
                                {products.map((p, i) => (
                                    <ProductCard key={p.id || i} product={p} isMobile={isMobile} onAddCart={handleAddCart} />
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)",
                                gap: isMobile ? 10 : 14,
                            }}>
                                {categoryList.map(([cat, prods]) => (
                                    <CategoryGroupCard
                                        key={cat}
                                        category={cat}
                                        count={prods.length}
                                        isMobile={isMobile}
                                        onClick={() => handleCategoryNavigation(cat)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}