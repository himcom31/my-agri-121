import React, { useState } from 'react';
import { X, Eye, EyeOff, ChevronDown } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const COUNTRIES = ['India'];

const loadRazorpayScript = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload  = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

// ── Reusable Spinner ──────────────────────────────────
const Spinner = () => (
  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
  </svg>
);

// ── Terms & Conditions Drawer ─────────────────────────
const TermsDrawer = ({ onClose, onAccept }) => (
  <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-0 sm:px-4">
    <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">Terms & Conditions</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-lg transition"
        >×</button>
      </div>
      <div className="overflow-y-auto px-6 py-5 text-sm text-gray-600 space-y-4 leading-relaxed">
        <div>
          <p className="font-semibold text-gray-800 mb-1">1. Payment & Plan Activation</p>
          <p>Once payment is successfully completed, your selected plan will be activated immediately and cannot be cancelled or refunded. Please choose your plan carefully before proceeding.</p>
        </div>
        <div>
          <p className="font-semibold text-gray-800 mb-1">2. Plan Expiry & Renewal</p>
          <p>Your plan is valid for the duration specified at purchase. After expiry, platform access is suspended until you renew. Renewal is only possible after your current plan has expired.</p>
        </div>
        <div>
          <p className="font-semibold text-gray-800 mb-1">3. Plan Tracking</p>
          <p>You can view your active plan, expiry date, and subscription history from your Dashboard at any time. It is your responsibility to renew promptly after expiry to avoid service interruption.</p>
        </div>
        <div>
          <p className="font-semibold text-gray-800 mb-1">4. No Refund Policy</p>
          <p>All payments are final. We do not offer refunds, partial credits, or plan transfers. For payment issues, contact our support team within 24 hours.</p>
        </div>
        <div>
          <p className="font-semibold text-gray-800 mb-1">5. Support</p>
          <p>For payment disputes or technical issues, reach out via the Help section in your Dashboard. We aim to resolve all queries within 48 hours.</p>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-gray-100">
        <button
          onClick={onAccept}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-full text-sm transition"
        >
          I Understand & Accept
        </button>
      </div>
    </div>
  </div>
);

