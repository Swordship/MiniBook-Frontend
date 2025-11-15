import React, { useState, useEffect } from 'react';
import api from '../services/api';

function DashboardPage() {
  const [clients, setClients] = useState([]);
  const [error, setError] = useState('');
  const [newClientName, setNewClientName] = useState('');

  // --- NEW STATE FOR EDITING ---
  const [editingClientId, setEditingClientId] = useState(null); // Tracks which client is being edited
  const [editingClientName, setEditingClientName] = useState(''); // Tracks the text in the edit input

  // ... fetchClients, handleCreateClient, handleDeleteClient ...
  // (No changes to the other functions)
  const [invoices, setInvoices] = useState([]);
  // (You can copy the functions from your file here)
  // --- NEW: Invoice Form State ---
  const [newInvoiceAmount, setNewInvoiceAmount] = useState(0);
  const [newInvoiceClientId, setNewInvoiceClientId] = useState('');
  const [newInvoiceStatus, setNewInvoiceStatus] = useState('DRAFT'); // Default to DRAFT
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found. Please log in.');
          return;
        }
        const response = await api.get('/clients/getClients', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setClients(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch clients');
      }
    };
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return; // Error is already set by fetchClients

        const response = await api.get('/invoices/getInvoices', { // 👈 Use your invoice route
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setInvoices(response.data);
      } catch (err) {
        console.error("Failed to fetch invoices:", err);
        setError(err.response?.data?.error || 'Failed to fetch invoices');
      }
    };
    fetchClients(),
    fetchInvoices();
  }, []);

  const handleCreateClient = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        '/clients/createClients',
        { name: newClientName },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setClients(prevClients => [...prevClients, response.data]);
      setNewClientName('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create client');
    }
  };

  const handleDeleteClient = async (clientId) => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      await api.delete(
        `/clients/deleteClient/${clientId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setClients(prevClients => 
        prevClients.filter(client => client.id !== clientId)
      );
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete client');
    }
  };

  // --- NEW FUNCTIONS FOR EDITING ---

  // Called when the "Edit" button is clicked
  const handleEditClick = (client) => {
    setEditingClientId(client.id);
    setEditingClientName(client.name); // Pre-fill the input with the client's current name
  };

  // Called when the "Save" button is clicked
  const handleUpdateClient = async (clientId) => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      
      // 1. Make the PUT request
      await api.put(
        `/clients/updateClient/${clientId}`,
        { name: editingClientName }, // Send the new name
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      // 2. Update the UI instantly
      setClients(prevClients =>
        prevClients.map(client =>
          client.id === clientId 
            ? { ...client, name: editingClientName } // Found it? Return a *new* object with the updated name
            : client // Not the one? Return it unchanged
        )
      );

      // 3. Exit editing mode
      setEditingClientId(null);

    } catch (err) {
      console.error('Failed to update client:', err);
      setError(err.response?.data?.error || 'Failed to update client');
    }
  };
  // --- NEW: Handle Create Invoice Function ---
  const handleCreateInvoice = async (event) => {
    event.preventDefault();
    setError('');

    if (!newInvoiceClientId) {
      setError('Please select a client.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await api.post(
        '/invoices/createInvoice', // Your backend route for creating invoices
        { 
          amount: Number(newInvoiceAmount), // Ensure amount is a number
          clientId: newInvoiceClientId,
          status: newInvoiceStatus
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      // Add the new invoice to the list
      setInvoices(prevInvoices => [...prevInvoices, response.data]);

      // Reset the form
      setNewInvoiceAmount(0);
      setNewInvoiceClientId('');
      setNewInvoiceStatus('DRAFT');

    } catch (err) {
      console.error('Failed to create invoice:', err);
      // This will display the Zod error message from your backend!
      const errorMsg = err.response?.data?.errors?.[0]?.message || 'Failed to create invoice';
      setError(errorMsg);
    }
  };

  return (
    <div>
      <h1>Your Dashboard</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {/* --- CLIENTS SECTION --- */}
      <div>
        <h2>Create New Client</h2>
        <form onSubmit={handleCreateClient}>
          {/* ... client create form ... */}
          <input
            type="text"
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
            placeholder="New client name"
            required
          />
          <button type="submit">Add Client</button>
        </form>

        <h2>Your Clients</h2>
        <ul>
          {/* ... client list map ... */}
          {clients.length > 0 ? (
            clients.map(client => (
              <li key={client.id}>
                {editingClientId === client.id ? (
                  <>
                    <input 
                      type="text"
                      value={editingClientName}
                      onChange={(e) => setEditingClientName(e.target.value)}
                    />
                    <button onClick={() => handleUpdateClient(client.id)}>Save</button>
                    <button onClick={() => setEditingClientId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    {client.name}
                    <button 
                      onClick={() => handleEditClick(client)} 
                      style={{ marginLeft: '10px' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteClient(client.id)} 
                      style={{ marginLeft: '10px' }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </li>
            ))
          ) : (
            <p>You have no clients yet.</p>
          )}
        </ul>
      </div>

      <hr />

      {/* --- INVOICES SECTION --- */}
      <div>
        <h2>Create New Invoice</h2>
        {/* --- NEW: Invoice Create Form --- */}
        <form onSubmit={handleCreateInvoice}>
          <div>
            <label>Client: </label>
            <select 
              value={newInvoiceClientId} 
              onChange={(e) => setNewInvoiceClientId(e.target.value)}
              required
            >
              <option value="" disabled>Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Amount: $</label>
            <input 
              type="number"
              value={newInvoiceAmount}
              onChange={(e) => setNewInvoiceAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Status: </label>
            <select 
              value={newInvoiceStatus} 
              onChange={(e) => setNewInvoiceStatus(e.target.value)}
            >
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
          <button type="submit">Create Invoice</button>
        </form>

        <h2>Your Invoices</h2>
        <ul>
          {invoices.length > 0 ? (
            invoices.map(invoice => (
              <li key={invoice.id}>
                Client ID: {invoice.clientId} | Amount: ${invoice.amount} | Status: {invoice.status}
              </li>
            ))
          ) : (
            <p>You have no invoices yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

export default DashboardPage;