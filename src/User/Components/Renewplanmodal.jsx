import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const loadRazorpayScript = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload  = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

// Displayed instead of the normal app when `needsRenewal` is true after login.
// Blocks all app access until the user purchases a plan.
//
// Props:
//   token           - JWT issued at login (still valid for API calls)
//   user            - user object from login response
//   onRenewed(user) - called after payment is verified; parent should update
//                     its stored user (isActive: true) and grant app access
const RenewPlanModal = ({ token, user, onRenewed }) => {
  const [plans, setPlans]                   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [paying, setPaying]                 = useState(false);
  const [error, setError]                   = useState('');
  const [termsAccepted, setTermsAccepted]   = useState(false);
  const [showTerms, setShowTerms]           = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res  = await fetch(`${API_URL}/api/user/plans`);
        const data = await res.json();
        if (res.ok) setPlans(data.plans || []);
        else setError(data.message || 'Could not load plans. Please try again.');
      } catch {
        setError('Unable to connect to server.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleRenew = async () => {
    setError('');
    if (!selectedPlanId) {
      setError('Please select a plan to continue.');
      return;
    }
    if (!termsAccepted) {
      setError('Please read and accept the Terms & Conditions before proceeding.');
      return;
    }
    setPaying(true);

    try {
      const orderRes = await fetch(`${API_URL}/api/user/subscribe/create-order`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ planId: selectedPlanId }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        setError(orderData.message || 'Could not initiate payment. Please try again.');
        setPaying(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Payment gateway failed to load. Please check your internet connection.');
        setPaying(false);
        return;
      }

      const rzp = new window.Razorpay({
        key:         orderData.keyId,
        amount:      orderData.amount,
        currency:    orderData.currency,
        order_id:    orderData.orderId,
        name:        'Maharashtra Bazaar',
        description: `${orderData.planName} Renewal`,
        prefill:     { name: user?.fullName, email: user?.email, contact: user?.phone },
        theme:       { color: '#16a34a' },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${API_URL}/api/user/subscribe/verify`, {
              method:  'POST',
              headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              setError(verifyData.message || 'Payment verification failed. Please contact support.');
              setPaying(false);
              return;
            }
            localStorage.setItem('userInfo', JSON.stringify(verifyData.user));
            onRenewed(verifyData.user);
          } catch {
            setError('Payment was made but verification failed. Please contact support.');
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setError('Payment was cancelled. Please try again.');
            setPaying(false);
          },
        },
      });

      rzp.on('payment.failed', () => {
        setError('Payment failed. Please try again with a different method.');
        setPaying(false);
      });

      rzp.open();
    } catch {
      setError('Unable to connect to server. Please try again.');
      setPaying(false);
    }
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  return (
    <>
      {/* ── Terms & Conditions Drawer ── */}
      {showTerms && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-0 sm:px-4">
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Terms & Conditions</h3>
              <button
                onClick={() => setShowTerms(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-lg transition"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5 text-sm text-gray-600 space-y-4 leading-relaxed">
              <div>
                <p className="font-semibold text-gray-800 mb-1">1. Payment & Plan Activation</p>
                <p>Once a payment is successfully completed, your selected plan will be activated immediately and cannot be cancelled or refunded. Please choose your plan carefully before proceeding.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">2. Plan Expiry & Renewal</p>
                <p>Your plan is valid for the duration specified at the time of purchase. After expiry, access to the platform will be suspended until you renew your subscription. Renewal is only possible after your current plan expires.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">3. Plan Tracking</p>
                <p>You can view your active plan, expiry date, and subscription history from your Dashboard at any time. It is your responsibility to renew before or immediately after expiry to avoid service interruption.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">4. No Refund Policy</p>
                <p>All payments are final. We do not offer refunds, partial credits, or plan transfers. If you face a payment issue, contact our support team within 24 hours.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">5. Support</p>
                <p>For payment disputes or technical issues, reach out to our support team via the Help section in your Dashboard. We aim to resolve all queries within 48 hours.</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => { setTermsAccepted(true); setShowTerms(false); }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-full text-sm transition"
              >
                I Understand & Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Modal ── */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

          {/* Header Banner */}
          <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <span className="text-white/80 text-sm font-medium">Subscription Expired</span>
            </div>
            <h2 className="text-xl font-bold text-white">Renew Your Plan</h2>
            <p className="text-green-100 text-xs mt-1">Select a plan and complete payment to regain full access.</p>
          </div>

          <div className="px-6 pt-5 pb-6">

            {/* Error */}
            {error && (
              <div className="mb-4 flex items-start gap-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <svg className="mt-0.5 shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* Plans */}
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Available Plans</p>

            {loading ? (
              <div className="flex items-center justify-center py-10 gap-2 text-gray-400 text-sm">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Loading plans...
              </div>
            ) : (
              <div className="space-y-2.5 mb-5">
                {plans.map(plan => {
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <label
                      key={plan.id}
                      className={`flex items-center justify-between rounded-xl px-4 py-3.5 cursor-pointer border-2 transition-all duration-150 ${
                        isSelected
                          ? 'border-green-500 bg-green-50 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-green-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <input
                          type="radio"
                          name="renew-plan"
                          className="sr-only"
                          checked={isSelected}
                          onChange={() => setSelectedPlanId(plan.id)}
                        />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{plan.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{plan.durationDays} days access</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 text-base">₹{plan.price}</p>
                        <p className="text-[11px] text-gray-400">one-time</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Terms & Conditions notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
              <p className="text-xs text-amber-800 leading-relaxed">
                <span className="font-semibold">Before purchasing, please read our </span>
                <button
                  onClick={() => setShowTerms(true)}
                  className="font-semibold underline underline-offset-2 text-amber-900 hover:text-green-700 transition"
                >
                  Terms & Conditions
                </button>
                . Once payment is made, the plan is activated immediately and is non-refundable.
                Access is available only after your previous plan expires.
                Track your plan from your <span className="font-semibold">Dashboard</span>.
              </p>
            </div>

            {/* Accept checkbox */}
            <label className="flex items-start gap-2.5 mb-5 cursor-pointer group">
              <div
                onClick={() => setTermsAccepted(v => !v)}
                className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  termsAccepted ? 'bg-green-600 border-green-600' : 'border-gray-300 group-hover:border-green-400'
                }`}
              >
                {termsAccepted && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="text-xs text-gray-600 leading-relaxed">
                I have read and agree to the{' '}
                <button
                  onClick={(e) => { e.preventDefault(); setShowTerms(true); }}
                  className="text-green-700 font-semibold underline underline-offset-2"
                >
                  Terms & Conditions
                </button>
                . I understand that once payment is completed, the plan cannot be cancelled or refunded.
              </span>
            </label>

            {/* Order Summary */}
            {selectedPlan && (
              <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">You are purchasing</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedPlan.name} · {selectedPlan.durationDays} days</p>
                </div>
                <p className="text-lg font-bold text-green-600">₹{selectedPlan.price}</p>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleRenew}
              disabled={paying || !selectedPlanId || loading || !termsAccepted}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-full text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
            >
              {paying ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Processing Payment...
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  Pay & Activate Plan
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-gray-400 mt-3">
              Secured by Razorpay · 256-bit SSL encryption
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RenewPlanModal;