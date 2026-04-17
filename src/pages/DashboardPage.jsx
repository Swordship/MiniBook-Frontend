import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const badgeClass = (s) =>
  s === 'PAID' ? 'badge badge-paid' : s === 'SENT' ? 'badge badge-sent' : 'badge badge-draft';

const initials = (name) =>
  name ? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : '?';

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export default function DashboardPage() {
  const navigate = useNavigate();

  const [clients,  setClients]  = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [error,    setError]    = useState('');

  // client form
  const [newClientName,     setNewClientName]     = useState('');
  const [editingClientId,   setEditingClientId]   = useState(null);
  const [editingClientName, setEditingClientName] = useState('');

  // invoice form
  const [newAmt,    setNewAmt]    = useState('');
  const [newClient, setNewClient] = useState('');
  const [newStatus, setNewStatus] = useState('DRAFT');

  // invoice edit
  const [editInvId,     setEditInvId]     = useState(null);
  const [editInvAmt,    setEditInvAmt]    = useState('');
  const [editInvStatus, setEditInvStatus] = useState('');

  useEffect(() => {
    api.get('/clients/getClients').then(r => setClients(r.data)).catch(() => {});
    api.get('/invoices/getInvoices').then(r => setInvoices(r.data)).catch(() => {});
  }, []);

  const clientName = (id) => clients.find(c => c.id === id)?.name ?? '—';

  // ── stats ──────────────────────────────────────────────────
  const totalRevenue = invoices.reduce((s, i) => s + i.amount, 0);
  const paidRevenue  = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0);

  // ── logout ─────────────────────────────────────────────────
  const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };

  // ── clients ────────────────────────────────────────────────
  const createClient = async (e) => {
    e.preventDefault(); setError('');
    try {
      const r = await api.post('/clients/createClients', { name: newClientName });
      setClients(p => [...p, r.data]); setNewClientName('');
    } catch (err) { setError(err.response?.data?.errors?.[0]?.message || 'Failed to create client'); }
  };

  const updateClient = async (id) => {
    try {
      await api.put(`/clients/updateClient/${id}`, { name: editingClientName });
      setClients(p => p.map(c => c.id === id ? { ...c, name: editingClientName } : c));
      setEditingClientId(null);
    } catch { setError('Failed to update client'); }
  };

  const deleteClient = async (id) => {
    try {
      await api.delete(`/clients/deleteClient/${id}`);
      setClients(p => p.filter(c => c.id !== id));
      setInvoices(p => p.filter(i => i.clientId !== id));
    } catch { setError('Failed to delete client'); }
  };

  // ── invoices ───────────────────────────────────────────────
  const createInvoice = async (e) => {
    e.preventDefault(); setError('');
    if (!newClient) { setError('Please select a client.'); return; }
    try {
      const r = await api.post('/invoices/createInvoice', { amount: Number(newAmt), clientId: newClient, status: newStatus });
      setInvoices(p => [...p, r.data]); setNewAmt(''); setNewClient(''); setNewStatus('DRAFT');
    } catch (err) { setError(err.response?.data?.errors?.[0]?.message || 'Failed to create invoice'); }
  };

  const updateInvoice = async (id) => {
    try {
      await api.put(`/invoices/updateInvoice/${id}`, { amount: Number(editInvAmt), status: editInvStatus });
      setInvoices(p => p.map(i => i.id === id ? { ...i, amount: Number(editInvAmt), status: editInvStatus } : i));
      setEditInvId(null);
    } catch { setError('Failed to update invoice'); }
  };

  const deleteInvoice = async (id) => {
    try {
      await api.delete(`/invoices/deleteInvoice/${id}`);
      setInvoices(p => p.filter(i => i.id !== id));
    } catch { setError('Failed to delete invoice'); }
  };

  return (
    <div className="app">
      {/* ── TOP BAR ── */}
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand-icon">📒</div>
          MiniBook
        </div>
        <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={handleLogout}>
          Sign out
        </button>
      </header>

      <main className="page">
        {/* ── PAGE HEADER ── */}
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Manage your clients and invoices in one place.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* ── STAT CARDS ── */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">Clients</div>
              <div className="stat-value">{clients.length}</div>
              <div className="stat-sub">Total clients</div>
            </div>
            <div className="stat-icon stat-icon-purple">👥</div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">Invoices</div>
              <div className="stat-value">{invoices.length}</div>
              <div className="stat-sub">{invoices.filter(i => i.status === 'PAID').length} paid</div>
            </div>
            <div className="stat-icon stat-icon-blue">📄</div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value">${totalRevenue.toLocaleString()}</div>
              <div className="stat-sub">All invoices</div>
            </div>
            <div className="stat-icon stat-icon-amber">💰</div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">Collected</div>
              <div className="stat-value">${paidRevenue.toLocaleString()}</div>
              <div className="stat-sub">From paid invoices</div>
            </div>
            <div className="stat-icon stat-icon-green">✅</div>
          </div>
        </div>

        {/* ── CONTENT GRID ── */}
        <div className="content-grid">

          {/* ── LEFT: CLIENTS ── */}
          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">Clients</span>
              <span className="panel-badge">{clients.length}</span>
            </div>

            {/* Add client */}
            <form className="add-form" onSubmit={createClient}>
              <input
                className="field-input"
                type="text"
                placeholder="Client name..."
                value={newClientName}
                onChange={e => setNewClientName(e.target.value)}
                required
              />
              <button className="btn btn-primary" type="submit" style={{ padding: '9px 14px' }}>+ Add</button>
            </form>

            {/* List */}
            {clients.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">👤</div>
                <div className="empty-title">No clients yet</div>
                <div className="empty-desc">Add your first client above</div>
              </div>
            ) : (
              <ul className="client-list">
                {clients.map(client => (
                  <li className="client-item" key={client.id}>
                    {editingClientId === client.id ? (
                      <>
                        <div className="client-avatar">{initials(editingClientName || client.name)}</div>
                        <div className="client-edit-row">
                          <input
                            className="field-input"
                            value={editingClientName}
                            onChange={e => setEditingClientName(e.target.value)}
                            autoFocus
                          />
                          <button className="btn btn-success" style={{ padding: '7px 11px', fontSize: 12 }} onClick={() => updateClient(client.id)}>Save</button>
                          <button className="btn btn-ghost"   style={{ padding: '7px 11px', fontSize: 12 }} onClick={() => setEditingClientId(null)}>✕</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="client-avatar">{initials(client.name)}</div>
                        <span className="client-name">{client.name}</span>
                        <div className="client-actions">
                          <button
                            className="btn btn-ghost btn-icon"
                            title="Edit"
                            onClick={() => { setEditingClientId(client.id); setEditingClientName(client.name); }}
                          >✏️</button>
                          <button
                            className="btn btn-danger btn-icon"
                            title="Delete"
                            onClick={() => deleteClient(client.id)}
                          >🗑</button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ── RIGHT: INVOICES ── */}
          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">Invoices</span>
              <span className="panel-badge">{invoices.length}</span>
            </div>

            {/* Create invoice form */}
            <form className="inv-toolbar" onSubmit={createInvoice}>
              <div className="inv-row">
                <label>Client</label>
                <select className="field-select" value={newClient} onChange={e => setNewClient(e.target.value)} required>
                  <option value="" disabled>Select a client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <label style={{ marginLeft: 4 }}>Status</label>
                <select className="field-select" value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ maxWidth: 110 }}>
                  <option value="DRAFT">Draft</option>
                  <option value="SENT">Sent</option>
                  <option value="PAID">Paid</option>
                </select>
              </div>
              <div className="inv-row">
                <label>Amount</label>
                <input
                  className="field-input"
                  type="number"
                  placeholder="0"
                  min="1"
                  value={newAmt}
                  onChange={e => setNewAmt(e.target.value)}
                  required
                  style={{ maxWidth: 140 }}
                />
                <button className="btn btn-primary" type="submit" style={{ marginLeft: 'auto' }}>+ Create Invoice</button>
              </div>
            </form>

            {/* Table */}
            {invoices.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">📄</div>
                <div className="empty-title">No invoices yet</div>
                <div className="empty-desc">Create your first invoice above</div>
              </div>
            ) : (
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.id}>
                      {editInvId === inv.id ? (
                        <td colSpan={5}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ flex: 1, fontSize: 13, color: 'var(--text-2)' }}>{clientName(inv.clientId)}</span>
                            <div className="inv-edit-inputs">
                              <input
                                className="field-input"
                                type="number"
                                value={editInvAmt}
                                onChange={e => setEditInvAmt(e.target.value)}
                                min="1"
                                autoFocus
                              />
                              <select className="field-select" value={editInvStatus} onChange={e => setEditInvStatus(e.target.value)}>
                                <option value="DRAFT">Draft</option>
                                <option value="SENT">Sent</option>
                                <option value="PAID">Paid</option>
                              </select>
                            </div>
                            <button className="btn btn-success" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => updateInvoice(inv.id)}>Save</button>
                            <button className="btn btn-ghost"   style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setEditInvId(null)}>Cancel</button>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td><span className="inv-client-name">{clientName(inv.clientId)}</span></td>
                          <td><span className="inv-amount">${inv.amount.toLocaleString()}</span></td>
                          <td><span className={badgeClass(inv.status)}>{inv.status}</span></td>
                          <td><span className="inv-date">{formatDate(inv.createdAt)}</span></td>
                          <td>
                            <div className="inv-actions">
                              <button
                                className="btn btn-ghost btn-icon"
                                title="Edit"
                                onClick={() => { setEditInvId(inv.id); setEditInvAmt(inv.amount); setEditInvStatus(inv.status); }}
                              >✏️</button>
                              <button
                                className="btn btn-danger btn-icon"
                                title="Delete"
                                onClick={() => deleteInvoice(inv.id)}
                              >🗑</button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
