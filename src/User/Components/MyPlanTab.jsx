import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem('userToken');

export default function MyPlanTab() {
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/user/my-subscription`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then(r => r.json())
      .then(data => setSub(data.subscription))
      .catch(() => setSub(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: 60, background: '#f0f0f0', borderRadius: 12,
          animation: 'pulse 1.4s ease-in-out infinite' }} />
      ))}
    </div>
  );

  if (!sub || sub.status === 'pending' || sub.status === 'failed') return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111', margin: '0 0 8px' }}>
        Koi active plan nahi hai
      </h3>
      <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 20px' }}>
        Ek plan kharido aur premium features unlock karo.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{ padding: '11px 24px', background: '#16a34a', color: '#fff',
          border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit' }}>
        Plan Kharido
      </button>
    </div>
  );

  const isExpired = sub.status === 'expired' ||
    (sub.status === 'active' && new Date(sub.endDate) < new Date());

  const statusColor = isExpired ? '#ef4444' : '#16a34a';
  const statusBg    = isExpired ? '#fef2f2' : '#f0fdf4';
  const statusLabel = isExpired ? 'Expired' : 'Active';

  const endDate = new Date(sub.endDate);
  const startDate = new Date(sub.startDate);

  const fmt = (d) => d.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  return (
    <div style={{ animation: 'fadeUp 0.3s ease' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: '0 0 20px' }}>
        My Plan
      </h1>

      {/* Main Plan Card */}
      <div style={{
        background: 'linear-gradient(135deg, #166534, #15803d)',
        borderRadius: 20, padding: '24px 22px', color: '#fff',
        marginBottom: 16, position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative circle */}
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160,
          borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -50, right: 60, width: 120, height: 120,
          borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4 }}>Current Plan</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{sub.planName}</div>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>
              ₹{sub.price} / {sub.durationDays} days
            </div>
          </div>
          <span style={{
            background: statusBg, color: statusColor,
            fontSize: 11, fontWeight: 800, padding: '4px 12px',
            borderRadius: 20
          }}>
            {statusLabel}
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            fontSize: 12, opacity: 0.85, marginBottom: 6 }}>
            <span>Plan usage</span>
            <span>{sub.progressPct}% used</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 99, height: 8 }}>
            <div style={{
              width: `${sub.progressPct}%`, height: '100%',
              background: isExpired ? '#ef4444' : '#86efac',
              borderRadius: 99, transition: 'width 0.6s ease'
            }} />
          </div>
        </div>

        {/* Days left */}
        {!isExpired && (
          <div style={{ fontSize: 13, opacity: 0.9 }}>
            ⏳ <strong>{sub.daysLeft} din</strong> baaki hain
          </div>
        )}
        {isExpired && (
          <div style={{ fontSize: 13, color: '#fca5a5' }}>
            ❌ Plan expire ho chuka hai
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Start Date',    value: fmt(startDate),         icon: '📅' },
          { label: 'Expiry Date',   value: fmt(endDate),           icon: '⏰' },
          { label: 'Duration',      value: `${sub.durationDays} days`, icon: '📆' },
          { label: 'Days Remaining',value: isExpired ? 'Expired' : `${sub.daysLeft} days`, icon: '⌛' },
        ].map((item, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 14,
            border: '1px solid #f0f0f0', padding: '14px 16px'
          }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Payment Info */}
      {sub.paymentId && (
        <div style={{ background: '#fff', borderRadius: 14,
          border: '1px solid #f0f0f0', padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Payment ID</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151',
            wordBreak: 'break-all' }}>{sub.paymentId}</div>
        </div>
      )}

      {/* Renew Button */}
      {(isExpired || sub.daysLeft <= 7) && (
        <button
          onClick={() => navigate('/')}
          style={{
            width: '100%', padding: '14px 0',
            background: isExpired ? '#ef4444' : '#16a34a',
            color: '#fff', border: 'none', borderRadius: 14,
            fontSize: 15, fontWeight: 800, cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: isExpired
              ? '0 4px 18px rgba(239,68,68,0.3)'
              : '0 4px 18px rgba(22,163,74,0.3)'
          }}>
          {isExpired ? '🔄 Plan Renew Karo' : '⚡ Plan Upgrade Karo'}
        </button>
      )}
    </div>
  );
}