import { useState, useEffect } from "react";
import { IndianRupee, Save, Edit3, CheckCircle, AlertCircle, Loader } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL + "/api/seller";

export default function PlatformFeeSettings() {
  const [currentFee, setCurrentFee] = useState(null);
  const [inputFee, setInputFee]     = useState("");
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [editing, setEditing]       = useState(false);
  const [toast, setToast]           = useState(null);

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch(`${API_BASE}/platform-fee`)
      .then(r => r.json())
      .then(data => {
        setCurrentFee(data.fee);
        setInputFee(String(data.fee));
        setLoading(false);
      })
      .catch(() => { setLoading(false); notify("Failed to load fee", "error"); });
  }, []);

  const handleSave = async () => {
    if (!inputFee || isNaN(inputFee) || Number(inputFee) < 0) {
      return notify("Please enter a valid amount", "error");
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/platform-fee`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fee: Number(inputFee) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCurrentFee(Number(inputFee));
      setEditing(false);
      notify("Platform fee updated successfully!");
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white font-semibold text-sm
          ${toast.type === "error" ? "bg-red-500" : "bg-green-600"}`}>
          {toast.type === "error"
            ? <AlertCircle size={16} />
            : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-800">Platform Fee Settings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Set the one-time registration fee charged to new sellers
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader size={28} className="animate-spin text-green-600" />
        </div>
      ) : (
        <div className="space-y-6">

          {/* Current Fee Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">
                  Current Registration Fee
                </p>
                <div className="flex items-center gap-1">
                  <IndianRupee size={28} className="text-green-700" strokeWidth={2.5} />
                  <span className="text-5xl font-black text-green-700">
                    {currentFee?.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-green-600 text-sm mt-2">One-time fee per seller registration</p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                <IndianRupee size={32} className="text-green-600" />
              </div>
            </div>
          </div>

          {/* Edit Section */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-700 text-base">Update Fee Amount</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-all"
                >
                  <Edit3 size={14} /> Edit
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    New Fee Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={inputFee}
                      onChange={e => setInputFee(e.target.value)}
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 focus:border-green-500 rounded-xl text-lg font-bold outline-none transition-all"
                      placeholder="499"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Enter 0 for free registration</p>
                </div>

                {/* Preview */}
                {inputFee && !isNaN(inputFee) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
                    <span className="font-semibold">Preview: </span>
                    Sellers will be charged <strong>₹{Number(inputFee).toLocaleString("en-IN")}</strong> at registration
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-60"
                  >
                    {saving
                      ? <><Loader size={14} className="animate-spin" /> Saving…</>
                      : <><Save size={14} /> Save Changes</>}
                  </button>
                  <button
                    onClick={() => { setEditing(false); setInputFee(String(currentFee)); }}
                    className="px-5 py-2.5 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm bg-gray-50 rounded-xl p-4">
                Click <strong>Edit</strong> to update the registration fee. Changes take effect immediately for new registrations.
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-bold mb-1">ℹ️ How it works</p>
            <ul className="space-y-1 text-amber-700 list-disc list-inside">
              <li>New sellers will see this fee on the payment step during registration</li>
              <li>Payment is collected via Razorpay before account activation</li>
              <li>Existing approved sellers are not affected</li>
              <li>Set to ₹0 to allow free registration</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}