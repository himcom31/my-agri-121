// src/components/EnquiryModal.jsx
import { useState, useEffect } from "react";
import { X, MessageCircle, Mail, Phone, Loader2, CheckCircle2, MapPin, Navigation } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
const isLoggedIn = () => !!localStorage.getItem("userToken");

export default function EnquiryModal({ product, variantId, onClose }) {
  const [step, setStep] = useState("form");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    message: "",
    address: "",
    locationUrl: "",
  });
  const [locationStatus, setLocationStatus] = useState("idle"); // idle | fetching | fetched | error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sellerContact, setSellerContact] = useState(null);

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn()) {
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      onClose();
      window.dispatchEvent(new Event("open-login-modal"));
    }
  }, []);

  if (!isLoggedIn()) return null;

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // ── Get current GPS location → build Google Maps URL ───────────────────────
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }
    setLocationStatus("fetching");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setForm((f) => ({ ...f, locationUrl: url }));
        setLocationStatus("fetched");
      },
      (err) => {
        console.error("Geolocation error:", err.message);
        setLocationStatus("error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Name and phone number are both required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/enquiry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        body: JSON.stringify({
          productId:   product.id,
          variantId:   variantId || null,
          name:        form.name,
          phone:       form.phone,
          message:     form.message,
          address:     form.address,
          locationUrl: form.locationUrl,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed");
      setSellerContact(data.seller);
      setStep("success");
    } catch (err) {
      setError(err.message || "Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  const waLink = sellerContact?.whatsapp
    ? `https://wa.me/${sellerContact.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hi, I'm interested in "${product.name}"`
      )}`
    : null;

  const mailLink = sellerContact?.email
    ? `mailto:${sellerContact.email}?subject=${encodeURIComponent(
        `Enquiry about ${product.name}`
      )}`
    : null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 3000,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440,
          padding: 24, position: "relative",
          fontFamily: "'Nunito','Segoe UI',sans-serif",
          maxHeight: "90vh", overflowY: "auto",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 14, right: 14, background: "#f3f4f6",
            border: "none", borderRadius: "50%", width: 32, height: 32,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <X size={16} />
        </button>

        {/* ── FORM STEP ──────────────────────────────────────────────────────── */}
        {step === "form" && (
          <>
            <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#1a2332" }}>
              Contact Seller
            </h2>
            <p style={{ margin: "0 0 18px", fontSize: 13, color: "#6b7280" }}>
              Fill in your details and get the seller's WhatsApp & email instantly.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Basic fields */}
              <input
                name="name" placeholder="Your Name*"
                value={form.name} onChange={handleChange}
                style={inputStyle}
              />
              <input
                name="phone" placeholder="Your Phone Number*"
                value={form.phone} onChange={handleChange}
                style={inputStyle}
              />
              <textarea
                name="message" placeholder="Message (optional) — e.g. price, quantity..."
                value={form.message} onChange={handleChange} rows={3}
                style={{ ...inputStyle, resize: "none", fontFamily: "inherit" }}
              />

              {/* ── Address + Location Section ────────────────────────────── */}
              <div style={{
                border: "1.5px solid #e5e7eb", borderRadius: 12,
                padding: "14px 14px 12px", display: "flex", flexDirection: "column", gap: 10,
              }}>
                {/* Section label */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <MapPin size={14} color="#16a34a" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", letterSpacing: 0.3 }}>
                    Delivery Address
                  </span>
                </div>

                {/* Address textarea */}
                <textarea
                  name="address"
                  placeholder="Enter your full address (house no., street, city, pincode)..."
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  style={{ ...inputStyle, resize: "none", fontFamily: "inherit", border: "1.5px solid #e5e7eb" }}
                />

                {/* Location URL row */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={locationStatus === "fetching"}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                      padding: "10px 0",
                      background: locationStatus === "fetched" ? "#f0fdf4" : "#f9fafb",
                      color: locationStatus === "fetched" ? "#16a34a" : "#374151",
                      border: `1.5px solid ${locationStatus === "fetched" ? "#bbf7d0" : "#e5e7eb"}`,
                      borderRadius: 10, fontSize: 13, fontWeight: 700,
                      cursor: locationStatus === "fetching" ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.2s",
                    }}
                  >
                    {locationStatus === "fetching" ? (
                      <Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} />
                    ) : (
                      <Navigation size={14} />
                    )}
                    {locationStatus === "idle"     && "📍 Use My Current Location"}
                    {locationStatus === "fetching" && "Fetching location…"}
                    {locationStatus === "fetched"  && "✓ Location Captured"}
                    {locationStatus === "error"    && "⚠ Retry Location"}
                  </button>

                  {/* ✅ FIX 1: Show the URL so buyer can verify */}
                  {locationStatus === "fetched" && form.locationUrl && (
                    <a
                      href={form.locationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 11, color: "#16a34a", textDecoration: "none",
                        wordBreak: "break-all", textAlign: "center",
                        padding: "4px 8px", background: "#f0fdf4",
                        borderRadius: 6, display: "block",
                      }}
                    >
                      🗺 View on Google Maps ↗
                    </a>
                  )}

                  {locationStatus === "error" && (
                    <p style={{ fontSize: 11, color: "#dc2626", margin: 0, textAlign: "center" }}>
                      Location access denied. Please allow location permission or enter address manually.
                    </p>
                  )}

                  {/* Manual URL override */}
                  {(locationStatus === "error" || locationStatus === "idle") && (
                    <input
                      name="locationUrl"
                      placeholder="Or paste Google Maps link manually (optional)"
                      value={form.locationUrl}
                      onChange={handleChange}
                      style={{ ...inputStyle, fontSize: 12 }}
                    />
                  )}
                </div>
              </div>
              {/* ── End Address Section ───────────────────────────────────── */}

              {error && (
                <p style={{ color: "#dc2626", fontSize: 12, margin: 0 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "13px 0", background: "#16a34a", color: "#fff",
                  border: "none", borderRadius: 10, fontSize: 14, fontWeight: 800,
                  cursor: "pointer", fontFamily: "inherit", opacity: loading ? 0.7 : 1,
                }}
              >
                {loading && <Loader2 size={16} style={{ animation: "spin 0.7s linear infinite" }} />}
                {loading ? "Sending…" : "Submit Enquiry"}
              </button>
            </form>
          </>
        )}

        {/* ── SUCCESS STEP ────────────────────────────────────────────────── */}
        {step === "success" && (
          <div style={{ textAlign: "center" }}>
            <CheckCircle2 size={40} color="#16a34a" style={{ margin: "8px auto 10px" }} />
            <h2 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 800, color: "#1a2332" }}>
              Enquiry Sent!
            </h2>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "#6b7280" }}>
              Talk directly with the seller <strong>{sellerContact?.name}</strong>:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* ✅ FIX 2: WhatsApp <a> tag */}
              {waLink && (
                <a
                  href={waLink} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "13px 0", background: "#25D366", color: "#fff",
                    borderRadius: 10, fontWeight: 800, fontSize: 14, textDecoration: "none",
                  }}
                >
                  <MessageCircle size={17} /> Chat on WhatsApp
                </a>
              )}

              {/* ✅ FIX 3: Email <a> tag */}
              {mailLink && (
                <a
                  href={mailLink}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "13px 0", background: "#fff", color: "#1a2332",
                    borderRadius: 10, fontWeight: 800, fontSize: 14,
                    textDecoration: "none", border: "2px solid #e5e7eb",
                  }}
                >
                  <Mail size={16} /> Email Seller
                </a>
              )}

              {sellerContact?.whatsapp && (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 6, fontSize: 12, color: "#9ca3af",
                }}>
                  <Phone size={12} /> {sellerContact.whatsapp}
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              style={{
                marginTop: 18, background: "none", border: "none",
                color: "#9ca3af", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const inputStyle = {
  padding: "11px 14px", fontSize: 13.5,
  border: "1.5px solid #e5e7eb", borderRadius: 10,
  outline: "none", fontFamily: "inherit", color: "#1a2332",
};