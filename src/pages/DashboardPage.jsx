import React, { useState, useEffect } from 'react';
import api from '../services/api';

function DashboardPage() {
  const [clients, setClients] = useState([]);
  const [error, setError] = useState('');

  // --- New state for the form ---
  const [newClientName, setNewClientName] = useState('');
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
      console.error('Failed to fetch clients:', err);
      setError(err.response?.data?.error || 'Failed to fetch clients');
    }
  };

  // Run fetchClients when the component loads
  
    fetchClients();
  }, []);

  // --- New function to handle creating a client ---
  const handleCreateClient = async (event) => {
    event.preventDefault(); // Stop the form from reloading the page
    setError(''); // Clear old errors

    try {
      const token = localStorage.getItem('token');
      
      // 1. Make the POST request
      const response = await api.post(
        '/clients/createClients', // Your backend route
        { name: newClientName },   // The data to send
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      // 2. Add the new client to the list in state
      // This makes the UI update instantly!
      setClients(prevClients => [...prevClients, response.data]);
      
      // 3. Clear the input box
      setNewClientName('');

    } catch (err) {
      console.error('Failed to create client:', err);
      setError(err.response?.data?.error || 'Failed to create client');
    }
  };
// --- NEW FUNCTION TO HANDLE DELETING A CLIENT ---
  const handleDeleteClient = async (clientId) => {
    setError(''); // Clear old errors

    try {
      const token = localStorage.getItem('token');
      
      // 1. Make the DELETE request
      await api.delete(
        `/clients/deleteClient/${clientId}`, // Your backend route
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      // 2. Update the UI instantly by filtering out the deleted client
      setClients(prevClients => 
        prevClients.filter(client => client.id !== clientId)
      );

    } catch (err) {
      console.error('Failed to delete client:', err);
      setError(err.response?.data?.error || 'Failed to delete client');
    }
  };

  return (
    <div>
      <h1>Your Dashboard</h1>

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
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <ul>
        {clients.length > 0 ? (
          clients.map(client => (
            // --- UPDATED LIST ITEM ---
            <li key={client.id}>
              {client.name}
              {/* Add a delete button next to each client */}
              <button 
                onClick={() => handleDeleteClient(client.id)} 
                style={{ marginLeft: '10px' }}
              >
                Delete
              </button>
            </li>
          ))
        ) : (
          <p>You have no clients yet.</p>
        )}
      </ul>
    </div>
  );
}

export default DashboardPage;