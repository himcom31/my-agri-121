// src/components/EnquiryModal.jsx
import { useState, useEffect } from "react";
import { X, MessageCircle, Mail, Phone, Loader2, CheckCircle2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;
const isLoggedIn = () => !!localStorage.getItem("userToken");

export default function EnquiryModal({ product, variantId, onClose }) {
  const [step, setStep] = useState("form");
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sellerContact, setSellerContact] = useState(null);

  // ── Auth guard — open the navbar's AuthModal instead of navigating to a route ──
  useEffect(() => {
    if (!isLoggedIn()) {
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      onClose(); // close this enquiry modal
      window.dispatchEvent(new Event("open-login-modal")); // navbar's listener picks this up
    }
  }, []);

  // Don't render anything until the user is logged in
  if (!isLoggedIn()) return null;

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

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
          productId: product.id,
          variantId: variantId || null,
          name: form.name,
          phone: form.phone,
          message: form.message,
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
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 3000, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 420,
        padding: 24, position: "relative", fontFamily: "'Nunito','Segoe UI',sans-serif",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 14, right: 14, background: "#f3f4f6",
          border: "none", borderRadius: "50%", width: 32, height: 32,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}><X size={16} /></button>

        {step === "form" && (
          <>
            <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 800, color: "#1a2332" }}>
              Contact Seller
            </h2>
            <p style={{ margin: "0 0 18px", fontSize: 13, color: "#6b7280" }}>
              Fill in your details and get the seller's WhatsApp & email instantly.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input name="name" placeholder="Your Name*" value={form.name} onChange={handleChange}
                style={inputStyle} />
              <input name="phone" placeholder="Your Phone Number*" value={form.phone} onChange={handleChange}
                style={inputStyle} />
              <textarea name="message" placeholder="Message (optional) — e.g. price, quantity..."
                value={form.message} onChange={handleChange} rows={3}
                style={{ ...inputStyle, resize: "none", fontFamily: "inherit" }} />

              {error && <p style={{ color: "#dc2626", fontSize: 12, margin: 0 }}>{error}</p>}

              <button type="submit" disabled={loading} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "13px 0", background: "#16a34a", color: "#fff", border: "none",
                borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: "pointer",
                fontFamily: "inherit", opacity: loading ? 0.7 : 1,
              }}>
                {loading ? <Loader2 size={16} style={{ animation: "spin 0.7s linear infinite" }} /> : null}
                {loading ? "Sending…" : "Submit Enquiry"}
              </button>
            </form>
          </>
        )}

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
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "13px 0", background: "#25D366", color: "#fff", borderRadius: 10,
                  fontWeight: 800, fontSize: 14, textDecoration: "none",
                }}>
                  <MessageCircle size={17} /> Chat on WhatsApp
                </a>
              )}
              {mailLink && (
                <a href={mailLink} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "13px 0", background: "#fff", color: "#1a2332", borderRadius: 10,
                  fontWeight: 800, fontSize: 14, textDecoration: "none", border: "2px solid #e5e7eb",
                }}>
                  <Mail size={16} /> Email Seller
                </a>
              )}
              {sellerContact?.whatsapp && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  fontSize: 12, color: "#9ca3af" }}>
                  <Phone size={12} /> {sellerContact.whatsapp}
                </div>
              )}
            </div>

            <button onClick={onClose} style={{
              marginTop: 18, background: "none", border: "none", color: "#9ca3af",
              fontSize: 12, cursor: "pointer", fontFamily: "inherit",
            }}>Close</button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const inputStyle = {
  padding: "11px 14px", fontSize: 13.5, border: "1.5px solid #e5e7eb",
  borderRadius: 10, outline: "none", fontFamily: "inherit", color: "#1a2332",
};