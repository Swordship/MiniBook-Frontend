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

  return (
    <div>
      <h1>Your Dashboard</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* --- CLIENTS SECTION --- */}
      <div>
        <h2>Create New Client</h2>
        <form onSubmit={handleCreateClient}>
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
          {clients.length > 0 ? (
            clients.map(client => (
              <li key={client.id}>
                {editingClientId === client.id ? (
                  // --- Edit Mode for Clients ---
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
                  // --- Read Mode for Clients ---
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

      <hr /> {/* Visual separator */}

      {/* --- INVOICES SECTION --- */}
      <div>
        <h2>Your Invoices</h2>
        {/* We will add the "Create Invoice" form here next */}
        <ul>
          {invoices.length > 0 ? (
            invoices.map(invoice => (
              <li key={invoice.id}>
                Client ID: {invoice.clientId} - Amount: ${invoice.amount} - Status: {invoice.status}
                {/* We will add Edit/Delete buttons here */}
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