// ── Plan Card ─────────────────────────────────────────
const PlanCard = ({ plan, selected, onSelect }) => (
  <label
    className={`flex items-center justify-between rounded-xl px-4 py-3.5 cursor-pointer border-2 transition-all duration-150 ${
      selected
        ? 'border-green-500 bg-green-50 shadow-sm'
        : 'border-gray-200 bg-white hover:border-green-300 hover:bg-gray-50'
    }`}
  >
    <div className="flex items-center gap-3">
      <div
        onClick={onSelect}
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          selected ? 'border-green-500 bg-green-500' : 'border-gray-300'
        }`}
      >
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <input type="radio" name="plan" className="sr-only" checked={selected} onChange={onSelect} />
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


// ── Login Form ────────────────────────────────────────
const LoginForm = ({ onSwitch, onClose, onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const [forgotMode, setForgotMode]       = useState(false);
  const [forgotEmail, setForgotEmail]     = useState('');
  const [forgotMsg, setForgotMsg]         = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!identifier.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/user/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Login failed. Please try again.');
        return;
      }
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userInfo',  JSON.stringify(data.user));
      onLoginSuccess(data.token, data.user, data.needsRenewal);
    } catch {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit(); };

  const handleForgot = async () => {
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/user/forgot-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      setForgotMsg(data.message);
    } catch {
      setForgotMsg('Unable to connect. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  if (forgotMode) return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Forgot Password?</h2>
      <p className="text-gray-500 text-sm mb-5">Enter your email and we'll send a reset link.</p>

      {forgotMsg ? (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
          {forgotMsg}
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              placeholder="Enter your registered email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>
          <button
            onClick={handleForgot}
            disabled={forgotLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-full text-sm transition flex items-center justify-center gap-2"
          >
            {forgotLoading && <Spinner />}
            {forgotLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </>
      )}

      <button
        onClick={() => { setForgotMode(false); setForgotEmail(''); setForgotMsg(''); }}
        className="mt-4 text-sm text-gray-500 hover:text-green-600 block text-center w-full transition"
      >
        ← Back to Login
      </button>
    </div>
  );

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
        <p className="text-gray-500 mt-1 text-sm">Log in to your account to continue.</p>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
          <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Email / Phone Number</label>
        <input
          type="text"
          value={identifier}
          onChange={e => setIdentifier(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="you@example.com"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
        />
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="••••••"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPass(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPass ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <button
          onClick={() => setForgotMode(true)}
          className="text-sm text-gray-500 hover:text-green-600 transition"
        >
          Forgot Password?
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-full text-sm transition flex items-center justify-center gap-2 shadow-sm"
      >
        {loading && <Spinner />}
        {loading ? 'Logging in...' : 'Log In'}
      </button>

      <p className="text-center text-sm text-gray-600 mt-5">
        Don't have an account?{' '}
        <button onClick={onSwitch} className="text-green-600 font-semibold hover:underline">Sign Up</button>
      </p>
    </>
  );
};


// ── Signup Form ───────────────────────────────────────
// Flow: fill details → Continue → pick plan + accept T&C →
// Buy Plan & Submit → account created (isActive: false) →
// Razorpay order → payment verified → user activated → auto-login
const SignupForm = ({ onSwitch, onClose, onLoginSuccess }) => {
  const [step, setStep] = useState('form'); // 'form' | 'plan'

  const [fullName, setFullName] = useState('');
  const [country, setCountry]   = useState('');
  const [phone, setPhone]       = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');

  const [plans, setPlans]               = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [paying, setPaying]             = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms]       = useState(false);

  // Stored once account is created — prevents duplicate registration on retry
  const [pendingToken, setPendingToken] = useState(null);

  const validateForm = () => {
    if (!fullName.trim() || !country || !phone.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    return true;
  };

  const goToPlanStep = async () => {
    setError('');
    if (!validateForm()) return;
    setPlansLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/user/plans`);
      const data = await res.json();
      if (!res.ok || !data.plans?.length) {
        setError('No subscription plans are available right now. Please try again later.');
        return;
      }
      setPlans(data.plans);
      setStep('plan');
    } catch {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setPlansLoading(false);
    }
  };

  const handleBuyAndSubmit = async () => {
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
      let token = pendingToken;

      if (!token) {
        const res  = await fetch(`${API_URL}/api/user/register`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            fullName: fullName.trim(),
            country,
            phone:    phone.trim(),
            email:    email.trim(),
            password,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || 'Registration failed. Please try again.');
          setPaying(false);
          return;
        }
        token = data.token;
        setPendingToken(token);
      }

      const orderRes  = await fetch(`${API_URL}/api/user/subscribe/create-order`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body:    JSON.stringify({ planId: selectedPlanId }),
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
        description: `${orderData.planName} Subscription`,
        prefill:     { name: fullName, email, contact: phone },
        theme:       { color: '#16a34a' },
        handler: async (response) => {
          try {
            const verifyRes  = await fetch(`${API_URL}/api/user/subscribe/verify`, {
              method:  'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body:    JSON.stringify({
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
            localStorage.setItem('userToken', token);
            localStorage.setItem('userInfo',  JSON.stringify(verifyData.user));
            onLoginSuccess(token, verifyData.user);
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

  // ── Step 1: Account Details ──
  if (step === 'form') return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-500 mt-1 text-sm">Fill in your details to get started.</p>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
          <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          type="text" value={fullName} onChange={e => setFullName(e.target.value)}
          placeholder="Enter full name"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
        <div className="relative">
          <select
            value={country} onChange={e => setCountry(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white"
          >
            <option value="">Select Country</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition">
          <span className="bg-gray-50 border-r border-gray-300 px-3 py-3 text-sm text-gray-600 font-medium flex items-center">+91</span>
          <input
            type="tel" value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="Enter phone number"
            className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none bg-white"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Create Password</label>
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition pr-12"
          />
          <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPass ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        By clicking 'Continue', you agree to our{' '}
        <a href="#" className="text-green-600 hover:underline font-medium">Terms & Conditions</a>
        {' '}and{' '}
        <a href="#" className="text-green-600 hover:underline font-medium">Privacy Policy</a>.
      </p>

      <button
        onClick={goToPlanStep} disabled={plansLoading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-full text-sm transition flex items-center justify-center gap-2 shadow-sm"
      >
        {plansLoading && <Spinner />}
        {plansLoading ? 'Loading plans...' : 'Continue'}
      </button>

      <p className="text-center text-sm text-gray-600 mt-5">
        Already have an account?{' '}
        <button onClick={onSwitch} className="text-green-600 font-semibold hover:underline">Log In</button>
      </p>
    </>
  );

  // ── Step 2: Plan Selection + Payment ──
  return (
    <>
      {showTerms && (
        <TermsDrawer
          onClose={() => setShowTerms(false)}
          onAccept={() => { setTermsAccepted(true); setShowTerms(false); }}
        />
      )}

      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <span className="text-xs text-green-700 font-medium">Account details saved</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Choose a Plan</h2>
        <p className="text-gray-500 mt-1 text-sm">
          Your account activates only after a successful payment. No charges until you confirm.
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
          <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Available Plans</p>

      <div className="space-y-2.5 mb-4">
        {plans.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            selected={selectedPlanId === plan.id}
            onSelect={() => setSelectedPlanId(plan.id)}
          />
        ))}
      </div>

      {/* T&C Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
        <p className="text-xs text-amber-800 leading-relaxed">
          <span className="font-semibold">Before purchasing, please read our </span>
          <button
            onClick={() => setShowTerms(true)}
            className="font-semibold underline underline-offset-2 text-amber-900 hover:text-green-700 transition"
          >
            Terms & Conditions
          </button>
          . Once payment is made, the plan activates immediately and is non-refundable.
          Renewal is only available after your plan expires.
          Track your subscription from your <span className="font-semibold">Dashboard</span>.
        </p>
      </div>

      {/* Accept Checkbox */}
      <label className="flex items-start gap-2.5 mb-4 cursor-pointer group">
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
            onClick={e => { e.preventDefault(); setShowTerms(true); }}
            className="text-green-700 font-semibold underline underline-offset-2"
          >
            Terms & Conditions
          </button>
          . I understand that once payment is completed, the plan cannot be cancelled or refunded.
        </span>
      </label>

      {/* Order Summary */}
      {selectedPlan && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">You are purchasing</p>
            <p className="text-sm font-semibold text-gray-800">{selectedPlan.name} · {selectedPlan.durationDays} days</p>
          </div>
          <p className="text-lg font-bold text-green-600">₹{selectedPlan.price}</p>
        </div>
      )}

      <button
        onClick={handleBuyAndSubmit}
        disabled={paying || !selectedPlanId || !termsAccepted}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-full text-sm transition flex items-center justify-center gap-2 shadow-sm"
      >
        {paying ? (
          <>
            <Spinner />
            Processing Payment...
          </>
        ) : (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            Pay & Create Account
          </>
        )}
      </button>

      <p className="text-center text-[11px] text-gray-400 mt-3 mb-1">
        Secured by Razorpay · 256-bit SSL encryption
      </p>

      <button
        onClick={() => setStep('form')}
        className="text-sm text-gray-500 hover:text-green-600 block text-center w-full transition"
      >
        ← Back to details
      </button>
    </>
  );
};


// ── Main AuthModal ────────────────────────────────────
const AuthModal = ({ mode = 'login', onClose, onLoginSuccess }) => {
  const [currentMode, setCurrentMode] = useState(mode);

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition z-10"
        >
          <X size={16} />
        </button>

        <div className="p-8">
          {currentMode === 'login' ? (
            <LoginForm
              onSwitch={() => setCurrentMode('signup')}
              onClose={onClose}
              onLoginSuccess={onLoginSuccess}
            />
          ) : (
            <SignupForm
              onSwitch={() => setCurrentMode('login')}
              onClose={onClose}
              onLoginSuccess={onLoginSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;