import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

// Use whichever key your admin login flow stores the JWT token under.
// Assuming it's stored as 'adminToken'.
const getAdminToken = () => localStorage.getItem('adminToken');

const emptyForm = { name: '', price: '', durationDays: '' };

// ── Plan Form (Add / Edit) ─────────────────────────────
const PlanFormModal = ({ initialData, onClose, onSaved }) => {
  const isEdit = !!initialData;
  const [form, setForm]     = useState(initialData ? {
    name: initialData.name,
    price: initialData.price,
    durationDays: initialData.durationDays,
  } : emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    setError('');
    if (!form.name.trim() || !form.price || !form.durationDays) {
      setError('Please fill in all fields.');
      return;
    }
    if (Number(form.price) <= 0 || Number(form.durationDays) <= 0) {
      setError('Price and duration must be positive numbers.');
      return;
    }

    setSaving(true);
    try {
      const url    = isEdit ? `${API_URL}/api/adminPlane/plans/${initialData.id}` : `${API_URL}/api/adminPlane/plans`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({
          name:         form.name.trim(),
          price:        Number(form.price),
          durationDays: Number(form.durationDays),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Could not save. Please try again.');
        return;
      }
      onSaved();
    } catch {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition"
        >
          <X size={16} />
        </button>

        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            {isEdit ? 'Edit Plan' : 'Add New Plan'}
          </h2>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
            <input
              type="text"
              value={form.name}
              onChange={handleChange('name')}
              placeholder="e.g. Gold Plan"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
            <input
              type="number"
              value={form.price}
              onChange={handleChange('price')}
              placeholder="e.g. 499"
              min="0"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
            <input
              type="number"
              value={form.durationDays}
              onChange={handleChange('durationDays')}
              placeholder="e.g. 30"
              min="1"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 rounded-full text-sm transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {saving && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            )}
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Plan'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Confirm Delete Modal ────────────────────────────────
const ConfirmDeleteModal = ({ plan, onClose, onConfirm, deleting }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    onClick={e => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Plan?</h2>
      <p className="text-sm text-gray-500 mb-6">
        Are you sure you want to permanently delete{' '}
        "<span className="font-medium text-gray-700">{plan.name}</span>"?
        This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-full text-sm hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={deleting}
          className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-2.5 rounded-full text-sm transition"
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

// ── Main Admin Plans Section ───────────────────────────
const AdminPlans = () => {
  const [plans, setPlans]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const [showForm, setShowForm]           = useState(false);
  const [editPlan, setEditPlan]           = useState(null); // plan object being edited, else null
  const [deletePlan_, setDeletePlan_]     = useState(null); // plan object pending delete
  const [deleting, setDeleting]           = useState(false);
  const [togglingId, setTogglingId]       = useState(null);

  const fetchPlans = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/adminPlane/plans`, {
        headers: { 'Authorization': `Bearer ${getAdminToken()}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Could not load plans.');
        return;
      }
      setPlans(data.plans || []);
    } catch {
      setError('Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleToggleActive = async (plan) => {
    setTogglingId(plan.id);
    try {
      const res = await fetch(`${API_URL}/api/adminPlane/plans/${plan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setPlans(prev => prev.map(p => p.id === plan.id ? data.plan : p));
      }
    } catch {
      // Silently ignore — user can retry
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletePlan_) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/adminPlane/plans/${deletePlan_.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAdminToken()}` },
      });
      if (res.ok) {
        setPlans(prev => prev.filter(p => p.id !== deletePlan_.id));
        setDeletePlan_(null);
      }
    } catch {
      // Silently ignore — user can retry
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-sm text-gray-500 mt-1">These plans are shown to users during signup.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2.5 rounded-full text-sm transition-colors duration-200"
        >
          <Plus size={16} />
          Add Plan
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500 text-center py-10">Loading plans...</p>
      ) : plans.length === 0 ? (
        <div className="text-center py-14 border border-dashed border-gray-300 rounded-xl">
          <p className="text-sm text-gray-500">No plans found.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-3 text-sm text-green-600 font-semibold hover:underline"
          >
            Add your first plan
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map(plan => (
            <div
              key={plan.id}
              className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-4 bg-white"
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleToggleActive(plan)}
                  disabled={togglingId === plan.id}
                  title={plan.isActive ? 'Active — click to deactivate' : 'Inactive — click to activate'}
                  className="text-green-500 disabled:opacity-40"
                >
                  {plan.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} className="text-gray-300" />}
                </button>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{plan.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    ₹{plan.price} · {plan.durationDays} days ·{' '}
                    <span className={plan.isActive ? 'text-green-600' : 'text-gray-400'}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditPlan(plan)}
                  className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setDeletePlan_(plan)}
                  className="w-9 h-9 rounded-full hover:bg-red-50 flex items-center justify-center text-gray-500 hover:text-red-600 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <PlanFormModal
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchPlans(); }}
        />
      )}

      {editPlan && (
        <PlanFormModal
          initialData={editPlan}
          onClose={() => setEditPlan(null)}
          onSaved={() => { setEditPlan(null); fetchPlans(); }}
        />
      )}

      {deletePlan_ && (
        <ConfirmDeleteModal
          plan={deletePlan_}
          deleting={deleting}
          onClose={() => setDeletePlan_(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default AdminPlans;